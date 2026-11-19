import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Music, Home } from 'lucide-react';

interface PauseUIProps {
  score: number;
  bestScore: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseUI: React.FC<PauseUIProps> = ({
  score,
  bestScore,
  soundEnabled,
  musicEnabled,
  onResume,
  onRestart,
  onHome,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-3xl border-4 border-[#331a08] bg-gradient-to-b from-[#8b5528] to-[#5e3616] p-6 text-[#fff6d8] shadow-[0_10px_0_#241104]">
        <div className="text-center">
          <h2
            className="font-display text-3xl font-extrabold tracking-tight text-[#fff8dc]"
            style={{ textShadow: '0 3px 0 #2b1506' }}
          >
            Game Paused
          </h2>
          <p className="mt-1 text-xs font-semibold text-[#ebd09c]">
            Score {score} · Best {bestScore}
          </p>
        </div>

        {/* Sound & Music Toggles */}
        <div className="my-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onToggleSound}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#331a08] bg-[#44250e] px-3 py-3 text-xs font-bold text-[#fff3d1] transition-colors hover:bg-[#522d12] whitespace-nowrap shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[#8be27b]" />
            ) : (
              <VolumeX className="h-4 w-4 text-[#d98566]" />
            )}
            <span>Sound: {soundEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#331a08] bg-[#44250e] px-3 py-3 text-xs font-bold text-[#fff3d1] transition-colors hover:bg-[#522d12] whitespace-nowrap shrink-0"
          >
            <Music className={`h-4 w-4 ${musicEnabled ? 'text-[#8be27b]' : 'text-[#d98566]'}`} />
            <span>Music: {musicEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>

        {/* Main Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-3 border-[#331a08] bg-gradient-to-b from-[#6cc24a] to-[#4b992d] px-6 py-3.5 font-display text-lg font-extrabold text-white shadow-[0_4px_0_#331a08] transition-all duration-150 hover:from-[#7ad156] hover:to-[#56ab36] active:translate-y-0.5 whitespace-nowrap shrink-0"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>Resume Flight</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onRestart}
              className="flex items-center justify-center gap-2 rounded-2xl border-3 border-[#331a08] bg-gradient-to-b from-[#ff7b29] to-[#e04f16] px-4 py-3 font-display text-sm font-extrabold text-white shadow-[0_4px_0_#331a08] transition-all duration-150 hover:from-[#ff8b42] hover:to-[#ec591d] active:translate-y-0.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={onHome}
              className="flex items-center justify-center gap-2 rounded-2xl border-3 border-[#331a08] bg-[#73441e] px-4 py-3 font-display text-sm font-bold text-[#fff3d1] shadow-[0_4px_0_#331a08] transition-all duration-150 hover:bg-[#855025] active:translate-y-0.5 whitespace-nowrap shrink-0"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
