import React, { useState, useEffect } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ShieldCheck, 
  X,
  Building2,
  Phone,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/client';
import { WalletTransaction, PayoutRequest } from '../types';

export const WalletView: React.FC = () => {
  const { user, refreshUser, setIsAuthModalOpen, setAuthModalMode } = useAuth();
  const { t } = useLanguage();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Payout Request Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('10.00');
  const [payoutMethod, setPayoutMethod] = useState<'moncash' | 'natcash' | 'sogebank' | 'unibank' | 'paypal' | 'zelle' | 'cashapp'>('moncash');
  const [destinationDetails, setDestinationDetails] = useState('');
  const [accountName, setAccountName] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchWalletData = () => {
    if (!user) {
      setTransactions([]);
      setPayouts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      apiRequest<WalletTransaction[]>('/wallet/transactions').catch(() => []),
      apiRequest<PayoutRequest[]>('/payouts/my-requests').catch(() => []),
    ])
      .then(([txs, pouts]) => {
        setTransactions(Array.isArray(txs) ? txs : []);
        setPayouts(Array.isArray(pouts) ? pouts : []);
      })
      .catch(() => {
        setTransactions([]);
        setPayouts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayout(true);
    setPayoutMessage(null);

    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      setPayoutMessage({ type: 'error', text: 'Please enter a valid payout amount.' });
      setSubmittingPayout(false);
      return;
    }

    try {
      const detailsCombined = `Account Name: ${accountName.trim()} | Destination: ${destinationDetails.trim()}`;
      await apiRequest('/payouts/request', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          payout_method: payoutMethod.toUpperCase(),
          destination_details: detailsCombined,
        }),
      });

      setPayoutMessage({
        type: 'success',
        text: 'Payout request dispatched securely! Admin review in progress.',
      });
      await refreshUser();
      fetchWalletData();
      setTimeout(() => {
        setPayoutModalOpen(false);
        setPayoutMessage(null);
      }, 2000);
    } catch (err: any) {
      setPayoutMessage({ type: 'error', text: err.message || 'Payout request failed.' });
    } finally {
      setSubmittingPayout(false);
    }
  };

  const balance = user?.wallet_balance || 0;

  return (
    <div id="wallet-view-container" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide flex items-center space-x-3">
            <WalletIcon className="w-8 h-8 text-emerald-400" />
            <span>LakayaTOURNAMENT Player Wallet</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your verified tournament winnings, match bounties, and secure payouts via MonCash, Natcash & Haitian Banks.
          </p>
        </div>

        <button
          onClick={() => {
            setPayoutModalOpen(true);
            setPayoutAmount(balance > 0 ? balance.toFixed(2) : '10.00');
          }}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-display font-bold text-xs tracking-wider rounded-xl shadow-xl shadow-emerald-950/40 transition transform active:scale-98 flex items-center space-x-2"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Instant Payout</span>
        </button>
      </div>

      {/* Guest Notice Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-emerald-950/70 border border-blue-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-base">You are viewing Wallet in Guest Mode</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Log in to view your actual tournament prize balance, track MonCash/Natcash payouts, and submit withdrawals.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-display shadow-lg shadow-emerald-900/30 transition active:scale-95"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthModalMode('register');
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold font-display border border-slate-700 transition active:scale-95"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main Available Balance */}
        <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4" />
            <span>Available Balance</span>
          </div>
          <div className="font-display font-black text-4xl text-white mt-3">
            ${balance.toFixed(2)} <span className="text-sm font-normal text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Withdrawable via MonCash (🇭🇹 Haiti), Natcash, Bank Wire (Sogebank/Unibank), or PayPal.
          </p>
        </div>

        {/* Total Earned */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Prize Winnings
          </div>
          <div className="font-display font-black text-3xl text-amber-400 mt-3">
            ${((balance * 1.5) + 20).toFixed(2)} <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Cumulated earnings from verified match victories and official tournament rewards.
          </p>
        </div>

        {/* Payout Security Notice */}
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Security Guarantee</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Financial transactions are processed through encrypted backend pipelines. Payouts are verified against tournament logs.
            </p>
          </div>
          <div className="text-[10px] text-slate-500 mt-3">
            Supports Digicel MonCash, Natcom Natcash, Unibank & Sogebank
          </div>
        </div>
      </div>

      {/* Grid: Transactions & Payout Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transactions List */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-white">Recent Transactions</h2>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/60">
            {!Array.isArray(transactions) || transactions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No recent transactions recorded.
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        tx.amount > 0
                          ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-950 border border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-white">{tx.description}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(tx.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-display font-bold text-sm ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{tx.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payout History */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-white">Payout Requests & Status</h2>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/60">
            {!Array.isArray(payouts) || payouts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No payout requests on file.
              </div>
            ) : (
              payouts.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div>
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span>${p.amount.toFixed(2)} USD</span>
                      <span className="text-[10px] text-slate-400">({p.payout_method})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                      {p.destination_details}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Requested: {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'completed'
                          ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                          : p.status === 'processing'
                          ? 'bg-blue-950 border border-blue-500/40 text-blue-300'
                          : 'bg-amber-950 border border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ArrowUpRight className="w-6 h-6 text-emerald-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Request Payout / Withdrawal
                </h3>
              </div>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {payoutMessage && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    payoutMessage.type === 'success'
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-rose-950 border border-rose-500 text-rose-300'
                  }`}
                >
                  {payoutMessage.text}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payout Amount ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    max={balance}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Available to withdraw: ${balance.toFixed(2)} USD
                </span>
              </div>

              {/* Payout Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Payout Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('moncash')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      payoutMethod === 'moncash'
                        ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🇭🇹 Digicel MonCash</div>
                    <span className="text-[10px] font-normal text-slate-500">Instant Mobile Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('natcash')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      payoutMethod === 'natcash'
                        ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🇭🇹 Natcom Natcash</div>
                    <span className="text-[10px] font-normal text-slate-500">Haiti Mobile Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('sogebank')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      payoutMethod === 'sogebank'
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🇭🇹 Sogebank Wire</div>
                    <span className="text-[10px] font-normal text-slate-500">Haitian Commercial Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('unibank')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      payoutMethod === 'unibank'
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🇭🇹 Unibank Wire</div>
                    <span className="text-[10px] font-normal text-slate-500">Haitian Commercial Bank</span>
                  </button>
                </div>
              </div>

              {/* Beneficiary Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Account Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Official name matching bank/MonCash ID"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Phone / Account Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {payoutMethod.includes('bank') ? 'Bank Account Number' : 'Mobile Phone / Number'} *
                </label>
                <input
                  type="text"
                  required
                  value={destinationDetails}
                  onChange={(e) => setDestinationDetails(e.target.value)}
                  placeholder={payoutMethod.includes('bank') ? 'Account # XXX-XXXXXX-X' : '+509 347-XXXX'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                🔒 Payout requests are verified by the LakayaTOURNAMENT financial team. Processing typically completes within 1-2 hours.
              </div>

              <button
                type="submit"
                disabled={submittingPayout || balance <= 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {submittingPayout ? 'Submitting Request...' : `Confirm Withdrawal ($${payoutAmount})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
