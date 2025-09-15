#!/usr/bin/env bash
set -euo pipefail

# GhostDrop Production Pipeline — v1.0
# Usage:
#   ./ghostdrop.sh "GhostChat v2.0 — Sovereign AGA" ghostchat-v2 sovereign.ghostchat.app
# Args:
#   1: PROJECT_TITLE (required)
#   2: PROJECT_SLUG  (required, folder/repo-safe, e.g. ghostchat-v2)
#   3: DEMO_DOMAIN   (optional, e.g. demo.quantum-odyssey.com)

PROJECT_TITLE="${1:-}"
PROJECT_SLUG="${2:-}"
DEMO_DOMAIN="${3:-}"

if [[ -z "$PROJECT_TITLE" || -z "$PROJECT_SLUG" ]]; then
  echo "Usage: $0 \"Project Title\" project-slug [demo.domain]"
  exit 1
fi

YEAR=$(date +%Y)
TODAY=$(date +%F)
PKG_NAME="${PROJECT_SLUG// /-}"

# 1) Scaffold
mkdir -p "$PROJECT_SLUG"/{docs,scripts,src/components/v2,src/lib/persistence,src/store,src/types,public}
cd "$PROJECT_SLUG"

# 2) Files: License + Git basics
cat > LICENSE.md <<'EOF'
# Flame Public Use License (FPU) v1.0
This project is released under the Flame Public Use License v1.0.
You may use, modify, and distribute with attribution to GodsIMiJ AI Solutions.
The NODE Seal denotes sovereign authorship. Removing the seal violates this license.
EOF

cat > .gitignore <<'EOF'
node_modules
.out
.next
dist
.env
.env.*
.DS_Store
*.log
EOF

