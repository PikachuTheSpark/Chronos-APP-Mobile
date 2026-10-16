import React, { useState, useEffect, useMemo } from 'react';
import {
  TimeBlock,
  HabitProtocol,
  FocusSession,
  BlockCategory,
  SoundscapeType,
  UserProfile,
} from './types';
import {
  formatDateKey,
  loadProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId,
  loadBlocks,
  saveBlocks,
  loadProtocols,
  saveProtocols,
  loadSessions,
  saveSessions,
  getInitialSeedBlocks,
  getInitialProtocols,
} from './utils/storage';
import { triggerHaptic, soundEngine } from './utils/audio';

import { PhoneSimulator } from './components/PhoneSimulator';
import { DynamicIsland } from './components/DynamicIsland';
import { DateRail } from './components/DateRail';
import { TimelineView } from './components/TimelineView';
import { FocusChronometer } from './components/FocusChronometer';
import { HabitsProtocols } from './components/HabitsProtocols';
import { AnalyticsView } from './components/AnalyticsView';
import { BottomTabBar, TabKey } from './components/BottomTabBar';
import { BlockModal } from './components/BlockModal';
import { BlockDetailSheet } from './components/BlockDetailSheet';
import { ProfileAuthModal } from './components/ProfileAuthModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

import { Plus, Flame, Clock, User, Shield } from 'lucide-react';

