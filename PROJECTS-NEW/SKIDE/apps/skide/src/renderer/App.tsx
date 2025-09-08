import React, { useState, useEffect } from 'react'
import { Layout } from './components/layout'
import { FileExplorer } from './components/FileExplorer'
import { EditorTabs } from './components/Editor'
import { Terminal } from './components/Terminal'
import { GitPanel } from './components/Git'
import { KodiiPalette } from './components/KodiiPalette'
import { ProjectBrain } from './services/ProjectBrain'
import type { FileItem, EditorTab } from './types'

function App() {
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [showKodiiPalette, setShowKodiiPalette] = useState(false)
  const [projectBrain] = useState(() => new ProjectBrain())

  // Initialize project brain
  useEffect(() => {
    projectBrain.initialize()
  }, [projectBrain])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Kodii Command Palette: Ctrl+Shift+P (Win/Linux) or Cmd+Shift+P (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShowKodiiPalette(true)
      }
      
      // Close tab: Ctrl+W (Win/Linux) or Cmd+W (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'w' && activeTab) {
        e.preventDefault()
        closeTab(activeTab)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab])

  const openProject = async () => {
    const result = await window.api.dialog.openDirectory()
    if (!result.canceled && result.filePaths[0]) {
      const projectPath = result.filePaths[0]
      setCurrentProject(projectPath)
      
      // Index project in brain
      await projectBrain.indexProject(projectPath)
    }
  }

  const openFile = async (filePath: string) => {
    // Check if file is already open
    const existingTab = openTabs.find(tab => tab.filePath === filePath)
    if (existingTab) {
      setActiveTab(existingTab.id)
      return
    }

    // Read file content
    const result = await window.api.fs.readFile(filePath)
    if (result.success) {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        filePath,
        filename: filePath.split('/').pop() || 'Untitled',
        content: result.content,
        isDirty: false,
        language: getLanguageFromPath(filePath)
      }
      
      setOpenTabs(prev => [...prev, newTab])
      setActiveTab(newTab.id)
    }
  }

  const closeTab = (tabId: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== tabId))
    
    // If closing active tab, switch to another tab
    if (activeTab === tabId) {
      const remainingTabs = openTabs.filter(tab => tab.id !== tabId)
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null)
    }
  }

  const updateTabContent = async (tabId: string, content: string) => {
    setOpenTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, isDirty: true }
        : tab
    ))
  }

  const saveTab = async (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId)
    if (!tab) return

    const result = await window.api.fs.writeFile(tab.filePath, tab.content)
    if (result.success) {
      setOpenTabs(prev => prev.map(t => 
        t.id === tabId 
          ? { ...t, isDirty: false }
          : t
      ))
    }
  }

  const getLanguageFromPath = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'sh': 'shell',
      'bash': 'shell',
      'yaml': 'yaml',
      'yml': 'yaml',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'md': 'markdown',
      'sql': 'sql'
    }
    return languageMap[ext || ''] || 'plaintext'
  }

  return (
    <div className="app">
      <Layout>
        <Layout.Sidebar>
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>Explorer</h3>
              <button onClick={openProject} className="btn-icon" title="Open Folder">
                📁
              </button>
            </div>
            <FileExplorer 
              projectPath={currentProject}
              onFileSelect={openFile}
            />
          </div>

          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>Git</h3>
            </div>
            <GitPanel projectPath={currentProject} />
          </div>
        </Layout.Sidebar>

        <Layout.Main>
          <div className="editor-container">
            <EditorTabs
              tabs={openTabs}
              activeTab={activeTab}
              onTabSelect={setActiveTab}
              onTabClose={closeTab}
              onContentChange={updateTabContent}
              onSave={saveTab}
            />
          </div>
          
          <div className="terminal-container">
            <Terminal workingDirectory={currentProject} />
          </div>
        </Layout.Main>
      </Layout>

      {showKodiiPalette && (
        <KodiiPalette
          projectPath={currentProject}
          projectBrain={projectBrain}
          onClose={() => setShowKodiiPalette(false)}
        />
      )}
    </div>
  )
}

export default App