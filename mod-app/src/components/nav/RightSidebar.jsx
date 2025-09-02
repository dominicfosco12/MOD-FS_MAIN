// src/components/nav/RightSidebar.jsx
import React from 'react'
import {
  FaUserShield, FaTools, FaRobot,
  FaChartBar, FaDatabase, FaRocket
} from 'react-icons/fa'

import '@/styles/RightSidebar.css'

const MODULES = [
  { key: 'org', label: 'MOD-ORG', icon: <FaUserShield />, path: '/org' },
  { key: 'config', label: 'MOD-CONFIG', icon: <FaTools />, path: '/config' },
  { key: 'ai', label: 'MOD-AI', icon: <FaRobot />, path: '/ai' },
  { key: 'report', label: 'MOD-REPORT', icon: <FaChartBar />, path: '/report' },
  { key: 'data', label: 'MOD-DATA', icon: <FaDatabase />, path: '/data' },
  { key: 'invest', label: 'MOD-INVEST', icon: <FaRocket />, path: '/invest' }
]

export default function RightSidebar({ onNavigate }) {
  return (
    <div className='right-sidebar'>
      {MODULES.map(mod => (
        <button
          key={mod.key}
          className='sidebar-item'
          onClick={() => onNavigate(mod.path)}
          title={mod.label}
        >
          <div className='icon'>{mod.icon}</div>
          <span className='label'>{mod.label}</span>
        </button>
      ))}
    </div>
  )
}
