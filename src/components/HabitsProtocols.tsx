import React, { useState } from 'react';
import { HabitProtocol, CATEGORIES, BlockCategory } from '../types';
import { triggerHaptic, soundEngine } from '../utils/audio';
import { Check, Flame, Plus, Clock, Sparkles, Trash2 } from 'lucide-react';

interface HabitsProtocolsProps {
  protocols: HabitProtocol[];
  todayDateKey: string;
  onToggleProtocol: (protocolId: string) => void;
  onAddProtocol: (title: string, category: BlockCategory, targetTime?: string) => void;
  onDeleteProtocol: (protocolId: string) => void;
}

export const HabitsProtocols: React.FC<HabitsProtocolsProps> = ({
  protocols,
  todayDateKey,
  onToggleProtocol,
  onAddProtocol,
  onDeleteProtocol,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<BlockCategory>('protocol');
  const [newTargetTime, setNewTargetTime] = useState('08:00');

  const completedTodayCount = protocols.filter((p) =>
    p.completedDates.includes(todayDateKey)
  ).length;
  const progressPercent = protocols.length > 0 ? (completedTodayCount / protocols.length) * 100 : 0;

  const handleToggle = (id: string, isCurrentlyDone: boolean) => {
    if (!isCurrentlyDone) {
      triggerHaptic('success');
      soundEngine.playChime('check');
    } else {
      triggerHaptic('light');
    }
    onToggleProtocol(id);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    triggerHaptic('medium');
    onAddProtocol(newTitle.trim(), newCategory, newTargetTime);
    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto px-4 py-4 select-none bg-[#0b1326] text-[#dae2fd]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold font-display text-white tracking-tight">
            Daily Execution Protocols
          </h2>
          <p className="text-xs text-slate-400">Non-negotiable personal cognitive rituals</p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Ritual</span>
        </button>
      </div>

      {/* Daily Completion Meter Card */}
      <div className="p-4 mb-4 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Daily Adherence Rate</span>
            <span className="text-slate-500 text-xs">·</span>
            <span className="text-xs font-mono-numbers text-indigo-300">
              {completedTodayCount} of {protocols.length} Completed
            </span>
          </div>
          <span className="text-sm font-bold font-mono-numbers text-emerald-400">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add New Protocol Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="p-3.5 mb-4 rounded-2xl bg-[#171f33] border border-indigo-500/30 shadow-lg space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">New Protocol Definition</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Protocol Title</label>
            <input
              type="text"
              required
              placeholder="e.g., 20-min Zone 2 Cardio"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#0b1326] border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Time</label>
              <input
                type="time"
                value={newTargetTime}
                onChange={(e) => setNewTargetTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#0b1326] border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as BlockCategory)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#0b1326] border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                {(Object.keys(CATEGORIES) as BlockCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORIES[cat].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Save Protocol
          </button>
        </form>
      )}

      {/* Protocols List */}
      <div className="space-y-2.5 flex-1">
        {protocols.map((proto) => {
          const isDone = proto.completedDates.includes(todayDateKey);
          const cat = CATEGORIES[proto.category] || CATEGORIES.protocol;

          return (
            <div
              key={proto.id}
              onClick={() => handleToggle(proto.id, isDone)}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                isDone
                  ? 'bg-[#131b2e]/60 border-emerald-900/40 text-slate-400'
                  : 'bg-[#131b2e] border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Tactile Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(proto.id, isDone);
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'border-2 border-slate-600 hover:border-indigo-400 bg-transparent'
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="min-w-0">
                  <h4
                    className={`text-xs font-semibold tracking-tight truncate ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {proto.title}
                  </h4>
                  {/* Unboxed metadata */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    {proto.targetTime && (
                      <>
                        <span className="font-mono-numbers">{proto.targetTime}</span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span style={{ color: cat.color }} className="font-medium">
                      {cat.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Streak and delete */}
              <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-mono-numbers font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{proto.streak + (isDone ? 1 : 0)}d</span>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('warning');
                    onDeleteProtocol(proto.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
