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
  Send,
  Mail,
  Receipt,
  Eye,
  Check
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
  const [emailReceipts, setEmailReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Deposit Modal State
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('15.00');
  const [depositMethod, setDepositMethod] = useState<'moncash' | 'natcash' | 'sogebank' | 'unibank'>('moncash');
  const [depositPhone, setDepositPhone] = useState('+509 ');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [depositMessage, setDepositMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setEmailReceipts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      apiRequest<WalletTransaction[]>('/wallet/transactions').catch(() => []),
      apiRequest<PayoutRequest[]>('/payouts/my-requests').catch(() => []),
      apiRequest<any[]>('/user/email-receipts').catch(() => []),
    ])
      .then(([txs, pouts, emails]) => {
        setTransactions(Array.isArray(txs) ? txs : []);
        setPayouts(Array.isArray(pouts) ? pouts : []);
        setEmailReceipts(Array.isArray(emails) ? emails : []);
      })
      .catch(() => {
        setTransactions([]);
        setPayouts([]);
        setEmailReceipts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDeposit(true);
    setDepositMessage(null);

    const amountNum = parseFloat(depositAmount);
    if (!amountNum || amountNum <= 0) {
      setDepositMessage({ type: 'error', text: 'Please enter a valid deposit amount.' });
      setSubmittingDeposit(false);
      return;
    }

    try {
      const res = await apiRequest<any>('/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          payment_method: depositMethod,
          phone_number: depositPhone,
        }),
      });

      setDepositMessage({
        type: 'success',
        text: res.message || `Payment verified! Receipt emailed to ${user?.email}`,
      });
      await refreshUser();
      fetchWalletData();
      setTimeout(() => {
        setDepositModalOpen(false);
        setDepositMessage(null);
      }, 2500);
    } catch (err: any) {
      setDepositMessage({ type: 'error', text: err.message || 'Deposit payment failed.' });
    } finally {
      setSubmittingDeposit(false);
    }
  };

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
      const res = await apiRequest<any>('/payouts/request', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          payout_method: payoutMethod.toUpperCase(),
          destination_details: detailsCombined,
        }),
      });

      setPayoutMessage({
        type: 'success',
        text: res.message || `Cash-out requested! Funds deducted and confirmation email sent to ${user?.email}.`,
      });
      await refreshUser();
      fetchWalletData();
      setTimeout(() => {
        setPayoutModalOpen(false);
        setPayoutMessage(null);
      }, 2500);
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
            Manage tournament winnings, pay entry fees, deposit funds, and receive instant transactional email receipts for all cash-outs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (!user) {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
                return;
              }
              setDepositModalOpen(true);
            }}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-display font-bold text-xs tracking-wider rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit / Peye Lajan</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
                return;
              }
              setPayoutModalOpen(true);
              setPayoutAmount(balance > 0 ? balance.toFixed(2) : '10.00');
            }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-display font-bold text-xs tracking-wider rounded-xl shadow-xl shadow-emerald-950/40 transition transform active:scale-98 flex items-center space-x-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Request Cash Out</span>
          </button>
        </div>
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
                Log in to view your prize balance, receive email receipts when you pay or cash out, and manage MonCash/Natcash withdrawals.
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

        {/* Email Notification & Security Guarantee */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Email Transaction Alerts</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Whenever you pay or cash out funds, the system immediately dispatches an official email receipt directly to your registered inbox ({user?.email || 'your email'}).
            </p>
          </div>
          <div className="text-[10px] text-emerald-400 font-bold mt-3 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Transaction Receipts Enforced</span>
          </div>
        </div>

        {/* Payout Security Notice */}
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Security & Payout Pipeline</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Financial operations are logged and audited with unique transaction IDs. Payouts are protected with multi-step commissioner review.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 mt-3">
            Supports Digicel MonCash, Natcom Natcash, Unibank & Sogebank
          </div>
        </div>
      </div>

      {/* Dispatched Email Receipts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Dispatched Transaction Email Receipts</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every time you pay or cash out, an official email notice is generated and stored here with full cryptographic audit details.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {emailReceipts.length} {emailReceipts.length === 1 ? 'Receipt' : 'Receipts'} Sent
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/60">
          {!user ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Please sign in to view your transaction email history.
            </div>
          ) : emailReceipts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Mail className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-white">No Email Receipts Yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When you make a deposit, pay for a membership, join a paid tournament, or submit a cash out, your official email receipt will appear here.
              </p>
            </div>
          ) : (
            emailReceipts.map((em) => (
              <div key={em.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span>{em.subject}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {em.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Sent to: <span className="text-sky-300 font-medium">{em.recipient_email}</span>
                      {em.reference_id && <span className="ml-2 font-mono text-slate-500">Ref: {em.reference_id}</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(em.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {em.amount !== null && em.amount !== undefined && (
                    <div className={`font-display font-bold text-sm ${em.type.includes('requested') || em.type.includes('fee') ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {em.type.includes('requested') || em.type.includes('fee') ? `-$${Number(em.amount).toFixed(2)}` : `+$${Number(em.amount).toFixed(2)}`}
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedReceipt(em)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>View Email</span>
                  </button>
                </div>
              </div>
            ))
          )}
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
                        p.status === 'completed' || p.status === 'paid'
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

      {/* Deposit Funds Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setDepositModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-xl text-white flex items-center space-x-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              <span>Deposit Funds / Peye Lajan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add funds to your player wallet for tournament entries, match bounties, and membership. An instant email receipt will be sent to your email.
            </p>

            {depositMessage && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                  depositMessage.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-500 text-rose-300'
                }`}
              >
                {depositMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{depositMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleDeposit} className="mt-5 space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deposit Amount (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Deposit Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositMethod('moncash')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      depositMethod === 'moncash'
                        ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🇭🇹 Digicel MonCash</div>
                    <span className="text-[10px] font-normal text-slate-500">Fast Mobile Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('natcash')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      depositMethod === 'natcash'
                        ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🇭🇹 Natcom Natcash</div>
                    <span className="text-[10px] font-normal text-slate-500">Mobile Money Haiti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('sogebank')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      depositMethod === 'sogebank'
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🇭🇹 Sogebank / SPIH</div>
                    <span className="text-[10px] font-normal text-slate-500">Haitian Bank Deposit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('unibank')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      depositMethod === 'unibank'
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🇭🇹 Unibank / SPIH</div>
                    <span className="text-[10px] font-normal text-slate-500">Haitian Bank Deposit</span>
                  </button>
                </div>
              </div>

              {/* Phone or Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sender Phone / Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  placeholder="+509 347-XXXX"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start space-x-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  An official transaction receipt confirming your deposit will be sent immediately to <strong>{user?.email}</strong>.
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingDeposit}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {submittingDeposit ? 'Processing Deposit...' : `Pay & Confirm Deposit ($${depositAmount})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPayoutModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-xl text-white flex items-center space-x-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              <span>Cash Out / Request Withdrawal</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Withdraw your verified match rewards and tournament prize money.
            </p>

            {payoutMessage && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                  payoutMessage.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-500 text-rose-300'
                }`}
              >
                {payoutMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{payoutMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="mt-5 space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Withdrawal Amount (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
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

              {/* Strong Email Notice */}
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-[11px] text-amber-200 flex items-start space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Immediate Email Confirmation:</strong> An official withdrawal receipt will be sent to <strong>{user?.email}</strong> informing you that the money was taken out of your wallet.
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingPayout || balance <= 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {submittingPayout ? 'Submitting Request...' : `Confirm Cash Out ($${payoutAmount})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Email Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-display font-bold text-sm text-white">{selectedReceipt.subject}</h3>
                  <div className="text-[10px] text-slate-400">Recipient: {selectedReceipt.recipient_email}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1 space-y-4">
              <div 
                className="rounded-2xl overflow-hidden border border-slate-800"
                dangerouslySetInnerHTML={{ __html: selectedReceipt.body_html }}
              />
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Status: <strong className="text-emerald-400 uppercase">{selectedReceipt.status}</strong></span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
