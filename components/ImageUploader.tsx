import React, { useRef } from 'react';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  disabled: boolean;
  headerText?: string;
  subText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, disabled, headerText, subText }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center text-center text-slate-500 p-2 w-full h-full rounded-lg border-2 border-dashed border-slate-600 transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-700/30 hover:border-slate-500'}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleClick()}}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <h3 className="text-sm font-semibold text-slate-300">{headerText || 'อัปโหลดภาพ'}</h3>
      <p className="mt-1 text-xs text-slate-400">{subText || 'ลากและวาง'}</p>
    </div>
  );
};