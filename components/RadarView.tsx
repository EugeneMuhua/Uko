import React, { useState } from 'react';
import { Radar, User as UserIcon, MapPin } from 'lucide-react';
import { User, Party, UserStatus } from '../types';

interface RadarViewProps {
  users: User[];
  parties: Party[];
  radius: number;
  setRadius: (r: number) => void;
  currentUserStatus: UserStatus;
  onToggleStatus: () => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ 
  users, 
  parties, 
  radius, 
  setRadius,
  currentUserStatus,
  onToggleStatus
}) => {
  
  // Helper to map relative coords (-100 to 100) to CSS percentages
  const getPosition = (x: number, y: number) => {
    // scale based on selected radius (simulation)
    const scale = 5 / radius; 
    const cssX = 50 + (x * scale);
    const cssY = 50 + (y * scale);
    return { left: `${cssX}%`, top: `${cssY}%` };
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-gray-900">
      {/* Top Controls */}
      <div className="absolute top-4 left-0 right-0 z-10 px-4 flex justify-between items-center">
        <div className="bg-black/60 backdrop-blur-md rounded-full p-1 flex space-x-1 border border-white/10">
          {[1, 5, 10].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                radius === r ? 'bg-neon-purple text-white shadow-[0_0_10px_#b026ff]' : 'text-gray-400 hover:text-white'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
        
        <button 
          onClick={onToggleStatus}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            currentUserStatus === UserStatus.READY 
              ? 'border-neon-green text-neon-green bg-neon-green/10 shadow-[0_0_10px_#39ff1440]'
              : currentUserStatus === UserStatus.CHILLING
              ? 'border-neon-blue text-neon-blue bg-neon-blue/10'
              : 'border-white/30 text-gray-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
             currentUserStatus === UserStatus.READY ? 'bg-neon-green animate-pulse' : 
             currentUserStatus === UserStatus.CHILLING ? 'bg-neon-blue' : 'bg-gray-400'
          }`} />
          <span>{currentUserStatus}</span>
        </button>
      </div>

      {/* The Radar Scanner */}
      <div className="flex-1 relative flex items-center justify-center mt-8">
        {/* Rings */}
        <div className="absolute w-[80vw] h-[80vw] border border-neon-purple/20 rounded-full" />
        <div className="absolute w-[50vw] h-[50vw] border border-neon-purple/20 rounded-full" />
        <div className="absolute w-[20vw] h-[20vw] border border-neon-purple/20 rounded-full bg-neon-purple/5" />
        
        {/* Scanning Line */}
        <div className="absolute w-[80vw] h-[80vw] rounded-full overflow-hidden opacity-30 pointer-events-none">
           <div className="w-full h-1/2 bg-gradient-to-t from-neon-purple/40 to-transparent origin-bottom animate-spin-slow absolute top-0 left-0" />
        </div>

        {/* Center (You) */}
        <div className="absolute z-20 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse" />

        {/* Render Users */}
        {users.map(u => {
          if (u.distance > radius) return null;
          const pos = getPosition(u.location.x, u.location.y);
          return (
            <div 
              key={u.id}
              style={pos}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-full border-2 overflow-hidden transition-transform group-hover:scale-125 ${
                u.status === UserStatus.READY ? 'border-neon-green shadow-[0_0_10px_#39ff14]' : 'border-gray-500'
              }`}>
                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] text-white bg-black/50 px-1 rounded mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {u.name}
              </span>
            </div>
          );
        })}

        {/* Render Parties */}
        {parties.map(p => {
           if (p.distance > radius) return null;
           const pos = getPosition(p.location.x, p.location.y);
           return (
             <div 
               key={p.id}
               style={pos}
               className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
             >
               <MapPin className="text-neon-purple w-8 h-8 drop-shadow-[0_0_8px_#b026ff] animate-bounce" />
               <span className="absolute top-full left-1/2 -translate-x-1/2 text-[10px] text-neon-purple font-bold bg-black/70 px-2 py-0.5 rounded mt-1 whitespace-nowrap">
                 {p.title}
               </span>
             </div>
           )
        })}
      </div>
      
      <div className="p-4 text-center text-gray-500 text-xs pb-24">
        Scanning area... {users.filter(u => u.distance <= radius).length} active nearby
      </div>
    </div>
  );
};