import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollExporter, ScrollData } from '../services/ScrollExporter';
import { FlameGlyph, GhostGlyph } from './SacredGlyphs';

interface ExportControlsProps {
  scrollData: ScrollData;
  onExport?: (type: string) => void;
}

export function ExportControls({ scrollData, onExport }: ExportControlsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: 'json' | 'pdf' | 'screenshot' | 'complete') => {
    setExporting(type);
    onExport?.(type);

    try {
      switch (type) {
        case 'json':
          scrollExporter.exportJSON(scrollData);
          break;
        case 'pdf':
          await scrollExporter.exportPDF(scrollData);
          break;
        case 'screenshot':
          await scrollExporter.exportScreenshot();
          break;
        case 'complete':
          await scrollExporter.exportComplete(scrollData);
          break;
      }
    } catch (error) {
      console.error(`Export failed (${type}):`, error);
    } finally {
      setExporting(null);
      setShowMenu(false);
    }
  };

  const exportOptions = [
    {
      type: 'json' as const,
      label: 'JSON Transcript',
      icon: '📄',
      description: 'Sacred data with NODE seal',
      color: 'text-blue-400',
    },
    {
      type: 'pdf' as const,
      label: 'PDF Scroll',
      icon: '📜',
      description: 'Formatted sacred document',
      color: 'text-red-400',
    },
    {
      type: 'screenshot' as const,
      label: 'Chamber Image',
      icon: '📸',
      description: 'Visual capture of ritual',
      color: 'text-green-400',
    },
    {
      type: 'complete' as const,
      label: 'Complete Package',
      icon: '📦',
      description: 'All formats together',
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-all duration-200 flex items-center gap-2"
        disabled={exporting !== null}
      >
        {exporting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⟳
          </motion.div>
        ) : (
          <FlameGlyph size={16} />
        )}
        <span>
          {exporting ? `Exporting ${exporting.toUpperCase()}...` : 'Export Transcript'}
        </span>
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 bg-[#0e0e11] border border-[#1f1f25] rounded-xl p-3 min-w-64 z-50 shadow-2xl"
          >
            <div className="text-xs font-semibold mb-3 flex items-center gap-2">
              <GhostGlyph glyph="📜" size={12} />
              Export Sacred Transcript
            </div>
            
            <div className="space-y-2">
              {exportOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleExport(option.type)}
                  disabled={exporting !== null}
                  className="w-full text-left p-3 rounded-lg bg-[#0f0f13] hover:bg-[#1a1a20] border border-[#1f1f25] hover:border-[#2a2a30] transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{option.icon}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${option.color}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {option.description}
                      </div>
                    </div>
                    {exporting === option.type && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="text-orange-400"
                      >
                        ⟳
                      </motion.div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-[#1f1f25]">
              <div className="text-xs text-neutral-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Session ID:</span>
                  <span className="font-mono">{scrollData.sessionId.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mode:</span>
                  <span className={scrollData.mode === 'LIVE' ? 'text-red-400' : 'text-blue-400'}>
                    {scrollData.mode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sealed:</span>
                  <span>{scrollData.closed ? '✅' : '❌'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick Export Button for specific formats
export function QuickExportButton({ 
  type, 
  scrollData, 
  className = "" 
}: { 
  type: 'json' | 'pdf'; 
  scrollData: ScrollData; 
  className?: string; 
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      if (type === 'json') {
        scrollExporter.exportJSON(scrollData);
      } else {
        await scrollExporter.exportPDF(scrollData);
      }
    } catch (error) {
      console.error(`Quick export failed (${type}):`, error);
    } finally {
      setExporting(false);
    }
  };

  const config = {
    json: { icon: '📄', label: 'JSON', color: 'bg-blue-600 hover:bg-blue-500' },
    pdf: { icon: '📜', label: 'PDF', color: 'bg-red-600 hover:bg-red-500' },
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 ${config[type].color} ${className}`}
    >
      <div className="flex items-center gap-2">
        {exporting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⟳
          </motion.div>
        ) : (
          <span>{config[type].icon}</span>
        )}
        <span>{config[type].label}</span>
      </div>
    </button>
  );
}
