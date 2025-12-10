
import React from 'react';
import { Radar, User as UserIcon, MapPin, Music, Martini, Gamepad2, Flame, Zap, Headphones, Ghost } from 'lucide-react';
import { User, Party, UserStatus } from '../types';

interface RadarViewProps {
  users: User[];
  parties: Party[];
  radius: number;
  setRadius: (r: number) => void;
  currentUserStatus: UserStatus;
  currentUserAvatar?: string;
  isGhostMode: boolean;
  isDarkMode?: boolean;
  onToggleStatus: () => void;
  onUserClick: (user: User) => void;
  onPartyClick: (party: Party) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ 
  users, 
  parties, 
  radius, 
  setRadius,
  currentUserStatus,
  currentUserAvatar,
  isGhostMode,
  isDarkMode = true,
  onToggleStatus,
  onUserClick,
  onPartyClick
}) => {
  
  const getPosition = (x: number, y: number) => {
    const scale = 5 / radius; 
    const cssX = 50 + (x * scale);
    const cssY = 50 + (y * scale);
    return { left: `${cssX}%`, top: `${cssY}%` };
  };

  const renderPartyIcon = (iconName: string, className: string) => {
    if (iconName.startsWith('http') || iconName.startsWith('data:')) {
      return (
        <div className={`${className} rounded-full border-2 border-neon-purple overflow-hidden bg-black p-0.5`}>
          <img src={iconName} alt="Pin" className="w-full h-full object-cover rounded-full" />
        </div>
      );
    }

    const props = { className };
    switch(iconName) {
        case 'music': return <Music {...props} />;
        case 'drink': return <Martini {...props} />;
        case 'game': return <Gamepad2 {...props} />;
        case 'fire': return <Flame {...props} />;
        case 'zap': return <Zap {...props} />;
        case 'headphones': return <Headphones {...props} />;
        default: return <MapPin {...props} />;
    }
  };

  const theme = {
      bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
      text: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      ring: isDarkMode ? 'border-neon-purple/20' : 'border-neon-purple/10',
      scanner: isDarkMode ? 'from-neon-purple/40' : 'from-neon-purple/20',
  }

  return (
    <div className={`flex flex-col h-full w-full relative overflow-hidden ${theme.bg} transition-colors duration-300`}>
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
              : 'border-white/30 text-gray-300 bg-black/40'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
             currentUserStatus === UserStatus.READY ? 'bg-neon-green animate-pulse' : 
             currentUserStatus === UserStatus.CHILLING ? 'bg-neon-blue' : 'bg-gray-400'
          }`} />
          <span>{currentUserStatus}</span>
        </button>
      </div>

      {/* Ghost Mode Indicator */}
      {isGhostMode && (
        <div className="absolute top-16 right-4 z-10 bg-black/60 border border-white/10 text-neon-purple px-3 py-1 rounded-full text-[10px] flex items-center backdrop-blur animate-pulse border-neon-purple/50">
          <Ghost size={12} className="mr-1" /> Ghost Mode Active
        </div>
      )}

      {/* The Radar Scanner */}
      <div className="flex-1 relative flex items-center justify-center mt-8">
        <div className={`absolute w-[80vw] h-[80vw] border ${theme.ring} rounded-full transition-colors`} />
        <div className={`absolute w-[50vw] h-[50vw] border ${theme.ring} rounded-full transition-colors`} />
        <div className={`absolute w-[20vw] h-[20vw] border ${theme.ring} rounded-full bg-neon-purple/5 transition-colors`} />
        
        <div className="absolute w-[80vw] h-[80vw] rounded-full overflow-hidden opacity-30 pointer-events-none">
           <div className={`w-full h-1/2 bg-gradient-to-t ${theme.scanner} to-transparent origin-bottom animate-spin-slow absolute top-0 left-0 transition-colors`} />
        </div>

        {/* Center (You) */}
        <div className={`absolute z-20 w-8 h-8 rounded-full shadow-[0_0_20px_white] ring-2 ring-white overflow-hidden transition-opacity ${isGhostMode ? 'opacity-50 grayscale ring-gray-500' : ''}`}>
           <img 
             src={currentUserAvatar || 'https://picsum.photos/50/50'} 
             className="w-full h-full object-cover" 
             alt="Me"
           />
        </div>

        {/* Render Users */}
        {users.map(u => {
          if (u.distance > radius) return null;
          // CRITICAL CHANGE: Do not render users if they are in Ghost Mode
          if (u.isGhost) return null;
          
          const pos = getPosition(u.location.x, u.location.y);
          return (
            <div 
              key={u.id}
              style={pos}
              onClick={() => onUserClick(u)}
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
           // Hype Logic: if score > 50, pulse hard
           const isHyped = (p.hypeScore || 0) > 50;
           
           return (
             <div 
               key={p.id}
               style={pos}
               onClick={() => onPartyClick(p)}
               className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
             >
               {/* Hype Ripple */}
               {isHyped && (
                  <div className="absolute inset-0 rounded-full bg-neon-purple opacity-50 animate-ping-slow scale-150" />
               )}

               {renderPartyIcon(p.icon, `text-neon-purple w-8 h-8 drop-shadow-[0_0_8px_#b026ff] animate-bounce ${isHyped ? 'text-white' : ''}`)}
               
               <span className="absolute top-full left-1/2 -translate-x-1/2 text-[10px] text-neon-purple font-bold bg-black/70 px-2 py-0.5 rounded mt-1 whitespace-nowrap">
                 {p.title}
                 {p.entryFee && p.entryFee > 0 && <span className="text-neon-green ml-1">$</span>}
               </span>
             </div>
           )
        })}
      </div>
      
      <div className={`p-4 text-center ${theme.text} text-xs pb-24 transition-colors`}>
        Scanning area... {users.filter(u => u.distance <= radius && !u.isGhost).length} active nearby
      </div>
    </div>
  );
};
