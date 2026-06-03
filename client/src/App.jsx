import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Dashboard   from './pages/Dashboard';
import ReviewPage  from './pages/ReviewPage';
import HistoryPage from './pages/HistoryPage';
import ReviewDetail from './pages/ReviewDetail';
import Navbar      from './components/Navbar';
import Spinner     from './components/Spinner';

// Only blocks unauthenticated users from protected pages
const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// Only blocks authenticated users from login/signup pages
// Landing page is NOT wrapped in this — it always shows
const AuthOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppShell = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Landing page — always visible, never redirects */}
          <Route path="/"            element={<Landing />} />

          {/* Auth pages — redirect to dashboard if already logged in */}
          <Route path="/login"       element={<AuthOnly><Login /></AuthOnly>} />
          <Route path="/signup"      element={<AuthOnly><Signup /></AuthOnly>} />

          {/* Protected pages — redirect to login if not logged in */}
          <Route path="/dashboard"   element={<Protected><Dashboard /></Protected>} />
          <Route path="/review"      element={<Protected><ReviewPage /></Protected>} />
          <Route path="/history"     element={<Protected><HistoryPage /></Protected>} />
          <Route path="/history/:id" element={<Protected><ReviewDetail /></Protected>} />

          {/* Catch all */}
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return <AuthProvider><AppShell /></AuthProvider>;
}