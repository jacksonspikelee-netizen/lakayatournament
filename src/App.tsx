import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineBanner } from './components/OfflineBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { TournamentsView } from './components/TournamentsView';
import { GamersView } from './components/GamersView';
import { MatchesView } from './components/MatchesView';
import { WalletView } from './components/WalletView';
import { ProfileView } from './components/ProfileView';
import { MedalsView } from './components/MedalsView';
import { CertificatesView } from './components/CertificatesView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/Modals/AuthModal';
import { MembershipModal } from './components/Modals/MembershipModal';
import { WhatsAppModal } from './components/Modals/WhatsAppModal';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const { setIsMembershipModalOpen } = useAuth();

  const handleTabChange = (tab: string) => {
    if (tab === 'membership') {
      setIsMembershipModalOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white font-sans antialiased">
      {/* Offline Alert Banner */}
      <OfflineBanner />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'home' && <HomeView setCurrentTab={handleTabChange} />}
        {currentTab === 'tournaments' && <TournamentsView />}
        {currentTab === 'gamers' && <GamersView />}
        {currentTab === 'matches' && <MatchesView />}
        {currentTab === 'wallet' && <WalletView />}
        {currentTab === 'profile' && <ProfileView />}
        {currentTab === 'medals' && <MedalsView />}
        {currentTab === 'certificates' && <CertificatesView />}
        {currentTab === 'rewards' && <ProfileView />}
        {currentTab === 'credits' && <ProfileView />}
        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <MembershipModal />
      <WhatsAppModal isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} />

      {/* Official Footer */}
      <Footer
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        setCurrentTab={handleTabChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
