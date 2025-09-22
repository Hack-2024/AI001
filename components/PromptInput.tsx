import React from 'react';

interface PromptInputProps {
  id?: string;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
  buttonText?: string;
  onReset?: () => void;
  showReset?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  id,
  prompt, 
  setPrompt, 
  onSubmit, 
  isLoading,
  placeholder = "เช่น สิงโตสง่างามสวมมงกุฎ แสงแบบภาพยนตร์ สมจริง...",
  buttonText = "สร้าง",
  onReset,
  showReset
}) => {
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <textarea
        id={id}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-300 resize-none shadow-sm"
        rows={3}
        disabled={isLoading}
      />
      <div className="flex justify-end items-center gap-3">
        {showReset && (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="bg-transparent hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out h-10"
            aria-label="รีเซ็ตค่า"
          >
            รีเซ็ต
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={isLoading || !prompt.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-300 ease-in-out flex items-center justify-center h-10 shadow-lg min-w-[120px]"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              {buttonText}
            </>
          )}
        </button>
      </div>
    </div>
  );
};