import React from 'react';
import { Clock, Timer, CheckSquare, BarChart2, Plus } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

export type TabKey = 'timeline' | 'focus' | 'protocols' | 'analytics';

interface BottomTabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onQuickAdd: () => void;
  isTimerActive?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  onQuickAdd,
  isTimerActive,
}) => {
  const tabs = [
    { key: 'timeline' as TabKey, label: 'Cronograma', icon: Clock },
    { key: 'focus' as TabKey, label: 'Foco', icon: Timer, badge: isTimerActive },
    { key: 'protocols' as TabKey, label: 'Protocolos', icon: CheckSquare },
    { key: 'analytics' as TabKey, label: 'Telemetria', icon: BarChart2 },
  ];

  return (
    <div className="w-full bg-[#0b1326]/95 backdrop-blur-md border-t border-slate-800/90 pb-safe select-none shrink-0 z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 relative">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => {
                triggerHaptic('light');
                onSelectTab(tab.key);
              }}
              className="flex-1 min-h-[44px] flex flex-col items-center justify-center relative py-1 transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? 'text-indigo-400 scale-110'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-indigo-300 font-semibold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-1" />
              )}
            </button>
          );
        })}

        {/* Center Quick Add Floating Button */}
        <div className="relative -top-3 flex items-center justify-center px-1">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onQuickAdd();
            }}
            title="Agendar Bloco de Foco"
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-900/60 transition-transform ring-4 ring-[#0b1326]"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => {
                triggerHaptic('light');
                onSelectTab(tab.key);
              }}
              className="flex-1 min-h-[44px] flex flex-col items-center justify-center relative py-1 transition-colors"
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive
                    ? 'text-indigo-400 scale-110'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-indigo-300 font-semibold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
