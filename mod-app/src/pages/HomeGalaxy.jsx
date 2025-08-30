import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import logo from "../assets/logo.png";

const PRIMARY = [
  { key: "pms", title: "MOD-PMS", hint: "Portfolio Management System" },
  { key: "oms", title: "MOD-OMS", hint: "Order Management System" },
  { key: "ems", title: "MOD-EMS", hint: "Execution Management System" },
];

const SECONDARY = [
  { key: "risk",   title: "MOD-RISK",   hint: "Risk & Analytics" },
  { key: "ops",    title: "MOD-OPS",    hint: "Operations & Reconciliation" },
  { key: "ai",     title: "MOD-AI",     hint: "AI & Predictive Insights" },
  { key: "data",   title: "MOD-DATA",   hint: "Data Lake & Feeds" },
  { key: "config", title: "MOD-CONFIG", hint: "Configuration & Admin" },
];

export default function HomeGalaxy() {
  const [email, setEmail] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data?.user?.email ?? "");
    })();
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );

    if (!document.getElementById("mod-hub-css")) {
      const style = document.createElement("style");
      style.id = "mod-hub-css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="hub-wrap">
      {/* Top status */}
      <div className="hub-top">
        <div className="pill">
          <span>{today}</span>
          {email && <span className="dot" />}
          {email && <span>{email}</span>}
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Hero logo */}
      <div className="hub-hero">
        <div className="logo-core">
          <div className="logo-glow" />
          <img src={logo} alt="MOD" className="logo-img" />
        </div>
        <div className="tagline">Automation • Connectivity • Performance</div>
      </div>

      {/* Primary 3 modules */}
      <div className="primary-row">
        {PRIMARY.map((m) => (
          <div key={m.key} className="primary-card">
            <div className="pc-title">{m.title}</div>
            <div className="pc-hint">{m.hint}</div>
          </div>
        ))}
      </div>

      {/* Secondary nav */}
      <div className="secondary-nav">
        {SECONDARY.map((m) => (
          <div key={m.key} className="sec-pill">
            <div className="sp-title">{m.title}</div>
            <div className="sp-hint">{m.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
.hub-wrap{
  min-height:100vh; background: radial-gradient(circle at top, #0a0f1f, #020617 80%);
  color:#e6f1ff; font-family: "Segoe UI",sans-serif; position:relative;
}

/* Top bar */
.hub-top{ position:absolute; top:20px; right:24px; }
.pill{
  display:flex; align-items:center; gap:12px;
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12);
  padding:8px 14px; border-radius:18px; backdrop-filter:blur(8px);
  box-shadow:0 6px 20px rgba(0,0,0,.35); font-size:.9rem; color:#cfe0ff;
}
.pill .dot{ width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.25); }
.btn{ border:1px solid rgba(90,200,255,.45); background:rgba(90,200,255,.1);
  color:#e8f7ff; padding:4px 10px; border-radius:14px; cursor:pointer;
}
.btn:hover{ box-shadow:0 0 12px rgba(90,200,255,.5); }

/* Hero logo */
.hub-hero{ display:grid; place-items:center; padding-top:120px; }
.logo-core{ position:relative; width:420px; height:420px; display:grid; place-items:center; }
.logo-glow{
  position:absolute; inset:0; border-radius:50%;
  background:radial-gradient(circle, rgba(72,126,255,.4), rgba(0,162,255,.2) 70%, transparent 90%);
  filter:blur(10px); box-shadow:0 0 80px rgba(80,180,255,.6), 0 0 160px rgba(64,120,255,.5);
  animation:pulse 7s ease-in-out infinite;
}
.logo-img{ max-width:300px; filter:drop-shadow(0 0 30px rgba(80,180,255,.9)); }
@keyframes pulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
.tagline{ margin-top:12px; color:#bcd0ff; }

/* Primary modules */
.primary-row{
  display:flex; justify-content:center; gap:40px; margin-top:60px; flex-wrap:wrap;
}
.primary-card{
  width:260px; padding:24px; border-radius:18px;
  background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.14);
  backdrop-filter:blur(12px); box-shadow:0 8px 28px rgba(0,0,0,.35);
  text-align:center; transition:transform .2s ease, box-shadow .2s ease;
}
.primary-card:hover{ transform:translateY(-4px); box-shadow:0 0 20px rgba(103,232,249,.6); }
.pc-title{ font-weight:700; font-size:1.2rem; margin-bottom:6px; }
.pc-hint{ font-size:.9rem; color:#a8b7d6; }

/* Secondary nav */
.secondary-nav{
  display:flex; justify-content:center; flex-wrap:wrap; gap:16px; margin-top:40px;
}
.sec-pill{
  padding:12px 18px; border-radius:14px;
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(8px); box-shadow:0 6px 20px rgba(0,0,0,.3);
  min-width:160px; text-align:center; transition:transform .2s ease;
}
.sec-pill:hover{ transform:translateY(-3px); box-shadow:0 0 14px rgba(103,232,249,.5); }
.sp-title{ font-weight:600; }
.sp-hint{ font-size:.8rem; color:#94a3b8; }
`;
