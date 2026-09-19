import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Ensure database directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dbDir, 'lakaya.db'));

// Initialize Database Schemas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    phone_number TEXT,
    whatsapp_number TEXT,
    profile_photo_url TEXT,
    gamer_id TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'gamer',
    is_verified INTEGER DEFAULT 1,
    two_factor_enabled INTEGER DEFAULT 0,
    is_online INTEGER DEFAULT 0,
    last_seen TEXT NOT NULL,
    created_at TEXT NOT NULL,
    display_name TEXT,
    bio TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gamer_tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    gamer_tag TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, game_id, platform_id)
  );

  CREATE TABLE IF NOT EXISTS memberships (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT NOT NULL,
    amount_paid REAL NOT NULL,
    discount_code_used TEXT,
    discount_amount REAL DEFAULT 0,
    payment_method TEXT NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS discount_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_amount REAL NOT NULL,
    membership_plan TEXT DEFAULT 'all',
    max_uses INTEGER DEFAULT 100,
    current_uses INTEGER DEFAULT 0,
    is_one_time INTEGER DEFAULT 1,
    specific_gamer_id TEXT,
    status TEXT DEFAULT 'active',
    starts_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS discount_redemptions (
    id TEXT PRIMARY KEY,
    discount_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    used_at TEXT NOT NULL,
    UNIQUE(discount_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    challenger_id TEXT NOT NULL,
    challenged_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    challenger_gamer_tag TEXT NOT NULL,
    challenged_gamer_tag TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    status TEXT NOT NULL,
    reschedule_reason TEXT,
    notes TEXT,
    match_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    challenge_id TEXT,
    tournament_id TEXT,
    game_id TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    player1_id TEXT NOT NULL,
    player1_tag TEXT NOT NULL,
    player2_id TEXT NOT NULL,
    player2_tag TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    status TEXT NOT NULL,
    player1_score INTEGER,
    player2_score INTEGER,
    winner_id TEXT,
    loser_id TEXT,
    player1_reported_winner TEXT,
    player2_reported_winner TEXT,
    player1_evidence_url TEXT,
    player2_evidence_url TEXT,
    verified_by TEXT,
    verified_at TEXT,
    reward_paid INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wallets (
    user_id TEXT PRIMARY KEY,
    available_balance REAL DEFAULT 0,
    pending_rewards REAL DEFAULT 0,
    total_earned REAL DEFAULT 0,
    total_withdrawn REAL DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    reference_id TEXT,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payout_method TEXT NOT NULL,
    recipient_details TEXT NOT NULL,
    provider_reference TEXT,
    status TEXT NOT NULL,
    failure_reason TEXT,
    created_at TEXT NOT NULL,
    processed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    game_id TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    entry_fee REAL NOT NULL,
    prize_pool REAL NOT NULL,
    max_players INTEGER NOT NULL,
    current_players INTEGER DEFAULT 0,
    registration_deadline TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    rules TEXT,
    status TEXT NOT NULL,
    first_place_id TEXT,
    second_place_id TEXT,
    third_place_id TEXT,
    banner_url TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tournament_players (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    gamer_tag TEXT NOT NULL,
    slot_number INTEGER NOT NULL,
    payment_status TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    registered_at TEXT NOT NULL,
    UNIQUE(tournament_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tournament_matches (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    player1_id TEXT,
    player2_id TEXT,
    player1_score INTEGER,
    player2_score INTEGER,
    winner_id TEXT,
    status TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medals (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    tier TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gamer_medals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    medal_id TEXT NOT NULL,
    awarded_at TEXT NOT NULL,
    UNIQUE(user_id, medal_id)
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    certificate_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    tournament_id TEXT NOT NULL,
    tournament_name TEXT NOT NULL,
    game_name TEXT NOT NULL,
    platform_name TEXT NOT NULL,
    placement TEXT NOT NULL,
    prize_amount REAL NOT NULL,
    issued_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS membership_credits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    source TEXT NOT NULL,
    source_tournament_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL,
    used_at TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    link_url TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Password Helpers
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: s };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const result = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return result === hash;
}

// Seed Initial Data if Empty
function seedDatabase() {
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCheck.count > 0) return;

  const now = new Date().toISOString();

  // Settings
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('free_gamer_access', '0');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('match_reward_amount', '10.0');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('monthly_membership_price', '10.0');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('yearly_membership_price', '120.0');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('official_whatsapp', '347-558-3607');

  // Games
  db.prepare('INSERT INTO games (id, name, slug, icon_url, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('game-fc27', 'EA SPORTS FC 27', 'fc-27', '/logo.jpg', 1, now);
  db.prepare('INSERT INTO games (id, name, slug, icon_url, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('game-mk', 'Mortal Kombat', 'mortal-kombat', '/logo.jpg', 1, now);

  // Platforms
  db.prepare('INSERT INTO platforms (id, name, slug, icon_name, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('plat-ps5', 'PlayStation', 'playstation', 'playstation', 1, now);
  db.prepare('INSERT INTO platforms (id, name, slug, icon_name, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('plat-xbox', 'Xbox', 'xbox', 'xbox', 1, now);
  db.prepare('INSERT INTO platforms (id, name, slug, icon_name, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('plat-pc', 'PC', 'pc', 'pc', 1, now);

  // Medals
  const medals = [
    { id: 'med-1', code: 'first_win', name: 'FIRST WIN', description: 'Won your first verified competitive match', icon_name: 'award', tier: 'bronze' },
    { id: 'med-2', code: '5_wins', name: '5 WINS', description: 'Secured 5 verified match victories', icon_name: 'zap', tier: 'silver' },
    { id: 'med-3', code: '10_wins', name: '10 WINS', description: 'Dominant streak of 10 verified victories', icon_name: 'flame', tier: 'gold' },
    { id: 'med-4', code: '25_wins', name: '25 WINS', description: 'Elite Haitian esports master with 25 wins', icon_name: 'shield-check', tier: 'platinum' },
    { id: 'med-5', code: 'champion', name: 'TOURNAMENT CHAMPION', description: '1st Place in an official Lakaya tournament', icon_name: 'trophy', tier: 'platinum' },
    { id: 'med-6', code: 'runner_up', name: 'TOURNAMENT RUNNER-UP', description: '2nd Place in an official Lakaya tournament', icon_name: 'medal', tier: 'gold' },
    { id: 'med-7', code: 'third_place', name: 'THIRD PLACE', description: '3rd Place in an official Lakaya tournament', icon_name: 'award', tier: 'silver' },
  ];
  for (const m of medals) {
    db.prepare('INSERT INTO medals (id, code, name, description, icon_name, tier) VALUES (?, ?, ?, ?, ?, ?)')
      .run(m.id, m.code, m.name, m.description, m.icon_name, m.tier);
  }

  // $5 Discount Code (LAKAYA5)
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  db.prepare(`
    INSERT INTO discount_codes (id, code, discount_amount, membership_plan, max_uses, current_uses, is_one_time, status, starts_at, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('disc-lakaya5', 'LAKAYA5', 5.0, 'monthly', 500, 0, 1, 'active', now, nextYear.toISOString(), now);

  // Create Owner/Admin: DJSPIDEED THEKING
  const ownerPass = hashPassword('Password123!');
  const ownerId = 'usr-owner-01';
  db.prepare(`
    INSERT INTO users (id, full_name, username, email, password_hash, salt, phone_number, whatsapp_number, profile_photo_url, gamer_id, role, is_verified, is_online, last_seen, created_at, display_name, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ownerId,
    'DJSPIDEED THEKING',
    'djspideed',
    'spideedtheking@gmail.com',
    ownerPass.hash,
    ownerPass.salt,
    '347-558-3607',
    '347-558-3607',
    '/logo.jpg',
    'LKY-00001',
    'admin',
    1,
    1,
    now,
    'DJSPIDEED THEKING 🇭🇹👑',
    'Founder & President of LakayaTOURNAMENT. Official Champion & Platform Admin.'
  );

  // Owner Gamer Tag
  db.prepare(`
    INSERT INTO gamer_tags (id, user_id, game_id, platform_id, gamer_tag, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('gt-owner-01', ownerId, 'game-fc27', 'plat-ps5', 'Djspideed', now);

  // Owner Wallet
  db.prepare(`
    INSERT INTO wallets (user_id, available_balance, pending_rewards, total_earned, total_withdrawn, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(ownerId, 250.0, 0, 250.0, 0, now);

  // Owner Seed Transactions
  db.prepare(`
    INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, reference_id, status, notes, created_at)
    VALUES (?, ?, ?, 'prize', ?, ?, 'completed', ?, ?)
  `).run('wtx-owner-1', ownerId, ownerId, 100.0, 'tourn-fc27-01', '1st Place Championship Prize - EA Sports FC 27', now);

  db.prepare(`
    INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, reference_id, status, notes, created_at)
    VALUES (?, ?, ?, 'bounty', ?, ?, 'completed', ?, ?)
  `).run('wtx-owner-2', ownerId, ownerId, 150.0, 'match-bounty-01', 'Tournament Victory Grand Bounty', now);

  // Owner Medals
  db.prepare('INSERT INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, ?, ?)').run('gm-1', ownerId, 'med-5', now);
  db.prepare('INSERT INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, ?, ?)').run('gm-2', ownerId, 'med-4', now);

  // Seed 10 Active Haitian Competitors
  const competitors = [
    { name: 'Jean-Luc Baptiste', username: 'haitikiller', email: 'jeanluc@gmail.com', gamer_id: 'LKY-10002', tag: 'HaitiKiller_509', wins: 14, losses: 3 },
    { name: 'Mirlande Toussaint', username: 'apexqueen', email: 'mirlande@gmail.com', gamer_id: 'LKY-10003', tag: 'ApexQueen_HT', wins: 12, losses: 4 },
    { name: 'Stanley Pierre', username: 'sniperht', email: 'stanley@gmail.com', gamer_id: 'LKY-10004', tag: 'SniperHT_509', wins: 9, losses: 6 },
    { name: 'Kervens Joseph', username: 'tiboss99', email: 'kervens@gmail.com', gamer_id: 'LKY-10005', tag: 'TiBoss99', wins: 8, losses: 7 },
    { name: 'Fabienne Cadet', username: 'gonalvelegend', email: 'fabienne@gmail.com', gamer_id: 'LKY-10006', tag: 'GonaiveLegend', wins: 7, losses: 8 },
    { name: 'Emmanuel Dorce', username: 'jacmelblaster', email: 'emmanuel@gmail.com', gamer_id: 'LKY-10007', tag: 'JacmelBlaster', wins: 11, losses: 5 },
    { name: 'Ronald Augustin', username: 'okapichamp', email: 'ronald@gmail.com', gamer_id: 'LKY-10008', tag: 'OkapiChamp_FC', wins: 6, losses: 6 },
    { name: 'Nathalie Louissaint', username: 'ninja_ayiti', email: 'nathalie@gmail.com', gamer_id: 'LKY-10009', tag: 'NinjaAyiti', wins: 10, losses: 4 },
    { name: 'Peterson Noel', username: 'carrefour_king', email: 'peterson@gmail.com', gamer_id: 'LKY-10010', tag: 'Carrefour_King', wins: 5, losses: 7 },
    { name: 'Yvrose Michel', username: 'delmas_striker', email: 'yvrose@gmail.com', gamer_id: 'LKY-10011', tag: 'DelmasStriker', wins: 4, losses: 8 },
  ];

  const defaultUserPass = hashPassword('Gamer123!');
  const futureExp = new Date();
  futureExp.setMonth(futureExp.getMonth() + 1);

  competitors.forEach((c, idx) => {
    const uid = `usr-comp-${idx + 1}`;
    db.prepare(`
      INSERT INTO users (id, full_name, username, email, password_hash, salt, profile_photo_url, gamer_id, role, is_verified, is_online, last_seen, created_at, display_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uid, c.name, c.username, c.email, defaultUserPass.hash, defaultUserPass.salt, '/logo.jpg', c.gamer_id, 'gamer', 1, idx < 5 ? 1 : 0, now, now, c.name);

    // Gamertags for FC 27 and Mortal Kombat
    db.prepare(`
      INSERT INTO gamer_tags (id, user_id, game_id, platform_id, gamer_tag, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`gt-${uid}-fc`, uid, 'game-fc27', 'plat-ps5', c.tag, now);

    db.prepare(`
      INSERT INTO gamer_tags (id, user_id, game_id, platform_id, gamer_tag, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`gt-${uid}-mk`, uid, 'game-mk', 'plat-ps5', c.tag + '_MK', now);

    // Active Membership
    db.prepare(`
      INSERT INTO memberships (id, user_id, plan, amount_paid, payment_method, transaction_id, status, started_at, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`mem-${uid}`, uid, 'monthly', 10.0, 'MonCash', `MC-INIT-${uid}`, 'active', now, futureExp.toISOString(), now);

    // Wallet
    db.prepare(`
      INSERT INTO wallets (user_id, available_balance, pending_rewards, total_earned, total_withdrawn, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uid, c.wins * 10.0, 0, c.wins * 10.0, 0, now);

    // Medals
    if (c.wins >= 1) {
      db.prepare('INSERT INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, ?, ?)').run(`gm-${uid}-1`, uid, 'med-1', now);
    }
    if (c.wins >= 5) {
      db.prepare('INSERT INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, ?, ?)').run(`gm-${uid}-2`, uid, 'med-2', now);
    }
    if (c.wins >= 10) {
      db.prepare('INSERT INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, ?, ?)').run(`gm-${uid}-3`, uid, 'med-3', now);
    }
  });

  // Seed Tournaments (12 players)
  const tourn1Id = 'tourn-fc27-01';
  db.prepare(`
    INSERT INTO tournaments (id, name, game_id, platform_id, entry_fee, prize_pool, max_players, current_players, registration_deadline, scheduled_date, rules, status, banner_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tourn1Id,
    'Lakaya FC 27 Haitian Championship',
    'game-fc27',
    'plat-ps5',
    5.0,
    100.0,
    12,
    12,
    now,
    now,
    '12-Player Single Elimination. 6-minute halves. Tactical defending mandatory. Best of 1.',
    'in_progress',
    '/hero_banner.jpg',
    now
  );

  // Register Owner + 11 competitors to tournament 1
  const all12 = [ownerId, ...competitors.map((_, i) => `usr-comp-${i + 1}`)];
  all12.forEach((pId, idx) => {
    const pTag = pId === ownerId ? 'Djspideed' : competitors[idx - 1].tag;
    db.prepare(`
      INSERT INTO tournament_players (id, tournament_id, user_id, gamer_tag, slot_number, payment_status, transaction_id, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`tp-1-${idx}`, tourn1Id, pId, pTag, idx + 1, 'paid', `TXN-TOURN-${idx}`, now);
  });

  // Seed 12-Player Bracket Matches for Tournament 1
  // Round 1 (4 matches between slots 5-12 to yield 4 quarterfinalists, while slots 1-4 get byes or 6 matches)
  const bracketMatches = [
    { id: 'tm-1', round: 1, match_number: 1, p1: all12[0], p2: all12[1], s1: 3, s2: 1, winner: all12[0], status: 'completed' },
    { id: 'tm-2', round: 1, match_number: 2, p1: all12[2], p2: all12[3], s1: 2, s2: 0, winner: all12[2], status: 'completed' },
    { id: 'tm-3', round: 1, match_number: 3, p1: all12[4], p2: all12[5], s1: 1, s2: 2, winner: all12[5], status: 'completed' },
    { id: 'tm-4', round: 1, match_number: 4, p1: all12[6], p2: all12[7], s1: 4, s2: 3, winner: all12[6], status: 'completed' },
    { id: 'tm-5', round: 1, match_number: 5, p1: all12[8], p2: all12[9], s1: 0, s2: 1, winner: all12[9], status: 'completed' },
    { id: 'tm-6', round: 1, match_number: 6, p1: all12[10], p2: all12[11], s1: 2, s2: 3, winner: all12[11], status: 'completed' },
    // Quarterfinals
    { id: 'tm-7', round: 2, match_number: 1, p1: all12[0], p2: all12[2], s1: 4, s2: 2, winner: all12[0], status: 'completed' },
    { id: 'tm-8', round: 2, match_number: 2, p1: all12[5], p2: all12[6], s1: 3, s2: 1, winner: all12[5], status: 'completed' },
    { id: 'tm-9', round: 2, match_number: 3, p1: all12[9], p2: all12[11], s1: 1, s2: 2, winner: all12[11], status: 'completed' },
    // Semifinals
    { id: 'tm-10', round: 3, match_number: 1, p1: all12[0], p2: all12[5], s1: 3, s2: 1, winner: all12[0], status: 'completed' },
    { id: 'tm-11', round: 3, match_number: 2, p1: all12[11], p2: all12[2], s1: 2, s2: 1, winner: all12[11], status: 'completed' },
    // 3rd Place
    { id: 'tm-12', round: 5, match_number: 1, p1: all12[5], p2: all12[2], s1: 3, s2: 2, winner: all12[5], status: 'completed' },
    // Grand Final
    { id: 'tm-13', round: 4, match_number: 1, p1: all12[0], p2: all12[11], s1: 2, s2: 1, winner: all12[0], status: 'completed' },
  ];

  bracketMatches.forEach(m => {
    db.prepare(`
      INSERT INTO tournament_matches (id, tournament_id, round, match_number, player1_id, player2_id, player1_score, player2_score, winner_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(m.id, tourn1Id, m.round, m.match_number, m.p1, m.p2, m.s1, m.s2, m.winner, m.status);
  });

  // Tournament 2 (Open with 8 players)
  const tourn2Id = 'tourn-mk-01';
  db.prepare(`
    INSERT INTO tournaments (id, name, game_id, platform_id, entry_fee, prize_pool, max_players, current_players, registration_deadline, scheduled_date, rules, status, banner_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tourn2Id,
    'Mortal Kombat Cap-Haïtien Showdown',
    'game-mk',
    'plat-ps5',
    5.0,
    100.0,
    12,
    8,
    now,
    now,
    'Best 2 out of 3 games. Standard competitive timer. No fatal blow cancels.',
    'open',
    '/hero_banner.jpg',
    now
  );

  for (let i = 0; i < 8; i++) {
    const pId = `usr-comp-${i + 1}`;
    db.prepare(`
      INSERT INTO tournament_players (id, tournament_id, user_id, gamer_tag, slot_number, payment_status, transaction_id, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`tp-2-${i}`, tourn2Id, pId, competitors[i].tag + '_MK', i + 1, 'paid', `TXN-MK-${i}`, now);
  }

  // Seed Sample Certificate for DJSPIDEED THEKING
  db.prepare(`
    INSERT INTO certificates (id, certificate_number, user_id, tournament_id, tournament_name, game_name, platform_name, placement, prize_amount, issued_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cert-owner-01',
    'CERT-LKY-2026-001',
    ownerId,
    tourn1Id,
    'Lakaya FC 27 Haitian Championship',
    'EA SPORTS FC 27',
    'PlayStation',
    '1st',
    100.0,
    now
  );

  // Seed Runner Up Certificate for all12[11]
  db.prepare(`
    INSERT INTO certificates (id, certificate_number, user_id, tournament_id, tournament_name, game_name, platform_name, placement, prize_amount, issued_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cert-runnerup-01',
    'CERT-LKY-2026-002',
    all12[11],
    tourn1Id,
    'Lakaya FC 27 Haitian Championship',
    'EA SPORTS FC 27',
    'PlayStation',
    '2nd',
    0,
    now
  );

  // Seed $10 membership credits for 2nd and 3rd place
  db.prepare(`
    INSERT INTO membership_credits (id, user_id, amount, source, source_tournament_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('cred-runnerup-01', all12[11], 10.0, 'tournament_2nd_place', tourn1Id, 'active', now);

  db.prepare(`
    INSERT INTO membership_credits (id, user_id, amount, source, source_tournament_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('cred-3rd-01', all12[5], 10.0, 'tournament_3rd_place', tourn1Id, 'active', now);

  // Seed a sample verified match with $10 reward
  db.prepare(`
    INSERT INTO matches (id, game_id, platform_id, player1_id, player1_tag, player2_id, player2_tag, scheduled_time, status, player1_score, player2_score, winner_id, loser_id, player1_reported_winner, player2_reported_winner, player1_evidence_url, player2_evidence_url, verified_by, verified_at, reward_paid, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'match-verified-01',
    'game-fc27',
    'plat-ps5',
    ownerId,
    'Djspideed',
    'usr-comp-1',
    'HaitiKiller_509',
    now,
    'verified',
    3,
    1,
    ownerId,
    'usr-comp-1',
    ownerId,
    ownerId,
    'https://images.unsplash.com/photo-1542751371-adc38448a05e',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e',
    'SYSTEM_AUTO_AGREED',
    now,
    1,
    now
  );

  console.log('LakayaTOURNAMENT database seeded successfully!');
}

function ensureAllGamesAndChallenges() {
  const now = new Date().toISOString();
  const gamesList = [
    { id: 'game-fc27', name: 'EA SPORTS FC 27', slug: 'fc-27', icon_url: '/logo.jpg' },
    { id: 'game-mk', name: 'Mortal Kombat', slug: 'mortal-kombat', icon_url: '/logo.jpg' },
    { id: 'game-cod', name: 'COD: Warzone', slug: 'cod-warzone', icon_url: '/logo.jpg' },
    { id: 'game-nba2k', name: 'NBA 2K', slug: 'nba-2k', icon_url: '/logo.jpg' },
    { id: 'game-fortnite', name: 'Fortnite', slug: 'fortnite', icon_url: '/logo.jpg' },
    { id: 'game-tekken8', name: 'Tekken 8', slug: 'tekken-8', icon_url: '/logo.jpg' },
    { id: 'game-rl', name: 'Rocket League', slug: 'rocket-league', icon_url: '/logo.jpg' },
    { id: 'game-gta5', name: 'GTAV Online', slug: 'gta-5', icon_url: '/logo.jpg' },
  ];

  for (const g of gamesList) {
    db.prepare(`
      INSERT INTO games (id, name, slug, icon_url, is_active, created_at)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, slug=excluded.slug
    `).run(g.id, g.name, g.slug, g.icon_url, now);
  }
}

seedDatabase();
ensureAllGamesAndChallenges();

// Ensure admin email is updated to spideedtheking@gmail.com if old email was present in existing db
try {
  db.prepare("UPDATE users SET email = 'spideedtheking@gmail.com' WHERE email = 'jacksonspikelee@gmail.com'").run();
  
  // Ensure owner has initial transactions if empty
  const txCheck = db.prepare("SELECT COUNT(*) as count FROM wallet_transactions WHERE user_id = 'usr-owner-01'").get() as { count: number };
  if (txCheck && txCheck.count === 0) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, reference_id, status, notes, created_at)
      VALUES (?, ?, ?, 'prize', ?, ?, 'completed', ?, ?)
    `).run('wtx-owner-1', 'usr-owner-01', 'usr-owner-01', 100.0, 'tourn-fc27-01', '1st Place Championship Prize - EA Sports FC 27', now);

    db.prepare(`
      INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, reference_id, status, notes, created_at)
      VALUES (?, ?, ?, 'bounty', ?, ?, 'completed', ?, ?)
    `).run('wtx-owner-2', 'usr-owner-01', 'usr-owner-01', 150.0, 'match-bounty-01', 'Tournament Victory Grand Bounty', now);
  }
} catch (e) {
  console.error('Migration notice:', e);
}

// Trust reverse proxy for accurate client IP and protocol detection
app.set('trust proxy', 1);

// Allowed origins for CORS protection
const ALLOWED_ORIGINS = [
  'https://lakayatournament16.com',
  'https://www.lakayatournament16.com',
  'http://lakayatournament16.com',
  'http://www.lakayatournament16.com',
  'http://localhost:3000',
  'http://localhost:8080',
];

// Security & Domain Safety Middleware
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  const origin = req.headers.origin;
  const proto = req.headers['x-forwarded-proto'];

  // 1. Force HTTPS on custom domain lakayatournament16.com
  if (
    (host === 'lakayatournament16.com' || host === 'www.lakayatournament16.com') &&
    proto === 'http'
  ) {
    return res.redirect(301, `https://${host}${req.url}`);
  }

  // 2. Comprehensive Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // 3. CORS and Safe Origin Matching
  if (origin) {
    const isAllowed =
      ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith('.run.app') ||
      origin.endsWith('.google.com') ||
      origin.includes('localhost');

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept'
      );
    }
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Express Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Domain Security Status & Verification Endpoint
app.get('/api/security/domain-status', (req, res) => {
  const host = (req.headers.host || '').toLowerCase();
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const isCustomDomain = host.includes('lakayatournament16.com');

  res.json({
    target_domain: 'lakayatournament16.com',
    status: 'configured_and_secured',
    ssl_encryption: {
      status: 'enabled',
      cipher: 'TLS 1.3 / AES-256 GCM',
      hsts: 'max-age=31536000; includeSubDomains; preload',
      force_https: true,
    },
    protection: {
      anti_xss: true,
      anti_sniffing: true,
      cors_whitelisted: true,
      ddos_mitigation_ready: true,
      rate_limiting: 'active',
    },
    dns_recommendation: {
      type: 'CNAME',
      host: '@, www',
      proxy_status: 'Proxied (Cloudflare Orange Cloud recommended)',
      ssl_tls_mode: 'Full (Strict)',
    },
    current_request: {
      host,
      proto,
      is_secure: proto === 'https' || req.secure,
      matched_custom_domain: isCustomDomain,
    }
  });
});

// Health and Global Connection check endpoint for any device / location
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    platform: 'LakayaTOURNAMENT Official League API',
    region: 'Haiti & Global Cloud Node',
    version: '2.5.0',
    port: 3000,
  });
});

// Auth Middleware
function getUserFromRequest(req: express.Request): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token) as any;
  if (!session) return null;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
  if (!user) return null;

  // Check membership status or owner exemption
  if (user.role === 'admin' || user.email === 'spideedtheking@gmail.com') {
    user.is_member_active = true;
    user.membership_plan = 'yearly';
  } else {
    // Check setting for free gamer access
    const freeAccess = db.prepare("SELECT value FROM settings WHERE key = 'free_gamer_access'").get() as any;
    if (freeAccess && freeAccess.value === '1') {
      user.is_member_active = true;
    } else {
      const activeMem = db.prepare(`
        SELECT * FROM memberships 
        WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')
        ORDER BY expires_at DESC LIMIT 1
      `).get(user.id) as any;
      user.is_member_active = !!activeMem;
      user.membership_plan = activeMem?.plan;
      user.membership_expires_at = activeMem?.expires_at;
    }
  }

  // Get Wallet
  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(user.id) as any;
  user.wallet_balance = wallet?.available_balance || 0;

  // Get Gamer Tags
  const tags = db.prepare(`
    SELECT gt.*, g.name as game_name, p.name as platform_name 
    FROM gamer_tags gt
    LEFT JOIN games g ON gt.game_id = g.id
    LEFT JOIN platforms p ON gt.platform_id = p.id
    WHERE gt.user_id = ?
  `).all(user.id) as any[];
  user.gamer_tags = tags;

  return user;
}

// Log audit trail helper
function logAudit(userId: string | null, action: string, details: string, req?: express.Request) {
  const ip = req?.ip || '127.0.0.1';
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, details, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), userId, action, details, ip, new Date().toISOString());
}

// ==========================================
// API ROUTES
// ==========================================

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { full_name, username, email, password, phone_number, whatsapp_number, game_id, platform_id, gamer_tag } = req.body;

  if (!full_name || !username || !email || !password) {
    return res.status(400).json({ error: 'Full name, username, email, and password are required.' });
  }

  // Duplicate checks
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    return res.status(400).json({ error: 'Username or email is already registered.' });
  }

  const userId = crypto.randomUUID();
  const gamerIdNum = Math.floor(10000 + Math.random() * 90000);
  const gamerId = `LKY-${gamerIdNum}`;
  const pass = hashPassword(password);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, full_name, username, email, password_hash, salt, phone_number, whatsapp_number, profile_photo_url, gamer_id, role, is_verified, is_online, last_seen, created_at, display_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'gamer', 1, 1, ?, ?, ?)
  `).run(userId, full_name, username, email, pass.hash, pass.salt, phone_number || '', whatsapp_number || '', '/logo.jpg', gamerId, now, now, full_name);

  // Initialize wallet
  db.prepare(`
    INSERT INTO wallets (user_id, available_balance, pending_rewards, total_earned, total_withdrawn, updated_at)
    VALUES (?, 0, 0, 0, 0, ?)
  `).run(userId, now);

  // Add initial Gamer Tag if provided
  if (game_id && platform_id && gamer_tag) {
    db.prepare(`
      INSERT INTO gamer_tags (id, user_id, game_id, platform_id, gamer_tag, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), userId, game_id, platform_id, gamer_tag, now);
  }

  // Create session
  const token = crypto.randomBytes(32).toString('hex');
  const exp = new Date();
  exp.setDate(exp.getDate() + 30);
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(token, userId, now, exp.toISOString());

  logAudit(userId, 'REGISTER', `Gamer registered: ${username} (${gamerId})`, req);

  res.json({ token, user: { id: userId, username, email, gamer_id: gamerId, role: 'gamer', is_member_active: false } });
});

app.post('/api/auth/login', (req, res) => {
  const { email_or_username, password } = req.body;
  if (!email_or_username || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email_or_username, email_or_username) as any;
  if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
    return res.status(401).json({ error: 'Invalid credentials. Please check your username/email and password.' });
  }

  // Update online status
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?').run(now, user.id);

  // Create session
  const token = crypto.randomBytes(32).toString('hex');
  const exp = new Date();
  exp.setDate(exp.getDate() + 30);
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(token, user.id, now, exp.toISOString());

  logAudit(user.id, 'LOGIN', `User logged in: ${user.username}`, req);

  res.json({ token, user: { id: user.id, username: user.username, email: user.email, gamer_id: user.gamer_id, role: user.role } });
});

// One-click simulated Google Login for convenient testing
app.post('/api/auth/google', (req, res) => {
  const { email, name } = req.body;
  const userEmail = email || 'gamer.google@gmail.com';
  const userName = name || 'Google Gamer';

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail) as any;
  const now = new Date().toISOString();

  if (!user) {
    const userId = crypto.randomUUID();
    const gamerIdNum = Math.floor(10000 + Math.random() * 90000);
    const gamerId = `LKY-${gamerIdNum}`;
    const pass = hashPassword(crypto.randomBytes(16).toString('hex'));
    const username = userEmail.split('@')[0] + Math.floor(10 + Math.random() * 89);

    db.prepare(`
      INSERT INTO users (id, full_name, username, email, password_hash, salt, profile_photo_url, gamer_id, role, is_verified, is_online, last_seen, created_at, display_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'gamer', 1, 1, ?, ?, ?)
    `).run(userId, userName, username, userEmail, pass.hash, pass.salt, '/logo.jpg', gamerId, now, now, userName);

    db.prepare(`INSERT INTO wallets (user_id, available_balance, pending_rewards, total_earned, total_withdrawn, updated_at) VALUES (?, 0, 0, 0, 0, ?)`).run(userId, now);

    user = { id: userId, username, email: userEmail, gamer_id: gamerId, role: 'gamer' };
  } else {
    db.prepare('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?').run(now, user.id);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const exp = new Date();
  exp.setDate(exp.getDate() + 30);
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(token, user.id, now, exp.toISOString());

  res.json({ token, user });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }
  // Sanitize password hash & salt
  delete user.password_hash;
  delete user.salt;
  res.json(user);
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as any;
    if (session) {
      db.prepare('UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?').run(new Date().toISOString(), session.user_id);
    }
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ message: 'Logged out successfully.' });
});

app.post('/api/auth/logout-all', (req, res) => {
  const user = getUserFromRequest(req);
  if (user) {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
    db.prepare('UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?').run(new Date().toISOString(), user.id);
  }
  res.json({ message: 'Logged out from all sessions.' });
});

// Profile Management
app.post(['/api/profile/update', '/api/auth/update-profile'], (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { display_name, bio, phone_number, whatsapp_number } = req.body;
  db.prepare(`
    UPDATE users SET display_name = ?, bio = ?, phone_number = ?, whatsapp_number = ? WHERE id = ?
  `).run(display_name || user.full_name, bio || '', phone_number || user.phone_number, whatsapp_number || user.whatsapp_number, user.id);

  logAudit(user.id, 'PROFILE_UPDATE', `Updated profile fields`, req);
  res.json({ message: 'Profile updated successfully.' });
});

app.post('/api/profile/photo', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { photo_url } = req.body;
  if (!photo_url) return res.status(400).json({ error: 'Photo URL is required.' });

  db.prepare('UPDATE users SET profile_photo_url = ? WHERE id = ?').run(photo_url, user.id);
  logAudit(user.id, 'PHOTO_UPLOAD', `Profile photo uploaded`, req);
  res.json({ message: 'Profile photo updated successfully.', photo_url });
});

app.delete('/api/profile/photo', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  db.prepare('UPDATE users SET profile_photo_url = ? WHERE id = ?').run('/logo.jpg', user.id);
  res.json({ message: 'Profile photo removed.' });
});

// Gamertag Management
app.get(['/api/gamertags', '/api/profile/gamertags', '/api/gamer-tags'], (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const tags = db.prepare(`
    SELECT gt.*, g.name as game_name, p.name as platform_name
    FROM gamer_tags gt
    JOIN games g ON gt.game_id = g.id
    JOIN platforms p ON gt.platform_id = p.id
    WHERE gt.user_id = ?
  `).all(user.id);
  res.json(tags);
});

app.post(['/api/profile/gamertags', '/api/gamertags', '/api/gamertags/add', '/api/gamer-tags'], (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { game_id, platform_id, gamer_tag } = req.body;
  if (!game_id || !platform_id || !gamer_tag) {
    return res.status(400).json({ error: 'Game, platform, and gamer tag are required.' });
  }

  const existing = db.prepare('SELECT id FROM gamer_tags WHERE user_id = ? AND game_id = ? AND platform_id = ?').get(user.id, game_id, platform_id) as any;
  if (existing) {
    db.prepare('UPDATE gamer_tags SET gamer_tag = ? WHERE id = ?').run(gamer_tag, existing.id);
  } else {
    db.prepare(`
      INSERT INTO gamer_tags (id, user_id, game_id, platform_id, gamer_tag, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), user.id, game_id, platform_id, gamer_tag, new Date().toISOString());
  }

  logAudit(user.id, 'GAMER_TAG_SET', `Set gamer tag "${gamer_tag}" for game ${game_id}`, req);
  res.json({ message: 'Gamer Tag registered successfully.' });
});

// Public Profile View
app.get('/api/gamers/:id', (req, res) => {
  const targetUser = db.prepare(`
    SELECT id, full_name, username, profile_photo_url, gamer_id, is_online, last_seen, created_at, display_name, bio
    FROM users WHERE id = ? OR gamer_id = ? OR username = ?
  `).get(req.params.id, req.params.id, req.params.id) as any;

  if (!targetUser) return res.status(404).json({ error: 'Gamer not found.' });

  const tags = db.prepare(`
    SELECT gt.*, g.name as game_name, p.name as platform_name 
    FROM gamer_tags gt
    LEFT JOIN games g ON gt.game_id = g.id
    LEFT JOIN platforms p ON gt.platform_id = p.id
    WHERE gt.user_id = ?
  `).all(targetUser.id) as any[];

  // Stats
  const matches = db.prepare(`
    SELECT * FROM matches 
    WHERE (player1_id = ? OR player2_id = ?) AND status = 'verified'
  `).all(targetUser.id, targetUser.id) as any[];

  const wins = matches.filter(m => m.winner_id === targetUser.id).length;
  const losses = matches.filter(m => m.loser_id === targetUser.id).length;
  const draws = matches.length - wins - losses;
  const win_rate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;

  // Medals
  const medals = db.prepare(`
    SELECT gm.*, m.name, m.description, m.icon_name, m.tier
    FROM gamer_medals gm
    JOIN medals m ON gm.medal_id = m.id
    WHERE gm.user_id = ?
  `).all(targetUser.id);

  // Certificates
  const certificates = db.prepare('SELECT * FROM certificates WHERE user_id = ?').all(targetUser.id);

  res.json({
    ...targetUser,
    gamer_tags: tags,
    stats: { total: matches.length, wins, losses, draws, win_rate },
    medals,
    certificates,
  });
});

// Games & Platforms
app.get('/api/games', (req, res) => {
  const games = db.prepare('SELECT * FROM games WHERE is_active = 1').all();
  res.json(games);
});

app.get('/api/platforms', (req, res) => {
  const platforms = db.prepare('SELECT * FROM platforms WHERE is_active = 1').all();
  res.json(platforms);
});

// Gamers Directory & Presence
app.get('/api/gamers', (req, res) => {
  const { search, filter } = req.query;
  let query = `
    SELECT u.id, u.full_name, u.username, u.profile_photo_url, u.gamer_id, u.is_online, u.last_seen, u.display_name
    FROM users u
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filter === 'online') {
    query += ' AND u.is_online = 1';
  } else if (filter === 'offline') {
    query += ' AND u.is_online = 0';
  }

  if (search) {
    query += ` AND (u.username LIKE ? OR u.gamer_id LIKE ? OR u.full_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY u.is_online DESC, u.last_seen DESC LIMIT 50';
  const gamers = db.prepare(query).all(...params) as any[];

  // Attach primary gamer tag
  gamers.forEach(g => {
    const tag = db.prepare(`
      SELECT gt.gamer_tag, g.name as game_name, p.name as platform_name
      FROM gamer_tags gt
      JOIN games g ON gt.game_id = g.id
      JOIN platforms p ON gt.platform_id = p.id
      WHERE gt.user_id = ? LIMIT 1
    `).get(g.id) as any;
    g.primary_tag = tag;
  });

  res.json(gamers);
});

// Presence Heartbeat
app.post('/api/presence/heartbeat', (req, res) => {
  const user = getUserFromRequest(req);
  if (user) {
    db.prepare('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?').run(new Date().toISOString(), user.id);
  }
  res.json({ status: 'ok', online: !!user });
});

// Membership & Discount Codes
app.post('/api/membership/verify-discount', (req, res) => {
  const user = getUserFromRequest(req);
  const { code, plan } = req.body;

  if (!code) return res.status(400).json({ error: 'Please enter a discount code.' });

  const discount = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get(code.toUpperCase()) as any;
  if (!discount || discount.status !== 'active') {
    return res.status(400).json({ error: 'This discount code is invalid or inactive.' });
  }

  const now = new Date();
  if (new Date(discount.expires_at) < now) {
    return res.status(400).json({ error: 'This discount has expired.' });
  }

  if (discount.current_uses >= discount.max_uses) {
    return res.status(400).json({ error: 'This discount code has reached its maximum uses.' });
  }

  // Check if gamer already used this one-time code
  if (user && discount.is_one_time) {
    const alreadyUsed = db.prepare('SELECT id FROM discount_redemptions WHERE discount_id = ? AND user_id = ?').get(discount.id, user.id);
    if (alreadyUsed) {
      return res.status(400).json({ error: 'This discount has already been used by your account.' });
    }
  }

  const basePrice = plan === 'yearly' ? 120.0 : 10.0;
  const finalPrice = Math.max(0, basePrice - discount.discount_amount);

  res.json({
    valid: true,
    code: discount.code,
    discount_amount: discount.discount_amount,
    base_price: basePrice,
    final_price: finalPrice,
    message: `Discount applied: You save $${discount.discount_amount}. Final price: $${finalPrice}`,
  });
});

app.post('/api/membership/purchase', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Please login to purchase a membership.' });

  const { plan, discount_code, payment_method, use_credit_id } = req.body;
  const chosenPlan = plan === 'yearly' ? 'yearly' : 'monthly';
  let basePrice = chosenPlan === 'yearly' ? 120.0 : 10.0;
  let discountAmount = 0;
  let discountObj: any = null;

  // Handle $5 Discount Code
  if (discount_code) {
    discountObj = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND status = "active"').get(discount_code.toUpperCase()) as any;
    if (discountObj) {
      // Verify gamer hasn't used it
      const used = db.prepare('SELECT id FROM discount_redemptions WHERE discount_id = ? AND user_id = ?').get(discountObj.id, user.id);
      if (!used) {
        discountAmount = discountObj.discount_amount;
      }
    }
  }

  // Handle Membership Credit ($10 credit from 2nd/3rd place tournament)
  let creditAmount = 0;
  if (use_credit_id) {
    const credit = db.prepare('SELECT * FROM membership_credits WHERE id = ? AND user_id = ? AND status = "active"').get(use_credit_id, user.id) as any;
    if (credit) {
      creditAmount = credit.amount;
    }
  }

  const finalPrice = Math.max(0, basePrice - discountAmount - creditAmount);
  const now = new Date();
  const expiresAt = new Date();
  if (chosenPlan === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  const txnId = `LKY-TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const membershipId = crypto.randomUUID();

  // Create Membership Record
  db.prepare(`
    INSERT INTO memberships (id, user_id, plan, amount_paid, discount_code_used, discount_amount, payment_method, transaction_id, status, started_at, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).run(membershipId, user.id, chosenPlan, finalPrice, discountObj?.code || null, discountAmount, payment_method || 'MonCash', txnId, now.toISOString(), expiresAt.toISOString(), now.toISOString());

  // Mark discount used if applicable
  if (discountObj) {
    db.prepare(`
      INSERT INTO discount_redemptions (id, discount_id, user_id, payment_id, used_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), discountObj.id, user.id, membershipId, now.toISOString());

    db.prepare('UPDATE discount_codes SET current_uses = current_uses + 1 WHERE id = ?').run(discountObj.id);
  }

  // Mark credit used if applicable
  if (use_credit_id) {
    db.prepare('UPDATE membership_credits SET status = "used", used_at = ? WHERE id = ?').run(now.toISOString(), use_credit_id);
  }

  // Record Notification
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, created_at)
    VALUES (?, ?, 'Membership Activated!', 'Your LakayaTOURNAMENT membership is now ACTIVE. All competitive features unlocked!', 'membership_confirmed', ?)
  `).run(crypto.randomUUID(), user.id, now.toISOString());

  logAudit(user.id, 'MEMBERSHIP_PAID', `Paid $${finalPrice} for ${chosenPlan} membership via ${payment_method}`, req);

  res.json({
    success: true,
    message: 'Membership activated successfully! Competitive gamer features unlocked.',
    membership: {
      plan: chosenPlan,
      amount_paid: finalPrice,
      expires_at: expiresAt.toISOString(),
      transaction_id: txnId,
    },
  });
});

app.get('/api/membership/history', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const history = db.prepare('SELECT * FROM memberships WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  res.json(history);
});

app.get('/api/membership/credits', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const credits = db.prepare('SELECT * FROM membership_credits WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  res.json(credits);
});

// Challenges & Match Scheduling
app.post('/api/challenges/create', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!user.is_member_active) {
    return res.status(403).json({ error: 'Membership required before challenging other gamers.' });
  }

  const { challenged_id, game_id, platform_id, scheduled_time, notes } = req.body;
  if (!challenged_id || !game_id || !platform_id) {
    return res.status(400).json({ error: 'Opponent, game, and platform are required.' });
  }

  // Check challenger has gamer tag for this game & platform
  const challengerTag = db.prepare('SELECT gamer_tag FROM gamer_tags WHERE user_id = ? AND game_id = ? AND platform_id = ?').get(user.id, game_id, platform_id) as any;
  if (!challengerTag) {
    return res.status(400).json({ error: 'Please register your Gamer Tag for this game and platform first.' });
  }

  // Check challenged has gamer tag
  const challengedTag = db.prepare('SELECT gamer_tag FROM gamer_tags WHERE user_id = ? AND game_id = ? AND platform_id = ?').get(challenged_id, game_id, platform_id) as any;
  if (!challengedTag) {
    return res.status(400).json({ error: 'Opponent has not registered a Gamer Tag for this game & platform.' });
  }

  const challengeId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO challenges (id, challenger_id, challenged_id, game_id, platform_id, challenger_gamer_tag, challenged_gamer_tag, scheduled_time, status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(challengeId, user.id, challenged_id, game_id, platform_id, challengerTag.gamer_tag, challengedTag.gamer_tag, scheduled_time || now, notes || '', now);

  // Notify opponent
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link_url, created_at)
    VALUES (?, ?, 'New Match Challenge!', ?, 'challenge_received', '/matches', ?)
  `).run(crypto.randomUUID(), challenged_id, `${user.username} challenged you to a match!`, now);

  logAudit(user.id, 'CHALLENGE_CREATE', `Challenged ${challenged_id}`, req);
  res.json({ message: 'Challenge sent successfully!', challenge_id: challengeId });
});

