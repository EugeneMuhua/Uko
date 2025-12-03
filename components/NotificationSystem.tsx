
import React, { useEffect, useState } from 'react';
import { X, Bell, Zap, MapPin, CheckCircle, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationSystemProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<{ 
  notification: AppNotification; 
  onDismiss: (id: string) => void 
}> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300); // Wait for animation
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'party': return <MapPin size={20} className="text-neon-purple" />;
      case 'success': return <CheckCircle size={20} className="text-neon-green" />;
      case 'alert': return <Zap size={20} className="text-red-500" />;
      default: return <Bell size={20} className="text-neon-blue" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'party': return 'border-l-neon-purple';
      case 'success': return 'border-l-neon-green';
      case 'alert': return 'border-l-red-500';
      default: return 'border-l-neon-blue';
    }
  };

  return (
    <div 
      className={`
        relative w-full max-w-sm bg-gray-900/90 backdrop-blur-md border border-white/10 
        ${getBorderColor()} border-l-4 rounded-r-lg shadow-lg p-4 mb-3 
        flex items-start transition-all duration-300 transform
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0 animate-[slideIn_0.3s_ease-out]'}
      `}
    >
      <div className="mr-3 mt-1 bg-black/50 p-1.5 rounded-full border border-white/5">
        {getIcon()}
      </div>
      <div className="flex-1 mr-2">
        <h4 className="text-sm font-bold text-white leading-tight mb-1">{notification.title}</h4>
        <p className="text-xs text-gray-300 leading-snug">{notification.message}</p>
        <span className="text-[10px] text-gray-500 mt-2 block">{notification.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 flex flex-col items-center pointer-events-none">
      {/* Pointer events auto so we can click buttons but click through the container area */}
      <div className="pointer-events-auto w-full max-w-md flex flex-col items-center">
        {notifications.map(n => (
          <NotificationToast key={n.id} notification={n} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
};
