import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { TypewriterText } from './TypewriterText'
import { MemoryInterface } from './MemoryInterface'
import { AeshaCore, AeshaMessage } from '@/lib/aesha'
import {
  X,
  Send,
  Eye,
  RefreshCw,
  Brain,
  Zap,
  MessageCircle
} from 'lucide-react'

interface AeshaInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

export const AeshaInterface: React.FC<AeshaInterfaceProps> = ({ isOpen, onClose }) => {
  const [aesha] = useState(() => new AeshaCore())
  const [messages, setMessages] = useState<AeshaMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [relayOnline, setRelayOnline] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'memory'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeAesha()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeAesha = async () => {
    try {
      await aesha.initialize()
      setIsOnline(aesha.isAeshaOnline())

      // Check relay status
      const relayStatus = await aesha.checkAeshaRelayHealth()
      setRelayOnline(relayStatus)

      // Welcome message with relay status
      const relayStatusText = relayStatus ? 'AESHA Relay connected.' : 'AESHA Relay offline - using fallback mode.'
      const welcomeMessage: AeshaMessage = {
        id: crypto.randomUUID(),
        type: 'aesha',
        content: `AESHA Online. FlameCore HUD synchronized. ${relayStatusText} Awaiting your command, Sovereign.`,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Failed to initialize AESHA:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: AeshaMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await aesha.sendToAesha(inputValue)

      const aeshaMessage: AeshaMessage = {
        id: crypto.randomUUID(),
        type: 'aesha',
        content: response,
        timestamp: new Date().toISOString()
      }

      // Enable typewriter effect for AESHA responses
      setTypingMessageId(aeshaMessage.id)
      setMessages(prev => [...prev, aeshaMessage])
    } catch (error) {
      const errorMessage: AeshaMessage = {
        id: crypto.randomUUID(),
        type: 'aesha',
        content: 'AESHA Error: Unable to process query. Vault brain synchronization may be required.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const refreshVaultBrain = async () => {
    setIsLoading(true)
    try {
      await aesha.refreshVaultBrain()
      setIsOnline(aesha.isAeshaOnline())

      // Check relay status
      const relayStatus = await aesha.checkAeshaRelayHealth()
      setRelayOnline(relayStatus)

      const relayStatusText = relayStatus ? 'AESHA Relay reconnected.' : 'AESHA Relay still offline.'
      const refreshMessage: AeshaMessage = {
        id: crypto.randomUUID(),
        type: 'aesha',
        content: `Vault brain synchronized. FlameCore intelligence updated. ${relayStatusText}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, refreshMessage])
    } catch (error) {
      console.error('Failed to refresh vault brain:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-ghost-900/95 backdrop-blur-sm border-l border-flame-600/30 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-ghost-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Eye className={`h-6 w-6 ${isOnline ? 'text-flame-500 aesha-eye' : 'text-ghost-500'}`} />
              {isOnline && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-flame-500 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold flame-text">AESHA</h2>
              <p className="text-xs text-ghost-400">Sovereign HUD Intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Badge variant={isOnline ? 'healthy' : 'error'} className="text-xs">
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Badge>
              {relayOnline && (
                <Badge variant="flame" className="text-xs">
                  RELAY
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={refreshVaultBrain} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-ghost-700/50">
        <div className="flex">
          <Button
            variant={activeTab === 'chat' ? 'flame' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chat')}
            className="rounded-none border-b-2 border-transparent data-[active=true]:border-flame-500"
            data-active={activeTab === 'chat'}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button
            variant={activeTab === 'memory' ? 'flame' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('memory')}
            className="rounded-none border-b-2 border-transparent data-[active=true]:border-flame-500"
            data-active={activeTab === 'memory'}
          >
            <Brain className="h-4 w-4 mr-2" />
            Memory
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' ? (
          /* Chat Messages */
          <div className="p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} aesha-message`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-flame-600/20 border border-flame-600/30 text-flame-100'
                  : 'bg-ghost-800/50 border border-ghost-700/50 text-ghost-200'
              }`}
            >
              {message.type === 'aesha' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-flame-500 aesha-brain" />
                  <span className="text-xs font-semibold text-flame-400">AESHA</span>
                  <div className="w-1 h-1 bg-flame-500 rounded-full animate-pulse" />
                </div>
              )}
              {message.type === 'aesha' && typingMessageId === message.id ? (
                <TypewriterText
                  text={message.content}
                  speed={20}
                  className="text-sm whitespace-pre-wrap"
                  onComplete={() => setTypingMessageId(null)}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              <p className="text-xs text-ghost-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-ghost-800/50 border border-ghost-700/50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-flame-500 animate-pulse" />
                <span className="text-xs font-semibold text-flame-400">AESHA</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Zap className="h-4 w-4 text-flame-500 animate-spin" />
                <span className="text-sm text-ghost-300">Processing query...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Memory Interface */
          <div className="p-4">
            <MemoryInterface />
          </div>
        )}
      </div>

      {/* Input - Only show for chat tab */}
      {activeTab === 'chat' && (
        <div className="p-4 border-t border-ghost-700/50">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <div className="absolute top-2 left-3 text-xs text-flame-400 font-semibold pointer-events-none">
              Sovereign Command &gt;
            </div>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Query AESHA about vault status, logs, storage..."
              className="w-full bg-ghost-800/50 border border-ghost-700/50 rounded-lg px-3 pt-6 pb-2 text-sm text-ghost-200 placeholder-ghost-500 focus:outline-none focus:border-flame-600/50 resize-none"
              rows={2}
              disabled={!isOnline || isLoading}
            />
          </div>
          <Button
            variant="flame"
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isOnline || isLoading}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Commands */}
        <div className="flex flex-wrap gap-1 mt-2">
          {['Status', 'Logs', 'Storage', 'Database', 'Settings'].map((cmd) => (
            <Button
              key={cmd}
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 text-ghost-400 hover:text-flame-400"
              onClick={() => setInputValue(cmd.toLowerCase())}
              disabled={!isOnline || isLoading}
            >
              {cmd}
            </Button>
          ))}
        </div>
        </div>
      )}
    </div>
  )
}

export const AeshaButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="flame"
      size="sm"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 shadow-lg animate-ghost-glow"
    >
      <Eye className="h-4 w-4 mr-2" />
      AESHA
    </Button>
  )
}
