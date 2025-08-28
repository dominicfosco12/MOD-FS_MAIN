import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * MOD Galaxy 2026 — PMS/OMS/EMS Shell (single-file, fixed)
 * - Futuristic galaxy theme (animated starfield, neon glass cards)
 * - Left nav for all domains in your schema
 * - Top command bar (Ctrl/Cmd+K)
 * - Pages for: Dashboard, Portfolios, Custody, Instruments, Orders,
 *   Executions, Compliance, FIX, Curves/FX/Benchmarks, Swaps, Valuations,
 *   Audit Logs, Admin
 * Drop-in: src/App.jsx
 */

// --------------------------- Theme & Utilities ---------------------------

const NAV = [
  { key: "dashboard", label: "Dashboard" },
  { key: "portfolios", label: "Portfolios" },
  { key: "custody", label: "Custody Accounts" },
  { key: "instruments", label: "Instruments" },
  { key: "orders", label: "Orders (OMS)" },
  { key: "executions", label: "Executions (EMS)" },
  { key: "compliance", label: "Compliance" },
  { key: "fix", label: "FIX" },
  { key: "curves", label: "Curves / FX / Benchmarks" },
  { key: "swaps", label: "Swaps" },
  { key: "valuations", label: "Valuations" },
  { key: "audit", label: "Audit Logs" },
  { key: "admin", label: "Admin" },
];

const Badge = ({ children, tone = "info" }) => (
  <span className={`badge badge-${tone}`}>{children}</span>
);

const Pill = ({ children }) => <span className="pill">{children}</span>;

const Icon = ({ name, size = 18 }) => {
  const stroke = "currentColor";
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "rocket":
      return (
        <svg {...common}><path d="M5 19l4-1 8-8 1-4-4 1-8 8-1 4z"/><path d="M15 9l-6 6"/><path d="M5 19l3-3"/></svg>
      );
    case "grid":
      return (<svg {...common}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
    case "portfolio":
      return (<svg {...common}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a3 3 0 013-3h2a3 3 0 013 3v2"/></svg>);
    case "custody":
      return (<svg {...common}><rect x="2" y="7" width="20" height="12" rx="2"/><path d="M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2"/><path d="M8 12h8"/></svg>);
    case "instruments":
      return (<svg {...common}><circle cx="7" cy="12" r="4"/><circle cx="17" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M10 10l4-2M10 14l4 2"/></svg>);
    case "orders":
      return (<svg {...common}><path d="M6 2h9l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M14 2v6h6"/></svg>);
    case "exec":
      return (<svg {...common}><path d="M3 12h18"/><path d="M7 12l-4 4V8l4 4zM21 12l-4-4v8l4-4z"/></svg>);
    case "shield":
      return (<svg {...common}><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg>);
    case "fix":
      return (<svg {...common}><path d="M4 8h16M4 16h16"/><path d="M8 4v16M16 4v16"/></svg>);
    case "curve":
      return (<svg {...common}><path d="M3 18c4-8 8-8 12-4s5 4 6 4"/></svg>);
    case "swap":
      return (<svg {...common}><path d="M4 7h11l-3-3M20 17H9l3 3"/></svg>);
    case "valuations":
      return (<svg {...common}><path d="M4 19V5M20 19V5"/><rect x="7" y="8" width="3" height="8"/><rect x="12" y="6" width="3" height="10"/><rect x="17" y="10" width="3" height="6"/></svg>);
    case "audit":
      return (<svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>);
    case "admin":
      return (<svg {...common}><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0113 0"/></svg>);
    case "search":
      return (<svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>);
    default:
      return (<svg {...common}><circle cx="12" cy="12" r="9"/></svg>);
  }
};

const useKey = (combo, handler) => {
  useEffect(() => {
    const fn = (e) => {
      const wantMeta = combo.includes("Mod+");
      const wantK = combo.endsWith("K");
      if (wantMeta && wantK && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); handler();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [combo, handler]);
};

// --------------------------- Starfield Background ---------------------------

const Starfield = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
    };
    resize();
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: 0.3 + Math.random() * 0.7,
      r: 0.4 + Math.random() * 1.8,
      tw: Math.random() * 2 * Math.PI
    }));
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.tw += 0.03;
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(161, 239, 255, ${alpha * 0.6})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#7ee6ff";
        ctx.fill();
        s.x += (s.z - 0.5) * 0.6;
        if (s.x > canvas.width + 5) s.x = -5;
        if (s.x < -5) s.x = canvas.width + 5;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} className="starfield" />;
};

