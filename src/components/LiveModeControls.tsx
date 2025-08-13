import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualAPI } from '../services/RitualAPI';
import { FlameGlyph, GhostGlyph } from './SacredGlyphs';

export function LiveModeControls() {
  const { api, isLiveMode, setLiveMode } = useRitualAPI();
  const [systemHealth, setSystemHealth] = useState<{ [key: string]: boolean }>({});
  const [showHealth, setShowHealth] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    const health = await api.checkSystemHealth();
    setSystemHealth(health);
    setChecking(false);
  };

  useEffect(() => {
    checkHealth();
  }, [isLiveMode]);

  const toggleLiveMode = () => {
    setLiveMode(!isLiveMode);
  };

  const allSystemsOnline = Object.values(systemHealth).every(status => status);

  return (
    <div className="flex items-center gap-3">
      {/* System Health Indicator */}
      <div className="relative">
        <button
          onClick={() => setShowHealth(!showHealth)}
          className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
            allSystemsOnline 
              ? "bg-green-600/20 text-green-400 border border-green-500/30" 
              : "bg-red-600/20 text-red-400 border border-red-500/30"
          }`}
          disabled={checking}
        >
          {checking ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⟳
            </motion.div>
          ) : (
            <>
              {allSystemsOnline ? "🟢" : "🔴"} Systems
            </>
          )}
        </button>

        <AnimatePresence>
          {showHealth && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 bg-[#0e0e11] border border-[#1f1f25] rounded-lg p-3 min-w-48 z-50"
            >
              <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                <GhostGlyph glyph="⬢" size={12} />
                System Status
              </div>
              <div className="space-y-1">
                {Object.entries(systemHealth).map(([system, online]) => (
                  <div key={system} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{system}</span>
                    <span className={online ? "text-green-400" : "text-red-400"}>
                      {online ? "🟢 Online" : "🔴 Offline"}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={checkHealth}
                className="w-full mt-2 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs"
                disabled={checking}
              >
                {checking ? "Checking..." : "Refresh"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">Mode:</span>
        <button
          onClick={toggleLiveMode}
          className={`relative px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
            isLiveMode
              ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {isLiveMode ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🔴
                </motion.div>
                LIVE MODE
              </>
            ) : (
              <>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔵
                </motion.div>
                SIMULATION
              </>
            )}
          </div>
          
          {/* Warning indicator for live mode */}
          {isLiveMode && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </button>
      </div>

      {/* Live Mode Warning */}
      <AnimatePresence>
        {isLiveMode && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2 px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs"
          >
            <FlameGlyph size={12} />
            <span>Real Spirit Invocation Active</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Connection Status Component
export function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
      connected 
        ? "bg-green-600/20 text-green-400" 
        : "bg-red-600/20 text-red-400"
    }`}>
      <motion.div
        animate={{ scale: connected ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 1, repeat: connected ? Infinity : 0 }}
      >
        {connected ? "🟢" : "🔴"}
      </motion.div>
      <span>{connected ? "Connected" : "Disconnected"}</span>
    </div>
  );
}

// Ritual Progress Indicator
export function RitualProgress({ 
  stage, 
  progress, 
  liveMode 
}: { 
  stage: string; 
  progress: number; 
  liveMode: boolean; 
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${
            liveMode ? "bg-red-500" : "bg-blue-500"
          }`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-xs text-neutral-400">
          {liveMode ? "LIVE" : "SIM"} • {stage}
        </span>
      </div>
      
      <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${liveMode ? "bg-red-500" : "bg-blue-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
      
      <span className="text-xs text-neutral-400">{progress}%</span>
    </div>
  );
}
