import React from 'react';
import { TimeBlock, CATEGORIES } from '../types';
import { BottomSheet } from './BottomSheet';
import { triggerHaptic, soundEngine } from '../utils/audio';
import {
  Play,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface BlockDetailSheetProps {
  block?: TimeBlock;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (blockId: string) => void;
  onStartFocus: (block: TimeBlock) => void;
  onEdit: (block: TimeBlock) => void;
  onDelete: (blockId: string) => void;
}

export const BlockDetailSheet: React.FC<BlockDetailSheetProps> = ({
  block,
  isOpen,
  onClose,
  onToggleComplete,
  onStartFocus,
  onEdit,
  onDelete,
}) => {
  if (!block) return null;

  const cat = CATEGORIES[block.category] || CATEGORIES.deep_work;

  const handleToggle = () => {
    if (!block.completed) {
      triggerHaptic('success');
      soundEngine.playChime('check');
    } else {
      triggerHaptic('light');
    }
    onToggleComplete(block.id);
  };

  const handleStart = () => {
    triggerHaptic('medium');
    soundEngine.playChime('start');
    onStartFocus(block);
    onClose();
  };

  const handleDelete = () => {
    triggerHaptic('warning');
    if (confirm('Deseja excluir este bloco agendado?')) {
      onDelete(block.id);
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 pt-1">
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span style={{ color: cat.color }} className="text-xs font-semibold uppercase tracking-wider">
              {cat.label}
            </span>
          </div>
          <div className="text-[11px] font-mono-numbers text-slate-400">
            {block.durationMinutes} min de bloco
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-bold font-display text-white ${
            block.completed ? 'line-through text-slate-400' : ''
          }`}
        >
          {block.title}
        </h3>

        {/* Time Span */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0b1326] border border-slate-800 text-xs font-mono-numbers">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white text-sm">
              {block.startTime} – {block.endTime}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-400">
            Data: <span className="text-slate-200">{block.date}</span>
          </div>
        </div>

        {/* Notes */}
        {block.notes && (
          <div className="p-3 rounded-xl bg-[#0b1326] border border-slate-800 text-xs text-slate-300">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Notas de Entrega
            </span>
            <p className="whitespace-pre-wrap">{block.notes}</p>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="space-y-2 pt-2">
          {/* Start Focus Timer */}
          {!block.completed && (
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Iniciar Cronômetro de Foco</span>
            </button>
          )}

          {/* Toggle Done Button */}
          <button
            onClick={handleToggle}
            className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 ${
              block.completed
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{block.completed ? 'Marcar como Incompleto' : 'Concluir Bloco de Tempo'}</span>
          </button>

          {/* Edit & Delete row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                triggerHaptic('light');
                onEdit(block);
              }}
              className="py-2.5 rounded-xl bg-[#0b1326] border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Detalhes</span>
            </button>

            <button
              onClick={handleDelete}
              className="py-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 hover:bg-rose-900/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Bloco</span>
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