// --------------------------- Shell Layout ---------------------------

const App = () => {
  const [active, setActive] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCmd, setShowCmd] = useState(false);
  const [query, setQuery] = useState("");
  useKey("Mod+K", () => setShowCmd(true));

  const navWithIcons = useMemo(() => ([
    { ...NAV[0], icon: "rocket" },
    { ...NAV[1], icon: "portfolio" },
    { ...NAV[2], icon: "custody" },
    { ...NAV[3], icon: "instruments" },
    { ...NAV[4], icon: "orders" },
    { ...NAV[5], icon: "exec" },
    { ...NAV[6], icon: "shield" },
    { ...NAV[7], icon: "fix" },
    { ...NAV[8], icon: "curve" },
    { ...NAV[9], icon: "swap" },
    { ...NAV[10], icon: "valuations" },
    { ...NAV[11], icon: "audit" },
    { ...NAV[12], icon: "admin" },
  ]), []);

  return (
    <div className={`app ${sidebarCollapsed ? "app--collapsed" : ""}`}>
      <Starfield />
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        items={navWithIcons}
        active={active}
        onSelect={setActive}
      />
      <main className="main">
        <Topbar onOpenCmd={() => setShowCmd(true)} />
        <section className="content">
          {active === "dashboard" && <Dashboard />}
          {active === "portfolios" && <Portfolios />}
          {active === "custody" && <Custody />}
          {active === "instruments" && <Instruments />}
          {active === "orders" && <Orders />}
          {active === "executions" && <Executions />}
          {active === "compliance" && <Compliance />}
          {active === "fix" && <Fix />}
          {active === "curves" && <CurvesFxBench />}
          {active === "swaps" && <Swaps />}
          {active === "valuations" && <Valuations />}
          {active === "audit" && <AuditLogs />}
          {active === "admin" && <Admin />}
        </section>
      </main>

      {showCmd && (
        <CommandPalette
          onClose={() => setShowCmd(false)}
          query={query}
          setQuery={setQuery}
          onGo={(key) => { setActive(key); setShowCmd(false); }}
          items={navWithIcons}
        />
      )}

      <style>{CSS}</style>
    </div>
  );
};

// --------------------------- UI Parts ---------------------------

const Topbar = ({ onOpenCmd }) => {
  return (
    <header className="topbar glass">
      <div className="brand">
        <Icon name="grid" size={20} />
        <span>MOD // Galaxy</span>
      </div>
      <div className="top-actions">
        <button className="btn ghost" onClick={onOpenCmd} title="Command (Ctrl/Cmd+K)">
          <Icon name="search" /> <span className="hide-sm">Search / Jump</span>
          <kbd className="kbd hide-sm">⌘K</kbd>
        </button>
        <Pill>2026</Pill>
        <div className="avatar">DF</div>
      </div>
    </header>
  );
};

