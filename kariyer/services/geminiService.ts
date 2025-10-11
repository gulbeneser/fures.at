import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CVData, DesignOptions } from '../types';

const GEMINI_KEY = (process.env.API_KEY ||
  (process.env as Record<string, string | undefined>).apikey ||
  process.env.GEMINI_API_KEY) as string | undefined;

if (!GEMINI_KEY) {
    console.warn("Gemini API anahtarı bulunamadı. 'apikey' ortam değişkenini tanımlayın.");
}

const ai = GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null;

const cvDataSchema = {
    type: Type.OBJECT,
    properties: {
        personalInfo: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                address: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                website: { type: Type.STRING },
            },
            required: ['name', 'email']
        },
        summary: {
            type: Type.STRING,
            description: "A professional summary or objective, 2-4 sentences long."
        },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier, e.g., using crypto.randomUUID()" },
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING, description: "Can be 'Present' or a date." },
                    description: { type: Type.STRING, description: "A few bullet points or a short paragraph describing responsibilities and achievements." }
                },
                required: ['id', 'jobTitle', 'company', 'startDate', 'endDate', 'description']
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier, e.g., using crypto.randomUUID()" },
                    degree: { type: Type.STRING },
                    school: { type: Type.STRING },
                    location: { type: Type.STRING },
                    gradDate: { type: Type.STRING }
                },
                required: ['id', 'degree', 'school', 'gradDate']
            }
        },
        skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ['personalInfo', 'summary', 'experience', 'education', 'skills']
};

export const detectLanguage = async (text: string): Promise<string> => {
    const prompt = `Detect the primary language of the following text. Respond with the name of the language in English (e.g., 'German', 'Spanish', 'Turkish', 'English').
---
${text}
---`;
    if (!ai) {
        throw new Error('Gemini API key is missing.');
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error detecting language:", error);
        return 'English'; // Default to English on error
    }
};


export const extractCVDataFromText = async (text: string, language: string): Promise<CVData> => {
    const prompt = `Extract the structured CV data from the following text. The text is in ${language}. Generate a unique ID for each experience and education entry. If some information is missing, leave the corresponding fields empty.

Text:
---
${text}
---
`;
    if (!ai) {
        throw new Error('Gemini API key is missing.');
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: cvDataSchema
            }
        });

        const jsonResponse = JSON.parse(response.text);
        // Ensure profilePhoto is present
        if (!jsonResponse.personalInfo.profilePhoto) {
            jsonResponse.personalInfo.profilePhoto = '';
        }
        return jsonResponse as CVData;
    } catch (error) {
        console.error("Error extracting CV data from text:", error);
        throw new Error("Failed to parse CV data from text. The format might be unsupported.");
    }
};

export const extractCVDataFromImage = async (base64Image: string, mimeType: string, language: string): Promise<CVData> => {
    if (!ai) {
        throw new Error('Gemini API key is missing.');
    }

    const prompt = `Extract the structured CV data from the provided image. The text in the image is in ${language}. Generate a unique ID for each experience and education entry. If some information is missing, leave the corresponding fields empty.`;

    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: cvDataSchema
            }
        });
        
        const jsonResponse = JSON.parse(response.text);
         // Ensure profilePhoto is present
         if (!jsonResponse.personalInfo.profilePhoto) {
            jsonResponse.personalInfo.profilePhoto = base64Image ? `data:${mimeType};base64,${base64Image}` : '';
        }
        return jsonResponse as CVData;
    } catch (error) {
        console.error("Error extracting CV data from image:", error);
        throw new Error("Failed to parse CV data from the image. The image might be unclear or the format unsupported.");
    }
};

export const enhanceText = async (originalText: string, context: string, language: string): Promise<string> => {
    const prompt = `You are a professional resume writer. Your task is to enhance the following text for a CV, making it more impactful and professional.
Context: "${context}"
Original Text: "${originalText}"
Language: ${language}
Rewrite the text, keeping the core meaning but improving the wording, grammar, and impact. Use action verbs and quantifiable results where possible. Only return the enhanced text, without any additional explanations or introductory phrases.`;

    if (!ai) {
        throw new Error('Gemini API key is missing.');
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing text:", error);
        throw new Error("Failed to enhance text due to an API error.");
    }
};

export const enhancePhoto = async (base64Data: string, mimeType: string): Promise<{ base64Image: string; mimeType: string; }> => {
    const prompt = "Analyze the provided image. If it contains a person, generate a professional, high-quality headshot of that person suitable for a CV/resume. The background should be neutral (e.g., light gray, off-white, or a subtle office blur). The person should be dressed professionally. If the image is not of a person, or is inappropriate, return an image of a generic, friendly-looking default avatar.";

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    if (!ai) {
        throw new Error('Gemini API key is missing.');
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt },
                    imagePart
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64Image: part.inlineData.data,
                    mimeType: part.inlineData.mimeType
                };
            }
        }
        throw new Error("No image was generated in the response.");

    } catch (error) {
        console.error("Error enhancing photo:", error);
        throw new Error("Failed to generate headshot. Please try a different photo.");
    }
};


