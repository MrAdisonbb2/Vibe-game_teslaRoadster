import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { FlightInputState } from '../simulation/PhysicsEngine';

interface MobileFlightControlsProps {
  inputState: FlightInputState;
  setInputState: React.Dispatch<React.SetStateAction<FlightInputState>>;
  flightMode: string;
}

export const MobileFlightControls: React.FC<MobileFlightControlsProps> = ({
  inputState,
  setInputState,
  flightMode,
}) => {
  if (flightMode !== 'manual') return null;

  const handleTouch = (key: keyof FlightInputState, value: boolean) => {
    setInputState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute inset-x-0 bottom-24 md:bottom-28 pointer-events-none flex justify-between px-4 md:px-8 z-10">
      {/* Left side: Pitch & Roll directional pad */}
      <div className="pointer-events-auto flex flex-col items-center bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2 backdrop-blur-none">
        <button
          onMouseDown={() => handleTouch('pitchDown', true)}
          onMouseUp={() => handleTouch('pitchDown', false)}
          onTouchStart={() => handleTouch('pitchDown', true)}
          onTouchEnd={() => handleTouch('pitchDown', false)}
          className="w-11 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl flex items-center justify-center text-slate-200 mb-1"
          title="Pitch Down (หัวเชิดลง)"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          <button
            onMouseDown={() => handleTouch('rollLeft', true)}
            onMouseUp={() => handleTouch('rollLeft', false)}
            onTouchStart={() => handleTouch('rollLeft', true)}
            onTouchEnd={() => handleTouch('rollLeft', false)}
            className="w-11 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl flex items-center justify-center text-slate-200"
            title="Roll Left (เอียงซ้าย)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onMouseDown={() => handleTouch('pitchUp', true)}
            onMouseUp={() => handleTouch('pitchUp', false)}
            onTouchStart={() => handleTouch('pitchUp', true)}
            onTouchEnd={() => handleTouch('pitchUp', false)}
            className="w-11 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl flex items-center justify-center text-slate-200"
            title="Pitch Up (ดึงหัวเชิดขึ้น)"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onMouseDown={() => handleTouch('rollRight', true)}
            onMouseUp={() => handleTouch('rollRight', false)}
            onTouchStart={() => handleTouch('rollRight', true)}
            onTouchEnd={() => handleTouch('rollRight', false)}
            className="w-11 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl flex items-center justify-center text-slate-200"
            title="Roll Right (เอียงขวา)"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right side: Thruster Boost & Lift */}
      <div className="pointer-events-auto flex items-end gap-2 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2 backdrop-blur-none">
        {/* Throttle slider buttons */}
        <div className="flex flex-col gap-1">
          <button
            onMouseDown={() => handleTouch('throttleUp', true)}
            onMouseUp={() => handleTouch('throttleUp', false)}
            onTouchStart={() => handleTouch('throttleUp', true)}
            onTouchEnd={() => handleTouch('throttleUp', false)}
            className="w-10 h-10 bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center text-slate-200"
            title="เร่งความเร็ว (Throttle Up)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onMouseDown={() => handleTouch('throttleDown', true)}
            onMouseUp={() => handleTouch('throttleDown', false)}
            onTouchStart={() => handleTouch('throttleDown', true)}
            onTouchEnd={() => handleTouch('throttleDown', false)}
            className="w-10 h-10 bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center text-slate-200"
            title="ลดความเร็ว (Throttle Down)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Vertical VTOL Lift */}
        <button
          onMouseDown={() => handleTouch('vtol', true)}
          onMouseUp={() => handleTouch('vtol', false)}
          onTouchStart={() => handleTouch('vtol', true)}
          onTouchEnd={() => handleTouch('vtol', false)}
          className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition ${
            inputState.vtol ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-300'
          }`}
          title="ไอพ่นแนวดิ่ง (VTOL Lift)"
        >
          <span className="text-[10px]">VTOL</span>
          <span className="text-[9px]">LIFT</span>
        </button>

        {/* SpaceX Rocket Boost */}
        <button
          onMouseDown={() => handleTouch('boost', true)}
          onMouseUp={() => handleTouch('boost', false)}
          onTouchStart={() => handleTouch('boost', true)}
          onTouchEnd={() => handleTouch('boost', false)}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition shadow-lg ${
            inputState.boost ? 'bg-rose-600 text-white shadow-rose-600/50' : 'bg-slate-800 text-amber-400'
          }`}
          title="ไอพ่นซูเปอร์ชาร์จ (Boost)"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[9px]">BOOST</span>
        </button>
      </div>
    </div>
  );
};
