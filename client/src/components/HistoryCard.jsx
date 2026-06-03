import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, Clock, Bug, Lightbulb } from 'lucide-react';

const scoreColor = s => s >= 80 ? '#22c55e' : s >= 60 ? '#06b6d4' : s >= 40 ? '#f59e0b' : '#f87171';
const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function HistoryCard({ review, onDelete }) {
  const sc = scoreColor(review.score);
  return (
    <div className="card p-5 hover:border-white/15 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-md capitalize"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {review.language}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md"
              style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}>
              {review.score}/100
            </span>
          </div>
          <h3 className="font-semibold text-slate-200 truncate text-sm">{review.title}</h3>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-600"><Bug className="w-3.5 h-3.5" />{review.bugs?.length ?? 0} bugs</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600"><Lightbulb className="w-3.5 h-3.5" />{review.suggestions?.length ?? 0} tips</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600"><Clock className="w-3.5 h-3.5" />{fmt(review.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to={`/history/${review._id}`}
            className="p-2 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors hover:bg-cyan-500/10">
            <ExternalLink className="w-4 h-4" />
          </Link>
          {onDelete && (
            <button onClick={() => onDelete(review._id)}
              className="p-2 rounded-lg text-slate-600 hover:text-red-400 transition-colors hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