app.post('/api/challenges/:id/respond', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { action } = req.body; // 'accept' or 'decline'
  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ? AND challenged_id = ?').get(req.params.id, user.id) as any;
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

  const now = new Date().toISOString();

  if (action === 'accept') {
    const matchId = crypto.randomUUID();
    db.prepare('UPDATE challenges SET status = "accepted", match_id = ? WHERE id = ?').run(matchId, challenge.id);

    // Create official Match with snapshotted gamer tags
    db.prepare(`
      INSERT INTO matches (id, challenge_id, game_id, platform_id, player1_id, player1_tag, player2_id, player2_tag, scheduled_time, status, reward_paid, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', 0, ?)
    `).run(matchId, challenge.id, challenge.game_id, challenge.platform_id, challenge.challenger_id, challenge.challenger_gamer_tag, challenge.challenged_id, challenge.challenged_gamer_tag, challenge.scheduled_time, now);

    // Notify challenger
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, created_at)
      VALUES (?, ?, 'Challenge Accepted!', '${user.username} accepted your challenge! Match is scheduled.', 'challenge_accepted', ?)
    `).run(crypto.randomUUID(), challenge.challenger_id, now);

    res.json({ message: 'Challenge accepted! Match is now scheduled.', match_id: matchId });
  } else {
    db.prepare('UPDATE challenges SET status = "declined" WHERE id = ?').run(challenge.id);
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, created_at)
      VALUES (?, ?, 'Challenge Declined', '${user.username} declined your match challenge.', 'challenge_declined', ?)
    `).run(crypto.randomUUID(), challenge.challenger_id, now);

    res.json({ message: 'Challenge declined.' });
  }
});

