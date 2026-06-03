import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Code2, Upload, Trash2, ChevronDown, Sparkles, FileCode } from 'lucide-react';
import ReviewResult from '../components/ReviewResult';
import Spinner from '../components/Spinner';

const LANGS = ['javascript','typescript','python','java','go','rust','php','ruby','cpp','other'];
const SAMPLE = {
  javascript: `function fetchUser(id) {\n  fetch('/api/users/' + id)\n    .then(res => res.json())\n    .then(data => {\n      var user = data\n      document.getElementById('name').innerHTML = user.name\n    })\n}\nfetchUser(123)`,
  python: `def calculate_total(items):\n    total = 0\n    for i in range(len(items)):\n        total = total + items[i]['price'] * items[i]['qty']\n    return total\n\nprint("Total: $" + calculate_total([{'price':10,'qty':2}]))`,
};

export default function ReviewPage() {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('javascript');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);
  const { updateUser } = useAuth();

  const loadFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const map = { js:'javascript', ts:'typescript', py:'python', java:'java', go:'go', rs:'rust', php:'php', rb:'ruby', cpp:'cpp' };
    if (map[ext]) setLang(map[ext]);
    setTitle(file.name);
    new FileReader().onload = e => setCode(e.target.result);
    const r = new FileReader(); r.onload = e => setCode(e.target.result); r.readAsText(file);
    toast.success(`Loaded: ${file.name}`);
  };

  const submit = async () => {
    if (!code.trim()) return toast.error('Paste some code first');
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/api/review', { code, language: lang, title: title || `Review — ${new Date().toLocaleDateString()}` });
      setResult(data.review);
      updateUser(p => ({ ...p, reviewCount: (p?.reviewCount ?? 0) + 1 }));
      toast.success('Review complete!');
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) { toast.error(e.displayMessage || 'Review failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="w-4 h-4 text-slate-600" />
          <span className="section-label">AI Code Review</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Submit Code for Review</h1>
        <p className="text-slate-600 text-sm mt-1">Paste code or upload a file. Gemini Pro will detect bugs, suggest improvements, and score your code.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr,250px] gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Title <span className="text-slate-700">(optional)</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Auth module" className="input" />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-500">Code</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-700">{code.length.toLocaleString()} / 50,000</span>
                {code && <button onClick={() => { setCode(''); setResult(null); }} className="text-xs text-slate-700 hover:text-red-400 flex items-center gap-1"><Trash2 className="w-3 h-3" />Clear</button>}
              </div>
            </div>
            <div className="relative" onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); loadFile(e.dataTransfer.files[0]); }}>
              <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={`// Paste code here or drag & drop a file\n\n${SAMPLE[lang] || ''}`}
                className="code-area" spellCheck={false} />
              {drag && (
                <div className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none"
                  style={{ background: 'rgba(6,182,212,0.08)', border: '2px dashed #06b6d4' }}>
                  <p className="font-medium" style={{ color: '#06b6d4' }}>Drop to load</p>
                </div>
              )}
            </div>
          </div>
          {!code && (
            <button onClick={() => setCode(SAMPLE[lang] || SAMPLE.javascript)}
              className="text-xs flex items-center gap-1.5" style={{ color: '#06b6d4' }}>
              <FileCode className="w-3.5 h-3.5" />Load sample {lang} code
            </button>
          )}
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="card p-4">
            <label className="block text-xs font-semibold text-slate-500 mb-3">Language</label>
            <div className="relative">
              <select value={lang} onChange={e => setLang(e.target.value)} className="input appearance-none pr-8 cursor-pointer capitalize">
                {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
          </div>

          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 mb-3">Upload File</p>
            <input ref={fileRef} type="file" accept=".js,.ts,.py,.java,.go,.rs,.php,.rb,.cpp,.c" onChange={e => loadFile(e.target.files[0])} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="btn-ghost w-full justify-center text-xs">
              <Upload className="w-3.5 h-3.5" />Choose File
            </button>
            <p className="text-[10px] text-slate-700 mt-2 text-center">.js .ts .py .java .go · Max 1MB</p>
          </div>

          <button onClick={submit} disabled={loading || !code.trim()} className="btn-primary w-full justify-center py-3">
            {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Analyzing...</>
              : <><Sparkles className="w-4 h-4" />Review with AI</>}
          </button>

          <div className="card p-4 space-y-2">
            <p className="section-label">Tips</p>
            {['Select the right language', 'Reviews take 5–15 seconds', 'Max 50,000 characters'].map(t => (
              <p key={t} className="text-xs text-slate-600 flex gap-2"><span style={{ color: '#06b6d4' }}>›</span>{t}</p>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-10 card p-12 text-center">
          <Spinner size="lg" />
          <p className="text-slate-400 mt-4 font-medium">Gemini AI is reviewing your code...</p>
          <p className="text-slate-600 text-sm mt-1">Detecting bugs · Generating suggestions · Optimizing</p>
        </div>
      )}

      {result && !loading && (
        <div id="results" className="mt-10">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            <span className="section-label">Review Results</span>
          </div>
          <ReviewResult review={result} />
        </div>
      )}
    </div>
  );
}
