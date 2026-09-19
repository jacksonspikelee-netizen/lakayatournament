import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, Sparkles, AlertCircle, CreditCard, Tag, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiRequest } from '../../api/client';
import { MembershipCredit } from '../../types';

export const MembershipModal: React.FC = () => {
  const { user, isMembershipModalOpen, setIsMembershipModalOpen, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<{
    code: string;
    discount_amount: number;
    final_price: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'moncash' | 'card' | 'paypal'>('moncash');
  const [moncashPhone, setMoncashPhone] = useState('+509 ');
  const [credits, setCredits] = useState<MembershipCredit[]>([]);
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isMembershipModalOpen && user) {
      apiRequest<MembershipCredit[]>('/membership/credits')
        .then(data => setCredits(data.filter(c => c.status === 'active')))
        .catch(() => {});
    }
  }, [isMembershipModalOpen, user]);

  if (!isMembershipModalOpen) return null;

  const basePrice = selectedPlan === 'yearly' ? 120 : 10;
  const discountVal = discountApplied ? discountApplied.discount_amount : 0;
  const creditVal = selectedCreditId ? 10 : 0;
  const finalPrice = Math.max(0, basePrice - discountVal - creditVal);

  const handleVerifyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountError(null);
    try {
      const res = await apiRequest<{
        valid: boolean;
        code: string;
        discount_amount: number;
        final_price: number;
      }>('/membership/verify-discount', {
        method: 'POST',
        body: JSON.stringify({ code: discountCode, plan: selectedPlan }),
      });
      setDiscountApplied(res);
    } catch (err: any) {
      setDiscountError(err.message || 'Invalid discount code.');
      setDiscountApplied(null);
    }
  };

  const handleActivateMembership = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>('/membership/purchase', {
        method: 'POST',
        body: JSON.stringify({
          plan: selectedPlan,
          discount_code: discountApplied?.code || null,
          payment_method: paymentMethod === 'moncash' ? 'MonCash' : paymentMethod === 'paypal' ? 'PayPal' : 'Credit Card',
          use_credit_id: selectedCreditId,
        }),
      });

      setSuccessMsg(res.message);
      await refreshUser();
      setTimeout(() => {
        setIsMembershipModalOpen(false);
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="membership-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Haitian Flag Glow Trim */}
        <div className="h-2 w-full flex">
          <div className="h-full w-1/2 bg-[#0047AB]" />
          <div className="h-full w-1/2 bg-[#D21034]" />
        </div>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white tracking-wider">
                {t('membership_required')}
              </h2>
              <p className="text-xs text-slate-400">{t('membership_required_desc')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMembershipModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {successMsg ? (
            <div className="p-6 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-emerald-300">
                Membership Activated!
              </h3>
              <p className="text-xs text-slate-300">{successMsg}</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 bg-rose-900/40 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Plan Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => {
                    setSelectedPlan('monthly');
                    setDiscountApplied(null);
                  }}
                  className={`cursor-pointer p-4 rounded-xl border transition relative ${
                    selectedPlan === 'monthly'
                      ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-900/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-400">Standard Plan</div>
                  <div className="font-display font-bold text-2xl text-white mt-1">$10 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Full access to tournaments, match rewards, and ranking.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setSelectedPlan('yearly');
                    setDiscountApplied(null);
                  }}
                  className={`cursor-pointer p-4 rounded-xl border transition relative ${
                    selectedPlan === 'yearly'
                      ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-900/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-full">
                    BEST VALUE
                  </span>
                  <div className="text-xs font-semibold text-slate-400">Annual Pass</div>
                  <div className="font-display font-bold text-2xl text-amber-300 mt-1">$120 <span className="text-xs font-normal text-slate-400">/ year</span></div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    365 days of elite competitive status & exclusive cups.
                  </p>
                </div>
              </div>

              {/* $5 Discount Code input */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('discount_code')}</span>
                  <span className="text-[11px] text-slate-500">(Try code: <span className="text-amber-400 font-mono font-bold">LAKAYA5</span>)</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="E.g. LAKAYA5"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyDiscount}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition"
                  >
                    {t('apply_discount')}
                  </button>
                </div>

                {discountApplied && (
                  <div className="text-xs text-emerald-400 flex items-center space-x-1 pt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('discount_applied')} (-${discountApplied.discount_amount})</span>
                  </div>
                )}
                {discountError && (
                  <div className="text-xs text-rose-400 pt-1">{discountError}</div>
                )}
              </div>

              {/* Membership Credits from 2nd/3rd place */}
              {credits.length > 0 && (
                <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-3 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-purple-300">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span>Available Membership Credits (${credits.length * 10} USD)</span>
                  </div>
                  <div className="space-y-1.5">
                    {credits.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs cursor-pointer hover:bg-slate-900"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedCreditId === c.id}
                            onChange={(e) => setSelectedCreditId(e.target.checked ? c.id : null)}
                            className="rounded border-slate-700 text-purple-600 focus:ring-0"
                          />
                          <span className="text-slate-200">
                            Tournament Reward Credit ({c.source.replace(/_/g, ' ')})
                          </span>
                        </div>
                        <span className="font-bold text-emerald-400">-$10.00</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('moncash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'moncash'
                        ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>MonCash</span>
                    <span className="text-[10px] font-normal text-rose-200/70">🇭🇹 Haiti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'card'
                        ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>Card</span>
                    <span className="text-[10px] font-normal text-blue-200/70">Visa/MC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'paypal'
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>PayPal</span>
                    <span className="text-[10px] font-normal text-indigo-200/70">Global</span>
                  </button>
                </div>
              </div>

              {/* MonCash specific details */}
              {paymentMethod === 'moncash' && (
                <div className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-rose-300">
                    MonCash Haiti Payment Details
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Your Digicel / MonCash Phone Number:
                    </label>
                    <input
                      type="text"
                      value={moncashPhone}
                      onChange={(e) => setMoncashPhone(e.target.value)}
                      placeholder="+509 347-XXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Price:</span>
                  <span>${basePrice.toFixed(2)} USD</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Code ({discountApplied?.code}):</span>
                    <span>-${discountVal.toFixed(2)} USD</span>
                  </div>
                )}
                {creditVal > 0 && (
                  <div className="flex justify-between text-purple-400">
                    <span>Tournament Credit:</span>
                    <span>-${creditVal.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
                  <span>Total Amount Due:</span>
                  <span className="text-amber-400 font-display font-bold text-base">
                    ${finalPrice.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Activation CTA */}
              <button
                type="button"
                onClick={handleActivateMembership}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-600 to-blue-600 hover:from-amber-400 hover:to-blue-500 text-white font-display font-bold text-sm tracking-wider rounded-xl shadow-xl transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Processing Payment...' : `Complete Payment & Activate ($${finalPrice.toFixed(2)})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
