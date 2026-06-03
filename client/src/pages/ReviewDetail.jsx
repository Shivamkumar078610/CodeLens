import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Trash2, Calendar, Clock } from 'lucide-react';
import Spinner from '../components/Spinner';
import ReviewResult from '../components/ReviewResult';
import CodeBlock from '../components/CodeBlock';

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/api/history/${id}`)
      .then(({ data }) => setReview(data.review))
      .catch(() => { toast.error('Not found'); navigate('/history'); })
      .finally(() => setLoading(false));
  }, [id]);

  const onDelete = async () => {
    if (!confirm('Delete this review?')) return;
    setDeleting(true);
    try { await api.delete(`/api/history/${id}`); toast.success('Deleted'); navigate('/history'); }
    catch { toast.error('Delete failed'); setDeleting(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" text="Loading..." /></div>;
  if (!review) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/history" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to History
        </Link>
        <button onClick={onDelete} disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />{deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      <h1 className="font-display text-xl font-bold text-white mb-3">{review.title}</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <span className="text-xs font-medium px-2.5 py-1 rounded-md capitalize" style={{ background:'rgba(255,255,255,0.05)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.08)' }}>{review.language}</span>
        <span className="flex items-center gap-1.5 text-xs text-slate-600"><Calendar className="w-3.5 h-3.5" />{new Date(review.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
        {review.processingTime > 0 && <span className="flex items-center gap-1.5 text-xs text-slate-600"><Clock className="w-3.5 h-3.5" />{(review.processingTime/1000).toFixed(1)}s</span>}
      </div>

      <div className="mb-6">
        <p className="section-label mb-3">Original Code</p>
        <CodeBlock code={review.originalCode} language={review.language} label="original" />
      </div>

      <div>
        <p className="section-label mb-3">AI Review</p>
        <ReviewResult review={review} />
      </div>
    </div>
  );
}
