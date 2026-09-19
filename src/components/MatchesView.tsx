import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  Calendar, 
  DollarSign, 
  X, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/client';
import { Match } from '../types';

export const MatchesView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Result Modal
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [reportedWinner, setReportedWinner] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'conflict' | 'error'; text: string } | null>(null);

  // Reschedule Modal
  const [rescheduleMatch, setRescheduleMatch] = useState<Match | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  const fetchMatches = () => {
    apiRequest<Match[]>('/matches')
      .then(data => setMatches(Array.isArray(data) ? data : []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleOpenSubmitModal = (m: Match) => {
    setSelectedMatch(m);
    setMyScore(0);
    setOppScore(0);
    setReportedWinner(user?.id || '');
    setEvidenceUrl('');
    setSubmitMessage(null);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await apiRequest<{ message: string; status: string }>(
        `/matches/${selectedMatch.id}/submit-result`,
        {
          method: 'POST',
          body: JSON.stringify({
            my_score: myScore,
            opponent_score: oppScore,
            reported_winner: reportedWinner,
            evidence_url: evidenceUrl,
          }),
        }
      );

      if (res.status === 'verified') {
        setSubmitMessage({ type: 'success', text: 'Result agreed by both competitors! $10 reward credited to the winner.' });
      } else if (res.status === 'result_conflict') {
        setSubmitMessage({ type: 'conflict', text: 'Result conflict detected! Discrepancy sent to Admin for investigation.' });
      } else {
        setSubmitMessage({ type: 'success', text: 'Result submitted. Awaiting opponent confirmation.' });
      }

      fetchMatches();
      setTimeout(() => {
        if (res.status !== 'result_conflict') {
          setSelectedMatch(null);
        }
      }, 2500);
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="matches-view-container" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide flex items-center space-x-3">
            <Swords className="w-8 h-8 text-cyan-400" />
            <span>Competitive Match Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Submit match scores, upload victory evidence, and claim $10 verified match rewards.
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>$10 USD Verified Match Reward Pool</span>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {!Array.isArray(matches) || matches.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Swords className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-display font-bold text-lg text-white">No Matches Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't scheduled or played any competitive matches yet. Go to "Find a Gamer" to issue your first challenge!
            </p>
          </div>
        ) : (
          matches.map((m) => {
            const isPlayer1 = m.player1_id === user?.id;
            const myTag = isPlayer1 ? m.player1_tag : m.player2_tag;
            const oppTag = isPlayer1 ? m.player2_tag : m.player1_tag;
            const oppUsername = isPlayer1 ? (m as any).player2_username : (m as any).player1_username;

            return (
              <div
                key={m.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl"
              >
                {/* Match Information */}
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900/30 to-rose-900/30 border border-slate-700 flex items-center justify-center shrink-0">
                    <Swords className="w-7 h-7 text-white" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded">
                        {(m as any).game_name || 'FC 27'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded">
                        {(m as any).platform_name || 'PlayStation'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">#{m.id.substring(0, 8)}</span>
                    </div>

                    <div className="font-display font-bold text-base text-white">
                      You (<span className="text-amber-400 font-mono">@{myTag}</span>) vs{' '}
                      {oppUsername} (<span className="text-blue-400 font-mono">@{oppTag}</span>)
                    </div>

                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(m.scheduled_time).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Score & Status Display */}
                <div className="flex flex-wrap items-center gap-4">
                  {m.status === 'verified' ? (
                    <div className="text-right">
                      <div className="font-display font-black text-2xl text-white">
                        {m.player1_score} - {m.player2_score}
                      </div>
                      <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED • $10 REWARD PAID</span>
                      </div>
                    </div>
                  ) : m.status === 'result_conflict' ? (
                    <div className="text-right">
                      <div className="px-3 py-1 bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-bold rounded-xl flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>RESULT CONFLICT (ADMIN REVIEW)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">Scores differ. Awaiting admin resolution.</div>
                    </div>
                  ) : m.status === 'result_submitted' ? (
                    <div className="text-right">
                      <div className="px-3 py-1 bg-amber-950/80 border border-amber-500 text-amber-300 text-xs font-bold rounded-xl flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>RESULT SUBMITTED</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">Waiting for opponent to confirm.</div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenSubmitModal(m)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Submit Result
                      </button>
                      <button
                        onClick={() => setRescheduleMatch(m)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                      >
                        I Can't Play
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Result Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Submit Match Result
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitResult} className="p-6 space-y-4">
              {submitMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                    submitMessage.type === 'success'
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : submitMessage.type === 'conflict'
                      ? 'bg-rose-950 border border-rose-500 text-rose-300'
                      : 'bg-amber-950 border border-amber-500 text-amber-300'
                  }`}
                >
                  <span>{submitMessage.text}</span>
                </div>
              )}

              {/* Score Inputs */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Your Final Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    required
                    value={myScore}
                    onChange={(e) => setMyScore(parseInt(e.target.value) || 0)}
                    className="w-20 mx-auto text-center font-display font-black text-3xl bg-slate-900 border border-slate-700 rounded-xl py-2 text-white"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Opponent's Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    required
                    value={oppScore}
                    onChange={(e) => setOppScore(parseInt(e.target.value) || 0)}
                    className="w-20 mx-auto text-center font-display font-black text-3xl bg-slate-900 border border-slate-700 rounded-xl py-2 text-white"
                  />
                </div>
              </div>

              {/* Winner Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reported Winner
                </label>
                <select
                  value={reportedWinner}
                  onChange={(e) => setReportedWinner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={user?.id}>I Won (Claim $10 Reward)</option>
                  <option value={selectedMatch.player1_id === user?.id ? selectedMatch.player2_id : selectedMatch.player1_id}>
                    Opponent Won
                  </option>
                </select>
              </div>

              {/* Evidence URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Evidence Screenshot / Video URL (Optional)
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://imgur.com/screenshot.jpg"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Useful if opponent disputes the final result.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {submitting ? 'Submitting Result...' : 'Verify & Submit Result'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                Request Match Reschedule ("I Can't Play")
              </h3>
              <button onClick={() => setRescheduleMatch(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs rounded-xl text-center">
                Reschedule request sent to your opponent!
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Notify your opponent that you need to postpone or choose another scheduled time.
                </p>
                <textarea
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Reason: Network latency issue in Port-au-Prince, request 1 hour postponement..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
                <button
                  onClick={() => {
                    setRescheduleSuccess(true);
                    setTimeout(() => {
                      setRescheduleMatch(null);
                      setRescheduleSuccess(false);
                      setRescheduleReason('');
                    }, 1500);
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Send Reschedule Notice
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
