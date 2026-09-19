import React, { useState } from 'react';
import { X, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { User, Wallet } from '../../types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  wallet: Wallet | null;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  user,
  wallet,
}) => {
  if (!isOpen) return null;

  const [method, setMethod] = useState<'moncash' | 'natcash'>('moncash');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '509-347-5583');
  const [amount, setAmount] = useState('10.00');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
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
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white">
              MONCASH / NATCASH CASHOUT
            </h3>
            <p className="text-xs text-slate-400">
              Instant Haitian Payout System
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="font-display font-black text-lg text-white">
              Payout Requested!
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              ${amount} USD is being sent to your {method === 'moncash' ? 'MonCash' : 'Natcash'} account ({phoneNumber}).
              Approved by President DJSPIDEED THEKING.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1 uppercase font-tech">
                Select Haitian Gateway
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('moncash')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    method === 'moncash'
                      ? 'bg-rose-950/80 border-rose-500 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Digicel MonCash 🇭🇹
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('natcash')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    method === 'natcash'
                      ? 'bg-blue-950/80 border-blue-500 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Natcom Natcash 🇭🇹
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Account Phone Number (Digicel / Natcom):
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Withdrawal Amount ($ USD):
              </label>
              <input
                type="number"
                step="0.1"
                min="1.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold"
                required
              />
              <div className="text-[10px] text-emerald-400 mt-1">
                Available: ${wallet?.available_balance?.toFixed(2) || '1.90'} USD
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct secure payout to your registered mobile wallet.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold tracking-wide shadow-lg transition"
            >
              CONFIRM CASHOUT (${amount} USD)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
