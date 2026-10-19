import React from 'react';
import { ImpactReportData } from '../simulation/types';
import { AlertTriangle, RotateCcw, Play, Zap, Flame, ShieldAlert, X } from 'lucide-react';

interface ImpactReportModalProps {
  data: ImpactReportData | null;
  onRelaunch: () => void;
  onDismiss: () => void;
  onToggleSlowMo: () => void;
  isSlowMo: boolean;
}

export const ImpactReportModal: React.FC<ImpactReportModalProps> = ({
  data,
  onRelaunch,
  onDismiss,
  onToggleSlowMo,
  isSlowMo,
}) => {
  if (!data) return null;

  return (
    <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4 pointer-events-auto">
      <div className="bg-slate-950/90 border border-rose-500/50 rounded-2xl p-5 shadow-2xl backdrop-blur-none text-white relative animate-in fade-in zoom-in-95 duration-200">
        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-rose-500/30 pb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2 text-rose-400">
              รายงานการพุ่งชนความเร็วสูง (CRASH IMPACT TELEMETRY)
            </h3>
            <p className="text-xs text-slate-400">
              เป้าหมาย: <span className="text-cyan-300 font-semibold">{data.impactLocation}</span> // บันทึกเวลา: {data.timestamp}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 font-mono">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">ความเร็ว ณ จุดปะทะ (SPEED)</div>
            <div className="text-xl md:text-2xl font-bold text-amber-300 mt-0.5">
              {data.impactSpeedKmh} <span className="text-xs text-slate-400 font-normal">KM/H</span>
            </div>
            <div className="text-xs text-amber-400/90 font-semibold">MACH {data.impactMach}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">พลังงานจลน์ (KINETIC ENERGY)</div>
            <div className="text-xl md:text-2xl font-bold text-rose-400 mt-0.5">
              {data.kineticEnergyMJ} <span className="text-xs text-slate-400 font-normal">MJ</span>
            </div>
            <div className="text-[11px] text-slate-400">MegaJoules Yield</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">แรงชะลอเฉียบพลัน (PEAK G-FORCE)</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {data.peakGForce} <span className="text-xs text-slate-400 font-normal">G</span>
            </div>
            <div className="text-[11px] text-slate-400">Deceleration load</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">ความสูงจุดชน (ALTITUDE)</div>
            <div className="text-xl font-bold text-cyan-400 mt-0.5">
              {data.impactAltitudeM} <span className="text-xs text-slate-400 font-normal">M</span>
            </div>
            <div className="text-[11px] text-slate-400">Level ~Floor {Math.floor(data.impactAltitudeM / 3.8)}</div>
          </div>
        </div>

        {/* Structural Damage Assessment */}
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 mb-4">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-rose-300">ผลการประเมินความเสียหายโครงสร้าง:</div>
            <div className="text-slate-300 mt-0.5">{data.structuralDamageRating}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={onRelaunch}
            className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm shadow-lg shadow-rose-950/50 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ยิงชนใหม่อีกครั้ง (Re-Launch)</span>
          </button>

          <button
            onClick={onToggleSlowMo}
            className={`py-2.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs transition cursor-pointer ${
              isSlowMo
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSlowMo ? 'Slow-Mo 0.2x [ON]' : 'สโลว์โมชั่น'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