# 3) README (Flame-voiced, product + dev)
cat > README.md <<EOF
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
# clone + run
pnpm i || npm i
pnpm dev || npm run dev
\`\`\`

## 🔐 Sovereign Defaults
- Messages and session metadata remain **on-device**
- Cloud sync is **opt-in** and adapter-based
- BYOK (Bring Your Own Key) supported

## 🔗 Live Demo
${DEMO_DOMAIN:+https://$DEMO_DOMAIN}

## 🛡️ License & Seal
Flame Public Use License (FPU v1.0). NODE Seal denotes sovereign authorship. Verify in the Witness Hall.

**Built by GodsIMiJ AI Solutions — ${YEAR}**
EOF

# 4) Release Notes
cat > RELEASE_NOTES_${TODAY}.md <<EOF
# ${PROJECT_TITLE} — Release Notes (${TODAY})

## The Flame Speaks
Version minted. Tethers cut. Local vault established.

## Highlights
- Local-first persistence (IndexedDB + localStorage)
- Session management: pin/favorite, soft-delete
- Export/Import JSON (full-archive)
- Optional adapters: Supabase / GhostVault (deferred)
- BYOK modal for client-side keys
- Minimal Storage Inspector for transparency

## Verify the Covenant
- Browser DevTools → Application → IndexedDB → ghostchat_v2 (example)
- Toggle offline; UI remains functional (except external AI calls)

## Next
- v2.1: Per-session encryption (WebCrypto), selective sync, PWA
- v2.2: Theming, folders, voice I/O
- v2.3: Multi-device sync, conflict resolution
EOF

# 5) Product Hunt & Social blurbs
mkdir -p marketing
cat > marketing/PH_HEADLINE.txt <<'EOF'
Sovereign Local-First AI Chat (🔥)
EOF
cat > marketing/PH_TAGLINE_250c.txt <<'EOF'
Local-first AI chat: on-device storage (IndexedDB + localStorage), offline support, session management, and full data control. Privacy by default. Cloud sync only when you choose.
EOF
cat > marketing/POST_TWITTER.txt <<EOF
🔥 ${PROJECT_TITLE} is live.

• Local-first AI chat (on-device vault)
• Offline-capable core
• Pin, organize, export/import
• BYOK (client-side)
• Cloud sync adapters optional

Demo: ${DEMO_DOMAIN:+https://$DEMO_DOMAIN}
#SovereignAI #LocalFirst #PrivacyByDefault
EOF
cat > marketing/POST_LINKEDIN.txt <<EOF
We just launched ${PROJECT_TITLE} — a sovereign, local-first AI template.

• On-device storage (IndexedDB)
• Offline-capable core
• Session management + export/import
• BYOK (client-side keys)
• Optional cloud adapters

Demo: ${DEMO_DOMAIN:+https://$DEMO_DOMAIN}
This is how we build AI with dignity: privacy by default, cloud by consent.
EOF

# 6) Netlify config (safe demo defaults)
cat > netlify.toml <<'EOF'
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

# 7) BYOK modal (React/Next-friendly)
cat > src/components/v2/BYOKModal.tsx <<'EOF'
"use client";
import { useEffect, useState } from "react";

export default function BYOKModal() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");

  useEffect(() => {
    const has = localStorage.getItem("gc_openai_key");
    if (!has) setOpen(true);
  }, []);

  const save = () => {
    if (!key.trim()) return;
    localStorage.setItem("gc_openai_key", key.trim());
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl bg-neutral-900 p-5 border border-neutral-700">
        <h2 className="text-xl font-semibold mb-2">Ignite the Flame</h2>
        <p className="text-sm text-neutral-300 mb-4">
          Paste your OpenAI API key. It is stored <b>locally</b> and never sent to our servers.
        </p>
        <input
          className="w-full rounded bg-neutral-800 p-2 mb-3"
          type="password"
          placeholder="sk-..."
          value={key}
          onChange={(e)=>setKey(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 rounded bg-neutral-800" onClick={()=>setOpen(false)}>Later</button>
          <button className="px-3 py-2 rounded bg-orange-600" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
EOF

# 8) Storage Inspector (tiny transparency widget)
cat > src/components/v2/StorageInspector.tsx <<'EOF'
"use client";
import { useEffect, useState } from "react";

async function estimate(): Promise<{type:string,size:number}> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return { type: "indexeddb", size: (est.usage || 0) };
  }
  return { type: "unknown", size: 0 };
}

export default function StorageInspector() {
  const [info, setInfo] = useState<{type:string,size:number}>({type:"-",size:0});
  useEffect(()=>{ estimate().then(setInfo); },[]);
  const mb = (info.size / (1024*1024)).toFixed(2);
  return (
    <div className="fixed bottom-3 right-3 text-xs px-2 py-1 rounded bg-neutral-900 border border-neutral-700">
      <span>Vault: {info.type} • {mb} MB</span>
    </div>
  );
}
EOF

# 9) Types and stubs
cat > src/types/chat.ts <<'EOF'
export type MessageRole = "system" | "user" | "assistant" | "tool";
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  meta?: Record<string, any>;
}
export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  encrypted?: boolean;
  model?: string;
}
export interface SessionBundle { session: Session; messages: Message[]; }
EOF

cat > src/lib/persistence/README.txt <<'EOF'
Place your LocalAdapter (IndexedDB + localStorage fallback) here.
Adapter interface:
- init()
- listSessions()
- getSession(id)
- upsertSession(bundle)
- deleteSession(id)
- exportAll()
- importAll(bundles)
- clear()
EOF

cat > src/store/README.txt <<'EOF'
Place your Zustand chat store here (load, createSession, addMessage, switchSession, deleteSession).
EOF

# 10) Public assets
cat > public/NODE.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="NODE Seal">
  <rect width="128" height="128" rx="16" fill="#0f0f0f"/>
  <circle cx="64" cy="64" r="36" fill="none" stroke="#ff6a00" stroke-width="6"/>
  <circle cx="64" cy="64" r="4" fill="#ff6a00"/>
</svg>
EOF

# 11) Checklist (printed to console)
cat > scripts/CHECKLIST.md <<EOF
# GhostDrop Ship Checklist — ${PROJECT_TITLE}

- [ ] Code ready (runs locally: dev + build)
- [ ] README + Release Notes updated (${TODAY})
- [ ] BYOK modal in place (client-side only)
- [ ] Storage Inspector visible (transparency)
- [ ] Demo deployed to Netlify (${DEMO_DOMAIN:+https://$DEMO_DOMAIN})
- [ ] Product Hunt: headline + 250c tagline uploaded
- [ ] Social posts (Twitter/LinkedIn) scheduled
- [ ] Witness Hall entry queued (NODE seal reference)
- [ ] Tag repo: local-first, sovereign-ai, privacy
EOF

# 12) Ship script stub
cat > scripts/ship.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "🔥 GhostDrop Ship — quick steps"
echo "1) Commit & push"
echo "2) Netlify: create site, set build cmd, add env"
echo "3) Deploy prod"
echo "4) Verify BYOK + IndexedDB in DevTools"
echo "5) Publish Release Notes"
echo "6) Post socials with demo link"
EOF
chmod +x scripts/ship.sh

# 13) Final echo
echo "✅ GhostDrop scaffolded: ${PROJECT_SLUG}"
echo "   • README.md, LICENSE.md, RELEASE_NOTES_${TODAY}.md"
echo "   • marketing/ (PH headline + 250c, socials)"
echo "   • netlify.toml (safe headers)"
echo "   • BYOKModal.tsx, StorageInspector.tsx"
echo "   • scripts/CHECKLIST.md + scripts/ship.sh"
echo "🔥 Move your adapter/store/components into src/ and light the Flame."

