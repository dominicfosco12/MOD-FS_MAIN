import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";


/**
 * AuthGate
 * - If a Supabase session exists → render children (your app)
 * - Otherwise shows a Galaxy-themed login with:
 *   • Email Magic Link
 *   • (Optional) Google OAuth (works if enabled in Supabase)
 * - After sign-in, Topbar (you already wired) displays email/firm + Logout.
 */

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");     // success/info text
  const [error, setError] = useState("");       // error text
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Initial session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setChecking(false);
    });

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function sendMagicLink(e) {
    e.preventDefault();
    setError(""); setStatus(""); setSending(true);
    try {
      const { error: signErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (signErr) throw signErr;
      setStatus("Check your email for the sign-in link.");
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSending(false);
    }
  }

  async function signInGoogle() {
    setError(""); setStatus("");
    try {
      const { error: gErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (gErr) throw gErr;
      // Redirect will occur if provider is enabled.
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  if (checking) {
    return (
      <div className="auth-wrap">
        <div className="auth-card glass">
          <div className="brand">MOD // Galaxy</div>
          <div className="muted">Checking session…</div>
        </div>
        <style>{CSS}</style>
      </div>
    );
  }

  if (session) return children;

  return (
    <div className="auth-wrap">
      <div className="auth-card glass">
        <div className="brand">MOD // Galaxy</div>
        <div className="tagline">Sign in to your PMS/OMS/EMS</div>

        <form className="login-form" onSubmit={sendMagicLink}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              placeholder="you@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button className="btn" disabled={sending}>
            {sending ? "Sending…" : "Send Magic Link"}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <button className="btn ghost" onClick={signInGoogle}>
          Continue with Google
        </button>

        {status && (
          <div className="callout ok glass">{status}</div>
        )}
        {error && (
          <div className="callout err glass">
            <b>Sign-in error</b>
            <div className="muted">{error}</div>
          </div>
        )}

        <div className="foot muted">
          By continuing you agree to the firm’s terms & acceptable use.
        </div>
      </div>

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.auth-wrap{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:
    radial-gradient(1200px 700px at 70% -10%, #0f1f4b, transparent),
    radial-gradient(800px 400px at -10% 100%, #0c193a, transparent),
    #050813;
  color:#e7f7ff; padding:24px;
}
.auth-card{width:min(520px,92vw); border-radius:16px; padding:22px; border:1px solid rgba(255,255,255,0.12)}
.brand{font-weight:800;font-size:20px;letter-spacing:2px;
  background:linear-gradient(90deg,#bffcff,#b6a8ff,#79e1ff); -webkit-background-clip:text; color:transparent}
.tagline{margin-top:4px;opacity:0.85}
.login-form{display:grid;gap:12px;margin-top:16px}
.field{display:grid;gap:6px}
.field span{font-size:12px;opacity:0.8}
.field input{
  width:100%;background:transparent;border:1px solid rgba(255,255,255,0.2);
  border-radius:12px;color:#e7f7ff;padding:10px 12px;outline:none;
}
.field input:focus{border-color:#72f6ff}
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);
  background:linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04));
  color:#e7f7ff; cursor:pointer; width:100%;
}
.btn:hover{border-color:#72f6ff}
.btn.ghost{background:transparent}
.divider{display:flex;align-items:center;gap:10px;opacity:0.7;margin:12px 0}
.divider:before,.divider:after{content:"";height:1px;flex:1;background:rgba(255,255,255,0.2)}
.callout{margin-top:12px;border-radius:12px;padding:10px;border:1px solid rgba(255,255,255,0.2)}
.callout.ok{border-color:rgba(43,230,163,0.35);color:#2be6a3}
.callout.err{border-color:rgba(255,107,136,0.5);color:#ff9aa9}
.muted{opacity:0.85;font-size:12px}
.foot{margin-top:10px}
`;
