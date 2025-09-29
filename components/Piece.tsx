import React from 'react';
import { type PieceState } from '../types';

interface PieceProps {
  piece: PieceState;
  imageSrc: string;
  size: { width: number, height: number };
  boardSize: { width: number, height: number };
  isDraggable: boolean;
}

export const Piece: React.FC<PieceProps> = ({ piece, imageSrc, size, boardSize, isDraggable }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggable) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('pieceId', piece.id.toString());
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.transform = 'scale(1.1)';
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
     if (!isDraggable) return;
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} transition-all duration-300 ease-in-out`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundImage: `url(${imageSrc})`,
        backgroundPosition: `-${piece.imgX}px -${piece.imgY}px`,
        backgroundSize: `${boardSize.width}px ${boardSize.height}px`,
        clipPath: `path('${piece.path}')`,
        filter: `
          drop-shadow(2px 4px 5px rgba(0,0,0,0.4)) 
          drop-shadow(0.5px 0.5px 0.5px rgba(0,0,0,0.6)) 
          drop-shadow(-0.5px -0.5px 0.5px rgba(255,255,255,0.6))
        `,
        transform: 'translateZ(0)', // Promote to own layer for performance
      }}
    />
  );
};
