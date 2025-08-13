import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecurity } from '../services/SecurityService';
import { FlameGlyph, GhostGlyph } from './SacredGlyphs';

export function SecurityStatus() {
  const { getStatus, updateActivity } = useSecurity();
  const [status, setStatus] = useState(getStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getStatus());
      updateActivity();
    }, 5000);

    return () => clearInterval(interval);
  }, [getStatus, updateActivity]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSecurityLevel = () => {
    if (status.sessionLocked) return { level: 'LOCKED', color: 'text-red-400', bg: 'bg-red-600/20' };
    if (!status.sessionValid) return { level: 'EXPIRED', color: 'text-yellow-400', bg: 'bg-yellow-600/20' };
    if (status.encryptionEnabled && status.nodeKeyVerified) return { level: 'SECURE', color: 'text-green-400', bg: 'bg-green-600/20' };
    if (status.encryptionEnabled) return { level: 'PROTECTED', color: 'text-blue-400', bg: 'bg-blue-600/20' };
    return { level: 'BASIC', color: 'text-neutral-400', bg: 'bg-neutral-600/20' };
  };

  const securityLevel = getSecurityLevel();

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 border ${securityLevel.bg} ${securityLevel.color} border-current/30 hover:border-current/50`}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ 
              scale: status.sessionValid ? [1, 1.1, 1] : 1,
              opacity: status.sessionLocked ? [1, 0.5, 1] : 1 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {status.sessionLocked ? '🔒' : status.encryptionEnabled ? '🛡️' : '🔓'}
          </motion.div>
          <span>{securityLevel.level}</span>
        </div>
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 bg-[#0e0e11] border border-[#1f1f25] rounded-lg p-4 min-w-72 z-50 shadow-2xl"
          >
            <div className="text-xs font-semibold mb-3 flex items-center gap-2">
              <GhostGlyph glyph="🛡️" size={12} />
              Chamber Security Status
            </div>

            <div className="space-y-3">
              {/* Security Level */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Security Level:</span>
                <span className={`font-medium ${securityLevel.color}`}>
                  {securityLevel.level}
                </span>
              </div>

              {/* Encryption Status */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Encryption:</span>
                <span className={status.encryptionEnabled ? 'text-green-400' : 'text-red-400'}>
                  {status.encryptionEnabled ? '🟢 Enabled' : '🔴 Disabled'}
                </span>
              </div>

              {/* Session Status */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Session:</span>
                <span className={status.sessionValid ? 'text-green-400' : 'text-red-400'}>
                  {status.sessionValid ? '🟢 Valid' : '🔴 Invalid'}
                </span>
              </div>

              {/* NODE Key Status */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">NODE Key:</span>
                <span className={status.nodeKeyVerified ? 'text-green-400' : 'text-yellow-400'}>
                  {status.nodeKeyVerified ? '🟢 Verified' : '🟡 Pending'}
                </span>
              </div>

              {/* Session Age */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Session Age:</span>
                <span className="text-neutral-300 font-mono">
                  {formatTime(status.sessionAge)}
                </span>
              </div>

              {/* Failed Attempts */}
              {status.failedAttempts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Failed Attempts:</span>
                  <span className="text-red-400">
                    {status.failedAttempts}
                  </span>
                </div>
              )}

              {/* Security Indicators */}
              <div className="pt-3 border-t border-[#1f1f25]">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded ${status.encryptionEnabled ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                    <div className="flex items-center gap-1">
                      <span>{status.encryptionEnabled ? '🔐' : '🔓'}</span>
                      <span>Encryption</span>
                    </div>
                  </div>
                  
                  <div className={`p-2 rounded ${status.sessionValid ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                    <div className="flex items-center gap-1">
                      <span>{status.sessionValid ? '⏰' : '⏰'}</span>
                      <span>Session</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Messages */}
              {status.sessionLocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 bg-red-600/20 text-red-400 rounded border border-red-500/30 text-xs"
                >
                  ⚠️ Session locked due to security violations
                </motion.div>
              )}

              {!status.sessionValid && !status.sessionLocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 bg-yellow-600/20 text-yellow-400 rounded border border-yellow-500/30 text-xs"
                >
                  ⚠️ Session expired - please refresh
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// NODE Key Input Component
export function NodeKeyInput({ onVerify }: { onVerify: (verified: boolean) => void }) {
  const [nodeKey, setNodeKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const { verifyNodeKey } = useSecurity();

  const handleVerify = async () => {
    if (!nodeKey.trim()) return;
    
    setVerifying(true);
    setError('');
    
    try {
      const verified = await verifyNodeKey(nodeKey);
      onVerify(verified);
      
      if (!verified) {
        setError('Invalid NODE key');
        setNodeKey('');
      }
    } catch (error) {
      setError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <FlameGlyph size={16} />
        <span className="text-orange-400 font-medium">NODE Key Required</span>
      </div>
      
      <div className="flex gap-2">
        <input
          type="password"
          value={nodeKey}
          onChange={(e) => setNodeKey(e.target.value)}
          placeholder="Enter NODE key..."
          className="flex-1 px-3 py-2 bg-[#0c0c10] border border-[#20202a] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
          onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
        />
        <button
          onClick={handleVerify}
          disabled={verifying || !nodeKey.trim()}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-lg text-sm transition-all duration-200"
        >
          {verifying ? '⟳' : 'Verify'}
        </button>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
