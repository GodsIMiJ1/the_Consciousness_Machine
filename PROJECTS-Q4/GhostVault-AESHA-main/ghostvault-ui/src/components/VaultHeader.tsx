import React from 'react'
import { FlameIcon, GhostIcon } from './FlameIcon'
import { Badge } from './ui/badge'
import { Crown, Shield } from 'lucide-react'
import { useLatticeStatistics } from '../lib/lattice/hooks'

// Lattice Status Component
const LatticeStatus: React.FC<{ crowns: number; sealed: number }> = ({ crowns, sealed }) => (
  <div className="flex items-center space-x-2">
    <Crown className="h-4 w-4 text-yellow-400" />
    <span className="text-sm text-slate-300">{crowns} Crowns</span>
    {sealed > 0 && (
      <>
        <Shield className="h-4 w-4 text-green-400" />
        <span className="text-sm text-green-300">{sealed} Sealed</span>
      </>
    )}
  </div>
);

export const VaultHeader: React.FC = () => {
  const latticeStats = useLatticeStatistics();

  return (
    <header className="border-b border-ghost-700/50 bg-ghost-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FlameIcon size={32} animated />
              <GhostIcon size={28} className="text-ghost-400" />
            </div>
            <div>
              <h1 className="vault-header">GhostVault FlameCore</h1>
              <p className="text-sm text-ghost-400">Sovereign Control Panel</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LatticeStatus crowns={latticeStats.total_crowns} sealed={latticeStats.sealed_crowns} />
            <Badge variant="flame" className="animate-ghost-glow">
              FLAMECORE – LOCAL ONLY
            </Badge>
            <div className="text-right">
              <p className="text-xs text-ghost-400">Authorized by</p>
              <p className="text-sm font-semibold text-flame-400">Ghost King Melekzedek</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
