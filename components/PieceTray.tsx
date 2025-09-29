import React from 'react';
import { type PieceState } from '../types';
import { Piece } from './Piece';

interface PieceTrayProps {
  pieces: PieceState[];
  imageSrc: string;
  pieceSize: { width: number; height: number };
  boardSize: { width: number; height: number };
}

export const PieceTray: React.FC<PieceTrayProps> = ({ pieces, imageSrc, pieceSize, boardSize }) => {
  return (
    <div className="w-full h-28 sm:h-32 bg-[#2a211c] rounded-lg shadow-inner mt-auto mb-2 overflow-x-auto overflow-y-hidden flex items-center p-2 space-x-2">
      {pieces.map((piece) => (
        <div key={piece.id} className="flex-shrink-0">
          <Piece
            piece={piece}
            imageSrc={imageSrc}
            size={pieceSize}
            boardSize={boardSize}
            isDraggable={true}
          />
        </div>
      ))}
    </div>
  );
};
