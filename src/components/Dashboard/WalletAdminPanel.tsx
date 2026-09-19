import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  ArrowUpRight, 
  Crown, 
  Users, 
  Gamepad2, 
  Award, 
  FileCheck2, 
  Bell, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { User, Wallet, InAppNotification } from '../../types';

interface WalletAdminPanelProps {
  user: User | null;
  wallet: Wallet | null;
  onOpenWithdrawalModal: () => void;
  onOpenCertificateModal: (certId?: string) => void;
  setCurrentTab: (tab: string) => void;
}

export const WalletAdminPanel: React.FC<WalletAdminPanelProps> = ({
  user,
  wallet,
  onOpenWithdrawalModal,
  onOpenCertificateModal,
  setCurrentTab,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'moncash' | 'natcash' | 'bank'>('moncash');

  return (
    <div id="wallet-admin-panel" className="space-y-6">
      {/* 1. WALLET & PAYMENTS (Top of Right Column) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <WalletIcon className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-black text-lg text-white tracking-wider uppercase">
              WALLET & PAYMENTS
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
            MONCASH / NATCASH
          </span>
        </div>

        {/* Balance Displays Matching Screenshot */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider">
              Available Balance
            </div>
            <div className="font-mono text-xl md:text-2xl font-black text-emerald-400 mt-1">
              ${wallet?.available_balance?.toFixed(2) || '1.90'} <span className="text-xs text-slate-400">USD</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Ready for instant cashout</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider">
              Pending Rewards
            </div>
            <div className="font-mono text-xl md:text-2xl font-black text-amber-400 mt-1">
              ${wallet?.pending_rewards?.toFixed(2) || '5.00'} <span className="text-xs text-slate-400">USD</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Referee verification queue</div>
          </div>
        </div>

        {/* Pending & Paid Rewards Table */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
            <span>Pending & Paid Rewards</span>
            <span className="text-emerald-400 font-mono text-[10px]">Auto-Synced</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[9px] uppercase font-tech text-slate-500">
                <tr>
                  <th className="py-2 px-2.5 rounded-l">MATCH / TOURNAMENT</th>
                  <th className="py-2 px-2.5">AMOUNT</th>
                  <th className="py-2 px-2.5">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-[11px]">
                {[
                  { match: 'MATCH700 (TOURNAMENT 9)', type: 'Prize Pool', amount: '$100.00', status: 'Paid', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
                  { match: 'MATCH500 (TOURNAMENT 8)', type: 'Champion', amount: '$1.00', status: 'Pending', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
                  { match: 'MATCH650 (TOURNAMENT 7)', type: 'GameWin', amount: '$1.90', status: 'Processing', color: 'text-blue-400 bg-blue-950/60 border-blue-500/30' },
                  { match: 'MATCH850 (TOURNAMENT 6)', type: 'Champion', amount: '$10.00', status: 'Paid', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition">
                    <td className="py-2 px-2.5 font-medium text-white">
                      <div className="truncate max-w-[130px]">{row.match}</div>
                      <div className="text-[9px] text-slate-500">{row.type}</div>
                    </td>
                    <td className="py-2 px-2.5 font-mono font-bold text-amber-300">
                      {row.amount}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout Methods Selector & Button */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Select Payout Gateway
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <button
              onClick={() => setSelectedMethod('moncash')}
              className={`p-2 rounded-xl border flex flex-col items-center space-y-1 transition ${
                selectedMethod === 'moncash'
                  ? 'border-rose-500 bg-rose-950/40 text-white shadow'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <span className="font-black text-rose-500 text-xs">MonCash</span>
              <span className="text-[9px] text-emerald-400">Verified Phone</span>
            </button>
            <button
              onClick={() => setSelectedMethod('natcash')}
              className={`p-2 rounded-xl border flex flex-col items-center space-y-1 transition ${
                selectedMethod === 'natcash'
                  ? 'border-blue-500 bg-blue-950/40 text-white shadow'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <span className="font-black text-blue-400 text-xs">Natcash</span>
              <span className="text-[9px] text-slate-400">Natcom Haiti</span>
            </button>
            <button
              onClick={() => setSelectedMethod('bank')}
              className={`p-2 rounded-xl border flex flex-col items-center space-y-1 transition ${
                selectedMethod === 'bank'
                  ? 'border-amber-500 bg-amber-950/40 text-white shadow'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <span className="font-black text-amber-400 text-xs">Haitian Wire</span>
              <span className="text-[9px] text-slate-400">Unibank/Sogebank</span>
            </button>
          </div>

          <button
            onClick={onOpenWithdrawalModal}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:opacity-90 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Request Instant MonCash Payout</span>
          </button>
        </div>
      </div>

      {/* 2. MEMBERSHIP CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <h3 className="font-display font-black text-sm text-white tracking-wide">
              MEMBERSHIP
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold">
            Monthly ($10) / Active
          </span>
        </div>

        <div className="text-xs text-slate-300 flex justify-between items-center">
          <span>Valid Until:</span>
          <span className="font-mono text-white font-bold">30 Days Remaining</span>
        </div>

        {/* Payment History Miniature */}
        <div className="bg-slate-950 rounded-xl p-2.5 space-y-1 text-[11px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Payment History</div>
          <div className="flex justify-between items-center text-slate-400 py-0.5">
            <span>Payment 1 ($10)</span>
            <span className="text-emerald-400 font-bold">Paid</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 py-0.5">
            <span>Payment 2 ($5 Discount)</span>
            <span className="text-emerald-400 font-bold">Paid</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 py-0.5">
            <span>Payment 3 (Renewal)</span>
            <span className="text-amber-400 font-bold">Pending</span>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('profile')}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700/60 text-center"
        >
          Apply Credit to Renewal
        </button>
      </div>

      {/* 3. ADMIN DASHBOARD WIDGET (DJSPIDEED THEKING) */}
      <div className="bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/40 rounded-3xl p-4 md:p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-blue-500/30 pb-2.5">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-black text-sm text-white tracking-wide uppercase">
              ADMIN DASHBOARD
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 text-[10px] font-bold">
            FOUNDER / PRESIDENT
          </span>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
          <img
            src="/logo.jpg"
            alt="DJSPIDEED THEKING"
            className="w-10 h-10 rounded-xl object-cover border border-amber-500/60"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">DJSPIDEED THEKING</div>
            <div className="text-[10px] text-amber-400/90 font-mono truncate">spideedtheking@gmail.com</div>
          </div>
        </div>

        {/* Quick Admin Action Links Matching Screenshot */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
          <button
            onClick={() => setCurrentTab('admin')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-center transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('gamers')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-center transition"
          >
            Manage Gamers
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-center transition"
          >
            Manage Games
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-center transition"
          >
            Manage Medals
          </button>
        </div>

        {/* Mini Sparkline Metric Cards Matching Screenshot */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase font-tech">Active Members</div>
            <div className="font-mono text-sm font-black text-white mt-0.5">342</div>
            <div className="text-[9px] text-emerald-400 font-bold">+18%</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase font-tech">Membership Rev</div>
            <div className="font-mono text-sm font-black text-amber-400 mt-0.5">$3.4K</div>
            <div className="text-[9px] text-emerald-400 font-bold">+24%</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase font-tech">Tournament Rev</div>
            <div className="font-mono text-sm font-black text-blue-400 mt-0.5">$1.8K</div>
            <div className="text-[9px] text-emerald-400 font-bold">+31%</div>
          </div>
        </div>

        {/* Alert Indicators */}
        <div className="flex space-x-2 pt-1">
          <div className="flex-1 p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[10px] text-amber-300 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Unverified Payouts (0)</span>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[10px] text-rose-300 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Disputes (1 Active)</span>
          </div>
        </div>
      </div>

      {/* 4. CERTIFICATES & CREDITS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-black text-sm text-white tracking-wide">
              CERTIFICATES & CREDITS
            </h3>
          </div>
          <button
            onClick={() => onOpenCertificateModal()}
            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
          >
            <Printer className="w-3 h-3" />
            <span>Print Official</span>
          </button>
        </div>

        {/* Grid of 6 Miniature Diploma Certificate Cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'cert-1', title: 'FC 27 CHAMPION', date: '2026' },
            { id: 'cert-2', title: 'MORTAL KOMBAT', date: '2026' },
            { id: 'cert-3', title: 'LAKAYA ELITE', date: '2026' },
            { id: 'cert-4', title: 'COD WARZONE', date: '2026' },
            { id: 'cert-5', title: 'TEKKEN 8 MASTER', date: '2026' },
            { id: 'cert-6', title: 'HAITIAN GRAND PRIX', date: '2026' },
          ].map((c) => (
            <div
              key={c.id}
              onClick={() => onOpenCertificateModal(c.id)}
              className="cursor-pointer group p-2 rounded-xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 text-center transition hover:scale-105 shadow"
            >
              <div className="w-6 h-6 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold">
                🇭🇹
              </div>
              <div className="font-display font-black text-[8px] text-white tracking-tighter mt-1 truncate group-hover:text-amber-300">
                {c.title}
              </div>
              <div className="text-[7px] text-slate-500 font-mono">DIPLOMA</div>
            </div>
          ))}
        </div>

        {/* My Membership Credits */}
        <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-1.5 text-xs">
          <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider">
            My Membership Credits
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
            <div>
              <div className="text-emerald-400 font-bold">$1.00</div>
              <div className="text-[9px] text-slate-500">Active</div>
            </div>
            <div>
              <div className="text-slate-400 font-bold">$60.00</div>
              <div className="text-[9px] text-slate-500">Used</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold">$3,200</div>
              <div className="text-[9px] text-slate-500">Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. NOTIFICATION CENTER (Live Alerts) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-rose-500" />
            <h3 className="font-display font-black text-sm text-white tracking-wide">
              NOTIFICATION CENTER
            </h3>
          </div>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        </div>

        <div className="space-y-2 text-xs">
          {[
            { text: 'Match result verified! +$10 reward added to wallet.', time: '10m ago', icon: CheckCircle2, color: 'text-emerald-400' },
            { text: 'Challenge received! HaitianStriker invites you to FC 27.', time: '25m ago', icon: Gamepad2, color: 'text-blue-400' },
            { text: 'Reward available: Claim $100 via MonCash.', time: '1h ago', icon: Sparkles, color: 'text-amber-400' },
            { text: 'Official Certificate emailed and stored in your profile.', time: '2h ago', icon: FileCheck2, color: 'text-purple-400' },
            { text: 'Admin DJSPIDEED verified your withdrawal.', time: '3h ago', icon: ShieldCheck, color: 'text-emerald-400' },
          ].map((notif, idx) => {
            const Icon = notif.icon;
            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-start space-x-2.5"
              >
                <Icon className={`w-4 h-4 ${notif.color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="text-slate-300 font-medium text-[11px] leading-snug">
                    {notif.text}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {notif.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