export default function App() {
  // Today's date key e.g. "2026-10-16"
  const todayDateKey = useMemo(() => formatDateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDateKey);
  const [currentTab, setCurrentTab] = useState<TabKey>('timeline');

  // User Profiles Management
  const [profiles, setProfiles] = useState<UserProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => getActiveProfileId());

  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // Core Data Scoped per Active Profile
  const [blocks, setBlocks] = useState<TimeBlock[]>(() =>
    loadBlocks(todayDateKey, activeProfileId)
  );
  const [protocols, setProtocols] = useState<HabitProtocol[]>(() =>
    loadProtocols(todayDateKey, activeProfileId)
  );
  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    loadSessions(activeProfileId)
  );

  // Active Focus Timer State (Shared with DynamicIsland)
  const [activeFocusBlock, setActiveFocusBlock] = useState<TimeBlock | undefined>(undefined);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'stopwatch' | 'countdown'>('pomodoro');
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('none');

  // Modals & Bottom Sheets
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [slotInitialTime, setSlotInitialTime] = useState('09:00');
  const [selectedBlockForDetail, setSelectedBlockForDetail] = useState<TimeBlock | undefined>(undefined);
  const [blockToEdit, setBlockToEdit] = useState<TimeBlock | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // When switching profile, reload data for that profile
  const handleSelectProfile = (newProfileId: string) => {
    setActiveProfileIdState(newProfileId);
    setActiveProfileId(newProfileId);

    const profileBlocks = loadBlocks(todayDateKey, newProfileId);
    const profileProtocols = loadProtocols(todayDateKey, newProfileId);
    const profileSessions = loadSessions(newProfileId);

    setBlocks(profileBlocks);
    setProtocols(profileProtocols);
    setSessions(profileSessions);
    setActiveFocusBlock(undefined);
    setIsTimerRunning(false);
  };

  const handleCreateProfile = (profileData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newProf: UserProfile = {
      ...profileData,
      id: `prof-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updatedProfiles = [...profiles, newProf];
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
    handleSelectProfile(newProf.id);
  };

  const handleDeleteProfile = (profileIdToDelete: string) => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== profileIdToDelete);
    setProfiles(remaining);
    saveProfiles(remaining);
    if (activeProfileId === profileIdToDelete) {
      handleSelectProfile(remaining[0].id);
    }
  };

  // Sync to localStorage scoped by active profile
  useEffect(() => {
    saveBlocks(blocks, activeProfileId);
  }, [blocks, activeProfileId]);

  useEffect(() => {
    saveProtocols(protocols, activeProfileId);
  }, [protocols, activeProfileId]);

  useEffect(() => {
    saveSessions(sessions, activeProfileId);
  }, [sessions, activeProfileId]);

  // Set of dates with blocks for the DateRail indicator dots
  const datesWithTasks = useMemo(() => {
    return new Set(blocks.map((b) => b.date));
  }, [blocks]);

  // Filter blocks for selected date
  const currentDayBlocks = useMemo(() => {
    return blocks
      .filter((b) => b.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [blocks, selectedDate]);

  // Streak calculations
  const totalHabitsCompletedToday = useMemo(() => {
    return protocols.filter((p) => p.completedDates.includes(todayDateKey)).length;
  }, [protocols, todayDateKey]);

  // Handlers for Blocks
  const handleSaveBlock = (
    blockData: Omit<TimeBlock, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setBlocks((prev) =>
        prev.map((b) => (b.id === existingId ? { ...blockData, id: existingId } : b))
      );
      if (activeFocusBlock?.id === existingId) {
        setActiveFocusBlock({ ...blockData, id: existingId });
      }
    } else {
      const newBlock: TimeBlock = {
        ...blockData,
        id: `block-${Date.now()}`,
      };
      setBlocks((prev) => [...prev, newBlock]);
    }
  };

  const handleToggleBlockComplete = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, completed: !b.completed } : b))
    );
    if (selectedBlockForDetail && selectedBlockForDetail.id === blockId) {
      setSelectedBlockForDetail((prev) =>
        prev ? { ...prev, completed: !prev.completed } : undefined
      );
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (activeFocusBlock?.id === blockId) {
      setActiveFocusBlock(undefined);
    }
  };

  const handleStartFocusFromBlock = (block: TimeBlock) => {
    setActiveFocusBlock(block);
    setCurrentTab('focus');
  };

  const handleSlotClick = (timeStr: string) => {
    triggerHaptic('light');
    setSlotInitialTime(timeStr);
    setBlockToEdit(undefined);
    setIsCreateModalOpen(true);
  };

  // Protocols Handlers
  const handleToggleProtocol = (protocolId: string) => {
    setProtocols((prev) =>
      prev.map((proto) => {
        if (proto.id !== protocolId) return proto;
        const isDone = proto.completedDates.includes(todayDateKey);
        const newDates = isDone
          ? proto.completedDates.filter((d) => d !== todayDateKey)
          : [...proto.completedDates, todayDateKey];
        return {
          ...proto,
          completedDates: newDates,
        };
      })
    );
  };

  const handleAddProtocol = (
    title: string,
    category: BlockCategory,
    targetTime?: string
  ) => {
    const newProto: HabitProtocol = {
      id: `proto-${Date.now()}`,
      title,
      category,
      streak: 1,
      completedDates: [],
      targetTime,
    };
    setProtocols((prev) => [...prev, newProto]);
  };

  const handleDeleteProtocol = (protocolId: string) => {
    setProtocols((prev) => prev.filter((p) => p.id !== protocolId));
  };

  // Session Logging Handler
  const handleSessionComplete = (durationSec: number, blockId?: string) => {
    const newSession: FocusSession = {
      id: `sess-${Date.now()}`,
      blockId,
      blockTitle: activeFocusBlock?.title || 'Sessão de Foco Livre',
      durationSeconds: durationSec,
      timestamp: Date.now(),
      mode: timerMode,
      category: activeFocusBlock?.category || 'deep_work',
    };
    setSessions((prev) => [newSession, ...prev]);

    // If linked to a block, also mark block completed
    if (blockId) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
                ...b,
                completed: true,
                focusTimeSpent: (b.focusTimeSpent || 0) + durationSec,
              }
            : b
        )
      );
    }
  };

  const handleResetSeedData = () => {
    const seeds = getInitialSeedBlocks(todayDateKey);
    const protos = getInitialProtocols(todayDateKey);
    setBlocks(seeds);
    setProtocols(protos);
    setSessions([]);
    setActiveFocusBlock(undefined);
    setIsTimerRunning(false);
  };

  // Dynamic Island component instance to pass into PhoneSimulator
  const dynamicIslandElement = (
    <DynamicIsland
      isTimerRunning={isTimerRunning}
      timerSecondsLeft={timerSecondsLeft}
      timerMode={timerMode}
      activeSoundscape={activeSoundscape}
      currentTaskTitle={activeFocusBlock?.title}
      onTimerToggle={() => {
        setIsTimerRunning((prev) => !prev);
      }}
      onOpenFocusTab={() => setCurrentTab('focus')}
    />
  );

  return (
    <PhoneSimulator dynamicIslandContent={dynamicIslandElement}>
      <div className="relative flex flex-col flex-1 h-full overflow-hidden bg-[#0b1326] text-[#dae2fd]">
        {/* PWA Install Banner if applicable */}
        <PWAInstallBanner />

        {/* Top App Bar Header conforming to Top Bar Contract */}
        <header className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800/80 bg-[#0b1326]/90 backdrop-blur-md shrink-0 select-none z-30">
          {/* Brand Wordmark (Zone 1) */}
          <div className="flex items-center gap-1.5">
            <span className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap">
              CHRONOS
            </span>
            <span className="text-[10px] font-mono-numbers text-indigo-400 bg-indigo-950/70 border border-indigo-800/40 px-1.5 py-0.2 rounded font-semibold">
              PRECISÃO
            </span>
          </div>

          {/* User Profile / Login Button & Quick Metrics (Zone 2) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsProfileModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#131b2e] hover:bg-[#1e293b] border border-slate-700/80 transition-all text-xs active:scale-95 shadow-xs"
              title="Perfil & Login"
            >
              <div
                style={{ backgroundColor: activeProfile.avatarColor }}
                className="w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs"
              >
                {activeProfile.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-[11px] font-semibold text-slate-200 max-w-[80px] truncate">
                {activeProfile.name.split(' ')[0]}
              </span>
            </button>

            <div className="flex items-center gap-1 text-amber-400 font-mono-numbers text-[11px]">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{totalHabitsCompletedToday}</span>
            </div>
          </div>

          {/* Action Trigger (Zone 3) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                setSlotInitialTime('10:00');
                setBlockToEdit(undefined);
                setIsCreateModalOpen(true);
              }}
              title="Adicionar Bloco de Tempo"
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* Horizontal Date Rail (Only on Timeline Tab) */}
        {currentTab === 'timeline' && (
          <DateRail
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            todayDateKey={todayDateKey}
            datesWithTasks={datesWithTasks}
          />
        )}

        {/* Tab Content Canvas */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {currentTab === 'timeline' && (
            <TimelineView
              blocks={currentDayBlocks}
              selectedDate={selectedDate}
              todayDateKey={todayDateKey}
              onSelectBlock={(block) => setSelectedBlockForDetail(block)}
              onSlotClick={handleSlotClick}
              onStartFocus={handleStartFocusFromBlock}
              activeFocusBlockId={activeFocusBlock?.id}
            />
          )}

          {currentTab === 'focus' && (
            <FocusChronometer
              activeBlock={activeFocusBlock}
              onSessionComplete={handleSessionComplete}
              onClearActiveBlock={() => setActiveFocusBlock(undefined)}
              isTimerRunning={isTimerRunning}
              setIsTimerRunning={setIsTimerRunning}
              secondsLeft={timerSecondsLeft}
              setSecondsLeft={setTimerSecondsLeft}
              timerMode={timerMode}
              setTimerMode={setTimerMode}
              activeSoundscape={activeSoundscape}
              setActiveSoundscape={setActiveSoundscape}
            />
          )}

          {currentTab === 'protocols' && (
            <HabitsProtocols
              protocols={protocols}
              todayDateKey={todayDateKey}
              onToggleProtocol={handleToggleProtocol}
              onAddProtocol={handleAddProtocol}
              onDeleteProtocol={handleDeleteProtocol}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              blocks={blocks}
              sessions={sessions}
              activeProfile={activeProfile}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onResetSeedData={handleResetSeedData}
            />
          )}
        </main>

        {/* Fixed Thumb-Zone Bottom Tab Bar */}
        <BottomTabBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onQuickAdd={() => {
            setSlotInitialTime('14:00');
            setBlockToEdit(undefined);
            setIsCreateModalOpen(true);
          }}
          isTimerActive={isTimerRunning}
        />

        {/* Create / Edit Block Bottom Sheet */}
        <BlockModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setBlockToEdit(undefined);
          }}
          onSave={handleSaveBlock}
          initialStartTime={slotInitialTime}
          selectedDate={selectedDate}
          editBlock={blockToEdit}
        />

        {/* Block Detail / Action Sheet */}
        <BlockDetailSheet
          block={selectedBlockForDetail}
          isOpen={!!selectedBlockForDetail}
          onClose={() => setSelectedBlockForDetail(undefined)}
          onToggleComplete={handleToggleBlockComplete}
          onStartFocus={handleStartFocusFromBlock}
          onEdit={(block) => {
            setSelectedBlockForDetail(undefined);
            setBlockToEdit(block);
            setIsCreateModalOpen(true);
          }}
          onDelete={handleDeleteBlock}
        />

        {/* Profile & Login Authentication Modal */}
        <ProfileAuthModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onDeleteProfile={handleDeleteProfile}
        />
      </div>
    </PhoneSimulator>
  );
}
