
import React, { useState, useEffect, useRef } from 'react';
import { Radar, Compass, PlusCircle, MessageCircle, User as UserIcon, MapPin, Loader2, Sparkles, Navigation, Music, Martini, Gamepad2, Flame, Zap, Headphones, Crosshair, Upload, X, Ghost, Award, ArrowRight, Wine, Sun, Moon } from 'lucide-react';
import { RadarView } from './components/RadarView';
import { ChatInterface } from './components/ChatInterface';
import { NotificationSystem } from './components/NotificationSystem';
import { Onboarding } from './components/Onboarding';
import { SOSButton } from './components/SOSButton';
import { PaymentModal } from './components/PaymentModal';
import { InviteModal } from './components/InviteModal';
import { TableBookingModal } from './components/TableBookingModal';
import { generatePartyHype } from './services/geminiService';
import { 
  MOCK_USERS, MOCK_PARTIES, CURRENT_USER_ID 
} from './constants';
import { User, Party, Message, Tab, UserStatus, VibeType, AppNotification, NotificationType, ChatMode } from './types';

const USER_STORAGE_KEY = 'uko_user_profile';
const THEME_STORAGE_KEY = 'uko_theme_pref';

interface UserProfile {
  name: string;
  avatar: string;
}

const PIN_ICONS = [
  { id: 'pin', label: 'Default', Icon: MapPin },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'drink', label: 'Drinks', Icon: Martini },
  { id: 'game', label: 'Games', Icon: Gamepad2 },
  { id: 'fire', label: 'Lit', Icon: Flame },
  { id: 'zap', label: 'Hype', Icon: Zap },
  { id: 'headphones', label: 'Silent', Icon: Headphones },
];

