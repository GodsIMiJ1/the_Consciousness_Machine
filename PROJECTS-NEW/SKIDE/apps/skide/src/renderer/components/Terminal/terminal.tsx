import React, { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'

interface TerminalProps {
  workingDirectory: string | null
}

export const Terminal: React.FC<TerminalProps> = ({ workingDirectory }) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [currentCommand, setCurrentCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    if (!terminalRef.current) return

    // Create terminal instance
    const xterm = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 1000,
      convertEol: true
    })

    // Add addons
    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    
    xterm.loadAddon(fitAddon)
    xterm.loadAddon(webLinksAddon)

    // Open terminal
    xterm.open(terminalRef.current)
    fitAddon.fit()

    // Store references
    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    // Show welcome message and prompt
    const cwd = workingDirectory || process.cwd?.() || '~'
    xterm.writeln('\x1b[36mSKIDE Terminal\x1b[0m')
    xterm.writeln(`Working directory: ${cwd}`)
    xterm.write('\r\n$ ')

    // Handle input
    let currentLine = ''
    let cursorPosition = 0

    xterm.onData((data) => {
      const code = data.charCodeAt(0)

      if (code === 13) { // Enter
        xterm.write('\r\n')
        if (currentLine.trim()) {
          executeCommand(currentLine.trim(), cwd)
          setCommandHistory(prev => [...prev, currentLine.trim()])
          setHistoryIndex(-1)
        }
        currentLine = ''
        cursorPosition = 0
        xterm.write('$ ')
      } else if (code === 127) { // Backspace
        if (cursorPosition > 0) {
          currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition)
          cursorPosition--
          xterm.write('\b \b')
        }
      } else if (code === 27) { // Escape sequences (arrow keys)
        // Handle arrow keys for command history
        if (data === '\x1b[A') { // Up arrow
          if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
            const newIndex = historyIndex + 1
            const command = commandHistory[commandHistory.length - 1 - newIndex]
            // Clear current line
            xterm.write('\r$ ')
            xterm.write(' '.repeat(currentLine.length))
            xterm.write('\r$ ')
            // Write historical command
            xterm.write(command)
            currentLine = command
            cursorPosition = command.length
            setHistoryIndex(newIndex)
          }
        } else if (data === '\x1b[B') { // Down arrow
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1
            const command = commandHistory[commandHistory.length - 1 - newIndex]
            // Clear current line
            xterm.write('\r$ ')
            xterm.write(' '.repeat(currentLine.length))
            xterm.write('\r$ ')
            // Write historical command
            xterm.write(command)
            currentLine = command
            cursorPosition = command.length
            setHistoryIndex(newIndex)
          } else if (historyIndex === 0) {
            // Clear line when going past most recent
            xterm.write('\r$ ')
            xterm.write(' '.repeat(currentLine.length))
            xterm.write('\r$ ')
            currentLine = ''
            cursorPosition = 0
            setHistoryIndex(-1)
          }
        }
      } else if (code >= 32) { // Printable characters
        currentLine = currentLine.slice(0, cursorPosition) + data + currentLine.slice(cursorPosition)
        cursorPosition++
        xterm.write(data)
      }

      setCurrentCommand(currentLine)
    })

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      xterm.dispose()
    }
  }, [workingDirectory])

  const executeCommand = async (command: string, cwd: string) => {
    if (!xtermRef.current) return

    const xterm = xtermRef.current

    // Parse command and arguments
    const parts = command.split(' ')
    const cmd = parts[0]
    const args = parts.slice(1)

    try {
      const result = await window.api.terminal.spawn(cmd, args, {
        cwd: workingDirectory || cwd,
        shell: true
      })

      if (result.success) {
        if (result.stdout) {
          xterm.write(result.stdout)
        }
        if (result.stderr) {
          xterm.write(`\x1b[31m${result.stderr}\x1b[0m`) // Red for stderr
        }
      } else {
        xterm.write(`\x1b[31mCommand failed: ${result.error || 'Unknown error'}\x1b[0m`)
      }
    } catch (error) {
      xterm.write(`\x1b[31mError executing command: ${error}\x1b[0m`)
    }
  }

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
        <div className="terminal-controls">
          <button
            className="terminal-clear"
            onClick={() => {
              if (xtermRef.current) {
                xtermRef.current.clear()
                xtermRef.current.write('$ ')
              }
            }}
            title="Clear Terminal"
          >
            🗑️
          </button>
        </div>
      </div>
      <div 
        ref={terminalRef}
        className="terminal-content"
        style={{ height: 'calc(100% - 32px)' }}
      />
    </div>
  )
}