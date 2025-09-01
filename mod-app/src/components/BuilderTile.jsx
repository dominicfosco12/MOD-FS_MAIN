import React from 'react'
import "@/styles/BuilderTile.css"

export default function BuilderTile({ title, description, icon, onClick }) {
  return (
    <div className='builder-tile' onClick={onClick} role='button' tabIndex={0}>
      <div className='tile-icon'>{icon}</div>
      <div className='tile-title'>{title}</div>
      <div className='tile-desc'>{description}</div>
    </div>
  )
}
