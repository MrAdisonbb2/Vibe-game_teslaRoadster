import React, { useState } from 'react';
import { CameraMode } from '../simulation/types';
import {
  Rotate3d,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface QuickCameraToolbarProps {
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  onRotateCamera: (deltaTheta: number, deltaPhi: number) => void;
  onZoomCamera: (deltaRadius: number) => void;
  onSetPreset: (preset: 'rear' | 'side' | 'front' | 'top' | 'low') => void;
  onResetCamera: () => void;
}

export const QuickCameraToolbar: React.FC<QuickCameraToolbarProps> = ({
  cameraMode,
  onSetCameraMode,
  onRotateCamera,
  onZoomCamera,
  onSetPreset,
  onResetCamera,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute top-20 right-4 z-20 pointer-events-auto flex items-start gap-1.5 select-none">
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-900/90 border border-slate-700 hover:border-cyan-500/60 text-slate-300 hover:text-white p-1.5 rounded-xl shadow-lg cursor-pointer transition mt-1"
        title={isExpanded ? 'ซ่อนแผงหมุนกล้อง' : 'เปิดแผงหมุนกล้อง 360°'}
      >
        {isExpanded ? <ChevronRight className="w-4 h-4 text-cyan-400" /> : <Rotate3d className="w-4 h-4 text-cyan-400" />}
      </button>

      {/* Main Toolbar */}
      {isExpanded && (
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-none text-white max-w-[210px] space-y-2.5 animate-in fade-in slide-in-from-right-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-300">
              <Rotate3d className="w-4 h-4 text-cyan-400" />
              <span>หมุนมุมกล้อง 360°</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              {cameraMode === 'freeOrbit' ? '360° อิสระ' : cameraMode}
            </span>
          </div>

          {/* Drag Instruction Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 leading-snug">
            <span className="text-cyan-400 font-semibold">🖱️ คลิกลากเมาส์</span> หรือ <span className="text-cyan-400 font-semibold">ปัดนิ้ว</span> บนจอเพื่อหมุน 360° ได้ทุกองศา!
          </div>

          {/* Free Orbit Toggle Button */}
          <button
            onClick={() => onSetCameraMode('freeOrbit')}
            className={`w-full py-1.5 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
              cameraMode === 'freeOrbit'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>โหมดกล้องอิสระ (Free Orbit)</span>
          </button>

          {/* Quick Presets Grid */}
          <div>
            <div className="text-[10px] text-slate-400 mb-1 font-medium">มุมมองสำเร็จรูป (Presets):</div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                onClick={() => onSetPreset('rear')}
                className="py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition text-center cursor-pointer"
              >
                🚗 ด้านหลัง
              </button>
              <button
                onClick={() => onSetPreset('front')}
                className="py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition text-center cursor-pointer"
              >
                ⚡ ด้านหน้า
              </button>
              <button
                onClick={() => onSetPreset('side')}
                className="py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition text-center cursor-pointer"
              >
                🏎️ ด้านข้าง
              </button>
              <button
                onClick={() => onSetPreset('top')}
                className="py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition text-center cursor-pointer"
              >
                🦅 มุมสูง Top
              </button>
            </div>
          </div>

          {/* D-Pad Directional Rotation Controls */}
          <div>
            <div className="text-[10px] text-slate-400 mb-1 font-medium">ปุ่มหมุนทิศทาง (D-Pad):</div>
            <div className="flex flex-col items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => onRotateCamera(0, -0.15)}
                className="p-1 rounded-md bg-slate-800 hover:bg-cyan-600 text-slate-200 transition cursor-pointer"
                title="มุมสูงขึ้น (Pitch Up)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRotateCamera(-0.25, 0)}
                  className="p-1 rounded-md bg-slate-800 hover:bg-cyan-600 text-slate-200 transition cursor-pointer"
                  title="หมุนซ้าย (Rotate Left)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onResetCamera}
                  className="p-1 rounded-md bg-slate-700 hover:bg-rose-600 text-white transition cursor-pointer"
                  title="รีเซ็ตมุมกล้อง (Reset)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRotateCamera(0.25, 0)}
                  className="p-1 rounded-md bg-slate-800 hover:bg-cyan-600 text-slate-200 transition cursor-pointer"
                  title="หมุนขวา (Rotate Right)"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => onRotateCamera(0, 0.15)}
                className="p-1 rounded-md bg-slate-800 hover:bg-cyan-600 text-slate-200 transition cursor-pointer"
                title="มุมต่ำลง (Pitch Down)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-400">ระยะซูม:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onZoomCamera(-4)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
                title="ซูมเข้า (Zoom In)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onZoomCamera(4)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
                title="ซูมออก (Zoom Out)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
