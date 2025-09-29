import React from 'react';
import { type PieceState } from '../types';
import { Piece } from './Piece';

interface PuzzleBoardProps {
  placedPieces: PieceState[];
  onPiecePlace: (draggedPieceId: number, dropIndex: number) => void;
  gridSize: number;
  pieceSize: { width: number; height: number };
  boardSize: { width: number; height: number };
  imageSrc: string;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ placedPieces, onPiecePlace, gridSize, pieceSize, boardSize, imageSrc }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const draggedPieceId = parseInt(e.dataTransfer.getData('pieceId'), 10);
    onPiecePlace(draggedPieceId, dropIndex);
  };

  const placedMap = placedPieces.reduce((acc, piece) => {
    acc[piece.correctIndex] = piece;
    return acc;
  }, {} as Record<number, PieceState>);

  return (
    <div
      className="grid rounded-lg shadow-2xl mb-4"
      style={{
        width: `${boardSize.width}px`,
        height: `${boardSize.height}px`,
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        backgroundImage: `url(https://www.transparenttextures.com/patterns/wood-pattern.png)`,
        backgroundColor: '#6b574e',
        padding: '4px',
        gap: '1px',
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const piece = placedMap[index];
        if (piece) {
          return (
            <div key={index} className="flex items-center justify-center">
              <Piece
                piece={piece}
                imageSrc={imageSrc}
                size={pieceSize}
                boardSize={boardSize}
                isDraggable={false}
              />
            </div>
          );
        }
        return (
          <div
            key={index}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="flex items-center justify-center rounded-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] bg-black/20"
          />
        );
      })}
    </div>
  );
};
