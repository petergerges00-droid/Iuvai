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
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

        {/* =====================================================
            GLOBAL FUTURISTIC BACKGROUND
        ====================================================== */}

        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-[140px]" />

          <div className="absolute -right-40 top-[40%] h-[600px] w-[600px] rounded-full bg-primary/[0.045] blur-[140px]" />

          <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[140px]" />
        </div>

        {/* GLOBAL GRID */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative flex min-h-[calc(100vh-72px)] items-center overflow-hidden">

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">

            <div className="grid items-center gap-16 lg:grid-cols-[1fr_420px]">

              {/* LEFT SIDE */}

              <div className="max-w-4xl">

                {/* Eyebrow */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  <span>Human intelligence infrastructure</span>
                </div>

                {/* Main headline */}
                <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
                  Bridging the gap
                  <span className="block text-primary">
                    between humanity
                  </span>
                  and AI.
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  IUVAI connects human expertise with the artificial
                  intelligence systems shaping the future.
                </p>

                {/* CTAs */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">

                  <Link href="/signup">
                    <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20">
                      Join as an Expert
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>

                  <Link href="/signup">
                    <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-7 py-4 font-medium backdrop-blur transition-colors hover:bg-muted">
                      Build with IUVAI
                      <Building2 className="h-4 w-4" />
                    </button>
                  </Link>

                </div>

                {/* Trust indicators */}
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


              {/* =================================================
                  FUTURISTIC HUMAN ↔ AI VISUALIZATION
              ================================================== */}

              <div className="relative mx-auto hidden h-[420px] w-[420px] lg:block">

                {/* Outer glow */}
                <div className="absolute inset-[55px] rounded-full bg-primary/5 blur-3xl" />

                {/* Orbital rings */}
                <div className="absolute inset-0 rounded-full border border-primary/10" />

                <div className="absolute inset-[35px] rounded-full border border-primary/15" />

                <div className="absolute inset-[70px] rounded-full border border-primary/20" />

                {/* Rotating-looking orbit */}
                <div className="absolute inset-[105px] rounded-full border border-primary/25" />

                {/* Connecting horizontal line */}
                <div className="absolute left-[65px] right-[65px] top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                {/* Connecting vertical line */}
                <div className="absolute bottom-[65px] left-1/2 top-[65px] w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />


                {/* HUMAN NODE */}

                <div className="absolute left-[15px] top-1/2 -translate-y-1/2">

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 shadow-xl backdrop-blur-xl">

                    <Users className="h-9 w-9 text-primary" />

                    <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />

                  </div>

                  <div className="mt-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Humanity
                  </div>

                </div>


                {/* AI CORE */}

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">

                  <div className="relative flex h-32 w-32 items-center justify-center rounded-[32px] border border-primary/40 bg-primary/10 shadow-[0_0_60px_rgba(99,102,241,0.15)] backdrop-blur-xl">

                    <Brain className="h-14 w-14 text-primary" />

                    {/* Core glow */}
                    <div className="absolute inset-0 rounded-[32px] border border-primary/10" />

                    {/* Signal points */}
                    <div className="absolute -right-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,0.9)]" />

                    <div className="absolute -left-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,0.9)]" />

                    <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,0.9)]" />

                    <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,0.9)]" />

                  </div>

                  <div className="mt-4 text-center text-xs font-medium uppercase tracking-[0.22em] text-primary">
                    Intelligence
                  </div>

                </div>


                {/* AI NODE */}

                <div className="absolute right-[15px] top-1/2 -translate-y-1/2">

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 shadow-xl backdrop-blur-xl">

                    <Sparkles className="h-9 w-9 text-primary" />

                    <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />

                  </div>

                  <div className="mt-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    AI
                  </div>

                </div>


                {/* Orbit points */}

                <div className="absolute left-[48px] top-[65px] h-2 w-2 rounded-full bg-primary/70 shadow-[0_0_12px_rgba(99,102,241,0.7)]" />

                <div className="absolute right-[48px] bottom-[65px] h-2 w-2 rounded-full bg-primary/70 shadow-[0_0_12px_rgba(99,102,241,0.7)]" />

                <div className="absolute bottom-[45px] left-[125px] h-1.5 w-1.5 rounded-full bg-primary/50" />

                <div className="absolute right-[125px] top-[45px] h-1.5 w-1.5 rounded-full bg-primary/50" />

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            INTRO
        ====================================================== */}

        <section className="relative border-t border-border py-24 lg:py-32">

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


        {/* =====================================================
            TWO SIDES
        ====================================================== */}

        <section className="border-t border-border">

          <div className="grid lg:grid-cols-2">

            {/* Experts */}

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
                  Your expertise helps shape tomorrow.
                </h3>

                <p className="mt-5 leading-relaxed text-muted-foreground">
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

                <Link href="/signup">
                  <button className="group mt-10 inline-flex items-center gap-2 font-medium text-primary">
                    Become an expert
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>

              </div>

            </div>


            {/* Companies */}

            <div className="relative overflow-hidden p-8 sm:p-12 lg:p-20">

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

                <Link href="/signup">
                  <button className="group mt-10 inline-flex items-center gap-2 font-medium text-primary">
                    Work with IUVAI
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}

        <section className="border-t border-border py-24 lg:py-32">

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


        {/* =====================================================
            TRUST / SECURITY
        ====================================================== */}

        <section className="border-t border-border py-24">

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


        {/* =====================================================
            FINAL CTA
        ====================================================== */}

        <section className="relative overflow-hidden border-t border-border">

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
                <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/20">
                  Join IUVAI
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/login">
                <button className="inline-flex items-center justify-center rounded-xl border border-border px-7 py-4 font-medium transition-colors hover:bg-muted">
                  Sign in
                </button>
              </Link>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="border-t border-border">

          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

            <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">

              <div className="font-semibold tracking-tight">
                IUVAI
              </div>

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
