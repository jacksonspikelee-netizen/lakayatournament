import React from 'react';
import { X, Printer, Award, ShieldCheck, Download, Share2 } from 'lucide-react';
import { User } from '../../types';

interface DiplomaCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  certificateData?: {
    id: string;
    title: string;
    game: string;
    rank: string;
    prize: string;
    date: string;
  };
}

export const DiplomaCertificateModal: React.FC<DiplomaCertificateModalProps> = ({
  isOpen,
  onClose,
  user,
  certificateData = {
    id: 'LKY-CERT-FC27-0091',
    title: 'OFFICIAL HAITIAN ESPORTS CHAMPIONSHIP DIPLOMA',
    game: 'EA SPORTS FC 27',
    rank: '1ST PLACE — GRAND TOURNAMENT CHAMPION',
    prize: '$100.00 USD CASH (MONCASH REWARD)',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-950 border-4 border-amber-500/80 rounded-3xl shadow-2xl p-6 sm:p-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Certificate Frame */}
        <div
          id="official-championship-diploma"
          className="relative bg-gradient-to-b from-[#0b1329] via-[#070b14] to-[#120a1c] border-2 border-amber-400/50 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-inner"
        >
          {/* Top Haitian Flag Accent Ribbons */}
          <div className="flex justify-center items-center space-x-2">
            <div className="h-1.5 w-16 bg-[#0047AB] rounded-l" />
            <span className="text-xl">🇭🇹</span>
            <div className="h-1.5 w-16 bg-[#D21034] rounded-r" />
          </div>

          {/* Header */}
          <div className="space-y-1">
            <div className="font-tech text-xs tracking-[0.3em] text-amber-400 font-bold uppercase">
              REPUBLIQUE D'HAÏTI • FEDERATION ESPORTS LAKAYA
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-amber-400 uppercase tracking-wide">
              DIPLÔME DE CHAMPION
            </h2>
            <p className="font-tech text-xs tracking-[0.2em] text-blue-400 font-bold uppercase">
              LakayaTOURNAMENT — PLAY • COMPETE • WIN
            </p>
          </div>

          {/* Recipient */}
          <div className="py-3 border-y border-amber-500/30 space-y-2">
            <p className="text-xs text-slate-400 italic">
              This official diploma certifies that
            </p>
            <div className="font-display font-black text-xl sm:text-3xl text-white tracking-wide">
              {user?.full_name || user?.display_name || user?.username || 'Jean-Luc Baptiste (HaitiKiller_509)'}
            </div>
            <p className="text-xs text-slate-400">
              Gamer ID: <strong className="text-amber-400 font-mono">{user?.gamer_id || 'LKY-10002'}</strong>
            </p>
          </div>

          {/* Achievement Details */}
          <div className="space-y-2">
            <div className="text-xs text-slate-300">
              Has achieved the title of
            </div>
            <div className="font-tech font-black text-lg sm:text-xl text-amber-400 tracking-wider">
              {certificateData.rank}
            </div>
            <div className="inline-block px-4 py-1 rounded-full bg-blue-950/80 border border-blue-500/60 text-blue-300 text-xs font-bold font-mono">
              GAME: {certificateData.game} • OFFICIAL LEAGUE
            </div>
            <div className="text-xs text-emerald-400 font-bold font-mono mt-1">
              AWARD: {certificateData.prize}
            </div>
          </div>

          {/* Official Signatures & Seal */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800 text-xs text-slate-400">
            <div className="text-center space-y-1">
              <div className="font-serif italic text-amber-300 text-sm">DJSPIDEED THEKING</div>
              <div className="h-0.5 w-32 mx-auto bg-slate-700" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                President & Founder
              </div>
              <div className="text-[9px] text-slate-500 font-mono">spideedtheking@gmail.com</div>
            </div>

            <div className="text-center space-y-1">
              <div className="font-serif italic text-blue-300 text-sm">Lakaya Referee Board</div>
              <div className="h-0.5 w-32 mx-auto bg-slate-700" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Official Certification Seal
              </div>
              <div className="text-[9px] text-slate-500 font-mono">Verified MonCash Payout</div>
            </div>
          </div>

          {/* Verification Code */}
          <div className="text-[9px] font-mono text-slate-500">
            Certificate ID: {certificateData.id} • Issued on {certificateData.date}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Official verifiable document signed by President DJSPIDEED THEKING.
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Print Diploma</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
