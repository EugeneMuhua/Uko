import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Shield, Zap, Share2 } from 'lucide-react';
import { Message, Party } from '../types';

interface ChatInterfaceProps {
  party: Party;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onRate: (hype: number, safety: number) => void;
  onInvite: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ party, messages, onSendMessage, onRate, onInvite }) => {
  const [inputText, setInputText] = useState('');
  const [showRating, setShowRating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  // Check if party is "over" to show rating (Simulated)
  useEffect(() => {
    // Auto trigger rating modal for demo purposes after 10 seconds in chat
    const timer = setTimeout(() => setShowRating(true), 30000); 
    return () => clearTimeout(timer);
  }, []);

  if (showRating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-neon-card animate-fadeIn">
        <h2 className="text-2xl font-bold text-white mb-2">Vibe Check! 🔥</h2>
        <p className="text-gray-400 mb-8 text-center">How was {party.title}?</p>
        
        <div className="space-y-6 w-full max-w-xs">
          <div>
            <label className="flex items-center space-x-2 text-neon-purple mb-2">
              <Zap size={18} /> <span className="font-bold">Hype Level</span>
            </label>
            <div className="flex justify-between bg-black/30 p-2 rounded-lg">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={`hype-${n}`} onClick={() => onRate(n, 5)} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-neon-purple hover:text-white transition-colors">
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-neon-blue mb-2">
              <Shield size={18} /> <span className="font-bold">Safety</span>
            </label>
            <div className="flex justify-between bg-black/30 p-2 rounded-lg">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={`safe-${n}`} onClick={() => { onRate(5, n); setShowRating(false); }} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-neon-blue hover:text-white transition-colors">
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => setShowRating(false)} className="mt-8 text-gray-500 underline text-sm">Skip</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 bg-neon-card border-b border-gray-800 flex justify-between items-center shadow-lg z-10">
        <div>
          <h2 className="font-bold text-white text-lg">{party.title}</h2>
          <div className="flex items-center text-xs text-neon-green">
            <span className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse" />
            Live Squad ({party.attendees} online)
          </div>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={onInvite}
                className="bg-gray-800 p-2 rounded-full hover:bg-neon-blue hover:text-white transition-colors"
            >
                <Share2 size={20} className="text-gray-300" />
            </button>
            <div className="bg-gray-800 p-2 rounded-full">
                <Users size={20} className="text-gray-300" />
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                isMe 
                  ? 'bg-neon-purple text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-none'
              }`}>
                {!isMe && <div className="text-[10px] text-gray-400 mb-1 font-bold">{msg.senderName}</div>}
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-neon-card border-t border-gray-800 flex items-center space-x-2 mb-[80px]">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Send a message..."
          className="flex-1 bg-black/40 border border-gray-700 text-white rounded-full px-4 py-3 focus:outline-none focus:border-neon-purple transition-colors"
        />
        <button 
          onClick={handleSend}
          className="bg-neon-purple p-3 rounded-full text-white hover:bg-purple-600 transition-colors shadow-[0_0_10px_#b026ff40]"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};