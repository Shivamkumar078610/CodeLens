export default function ScoreRing({ score, size = 120 }) {
  const r    = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = ((100 - score) / 100) * circ;

  const meta =
    score >= 80 ? { stroke: '#22c55e', color: '#22c55e', label: 'Excellent' } :
    score >= 60 ? { stroke: '#06b6d4', color: '#06b6d4', label: 'Good' } :
    score >= 40 ? { stroke: '#f59e0b', color: '#f59e0b', label: 'Fair' } :
                  { stroke: '#f87171', color: '#f87171', label: 'Poor' };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={meta.stroke} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1)', filter: `drop-shadow(0 0 8px ${meta.stroke}80)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-3xl" style={{ color: meta.color }}>{score}</span>
          <span className="text-[10px] text-slate-600">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</span>
    </div>
  );
}
