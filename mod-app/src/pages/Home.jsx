import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/services/supabaseClient'

import avatar from '@/assets/avatar.png'

import FirmChat from '@/components/FirmChat'

import {
  FaChartPie, FaExchangeAlt, FaBolt,
  FaChartLine, FaCogs
} from 'react-icons/fa'

import '@/styles/Home.css'

const PRIMARY = [
  { key: 'pms', title: 'MOD-PMS', hint: 'Portfolio Management System', icon: <FaChartPie />, variant: 'glass' },
  { key: 'oms', title: 'MOD-OMS', hint: 'Order Management System', icon: <FaExchangeAlt />, variant: 'glass' },
  { key: 'ems', title: 'MOD-EMS', hint: 'Execution Management System', icon: <FaBolt />, variant: 'glass' },
]


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
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [today, setToday] = useState('')
  const [firmName, setFirmName] = useState('—')
  const [firmId, setFirmId] = useState(null)
  const [role, setRole] = useState('—')
  const [focusedModule, setFocusedModule] = useState(null)

  const nav = useNavigate()

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      const authedEmail = u?.user?.email || ''
      if (isMounted) setEmail(authedEmail)

      const resp = await supabase
        .from('users')
        .select(`
          firm_id,
          firm:firm_id ( name ),
          user_roles (
            role:role_id ( name )
          )
        `)
        .eq('email', authedEmail)
        .single()

      if (resp?.data && isMounted) {
        setFirmId(resp.data.firm_id || null)
        setFirmName(resp.data.firm?.name || '—')
        setRole(resp.data.user_roles?.[0]?.role?.name || '—')
      }

      const d = new Date()
      if (isMounted) {
        setToday(d.toLocaleDateString(undefined, {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        }))
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) nav('/login', { replace: true })
  }

  return (
    <div className='hub-wrap'>
      <header className='hub-header'>
        <div className='header-left'>
          <span className='firm-name'>{firmName}</span>
          <span className='today-date'>{today}</span>
        </div>

        <div className='header-right'>
          <div className='profile'>
            <img src={avatar} alt='user' className='avatar' />
            <div className='profile-info'>
              <div className='email'>{email}</div>
              <div className='role'>{role}</div>
            </div>
            <div className='profile-actions'>
              <button onClick={() => nav('/settings')}>Settings</button>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className='hub-main'>
        <section className="core-grid">
  {PRIMARY.filter(m => ['pms', 'oms', 'ems'].includes(m.key)).map((m) => (
    <div key={m.key} className="core-cell">
      <PrimaryCard
        data={m}
        onOpen={() => setFocusedModule(m)}
        isActive={focusedModule?.key === m.key}
      />

    {focusedModule?.key === m.key && (
      <div className="tray-wrapper">
        <div className="inline-tools-tray">
          <div className="tools-links">
            {TOOLS_BY_MODULE[m.key]?.map((tool) => (
              <Link
                key={tool.label}
                to={tool.route}
                className="tool-link"
                onClick={() => setFocusedModule(null)}
              >
                {tool.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )}

    </div>
  ))}
</section>

        {firmId && (
          <div className='chat-wrapper'>
            <FirmChat firmId={firmId} />
          </div>
        )}

        {focusedModule && (
          <div className='module-modal' onClick={() => setFocusedModule(null)}>
            <div className='modal-content' onClick={e => e.stopPropagation()}>
              <div className='icon-lg'>{focusedModule.icon}</div>
              <h2>{focusedModule.title}</h2>
              <p className='modal-sub'>{focusedModule.hint}</p>

              <div className='modal-links'>
                {TOOLS_BY_MODULE[focusedModule.key]?.map(t => (
                  <Link
                    key={t.label}
                    to={t.route}
                    className='tool-link'
                    onClick={() => setFocusedModule(null)}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>

              <button className='modal-close' onClick={() => setFocusedModule(null)}>Close</button>
            </div>
          </div>
        )}
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
      className={`primary-card ${data.variant}`}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onOpen}
      role='button'
      tabIndex={0}
      title={data.hint}
      style={{ transform: `rotateX(var(--rx)) rotateY(var(--ry))` }}
    >
      <div className='icon'>{data.icon}</div>
      <h2 className='pc-title'>{data.title}</h2>
      <p className='pc-hint'>{data.hint}</p>
      <span className='arrow'>↗</span>
    </article>
  )
}
