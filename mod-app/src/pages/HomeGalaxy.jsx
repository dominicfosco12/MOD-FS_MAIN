import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import logo from '../assets/logo.png'

const modules = [
  { key: 'counterparties', label: 'Counterparties', hint: 'Onboard & test' },
  { key: 'portfolios', label: 'Portfolios', hint: 'Structure & accounts' },
  { key: 'orders', label: 'Orders', hint: 'Trade & track' },
  { key: 'securities', label: 'Securities', hint: 'Master data' },
  { key: 'analytics', label: 'Analytics', hint: 'Alpha & risk' },
  { key: 'settings', label: 'Settings', hint: 'Firm & users' }
]

export default function HomeGalaxy() {
  const [user, setUser] = useState(null)
  const [today, setToday] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
    }
    getUser()

    const date = new Date()
    const formatted = date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    setToday(formatted)

    if (!document.getElementById('galaxy-style')) {
      const style = document.createElement('style')
      style.id = 'galaxy-style'
      style.innerHTML = styles
      document.head.appendChild(style)
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const goTo = key => {
    // If using React Router, swap with navigate(`/${key}`)
    window.location.href = `/${key}`
  }

  const onCardKey = (e, key) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goTo(key)
    }
  }

  return (
    <div className='galaxy-container'>
      {/* Parallax starfield backdrop */}
      <div className='stars layer-1' aria-hidden='true' />
      <div className='stars layer-2' aria-hidden='true' />
      <div className='stars layer-3' aria-hidden='true' />

      {/* Top-right bar with user + date */}
      <div className='galaxy-topbar'>
        <div className='date'>{today}</div>
        {user && (
          <div className='user-info'>
            <span className='welcome'>Welcome, {user.email}</span>
            <button onClick={handleLogout} className='btn-ghost'>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Center logo core */}
      <div className='galaxy-core'>
        <img src={logo} alt='MOD' className='galaxy-logo' />
        <h1 className='heading'>
          <span className='grad'>Home Galaxy</span>
        </h1>
        <p className='subheading'>Navigate modules across your firm’s universe</p>
      </div>

      {/* Module constellation */}
      <div className='module-grid' role='list'>
        {modules.map(m => (
          <div
            key={m.key}
            role='link'
            tabIndex={0}
            aria-label={`${m.label}. ${m.hint}`}
            className='node-card'
            onClick={() => goTo(m.key)}
            onKeyDown={e => onCardKey(e, m.key)}
          >
            <div className='card-border' />
            <div className='node-title'>{m.label}</div>
            <div className='node-hint'>{m.hint}</div>
            <div className='node-arrow' aria-hidden='true'>↗</div>
          </div>
        ))}
      </div>

      <footer className='galaxy-footer'>
        <small>© {new Date().getFullYear()} MOD-FS</small>
      </footer>
    </div>
  )
}

