import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, language = 'javascript', label = '' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch { const t = document.createElement('textarea'); t.value = code; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#050b15' }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#050b15' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(248,113,113,0.4)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(245,158,11,0.4)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(34,197,94,0.4)' }} />
          </div>
          {label && <span className="text-xs text-slate-600 font-mono ml-2">{label}</span>}
        </div>
        <button onClick={copy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all"
          style={{ color: copied ? '#22c55e' : '#475569', border: '1px solid transparent' }}>
          {copied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
        </button>
      </div>
      <SyntaxHighlighter language={language} style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '13px', lineHeight: '1.6', maxHeight: '480px', overflowY: 'auto' }}
        showLineNumbers lineNumberStyle={{ color: '#2d3748', minWidth: '2.5em', fontSize: '11px' }}>
        {code || '// No code'}
      </SyntaxHighlighter>
    </div>
  );
}
