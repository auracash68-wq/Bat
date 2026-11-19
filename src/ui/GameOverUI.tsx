import React from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface GameOverUIProps {
  score: number;
  bestScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverUI: React.FC<GameOverUIProps> = ({
  score,
  bestScore,
  isNewRecord,
  onRestart,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-3xl border-4 border-[#331a08] bg-gradient-to-b from-[#8b5528] to-[#5e3616] p-6 text-[#fff6d8] shadow-[0_10px_0_#241104] sm:p-7">
        <div className="text-center">
          <h2
            className="font-display text-3xl font-extrabold tracking-tight text-[#fff8dc] sm:text-4xl"
            style={{ textShadow: '0 3px 0 #2b1506' }}
          >
            Game Over
          </h2>
          <p className="mt-1 text-sm font-medium text-[#ebd09c]">
            {isNewRecord ? 'New Forest Record Achieved!' : 'The wooden trunks caught your wings'}
          </p>
        </div>

        {/* Score Breakdown Board */}
        <div className="my-6 grid grid-cols-2 gap-4 rounded-2xl border-2 border-[#3b200c] bg-[#44250e]/85 p-4">
          <div className="flex flex-col items-center border-r border-[#693c1a] pr-2">
            <span className="text-xs font-semibold text-[#d9b477]">Current Score</span>
            <span className="mt-1 font-display text-4xl font-extrabold tabular-nums text-white">
              {score}
            </span>
          </div>

          <div className="flex flex-col items-center pl-2">
            <span className="text-xs font-semibold text-[#d9b477]">
              Best Score {isNewRecord ? '· New' : ''}
            </span>
            <span className="mt-1 font-display text-4xl font-extrabold tabular-nums text-[#ffd859]">
              {bestScore}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRestart}
            className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl border-3 border-[#331a08] bg-gradient-to-b from-[#ff7b29] to-[#e04f16] px-6 py-3.5 font-display text-lg font-extrabold text-white shadow-[0_4px_0_#331a08] transition-all duration-150 hover:from-[#ff8b42] hover:to-[#ec591d] active:translate-y-0.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onHome}
            className="flex items-center justify-center gap-2 rounded-2xl border-3 border-[#331a08] bg-[#73441e] px-5 py-3.5 font-display text-base font-bold text-[#fff3d1] shadow-[0_4px_0_#331a08] transition-all duration-150 hover:bg-[#855025] active:translate-y-0.5 whitespace-nowrap shrink-0"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
