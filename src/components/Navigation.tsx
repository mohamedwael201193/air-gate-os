import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, User, LogOut } from 'lucide-react';
import { useAirKit } from '@/store/useAirKit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navigation() {
  const location = useLocation();
  const { user, logout } = useAirKit();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary animate-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
            </div>
            <span className="text-xl font-bold gradient-text">AirGate OS</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" active={isActive('/')}>Home</NavLink>
            <NavLink to="/demos" active={isActive('/demos')}>Demos</NavLink>
            <NavLink to="/innovation" active={isActive('/innovation')}>Innovation</NavLink>
            {user && <NavLink to="/profile" active={isActive('/profile')}>Profile</NavLink>}
            <NavLink to="/docs" active={isActive('/docs')}>Docs</NavLink>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {!user ? (
              <Link to="/auth">
                <Button className="btn-glow bg-gradient-cosmic hover:shadow-glow transition-all">
                  Connect AIR
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 glass px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarFallback className="bg-gradient-cosmic text-white">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden sm:inline">{user.email || 'User'}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass border-white/10 w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-white/10 text-primary' 
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );
}
