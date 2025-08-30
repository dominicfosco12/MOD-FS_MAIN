import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    navigate(from, { replace: true });
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center galaxy-bg">
      <div className="card border-0 shadow-lg" style={{maxWidth: 460, width: '100%'}}>
        <div className="card-body p-4">
          <div className="text-center mb-3">
            <img src={logo} alt="MOD" style={{ maxWidth: 160 }} className="mb-2" />
            <h1 className="h5 mb-0">Sign in to MOD</h1>
            <div className="text-muted">Automation • Connectivity • Performance</div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-12">
              <label className="form-label">Email</label>
              <input
                className="form-control" type="email" autoComplete="email"
                value={email} onChange={e=>setEmail(e.target.value)} required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Password</label>
              <input
                className="form-control" type="password" autoComplete="current-password"
                value={password} onChange={e=>setPassword(e.target.value)} required
              />
            </div>
            <div className="col-12 d-grid">
              <button className="btn btn-primary" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="text-center text-muted small mt-3">
            Trouble signing in? Ensure your Supabase Auth user exists.
          </div>
        </div>
      </div>
    </div>
  );
}
