import { Link, useLocation } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface Props {
  to: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

export function NavLink({ to, children, icon: Icon }: Props) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className="group relative flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--byosync-gray-600)] transition-colors duration-200 hover:text-[var(--byosync-blue)]"
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" strokeWidth={2} />}
      <span>{children}</span>
      <span
        className={`absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full bg-[var(--byosync-blue)] transition-all duration-300 ${
          isActive ? 'opacity-100 scale-x-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60'
        }`}
        style={{ transformOrigin: '50% 50%' }}
      />
    </Link>
  );
}
