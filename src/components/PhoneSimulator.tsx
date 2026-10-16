import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

interface PhoneSimulatorProps {
  children: React.ReactNode;
  dynamicIslandContent?: React.ReactNode;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  children,
  dynamicIslandContent,
}) => {
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [viewMode, setViewMode] = useState<'phone' | 'fullscreen'>('phone');
  const [scale, setScale] = useState(1);
  const [currentTimeStr, setCurrentTimeStr] = useState('9:41');

  // Detect screen size on mount & resize
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileScreen(mobile);
      if (mobile) {
        setViewMode('fullscreen');
      }
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Update status bar time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formatted = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')}`;
      setCurrentTimeStr(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // On real phones or if user requested fullscreen, render clean edge-to-edge mobile app
  if (isMobileScreen || viewMode === 'fullscreen') {
    return (
      <div className="relative w-full h-[100dvh] flex flex-col bg-[#0b1326] overflow-hidden">
        {/* On desktop fullscreen mode, provide small return toggle */}
        {!isMobileScreen && (
          <div className="fixed top-2 right-2 z-50">
            <button
              onClick={() => {
                triggerHaptic('light');
                setViewMode('phone');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700/80 text-xs shadow-lg backdrop-blur-md transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Switch to Phone Frame</span>
            </button>
          </div>
        )}
        {children}
      </div>
    );
  }

  // Desktop Simulator View with Titanium iPhone Frame
  return (
    <div className="relative min-h-screen w-full bg-[#060a14] flex flex-col items-center justify-center p-4 select-none overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-sky-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Desktop Controls Toolbar */}
      <div className="relative z-30 mb-4 flex items-center justify-between w-full max-w-[430px] px-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="font-bold text-slate-200 tracking-tight">iPhone 16 Pro Viewport</span>
          <span className="text-slate-500 text-[11px] font-mono">393 × 852</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setScale((s) => Math.max(0.75, s - 0.05))}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(1.1, s + 0.05))}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setViewMode('fullscreen');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors font-medium text-[11px]"
            title="Open Fullscreen Responsive"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full Canvas</span>
          </button>
        </div>
      </div>

      {/* Realistic Titanium Phone Chassis */}
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        className="relative transition-transform duration-200 ease-out"
      >
        {/* Exterior Matte Titanium Border */}
        <div className="relative w-[404px] h-[830px] rounded-[54px] p-[11px] bg-gradient-to-b from-[#3a3f4e] via-[#1f2430] to-[#141824] shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-black">
          {/* Side Hardware Buttons */}
          {/* Action button (Left) */}
          <div className="absolute -left-[14px] top-[115px] w-[3px] h-[26px] bg-[#3a3f4e] rounded-l-md shadow-inner" />
          {/* Volume Up (Left) */}
          <div className="absolute -left-[14px] top-[155px] w-[3px] h-[50px] bg-[#3a3f4e] rounded-l-md shadow-inner" />
          {/* Volume Down (Left) */}
          <div className="absolute -left-[14px] top-[215px] w-[3px] h-[50px] bg-[#3a3f4e] rounded-l-md shadow-inner" />
          {/* Side Power Button (Right) */}
          <div className="absolute -right-[14px] top-[175px] w-[3px] h-[75px] bg-[#3a3f4e] rounded-r-md shadow-inner" />

          {/* Inner Display Bezel */}
          <div className="relative w-full h-full bg-[#0b1326] rounded-[44px] overflow-hidden flex flex-col border border-black shadow-inner">
            {/* Top Phone Status Bar */}
            <div className="relative z-40 h-11 px-7 pt-3 flex items-center justify-between text-white select-none shrink-0 bg-[#0b1326]">
              {/* Left: Clock */}
              <span className="font-mono-numbers text-[13px] font-semibold tracking-tight text-slate-100">
                {currentTimeStr}
              </span>

              {/* Center: Dynamic Island Slot */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2 z-50">
                {dynamicIslandContent}
              </div>

              {/* Right: Cellular, WiFi, Battery */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <Signal className="w-3.5 h-3.5 fill-current" />
                <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-mono-numbers font-medium">98%</span>
                  <Battery className="w-4 h-4 fill-emerald-400 stroke-none" />
                </div>
              </div>
            </div>

            {/* Inner App Content */}
            <div className="relative flex-1 flex flex-col overflow-hidden bg-[#0b1326]">
              {children}
            </div>

            {/* Home Indicator Bar */}
            <div className="h-6 w-full flex items-center justify-center bg-[#0b1326] shrink-0">
              <div className="w-32 h-1 bg-white/40 rounded-full hover:bg-white/70 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
