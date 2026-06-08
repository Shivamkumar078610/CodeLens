import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Code2, History, LogOut, Menu, X, User, ChevronDown } from 'lucide-react';
import codeLensLogo from '../logo.jpeg';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/review',    label: 'New Review', icon: Code2 },
  { to: '/history',   label: 'History',    icon: History },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [uOpen, setUOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="sticky top-0 z-50" style={{ background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img
            src={codeLensLogo}
            alt="CodeLens"
            className="w-9 h-9 rounded-xl object-cover"
            style={{ boxShadow: '0 0 16px rgba(6,182,212,0.3)' }}
          />
          <span className="font-display font-bold text-base text-white">
            Code<span className="gradient-text">Lens</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${pathname === to ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              style={pathname === to ? { background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' } : {}}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>

        {/* User menu */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }}>
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>{user?.reviewCount ?? 0}</span> reviews
          </span>
          <div className="relative">
            <button onClick={() => setUOpen(!uOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-white/5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <User className="w-3.5 h-3.5" style={{ color: '#06b6d4' }} />
              </div>
              <span className="text-sm text-slate-300 font-medium">{user?.name?.split(' ')[0]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform ${uOpen ? 'rotate-180' : ''}`} />
            </button>
            {uOpen && (
              <div className="absolute right-0 mt-2 w-52 card py-1 shadow-2xl"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-600 truncate">{user?.email}</p>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" />Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                ${pathname === to ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 mt-2">
            <LogOut className="w-4 h-4" />Sign out
          </button>
        </div>
      )}
    </header>
  );
}