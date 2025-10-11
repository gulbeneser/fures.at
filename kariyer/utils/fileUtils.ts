// FIX: Declare pdfjsLib to resolve the 'Cannot find name' error, assuming it's loaded globally.
declare const pdfjsLib: any;

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:*/*;base64," part
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((item: { str: string }) => item.str).join(' ');
    }
    return textContent;
};

export const extractTextFromHTML = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            try {
                const text = reader.result as string;
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                resolve(doc.body.textContent || '');
            } catch (error) {
                reject('Failed to parse HTML file.');
            }
        };
        reader.onerror = (error) => reject(error);
    });
};


const MAX_API_SIZE_BYTES = 4 * 1024 * 1024; // 4MB API limit for Gemini

/**
 * Compresses an image file if it exceeds the API's size limit.
 * @param file The image file to process.
 * @returns A promise that resolves with the compressed file, or the original file if no compression was needed.
 */
export const compressImageIfNeeded = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Only compress if it's an image and it's over the API limit
        if (!file.type.startsWith('image/') || file.size <= MAX_API_SIZE_BYTES) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Failed to get canvas context.'));
                }

                // Calculate new dimensions to reduce pixel count proportionally to file size excess
                let { width, height } = img;
                const sizeRatio = Math.sqrt(file.size / (MAX_API_SIZE_BYTES * 0.9)); // aim for 90% of max to be safe

                if (sizeRatio > 1) {
                    width = Math.floor(width / sizeRatio);
                    height = Math.floor(height / sizeRatio);
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            if (blob.size <= MAX_API_SIZE_BYTES) {
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                reject(new Error(`Image is too large. Even after compression it exceeds 4MB. Please upload a smaller image.`));
                            }
                        } else {
                            reject(new Error('Failed to create blob from canvas.'));
                        }
                    },
                    'image/jpeg', // Force jpeg for better compression
                    0.9 // Image quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};