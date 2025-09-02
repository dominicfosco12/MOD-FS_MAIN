import React from 'react'
import '@/styles/SideModuleRail.css'

import {
  FaUserShield, FaCogs, FaBrain, FaChartBar,
  FaDatabase, FaRocket
} from 'react-icons/fa'

const SIDE_MODULES = [
  { key: 'org', label: 'MOD-ORG', icon: <FaUserShield /> },
  { key: 'config', label: 'MOD-CONFIG', icon: <FaCogs /> },
  { key: 'ai', label: 'MOD-AI', icon: <FaBrain /> },
  { key: 'report', label: 'MOD-REPORT', icon: <FaChartBar /> },
  { key: 'data', label: 'MOD-DATA', icon: <FaDatabase /> },
  { key: 'invest', label: 'MOD-INVEST', icon: <FaRocket /> }
]

export default function SideModuleRail() {
  const open = key => {
    console.log('Open module:', key)
    // TODO: implement real navigation or modal
  }

  return (
    <div className="side-module-rail">
      {SIDE_MODULES.map(mod => (
        <button key={mod.key} className="side-button" onClick={() => open(mod.key)}>
          <span className="icon">{mod.icon}</span>
          <span className="label">{mod.label}</span>
        </button>
      ))}
    </div>
  )
}
