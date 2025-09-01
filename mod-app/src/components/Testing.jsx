import React from 'react'
import '../styles/Testing.css'
import { FaBolt, FaCloud, FaChargingStation } from 'react-icons/fa'

const lightningModules = [
  { title: 'Energy Core', hint: 'Dynamic Flux Engine', icon: <FaBolt /> },
  { title: 'Storm Ops', hint: 'Real-time Risk Tracker', icon: <FaCloud /> },
  { title: 'Charge Hub', hint: 'Execution Uplink System', icon: <FaChargingStation /> }
]

export default function Testing() {
  return (
    <div className='testing-wrapper lightning'>
      <h2 className='test-heading'>⚡ Lightning Module Preview</h2>
      <div className='test-grid'>
        {lightningModules.map((mod, i) => (
          <LightningCard key={i} {...mod} />
        ))}
      </div>
    </div>
  )
}

function LightningCard({ icon, title, hint }) {
  return (
    <div className='card-lightning'>
      <div className='card-icon'>{icon}</div>
      <div className='card-title'>{title}</div>
      <div className='card-hint'>{hint}</div>
    </div>
  )
}
