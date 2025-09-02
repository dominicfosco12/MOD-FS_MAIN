import { useState } from 'react'
import { FaPlus, FaUser, FaBriefcase, FaDatabase, FaLock } from 'react-icons/fa'
import '@/styles/CreationWheel.css'

const MENU_ITEMS = [
  { icon: <FaBriefcase />, label: 'Portfolio', angle: -45, action: 'portfolio' },
  { icon: <FaUser />, label: 'Account', angle: -135, action: 'account' },
  { icon: <FaDatabase />, label: 'Security', angle: 135, action: 'security' },
  { icon: <FaLock />, label: 'Permissions', angle: 45, action: 'permissions' }
]

export default function CreationWheel({ onSelect }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="creation-wheel">
      <button className="center-btn" onClick={() => setOpen(!open)}>
        <FaPlus />
      </button>

      <div className={`menu ${open ? 'open' : ''}`}>
        {MENU_ITEMS.map(({ icon, angle, action, label }, i) => {
          const radius = 80
          const rad = angle * (Math.PI / 180)
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius

          return (
            <div
              key={action}
              className="menu-item"
              title={label}
              style={{
                transform: open
                  ? `translate(${x}px, ${y}px)`
                  : 'translate(0, 0)',
                transitionDelay: `${i * 0.05}s`
              }}
              onClick={() => {
                setOpen(false)
                onSelect?.(action)
              }}
            >
              {icon}
            </div>
          )
        })}
      </div>
    </div>
  )
}
