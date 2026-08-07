import { Link } from 'wouter';
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
export default function Landing() {
  return (
    <AppShell>
      <main className="min-h-screen overflow-hidden bg-background text-foreground">
        {/* =========================================================
            GLOBAL FUTURISTIC GRID BACKGROUND
        ========================================================== */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.045]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* =========================================================
            NAVIGATION
        ========================================================== */}
        <header className="relative z-50 h-[72px] border-b border-border/70 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
            {/* LOCKED IUVAI LOGO — TWO CIRCLES + CENTER DOT */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center">
                <div className="absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-primary/70" />
                <div className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-primary/70" />
                <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(0,0,0,0.35)]" />
              </div>
              <span className="text-lg font-semibold tracking-[-0.03em]">
                IUVAI
              </span>
            </Link>
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
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
              >
                Join IUVAI
              </Link>
            </div>
          </div>
        </header>
        {/* =========================================================
            HERO
        ========================================================== */}
        <section className="relative z-10 min-h-[calc(100vh-72px)] overflow-hidden">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-15%] top-[-20%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-15%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[150px]" />
          </div>
          <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-6 py-20 lg:px-8 lg:py-24">
            <div className="grid w-full items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
              {/* HERO COPY */}
              <div className="max-w-3xl">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  <span>Human intelligence infrastructure</span>
                </div>
                <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-8xl">
                  <span className="block">Bridging the gap</span>
                  <span className="block text-foreground">
                    between{' '}
                    <span className="text-primary">humanity</span>
                  </span>
                  <span className="block">
                    and <span className="text-primary">AI</span>
                  </span>
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  IUVAI connects exceptional human expertise with the
                  companies building the next generation of artificial
                  intelligence.
                </p>
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
                <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-muted-foreground">
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
              {/* =====================================================
                  REDESIGNED HUMAN ↔ AI VISUALIZATION
              ====================================================== */}
              <div className="relative mx-auto hidden h-[430px] w-[430px] lg:block">
                {/* Outer rings */}
                <div className="absolute inset-4 rounded-full border border-primary/10" />
                <div className="absolute inset-12 rounded-full border border-primary/15" />
                <div className="absolute inset-20 rounded-full border border-primary/20" />
                {/* Orbiting nodes */}
                <div className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
                <div className="absolute bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
                <div className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
                <div className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
                {/* Connection lines */}
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
                <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                {/* Central intelligence core */}
                <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-primary/[0.06] shadow-[0_0_80px_rgba(255,255,255,0.06)] backdrop-blur-xl">
                  <div className="absolute inset-5 rounded-full border border-primary/20" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-background/70">
                    <Brain className="h-9 w-9 text-primary" />
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute left-1/2 top-10 -translate-x-1/2 text-xs font-medium tracking-wide text-muted-foreground">
                  HUMANITY
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs font-medium tracking-wide text-muted-foreground">
                  AI
                </div>
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-xs font-medium tracking-wide text-muted-foreground">
                  EXPERTS
                </div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-medium tracking-wide text-muted-foreground">
                  SYSTEMS
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* =========================================================
            INTRO
        ========================================================== */}
        <section className="relative z-10 border-t border-border py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-primary">
                The infrastructure
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                AI is evolving rapidly.
                <br />
                Human expertise remains essential.
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
        {/* =========================================================
            EXPERTS / COMPANIES
        ========================================================== */}
        <section id="experts" className="relative z-10 border-t border-border">
          <div className="grid lg:grid-cols-2">
            {/* EXPERTS */}
            <div className="relative overflow-hidden border-b border-border p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-20">
              <div className="absolute inset-0 bg-primary/[0.025]" />
              <div className="relative max-w-xl">
                <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  For experts
                </p>
                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your expertise helps shaping tomorrow.
                </h3>
                <p className="mt-5 text-xl font-medium text-foreground">
                  Get paid to train AI models.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Put your knowledge to work on the systems shaping the
                  future of AI. IUVAI gives domain experts access to
                  meaningful AI training, evaluation and research
                  opportunities.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    'Work on projects matched to your expertise',
                    'Contribute to the development of advanced AI',
                    'Build a professional expert profile',
                    'Access opportunities from anywhere',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
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
            <div id="companies" className="relative overflow-hidden p-8 sm:p-12 lg:p-20">
              <div className="absolute inset-0 bg-muted/20" />
              <div className="relative max-w-xl">
                <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  For companies
                </p>
                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Build AI with the intelligence it needs.
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
                    <li key={item} className="flex items-start gap-3">
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
        {/* =========================================================
            HOW IT WORKS
        ========================================================== */}
        <section
          id="how-it-works"
          className="relative z-10 border-t border-border py-24 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 max-w-2xl">
              <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-primary">
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
        {/* =========================================================
            TRUST
        ========================================================== */}
        <section className="relative z-10 border-t border-border py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
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
        {/* =========================================================
            FINAL CTA
        ========================================================== */}
        <section className="relative z-10 overflow-hidden border-t border-border">
          <div className="absolute inset-0 bg-primary/[0.035]" />
          <div className="relative mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              The future needs human intelligence
            </div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Help build what comes next.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
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
        {/* =========================================================
            FOOTER
        ========================================================== */}
        <footer className="relative z-10 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
              {/* Same locked logo in footer */}
              <Link href="/" className="flex items-center gap-3">
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <div className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-primary/70" />
                  <div className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-primary/70" />
                  <div className="relative z-10 h-2 w-2 rounded-full bg-primary" />
                </div>
                <span className="font-semibold tracking-tight">
                  IUVAI
                </span>
              </Link>
              <p className="text-center text-sm text-muted-foreground">
                A human intelligence infrastructure powering tomorrow's AI.
              </p>
              <div className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} IUVAI
              </div>
            </div>
          </div>
        </footer>
      </main>
    </AppShell>
  );
}
