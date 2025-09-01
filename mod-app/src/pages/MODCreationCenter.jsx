import React, { useState } from 'react'
import '../styles/MODCreationCenter.css'
import BuilderTile from '../components/BuilderTile'

// Import modal shells (create these next)
import NewPortfolioModal from '../components/modals/NewPortfolioModal'
import NewAccountModal from '../components/modals/NewAccountModal'

const TILE_CONFIGS = [
  {
    key: 'portfolio',
    title: 'New Portfolio',
    description: 'Create a new investment portfolio',
    icon: '📈',
    modal: 'portfolio'
  },
  {
    key: 'account',
    title: 'New Account',
    description: 'Add a new account for trading or custody',
    icon: '🏦',
    modal: 'account'
  },
  // Add more tiles here: integration, report, etc.
]

export default function MODCreationCenter() {
  const [activeModal, setActiveModal] = useState(null)

  return (
    <div className='mod-create-wrap'>
      <h1 className='create-header'>MOD Creation Center</h1>

      <div className='tile-grid'>
        {TILE_CONFIGS.map(tile => (
          <BuilderTile
            key={tile.key}
            title={tile.title}
            description={tile.description}
            icon={tile.icon}
            onClick={() => setActiveModal(tile.modal)}
          />
        ))}
      </div>

      {/* Modals */}
      {activeModal === 'portfolio' && (
        <NewPortfolioModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'account' && (
        <NewAccountModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  )
}
