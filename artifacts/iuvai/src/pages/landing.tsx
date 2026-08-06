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

function IuvaiLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-9 w-9 items-center justify-center">
        {/* Left circle */}
        <div className="absolute left-0 h-5 w-5 rounded-full border border-primary/80 bg-primary/10 shadow-[0_0_14px_rgba(99,102,241,0.25)]" />

        {/* Right circle */}
        <div className="absolute right-0 h-5 w-5 rounded-full border border-primary/80 bg-primary/10 shadow-[0_0_14px_rgba(99,102,241,0.25)]" />

        {/* Center connection */}
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.9)]" />

        {/* Connecting line */}
        <div className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-primary/50" />
      </div>

      <span className="text-sm font-bold tracking-[0.22em] text-foreground">
        IUVAI
      </span>
    </div>
  );
}

function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Main grid */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* Secondary fine grid */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />

      {/* Ambient glow */}
      <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />

      <div className="absolute -right-40 top-[35%] h-[600px] w-[600px] rounded-full bg-primary/[0.05] blur-[140px]" />

      <div className="absolute bottom-[-250px] left-[30%] h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[140px]" />
    </div>
  );
}

function IntelligenceNetwork() {
  return (
    <div className="relative h-[420px] w-[420px]">
      {/* Outer rings */}
      <div className="absolute inset-0 rounded-full border border-primary/10" />

      <div className="absolute inset-8 rounded-full border border-primary/15" />

      <div className="absolute inset-16 rounded-full border border-primary/20" />

      <div className="absolute inset-24 rounded-full border border-primary/10" />

      {/* Orbital connection lines */}
      <div className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-primary/0 via-primary/20 to-primary/40" />

      <div className="absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-gradient-to-t from-primary/0 via-primary/20 to-primary/40" />

      <div className="absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/40" />

      <div className="absolute right-0 top-1/2 h-px w-1/2 -translate-y-1/2 bg-gradient-to-l from-primary/0 via-primary/20 to-primary/40" />

      {/* Human node */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-background/80 shadow-xl backdrop-blur-xl">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          Human
        </div>
      </div>

      {/* AI node */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_35px_rgba(99,102,241,0.15)] backdrop-blur-xl">
          <Brain className="h-6 w-6 text-primary" />
        </div>

        <div className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-primary/70">
          AI
        </div>
      </div>

      {/* Central intelligence core */}
      <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/20" />

        <div className="absolute inset-3 rounded-full border border-primary/30" />

        <div className="absolute inset-6 rounded-full bg-primary/[0.08] shadow-[0_0_60px_rgba(99,102,241,0.2)] backdrop-blur-xl" />

        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-background shadow-[0_0_35px_rgba(99,102,241,0.25)]">
          <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,0.9)]" />
        </div>
      </div>

      {/* Floating connection nodes */}
      <div className="absolute left-[22%] top-[18%] h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />

      <div className="absolute right-[20%] top-[22%] h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_10px_rgba(99,102,241,0.7)]" />

      <div className="absolute bottom-[20%] left-[25%] h-1.5 w-1.5 rounded-full bg-primary/60 shadow-[0_0_10px_rgba(99,102,241,0.6)]" />

      <div className="absolute bottom-[18%] right-[24%] h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <GridBackground />

      {/* ===================================================== */}
      {/* TOP NAVIGATION */}
      {/* ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/">
            <IuvaiLogo />
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
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Join IUVAI
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Hero text */}
            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Human intelligence infrastructure
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-[78px]">
                <span className="block text-foreground">
                  Bridging the gap
                </span>

                <span className="block text-foreground">
                  between{' '}
                  <span className="text-primary">
                    humanity
                  </span>
                </span>

                <span className="block text-foreground">
                  and{' '}
                  <span className="text-primary">
                    AI
                  </span>
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                IUVAI connects exceptional human expertise with the
                companies building the next generation of artificial
                intelligence.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20"
                >
                  Join as an Expert
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-7 py-4 font-medium backdrop-blur transition-colors hover:bg-muted"
                >
                  Build with IUVAI
                  <Building2 className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 text-sm text-muted-foreground">
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

            {/* Futuristic visualization */}
            <div className="relative hidden items-center justify-center lg:flex">
              <IntelligenceNetwork />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* INTRO */}
      {/* ===================================================== */}

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

      {/* ===================================================== */}
      {/* EXPERTS / COMPANIES */}
      {/* ===================================================== */}

      <section
        id="experts"
        className="border-t border-border"
      >
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
                Your expertise helps shaping tomorrow.
              </h3>

              <p className="mt-5 text-xl font-medium text-foreground">
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
                  'Get paid for contributing your domain knowledge',
                  'Contribute to the development of advanced AI',
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

          {/* Companies */}
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

      {/* ===================================================== */}
      {/* HOW IT WORKS */}
      {/* ===================================================== */}

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
                {' '}
                with opportunity.
              </span>
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
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

      {/* ===================================================== */}
      {/* TRUST */}
      {/* ===================================================== */}

      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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

      {/* ===================================================== */}
      {/* FINAL CTA */}
      {/* ===================================================== */}

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
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/20"
            >
              Join IUVAI
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-border px-7 py-4 font-medium transition-colors hover:bg-muted"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-10 sm:flex-row lg:px-8">
          <IuvaiLogo />

          <p className="text-center text-sm text-muted-foreground">
            Bridging the gap between humanity and AI.
          </p>

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} IUVAI
          </div>
        </div>
      </footer>
    </div>
  );
}
