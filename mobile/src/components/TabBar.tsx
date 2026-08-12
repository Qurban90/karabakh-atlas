import { NavLink } from 'react-router-dom';
import { Map, Newspaper, BarChart3, User } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Xəritə', icon: Map, end: true },
  { to: '/feed', label: 'Lent', icon: Newspaper, end: false },
  { to: '/analytics', label: 'İndeks', icon: BarChart3, end: false },
  { to: '/profile', label: 'Pasport', icon: User, end: false }
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Əsas naviqasiya">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `tabbar__item${isActive ? ' is-active' : ''}`}>
          <Icon size={21} strokeWidth={2.2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
