// ── Spinner ─────────────────────────────────────────────────────────────
export default function Spinner({ size = 'md', text = '' }) {
  const s = { sm: 'w-4 h-4 border-[2px]', md: 'w-7 h-7 border-[2.5px]', lg: 'w-11 h-11 border-[3px]' };
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${s[size]} rounded-full animate-spin`}
        style={{ borderColor: 'rgba(6,182,212,0.2)', borderTopColor: '#06b6d4' }} />
      {text && <p className="text-slate-500 text-sm">{text}</p>}
    </div>
  );
}
