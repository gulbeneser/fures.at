import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob, Session } from '@google/genai';
import { CVData } from '../types';
import { LanguageContext } from '../App';
import * as geminiService from '../services/geminiService';

const GEMINI_KEY = (process.env.API_KEY ||
  (process.env as Record<string, string | undefined>).apikey ||
  process.env.GEMINI_API_KEY) as string | undefined;

type Voice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

interface InterviewSimulatorModalProps {
    cvData: CVData;
    jobDescription: string;
    voiceName: Voice;
    onClose: () => void;
    setError: (error: string | null) => void;
}

// ---- Audio Helper Functions from Gemini Docs ----
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
// ---------------------------------------------


const MicIcon = ({ isReady }: { isReady: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isReady ? 'text-green-500' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-5.93 5.98A5.98 5.98 0 0111 14.93zM13 8a1 1 0 10-2 0v2.07A5.98 5.98 0 0113 10.07V8z" clipRule="evenodd" />
        {!isReady && <path fillRule="evenodd" d="M2.293 2.293a1 1 0 011.414 0L17.707 16.293a1 1 0 11-1.414 1.414L2.293 3.707a1 1 0 010-1.414z" />}
    </svg>
);


const InterviewSimulatorModal: React.FC<InterviewSimulatorModalProps> = ({ cvData, jobDescription, voiceName, onClose, setError }) => {
    const { t } = useContext(LanguageContext);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [status, setStatus] = useState<'idle' | 'preparing' | 'initializing' | 'ready' | 'active' | 'ended'>('idle');
    const [transcript, setTranscript] = useState<{ speaker: 'user' | 'model', text: string }[]>([]);
    const [isGeminiSpeaking, setIsGeminiSpeaking] = useState(false);

    const sessionPromiseRef = useRef<Promise<Session> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');


    useEffect(() => {
        if (GEMINI_KEY) {
            setAi(new GoogleGenAI({ apiKey: GEMINI_KEY }));
        } else {
            setError("API anahtarı bulunamadı. Lütfen 'apikey' değişkenini tanımlayın.");
        }
        return () => { handleEndInterview(true); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initializeAndStart = async () => {
        setStatus('initializing');
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Media Devices API not supported.");
            }
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStatus('ready');
            // Automatically start the interview once mic is ready
            startInterview();
        } catch (err) {
            setError(t('micError'));
            setStatus('idle');
            console.error("Microphone access error:", err);
        }
    };
    
    const createBlob = (data: Float32Array): GenAIBlob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    };

    const startInterview = async () => {
        if (!ai || !streamRef.current) return;

        setStatus('preparing');
        setError(null);
        
        try {
            const detectedLanguage = await geminiService.detectLanguage(jobDescription);

            const systemInstruction = `You are a professional hiring manager conducting a job interview. The candidate's CV is provided below. The job description is also provided. Your goal is to assess the candidate's suitability for the role. Ask relevant behavioral and technical questions based on their experience and the job requirements. Keep your responses concise and conversational. Start by introducing yourself and the role, and then begin the interview. CRITICAL: The entire interview must be conducted in ${detectedLanguage}. Do not switch languages.
            
            Candidate CV:
            ---
            ${JSON.stringify(cvData, null, 2)}
            ---
            
            Job Description:
            ---
            ${jobDescription}
            ---`;

            setStatus('active');
            setTranscript([]);

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
                    },
                    systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            
                            sessionPromiseRef.current?.then((session) => {
                               session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                        scriptProcessorRef.current = scriptProcessor;
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const userInput = currentInputTranscriptionRef.current.trim();
                            const modelOutput = currentOutputTranscriptionRef.current.trim();
                            
                            if (userInput) {
                               setTranscript(prev => [...prev, { speaker: 'user', text: userInput }]);
                            }
                            if (modelOutput) {
                               setTranscript(prev => [...prev, { speaker: 'model', text: modelOutput }]);
                            }
                            
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            setIsGeminiSpeaking(true);
                            const outputContext = outputAudioContextRef.current!;
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputContext, 24000, 1);
                            const source = outputContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputContext.destination);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) {
                                    setIsGeminiSpeaking(false);
                                }
                            });

                            const currentTime = outputContext.currentTime;
                            const startTime = Math.max(currentTime, nextStartTimeRef.current);
                            source.start(startTime);
                            nextStartTimeRef.current = startTime + audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                             for (const source of sourcesRef.current.values()) {
                                source.stop();
                                sourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                            setIsGeminiSpeaking(false);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(t('sessionError'));
                        console.error("Session error:", e);
                        handleEndInterview(true);
                    },
                    onclose: () => {
                        // Session closed by server
                    },
                },
            });

        } catch(err: any) {
            setError(err.message || "Failed to prepare the interview.");
            setStatus('idle');
        }
    };

    const handleEndInterview = async (isCleaningUp = false) => {
        setStatus('ended');

        streamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        inputAudioContextRef.current?.close().catch(e => console.error("Error closing input audio context", e));

        if (outputAudioContextRef.current) {
            for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
            }
            sourcesRef.current.clear();
            outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context", e));
        }

        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (error) {
                console.error("Error closing session:", error);
            }
        }
        
        sessionPromiseRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        streamRef.current = null;
        scriptProcessorRef.current = null;

        if (isCleaningUp) return;
    };


    const renderContent = () => {
        switch (status) {
            case 'idle':
                return (
                    <div className="text-center">
                        <h4 className="text-xl font-semibold mb-4">{t('interviewReady')}</h4>
                        <button onClick={initializeAndStart} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">
                           {t('startInterview')}
                        </button>
                    </div>
                );
            case 'initializing':
            case 'preparing':
                return (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p>{status === 'initializing' ? 'Initializing microphone...' : t('interviewPreparation')}</p>
                    </div>
                );
            case 'ready': // This state is now skipped, but kept for potential future logic
                 return (
                     <div className="text-center">
                        <h4 className="text-xl font-semibold mb-2">{t('micReady')}</h4>
                        <p className="text-gray-600 mb-4">Starting interview...</p>
                    </div>
                 );
            case 'active':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="text-xl font-semibold">{t('interviewInProgress')}</h4>
                             <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-100">
                                <MicIcon isReady={!isGeminiSpeaking} />
                                <span>{isGeminiSpeaking ? t('geminiSpeaking') : t('yourTurn')}</span>
                             </div>
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-lg p-4 overflow-y-auto">
                            {transcript.map((entry, index) => (
                                <div key={index} className={`mb-3 ${entry.speaker === 'user' ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block p-2 rounded-lg max-w-[80%] ${entry.speaker === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                                        {entry.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => handleEndInterview()} className="mt-4 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">{t('endInterview')}</button>
                    </div>
                );
            case 'ended':
                 return (
                    <div className="flex flex-col h-full">
                         <h4 className="text-xl font-semibold mb-4 text-center">{t('interviewEnded')}</h4>
                         <h5 className="font-semibold mb-2">{t('transcript')}</h5>
                         <div className="flex-1 bg-gray-100 rounded-lg p-4 overflow-y-auto">
                            {transcript.map((entry, index) => (
                                <div key={index} className={`mb-3 ${entry.speaker === 'user' ? 'text-right' : 'text-left'}`}>
                                     <p className="text-xs text-gray-500 mb-1">{entry.speaker === 'user' ? 'You' : 'Interviewer'}</p>
                                    <div className={`inline-block p-2 rounded-lg max-w-[80%] ${entry.speaker === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                                        {entry.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                         <button onClick={onClose} className="mt-4 w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Close</button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-2xl font-bold">{t('interviewSimulator')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default InterviewSimulatorModal;