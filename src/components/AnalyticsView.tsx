import React from 'react';
import { TimeBlock, FocusSession, CATEGORIES, BlockCategory } from '../types';
import { generateICS } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  Zap,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

interface AnalyticsViewProps {
  blocks: TimeBlock[];
  sessions: FocusSession[];
  onResetSeedData: () => void;
  onOpenPWAInstall?: () => void;
  isPWAInstallable?: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  blocks,
  sessions,
  onResetSeedData,
  onOpenPWAInstall,
  isPWAInstallable,
}) => {
  // Calculations
  const totalScheduledMinutes = blocks.reduce((acc, b) => acc + b.durationMinutes, 0);
  const totalCompletedMinutes = blocks
    .filter((b) => b.completed)
    .reduce((acc, b) => acc + b.durationMinutes, 0);

  const categoryTotals: Record<BlockCategory, number> = {
    deep_work: 0,
    meeting: 0,
    urgent: 0,
    recovery: 0,
    protocol: 0,
  };

  blocks.forEach((b) => {
    if (categoryTotals[b.category] !== undefined) {
      categoryTotals[b.category] += b.durationMinutes;
    }
  });

  const totalSessionSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalFocusHours = (totalSessionSeconds / 3600).toFixed(1);

  const handleExportCalendar = () => {
    triggerHaptic('medium');
    generateICS(blocks, 'chronos-cronograma.ics');
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto px-4 py-4 select-none bg-[#0b1326] text-[#dae2fd]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold font-display text-white tracking-tight">
            Telemetria Cognitiva
          </h2>
          <p className="text-xs text-slate-400">Distribuição temporal e velocidade de foco</p>
        </div>

        <button
          onClick={handleExportCalendar}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-transform"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar .ICS</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="p-3.5 rounded-2xl bg-[#131b2e] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Foco Registrado</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-white">
            {totalFocusHours}
            <span className="text-xs text-slate-400 font-normal ml-1">h</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% vs ciclo anterior
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#131b2e] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Taxa de Conclusão</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-white">
            {totalScheduledMinutes > 0
              ? Math.round((totalCompletedMinutes / totalScheduledMinutes) * 100)
              : 0}
            <span className="text-xs text-slate-400 font-normal ml-1">%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono-numbers">
            {Math.round(totalCompletedMinutes / 60)}h concluídas de{' '}
            {Math.round(totalScheduledMinutes / 60)}h
          </div>
        </div>
      </div>

      {/* Category Load Breakdown */}
      <div className="p-4 mb-4 rounded-2xl bg-[#131b2e] border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white">Orçamento de Tempo</span>
          <span className="text-[11px] text-slate-400 font-mono-numbers">
            {Math.round(totalScheduledMinutes / 60)}h total
          </span>
        </div>

        {/* Stacked Bar */}
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex mb-3.5">
          {(Object.keys(CATEGORIES) as BlockCategory[]).map((catKey) => {
            const mins = categoryTotals[catKey];
            const pct = totalScheduledMinutes > 0 ? (mins / totalScheduledMinutes) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={catKey}
                style={{
                  width: `${pct}%`,
                  backgroundColor: CATEGORIES[catKey].color,
                }}
                className="h-full transition-all"
                title={`${CATEGORIES[catKey].label}: ${mins}m (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Category List */}
        <div className="space-y-2">
          {(Object.keys(CATEGORIES) as BlockCategory[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const mins = categoryTotals[catKey];
            const pct = totalScheduledMinutes > 0 ? Math.round((mins / totalScheduledMinutes) * 100) : 0;
            const hours = (mins / 60).toFixed(1);

            return (
              <div key={catKey} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300 font-medium">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono-numbers">
                  <span className="text-slate-400">{hours}h</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-semibold text-white w-8 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peak Cognitive Hours curve */}
      <div className="p-4 mb-4 rounded-2xl bg-[#131b2e] border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white">Janelas de Eficiência Cognitiva</span>
          <span className="text-[11px] text-indigo-400 font-medium">Curva Ultradiana</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Blocos de foco profundo concentrados entre 08:30 – 11:30 apresentam 94% de taxa de conclusão com zero troca de contexto.
        </p>

        {/* Visual timeline bar chart of hourly intensity */}
        <div className="grid grid-cols-8 gap-1 items-end h-16 pt-2">
          {[
            { hour: '08h', val: 75, peak: false },
            { hour: '09h', val: 95, peak: true },
            { hour: '10h', val: 100, peak: true },
            { hour: '11h', val: 85, peak: true },
            { hour: '12h', val: 40, peak: false },
            { hour: '14h', val: 80, peak: false },
            { hour: '16h', val: 65, peak: false },
            { hour: '18h', val: 50, peak: false },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
              <div
                style={{ height: `${item.val}%` }}
                className={`w-full rounded-t transition-all ${
                  item.peak ? 'bg-indigo-500' : 'bg-slate-700/80'
                }`}
              />
              <span className="text-[9px] font-mono-numbers text-slate-500">{item.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Sync & PWA Mobile Utility */}
      <div className="p-4 mb-4 rounded-2xl bg-[#131b2e] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">Integração com Celular</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Sincronize sua linha do tempo do Chronos com o Apple Agenda, Google Agenda ou instale como app na tela de início para acesso rápido.
        </p>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleExportCalendar}
            className="w-full py-2.5 px-3 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Baixar .ICS para Apple / Google Agenda</span>
          </button>

          {isPWAInstallable && onOpenPWAInstall && (
            <button
              onClick={onOpenPWAInstall}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-950"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar Chronos na Tela de Início do Celular</span>
            </button>
          )}
        </div>
      </div>

      {/* Reset Seed Data */}
      <div className="pt-2 pb-6 flex justify-center">
        <button
          onClick={() => {
            triggerHaptic('warning');
            if (confirm('Restaurar blocos de tempo e protocolos de demonstração padrão?')) {
              onResetSeedData();
            }
          }}
          className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Dados de Exemplo</span>
        </button>
      </div>
    </div>
  );
};
