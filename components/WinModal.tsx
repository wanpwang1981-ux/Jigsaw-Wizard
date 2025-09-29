import React from 'react';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  time: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const WinModal: React.FC<WinModalProps> = ({ isOpen, onClose, time }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-[#4f403a] rounded-xl shadow-2xl p-8 text-center flex flex-col items-center max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
          恭喜！
        </h2>
        <p className="text-xl mb-2">您已完成拼圖！</p>
        <p className="text-lg mb-6">您的用時： <span className="font-bold text-cyan-400">{formatTime(time)}</span></p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
        >
          再玩一次
        </button>
      </div>
    </div>
  );
};