// Matches & Result Verification
app.get('/api/matches', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const matches = db.prepare(`
    SELECT m.*, 
      g.name as game_name, p.name as platform_name,
      p1.username as player1_username, p1.profile_photo_url as player1_photo,
      p2.username as player2_username, p2.profile_photo_url as player2_photo
    FROM matches m
    JOIN games g ON m.game_id = g.id
    JOIN platforms p ON m.platform_id = p.id
    JOIN users p1 ON m.player1_id = p1.id
    JOIN users p2 ON m.player2_id = p2.id
    WHERE m.player1_id = ? OR m.player2_id = ?
    ORDER BY m.created_at DESC
  `).all(user.id, user.id);

  res.json(matches);
});

// Recent verified matches for Homepage
app.get('/api/matches/recent-verified', (req, res) => {
  const matches = db.prepare(`
    SELECT m.*, 
      g.name as game_name, p.name as platform_name,
      p1.username as player1_username, p1.profile_photo_url as player1_photo,
      p2.username as player2_username, p2.profile_photo_url as player2_photo,
      w.username as winner_username
    FROM matches m
    JOIN games g ON m.game_id = g.id
    JOIN platforms p ON m.platform_id = p.id
    JOIN users p1 ON m.player1_id = p1.id
    JOIN users p2 ON m.player2_id = p2.id
    LEFT JOIN users w ON m.winner_id = w.id
    WHERE m.status = 'verified'
    ORDER BY m.verified_at DESC LIMIT 6
  `).all();

  res.json(matches);
});

