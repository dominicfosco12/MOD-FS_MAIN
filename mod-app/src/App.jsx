import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './services/supabaseClient';

const Login = React.lazy(() => import('./pages/Login.jsx'));
const HomeGalaxy = React.lazy(() => import('./pages/HomeGalaxy.jsx'));

function useAuthState() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data?.session ?? null);
      setLoading(false);
    };

    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  return { session, loading };
}

function Protected({ children }) {
  const { session, loading } = useAuthState();
  const location = useLocation();
  if (loading) return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border" /></div>;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border" /></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <HomeGalaxy />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
