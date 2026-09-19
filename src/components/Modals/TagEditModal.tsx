import React, { useState } from 'react';
import { X, Edit3, Check, Gamepad2 } from 'lucide-react';
import { OFFICIAL_GAMES } from '../../data/gamesData';

interface TagEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string | null;
  currentTag?: string;
  onSave: (gameId: string, newTag: string) => void;
}

export const TagEditModal: React.FC<TagEditModalProps> = ({
  isOpen,
  onClose,
  gameId,
  currentTag = '',
  onSave,
}) => {
  if (!isOpen) return null;

  const game = OFFICIAL_GAMES.find((g) => g.id === gameId) || OFFICIAL_GAMES[0];
  const [tag, setTag] = useState(currentTag || game.defaultTag);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tag.trim()) {
      onSave(game.id, tag.trim());
      onClose();
    }
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
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-base text-white">
              EDIT GAMER TAG
            </h3>
            <p className="text-xs text-slate-400">
              Game: <strong className="text-amber-400">{game.name}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              Enter your PSN / Gamertag / Steam ID:
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Haiti_Striker509"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Opponents will invite you using this tag on your console.
            </p>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center space-x-1 shadow"
            >
              <Check className="w-4 h-4 mr-1" />
              Save Tag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
