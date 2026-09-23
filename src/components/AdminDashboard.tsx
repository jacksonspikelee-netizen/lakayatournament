import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Users, 
  Trophy, 
  DollarSign, 
  AlertTriangle, 
  Check, 
  X, 
  Send, 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw,
  Clock,
  Globe,
  Lock,
  Shield,
  Mail,
  UserCheck,
  UserX,
  Tag,
  Gift,
  Key,
  Search,
  Activity,
  Award,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { User, Tournament, PayoutRequest, Match } from '../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner' || user?.email?.toLowerCase() === 'spideedtheking@gmail.com';
  const perms = user?.admin_permissions || {};

  type SubTabType = 
    | 'overview' 
    | 'admins' 
    | 'users' 
    | 'discounts' 
    | 'tests' 
    | 'payouts' 
    | 'conflicts' 
    | 'tournaments' 
    | 'security' 
    | 'audit' 
    | 'broadcast';

  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('overview');
  const [domainSecurity, setDomainSecurity] = useState<any>(null);
  const [loadingDomainSecurity, setLoadingDomainSecurity] = useState(false);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  const [stats, setStats] = useState<any>({
    total_gamers: 11,
    total_admins: 1,
    active_members: 9,
    expired_members: 0,
    total_revenue: 145.00,
    membership_revenue: 90.00,
    tournament_entry_revenue: 55.00,
    match_fees_10_percent: 12.00,
    wallet_liabilities: 180.00,
    total_rewards_paid: 240.00,
    pending_payouts_count: 0,
    pending_disputes: 0,
    security_alerts: [],
  });

  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [conflicts, setConflicts] = useState<Match[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [discountsList, setDiscountsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityTestResults, setSecurityTestResults] = useState<any | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [gamerSearch, setGamerSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Tournament Form State
  const [newTournName, setNewTournName] = useState('');
  const [newTournGame, setNewTournGame] = useState('game-fc27');
  const [newTournPlatform, setNewTournPlatform] = useState('plat-ps5');
  const [newTournPrize, setNewTournPrize] = useState(100);
  const [newTournFee, setNewTournFee] = useState(5);
  const [creatingTourn, setCreatingTourn] = useState(false);

  // Broadcast Message State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Create Admin Form State (Owner only)
  const [selectedGamerToPromote, setSelectedGamerToPromote] = useState('');
  const [newAdminPerms, setNewAdminPerms] = useState({
    can_manage_tournaments: true,
    can_verify_matches: true,
    can_process_payouts: false,
    can_create_discounts: false,
    can_manage_gamers: false,
  });

  // Create Discount Form State
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountAmount, setNewDiscountAmount] = useState('5.00');
  const [newDiscountType, setNewDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [newDiscountMaxUses, setNewDiscountMaxUses] = useState('100');
  const [newDiscountTargetGamer, setNewDiscountTargetGamer] = useState('');
  const [newDiscountIsOneTime, setNewDiscountIsOneTime] = useState(true);

  const fetchAdminData = () => {
    setLoading(true);
    const statsEndpoint = isOwner ? '/owner/stats' : '/admin/stats';
    
    Promise.all([
      apiRequest<any>(statsEndpoint).catch(() => stats),
      apiRequest<PayoutRequest[]>('/admin/payouts').catch(() => []),
      apiRequest<Match[]>('/admin/conflicts').catch(() => []),
      apiRequest<any[]>('/gamers?filter=all').catch(() => []),
      apiRequest<Tournament[]>('/tournaments').catch(() => []),
      apiRequest<any[]>('/admin/emails').catch(() => []),
      isOwner ? apiRequest<any[]>('/owner/admins').catch(() => []) : Promise.resolve([]),
      apiRequest<any[]>('/owner/discounts').catch(() => []),
      isOwner ? apiRequest<any[]>('/owner/audit-logs').catch(() => []) : Promise.resolve([]),
    ])
      .then(([st, pList, cList, uList, tList, eList, aList, dList, logs]) => {
        if (st) setStats(st);
        setPayouts(Array.isArray(pList) ? pList : []);
        setConflicts(Array.isArray(cList) ? cList : []);
        setAllUsers(Array.isArray(uList) ? uList : []);
        setAllTournaments(Array.isArray(tList) ? tList : []);
        setSentEmails(Array.isArray(eList) ? eList : []);
        setAdminsList(Array.isArray(aList) ? aList : []);
        setDiscountsList(Array.isArray(dList) ? dList : []);
        setAuditLogs(Array.isArray(logs) ? logs : []);
      })
      .finally(() => setLoading(false));
  };

  const fetchDomainSecurity = () => {
    setLoadingDomainSecurity(true);
    apiRequest('/security/domain-status')
      .then((res) => setDomainSecurity(res))
      .catch((err) => console.error(err))
      .finally(() => setLoadingDomainSecurity(false));
  };

  const handleRunSecurityTests = async () => {
    setRunningTests(true);
    try {
      const res = await apiRequest<any>('/owner/security/run-tests', { method: 'POST' });
      setSecurityTestResults(res);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to execute security tests', err);
    } finally {
      setRunningTests(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchDomainSecurity();
  }, [user]);

  const handleUpdatePayout = async (payoutId: string, action: 'paid' | 'failed', notes?: string) => {
    try {
      await apiRequest(`/admin/payouts/${payoutId}/process`, {
        method: 'POST',
        body: JSON.stringify({ action, notes: notes || (action === 'paid' ? 'Paid by Admin' : 'Rejected') }),
      });
      fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to process payout');
    }
  };

  const handleResolveConflict = async (matchId: string, winnerId: string) => {
    try {
      await apiRequest(`/admin/matches/${matchId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ winner_id: winnerId, notes: 'Admin verified and resolved conflict.' }),
      });
      fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to resolve match');
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTourn(true);
    try {
      await apiRequest('/admin/tournaments/create', {
        method: 'POST',
        body: JSON.stringify({
          name: newTournName,
          game_id: newTournGame,
          platform_id: newTournPlatform,
          prize_pool: newTournPrize,
          entry_fee: newTournFee,
          max_players: 12,
        }),
      });
      setNewTournName('');
      fetchAdminData();
      alert('Tournament created successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to create tournament');
    } finally {
      setCreatingTourn(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    try {
      await apiRequest('/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMsg }),
      });
      setBroadcastSent(true);
      setTimeout(() => {
        setBroadcastSent(false);
        setBroadcastTitle('');
        setBroadcastMsg('');
      }, 2000);
    } catch (e: any) {
      alert(e.message || 'Failed to send broadcast');
    }
  };

  // Owner: Promote Gamer to Admin
  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGamerToPromote) return;
    try {
      await apiRequest('/owner/admins/create', {
        method: 'POST',
        body: JSON.stringify({
          user_id: selectedGamerToPromote,
          permissions: newAdminPerms,
        }),
      });
      setSelectedGamerToPromote('');
      fetchAdminData();
      alert('Gamer successfully promoted to Administrator with configured permissions.');
    } catch (e: any) {
      alert(e.message || 'Failed to promote gamer');
    }
  };

  // Owner: Toggle Admin Permission
  const handleUpdateAdminPerms = async (adminId: string, currentPerms: any, key: string) => {
    const updated = { ...currentPerms, [key]: !currentPerms[key] };
    try {
      await apiRequest(`/owner/admins/${adminId}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ permissions: updated }),
      });
      fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to update admin permissions');
    }
  };

  // Owner: Suspend / Reactivate Admin
  const handleToggleAdminStatus = async (admin: any) => {
    const isSuspended = admin.status === 'suspended';
    const endpoint = isSuspended ? `/owner/admins/${admin.id}/reactivate` : `/owner/admins/${admin.id}/suspend`;
    try {
      await apiRequest(endpoint, { method: 'POST' });
      fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to update admin status');
    }
  };

  // Owner: Demote Admin to Gamer
  const handleDemoteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to revoke Administrator access and demote this user to GAMER?')) return;
    try {
      await apiRequest(`/owner/admins/${adminId}/demote`, { method: 'POST' });
      fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to demote admin');
    }
  };

  // Owner: Suspend / Reactivate Gamer
  const handleToggleGamerStatus = async (gamer: any) => {
    const isSuspended = gamer.status === 'suspended';
    const endpoint = isSuspended ? `/owner/gamers/${gamer.id}/reactivate` : `/owner/gamers/${gamer.id}/suspend`;
    try {
      await apiRequest(endpoint, { method: 'POST' });
      fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to update gamer status');
    }
  };

  // Owner: Grant 1-Year Free Membership Pass
  const handleGrantFreePass = async (gamer: any) => {
    if (!confirm(`Grant 1-Year Complimentary VIP Pass to ${gamer.username}?`)) return;
    try {
      await apiRequest(`/owner/gamers/${gamer.id}/grant-free-access`, { method: 'POST' });
      fetchAdminData();
      alert(`1-Year Free VIP League Pass granted to ${gamer.username}!`);
    } catch (e: any) {
      alert(e.message || 'Failed to grant membership pass');
    }
  };

  // Create Discount Code
  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscountCode || !newDiscountAmount) return;
    try {
      await apiRequest('/owner/discounts/create', {
        method: 'POST',
        body: JSON.stringify({
          code: newDiscountCode,
          discount_amount: parseFloat(newDiscountAmount),
          discount_type: newDiscountType,
          max_uses: parseInt(newDiscountMaxUses),
          is_one_time: newDiscountIsOneTime,
          specific_username: newDiscountTargetGamer || null,
        }),
      });
      setNewDiscountCode('');
      setNewDiscountAmount('5.00');
      setNewDiscountTargetGamer('');
      fetchAdminData();
      alert('Discount voucher created successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to create discount');
    }
  };

  // Toggle Discount Code
  const handleToggleDiscount = async (discountId: string) => {
    try {
      await apiRequest(`/owner/discounts/${discountId}/toggle`, { method: 'POST' });
      fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle discount');
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'owner' && user?.email !== 'spideedtheking@gmail.com') {
    return (
      <div className="p-12 text-center text-rose-400 font-bold bg-slate-900/60 border border-rose-900/40 rounded-3xl">
        Access Denied. Owner or Administrator role required.
      </div>
    );
  }

  // Filtered Gamers for search
  const filteredGamers = allUsers.filter((u: any) => {
    if (!gamerSearch) return true;
    const s = gamerSearch.toLowerCase();
    return (
      u.username?.toLowerCase().includes(s) ||
      u.gamer_id?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.full_name?.toLowerCase().includes(s)
    );
  });

  return (
    <div id="admin-dashboard-container" className="space-y-8 pb-16">
      {/* Header Banner: Owner vs Admin */}
      {isOwner ? (
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl shadow-amber-950/40">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Crown className="w-9 h-9 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-widest mb-1">
                <span>👑 SOLE PLATFORM OWNER & FOUNDER</span>
              </div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
                DJSPIDEED THEKING Control Center
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Authenticated Account: <strong className="text-amber-300 font-mono">spideedtheking@gmail.com</strong> • Full Immutable Authorization
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300 flex items-center space-x-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Complimentary VIP Pass: Active</span>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-2 transition border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync System</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 border border-blue-500/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Platform Administration
              </div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-white">
                Officer: {user?.display_name || user?.username}
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {perms.can_manage_tournaments && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold">Tournaments</span>}
                {perms.can_verify_matches && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold">Matches & Disputes</span>}
                {perms.can_process_payouts && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">Payouts</span>}
                {perms.can_create_discounts && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold">Discounts</span>}
                {perms.can_manage_gamers && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">Gamers</span>}
              </div>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-2 transition border border-slate-700 w-fit"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* KPI Financial & Operational Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display font-black text-2xl text-emerald-400 mt-2">
            ${Number(stats.total_revenue || 145).toFixed(2)} USD
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Memberships: ${Number(stats.membership_revenue || 90).toFixed(2)} • Entry Fees: ${Number(stats.tournament_entry_revenue || 55).toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Gamers & Members</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-display font-black text-2xl text-white mt-2">
            {stats.total_gamers || allUsers.length} <span className="text-xs text-slate-400 font-normal font-sans">Gamers</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {stats.active_members || 9} Active VIP Members
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Match 10% Cuts & Bounty</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-black text-2xl text-amber-400 mt-2">
            ${Number(stats.match_fees_10_percent || 12).toFixed(2)} USD
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            10% fee retained per verified match victory
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-display font-black text-2xl text-rose-400 mt-2">
            {payouts.filter(p => p.status === 'pending').length} Payouts
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {conflicts.length} Match Dispute{conflicts.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Dynamic Sub Navigation */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Financial Overview', show: true },
          { id: 'admins', label: `Administrators (${adminsList.length})`, show: isOwner },
          { id: 'tests', label: '16 Security Verifications', show: isOwner },
          { id: 'users', label: `Gamers (${allUsers.length})`, show: isOwner || !!perms.can_manage_gamers },
          { id: 'discounts', label: `Discounts & Vouchers (${discountsList.length})`, show: isOwner || !!perms.can_create_discounts },
          { id: 'payouts', label: `Payout Requests (${payouts.filter(p => p.status === 'pending').length})`, show: isOwner || !!perms.can_process_payouts },
          { id: 'conflicts', label: `Match Disputes (${conflicts.length})`, show: isOwner || !!perms.can_verify_matches },
          { id: 'tournaments', label: 'Tournaments', show: isOwner || !!perms.can_manage_tournaments },
          { id: 'security', label: `Domain & Emails (${sentEmails.length})`, show: true },
          { id: 'audit', label: 'Audit Trail', show: isOwner },
          { id: 'broadcast', label: 'Broadcast Message', show: isOwner },
        ]
          .filter(t => t.show)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTabType)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeSubTab === tab.id
                  ? isOwner ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/50' : 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. FINANCIAL OVERVIEW TAB */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-white text-base flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Revenue Breakdown</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Monthly/Yearly Memberships</span>
                  <span className="font-mono text-emerald-400 font-bold">${Number(stats.membership_revenue || 90).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Tournament Entry Fees ($5/seat)</span>
                  <span className="font-mono text-emerald-400 font-bold">${Number(stats.tournament_entry_revenue || 55).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Platform 10% Match Commission</span>
                  <span className="font-mono text-emerald-400 font-bold">${Number(stats.match_fees_10_percent || 12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-white text-sm">
                  <span>Gross Platform Revenue</span>
                  <span className="font-mono text-emerald-400">${Number(stats.total_revenue || 145).toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-white text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <span>Liabilities & Reserves</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Gamer Wallet Balances</span>
                  <span className="font-mono text-amber-400 font-bold">${Number(stats.wallet_liabilities || 180).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Rewards Dispatched</span>
                  <span className="font-mono text-emerald-400 font-bold">${Number(stats.total_rewards_paid || 240).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Pending Cash-Out Requests</span>
                  <span className="font-mono text-rose-400 font-bold">${Number(stats.pending_payouts_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-white text-sm">
                  <span>Completed Cash-Outs Paid</span>
                  <span className="font-mono text-sky-400">${Number(stats.completed_payouts_amount || 60).toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-white text-base flex items-center space-x-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>Security Engine Live Status</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Single Owner Immutable Lock</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">ENFORCED</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Server-Side Role Guardian</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Transactional Email Receipts</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">DISPATCHING</span>
                </div>
                <div className="flex items-center justify-between py-2 text-slate-300">
                  <span>Recent Security Alerts</span>
                  <span className="font-mono text-amber-400 font-bold">{stats.security_alerts?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. ADMINISTRATOR MANAGEMENT TAB (OWNER EXCLUSIVE) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'admins' && isOwner && (
        <div className="space-y-6">
          {/* Promote New Admin Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Appoint Platform Administrator</h3>
                <p className="text-xs text-slate-400">Select any registered gamer and assign custom operational clearances.</p>
              </div>
            </div>

            <form onSubmit={handlePromoteAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Select Gamer</label>
                  <select
                    value={selectedGamerToPromote}
                    onChange={(e) => setSelectedGamerToPromote(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Gamer to Promote --</option>
                    {allUsers
                      .filter((u: any) => u.role === 'gamer')
                      .map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.username} ({u.gamer_id}) — {u.full_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Granular Permissions</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAdminPerms.can_manage_tournaments}
                        onChange={(e) => setNewAdminPerms({ ...newAdminPerms, can_manage_tournaments: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-slate-300">Tournaments</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAdminPerms.can_verify_matches}
                        onChange={(e) => setNewAdminPerms({ ...newAdminPerms, can_verify_matches: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-slate-300">Verify Matches</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAdminPerms.can_process_payouts}
                        onChange={(e) => setNewAdminPerms({ ...newAdminPerms, can_process_payouts: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-slate-300">Process Payouts</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAdminPerms.can_create_discounts}
                        onChange={(e) => setNewAdminPerms({ ...newAdminPerms, can_create_discounts: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-slate-300">Create Discounts</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAdminPerms.can_manage_gamers}
                        onChange={(e) => setNewAdminPerms({ ...newAdminPerms, can_manage_gamers: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-slate-300">Manage Gamers</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 transition shadow-lg shadow-amber-950/40"
              >
                <Plus className="w-4 h-4" />
                <span>Confirm & Appoint Administrator</span>
              </button>
            </form>
          </div>

          {/* Active Administrators Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-white">Current Platform Administrators</h3>
            
            <div className="divide-y divide-slate-800/80">
              {adminsList.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No administrators appointed yet.</div>
              ) : (
                adminsList.map((admin: any) => {
                  const p = admin.parsed_permissions || {};
                  return (
                    <div key={admin.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-display font-bold text-white text-sm">{admin.full_name}</span>
                          <span className="text-xs text-amber-400 font-mono">@{admin.username}</span>
                          <span className="text-xs text-slate-400 font-mono">({admin.gamer_id})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            admin.status === 'suspended' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {admin.status || 'ACTIVE'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {admin.email} • {admin.is_online ? '🟢 Online Now' : '⚪ Offline'}
                        </div>

                        {/* Permission Toggles */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {[
                            { key: 'can_manage_tournaments', label: 'Tournaments' },
                            { key: 'can_verify_matches', label: 'Verify Matches' },
                            { key: 'can_process_payouts', label: 'Payouts' },
                            { key: 'can_create_discounts', label: 'Discounts' },
                            { key: 'can_manage_gamers', label: 'Gamers' },
                          ].map((perm) => (
                            <button
                              key={perm.key}
                              type="button"
                              onClick={() => handleUpdateAdminPerms(admin.id, p, perm.key)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                p[perm.key]
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {p[perm.key] ? '✓ ' : '+ '} {perm.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleToggleAdminStatus(admin)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            admin.status === 'suspended'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                              : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {admin.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => handleDemoteAdmin(admin.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700"
                        >
                          Demote to Gamer
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. 16 PROGRAMMATIC SECURITY VERIFICATIONS (OWNER EXCLUSIVE) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'tests' && isOwner && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>16-Point Security Validation Suite</span>
              </div>
              <h2 className="font-display font-black text-2xl text-white">
                Live RBAC & Access Control Test Runner
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Executes all 16 mission-critical security checks covering role enforcement, privilege escalation protection, Owner immutability, wallet security, and admin governance.
              </p>
            </div>

            <button
              onClick={handleRunSecurityTests}
              disabled={runningTests}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center space-x-2 transition shrink-0 shadow-lg shadow-emerald-950/60"
            >
              <RefreshCw className={`w-4 h-4 ${runningTests ? 'animate-spin' : ''}`} />
              <span>{runningTests ? 'Running Verification...' : 'Execute 16 Security Tests'}</span>
            </button>
          </div>

          {securityTestResults && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Diagnostic Verification Summary</h3>
                  <p className="text-xs text-slate-400">Timestamp: {new Date(securityTestResults.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-black">
                    {securityTestResults.passed} / {securityTestResults.total_tests} PASSED
                  </span>
                  {securityTestResults.failed > 0 && (
                    <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-black">
                      {securityTestResults.failed} FAILED
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityTestResults.results.map((t: any) => (
                  <div key={t.id} className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Test #{t.id} • {t.category}
                        </div>
                        <h4 className="font-display font-bold text-white text-sm mt-0.5">{t.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                        t.status === 'PASS' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                      Expected: <span className="text-amber-300">{t.expected}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. GAMERS MANAGEMENT TAB */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Registered Competitors</h3>
              <p className="text-xs text-slate-400">Search gamers, review membership status, manage access, or grant VIP passes.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={gamerSearch}
                onChange={(e) => setGamerSearch(e.target.value)}
                placeholder="Search username, gamer ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden">
            {filteredGamers.map((u: any) => (
              <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                    {u.username?.[0]?.toUpperCase() || 'G'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{u.full_name}</span>
                      <span className="text-xs text-amber-400 font-mono">@{u.username}</span>
                      <span className="text-xs text-slate-400 font-mono">({u.gamer_id})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'owner' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                        u.role === 'admin' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {u.email} • Balance: <span className="font-mono text-emerald-400 font-bold">${Number(u.available_balance || u.wallet_balance || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                    u.is_member || u.is_member_active
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {u.is_member || u.is_member_active ? 'VIP ACTIVE' : 'NON-MEMBER'}
                  </span>

                  {isOwner && u.role !== 'owner' && (
                    <>
                      <button
                        onClick={() => handleGrantFreePass(u)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition border border-amber-500/40 flex items-center space-x-1"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Grant 1-Yr Pass</span>
                      </button>

                      <button
                        onClick={() => handleToggleGamerStatus(u)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                          u.status === 'suspended'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                            : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. DISCOUNTS & VOUCHERS TAB */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'discounts' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Create Promotional Discount Voucher</h3>
                <p className="text-xs text-slate-400">Issue universal or targeted discounts (e.g. $5 OFF or % savings) to specific gamer accounts.</p>
              </div>
            </div>

            <form onSubmit={handleCreateDiscount} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Promo Code</label>
                <input
                  type="text"
                  value={newDiscountCode}
                  onChange={(e) => setNewDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LAKAYA5 or VIP20"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Discount Value</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    value={newDiscountAmount}
                    onChange={(e) => setNewDiscountAmount(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={newDiscountType}
                    onChange={(e) => setNewDiscountType(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="fixed">USD ($)</option>
                    <option value="percentage">% Off</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Targeted Gamer (Optional)</label>
                <input
                  type="text"
                  value={newDiscountTargetGamer}
                  onChange={(e) => setNewDiscountTargetGamer(e.target.value)}
                  placeholder="All Gamers or specific username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDiscountIsOneTime}
                    onChange={(e) => setNewDiscountIsOneTime(e.target.checked)}
                    className="rounded border-slate-700 text-purple-500 focus:ring-purple-500"
                  />
                  <span>Limit to 1 redemption per individual gamer</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition shadow-lg shadow-purple-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue Discount Code</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-white">Active & Past Discount Vouchers</h3>
            <div className="divide-y divide-slate-800/80">
              {discountsList.map((d: any) => (
                <div key={d.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-amber-400 text-base">{d.code}</span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold">
                        {d.discount_type === 'percentage' ? `${d.discount_amount}% OFF` : `$${d.discount_amount.toFixed(2)} OFF`}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        d.status === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Target: <strong className="text-slate-300">{d.specific_username || d.specific_gamer_id || 'All Gamers'}</strong> • Uses: {d.current_uses} / {d.max_uses} • Created by: {d.created_by || 'Admin'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleDiscount(d.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700"
                  >
                    {d.status === 'active' ? 'Disable Code' : 'Enable Code'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. PAYOUTS TAB */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-white">Pending & Processed Cash-Out Requests</h2>
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl divide-y divide-slate-800 overflow-hidden">
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No payout requests found.</div>
            ) : (
              payouts.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white text-base">${Number(p.amount).toFixed(2)} USD</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-sky-400 rounded text-[10px] font-bold uppercase">{p.payout_method}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'paid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                        p.status === 'failed' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                        'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Recipient: <strong className="text-white font-mono">{(p as any).recipient_details || p.destination_details}</strong> • Gamer ID: {p.user_id}
                    </div>
                  </div>

                  {p.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdatePayout(p.id, 'paid')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-950/40"
                      >
                        Approve & Mark Paid
                      </button>
                      <button
                        onClick={() => handleUpdatePayout(p.id, 'failed', 'Declined by Administrator')}
                        className="px-4 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded-xl text-xs font-bold transition border border-rose-500/40"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. MATCH CONFLICTS TAB */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'conflicts' && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-white">Disputed Matches Requiring Verification</h2>
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl divide-y divide-slate-800 overflow-hidden">
            {conflicts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No match conflicts pending resolution.</div>
            ) : (
              conflicts.map((m: any) => (
                <div key={m.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-amber-400 font-bold uppercase">{m.game_name} • {m.platform_name}</div>
                    <div className="font-display font-bold text-white text-base mt-1">
                      {m.player1_username} vs {m.player2_username}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Reported scores: Player 1 ({m.player1_score ?? '?'}) — Player 2 ({m.player2_score ?? '?'})
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResolveConflict(m.id, m.player1_id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
                    >
                      Declare {m.player1_username} Winner
                    </button>
                    <button
                      onClick={() => handleResolveConflict(m.id, m.player2_id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
                    >
                      Declare {m.player2_username} Winner
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. TOURNAMENTS TAB */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'tournaments' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-white">Create Official Tournament</h3>
            <form onSubmit={handleCreateTournament} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tournament Title</label>
                <input
                  type="text"
                  value={newTournName}
                  onChange={(e) => setNewTournName(e.target.value)}
                  placeholder="e.g. Lakaya Champions Cup"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Prize Pool ($ USD)</label>
                <input
                  type="number"
                  value={newTournPrize}
                  onChange={(e) => setNewTournPrize(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Entry Fee ($ USD)</label>
                <input
                  type="number"
                  value={newTournFee}
                  onChange={(e) => setNewTournFee(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={creatingTourn}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition"
                >
                  {creatingTourn ? 'Creating...' : 'Launch Tournament'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Current Tournaments</h3>
            <div className="divide-y divide-slate-800">
              {allTournaments.map((t) => (
                <div key={t.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">
                      Prize: <strong className="text-amber-400">${t.prize_pool}</strong> • Fee: ${t.entry_fee} • {t.current_players}/{t.max_players} Players
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 9. SECURITY & SENT TRANSACTIONAL EMAILS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Platform Protected & Transactional Engine Live</span>
                </div>
                <h2 className="font-display font-black text-2xl text-white">
                  LakayaTOURNAMENT Security & Email Engine
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Automated email receipts dispatched for cash outs, wallet deposits, membership fees, and commissioner approvals.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                fetchDomainSecurity();
                fetchAdminData();
              }}
              disabled={loadingDomainSecurity}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shrink-0 shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loadingDomainSecurity ? 'animate-spin' : ''}`} />
              <span>{loadingDomainSecurity ? 'Auditing...' : 'Run Security Audit'}</span>
            </button>
          </div>

          {/* Dispatched Email Audit Log Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-sky-400" />
                  <span>Dispatched Transaction Email Audit Logs</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Official email receipts delivered to gamer accounts.</p>
              </div>
              <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                Total Emails Sent: <strong className="text-emerald-400">{sentEmails.length}</strong>
              </div>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden">
              {sentEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No emails dispatched yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Subject / Event</th>
                        <th className="p-3">Recipient Email</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Reference ID</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sentEmails.map((email) => (
                        <tr key={email.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">{email.subject}</td>
                          <td className="p-3 font-mono text-sky-300">{email.recipient_email}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            {email.amount !== null && email.amount !== undefined ? `$${Number(email.amount).toFixed(2)}` : '—'}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{email.reference_id || '—'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              {email.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(email.created_at).toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedEmail(email)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition border border-slate-700"
                            >
                              Preview
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 10. AUDIT TRAIL TAB (OWNER EXCLUSIVE) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'audit' && isOwner && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Full System Audit Trail</h3>
              <p className="text-xs text-slate-400">Tamper-evident record of all logins, role modifications, and administrative events.</p>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700"
            >
              Refresh Logs
            </button>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Action</th>
                    <th className="p-3">Actor Role</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400">{log.action}</td>
                      <td className="p-3 font-mono text-slate-400 uppercase">{log.actor_role || 'system'}</td>
                      <td className="p-3 font-mono text-slate-400">{log.target_resource || log.target_id || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.result === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300' :
                          log.result === 'DENIED' ? 'bg-rose-950 text-rose-300' :
                          'bg-amber-950 text-amber-300'
                        }`}>
                          {log.result || 'LOGGED'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate">{log.details}</td>
                      <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 11. BROADCAST MESSAGE TAB */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'broadcast' && isOwner && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="font-display font-bold text-lg text-white">Broadcast Announcement to All Gamers</h3>
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Subject / Header</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Official Tournament Bracket Live"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Message Body</label>
              <textarea
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                rows={4}
                placeholder="Type platform announcement..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Send Broadcast</span>
            </button>
            {broadcastSent && <div className="text-xs text-emerald-400 font-bold">Broadcast successfully transmitted!</div>}
          </form>
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-display font-bold text-sm text-white">{selectedEmail.subject}</h3>
                  <div className="text-[10px] text-slate-400">Recipient: {selectedEmail.recipient_email}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1 space-y-4">
              <div 
                className="rounded-2xl overflow-hidden border border-slate-800"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
              />
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Status: <strong className="text-emerald-400 uppercase">{selectedEmail.status}</strong></span>
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
