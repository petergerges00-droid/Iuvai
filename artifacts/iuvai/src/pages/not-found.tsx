import { Link } from 'wouter';
import { IUVAILogo } from '@/components/ui/iuvai-logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, AlertCircle } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center">
      {/* Ambient futuristic background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>
      {/* Content */}
      <div className="relative z-10 w-full max-w-lg px-6 text-center">
        {/* IUVAI Studio mark */}
        <div className="mb-10 flex items-center justify-center">
          <IUVAILogo href="/" />
        </div>
        {/* Error indicator */}
        <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
          <AlertCircle className="h-8 w-8 text-primary" />
        </div>
        {/* 404 */}
        <div className="mb-2">
          <span className="font-mono text-sm uppercase tracking-[0.35em] text-primary">
            Error 404
          </span>
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Signal not found.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The page you're looking for doesn't exist, may have moved,
          or is not currently available within the IUVAI network.
        </p>
        {/* Actions */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="group h-11 min-w-[150px]"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="group h-11 min-w-[150px]"
          >
            <button
              type="button"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Go back
            </button>
          </Button>
        </div>
        {/* Brand statement */}
        <div className="mt-16 border-t border-border/50 pt-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            A human intelligence infrastructure
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            powering tomorrow’s AI.
          </p>
        </div>
      </div>
    </div>
  );
}
