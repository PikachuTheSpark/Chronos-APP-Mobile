import React, { useState, useEffect } from 'react';
import { TimeBlock, CATEGORIES, BlockCategory } from '../types';
import { BottomSheet } from './BottomSheet';
import { parseMinutesFromTime, formatTimeFromMinutes } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';
import { Clock, Tag, FileText, Check } from 'lucide-react';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockData: Omit<TimeBlock, 'id'>, existingId?: string) => void;
  initialStartTime?: string;
  selectedDate: string;
  editBlock?: TimeBlock;
}

const PRESET_DURATIONS = [15, 30, 45, 60, 90, 120];

const SUGGESTED_TITLES = [
  'Deep Code Sprint',
  'Architecture Refactor',
  'Design Review & Polish',
  'Client Alignment Call',
  'Zero Inbox & Communications',
  'Strategy & Planning',
];

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStartTime = '09:00',
  selectedDate,
  editBlock,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BlockCategory>('deep_work');
  const [startTime, setStartTime] = useState(initialStartTime);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editBlock) {
      setTitle(editBlock.title);
      setCategory(editBlock.category);
      setStartTime(editBlock.startTime);
      setDurationMinutes(editBlock.durationMinutes);
      setNotes(editBlock.notes || '');
    } else {
      setTitle('');
      setCategory('deep_work');
      setStartTime(initialStartTime || '09:00');
      setDurationMinutes(60);
      setNotes('');
    }
  }, [editBlock, initialStartTime, isOpen]);

  const calculateEndTime = () => {
    const startMins = parseMinutesFromTime(startTime);
    return formatTimeFromMinutes(startMins + durationMinutes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    triggerHaptic('medium');
    const endTime = calculateEndTime();
    onSave(
      {
        title: title.trim(),
        category,
        startTime,
        endTime,
        durationMinutes,
        date: selectedDate,
        completed: editBlock ? editBlock.completed : false,
        notes: notes.trim() || undefined,
        focusTimeSpent: editBlock?.focusTimeSpent || 0,
      },
      editBlock?.id
    );
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editBlock ? 'Modify Time-Block' : 'Schedule Precision Block'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Title Input */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">
            Focus Directive / Task Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Deep Architecture Sprint"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-[#0b1326] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />

          {/* Quick suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mt-2">
            {SUGGESTED_TITLES.map((sug) => (
              <button
                type="button"
                key={sug}
                onClick={() => {
                  triggerHaptic('light');
                  setTitle(sug);
                }}
                className="text-[10px] whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Category Picker */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
            Temporal Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CATEGORIES) as BlockCategory[]).map((catKey) => {
              const cat = CATEGORIES[catKey];
              const isSelected = category === catKey;

              return (
                <button
                  type="button"
                  key={catKey}
                  onClick={() => {
                    triggerHaptic('light');
                    setCategory(catKey);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-400 text-white ring-1 ring-indigo-400/40'
                      : 'bg-[#0b1326] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-medium truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time and Duration Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#0b1326] border border-slate-700 text-white font-mono-numbers focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              End Time (Calculated)
            </label>
            <div className="w-full px-3 py-2 text-xs rounded-xl bg-[#0b1326]/60 border border-slate-800 text-indigo-300 font-mono-numbers font-semibold">
              {calculateEndTime()}
            </div>
          </div>
        </div>

        {/* Duration Presets */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
            Duration Span
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {PRESET_DURATIONS.map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => {
                  triggerHaptic('light');
                  setDurationMinutes(mins);
                }}
                className={`px-3 py-1 text-xs font-mono-numbers font-medium rounded-lg whitespace-nowrap transition-colors ${
                  durationMinutes === mins
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#0b1326] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">
            Execution Notes & Micro-Deliverables
          </label>
          <textarea
            rows={2}
            placeholder="Sub-tasks, links, or success criteria..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-[#0b1326] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{editBlock ? 'Update Time-Block' : 'Anchor to Schedule'}</span>
        </button>
      </form>
    </BottomSheet>
  );
};
