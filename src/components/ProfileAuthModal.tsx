import React, { useState } from 'react';
import { UserProfile } from '../types';
import { BottomSheet } from './BottomSheet';
import { triggerHaptic, soundEngine } from '../utils/audio';
import {
  User,
  UserPlus,
  Users,
  Check,
  Shield,
  Target,
  LogOut,
  Sparkles,
  Mail,
  Briefcase,
  ChevronRight,
  Trash2,
} from 'lucide-react';

interface ProfileAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfile: UserProfile;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  onDeleteProfile: (profileId: string) => void;
}

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#06b6d4', // Cyan
];

const PRESET_GOALS = [2, 3, 4, 6, 8];

export const ProfileAuthModal: React.FC<ProfileAuthModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
}) => {
  const [viewMode, setViewMode] = useState<'profiles' | 'register' | 'login'>('profiles');

  // Form state for registration
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('Engenheiro(a) de Software');
  const [dailyFocusGoalHours, setDailyFocusGoalHours] = useState(4);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  // Form state for direct login via email
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    triggerHaptic('success');
    soundEngine.playChime('start');
    onCreateProfile({
      name: name.trim(),
      email: email.trim(),
      roleTitle: roleTitle.trim() || 'Foco & Produtividade',
      dailyFocusGoalHours,
      avatarColor: selectedColor,
    });
    setName('');
    setEmail('');
    setViewMode('profiles');
    onClose();
  };

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = profiles.find(
      (p) => p.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );
    if (found) {
      triggerHaptic('success');
      soundEngine.playChime('check');
      onSelectProfile(found.id);
      setLoginError('');
      setLoginEmail('');
      onClose();
    } else {
      triggerHaptic('warning');
      setLoginError('Nenhum perfil encontrado com este e-mail. Crie um novo perfil abaixo.');
    }
  };

  const getInitials = (userName: string) => {
    return userName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        viewMode === 'register'
          ? 'Cadastrar Novo Perfil'
          : viewMode === 'login'
          ? 'Entrar no seu Perfil'
          : 'Gerenciar Perfis & Acesso'
      }
    >
      <div className="space-y-4 pt-1">
        {/* Navigation Tabs inside modal */}
        <div className="flex items-center gap-1 p-1 bg-[#0b1326] rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('profiles');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              viewMode === 'profiles'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Perfis ({profiles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('register');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              viewMode === 'register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('login');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              viewMode === 'login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
        </div>

        {/* VIEW 1: PROFILES LIST */}
        {viewMode === 'profiles' && (
          <div className="space-y-3">
            {/* Active Profile Hero Card */}
            <div className="p-3.5 rounded-2xl bg-[#0b1326] border border-indigo-500/40 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  Perfil em Uso no Momento
                </span>
                <span className="text-[10px] font-mono-numbers text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Ativo
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: activeProfile.avatarColor }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base text-white shadow-md shrink-0"
                >
                  {getInitials(activeProfile.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">{activeProfile.name}</h4>
                  <p className="text-xs text-slate-400 truncate">{activeProfile.email}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-indigo-300">
                    <span>{activeProfile.roleTitle || 'Foco & Produtividade'}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono-numbers">Meta: {activeProfile.dailyFocusGoalHours}h/dia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Available Profiles */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Alternar para Outro Perfil Salvo
              </span>
              <div className="space-y-2">
                {profiles.map((profile) => {
                  const isActive = profile.id === activeProfile.id;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => {
                        if (!isActive) {
                          triggerHaptic('medium');
                          soundEngine.playChime('start');
                          onSelectProfile(profile.id);
                          onClose();
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0b1326]/60 border-indigo-500/30'
                          : 'bg-[#0b1326] border-slate-800 hover:border-slate-700 hover:bg-[#171f33]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          style={{ backgroundColor: profile.avatarColor }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                        >
                          {getInitials(profile.name)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">
                            {profile.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {profile.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isActive ? (
                          <span className="text-[11px] text-indigo-400 font-semibold px-2 py-1 rounded bg-indigo-950/60">
                            Selecionado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('medium');
                              soundEngine.playChime('start');
                              onSelectProfile(profile.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                          >
                            Entrar
                          </button>
                        )}

                        {profiles.length > 1 && !isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('warning');
                              if (confirm(`Deseja excluir o perfil "${profile.name}" e seus dados?`)) {
                                onDeleteProfile(profile.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Excluir Perfil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick action to register another profile */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode('register');
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all mt-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Criar Novo Perfil com Dados Isolados</span>
            </button>
          </div>
        )}

        {/* VIEW 2: REGISTER NEW PROFILE */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Nome do Usuário ou Perfil
              </label>
              <input
                type="text"
                required
                placeholder="ex: Mariana Souza ou Foco Concursos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0b1326] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                E-mail de Identificação
              </label>
              <input
                type="email"
                required
                placeholder="ex: mariana@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0b1326] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Cargo / Área de Foco
              </label>
              <input
                type="text"
                placeholder="ex: Engenharia de Software, Medicina, Design"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0b1326] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Daily Focus Goal */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                Meta Diária de Foco Profundo (Horas)
              </label>
              <div className="flex items-center gap-2">
                {PRESET_GOALS.map((hours) => (
                  <button
                    type="button"
                    key={hours}
                    onClick={() => {
                      triggerHaptic('light');
                      setDailyFocusGoalHours(hours);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono-numbers font-medium transition-colors ${
                      dailyFocusGoalHours === hours
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-[#0b1326] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                Cor do Avatar do Perfil
              </label>
              <div className="flex items-center gap-2.5">
                {AVATAR_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedColor(color);
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                      selectedColor === color ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Salvar Perfil & Inicializar Dados</span>
            </button>
          </form>
        )}

        {/* VIEW 3: LOGIN VIA EMAIL */}
        {viewMode === 'login' && (
          <form onSubmit={handleDirectLogin} className="space-y-3.5">
            <p className="text-xs text-slate-400">
              Digite o e-mail do perfil cadastrado para carregar instantaneamente seus blocos, hábitos e estatísticas salvas.
            </p>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                E-mail do Perfil
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="ex: caioeduardopn150@gmail.com"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0b1326] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Acessar Cronograma do Perfil</span>
            </button>

            {/* Quick profiles shortcut */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-2">Ou selecione um perfil salvo:</span>
              <div className="space-y-1.5">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      onSelectProfile(p.id);
                      onClose();
                    }}
                    className="w-full p-2 rounded-lg bg-[#0b1326] hover:bg-slate-800 flex items-center justify-between text-xs text-slate-300 text-left transition-colors"
                  >
                    <span className="font-medium text-white">{p.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{p.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>
    </BottomSheet>
  );
};