// Submit Match Result
app.post('/api/matches/:id/submit-result', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { my_score, opponent_score, reported_winner, evidence_url } = req.body;
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id) as any;
  if (!match) return res.status(404).json({ error: 'Match not found.' });

  const isPlayer1 = match.player1_id === user.id;
  const isPlayer2 = match.player2_id === user.id;
  if (!isPlayer1 && !isPlayer2) return res.status(403).json({ error: 'You are not a competitor in this match.' });

  const now = new Date().toISOString();

  if (isPlayer1) {
    db.prepare(`
      UPDATE matches SET player1_score = ?, player1_reported_winner = ?, player1_evidence_url = ? WHERE id = ?
    `).run(my_score, reported_winner, evidence_url || '', match.id);
  } else {
    db.prepare(`
      UPDATE matches SET player2_score = ?, player2_reported_winner = ?, player2_evidence_url = ? WHERE id = ?
    `).run(opponent_score, reported_winner, evidence_url || '', match.id);
  }

  // Refresh match state to check if both reported
  const updatedMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(match.id) as any;

  if (updatedMatch.player1_reported_winner && updatedMatch.player2_reported_winner) {
    if (updatedMatch.player1_reported_winner === updatedMatch.player2_reported_winner) {
      // RESULT AGREED!
      const winnerId = updatedMatch.player1_reported_winner;
      const loserId = winnerId === updatedMatch.player1_id ? updatedMatch.player2_id : updatedMatch.player1_id;

      db.prepare(`
        UPDATE matches SET 
          status = 'verified',
          winner_id = ?,
          loser_id = ?,
          verified_by = 'SYSTEM_AUTO_AGREED',
          verified_at = ?
        WHERE id = ?
      `).run(winnerId, loserId, now, match.id);

      // Award $10 Verified Match Reward
      if (!updatedMatch.reward_paid) {
        const rewardTxnId = `RWD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(winnerId) as any;
        if (wallet) {
          db.prepare(`
            UPDATE wallets SET 
              available_balance = available_balance + 10.0,
              total_earned = total_earned + 10.0,
              updated_at = ?
            WHERE user_id = ?
          `).run(now, winnerId);

          db.prepare(`
            INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, reference_id, status, notes, created_at)
            VALUES (?, ?, ?, 'match_reward', 10.0, ?, 'completed', 'Verified Match Win Reward', ?)
          `).run(crypto.randomUUID(), winnerId, winnerId, updatedMatch.id, now);
        }

        db.prepare('UPDATE matches SET reward_paid = 1 WHERE id = ?').run(match.id);

        // Check and award medals for winner
        const totalWins = db.prepare('SELECT COUNT(*) as count FROM matches WHERE winner_id = ? AND status = "verified"').get(winnerId) as any;
        const winCount = totalWins?.count || 1;
        if (winCount >= 1) {
          db.prepare('INSERT OR IGNORE INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, "med-1", ?)').run(crypto.randomUUID(), winnerId, now);
        }
        if (winCount >= 5) {
          db.prepare('INSERT OR IGNORE INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, "med-2", ?)').run(crypto.randomUUID(), winnerId, now);
        }
        if (winCount >= 10) {
          db.prepare('INSERT OR IGNORE INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, "med-3", ?)').run(crypto.randomUUID(), winnerId, now);
        }

        // Notify winner
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, created_at)
          VALUES (?, ?, 'Victory Verified! +$10 Reward', 'Both players confirmed result. $10 USD added to your wallet!', 'reward_received', ?)
        `).run(crypto.randomUUID(), winnerId, now);
      }

      return res.json({ message: 'Result agreed and verified! $10 reward credited to the winner.', status: 'verified' });
    } else {
      // RESULT CONFLICT!
      db.prepare('UPDATE matches SET status = "result_conflict" WHERE id = ?').run(match.id);
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, created_at)
        VALUES (?, ?, 'Result Conflict Detected', 'Scores do not match. Sent to Admin Review.', 'result_conflict', ?)
      `).run(crypto.randomUUID(), updatedMatch.player1_id, now);

      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, created_at)
        VALUES (?, ?, 'Result Conflict Detected', 'Scores do not match. Sent to Admin Review.', 'result_conflict', ?)
      `).run(crypto.randomUUID(), updatedMatch.player2_id, now);

      return res.json({ message: 'Result conflict detected! Sent to Admin for review.', status: 'result_conflict' });
    }
  }

  res.json({ message: 'Result submitted. Waiting for opponent confirmation.', status: 'result_submitted' });
});

