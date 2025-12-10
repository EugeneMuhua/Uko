
import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';

interface InviteModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ url, title, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${title} \n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join the Squad',
          text: title,
          url: url,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div 
        className="bg-neon-card border border-white/10 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(176,38,255,0.2)] transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-900/50">
          <h3 className="text-white font-bold flex items-center">
            <Share2 size={18} className="mr-2 text-neon-blue" /> Invite Squad
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
             <p className="text-gray-300 text-sm mb-2">Share this link to add friends to your radar or party.</p>
          </div>

          {/* Link Box */}
          <div className="relative group">
            <input 
              type="text" 
              readOnly 
              value={url} 
              className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 pl-3 pr-12 text-sm text-gray-300 focus:outline-none focus:border-neon-purple transition-colors font-mono"
            />
            <button 
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-white/10 transition-colors"
            >
              {copied ? <Check size={18} className="text-neon-green" /> : <Copy size={18} className="text-gray-400 group-hover:text-white" />}
            </button>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={handleWhatsApp}
                className="flex items-center justify-center py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-colors"
             >
                <MessageCircle size={18} className="mr-2" /> WhatsApp
             </button>
             <button 
                onClick={handleNativeShare}
                className="flex items-center justify-center py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold border border-gray-700 transition-colors"
             >
                <Share2 size={18} className="mr-2" /> More
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
