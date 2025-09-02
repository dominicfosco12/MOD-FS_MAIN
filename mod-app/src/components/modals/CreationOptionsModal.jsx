import React from 'react'
import {
  FaFolderPlus,
  FaUserPlus,
  FaFileAlt,
  FaPlug,
  FaKey
} from 'react-icons/fa'

import '@/styles/CreationOptionsModal.css'

export default function CreationOptionsModal({ onClose }) {
  const options = [
    { label: 'New Portfolio', key: 'portfolio', icon: <FaFolderPlus /> },
    { label: 'New Account', key: 'account', icon: <FaUserPlus /> },
    { label: 'New Report', key: 'report', icon: <FaFileAlt /> },
    { label: 'New Integration', key: 'integration', icon: <FaPlug /> },
    { label: 'New Permission Bundle', key: 'permissions', icon: <FaKey /> }
  ]

  return (
    <>
      <div className='creation-backdrop' onClick={onClose} />
      <div className='creation-panel slide-in'>
        <div className='creation-header'>
          <h2>Create New</h2>
          <button className='close-btn' onClick={onClose}>×</button>
        </div>
        <div className='creation-options'>
          {options.map(opt => (
            <div key={opt.key} className='creation-option'>
              <span className='option-icon'>{opt.icon}</span>
              <span className='option-label'>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
