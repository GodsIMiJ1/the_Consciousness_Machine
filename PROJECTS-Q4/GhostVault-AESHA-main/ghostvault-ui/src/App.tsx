import { useState } from 'react'
import { VaultHeader } from './components/VaultHeader'
import { VaultHealth } from './components/VaultHealth'
import { StorageViewer } from './components/StorageViewer'
import { DatabaseInspector } from './components/DatabaseInspector'
import { SystemConfig } from './components/SystemConfig'
import { AeshaInterface, AeshaButton } from './components/AeshaInterface'
import { AeshaWatermark } from './components/AeshaWatermark'
import LatticeViewer from './components/lattice/LatticeViewer'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import {
  LayoutDashboard,
  Database,
  HardDrive,
  Settings,
  Shield,
  Flame,
  Navigation
} from 'lucide-react'

type TabType = 'dashboard' | 'storage' | 'database' | 'config' | 'lattice'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [isAeshaOpen, setIsAeshaOpen] = useState(false)

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'storage' as TabType, label: 'Storage', icon: HardDrive },
    { id: 'database' as TabType, label: 'Database', icon: Database },
    { id: 'lattice' as TabType, label: 'Memory Lattice', icon: Navigation },
    { id: 'config' as TabType, label: 'Config', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <VaultHealth />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <StorageViewer />
              </div>
              <div className="space-y-6">
                <DatabaseInspector />
              </div>
            </div>
          </div>
        )
      case 'storage':
        return <StorageViewer />
      case 'database':
        return <DatabaseInspector />
      case 'lattice':
        return <LatticeViewer />
      case 'config':
        return <SystemConfig />
      default:
        return <VaultHealth />
    }
  }

  return (
    <div className="min-h-screen bg-ghost-900">
      <VaultHeader />

      {/* AESHA Interface */}
      <AeshaInterface
        isOpen={isAeshaOpen}
        onClose={() => setIsAeshaOpen(false)}
      />

      {/* AESHA Button */}
      {!isAeshaOpen && (
        <AeshaButton onClick={() => setIsAeshaOpen(true)} />
      )}

      {/* AESHA Watermark */}
      <AeshaWatermark />

      {/* Navigation Tabs */}
      <div className="border-b border-ghost-700/50 bg-ghost-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? 'flame' : 'ghost'}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-none border-b-2 ${
                      isActive
                        ? 'border-flame-500 bg-flame-600/10'
                        : 'border-transparent hover:border-ghost-600'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Button>
                )
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <Badge variant="flame" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>SOVEREIGN MODE</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Flame className="h-3 w-3" />
                <span>v0.1</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-ghost-700/50 bg-ghost-900/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Flame className="h-4 w-4 text-flame-500" />
                <span className="text-sm font-semibold text-flame-400">GhostVault FlameCore</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Local Infrastructure Only
              </Badge>
            </div>

            <div className="text-right">
              <p className="text-xs text-ghost-400">
                Built with 🔥 by the GodsIMiJ Empire
              </p>
              <p className="text-xs text-ghost-500">
                Authorized by Ghost King Melekzedek • Overseen by Omari
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
