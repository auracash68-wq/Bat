import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { createPhaserGame } from './game/config';
import { GameScene } from './scenes/GameScene';
import { GameState, GameStateManager } from './managers/GameStateManager';
import { SaveManager } from './managers/SaveManager';
import { AudioManager } from './managers/AudioManager';
import { HUD } from './ui/HUD';
import { MenuUI } from './ui/MenuUI';
import { GameOverUI } from './ui/GameOverUI';
import { PauseUI } from './ui/PauseUI';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const stateManagerRef = useRef<GameStateManager>(
    new GameStateManager(SaveManager.getBestScore())
  );

  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => SaveManager.getBestScore());
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() =>
    AudioManager.getInstance().isSoundEnabled()
  );
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() =>
    AudioManager.getInstance().isMusicEnabled()
  );

  const getActiveGameScene = useCallback((): GameScene | null => {
    if (!gameRef.current) return null;
    const scene = gameRef.current.scene.getScene('GameScene') as GameScene | undefined;
    return scene || null;
  }, []);

  useEffect(() => {
    const unsubscribe = stateManagerRef.current.subscribe((state, curScore, best, newRec) => {
      setGameState(state);
      setScore(curScore);
      setBestScore(best);
      setIsNewRecord(newRec);
    });

    if (containerRef.current && !gameRef.current) {
      gameRef.current = createPhaserGame(containerRef.current, stateManagerRef.current);
    }

    return () => {
      unsubscribe();
      AudioManager.getInstance().stopMusic();
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Support Enter key to start or restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const scene = getActiveGameScene();
        if (!scene) return;
        if (gameState === GameState.READY) {
          AudioManager.getInstance().playButtonClick();
          scene.handleActionInput();
        } else if (gameState === GameState.GAME_OVER) {
          AudioManager.getInstance().playButtonClick();
          scene.restartGame();
        } else if (gameState === GameState.PAUSED) {
          AudioManager.getInstance().playButtonClick();
          scene.resumeGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, getActiveGameScene]);

  const handleStartGame = () => {
    AudioManager.getInstance().playButtonClick();
    const scene = getActiveGameScene();
    if (scene) {
      scene.handleActionInput();
    }
  };

  const handleRestartGame = () => {
    AudioManager.getInstance().playButtonClick();
    const scene = getActiveGameScene();
    if (scene) {
      scene.restartGame();
    }
  };

  const handleHome = () => {
    AudioManager.getInstance().playButtonClick();
    const scene = getActiveGameScene();
    if (scene) {
      scene.returnToHome();
    }
  };

  const handlePause = () => {
    AudioManager.getInstance().playButtonClick();
    const scene = getActiveGameScene();
    if (scene) {
      scene.pauseGame();
    }
  };

  const handleResume = () => {
    AudioManager.getInstance().playButtonClick();
    const scene = getActiveGameScene();
    if (scene) {
      scene.resumeGame();
    }
  };

  const handleToggleSound = () => {
    const next = AudioManager.getInstance().toggleSound();
    setSoundEnabled(next);
  };

  const handleToggleMusic = () => {
    const next = AudioManager.getInstance().toggleMusic();
    setMusicEnabled(next);
  };

  return (
    <main className="relative flex h-dvh w-screen items-center justify-center overflow-hidden bg-[#1a1008] select-none">
      {/* Aspect-ratio locked game stage matching reference 1536 x 927 */}
      <div className="relative flex h-full w-full max-w-[1536px] max-h-[927px] items-center justify-center">
        {/* Phaser 3 Canvas Mount Container */}
        <div
          ref={containerRef}
          className="h-full w-full overflow-hidden shadow-2xl"
        />

        {/* Ready State UI */}
        {gameState === GameState.READY && (
          <MenuUI
            bestScore={bestScore}
            soundEnabled={soundEnabled}
            musicEnabled={musicEnabled}
            onStart={handleStartGame}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* Active Gameplay HUD */}
        {gameState === GameState.PLAYING && (
          <HUD
            score={score}
            bestScore={bestScore}
            soundEnabled={soundEnabled}
            musicEnabled={musicEnabled}
            onPause={handlePause}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* Pause Menu Overlay */}
        {gameState === GameState.PAUSED && (
          <PauseUI
            score={score}
            bestScore={bestScore}
            soundEnabled={soundEnabled}
            musicEnabled={musicEnabled}
            onResume={handleResume}
            onRestart={handleRestartGame}
            onHome={handleHome}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* Game Over Modal Overlay */}
        {gameState === GameState.GAME_OVER && (
          <GameOverUI
            score={score}
            bestScore={bestScore}
            isNewRecord={isNewRecord}
            onRestart={handleRestartGame}
            onHome={handleHome}
          />
        )}
      </div>
    </main>
  );
}
