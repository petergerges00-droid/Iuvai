import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Search,
  Briefcase,
  FileText,
  Menu,
  X,
  ChevronRight,
  Circle,
  Users,
} from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
interface AppLayoutProps {
  children: ReactNode;
  title: string;
}
/*
============================================================
ADMIN ACCOUNT
============================================================
Must match the admin ID in App.tsx.
============================================================
*/
const ADMIN_USER_ID =
  '0f29b27d-45b6-4377-9242-e983f95039af';
export function AppLayout({
  children,
  title,
}: AppLayoutProps) {
  const { profile, user } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleSignOut = async () => {
    await signOut();
    setLocation('/login');
  };
  /*
  ============================================================
  ACCOUNT TYPE
  ============================================================
  */
  const isAdmin = user?.id === ADMIN_USER_ID;
  const isExpert = profile?.account_type === 'expert';
  const isCompany = profile?.account_type === 'company';
  /*
  ============================================================
  NAVIGATION
  ============================================================
  */
  const adminNavItems = [
    {
      name: 'Admin Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Projects',
      path: '/admin/projects',
      icon: Briefcase,
    },
    {
      name: 'Experts',
      path: '/admin',
      icon: Users,
      disabled: true,
    },
  ];
  const expertNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Assessments',
      path: '/dashboard',
      icon: FileText,
      disabled: true,
    },
    {
      name: 'Available Projects',
      path: '/dashboard',
      icon: Briefcase,
      disabled: true,
    },
  ];
  const companyNavItems = [
    {
      name: 'Dashboard',
      path: '/company-dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Find Experts',
      path: '/company/find-experts',
      icon: Search,
    },
    {
      name: 'Active Projects',
      path: '/company-dashboard',
      icon: Briefcase,
      disabled: true,
    },
  ];
  /*
  ============================================================
  SELECT CORRECT NAVIGATION
  ============================================================
  */
  const navItems = isAdmin
    ? adminNavItems
    : isExpert
      ? expertNavItems
      : companyNavItems;
  /*
  ============================================================
  LOGO DESTINATION
  ============================================================
  */
  const homePath = isAdmin
    ? '/admin'
    : isExpert
      ? '/dashboard'
      : '/company-dashboard';
  /*
  ============================================================
  BACKGROUND
  ============================================================
  */
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* =====================================================
          BACKGROUND SYSTEM
          ===================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>
      {/* =====================================================
          MOBILE HEADER
          ===================================================== */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-5 backdrop-blur-xl lg:hidden">
        <Link
          href={homePath}
          className="group flex items-center gap-3"
        >
          {/* Locked-in IUVAI logo */}
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="absolute left-0 h-7 w-7 rounded-full border border-primary/70 transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_18px_rgba(99,102,241,0.35)]" />
            <div className="absolute right-0 h-7 w-7 rounded-full border border-primary/40 transition-all duration-300 group-hover:border-primary/80 group-hover:shadow-[0_0_18px_rgba(99,102,241,0.25)]" />
            <div className="relative z-10 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
          </div>
          <span className="text-sm font-semibold tracking-[0.12em]">
            IUVAI Studio
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>
      {/* =====================================================
          MOBILE NAV
          ===================================================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 pt-16 backdrop-blur-xl lg:hidden">
          <div className="p-5">
            <div className="mb-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/50">
                {isAdmin ? 'Administration' : 'Navigation'}
              </p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.disabled ? (
                    <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground/40">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                      <span className="ml-auto text-[9px] uppercase tracking-widest">
                        Soon
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Link>
                  )}
                </div>
              ))}
            </nav>
            <div className="my-6 h-px bg-border/60" />
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
      {/* =====================================================
          DESKTOP SIDEBAR
          ===================================================== */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border/60 bg-background/70 backdrop-blur-xl lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <Link
            href={homePath}
            className="group flex items-center gap-3"
          >
            {/* Locked-in IUVAI logo */}
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute left-0 h-7 w-7 rounded-full border border-primary/70 transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_18px_rgba(99,102,241,0.35)]" />
              <div className="absolute right-0 h-7 w-7 rounded-full border border-primary/40 transition-all duration-300 group-hover:border-primary/80 group-hover:shadow-[0_0_18px_rgba(99,102,241,0.25)]" />
              <div className="relative z-10 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.12em]">
                IUVAI Studio
              </div>
              <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40">
                Intelligence Infrastructure
              </div>
            </div>
          </Link>
        </div>
        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="mb-4 px-3">
            <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground/40">
              {isAdmin ? 'Administration' : 'Workspace'}
            </p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.disabled ? (
                  <div className="group flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/35">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-[8px] uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100">
                      Soon
                    </span>
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className="group relative flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/15"
                  >
                    <div className="absolute -left-[17px] h-5 w-[2px] rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
        {/* =================================================
            USER / BOTTOM NAVIGATION
            ================================================= */}
        <div className="border-t border-border/60 p-4">
          {/* User identity */}
          <div className="mb-4 rounded-xl border border-border/50 bg-white/[0.02] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-sm font-semibold">
                  {(profile?.full_name || 'A')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {isAdmin
                    ? 'IUVAI Admin'
                    : profile?.full_name || 'User'}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
                  <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50">
                    {isAdmin
                      ? 'admin'
                      : profile?.account_type || 'Unconfigured'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <nav className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </div>
      </aside>
      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}
      <main className="flex min-w-0 flex-1 flex-col pt-16 lg:pt-0">
        {/* Desktop header */}
        <header className="hidden h-16 items-center justify-between border-b border-border/60 bg-background/50 px-8 backdrop-blur-xl lg:flex">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground/40">
              {isAdmin
                ? 'IUVAI Studio / Administration'
                : 'IUVAI Studio / Workspace'}
            </p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-white/[0.02] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
                System online
              </span>
            </div>
          </div>
        </header>
        {/* Mobile title */}
        <div className="border-b border-border/60 px-5 py-5 lg:hidden">
          <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground/40">
            {isAdmin
              ? 'IUVAI Studio / Administration'
              : 'IUVAI Studio / Workspace'}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
        {/* Page content */}
        <div className="flex-1 overflow-auto p-5 sm:p-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
export default AppLayout;
