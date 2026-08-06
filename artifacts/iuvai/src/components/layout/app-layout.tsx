import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LogOut, Settings, LayoutDashboard, Search, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { profile } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setLocation('/login');
  };

  const isExpert = profile?.account_type === 'expert';
  
  const navItems = isExpert
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Assessments', path: '/dashboard', icon: FileText, disabled: true },
        { name: 'Available Projects', path: '/dashboard', icon: Briefcase, disabled: true },
      ]
    : [
        { name: 'Dashboard', path: '/company-dashboard', icon: LayoutDashboard },
        { name: 'Find Experts', path: '/company-dashboard', icon: Search, disabled: true },
        { name: 'Active Projects', path: '/company-dashboard', icon: Briefcase, disabled: true },
      ];

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="text-xl font-bold tracking-tight text-primary font-sans flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full" />
            </div>
            IUVAI
          </div>
        </div>
        
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.disabled ? (
                  <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground/60 rounded-md cursor-not-allowed">
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <div className="mb-4 px-3 flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">{profile?.full_name || 'User'}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
              {profile?.account_type || 'Unconfigured'}
            </span>
          </div>
          
          <nav className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-8 border-b bg-card">
          <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
