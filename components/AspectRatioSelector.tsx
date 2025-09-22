import React from 'react';
import type { AspectRatio } from '../services/geminiService';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
  disabled: boolean;
}

const ratios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="space-y-3">
      <label className="block text-center text-slate-400 font-medium">
        ขนาดภาพ
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {ratios.map((ratio) => (
          <button
            key={ratio}
            onClick={() => onSelect(ratio)}
            disabled={disabled}
            className={`py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors duration-200
              ${selected === ratio 
                ? 'bg-indigo-600 text-white shadow' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {ratio}
          </button>
        ))}
      </div>
    </div>
  );
};