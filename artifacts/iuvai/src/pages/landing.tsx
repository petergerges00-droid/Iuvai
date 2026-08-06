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
  Network,
  Cpu,
  UserRound,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

export default function Landing() {
  return (
    <AppShell>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

        {/* =========================================================
            GLOBAL FUTURISTIC BACKGROUND
        ========================================================== */}

        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

          {/* Ambient glows */}
          <div className="absolute -left-[15%] top-[10%] h-[650px] w-[650px] rounded-full bg-primary/[0.07] blur-[150px]" />

          <div className="absolute -right-[15%] top-[45%] h-[650px] w-[650px] rounded-full bg-primary/[0.05] blur-[150px]" />

          <div className="absolute bottom-[-20%] left-[30%] h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[150px]" />

          {/* GRID — intentionally kept globally visible */}
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          {/* Subtle central glow */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(255,255,255,0.9) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

        </div>


        {/* =========================================================
            HERO
        ========================================================== */}

        <section className="relative flex min-h-[calc(100vh-72px)] items-center overflow-hidden">

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">

            <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">

              {/* =================================================
                  HERO TEXT
              ================================================== */}

              <div className="max-w-3xl">

                {/* Eyebrow */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Human intelligence infrastructure</span>
                </div>


                {/* Main headline */}

                <h1 className="text-5xl font-semibold leading-[0.92] tracking-[-0.045em] sm:text-6xl lg:text-8xl">

                  <span className="block">
                    Bridging the gap
                  </span>

                  <span className="block text-primary">
                    between
                  </span>

                  <span className="block">
                    <span>humanity</span>
                    <span className="text-primary"> and AI</span>
                  </span>

                </h1>


                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  IUVAI connects exceptional human expertise with the
                  companies building the next generation of artificial
                  intelligence.
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
                  REDESIGNED HUMAN ↔ AI NETWORK
              ================================================== */}

              <div className="relative mx-auto hidden h-[460px] w-[460px] lg:block">

                {/* Outer orbital ring */}

                <div className="absolute inset-5 rounded-full border border-primary/[0.10]" />

                <div className="absolute inset-14 rounded-full border border-primary/[0.14]" />

                <div className="absolute inset-[92px] rounded-full border border-primary/[0.18]" />


                {/* Rotating-style orbital arcs */}

                <div className="absolute inset-5 rounded-full border border-transparent border-t-primary/50 border-r-primary/20" />

                <div className="absolute inset-14 rounded-full border border-transparent border-b-primary/50 border-l-primary/20" />


                {/* Central AI core */}

                <div className="absolute left-1/2 top-1/2 z-20 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center">

                  {/* Core glow */}

                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />

                  {/* Core */}

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 bg-background/90 shadow-[0_0_50px_rgba(99,102,241,0.18)] backdrop-blur-xl">

                    <Brain className="h-10 w-10 text-primary" />

                    {/* Core dot */}

                    <div className="absolute h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.9)]" />

                  </div>

                </div>


                {/* =================================================
                    CONNECTION LINES
                ================================================== */}

                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 460 460"
                  fill="none"
                >

                  {/* Human → AI */}

                  <path
                    d="M90 150 C145 150 165 195 205 215"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary/30"
                  />

                  <path
                    d="M90 310 C145 310 165 265 205 245"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary/30"
                  />


                  {/* AI → World */}

                  <path
                    d="M255 215 C300 195 315 150 370 150"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary/30"
                  />

                  <path
                    d="M255 245 C300 265 315 310 370 310"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary/30"
                  />


                  {/* Horizontal intelligence pathway */}

                  <path
                    d="M105 230 H355"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 7"
                    className="text-primary/20"
                  />

                </svg>


                {/* =================================================
                    HUMAN NODE
                ================================================== */}

                <div className="absolute left-5 top-[118px] flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-background/80 shadow-[0_0_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">

                  <div className="absolute inset-2 rounded-xl border border-primary/10" />

                  <UserRound className="relative h-7 w-7 text-primary" />

                  <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />

                </div>


                {/* Human label */}

                <div className="absolute left-0 top-[208px] text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                  Human expertise
                </div>


                {/* =================================================
                    EXPERT NETWORK NODE
                ================================================== */}

                <div className="absolute left-5 bottom-[118px] flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-xl">

                  <Network className="h-7 w-7 text-primary/80" />

                  <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary/70 shadow-[0_0_12px_rgba(99,102,241,0.7)]" />

                </div>


                <div className="absolute bottom-[96px] left-0 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                  Expert network
                </div>


                {/* =================================================
                    AI NODE
                ================================================== */}

                <div className="absolute right-5 top-[118px] flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-background/80 shadow-[0_0_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">

                  <Cpu className="h-7 w-7 text-primary" />

                  <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />

                </div>


                <div className="absolute right-0 top-[208px] text-right text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                  Artificial intelligence
                </div>


                {/* =================================================
                    GLOBAL NODE
                ================================================== */}

                <div className="absolute bottom-[118px] right-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-xl">

                  <Globe2 className="h-7 w-7 text-primary/80" />

                  <div className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-primary/70 shadow-[0_0_12px_rgba(99,102,241,0.7)]" />

                </div>


                <div className="absolute bottom-[96px] right-0 text-right text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                  Global impact
                </div>


                {/* =================================================
                    FLOATING CONNECTION DOTS
                ================================================== */}

                <div className="absolute left-[148px] top-[174px] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]" />

                <div className="absolute left-[168px] top-[276px] h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_10px_rgba(99,102,241,0.7)]" />

                <div className="absolute right-[148px] top-[174px] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]" />

                <div className="absolute right-[168px] top-[276px] h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_10px_rgba(99,102,241,0.7)] />

              </div>

            </div>

          </div>

        </section>


        {/* =========================================================
            INTRO
        ========================================================== */}

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


        {/* =========================================================
            EXPERTS / COMPANIES
        ========================================================== */}

        <section className="border-t border-border">

          <div className="grid lg:grid-cols-2">

            {/* Experts */}

            <div className="relative overflow-hidden border-b p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-20">

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

                <p className="mt-5 text-lg font-medium text-foreground">
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


        {/* =========================================================
            HOW IT WORKS
        ========================================================== */}

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


        {/* =========================================================
            TRUST / SECURITY
        ========================================================== */}

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


        {/* =========================================================
            FINAL CTA
        ========================================================== */}

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


        {/* =========================================================
            FOOTER
        ========================================================== */}

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
