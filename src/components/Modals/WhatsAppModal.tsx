import React, { useState } from 'react';
import { MessageCircle, Phone, X, ExternalLink, Send, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const officialNumber = '347-558-3607';
  const cleanNumber = '13475583607';

  const handleOpenWhatsApp = () => {
    const textParam = encodeURIComponent(message || 'Hello LakayaTOURNAMENT Support, I have a question regarding my esports account.');
    window.open(`https://wa.me/${cleanNumber}?text=${textParam}`, '_blank');
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('+1-347-558-3607');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="whatsapp-support-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg leading-tight">LakayaTOURNAMENT</h3>
              <p className="text-xs text-emerald-100/80">Official WhatsApp Player Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-400">Direct Support Line</div>
                <div className="font-tech text-xl font-bold tracking-wider text-emerald-300">
                  {officialNumber}
                </div>
              </div>
            </div>
            <button
              onClick={handleCopyNumber}
              className="px-3 py-1.5 bg-emerald-800/50 hover:bg-emerald-700/60 text-emerald-200 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Quick message to support:
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., I need assistance with tournament bracket check-in or match verification..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/40 transition transform active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Launch WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition text-sm"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
