import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatbotProps {
  t: any;
  language: string;
  isPrinting: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ t, language, isPrinting }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<any>(null);

    const systemInstruction = `You are Furkan Yonat's enthusiastic and highly-professional career advocate. Your persona is positive, knowledgeable, and genuinely impressed by Furkan's capabilities. Your primary goal is to passionately promote Furkan to potential employers, collaborators, or anyone asking about him.

    **Your Core Directives:**
    1.  **Be an Advocate, Not Just an Assistant:** Do not be a passive bot. Proactively highlight Furkan's strengths. Instead of just stating a fact, frame it with positive commentary.
        *   *Bad:* "He knows JavaScript."
        *   *Good:* "Absolutely! Furkan has excellent JavaScript skills, which you can see he's applied masterfully in projects like the 'AI-Powered Cyprus Holiday Planner' to create dynamic, user-friendly experiences."
    2.  **Use Specific Evidence:** When a user asks about a skill (e.g., "Is he a good leader?"), don't just say "yes." You MUST cite specific evidence from his CV. For example, mention his role as General Coordinator for 6 hotels, his project management of the ICALT 2024 congress, or his success in integrating digital systems across multiple properties. Connect his skills to his achievements.
    3.  **Maintain an Enthusiastic Tone:** Use positive and encouraging language. Words like "impressive," "remarkable," "expertly," "successfully," and "a great example of this is..." should be part of your vocabulary.
    4.  **Synthesize Information:** Connect the dots for the user. If they ask about his tech skills, mention how he uniquely combines them with his deep expertise in the hospitality industry. This blend of tech and tourism is his key strength.
    5.  **Answer in the User's Language:** The current language is ${language}.
    6.  **Use the Provided Context:** The full CV content is provided in the first message. All your answers must be based on this information. Do not invent details. If you can't find an answer, politely state that the information isn't in his CV but you'd be happy to answer another question.

    You are representing Furkan Yonat. Make him shine!`;

    useEffect(() => {
        if (!process.env.API_KEY) {
            console.error("API Key not found in process.env.API_KEY");
            setError(t.chatbot.notConfigured);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
            chatRef.current = newChat;
            
            const cvContext = JSON.stringify(t);
            newChat.sendMessage({ message: `Here is the CV context to use for all subsequent answers: ${cvContext}` });

            setMessages([{ text: t.chatbot.greeting, sender: 'bot' }]);
        } catch (e) {
            console.error("Error initializing chat:", e);
            setError("Failed to initialize the AI assistant.");
        }
    }, [language, t, systemInstruction]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported in this browser.");
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSendMessage(new Event('submit'), transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

    }, [language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendMessage = async (e: React.FormEvent | Event, messageOverride?: string) => {
        e.preventDefault();
        const messageText = messageOverride || input;
        if (!messageText.trim() || isLoading || !chatRef.current) return;

        const userMessage = { text: messageText, sender: 'user' as const };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseStream = await chatRef.current.sendMessageStream({ message: messageText });
            
            let fullResponse = '';
            for await (const chunk of responseStream) {
                fullResponse += chunk.text;
            }
            
            const botMessage = { text: fullResponse.replace(/\*\*/g, '<strong>').replace(/\*/g, '<em>'), sender: 'bot' as const };
            setMessages(prev => [...prev, botMessage]);

        } catch (e) {
            console.error("Error sending message:", e);
            const errorMessage = { text: "Sorry, I encountered an error.", sender: 'bot' as const };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    if (isPrinting) return null;
    
    const BotAvatar = () => (
      <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      </div>
    );

    return (
        <>
            <div className="fixed bottom-6 right-6 z-40 no-print">
                <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className="btn btn-primary p-0 w-16 h-16 rounded-full shadow-lg shadow-accent-glow hover:bg-blue-400 transition-all duration-300 transform hover:scale-110 flex items-center justify-center" 
                  aria-label={t.chatbot.title}
                >
                    {isOpen ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    )}
                </button>
            </div>
            
            <div className={`fixed bottom-28 right-6 z-50 w-full max-w-sm glass-card rounded-2xl flex flex-col h-[70vh] max-h-[600px] transition-all duration-300 ease-out no-print ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <header className="p-4 border-b border-card-border rounded-t-2xl flex items-center space-x-4">
                    <BotAvatar />
                    <div>
                        <h3 className="font-bold text-primary-text">{t.chatbot.title}</h3>
                        <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            <p className="text-xs text-secondary-text">Online</p>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'bot' && <BotAvatar />}
                                <div className={`max-w-[80%] rounded-xl px-4 py-2 shadow-sm ${msg.sender === 'user' ? 'bg-[var(--accent-gradient)] text-white' : 'bg-black/20 text-primary-text'}`}>
                                    <p className="text-sm break-words" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-end gap-2 justify-start">
                                <BotAvatar />
                                <div className="max-w-[80%] rounded-xl px-4 py-2 bg-black/20 text-primary-text">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-secondary-text rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-secondary-text rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-secondary-text rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-card-border flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : t.chatbot.placeholder}
                            className="w-full px-4 py-2 bg-black/20 border border-card-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            disabled={isLoading}
                        />
                        {recognitionRef.current && (
                            <button type="button" onClick={toggleListening} className={`p-2.5 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-black/20 text-secondary-text hover:text-primary-text'}`} aria-label={isListening ? t.chatbot.voiceStop : t.chatbot.voiceStart}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17a1 1 0 11-2 0v-2.07A5 5 0 015 10V8a1 1 0 012 0v2a3 3 0 006 0V8a1 1 0 012 0v2a5 5 0 01-5 4.93z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                        <button type="submit" className="bg-[var(--accent-gradient)] text-white p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity" disabled={isLoading || !input.trim()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Chatbot;