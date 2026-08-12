export type City = 'shusha' | 'khankendi';
export type Category =
  | 'heritage'
  | 'infrastructure'
  | 'energy_roads'
  | 'culture_tourism'
  | 'education'
  | 'smart_village';
export type StatusKind = 'damaged' | 'restoring' | 'construction' | 'restored' | 'active' | 'planned';
export type Role = 'user' | 'moderator' | 'admin';

export interface PublicUser {
  id: string;
  name: string;
  role: Role;
  joinedAt: string;
  avatarHue: number;
}

export interface LocationStatus {
  year: number;
  status: StatusKind;
  note: string;
}

export interface Rating {
  average: number;
  count: number;
}

export interface LocationItem {
  id: string;
  name: string;
  city: City;
  category: Category;
  lat: number;
  lng: number;
  shortDescription: string;
  builtInfo: string;
  visibleFrom: number;
  tags: string[];
  status: LocationStatus | null;
  rating: Rating;
  checkinCount: number;
}

export interface AudioGuide {
  durationSec: number;
  lines: string[];
}

export interface LocationFull extends LocationItem {
  history: string;
  timeline: Record<string, { status: StatusKind; note: string }>;
  audioGuide: AudioGuide;
}

export interface Review {
  id: string;
  locationId: string;
  rating: number;
  text: string;
  visitYear?: number;
  createdAt: string;
  user: PublicUser;
}

export interface ReviewsResponse {
  rating: Rating;
  distribution: { star: number; count: number }[];
  count: number;
  items: Review[];
}

export interface PostComment {
  id: string;
  text: string;
  createdAt: string;
  user: PublicUser;
}

export interface Post {
  id: string;
  text: string;
  createdAt: string;
  user: PublicUser;
  location: { id: string; name: string; city: City; category: Category } | null;
  likeCount: number;
  likedByMe: boolean;
  comments: PostComment[];
}

export interface PostsResponse {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  items: Post[];
}

export interface TimelineEvent {
  id: string;
  year: number;
  month: number;
  city: City | 'region';
  category: string;
  title: string;
  description: string;
}

export interface RevivalYear {
  year: number;
  roadsKm: number;
  greenEnergyMW: number;
  monumentsRestored: number;
  residentsReturned: number;
  schools: number;
  homes: number;
}

export interface RevivalIndex {
  latest: RevivalYear;
  years: RevivalYear[];
  byCategory: { category: Category; count: number }[];
  statusByYear: {
    year: number;
    total: number;
    active: number;
    restored: number;
    inProgress: number;
    damaged: number;
    planned: number;
  }[];
  community: { reviews: number; posts: number; checkins: number; users: number };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: { current: number; target: number };
}

export interface PassportVisit {
  checkinId: string;
  method: 'gps' | 'manual';
  visitedAt: string;
  location: { id: string; name: string; city: City | null; category: Category | null };
}

export interface Passport {
  totalLocations: number;
  visitedCount: number;
  percent: number;
  visited: PassportVisit[];
  badges: Badge[];
  earnedBadges: number;
  stats: { reviews: number; posts: number; checkins: number };
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}