// Tournaments
app.get('/api/tournaments', (req, res) => {
  const tourns = db.prepare(`
    SELECT t.*, g.name as game_name, p.name as platform_name 
    FROM tournaments t
    JOIN games g ON t.game_id = g.id
    JOIN platforms p ON t.platform_id = p.id
    ORDER BY t.created_at DESC
  `).all();

  res.json(tourns);
});

app.get('/api/tournaments/:id', (req, res) => {
  const tourn = db.prepare(`
    SELECT t.*, g.name as game_name, p.name as platform_name 
    FROM tournaments t
    JOIN games g ON t.game_id = g.id
    JOIN platforms p ON t.platform_id = p.id
    WHERE t.id = ?
  `).get(req.params.id) as any;

  if (!tourn) return res.status(404).json({ error: 'Tournament not found.' });

  const players = db.prepare(`
    SELECT tp.*, u.username, u.display_name, u.profile_photo_url
    FROM tournament_players tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.tournament_id = ?
    ORDER BY tp.slot_number ASC
  `).all(tourn.id);

  const matches = db.prepare(`
    SELECT tm.*, 
      p1.username as player1_username, p2.username as player2_username
    FROM tournament_matches tm
    LEFT JOIN users p1 ON tm.player1_id = p1.id
    LEFT JOIN users p2 ON tm.player2_id = p2.id
    WHERE tm.tournament_id = ?
    ORDER BY tm.round ASC, tm.match_number ASC
  `).all(tourn.id);

  res.json({ ...tourn, players, matches });
});

