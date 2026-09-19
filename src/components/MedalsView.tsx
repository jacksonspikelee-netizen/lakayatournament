import React, { useState, useEffect } from 'react';
import { Award, Trophy, Crown, Medal as MedalIcon, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Medal } from '../types';

export const MedalsView: React.FC = () => {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [allMedals, setAllMedals] = useState<Medal[]>([]);

  useEffect(() => {
    apiRequest<Medal[]>('/medals/my')
      .then(d => setMedals(Array.isArray(d) ? d : []))
      .catch(() => setMedals([]));
    apiRequest<Medal[]>('/medals/all')
      .then(d => setAllMedals(Array.isArray(d) ? d : []))
      .catch(() => setAllMedals([]));
  }, []);

  return (
    <div id="medals-view-container" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide flex items-center space-x-3">
            <Award className="w-8 h-8 text-amber-400" />
            <span>LakayaTOURNAMENT Medals & Honors</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Official badges and honors awarded to champions, finalists, and outstanding Haitian competitors.
          </p>
        </div>

        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{medals.length} Medals Earned</span>
        </div>
      </div>

      {/* Earned Medals Showcase */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg text-white">Your Trophy Case</h2>
        {!Array.isArray(medals) || medals.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="font-bold text-white text-sm">No Medals Earned Yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Join official tournaments and place in the top 3 or achieve exceptional match performance to unlock medals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {medals.map((m) => (
              <div
                key={m.id}
                className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 flex items-center space-x-4 shadow-xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shrink-0">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">{m.name}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{m.description}</p>
                  <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                    Awarded: {new Date(m.awarded_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available League Medals */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <h2 className="font-display font-bold text-lg text-white">All League Medals & Trophies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Gold Championship Medal', desc: 'Awarded to 1st place tournament champions.', icon: Trophy, color: 'text-amber-400', border: 'border-amber-500/40' },
            { name: 'Silver Finalist Medal', desc: 'Awarded to 2nd place tournament runner-up.', icon: MedalIcon, color: 'text-slate-300', border: 'border-slate-400/40' },
            { name: 'Bronze Podium Medal', desc: 'Awarded to 3rd place tournament competitor.', icon: MedalIcon, color: 'text-amber-600', border: 'border-amber-700/40' },
            { name: 'Fair Play Honor', desc: 'Recognized for sportsmanship & prompt score reporting.', icon: ShieldCheck, color: 'text-emerald-400', border: 'border-emerald-500/40' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`bg-slate-900/60 border ${item.border} rounded-2xl p-4 space-y-2`}>
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-bold text-xs text-white">{item.name}</span>
                </div>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
