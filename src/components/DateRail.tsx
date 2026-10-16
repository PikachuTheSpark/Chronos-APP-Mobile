import React, { useRef, useEffect } from 'react';
import { formatDateKey } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface DateRailProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (dateKey: string) => void;
  todayDateKey: string;
  datesWithTasks: Set<string>;
}

export const DateRail: React.FC<DateRailProps> = ({
  selectedDate,
  onSelectDate,
  todayDateKey,
  datesWithTasks,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 14 days around today (-4 days to +9 days)
  const days = React.useMemo(() => {
    const today = new Date(todayDateKey + 'T12:00:00');
    const list: Array<{ key: string; dateObj: Date; dayName: string; dayNum: number; isToday: boolean }> = [];
    
    for (let offset = -4; offset <= 9; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const key = formatDateKey(d);
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayNum = d.getDate();
      list.push({
        key,
        dateObj: d,
        dayName,
        dayNum,
        isToday: key === todayDateKey,
      });
    }
    return list;
  }, [todayDateKey]);

  // Auto-scroll selected date into view on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  const handleSelect = (key: string) => {
    triggerHaptic('light');
    onSelectDate(key);
  };

  return (
    <div className="w-full bg-[#0b1326]/90 backdrop-blur-md border-b border-slate-800/80 px-2 py-2">
      <div className="flex items-center justify-between px-2 mb-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-200 capitalize">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        {selectedDate !== todayDateKey && (
          <button
            onClick={() => handleSelect(todayDateKey)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium tracking-tight px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 active:scale-95 transition-all"
          >
            Ir para Hoje
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((item) => {
          const isSelected = item.key === selectedDate;
          const hasTasks = datesWithTasks.has(item.key);

          return (
            <button
              key={item.key}
              data-selected={isSelected}
              onClick={() => handleSelect(item.key)}
              className={`relative flex flex-col items-center justify-center min-w-[50px] h-[64px] rounded-2xl px-2 py-1.5 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : item.isToday
                  ? 'bg-[#171f33] text-indigo-300 border border-indigo-500/30'
                  : 'bg-[#131b2e] text-slate-400 hover:text-slate-200 hover:bg-[#171f33] border border-slate-800/60'
              }`}
            >
              <span
                className={`text-[10px] font-semibold tracking-wider uppercase ${
                  isSelected ? 'text-indigo-100' : item.isToday ? 'text-indigo-400' : 'text-slate-400'
                }`}
              >
                {item.dayName}
              </span>
              <span
                className={`font-mono-numbers text-lg font-bold mt-0.5 ${
                  isSelected ? 'text-white' : item.isToday ? 'text-indigo-200' : 'text-slate-200'
                }`}
              >
                {item.dayNum}
              </span>

              {/* Status indicator pip */}
              <div className="flex items-center gap-1 mt-1">
                {hasTasks && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-indigo-400'
                    }`}
                  />
                )}
                {item.isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
