#!/usr/bin/env bash
# GhostDrop Production Pipeline — v1.1 (portable)
# Usage:
#   ./ghostdrop_v1_1.sh "Project Title" project-slug [demo.domain]

set -Eeuo pipefail

# --- helpers ---
die(){ echo "❌ $*" >&2; exit 1; }
req(){ command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }
normalize_slug(){ echo "$1" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9._-'; }

# --- sanity checks ---
[ "${BASH_VERSINFO:-0}" -ge 4 ] || die "Run with bash 4+ (use: bash ghostdrop_v1_1.sh …)"
[ $# -ge 2 ] || die "Usage: $0 \"Project Title\" project-slug [demo.domain]"
[[ "$(file -b --mime-encoding "$0" 2>/dev/null || echo utf-8)" != "utf-16" ]] || die "File looks UTF-16. Re-save as UTF-8."
# Prevent CRLF issues
if grep -q $'\r' "$0"; then die "Script has Windows line endings. Fix with: sed -i 's/\r$//' $0"; fi

req date
req mkdir
req cat

PROJECT_TITLE="test"
PROJECT_SLUG_RAW="test"
DEMO_DOMAIN="test.test.com"
PROJECT_SLUG="$(normalize_slug "$PROJECT_SLUG_RAW")"
[ -n "$PROJECT_SLUG" ] || die "Invalid project slug."

YEAR="$(date +%Y)"
TODAY="$(date +%F)"

ROOT="$PROJECT_SLUG"
echo "🔧 Scaffolding GhostDrop at: $ROOT"

# --- create dirs ---
mkdir -p "$ROOT"/{docs,marketing,scripts,src/{app,components/v2,lib/persistence,store,types},public}

# --- files ---
cat > "$ROOT/.gitignore" <<'EOF'
node_modules
.next
dist
.env
.env.*
.DS_Store
*.log
EOF

cat > "$ROOT/LICENSE.md" <<'EOF'
# Flame Public Use License (FPU) v1.0
Use, modify, and distribute with attribution to GodsIMiJ AI Solutions.
The NODE Seal denotes sovereign authorship. Removing the seal violates this license.
EOF

cat > "$ROOT/README.md" <<EOF
# 👻 ${PROJECT_TITLE}

**Forged in Flame. Born in Sovereignty.** A local-first, privacy-absolute template from the GodsIMiJ Empire. Your data lives with you; cloud bows only by consent.

## ✨ What it is
- **Local-First** vault using IndexedDB (with localStorage fallback)
- **Offline-Capable** core; AI calls only when invoked
- **Session Mastery** (pin, organize, soft-delete)
- **Data Portability** (one-click export/import)
- **Adapter Pattern** for optional Supabase/GhostVault sync

## 🚀 Quickstart
\`\`\`bash
pnpm i || npm i
pnpm dev || npm run dev
\`\`\`

## 🔐 Sovereign Defaults
Messages remain **on-device**. Cloud is **opt-in**. BYOK supported.

## 🔗 Live Demo
${DEMO_DOMAIN:+https://$DEMO_DOMAIN}

## 🛡️ License & Seal
Flame Public Use License (FPU v1.0). NODE Seal denotes sovereign authorship.
**Built by GodsIMiJ AI Solutions — ${YEAR}**
EOF

cat > "$ROOT/RELEASE_NOTES_${TODAY}.md" <<EOF
# ${PROJECT_TITLE} — Release Notes (${TODAY})

## Highlights
- Local-first persistence (IndexedDB + localStorage)
- Session management (pin/favorite, soft-delete)
- Export/Import JSON
- BYOK modal for client-side keys
- Minimal Storage Inspector for transparency

## Next
- v2.1: Per-session encryption (WebCrypto), selective sync, PWA
- v2.2: Themes, folders, voice I/O
- v2.3: Multi-device sync, conflict resolution
EOF

# marketing
cat > "$ROOT/marketing/PH_HEADLINE.txt" <<'EOF'
Sovereign Local-First AI (🔥)
EOF
cat > "$ROOT/marketing/PH_TAGLINE_250c.txt" <<'EOF'
Local-first AI template: on-device storage (IndexedDB + localStorage), offline support, session management, export/import. Privacy by default; cloud only by consent. BYOK.
EOF

# netlify (safe headers)
cat > "$ROOT/netlify.toml" <<'EOF'
[build]
  command = "npm run build"
  publish = ".next"

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.openai.com"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-Frame-Options = "DENY"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
EOF

# BYOK modal
cat > "$ROOT/src/components/v2/BYOKModal.tsx" <<'EOF'
"use client";
import { useEffect, useState } from "react";
export default function BYOKModal() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  useEffect(()=>{ if(!localStorage.getItem("gc_openai_key")) setOpen(true); },[]);
  const save = () => { if(!key.trim()) return; localStorage.setItem("gc_openai_key", key.trim()); setOpen(false); };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70">
      <div className="w-full max-w-md rounded-xl bg-neutral-900 p-5 border border-neutral-700">
        <h2 className="text-xl font-semibold mb-2">Ignite the Flame</h2>
        <p className="text-sm text-neutral-300 mb-4">Paste your OpenAI API key. Stored <b>locally</b>; never sent to our servers.</p>
        <input className="w-full rounded bg-neutral-800 p-2 mb-3" type="password" placeholder="sk-..." value={key} onChange={e=>setKey(e.target.value)} />
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 rounded bg-neutral-800" onClick={()=>setOpen(false)}>Later</button>
          <button className="px-3 py-2 rounded bg-orange-600" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
EOF

# Storage Inspector
cat > "$ROOT/src/components/v2/StorageInspector.tsx" <<'EOF'
"use client";
import { useEffect, useState } from "react";
export default function StorageInspector() {
  const [mb, setMb] = useState("0.00");
  useEffect(()=>{
    (async ()=>{
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        setMb(((est.usage||0)/(1024*1024)).toFixed(2));
      }
    })();
  },[]);
  return <div className="fixed bottom-3 right-3 text-xs px-2 py-1 rounded bg-neutral-900 border border-neutral-700">Vault: indexeddb • {mb} MB</div>;
}
EOF

# Types stubs
cat > "$ROOT/src/types/chat.ts" <<'EOF'
export type MessageRole = "system" | "user" | "assistant" | "tool";
export interface Message { id: string; role: MessageRole; content: string; createdAt: number; meta?: Record<string, any>; }
export interface Session { id: string; title: string; createdAt: number; updatedAt: number; pinned?: boolean; encrypted?: boolean; model?: string; }
export interface SessionBundle { session: Session; messages: Message[]; }
EOF

# Readme placeholders for store/persistence
cat > "$ROOT/src/lib/persistence/README.txt" <<'EOF'
Place your LocalAdapter (IndexedDB + localStorage fallback) here.
EOF
cat > "$ROOT/src/store/README.txt" <<'EOF'
Place your Zustand store here.
EOF

# NODE seal
cat > "$ROOT/public/NODE.svg" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="NODE Seal">
  <rect width="128" height="128" rx="16" fill="#0f0f0f"/>
  <circle cx="64" cy="64" r="36" fill="none" stroke="#ff6a00" stroke-width="6"/>
  <circle cx="64" cy="64" r="4" fill="#ff6a00"/>
</svg>
EOF

# Checklist
cat > "$ROOT/scripts/CHECKLIST.md" <<EOF
# GhostDrop Ship Checklist — ${PROJECT_TITLE}
- [ ] Runs locally (dev + build)
- [ ] README + Release Notes (${TODAY})
- [ ] BYOK modal wired
- [ ] Storage Inspector visible
- [ ] Netlify site created & deployed
- [ ] PH headline + 250c posted
- [ ] Social posts scheduled
EOF

# Ship helper
cat > "$ROOT/scripts/ship.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "🔥 Ship steps:"
echo "1) git init && git add . && git commit -m 'init ghostdrop'"
echo "2) Netlify: create site, set build command, add env (if any)"
echo "3) Deploy prod"
echo "4) Verify BYOK + IndexedDB"
echo "5) Publish release notes + socials"
EOF
chmod +x "$ROOT/scripts/ship.sh"

echo "✅ Done. Scaffold created at: $ROOT"