export const generateCVTemplateHTML = async (cvData: CVData, designOptions: DesignOptions, feedback: string, language: string): Promise<string> => {
    const prompt = `
You are an expert web designer specializing in creating professional and visually appealing CV templates. Your task is to generate a complete, single HTML file (with inline CSS) for a CV based on the provided data, design options, and user feedback.

**CV Data:**
\`\`\`json
${JSON.stringify(cvData, null, 2)}
\`\`\`

**Design Options:**
- Color Scheme: ${designOptions.colorScheme}
- Font Style: ${designOptions.fontStyle}

**User Feedback for Refinement (if any):**
"${feedback || 'No specific feedback provided.'}"

**Requirements:**
1.  **Single File:** The output must be a single HTML file. All CSS must be included within a \`<style>\` tag in the HTML \`<head>\`.
2.  **No External Dependencies:** Do not use any external stylesheets, scripts, or images. If you use icons, they must be inline SVGs. Use web-safe fonts or embed Google Fonts correctly using \`@import\` in the CSS.
3.  **Responsive Design:** The layout must be responsive and look good on both desktop and mobile devices. Use media queries.
4.  **Professional & Clean:** The design should be clean, modern, and professional, reflecting the chosen design options.
5.  **Print-Friendly:** Ensure the layout is optimized for printing on A4 paper. Use a print-specific media query if necessary to hide non-essential elements.
6.  **Data Integration:** Accurately populate the template with all the provided CV data. Handle missing data gracefully (e.g., don't show a LinkedIn section if the URL is not provided).
7.  **Language:** The static text in the template (like section headers) should be in ${language}.
8.  **Photo:** The profile photo is a data URL. Use it in an \`<img>\` tag.

Generate only the HTML code, starting with \`<!DOCTYPE html>\`. Do not include any explanations or markdown formatting around the code.
`;
    if (!ai) {
        throw new Error('Gemini API key is missing.');
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        // Clean up the response to ensure it's just HTML
        const htmlContent = response.text.trim();
        if (htmlContent.startsWith('```html')) {
            return htmlContent.replace(/^```html\n|```$/g, '');
        }
        return htmlContent;
    } catch (error) {
        console.error("Error generating CV template:", error);
        throw new Error("Failed to generate CV design due to an API error.");
    }
};

export const generateCoverLetter = async (cvData: CVData, jobDescription: string, companyInfo: string, language: string): Promise<string> => {
    const prompt = `
You are a professional career coach and writer. Your task is to write a compelling and personalized cover letter.

**Candidate's CV Data:**
\`\`\`json
${JSON.stringify(cvData, null, 2)}
\`\`\`

**Job Description:**
---
${jobDescription}
---

**Company Information (Optional):**
---
${companyInfo || "No specific company information provided."}
---

**Instructions:**
1.  Write the cover letter in ${language}.
2.  Address it to "Hiring Manager" if no specific name is available.
3.  Structure the letter with an introduction, body, and conclusion.
4.  In the introduction, state the position being applied for.
5.  In the body, highlight 2-3 key experiences or skills from the candidate's CV that directly align with the requirements in the job description. Use specific examples.
6.  If company information is provided, subtly weave it in to show the candidate has done their research and is interested in the company's mission or values.
7.  Conclude with a strong closing statement expressing enthusiasm for the role and a call to action (e.g., "I look forward to discussing my qualifications further").
8.  The tone should be professional, confident, and enthusiastic.
9.  Return only the text of the cover letter, without any explanations or headers.
`;
    if (!ai) {
        throw new Error('Gemini API key is missing.');
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating cover letter:", error);
        throw new Error("Failed to generate cover letter due to an API error.");
    }
};

export const analyzeJobFit = async (cvData: CVData, jobDescription: string, language: string): Promise<string> => {
    const prompt = `
You are an expert AI-powered recruitment assistant. Your task is to analyze how well a candidate's CV matches a job description and provide a detailed "Job Fit Analysis".

**Candidate's CV Data:**
\`\`\`json
${JSON.stringify(cvData, null, 2)}
\`\`\`

**Job Description:**
---
${jobDescription}
---

**Instructions:**
1.  Analyze the CV against the job description in ${language}.
2.  Provide the output in a clear, structured format using Markdown.
3.  Start with an overall summary of the candidate's fit for the role (e.g., "Strong Fit", "Good Fit", "Partial Fit") and a percentage score (e.g., "85% Match").
4.  Create a "Strengths / Alignment" section. List the key requirements from the job description and detail how the candidate's experience and skills (from their CV) meet these requirements. Use bullet points.
5.  Create a "Potential Gaps / Areas to Clarify" section. Identify any requirements from the job description that are not clearly addressed in the CV. Phrase these as opportunities for the candidate to elaborate on during an interview.
6.  Create a "Suggested Keywords" section. List important keywords from the job description that the candidate might want to emphasize more in their CV or cover letter.
7.  The tone should be constructive and helpful, aimed at helping the candidate prepare for an application or interview.
8.  Return only the analysis text, without any explanations or headers.
`;
    if (!ai) {
        throw new Error('Gemini API key is missing.');
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error analyzing job fit:", error);
        throw new Error("Failed to analyze job fit due to an API error.");
    }
};
