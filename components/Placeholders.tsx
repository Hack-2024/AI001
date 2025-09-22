import React from 'react';

export const GeneratePlaceholder: React.FC = () => (
   <div className="flex flex-col items-center justify-center text-center text-slate-500 p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>
    <h3 className="text-xl font-semibold text-slate-300">รูปภาพของคุณจะปรากฏที่นี่</h3>
    <p className="mt-1 text-slate-400">ปลดปล่อยจินตนาการของคุณแล้วดูว่า AI สามารถสร้างอะไรได้บ้าง!</p>
  </div>
);