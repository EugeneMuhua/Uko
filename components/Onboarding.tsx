import React, { useState, useRef } from 'react';
import { ArrowRight, Camera, Upload } from 'lucide-react';

const AVATARS = [
  'https://picsum.photos/200/200?random=100',
  'https://picsum.photos/200/200?random=101',
  'https://picsum.photos/200/200?random=102',
  'https://picsum.photos/200/200?random=103',
  'https://picsum.photos/200/200?random=104',
  'https://picsum.photos/200/200?random=105',
  'https://picsum.photos/200/200?random=106',
  'https://picsum.photos/200/200?random=107',
];

interface OnboardingProps {
  onComplete: (name: string, avatar: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name, selectedAvatar);
    }
  };

  const isCustomAvatar = !AVATARS.includes(selectedAvatar);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-neon-purple/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[60%] bg-neon-blue/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="z-10 w-full max-w-md space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">UKO?</h1>
                <p className="text-gray-400 text-lg">Are you in? Set up your profile.</p>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-300 text-center uppercase tracking-wider">Choose your Avatar</label>
                
                {/* 3x3 Grid: 1 Upload Button + 8 Presets */}
                <div className="grid grid-cols-3 gap-4 p-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    
                    {/* Upload / Custom Slot */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all duration-300 flex items-center justify-center group ${
                            isCustomAvatar 
                            ? 'border-neon-green shadow-[0_0_20px_#39ff14] scale-110 z-10' 
                            : 'border-dashed border-gray-600 hover:border-neon-blue bg-gray-800/50'
                        }`}
                    >
                        {isCustomAvatar ? (
                             <>
                                <img src={selectedAvatar} className="w-full h-full object-cover" alt="Custom" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={20} className="text-white" />
                                </div>
                             </>
                        ) : (
                             <div className="flex flex-col items-center">
                                <Upload size={24} className="text-gray-400 group-hover:text-neon-blue mb-1" />
                                <span className="text-[10px] text-gray-500 group-hover:text-neon-blue uppercase font-bold">Upload</span>
                            </div>
                        )}
                    </button>

                    {/* Predefined Avatars */}
                    {AVATARS.map((src, idx) => (
                        <button 
                            key={idx}
                            type="button"
                            onClick={() => setSelectedAvatar(src)}
                            className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all duration-300 ${
                                selectedAvatar === src 
                                ? 'border-neon-green shadow-[0_0_20px_#39ff14] scale-110 z-10' 
                                : 'border-gray-700 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                            }`}
                        >
                            <img src={src} className="w-full h-full object-cover" alt={`Avatar ${idx}`} />
                            {selectedAvatar === src && (
                                <div className="absolute inset-0 bg-neon-green/10" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Your Handle</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. NightOwl99"
                        className="w-full bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-lg text-white placeholder-gray-500 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple focus:outline-none transition-all"
                        autoFocus
                    />
                </div>

                <button 
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full group bg-gradient-to-r from-neon-purple to-neon-blue py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_#b026ff40] hover:shadow-[0_0_30px_#b026ff60] disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                    <span>Enter The Radar</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </form>
        </div>
    </div>
  );
};