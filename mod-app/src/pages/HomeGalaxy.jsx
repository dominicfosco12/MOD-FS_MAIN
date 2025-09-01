// src/pages/HomeGalaxy.jsx
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
  FaChartPie, FaExchangeAlt, FaBolt,
  FaChartLine, FaCogs, FaBrain, FaDatabase, FaSlidersH
} from 'react-icons/fa'
import '../styles/HomeGalaxy.css'
import MODlogo from '../assets/MODlogo.png'

const PRIMARY = [
  { key: 'pms', title: 'MOD-PMS', hint: 'Portfolio Management System', icon: <FaChartPie />, variant: 'blue' },
  { key: 'oms', title: 'MOD-OMS', hint: 'Order Management System', icon: <FaExchangeAlt />, variant: 'violet' },
  { key: 'ems', title: 'MOD-EMS', hint: 'Execution Management System', icon: <FaBolt />, variant: 'teal' }
]

const SECONDARY = [
  { key: 'risk', title: 'MOD-RISK', hint: 'Risk & Analytics', icon: <FaChartLine />, variant: 'indigo' },
  { key: 'ops', title: 'MOD-OPS', hint: 'Operations & Reconciliation', icon: <FaCogs />, variant: 'orange' },
  { key: 'ai', title: 'MOD-AI', hint: 'AI & Predictive Insights', icon: <FaBrain />, variant: 'fuchsia' },
  { key: 'data', title: 'MOD-DATA', hint: 'Data Lake & Feeds', icon: <FaDatabase />, variant: 'cyan' },
  { key: 'config', title: 'MOD-CONFIG', hint: 'Configuration & Admin', icon: <FaSlidersH />, variant: 'amber' }
]

export default function HomeGalaxy() {
  const [email, setEmail] = useState('')
  const [today, setToday] = useState('')
  const [firm, setFirm] = useState('—')
  const [role, setRole] = useState('—')
  const nav = useNavigate()

  useEffect(() => {
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      const uid = u?.user?.id
      setEmail(u?.user?.email ?? '')
      setToday(new Date().toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      }))
      if (!uid) return

      const { data: userRow } = await supabase
        .from('users').select('firm_id').eq('id', uid).maybeSingle()
      const firmId = userRow?.firm_id

      if (firmId) {
        const { data: firmRow } = await supabase
          .from('firms').select('name').eq('id', firmId).maybeSingle()
        if (firmRow?.name) setFirm(firmRow.name)
      }

      let roleRow
      if (firmId) {
        const { data } = await supabase
          .from('user_roles').select('role_id').eq('user_id', uid).eq('firm_id', firmId).limit(1)
        roleRow = data?.[0]
      }
      if (!roleRow) {
        const { data } = await supabase
          .from('user_roles').select('role_id').eq('user_id', uid).limit(1)
        roleRow = data?.[0]
      }
      if (roleRow?.role_id) {
        const { data } = await supabase
          .from('roles').select('name').eq('id', roleRow.role_id).maybeSingle()
        if (data?.name) setRole(data.name)
      }
    })()
  }, [])

  function logout() {
    supabase.auth.signOut()
    nav('/login', { replace: true })
  }

  const go = key => nav(`/${key}`)

  return (
    <div className='hub-wrap'>
      <header className='hub-header'>
        <div className='brand-left'>
          <span className='brand-title'>{firm}</span>
        </div>
        <div />
        <div className='header-right'>
          <span className='date'>{today}</span>
          {email && (
            <>
              <span className='sep'>•</span>
              <span className='email'>{email}</span>
              {role && role !== '—' && (
                <>
                  <span className='sep'>|</span>
                  <span className='role'>{role}</span>
                </>
              )}
            </>
          )}
          <button className='btn btn-logout' onClick={logout}>Logout</button>
        </div>
      </header>

      <main className='hub-main'>
        <div className='logo-center'>
          <img src={MODlogo} alt='MOD logo' className='modlogo' />
        </div>

        <section className='primary-row primary-feature'>
          {PRIMARY.map(m => (
            <PrimaryCard key={m.key} data={m} onOpen={() => go(m.key)} />
          ))}
        </section>

        <section className='secondary-nav'>
          {SECONDARY.map(m => (
            <div
              key={m.key}
              className={`sec-pill pill-${m.variant}`}
              data-variant={m.variant}
              onClick={() => go(m.key)}
              role='link'
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(m.key)}
            >
              <span className='pill-ico'>{m.icon}</span>
              <div className='pill-text'>
                <div className='sp-title'>{m.title}</div>
                <div className='sp-hint'>{m.hint}</div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

function PrimaryCard({ data, onOpen }) {
  const cardRef = useRef(null)

  const onMove = e => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const px = x / r.width - 0.5
    const py = y / r.height - 0.5
    el.style.setProperty('--rx', `${-py * 8}deg`)
    el.style.setProperty('--ry', `${px * 12}deg`)
    el.style.setProperty('--mx', `${px}`)
    el.style.setProperty('--my', `${py}`)
  }

  const reset = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--mx', '0')
    el.style.setProperty('--my', '0')
  }

  return (
    <article
      ref={cardRef}
      className={`primary-card ep ${data.variant}`}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onFocus={reset}
      onClick={onOpen}
      role='link'
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      aria-label={`${data.title}. ${data.hint}`}
      style={{ transform: `rotateX(var(--rx)) rotateY(var(--ry))` }}
    >
      <div className='border-anim' />
      <div className='glow' />
      <div className='shine' />
      <div className='sparkles'><i /><i /><i /><i /><i /></div>

      <div className='icon'>{data.icon}</div>
      <h2 className='pc-title'>{data.title}</h2>
      <p className='pc-hint'>{data.hint}</p>
      <span className='arrow'>↗</span>
    </article>
  )
}
