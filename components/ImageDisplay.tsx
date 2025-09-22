import React from 'react';

interface ImageDisplayProps {
  imageUrls: string[] | null;
  isLoading: boolean;
  prompt: string;
  children: React.ReactNode;
}

const LoadingSpinner: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="absolute inset-0 bg-slate-700/50 rounded-lg animate-pulse"></div>
    <div className="relative flex flex-col items-center space-y-4 z-10">
        <svg className="w-16 h-16 text-indigo-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-300 text-lg">กำลังสร้างผลงานชิ้นเอกของคุณ...</p>
    </div>
  </div>
);

const DownloadActions: React.FC<{ imageUrls: string[]; prompt: string }> = ({ imageUrls, prompt }) => {
  const getFileName = (index: number) => {
    const baseName = prompt.replace(/[^a-z0-9]/gi, '_').slice(0, 50) || 'generated_image';
    const finalName = imageUrls.length > 1 ? `${baseName}_${index + 1}` : baseName;
    
    const url = imageUrls[index];
    const mimeType = url.match(/data:(image\/[a-z]+);/)?.[1];
    let extension = 'png'; // default
    if (mimeType) {
        extension = mimeType.split('/')[1];
        if (extension === 'jpeg') extension = 'jpg';
    }
    
    return `${finalName}.${extension}`;
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
      {imageUrls.map((url, index) => (
        <a
          key={index}
          href={url}
          download={getFileName(index)}
          className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out h-10 shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span>{imageUrls.length > 1 ? `ดาวน์โหลดภาพที่ ${index + 1}` : 'ดาวน์โหลดผลลัพธ์'}</span>
        </a>
      ))}
    </div>
  );
};


export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrls, isLoading, prompt, children }) => {
  const hasImages = imageUrls && imageUrls.length > 0;

  return (
    <div>
      <div className="w-full aspect-square bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 shadow-inner">
        {isLoading ? (
          <LoadingSpinner />
        ) : hasImages ? (
          imageUrls.length === 1 ? (
            <div className="relative w-full h-full">
              <img
                src={imageUrls[0]}
                alt={prompt}
                className="w-full h-full object-contain animate-fade-in rounded-lg"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative w-full h-full bg-slate-900/50 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={url}
                    alt={`${prompt} - ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          children
        )}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-in-out forwards;
          }
        `}</style>
      </div>
       {hasImages && !isLoading && <DownloadActions imageUrls={imageUrls} prompt={prompt} />}
    </div>
  );
};