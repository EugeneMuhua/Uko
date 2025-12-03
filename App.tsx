
import React, { useState, useEffect } from 'react';
import { Radar, Compass, PlusCircle, MessageCircle, User as UserIcon, MapPin, Loader2, Sparkles, Navigation, Music, Martini, Gamepad2, Flame, Zap, Headphones } from 'lucide-react';
import { RadarView } from './components/RadarView';
import { ChatInterface } from './components/ChatInterface';
import { NotificationSystem } from './components/NotificationSystem';
import { Onboarding } from './components/Onboarding';
import { generatePartyHype } from './services/geminiService';
import { 
  MOCK_USERS, MOCK_PARTIES, CURRENT_USER_ID 
} from './constants';
import { User, Party, Message, Tab, UserStatus, VibeType, AppNotification, NotificationType } from './types';

const USER_STORAGE_KEY = 'uko_user_profile';

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

  // --- Invite Handling State ---
  const [pendingPartyId, setPendingPartyId] = useState<string | null>(null);
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  // --- Active Chat State ---
  const [activePartyId, setActivePartyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'u3', senderName: 'Zuri', text: 'Where is everyone?', timestamp: new Date() },
    { id: 'm2', senderId: 'u1', senderName: 'Juma', text: 'Just parked!', timestamp: new Date() }
  ]);

  // --- Create Party State ---
  const [newPartyTitle, setNewPartyTitle] = useState('');
  const [newPartyVibe, setNewPartyVibe] = useState<VibeType>(VibeType.CHILL);
  const [newPartyDesc, setNewPartyDesc] = useState('');
  const [newPartyIcon, setNewPartyIcon] = useState('pin');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // --- Initialization Effects ---
  
  useEffect(() => {
    // 1. Check Local Storage for Auth
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      setUserProfile(JSON.parse(savedUser));
    }

    // 2. Parse URL for Invites
    const params = new URLSearchParams(window.location.search);
    const partyIdParam = params.get('partyId');
    const invitedByParam = params.get('invitedBy');

    if (partyIdParam) setPendingPartyId(partyIdParam);
    if (invitedByParam) setInvitingUserId(invitedByParam);

    // Clean URL to prevent re-triggering on refresh
    if (partyIdParam || invitedByParam) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // --- Process Invite Once Logged In ---
  useEffect(() => {
    if (userProfile && (pendingPartyId || invitingUserId)) {
        handleProcessInvite();
    }
  }, [userProfile, pendingPartyId, invitingUserId]);

  const handleProcessInvite = () => {
    if (pendingPartyId) {
        let targetParty = parties.find(p => p.id === pendingPartyId);
        
        // If party doesn't exist in our mock data (simulating a fresh fetch)
        if (!targetParty) {
            targetParty = {
                id: pendingPartyId,
                hostId: invitingUserId || 'unknown',
                title: 'Invited Party',
                description: 'You were invited to this event via link.',
                vibe: VibeType.RAGER,
                startTime: 'Now',
                capacity: 50,
                attendees: 1, // You are the first visible
                location: { x: 5, y: 5 },
                distance: 0.1,
                coverImage: 'https://picsum.photos/400/200?random=invite',
                icon: 'zap'
            };
            setParties(prev => [targetParty!, ...prev]);
        }

        setActivePartyId(pendingPartyId);
        setActiveTab('chat');
        addNotification('Squad Invite Accepted', `Welcome to ${targetParty.title}!`, 'success');
        setPendingPartyId(null); // Clear pending
    } else if (invitingUserId) {
        // Generic app invite
        addNotification('Friend Connected', `You joined via an invite from ${invitingUserId === 'me' ? 'a friend' : invitingUserId}.`, 'info');
        setInvitingUserId(null); // Clear pending
    }
  };

  const handleOnboardingComplete = (name: string, avatar: string) => {
    const profile = { name, avatar };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    setUserProfile(profile);
    // Notification logic handled in useEffect now
    if (!pendingPartyId && !invitingUserId) {
        addNotification('Welcome to Uko?', `You're on the radar, ${name}! 📡`, 'success');
    }
  };

  // --- Notification Logic ---
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

    // Simulate a friend changing status after 15 seconds
    const statusTimer = setTimeout(() => {
      addNotification('Squad Update', 'Kofi is now Ready to Party! 🟢', 'info');
      // Update local user state to match
      setUsers(prev => prev.map(u => u.name === 'Kofi' ? {...u, status: UserStatus.READY} : u));
    }, 15000);

    // Simulate a new party appearing nearby after 25 seconds
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
        icon: 'fire'
      };
      setParties(prev => [...prev, newSimParty]);
    }, 25000);

    return () => { clearTimeout(statusTimer); clearTimeout(partyTimer); };
  }, [userProfile]);

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
      location: { x: 0, y: 0 }, // Host is center
      distance: 0,
      coverImage: `https://picsum.photos/400/200?random=${Date.now()}`,
      icon: newPartyIcon
    };
    setParties([newParty, ...parties]);
    setActivePartyId(newParty.id);
    setActiveTab('chat');
    
    // Notify User
    addNotification('Party Live! 📡', 'Your beacon has been broadcast to nearby users.', 'success');

    // Reset Form
    setNewPartyTitle('');
    setNewPartyDesc('');
    setNewPartyIcon('pin');
  };

  const handleJoinParty = (partyId: string) => {
    setActivePartyId(partyId);
    setActiveTab('chat');
  };

  const handleSendMessage = (text: string) => {
    if (!userProfile) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: CURRENT_USER_ID,
      senderName: userProfile.name,
      text,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
  };

  const handleInviteFriends = async () => {
    if (!userProfile) return;

    // Construct Share URL
    const baseUrl = window.location.origin + window.location.pathname;
    let shareUrl = baseUrl;
    let shareTitle = 'Join me on Uko?';
    let shareText = 'Check out this app!';
    
    // Use URL query parameters to encode invite logic
    // Format: ?partyId=123&invitedBy=User
    if (activePartyId) {
        shareUrl += `?partyId=${activePartyId}&invitedBy=${encodeURIComponent(userProfile.name)}`;
        const party = parties.find(p => p.id === activePartyId);
        shareTitle = `Join ${party?.title || 'the party'} on Uko?`;
        shareText = `I'm at ${party?.title}. Hop in the squad chat!`;
    } else {
        shareUrl += `?invitedBy=${encodeURIComponent(userProfile.name)}`;
        shareText = `Add me on Uko? - The Nightlife Radar.`;
    }

    const shareData = {
        title: shareTitle,
        text: shareText,
        url: shareUrl
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            addNotification('Invite Sent', 'Your squad has been summoned.', 'success');
        } catch (err) {
            console.log('Share canceled');
        }
    } else {
        // Fallback for browsers without Web Share API
        try {
            await navigator.clipboard.writeText(shareUrl);
            addNotification('Link Copied', 'Share the link with your friends!', 'info');
        } catch (err) {
            addNotification('Error', 'Could not copy link.', 'alert');
        }
    }
  };

  const handleRate = (hype: number, safety: number) => {
    addNotification('Vibe Check Complete', `You rated: ${hype}🔥 ${safety}🛡️`, 'success');
    setActiveTab('radar');
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
      onToggleStatus={handleToggleStatus}
    />
  );

  const renderDiscover = () => (
    <div className="p-4 pb-24 space-y-4 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-4">Nearby Parties</h2>
      {parties.sort((a,b) => a.distance - b.distance).map(party => (
        <div key={party.id} className="bg-neon-card rounded-xl overflow-hidden shadow-lg border border-gray-800">
          <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${party.coverImage})` }}>
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white font-bold">
              {party.distance}km away
            </div>
            <div className="absolute bottom-2 left-2">
              <span className={`px-2 py-1 rounded text-xs font-bold text-black ${
                party.vibe === VibeType.RAGER ? 'bg-neon-green' : 'bg-neon-blue'
              }`}>{party.vibe}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-white">{party.title}</h3>
            <p className="text-gray-400 text-sm mt-1">{party.description}</p>
            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">
                {party.attendees}/{party.capacity} joined
              </div>
              <button 
                onClick={() => handleJoinParty(party.id)}
                className="bg-neon-purple text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-600 transition-colors shadow-[0_0_10px_#b026ff40]"
              >
                Join Squad
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCreate = () => (
    <div className="p-6 bg-gray-900 min-h-screen flex flex-col pb-24">
      <h2 className="text-2xl font-bold text-white mb-6">Drop a Pin</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Event Title</label>
          <input 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none"
            placeholder="e.g. Saturday Night Rager"
            value={newPartyTitle}
            onChange={(e) => setNewPartyTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">The Vibe</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(VibeType).map((vibe) => (
              <button
                key={vibe}
                onClick={() => setNewPartyVibe(vibe)}
                className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                  newPartyVibe === vibe 
                    ? 'border-neon-purple bg-neon-purple/20 text-white' 
                    : 'border-gray-700 text-gray-500'
                }`}
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Pin Icon</label>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {PIN_ICONS.map((iconItem) => {
              const IconComp = iconItem.Icon;
              const isSelected = newPartyIcon === iconItem.id;
              return (
                <button
                  key={iconItem.id}
                  onClick={() => setNewPartyIcon(iconItem.id)}
                  className={`flex flex-col items-center flex-shrink-0 p-2 rounded-lg border transition-all ${
                    isSelected 
                      ? 'border-neon-blue bg-neon-blue/20 text-white shadow-[0_0_10px_#04d9ff40]' 
                      : 'border-gray-700 text-gray-500'
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
          <div className="flex justify-between items-center mb-2">
             <label className="text-gray-400 text-sm">Description</label>
             <button 
               onClick={handleGenerateAI}
               disabled={isGeneratingAI || !newPartyTitle}
               className="text-xs text-neon-blue flex items-center hover:text-white disabled:opacity-50"
             >
               <Sparkles size={12} className="mr-1" /> AI Hype Me
             </button>
          </div>
          <div className="relative">
            <textarea 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none h-24"
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
    <div className="p-6 bg-gray-900 min-h-screen flex flex-col items-center pt-12 text-white">
      <div className="w-24 h-24 rounded-full border-4 border-neon-purple p-1 mb-4 shadow-[0_0_20px_#b026ff]">
        <img src={userProfile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
      </div>
      <h2 className="text-2xl font-bold">{userProfile.name}</h2>
      <p className="text-neon-green text-sm mb-8">{myStatus}</p>

      <div className="w-full space-y-4">
        <button 
            onClick={handleInviteFriends}
            className="w-full bg-neon-card p-4 rounded-xl border border-gray-700 flex items-center justify-between hover:bg-gray-800 transition-colors"
        >
            <span className="flex items-center"><Navigation size={18} className="mr-3 text-neon-blue" /> Invite Squad</span>
            <span className="text-gray-400 text-sm">Share Link</span>
        </button>

        <div className="bg-neon-card p-4 rounded-xl border border-gray-800 flex justify-between">
           <span>Parties Attended</span>
           <span className="font-bold text-neon-purple">0</span>
        </div>
        <div className="bg-neon-card p-4 rounded-xl border border-gray-800 flex justify-between">
           <span>Avg Hype Rating</span>
           <span className="font-bold text-neon-blue">5.0 🔥</span>
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

  return (
    <div className="bg-gray-900 h-screen w-screen overflow-hidden flex flex-col">
      <NotificationSystem notifications={notifications} onDismiss={removeNotification} />

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-y-auto scrollbar-hide">
        {activeTab === 'radar' && renderRadar()}
        {activeTab === 'discover' && renderDiscover()}
        {activeTab === 'create' && renderCreate()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'chat' && (
          activePartyId ? (
            <ChatInterface 
              party={parties.find(p => p.id === activePartyId) || parties[0]}
              messages={messages}
              onSendMessage={handleSendMessage}
              onRate={handleRate}
              onInvite={handleInviteFriends}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle size={48} className="mb-4 opacity-50" />
              <p>Join a party to enter the squad chat.</p>
              <button 
                onClick={() => setActiveTab('discover')}
                className="mt-4 text-neon-purple hover:underline"
              >
                Find a party
              </button>
            </div>
          )
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="h-20 bg-black/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center px-2 z-50 fixed bottom-0 w-full">
        <button onClick={() => setActiveTab('radar')} className={`flex flex-col items-center p-2 ${activeTab === 'radar' ? 'text-neon-purple' : 'text-gray-500'}`}>
          <Radar size={24} className={activeTab === 'radar' ? 'drop-shadow-[0_0_5px_#b026ff]' : ''} />
          <span className="text-[10px] mt-1">Radar</span>
        </button>
        <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center p-2 ${activeTab === 'discover' ? 'text-neon-blue' : 'text-gray-500'}`}>
          <Compass size={24} className={activeTab === 'discover' ? 'drop-shadow-[0_0_5px_#04d9ff]' : ''} />
          <span className="text-[10px] mt-1">Discover</span>
        </button>
        <button onClick={() => setActiveTab('create')} className="flex flex-col items-center justify-center -mt-8">
          <div className="bg-gradient-to-tr from-neon-purple to-neon-blue p-4 rounded-full shadow-[0_0_15px_#b026ff] border-4 border-gray-900">
            <PlusCircle size={32} className="text-white" />
          </div>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center p-2 ${activeTab === 'chat' ? 'text-neon-green' : 'text-gray-500'}`}>
          <MessageCircle size={24} className={activeTab === 'chat' ? 'drop-shadow-[0_0_5px_#39ff14]' : ''} />
          <span className="text-[10px] mt-1">Squad</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 ${activeTab === 'profile' ? 'text-white' : 'text-gray-500'}`}>
          <UserIcon size={24} />
          <span className="text-[10px] mt-1">You</span>
        </button>
      </div>
    </div>
  );
};

export default App;
