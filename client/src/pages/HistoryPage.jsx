import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { History, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Spinner from '../components/Spinner';
import HistoryCard from '../components/HistoryCard';

const LANGS = ['all','javascript','typescript','python','java','go','rust','php','ruby','cpp','other'];

export default function HistoryPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ cur: 1, total: 0, pages: 1 });
  const [lang, setLang] = useState('all');

  const fetch = useCallback(async (p = 1, l = lang) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (l !== 'all') params.append('language', l);
      const { data } = await api.get(`/api/history?${params}`);
      setReviews(data.reviews);
      setPage({ cur: data.pagination.page, total: data.pagination.total, pages: data.pagination.pages });
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  }, [lang]);

  useEffect(() => { fetch(1, lang); }, [lang]);

  const onDelete = async (id) => {
    try { await api.delete(`/api/history/${id}`); setReviews(p => p.filter(r => r._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2"><History className="w-4 h-4 text-slate-600" /><span className="section-label">History</span></div>
        <h1 className="font-display text-2xl font-bold text-white">Past Reviews</h1>
        <p className="text-slate-600 text-sm mt-1">{page.total} total reviews</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3"><Filter className="w-3.5 h-3.5 text-slate-600" /><span className="section-label">Filter by Language</span></div>
        <div className="flex flex-wrap gap-2">
          {LANGS.map(l => (
            <button key={l} onClick={() => setLang(l)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border"
              style={lang === l
                ? { background: 'rgba(6,182,212,0.12)', color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', color: '#475569', borderColor: 'rgba(255,255,255,0.08)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading
        ? <div className="flex justify-center py-20"><Spinner size="lg" text="Loading..." /></div>
        : reviews.length === 0
          ? <div className="card p-12 text-center"><Search className="w-10 h-10 text-slate-700 mx-auto mb-4" /><h3 className="font-semibold text-slate-500">No reviews found</h3></div>
          : <div className="space-y-3">{reviews.map(r => <HistoryCard key={r._id} review={r} onDelete={onDelete} />)}</div>
      }

      {page.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => fetch(page.cur - 1)} disabled={page.cur <= 1} className="btn-ghost px-3 py-2 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-500">Page <span className="text-white font-medium">{page.cur}</span> of {page.pages}</span>
          <button onClick={() => fetch(page.cur + 1)} disabled={page.cur >= page.pages} className="btn-ghost px-3 py-2 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
