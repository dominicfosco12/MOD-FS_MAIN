import React, { useState } from 'react'
import '@/styles/WheelMenu.css'
import { FaCogs, FaUserFriends, FaTools, FaRocket, FaBrain, FaChartBar, FaDatabase } from 'react-icons/fa'

const categories = [
  { key: 'org', label: 'MOD-ORG', icon: <FaUserFriends />, tools: ['Users', 'Roles', 'Integrations'] },
  { key: 'config', label: 'MOD-CONFIG', icon: <FaTools />, tools: ['Portfolios', 'Accounts', 'Models'] },
  { key: 'invest', label: 'MOD-INVEST', icon: <FaRocket />, tools: ['Rebalance', 'Trade', 'Orders'] },
  { key: 'data', label: 'MOD-DATA', icon: <FaDatabase />, tools: ['Securities', 'Feeds'] },
  { key: 'ai', label: 'MOD-AI', icon: <FaBrain />, tools: ['Ask MOD'] },
  { key: 'report', label: 'MOD-REPORT', icon: <FaChartBar />, tools: ['Reports'] }
]

export default function WheelMenu({ onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const radius = 120

  return (
    <div className="wheel-menu">
      <button className="center-btn" onClick={() => setExpanded(prev => !prev)}>
        <FaCogs />
      </button>

      {expanded && (
        <div className="wheel-items">
          {categories.map((cat, i) => {
            const angle = (360 / categories.length) * i
            const x = radius * Math.cos((angle * Math.PI) / 180)
            const y = radius * Math.sin((angle * Math.PI) / 180)
            return (
              <div
                key={cat.key}
                className="wheel-item"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                onClick={() => onSelect(cat.key)}
                title={cat.label}
              >
                <div className="icon">{cat.icon}</div>
                <span className="label">{cat.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