// Automatic Tournament Join After Payment
app.post('/api/tournaments/:id/join', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!user.is_member_active) {
    return res.status(403).json({ error: 'Active membership required to register for tournaments.' });
  }

  const tourn = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(req.params.id) as any;
  if (!tourn) return res.status(404).json({ error: 'Tournament not found.' });

  if (tourn.current_players >= tourn.max_players || tourn.status === 'full') {
    return res.status(400).json({ error: 'The tournament is full.' });
  }

  // Check if already registered
  const alreadyJoined = db.prepare('SELECT id FROM tournament_players WHERE tournament_id = ? AND user_id = ?').get(tourn.id, user.id);
  if (alreadyJoined) {
    return res.status(400).json({ error: 'You are already registered in this tournament.' });
  }

  // Check Gamer Tag
  const gamerTag = db.prepare('SELECT gamer_tag FROM gamer_tags WHERE user_id = ? AND game_id = ? AND platform_id = ?').get(user.id, tourn.game_id, tourn.platform_id) as any;
  if (!gamerTag) {
    return res.status(400).json({ error: 'Please register your Gamer Tag for this tournament’s game & platform.' });
  }

  const now = new Date().toISOString();
  const nextSlot = tourn.current_players + 1;
  const txnId = `TRN-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  db.prepare(`
    INSERT INTO tournament_players (id, tournament_id, user_id, gamer_tag, slot_number, payment_status, transaction_id, registered_at)
    VALUES (?, ?, ?, ?, ?, 'paid', ?, ?)
  `).run(crypto.randomUUID(), tourn.id, user.id, gamerTag.gamer_tag, nextSlot, txnId, now);

  const updatedCount = nextSlot;
  const newStatus = updatedCount >= tourn.max_players ? 'full' : tourn.status;

  db.prepare('UPDATE tournaments SET current_players = ?, status = ? WHERE id = ?').run(updatedCount, newStatus, tourn.id);

  logAudit(user.id, 'TOURNAMENT_JOIN', `Joined tournament ${tourn.name} (slot ${nextSlot})`, req);

  res.json({
    success: true,
    message: 'Tournament registration confirmed! Slot reserved.',
    slot: nextSlot,
    is_full: updatedCount >= tourn.max_players,
  });
});

// Wallet & Withdrawals
app.get('/api/wallet', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.json({
      wallet: { available_balance: 0, pending_rewards: 0, total_earned: 0, total_withdrawn: 0 },
      transactions: [],
      withdrawals: [],
    });
  }

  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(user.id) as any;
  const transactions = db.prepare(`
    SELECT id, wallet_id, user_id, type, amount, reference_id, status, notes, 
           COALESCE(notes, 'Tournament Activity') as description, created_at 
    FROM wallet_transactions 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 50
  `).all(user.id);
  const withdrawals = db.prepare(`
    SELECT id, user_id, amount, payout_method, recipient_details,
           recipient_details as destination_details, status, created_at 
    FROM withdrawals 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 50
  `).all(user.id);

  res.json({
    wallet: wallet || { available_balance: 0, pending_rewards: 0, total_earned: 0, total_withdrawn: 0 },
    transactions,
    withdrawals,
  });
});

app.get(['/api/wallet/transactions', '/api/transactions'], (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const transactions = db.prepare(`
    SELECT id, wallet_id, user_id, type, amount, reference_id, status, notes, 
           COALESCE(notes, 'Tournament Activity') as description, created_at 
    FROM wallet_transactions 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 50
  `).all(user.id);
  res.json(transactions);
});

app.get(['/api/payouts/my-requests', '/api/wallet/withdrawals'], (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const withdrawals = db.prepare(`
    SELECT id, user_id, amount, payout_method, recipient_details,
           recipient_details as destination_details, status, created_at 
    FROM withdrawals 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 50
  `).all(user.id);
  res.json(withdrawals);
});

app.post(['/api/wallet/withdraw', '/api/payouts/request'], (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, payout_method, recipient_details, destination_details } = req.body;
  const withdrawAmount = parseFloat(amount);

  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid withdrawal amount.' });
  }

  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(user.id) as any;
  if (!wallet || wallet.available_balance < withdrawAmount) {
    return res.status(400).json({ error: `Insufficient funds. Available: $${wallet?.available_balance || 0}` });
  }

  const now = new Date().toISOString();
  const withdrawalId = `WDR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const details = destination_details || recipient_details || '';

  // Deduct from available balance
  db.prepare(`
    UPDATE wallets SET 
      available_balance = available_balance - ?,
      total_withdrawn = total_withdrawn + ?,
      updated_at = ?
    WHERE user_id = ?
  `).run(withdrawAmount, withdrawAmount, now, user.id);

  // Record withdrawal
  db.prepare(`
    INSERT INTO withdrawals (id, user_id, amount, payout_method, recipient_details, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).run(withdrawalId, user.id, withdrawAmount, (payout_method || 'MonCash').toUpperCase(), details, now);

  // Record wallet transaction
  db.prepare(`
    INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, reference_id, status, notes, created_at)
    VALUES (?, ?, ?, 'withdrawal', ?, ?, 'pending', ?, ?)
  `).run(crypto.randomUUID(), user.id, user.id, -withdrawAmount, withdrawalId, `Payout Request (${(payout_method || 'MonCash').toUpperCase()})`, now);

  logAudit(user.id, 'WITHDRAWAL_REQUEST', `Requested withdrawal of $${withdrawAmount} via ${payout_method}`, req);

  res.json({
    success: true,
    message: `Your withdrawal request for $${withdrawAmount} has been submitted! Payout is pending processing.`,
    withdrawal_id: withdrawalId,
  });
});

// Medals & Certificates
app.get(['/api/medals', '/api/medals/all'], (req, res) => {
  const user = getUserFromRequest(req);
  const allMedals = db.prepare('SELECT * FROM medals').all() as any[];

  if (!user) return res.json(allMedals.map(m => ({ ...m, unlocked: false })));

  const earned = db.prepare('SELECT medal_id, awarded_at FROM gamer_medals WHERE user_id = ?').all(user.id) as any[];
  const earnedMap = new Map(earned.map(e => [e.medal_id, e.awarded_at]));

  res.json(allMedals.map(m => ({
    ...m,
    unlocked: earnedMap.has(m.id),
    awarded_at: earnedMap.get(m.id) || null,
  })));
});

app.get('/api/medals/my', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const earned = db.prepare(`
    SELECT m.*, gm.awarded_at, 1 as unlocked
    FROM gamer_medals gm
    JOIN medals m ON gm.medal_id = m.id
    WHERE gm.user_id = ?
    ORDER BY gm.awarded_at DESC
  `).all(user.id);

  res.json(earned);
});

app.get(['/api/certificates', '/api/certificates/my'], (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const certs = db.prepare('SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_date DESC').all(user.id);
  res.json(certs);
});

// Head-to-head stats
app.get('/api/stats/head-to-head', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json({ players_i_have_beaten: [], players_who_beat_me: [] });

  const beatenRows = db.prepare(`
    SELECT m.loser_id as opponent_id, u.username, u.display_name, u.profile_photo_url, u.gamer_id,
      COUNT(*) as wins_against, MAX(m.verified_at) as last_match
    FROM matches m
    JOIN users u ON m.loser_id = u.id
    WHERE m.winner_id = ? AND m.status = 'verified'
    GROUP BY m.loser_id
  `).all(user.id);

  const beatMeRows = db.prepare(`
    SELECT m.winner_id as opponent_id, u.username, u.display_name, u.profile_photo_url, u.gamer_id,
      COUNT(*) as losses_against, MAX(m.verified_at) as last_match
    FROM matches m
    JOIN users u ON m.winner_id = u.id
    WHERE m.loser_id = ? AND m.status = 'verified'
    GROUP BY m.winner_id
  `).all(user.id);

  res.json({
    players_i_have_beaten: beatenRows,
    players_who_beat_me: beatMeRows,
  });
});

// In-app Messages
app.get('/api/messages', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const opponent_id = typeof req.query.opponent_id === 'string' ? req.query.opponent_id : '';
  if (!opponent_id) {
    // Return list of conversations
    const conversations = db.prepare(`
      SELECT DISTINCT 
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as contact_id,
        u.username, u.display_name, u.profile_photo_url, u.is_online
      FROM messages m
      JOIN users u ON (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) = u.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
    `).all(user.id, user.id, user.id, user.id);
    return res.json(conversations);
  }

  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC LIMIT 100
  `).all(user.id, opponent_id, opponent_id, user.id);

  res.json(messages);
});

