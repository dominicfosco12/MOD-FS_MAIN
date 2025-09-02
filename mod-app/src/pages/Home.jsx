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

export default function Home() {
  const [email, setEmail] = useState('')
  const [today, setToday] = useState('')
  const [firmName, setFirmName] = useState('—')
  const [firmId, setFirmId] = useState(null)
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
        if (firmRow?.name) {
          setFirmName(firmRow.name)
          setFirmId(firmId)
        }
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

  const logout = () => {
    supabase.auth.signOut()
    nav('/login', { replace: true })
  }

  const go = key => nav(`/${key}`)

  return (
    <div className='hub-wrap'>
      <header className='hub-header'>
        <div className='brand-left'>
          <span className='brand-title'>{firmName}</span>
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

          <div className='profile-dropdown'>
            <img src={avatar} alt='User' className='avatar' />
            <div className='dropdown-menu'>
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

        <section className='orbit-layout'>
          {PRIMARY.map((m, i) => (
            <div key={m.key} className={`orbit-pos orbit-${i}`}>
              <PrimaryCard data={m} onOpen={() => go(m.key)} />
            </div>
          ))}
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
