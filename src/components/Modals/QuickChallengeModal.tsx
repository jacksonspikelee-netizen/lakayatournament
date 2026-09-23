import React, { useState } from 'react';
import { X, Swords, Trophy, Gamepad2, ShieldCheck, Flame } from 'lucide-react';
import { OFFICIAL_GAMES } from '../../data/gamesData';
import { User } from '../../types';

interface QuickChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGameId: string | null;
  user: User | null;
}

export const QuickChallengeModal: React.FC<QuickChallengeModalProps> = ({
  isOpen,
  onClose,
  selectedGameId,
  user,
}) => {
  if (!isOpen) return null;

  const game = OFFICIAL_GAMES.find((g) => g.id === selectedGameId) || OFFICIAL_GAMES[0];
  const [platform, setPlatform] = useState<'PS5' | 'Xbox' | 'PC'>('PS5');
  const [challengeType, setChallengeType] = useState<'fun' | 'compete'>('compete');
  const [targetGamer, setTargetGamer] = useState('Djspideed (Founder / Admin)');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white">
              FIND CHALLENGER / MATCHMAKING
            </h3>
            <p className="text-xs text-slate-400">
              Game: <strong className="text-amber-400">{game.name}</strong>
            </p>
          </div>
        </div>

        {/* Game Cover Preview */}
        <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-lg">
          <img
            src={game.coverImage}
            alt={game.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
            <span className="font-display font-black text-sm text-white drop-shadow tracking-wide">
              {game.name}
            </span>
            <span className="text-[10px] font-tech text-amber-300 font-bold bg-black/70 px-2.5 py-0.5 rounded-lg border border-amber-500/30 backdrop-blur">
              {game.genre}
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="font-display font-black text-lg text-white">
              Challenge Broadcasted!
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your challenge has been sent to Haitian competitors. You will receive an in-app notification when accepted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1 uppercase font-tech">
                Select Console / Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {game.platforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${
                      platform === p
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 uppercase font-tech">
                Match Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChallengeType('fun')}
                  className={`p-3 rounded-xl border text-left transition ${
                    challengeType === 'fun'
                      ? 'bg-blue-950/80 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm">PLAY FOR FUN</div>
                  <div className="text-[10px] text-slate-400">Casual friendly match (Free)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setChallengeType('compete')}
                  className={`p-3 rounded-xl border text-left transition ${
                    challengeType === 'compete'
                      ? 'bg-amber-950/80 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm text-amber-300">COMPETE ($10 BOUNTY)</div>
                  <div className="text-[10px] text-slate-400">Winner receives $10 MonCash</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 uppercase font-tech">
                Target Opponent (Optional)
              </label>
              <select
                value={targetGamer}
                onChange={(e) => setTargetGamer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="Anyone (Public Matchmaking Pool)">Anyone (Public Matchmaking Pool)</option>
                <option value="Djspideed (Founder / Admin)">Djspideed (Founder / Admin 🇭🇹)</option>
                <option value="HaitiKiller_509 (Rank #1)">HaitiKiller_509 (Rank #1)</option>
                <option value="ApexQueen_HT (Rank #2)">ApexQueen_HT (Rank #2)</option>
                <option value="TekkenT (Rank #3)">TekkenT (Rank #3)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:opacity-90 text-white font-bold tracking-wider shadow-lg transition"
            >
              BROADCAST CHALLENGE NOW
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