const styles = `
:root{
  --bg0:#030814;
  --bg1:#0a1124;
  --bg2:#0f1a36;
  --text:#eaf0ff;
  --muted:#a8b3cf;
  --primary:#7aa2ff;
  --accent:#b47cff;
  --glass:rgba(255,255,255,.06);
  --glass-border:rgba(255,255,255,.14);
  --shadow:0 10px 30px rgba(0,0,0,.5)
}

@media (prefers-color-scheme: light){
  :root{
    --bg0:#0a1124;
    --bg1:#121a33;
    --bg2:#1a2650;
    --text:#f4f7ff;
    --muted:#c7cfee;
    --glass:rgba(255,255,255,.08);
    --glass-border:rgba(255,255,255,.2)
  }
}

/* Shell */
.galaxy-container{
  min-height:100vh;
  background:
    radial-gradient(1000px 600px at 20% 10%, rgba(122,162,255,.18), transparent 60%),
    radial-gradient(800px 500px at 80% 20%, rgba(180,124,255,.14), transparent 55%),
    linear-gradient(180deg, var(--bg1), var(--bg0) 35%, var(--bg2) 100%);
  color:var(--text);
  padding: clamp(16px, 3.5vw, 32px);
  position:relative;
  overflow:hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'
}

/* Starfield (3 layers, parallax) */
.stars{
  position:fixed;
  inset:-40vh -40vw;
  pointer-events:none;
  z-index:0;
  opacity:.8;
  background-repeat:repeat
}

.layer-1{ background-image:
  radial-gradient(1px 1px at 30px 40px, #fff8 40%, transparent 41%),
  radial-gradient(1px 1px at 130px 90px, #bcd2ff7a 40%, transparent 41%),
  radial-gradient(2px 2px at 220px 160px, #fff6 40%, transparent 41%);
  background-size: 300px 300px
}
.layer-2{ background-image:
  radial-gradient(1px 1px at 60px 200px, #fff5 40%, transparent 41%),
  radial-gradient(1px 1px at 260px 120px, #d8c7ff66 40%, transparent 41%);
  background-size: 420px 420px
}
.layer-3{ background-image:
  radial-gradient(1px 1px at 140px 140px, #fff4 40%, transparent 41%),
  radial-gradient(1px 1px at 320px 280px, #b4c6ff55 40%, transparent 41%);
  background-size: 560px 560px
}

@media (prefers-reduced-motion: no-preference){
  .layer-1{ animation: drift1 120s linear infinite }
  .layer-2{ animation: drift2 180s linear infinite }
  .layer-3{ animation: drift3 240s linear infinite }
}
@keyframes drift1{ to{ transform: translate3d(300px,0,0) } }
@keyframes drift2{ to{ transform: translate3d(-300px,0,0) } }
@keyframes drift3{ to{ transform: translate3d(0,-300px,0) } }

/* Top bar */
.galaxy-topbar{
  position:sticky;
  top:0;
  display:flex;
  justify-content:flex-end;
  align-items:center;
  gap:12px;
  z-index:2;
  color:var(--muted);
  padding:4px 0
}
.galaxy-topbar .date{ font-size:.9rem }
.user-info{
  display:flex;
  align-items:center;
  gap:10px
}
.welcome{ font-size:.9rem }

.btn-ghost{
  appearance:none;
  border:1px solid var(--glass-border);
  background:transparent;
  color:var(--text);
  padding:6px 12px;
  border-radius:999px;
  font-weight:600;
  cursor:pointer;
  transition: background .2s ease, transform .2s ease, box-shadow .2s ease
}
.btn-ghost:hover{ background:rgba(255,255,255,.06); transform: translateY(-1px) }
.btn-ghost:focus-visible{ outline:2px solid var(--primary); outline-offset:3px }

/* Core */
.galaxy-core{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:10px;
  margin: clamp(40px, 8vw, 80px) 0 32px
}
.galaxy-logo{
  width:min(280px, 50vw);
  filter: drop-shadow(0 0 30px rgba(80,180,255,.9));
  animation: glowPulse 6s ease-in-out infinite
}
@keyframes glowPulse{
  0%,100%{ filter: drop-shadow(0 0 26px rgba(80,180,255,.9)) }
  50%{ filter: drop-shadow(0 0 44px rgba(120,200,255,1)) }
}
.heading{
  margin: 6px 0 0;
  font-size: clamp(22px, 4.2vw, 42px);
  letter-spacing:-.02em
}
.grad{
  background: linear-gradient(90deg, var(--primary), var(--accent));
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  text-shadow: 0 0 24px rgba(122,162,255,.25)
}
.subheading{
  margin: 0;
  color: var(--muted);
  text-align:center
}

/* Grid */
.module-grid{
  position:relative;
  z-index:1;
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: clamp(14px, 2.6vw, 24px);
  max-width: 1100px;
  margin: 0 auto
}

.node-card{
  position:relative;
  padding: 18px 18px 20px;
  background: linear-gradient(180deg, var(--glass), transparent 120%);
  border-radius: 16px;
  border:1px solid var(--glass-border);
  box-shadow: var(--shadow);
  text-align:left;
  cursor:pointer;
  transition: transform .22s ease, box-shadow .22s ease, background .22s ease
}
.node-card:hover{
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0,0,0,.55), 0 0 24px rgba(122,162,255,.25)
}
.node-card:active{ transform: translateY(-2px) }
.node-card:focus-visible{ outline:2px solid var(--primary); outline-offset:3px }

/* gradient border sheen */
.card-border{
  pointer-events:none;
  position:absolute;
  inset:-1px;
  border-radius: 16px;
  background: linear-gradient(120deg, rgba(122,162,255,.4), rgba(180,124,255,.35), rgba(122,162,255,.4));
  opacity:.0;
  transition: opacity .25s ease
}
.node-card:hover .card-border{ opacity:.35 }

.node-title{
  font-weight:800;
  font-size: 1.05rem;
  letter-spacing:.2px
}
.node-hint{
  margin-top:4px;
  font-size:.86rem;
  color:var(--muted)
}
.node-arrow{
  position:absolute;
  right:14px;
  bottom:12px;
  font-size: 1rem;
  color: #c6d3ffb8;
  transition: transform .22s ease, color .22s ease
}
.node-card:hover .node-arrow{ transform: translate(3px,-3px); color:#e9efff }

.galaxy-footer{
  position:relative;
  z-index:1;
  text-align:center;
  color:var(--muted);
  margin: 28px 0 6px
}

/* Motion safety */
@media (prefers-reduced-motion: reduce){
  .layer-1,.layer-2,.layer-3{ animation:none }
  .node-card,.btn-ghost,.node-arrow,.galaxy-logo{ transition: none }
}
`