const Sidebar = ({ collapsed, setCollapsed, items, active, onSelect }) => {
  return (
    <aside className={`sidebar glass ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-head">
        <div className="logo">MOD</div>
        <button className="btn tiny ghost" onClick={() => setCollapsed(!collapsed)} title="Collapse">
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <nav className="nav">
        {items.map((it) => (
          <button
            key={it.key}
            className={`nav-item ${active === it.key ? "active" : ""}`}
            onClick={() => onSelect(it.key)}
          >
            <Icon name={it.icon} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <small>v1.0 • Galaxy</small>
      </div>
    </aside>
  );
};

const CommandPalette = ({ onClose, query, setQuery, onGo, items }) => {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => i.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd glass" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input">
          <Icon name="search" />
          <input
            autoFocus
            placeholder="Type to jump — e.g., orders, compliance, swaps…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="kbd">Esc</kbd>
        </div>
        <div className="cmd-list">
          {filtered.map((i) => (
            <button key={i.key} className="cmd-item" onClick={() => onGo(i.key)}>
              <Icon name={i.icon} />
              <div>
                <div className="cmd-title">{i.label}</div>
                <div className="cmd-sub">Go to {i.label}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="empty">No matches.</div>}
        </div>
      </div>
    </div>
  );
};

// --------------------------- Pages (stubs wired to schema) ---------------------------

const SectionHeader = ({ icon, title, actions }) => (
  <div className="section-header">
    <h2><Icon name={icon} /> {title}</h2>
    <div className="actions">{actions}</div>
  </div>
);

const Card = ({ title, children, footer, right }) => (
  <div className="card glass">
    <div className="card-head">
      <h3>{title}</h3>
      {right}
    </div>
    <div className="card-body">{children}</div>
    {footer && <div className="card-foot">{footer}</div>}
  </div>
);

const Empty = ({ title = "Nothing here yet", hint }) => (
  <div className="empty glass">
    <div className="empty-title">{title}</div>
    {hint && <div className="empty-hint">{hint}</div>}
  </div>
);

// ---- Dashboard ----
const Dashboard = () => {
  return (
    <div className="grid grid-3">
      <Card title="Firm Snapshot" right={<Badge tone="success">LIVE</Badge>}>
        <ul className="stats">
          <li><span>Total Portfolios</span><b>—</b></li>
          <li><span>Custody Accounts</span><b>—</b></li>
          <li><span>Active Instruments</span><b>—</b></li>
          <li><span>Open Orders</span><b>—</b></li>
          <li><span>Execs Today</span><b>—</b></li>
          <li><span>Compliance Alerts</span><b>—</b></li>
        </ul>
      </Card>
      <Card title="P&L (Valuations Daily)">
        <div className="placeholder-chart">P&L sparkline / by portfolio</div>
      </Card>
      <Card title="Workflows">
        <div className="kanban">
          <div><h4>To Do</h4><div className="chip">Upload Prices</div><div className="chip">Review Alerts</div></div>
          <div><h4>In Progress</h4><div className="chip">Reconcile Trades</div></div>
          <div><h4>Done</h4><div className="chip">Create Accounts</div></div>
        </div>
      </Card>
    </div>
  );
};

// ---- Portfolios ----
const Portfolios = () => {
  return (
    <>
      <SectionHeader
        icon="portfolio"
        title="Portfolios"
        actions={<div className="btn-row">
          <button className="btn">New Portfolio</button>
          <button className="btn ghost">Export</button>
        </div>}
      />
      <Card title="All Portfolios">
        <Table
          columns={["Code", "Name", "Base CCY", "Active", "Created"]}
          rows={[]}
          emptyHint="public.portfolios."
        />
      </Card>
    </>
  );
};

// ---- Custody Accounts ----
const Custody = () => {
  return (
    <>
      <SectionHeader
        icon="custody"
        title="Custody Accounts"
        actions={<div className="btn-row">
          <button className="btn">New Custody Account</button>
          <button className="btn ghost">Link Exec Broker</button>
        </div>}
      />
      <Card title="Accounts">
        <Table
          columns={["Name", "Account #", "Custodian", "Tax Status", "Currency", "Active"]}
          rows={[]}
          emptyHint="custody_accounts + custody_exec_accounts."
        />
      </Card>
    </>
  );
};

// ---- Instruments ----
const Instruments = () => {
  return (
    <>
      <SectionHeader
        icon="instruments"
        title="Instruments"
        actions={<div className="btn-row">
          <button className="btn">Add Instrument</button>
          <button className="btn ghost">Identifiers</button>
          <button className="btn ghost">Price Sources</button>
        </div>}
      />
      <div className="grid grid-2">
        <Card title="Master">
          <Table
            columns={["Symbol", "Asset Class", "Currency", "Name", "Active"]}
            rows={[]}
            emptyHint="instruments (join identifiers/price sources/futures/options/crypto)."
          />
        </Card>
        <Card title="Identifiers">
          <Table
            columns={["Symbol", "ID Type", "Value"]}
            rows={[]}
            emptyHint="instrument_identifiers (ISIN, CUSIP, SEDOL, FIGI, RIC, BBG, OCC, CONTRACT_CODE)."
          />
        </Card>
      </div>
    </>
  );
};

// ---- Orders (OMS) ----
const Orders = () => {
  return (
    <>
      <SectionHeader
        icon="orders"
        title="Orders (OMS)"
        actions={<div className="btn-row">
          <button className="btn">New Order</button>
          <button className="btn ghost">Upload (CSV)</button>
        </div>}
      />
      <Card title="Open / Recent Orders">
        <Table
          columns={["Created", "Portfolio", "Symbol", "Side", "Type", "Qty", "Price", "TIF", "Routing", "Status"]}
          rows={[]}
          emptyHint="orders + pre_allocations + events."
        />
      </Card>
    </>
  );
};

// ---- Executions (EMS) ----
const Executions = () => {
  return (
    <>
      <SectionHeader
        icon="exec"
        title="Executions (EMS)"
        actions={<div className="btn-row">
          <button className="btn">Allocate</button>
          <button className="btn ghost">Breaks</button>
        </div>}
      />
      <div className="grid grid-2">
        <Card title="Executions">
          <Table
            columns={["Executed At", "Order", "Symbol", "Qty", "Price", "Venue", "Commission", "Fees", "Recon"]}
            rows={[]}
            emptyHint="executions + execution_allocations."
          />
        </Card>
        <Card title="Trade Lots">
          <Table
            columns={["Account", "Symbol", "Open Date", "Open Qty", "Remaining", "Method"]}
            rows={[]}
            emptyHint="trade_lots + trade_lot_closures."
          />
        </Card>
      </div>
    </>
  );
};

// ---- Compliance ----
const Compliance = () => {
  return (
    <>
      <SectionHeader
        icon="shield"
        title="Compliance"
        actions={<div className="btn-row">
          <button className="btn">Run Pre-Trade</button>
          <button className="btn ghost">Rule Library</button>
        </div>}
      />
      <div className="grid grid-2">
        <Card title="Violations">
          <Table
            columns={["Created", "Severity", "Entity", "Message", "Template"]}
            rows={[]}
            emptyHint="compliance_violations."
          />
        </Card>
        <Card title="Rules">
          <Table
            columns={["Code", "Name", "Severity", "Scope", "Active"]}
            rows={[]}
            emptyHint="firm_compliance_rules + templates + field_catalog."
          />
        </Card>
      </div>
    </>
  );
};

// ---- FIX ----
const Fix = () => {
  return (
    <>
      <SectionHeader
        icon="fix"
        title="FIX Connectivity"
        actions={<div className="btn-row">
          <button className="btn">New Session</button>
          <button className="btn ghost">Drop Copy</button>
        </div>}
      />
      <div className="grid grid-2">
        <Card title="Sessions">
          <Table
            columns={["Party", "Version", "Drop Copy", "Enabled", "Created"]}
            rows={[]}
            emptyHint="fix_sessions + fix_parties."
          />
        </Card>
        <Card title="Messages">
          <Table
            columns={["Received", "Direction", "Type", "Seq", "Retention"]}
            rows={[]}
            emptyHint="fix_messages (fields_json)."
          />
        </Card>
      </div>
    </>
  );
};

// ---- Curves / FX / Benchmarks ----
const CurvesFxBench = () => {
  return (
    <>
      <SectionHeader
        icon="curve"
        title="Curves / FX / Benchmarks"
        actions={<div className="btn-row">
          <button className="btn">Add Curve</button>
          <button className="btn ghost">Load Quotes</button>
        </div>}
      />
      <div className="grid grid-3">
        <Card title="Benchmarks">
          <Table columns={["Code", "Name", "Currency"]} rows={[]} emptyHint="benchmarks." />
        </Card>
        <Card title="Curves">
          <Table columns={["Benchmark", "Curve Date", "Method", "Source"]} rows={[]} emptyHint="curves + curve_points + curve_quotes." />
        </Card>
        <Card title="FX Pairs">
          <Table columns={["Base", "Quote", "Settlement", "Precision"]} rows={[]} emptyHint="fx_pairs + fx_rates_daily." />
        </Card>
      </div>
    </>
  );
};

// ---- Swaps ----
const Swaps = () => {
  return (
    <>
      <SectionHeader
        icon="swap"
        title="Swaps"
        actions={<div className="btn-row">
          <button className="btn">New Template</button>
          <button className="btn ghost">Price Legs</button>
        </div>}
      />
      <div className="grid grid-2">
        <Card title="Templates">
          <Table columns={["Name", "Underlying", "Start", "End", "BDC", "Funding Index"]} rows={[]} emptyHint="swap_templates + swap_legs." />
        </Card>
        <Card title="Instances">
          <Table columns={["Trade Date", "Effective", "Maturity", "Status"]} rows={[]} emptyHint="swap_instances + swap_cashflows." />
        </Card>
      </div>
    </>
  );
};

// ---- Valuations ----
const Valuations = () => {
  return (
    <>
      <SectionHeader
        icon="valuations"
        title="Valuations"
        actions={<div className="btn-row">
          <button className="btn">Load Prices</button>
          <button className="btn ghost">Recalculate</button>
        </div>}
      />
      <Card title="Valuations Daily">
        <Table
          columns={["As Of", "Portfolio", "Account", "Instrument", "Qty", "Price", "FX", "MV (Base)", "P&L Day"]}
          rows={[]}
          emptyHint="valuations_daily (joins to portfolios, custody_accounts, instruments, price_sources, curves)."
        />
      </Card>
    </>
  );
};

// ---- Audit Logs ----
const AuditLogs = () => {
  return (
    <>
      <SectionHeader icon="audit" title="Audit Logs" actions={<div />} />
      <Card title="Events">
        <Table
          columns={["Created", "Actor", "Entity", "Action", "Diff"]}
          rows={[]}
          emptyHint="audit_logs."
        />
      </Card>
    </>
  );
};

// ---- Admin ----
const Admin = () => {
  return (
    <>
      <SectionHeader
        icon="admin"
        title="Admin"
        actions={<div className="btn-row">
          <button className="btn">Invite User</button>
          <button className="btn ghost">Roles & Permissions</button>
        </div>}
      />
      <div className="grid grid-2">
        <Card title="Users">
          <Table columns={["User", "Email", "Firm", "Active, Created"]} rows={[]} emptyHint="users + user_roles + roles + permissions." />
        </Card>
        <Card title="Brokers & Schedules">
          <Table columns={["Broker", "Account Code", "Commission", "Fees", "Firm"]} rows={[]} emptyHint="exec_broker_accounts + commission_schedules + fee_schedules." />
        </Card>
      </div>
    </>
  );
};

// ---- Generic Table (with inline column CSS var) ----
const Table = ({ columns, rows, emptyHint }) => {
  const style = { "--cols": `repeat(${columns.length}, minmax(0, 1fr))` };
  return (
    <div className="table" style={style}>
      <div className="table-head">
        {columns.map((c) => <div key={c} className="th">{c}</div>)}
      </div>
      <div className="table-body">
        {rows.length === 0 ? (
          <Empty hint={emptyHint} />
        ) : (
          rows.map((r, idx) => (
            <div key={idx} className="tr">
              {r.map((cell, i) => <div key={i} className="td">{cell}</div>)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --------------------------- CSS (Galaxy 2026) ---------------------------

const CSS = `
:root{
  --bg:#050813;
  --bg-2:#0a1022;
  --glass: rgba(255,255,255,0.06);
  --card: rgba(255,255,255,0.08);
  --border: rgba(255,255,255,0.12);
  --text:#e7f7ff;
  --muted:#9dd6e4;
  --neon:#72f6ff;
  --neon-2:#7a7bff;
  --accent:#9d79ff;
  --success:#2be6a3;
  --warning:#ffd359;
  --danger:#ff6b88;
}

*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:radial-gradient(1200px 700px at 70% -10%, #0f1f4b, transparent), radial-gradient(800px 400px at -10% 100%, #0c193a, transparent), var(--bg); color:var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial; letter-spacing:0.2px}
.app{display:flex;height:100%;position:relative;overflow:hidden}
.app--collapsed .sidebar{width:76px}
.app--collapsed .nav-item span{display:none}
.app--collapsed .logo{letter-spacing:1px}

.starfield{position:absolute;inset:0;z-index:0;opacity:0.6}

.glass{background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); backdrop-filter: blur(12px); border:1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.3), inset 0 0 0.5px rgba(255,255,255,0.15)}
.badge{display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:999px;font-size:12px;border:1px solid var(--border);background:var(--card)}
.badge-success{color:var(--success);border-color:rgba(43,230,163,0.35)}
.pill{padding:6px 10px;border-radius:999px;background:rgba(154,118,255,0.15); border:1px solid rgba(154,118,255,0.35); color:#e9e3ff}

.sidebar{position:relative;z-index:2;width:260px;display:flex;flex-direction:column;padding:14px;gap:12px}
.sidebar-head{display:flex;align-items:center;justify-content:space-between}
.logo{font-weight:800;font-size:20px;letter-spacing:3px;background:linear-gradient(90deg,#bffcff,#b6a8ff,#79e1ff); -webkit-background-clip:text; color:transparent}
.nav{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.nav-item{display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:12px;border:1px solid transparent;color:var(--text);background:transparent;cursor:pointer}
.nav-item:hover{background:rgba(255,255,255,0.05); border-color:var(--border)}
.nav-item.active{background:linear-gradient(180deg, rgba(124,255,255,0.12), rgba(124,124,255,0.08)); border-color:rgba(124,255,255,0.35); box-shadow:inset 0 0 12px rgba(124,255,255,0.2)}
.sidebar-foot{margin-top:auto;opacity:0.7}

.main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column}
.topbar{height:64px;margin:14px;border-radius:16px;padding:0 14px;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:1px}
.top-actions{display:flex;align-items:center;gap:12px}
.avatar{width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#a2feff,#8b8bff); color:#001427; font-weight:700}

.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.2); background:linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)); color:var(--text); cursor:pointer}
.btn:hover{border-color:var(--neon)}
.btn.ghost{background:transparent}
.btn.tiny{padding:6px 8px; font-size:12px}
.btn-row{display:flex;gap:8px}

.kbd{border:1px solid var(--border); border-bottom-width:2px;padding:3px 6px;border-radius:6px;font-size:12px;opacity:0.8}

.content{padding:6px 14px 24px 14px}
.section-header{display:flex;align-items:center;justify-content:space-between;margin:6px 0 14px 0}
.section-header h2{display:flex;align-items:center;gap:10px;margin:0}

.grid{display:grid;gap:14px}
.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
@media (max-width: 1100px){ .grid-3{grid-template-columns:1fr} .grid-2{grid-template-columns:1fr} .hide-sm{display:none} }

.card{border-radius:16px;padding:12px}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.card-head h3{margin:0}
.card-body{min-height:120px}

.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0;padding:0;list-style:none}
.stats li{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px dashed rgba(255,255,255,0.15); border-radius:12px;background:rgba(255,255,255,0.03)}

.placeholder-chart{height:140px;border-radius:12px;border:1px dashed rgba(255,255,255,0.2); display:flex;align-items:center;justify-content:center;opacity:0.7}

.kanban{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.kanban h4{margin:0 0 8px 0; font-weight:700}
.chip{padding:8px 10px;border-radius:10px;border:1px solid var(--border); background:rgba(255,255,255,0.06); margin-bottom:8px}

.table{display:flex;flex-direction:column;gap:8px}
.table-head, .tr{display:grid;grid-template-columns:var(--cols); gap:6px}
.th, .td{padding:10px;border:1px solid var(--border);border-radius:10px;background:rgba(255,255,255,0.03)}
.table-head .th{background:linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)); font-weight:700}
.table-body{display:flex;flex-direction:column;gap:6px}
.table .empty{border-radius:12px;padding:24px;text-align:center;opacity:0.85}

.empty .empty-title{font-weight:700;margin-bottom:6px}
.empty .empty-hint{opacity:0.8}

.cmd-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:flex-start;justify-content:center;padding-top:10vh;z-index:50}
.cmd{width:min(860px,92vw);border-radius:16px}
.cmd-input{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--border)}
.cmd-input input{flex:1;background:transparent;border:none;outline:none;color:var(--text);font-size:16px}
.cmd-list{max-height:52vh;overflow:auto;padding:8px}
.cmd-item{width:100%;display:flex;gap:10px;align-items:center;text-align:left;border:1px solid transparent;background:transparent;border-radius:12px;padding:10px;cursor:pointer}
.cmd-item:hover{border-color:var(--neon)}
.cmd-title{font-weight:700}
`;

export default App;
