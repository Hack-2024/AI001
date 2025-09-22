import { GoogleGenAI, Modality } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export async function generateImage(prompt: string, aspectRatio: AspectRatio, numberOfImages: number): Promise<string[]> {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(image => `data:image/png;base64,${image.image.imageBytes}`);
    } else {
      throw new Error('ไม่พบรูปภาพที่สร้างโดย API');
    }
  } catch (error) {
    console.error('Error generating image with Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('เกิดข้อผิดพลาดที่ไม่รู้จักขณะสร้างรูปภาพ');
  }
}

export async function editImage(images: { data: string; mimeType: string }[], prompt: string): Promise<string> {
  try {
    const imageParts = images.map(image => ({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          ...imageParts,
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      const base64ImageBytes: string = imagePart.inlineData.data;
      return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
    } else {
      const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
      if (textPart && textPart.text) {
          throw new Error(`API ไม่ได้ส่งรูปภาพกลับมา แต่ส่งข้อความ: "${textPart.text}"`);
      }
      throw new Error('ไม่พบรูปภาพที่แก้ไขแล้วในผลลัพธ์จาก API');
    }
  } catch (error) {
    console.error('Error editing image with Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('เกิดข้อผิดพลาดที่ไม่รู้จักขณะแก้ไขรูปภาพ');
  }
}

export async function analyzeImage(image: { data: string; mimeType: string }): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: image.data,
              mimeType: image.mimeType,
            },
          },
          {
            text: 'Describe this image in detail for an image generation prompt. Be specific about subjects, style, composition, colors, and lighting. Output only the prompt text, without any introductory phrases like "This is a prompt of..." or any other conversational text.',
          },
        ],
      },
    });

    const text = response.text;
    if (text) {
      return text.trim();
    } else {
      throw new Error('API did not return a text description.');
    }
  } catch (error) {
    console.error('Error analyzing image with Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('เกิดข้อผิดพลาดที่ไม่รู้จักขณะวิเคราะห์รูปภาพ');
  }
}
