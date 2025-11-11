
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage, Invoice, Income } from '../types';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ChatAssistantProps {
    invoices: Invoice[];
    income: Income[];
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ invoices, income }) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;
        
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await getChatResponse(newMessages, invoices, income, t, i18n.language);
            setMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: t('chat.error') }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSendMessage();
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-brand-accent text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-brand-accent/50 hover:scale-110 transition-transform duration-300"
                >
                    {isOpen ? <CloseIcon /> : <ChatIcon />}
                </button>
            </div>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[calc(100%-3rem)] sm:w-96 h-[60vh] bg-brand-secondary rounded-2xl shadow-2xl flex flex-col z-50 border border-brand-accent/30">
                    <header className="p-4 bg-brand-primary rounded-t-2xl flex justify-between items-center">
                        <h3 className="text-lg font-bold">{t('chat.title')}</h3>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-brand-text-secondary h-full flex flex-col justify-center">
                                <p className="font-semibold">{t('chat.greeting')}</p>
                                <p className="text-sm">{t('chat.greetingExample')}</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-accent text-white rounded-br-none' : 'bg-brand-primary text-brand-text rounded-bl-none'}`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                               <div className="max-w-[80%] p-3 rounded-2xl bg-brand-primary text-brand-text rounded-bl-none flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse delay-150"></div>
                                    <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse delay-300"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-brand-primary">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('chat.placeholder')}
                                className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-full pl-4 pr-12 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition"
                                disabled={isLoading}
                            />
                            <button onClick={handleSendMessage} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-accent text-white hover:bg-opacity-80 disabled:bg-brand-text-secondary/50 transition">
                               {isLoading ? <SpinnerIcon/> : <SendIcon/>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatAssistant;