import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import logo from "../assets/logo.png";

const modules = [
  { key: "counterparties", label: "Counterparties", hint: "Onboard & test" },
  { key: "portfolios", label: "Portfolios", hint: "Structure & accounts" },
  { key: "orders", label: "Orders", hint: "Trade & track" },
  { key: "securities", label: "Securities", hint: "Master data" },
  { key: "analytics", label: "Analytics", hint: "Alpha & risk" },
  { key: "settings", label: "Settings", hint: "Firm & users" },
];

export default function HomeGalaxy() {
  const [user, setUser] = useState(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    getUser();

    const date = new Date();
    const formatted = date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    setToday(formatted);

    if (!document.getElementById("galaxy-style")) {
      const style = document.createElement("style");
      style.id = "galaxy-style";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="galaxy-container">
      {/* Top-right bar with user + date */}
      <div className="galaxy-topbar">
        <div className="me-3">{today}</div>
        {user && (
          <div className="user-info">
            <span className="me-2">Welcome, {user.email}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-outline-light">
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Center logo core */}
      <div className="galaxy-core">
        <img src={logo} alt="MOD" className="galaxy-logo" />
      </div>

      {/* Module constellation */}
      <div className="module-grid">
        {modules.map((m) => (
          <div key={m.key} className="node-card">
            <div className="node-title">{m.label}</div>
            <div className="node-hint">{m.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
.galaxy-container {
  min-height: 100vh;
  background: radial-gradient(circle at top, #0a0f1f, #020617 80%);
  color: white;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
}

/* Top bar */
.galaxy-topbar {
  position: absolute;
  top: 20px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #cbd5e1;
}
.galaxy-topbar .btn {
  font-size: 0.8rem;
  border-radius: 20px;
  padding: 2px 12px;
}

/* Core logo */
.galaxy-core {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 80px;
  margin-bottom: 60px;
}
.galaxy-logo {
  max-width: 280px;
  filter: drop-shadow(0 0 30px rgba(80, 180, 255, 0.9));
  animation: glowPulse 6s ease-in-out infinite;
}
@keyframes glowPulse {
  0%,100% { filter: drop-shadow(0 0 30px rgba(80,180,255,0.9)); }
  50%     { filter: drop-shadow(0 0 50px rgba(120,200,255,1)); }
}

/* Module grid */
.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}
.node-card {
  padding: 20px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 30px rgba(0,0,0,.4);
  text-align: center;
  transition: transform .25s ease, box-shadow .25s ease;
}
.node-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 0 20px rgba(80,180,255,.6);
}
.node-title {
  font-weight: 700;
  font-size: 1.1rem;
}
.node-hint {
  font-size: .85rem;
  color: #94a3b8;
}
`;
