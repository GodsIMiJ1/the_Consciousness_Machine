import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useProject } from '@state/project'
import { useChat } from '@state/chat'
import { listAllConversationIds, getConversation, deleteConversations } from '@ai/core/memory/IndexedDbMemory'

type Thread = {
  convId: string
  title: string
  count: number
  updatedAt: number
  preview: string
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" className={`transition-transform ${open ? 'rotate-90' : ''}`}>
      <path d="M8 5l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function useSectionState(section: string) {
  const { deviceId } = useChat()
  const key = useMemo(() => `kodii.sidebar.${deviceId}.${section}`, [deviceId, section])
  const [open, setOpen] = useState<boolean>(true)
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw !== null) setOpen(raw === '1') } catch {}
  }, [key])
  useEffect(() => { try { localStorage.setItem(key, open ? '1' : '0') } catch {} }, [key, open])
  return { open, setOpen }
}

function usePins(deviceId: string) {
  const key = `kodii.pins.${deviceId}`
  const [pins, setPins] = useState<string[]>([])
  useEffect(() => { try { const raw = localStorage.getItem(key); if (raw) setPins(JSON.parse(raw)) } catch {} }, [key])
  function save(next: string[]) { setPins(next); try { localStorage.setItem(key, JSON.stringify(next)) } catch {} }
  return {
    pins,
    toggle: (id: string) => save(pins.includes(id) ? pins.filter(x => x !== id) : [...pins, id]),
  }
}

