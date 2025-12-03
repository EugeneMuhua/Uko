
export enum UserStatus {
  READY = 'Ready to Party',
  CHILLING = 'Chilling',
  HOSTING = 'Hosting',
  OFFLINE = 'Offline'
}

export enum VibeType {
  RAGER = 'Rager',
  CHILL = 'Chill',
  BYOB = 'BYOB',
  DANCE = 'Dance',
  GAMING = 'Gaming'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  location: { x: number; y: number }; // Relative coordinates for radar (0,0 is center)
  distance: number; // in km
}

export interface Party {
  id: string;
  hostId: string;
  title: string;
  description: string;
  vibe: VibeType;
  startTime: string;
  capacity: number;
  attendees: number;
  location: { x: number; y: number };
  distance: number;
  coverImage: string;
  icon: string; // Icon identifier for custom map pin
  hypeRating?: number; // 0-5
  safetyRating?: number; // 0-5
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export type Tab = 'radar' | 'discover' | 'create' | 'chat' | 'profile';

export type NotificationType = 'info' | 'success' | 'party' | 'alert';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}
