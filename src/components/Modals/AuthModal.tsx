import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Phone, Gamepad2, Award, Crown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalMode, setAuthModalMode, login, register, googleLogin } = useAuth();
  const { t } = useLanguage();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [game, setGame] = useState('game-fc27');
  const [platform, setPlatform] = useState('plat-ps5');
  const [gamerTag, setGamerTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login({ email_or_username: emailOrUsername, password });
      } else {
        await register({
          full_name: fullName,
          username,
          email,
          password,
          phone_number: phoneNumber,
          whatsapp_number: whatsappNumber,
          game_id: game,
          platform_id: platform,
          gamer_tag: gamerTag,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (asAdmin: boolean) => {
    setError(null);
    setLoading(true);
    try {
      if (asAdmin) {
        await login({ email_or_username: 'spideedtheking@gmail.com', password: 'Password123!' });
      } else {
        await login({ email_or_username: 'jeanluc@gmail.com', password: 'Gamer123!' });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Haitian Ribbon */}
        <div className="h-2 w-full flex">
          <div className="h-full w-1/2 bg-[#0047AB]" />
          <div className="h-full w-1/2 bg-[#D21034]" />
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.jpg"
              alt="LakayaTOURNAMENT"
              className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="font-display font-bold text-xl text-white tracking-wider">
                {authModalMode === 'login' ? t('login') : t('register')}
              </h2>
              <p className="text-xs text-slate-400">LakayaTOURNAMENT • {t('tagline')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="bg-slate-950/60 p-3 px-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Quick Test Sign-In:</span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleQuickLogin(true)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
            >
              <Crown className="w-3 h-3 text-amber-400" />
              <span>Owner/Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin(false)}
              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
            >
              <Gamepad2 className="w-3 h-3 text-blue-400" />
              <span>Competitor</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-900/40 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {authModalMode === 'login' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="spideedtheking@gmail.com or djspideed"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jackson Spike"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="haitistriker"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gamer@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+509 XXXX-XXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="347-XXX-XXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Initial Game & Gamer Tag */}
              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-2">
                <span className="text-xs font-bold text-blue-300 flex items-center space-x-1">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Competitive Gamer Tag Registration</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Game</label>
                    <select
                      value={game}
                      onChange={(e) => setGame(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="game-fc27">EA SPORTS FC 27</option>
                      <option value="game-mk">Mortal Kombat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="plat-ps5">PlayStation</option>
                      <option value="plat-xbox">Xbox</option>
                      <option value="plat-pc">PC</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Gamer Tag / PSN ID / Gamertag
                  </label>
                  <input
                    type="text"
                    value={gamerTag}
                    onChange={(e) => setGamerTag(e.target.value)}
                    placeholder="E.g. HaitiStriker_509"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-display font-bold text-sm tracking-wider rounded-xl shadow-lg transition transform active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Processing...' : authModalMode === 'login' ? t('login') : t('register')}
          </button>

          {/* Google Sign In option */}
          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
          >
            <Mail className="w-4 h-4 text-rose-400" />
            <span>Continue with Gmail / Google</span>
          </button>

          {/* Switch Mode */}
          <div className="text-center pt-2 text-xs text-slate-400">
            {authModalMode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalMode('register')}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalMode('login')}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
