import React from 'react';
import { Trophy, MessageCircle, Mail, Phone, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onOpenWhatsApp: () => void;
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWhatsApp, setCurrentTab }) => {
  const { t } = useLanguage();

  return (
    <footer id="lakaya-tournament-footer" className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs">
      {/* Haitian Flag Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/2 bg-[#0047AB]" />
        <div className="h-full w-1/2 bg-[#D21034]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.jpg"
                alt="LakayaTOURNAMENT"
                className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-black text-lg text-white">
                Lakaya<span className="text-rose-500">TOURNAMENT</span>
              </span>
            </div>
            <p className="font-tech text-xs tracking-widest text-amber-400 font-bold uppercase">
              {t('tagline')}
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              The premier full-stack competitive esports league for Haitian gamers worldwide. Featuring EA SPORTS FC 27 and Mortal Kombat.
            </p>
          </div>

          {/* Direct Support & Contacts */}
          <div className="space-y-3">
            <div className="font-display font-bold text-white text-xs tracking-wider uppercase">
              Official Support
            </div>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={onOpenWhatsApp}
                  className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-semibold transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: 347-558-3607</span>
                </button>
              </li>
              <li className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:spideedtheking@gmail.com" className="hover:text-amber-400 transition">
                  spideedtheking@gmail.com
                </a>
              </li>
              <li className="text-slate-400">
                League Commissioner: <strong className="text-amber-300">DJSPIDEED THEKING</strong>
              </li>
            </ul>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-3">
            <div className="font-display font-bold text-white text-xs tracking-wider uppercase">
              League Hubs
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => setCurrentTab('tournaments')} className="hover:text-white transition">
                  12-Player Tournaments
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('gamers')} className="hover:text-white transition">
                  Find Haitian Gamers
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('matches')} className="hover:text-white transition">
                  Report Match Results ($10 Reward)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('wallet')} className="hover:text-white transition">
                  MonCash & Natcash Payouts
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('certificates')} className="hover:text-white transition">
                  Championship Diplomas
                </button>
              </li>
            </ul>
          </div>

          {/* Financial & Legal Policies */}
          <div className="space-y-3">
            <div className="font-display font-bold text-white text-xs tracking-wider uppercase">
              Prize & Security Rules
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              • 1st Place: $100 Cash + Medal + Certificate<br />
              • 2nd & 3rd: $10 Credit + Medal<br />
              • Verified Matches: $10 USD Winner Bounty<br />
              • Official Haitian Payouts via Digicel MonCash, Natcom Natcash & Haitian Wire.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} LakayaTOURNAMENT. All rights reserved. Built for the Republic of Haiti 🇭🇹.
          </div>
          <div className="flex items-center space-x-1">
            <span>Powered by</span>
            <span className="text-white font-bold">DJSPIDEED THEKING</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
