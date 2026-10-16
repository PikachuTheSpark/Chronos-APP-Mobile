import { TimeBlock, HabitProtocol, FocusSession, UserProfile } from '../types';

const STORAGE_KEYS = {
  BLOCKS: 'chronos_blocks_v1',
  PROTOCOLS: 'chronos_protocols_v1',
  SESSIONS: 'chronos_sessions_v1',
  PROFILES: 'chronos_profiles_v1',
  ACTIVE_PROFILE: 'chronos_active_profile_v1',
  SETTINGS: 'chronos_settings_v1',
};

// Returns date string "YYYY-MM-DD"
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseMinutesFromTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatTimeFromMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getInitialSeedBlocks(todayKey: string): TimeBlock[] {
  // Gera blocos de exemplo para hoje e datas ao redor
  return [
    {
      id: 'block-1',
      title: 'Sprint Matinal de Arquitetura',
      category: 'deep_work',
      startTime: '08:30',
      endTime: '10:00',
      durationMinutes: 90,
      date: todayKey,
      completed: true,
      notes: 'Finalização do schema de banco e regras de cache do service worker',
      focusTimeSpent: 5400,
    },
    {
      id: 'block-2',
      title: 'Revisão de Design & Daily Sync',
      category: 'meeting',
      startTime: '10:15',
      endTime: '11:00',
      durationMinutes: 45,
      date: todayKey,
      completed: true,
      notes: 'Revisão da ergonomia no celular e zonas de alcance do polegar',
    },
    {
      id: 'block-3',
      title: 'Refatoração da Linha do Tempo',
      category: 'deep_work',
      startTime: '11:30',
      endTime: '13:00',
      durationMinutes: 90,
      date: todayKey,
      completed: true,
      notes: 'Cálculo de coordenadas do laser da linha do tempo e marcações de 15 min',
      focusTimeSpent: 5400,
    },
    {
      id: 'block-4',
      title: 'Recarga Nutricional & Caminhada',
      category: 'recovery',
      startTime: '13:00',
      endTime: '14:00',
      durationMinutes: 60,
      date: todayKey,
      completed: true,
      notes: 'Refeição balanceada e exposição à luz solar natural',
    },
    {
      id: 'block-5',
      title: 'Foco Ativo: Polimento Mobile & Hápticos',
      category: 'deep_work',
      startTime: '14:30',
      endTime: '16:30',
      durationMinutes: 120,
      date: todayKey,
      completed: false,
      notes: 'Motor acústico de frequências e gestos no painel inferior',
    },
    {
      id: 'block-6',
      title: 'Deploy em Produção & Teste de Carga',
      category: 'urgent',
      startTime: '17:00',
      endTime: '18:00',
      durationMinutes: 60,
      date: todayKey,
      completed: false,
      notes: 'Verificação de resiliência offline PWA e alvos de toque',
    },
    {
      id: 'block-7',
      title: 'Desconexão Digital Noturna',
      category: 'protocol',
      startTime: '19:00',
      endTime: '19:30',
      durationMinutes: 30,
      date: todayKey,
      completed: false,
      notes: 'Zerar notificações e definir as 3 prioridades de amanhã',
    },
  ];
}

export function getInitialProtocols(todayKey: string): HabitProtocol[] {
  return [
    {
      id: 'proto-1',
      title: 'Luz Solar Matinal & 500ml de Água',
      category: 'protocol',
      streak: 14,
      completedDates: [todayKey],
      targetTime: '07:30',
    },
    {
      id: 'proto-2',
      title: 'Bloco de 90 min de Foco Profundo',
      category: 'deep_work',
      streak: 8,
      completedDates: [todayKey],
      targetTime: '08:30',
    },
    {
      id: 'proto-3',
      title: 'Zerar Caixa de Entrada & Mensagens',
      category: 'recovery',
      streak: 5,
      completedDates: [],
      targetTime: '13:00',
    },
    {
      id: 'proto-4',
      title: 'Exercício Físico / Cardio Zona 2',
      category: 'protocol',
      streak: 11,
      completedDates: [],
      targetTime: '17:30',
    },
    {
      id: 'proto-5',
      title: 'Telas Desligadas 60 min Antes de Dormir',
      category: 'protocol',
      streak: 6,
      completedDates: [],
      targetTime: '22:00',
    },
  ];
}

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'prof-1',
    name: 'Caio Eduardo',
    email: 'caioeduardopn150@gmail.com',
    avatarColor: '#6366f1',
    roleTitle: 'Engenheiro de Software',
    dailyFocusGoalHours: 4,
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'prof-2',
    name: 'Perfil Pessoal',
    email: 'pessoal@chronos.app',
    avatarColor: '#0ea5e9',
    roleTitle: 'Estudos & Hábitos',
    dailyFocusGoalHours: 2,
    createdAt: Date.now() - 86400000 * 3,
  },
];

export function loadProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  saveProfiles(DEFAULT_PROFILES);
  return DEFAULT_PROFILES;
}

export function saveProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

export function getActiveProfileId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
    if (active) return active;
  } catch {
    // fallback
  }
  return DEFAULT_PROFILES[0].id;
}

export function setActiveProfileId(profileId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, profileId);
  } catch {
    // ignore
  }
}

