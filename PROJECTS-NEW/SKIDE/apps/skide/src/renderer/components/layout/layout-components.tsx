import React from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from 'react-resizable-panels'

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
    <div className="layout">
      <ResizablePanelGroup direction="horizontal">
        {children}
      </ResizablePanelGroup>
    </div>
  )
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
        <div className="sidebar">
          {children}
        </div>
      </ResizablePanel>
      <ResizableHandle />
    </>
  )
}

const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <ResizablePanel defaultSize={80}>
      <div className="main-content">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="editor-panel">
              {React.Children.toArray(children)[0]}
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="terminal-panel">
              {React.Children.toArray(children)[1]}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ResizablePanel>
  )
}

Layout.Sidebar = Sidebar
Layout.Main = Main

export { Layout }