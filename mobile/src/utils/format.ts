import type { Category, City, StatusKind } from '../api/types';

export const categoryLabels: Record<Category, string> = {
  heritage: 'Tarixi irs',
  infrastructure: 'İnfrastruktur',
  energy_roads: 'Enerji və yollar',
  culture_tourism: 'Mədəniyyət və turizm',
  education: 'Təhsil',
  smart_village: 'Ağıllı kənd'
};

export const cityLabels: Record<City, string> = {
  shusha: 'Şuşa',
  khankendi: 'Xankəndi'
};

export const statusMeta: Record<StatusKind, { label: string; color: string; pulse?: boolean }> = {
  damaged: { label: 'Bərpa gözləyir', color: '#94A3B8' },
  restoring: { label: 'Bərpa olunur', color: '#F59E0B', pulse: true },
  construction: { label: 'Tikilir', color: '#F59E0B', pulse: true },
  restored: { label: 'Bərpa olundu', color: '#10B981' },
  active: { label: 'Fəaliyyətdə', color: '#10B981' },
  planned: { label: 'Planlaşdırılıb', color: '#C4B5FD' }
};

export const categoryColors: Record<Category, string> = {
  heritage: '#7C3AED',
  infrastructure: '#0EA5E9',
  energy_roads: '#F59E0B',
  culture_tourism: '#EC4899',
  education: '#6366F1',
  smart_village: '#10B981'
};

const MONTHS_AZ = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_AZ[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthName(month: number): string {
  return MONTHS_AZ[(month - 1 + 12) % 12] ?? '';
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'indicə';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dəq əvvəl`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat əvvəl`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'dünən';
  if (days < 30) return `${days} gün əvvəl`;
  return formatDate(iso);
}

export function formatNumber(n: number): string {
  return n.toLocaleString('az-AZ').replace(/,/g, ' ');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
