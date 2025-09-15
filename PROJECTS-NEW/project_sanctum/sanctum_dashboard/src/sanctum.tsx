import React, { useEffect, useMemo, useState } from "react";

const API = "http://localhost:8787";
function cls(...xs: (string | false | null | undefined)[]) { return xs.filter(Boolean).join(" "); }
const Card: React.FC<React.PropsWithChildren<{title?: string; subtitle?: string; className?: string;}>> = ({ title, subtitle, className, children }) => (
  <div className={cls("rounded-2xl shadow-sm border border-white/10 bg-zinc-900/50 backdrop-blur p-4", className)}>
    {title && (<div className="mb-2"><h3 className="text-lg font-semibold text-zinc-100">{title}</h3>{subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}</div>)}
    {children}
  </div>
);
const Pill: React.FC<{label: string}> = ({ label }) => (<span className="px-2 py-0.5 rounded-full text-xs border border-white/10 bg-zinc-800 text-zinc-200">{label}</span>);
function useApi<T>(path: string | null, demo: T) {
  const [data, setData] = useState<T>(demo);
  useEffect(() => { let cancelled = false; (async () => { if (!path) return; try { const r = await fetch(`${API}${path}`); if (r.ok) { const j = await r.json(); if (!cancelled) setData(j); } } catch {} })(); return () => { cancelled = true; }; }, [path]);
  return { data };
}
const demoProjects = [{ id:1, name:"TrapGPT", root:"/Users/you/Empire/TrapGPT", types:"node,docker", first_seen:"-", last_scanned:"-" }];
const demoSearch = [];
const ToolbarButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => (<button className={cls("px-3 py-2 rounded-xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-200 hover:from-zinc-700 hover:to-zinc-800", className)} {...props}>{children}</button>);
const Table: React.FC<{ columns: string[]; rows: React.ReactNode[][]; empty?: string; }> = ({ columns, rows, empty }) => (
  <div className="overflow-auto rounded-2xl border border-white/10">
    <table className="min-w-full text-sm"><thead className="bg-zinc-900/70"><tr>{columns.map((c,i)=>(<th key={i} className="text-left font-medium text-zinc-300 px-3 py-2 whitespace-nowrap">{c}</th>))}</tr></thead>
    <tbody className="divide-y divide-white/5">{rows.length===0?(<tr><td colSpan={columns.length} className="px-3 py-6 text-center text-zinc-500">{empty||"No data."}</td></tr>):rows.map((r,ri)=>(<tr key={ri} className="hover:bg-zinc-900/50">{r.map((cell,ci)=>(<td key={ci} className="px-3 py-2 align-top text-zinc-200">{cell}</td>))}</tr>))}</tbody></table>
  </div>
);
const ProjectSanctumDashboard: React.FC = () => {
  const { data: projects } = useApi("/api/projects", demoProjects);
  const [query, setQuery] = useState(""); const [results, setResults] = useState<any[]>([]); const [selectedProject, setSelectedProject] = useState<number | null>(null);
  useEffect(()=>{ const t=setTimeout(async()=>{ if(!query){ setResults([]); return;} try{ const r=await fetch(`${API}/api/search?q=${encodeURIComponent(query)}`); const j=await r.json(); setResults(j);}catch{ setResults([]);} },220); return ()=>clearTimeout(t);},[query]);
  const selected = useMemo(()=> (projects as any[]).find(p=>p.id===selectedProject)||null,[projects,selectedProject]);
  return (<div className="min-h-screen bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(255,140,0,0.12),transparent),radial-gradient(800px_400px_at_80%_10%,rgba(0,200,255,0.10),transparent)] text-zinc-100">
    <header className="border-b border-white/10 backdrop-blur sticky top-0 z-30"><div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow" /><div><h1 className="text-xl font-semibold tracking-tight">Project Sanctum</h1><p className="text-xs text-zinc-400">Sovereign Project Index · Local-First</p></div></div></header>
    <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <aside className="col-span-12 lg:col-span-3"><Card title="Projects" subtitle={`${(projects as any[]).length} indexed`}><div className="space-y-2">{(projects as any[]).map((p:any)=>(<button key={p.id} onClick={()=>setSelectedProject(p.id)} className={cls("w-full text-left p-3 rounded-xl border transition", selectedProject===p.id?"border-amber-400/30 bg-amber-500/10":"border-white/10 hover:bg-white/5")}><div className="flex items-center justify-between"><span className="font-medium">{p.name}</span><span className="text-xs text-zinc-400">{p.types||"-"}</span></div><p className="text-xs text-zinc-400 mt-1 truncate">{p.root}</p></button>))}</div></Card></aside>
      <section className="col-span-12 lg:col-span-9 space-y-6">
        <Card><div className="flex items-center gap-3"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search files by name/path…" className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/40"/></div></Card>
        <Card title="Files"><Table columns={["Project","Path","Size","Modified","Open"]} rows={results.map((r:any)=>[<span className="font-medium">{r.project}</span>,<code className="text-amber-300">{r.relpath}</code>,`${r.size} bytes`,<span className="text-zinc-400">{r.mtime}</span>,<a href={`vscode://file${r.root}/${r.relpath}`} className="underline text-amber-300">VS Code</a>])} empty={query? "No matches.":"Type to search files across indexed projects."}/></Card>
      </section>
    </main>
    <footer className="max-w-7xl mx-auto px-4 py-6 text-xs text-zinc-500">NODE · Project Sanctum v0.1 — Built for the GodsIMiJ Empire · Local-first, sovereign, and fast.</footer>
  </div>);
};
export default ProjectSanctumDashboard;
