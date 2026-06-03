const Review = require('../models/Review');
const User = require('../models/User');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const buildPrompt = (code, language) => `You are a senior software engineer. Review this ${language} code.
Return ONLY valid JSON with no markdown, no extra text whatsoever.

Code to review:
${code}

Return ONLY this exact JSON structure:
{
  "bugs": ["bug description 1", "bug description 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "optimized_code": "full improved code here",
  "score": 75,
  "explanation": "2-4 sentence overall summary"
}`;

// Use openrouter/free which auto-picks any available free model
// Fallback list in case openrouter/free fails
const MODELS = [
  'openrouter/auto',
  'deepseek/deepseek-r1:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-8b:free',
  'qwen/qwen3-14b:free',
];

const callOpenRouter = async (code, language) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('your_openrouter')) {
    throw new Error('OPENROUTER_API_KEY is missing in .env file');
  }

  for (const model of MODELS) {
    try {
      console.log(`\n🤖 Trying: ${model}`);

      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'CodeLens',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a senior software engineer. Always respond with ONLY valid JSON. No markdown fences. No explanation outside JSON.',
            },
            {
              role: 'user',
              content: buildPrompt(code, language),
            },
          ],
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      console.log(`📡 Status: ${res.status}`);

      if (!res.ok) {
        const err = await res.json();
        console.error(`❌ ${model} failed:`, err.error?.message || res.statusText);
        continue;
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        console.error(`❌ ${model} returned empty`);
        continue;
      }

      console.log(`✅ Success: ${model}`);
      console.log(`📄 Preview: ${text.substring(0, 200)}`);
      return text;

    } catch (err) {
      console.error(`❌ ${model} threw:`, err.message);
      continue;
    }
  }

  throw new Error('All models failed. Check your API key at https://openrouter.ai/keys');
};

const parseResponse = (raw) => {
  let cleaned = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  const parsed = JSON.parse(cleaned);
  return {
    bugs: Array.isArray(parsed.bugs) ? parsed.bugs.filter(Boolean) : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.filter(Boolean) : [],
    optimizedCode: typeof parsed.optimized_code === 'string' ? parsed.optimized_code : '',
    score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 50,
    explanation: typeof parsed.explanation === 'string' ? parsed.explanation : '',
  };
};

const submitReview = async (req, res, next) => {
  const t0 = Date.now();
  try {
    let { code, language, title } = req.body;

    if (req.file) {
      code = req.file.buffer.toString('utf-8');
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      const map = { js:'javascript', ts:'typescript', py:'python', java:'java', go:'go', rs:'rust', php:'php', rb:'ruby', cpp:'cpp' };
      language = map[ext] || language || 'other';
      title = title || req.file.originalname;
    }

    if (!code?.trim()) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    console.log(`\n📥 Review request received`);
    console.log(`📝 Language: ${language}, Length: ${code.length} chars`);

    const raw = await callOpenRouter(code, language || 'javascript');

    let data;
    try {
      data = parseResponse(raw);
      console.log(`🎯 Score: ${data.score} | Bugs: ${data.bugs.length} | Suggestions: ${data.suggestions.length}`);
    } catch (e) {
      console.error('❌ JSON parse failed:', e.message);
      console.error('❌ Raw response:', raw.substring(0, 500));
      return res.status(502).json({ success: false, message: 'AI returned invalid response. Please retry.' });
    }

    const review = await Review.create({
      userId: req.user.id,
      title: title || `Review — ${new Date().toLocaleDateString()}`,
      originalCode: code,
      language: language || 'javascript',
      bugs: data.bugs,
      suggestions: data.suggestions,
      optimizedCode: data.optimizedCode,
      score: data.score,
      explanation: data.explanation,
      processingTime: Date.now() - t0,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { reviewCount: 1 } });
    console.log(`✅ Done in ${Date.now() - t0}ms`);

    res.status(201).json({ success: true, review });

  } catch (e) {
    console.error('❌ Error:', e.message);
    if (e.message?.includes('API key') || e.message?.includes('models failed')) {
      return res.status(502).json({ success: false, message: e.message });
    }
    next(e);
  }
};

module.exports = { submitReview };