function useTitles(deviceId: string) {
  const key = `kodii.titles.${deviceId}`
  const [map, setMap] = useState<Record<string, string>>({})
  useEffect(() => { try { const raw = localStorage.getItem(key); if (raw) setMap(JSON.parse(raw)) } catch {} }, [key])
  function save(id: string, title: string) {
    const next = { ...map, [id]: title }
    setMap(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
  }
  return { get: (id: string) => map[id], set: save }
}

export function SidebarDock() {
  const { currentProject, projects, switchProject, createNewProject, loadProjects } = useProject()
  const chat = useChat()
  const projSec = useSectionState('project')
  const presetsSec = useSectionState('presets')
  const quickSec = useSectionState('quick')
  const { deviceId } = chat
  const { pins, toggle: togglePin } = usePins(deviceId)
  const titles = useTitles(deviceId)

  const [presets, setPresets] = useState<{id:string;name:string;text:string}[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [filter, setFilter] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadProjects() }, [])
  useEffect(() => {
    if (currentProject?.presets) {
      setPresets(currentProject.presets.map(p => ({
        id: p.id,
        name: p.name,
        text: p.prompt
      })))
    }
  }, [currentProject])

  useEffect(() => { void loadThreads() }, [deviceId])

  async function loadThreads() {
    const ids = await listAllConversationIds()
    const rows: Thread[] = []
    for (const id of ids) {
      const msgs = await getConversation(id)
      if (!msgs.length) continue
      const firstUser = msgs.find(m => m.role === 'user')?.content || ''
      const last = msgs[msgs.length - 1]
      const customTitle = titles.get(id)
      const title = (customTitle || firstUser || 'Welcome to Kodii').slice(0, 60)
      const preview = (last?.content || '').replace(/\s+/g, ' ').slice(0, 80)
      rows.push({ convId: id, title, count: msgs.length, updatedAt: last?.createdAt || 0, preview })
    }
    rows.sort((a, b) => b.updatedAt - a.updatedAt)
    setThreads(rows)
  }

  async function assignCurrent() {
    if (!currentProject) return alert('Select or create a project first')
    const { setConversationProject } = await import('@ai/core/memory/IndexedDbMemory')
    await setConversationProject(chat.convId, currentProject.id)
    alert('Assigned this chat to the project')
  }

  function insertPreset(t: string) {
    const inp = document.getElementById('chat-input') as HTMLTextAreaElement | HTMLInputElement | null
    if (!inp) return
    const start = (inp as any).selectionStart ?? inp.value.length
    const end = (inp as any).selectionEnd ?? inp.value.length
    const val = inp.value
    inp.value = val.slice(0, start) + t + val.slice(end)
    inp.focus()
  }

  // Filter, split pinned vs rest
  const normedFilter = filter.trim().toLowerCase()
  const filtered = threads.filter(t => {
    if (!normedFilter) return true
    return t.title.toLowerCase().includes(normedFilter) || t.preview.toLowerCase().includes(normedFilter)
  })
  const pinned = filtered.filter(t => pins.includes(t.convId))
  const rest = filtered.filter(t => !pins.includes(t.convId))
  const visible = [...pinned, ...rest]

  // Keyboard nav
  function onKeyDown(e: React.KeyboardEvent) {
    if (!visible.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, visible.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const t = visible[selectedIdx]
      if (t) chat.load(t.convId)
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      const t = visible[selectedIdx]
      if (t && confirm('Delete this conversation permanently')) {
        deleteConversations([t.convId]).then(loadThreads)
      }
    }
  }

  function rename(convId: string, current: string) {
    const next = prompt('Rename thread', current || '')
    if (next === null) return
    titles.set(convId, next.trim())
    setThreads(ts => ts.map(t => t.convId === convId ? { ...t, title: next.trim() || t.title } : t))
  }

  return (
    // Adjust width to match your rail
    <aside className="fixed left-0 top-0 h-full w-[280px] px-3 py-4 pointer-events-none">
      <div className="h-full flex flex-col justify-between">
        <div className="space-y-3 pointer-events-auto">
          {/* Header with New Chat */}
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center">
                <span className="text-sm font-bold">K</span>
              </div>
              <div>
                <h1 className="font-semibold">Kodii AI</h1>
                <p className="text-xs text-neutral-400">Tactical Engineer</p>
              </div>
            </div>

            <button
              onClick={() => chat.newConversation()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 transition-colors text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Chat
            </button>
          </div>

          {/* Project section */}
          <div className="px-2">
            <button
              className="w-full flex items-center justify-between text-left text-xs opacity-70"
              onClick={() => projSec.setOpen(!projSec.open)}
            >
              <span>Project</span>
              <Chevron open={projSec.open} />
            </button>
            {projSec.open && (
              <div className="mt-2">
                <select
                  value={currentProject?.id || ''}
                  onChange={e => e.target.value ? switchProject(e.target.value) : null}
                  className="w-full px-2 py-1 rounded-lg border border-neutral-800 bg-black text-white"
                >
                  <option value="">(none)</option>
                  {projects.map(pr => <option value={pr.id} key={pr.id}>{pr.name}</option>)}
                </select>
                <div className="mt-2 flex gap-2">
                  <button className="flex-1 px-2 py-1 rounded-lg border border-neutral-800" onClick={assignCurrent}>Assign</button>
                  <button className="px-2 py-1 rounded-lg border border-neutral-800" onClick={async ()=>{
                    const name = window.prompt('New project name')
                    if (!name) return
                    await createNewProject(name)
                    await assignCurrent()
                  }}>New</button>
                </div>
              </div>
            )}
          </div>

          {/* Presets section */}
          <div className="px-2">
            <button
              className="w-full flex items-center justify-between text-left text-xs opacity-70"
              onClick={() => presetsSec.setOpen(!presetsSec.open)}
            >
              <span>Presets</span>
              <Chevron open={presetsSec.open} />
            </button>
            {presetsSec.open && (
              <div className="mt-2 flex flex-wrap gap-2">
                {presets.slice(0, 6).map(pr => (
                  <button key={pr.id} className="px-2 py-1 rounded-lg border border-neutral-800 text-xs"
                    onClick={()=>insertPreset(pr.text)}>{pr.name}</button>
                ))}
                {!presets.length && <div className="text-xs opacity-60">(no presets)</div>}
              </div>
            )}
          </div>

          {/* Quick actions section */}
          <div className="px-2">
            <button
              className="w-full flex items-center justify-between text-left text-xs opacity-70"
              onClick={() => quickSec.setOpen(!quickSec.open)}
            >
              <span>Quick</span>
              <Chevron open={quickSec.open} />
            </button>
            {quickSec.open && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="px-2 py-1 rounded-lg border border-neutral-800"
                  onClick={()=>window.dispatchEvent(new CustomEvent('kodii-focus-search'))}>
                  Search
                </button>

                {/* Export */}
                <button className="px-2 py-1 rounded-lg border border-neutral-800" onClick={async ()=>{
                  if (!currentProject) return alert('No project selected')
                  alert('Export feature coming soon')
                }}>
                  Export
                </button>

                {/* Import */}
                <label className="px-2 py-1 rounded-lg border border-neutral-800 text-center cursor-pointer">
                  Import
                  <input type="file" accept=".kodii,.kodiipack" style={{ display:'none' }} onChange={async (e)=>{
                    const file = e.target.files?.[0]
                    if (!file) return
                    alert('Import feature coming soon')
                    e.currentTarget.value = ''
                  }}/>
                </label>
              </div>
            )}
          </div>

          {/* Threads header with inline search */}
          <div className="px-2 mt-3">
            <div className="text-xs opacity-70 mb-1">Conversations</div>
            <input
              value={filter}
              onChange={e => { setFilter(e.target.value); setSelectedIdx(0) }}
              placeholder="Filter threads..."
              className="w-full px-2 py-1 rounded-lg border border-neutral-800 bg-black text-white"
            />
          </div>

          {/* Threads list */}
          <div
            ref={listRef}
            className="px-2 mt-2 space-y-1 max-h-[42vh] overflow-auto rounded-lg"
            tabIndex={0}
            onKeyDown={onKeyDown}
          >
            {visible.map((t, i) => {
              const isCurrent = t.convId === chat.convId
              const isSelected = i === selectedIdx
              return (
                <div
                  key={t.convId}
                  className={`group border border-neutral-800 rounded-lg px-2 py-1 cursor-pointer
                    ${isCurrent ? 'border-orange-600/80' : ''} ${isSelected ? 'bg-neutral-900' : ''}`}
                  onClick={() => { setSelectedIdx(i); chat.load(t.convId) }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      className="text-left text-sm truncate"
                      title={t.title}
                      onDoubleClick={(e)=>{ e.stopPropagation(); rename(t.convId, t.title) }}
                    >
                      {t.title}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        className={`text-xs px-1 py-[2px] rounded border ${pins.includes(t.convId) ? 'border-orange-600' : 'border-neutral-700'}`}
                        onClick={(e)=>{ e.stopPropagation(); togglePin(t.convId) }}
                        title={pins.includes(t.convId) ? 'Unpin' : 'Pin'}
                      >📌</button>
                      <button
                        className="text-xs px-1 py-[2px] rounded border border-neutral-700"
                        onClick={async (e)=>{ e.stopPropagation(); if (confirm('Delete this conversation permanently')) { await deleteConversations([t.convId]); await loadThreads() } }}
                        title="Delete"
                      >✕</button>
                    </div>
                  </div>
                  <div className="text-[11px] opacity-60 truncate">{t.count} msgs • {new Date(t.updatedAt).toLocaleDateString()} • {t.preview}</div>
                </div>
              )
            })}
            {!visible.length && <div className="text-xs opacity-60 px-2 py-4">No matching threads</div>}
          </div>
        </div>

        {/* Footer */}
        <div className="pointer-events-auto px-2 pb-2">
          <div className="text-[10px] opacity-60">Device: {deviceId}</div>
        </div>
      </div>
    </aside>
  )
}
