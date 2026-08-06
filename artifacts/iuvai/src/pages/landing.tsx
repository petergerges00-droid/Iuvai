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
export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* =====================================================
          GLOBAL FUTURISTIC BACKGROUND
      ====================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 top-[35%] h-[600px] w-[600px] rounded-full bg-primary/[0.05] blur-[140px]" />
        <div className="absolute bottom-[-250px] left-[35%] h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-[140px]" />
        {/* Global grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Larger technical grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '192px 192px',
          }}
        />
      </div>
      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-primary/30" />
              <div className="absolute inset-[5px] rounded-full border border-primary/50" />
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_rgba(99,102,241,0.9)]" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.22em]">
                IUVAI
              </div>
              <div className="hidden text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 sm:block">
                Human Intelligence Infrastructure
              </div>
            </div>
          </Link>
          {/* Navigation */}
          <nav className="flex items-center gap-3">
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
          </nav>
        </div>
      </header>
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          {/* LEFT SIDE */}
          <div className="relative z-10">
            {/* Eyebrow */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.05] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Human intelligence infrastructure
            </div>
            {/* Main headline */}
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
              Bridging the gap
              <span className="block text-primary">
                between humanity
              </span>
              <span className="block">
                and AI.
              </span>
            </h1>
            {/* Description */}
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              IUVAI connects human expertise with artificial intelligence,
              enabling exceptional people and ambitious companies to build
              better AI systems together.
            </p>
            {/* CTA */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-4 text-xs text-muted-foreground">
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
              HUMAN ↔ AI VISUALIZATION
          ================================================== */}
          <div className="relative mx-auto flex h-[440px] w-full max-w-[520px] items-center justify-center lg:h-[560px]">
            {/* Outer glow */}
            <div className="absolute h-[360px] w-[360px] rounded-full bg-primary/[0.035] blur-[70px]" />
            {/* Outer orbital rings */}
            <div className="absolute h-[430px] w-[430px] rounded-full border border-primary/[0.08]" />
            <div className="absolute h-[350px] w-[350px] rounded-full border border-primary/[0.12]" />
            <div className="absolute h-[270px] w-[270px] rounded-full border border-primary/[0.18]" />
            {/* Connecting orbital line */}
            <div className="absolute h-[430px] w-[430px] animate-[spin_25s_linear_infinite] rounded-full border border-dashed border-primary/[0.12]" />
            {/* Connection points */}
            {/* HUMAN */}
            <div className="absolute left-[4%] top-1/2 -translate-y-1/2">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/30 bg-background/80 shadow-[0_0_40px_rgba(99,102,241,0.12)] backdrop-blur-xl">
                <Users className="h-9 w-9 text-primary" />
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Humanity
                </div>
                <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
              </div>
            </div>
            {/* AI */}
            <div className="absolute right-[4%] top-1/2 -translate-y-1/2">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/30 bg-background/80 shadow-[0_0_40px_rgba(99,102,241,0.12)] backdrop-blur-xl">
                <Brain className="h-9 w-9 text-primary" />
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Artificial Intelligence
                </div>
                <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
              </div>
            </div>
            {/* Center connection */}
            <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border border-primary/30 bg-background/90 shadow-[0_0_60px_rgba(99,102,241,0.18)] backdrop-blur-xl">
              <div className="absolute inset-3 rounded-full border border-primary/20" />
              <div className="absolute inset-6 rounded-full border border-primary/20" />
              <div className="h-5 w-5 rounded-full bg-primary shadow-[0_0_30px_rgba(99,102,241,0.9)]" />
            </div>
            {/* Connection beam */}
            <div className="absolute left-[22%] right-[22%] top-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            {/* Floating nodes */}
            <div className="absolute left-[25%] top-[19%] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
            <div className="absolute right-[22%] top-[26%] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
            <div className="absolute bottom-[22%] left-[29%] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
            <div className="absolute bottom-[18%] right-[30%] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
          </div>
        </div>
      </section>
      {/* =====================================================
          INTRO
      ====================================================== */}
      <section className="relative border-t border-border/70 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-primary">
              The bridge
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              AI can scale intelligence.
              <br />
              <span className="text-muted-foreground">
                Humanity gives it meaning.
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              The next generation of AI will require more than models and
              computation. It will require medicine, science, engineering,
              law, finance, language and the countless areas of human
              knowledge that make the real world understandable.
            </p>
          </div>
        </div>
      </section>
      {/* =====================================================
          TWO SIDES
      ====================================================== */}
      <section className="border-t border-border/70">
        <div className="grid lg:grid-cols-2">
          {/* Experts */}
          <div className="relative overflow-hidden border-b border-border/70 p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-20">
            <div className="absolute inset-0 bg-primary/[0.025]" />
            <div className="relative max-w-xl">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-primary">
                For experts
              </p>
              <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Your expertise helps shape tomorrow.
              </h3>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Put your knowledge to work on the systems shaping the
                future of AI. IUVAI connects domain experts with meaningful
                AI training, evaluation and research opportunities.
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
          {/* Companies */}
          <div className="relative overflow-hidden p-8 sm:p-12 lg:p-20">
            <div className="absolute inset-0 bg-muted/[0.12]" />
            <div className="relative max-w-xl">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-primary">
                For companies
              </p>
              <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Build AI with the intelligence it needs.
              </h3>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Access qualified experts who can help train, evaluate and
                improve your AI systems with real-world domain knowledge.
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
      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}
      <section className="border-t border-border/70 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
          <div className="grid overflow-hidden rounded-2xl border border-border/70 md:grid-cols-3">
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
            ].map((step, index) => (
              <div
                key={step.number}
                className={`bg-background p-8 sm:p-10 lg:p-12 ${
                  index !== 2 ? 'border-b md:border-b-0 md:border-r border-border/70' : ''
                }`}
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
                Real expertise remains at the center of the AI development
                process.
              </p>
            </div>
            <div>
              <Globe2 className="mb-5 h-7 w-7 text-primary" />
              <h3 className="text-lg font-semibold">
                Built globally
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Connect with opportunities and expertise beyond geographical
                boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="relative overflow-hidden border-t border-border/70">
        <div className="absolute inset-0 bg-primary/[0.035]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.05] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Human intelligence × AI
          </div>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Bridge the gap.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Whether you are an expert ready to contribute or a company
            building the next generation of AI, IUVAI brings human
            intelligence and artificial intelligence together.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
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
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-10 sm:flex-row lg:px-8">
          <div className="font-semibold tracking-[0.18em]">
            IUVAI
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Bridging the gap between humanity and AI.
          </p>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} IUVAI
          </div>
        </div>
      </footer>
    </main>
  );
}
