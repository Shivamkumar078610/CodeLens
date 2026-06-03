import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Code2, History, TrendingUp, Star, Plus, ChevronRight, BarChart3 } from 'lucide-react';
import Spinner from '../components/Spinner';
import HistoryCard from '../components/HistoryCard';

const Stat = ({ label, value, color, sub }) => (
  <div className="card p-5">
    <p className="section-label mb-1">{label}</p>
    <p className="font-display font-bold text-3xl mt-1" style={{ color }}>{value}</p>
    {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
  </div>
);

function greet() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/history/stats'), api.get('/api/history?limit=4')])
      .then(([s, h]) => { setStats(s.data.stats); setRecent(h.data.reviews); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const onDelete = async (id) => {
    try { await api.delete(`/api/history/${id}`); setRecent(p => p.filter(r => r._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" text="Loading..." /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Good {greet()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-600 text-sm mt-1">Here's your code review overview.</p>
        </div>
        <Link to="/review" className="btn-primary"><Plus className="w-4 h-4" />New Review</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Reviews" value={stats?.totalReviews ?? 0} color="#06b6d4" />
        <Stat label="Avg Score" value={`${stats?.averageScore ?? 0}`} color="#f59e0b" sub="out of 100" />
        <Stat label="Top Language" value={stats?.languageBreakdown?.[0]?._id ?? '—'} color="#8b5cf6" sub={`${stats?.languageBreakdown?.[0]?.count ?? 0} reviews`} />
        <Stat label="Languages" value={stats?.languageBreakdown?.length ?? 0} color="#22c55e" sub="analyzed" />
      </div>

      {/* Language chart */}
      {stats?.languageBreakdown?.length > 0 && (
        <div className="card p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-600" />
            <span className="section-label">Language Breakdown</span>
          </div>
          <div className="space-y-3">
            {stats.languageBreakdown.map(l => {
              const pct = stats.totalReviews > 0 ? Math.round((l.count / stats.totalReviews) * 100) : 0;
              return (
                <div key={l._id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 capitalize font-medium">{l._id}</span>
                    <span className="text-slate-600">{l.count} · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <span className="section-label">Recent Reviews</span>
          </div>
          <Link to="/history" className="flex items-center gap-1 text-xs font-medium" style={{ color: '#06b6d4' }}>
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.length === 0
          ? <div className="card p-12 text-center">
              <Code2 className="w-10 h-10 text-slate-700 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-400 mb-2">No reviews yet</h3>
              <p className="text-slate-600 text-sm mb-5">Submit your first code for AI review</p>
              <Link to="/review" className="btn-primary inline-flex"><Plus className="w-4 h-4" />Start a Review</Link>
            </div>
          : <div className="grid gap-3">{recent.map(r => <HistoryCard key={r._id} review={r} onDelete={onDelete} />)}</div>
        }
      </div>
    </div>
  );
}
