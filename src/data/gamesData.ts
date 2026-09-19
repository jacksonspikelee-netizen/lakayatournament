export interface GameItem {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  platforms: ('PS5' | 'Xbox' | 'PC')[];
  defaultTag: string;
  genre: string;
  accentColor: string;
}

export const OFFICIAL_GAMES: GameItem[] = [
  {
    id: 'game-fc27',
    name: 'EA SPORTS FC 27',
    slug: 'fc-27',
    coverImage: '/fc27_cover.jpg',
    platforms: ['PS5', 'Xbox', 'PC'],
    defaultTag: 'Haiti_Striker509',
    genre: 'Soccer Simulation',
    accentColor: 'from-blue-600 to-amber-500',
  },
  {
    id: 'game-mk',
    name: 'MORTAL KOMBAT',
    slug: 'mortal-kombat',
    coverImage: '/mk_cover.jpg',
    platforms: ['PS5', 'Xbox', 'PC'],
    defaultTag: 'AyitiScorpion_X',
    genre: 'Martial Arts Fighting',
    accentColor: 'from-amber-600 to-red-600',
  },
  {
    id: 'game-cod',
    name: 'COD: WARZONE',
    slug: 'cod-warzone',
    coverImage: '/hero_banner.jpg',
    platforms: ['PS5', 'Xbox', 'PC'],
    defaultTag: 'Ghost_Delmas',
    genre: 'Battle Royale FPS',
    accentColor: 'from-emerald-600 to-slate-800',
  },
  {
    id: 'game-nba2k',
    name: 'NBA 2K',
    slug: 'nba-2k',
    coverImage: '/hero_banner.jpg',
    platforms: ['PS5', 'Xbox'],
    defaultTag: 'DunkKing_HT',
    genre: 'Basketball Esports',
    accentColor: 'from-orange-600 to-rose-700',
  },
  {
    id: 'game-fortnite',
    name: 'FORTNITE',
    slug: 'fortnite',
    coverImage: '/hero_banner.jpg',
    platforms: ['PS5', 'Xbox', 'PC'],
    defaultTag: 'BuildGod_509',
    genre: 'Battle Royale / Build',
    accentColor: 'from-purple-600 to-blue-600',
  },
  {
    id: 'game-tekken8',
    name: 'TEKKEN 8',
    slug: 'tekken-8',
    coverImage: '/mk_cover.jpg',
    platforms: ['PS5', 'Xbox', 'PC'],
    defaultTag: 'Jin_PortAuPrince',
    genre: '3D Fighting',
    accentColor: 'from-red-600 to-amber-600',
  },
  {
    id: 'game-rl',
    name: 'ROCKET LEAGUE',
    slug: 'rocket-league',
    coverImage: '/fc27_cover.jpg',
    platforms: ['PS5', 'Xbox', 'PC'],
    defaultTag: 'TurboCar_HT',
    genre: 'Vehicular Soccer',
    accentColor: 'from-cyan-600 to-blue-600',
  },
  {
    id: 'game-gta5',
    name: 'GTAV ONLINE',
    slug: 'gta-5',
    coverImage: '/hero_banner.jpg',
    platforms: ['PS5', 'Xbox', 'PC'],
    defaultTag: 'Chief_SpikeLee',
    genre: 'Open World / Heist',
    accentColor: 'from-teal-600 to-slate-800',
  },
];
