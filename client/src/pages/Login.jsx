import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try { await login(form.email, form.password); toast.success('Welcome back!'); navigate('/dashboard'); }
    catch (e) { toast.error(e.displayMessage || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      {/* Glow bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:'absolute', top:'30%', left:'30%', width:500, height:500, background:'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'25%', width:400, height:400, background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', borderRadius:'50%' }} />
      </div>

      <div className="w-full max-w-md relative z-10 anim-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)', boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}>
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to CodeLens</p>
        </div>

        <div className="card p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com" className="input pl-10" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type={show ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" className="input pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-sm text-slate-600 mt-6">
            No account? <Link to="/signup" className="font-medium" style={{ color: '#06b6d4' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
