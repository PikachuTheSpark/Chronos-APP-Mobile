import React, { useRef, useEffect, useState } from 'react';
import { TimeBlock, CATEGORIES, BlockCategory } from '../types';
import { parseMinutesFromTime, formatTimeFromMinutes } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';
import { Clock, CheckCircle2, Play, Plus, Navigation } from 'lucide-react';

interface TimelineViewProps {
  blocks: TimeBlock[];
  selectedDate: string;
  todayDateKey: string;
  onSelectBlock: (block: TimeBlock) => void;
  onSlotClick: (timeStr: string) => void;
  onStartFocus: (block: TimeBlock) => void;
  activeFocusBlockId?: string;
}

const START_HOUR = 6;  // 06:00
const END_HOUR = 23;   // 23:00
const HOUR_HEIGHT = 72; // Pixels per hour
const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // 1.2 px per minute

export const TimelineView: React.FC<TimelineViewProps> = ({
  blocks,
  selectedDate,
  todayDateKey,
  onSelectBlock,
  onSlotClick,
  onStartFocus,
  activeFocusBlockId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<BlockCategory | 'all'>('all');

  const isToday = selectedDate === todayDateKey;

  // Live minute ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentMinutes(d.getHours() * 60 + d.getMinutes());
    }, 15000); // update every 15s
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to Now Line or first block on mount
  useEffect(() => {
    if (containerRef.current) {
      if (isToday) {
        const nowOffset = (currentMinutes - START_HOUR * 60) * MINUTE_HEIGHT;
        const targetScroll = Math.max(0, nowOffset - 200);
        containerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
      } else if (blocks.length > 0) {
        const firstMins = parseMinutesFromTime(blocks[0].startTime);
        const targetScroll = Math.max(0, (firstMins - START_HOUR * 60) * MINUTE_HEIGHT - 120);
        containerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, [selectedDate]);

  const scrollToNow = () => {
    if (containerRef.current) {
      triggerHaptic('light');
      const nowOffset = (currentMinutes - START_HOUR * 60) * MINUTE_HEIGHT;
      containerRef.current.scrollTo({ top: Math.max(0, nowOffset - 200), behavior: 'smooth' });
    }
  };

  const filteredBlocks = blocks.filter((b) => {
    if (activeCategoryFilter === 'all') return true;
    return b.category === activeCategoryFilter;
  });

  const nowTopPosition = (currentMinutes - START_HOUR * 60) * MINUTE_HEIGHT;
  const isNowWithinTimeline = currentMinutes >= START_HOUR * 60 && currentMinutes <= (END_HOUR + 1) * 60;

  // Hours array for left time column
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="relative flex flex-col flex-1 h-full overflow-hidden bg-[#0b1326]">
      {/* Category filter segmented tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/80 bg-[#0e172a]/90 backdrop-blur-sm overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveCategoryFilter('all');
          }}
          className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeCategoryFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          Todos ({blocks.length})
        </button>
        {(Object.keys(CATEGORIES) as BlockCategory[]).map((catKey) => {
          const cat = CATEGORIES[catKey];
          const count = blocks.filter((b) => b.category === catKey).length;
          return (
            <button
              key={catKey}
              onClick={() => {
                triggerHaptic('light');
                setActiveCategoryFilter(catKey);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeCategoryFilter === catKey
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.label}</span>
              {count > 0 && <span className="text-[10px] opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Floating Jump to Now button */}
      {isToday && isNowWithinTimeline && (
        <button
          onClick={scrollToNow}
          className="absolute bottom-20 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/40 backdrop-blur-md active:scale-95 transition-transform"
        >
          <Navigation className="w-3.5 h-3.5 fill-current" />
          <span>Agora ({formatTimeFromMinutes(currentMinutes)})</span>
        </button>
      )}

      {/* Main scrollable timeline canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden touch-pan-y"
        style={{ height: 'calc(100% - 45px)' }}
      >
        <div
          className="relative min-w-full"
          style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT + 40}px` }}
        >
          {/* Hour grid lines and labels */}
          {hours.map((hour) => {
            const top = (hour - START_HOUR) * HOUR_HEIGHT;
            const hourFormatted = `${String(hour).padStart(2, '0')}:00`;

            return (
              <div key={hour} className="absolute left-0 right-0 group" style={{ top: `${top}px` }}>
                {/* Primary Hour line */}
                <div className="flex items-center h-4">
                  <span className="w-14 pl-2 text-[11px] font-mono font-medium text-slate-500 select-none">
                    {hourFormatted}
                  </span>
                  <div className="flex-1 h-[1px] bg-slate-800/80" />
                </div>

                {/* 15m, 30m, 45m subtle sub-ticks */}
                <div
                  onClick={() => onSlotClick(`${String(hour).padStart(2, '0')}:15`)}
                  className="absolute left-14 right-0 h-[1px] bg-slate-800/30 cursor-pointer hover:bg-indigo-500/20"
                  style={{ top: `${HOUR_HEIGHT * 0.25}px` }}
                />
                <div
                  onClick={() => onSlotClick(`${String(hour).padStart(2, '0')}:30`)}
                  className="absolute left-14 right-0 h-[1px] bg-slate-800/40 cursor-pointer hover:bg-indigo-500/20"
                  style={{ top: `${HOUR_HEIGHT * 0.5}px` }}
                />
                <div
                  onClick={() => onSlotClick(`${String(hour).padStart(2, '0')}:45`)}
                  className="absolute left-14 right-0 h-[1px] bg-slate-800/30 cursor-pointer hover:bg-indigo-500/20"
                  style={{ top: `${HOUR_HEIGHT * 0.75}px` }}
                />

                {/* Empty slot tap zone to add block */}
                <div
                  onClick={() => onSlotClick(hourFormatted)}
                  className="absolute left-14 right-0 h-[68px] top-1 cursor-pointer hover:bg-indigo-900/10 transition-colors"
                  title={`Toque para agendar às ${hourFormatted}`}
                />
              </div>
            );
          })}

          {/* Render Time-Blocks */}
          {filteredBlocks.map((block) => {
            const startMins = parseMinutesFromTime(block.startTime);
            const endMins = parseMinutesFromTime(block.endTime);
            const top = (startMins - START_HOUR * 60) * MINUTE_HEIGHT;
            const height = Math.max(34, (endMins - startMins) * MINUTE_HEIGHT);
            const cat = CATEGORIES[block.category] || CATEGORIES.deep_work;

            const isPast = isToday && endMins < currentMinutes;
            const isCurrentlyActive =
              isToday && startMins <= currentMinutes && currentMinutes <= endMins;
            const isFocusingNow = activeFocusBlockId === block.id;

            return (
              <div
                key={block.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectBlock(block);
                }}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  borderLeftColor: cat.color,
                }}
                className={`absolute left-16 right-3 rounded-lg border-l-[3.5px] p-2 transition-all cursor-pointer select-none overflow-hidden ${
                  cat.bgTint
                } border border-slate-700/40 hover:border-slate-500/70 shadow-sm ${
                  isFocusingNow
                    ? 'ring-2 ring-indigo-400 focus-active-ring z-20'
                    : isCurrentlyActive
                    ? 'ring-1 ring-white/30 z-10'
                    : 'z-0'
                } ${isPast && !isFocusingNow ? 'opacity-60' : 'opacity-100'}`}
              >
                <div className="flex items-start justify-between gap-1.5 h-full">
                  <div className="flex flex-col justify-between flex-1 min-w-0 h-full">
                    <div>
                      {/* Unboxed Metadata: Time and Category */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono-numbers">
                        <span className="font-semibold text-white">
                          {block.startTime} – {block.endTime}
                        </span>
                        <span className="text-slate-500" aria-hidden="true">·</span>
                        <span style={{ color: cat.color }} className="font-medium">
                          {block.durationMinutes}m
                        </span>
                        {block.completed && (
                          <>
                            <span className="text-slate-500" aria-hidden="true">·</span>
                            <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Feito
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-xs font-semibold leading-snug tracking-tight text-slate-100 mt-0.5 truncate ${
                          block.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {block.title}
                      </h4>
                    </div>

                    {/* Notes preview if height allows */}
                    {height > 58 && block.notes && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                        {block.notes}
                      </p>
                    )}
                  </div>

                  {/* Quick Action: Start Focus Timer button */}
                  {!block.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        onStartFocus(block);
                      }}
                      title="Iniciar Cronômetro de Foco"
                      className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-indigo-300" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* The Live "Now Line" (Laser Beam) */}
          {isToday && isNowWithinTimeline && (
            <div
              style={{ top: `${nowTopPosition}px` }}
              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            >
              {/* Left time badge */}
              <div className="w-14 pl-1 flex items-center justify-end pr-1">
                <span className="bg-rose-600 text-white font-mono-numbers font-bold text-[10px] px-1 py-0.5 rounded shadow-sm">
                  {formatTimeFromMinutes(currentMinutes)}
                </span>
              </div>

              {/* Pulsating laser node */}
              <div className="relative flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute opacity-75" />
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white shadow-sm" />
              </div>

              {/* Glowing laser line */}
              <div className="flex-1 h-[2px] bg-gradient-to-r from-rose-500 via-rose-500 to-indigo-500 laser-glow" />
            </div>
          )}

          {/* Empty state if no blocks on selected date */}
          {filteredBlocks.length === 0 && (
            <div className="absolute inset-x-6 top-32 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#131b2e]/60 border border-slate-800">
              <Clock className="w-8 h-8 text-indigo-400/60 mb-2" />
              <p className="text-sm font-semibold text-slate-200">Nenhum bloco agendado</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Toque em qualquer horário na grade ou use o botão + para organizar seu dia de foco.
              </p>
              <button
                onClick={() => onSlotClick('09:00')}
                className="mt-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agendar Bloco das 09:00
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
