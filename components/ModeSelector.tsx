import React from 'react';

type Mode = 'generate' | 'edit';

interface ModeSelectorProps {
  selected: Mode;
  onSelect: (mode: Mode) => void;
  disabled: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className={`relative flex w-full max-w-sm mx-auto p-1 bg-slate-800 rounded-full transition-opacity ${disabled ? 'opacity-50' : ''}`}>
      <span
        className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-indigo-600 transition-transform duration-300 ease-in-out"
        style={{ transform: selected === 'generate' ? 'translateX(0.25rem)' : 'translateX(calc(100% + 0.25rem))' }}
      />
      <button
        onClick={() => onSelect('generate')}
        disabled={disabled}
        className="relative z-10 w-1/2 py-2 text-center font-semibold rounded-full transition-colors text-slate-200"
        aria-pressed={selected === 'generate'}
      >
        สร้างภาพ
      </button>
      <button
        onClick={() => onSelect('edit')}
        disabled={disabled}
        className="relative z-10 w-1/2 py-2 text-center font-semibold rounded-full transition-colors text-slate-200"
        aria-pressed={selected === 'edit'}
      >
        แก้ไขภาพ
      </button>
    </div>
  );
};