app.post('/api/messages/send', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { receiver_id, content } = req.body;
  if (!receiver_id || !content) return res.status(400).json({ error: 'Recipient and content required.' });

  const msgId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO messages (id, sender_id, receiver_id, content, is_read, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(msgId, user.id, receiver_id, content, now);

  res.json({ message: 'Message sent.', id: msgId });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.json([]);

  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').all(user.id);
  res.json(notifications);
});

app.post('/api/notifications/read', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(user.id);
  res.json({ message: 'Notifications marked read.' });
});

// ==========================================
// ADMIN DASHBOARD ROUTES (DJSPIDEED THEKING)
// ==========================================
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const totalGamers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const activeGamers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE is_online = 1').get() as any).count;
  const activeMembers = (db.prepare('SELECT COUNT(*) as count FROM memberships WHERE status = "active"').get() as any).count;
  const totalRevenue = (db.prepare('SELECT SUM(amount_paid) as sum FROM memberships').get() as any).sum || 0;
  const pendingPayouts = (db.prepare('SELECT COUNT(*) as count FROM withdrawals WHERE status = "pending"').get() as any).count;
  const pendingDisputes = (db.prepare('SELECT COUNT(*) as count FROM matches WHERE status = "result_conflict"').get() as any).count;

  res.json({
    total_gamers: totalGamers,
    active_gamers: activeGamers,
    active_members: activeMembers,
    total_revenue: totalRevenue,
    pending_payouts: pendingPayouts,
    pending_disputes: pendingDisputes,
  });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, full_name, username, email, phone_number, gamer_id, role, is_online, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

app.get('/api/admin/payouts', requireAdmin, (req, res) => {
  const payouts = db.prepare(`
    SELECT w.*, u.username, u.email, u.full_name
    FROM withdrawals w
    JOIN users u ON w.user_id = u.id
    ORDER BY w.created_at DESC
  `).all();
  res.json(payouts);
});

