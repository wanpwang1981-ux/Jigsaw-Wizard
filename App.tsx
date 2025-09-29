import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageSelector } from './components/ImageSelector';
import { Camera } from './components/Camera';
import { PuzzleBoard } from './components/PuzzleBoard';
import { PieceTray } from './components/PieceTray';
import { Controls } from './components/Controls';
import { WinModal } from './components/WinModal';
import { HelpModal } from './components/HelpModal';
import { type PieceState, Difficulty } from './types';
import { generatePuzzleShapes } from './utils/puzzleShapes';

type GameState = 'selecting' | 'playing' | 'solved';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('selecting');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [pieceSize, setPieceSize] = useState({ width: 0, height: 0 });
  const [time, setTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetGame = useCallback(() => {
    setGameState('selecting');
    setImageSrc(null);
    setPieces([]);
    setTime(0);
    stopTimer();
    setDifficulty(Difficulty.EASY);
  }, []);

  const createPieces = useCallback((img: HTMLImageElement) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    // Allocate more height for the board now that there's a tray
    const maxBoardWidth = screenWidth * 0.95;
    const maxBoardHeight = screenHeight * 0.6;

    const imgAspectRatio = img.width / img.height;

    let newBoardWidth = maxBoardWidth;
    let newBoardHeight = newBoardWidth / imgAspectRatio;

    if (newBoardHeight > maxBoardHeight) {
      newBoardHeight = maxBoardHeight;
      newBoardWidth = newBoardHeight * imgAspectRatio;
    }

    setBoardSize({ width: newBoardWidth, height: newBoardHeight });

    const newPieceWidth = newBoardWidth / difficulty;
    const newPieceHeight = newBoardHeight / difficulty;
    setPieceSize({ width: newPieceWidth, height: newPieceHeight });

    const piecePaths = generatePuzzleShapes(difficulty, newPieceWidth, newPieceHeight);

    const newPieces: PieceState[] = [];
    for (let i = 0; i < difficulty * difficulty; i++) {
      const row = Math.floor(i / difficulty);
      const col = i % difficulty;
      newPieces.push({
        id: i,
        correctIndex: i,
        currentIndex: i, // Will be shuffled for tray order
        imgX: col * newPieceWidth,
        imgY: row * newPieceHeight,
        path: piecePaths[i],
        placed: false,
      });
    }

    // Shuffle the pieces for the tray
    const shuffledPieces = newPieces.sort(() => Math.random() - 0.5);
    setPieces(shuffledPieces);
    setGameState('playing');
    setTime(0);
    startTimer();
  }, [difficulty]);

  const handleImageSelect = (src: string) => {
    setImageSrc(src);
    setIsCameraOpen(false);
  };
  
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
     if (difficulty !== newDifficulty) {
        setDifficulty(newDifficulty);
     }
  }

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => createPieces(img);
    img.src = imageSrc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, difficulty]);

  useEffect(() => {
    if (gameState !== 'playing' || pieces.length === 0) return;
    const allPlaced = pieces.every(p => p.placed);
    if (allPlaced) {
      setGameState('solved');
      stopTimer();
    }
  }, [pieces, gameState]);

  const handlePiecePlace = (draggedPieceId: number, dropIndex: number) => {
    const piece = pieces.find(p => p.id === draggedPieceId);
    if (piece && !piece.placed && piece.correctIndex === dropIndex) {
      setPieces(prevPieces => 
        prevPieces.map(p => 
          p.id === draggedPieceId ? { ...p, placed: true } : p
        )
      );
    } else {
      // Optional: Add feedback for wrong placement, e.g., a shake animation
    }
  };

  const trayPieces = pieces.filter(p => !p.placed);
  const placedPieces = pieces.filter(p => p.placed);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#3a2d27] text-white overflow-hidden">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-between p-2 sm:p-4 relative">
        {isCameraOpen && <Camera onCapture={handleImageSelect} onClose={() => setIsCameraOpen(false)} />}
        
        {gameState === 'selecting' && !isCameraOpen && (
          <div className="flex-grow flex items-center justify-center">
            <ImageSelector onImageSelect={handleImageSelect} onOpenCamera={() => setIsCameraOpen(true)} />
          </div>
        )}

        {gameState !== 'selecting' && imageSrc && (
          <div className="w-full h-full flex flex-col items-center justify-start pt-4">
            <PuzzleBoard
              placedPieces={placedPieces}
              onPiecePlace={handlePiecePlace}
              gridSize={difficulty}
              pieceSize={pieceSize}
              boardSize={boardSize}
              imageSrc={imageSrc}
            />
            <PieceTray 
              pieces={trayPieces}
              imageSrc={imageSrc}
              pieceSize={pieceSize}
              boardSize={boardSize}
            />
            <Controls
              difficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              onReset={resetGame}
              time={time}
              imageSrc={imageSrc}
              onOpenHelp={() => setIsHelpOpen(true)}
            />
          </div>
        )}
        
        <WinModal
          isOpen={gameState === 'solved'}
          onClose={resetGame}
          time={time}
        />
        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </main>
    </div>
  );
};

export default App;
