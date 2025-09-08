import React from 'react'
import { MonacoEditor } from './monaco-editor'
import type { EditorTab } from '../../types'

interface EditorTabsProps {
  tabs: EditorTab[]
  activeTab: string | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onContentChange: (tabId: string, content: string) => void
  onSave: (tabId: string) => void
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
  onContentChange,
  onSave
}) => {
  const activeTabData = tabs.find(tab => tab.id === activeTab)

  const handleTabClick = (tabId: string) => {
    onTabSelect(tabId)
  }

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    onTabClose(tabId)
  }

  const handleContentChange = (content: string) => {
    if (activeTab) {
      onContentChange(activeTab, content)
    }
  }

  const handleSave = () => {
    if (activeTab) {
      onSave(activeTab)
    }
  }

  if (tabs.length === 0) {
    return (
      <div className="editor-empty">
        <div className="editor-welcome">
          <h2>Welcome to SKIDE</h2>
          <p>Open a file to start coding</p>
          <div className="welcome-shortcuts">
            <div className="shortcut">
              <kbd>Ctrl+Shift+P</kbd> - Open Kodii Command Palette
            </div>
            <div className="shortcut">
              <kbd>Ctrl+O</kbd> - Open File
            </div>
            <div className="shortcut">
              <kbd>Ctrl+S</kbd> - Save File
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="editor-tabs-container">
      <div className="tab-bar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTab ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="tab-filename">
              {tab.filename}
              {tab.isDirty && <span className="dirty-indicator">●</span>}
            </span>
            <button
              className="tab-close"
              onClick={(e) => handleTabClose(e, tab.id)}
              title="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="editor-content">
        {activeTabData && (
          <MonacoEditor
            value={activeTabData.content}
            language={activeTabData.language}
            onChange={handleContentChange}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  )
}
