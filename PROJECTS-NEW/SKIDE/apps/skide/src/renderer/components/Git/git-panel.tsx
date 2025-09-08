import React, { useState, useEffect } from 'react'
import type { GitStatus, GitCommit } from '../../types'

interface GitPanelProps {
  projectPath: string | null
}

export const GitPanel: React.FC<GitPanelProps> = ({ projectPath }) => {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'changes' | 'history'>('changes')

  useEffect(() => {
    if (projectPath) {
      loadGitData()
    } else {
      setGitStatus(null)
      setCommits([])
    }
  }, [projectPath])

  const loadGitData = async () => {
    if (!projectPath) return

    setLoading(true)
    try {
      // Load git status
      const statusResult = await window.api.git.status(projectPath)
      if (statusResult.success) {
        setGitStatus(statusResult.status)
      }

      // Load commit history
      const logResult = await window.api.git.log(projectPath)
      if (logResult.success) {
        setCommits(logResult.log?.all || [])
      }
    } catch (error) {
      console.error('Error loading git data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'M': 'Modified',
      'A': 'Added',
      'D': 'Deleted',
      'R': 'Renamed',
      'C': 'Copied',
      'U': 'Unmerged',
      '?': 'Untracked',
      '!': 'Ignored'
    }
    return statusMap[status] || status
  }

  const getStatusIcon = (status: string): string => {
    const iconMap: Record<string, string> = {
      'M': '📝',
      'A': '➕',
      'D': '➖',
      'R': '📛',
      'C': '📄',
      'U': '⚠️',
      '?': '❓',
      '!': '🚫'
    }
    return iconMap[status] || '📄'
  }

  const formatCommitDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (!projectPath) {
    return (
      <div className="git-panel-empty">
        <p>No git repository</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="git-panel-loading">
        <p>Loading git data...</p>
      </div>
    )
  }

  return (
    <div className="git-panel">
      <div className="git-panel-tabs">
        <button 
          className={`tab ${activeTab === 'changes' ? 'active' : ''}`}
          onClick={() => setActiveTab('changes')}
        >
          Changes
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className="git-refresh"
          onClick={loadGitData}
          title="Refresh"
        >
          🔄
        </button>
      </div>

      <div className="git-panel-content">
        {activeTab === 'changes' && (
          <div className="git-changes">
            {gitStatus ? (
              <>
                <div className="git-branch">
                  <strong>Branch:</strong> {gitStatus.current}
                  {gitStatus.ahead > 0 && (
                    <span className="ahead"> ↑{gitStatus.ahead}</span>
                  )}
                  {gitStatus.behind > 0 && (
                    <span className="behind"> ↓{gitStatus.behind}</span>
                  )}
                </div>

                {gitStatus.files && gitStatus.files.length > 0 ? (
                  <div className="git-files">
                    <h4>Changed Files:</h4>
                    {gitStatus.files.map((file, index) => (
                      <div key={index} className="git-file">
                        <span className="file-status-icon">
                          {getStatusIcon(file.working_dir || file.index)}
                        </span>
                        <span className="file-path">{file.path}</span>
                        <span className="file-status">
                          {formatFileStatus(file.working_dir || file.index)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="git-clean">
                    <p>✅ Working directory clean</p>
                  </div>
                )}
              </>
            ) : (
              <div className="git-error">
                <p>Not a git repository</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="git-history">
            {commits.length > 0 ? (
              <div className="git-commits">
                {commits.map((commit, index) => (
                  <div key={commit.hash} className="git-commit">
                    <div className="commit-message">{commit.message}</div>
                    <div className="commit-meta">
                      <span className="commit-author">{commit.author_name}</span>
                      <span className="commit-date">
                        {formatCommitDate(commit.date)}
                      </span>
                    </div>
                    <div className="commit-hash">{commit.hash.substring(0, 8)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="git-no-commits">
                <p>No commits found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}