const App: React.FC = () => {
  // --- Auth/User State ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // --- Global State ---
  const [activeTab, setActiveTab] = useState<Tab>('radar');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [parties, setParties] = useState<Party[]>(MOCK_PARTIES);
  const [myStatus, setMyStatus] = useState<UserStatus>(UserStatus.READY);
  const [radarRadius, setRadarRadius] = useState(5); // km
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? saved === 'dark' : true;
  });

  // --- New Feature State ---
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [showPaymentFor, setShowPaymentFor] = useState<Party | null>(null);
  const [showTableBookingFor, setShowTableBookingFor] = useState<Party | null>(null);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // For User Modal

  // --- Invite Handling State ---
  const [pendingPartyId, setPendingPartyId] = useState<string | null>(null);
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLinkData, setInviteLinkData] = useState({ url: '', title: '' });

  // --- Active Chat State ---
  const [activePartyId, setActivePartyId] = useState<string | null>(null); // Party I am technically "in"
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null); // Current open chat (Party ID or User ID)
  const [activeChatMode, setActiveChatMode] = useState<ChatMode>('party');
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', conversationId: 'p1', senderId: 'u3', senderName: 'Zuri', text: 'Where is everyone?', timestamp: new Date() },
    { id: 'm2', conversationId: 'p1', senderId: 'u1', senderName: 'Juma', text: 'Just parked!', timestamp: new Date() },
    { id: 'm3', conversationId: 'u2', senderId: 'u2', senderName: 'Amani', text: 'Hey! Are you going to the party?', timestamp: new Date(Date.now() - 3600000) }
  ]);

  // --- Create Party State ---
  const [newPartyTitle, setNewPartyTitle] = useState('');
  const [newPartyVibe, setNewPartyVibe] = useState<string>(VibeType.CHILL);
  const [isCustomVibe, setIsCustomVibe] = useState(false);
  const [newPartyDesc, setNewPartyDesc] = useState('');
  const [newPartyIcon, setNewPartyIcon] = useState('pin');
  const [newPartyEntryFee, setNewPartyEntryFee] = useState<number>(0);
  const [newPartyLocation, setNewPartyLocation] = useState({ x: 0, y: 0 }); 
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Helper Classes based on Theme ---
  const theme = {
    bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    card: isDarkMode ? 'bg-neon-card border-gray-800' : 'bg-white border-gray-200 shadow-sm',
    cardHover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50',
    input: isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900',
    nav: isDarkMode ? 'bg-black/90 border-white/10' : 'bg-white/90 border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]',
    tabInactive: isDarkMode ? 'text-gray-500' : 'text-gray-400',
  };

  // --- Initialization Effects ---
  
  useEffect(() => {
    // Theme Body Effect
    document.body.style.backgroundColor = isDarkMode ? '#0f0f13' : '#f9fafb';
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      setUserProfile(JSON.parse(savedUser));
    }

    const params = new URLSearchParams(window.location.search);
    const partyIdParam = params.get('partyId');
    const invitedByParam = params.get('invitedBy');

    if (partyIdParam) setPendingPartyId(partyIdParam);
    if (invitedByParam) setInvitingUserId(invitedByParam);

    if (partyIdParam || invitedByParam) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (userProfile && (pendingPartyId || invitingUserId)) {
        handleProcessInvite();
    }
  }, [userProfile, pendingPartyId, invitingUserId]);

  const handleProcessInvite = () => {
    if (pendingPartyId) {
        let targetParty = parties.find(p => p.id === pendingPartyId);
        
        if (!targetParty) {
            targetParty = {
                id: pendingPartyId,
                hostId: invitingUserId || 'unknown',
                title: 'Invited Party',
                description: 'You were invited to this event via link.',
                vibe: VibeType.RAGER,
                startTime: 'Now',
                capacity: 50,
                attendees: 1, 
                location: { x: 5, y: 5 },
                distance: 0.1,
                coverImage: 'https://picsum.photos/400/200?random=invite',
                icon: 'zap',
                hypeScore: 0
            };
            setParties(prev => [targetParty!, ...prev]);
        }

        // Check if invited party is paid
        handleJoinParty(targetParty);
        setPendingPartyId(null);
    } else if (invitingUserId) {
        addNotification('Friend Connected', `You joined via an invite from ${invitingUserId === 'me' ? 'a friend' : invitingUserId}.`, 'info');
        setInvitingUserId(null); 
    }
  };

  const handleOnboardingComplete = (name: string, avatar: string) => {
    const profile = { name, avatar };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    setUserProfile(profile);
    if (!pendingPartyId && !invitingUserId) {
        addNotification('Welcome to Uko?', `You're on the radar, ${name}! 📡`, 'success');
    }
  };

  const addNotification = (title: string, message: string, type: NotificationType) => {
    const newNotif: AppNotification = {
      id: `n${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Simulations ---
  useEffect(() => {
    if (!userProfile) return;

    // Simulate Kofi changing status
    const statusTimer = setTimeout(() => {
      addNotification('Squad Update', 'Kofi is now Ready to Party! 🟢', 'info');
      setUsers(prev => prev.map(u => u.name === 'Kofi' ? {...u, status: UserStatus.READY} : u));
    }, 15000);

    // Simulate new party drop
    const partyTimer = setTimeout(() => {
      addNotification('New Drop Detected 📍', "Secret Beach Bonfire (1.5km)", 'party');
      const newSimParty: Party = {
        id: 'p-sim-1',
        hostId: 'u99',
        title: 'Secret Beach Bonfire',
        description: 'Spontaneous setup. Bring marshmallows.',
        vibe: VibeType.CHILL,
        startTime: 'Now',
        capacity: 20,
        attendees: 5,
        location: { x: 35, y: -40 },
        distance: 1.5,
        coverImage: 'https://picsum.photos/400/200?random=99',
        icon: 'fire',
        hypeScore: 60 // Already hyped
      };
      setParties(prev => [...prev, newSimParty]);
    }, 25000);

    // Simulate a user (Amani) toggling Ghost Mode
    const ghostTimer = setInterval(() => {
        setUsers(prev => prev.map(u => {
            if (u.id === 'u2') { // Amani
                return { ...u, isGhost: !u.isGhost };
            }
            return u;
        }));
    }, 8000);

    return () => { clearTimeout(statusTimer); clearTimeout(partyTimer); clearInterval(ghostTimer); };
  }, [userProfile]);

  // --- Safe Check Logic (Module 1) ---
  useEffect(() => {
    // If user leaves chat (ends party or minimizes), trigger a check later
    // Logic: If user is "in a party" (activePartyId) but not on the 'chat' screen
    if (activeTab !== 'chat' && activePartyId) {
       const timer = setTimeout(() => {
          addNotification('Safe Check 🏠', 'Did you get home safe?', 'alert');
       }, 30000); // 30s timer
       
       return () => clearTimeout(timer);
    }
  }, [activeTab, activePartyId]);

  // --- Actions ---

  const handleToggleStatus = () => {
    const statuses = [UserStatus.READY, UserStatus.CHILLING, UserStatus.HOSTING, UserStatus.OFFLINE];
    const nextIndex = (statuses.indexOf(myStatus) + 1) % statuses.length;
    setMyStatus(statuses[nextIndex]);
  };

  const handleGenerateAI = async () => {
    if (!newPartyTitle) return;
    setIsGeneratingAI(true);
    const hype = await generatePartyHype(newPartyTitle, newPartyVibe);
    setNewPartyDesc(hype);
    setIsGeneratingAI(false);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPartyIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const relX = ((x / width) * 200) - 100;
    const relY = ((y / height) * 200) - 100;
    setNewPartyLocation({ x: relX, y: relY });
  };

  const handleCreateParty = () => {
    if (!userProfile) return;
    
    const newParty: Party = {
      id: `p${Date.now()}`,
      hostId: CURRENT_USER_ID,
      title: newPartyTitle,
      description: newPartyDesc || 'Come through!',
      vibe: newPartyVibe,
      startTime: 'Now',
      capacity: 50,
      attendees: 1,
      location: newPartyLocation, 
      distance: 0.1, 
      coverImage: `https://picsum.photos/400/200?random=${Date.now()}`,
      icon: newPartyIcon,
      entryFee: newPartyEntryFee,
      hypeScore: 0
    };
    setParties([newParty, ...parties]);
    setActivePartyId(newParty.id);
    setActiveConversationId(newParty.id);
    setActiveChatMode('party');
    setActiveTab('chat');
    
    addNotification('Party Live! 📡', 'Your beacon has been broadcast to nearby users.', 'success');

    setNewPartyTitle('');
    setNewPartyDesc('');
    setNewPartyIcon('pin');
    setNewPartyLocation({ x: 0, y: 0 });
    setNewPartyVibe(VibeType.CHILL);
    setNewPartyEntryFee(0);
    setIsCustomVibe(false);
  };

  const handleJoinParty = (party: Party) => {
    // Logic for Payment Gate
    if (party.entryFee && party.entryFee > 0) {
        setShowPaymentFor(party);
    } else {
        enterParty(party.id);
    }
  };

  const enterParty = (partyId: string) => {
    setActivePartyId(partyId);
    setActiveConversationId(partyId);
    setActiveChatMode('party');
    setActiveTab('chat');
  };

  const handlePaymentSuccess = () => {
    if (showPaymentFor) {
        enterParty(showPaymentFor.id);
        setShowPaymentFor(null);
        addNotification('Ticket Purchased', `You have joined ${showPaymentFor.title}!`, 'success');
    }
  };

  const handleBookTable = () => {
    if (activePartyId) {
      const party = parties.find(p => p.id === activePartyId);
      if (party) setShowTableBookingFor(party);
    }
  };

  const handleBookTableConfirm = (details: any) => {
    setShowTableBookingFor(null);
    addNotification('Reservation Confirmed', `Table and drinks booked! Cost shared with ${details.splitCount} people.`, 'success');
  };

  const handleSendMessage = (text: string) => {
    if (!userProfile || !activeConversationId) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      conversationId: activeConversationId,
      senderId: CURRENT_USER_ID,
      senderName: userProfile.name,
      text,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
  };

  const handleBoostHype = () => {
    if (activePartyId) {
        setParties(prev => prev.map(p => {
            if (p.id === activePartyId) {
                const newScore = (p.hypeScore || 0) + 10;
                if (newScore > 50 && (p.hypeScore || 0) <= 50) {
                     addNotification('VIBE CHECK 🔥', `${p.title} is now trending on Radar!`, 'party');
                }
                return { ...p, hypeScore: newScore };
            }
            return p;
        }));
    }
  };

  const handleInviteFriends = () => {
    if (!userProfile) return;
    const baseUrl = window.location.origin + window.location.pathname;
    let shareUrl = baseUrl;
    let shareTitle = 'Join me on Uko?';
    
    if (activePartyId && activeChatMode === 'party') {
        shareUrl += `?partyId=${activePartyId}&invitedBy=${encodeURIComponent(userProfile.name)}`;
        const party = parties.find(p => p.id === activePartyId);
        shareTitle = `Join ${party?.title || 'the party'} on Uko?`;
    } else {
        shareUrl += `?invitedBy=${encodeURIComponent(userProfile.name)}`;
        shareTitle = `Add me on Uko? - The Nightlife Radar`;
    }

    setInviteLinkData({ url: shareUrl, title: shareTitle });
    setShowInviteModal(true);
  };

  const handleRate = (hype: number, safety: number) => {
    addNotification('Vibe Check Complete', `You rated: ${hype}🔥 ${safety}🛡️`, 'success');
    setActiveTab('radar');
  };

  const handleSOSTrigger = () => {
      setSosTriggered(true);
      addNotification('SOS ALERT SENT', 'Notifying trusted contacts and authorities...', 'alert');
      // In a real app, this sends loc data to backend
      setTimeout(() => setSosTriggered(false), 5000); // Reset for demo
  };

  const handleUserClick = (user: User) => {
      setSelectedUser(user);
  };

  const handleStartDM = () => {
      if (selectedUser) {
          setActiveConversationId(selectedUser.id);
          setActiveChatMode('dm');
          setActiveTab('chat');
          setSelectedUser(null);
      }
  };

  const handleInboxSelect = (id: string, mode: ChatMode) => {
      setActiveConversationId(id);
      setActiveChatMode(mode);
  };

  // --- Render Views ---

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderRadar = () => (
    <RadarView 
      users={users} 
      parties={parties} 
      radius={radarRadius} 
      setRadius={setRadarRadius}
      currentUserStatus={myStatus}
      currentUserAvatar={userProfile.avatar}
      isGhostMode={isGhostMode}
      isDarkMode={isDarkMode}
      onToggleStatus={handleToggleStatus}
      onUserClick={handleUserClick}
      onPartyClick={handleJoinParty}
    />
  );

  const renderDiscover = () => (
    <div className={`p-4 pb-24 space-y-4 ${theme.bg} min-h-screen transition-colors duration-300`}>
      <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Nearby Parties</h2>
      {parties.sort((a,b) => a.distance - b.distance).map(party => (
        <div key={party.id} className={`${theme.card} rounded-xl overflow-hidden border relative transition-colors`}>
          <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${party.coverImage})` }}>
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white font-bold">
              {party.distance}km away
            </div>
            {party.entryFee && party.entryFee > 0 && (
                 <div className="absolute top-2 left-2 bg-green-600 px-2 py-1 rounded text-xs text-white font-bold shadow-lg flex items-center">
                    <span className="mr-1 text-[10px]">KES</span> {party.entryFee}
                 </div>
            )}
            <div className="absolute bottom-2 left-2">
              <span className={`px-2 py-1 rounded text-xs font-bold text-black ${
                 Object.values(VibeType).includes(party.vibe as VibeType) 
                    ? party.vibe === VibeType.RAGER ? 'bg-neon-green' : 'bg-neon-blue'
                    : 'bg-neon-purple text-white'
              }`}>{party.vibe}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className={`text-lg font-bold ${theme.text} flex justify-between`}>
                {party.title}
                {(party.hypeScore || 0) > 50 && <span className="text-xs text-orange-500 flex items-center"><Flame size={12}/> Trending</span>}
            </h3>
            <p className={`${theme.textMuted} text-sm mt-1`}>{party.description}</p>
            <div className="flex justify-between items-center mt-4">
              <div className={`text-xs ${theme.textMuted}`}>
                {party.attendees}/{party.capacity} joined
              </div>
              <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowTableBookingFor(party)}
                    className="px-3 py-2 rounded-lg text-sm font-bold transition-colors bg-gray-800 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple hover:text-white"
                  >
                    <Wine size={16} />
                  </button>
                  <button 
                    onClick={() => handleJoinParty(party)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-[0_0_10px_#b026ff40] ${
                      party.entryFee && party.entryFee > 0 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/50' 
                      : 'bg-neon-purple text-white hover:bg-purple-600'
                    }`}
                  >
                    {party.entryFee && party.entryFee > 0 ? 'Buy Ticket' : 'Join Squad'}
                  </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCreate = () => (
    <div className={`p-6 ${theme.bg} min-h-screen flex flex-col pb-24 transition-colors duration-300`}>
      <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>Drop a Pin</h2>
      
      <div className="space-y-6">
        <div>
          <label className={`block ${theme.textMuted} text-sm mb-2`}>Event Title</label>
          <input 
            className={`w-full ${theme.input} rounded-lg p-3 focus:border-neon-purple focus:outline-none`}
            placeholder="e.g. Saturday Night Rager"
            value={newPartyTitle}
            onChange={(e) => setNewPartyTitle(e.target.value)}
          />
        </div>

        <div>
            <label className={`block ${theme.textMuted} text-sm mb-2`}>Entry Fee (KES)</label>
            <input 
                type="number"
                className={`w-full ${theme.input} rounded-lg p-3 focus:border-green-500 focus:outline-none`}
                placeholder="0 for Free"
                value={newPartyEntryFee || ''}
                onChange={(e) => setNewPartyEntryFee(Number(e.target.value))}
            />
        </div>

        <div>
          <label className={`block ${theme.textMuted} text-sm mb-2`}>The Vibe</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {!isCustomVibe && Object.values(VibeType).map((vibe) => (
              <button
                key={vibe}
                onClick={() => setNewPartyVibe(vibe)}
                className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                  newPartyVibe === vibe 
                    ? 'border-neon-purple bg-neon-purple/20 text-white' 
                    : `${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-500'}`
                }`}
              >
                {vibe}
              </button>
            ))}
             <button
                onClick={() => { setIsCustomVibe(!isCustomVibe); if(!isCustomVibe) setNewPartyVibe(''); }}
                className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                  isCustomVibe 
                    ? 'border-neon-purple bg-neon-purple/20 text-white col-span-3' 
                    : `${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-500'} border-dashed hover:border-neon-blue hover:text-neon-blue`
                }`}
              >
                {isCustomVibe ? 'Cancel' : '+ Custom'}
              </button>
          </div>
          {isCustomVibe && (
              <input 
                className={`w-full ${theme.input} border-neon-purple rounded-lg p-3 focus:outline-none animate-fadeIn`}
                placeholder="e.g. 80s Disco..."
                value={newPartyVibe}
                onChange={(e) => setNewPartyVibe(e.target.value)}
                autoFocus
              />
          )}
        </div>

        <div>
            <div className="flex justify-between items-end mb-2">
                <label className={`block ${theme.textMuted} text-sm`}>Pin Icon</label>
                <input type="file" ref={fileInputRef} onChange={handleIconUpload} accept="image/*" className="hidden" />
            </div>
            
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center flex-shrink-0 p-2 w-14 h-14 rounded-lg border border-dashed ${isDarkMode ? 'border-gray-600 text-gray-500' : 'border-gray-400 text-gray-500'} hover:border-neon-blue hover:text-neon-blue transition-colors`}
                >
                    <Upload size={20} />
                    <span className="text-[9px] mt-1">Upload</span>
                </button>

                {PIN_ICONS.map((iconItem) => {
                const IconComp = iconItem.Icon;
                const isSelected = newPartyIcon === iconItem.id;
                return (
                    <button
                    key={iconItem.id}
                    onClick={() => setNewPartyIcon(iconItem.id)}
                    className={`flex flex-col items-center flex-shrink-0 p-2 rounded-lg border transition-all w-14 ${
                        isSelected 
                          ? 'border-neon-blue bg-neon-blue/20 text-white shadow-[0_0_10px_#04d9ff40]' 
                          : `${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-500'}`
                    }`}
                    >
                    <IconComp size={24} className="mb-1" />
                    <span className="text-[10px]">{iconItem.label}</span>
                    </button>
                );
                })}
            </div>
        </div>

        <div>
            <label className={`block ${theme.textMuted} text-sm mb-2`}>Set Exact Location (Tap)</label>
            <div 
                className={`w-full aspect-square ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} relative overflow-hidden cursor-crosshair group shadow-inner`}
                onClick={handleLocationSelect}
            >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-full h-[1px] bg-neon-purple"></div>
                    <div className="h-full w-[1px] bg-neon-purple absolute"></div>
                    <div className="w-[50%] h-[50%] rounded-full border border-neon-purple"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_white] z-10 pointer-events-none" />
                <span className="absolute top-1/2 left-1/2 mt-2 -ml-3 text-[10px] text-gray-400">You</span>
                <div 
                    className="absolute w-8 h-8 text-neon-green -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none drop-shadow-[0_0_8px_#39ff14]"
                    style={{ left: `${50 + (newPartyLocation.x / 2)}%`, top: `${50 + (newPartyLocation.y / 2)}%` }}
                >
                    <MapPin size={32} fill="currentColor" className="opacity-90" />
                </div>
            </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
             <label className={`${theme.textMuted} text-sm`}>Description</label>
             <button 
               onClick={handleGenerateAI}
               disabled={isGeneratingAI || !newPartyTitle}
               className="text-xs text-neon-blue flex items-center hover:text-neon-purple disabled:opacity-50"
             >
               <Sparkles size={12} className="mr-1" /> AI Hype Me
             </button>
          </div>
          <div className="relative">
            <textarea 
              className={`w-full ${theme.input} rounded-lg p-3 focus:border-neon-purple focus:outline-none h-24`}
              placeholder="What's the plan?"
              value={newPartyDesc}
              onChange={(e) => setNewPartyDesc(e.target.value)}
            />
            {isGeneratingAI && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="animate-spin text-neon-purple" />
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleCreateParty}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold py-4 rounded-xl shadow-[0_0_15px_#b026ff60] active:scale-95 transition-transform"
        >
          Broadcast Party 📡
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className={`p-6 ${theme.bg} min-h-screen flex flex-col items-center pt-12 ${theme.text} transition-colors duration-300`}>
      <div className="w-24 h-24 rounded-full border-4 border-neon-purple p-1 mb-4 shadow-[0_0_20px_#b026ff]">
        <img src={userProfile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
      </div>
      <h2 className="text-2xl font-bold">{userProfile.name}</h2>
      <p className="text-neon-green text-sm mb-4">{myStatus}</p>

      {/* Badges */}
      <div className="flex space-x-2 mb-8">
         {['Night Owl', 'Verified', 'Safe Host'].map(b => (
            <span key={b} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'} text-xs px-2 py-1 rounded-full border flex items-center ${theme.textMuted}`}>
                <Award size={10} className="mr-1 text-yellow-500" /> {b}
            </span>
         ))}
      </div>

      <div className="w-full space-y-4">
        {/* Toggle Theme */}
        <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-colors ${
                isDarkMode 
                ? 'bg-neon-card border-gray-700 hover:bg-gray-800' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
        >
            <span className="flex items-center">
                {isDarkMode ? <Moon size={18} className="mr-3" /> : <Sun size={18} className="mr-3 text-orange-500" />} 
                Appearance
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded opacity-70`}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
        </button>

        <button 
            onClick={() => setIsGhostMode(!isGhostMode)}
            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-colors ${
                isGhostMode 
                ? 'bg-neon-purple/20 border-neon-purple' 
                : `${isDarkMode ? 'bg-neon-card border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'} ${theme.textMuted}`
            }`}
        >
            <span className="flex items-center"><Ghost size={18} className="mr-3" /> Ghost Mode</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${isGhostMode ? 'bg-neon-purple text-white' : 'bg-gray-800'}`}>
                {isGhostMode ? 'ON' : 'OFF'}
            </span>
        </button>

        <button 
            onClick={handleInviteFriends}
            className={`w-full ${theme.card} p-4 rounded-xl border flex items-center justify-between ${theme.cardHover} transition-colors`}
        >
            <span className="flex items-center"><Navigation size={18} className="mr-3 text-neon-blue" /> Invite Squad</span>
            <span className={`${theme.textMuted} text-sm`}>Share Link</span>
        </button>

        <div className="grid grid-cols-2 gap-4">
            <div className={`${theme.card} p-4 rounded-xl border`}>
                <span className={`block ${theme.textMuted} text-xs`}>Trust Score</span>
                <span className="font-bold text-neon-green text-xl">98%</span>
            </div>
            <div className={`${theme.card} p-4 rounded-xl border`}>
                <span className={`block ${theme.textMuted} text-xs`}>Vibe Rating</span>
                <span className="font-bold text-neon-blue text-xl">4.9 🔥</span>
            </div>
        </div>

        <button 
            onClick={() => { localStorage.removeItem(USER_STORAGE_KEY); setUserProfile(null); }}
            className="w-full mt-8 py-3 text-red-500 border border-red-900/50 rounded-xl hover:bg-red-900/20 text-sm"
        >
            Log Out
        </button>
      </div>
    </div>
  );

  const renderInbox = () => {
    // Group messages by conversationId to find recent chats
    const uniqueThreads: string[] = Array.from(new Set(messages.map(m => m.conversationId)));
    
    const dmThreads = uniqueThreads
        .filter(id => id !== activePartyId && !id.startsWith('p')) 
        .map(id => users.find(u => u.id === id))
        .filter((u): u is User => !!u);

    return (
        <div className={`p-4 ${theme.bg} min-h-screen space-y-4 transition-colors duration-300`}>
            <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>Messages</h2>
            
            {/* Active Party Card */}
            {activePartyId && (
                <div onClick={() => { setActiveConversationId(activePartyId); setActiveChatMode('party'); }} className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/50 rounded-xl p-4 flex items-center space-x-4 cursor-pointer hover:bg-white/5 transition-colors">
                     <div className="w-12 h-12 rounded-full bg-neon-purple flex items-center justify-center">
                         <MessageCircle className="text-white" />
                     </div>
                     <div className="flex-1">
                         <h3 className={`font-bold ${theme.text}`}>Active Squad</h3>
                         <p className="text-xs text-neon-green flex items-center"><span className="w-2 h-2 rounded-full bg-neon-green mr-1 animate-pulse"/> Live Chat</p>
                     </div>
                     <ArrowRight size={20} className="text-gray-400" />
                </div>
            )}

            <h3 className={`text-sm font-bold ${theme.textMuted} mt-6 uppercase tracking-wider`}>Direct Messages</h3>
            <div className="space-y-2">
                {dmThreads.length === 0 ? (
                    <p className={`${theme.textMuted} text-sm italic`}>No recent messages. Tap a user on the radar to chat!</p>
                ) : (
                    dmThreads.map(user => (
                        <div key={user.id} onClick={() => handleInboxSelect(user.id, 'dm')} className={`${theme.card} rounded-xl p-3 flex items-center space-x-3 cursor-pointer hover:border-neon-blue transition-colors`}>
                            <div className="relative">
                                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt={user.name} />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${user.status === UserStatus.READY ? 'bg-neon-green' : 'bg-gray-500'}`} />
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold ${theme.text} text-sm`}>{user.name}</h4>
                                <p className={`text-xs ${theme.textMuted} truncate`}>Tap to chat</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
  };

  const renderChat = () => {
      // If no conversation selected, show inbox
      if (!activeConversationId) {
          return renderInbox();
      }

      // Determine Chat Props
      let title = "Chat";
      let subtitle = "";
      let partyData: Party | undefined;

      if (activeChatMode === 'party') {
          partyData = parties.find(p => p.id === activeConversationId);
          title = partyData?.title || "Party Chat";
          subtitle = `${partyData?.attendees || 0} online`;
      } else {
          const user = users.find(u => u.id === activeConversationId);
          title = user?.name || "Unknown";
          subtitle = user?.status || "Offline";
      }

      const relevantMessages = messages.filter(m => m.conversationId === activeConversationId);

      return (
        <ChatInterface 
            key={activeConversationId}
            title={title}
            subtitle={subtitle}
            party={partyData}
            messages={relevantMessages}
            mode={activeChatMode}
            isDarkMode={isDarkMode}
            onSendMessage={handleSendMessage}
            onRate={handleRate}
            onInvite={handleInviteFriends}
            onHype={handleBoostHype}
            onBack={() => setActiveConversationId(null)}
            onBookTable={activeChatMode === 'party' ? handleBookTable : undefined}
        />
      );
  };

  return (
    <div className={`${theme.bg} h-screen w-screen overflow-hidden flex flex-col ${sosTriggered ? 'animate-pulse bg-red-900' : ''} transition-colors duration-300`}>
      <NotificationSystem notifications={notifications} onDismiss={removeNotification} />
      <SOSButton onTrigger={handleSOSTrigger} />

      {/* User Interaction Modal */}
      {selectedUser && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn" onClick={() => setSelectedUser(null)}>
              <div className={`${theme.card} border-white/10 w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl transform scale-100`} onClick={e => e.stopPropagation()}>
                  <div className="w-20 h-20 rounded-full border-2 border-neon-blue mx-auto mb-4 p-1">
                      <img src={selectedUser.avatar} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <h3 className={`text-xl font-bold ${theme.text} mb-1`}>{selectedUser.name}</h3>
                  <p className="text-neon-blue text-sm mb-6">{selectedUser.status}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleStartDM} className="bg-neon-purple hover:bg-purple-600 text-white font-bold py-3 rounded-xl flex items-center justify-center">
                          <MessageCircle size={18} className="mr-2" /> Message
                      </button>
                      <button onClick={() => setSelectedUser(null)} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl">
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showPaymentFor && (
        <PaymentModal 
            partyTitle={showPaymentFor.title} 
            amount={showPaymentFor.entryFee || 0} 
            onSuccess={handlePaymentSuccess} 
            onCancel={() => setShowPaymentFor(null)} 
        />
      )}

      {showInviteModal && (
        <InviteModal 
          url={inviteLinkData.url} 
          title={inviteLinkData.title} 
          onClose={() => setShowInviteModal(false)} 
        />
      )}

      {showTableBookingFor && (
        <TableBookingModal 
           party={showTableBookingFor}
           onClose={() => setShowTableBookingFor(null)}
           onConfirm={handleBookTableConfirm}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-y-auto scrollbar-hide">
        {activeTab === 'radar' && renderRadar()}
        {activeTab === 'discover' && renderDiscover()}
        {activeTab === 'create' && renderCreate()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'chat' && renderChat()}
      </div>

      {/* Bottom Navigation */}
      <div className={`h-20 ${theme.nav} backdrop-blur-lg border-t flex justify-around items-center px-2 z-50 fixed bottom-0 w-full transition-colors duration-300`}>
        <button onClick={() => setActiveTab('radar')} className={`flex flex-col items-center p-2 ${activeTab === 'radar' ? 'text-neon-purple' : theme.tabInactive}`}>
          <Radar size={24} className={activeTab === 'radar' ? 'drop-shadow-[0_0_5px_#b026ff]' : ''} />
          <span className="text-[10px] mt-1">Radar</span>
        </button>
        <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center p-2 ${activeTab === 'discover' ? 'text-neon-blue' : theme.tabInactive}`}>
          <Compass size={24} className={activeTab === 'discover' ? 'drop-shadow-[0_0_5px_#04d9ff]' : ''} />
          <span className="text-[10px] mt-1">Discover</span>
        </button>
        <button onClick={() => setActiveTab('create')} className="flex flex-col items-center justify-center -mt-8">
          <div className="bg-gradient-to-tr from-neon-purple to-neon-blue p-4 rounded-full shadow-[0_0_15px_#b026ff] border-4 border-gray-900">
            <PlusCircle size={32} className="text-white" />
          </div>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center p-2 ${activeTab === 'chat' ? 'text-neon-green' : theme.tabInactive}`}>
          <MessageCircle size={24} className={activeTab === 'chat' ? 'drop-shadow-[0_0_5px_#39ff14]' : ''} />
          <span className="text-[10px] mt-1">{activeConversationId ? 'Chat' : 'Inbox'}</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 ${activeTab === 'profile' ? (isDarkMode ? 'text-white' : 'text-gray-900') : theme.tabInactive}`}>
          <UserIcon size={24} />
          <span className="text-[10px] mt-1">You</span>
        </button>
      </div>
    </div>
  );
};

export default App;
