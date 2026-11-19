import React from 'react';
import { Play, Volume2, VolumeX, Music } from 'lucide-react';

interface MenuUIProps {
  bestScore: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onStart: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const MenuUI: React.FC<MenuUIProps> = ({
  bestScore,
  soundEnabled,
  musicEnabled,
  onStart,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div
      onClick={onStart}
      className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 cursor-pointer"
    >
      {/* Top Bar with Best Score & Audio Controls */}
      <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 rounded-xl border-2 border-[#3b200c] bg-[#5c3417]/95 px-4 py-2 text-[#fde9b8] shadow-[0_3px_0_#2b1607]">
          <span className="text-xs font-semibold text-[#e2be79]">Best Score</span>
          <span className="text-[#e2be79]" aria-hidden="true">·</span>
          <span className="font-display text-xl font-extrabold tabular-nums text-[#ffd859]">
            {bestScore}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#3b200c] bg-[#784721] text-[#fff3d1] shadow-[0_3px_0_#2b1607] transition-transform duration-150 hover:bg-[#8c5428] active:translate-y-0.5"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-[#d99b66]" />}
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={musicEnabled ? 'Mute background music' : 'Unmute background music'}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#3b200c] shadow-[0_3px_0_#2b1607] transition-transform duration-150 active:translate-y-0.5 ${
              musicEnabled
                ? 'bg-[#784721] text-[#fff3d1] hover:bg-[#8c5428]'
                : 'bg-[#4b2b13] text-[#b38256] hover:bg-[#5c3518]'
            }`}
          >
            <Music className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center-Top Title Banner leaving the middle-bottom bird & wooden logs completely visible */}
      <div className="my-auto flex flex-col items-center text-center pointer-events-none">
        <div className="mb-4 rounded-2xl border-4 border-[#361c09] bg-gradient-to-b from-[#8f5729] to-[#633816] px-7 py-4 shadow-[0_6px_0_#281406]">
          <h1
            className="font-display text-3xl font-extrabold tracking-tight text-[#fff6d6] sm:text-5xl"
            style={{
              textShadow: '0 3px 0 #2b1506',
            }}
          >
            Timber Wings
          </h1>
          <p className="mt-1 text-xs font-semibold text-[#f3cf8a] sm:text-sm">
            Fly through the pine forest and dodge the wooden trunks
          </p>
        </div>

        {/* Play Button & Tap instruction */}
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="group flex items-center gap-3 rounded-2xl border-4 border-[#361c09] bg-gradient-to-b from-[#ff7b29] to-[#e04f16] px-8 py-3.5 font-display text-xl font-extrabold text-white shadow-[0_5px_0_#361c09] transition-all duration-150 hover:from-[#ff8b42] hover:to-[#ec591d] active:translate-y-1 active:shadow-[0_2px_0_#361c09] whitespace-nowrap shrink-0"
          >
            <Play className="h-6 w-6 fill-current transition-transform duration-150 group-hover:scale-110" />
            <span>Play Game</span>
          </button>

          <p
            className="text-sm font-bold text-[#fff8dc] sm:text-base"
            style={{ textShadow: '0 2px 4px rgba(24, 12, 4, 0.85)' }}
          >
            Tap, Click, or Press Space to Flap
          </p>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
};
