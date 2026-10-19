import React from 'react';
import { TelemetryData, FlightMode } from '../simulation/types';
import { Gauge, Compass, Zap, Target, Activity } from 'lucide-react';

interface TelemetryHUDProps {
  telemetry: TelemetryData;
  flightMode: FlightMode;
  targetTower: string;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  telemetry,
  flightMode,
  targetTower,
}) => {
  const isSupersonic = telemetry.speedMach >= 1.0;

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden p-4 md:p-6 text-xs md:text-sm font-mono text-cyan-400">
      {/* Top Left: Primary Flight Instruments */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3 md:p-4 backdrop-blur-none shadow-lg max-w-[280px]">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-white text-xs uppercase">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>TESLA ROADSTER // SPACEX</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
              telemetry.status === 'crashed'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : isSupersonic
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {telemetry.status === 'crashed' ? 'IMPACT DETECTED' : telemetry.status}
          </span>
        </div>

        {/* Speedometer */}
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> SPEED
          </span>
          <div className="text-right">
            <span className={`text-xl md:text-2xl font-bold tracking-tight ${isSupersonic ? 'text-amber-300' : 'text-white'}`}>
              {telemetry.speedKmh.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">KM/H</span>
            <div className={`text-[11px] font-semibold ${isSupersonic ? 'text-amber-400' : 'text-cyan-400'}`}>
              MACH {telemetry.speedMach.toFixed(2)} {isSupersonic && '⚡ SUPERSONIC'}
            </div>
          </div>
        </div>

        {/* Altitude */}
        <div className="flex items-baseline justify-between">
          <span className="text-slate-400 text-xs">ALTITUDE</span>
          <div className="text-right">
            <span className="text-lg font-bold text-white">{telemetry.altitudeM}</span>
            <span className="text-[10px] text-slate-400 ml-1">M</span>
          </div>
        </div>

        {/* Distance to Twin Towers */}
        <div className="flex items-baseline justify-between">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-rose-400" /> TARGET DIST
          </span>
          <div className="text-right">
            <span className={`text-lg font-bold ${telemetry.distanceToTower < 80 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {telemetry.distanceToTower}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">M</span>
          </div>
        </div>

        {/* G-Force & Thrust Bar */}
        <div className="pt-2 border-t border-cyan-500/20 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> G-FORCE
            </span>
            <span className="text-white font-semibold">{telemetry.gForce} G</span>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>COLD GAS THRUST</span>
              <span className="text-cyan-300">{telemetry.thrustPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-75"
                style={{ width: `${telemetry.thrustPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Mission & Target HUD */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-slate-950/80 border border-slate-700/60 rounded-xl p-3 md:p-4 text-right shadow-lg hidden sm:block">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">TARGET ACQUISITION</div>
        <div className="text-sm font-bold text-white flex items-center justify-end gap-1.5 mt-0.5">
          <Target className="w-4 h-4 text-rose-500" />
          <span>TWIN TOWERS // {targetTower}</span>
        </div>
        <div className="text-[11px] text-cyan-400 mt-1">
          MODE: <span className="text-white uppercase font-semibold">{flightMode}</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          PITCH: {telemetry.pitchDeg}° | ROLL: {telemetry.rollDeg}°
        </div>
      </div>

      {/* Center Artificial Horizon & Target Reticle (Subtle, Non-obtrusive) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-70">
        <div className="relative w-20 h-20 md:w-28 md:h-28 border border-cyan-400/30 rounded-full flex items-center justify-center">
          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-cyan-400/40" />
          <div className="absolute h-full w-[1px] bg-cyan-400/40" />
          <div className="w-3 h-3 border border-cyan-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};
