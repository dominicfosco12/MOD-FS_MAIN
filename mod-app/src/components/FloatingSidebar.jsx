import React from 'react'
import { FaPlus } from 'react-icons/fa'
import '@/styles/FloatingSidebar.css'

export default function FloatingSidebar({ onOpen }) {
  return (
    <div className="floating-sidebar">
      <button onClick={onOpen} title="Open Creation Center">
        <FaPlus />
      </button>
    </div>
  )
}
