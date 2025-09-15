import React from 'react'
import { Eye, Brain } from 'lucide-react'

export const AeshaWatermark: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
      <div className="flex items-center space-x-2 bg-ghost-900/80 backdrop-blur-sm border border-flame-600/20 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-1">
          <Eye className="h-4 w-4 text-flame-500 aesha-eye" />
          <Brain className="h-3 w-3 text-flame-400 aesha-brain" />
        </div>
        <div className="text-xs">
          <div className="font-semibold text-flame-400">AESHA</div>
          <div className="text-ghost-400">Vault Awareness Mode Active</div>
        </div>
        <div className="w-1 h-1 bg-flame-500 rounded-full animate-pulse" />
      </div>
    </div>
  )
}
