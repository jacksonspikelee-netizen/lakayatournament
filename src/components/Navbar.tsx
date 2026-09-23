import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Swords, 
  Wallet as WalletIcon, 
  User as UserIcon, 
  ShieldCheck, 
  Bell, 
  Globe, 
  MessageCircle, 
  Menu, 
  X, 
  Crown, 
  Award, 
  FileCheck2, 
  LogOut, 
  Check,
  ChevronDown,
  Gamepad2,
  Receipt,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { apiRequest } from '../api/client';
import { InAppNotification } from '../types';
import { GlobalNetworkStatus } from './GlobalNetworkStatus';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenWhatsApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenWhatsApp }) => {
  const { user, logout, setIsAuthModalOpen, setAuthModalMode, setIsMembershipModalOpen } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      apiRequest<InAppNotification[]>('/notifications')
        .then(data => {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMarkNotificationsRead = async () => {
    try {
      await apiRequest('/notifications/read', { method: 'POST' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Trophy },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'gamers', label: 'Gamers', icon: Users },
    { id: 'matches', label: 'Matches', icon: Swords },
    { id: 'wallet', label: 'Wallet', icon: WalletIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  if (user?.role === 'owner' || user?.role === 'admin' || user?.email === 'spideedtheking@gmail.com') {
    navItems.push({ 
      id: 'admin', 
      label: user?.role === 'owner' ? 'Owner Control' : 'Admin', 
      icon: user?.role === 'owner' ? Crown : ShieldCheck 
    });
  }

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ht', label: 'Kreyòl Ayisyen', flag: '🇭🇹' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <nav
      id="main-navigation-bar"
      className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80"
    >
      {/* Top Haitian Flag Accent Strip */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/2 bg-[#0047AB]" />
        <div className="h-full w-1/2 bg-[#D21034]" />
      </div>

      {/* Global Connection & Device Accessibility Bar */}
      <GlobalNetworkStatus />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <div
            onClick={() => setCurrentTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="LakayaTOURNAMENT"
                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/40 shadow-lg shadow-blue-900/20 group-hover:scale-105 transition transform duration-200"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>

            <div className="flex flex-col">
              <span className="font-display font-black text-xl md:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-rose-400">
                Lakaya<span className="text-rose-500">TOURNAMENT</span>
              </span>
              <span className="font-tech text-xs tracking-[0.25em] text-amber-400 font-bold uppercase">
                {t('tagline')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center space-x-2 transition ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 text-white border border-blue-500/40 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            {/* WhatsApp Support Direct Button */}
            <button
              onClick={onOpenWhatsApp}
              title="Official WhatsApp Support (347-558-3607)"
              className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition flex items-center space-x-1.5 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline text-xs font-bold">WhatsApp</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition flex items-center space-x-1 text-xs font-semibold"
              >
                <span>{languages.find(l => l.code === language)?.flag}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between transition"
                    >
                      <span className="flex items-center space-x-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {language === l.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* In-App Notifications */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    if (!notificationsOpen && unreadCount > 0) {
                      handleMarkNotificationsRead();
                    }
                  }}
                  className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition"
                >
                  <Bell className="w-4 h-4 text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkNotificationsRead}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-3 text-xs ${n.is_read ? 'opacity-70' : 'bg-blue-950/20'}`}>
                            <div className="font-bold text-white mb-0.5">{n.title}</div>
                            <div className="text-slate-300 text-[11px]">{n.message}</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth / Profile Area */}
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Wallet Balance Pill */}
                <button
                  onClick={() => setCurrentTab('wallet')}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold transition"
                >
                  <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>${user.wallet_balance?.toFixed(2) || '0.00'}</span>
                </button>

                {/* Role / Membership Status Badge */}
                {user.role === 'owner' ? (
                  <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 rounded-xl text-amber-300 text-[11px] font-black tracking-wider uppercase shadow-md shadow-amber-950/40">
                    <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>OWNER</span>
                  </span>
                ) : user.role === 'admin' ? (
                  <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-500/20 border border-blue-500/50 rounded-xl text-blue-300 text-[11px] font-bold tracking-wider uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>ADMIN</span>
                  </span>
                ) : user.is_member_active ? (
                  <button
                    onClick={() => setCurrentTab('membership')}
                    className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>MEMBER</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsMembershipModalOpen(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-xl text-white text-xs font-bold shadow-md shadow-rose-950 transition animate-pulse"
                  >
                    <span>ACTIVATE</span>
                  </button>
                )}

                {/* User Dropdown / Avatar */}
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="flex items-center space-x-2 p-1 pl-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
                >
                  <span className="hidden md:inline text-xs font-bold text-white max-w-[90px] truncate">
                    {user.username}
                  </span>
                  <img
                    src={user.profile_photo_url || '/logo.jpg'}
                    alt={user.username}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-600"
                    referrerPolicy="no-referrer"
                  />
                </button>

                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white transition"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white text-xs font-display font-bold tracking-wider rounded-xl shadow-lg transition transform active:scale-98"
                >
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Official Subnav Bar Matching Screenshot */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center space-x-6 text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
          <button
            onClick={() => setCurrentTab('home')}
            className="hover:text-amber-400 transition flex items-center space-x-1.5"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
            <span>MANY GAMES</span>
          </button>
          <span className="text-slate-700 font-normal">•</span>
          <button
            onClick={() => setCurrentTab('matches')}
            className="hover:text-amber-400 transition flex items-center space-x-1.5"
          >
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>CHALLENGES</span>
          </button>
          <span className="text-slate-700 font-normal">•</span>
          <button
            onClick={() => setCurrentTab('tournaments')}
            className="hover:text-amber-400 transition flex items-center space-x-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>MATCHMAKING</span>
          </button>
          <span className="text-slate-700 font-normal">•</span>
          <button
            onClick={() => setCurrentTab('wallet')}
            className="hover:text-amber-400 transition flex items-center space-x-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>PAYMENTS (MONCASH)</span>
          </button>
          <span className="text-slate-700 font-normal">•</span>
          <button
            onClick={() => setCurrentTab('profile')}
            className="hover:text-amber-400 transition flex items-center space-x-1.5"
          >
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>MEDALS</span>
          </button>
          <span className="text-slate-700 font-normal">•</span>
          <button
            onClick={() => setCurrentTab('profile')}
            className="hover:text-amber-400 transition flex items-center space-x-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
            <span>CERTIFICATES</span>
          </button>
          <span className="text-slate-700 font-normal">•</span>
          <button
            onClick={() => setCurrentTab('matches')}
            className="hover:text-amber-400 transition flex items-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>REPORTS / DISPUTES</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center space-x-3 transition ${
                  isActive
                    ? 'bg-blue-900/40 text-white border border-blue-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
