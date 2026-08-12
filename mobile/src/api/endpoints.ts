import { api } from './client';
import type {
  AuthResponse,
  Category,
  City,
  LocationFull,
  LocationItem,
  Passport,
  Post,
  PostsResponse,
  Review,
  ReviewsResponse,
  RevivalIndex,
  TimelineEvent
} from './types';

/* ---------- auth ---------- */

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data),
  me: () => api.get<{ user: AuthResponse['user'] }>('/auth/me').then((r) => r.data.user)
};

/* ---------- locations ---------- */

export interface LocationFilters {
  year?: number;
  category?: Category;
  city?: City;
  q?: string;
}

export const locationsApi = {
  list: (filters: LocationFilters) =>
    api
      .get<{ year: number; count: number; items: LocationItem[] }>('/locations', { params: filters })
      .then((r) => r.data),
  detail: (id: string, year?: number) =>
    api.get<{ item: LocationFull }>(`/locations/${id}`, { params: { year } }).then((r) => r.data.item)
};

/* ---------- reviews ---------- */

export const reviewsApi = {
  list: (locationId: string) =>
    api.get<ReviewsResponse>(`/locations/${locationId}/reviews`).then((r) => r.data),
  create: (locationId: string, body: { rating: number; text: string; visitYear?: number }) =>
    api.post<{ item: Review }>(`/locations/${locationId}/reviews`, body).then((r) => r.data.item),
  remove: (reviewId: string) => api.delete(`/reviews/${reviewId}`)
};

/* ---------- posts ---------- */

export const postsApi = {
  list: (offset = 0, limit = 10) =>
    api.get<PostsResponse>('/posts', { params: { offset, limit } }).then((r) => r.data),
  create: (body: { text: string; locationId?: string }) =>
    api.post<{ item: Post }>('/posts', body).then((r) => r.data.item),
  toggleLike: (postId: string) =>
    api.post<{ item: Post }>(`/posts/${postId}/like`).then((r) => r.data.item),
  addComment: (postId: string, text: string) =>
    api.post<{ item: Post }>(`/posts/${postId}/comments`, { text }).then((r) => r.data.item),
  remove: (postId: string) => api.delete(`/posts/${postId}`)
};

/* ---------- timeline / analytics / passport ---------- */

export const timelineApi = {
  list: (params?: { year?: number; city?: City | 'region' }) =>
    api.get<{ count: number; items: TimelineEvent[] }>('/timeline', { params }).then((r) => r.data)
};

export const analyticsApi = {
  revivalIndex: () => api.get<RevivalIndex>('/analytics/revival-index').then((r) => r.data)
};

export const passportApi = {
  get: () => api.get<Passport>('/users/me/passport').then((r) => r.data),
  checkin: (body: { locationId: string; method: 'gps' | 'manual'; lat?: number; lng?: number }) =>
    api.post('/checkins', body).then((r) => r.data)
};

/** Preloads the key GET endpoints into the offline cache. */
export async function precacheForOffline(locationIds: string[]) {
  await Promise.allSettled([
    locationsApi.list({ year: 2026 }),
    timelineApi.list(),
    analyticsApi.revivalIndex(),
    ...locationIds.map((id) => locationsApi.detail(id)),
    ...locationIds.map((id) => reviewsApi.list(id))
  ]);
}
