import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { User } from '../../types';

interface DisputeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const DisputeReportModal: React.FC<DisputeReportModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) return null;

  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [description, setDescription] = useState('My opponent disconnected in the 85th minute while I was leading 2-1. Attached is the console screenshot proof.');
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
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white">
              REFEREE DISPUTE REVIEW
            </h3>
            <p className="text-xs text-slate-400">
              Match Conflict Resolution • ID #193299
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="font-display font-black text-lg text-white">
              Evidence Sent to Referee!
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              President DJSPIDEED THEKING and the referee board will review console logs and award the $10 reward accordingly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Screenshot / Video Proof Link (URL):
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://imgur.com/... or cloud link"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Explanation / Match Details:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official review turnaround time is under 15 minutes.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold tracking-wide shadow-lg transition"
            >
              SUBMIT EVIDENCE TO REFEREE
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
