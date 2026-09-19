import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useLanguage();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-notification-banner"
      className="sticky top-0 z-50 bg-rose-900 border-b border-rose-500 text-white px-4 py-3 flex items-center justify-between shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center space-x-3 max-w-7xl mx-auto w-full justify-center text-center">
        <WifiOff className="w-5 h-5 text-rose-300 animate-pulse shrink-0" />
        <span className="font-semibold text-sm md:text-base">
          {t('offline_banner')}
        </span>
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};
