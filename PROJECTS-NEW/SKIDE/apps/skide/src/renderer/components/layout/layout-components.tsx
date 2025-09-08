import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

interface SidebarProps {
  children: React.ReactNode
}

interface MainProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> & {
  Sidebar: React.FC<SidebarProps>
  Main: React.FC<MainProps>
} = ({ children }) => {
  return (
    <div className="layout" style={{ display: 'flex', height: '100vh' }}>
      {children}
    </div>
  )
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <div className="sidebar" style={{
      width: '250px',
      minWidth: '200px',
      maxWidth: '400px',
      borderRight: '1px solid #e0e0e0',
      backgroundColor: '#f5f5f5',
      overflow: 'auto'
    }}>
      {children}
    </div>
  )
}

const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <div className="main-content" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="editor-panel" style={{
        flex: '1 1 70%',
        minHeight: '200px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {React.Children.toArray(children)[0]}
      </div>
      <div className="terminal-panel" style={{
        flex: '1 1 30%',
        minHeight: '150px',
        backgroundColor: '#1e1e1e'
      }}>
        {React.Children.toArray(children)[1]}
      </div>
    </div>
  )
}

Layout.Sidebar = Sidebar
Layout.Main = Main

export { Layout }