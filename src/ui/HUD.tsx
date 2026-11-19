import React, { useEffect, useState } from 'react';
import { Pause, Volume2, VolumeX, Music } from 'lucide-react';

interface HUDProps {
  score: number;
  bestScore: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onPause: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  bestScore,
  soundEnabled,
  musicEnabled,
  onPause,
  onToggleSound,
  onToggleMusic,
}) => {
  const [popKey, setPopKey] = useState(0);

  useEffect(() => {
    if (score > 0) {
      setPopKey((k) => k + 1);
    }
  }, [score]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6">
      <div className="flex items-start justify-between">
        {/* Top-left unobtrusive best score indicator */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border-2 border-[#3b200c] bg-[#5c3417]/90 px-3.5 py-2 text-[#fde9b8] shadow-md backdrop-blur-xs">
          <span className="text-xs font-semibold tracking-wide text-[#e2be79]">Best</span>
          <span className="font-display text-lg font-extrabold tabular-nums text-white">{bestScore}</span>
        </div>

        {/* Top-Center prominent live arcade score */}
        <div
          key={popKey}
          className="animate-score-pop select-none text-center"
          style={{
            textShadow: '0 4px 0 #2e1707, 0 0 12px rgba(46, 23, 7, 0.65)',
          }}
        >
          <span
            className="font-display text-5xl font-extrabold tabular-nums tracking-tight text-[#fff8dc] sm:text-6xl"
            style={{
              WebkitTextStroke: '2.5px #2e1707',
            }}
          >
            {score}
          </span>
        </div>

        {/* Top-right functional audio and pause buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSound();
            }}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#3b200c] bg-[#784721] text-[#fff3d1] shadow-[0_3px_0_#2b1607] transition-transform duration-150 hover:bg-[#8c5428] active:translate-y-0.5"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-[#d99b66]" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMusic();
            }}
            aria-label={musicEnabled ? 'Mute music' : 'Unmute music'}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#3b200c] shadow-[0_3px_0_#2b1607] transition-transform duration-150 active:translate-y-0.5 ${
              musicEnabled
                ? 'bg-[#784721] text-[#fff3d1] hover:bg-[#8c5428]'
                : 'bg-[#4b2b13] text-[#b38256] hover:bg-[#5c3518]'
            }`}
          >
            <Music className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPause();
            }}
            aria-label="Pause game"
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#3b200c] bg-[#e6601c] text-white shadow-[0_3px_0_#3b200c] transition-transform duration-150 hover:bg-[#f56f29] active:translate-y-0.5"
          >
            <Pause className="h-5 w-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
