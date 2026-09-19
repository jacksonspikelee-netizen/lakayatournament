import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Globe, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  ExternalLink,
  Layers,
  Gamepad2,
  Swords,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/client';
import { GamerFocusPanel } from './Dashboard/GamerFocusPanel';
import { TournamentArenaPanel } from './Dashboard/TournamentArenaPanel';
import { WalletAdminPanel } from './Dashboard/WalletAdminPanel';
import { DiplomaCertificateModal } from './Modals/DiplomaCertificateModal';
import { QuickChallengeModal } from './Modals/QuickChallengeModal';
import { TagEditModal } from './Modals/TagEditModal';
import { WithdrawalModal } from './Modals/WithdrawalModal';
import { DisputeReportModal } from './Modals/DisputeReportModal';
import { User, Wallet as WalletType } from '../types';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  onOpenChallengeModal?: (gamerId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setCurrentTab, onOpenChallengeModal }) => {
  const { user, requireMembership, setIsAuthModalOpen } = useAuth();
  const { t } = useLanguage();

  // Active column for mobile/tablet responsive view
  const [mobileActiveColumn, setMobileActiveColumn] = useState<'all' | 'focus' | 'arena' | 'wallet'>('all');

  // Live wallet state
  const [wallet, setWallet] = useState<WalletType | null>(null);

  // Modals state
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState<string | undefined>(undefined);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [selectedGameForChallenge, setSelectedGameForChallenge] = useState<string | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedGameForTag, setSelectedGameForTag] = useState<string | null>(null);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      apiRequest<any>('/wallet')
        .then((data) => {
          if (data && data.wallet) {
            setWallet(data.wallet);
          } else if (data) {
            setWallet(data);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleOpenChallengeModal = (gameId: string) => {
    setSelectedGameForChallenge(gameId);
    setIsChallengeModalOpen(true);
  };

  const handleEditTag = (gameId: string) => {
    setSelectedGameForTag(gameId);
    setIsTagModalOpen(true);
  };

  const handleSaveTag = (gameId: string, newTag: string) => {
    // Save to user tags
    if (user) {
      apiRequest('/gamer-tags', {
        method: 'POST',
        body: JSON.stringify({ game_id: gameId, gamer_tag: newTag, platform_id: 'plat-ps5' }),
      }).catch(() => {});
    }
  };

  const handleOpenCertificate = (certId?: string) => {
    setSelectedCertId(certId);
    setIsCertificateModalOpen(true);
  };

  return (
    <div id="master-command-center" className="space-y-6 pb-16">
      {/* 1. TOP CENTER MAJESTIC BANNER (Controller, Crown, Wings, Haitian Crest) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-slate-950 shadow-2xl">
        <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden">
          <img
            src="/lakaya_center_emblem.jpg"
            alt="LakayaTOURNAMENT Official Haitian Esports Arena"
            className="w-full h-full object-cover object-center filter contrast-110 brightness-95 scale-100 hover:scale-105 transition duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />

          {/* Floating Live Badge */}
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-blue-500/50 text-blue-300 font-tech font-bold text-xs flex items-center space-x-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE CARIBBEAN ESPORTS HUB</span>
            </span>
          </div>

          <div className="absolute top-4 right-4 hidden sm:flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/50 text-amber-300 font-tech font-bold text-xs flex items-center space-x-1.5 shadow-lg">
              <span>🇭🇹</span>
              <span>100% SECURE MONCASH / NATCASH</span>
            </span>
          </div>

          {/* Slogan Banner Overlay */}
          <div className="absolute bottom-4 inset-x-4 text-center">
            <div className="inline-block px-4 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-amber-500/40 shadow-2xl">
              <span className="font-display font-black text-xs sm:text-sm tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-amber-300 uppercase drop-shadow">
                PLAY • COMPETE • WIN — OFFICIAL HAITIAN GAMING LEAGUE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RESPONSIVE DEVICE CONTROLS (For Phones & Tablets) */}
      <div className="xl:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex items-center justify-between gap-1 overflow-x-auto shadow-lg">
        <div className="text-[11px] font-tech font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
          VIEW:
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setMobileActiveColumn('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              mobileActiveColumn === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Columns</span>
          </button>
          <button
            onClick={() => setMobileActiveColumn('focus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              mobileActiveColumn === 'focus'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Gamer Focus</span>
          </button>
          <button
            onClick={() => setMobileActiveColumn('arena')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              mobileActiveColumn === 'arena'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Arena & Bracket</span>
          </button>
          <button
            onClick={() => setMobileActiveColumn('wallet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              mobileActiveColumn === 'wallet'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet & Admin</span>
          </button>
        </div>
      </div>

      {/* 3. THREE-COLUMN BENTO GRID MATCHING SCREENSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: GAMER FOCUS & GAME TILES */}
        <div
          className={`${
            mobileActiveColumn === 'all' || mobileActiveColumn === 'focus' ? 'block' : 'hidden xl:block'
          }`}
        >
          <GamerFocusPanel
            user={user}
            onOpenChallengeModal={handleOpenChallengeModal}
            onEditTag={handleEditTag}
            setCurrentTab={setCurrentTab}
          />
        </div>

        {/* MIDDLE COLUMN: ARENA, CHALLENGES & 12-PLAYER BRACKET */}
        <div
          className={`${
            mobileActiveColumn === 'all' || mobileActiveColumn === 'arena' ? 'block' : 'hidden xl:block'
          }`}
        >
          <TournamentArenaPanel
            onJoinTournament={() => setCurrentTab('tournaments')}
            onOpenReportModal={() => setIsDisputeModalOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        </div>

        {/* RIGHT COLUMN: WALLET, MEMBERSHIP, ADMIN WIDGET & CERTIFICATES */}
        <div
          className={`lg:col-span-2 xl:col-span-1 ${
            mobileActiveColumn === 'all' || mobileActiveColumn === 'wallet' ? 'block' : 'hidden xl:block'
          }`}
        >
          <WalletAdminPanel
            user={user}
            wallet={wallet}
            onOpenWithdrawalModal={() => setIsWithdrawalModalOpen(true)}
            onOpenCertificateModal={handleOpenCertificate}
            setCurrentTab={setCurrentTab}
          />
        </div>
      </div>

      {/* Interactive Modals */}
      <DiplomaCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        user={user}
      />

      <QuickChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        selectedGameId={selectedGameForChallenge}
        user={user}
      />

      <TagEditModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        gameId={selectedGameForTag}
        onSave={handleSaveTag}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        user={user}
        wallet={wallet}
      />

      <DisputeReportModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        user={user}
      />
    </div>
  );
};