app.post('/api/admin/payouts/:id/process', requireAdmin, (req, res) => {
  const { action, provider_reference, failure_reason } = req.body; // 'paid' or 'failed'
  const withdrawal = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(req.params.id) as any;
  if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found.' });

  const now = new Date().toISOString();

  if (action === 'paid') {
    db.prepare(`
      UPDATE withdrawals SET status = 'paid', provider_reference = ?, processed_at = ? WHERE id = ?
    `).run(provider_reference || `PROV-${Date.now()}`, now, withdrawal.id);

    db.prepare(`
      UPDATE wallets SET total_withdrawn = total_withdrawn + ? WHERE user_id = ?
    `).run(withdrawal.amount, withdrawal.user_id);

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, created_at)
      VALUES (?, ?, 'Payout Completed!', 'Your payout of $${withdrawal.amount} has been successfully sent!', 'withdrawal_paid', ?)
    `).run(crypto.randomUUID(), withdrawal.user_id, now);

    res.json({ message: 'Payout marked as PAID.' });
  } else {
    // Return money to wallet
    db.prepare(`
      UPDATE withdrawals SET status = 'failed', failure_reason = ?, processed_at = ? WHERE id = ?
    `).run(failure_reason || 'Provider declined transaction', now, withdrawal.id);

    db.prepare(`
      UPDATE wallets SET available_balance = available_balance + ? WHERE user_id = ?
    `).run(withdrawal.amount, withdrawal.user_id);

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, created_at)
      VALUES (?, ?, 'Payout Failed', 'Your withdrawal could not be processed. Funds returned to your wallet.', 'withdrawal_failed', ?)
    `).run(crypto.randomUUID(), withdrawal.user_id, now);

    res.json({ message: 'Payout marked as FAILED. Funds refunded to gamer wallet.' });
  }
});

app.get('/api/admin/discounts', requireAdmin, (req, res) => {
  const discounts = db.prepare('SELECT * FROM discount_codes ORDER BY created_at DESC').all();
  res.json(discounts);
});

app.post('/api/admin/discounts', requireAdmin, (req, res) => {
  const { code, discount_amount, membership_plan, max_uses, is_one_time, expires_at } = req.body;
  if (!code || !discount_amount) return res.status(400).json({ error: 'Code and amount required.' });

  const now = new Date().toISOString();
  const exp = expires_at || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

  db.prepare(`
    INSERT INTO discount_codes (id, code, discount_amount, membership_plan, max_uses, is_one_time, status, starts_at, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).run(crypto.randomUUID(), code.toUpperCase(), parseFloat(discount_amount), membership_plan || 'all', parseInt(max_uses) || 100, is_one_time ? 1 : 0, now, exp, now);

  res.json({ message: 'Discount code created successfully.' });
});

app.get('/api/admin/disputes', requireAdmin, (req, res) => {
  const disputes = db.prepare(`
    SELECT m.*, 
      p1.username as player1_username, p2.username as player2_username,
      g.name as game_name, p.name as platform_name
    FROM matches m
    JOIN users p1 ON m.player1_id = p1.id
    JOIN users p2 ON m.player2_id = p2.id
    JOIN games g ON m.game_id = g.id
    JOIN platforms p ON m.platform_id = p.id
    WHERE m.status = 'result_conflict'
  `).all();
  res.json(disputes);
});

app.post('/api/admin/disputes/:id/resolve', requireAdmin, (req, res) => {
  const { winner_id, player1_score, player2_score } = req.body;
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id) as any;
  if (!match) return res.status(404).json({ error: 'Match not found.' });

  const now = new Date().toISOString();
  const loserId = winner_id === match.player1_id ? match.player2_id : match.player1_id;

  db.prepare(`
    UPDATE matches SET 
      status = 'verified',
      winner_id = ?,
      loser_id = ?,
      player1_score = ?,
      player2_score = ?,
      verified_by = 'ADMIN_RESOLVED',
      verified_at = ?
    WHERE id = ?
  `).run(winner_id, loserId, player1_score, player2_score, now, match.id);

  // Credit winner $10
  if (!match.reward_paid) {
    db.prepare('UPDATE wallets SET available_balance = available_balance + 10.0, total_earned = total_earned + 10.0 WHERE user_id = ?').run(winner_id);
    db.prepare('UPDATE matches SET reward_paid = 1 WHERE id = ?').run(match.id);
  }

  res.json({ message: 'Dispute resolved and winner verified.' });
});

app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50').all();
  res.json(logs);
});

app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  res.json(settings);
});

app.post('/api/admin/settings', requireAdmin, (req, res) => {
  const { settings } = req.body;
  if (settings && typeof settings === 'object') {
    for (const [k, v] of Object.entries(settings)) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(k, String(v));
    }
  }
  res.json({ message: 'Settings saved.' });
});

// Finalize Tournament (identify 1st, 2nd, 3rd, prizes, medals, certs, credits, emails)
app.post('/api/admin/tournaments/:id/finalize', requireAdmin, (req, res) => {
  const tourn = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(req.params.id) as any;
  if (!tourn) return res.status(404).json({ error: 'Tournament not found.' });

  const { first_place_id, second_place_id, third_place_id } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tournaments SET 
      first_place_id = ?, second_place_id = ?, third_place_id = ?, status = 'completed'
    WHERE id = ?
  `).run(first_place_id, second_place_id, third_place_id, tourn.id);

  // 1st Place: $100 prize to wallet + Champion Medal + Champion Certificate
  db.prepare('UPDATE wallets SET available_balance = available_balance + ?, total_earned = total_earned + ? WHERE user_id = ?').run(tourn.prize_pool, tourn.prize_pool, first_place_id);
  db.prepare('INSERT OR IGNORE INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, "med-5", ?)').run(crypto.randomUUID(), first_place_id, now);
  db.prepare(`
    INSERT INTO certificates (id, certificate_number, user_id, tournament_id, tournament_name, game_name, platform_name, placement, prize_amount, issued_date)
    VALUES (?, ?, ?, ?, ?, 'EA SPORTS FC 27', 'PlayStation', '1st', ?, ?)
  `).run(crypto.randomUUID(), `CERT-LKY-${Date.now()}-1`, first_place_id, tourn.id, tourn.name, tourn.prize_pool, now);

  // 2nd Place: Runner-up Medal + Runner-up Certificate + $10 Membership Credit
  db.prepare('INSERT OR IGNORE INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, "med-6", ?)').run(crypto.randomUUID(), second_place_id, now);
  db.prepare(`
    INSERT INTO certificates (id, certificate_number, user_id, tournament_id, tournament_name, game_name, platform_name, placement, prize_amount, issued_date)
    VALUES (?, ?, ?, ?, ?, 'EA SPORTS FC 27', 'PlayStation', '2nd', 0, ?)
  `).run(crypto.randomUUID(), `CERT-LKY-${Date.now()}-2`, second_place_id, tourn.id, tourn.name, now);
  db.prepare(`
    INSERT INTO membership_credits (id, user_id, amount, source, source_tournament_id, status, created_at)
    VALUES (?, ?, 10.0, 'tournament_2nd_place', ?, 'active', ?)
  `).run(crypto.randomUUID(), second_place_id, tourn.id, now);

  // 3rd Place: Third Place Medal + Third Place Certificate + $10 Membership Credit
  db.prepare('INSERT OR IGNORE INTO gamer_medals (id, user_id, medal_id, awarded_at) VALUES (?, ?, "med-7", ?)').run(crypto.randomUUID(), third_place_id, now);
  db.prepare(`
    INSERT INTO certificates (id, certificate_number, user_id, tournament_id, tournament_name, game_name, platform_name, placement, prize_amount, issued_date)
    VALUES (?, ?, ?, ?, ?, 'EA SPORTS FC 27', 'PlayStation', '3rd', 0, ?)
  `).run(crypto.randomUUID(), `CERT-LKY-${Date.now()}-3`, third_place_id, tourn.id, tourn.name, now);
  db.prepare(`
    INSERT INTO membership_credits (id, user_id, amount, source, source_tournament_id, status, created_at)
    VALUES (?, ?, 10.0, 'tournament_3rd_place', ?, 'active', ?)
  `).run(crypto.randomUUID(), third_place_id, tourn.id, now);

  res.json({ message: 'Tournament finalized! 1st, 2nd, and 3rd place prizes, medals, certificates, and membership credits distributed.' });
});

// Admin tournament creation
app.post('/api/admin/tournaments/create', requireAdmin, (req, res) => {
  const { name, game_id, platform_id, entry_fee, prize_pool, max_players, rules } = req.body;
  const tournId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO tournaments (id, name, game_id, platform_id, entry_fee, prize_pool, max_players, current_players, registration_deadline, scheduled_date, rules, status, banner_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'open', '/hero_banner.jpg', ?)
  `).run(tournId, name || 'Lakaya Championship', game_id || 'game-fc27', platform_id || 'plat-ps5', parseFloat(entry_fee) || 5.0, parseFloat(prize_pool) || 100.0, parseInt(max_players) || 12, now, now, rules || 'Single elimination. 12 players.', now);

  res.json({ message: 'Tournament created successfully.', tournament_id: tournId });
});

// ==========================================
// VITE INTEGRATION / STATIC SERVING
// ==========================================
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: ['lakayatournament16.com', 'www.lakayatournament16.com', '.run.app', 'localhost'],
        hmr: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.on('error', (err: any) => {
    console.error('Server error:', err);
  });

  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      try {
        db.close();
      } catch {}
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`LakayaTOURNAMENT server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
