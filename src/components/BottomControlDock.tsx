import React, { useState } from 'react';
import { CameraMode, FlightMode } from '../simulation/types';
import {
  ChevronDown,
  ChevronUp,
  Flame,
  Camera,
  Compass,
  Palette,
  Volume2,
  VolumeX,
  RotateCcw,
  Gauge,
  Sliders,
  Shield,
  Clock,
} from 'lucide-react';

interface BottomControlDockProps {
  flightMode: FlightMode;
  onSetFlightMode: (mode: FlightMode) => void;
  targetTower: 'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire';
  onSetTargetTower: (target: 'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire') => void;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  onLaunchAutoCrash: () => void;
  onReset: () => void;
  timeScale: number;
  onSetTimeScale: (scale: number) => void;
  bodyColor: string;
  onSetBodyColor: (color: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  thrusterMultiplier: number;
  onSetThrusterMultiplier: (mult: number) => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  flightMode,
  onSetFlightMode,
  targetTower,
  onSetTargetTower,
  cameraMode,
  onSetCameraMode,
  onLaunchAutoCrash,
  onReset,
  timeScale,
  onSetTimeScale,
  bodyColor,
  onSetBodyColor,
  isMuted,
  onToggleMute,
  thrusterMultiplier,
  onSetThrusterMultiplier,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'mission' | 'camera' | 'vehicle' | 'physics'>('mission');

  const colorPresets = [
    { name: 'Pearl Silver (User Photo)', hex: '#f3f4f6' },
    { name: 'SpaceX Midnight Red', hex: '#b91c1c' },
    { name: 'Cyber Stealth Black', hex: '#18181b' },
    { name: 'Electric Cyan', hex: '#0284c7' },
  ];

  return (
    <div
      className="fixed bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 w-[96vw] max-w-[940px] transition-transform duration-300 pointer-events-auto"
      style={{
        transform: isCollapsed ? 'translate(-50%, calc(100% - 32px))' : 'translate(-50%, 0)',
      }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-slate-900 border border-slate-700/80 border-b-0 text-slate-300 hover:text-white px-4 py-1 rounded-t-xl text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer transition"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>แสดงแผงควบคุม (Show Flight Controls)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>ย่อแผงควบคุม (Hide Controls)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Control Container */}
      <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-3 md:p-4 shadow-2xl text-white">
        {/* Top Control Bar: Fast Launch, Reset, Mute, Tab Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          {/* Quick Big Action: Launch Crash */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLaunchAutoCrash}
              className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold px-3.5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-rose-950/50 transition cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>ยิงไอพ่นพุ่งชน (Launch Crash)</span>
            </button>

            <button
              onClick={onReset}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 md:py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="รีเซ็ตตำแหน่งเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">รีเซ็ต</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'mission' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ภารกิจ & เป้าหมาย
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'camera' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              มุมกล้อง
            </button>
            <button
              onClick={() => setActiveTab('physics')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'physics' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ฟิสิกส์ & สโลว์โม
            </button>
            <button
              onClick={() => setActiveTab('vehicle')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'vehicle' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              แต่งรถ Roadster
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400'
            }`}
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="pt-3">
          {/* TAB 1: Mission & Modes */}
          {activeTab === 'mission' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Flight Mode Selection */}
              <div>
                <label className="text-slate-400 block mb-1.5 font-medium">โหมดการบิน (Flight Mode):</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onSetFlightMode('autoCrash')}
                    className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      flightMode === 'autoCrash'
                        ? 'bg-rose-500/20 border-rose-500/60 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🚀 พุ่งชนเป้าหมาย (Auto-Crash)</span>
                  </button>
                  <button
                    onClick={() => onSetFlightMode('manual')}
                    className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      flightMode === 'manual'
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🕹️ บินอิสระ (Manual Pilot)</span>
                  </button>
                  <button
                    onClick={() => onSetFlightMode('hover')}
                    className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      flightMode === 'hover'
                        ? 'bg-indigo-500/20 border-indigo-500/60 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🛸 ลอยตัวไอพ่น (SpaceX Hover)</span>
                  </button>
                  <button
                    onClick={() => onSetFlightMode('stuntRings')}
                    className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      flightMode === 'stuntRings'
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>⭕ ลอดวงแหวน (Stunt Course)</span>
                  </button>
                </div>
              </div>

              {/* Target Selection */}
              <div>
                <label className="text-slate-400 block mb-1.5 font-medium">จุดปะทะบน Twin Towers (Target Sector):</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Tower A (North)', 'Rooftop Spire', 'Tower B (South)'] as const).map((tgt) => (
                    <button
                      key={tgt}
                      onClick={() => onSetTargetTower(tgt)}
                      className={`py-2 px-2 rounded-xl border text-center transition cursor-pointer ${
                        targetTower === tgt
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {tgt === 'Tower A (North)' && 'หอคอย A (เหนือ)'}
                      {tgt === 'Rooftop Spire' && 'ยอดหอคอย A (Spire)'}
                      {tgt === 'Tower B (South)' && 'หอคอย B (ใต้)'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  *กดปุ่ม <b>ยิงไอพ่นพุ่งชน</b> เพื่อปล่อย Roadster อัตราเร่งซูเปอร์โซนิกพร้อมรายงานพลังงานจลน์
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Camera Views */}
          {activeTab === 'camera' && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'freeOrbit', label: '🔄 กล้องหมุนอิสระ 360° (Orbit)', desc: 'ลากเมาส์หมุนได้รอบทิศ' },
                  { id: 'chase', label: '🎥 กล้องติดตามท้ายรถ (Chase)', desc: 'มุมมองด้านหลัง' },
                  { id: 'cockpit', label: '💺 มุมมองห้องคนขับ (Cockpit)', desc: 'มุมมองสายตานักบิน' },
                  { id: 'tower', label: '🏙️ กล้องหอคอย (Tower Cam)', desc: 'สังเกตการณ์จากตึก' },
                  { id: 'drone', label: '🚁 กล้องโดรนบินประกบ (Drone)', desc: 'มุมมองภาพกว้างทางข้าง' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => onSetCameraMode(cam.id as CameraMode)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      cameraMode === cam.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-medium text-white">{cam.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{cam.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Physics & Time Dilation */}
          {activeTab === 'physics' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> กาลเวลา / สโลว์โมชั่น (Time Scale):
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">{timeScale.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    value={timeScale}
                    onChange={(e) => onSetTimeScale(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0.1x (Matrix Slow-Mo)</span>
                  <span>1.0x (Normal)</span>
                  <span>1.5x (Fast)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" /> กำลังขับไอพ่นจรวด SpaceX (Thrust Multiplier):
                  </span>
                  <span className="font-mono text-amber-300 font-bold">{thrusterMultiplier.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={thrusterMultiplier}
                    onChange={(e) => onSetThrusterMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>35,000 N</span>
                  <span>65,000 N (Standard)</span>
                  <span>160,000 N (Hyper-Sonic)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Vehicle Customization */}
          {activeTab === 'vehicle' && (
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 block font-medium">สีตัวถังรถยนต์ Tesla Roadster:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    onClick={() => onSetBodyColor(preset.hex)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      bodyColor === preset.hex
                        ? 'bg-slate-800 border-cyan-400 text-white font-medium'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
