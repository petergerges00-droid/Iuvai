import { Link } from 'wouter';
import { IUVAILogo } from '@/components/ui/iuvai-logo';
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AppShell>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

        {/* =====================================================
            GLOBAL GRID / FUTURISTIC BACKGROUND
        ====================================================== */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-48 top-20 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
          <div className="absolute -right-48 top-[45%] h-[600px] w-[600px] rounded-full bg-primary/[0.05] blur-[140px]" />
          <div className="absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[140px]" />

          {/* Subtle Grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.9) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
        </div>

        {/* =====================================================
            TOP NAVIGATION BAR
        ====================================================== */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-2xl">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

            {/* Logo */}
            <IUVAILogo href="/" />

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              <a
                href="#experts"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Experts
              </a>

              <a
                href="#companies"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Companies
              </a>

              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                How it works
              </a>

              <a
                href="#about"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                Join IUVAI
              </Link>
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="border-t border-border/60 bg-background/95 px-5 py-5 backdrop-blur-2xl md:hidden">
              <nav className="flex flex-col gap-1">
                <a
                  href="#experts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  Experts
                </a>

                <a
                  href="#companies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  Companies
                </a>

                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  How it works
                </a>

                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  About
                </a>

                <div className="my-3 h-px bg-border/60" />

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50"
                >
                  Sign in
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-1 rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
                >
                  Join IUVAI
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative min-h-[calc(100vh-68px)] overflow-hidden">
          <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-7xl items-center px-6 py-20 sm:px-8 lg:px-8 lg:py-24">
            <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

              {/* Hero text */}
              <div className="relative z-10">

                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Bridging the gap between humanity and AI
                </div>

                <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl xl:text-[82px]">
                  <span className="block">
                    Bridging the gap
                  </span>

                  <span className="block">
                    between
                  </span>

                  <span className="block text-primary">
                    humanity
                  </span>

                  <span className="block">
                    and <span className="text-primary">AI</span>
                  </span>
                </h1>

                <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  IUVAI connects exceptional human expertise with the
                  companies building the next generation of artificial
                  intelligence.
                </p>

                {/* CTA */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link href="/signup">
                    <button className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 sm:w-auto">
                      Join as an Expert
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>

                  <Link href="/signup">
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-7 py-4 font-medium backdrop-blur transition-colors hover:bg-muted sm:w-auto">
                      Build with IUVAI
                      <Building2 className="h-4 w-4" />
                    </button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Expert-driven
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Built for AI
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Global network
                  </div>
                </div>
              </div>

              {/* =================================================
                  FUTURISTIC HUMAN / AI CONNECTION
              ================================================== */}
              <div className="relative mx-auto hidden h-[470px] w-[470px] lg:block">
                <div className="absolute inset-[15%] rounded-full bg-primary/[0.08] blur-[70px]" />

                <div className="absolute inset-0 rounded-full border border-primary/10" />
                <div className="absolute inset-[7%] rounded-full border border-primary/10" />
                <div className="absolute inset-[15%] rounded-full border border-primary/15" />
                <div className="absolute inset-[24%] rounded-full border border-primary/20" />

                <div className="absolute left-1/2 top-1/2 h-[76%] w-[76%] -translate-x-1/2 -translate-y-1/2 rotate-[25deg] rounded-full border border-dashed border-primary/20" />

                <div className="absolute left-[8%] top-1/2 flex -translate-y-1/2 items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-background/80 shadow-[0_0_35px_rgba(99,102,241,0.15)] backdrop-blur-xl">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="absolute right-[8%] top-1/2 flex -translate-y-1/2 items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-background/80 shadow-[0_0_35px_rgba(99,102,241,0.15)] backdrop-blur-xl">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-primary/40 bg-primary/[0.08] shadow-[0_0_60px_rgba(99,102,241,0.18)] backdrop-blur-xl">
                    <div className="absolute inset-3 rounded-[1.5rem] border border-primary/15" />
                    <div className="h-5 w-5 rounded-full bg-primary shadow-[0_0_25px_rgba(99,102,241,0.9)]" />
                  </div>
                </div>

                <div className="absolute left-[26%] top-[27%] h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                <div className="absolute right-[25%] top-[30%] h-1.5 w-1.5 rounded-full bg-primary/70" />
                <div className="absolute bottom-[25%] left-[31%] h-1.5 w-1.5 rounded-full bg-primary/70" />
                <div className="absolute bottom-[28%] right-[30%] h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            INTRO
        ====================================================== */}
        <section
          id="about"
          className="relative border-t border-border/70 py-24 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-primary">
                The infrastructure
              </p>

              <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                AI is evolving rapidly.
                <br />

                <span className="text-muted-foreground">
                  Human expertise remains essential.
                </span>
              </h2>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                The most capable AI systems require more than computation.
                They require people who understand medicine, science,
                engineering, law, finance, language and the countless
                domains that make the real world complex.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            EXPERTS / COMPANIES
        ====================================================== */}
        <section
          id="experts"
          className="border-t border-border/70"
        >
          <div className="grid lg:grid-cols-2">

            {/* EXPERTS */}
            <div className="relative overflow-hidden border-b border-border/70 p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-20">
              <div className="pointer-events-none absolute inset-0 bg-primary/[0.025]" />

              <div className="relative max-w-xl">

                <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>

                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-primary">
                  For experts
                </p>

                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Be a part of tomorrow.
                </h3>

                <p className="mt-4 text-xl font-medium text-foreground">
                  Get paid to train AI models.
                </p>

                <p className="mt-5 leading-relaxed text-muted-foreground">
                  Put your knowledge to work on the systems shaping the
                  future of AI. IUVAI gives domain experts access to
                  meaningful AI training, evaluation and research
                  opportunities.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    'Work on projects matched to your expertise',
                    'Get paid to train and evaluate AI models',
                    'Build a professional expert profile',
                    'Access opportunities from anywhere',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="group mt-10 inline-flex items-center gap-2 font-medium text-primary"
                >
                  Become an expert

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* COMPANIES */}
            <div
              id="companies"
              className="relative overflow-hidden p-8 sm:p-12 lg:p-20"
            >
              <div className="pointer-events-none absolute inset-0 bg-muted/[0.12]" />

              <div className="relative max-w-xl">

                <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>

                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-primary">
                  For companies
                </p>

                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Stress-test your AI model.
                </h3>

                <p className="mt-5 leading-relaxed text-muted-foreground">
                  Access a network of qualified experts who can help
                  train, evaluate and improve your AI systems with
                  real-world domain knowledge.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    'Access qualified domain experts',
                    'Accelerate AI training and evaluation',
                    'Match expertise to your exact requirements',
                    'Scale human intelligence when you need it',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="group mt-10 inline-flex items-center gap-2 font-medium text-primary"
                >
                  Work with IUVAI

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}
        <section
          id="how-it-works"
          className="border-t border-border/70 py-24 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-8">

            <div className="mb-16 max-w-2xl">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-primary">
                How it works
              </p>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Connecting intelligence

                <span className="text-muted-foreground">
                  {' '}with opportunity.
                </span>
              </h2>
            </div>

            <div className="grid overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
              {[
                {
                  number: '01',
                  title: 'Discover',
                  description:
                    'Experts create profiles around their real-world knowledge, experience and skills.',
                },
                {
                  number: '02',
                  title: 'Match',
                  description:
                    'IUVAI connects the right expertise with projects that need it.',
                },
                {
                  number: '03',
                  title: 'Build',
                  description:
                    'Experts and companies work together to create better AI systems.',
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="bg-background p-8 sm:p-10 lg:p-12"
                >
                  <div className="mb-8 font-mono text-sm text-primary">
                    {step.number}
                  </div>

                  <h3 className="text-2xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            TRUST
        ====================================================== */}
        <section className="border-t border-border/70 py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-8">

            <div className="grid gap-10 md:grid-cols-3">

              <div>
                <ShieldCheck className="mb-5 h-7 w-7 text-primary" />

                <h3 className="text-lg font-semibold">
                  Quality-first
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Expertise is verified and matched carefully to the
                  requirements of each project.
                </p>
              </div>

              <div>
                <Brain className="mb-5 h-7 w-7 text-primary" />

                <h3 className="text-lg font-semibold">
                  Human intelligence
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Real expertise remains at the center of the AI
                  development process.
                </p>
              </div>

              <div>
                <Globe2 className="mb-5 h-7 w-7 text-primary" />

                <h3 className="text-lg font-semibold">
                  Built globally
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Connect with opportunities and expertise beyond
                  geographical boundaries.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ====================================================== */}
        <section className="relative overflow-hidden border-t border-border/70">
          <div className="pointer-events-none absolute inset-0 bg-primary/[0.035]" />

          <div className="relative mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">

            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              The future needs human intelligence
            </div>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Help build what comes next.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Whether you are an expert ready to contribute or a company
              building the next generation of AI, IUVAI is where human
              intelligence meets opportunity.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <button className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/20 sm:w-auto">
                  Join IUVAI

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/login">
                <button className="inline-flex w-full items-center justify-center rounded-xl border border-border px-7 py-4 font-medium transition-colors hover:bg-muted sm:w-auto">
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <footer className="border-t border-border/70">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-10 sm:px-8 lg:flex-row lg:px-8">

            {/* Footer Logo */}
            <IUVAILogo href="/" />

            <p className="text-center text-sm text-muted-foreground">
              Bridging the gap between humanity and AI.
            </p>

            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} IUVAI Studio
            </div>

          </div>
        </footer>

      </main>
    </AppShell>
  );
}
