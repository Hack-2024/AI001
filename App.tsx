import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { NumberOfImagesSelector } from './components/NumberOfImagesSelector';
import { ModeSelector } from './components/ModeSelector';
import { ImageUploader } from './components/ImageUploader';
import { ImageCropper } from './components/ImageCropper';
import { GeneratePlaceholder } from './components/Placeholders';
import { 
  generateImage as generateImageFromApi, 
  editImage as editImageFromApi,
  analyzeImage as analyzeImageFromApi,
  AspectRatio 
} from './services/geminiService';

const MAX_EDIT_IMAGES = 4;

const App: React.FC = () => {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [uploadedImages, setUploadedImages] = useState<{ data: string; mimeType: string }[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [croppingState, setCroppingState] = useState<{ index: number; url: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null);

  const resetStateForModeChange = () => {
    setPrompt('');
    setImageUrls(null);
    setUploadedImages([]);
    setPreviewUrls([]);
    setError(null);
  };

  const handleModeChange = (newMode: 'generate' | 'edit') => {
    if (newMode !== mode) {
      setMode(newMode);
      resetStateForModeChange();
      setNumberOfImages(1);
    }
  };
  
  const handleImageUpload = (file: File) => {
    if (uploadedImages.length >= MAX_EDIT_IMAGES) {
      setError(`สามารถอัปโหลดได้สูงสุด ${MAX_EDIT_IMAGES} รูปภาพ`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const dataUrl = reader.result as string;
      setUploadedImages(prev => [...prev, { data: base64String, mimeType: file.type }]);
      setPreviewUrls(prev => [...prev, dataUrl]);
      setImageUrls(null); // Clear previous results
      setError(null);
    };
    reader.onerror = () => {
      setError('ไม่สามารถอ่านไฟล์รูปภาพได้');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleCropComplete = (croppedDataUrl: string) => {
    if (croppingState === null) return;

    const indexToUpdate = croppingState.index;
    const base64String = croppedDataUrl.split(',')[1];
    
    const mimeTypeMatch = croppedDataUrl.match(/data:(.*);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

    setUploadedImages(prev => 
      prev.map((img, index) => 
        index === indexToUpdate ? { data: base64String, mimeType } : img
      )
    );
    setPreviewUrls(prev => 
      prev.map((url, index) => 
        index === indexToUpdate ? croppedDataUrl : url
      )
    );
    setCroppingState(null);
  };

  const handleAnalyzeImage = async (indexToAnalyze: number) => {
    setIsAnalyzing(indexToAnalyze);
    setError(null);
    try {
      const imageToAnalyze = uploadedImages[indexToAnalyze];
      if (!imageToAnalyze) {
        throw new Error('ไม่พบรูปภาพที่ต้องการวิเคราะห์');
      }
      const generatedPrompt = await analyzeImageFromApi(imageToAnalyze);
      setPrompt(generatedPrompt);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก';
      setError(`เกิดข้อผิดพลาดในการวิเคราะห์: ${errorMessage}`);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) {
      setError('กรุณาใส่คำสั่ง');
      return;
    }
    
    if (mode === 'edit' && uploadedImages.length === 0) {
       setError('กรุณาอัปโหลดรูปภาพเพื่อแก้ไข');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrls(null); 
    
    try {
      if (mode === 'generate') {
        const resultImageUrls = await generateImageFromApi(prompt, aspectRatio, numberOfImages);
        setImageUrls(resultImageUrls);
      } else { 
        const resultImageUrl = await editImageFromApi(uploadedImages, prompt);
        setImageUrls([resultImageUrl]);
      }
      setUploadedImages([]);
      setPreviewUrls([]);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก';
      setError(`เกิดข้อผิดพลาด: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, numberOfImages, mode, uploadedImages]);

  const handleReset = () => {
    setError(null);
    setPrompt('');
    setImageUrls(null);
    if (mode === 'generate') {
      setAspectRatio('1:1');
      setNumberOfImages(1);
    } else {
      setUploadedImages([]);
      setPreviewUrls([]);
    }
  };

  const showReset = mode === 'generate'
    ? prompt.trim() !== '' || aspectRatio !== '1:1' || numberOfImages !== 1
    : prompt.trim() !== '' || uploadedImages.length > 0;

  const editModeChildren = (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
        {/* Render existing image previews */}
        {previewUrls.map((url, index) => (
          <div key={index} className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
            <button
              onClick={() => handleRemoveImage(index)}
              disabled={isLoading || isAnalyzing !== null}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 disabled:opacity-50"
              aria-label="ลบรูปภาพ"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setCroppingState({ index, url })}
              disabled={isLoading || isAnalyzing !== null}
              className="absolute -bottom-2 -left-2 bg-indigo-600 text-white rounded-full p-1.5 leading-none shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:opacity-50"
              aria-label="ปรับขนาดภาพ"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path>
                  <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>
              </svg>
            </button>
            <button
              onClick={() => handleAnalyzeImage(index)}
              disabled={isLoading || isAnalyzing !== null}
              className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full p-1.5 leading-none shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="สร้างพร้อมพ์จากภาพนี้"
            >
              {isAnalyzing === index ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
            </button>
          </div>
        ))}
  
        {/* Render the uploader for the next image if there's space */}
        {uploadedImages.length < MAX_EDIT_IMAGES && (
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
            <ImageUploader 
              onUpload={handleImageUpload} 
              disabled={isLoading || isAnalyzing !== null} 
              headerText={uploadedImages.length === 0 ? 'อัปโหลดภาพ' : 'เพิ่มอีกภาพ'}
              subText={`(${uploadedImages.length}/${MAX_EDIT_IMAGES})`}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          <Header />
          <main className="mt-8 space-y-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 sm:p-6 space-y-5 shadow-lg">
              <ModeSelector selected={mode} onSelect={handleModeChange} disabled={isLoading || isAnalyzing !== null} />
              
              <div>
                <label htmlFor="prompt-input" className="block text-center text-slate-400 mb-3 text-sm sm:text-base">
                  {mode === 'generate' 
                    ? 'อธิบายภาพที่คุณต้องการสร้าง สามารถเจาะจงหรือใช้ความคิดสร้างสรรค์ได้เต็มที่!'
                    : 'อัปโหลดรูปภาพ แล้วอธิบายการเปลี่ยนแปลงที่คุณต้องการ'}
                </label>
                <PromptInput
                  id="prompt-input"
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  placeholder={mode === 'generate' 
                    ? "เช่น สิงโตสง่างามสวมมงกุฎ แสงแบบภาพยนตร์ สมจริง..." 
                    : "เช่น เพิ่มหมวกปาร์ตี้ให้แมว, เปลี่ยนพื้นหลังเป็นอวกาศ..."}
                  buttonText={mode === 'generate' ? 'สร้าง' : 'แก้ไข'}
                  onReset={handleReset}
                  showReset={showReset}
                />
              </div>

              {mode === 'generate' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AspectRatioSelector 
                    selected={aspectRatio}
                    onSelect={setAspectRatio}
                    disabled={isLoading}
                  />
                  <NumberOfImagesSelector
                    selected={numberOfImages}
                    onSelect={setNumberOfImages}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-300 px-4 py-3 rounded-lg text-center">
                <p>{error}</p>
              </div>
            )}

            <ImageDisplay imageUrls={imageUrls} isLoading={isLoading} prompt={prompt}>
              {mode === 'edit' ? (
                  editModeChildren
                ) : (
                  <GeneratePlaceholder />
                )}
            </ImageDisplay>
          </main>
        </div>
      </div>
      {croppingState && (
          <ImageCropper 
              src={croppingState.url}
              onCropComplete={handleCropComplete}
              onCancel={() => setCroppingState(null)}
          />
      )}
    </>
  );
};

export default App;