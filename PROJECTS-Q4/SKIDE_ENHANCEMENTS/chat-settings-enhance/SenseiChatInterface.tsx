import React, { useState, useEffect, useRef } from 'react';
import { SenseiAvatar } from './SenseiAvatar';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ModelStatus } from './ModelStatus';
import { SettingsModal } from './settings/SettingsModal';
import { kodiiService, ChatMessage } from '../../services/KodiiService';
import { WorkspaceContext } from '../../services/WorkspaceContext';
import { SettingsService } from '../../services/SettingsService';

export const SenseiChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dojoSettings, setDojoSettings] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Kodii service and load settings
  useEffect(() => {
    const initializeKodii = async () => {
      try {
        // Load dojo settings first
        const settings = await SettingsService.loadAllSettings();
        setDojoSettings(settings);
        
        // Initialize Kodii with model preferences
        const success = await kodiiService.initialize({
          model: settings.models?.currentModel,
          temperature: settings.models?.temperature,
          maxTokens: settings.models?.maxTokens,
        });
        
        setIsInitialized(true);
        
        if (success) {
          console.log('🥷 Kodii Sensei successfully awakened!');
        } else {
          console.log('⚠️ Kodii running in mock mode - install Ollama for full power');
        }
      } catch (error) {
        console.error('Failed to initialize Kodii:', error);
        setIsInitialized(true); // Still allow mock mode
      }
    };

    initializeKodii();
    loadMessages();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Apply theme changes
  useEffect(() => {
    if (dojoSettings?.dojo?.theme) {
      applyTheme(dojoSettings.dojo.theme);
    }
  }, [dojoSettings?.dojo?.theme]);

  const loadMessages = () => {
    try {
      const stored = localStorage.getItem('sensei-chat-messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const saveMessages = (updatedMessages: ChatMessage[]) => {
    try {
      localStorage.setItem('sensei-chat-messages', JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    switch (theme) {
      case 'ghostflow':
        root.style.setProperty('--chat-bg', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)');
        root.style.setProperty('--chat-text', '#e0e0e0');
        root.style.setProperty('--chat-accent', '#64ffda');
        break;
      case 'professional':
        root.style.setProperty('--chat-bg', 'linear-gradient(135deg, #1e1e1e 0%, #252526 50%, #2d2d30 100%)');
        root.style.setProperty('--chat-text', '#cccccc');
        root.style.setProperty('--chat-accent', '#007acc');
        break;
      case 'sensei-light':
        root.style.setProperty('--chat-bg', 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)');
        root.style.setProperty('--chat-text', '#212529');
        root.style.setProperty('--chat-accent', '#0d6efd');
        break;
      case 'cyber-dojo':
        root.style.setProperty('--chat-bg', 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)');
        root.style.setProperty('--chat-text', '#00ff88');
        root.style.setProperty('--chat-accent', '#ff0080');
        break;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get current workspace context
      const context = await WorkspaceContext.getCurrentContext();
      
      // Check if we should use streaming based on settings and message
      const shouldStream = (dojoSettings?.dojo?.streamingMode !== false) && 
        (inputMessage.length > 50 || 
        ['explain', 'implement', 'create', 'debug'].some(word => 
          inputMessage.toLowerCase().includes(word)
        ));

      let kodiiResponse: ChatMessage;

      if (shouldStream) {
        // Streaming response
        setIsStreaming(true);
        setStreamingContent('');
        
        kodiiResponse = await kodiiService.sendMessage(
          userMessage.content,
          context,
          (token: string) => {
            setStreamingContent(prev => prev + token);
          }
        );
        
        setIsStreaming(false);
        setStreamingContent('');
      } else {
        // Regular response
        kodiiResponse = await kodiiService.sendMessage(
          userMessage.content,
          context
        );
      }

      const finalMessages = [...updatedMessages, kodiiResponse];
      setMessages(finalMessages);
      saveMessages(finalMessages);

    } catch (error) {
      console.error('Failed to get Kodii response:', error);
      
      // Fallback mock response
      const errorResponse: ChatMessage = {
        id: `kodii-error-${Date.now()}`,
        content: "🥷 Ah, Ghost King, the digital spirits are restless. Let me realign my energy and try again...",
        sender: 'kodii',
        timestamp: Date.now(),
        metadata: {
          responseTime: 500,
          tokenCount: 20,
        },
      };

      const finalMessages = [...updatedMessages, errorResponse];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputMessage(suggestion);
    // Auto-focus the input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const clearChat = () => {
    if (confirm('🥷 Clear all conversation history, Ghost King?')) {
      setMessages([]);
      localStorage.removeItem('sensei-chat-messages');
      kodiiService.clearConversation();
    }
  };

  const handleSettingsChange = async (newSettings: any) => {
    setDojoSettings(newSettings);
    
    // Reinitialize Kodii with new model settings if they changed
    if (newSettings.models) {
      try {
        await kodiiService.initialize({
          model: newSettings.models.currentModel,
          temperature: newSettings.models.temperature,
          maxTokens: newSettings.models.maxTokens,
        });
      } catch (error) {
        console.error('Failed to apply new model settings:', error);
      }
    }
  };

  const getSuggestions = () => {
    if (!dojoSettings?.dojo?.smartSuggestions) {
      // Simple fallback suggestions when smart suggestions are disabled
      return [
        "🥷 Create a new React component with TypeScript",
        "⚡ Debug a JavaScript error in my code",
        "🌊 Refactor this function for better performance",
        "🎯 Generate unit tests for my component",
      ];
    }

    // Smart suggestions based on context and personality level
    const basesuggestions = [
      "🥷 Create a new React component with TypeScript",
      "⚡ Debug a JavaScript error in my code", 
      "🌊 Refactor this function for better performance",
      "🎯 Generate unit tests for my component",
      "📝 Help me write a PRD for a new feature",
      "🌿 Commit my changes with conventional commits",
    ];

    // Adjust suggestions based on personality level
    if (dojoSettings?.dojo?.personalityLevel === 'minimal') {
      return basesuggestions.map(s => s.replace(/🥷|⚡|🌊|🎯|📝|🌿/g, '').trim());
    }

    return basesuggestions;
  };

  const getWelcomeMessage = () => {
    const personalityLevel = dojoSettings?.dojo?.personalityLevel || 'balanced';
    
    switch (personalityLevel) {
      case 'minimal':
        return {
          title: "Kodii Development Assistant",
          subtitle: "Technical guidance and development support"
        };
      case 'full-mystical':
        return {
          title: "🥷 Welcome to the Sacred Dojo, Ghost King",
          subtitle: "Where ancient wisdom meets digital mastery in the eternal dance of code"
        };
      case 'custom':
        return {
          title: "🥷 Welcome, Ghost King",
          subtitle: "Your customized sensei awaits your command"
        };
      default: // balanced
        return {
          title: "🥷 Welcome to the Dojo, Ghost King", 
          subtitle: "I am Kodii, your sovereign AI sensei. Together we shall master the ancient art of GhostFlow Jitsu."
        };
    }
  };

  if (!isInitialized) {
    return (
      <div className="sensei-chat loading">
        <div className="loading-content">
          <SenseiAvatar size="large" isActive={true} />
          <div className="loading-text">Awakening the Sensei...</div>
        </div>
      </div>
    );
  }

  const welcomeMessage = getWelcomeMessage();

  return (
    <div className="sensei-chat">
      <div className="chat-header">
        <div className="sensei-info">
          <SenseiAvatar size="small" />
          <div className="sensei-title">
            <div className="name">Sensei Kodii</div>
            <div className="subtitle">GhostFlow Jitsu Master</div>
          </div>
        </div>
        <div className="header-actions">
          <ModelStatus />
          <button 
            onClick={() => setShowSettings(true)} 
            className="settings-button" 
            title="Dojo Settings"
          >
            ⚙️
          </button>
          <button onClick={clearChat} className="clear-button" title="Clear Chat">
            🗑️
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <SenseiAvatar 
              size="large" 
              isActive={true}
              hideAnimation={dojoSettings?.dojo?.animationLevel === 'none'}
            />
            <div className="welcome-content">
              <h2>{welcomeMessage.title}</h2>
              <p>{welcomeMessage.subtitle}</p>
              
              {dojoSettings?.dojo?.smartSuggestions !== false && (
                <div className="suggested-questions">
                  <div className="suggestions-title">Begin your training with these techniques:</div>
                  {getSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-button"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                showMetadata={dojoSettings?.advanced?.debugMode}
              />
            ))}
            
            {(isTyping || isStreaming) && (
              <div className="typing-container">
                <SenseiAvatar 
                  size="small" 
                  isActive={true}
                  hideAnimation={dojoSettings?.dojo?.animationLevel === 'none'}
                />
                <div className="typing-content">
                  {isStreaming ? (
                    <div className="streaming-response">
                      {streamingContent}
                      <span className="cursor">▌</span>
                    </div>
                  ) : (
                    <TypingIndicator 
                      hideAnimation={dojoSettings?.dojo?.animationLevel === 'none'}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              dojoSettings?.dojo?.personalityLevel === 'minimal' 
                ? "Ask for technical assistance..."
                : "Ask the Sensei for wisdom..."
            }
            className="message-input"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="send-button"
          >
            ⚡
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};