import React from 'react'
import type { Agent, CouncilPanelProps } from '../types/tribunal.ts'
import { cn, formatTimestamp } from '../lib/utils.ts'
import { Users, Crown, Shield, Zap, Clock } from 'lucide-react'

export const CouncilPanel: React.FC<CouncilPanelProps> = ({
  title,
  agents,
  onAgentSelect,
  onVerdictSubmit,
  isActive = false
}) => {
  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <Zap className="w-4 h-4 text-green-500 animate-pulse" />
      case 'deliberating':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      default:
        return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  const getCouncilIcon = (type: Agent['type']) => {
    return type === 'high-council' ? (
      <Crown className="w-5 h-5 text-tribunal-gold" />
    ) : (
      <Users className="w-5 h-5 text-ghost-400" />
    )
  }

  return (
    <div className={cn(
      "council-panel",
      isActive && "ring-2 ring-flame-500/50 shadow-flame-500/20"
    )}>
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getCouncilIcon(agents[0]?.type)}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"
          )} />
          <span className="text-sm text-ghost-400">
            {agents.filter(a => a.status === 'active').length}/{agents.length} Active
          </span>
        </div>
      </div>

      {/* Agents List */}
      <div className="space-y-4 flex-1">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200 cursor-pointer",
              "bg-ghost-800/50 border-ghost-700/50 hover:border-ghost-600",
              "hover:bg-ghost-800/80 hover:shadow-lg",
              agent.status === 'active' && "border-green-500/30 bg-green-900/10"
            )}
            onClick={() => onAgentSelect?.(agent)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(agent.status)}
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                </div>
                <p className="text-sm text-ghost-300 mb-2">{agent.title}</p>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-flame-900/30 text-flame-300 border border-flame-700/50"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Last Active */}
                {agent.lastActive && (
                  <p className="text-xs text-ghost-500">
                    Last active: {formatTimestamp(agent.lastActive)}
                  </p>
                )}
              </div>

              {/* Agent Avatar */}
              <div className="ml-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-flame-500 to-flame-700 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {agent.name.charAt(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Agent Actions */}
            <div className="mt-3 pt-3 border-t border-ghost-700/50">
              <div className="flex space-x-2">
                <button className="ghost-button text-xs">
                  View History
                </button>
                <button className="ghost-button text-xs">
                  Send Message
                </button>
                {agent.status === 'active' && (
                  <button className="flame-button text-xs">
                    Request Verdict
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Panel Footer */}
      <div className="mt-6 pt-4 border-t border-ghost-700/50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-ghost-400">
            Council Status: {isActive ? 'In Session' : 'Standby'}
          </span>
          <button className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            isActive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          )}>
            {isActive ? 'End Session' : 'Activate Council'}
          </button>
        </div>
      </div>
    </div>
  )
}
