
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Shield, Zap, Share2, Car, Flame, ShieldCheck, ChevronLeft, Wine, ArrowDown } from 'lucide-react';
import { Message, Party, ChatMode } from '../types';
import { MusicPlayer } from './MusicPlayer';

interface ChatInterfaceProps {
  title: string;
  subtitle?: string;
  party?: Party; // Optional now, only for Party Mode
  messages: Message[];
  mode: ChatMode;
  isDarkMode?: boolean;
  onSendMessage: (text: string) => void;
  onRate: (hype: number, safety: number) => void;
  onInvite: () => void;
  onHype: () => void;
  onBack: () => void;
  onBookTable?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  title, subtitle, party, messages, mode, isDarkMode = true,
  onSendMessage, onRate, onInvite, onHype, onBack, onBookTable
}) => {
  const [inputText, setInputText] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [newMsgBanner, setNewMsgBanner] = useState<{sender: string, text: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  const theme = {
      bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
      header: isDarkMode ? 'bg-neon-card border-gray-800' : 'bg-white border-gray-200',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      bubbleMe: 'bg-neon-purple text-white',
      bubbleOther: isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800 shadow-sm border border-gray-100',
      inputArea: isDarkMode ? 'bg-neon-card border-gray-800' : 'bg-white border-gray-200',
      input: isDarkMode ? 'bg-black/40 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMsgBanner(null);
  };

  // Initial scroll on mount
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Monitor new messages
  useEffect(() => {
    const currentLength = messages.length;
    const prevLength = prevMessagesLength.current;

    if (currentLength > prevLength) {
        const lastMsg = messages[currentLength - 1];
        const isMe = lastMsg.senderId === 'me';

        // Check scroll position
        let isScrolledUp = false;
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            // Tolerance of 100px to detect if user is looking at history
            isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
        }

        if (isMe) {
            scrollToBottom();
        } else {
            // Incoming message
            if (isScrolledUp) {
                // Show subtle suggestion chip/banner
                setNewMsgBanner({ sender: lastMsg.senderName, text: lastMsg.text });
            } else {
                // User is at bottom, just scroll
                scrollToBottom();
            }
        }
    }
    prevMessagesLength.current = currentLength;
  }, [messages]);

  // Handle scroll to remove banner if user scrolls to bottom manually
  const handleScroll = () => {
      if (scrollContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
          if (isAtBottom && newMsgBanner) {
              setNewMsgBanner(null);
          }
      }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleGetRide = () => {
     if (!party) return;
     // Center Nairobi Coordinates (Mock origin)
     const centerLat = -1.2921;
     const centerLng = 36.8219;
     
     // Convert relative x/y (assumed km) to approximate Lat/Lng offsets
     const destLat = centerLat + (party.location.y / 111);
     const destLng = centerLng + (party.location.x / 111);

     const url = `uber://?action=setPickup&dropoff[latitude]=${destLat.toFixed(6)}&dropoff[longitude]=${destLng.toFixed(6)}&dropoff[nickname]=${encodeURIComponent(party.title)}`;
     window.open(url, '_blank');
  };

  useEffect(() => {
    // Only show vibe check in party mode
    if (mode === 'party') {
        const timer = setTimeout(() => setShowRating(true), 60000); // 1 minute demo delay
        return () => clearTimeout(timer);
    }
  }, [mode]);

  if (showRating && mode === 'party') {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-6 ${theme.header} animate-fadeIn`}>
        <h2 className={`text-2xl font-bold ${theme.text} mb-2`}>Vibe Check! 🔥</h2>
        <p className="text-gray-400 mb-8 text-center">How was {title}?</p>
        
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
    <div className={`flex flex-col h-full ${theme.bg} relative transition-colors duration-300`}>
      {/* Header */}
      <div className={`p-4 ${theme.header} border-b shadow-lg z-20 relative transition-colors`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3 p-1 hover:bg-white/10 rounded-full">
                <ChevronLeft size={24} className={isDarkMode ? "text-gray-300" : "text-gray-600"} />
            </button>
            <div>
              <h2 className={`font-bold ${theme.text} text-lg flex items-center`}>
                {title} 
                {mode === 'party' && party && (party.hostTrustScore || 0) > 80 && <ShieldCheck size={16} className="text-neon-blue ml-2" />}
              </h2>
              <div className="flex items-center text-xs text-neon-green">
                {subtitle || (
                    <>
                        <span className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse" />
                        Live
                    </>
                )}
              </div>
            </div>
          </div>
          
          {mode === 'party' && (
            <div className="flex space-x-1 items-center">
                {onBookTable && (
                  <button 
                      onClick={onBookTable}
                      className="bg-gradient-to-r from-neon-purple to-neon-blue text-white p-2 rounded-full shadow-[0_0_10px_rgba(176,38,255,0.4)] hover:shadow-[0_0_15px_rgba(176,38,255,0.6)] active:scale-95 transition-all mr-2"
                      title="Book Table"
                  >
                      <Wine size={18} strokeWidth={2.5} />
                  </button>
                )}
                <button 
                    onClick={handleGetRide}
                    className="bg-gray-800 p-2 rounded-full hover:bg-white hover:text-black transition-colors"
                    title="Get Me There (Uber)"
                >
                    <Car size={18} className="text-white hover:text-black" />
                </button>
                <button 
                    onClick={onInvite}
                    className="bg-gray-800 p-2 rounded-full hover:bg-neon-blue hover:text-white transition-colors"
                    title="Invite Squad"
                >
                    <Share2 size={18} className="text-gray-300" />
                </button>
            </div>
          )}
        </div>
        
        {/* Hype Button - Only in Party Mode */}
        {mode === 'party' && (
            <button 
                onClick={onHype}
                className="w-full mt-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center space-x-1 active:scale-95 transition-transform"
            >
                <Flame size={14} fill="currentColor" />
                <span>BOOST VIBE ({party?.hypeScore || 0})</span>
            </button>
        )}
      </div>

      {/* Music Player - Only in Party Mode */}
      {mode === 'party' && party?.musicTrack && (
         <div className="mt-2 relative z-10">
             <MusicPlayer track={party.musicTrack} />
         </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 relative"
      >
        {/* New Message Notification Banner / Suggestion Chip */}
        {newMsgBanner && (
          <div className="sticky top-0 z-30 flex justify-center w-full pointer-events-none -mt-2 mb-4 animate-[slideDown_0.3s_ease-out]">
            <button 
              onClick={() => { scrollToBottom(); }}
              className={`pointer-events-auto backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 border transition-all active:scale-95 ${
                  isDarkMode 
                  ? 'bg-gray-800/90 border-neon-blue/50 text-white hover:bg-gray-700' 
                  : 'bg-white/90 border-neon-blue/50 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-bold">New message from {newMsgBanner.sender}</span>
              <ArrowDown size={14} className="text-neon-blue animate-bounce" />
            </button>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                isMe 
                  ? `${theme.bubbleMe} rounded-tr-none` 
                  : `${theme.bubbleOther} rounded-tl-none`
              }`}>
                {!isMe && mode === 'party' && <div className="text-[10px] text-gray-400 mb-1 font-bold">{msg.senderName}</div>}
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-3 ${theme.inputArea} border-t flex items-center space-x-2 mb-[80px] z-20 transition-colors`}>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Send a message..."
          className={`flex-1 ${theme.input} border rounded-full px-4 py-3 focus:outline-none focus:border-neon-purple transition-colors`}
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
