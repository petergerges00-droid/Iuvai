import { ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
}
export function AppShell({
  children,
  showNav = true,
}: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#05070b] text-white overflow-x-hidden">
      {/* Ambient futuristic background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-[35%] -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[140px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>
      {/* Navigation */}
      {showNav && (
        <header className="relative z-50 border-b border-white/10 bg-[#05070b]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_15px_currentColor]" />
              </div>
              <span className="text-xl font-bold tracking-[0.18em] text-white">
                IUVAI
              </span>
            </Link>
            {/* Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              <a
                href="#experts"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                For Experts
              </a>
              <a
                href="#companies"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                For Companies
              </a>
              <a
                href="#about"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                About
              </a>
            </nav>
            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(99,102,241,0.18)] transition-all hover:bg-primary/90 hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]"
              >
                Join IUVAI
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </header>
      )}
      {/* Page content */}
      <main className="relative z-10">
        {children}
      </main>
      {/* Footer */}
      {showNav && (
        <footer className="relative z-10 border-t border-white/10 bg-[#05070b]">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <div className="text-sm font-bold tracking-[0.18em]">
                IUVAI
              </div>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-white/40">
                A human intelligence infrastructure powering tomorrow’s AI.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <Link
                href="/login"
                className="transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="transition-colors hover:text-white"
              >
                Join IUVAI
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
export default AppShell;
