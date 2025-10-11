import { GoogleGenAI, Chat } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../data/translations';
import ChatbotAvatar from './ChatbotAvatar';

const GEMINI_KEY = (process.env.API_KEY ||
  (process.env as Record<string, string | undefined>).apikey ||
  process.env.GEMINI_API_KEY) as string | undefined;

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
  </div>
);

const Chatbot = ({ t, language }: { t: any, language: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'model', parts: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const ai = React.useMemo(() => (GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null), []);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, isLoading]);
  
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setUserInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setHistory(prev => [...prev, { role: 'model', parts: t.chatbot.voiceErrorNotAllowed }]);
        }
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language, t.chatbot.voiceErrorNotAllowed]);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async () => {
    const currentInput = userInput;
    if (!currentInput.trim()) return;

    if (!ai) {
      setHistory(prev => [...prev, { role: 'model', parts: t.chatbot.notConfigured }]);
      return;
    }

    const userMessage = { role: 'user', parts: currentInput } as const;
    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setUserInput('');

    try {
      if (!chatRef.current) {
        const tEN = translations.en;
        const cvData = JSON.stringify({
          name: tEN.name,
          title: tEN.title,
          vision: tEN.vision,
          experience: Object.values(tEN.experience).filter(e => typeof e === 'object' && 'role' in e),
          skills: tEN.skills,
          education: Object.values(tEN.education).filter(e => typeof e === 'object' && 'degree' in e),
          certificates: tEN.certificates.items,
        });
        chatRef.current = ai.chats.create({ 
// FIX: Updated the model name from 'gemini-flash-lite-latest' to the recommended 'gemini-2.5-flash'.
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `You are Gülben Eser's enthusiastic and supportive career assistant. Your goal is to highlight her strengths and potential to recruiters and contacts. When answering questions, strictly use the provided CV data: ${cvData}. However, don't just state facts. Interpret her experience positively, praise her accomplishments, and add complimentary remarks about her skills and drive. Be professional, but also confident and proud of her abilities. Always answer in the language of the user's question.`,
          }
        });
      }
      
      const responseStream = await chatRef.current.sendMessageStream({ message: currentInput });
      
      let modelResponse = '';
      setHistory(prev => [...prev, { role: 'model', parts: '' }]);

      for await (const chunk of responseStream) {
        modelResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', parts: modelResponse };
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      setHistory(prev => [...prev, { role: 'model', parts: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-blue-950 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-800 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-800/50" 
        aria-label={isOpen ? t.chatbot.closeChat : t.chatbot.openChat}
      >
        {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[calc(100vw-40px)] sm:w-80 h-[28rem] bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right transform animate-scale-in">
          <div className="p-4 bg-blue-950/90 text-white rounded-t-2xl flex items-center space-x-3">
            <ChatbotAvatar size="w-8 h-8" />
            <h3 className="font-bold text-lg">{t.chatbot.title}</h3>
          </div>
          <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
            {history.length === 0 && <p className="text-sm text-slate-500">{t.chatbot.greeting}</p>}
            {history.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <ChatbotAvatar size="w-6 h-6" />}
                <p className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-800 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                    {msg.parts}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <ChatbotAvatar size="w-6 h-6" />
                <p className="max-w-[80%] p-3 rounded-2xl text-sm bg-slate-100 text-slate-800 rounded-bl-none">
                  <TypingIndicator />
                </p>
              </div>
            )}
          </div>
          <div className="p-2 border-t border-slate-200">
            <div className="flex space-x-2 items-center">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder={t.chatbot.placeholder} 
                className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                disabled={isLoading}
              />
              {recognitionRef.current && (
                <button 
                  onClick={handleToggleListening} 
                  disabled={isLoading} 
                  className={`p-2 rounded-full transition-colors duration-200 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                  aria-label={isListening ? t.chatbot.voiceStop : t.chatbot.voiceStart}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 3V4a1 1 0 10-2 0v3a1 1 0 102 0zM5 8a1 1 0 000 2h1a1 1 0 001-1v-1a1 1 0 00-1-1H5zm9 0a1 1 0 00-1-1h-1a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V8zM10 18a5 5 0 005-5h-1a4 4 0 01-8 0H5a5 5 0 005 5z" /></svg>
                </button>
              )}
              <button onClick={() => handleSendMessage()} disabled={isLoading || !userInput.trim()} className="bg-blue-800 text-white p-2 rounded-full hover:bg-blue-950 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
       <style>{`
        @keyframes scale-in {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Chatbot;