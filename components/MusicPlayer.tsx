
import React, { useState } from 'react';
import { Play, Pause, SkipForward, Music as MusicIcon } from 'lucide-react';
import { MusicTrack } from '../types';

interface MusicPlayerProps {
  track?: MusicTrack;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!track) return null;

  return (
    <div className="bg-black/60 backdrop-blur border border-white/10 rounded-xl p-3 flex items-center space-x-3 mb-4 mx-4 shadow-lg">
       <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0 relative">
          <img src={track.coverUrl} alt="Album Art" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </div>
       </div>
       
       <div className="flex-1 min-w-0">
          <p className="text-xs text-green-400 font-bold uppercase tracking-wide">Now Playing</p>
          <h4 className="text-white text-sm font-bold truncate">{track.title}</h4>
          <p className="text-gray-400 text-xs truncate">{track.artist}</p>
       </div>

       <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
             {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
          </button>
       </div>
    </div>
  );
};
