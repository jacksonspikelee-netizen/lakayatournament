import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Swords, 
  MessageSquare, 
  Trophy, 
  Award, 
  ShieldCheck, 
  ExternalLink, 
  X, 
  Check, 
  Calendar,
  Gamepad2,
  Clock,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/client';
import { User, Game, Platform } from '../types';

export const GamersView: React.FC = () => {
  const { user, requireMembership } = useAuth();
  const { t } = useLanguage();

  const [gamers, setGamers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedGamer, setSelectedGamer] = useState<any | null>(null);
  const [challengeModalGamer, setChallengeModalGamer] = useState<User | null>(null);
  const [challengeGame, setChallengeGame] = useState('game-fc27');
  const [challengePlatform, setChallengePlatform] = useState('plat-ps5');
  const [challengeTime, setChallengeTime] = useState('');
  const [challengeNotes, setChallengeNotes] = useState('');
  const [challengeSubmitting, setChallengeSubmitting] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Message modal state
  const [messageRecipient, setMessageRecipient] = useState<User | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const fetchGamers = () => {
    let url = `/gamers?filter=${activeFilter}`;
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }
    apiRequest<User[]>(url)
      .then(data => setGamers(Array.isArray(data) ? data : []))
      .catch(() => setGamers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGamers();
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    Promise.all([
      apiRequest<Game[]>('/games').catch(() => []),
      apiRequest<Platform[]>('/platforms').catch(() => []),
    ]).then(([gList, pList]) => {
      setGames(Array.isArray(gList) ? gList : []);
      setPlatforms(Array.isArray(pList) ? pList : []);
    }).catch(() => {
      setGames([]);
      setPlatforms([]);
    });
  }, []);

  const handleOpenPublicProfile = async (targetId: string) => {
    try {
      const data = await apiRequest<any>(`/gamers/${targetId}`);
      setSelectedGamer(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeModalGamer) return;
    if (!requireMembership()) return;

    setChallengeSubmitting(true);
    setChallengeMessage(null);

    try {
      await apiRequest('/challenges/create', {
        method: 'POST',
        body: JSON.stringify({
          challenged_id: challengeModalGamer.id,
          game_id: challengeGame,
          platform_id: challengePlatform,
          scheduled_time: challengeTime || new Date().toISOString(),
          notes: challengeNotes,
        }),
      });

      setChallengeMessage({ type: 'success', text: `Challenge successfully sent to ${challengeModalGamer.username}!` });
      setTimeout(() => {
        setChallengeModalGamer(null);
        setChallengeMessage(null);
      }, 2000);
    } catch (err: any) {
      setChallengeMessage({ type: 'error', text: err.message || 'Failed to send challenge.' });
    } finally {
      setChallengeSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageRecipient || !messageContent.trim()) return;

    try {
      await apiRequest('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: messageRecipient.id,
          content: messageContent.trim(),
        }),
      });
      setMessageSent(true);
      setTimeout(() => {
        setMessageRecipient(null);
        setMessageContent('');
        setMessageSent(false);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="gamers-view-container" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-400" />
            <span>Find a Haitian Gamer</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover verified competitors across Haiti & the diaspora. Send challenges and play for verified rewards.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search username, ID..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('online')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1 ${
                activeFilter === 'online' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 bg-emerald-300 rounded-full" />
              <span>Online</span>
            </button>
            <button
              onClick={() => setActiveFilter('offline')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'offline' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Gamers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gamers.map((g) => (
          <div
            key={g.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div
                onClick={() => handleOpenPublicProfile(g.id)}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={g.profile_photo_url || '/logo.jpg'}
                    alt={g.username}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-blue-400 transition"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                      g.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                    {g.display_name || g.username}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">{g.gamer_id}</div>
                  <div className="text-[11px] text-amber-400/90 font-semibold mt-0.5">
                    {g.primary_tag ? `@${g.primary_tag.gamer_tag}` : 'Verified Competitor'}
                  </div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  g.is_online
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {g.is_online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  if (requireMembership()) {
                    setChallengeModalGamer(g);
                  }
                }}
                className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Challenge</span>
              </button>

              <button
                onClick={() => setMessageRecipient(g)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Public Gamer Profile Modal */}
      {selectedGamer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Public Gamer Dossier
              </span>
              <button
                onClick={() => setSelectedGamer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Card */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedGamer.profile_photo_url || '/logo.jpg'}
                  alt={selectedGamer.username}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    {selectedGamer.display_name || selectedGamer.username}
                  </h2>
                  <div className="text-xs font-mono text-slate-400">{selectedGamer.gamer_id}</div>
                  <div className="text-xs text-slate-300 mt-1">{selectedGamer.bio || 'LakayaTOURNAMENT Official Competitor'}</div>
                </div>
              </div>

              {/* Competitive Stats Banner */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">MATCHES</div>
                  <div className="font-display font-bold text-base text-white">{selectedGamer.stats?.total || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">WINS</div>
                  <div className="font-display font-bold text-base text-emerald-400">{selectedGamer.stats?.wins || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">LOSSES</div>
                  <div className="font-display font-bold text-base text-rose-400">{selectedGamer.stats?.losses || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">WIN RATE</div>
                  <div className="font-display font-bold text-base text-amber-400">{selectedGamer.stats?.win_rate || 0}%</div>
                </div>
              </div>

              {/* Registered Gamer Tags */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Registered Gamer Tags</div>
                <div className="space-y-1.5">
                  {selectedGamer.gamer_tags?.map((gt: any) => (
                    <div key={gt.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-400">{gt.game_name} ({gt.platform_name}):</span>
                      <span className="font-mono font-bold text-amber-300">@{gt.gamer_tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medals */}
              {selectedGamer.medals?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Earned Medals</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedGamer.medals.map((m: any) => (
                      <span key={m.id} className="px-3 py-1 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-bold flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>{m.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedGamer(null);
                  setChallengeModalGamer(selectedGamer);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Send Challenge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge To Play Modal */}
      {challengeModalGamer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Swords className="w-6 h-6 text-rose-500" />
                <h3 className="font-display font-bold text-lg text-white">
                  Challenge {challengeModalGamer.username}
                </h3>
              </div>
              <button
                onClick={() => setChallengeModalGamer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSendChallenge} className="p-6 space-y-4">
              {challengeMessage && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    challengeMessage.type === 'success'
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-rose-950 border border-rose-500 text-rose-300'
                  }`}
                >
                  {challengeMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Game</label>
                <select
                  value={challengeGame}
                  onChange={(e) => setChallengeGame(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Platform</label>
                <select
                  value={challengePlatform}
                  onChange={(e) => setChallengePlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Match Notes (Rules, etc.)</label>
                <input
                  type="text"
                  value={challengeNotes}
                  onChange={(e) => setChallengeNotes(e.target.value)}
                  placeholder="Standard competitive rules, 6 min halves"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-[11px] text-amber-300">
                ⭐ Winner receives a verified $10 USD reward credited to their LakayaTOURNAMENT wallet!
              </div>

              <button
                type="submit"
                disabled={challengeSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {challengeSubmitting ? 'Sending...' : 'Confirm & Dispatch Challenge'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                Direct Message to {messageRecipient.username}
              </h3>
              <button onClick={() => setMessageRecipient(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {messageSent ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs rounded-xl text-center">
                Message Sent Successfully!
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={4}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