// Storage helpers scoped by profile
export function loadBlocks(todayKey: string, profileId?: string): TimeBlock[] {
  const pid = profileId || getActiveProfileId();
  const profileKey = `${STORAGE_KEYS.BLOCKS}_${pid}`;
  try {
    const raw = localStorage.getItem(profileKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Also check legacy storage for default profile
    if (pid === 'prof-1') {
      const legacy = localStorage.getItem(STORAGE_KEYS.BLOCKS);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          saveBlocks(parsedLegacy, pid);
          return parsedLegacy;
        }
      }
    }
  } catch {
    // fallback
  }
  // If first profile, provide initial seed blocks; otherwise provide starter set
  const seeds = pid === 'prof-1' ? getInitialSeedBlocks(todayKey) : [
    {
      id: `block-${pid}-1`,
      title: 'Leitura & Aprendizado Autônomo',
      category: 'deep_work' as const,
      startTime: '09:00',
      endTime: '10:30',
      durationMinutes: 90,
      date: todayKey,
      completed: false,
      notes: 'Capítulo sobre modelos mentais e hábitos de foco',
    },
    {
      id: `block-${pid}-2`,
      title: 'Treino de Força & Alongamento',
      category: 'recovery' as const,
      startTime: '17:30',
      endTime: '18:30',
      durationMinutes: 60,
      date: todayKey,
      completed: false,
    },
  ];
  saveBlocks(seeds, pid);
  return seeds;
}

export function saveBlocks(blocks: TimeBlock[], profileId?: string): void {
  const pid = profileId || getActiveProfileId();
  const profileKey = `${STORAGE_KEYS.BLOCKS}_${pid}`;
  try {
    localStorage.setItem(profileKey, JSON.stringify(blocks));
  } catch {
    // ignore
  }
}

export function loadProtocols(todayKey: string, profileId?: string): HabitProtocol[] {
  const pid = profileId || getActiveProfileId();
  const profileKey = `${STORAGE_KEYS.PROTOCOLS}_${pid}`;
  try {
    const raw = localStorage.getItem(profileKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    if (pid === 'prof-1') {
      const legacy = localStorage.getItem(STORAGE_KEYS.PROTOCOLS);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          saveProtocols(parsedLegacy, pid);
          return parsedLegacy;
        }
      }
    }
  } catch {
    // fallback
  }
  const seeds = pid === 'prof-1' ? getInitialProtocols(todayKey) : [
    {
      id: `proto-${pid}-1`,
      title: 'Beber 2L de Água ao longo do dia',
      category: 'protocol' as const,
      streak: 3,
      completedDates: [todayKey],
      targetTime: '09:00',
    },
    {
      id: `proto-${pid}-2`,
      title: '30 min de Leitura Focada',
      category: 'deep_work' as const,
      streak: 5,
      completedDates: [],
      targetTime: '21:00',
    },
  ];
  saveProtocols(seeds, pid);
  return seeds;
}

export function saveProtocols(protocols: HabitProtocol[], profileId?: string): void {
  const pid = profileId || getActiveProfileId();
  const profileKey = `${STORAGE_KEYS.PROTOCOLS}_${pid}`;
  try {
    localStorage.setItem(profileKey, JSON.stringify(protocols));
  } catch {
    // ignore
  }
}

export function loadSessions(profileId?: string): FocusSession[] {
  const pid = profileId || getActiveProfileId();
  const profileKey = `${STORAGE_KEYS.SESSIONS}_${pid}`;
  try {
    const raw = localStorage.getItem(profileKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return pid === 'prof-1' ? [
    {
      id: 'sess-1',
      blockTitle: 'Sprint Matinal de Arquitetura',
      durationSeconds: 3600,
      timestamp: Date.now() - 18000000,
      mode: 'pomodoro',
      category: 'deep_work',
    },
    {
      id: 'sess-2',
      blockTitle: 'Refatoração da Linha do Tempo',
      durationSeconds: 5400,
      timestamp: Date.now() - 7200000,
      mode: 'countdown',
      category: 'deep_work',
    },
  ] : [];
}

export function saveSessions(sessions: FocusSession[], profileId?: string): void {
  const pid = profileId || getActiveProfileId();
  const profileKey = `${STORAGE_KEYS.SESSIONS}_${pid}`;
  try {
    localStorage.setItem(profileKey, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

// Generate standard .ics (iCalendar) file from blocks
export function generateICS(blocks: TimeBlock[], filename: string = 'chronos-cronograma.ics'): void {
  const now = new Date();
  const timeStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chronos Precision Focus//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Cronograma de Foco Chronos',
  ];

  for (const block of blocks) {
    const [startH, startM] = block.startTime.split(':').map(Number);
    const [endH, endM] = block.endTime.split(':').map(Number);
    const [year, month, day] = block.date.split('-').map(Number);

    const startDate = new Date(year, month - 1, day, startH, startM);
    const endDate = new Date(year, month - 1, day, endH, endM);

    const pad = (n: number) => String(n).padStart(2, '0');
    const dtStart = `${startDate.getFullYear()}${pad(startDate.getMonth() + 1)}${pad(startDate.getDate())}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
    const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${block.id}@chronos.precision`,
      `DTSTAMP:${timeStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${block.title}`,
      `DESCRIPTION:${block.notes || ''} [Categoria: ${block.category}]`,
      `STATUS:${block.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    );
  }

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
