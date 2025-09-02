import { useState } from 'react'
import '@/styles/WheelMenu.css'
import {
  FaBriefcase, FaUser, FaDatabase, FaUsers,
  FaFileAlt, FaCogs, FaLock, FaHandshake, FaPlus
} from 'react-icons/fa'

const innerRing = [
  { icon: <FaBriefcase />, label: 'Portfolio', action: () => alert('Create Portfolio') },
  { icon: <FaUser />, label: 'Account', action: () => alert('Create Account') },
  { icon: <FaDatabase />, label: 'Security', action: () => alert('Create Security') },
  { icon: <FaUsers />, label: 'User', action: () => alert('Create User') }
]

const outerRing = [
  { icon: <FaFileAlt />, label: 'Report', action: () => alert('Create Report') },
  { icon: <FaHandshake />, label: 'Counterparty', action: () => alert('Create Counterparty') },
  { icon: <FaCogs />, label: 'Integration', action: () => alert('Create Integration') },
  { icon: <FaLock />, label: 'Permissions', action: () => alert('Create Permissions') }
]

export default function WheelMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className='wheel-container'>
      {[...innerRing, ...outerRing].map((opt, i) => {
        const total = 8
        const angle = (i / total) * Math.PI * 2 // full circle
        const radius = i < 4 ? 90 : 140 // inner vs outer ring
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        return (
          <div
            key={opt.label}
            className={`wheel-option ${open ? 'show' : ''}`}
            style={{
              transform: `translate(${x}px, ${-y}px)`
            }}
            onClick={opt.action}
          >
            <div className='wheel-icon'>{opt.icon}</div>
            <span className='wheel-label'>{opt.label}</span>
          </div>
        )
      })}

      <button className='wheel-toggle' onClick={() => setOpen(prev => !prev)}>
        <FaPlus />
      </button>
    </div>
  )
}
