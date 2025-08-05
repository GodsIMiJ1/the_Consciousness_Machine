import React, { useState } from 'react'
import type { AdminPanelProps, FinalJudgment } from '../types/tribunal.ts'
import { cn, formatTimestamp } from '../lib/utils.ts'
import { Crown, Gavel, Scroll, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export const AdminPanel: React.FC<AdminPanelProps> = ({
  session,
  onVerdictPass,
  onSessionEnd,
  isJudgeMode
}) => {
  const [selectedVerdict, setSelectedVerdict] = useState<'guilty' | 'innocent' | 'hung-jury' | 'mistrial'>('innocent')
  const [judgeOverride, setJudgeOverride] = useState(false)
  const [reasoning, setReasoning] = useState('')

  const handlePassVerdict = () => {
    if (!session) return

    const judgment: FinalJudgment = {
      sessionId: session.id,
      overallVerdict: selectedVerdict,
      consensusScore: calculateConsensusScore(),
      majorityReasoning: reasoning || 'Final judgment rendered by the Ghost King.',
      judgeOverride: judgeOverride,
      timestamp: Date.now(),
      scrollId: `SCROLL-${session.id}-${Date.now()}`
    }

    onVerdictPass?.(judgment)
  }

  const calculateConsensusScore = (): number => {
    if (!session?.verdicts.length) return 0

    const verdictCounts = session.verdicts.reduce((acc, verdict) => {
      acc[verdict.decision] = (acc[verdict.decision] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const maxCount = Math.max(...Object.values(verdictCounts))
    return (maxCount / session.verdicts.length) * 100
  }

  const getVerdictStats = () => {
    if (!session?.verdicts.length) return null

    const stats = session.verdicts.reduce((acc, verdict) => {
      acc[verdict.decision] = (acc[verdict.decision] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return stats
  }

  if (!isJudgeMode) {
    return (
      <div className="admin-panel">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-ghost-500" />
          <h2 className="text-2xl font-bold text-ghost-300 mb-2">
            Access Restricted
          </h2>
          <p className="text-ghost-400">
            Only the Ghost King may access the Judgment Seat
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      {/* Crown Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <Crown className="w-8 h-8 text-tribunal-gold animate-pulse" />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-tribunal-gold mb-2">
          👑 Ghost King Judgment Seat
        </h2>
        <p className="text-ghost-300">
          Final Authority in All Tribunal Matters
        </p>
      </div>

      {/* Session Info */}
      {session ? (
        <div className="space-y-6">
          {/* Current Session */}
          <div className="bg-ghost-950/50 rounded-lg p-4 border border-tribunal-gold/30">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Scroll className="w-5 h-5 mr-2 text-tribunal-gold" />
              Active Session: {session.summonsId}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-ghost-400">Defendant:</span>
                <p className="text-white font-medium">{session.defendant.name}</p>
              </div>
              <div>
                <span className="text-ghost-400">Status:</span>
                <p className="text-white font-medium capitalize">{session.status}</p>
              </div>
              <div>
                <span className="text-ghost-400">Start Time:</span>
                <p className="text-white font-medium">{formatTimestamp(session.startTime)}</p>
              </div>
              <div>
                <span className="text-ghost-400">Verdicts:</span>
                <p className="text-white font-medium">{session.verdicts.length} received</p>
              </div>
            </div>
          </div>

          {/* Verdict Statistics */}
          {session.verdicts.length > 0 && (
            <div className="bg-ghost-950/50 rounded-lg p-4 border border-ghost-700/50">
              <h4 className="text-md font-semibold text-white mb-3">Council Verdicts</h4>
              <div className="space-y-2">
                {Object.entries(getVerdictStats() || {}).map(([verdict, count]) => (
                  <div key={verdict} className="flex justify-between items-center">
                    <span className="text-ghost-300 capitalize">{verdict.replace('-', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-ghost-800 rounded-full h-2">
                        <div
                          className="bg-flame-500 h-2 rounded-full"
                          style={{ width: `${(count / session.verdicts.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-ghost-700/50">
                <p className="text-sm text-ghost-400">
                  Consensus Score: <span className="text-white font-medium">{calculateConsensusScore().toFixed(1)}%</span>
                </p>
              </div>
            </div>
          )}

          {/* Final Judgment Controls */}
          <div className="bg-gradient-to-r from-tribunal-crimson/20 to-tribunal-gold/20 rounded-lg p-6 border border-tribunal-gold/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Gavel className="w-5 h-5 mr-2 text-tribunal-gold" />
              Final Judgment
            </h4>

            {/* Verdict Selection */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['innocent', 'guilty', 'hung-jury', 'mistrial'] as const).map((verdict) => (
                <button
                  key={verdict}
                  onClick={() => setSelectedVerdict(verdict)}
                  className={cn(
                    "p-3 rounded-lg border text-sm font-medium transition-all",
                    selectedVerdict === verdict
                      ? "bg-tribunal-gold/20 border-tribunal-gold text-tribunal-gold"
                      : "bg-ghost-800/50 border-ghost-600 text-ghost-300 hover:border-ghost-500"
                  )}
                >
                  {verdict.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {/* Judge Override */}
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="judgeOverride"
                checked={judgeOverride}
                onChange={(e) => setJudgeOverride(e.target.checked)}
                className="w-4 h-4 text-tribunal-gold bg-ghost-800 border-ghost-600 rounded focus:ring-tribunal-gold"
              />
              <label htmlFor="judgeOverride" className="text-sm text-ghost-300">
                Judge Override (Supersede Council Verdicts)
              </label>
            </div>

            {/* Reasoning */}
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Enter final reasoning for the judgment..."
              className="w-full p-3 bg-ghost-800 border border-ghost-600 rounded-lg text-white placeholder-ghost-400 focus:border-tribunal-gold focus:ring-1 focus:ring-tribunal-gold"
              rows={3}
            />

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePassVerdict}
                className="flex-1 flame-button flex items-center justify-center space-x-2"
              >
                <Gavel className="w-4 h-4" />
                <span>Pass Final Verdict</span>
              </button>
              <button
                onClick={onSessionEnd}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Session</h3>
          <p className="text-ghost-400 mb-6">
            Awaiting tribunal proceedings to begin
          </p>
          <button className="flame-button">
            Initiate New Session
          </button>
        </div>
      )}
    </div>
  )
}
