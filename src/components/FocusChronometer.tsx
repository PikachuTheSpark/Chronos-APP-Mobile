import React, { useState, useEffect, useRef } from 'react';
import { TimeBlock, SoundscapeType } from '../types';
import { soundEngine, triggerHaptic } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  Flame,
  Wind,
  ListPlus,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FocusChronometerProps {
  activeBlock?: TimeBlock;
  onSessionComplete: (durationSec: number, blockId?: string) => void;
  onClearActiveBlock: () => void;
  // Shared state with DynamicIsland
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  secondsLeft: number;
  setSecondsLeft: React.Dispatch<React.SetStateAction<number>>;
  timerMode: 'pomodoro' | 'stopwatch' | 'countdown';
  setTimerMode: React.Dispatch<React.SetStateAction<'pomodoro' | 'stopwatch' | 'countdown'>>;
  activeSoundscape: SoundscapeType;
  setActiveSoundscape: React.Dispatch<React.SetStateAction<SoundscapeType>>;
}

export const FocusChronometer: React.FC<FocusChronometerProps> = ({
  activeBlock,
  onSessionComplete,
  onClearActiveBlock,
  isTimerRunning,
  setIsTimerRunning,
  secondsLeft,
  setSecondsLeft,
  timerMode,
  setTimerMode,
  activeSoundscape,
  setActiveSoundscape,
}) => {
  const [initialDuration, setInitialDuration] = useState<number>(() => {
    return activeBlock ? activeBlock.durationMinutes * 60 : 25 * 60;
  });
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.5);

  const prevBlockIdRef = useRef<string | undefined>(activeBlock?.id);

  // Sync duration when active block changes
  useEffect(() => {
    if (activeBlock && activeBlock.id !== prevBlockIdRef.current) {
      prevBlockIdRef.current = activeBlock.id;
      const secs = activeBlock.durationMinutes * 60;
      setInitialDuration(secs);
      setSecondsLeft(secs);
      setTimerMode('countdown');
      setIsTimerRunning(false);
    }
  }, [activeBlock]);

  // Main countdown / stopwatch tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              // Timer finished
              soundEngine.playChime('complete');
              triggerHaptic('success');
              setIsTimerRunning(false);
              onSessionComplete(initialDuration, activeBlock?.id);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerMode, initialDuration, activeBlock]);

  // Soundscape handler
  const handleSelectSoundscape = (type: SoundscapeType) => {
    triggerHaptic('light');
    if (activeSoundscape === type) {
      soundEngine.stopSoundscape();
      setActiveSoundscape('none');
    } else {
      setActiveSoundscape(type);
      if (type !== 'none') {
        soundEngine.playSoundscape(type);
      } else {
        soundEngine.stopSoundscape();
      }
    }
  };

  const handleToggleTimer = () => {
    triggerHaptic('medium');
    if (!isTimerRunning) {
      soundEngine.playChime('start');
      // If soundscape is selected, resume it
      if (activeSoundscape !== 'none') {
        soundEngine.playSoundscape(activeSoundscape);
      }
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    triggerHaptic('light');
    setIsTimerRunning(false);
    if (timerMode === 'stopwatch') {
      setStopwatchSeconds(0);
      setLaps([]);
    } else {
      setSecondsLeft(initialDuration);
    }
  };

  const handleAddLap = () => {
    triggerHaptic('light');
    soundEngine.playChime('tick');
    setLaps((prev) => [stopwatchSeconds, ...prev]);
  };

  const handleFinishEarly = () => {
    triggerHaptic('success');
    soundEngine.playChime('complete');
    setIsTimerRunning(false);
    const timeSpent =
      timerMode === 'stopwatch' ? stopwatchSeconds : initialDuration - secondsLeft;
    onSessionComplete(Math.max(60, timeSpent), activeBlock?.id);
  };

  const handleModeChange = (mode: 'pomodoro' | 'stopwatch' | 'countdown') => {
    triggerHaptic('light');
    setIsTimerRunning(false);
    setTimerMode(mode);
    if (mode === 'pomodoro') {
      setInitialDuration(25 * 60);
      setSecondsLeft(25 * 60);
    } else if (mode === 'countdown') {
      const def = activeBlock ? activeBlock.durationMinutes * 60 : 45 * 60;
      setInitialDuration(def);
      setSecondsLeft(def);
    }
  };

  const handleSetPresetMinutes = (mins: number) => {
    triggerHaptic('light');
    setIsTimerRunning(false);
    setInitialDuration(mins * 60);
    setSecondsLeft(mins * 60);
  };

  // Formatter for display
  const currentSeconds = timerMode === 'stopwatch' ? stopwatchSeconds : secondsLeft;
  const displayHours = Math.floor(currentSeconds / 3600);
  const displayMins = Math.floor((currentSeconds % 3600) / 60);
  const displaySecs = currentSeconds % 60;

  // Progress ring math
  const progressPercent =
    timerMode === 'stopwatch'
      ? Math.min(100, (stopwatchSeconds % 3600) / 36)
      : initialDuration > 0
      ? ((initialDuration - secondsLeft) / initialDuration) * 100
      : 0;

  const strokeRadius = 110;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (progressPercent / 100) * strokeCircumference;

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto px-4 py-4 select-none bg-[#0b1326] text-[#dae2fd]">
      {/* Top Header Mode Selector */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold font-display text-white tracking-tight">
            Cronômetro de Precisão
          </h2>
          <p className="text-xs text-slate-400">Fluxo cognitivo & orquestração temporal</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#131b2e] rounded-xl border border-slate-800">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              timerMode === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => handleModeChange('countdown')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              timerMode === 'countdown'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Meta
          </button>
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              timerMode === 'stopwatch'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cronômetro
          </button>
        </div>
      </div>

      {/* Active TimeBlock Banner if linked */}
      {activeBlock && (
        <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">
              Bloco Vinculado
            </span>
            <span className="text-xs font-bold text-white truncate">{activeBlock.title}</span>
            <span className="text-[11px] text-slate-400 font-mono-numbers">
              {activeBlock.startTime} - {activeBlock.endTime} ({activeBlock.durationMinutes}m)
            </span>
          </div>
          <button
            onClick={onClearActiveBlock}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
          >
            Desvincular
          </button>
        </div>
      )}

      {/* Circular Progress & Clock Face */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <div className="relative w-[260px] h-[260px] flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            {/* Background track */}
            <circle
              cx="130"
              cy="130"
              r={strokeRadius}
              className="stroke-slate-800/80"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="130"
              cy="130"
              r={strokeRadius}
              stroke="currentColor"
              className={`transition-all duration-500 ease-out ${
                isTimerRunning ? 'text-indigo-500' : 'text-slate-500'
              }`}
              strokeWidth="9"
              strokeDasharray={strokeCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="font-mono-numbers text-4xl font-bold tracking-tight text-white flex items-baseline">
              {displayHours > 0 && (
                <>
                  <span>{String(displayHours).padStart(2, '0')}</span>
                  <span className="text-slate-500 text-2xl mx-0.5">:</span>
                </>
              )}
              <span>{String(displayMins).padStart(2, '0')}</span>
              <span className="text-slate-500 text-2xl mx-0.5">:</span>
              <span>{String(displaySecs).padStart(2, '0')}</span>
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span>{isTimerRunning ? 'Foco Profundo Ativo' : 'Sessão Pronta'}</span>
            </div>

            {timerMode !== 'stopwatch' && (
              <span className="text-[11px] text-slate-500 mt-1 font-mono-numbers">
                {Math.round(progressPercent)}% decorrido
              </span>
            )}
          </div>
        </div>

        {/* Quick Presets for Pomodoro/Target */}
        {timerMode !== 'stopwatch' && !isTimerRunning && (
          <div className="flex items-center gap-1.5 mt-2">
            {[15, 25, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSetPresetMinutes(mins)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono-numbers font-medium transition-colors ${
                  initialDuration === mins * 60
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#131b2e] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center justify-center gap-3 my-3">
        <button
          onClick={handleResetTimer}
          title="Redefinir Cronômetro"
          className="w-12 h-12 rounded-full bg-[#131b2e] hover:bg-[#1e293b] text-slate-300 flex items-center justify-center border border-slate-800 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleToggleTimer}
          className={`h-14 px-8 rounded-full font-bold text-sm flex items-center gap-2.5 text-white shadow-lg active:scale-95 transition-all ${
            isTimerRunning
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/60'
          }`}
        >
          {isTimerRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pausar Foco</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Sessão</span>
            </>
          )}
        </button>

        {timerMode === 'stopwatch' ? (
          <button
            onClick={handleAddLap}
            disabled={!isTimerRunning}
            title="Gravar Volta"
            className="w-12 h-12 rounded-full bg-[#131b2e] hover:bg-[#1e293b] text-slate-300 disabled:opacity-40 flex items-center justify-center border border-slate-800 active:scale-95 transition-all"
          >
            <ListPlus className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleFinishEarly}
            title="Concluir e Salvar Sessão"
            className="w-12 h-12 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Laps List for Stopwatch */}
      {timerMode === 'stopwatch' && laps.length > 0 && (
        <div className="mt-2 p-3 rounded-xl bg-[#131b2e] border border-slate-800 max-h-32 overflow-y-auto">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
            Intervalos Registrados
          </span>
          <div className="space-y-1">
            {laps.map((lapSec, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs font-mono-numbers text-slate-300 py-0.5 border-b border-slate-800/60"
              >
                <span>Intervalo #{laps.length - i}</span>
                <span className="font-semibold text-white">
                  {Math.floor(lapSec / 60)}m {lapSec % 60}s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Ambient Soundscape Panel (Web Audio API) */}
      <div className="mt-4 p-3.5 rounded-2xl bg-[#131b2e] border border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white tracking-tight">
              Motor Acústico de Foco
            </span>
          </div>
          <button
            onClick={() => {
              const muted = soundEngine.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Sound Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSelectSoundscape('binaural_gamma')}
            className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
              activeSoundscape === 'binaural_gamma'
                ? 'bg-indigo-600 text-white font-medium ring-1 ring-white/30'
                : 'bg-[#171f33] text-slate-300 hover:bg-[#1e293b]'
            }`}
          >
            <Radio className="w-4 h-4 shrink-0 text-indigo-300" />
            <div className="min-w-0">
              <span className="text-xs font-semibold block truncate">Foco Gama 40Hz</span>
              <span className="text-[10px] text-slate-400 block">Neuro-sincronização</span>
            </div>
          </button>

          <button
            onClick={() => handleSelectSoundscape('rain')}
            className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
              activeSoundscape === 'rain'
                ? 'bg-indigo-600 text-white font-medium ring-1 ring-white/30'
                : 'bg-[#171f33] text-slate-300 hover:bg-[#1e293b]'
            }`}
          >
            <CloudRain className="w-4 h-4 shrink-0 text-sky-300" />
            <div className="min-w-0">
              <span className="text-xs font-semibold block truncate">Chuva Suave</span>
              <span className="text-[10px] text-slate-400 block">Ruído rosa imersivo</span>
            </div>
          </button>

          <button
            onClick={() => handleSelectSoundscape('deep_space')}
            className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
              activeSoundscape === 'deep_space'
                ? 'bg-indigo-600 text-white font-medium ring-1 ring-white/30'
                : 'bg-[#171f33] text-slate-300 hover:bg-[#1e293b]'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
            <div className="min-w-0">
              <span className="text-xs font-semibold block truncate">Espaço Profundo</span>
              <span className="text-[10px] text-slate-400 block">Graves calmantes</span>
            </div>
          </button>

          <button
            onClick={() => handleSelectSoundscape('cyber_fan')}
            className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
              activeSoundscape === 'cyber_fan'
                ? 'bg-indigo-600 text-white font-medium ring-1 ring-white/30'
                : 'bg-[#171f33] text-slate-300 hover:bg-[#1e293b]'
            }`}
          >
            <Wind className="w-4 h-4 shrink-0 text-emerald-300" />
            <div className="min-w-0">
              <span className="text-xs font-semibold block truncate">Ventilador Cyber</span>
              <span className="text-[10px] text-slate-400 block">Fluxo de ar contínuo</span>
            </div>
          </button>
        </div>

        {/* Volume Slider */}
        {activeSoundscape !== 'none' && (
          <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSoundVolume(val);
                soundEngine.setVolume(val);
              }}
              className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono-numbers text-slate-400">
              {Math.round(soundVolume * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
