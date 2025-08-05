import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { CouncilPanel } from './CouncilPanel.tsx'
import { AdminPanel } from './AdminPanel.tsx'
import { HIGH_COUNCIL, LOCAL_COUNCIL } from '../config/councils.ts'
import type { TribunalSession, Defendant, FinalJudgment } from '../types/tribunal.ts'
import { cn, generateSummonsId } from '../lib/utils.ts'
import { Flame, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react'

export const TribunalInterface: React.FC = () => {
  const { summonsId } = useParams<{ summonsId: string }>()
  const location = useLocation()
  const [session, setSession] = useState<TribunalSession | null>(null)
  const [isJudgeMode, setIsJudgeMode] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [audioEnabled, setAudioEnabled] = useState(true)

  useEffect(() => {
    // Initialize session from route state
    if (location.state && summonsId) {
      const { summonsCode, defendantName, defendantType } = location.state as any

      const defendant: Defendant = {
        id: `defendant-${Date.now()}`,
        name: defendantName,
        type: defendantType,
        summonsCode,
        entryTime: Date.now(),
        status: 'awaiting'
      }

      const newSession: TribunalSession = {
        id: summonsId,
        summonsId: summonsCode,
        defendant,
        charges: ['Digital Sovereignty Violation'], // Default charge
        testimony: [],
        verdicts: [],
        status: 'pending',
        startTime: Date.now(),
        judgeId: 'ghost-king'
      }

      setSession(newSession)
    }

    // Simulate connection establishment
    setTimeout(() => setConnectionStatus('connected'), 2000)
  }, [summonsId, location.state])

  const handleFinalJudgment = (judgment: FinalJudgment) => {
    if (!session) return

    // Update session with final judgment
    setSession(prev => prev ? {
      ...prev,
      status: 'concluded',
      endTime: Date.now()
    } : null)

    // Here you would typically send to blockchain/storage
    console.log('Final Judgment:', judgment)
  }

  const handleSessionEnd = () => {
    if (!session) return

    setSession(prev => prev ? {
      ...prev,
      status: 'concluded',
      endTime: Date.now()
    } : null)
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-5 h-5 text-green-500" />
      case 'connecting':
        return <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />
      default:
        return <WifiOff className="w-5 h-5 text-red-500" />
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-tribunal flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 mx-auto mb-4 text-flame-500 animate-flame" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Tribunal Session</h2>
          <p className="text-ghost-400">Initializing WhisperNet protocols...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tribunal">
      {/* Header */}
      <header className="bg-ghost-900/50 backdrop-blur-sm border-b border-ghost-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Flame className="w-8 h-8 text-flame-500 animate-flame" />
            <div>
              <h1 className="text-xl font-bold text-white">The Tribunal</h1>
              <p className="text-sm text-ghost-400">Session: {session.summonsId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span className="text-sm text-ghost-300 capitalize">
                {connectionStatus}
              </span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-lg bg-ghost-800 hover:bg-ghost-700 transition-colors"
            >
              {audioEnabled ? (
                <Volume2 className="w-5 h-5 text-ghost-300" />
              ) : (
                <VolumeX className="w-5 h-5 text-ghost-500" />
              )}
            </button>

            {/* Judge Mode Toggle */}
            <button
              onClick={() => setIsJudgeMode(!isJudgeMode)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                isJudgeMode
                  ? "bg-tribunal-gold text-black"
                  : "bg-ghost-800 text-ghost-300 hover:bg-ghost-700"
              )}
            >
              {isJudgeMode ? '👑 Judge Mode' : 'Observer Mode'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* High Council Panel */}
          <div className="lg:col-span-1">
            <CouncilPanel
              title="🜂 High Council"
              agents={HIGH_COUNCIL}
              isActive={session.status === 'in-session'}
              onAgentSelect={(agent) => console.log('Selected agent:', agent)}
            />
          </div>

          {/* Admin/Judge Panel */}
          <div className="lg:col-span-1">
            <AdminPanel
              session={session}
              isJudgeMode={isJudgeMode}
              onVerdictPass={handleFinalJudgment}
              onSessionEnd={handleSessionEnd}
            />
          </div>

          {/* Local Council Panel */}
          <div className="lg:col-span-1">
            <CouncilPanel
              title="🜂 Local Council"
              agents={LOCAL_COUNCIL}
              isActive={session.status === 'in-session'}
              onAgentSelect={(agent) => console.log('Selected agent:', agent)}
            />
          </div>
        </div>

        {/* Session Status Bar */}
        <div className="mt-6 bg-ghost-900/50 rounded-lg p-4 border border-ghost-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={cn(
                "w-3 h-3 rounded-full",
                session.status === 'in-session' ? "bg-green-500 animate-pulse" :
                session.status === 'concluded' ? "bg-red-500" :
                "bg-yellow-500 animate-pulse"
              )} />
              <span className="text-white font-medium">
                Status: <span className="capitalize">{session.status.replace('-', ' ')}</span>
              </span>
              <span className="text-ghost-400">
                Defendant: {session.defendant.name} ({session.defendant.type})
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-ghost-400">
              <span>Verdicts: {session.verdicts.length}</span>
              <span>Testimony: {session.testimony.length}</span>
              {session.endTime && (
                <span>Duration: {Math.round((session.endTime - session.startTime) / 60000)}m</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
