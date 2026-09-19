import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Calendar, 
  DollarSign, 
  Crown, 
  Medal, 
  Award, 
  Check, 
  Clock, 
  ChevronRight, 
  X, 
  CreditCard,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/client';
import { Tournament, TournamentPlayer, TournamentMatch } from '../types';

export const TournamentsView: React.FC = () => {
  const { user, requireMembership } = useAuth();
  const { t } = useLanguage();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournamentDetail, setTournamentDetail] = useState<{
    tournament: Tournament;
    players: TournamentPlayer[];
    matches: TournamentMatch[];
  } | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = () => {
    apiRequest<Tournament[]>('/tournaments')
      .then(data => setTournaments(Array.isArray(data) ? data : []))
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleOpenDetail = async (tourn: Tournament) => {
    setSelectedTournament(tourn);
    setJoinSuccess(null);
    setJoinError(null);
    try {
      const data = await apiRequest<any>(`/tournaments/${tourn.id}`);
      setTournamentDetail({
        tournament: data,
        players: data.players || [],
        matches: data.matches || [],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinTournament = async () => {
    if (!selectedTournament) return;
    if (!requireMembership()) return;

    setJoining(true);
    setJoinError(null);
    try {
      const res = await apiRequest<{ success: boolean; message: string; slot: number }>(
        `/tournaments/${selectedTournament.id}/join`,
        { method: 'POST' }
      );
      setJoinSuccess(`Registered successfully! Your slot: #${res.slot}`);
      fetchTournaments();
      // Reload details
      handleOpenDetail(selectedTournament);
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join tournament.');
    } finally {
      setJoining(false);
    }
  };

  const isUserRegistered = tournamentDetail?.players.some(p => p.user_id === user?.id);

  return (
    <div id="tournaments-view" className="space-y-8 pb-16">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <span>Official Haitian Esports Tournaments</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Compete in verified 12-player tournament brackets. Win $100 cash prizes, medals & official certificates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>1st: $100 Cash + Medal + Certificate</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center space-x-2">
            <Medal className="w-4 h-4 text-purple-400" />
            <span>2nd & 3rd: $10 Credit + Medal</span>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map((trn) => {
          const isFull = trn.current_players >= trn.max_players;
          return (
            <div
              key={trn.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
            >
              {/* Card Banner */}
              <div className="relative h-44 w-full bg-slate-950">
                <img
                  src={trn.banner_url || '/hero_banner.jpg'}
                  alt={trn.name}
                  className="w-full h-full object-cover opacity-65"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex space-x-2">
                  <span className="px-2.5 py-1 bg-blue-950/80 backdrop-blur-md border border-blue-500/50 text-blue-300 text-xs font-bold rounded-lg uppercase">
                    {trn.game_name}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-bold rounded-lg uppercase">
                    {trn.platform_name}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  {trn.status === 'in_progress' ? (
                    <span className="px-3 py-1 bg-amber-950/90 border border-amber-500 text-amber-300 text-xs font-bold rounded-lg animate-pulse">
                      IN PROGRESS
                    </span>
                  ) : isFull ? (
                    <span className="px-3 py-1 bg-rose-950/90 border border-rose-500 text-rose-300 text-xs font-bold rounded-lg">
                      BRACKET FULL (12/12)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold rounded-lg">
                      OPEN REGISTRATION
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <h3 className="font-display font-black text-lg md:text-xl text-white drop-shadow-md">
                    {trn.name}
                  </h3>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Prize Pool</div>
                    <div className="font-display font-black text-xl text-amber-400">
                      ${trn.prize_pool} USD
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-400 line-clamp-2">
                  {trn.rules || '12-Player Single Elimination Haitian Esports Tournament.'}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Registered Players:</span>
                    <span className="text-amber-400 font-tech text-sm">
                      {trn.current_players} / {trn.max_players} Gamers
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (trn.current_players / trn.max_players) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="bg-slate-950/60 p-2 rounded-lg text-slate-300">
                    <span className="text-slate-500 block text-[10px]">ENTRY FEE</span>
                    <span className="font-bold text-white">${trn.entry_fee} USD</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg text-slate-300">
                    <span className="text-slate-500 block text-[10px]">FORMAT</span>
                    <span className="font-bold text-white">12-Player Bracket</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleOpenDetail(trn)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-display font-bold text-xs tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <span>View Bracket & Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tournament Detail & 12-Player Bracket Modal */}
      {selectedTournament && tournamentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-white">
                    {tournamentDetail.tournament.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {tournamentDetail.tournament.game_name} • {tournamentDetail.tournament.platform_name} • ${tournamentDetail.tournament.prize_pool} USD Prize
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTournament(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {joinSuccess && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{joinSuccess}</span>
                </div>
              )}
              {joinError && (
                <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              {/* Registration Action Bar */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Registration Status:</div>
                  <div className="font-display font-bold text-white text-base">
                    {tournamentDetail.players.length} of {tournamentDetail.tournament.max_players} Slots Filled
                  </div>
                </div>

                {isUserRegistered ? (
                  <div className="px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-xs rounded-xl flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>YOU ARE REGISTERED IN THIS TOURNAMENT</span>
                  </div>
                ) : tournamentDetail.tournament.current_players >= tournamentDetail.tournament.max_players ? (
                  <div className="px-4 py-2 bg-rose-950 border border-rose-500 text-rose-300 font-bold text-xs rounded-xl">
                    TOURNAMENT IS FULL (12/12)
                  </div>
                ) : (
                  <button
                    onClick={handleJoinTournament}
                    disabled={joining}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-display font-bold text-xs tracking-wider rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{joining ? 'Processing...' : `Pay Entry Fee ($${tournamentDetail.tournament.entry_fee}) & Join`}</span>
                  </button>
                )}
              </div>

              {/* 12-Player Bracket Visualizer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-white tracking-wider uppercase flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>12-Player Tournament Bracket</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Single Elimination Tree</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
                  <div className="min-w-[700px] grid grid-cols-4 gap-4">
                    {/* Round 1 */}
                    <div className="space-y-3">
                      <div className="text-center text-xs font-bold text-slate-400 py-1 border-b border-slate-800">
                        ROUND 1
                      </div>
                      {[1, 2, 3, 4, 5, 6].map((mNum) => {
                        const m = tournamentDetail.matches.find(tm => tm.round === 1 && tm.match_number === mNum);
                        return (
                          <div key={mNum} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs space-y-1">
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="truncate max-w-[90px]">{m?.player1?.username || `Seed ${mNum * 2 - 1}`}</span>
                              <span className="font-mono font-bold text-white">{m?.player1_score ?? '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="truncate max-w-[90px]">{m?.player2?.username || `Seed ${mNum * 2}`}</span>
                              <span className="font-mono font-bold text-white">{m?.player2_score ?? '-'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quarterfinals */}
                    <div className="space-y-3">
                      <div className="text-center text-xs font-bold text-blue-400 py-1 border-b border-slate-800">
                        QUARTERFINALS
                      </div>
                      {[1, 2, 3].map((mNum) => {
                        const m = tournamentDetail.matches.find(tm => tm.round === 2 && tm.match_number === mNum);
                        return (
                          <div key={mNum} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs space-y-1 my-4">
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="truncate max-w-[90px]">{m?.player1?.username || 'QF Winner'}</span>
                              <span className="font-mono font-bold text-white">{m?.player1_score ?? '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="truncate max-w-[90px]">{m?.player2?.username || 'QF Winner'}</span>
                              <span className="font-mono font-bold text-white">{m?.player2_score ?? '-'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Semifinals */}
                    <div className="space-y-3">
                      <div className="text-center text-xs font-bold text-indigo-400 py-1 border-b border-slate-800">
                        SEMIFINALS
                      </div>
                      {[1, 2].map((mNum) => {
                        const m = tournamentDetail.matches.find(tm => tm.round === 3 && tm.match_number === mNum);
                        return (
                          <div key={mNum} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs space-y-1 my-8">
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="truncate max-w-[90px]">{m?.player1?.username || 'Semi Finalist'}</span>
                              <span className="font-mono font-bold text-white">{m?.player1_score ?? '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="truncate max-w-[90px]">{m?.player2?.username || 'Semi Finalist'}</span>
                              <span className="font-mono font-bold text-white">{m?.player2_score ?? '-'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Finals & 3rd Place */}
                    <div className="space-y-3">
                      <div className="text-center text-xs font-bold text-amber-400 py-1 border-b border-slate-800">
                        GRAND FINAL 👑
                      </div>
                      {(() => {
                        const finalMatch = tournamentDetail.matches.find(tm => tm.round === 4);
                        const thirdMatch = tournamentDetail.matches.find(tm => tm.round === 5);
                        return (
                          <div className="space-y-6">
                            <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-3 text-xs space-y-2 shadow-lg shadow-amber-950/30">
                              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                1st Place Match ($100 Prize)
                              </div>
                              <div className="flex justify-between items-center text-white font-bold">
                                <span>{finalMatch?.player1?.username || 'DJSPIDEED THEKING'}</span>
                                <span className="font-mono text-amber-300 text-sm">{finalMatch?.player1_score ?? 2}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-300">
                                <span>{finalMatch?.player2?.username || 'DelmasStriker'}</span>
                                <span className="font-mono text-white text-sm">{finalMatch?.player2_score ?? 1}</span>
                              </div>
                            </div>

                            <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3 text-xs space-y-2">
                              <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                                3rd Place Match ($10 Credit)
                              </div>
                              <div className="flex justify-between items-center text-slate-200">
                                <span>{thirdMatch?.player1?.username || 'JacmelBlaster'}</span>
                                <span className="font-mono text-purple-300">{thirdMatch?.player1_score ?? 3}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-300">
                                <span>{thirdMatch?.player2?.username || 'SniperHT_509'}</span>
                                <span className="font-mono text-slate-400">{thirdMatch?.player2_score ?? 2}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Players List */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-sm text-white tracking-wider uppercase">
                  Registered Competitors ({tournamentDetail.players.length}/12)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {tournamentDetail.players.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2.5"
                    >
                      <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 text-[11px] font-bold flex items-center justify-center">
                        #{p.slot_number}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-xs text-white truncate">{p.user?.username || 'Competitor'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.gamer_tag}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
