import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text pb-2">
        AI สร้างรูปภาพ
      </h1>
      <p className="text-slate-400 mt-2">ขับเคลื่อนโดย Gemini API</p>
    </header>
  );
};