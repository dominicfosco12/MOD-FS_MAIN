import React, { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { FaChartPie, FaExchangeAlt, FaBolt } from 'react-icons/fa'
import SpaceBackground from '../components/SpaceBackground'
import logo from '../assets/logo.png'
import '../styles/HomeGalaxy.css'

const PRIMARY = [
  { key: 'pms', title: 'MOD-PMS', hint: 'Portfolio Management System', variant: 'blue', icon: <FaChartPie /> },
  { key: 'oms', title: 'MOD-OMS', hint: 'Order Management System', variant: 'violet', icon: <FaExchangeAlt /> },
  { key: 'ems', title: 'MOD-EMS', hint: 'Execution Management System', variant: 'teal', icon: <FaBolt /> }
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

      // Firm: users.firm_id -> firms.name
      let firmId = null
      const { data: userRow } = await supabase
        .from('users')
        .select('firm_id')
        .eq('id', uid)
        .maybeSingle()
      firmId = userRow?.firm_id ?? null

      if (firmId) {
        const { data: firmRow } = await supabase
          .from('firms')
          .select('name')
          .eq('id', firmId)
          .maybeSingle()
        if (firmRow?.name) setFirm(firmRow.name)
      }

      // Role: user_roles(role_id) -> roles.name (prefer same firm)
      let roleRow
      if (firmId) {
        const { data: r1 } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', uid)
          .eq('firm_id', firmId)
          .limit(1)
        roleRow = r1?.[0]
      }
      if (!roleRow) {
        const { data: rAny } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', uid)
          .limit(1)
        roleRow = rAny?.[0]
      }
      const roleId = roleRow?.role_id
      if (roleId) {
        const { data: roleTbl } = await supabase
          .from('roles')
          .select('name')
          .eq('id', roleId)
          .maybeSingle()
        if (roleTbl?.name) setRole(roleTbl.name)
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

      {/* header: logo left, meta/actions right */}
      <header className='hub-header'>
        <div className='brand-left'>
          <img src={logo} alt='MOD' className='brand-logo' />
        </div>

        <div className='header-right'>
          <div className='meta'>
            <span className='firm'>{firm}</span>
            <span className='sep'>|</span>
            <span className='date'>{today}</span>
          </div>
          <div className='actions'>
            {email && (
              <>
                <span className='email'>{email}</span>
                {role && role !== '—' && (
                  <>
                    <span className='sep'>|</span>
                    <span className='role'>{role}</span>
                  </>
                )}
              </>
            )}
            <button className='btn btn-logout' onClick={logout} title='Logout'>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* main */}
      <main className='hub-main'>
        <p className='tagline'>Automation • Connectivity • Performance</p>

        <section className='primary-row primary-feature'>
          {PRIMARY.map(m => (
            <article
              key={m.key}
              className={`primary-card ${m.variant}`}
              onClick={() => go(m.key)}
              role='link'
              tabIndex={0}
              aria-label={`${m.title}. ${m.hint}`}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(m.key)}
            >
              <div className='glow' />
              <div className='icon'>{m.icon}</div>
              <h2 className='pc-title'>{m.title}</h2>
              <p className='pc-hint'>{m.hint}</p>
              <span className='arrow'>↗</span>
            </article>
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
