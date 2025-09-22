import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

type DragState = 
  | { type: 'none' }
  | { type: 'drawing'; start: { x: number; y: number } }
  | { type: 'moving'; offset: { x: number; y: number } };

export const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCropComplete, onCancel }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: 'none' });
  const [cursor, setCursor] = useState('crosshair');

  const getCoords = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const isInsideCrop = (pos: { x: number, y: number }, currentCrop: typeof crop) => {
    if (!currentCrop) return false;
    return pos.x >= currentCrop.x && pos.x <= currentCrop.x + currentCrop.width &&
           pos.y >= currentCrop.y && pos.y <= currentCrop.y + currentCrop.height;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getCoords(e);
    if (isInsideCrop(pos, crop)) {
      setDragState({ 
        type: 'moving', 
        offset: { x: pos.x - crop!.x, y: pos.y - crop!.y } 
      });
    } else {
      setDragState({ type: 'drawing', start: pos });
      setCrop({ x: pos.x, y: pos.y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCoords(e);
    if (dragState.type === 'none') {
        setCursor(isInsideCrop(pos, crop) ? 'move' : 'crosshair');
        return;
    }

    const image = imageRef.current;
    if (!image) return;

    if (dragState.type === 'drawing') {
      const newCrop = {
        x: Math.min(pos.x, dragState.start.x),
        y: Math.min(pos.y, dragState.start.y),
        width: Math.abs(pos.x - dragState.start.x),
        height: Math.abs(pos.y - dragState.start.y),
      };
      setCrop(newCrop);
    } else if (dragState.type === 'moving' && crop) {
      let newX = pos.x - dragState.offset.x;
      let newY = pos.y - dragState.offset.y;
      
      newX = Math.max(0, Math.min(newX, image.width - crop.width));
      newY = Math.max(0, Math.min(newY, image.height - crop.height));
      
      setCrop({ ...crop, x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragState({ type: 'none' });
  };

  const handleApplyCrop = () => {
    if (!crop || !imageRef.current || crop.width === 0 || crop.height === 0) {
      onCancel(); // Nothing to apply
      return;
    }

    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0, 0, canvas.width, canvas.height
    );

    const mimeType = src.match(/data:(.*);base64,/)?.[1] || 'image/png';
    const croppedDataUrl = canvas.toDataURL(mimeType);
    onCropComplete(croppedDataUrl);
  };
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
  }, [onCancel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      role="dialog" aria-modal="true" aria-labelledby="crop-dialog-title"
      onMouseDown={onCancel}
    >
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onMouseDown={e => e.stopPropagation()}
      >
        <h2 id="crop-dialog-title" className="text-xl font-bold text-center mb-4 text-slate-200">ปรับขนาดรูปภาพ</h2>
        <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden bg-black/50 rounded-lg">
          <div 
            className="relative select-none"
            style={{ cursor }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img 
              ref={imageRef} 
              src={src} 
              alt="Image to crop" 
              className="max-w-full max-h-[60vh] object-contain block"
              draggable={false}
              onLoad={() => { /* Force re-render on load to get correct dimensions */ setCrop(c => c ? {...c} : null) }}
            />
            {crop && crop.width > 0 && crop.height > 0 && (
              <>
                <div 
                  className="absolute inset-0 bg-black/60 pointer-events-none"
                  style={{
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%, 
                      ${crop.x}px ${crop.y}px,
                      ${crop.x}px ${crop.y + crop.height}px, 
                      ${crop.x + crop.width}px ${crop.y + crop.height}px,
                      ${crop.x + crop.width}px ${crop.y}px,
                      ${crop.x}px ${crop.y}px
                    )`,
                  }}
                />
                <div 
                  className="absolute border-2 border-dashed border-indigo-400 pointer-events-none"
                  style={{
                    left: crop.x,
                    top: crop.y,
                    width: crop.width,
                    height: crop.height,
                  }}
                />
              </>
            )}
          </div>
        </div>
        <p className="text-center text-slate-400 mt-3 text-sm">คลิกและลากเพื่อเลือกพื้นที่ หรือลากพื้นที่ที่เลือกเพื่อย้าย</p>
        <div className="flex justify-end items-center gap-3 mt-4">
          <button onClick={onCancel} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out h-10">
            ยกเลิก
          </button>
          <button onClick={handleApplyCrop} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out h-10 shadow-lg min-w-[120px]">
            ปรับใช้
          </button>
        </div>
      </div>
    </div>
  );
};
