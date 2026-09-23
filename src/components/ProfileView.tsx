import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Award, 
  FileCheck2, 
  ShieldCheck, 
  Gamepad2, 
  Sparkles, 
  Check, 
  Plus, 
  Edit3, 
  Trash2,
  ExternalLink,
  Crown,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/client';
import { GamerTag, Medal, Certificate, MembershipCredit, Game, Platform } from '../types';

export const ProfileView: React.FC = () => {
  const { user, refreshUser, setIsMembershipModalOpen } = useAuth();
  const { t } = useLanguage();

  const [gamerTags, setGamerTags] = useState<GamerTag[]>([]);
  const [medals, setMedals] = useState<Medal[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [credits, setCredits] = useState<MembershipCredit[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  // Add Gamer Tag
  const [newTagGame, setNewTagGame] = useState('game-fc27');
  const [newTagPlatform, setNewTagPlatform] = useState('plat-ps5');
  const [newTagVal, setNewTagVal] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  // Edit Bio
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Certificate Print Modal
  const [viewCertificate, setViewCertificate] = useState<Certificate | null>(null);

  const fetchProfileDetails = () => {
    if (!user) return;
    Promise.all([
      apiRequest<GamerTag[]>('/gamertags'),
      apiRequest<Medal[]>('/medals/my'),
      apiRequest<Certificate[]>('/certificates/my'),
      apiRequest<MembershipCredit[]>('/membership/credits'),
      apiRequest<Game[]>('/games'),
      apiRequest<Platform[]>('/platforms'),
    ])
      .then(([gTags, mDals, cTifs, cReds, gList, pList]) => {
        setGamerTags(Array.isArray(gTags) ? gTags : []);
        setMedals(Array.isArray(mDals) ? mDals : []);
        setCertificates(Array.isArray(cTifs) ? cTifs : []);
        setCredits(Array.isArray(cReds) ? cReds : []);
        setGames(Array.isArray(gList) ? gList : []);
        setPlatforms(Array.isArray(pList) ? pList : []);
      })
      .catch(() => {
        setGamerTags([]);
        setMedals([]);
        setCertificates([]);
        setCredits([]);
        setGames([]);
        setPlatforms([]);
      });
  };

  useEffect(() => {
    fetchProfileDetails();
    if (user) {
      setDisplayName(user.display_name || user.username);
      setBio(user.bio || '');
      setPhotoUrl(user.profile_photo_url || '');
    }
  }, [user]);

  const handleAddGamerTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagVal.trim()) return;
    setAddingTag(true);
    try {
      await apiRequest('/gamertags/add', {
        method: 'POST',
        body: JSON.stringify({
          game_id: newTagGame,
          platform_id: newTagPlatform,
          gamer_tag: newTagVal.trim(),
        }),
      });
      setNewTagVal('');
      fetchProfileDetails();
    } catch (e) {
      console.error(e);
    } finally {
      setAddingTag(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiRequest('/auth/update-profile', {
        method: 'POST',
        body: JSON.stringify({
          display_name: displayName,
          bio,
          profile_photo_url: photoUrl,
        }),
      });
      await refreshUser();
      setIsEditingProfile(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="p-12 text-center text-slate-400">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div id="profile-view-container" className="space-y-8 pb-16">
      {/* Header Profile Card */}
      <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img
                src={user.profile_photo_url || '/logo.jpg'}
                alt={user.username}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl"
                referrerPolicy="no-referrer"
              />
              {user.role === 'admin' && (
                <div className="absolute -top-2 -right-2 p-1.5 bg-amber-500 rounded-lg text-slate-950 shadow-md">
                  <Crown className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-xl md:text-2xl text-white">
                  {user.display_name || user.username}
                </h1>
                <span className="font-mono text-xs text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                  {user.gamer_id}
                </span>
              </div>

              <div className="text-xs text-slate-400">@{user.username} • Member since {new Date(user.created_at).toLocaleDateString()}</div>

              <p className="text-xs text-slate-300 max-w-md pt-1">
                {user.bio || 'LakayaTOURNAMENT Official Competitive Esports Gamer.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Membership Pill */}
            {user.is_member_active ? (
              <div className="px-4 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ACTIVE MEMBER</span>
              </div>
            ) : (
              <button
                onClick={() => setIsMembershipModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition animate-pulse flex items-center space-x-1.5"
              >
                <span>ACTIVATE MEMBERSHIP</span>
              </button>
            )}

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Profile Photo URL</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Bio</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Grid: Gamer Tags & Competitive Medals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gamer Tags Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-white flex items-center space-x-2">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
              <span>Registered Gamer Tags</span>
            </h2>
            <span className="text-[11px] text-slate-400">PSN, Gamertag, PC</span>
          </div>

          <div className="space-y-2">
            {gamerTags.map((gt) => (
              <div
                key={gt.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{gt.game_name} ({gt.platform_name})</div>
                  <div className="font-mono text-amber-400 font-bold">@{gt.gamer_tag}</div>
                </div>
                {gt.is_primary ? (
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded">
                    PRIMARY
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Add Gamer Tag Form */}
          <form onSubmit={handleAddGamerTag} className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300">Add New Tag:</span>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={newTagGame}
                onChange={(e) => setNewTagGame(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>

              <select
                value={newTagPlatform}
                onChange={(e) => setNewTagPlatform(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <input
                type="text"
                required
                value={newTagVal}
                onChange={(e) => setNewTagVal(e.target.value)}
                placeholder="Gamertag..."
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              disabled={addingTag}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
            >
              {addingTag ? 'Adding...' : '+ Register Gamer Tag'}
            </button>
          </form>
        </div>

        {/* Medals & Honors Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Earned Medals & Honors</span>
            </h2>
            <span className="text-[11px] text-slate-400">{medals.length} Medals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {medals.length === 0 ? (
              <div className="col-span-2 p-6 text-center text-xs text-slate-500">
                Compete in official tournaments to win Gold, Silver, and Bronze medals.
              </div>
            ) : (
              medals.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{m.name}</div>
                    <div className="text-[10px] text-slate-400">{m.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Official Certificates & Rewards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-white flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-teal-400" />
            <span>Official Championship Certificates</span>
          </h2>
          <span className="text-[11px] text-slate-400">Authentic Haitian Esports Diplomas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.length === 0 ? (
            <div className="col-span-2 p-6 text-center text-xs text-slate-500">
              Championship winners receive verifiable, printable certificates.
            </div>
          ) : (
            certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 space-y-3 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      {cert.certificate_number}
                    </span>
                    <h3 className="font-display font-bold text-base text-white mt-0.5">
                      {cert.title}
                    </h3>
                  </div>
                  <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                </div>

                <p className="text-xs text-slate-300">
                  Presented to <strong className="text-white">{cert.recipient_name}</strong> for {cert.achievement}.
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Issued: {cert.issue_date}</span>
                  <button
                    onClick={() => setViewCertificate(cert)}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Printable Certificate Modal */}
      {viewCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0a0f1d] border-4 border-amber-500 rounded-2xl p-8 space-y-6 text-center shadow-2xl text-white my-8 printable-certificate">
            {/* Haitian Ribbon Banner */}
            <div className="h-2 w-32 mx-auto flex rounded-full overflow-hidden mb-4">
              <div className="h-full w-1/2 bg-[#0047AB]" />
              <div className="h-full w-1/2 bg-[#D21034]" />
            </div>

            <img
              src="/logo.jpg"
              alt="LakayaTOURNAMENT"
              className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-amber-400"
              referrerPolicy="no-referrer"
            />

            <div>
              <span className="font-tech text-xs tracking-[0.3em] text-amber-400 uppercase font-bold">
                LAKAYATOURNAMENT OFFICIAL ESPORTS DIPLOMA
              </span>
              <h2 className="font-display font-black text-2xl md:text-3xl text-white mt-1">
                CERTIFICATE OF CHAMPIONSHIP
              </h2>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Verify ID: {viewCertificate.certificate_number}
              </div>
            </div>

            <div className="space-y-2 py-4 border-y border-amber-500/30">
              <p className="text-xs text-slate-300">This official diploma proudly certifies that</p>
              <div className="font-display font-black text-2xl md:text-3xl text-amber-300 tracking-wide">
                {viewCertificate.recipient_name}
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                has achieved supreme victory in <strong className="text-white">{viewCertificate.tournament_name}</strong> and demonstrated elite esports craftsmanship under official LakayaTOURNAMENT regulations.
              </p>
            </div>

            <div className="flex justify-between items-end pt-4 text-left">
              <div>
                <div className="text-[10px] text-slate-400">OFFICIAL DATE</div>
                <div className="text-xs font-bold text-white">{viewCertificate.issue_date}</div>
              </div>

              <div className="text-center">
                <div className="font-display font-bold text-amber-400 text-sm">DJSPIDEED THEKING</div>
                <div className="text-[10px] text-slate-400">President & League Commissioner</div>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-4 no-print">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Diploma</span>
              </button>
              <button
                onClick={() => setViewCertificate(null)}
                className="px-6 py-2.5 bg-slate-800 text-slate-300 text-xs rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
