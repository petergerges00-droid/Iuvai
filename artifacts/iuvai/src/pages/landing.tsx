import { Link } from 'wouter';
import { ArrowRight, Brain, Building2, CheckCircle2, Globe2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

export default function Landing() {
  return (
    <AppShell>
      <main className="min-h-screen bg-background text-foreground overflow-hidden">

        {/* =========================
            HERO
        ========================== */}
        <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden">

          {/* Futuristic background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px]" />

            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-24 lg:py-32">

            <div className="max-w-4xl">

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary mb-8">
                <Sparkles className="h-4 w-4" />
                <span>Human intelligence infrastructure</span>
              </div>

              {/* Main headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-semibold tracking-[-0.04em] leading-[0.95]">
                A human intelligence
                <span className="block text-primary">
                  infrastructure
                </span>
                powering tomorrow's AI.
              </h1>

              <p className="mt-8 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
                IUVAI connects exceptional human expertise with the
                companies building the next generation of artificial
                intelligence.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">

                <Link href="/signup">
                  <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20">
                    Join as an Expert
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>

                <Link href="/signup">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 backdrop-blur px-7 py-4 font-medium transition-colors hover:bg-muted">
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

            {/* Decorative system visualization */}
            <div className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 w-[360px] h-[360px]">

              <div className="absolute inset-0 rounded-full border border-primary/10" />
              <div className="absolute inset-8 rounded-full border border-primary/15" />
              <div className="absolute inset-16 rounded-full border border-primary/20" />

              <div className="absolute inset-0 flex items-center justify-center">

                <div className="relative w-28 h-28 rounded-3xl border border-primary/30 bg-primary/10 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-primary/10">
                  <Brain className="w-12 h-12 text-primary" />

                  <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
                </div>

              </div>

              <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                Experts
              </div>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                Companies
              </div>

              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-muted-foreground">
                <Globe2 className="w-3.5 h-3.5" />
                Global
              </div>

            </div>

          </div>
        </section>


        {/* =========================
            INTRO
        ========================== */}
        <section className="relative border-t border-border py-24 lg:py-32">

          <div className="max-w-7xl mx-auto px-6 lg:px-8">

            <div className="max-w-3xl">

              <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-5">
                The infrastructure
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                AI is evolving rapidly.
                <br />
                Human expertise remains essential.
              </h2>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                The most capable AI systems require more than computation.
                They require people who understand medicine, science,
                engineering, law, finance, language and the countless
                domains that make the real world complex.
              </p>

            </div>

          </div>
        </section>


        {/* =========================
            TWO SIDES
        ========================== */}
        <section className="border-t border-border">

          <div className="grid lg:grid-cols-2">

            {/* Experts */}
            <div className="relative p-8 sm:p-12 lg:p-20 border-b lg:border-b-0 lg:border-r border-border overflow-hidden">

              <div className="absolute inset-0 bg-primary/[0.025]" />

              <div className="relative max-w-xl">

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-8">
                  <Users className="w-6 h-6 text-primary" />
                </div>

                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4">
                  For experts
                </p>

                <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  Your expertise helps shape tomorrow.
                </h3>

                <p className="mt-5 text-muted-foreground leading-relaxed">
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
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}

                </ul>

                <Link href="/signup">
                  <button className="mt-10 group inline-flex items-center gap-2 text-primary font-medium">
                    Become an expert
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>

              </div>
            </div>


            {/* Companies */}
            <div className="relative p-8 sm:p-12 lg:p-20 overflow-hidden">

              <div className="absolute inset-0 bg-muted/20" />

              <div className="relative max-w-xl">

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-8">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>

                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4">
                  For companies
                </p>

                <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  Build AI with the intelligence it needs.
                </h3>

                <p className="mt-5 text-muted-foreground leading-relaxed">
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
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}

                </ul>

                <Link href="/signup">
                  <button className="mt-10 group inline-flex items-center gap-2 text-primary font-medium">
                    Work with IUVAI
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>

              </div>
            </div>

          </div>
        </section>


        {/* =========================
            HOW IT WORKS
        ========================== */}
        <section className="border-t border-border py-24 lg:py-32">

          <div className="max-w-7xl mx-auto px-6 lg:px-8">

            <div className="max-w-2xl mb-16">

              <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-5">
                How it works
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Connecting intelligence
                <span className="text-muted-foreground">
                  {' '}with opportunity.
                </span>
              </h2>

            </div>

            <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">

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
                  <div className="text-sm font-mono text-primary mb-8">
                    {step.number}
                  </div>

                  <h3 className="text-2xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}

            </div>

          </div>
        </section>


        {/* =========================
            TRUST / SECURITY
        ========================== */}
        <section className="border-t border-border py-24">

          <div className="max-w-7xl mx-auto px-6 lg:px-8">

            <div className="grid md:grid-cols-3 gap-8">

              <div>
                <ShieldCheck className="w-7 h-7 text-primary mb-5" />
                <h3 className="font-semibold text-lg">
                  Quality-first
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Expertise is verified and matched carefully to the
                  requirements of each project.
                </p>
              </div>

              <div>
                <Brain className="w-7 h-7 text-primary mb-5" />
                <h3 className="font-semibold text-lg">
                  Human intelligence
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Real expertise remains at the center of the AI
                  development process.
                </p>
              </div>

              <div>
                <Globe2 className="w-7 h-7 text-primary mb-5" />
                <h3 className="font-semibold text-lg">
                  Built globally
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Connect with opportunities and expertise beyond
                  geographical boundaries.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* =========================
            FINAL CTA
        ========================== */}
        <section className="relative border-t border-border overflow-hidden">

          <div className="absolute inset-0 bg-primary/[0.035]" />

          <div className="relative max-w-5xl mx-auto px-6 py-24 lg:py-32 text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary mb-8">
              <Sparkles className="h-4 w-4" />
              The future needs human intelligence
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
              Help build what comes next.
            </h2>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you are an expert ready to contribute or a company
              building the next generation of AI, IUVAI is where human
              intelligence meets opportunity.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

              <Link href="/signup">
                <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-medium text-primary-foreground hover:shadow-xl hover:shadow-primary/20 transition-all">
                  Join IUVAI
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/login">
                <button className="inline-flex items-center justify-center rounded-xl border border-border px-7 py-4 font-medium hover:bg-muted transition-colors">
                  Sign in
                </button>
              </Link>

            </div>

          </div>
        </section>


        {/* =========================
            FOOTER
        ========================== */}
        <footer className="border-t border-border">

          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

              <div className="font-semibold tracking-tight">
                IUVAI
              </div>

              <p className="text-sm text-muted-foreground text-center">
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
