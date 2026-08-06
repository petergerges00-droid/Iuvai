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
  Menu,
} from 'lucide-react';

export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* =====================================================
          GLOBAL FUTURISTIC BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        {/* Ambient glows */}
        <div className="absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />

        <div className="absolute -right-40 top-[45%] h-[600px] w-[600px] rounded-full bg-primary/[0.05] blur-[140px]" />

        <div className="absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[150px]" />

        {/* GRID */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

      </div>


      {/* =====================================================
          TOP NAVIGATION
      ====================================================== */}

      <header className="fixed top-0 left-0 right-0 z-50">

        <div className="border-b border-border/50 bg-background/70 backdrop-blur-2xl">

          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">

            {/* LOGO */}

            <Link
              href="/"
              className="group flex items-center gap-3"
            >

              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">

                <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)]" />

                <div className="absolute inset-0 rounded-xl border border-primary/10 transition-all group-hover:scale-110 group-hover:border-primary/30" />

              </div>

              <div>
                <div className="text-sm font-bold tracking-[0.22em]">
                  IUVAI
                </div>

                <div className="hidden text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 sm:block">
                  Human Intelligence Infrastructure
                </div>
              </div>

            </Link>


            {/* DESKTOP NAV */}

            <nav className="hidden items-center gap-8 md:flex">

              <a
                href="#experts"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                For Experts
              </a>

              <a
                href="#companies"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                For Companies
              </a>

              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                How It Works
              </a>

              <a
                href="#about"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </a>

            </nav>


            {/* ACTIONS */}

            <div className="flex items-center gap-3">

              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] hover:shadow-primary/20"
              >
                Join IUVAI
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative flex min-h-screen items-center overflow-hidden pt-[72px]">

        <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">

          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

            {/* LEFT */}

            <div className="relative z-10 max-w-3xl">

              {/* Eyebrow */}

              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-2 text-sm text-primary backdrop-blur">

                <Sparkles className="h-4 w-4" />

                <span>Human intelligence infrastructure</span>

              </div>


              {/* HEADLINE */}

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-[82px]">

                <span className="block">
                  Bridging the gap
                </span>

                <span className="block">
                  between
                </span>

                <span className="block">
                  <span className="text-primary">
                    humanity
                  </span>

                  <span> and </span>

                  <span className="text-primary">
                    AI
                  </span>
                </span>

              </h1>


              {/* DESCRIPTION */}

              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                IUVAI connects exceptional human expertise with the
                companies building the next generation of artificial
                intelligence.
              </p>


              {/* CTA */}

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">

                <Link href="/signup">

                  <button className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] hover:shadow-primary/25 sm:w-auto">

                    Join as an Expert

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                  </button>

                </Link>


                <Link href="/signup">

                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-7 py-4 font-medium backdrop-blur transition-colors hover:bg-muted sm:w-auto">

                    Build with IUVAI

                    <Building2 className="h-4 w-4" />

                  </button>

                </Link>

              </div>


              {/* TRUST */}

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
                HUMAN ↔ AI SYSTEM
            ================================================== */}

            <div className="relative mx-auto hidden h-[520px] w-[520px] lg:block">

              {/* Outer system rings */}

              <div className="absolute inset-4 rounded-full border border-primary/[0.08]" />

              <div className="absolute inset-12 rounded-full border border-primary/[0.12]" />

              <div className="absolute inset-20 rounded-full border border-primary/[0.16]" />

              <div className="absolute inset-[110px] rounded-full border border-primary/[0.10]" />


              {/* Connection lines */}

              <div className="absolute left-1/2 top-1/2 h-[390px] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

              <div className="absolute left-1/2 top-1/2 h-px w-[390px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />


              {/* Diagonal connections */}

              <div className="absolute left-1/2 top-1/2 h-[330px] w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gradient-to-b from-transparent via-primary/15 to-transparent" />

              <div className="absolute left-1/2 top-1/2 h-[330px] w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gradient-to-b from-transparent via-primary/15 to-transparent" />


              {/* HUMAN NODE */}

              <div className="absolute left-[24px] top-1/2 -translate-y-1/2">

                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/30 bg-background/80 shadow-[0_0_50px_rgba(99,102,241,0.12)] backdrop-blur-xl">

                  <Users className="h-9 w-9 text-primary" />

                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-primary/20 bg-background px-3 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Humanity
                  </div>

                </div>

              </div>


              {/* AI NODE */}

              <div className="absolute right-[24px] top-1/2 -translate-y-1/2">

                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/30 bg-background/80 shadow-[0_0_50px_rgba(99,102,241,0.12)] backdrop-blur-xl">

                  <Cpu className="h-9 w-9 text-primary" />

                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-primary/20 bg-background px-3 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    AI
                  </div>

                </div>

              </div>


              {/* CENTRAL IUVAI CORE */}

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">

                <div className="relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-primary/40 bg-primary/[0.08] shadow-[0_0_80px_rgba(99,102,241,0.2)] backdrop-blur-2xl">

                  <div className="absolute inset-3 rounded-[1.5rem] border border-primary/15" />

                  <Brain className="relative z-10 h-12 w-12 text-primary" />

                  <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_25px_rgba(99,102,241,0.9)]" />

                  <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary/70 shadow-[0_0_20px_rgba(99,102,241,0.7)]" />

                </div>

                <div className="mt-5 text-center">

                  <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
                    IUVAI
                  </div>

                  <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                    Intelligence Layer
                  </div>

                </div>

              </div>


              {/* FLOATING NETWORK NODES */}

              <div className="absolute left-[28%] top-[12%] h-2 w-2 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)]" />

              <div className="absolute right-[22%] top-[18%] h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />

              <div className="absolute bottom-[18%] left-[25%] h-1.5 w-1.5 rounded-full bg-primary/70" />

              <div className="absolute bottom-[12%] right-[28%] h-2 w-2 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)]" />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT / INTRO
      ====================================================== */}

      <section
        id="about"
        className="relative border-t border-border py-24 lg:py-32"
      >

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
          EXPERTS / COMPANIES
      ====================================================== */}

      <section className="border-t border-border">

        <div className="grid lg:grid-cols-2">

          {/* EXPERTS */}

          <div
            id="experts"
            className="relative overflow-hidden border-b border-border p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-20"
          >

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
        className="border-t border-border py-24 lg:py-32"
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


      {/* =====================================================
          TRUST
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

              <Network className="mb-5 h-7 w-7 text-primary" />

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

      <footer className="border-t border-border">

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">

            <div className="font-semibold tracking-tight">
              IUVAI
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Bridging the gap between humanity and AI.
            </p>

            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} IUVAI
            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}
