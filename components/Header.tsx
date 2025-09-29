import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full text-center p-4 bg-[#4f403a] shadow-md z-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
        照片拼圖遊戲
      </h1>
    </header>
  );
};
