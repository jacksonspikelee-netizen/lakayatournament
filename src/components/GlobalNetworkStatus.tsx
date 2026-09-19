import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Globe, Download, Smartphone, Check } from 'lucide-react';

interface GlobalNetworkStatusProps {
  onInstallClick?: () => void;
}

export const GlobalNetworkStatus: React.FC<GlobalNetworkStatusProps> = ({ onInstallClick }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [latency, setLatency] = useState<number | null>(24);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  // Measure active ping to /api/health
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const measurePing = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        setLatency(null);
        return;
      }

      const start = performance.now();
      try {
        const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
        if (res.ok) {
          const rtt = Math.round(performance.now() - start);
          setLatency(Math.max(12, rtt));
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch {
        setIsOnline(false);
        setLatency(null);
      }
    };

    measurePing();
    interval = setInterval(measurePing, 10000);

    const handleOnline = () => {
      setIsOnline(true);
      measurePing();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLatency(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Pou enstale LakayaTOURNAMENT sou telefòn ou (iPhone oswa Android):\n1. Peze bouton Pataje (Share) oswa 3 pwen navigatè w la.\n2. Chwazi "Add to Home Screen" (Ajoute sou Ekran Akèy).');
    }
  };

  return (
    <div id="global-network-bar" className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/60 text-[11px]">
      {/* Network Status & Location */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5">
          <span className="relative flex h-2.5 w-2.5">
            {isOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 animate-pulse" />
            )}
          </span>
          <span className="font-tech font-bold text-white tracking-wider uppercase">
            GLOBAL ONLINE STATUS:
          </span>
          <span className={`font-mono font-black ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOnline ? 'ONLINE' : 'DISCONNECTED'}
          </span>
        </div>

        {isOnline && latency !== null && (
          <span className="hidden sm:inline text-slate-400 font-mono text-[10px] bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
            {latency}ms • Haiti & Global Cloud
          </span>
        )}
      </div>

      {/* Cross-device / PWA Install Prompt */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-1 text-slate-400 text-[10px]">
          <Globe className="w-3 h-3 text-blue-400" />
          <span>Works in any location (Ayiti, USA, Canada, Diaspora) • Internet Required</span>
        </div>

        <button
          onClick={handlePwaInstall}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-blue-300 text-[10px] font-bold transition shadow-sm"
          title="Install as Mobile App (PWA)"
        >
          <Smartphone className="w-3 h-3 text-amber-400" />
          <span>{installed ? 'App Installed ✓' : 'Install on Mobile/PC'}</span>
        </button>
      </div>
    </div>
  );
};
