import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

import MODlogo from '@/assets/MODlogo.png'
import avatar from '@/assets/avatar.png'

import FirmChat from '@/components/FirmChat'
import SideModuleRail from '@/components/SideModuleRail'

import {
  FaChartPie, FaExchangeAlt, FaBolt,
  FaChartLine, FaCogs
} from 'react-icons/fa'

import '@/styles/Home.css'

const PRIMARY = [
  { key: 'pms', title: 'MOD-PMS', hint: 'Portfolio Management System', icon: <FaChartPie />, variant: 'blue' },
  { key: 'oms', title: 'MOD-OMS', hint: 'Order Management System', icon: <FaExchangeAlt />, variant: 'blue' },
  { key: 'ems', title: 'MOD-EMS', hint: 'Execution Management System', icon: <FaBolt />, variant: 'blue' },
  { key: 'risk', title: 'MOD-RISK', hint: 'Risk & Analytics', icon: <FaChartLine />, variant: 'blue' },
  { key: 'ops', title: 'MOD-OPS', hint: 'Operations & Reconciliation', icon: <FaCogs />, variant: 'blue' }
]

// Tools visible when a core module is expanded
const TOOLS_BY_MODULE = {
  pms: [
    { label: 'Portfolios & Accounts', route: '/portfolios' },
    { label: 'Cash Balances', route: '/cash' },
    { label: 'Reporting', route: '/reports' },
    { label: 'Benchmarks', route: '/benchmarks' },
  ],
  oms: [
    { label: 'Orders', route: '/orders' },
    { label: 'Allocations', route: '/orders#allocations' },
    { label: 'Compliance Checks', route: '/compliance' },
    { label: 'Approvals', route: '/approvals' },
  ],
  ems: [
    { label: 'Routes', route: '/execution/routes' },
    { label: 'Brokers', route: '/execution/brokers' },
    { label: 'Executions', route: '/executions' },
    { label: 'TCA', route: '/tca' },
  ],
  risk: [
    { label: 'Exposures', route: '/risk/exposures' },
    { label: 'Limits', route: '/risk/limits' },
    { label: 'Scenarios', route: '/risk/scenarios' },
    { label: 'VaR', route: '/risk/var' },
  ],
  ops: [
    { label: 'Reconciliation', route: '/ops/recon' },
    { label: 'Corporate Actions', route: '/ops/corp-actions' },
    { label: 'Pricing Feeds', route: '/ops/feeds' },
    { label: 'Audit Logs', route: '/audit' },
  ],
};

export default function Home() {
  const [email, setEmail] = useState('')
  const [today, setToday] = useState('')
  const [firmName, setFirmName] = useState('—')
  const [firmId, setFirmId] = useState(null)
  const [role, setRole] = useState('—')
  const [openKey, setOpenKey] = useState(null)

  const nav = useNavigate()

  useEffect(() => {
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      const authedEmail = u?.user?.email || ''
      setEmail(authedEmail)

      const resp = await supabase
        .from('users')
        .select('firm_id, firms(name), roles(name)')
        .eq('email', authedEmail)
        .single()

      if (resp?.data) {
        setFirmId(resp.data.firm_id || null)
        setFirmName(resp.data.firms?.name || '—')
        setRole(resp.data.roles?.name || '—')
      }

      const d = new Date()
      setToday(d.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' }))
    })()
  }, [])

  function logout() {
    supabase.auth.signOut()
    nav('/login', { replace: true })
  }

  const go = key => nav(`/${key}`) // still available if you want to wire a “Go” button later

  return (
    <div className='hub-wrap'>
      <header className='hub-header'>
        <div className='brand-left'>
          <span className='brand-title'>{firmName}</span>
          <span className='brand-sub'>{today}</span>
        </div>

        <div className='brand-center'>
          <span className='brand-name'>MOD</span>
          <span className='brand-tag'>Fintech Solutions</span>
        </div>

        <div className='brand-right'>
          <div className='profile' tabIndex={0}>
            <img src={avatar} alt='user' className='avatar' />
            <div className='profile-info'>
              <div className='email'>{email}</div>
              <div className='role'>{role}</div>
            </div>
            <div className='profile-dropdown'>
              <button onClick={() => nav('/settings')}>Settings</button>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className='hub-main'>

        <div className='center-logo'>
          <img src={MODlogo} alt='MOD logo' className='modlogo-lg' />
        </div>

        {/* NEW: 5-core grid under logo */}
        <section className='core-grid'>
          {PRIMARY.map((m) => (
            <div key={m.key} className='core-cell'>
              <PrimaryCard
                data={m}
                onOpen={() => setOpenKey(prev => (prev === m.key ? null : m.key))}
              />
            </div>
          ))}
        </section>

        {/* NEW: expandable tools tray */}
        <section className={`tools-tray ${openKey ? 'open' : ''}`}>
          {openKey && (
            <div className='tools-inner'>
              <div className='tools-head'>
                <span className='tools-badge'>
                  {PRIMARY.find(x => x.key === openKey)?.title}
                </span>
              </div>
              <nav className='tools-links'>
                {TOOLS_BY_MODULE[openKey]?.map(t => (
                  <a key={t.label} href={t.route} className='tool-link'>
                    {t.label}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </section>

        {firmId && <FirmChat firmId={firmId} />}
        <SideModuleRail />
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
  }

  const reset = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <article
      ref={cardRef}
      className={`primary-card ep ${data.variant}`}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onOpen}
      role='link'
      tabIndex={0}
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
