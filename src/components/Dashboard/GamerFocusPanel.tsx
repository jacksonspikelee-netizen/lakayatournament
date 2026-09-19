import React, { useState } from 'react';
import { 
  Gamepad2, 
  Plus, 
  Edit3, 
  Users, 
  Check, 
  Sparkles, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  Copy, 
  CheckCircle2,
  Tv,
  Monitor,
  ExternalLink
} from 'lucide-react';
import { OFFICIAL_GAMES, GameItem } from '../../data/gamesData';
import { User, GamerTag } from '../../types';

interface GamerFocusPanelProps {
  user: User | null;
  onOpenChallengeModal: (gameId: string) => void;
  onEditTag: (gameId: string) => void;
  setCurrentTab: (tab: string) => void;
}

export const GamerFocusPanel: React.FC<GamerFocusPanelProps> = ({
  user,
  onOpenChallengeModal,
  onEditTag,
  setCurrentTab,
}) => {
  const [activeStatTab, setActiveStatTab] = useState<'fc27' | 'mk' | 'gtav' | 'tekken8'>('fc27');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Dynamic tags mapping
  const [userTags, setUserTags] = useState<Record<string, string>>({
    'game-fc27': 'Haiti_Striker509',
    'game-mk': 'AyitiScorpion_X',
    'game-cod': 'Ghost_Delmas',
    'game-nba2k': 'DunkKing_HT',
    'game-fortnite': 'BuildGod_509',
    'game-tekken8': 'Jin_PortAuPrince',
    'game-rl': 'TurboCar_HT',
    'game-gta5': 'Chief_SpikeLee',
  });

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  return (
    <div id="gamer-focus-panel" className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <h2 className="font-display font-black text-lg text-white tracking-wider uppercase">
            GAMER FOCUS
          </h2>
        </div>
        <span className="text-[11px] font-tech text-amber-400 font-bold uppercase tracking-wider">
          8 OFFICIAL TITLES
        </span>
      </div>

      {/* Game Cards Grid (2 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {OFFICIAL_GAMES.map((game) => {
          const currentTag = userTags[game.id] || game.defaultTag;

          return (
            <div
              key={game.id}
              className="group relative bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-xl transition duration-200 flex flex-col"
            >
              {/* Game Cover Art Header */}
              <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                <img
                  src={game.coverImage}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                {/* Genre Tag */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                    {game.genre}
                  </span>
                </div>

                {/* Platform Icons */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {game.platforms.map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-[9px] font-mono text-blue-300 font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="font-display font-black text-sm text-white tracking-wide truncate drop-shadow-md">
                    {game.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>GAMER TAG:</span>
                    <button
                      onClick={() => handleCopyTag(currentTag)}
                      className="hover:text-amber-400 text-slate-400 transition flex items-center space-x-1"
                    >
                      {copiedTag === currentTag ? (
                        <span className="text-emerald-400 flex items-center">
                          <Check className="w-2.5 h-2.5 mr-0.5" /> Copied
                        </span>
                      ) : (
                        <Copy className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>
                  <div className="mt-0.5 bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs text-amber-300 font-bold truncate flex items-center justify-between">
                    <span className="truncate">{currentTag}</span>
                    <button
                      onClick={() => onEditTag(game.id)}
                      className="text-slate-500 hover:text-slate-200 transition ml-1"
                      title="Edit Tag"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons Matching Screenshot */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-bold">
                  <button
                    onClick={() => onEditTag(game.id)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition truncate text-center"
                  >
                    Edit Tag
                  </button>
                  <button
                    onClick={() => setCurrentTab('profile')}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition truncate text-center"
                  >
                    Add to Profile
                  </button>
                  <button
                    onClick={() => onOpenChallengeModal(game.id)}
                    className="col-span-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <Users className="w-3 h-3" />
                    <span>Find Challenger</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gamer Profile & Quick Stats Card (Bottom Left of Screenshot) */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 md:p-5 space-y-4 shadow-2xl">
        {/* User Card Header */}
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <img
              src={user?.profile_photo_url || '/logo.jpg'}
              alt={user?.username || 'GamerXY'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/60 shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-black text-base text-white truncate">
                {user?.display_name || user?.username || 'GamerXY'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 text-[9px] font-bold">
                100%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <span>Profile Completion: <strong className="text-emerald-400">100%</strong></span>
            </div>
            <div className="text-[10px] text-amber-400/90 font-medium flex items-center space-x-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified Competitor Photo</span>
            </div>
          </div>
        </div>

        {/* Game Stats Tabs */}
        <div className="flex space-x-1.5 border-b border-slate-800 pb-2">
          {[
            { id: 'fc27', label: 'FC 27' },
            { id: 'mk', label: 'MK' },
            { id: 'gtav', label: 'GTA V' },
            { id: 'tekken8', label: 'Tekken 8' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeStatTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Table */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Competitive Stats
          </div>
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl divide-y divide-slate-800/80 text-xs">
            {activeStatTab === 'fc27' && (
              <>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 font-semibold flex items-center space-x-2">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>EA SPORTS FC 27</span>
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-emerald-400 font-bold">Wins: 50</span>
                    <span className="text-rose-400 font-bold">Losses: 20</span>
                  </div>
                </div>
                <div className="p-2.5 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Win Rate</span>
                  <span className="text-white font-mono font-bold">71.4%</span>
                </div>
              </>
            )}

            {activeStatTab === 'mk' && (
              <>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 font-semibold flex items-center space-x-2">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>MORTAL KOMBAT</span>
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-emerald-400 font-bold">Wins: 30</span>
                    <span className="text-rose-400 font-bold">Losses: 10</span>
                  </div>
                </div>
                <div className="p-2.5 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Win Rate</span>
                  <span className="text-white font-mono font-bold">75.0%</span>
                </div>
              </>
            )}

            {activeStatTab === 'gtav' && (
              <>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 font-semibold flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>GTAV ONLINE</span>
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-emerald-400 font-bold">Wins: 30</span>
                    <span className="text-rose-400 font-bold">Losses: 10</span>
                  </div>
                </div>
                <div className="p-2.5 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Win Rate</span>
                  <span className="text-white font-mono font-bold">75.0%</span>
                </div>
              </>
            )}

            {activeStatTab === 'tekken8' && (
              <>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 font-semibold flex items-center space-x-2">
                    <Trophy className="w-3.5 h-3.5 text-red-400" />
                    <span>TEKKEN 8</span>
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-emerald-400 font-bold">Wins: 24</span>
                    <span className="text-rose-400 font-bold">Losses: 6</span>
                  </div>
                </div>
                <div className="p-2.5 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Win Rate</span>
                  <span className="text-white font-mono font-bold">80.0%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gamer Tags List */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Connected Console Gamer Tags
          </div>
          <div className="space-y-1.5 text-xs">
            {[
              { game: 'EA FC 27', platform: 'PlayStation', tag: 'GamerXY', color: 'bg-blue-950 text-blue-300 border-blue-600/40' },
              { game: 'Mortal Kombat', platform: 'Xbox', tag: 'AyitiScorpion_X', color: 'bg-emerald-950 text-emerald-300 border-emerald-600/40' },
              { game: 'FC 27 (PC)', platform: 'PC Steam', tag: 'PC_Striker509', color: 'bg-indigo-950 text-indigo-300 border-indigo-600/40' },
              { game: 'Fortnite', platform: 'PlayStation', tag: 'BuildGod_509', color: 'bg-purple-950 text-purple-300 border-purple-600/40' },
              { game: 'Tekken 8', platform: 'PlayStation', tag: 'Jin_PortAuPrince', color: 'bg-red-950 text-red-300 border-red-600/40' },
              { game: 'GTAV Online', platform: 'PlayStation', tag: 'Chief_SpikeLee', color: 'bg-teal-950 text-teal-300 border-teal-600/40' },
            ].map((gt, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium text-[11px]">{gt.game}:</span>
                  <span className="font-mono text-amber-300 text-xs font-bold">{gt.tag}</span>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${gt.color}`}>
                  {gt.platform}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
