import React from 'react';

interface NumberOfImagesSelectorProps {
  selected: number;
  onSelect: (num: number) => void;
  disabled: boolean;
}

const numbers = [1, 2, 3, 4];

export const NumberOfImagesSelector: React.FC<NumberOfImagesSelectorProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="space-y-3">
      <label className="block text-center text-slate-400 font-medium">
        จำนวนภาพ
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => onSelect(num)}
            disabled={disabled}
            className={`py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors duration-200
              ${selected === num
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};