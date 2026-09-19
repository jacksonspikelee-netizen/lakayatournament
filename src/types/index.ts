export type UserRole = 'gamer' | 'admin';

export type MembershipStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'suspended';
export type MembershipPlan = 'monthly' | 'yearly';

export type ChallengeStatus = 
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'reschedule_requested'
  | 'scheduled'
  | 'completed'
  | 'disputed'
  | 'verified'
  | 'cancelled';

export type TournamentStatus = 
  | 'draft'
  | 'open'
  | 'full'
  | 'registration_closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type WithdrawalStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone_number?: string;
  whatsapp_number?: string;
  profile_photo_url?: string;
  gamer_id: string; // e.g. LKY-00001
  role: UserRole;
  is_verified: boolean;
  two_factor_enabled: boolean;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  display_name?: string;
  bio?: string;
  // Computed / Joined fields
  is_member_active?: boolean;
  membership_plan?: MembershipPlan;
  membership_expires_at?: string;
  wallet_balance?: number;
  gamer_tags?: GamerTag[];
  primary_tag?: GamerTag;
}

export interface GamerTag {
  id: string;
  user_id: string;
  game_id: string;
  platform_id: string;
  gamer_tag: string;
  game_name?: string;
  platform_name?: string;
  is_primary?: boolean;
  created_at: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  icon_name: string; // 'playstation' | 'xbox' | 'pc'
  is_active: boolean;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  plan: MembershipPlan;
  amount_paid: number;
  discount_code_used?: string;
  discount_amount?: number;
  payment_method: string;
  transaction_id: string;
  status: MembershipStatus;
  started_at: string;
  expires_at: string;
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_amount: number;
  membership_plan: 'all' | 'monthly' | 'yearly';
  max_uses: number;
  current_uses: number;
  is_one_time: boolean;
  specific_gamer_id?: string;
  status: 'active' | 'used' | 'expired' | 'disabled';
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  game_id: string;
  platform_id: string;
  challenger_gamer_tag: string;
  challenged_gamer_tag: string;
  scheduled_time: string;
  status: ChallengeStatus;
  reschedule_reason?: string;
  notes?: string;
  match_id?: string;
  created_at: string;
  // Joins
  challenger?: User;
  challenged?: User;
  game?: Game;
  platform?: Platform;
}

export interface Match {
  id: string;
  challenge_id?: string;
  tournament_id?: string;
  game_id: string;
  platform_id: string;
  player1_id: string;
  player1_tag: string;
  player2_id: string;
  player2_tag: string;
  scheduled_time: string;
  status: 'scheduled' | 'result_submitted' | 'result_conflict' | 'verified' | 'cancelled';
  player1_score?: number;
  player2_score?: number;
  winner_id?: string;
  loser_id?: string;
  player1_reported_winner?: string;
  player2_reported_winner?: string;
  player1_evidence_url?: string;
  player2_evidence_url?: string;
  evidence_url?: string;
  verified_by?: string;
  verified_at?: string;
  reward_paid: boolean;
  created_at: string;
  // Joins
  player1?: User;
  player2?: User;
  game?: Game;
  platform?: Platform;
  player1_username?: string;
  player2_username?: string;
  winner_username?: string;
  game_name?: string;
  platform_name?: string;
}

export interface Tournament {
  id: string;
  name: string;
  game_id: string;
  platform_id: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  registration_deadline: string;
  scheduled_date: string;
  rules: string;
  status: TournamentStatus;
  first_place_id?: string;
  second_place_id?: string;
  third_place_id?: string;
  banner_url?: string;
  created_at: string;
  game_name?: string;
  platform_name?: string;
  // Joins
  game?: Game;
  platform?: Platform;
  players?: TournamentPlayer[];
  matches?: TournamentMatch[];
}

export interface TournamentPlayer {
  id: string;
  tournament_id: string;
  user_id: string;
  gamer_tag: string;
  slot_number: number;
  payment_status: 'paid' | 'exempt';
  transaction_id: string;
  registered_at: string;
  user?: User;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number; // 1 = R1, 2 = Quarters, 3 = Semis, 4 = Final, 5 = 3rd place
  match_number: number;
  player1_id?: string;
  player2_id?: string;
  player1_score?: number;
  player2_score?: number;
  winner_id?: string;
  status: 'pending' | 'ready' | 'completed';
  player1?: User;
  player2?: User;
}

export interface Wallet {
  user_id: string;
  available_balance: number;
  pending_rewards: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'match_reward' | 'tournament_prize' | 'withdrawal' | 'membership_payment' | 'refund' | 'entry_fee';
  amount: number;
  reference_id?: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  description?: string;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  payout_method: string;
  destination_details: string;
  status: string;
  notes?: string;
  created_at: string;
  user?: User;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  payout_method: 'moncash' | 'paypal' | 'bank_transfer' | 'zelle';
  recipient_details: string; // phone number, email, or account info
  provider_reference?: string;
  status: WithdrawalStatus;
  failure_reason?: string;
  created_at: string;
  processed_at?: string;
  user?: User;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  user_id: string;
  tournament_id: string;
  tournament_name: string;
  game_name: string;
  platform_name: string;
  placement: '1st' | '2nd' | '3rd';
  prize_amount: number;
  issued_date: string;
  title?: string;
  recipient_name?: string;
  achievement?: string;
  issue_date?: string;
  user?: User;
}

export interface Medal {
  id: string;
  code: string;
  name: string;
  description: string;
  icon_name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  awarded_at?: string;
}

export interface GamerMedal {
  id: string;
  user_id: string;
  medal_id: string;
  awarded_at: string;
  medal?: Medal;
}

export interface MembershipCredit {
  id: string;
  user_id: string;
  amount: number; // $10.00
  source: 'tournament_2nd_place' | 'tournament_3rd_place' | 'admin_grant';
  source_tournament_id?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  created_at: string;
  used_at?: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
}

export interface GamerStats {
  total_matches: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  rewards_earned: number;
  rewards_paid: number;
  tournaments_played: number;
  by_game: Record<string, {
    game_name: string;
    total: number;
    wins: number;
    losses: number;
    draws: number;
  }>;
}

export interface HeadToHeadStats {
  beaten_players: Array<{
    opponent: User;
    wins: number;
    losses: number;
    last_match_date: string;
  }>;
  players_who_beat_me: Array<{
    opponent: User;
    wins: number;
    losses: number;
    last_match_date: string;
  }>;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  details: string;
  ip_address?: string;
  created_at: string;
}
