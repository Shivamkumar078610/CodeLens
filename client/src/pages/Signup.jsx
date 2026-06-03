import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill in all fields');
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try { await signup(form.name, form.email, form.password); toast.success('Account created! 🎉'); navigate('/dashboard'); }
    catch (e) { toast.error(e.displayMessage || 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:'absolute', top:'25%', right:'28%', width:500, height:500, background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', borderRadius:'50%' }} />
      </div>
      <div className="w-full max-w-md relative z-10 anim-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)', boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}>
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">Start reviewing code with AI</p>
        </div>
        <div className="card p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', Icon: User, placeholder: 'John Doe', auto: 'name' },
              { key: 'email', label: 'Email', type: 'email', Icon: Mail, placeholder: 'you@example.com', auto: 'email' },
            ].map(({ key, label, type, Icon, placeholder, auto }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                    className="input pl-10" autoComplete={auto} />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min 6 characters" className="input pl-10 pr-10" autoComplete="new-password" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="password" value={form.confirm} onChange={set('confirm')}
                  placeholder="Repeat password" className="input pl-10" autoComplete="new-password" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account? <Link to="/login" className="font-medium" style={{ color: '#06b6d4' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
