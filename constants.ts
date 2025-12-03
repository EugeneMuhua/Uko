
import { User, Party, UserStatus, VibeType } from './types';

export const CURRENT_USER_ID = 'me';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Juma',
    avatar: 'https://picsum.photos/50/50?random=1',
    status: UserStatus.READY,
    location: { x: 20, y: -30 },
    distance: 0.5,
    badges: ['Night Owl', 'DJ']
  },
  {
    id: 'u2',
    name: 'Amani',
    avatar: 'https://picsum.photos/50/50?random=2',
    status: UserStatus.CHILLING,
    location: { x: -45, y: 10 },
    distance: 1.2,
    badges: ['Safe Host']
  },
  {
    id: 'u3',
    name: 'Zuri',
    avatar: 'https://picsum.photos/50/50?random=3',
    status: UserStatus.HOSTING,
    location: { x: 10, y: 50 },
    distance: 0.8,
    badges: ['Legend']
  },
  {
    id: 'u4',
    name: 'Kofi',
    avatar: 'https://picsum.photos/50/50?random=4',
    status: UserStatus.READY,
    location: { x: -20, y: -20 },
    distance: 0.3
  }
];

export const MOCK_PARTIES: Party[] = [
  {
    id: 'p1',
    hostId: 'u3',
    title: 'Rooftop Sundowner',
    description: 'Afrobeats and chill vibes on the roof. BYOB.',
    vibe: VibeType.CHILL,
    startTime: '20:00',
    capacity: 30,
    attendees: 12,
    location: { x: 10, y: 50 },
    distance: 0.8,
    coverImage: 'https://picsum.photos/400/200?random=10',
    icon: 'music',
    entryFee: 0,
    hostTrustScore: 95,
    hypeScore: 65, // High hype
    musicTrack: {
      title: 'Unavailable',
      artist: 'Davido',
      coverUrl: 'https://picsum.photos/60/60?random=100'
    }
  },
  {
    id: 'p2',
    hostId: 'u5',
    title: 'Neon Basement Rave',
    description: 'Deep house all night. No entry after 11PM.',
    vibe: VibeType.RAGER,
    startTime: '22:00',
    capacity: 100,
    attendees: 45,
    location: { x: -60, y: -10 },
    distance: 2.5,
    coverImage: 'https://picsum.photos/400/200?random=11',
    icon: 'zap',
    entryFee: 500, // KES
    hostTrustScore: 88,
    hypeScore: 20
  },
  {
    id: 'p3',
    hostId: 'u6',
    title: 'FIFA Tournament',
    description: 'Winner takes the pot. Snacks provided.',
    vibe: VibeType.GAMING,
    startTime: '19:00',
    capacity: 10,
    attendees: 6,
    location: { x: 80, y: 20 },
    distance: 3.1,
    coverImage: 'https://picsum.photos/400/200?random=12',
    icon: 'game',
    entryFee: 200,
    hostTrustScore: 92
  }
];
