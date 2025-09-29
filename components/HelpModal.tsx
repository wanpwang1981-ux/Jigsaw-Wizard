import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
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
        className="bg-[#4f403a] rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 text-orange-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500 mb-6">
          遊戲說明
        </h2>
        
        <div className="text-left w-full space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-lg mb-1 text-cyan-300">玩法介紹</h3>
            <ol className="list-decimal list-inside space-y-1 text-base">
              <li>點擊「上傳照片」或「自拍」來選擇圖片。</li>
              <li>選擇「簡單」、「中等」或「困難」難度。</li>
              <li>將拼圖塊拖曳到正確的位置以完成拼圖。</li>
              <li>完成拼圖，挑戰您的最快紀錄！</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1 text-cyan-300">版本</h3>
            <p>1.0.0</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1 text-cyan-300">製作者</h3>
            <p>AI</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
        >
          關閉
        </button>
      </div>
    </div>
  );
};
