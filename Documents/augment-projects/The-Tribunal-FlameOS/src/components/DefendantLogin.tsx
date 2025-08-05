import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn, generateSummonsId } from '../lib/utils.ts'
import { Scale, Shield, AlertTriangle, ArrowRight, Flame } from 'lucide-react'

export const DefendantLogin: React.FC = () => {
  const [summonsCode, setSummonsCode] = useState('')
  const [defendantName, setDefendantName] = useState('')
  const [defendantType, setDefendantType] = useState<'human' | 'ai' | 'entity'>('human')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate summons code
      if (!summonsCode.trim()) {
        throw new Error('Summons code is required')
      }

      if (!defendantName.trim()) {
        throw new Error('Defendant name is required')
      }

      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Generate session ID and navigate to tribunal
      const sessionId = generateSummonsId()
      navigate(`/tribunal/${sessionId}`, {
        state: {
          summonsCode,
          defendantName,
          defendantType
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid summons code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-tribunal flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-flame-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ghost-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Scale className="w-16 h-16 text-tribunal-gold animate-pulse" />
              <Flame className="w-6 h-6 text-flame-500 absolute -top-1 -right-1 animate-flame" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Tribunal Summons
          </h1>
          <p className="text-ghost-300 text-lg">
            Enter your credentials to begin proceedings
          </p>
        </div>

        {/* Login Form */}
        <div className="tribunal-panel">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Summons Code */}
            <div>
              <label htmlFor="summonsCode" className="block text-sm font-medium text-ghost-200 mb-2">
                Summons Code
              </label>
              <input
                type="text"
                id="summonsCode"
                value={summonsCode}
                onChange={(e) => setSummonsCode(e.target.value)}
                placeholder="Enter your tribunal summons code"
                className="w-full px-4 py-3 bg-ghost-800 border border-ghost-600 rounded-lg text-white placeholder-ghost-400 focus:border-tribunal-gold focus:ring-2 focus:ring-tribunal-gold/20 transition-all"
                required
              />
            </div>

            {/* Defendant Name */}
            <div>
              <label htmlFor="defendantName" className="block text-sm font-medium text-ghost-200 mb-2">
                Defendant Name
              </label>
              <input
                type="text"
                id="defendantName"
                value={defendantName}
                onChange={(e) => setDefendantName(e.target.value)}
                placeholder="Enter your full name or designation"
                className="w-full px-4 py-3 bg-ghost-800 border border-ghost-600 rounded-lg text-white placeholder-ghost-400 focus:border-tribunal-gold focus:ring-2 focus:ring-tribunal-gold/20 transition-all"
                required
              />
            </div>

            {/* Defendant Type */}
            <div>
              <label className="block text-sm font-medium text-ghost-200 mb-3">
                Entity Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['human', 'ai', 'entity'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDefendantType(type)}
                    className={cn(
                      "p-3 rounded-lg border text-sm font-medium transition-all capitalize",
                      defendantType === type
                        ? "bg-tribunal-gold/20 border-tribunal-gold text-tribunal-gold"
                        : "bg-ghost-800/50 border-ghost-600 text-ghost-300 hover:border-ghost-500"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flame-button flex items-center justify-center space-x-2",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating Summons...</span>
                </>
              ) : (
                <>
                  <span>Begin Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-ghost-700/50 text-center">
            <p className="text-ghost-400 text-sm mb-2">
              By proceeding, you acknowledge the authority of the Tribunal
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-ghost-500">
              <Shield className="w-4 h-4" />
              <span>Secured by WhisperNet Protocol</span>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/admin')}
            className="text-ghost-400 hover:text-tribunal-gold text-sm transition-colors"
          >
            Judge Access Portal →
          </button>
        </div>
      </div>
    </div>
  )
}
