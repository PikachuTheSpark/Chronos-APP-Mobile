import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Music, Play, Pause, ChevronUp, BellRing } from 'lucide-react';
import { SoundscapeType } from '../types';

interface DynamicIslandProps {
  isTimerRunning: boolean;
  timerSecondsLeft: number;
  timerMode: 'pomodoro' | 'stopwatch' | 'countdown';
  activeSoundscape: SoundscapeType;
  currentTaskTitle?: string;
  onTimerToggle: () => void;
  onOpenFocusTab: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  isTimerRunning,
  timerSecondsLeft,
  timerMode,
  activeSoundscape,
  currentTaskTitle,
  onTimerToggle,
  onOpenFocusTab,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatMinSec = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const hasActivity = isTimerRunning || activeSoundscape !== 'none';

  return (
    <div className="flex justify-center w-full select-none z-50">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        onClick={() => {
          if (hasActivity) {
            setIsExpanded(!isExpanded);
          } else {
            onOpenFocusTab();
          }
        }}
        className={`bg-black text-white cursor-pointer overflow-hidden transition-shadow shadow-md ${
          isExpanded
            ? 'w-[90%] max-w-[340px] rounded-3xl p-3 border border-white/10 shadow-2xl shadow-indigo-950/50'
            : hasActivity
            ? 'h-8 px-3.5 rounded-full flex items-center justify-between gap-3 border border-white/10'
            : 'h-6 w-28 rounded-full flex items-center justify-center opacity-85 hover:opacity-100'
        }`}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex flex-col gap-2.5 w-full text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                  <Timer className="w-3.5 h-3.5 animate-pulse" />
                  <span className="capitalize">{timerMode} Focus</span>
                </div>
                {activeSoundscape !== 'none' && (
                  <div className="flex items-center gap-1 text-[11px] text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded-full border border-sky-800/40">
                    <Music className="w-3 h-3" />
                    <span className="capitalize">{activeSoundscape.replace('_', ' ')}</span>
                  </div>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-slate-400"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-baseline justify-between py-1">
                <span className="font-mono-numbers text-2xl font-bold tracking-tight text-white">
                  {formatMinSec(timerSecondsLeft)}
                </span>
                <span className="text-[11px] text-slate-400 max-w-[140px] truncate text-right">
                  {currentTaskTitle || 'Free Focus Session'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <button
                  onClick={onOpenFocusTab}
                  className="text-[11px] text-indigo-300 hover:text-white font-medium flex items-center gap-1"
                >
                  Open Chronometer
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onTimerToggle}
                    className="p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : hasActivity ? (
            <motion.div
              key="compact-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full gap-2.5 text-[11px]"
            >
              <div className="flex items-center gap-1.5 text-indigo-400">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="font-mono-numbers font-medium text-white">
                  {formatMinSec(timerSecondsLeft)}
                </span>
              </div>

              {activeSoundscape !== 'none' && (
                <div className="flex items-center gap-0.5">
                  <span className="w-0.5 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-3.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1.5"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-700/60" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
