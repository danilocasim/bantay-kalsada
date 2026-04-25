import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Map, Plus, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/track', label: 'report', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: User },
] as const;

export function BottomNav() {
  const navigate = useNavigate();
  return (
    <nav
      aria-label='Primary'
      className='fixed inset-x-0 bottom-0 z-40 pb-safe pointer-events-none'
    >
      <div className='mx-auto max-w-md px-4 pb-3'>
        <div className='pointer-events-auto relative glass shadow-float rounded-full border border-border/60 px-2 py-2 flex items-center justify-between'>
          {items.slice(0, 2).map((it) => (
            <NavItem key={it.to} {...it} />
          ))}

          {/* Center floating + Report button */}
          <button
            type='button'
            onClick={() => navigate('/report')}
            aria-label='Report a road issue'
            className='absolute left-1/2 -top-5 -translate-x-1/2 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-float flex items-center justify-center transition-transform active:scale-95'
          >
            <Plus className='h-7 w-7' strokeWidth={2.5} />
          </button>
          <span className='w-14' aria-hidden />

          {items.slice(2).map((it) => (
            <NavItem key={it.to} {...it} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Home;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[11px] font-medium transition-colors',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      <Icon className='h-5 w-5' strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}
