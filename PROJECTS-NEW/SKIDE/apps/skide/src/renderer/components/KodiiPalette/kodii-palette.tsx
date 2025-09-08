import React, { useState, useEffect, useRef } from 'react'
import { kodiiCommands, searchCommands, getCommandsByCategory } from './kodii-commands'
import type { KodiiCommand, ProjectBrain } from '../../types'

interface KodiiPaletteProps {
  projectPath: string | null
  projectBrain: ProjectBrain
  onClose: () => void
}

export const KodiiPalette: React.FC<KodiiPaletteProps> = ({
  projectPath,
  projectBrain,
  onClose
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredCommands, setFilteredCommands] = useState<KodiiCommand[]>(kodiiCommands)
  const [showCategories, setShowCategories] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (query.trim()) {
      const results = searchCommands(query)
      setFilteredCommands(results)
      setShowCategories(false)
    } else {
      setFilteredCommands(kodiiCommands)
      setShowCategories(true)
    }
    setSelectedIndex(0)
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex])
        }
        break
    }
  }

  const executeCommand = async (command: KodiiCommand) => {
    console.log('Executing Kodii command:', command.title)
    
    // Mock implementation - in real version, this would interface with Kodii AI
    switch (command.action.type) {
      case 'draft-prd':
        await mockPRDGeneration()
        break
      case 'generate-task-graph':
        await mockTaskGraphGeneration()
        break
      case 'scaffold-feature':
        await mockScaffolding()
        break
      case 'implement':
        await mockImplementation()
        break
      case 'write-tests':
        await mockTestGeneration()
        break
      case 'review-diff':
        await mockCodeReview()
        break
      case 'summarize-changes':
        await mockCommitMessageGeneration()
        break
      case 'prepare-release':
        await mockReleaseNotesGeneration()
        break
      case 'custom':
        await mockCustomCommand(command.action.payload?.command)
        break
      default:
        console.log('Unknown command type:', command.action.type)
    }
    
    onClose()
  }

  // Mock implementations - replace with real Kodii AI integration
  const mockPRDGeneration = async () => {
    alert('🤖 Kodii: Analyzing project context and generating PRD...\n\nThis would create a comprehensive Product Requirements Document based on your codebase structure and recent changes.')
  }

  const mockTaskGraphGeneration = async () => {
    alert('🤖 Kodii: Breaking down features into implementable tasks...\n\nThis would create a dependency graph of tasks with estimates and prerequisites.')
  }

  const mockScaffolding = async () => {
    alert('🤖 Kodii: Generating boilerplate code structure...\n\nThis would create files, folders, and initial code based on your project patterns.')
  }

  const mockImplementation = async () => {
    alert('🤖 Kodii: Implementing feature based on specifications...\n\nThis would generate production-ready code following your project conventions.')
  }

  const mockTestGeneration = async () => {
    alert('🤖 Kodii: Writing comprehensive tests...\n\nThis would create unit, integration, and end-to-end tests for your code.')
  }

  const mockCodeReview = async () => {
    alert('🤖 Kodii: Analyzing changes for review...\n\nThis would provide intelligent feedback on code quality, security, and best practices.')
  }

  const mockCommitMessageGeneration = async () => {
    alert('🤖 Kodii: Generating conventional commit message...\n\nThis would create properly formatted commit messages based on your changes.')
  }

  const mockReleaseNotesGeneration = async () => {
    alert('🤖 Kodii: Preparing release documentation...\n\nThis would generate changelog entries and release notes from your commits.')
  }

  const mockCustomCommand = async (command: string) => {
    alert(`🤖 Kodii: Executing ${command} command...\n\nThis would perform AI-powered analysis and suggestions for your code.`)
  }

  const getCategoryIcon = (category: string): string => {
    const icons = {
      workflow: '⚡',
      code: '💻',
      git: '🔀',
      project: '📁',
      ai: '🤖'
    }
    return icons[category] || '⚙️'
  }

  const renderCategories = () => {
    const categories = ['workflow', 'code', 'git', 'project', 'ai']
    
    return (
      <div className="command-categories">
        {categories.map(category => {
          const commands = getCommandsByCategory(category)
          if (commands.length === 0) return null
          
          return (
            <div key={category} className="command-category">
              <div className="category-header">
                <span className="category-icon">{getCategoryIcon(category)}</span>
                <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              </div>
              <div className="category-commands">
                {commands.slice(0, 3).map((command, index) => (
                  <div
                    key={command.id}
                    className="command-item preview"
                    onClick={() => executeCommand(command)}
                  >
                    <div className="command-title">{command.title}</div>
                    <div className="command-description">{command.description}</div>
                    {command.shortcut && (
                      <div className="command-shortcut">{command.shortcut}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="kodii-palette-overlay" onClick={onClose}>
      <div className="kodii-palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-header">
          <div className="palette-title">
            <span className="kodii-icon">🤖</span>
            <span>Kodii Command Palette</span>
          </div>
          {projectPath && (
            <div className="project-context">
              Project: {projectPath.split('/').pop()}
            </div>
          )}
        </div>

        <div className="palette-search">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="search-input"
          />
        </div>

        <div className="palette-content">
          {showCategories && !query.trim() ? (
            renderCategories()
          ) : (
            <div className="command-list">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((command, index) => (
                  <div
                    key={command.id}
                    className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeCommand(command)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="command-main">
                      <div className="command-title">
                        <span className="command-category-icon">
                          {getCategoryIcon(command.category)}
                        </span>
                        {command.title}
                      </div>
                      <div className="command-description">{command.description}</div>
                    </div>
                    {command.shortcut && (
                      <div className="command-shortcut">{command.shortcut}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No commands found for "{query}"</p>
                  <p className="help-text">Try searching for workflow, code, git, or ai commands</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="palette-footer">
          <div className="footer-shortcuts">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Execute</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
          <div className="footer-status">
            {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}