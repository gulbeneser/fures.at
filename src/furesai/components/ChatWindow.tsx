import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message as MessageType, Role } from '../types';
import Message from './Message';
import ChatInput from './ChatInput';
import { FuresAIIcon, CloseIcon } from './icons';
import { connectLiveSession, sendTextMessage, createPcmBlob, decode, decodeAudioData, generateImage } from '../services/geminiService';
import type { LiveServerMessage, Session } from '@google/genai';

interface ChatWindowProps {
  closeChat: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ closeChat }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live API State
  const [isListening, setIsListening] = useState(false);
  const liveSessionRef = useRef<Session | null>(null);
  const sessionPromiseRef = useRef<Promise<Session> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setIsLoading(true);
    sendTextMessage("Hello")
      .then((response) => {
        const responseText = (response as any).text ?? '';
        setMessages([
          {
            id: 'initial-ai-message',
            role: Role.AI,
            text: responseText,
          },
        ]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: MessageType = { id: Date.now().toString(), role: Role.USER, text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendTextMessage(text);
      const responseText = (response as any).text ?? '';
      const aiMessage: MessageType = { id: (Date.now() + 1).toString(), role: Role.AI, text: responseText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: MessageType = { id: 'error', role: Role.AI, text: "Sorry, I'm having trouble connecting right now." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    const userMessage: MessageType = { id: Date.now().toString(), role: Role.USER, text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setIsGeneratingImage(true);

    try {
      const { base64Image, mimeType, description } = await generateImage(prompt);
      const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
      const aiText = description?.trim() || "İstediğin görseli hazırladım.";
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: Role.AI,
        text: aiText,
        imageDataUrl,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating image:", error);
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: Role.AI,
        text: "Üzgünüm, şu anda görsel oluşturamıyorum. Lütfen tekrar dene.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- Live API Handlers ---
  const stopListening = useCallback(async () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    sessionPromiseRef.current = null;

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      audioSourcesRef.current.forEach((source) => source.stop());
      audioSourcesRef.current.clear();
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsListening(false);
  }, []);

  const handleLiveMessage = useCallback(async (message: LiveServerMessage) => {
    // Handle transcriptions
    if (message.serverContent?.inputTranscription) {
      currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
    }
    if (message.serverContent?.outputTranscription) {
      currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
    }

    if (message.serverContent?.turnComplete) {
      const userInput = currentInputTranscriptionRef.current.trim();
      const aiResponse = currentOutputTranscriptionRef.current.trim();
      if (userInput && aiResponse) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: Role.USER, text: userInput },
          { id: (Date.now() + 1).toString(), role: Role.AI, text: aiResponse },
        ]);
      }
      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';
    }

    // Handle audio playback
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && outputAudioContextRef.current) {
      const audioContext = outputAudioContextRef.current;
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);
      const audioBuffer = await decodeAudioData(decode(audioData), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      source.addEventListener('ended', () => {
        audioSourcesRef.current.delete(source);
      });

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      audioSourcesRef.current.add(source);
    }

    if (message.serverContent?.interrupted) {
      audioSourcesRef.current.forEach((source) => source.stop());
      audioSourcesRef.current.clear();
      nextStartTimeRef.current = 0;
    }
  }, []);

  const startListening = useCallback(async () => {
    setIsListening(true);
    try {
      if (!inputAudioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      sessionPromiseRef.current = connectLiveSession({
        onOpen: () => {
          const source = inputAudioContextRef.current!.createMediaStreamSource(micStreamRef.current!);
          scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);

          scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createPcmBlob(inputData);
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessorRef.current);
          scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
        },
        onMessage: handleLiveMessage,
        onError: (e: ErrorEvent) => {
          console.error("Live session error:", e);
          stopListening();
        },
        onClose: (e: CloseEvent) => {
          stopListening();
        },
      });

      liveSessionRef.current = await sessionPromiseRef.current;
    } catch (err) {
      console.error("Failed to start listening:", err);
      setIsListening(false);
    }
  }, [handleLiveMessage, stopListening]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-x-4 bottom-24 h-[60vh] max-h-[650px] bg-gray-800 rounded-2xl shadow-2xl flex flex-col text-white overflow-hidden z-40 sm:inset-x-auto sm:bottom-28 sm:right-8 sm:w-full sm:max-w-lg sm:h-[70vh] sm:max-h-[700px]">
      <header className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FuresAIIcon className="w-10 h-10" />
          <div>
            <h2 className="font-bold text-lg">FuresAI Assistant</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              <p className="text-xs text-gray-400">{isListening ? 'Listening' : 'Online'}</p>
            </div>
          </div>
        </div>
        <button onClick={closeChat} className="p-1 text-gray-400 hover:text-white transition-colors" aria-label="Close chat">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg) => (
          <Message key={msg.id} role={msg.role} text={msg.text} imageDataUrl={msg.imageDataUrl} />
        ))}
        {(isLoading || isGeneratingImage) && !isListening && (
          <div className="flex items-start gap-3 my-4">
            <FuresAIIcon className="w-8 h-8 flex-shrink-0" />
            <div className="px-4 py-3 rounded-2xl max-w-sm md:max-w-md bg-gray-700 text-white rounded-tl-none flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      <ChatInput
        onSendMessage={handleSendMessage}
        onGenerateImage={handleGenerateImage}
        onMicClick={handleMicClick}
        isLoading={isLoading}
        isListening={isListening}
        isGeneratingImage={isGeneratingImage}
      />
    </div>
  );
};

export default ChatWindow;
