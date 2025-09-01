import React from 'react'
import '../../styles/Modal.css'

export default function NewAccountModal({ onClose }) {
  return (
    <div className='modal-backdrop'>
      <div className='modal-box'>
        <h2>Create New Account</h2>
        <p>This will eventually be a multi-step builder form.</p>
        <button className='btn-close' onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
