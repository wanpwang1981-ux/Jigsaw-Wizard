import React, { useState } from 'react';
import { Difficulty } from '../types';

interface ControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onReset: () => void;
  time: number;
  imageSrc: string;
  onOpenHelp: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const difficultyMap: Record<string, string> = {
  EASY: '簡單',
  MEDIUM: '中等',
  HARD: '困難',
};

export const Controls: React.FC<ControlsProps> = ({ difficulty, onDifficultyChange, onReset, time, imageSrc, onOpenHelp }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    if (newDifficulty !== difficulty) {
      onDifficultyChange(newDifficulty);
    }
  };

  return (
    <>
      <div className="w-full max-w-lg bg-[#4f403a] rounded-lg shadow-lg p-2 sm:p-3 flex flex-col space-y-3">
        <div className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="tabular-nums">{formatTime(time)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onOpenHelp} className="p-2 bg-[#645048] hover:bg-[#7a6056] rounded-full transition-colors" aria-label="遊戲說明">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
            </button>
            <button onClick={() => setIsPreviewOpen(true)} className="p-2 bg-[#645048] hover:bg-[#7a6056] rounded-full transition-colors" aria-label="預覽圖片">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.062 7-9.542 7S1.732 14.057.458 10zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
            </button>
            <button onClick={onReset} className="p-2 bg-[#645048] hover:bg-[#7a6056] rounded-full transition-colors" aria-label="重設遊戲">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex justify-center items-center space-x-2 sm:space-x-4 bg-[#645048] p-1.5 rounded-lg">
          <span className="font-semibold text-sm sm:text-base">難度：</span>
          {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>)
            .filter(key => !isNaN(Number(Difficulty[key])))
            .map(key => (
              <button
                key={key}
                onClick={() => handleDifficultyChange(Difficulty[key] as unknown as Difficulty)}
                className={`px-3 sm:px-4 py-1.5 text-sm sm:text-base font-semibold rounded-md transition-colors ${
                  difficulty === Difficulty[key]
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[#7a6056] hover:bg-[#907268] text-orange-100'
                }`}
              >
                {difficultyMap[key]}
              </button>
            ))}
        </div>
      </div>
      
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative p-4" onClick={(e) => e.stopPropagation()}>
            <img 
              src={imageSrc} 
              alt="拼圖預覽" 
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute -top-2 -right-2 text-white bg-[#4f403a] bg-opacity-75 rounded-full p-2"
              aria-label="關閉預覽"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
