import React, { useState } from 'react';
import { 
  Swords, 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ShieldCheck, 
  ChevronRight, 
  Play, 
  Award,
  Crown,
  Medal,
  ExternalLink
} from 'lucide-react';
import { Match, Tournament } from '../../types';

interface TournamentArenaPanelProps {
  onJoinTournament: () => void;
  onOpenReportModal: () => void;
  setCurrentTab: (tab: string) => void;
}

export const TournamentArenaPanel: React.FC<TournamentArenaPanelProps> = ({
  onJoinTournament,
  onOpenReportModal,
  setCurrentTab,
}) => {
  const [activePlayMode, setActivePlayMode] = useState<'fun' | 'compete' | 'scheduled'>('compete');

  return (
    <div id="tournament-arena-panel" className="space-y-6">
      {/* 1. RECENT CHALLENGES TABLE (Top of Center Column) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Swords className="w-5 h-5 text-rose-500" />
            <h2 className="font-display font-black text-lg text-white tracking-wider uppercase">
              RECENT CHALLENGES
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[10px] font-bold animate-pulse">
            LIVE ARENA
          </span>
        </div>

        {/* Challenges Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-tech text-slate-400 tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">MATCH ID</th>
                <th className="py-2.5 px-3">PLAYERS</th>
                <th className="py-2.5 px-3">GAME</th>
                <th className="py-2.5 px-3">PLATFORM</th>
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {[
                { id: 'MATCH#193829', p1: 'GamerA', p2: 'GamerB', game: 'FC 27', plat: 'PS5', date: '06/05 PM', status: 'play', color: 'bg-emerald-600 hover:bg-emerald-500' },
                { id: 'MATCH#192385', p1: 'GamerA', p2: 'GamerB', game: 'MK', plat: 'Xbox', date: '06/05 PM', status: 'verified', color: 'bg-slate-800 text-slate-400' },
                { id: 'MATCH#193856', p1: 'GamerA', p2: 'GamerB', game: 'COD', plat: 'PS5', date: '06/01 PM', status: 'play', color: 'bg-emerald-600 hover:bg-emerald-500' },
                { id: 'MATCH#20157',  p1: 'GamerA', p2: 'GamerB', game: 'NBA 2K', plat: 'Xbox', date: '06/02 PM', status: 'pending', color: 'bg-amber-600/80 hover:bg-amber-500' },
                { id: 'MATCH#193299', p1: 'GamerA', p2: 'GamerB', game: 'FC 27', plat: 'PC', date: '06/30 PM', status: 'conflict', color: 'bg-rose-600/80 hover:bg-rose-500' },
              ].map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {m.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                    {m.p1} <span className="text-slate-500 font-normal">vs</span> {m.p2}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-600/40 text-blue-300 text-[10px] font-bold">
                      {m.game}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                    {m.plat}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                    {m.date}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {m.status === 'play' && (
                      <button
                        onClick={onOpenReportModal}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow"
                      >
                        Play
                      </button>
                    )}
                    {m.status === 'verified' && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
                        Verified
                      </span>
                    )}
                    {m.status === 'pending' && (
                      <button
                        onClick={onOpenReportModal}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition"
                      >
                        Pending
                      </button>
                    )}
                    {m.status === 'conflict' && (
                      <button
                        onClick={onOpenReportModal}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition"
                      >
                        Dispute
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. SCHEDULED MATCHES & RESULT VERIFICATION (Middle Section) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl space-y-4">
        {/* Match Type Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActivePlayMode('fun')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activePlayMode === 'fun'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            PLAY FOR FUN
          </button>
          <button
            onClick={() => setActivePlayMode('compete')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activePlayMode === 'compete'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>COMPETE ($10 REWARD)</span>
          </button>
          <button
            onClick={() => setActivePlayMode('scheduled')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activePlayMode === 'scheduled'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            SCHEDULED MATCHES
          </button>
        </div>

        {/* Verification Result Notification Boxes */}
        <div className="space-y-2.5">
          {/* Box 1: RESULT CONFLICT / DISPUTE */}
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-600/60 flex items-start space-x-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-rose-300">
                GamerA submits 2-1, GamerB submits 1-2
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-mono font-black text-rose-400 bg-rose-900/60 px-2 py-0.5 rounded uppercase">
                  STATUS: RESULT CONFLICT
                </span>
                <button
                  onClick={onOpenReportModal}
                  className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 px-2.5 py-1 rounded transition"
                >
                  Review Proof
                </button>
              </div>
            </div>
          </div>

          {/* Box 2: RESULT VERIFIED & PAID */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-600/60 flex items-start space-x-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-emerald-300">
                Winner +$10 Reward processed. Check Wallet.
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Match ID #1224 • Confirmed by Official Referee
              </div>
            </div>
          </div>
        </div>

        {/* Head-to-Head Stats: Players I Have Beaten & Players Who Beat Me */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Left: Players I Have Beaten */}
          <div className="bg-slate-950/80 border border-emerald-900/40 rounded-2xl p-3 space-y-2">
            <div className="text-[11px] font-tech font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PLAYERS I HAVE BEATEN</span>
            </div>
            <div className="space-y-1 text-xs">
              {[
                { name: 'GamerA', score: '2-1', game: 'FC 27' },
                { name: 'GamerB', score: '2-2 (PK)', game: 'FC 27' },
                { name: 'Gamer82', score: '2-0', game: 'MK' },
                { name: 'TekkenT', score: '2-1', game: 'Tekken 8' },
              ].map((p, i) => (
                <div key={i} className="flex justify-between items-center text-slate-300 py-0.5">
                  <span className="font-semibold text-white">{p.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Players Who Beat Me */}
          <div className="bg-slate-950/80 border border-rose-900/40 rounded-2xl p-3 space-y-2">
            <div className="text-[11px] font-tech font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Swords className="w-3.5 h-3.5" />
              <span>PLAYERS WHO BEAT ME</span>
            </div>
            <div className="space-y-1 text-xs">
              {[
                { name: 'GamerA', score: '0-2', game: 'FC 27' },
                { name: 'Gamer81', score: '1-2', game: 'MK' },
                { name: 'Gamer82', score: '1-3', game: 'Warzone' },
              ].map((p, i) => (
                <div key={i} className="flex justify-between items-center text-slate-300 py-0.5">
                  <span className="font-semibold text-white">{p.name}</span>
                  <span className="font-mono text-rose-400 font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TOURNAMENT BRACKET (12 Players) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-black text-lg text-white tracking-wide">
                Lakaya FC 27 Tournament
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official Haitian 12-Player Elimination Bracket
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-xl bg-blue-950 border border-blue-600/40 text-blue-300 font-mono text-xs font-bold">
              Entry: $5.00
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
              Prize: $100.00
            </span>
          </div>
        </div>

        {/* Interactive Bracket Graphic */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 overflow-x-auto">
          <div className="min-w-[550px] grid grid-cols-4 gap-4 text-xs font-tech">
            {/* Round 1 (12 -> 8) */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                QUALIFIERS
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">Djspideed</span>
                  <span className="text-emerald-400 font-mono font-bold">3</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-500 flex justify-between items-center">
                  <span>Gamer11</span>
                  <span className="font-mono">1</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">HaitiKiller</span>
                  <span className="text-emerald-400 font-mono font-bold">2</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-500 flex justify-between items-center">
                  <span>ApexKing</span>
                  <span className="font-mono">0</span>
                </div>
              </div>
            </div>

            {/* Quarterfinals */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                QUARTERFINALS
              </div>
              <div className="space-y-2 pt-4">
                <div className="p-2 rounded-lg bg-slate-900 border border-blue-500/40 flex justify-between items-center shadow">
                  <span className="font-bold text-white">Djspideed</span>
                  <span className="text-emerald-400 font-mono font-bold">4</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-400 flex justify-between items-center">
                  <span>TekkenT</span>
                  <span className="font-mono">2</span>
                </div>
              </div>

              <div className="space-y-2 pt-6">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">HaitiKiller</span>
                  <span className="text-emerald-400 font-mono font-bold">3</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-400 flex justify-between items-center">
                  <span>Gamer82</span>
                  <span className="font-mono">1</span>
                </div>
              </div>
            </div>

            {/* Semifinals */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                SEMIFINALS
              </div>
              <div className="space-y-2 pt-10">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500 flex justify-between items-center shadow-lg">
                  <span className="font-bold text-white flex items-center">
                    <Crown className="w-3 h-3 text-amber-400 mr-1" /> Djspideed
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">3</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-400 flex justify-between items-center">
                  <span>HaitiKiller</span>
                  <span className="font-mono">2</span>
                </div>
              </div>
            </div>

            {/* Grand Final & Champion Trophy */}
            <div className="space-y-3 flex flex-col justify-center">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider text-center">
                GRAND FINAL
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-500/80 text-center shadow-2xl space-y-2">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                <div className="font-display font-black text-xs text-white uppercase tracking-wider">
                  CHAMPION
                </div>
                <div className="font-tech text-sm font-black text-amber-300">
                  DJSPIDEED THEKING
                </div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 rounded px-2 py-0.5 inline-block">
                  +$100.00 MONCASH
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. TOURNAMENT REWARDS NOTICE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">
                $100 Cash 1st Place
              </div>
              <div className="text-[11px] text-slate-400">
                Payout processed • Certificate generated & emailed • Champion medal awarded
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center space-x-3">
            <Medal className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="font-bold text-white">
                2nd & 3rd Place Rewards
              </div>
              <div className="text-[11px] text-slate-400">
                $10 Reward Membership Credit applied to renewal
              </div>
            </div>
          </div>
        </div>

        {/* 5. MY MEDALS SHELF */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>MY MEDALS</span>
            </div>
            <button
              onClick={() => setCurrentTab('profile')}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { title: 'TOURNAMENT CHAMPION', sub: 'FC 27', tier: 'border-amber-500 text-amber-400 bg-amber-950/30' },
              { title: 'FIRST WIN', sub: 'Verified Win', tier: 'border-blue-500 text-blue-300 bg-blue-950/30' },
              { title: '10 WINS', sub: 'Elite Streak', tier: 'border-purple-500 text-purple-300 bg-purple-950/30' },
              { title: 'FAIR PLAY 509', sub: 'No Disputes', tier: 'border-emerald-500 text-emerald-400 bg-emerald-950/30' },
            ].map((med, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border ${med.tier} text-center space-y-1 shadow`}
              >
                <Award className="w-5 h-5 mx-auto" />
                <div className="font-display font-black text-[10px] tracking-wide leading-tight">
                  {med.title}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  {med.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
