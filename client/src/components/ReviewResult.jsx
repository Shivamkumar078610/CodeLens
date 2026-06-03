import { useState } from 'react';
import { Bug, Lightbulb, Code2, Sparkles, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import ScoreRing from './ScoreRing';
import CodeBlock from './CodeBlock';

const Accordion = ({ icon: Icon, title, iconBg, iconColor, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
            <Icon className="w-4 h-4" style={{ color: iconColor }} />
          </div>
          <span className="font-semibold text-slate-200 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

export default function ReviewResult({ review }) {
  const { bugs = [], suggestions = [], optimizedCode = '', score = 0, explanation = '', language = 'javascript', processingTime = 0 } = review;

  return (
    <div className="space-y-4">
      {/* Score + Explanation */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <ScoreRing score={score} size={130} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: '#8b5cf6' }} />
              <span className="section-label">AI Summary</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">{explanation}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { label: `${bugs.length} Bugs`, bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
                { label: `${suggestions.length} Suggestions`, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
                { label: `${(processingTime/1000).toFixed(1)}s`, icon: Clock, bg: 'rgba(255,255,255,0.05)', color: '#475569', border: 'rgba(255,255,255,0.08)' },
              ].map(({ label, bg, color, border }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: bg, color, border: `1px solid ${border}` }}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bugs */}
      <Accordion icon={Bug} title={`Bugs & Issues (${bugs.length})`} iconBg="rgba(248,113,113,0.1)" iconColor="#f87171" defaultOpen={bugs.length > 0}>
        {bugs.length === 0
          ? <p className="text-green-400 text-sm py-2 font-medium">✓ No bugs detected — great job!</p>
          : <ul className="space-y-3">{bugs.map((b, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 text-xs font-bold"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>{i+1}</div>
                <p className="text-slate-300 text-sm leading-relaxed">{b}</p>
              </li>))}
            </ul>}
      </Accordion>

      {/* Suggestions */}
      <Accordion icon={Lightbulb} title={`Suggestions (${suggestions.length})`} iconBg="rgba(245,158,11,0.1)" iconColor="#f59e0b">
        {suggestions.length === 0
          ? <p className="text-slate-500 text-sm py-2">No additional suggestions.</p>
          : <ul className="space-y-3">{suggestions.map((s, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 text-xs font-bold"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>{i+1}</div>
                <p className="text-slate-300 text-sm leading-relaxed">{s}</p>
              </li>))}
            </ul>}
      </Accordion>

      {/* Optimized Code */}
      {optimizedCode && (
        <Accordion icon={Code2} title="Optimized Code" iconBg="rgba(6,182,212,0.1)" iconColor="#06b6d4">
          <CodeBlock code={optimizedCode} language={language} label="optimized" />
        </Accordion>
      )}
    </div>
  );
}
