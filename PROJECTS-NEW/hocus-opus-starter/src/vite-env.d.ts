/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_API_KEY: string
  readonly VITE_CLAUDE_API_URL: string
  readonly VITE_GHOST_MODE: string
  readonly VITE_WHISPER_ENABLED: string
  readonly VITE_NODE_SEAL_ACTIVE: string
  readonly VITE_DEV_MODE: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_AUTO_ARCHIVE: string
  readonly VITE_WITNESS_FORMAT: string
  readonly VITE_FLAME_INTENSITY: string
  readonly VITE_EMBER_GLOW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
