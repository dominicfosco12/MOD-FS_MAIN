import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { FaChartPie, FaExchangeAlt, FaBolt } from 'react-icons/fa'
import SpaceBackground from '../components/SpaceBackground'
import logo from '../assets/logo.png'
import '../styles/HomeGalaxy.css'

const PRIMARY = [
  { key: 'pms', title: 'MOD-PMS', hint: 'Portfolio Management System', variant: 'blue',  icon: <FaChartPie /> },
  { key: 'oms', title: 'MOD-OMS', hint: 'Order Management System',   variant: 'violet', icon: <FaExchangeAlt /> },
  { key: 'ems', title: 'MOD-EMS', hint: 'Execution Management System',variant: 'teal',  icon: <FaBolt /> }
]

const SECONDARY = [
  { key: 'risk',   title: 'MOD-RISK',   hint: 'Risk & Analytics' },
  { key: 'ops',    title: 'MOD-OPS',    hint: 'Operations & Reconciliation' },
  { key: 'ai',     title: 'MOD-AI',     hint: 'AI & Predictive Insights' },
  { key: 'data',   title: 'MOD-DATA',   hint: 'Data Lake & Feeds' },
  { key: 'config', title: 'MOD-CONFIG', hint: 'Configuration & Admin' }
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
      setToday(
        new Date().toLocaleDateString(undefined, {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        })
      )
      if (!uid) return
      // firm
      const { data: userRow } = await supabase
        .from('users').select('firm_id').eq('id', uid).maybeSingle()
      const firmId = userRow?.firm_id
      if (firmId) {
        const { data: firmRow } = await supabase
          .from('firms').select('name').eq('id', firmId).maybeSingle()
        if (firmRow?.name) setFirm(firmRow.name)
      }
      // role (prefer firm)
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

  async function logout() {
    await supabase.auth.signOut()
    nav('/login', { replace: true })
  }

  const go = key => nav(`/${key}`)

  return (
    <div className='hub-wrap'>
      <SpaceBackground />

      {/* Header: glass dock (logo+firm left, tagline center, user/date right) */}
      <header className='hub-header'>
        <div className='brand-left'>
          <img src={logo} alt='MOD' className='brand-logo' />
          <span className='brand-title'>{firm}</span>
        </div>

        <div className='header-center'>
        </div>

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

      {/* Main */}
      <main className='hub-main'>
        <section className='primary-row primary-feature'>
          {PRIMARY.map(m => (
            <PrimaryCard key={m.key} data={m} onOpen={() => go(m.key)} />
          ))}
        </section>

        <section className='secondary-nav'>
          {SECONDARY.map(m => (
            <div
              key={m.key}
              className='sec-pill'
              onClick={() => go(m.key)}
              role='link'
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(m.key)}
            >
              <div className='sp-title'>{m.title}</div>
              <div className='sp-hint'>{m.hint}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

/** Fancy primary card (micro-tilt, shine, sparkles) */
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
