import { ArrowRight, BrainCircuit, Building2, ChevronDown, Network, ShieldCheck, Sparkles, Users } from "lucide-react";

export default function Landing() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white overflow-hidden">
      {/* Ambient futuristic background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_45%,rgba(99,102,241,0.10),transparent_30%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Navigation */}
      <header className="relative z-20 border-b border-white/[0.07] backdrop-blur-xl bg-[#05070d]/70">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 h-20 flex items-center justify-between">
          <button
            onClick={() => scrollTo("top")}
            className="text-xl font-semibold tracking-[0.28em] text-white"
          >
            IUVAI
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <button
              onClick={() => scrollTo("platform")}
              className="hover:text-white transition"
            >
              Platform
            </button>
            <button
              onClick={() => scrollTo("experts")}
              className="hover:text-white transition"
            >
              For Experts
            </button>
            <button
              onClick={() => scrollTo("companies")}
              className="hover:text-white transition"
            >
              For Companies
            </button>
          </nav>

          <button
            onClick={() => (window.location.href = "/signup")}
            className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium hover:bg-white/[0.1] transition"
          >
            Join IUVAI
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main id="top" className="relative z-10">
        {/* HERO */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center">
          <div className="mx-auto max-w-7xl w-full px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-blue-300 mb-10">
                <Sparkles className="w-3.5 h-3.5" />
                THE HUMAN INTELLIGENCE LAYER
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-semibold tracking-[-0.045em] leading-[0.95]">
                <span className="block">IUVAI</span>

                <span className="block mt-6 bg-gradient-to-r from-white via-white to-blue-300 bg-clip-text text-transparent">
                  A human intelligence
                  <br />
                  infrastructure powering
                  <br />
                  tomorrow’s AI
                </span>
              </h1>

              <p className="mx-auto mt-10 max-w-2xl text-lg sm:text-xl leading-8 text-white/55">
                IUVAI connects exceptional human expertise with the AI systems
                shaping the future — enabling better training, evaluation,
                validation, and intelligence.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => (window.location.href = "/signup")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-white/90 transition"
                >
                  Join IUVAI
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => scrollTo("platform")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-white hover:bg-white/[0.08] transition"
                >
                  Explore the platform
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Network visualization */}
            <div className="relative mx-auto mt-24 max-w-5xl h-64 hidden md:block">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-52 rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5">
                <Users className="w-6 h-6 text-blue-300 mb-4" />
                <div className="text-sm font-medium">Human Expertise</div>
                <div className="text-xs text-white/40 mt-1">
                  Knowledge · Judgment · Experience
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-blue-400/20 bg-blue-400/[0.035] flex items-center justify-center">
                <div className="absolute inset-5 rounded-full border border-blue-400/10 animate-pulse" />

                <div className="text-center relative">
                  <div className="text-2xl font-semibold tracking-[0.25em]">
                    IUVAI
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-blue-300/70 mt-2">
                    Intelligence Infrastructure
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-52 rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5">
                <BrainCircuit className="w-6 h-6 text-indigo-300 mb-4" />
                <div className="text-sm font-medium">AI Systems</div>
                <div className="text-xs text-white/40 mt-1">
                  Training · Evaluation · Intelligence
                </div>
              </div>

              <div className="absolute left-[205px] right-[calc(50%+112px)] top-1/2 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-blue-400/20" />

              <div className="absolute left-[calc(50%+112px)] right-[205px] top-1/2 h-px bg-gradient-to-r from-indigo-400/20 via-indigo-400/50 to-transparent" />
            </div>
          </div>
        </section>

        {/* PLATFORM */}
        <section id="platform" className="relative border-t border-white/[0.07] py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300 mb-4">
                The Platform
              </div>

              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                Human intelligence.
                <br />
                Built for AI.
              </h2>

              <p className="mt-6 text-white/50 text-lg leading-8">
                IUVAI creates the infrastructure that connects specialized
                human knowledge with the AI systems that depend on it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <FeatureCard
                icon={<Users />}
                number="01"
                title="Expertise"
                text="Connect exceptional professionals with opportunities to apply their knowledge to advanced AI."
              />

              <FeatureCard
                icon={<ShieldCheck />}
                number="02"
                title="Evaluation"
                text="Use specialized human judgment to assess, refine, and improve AI systems."
              />

              <FeatureCard
                icon={<Network />}
                number="03"
                title="Infrastructure"
                text="A trusted layer connecting people and organizations building the next generation of intelligence."
              />
            </div>
          </div>
        </section>

        {/* EXPERTS */}
        <section id="experts" className="relative border-t border-white/[0.07] py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300 mb-5">
                  For Experts
                </div>

                <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
                  Your expertise
                  <br />
                  helps shape
                  <br />
                  tomorrow.
                </h2>

                <p className="mt-7 max-w-xl text-lg leading-8 text-white/50">
                  Your knowledge is valuable beyond the traditional
                  workplace. IUVAI gives experts the opportunity to contribute
                  their professional judgment to the development, evaluation,
                  and improvement of next-generation AI.
                </p>

                <button
                  onClick={() => (window.location.href = "/signup")}
                  className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-white/90 transition"
                >
                  Become an IUVAI Expert
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <div className="aspect-square max-w-lg mx-auto rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/[0.12] via-transparent to-indigo-500/[0.08] p-8">
                  <div className="h-full rounded-[1.5rem] border border-white/[0.08] bg-black/30 backdrop-blur-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute w-72 h-72 rounded-full border border-blue-400/10" />
                    <div className="absolute w-48 h-48 rounded-full border border-blue-400/15" />
                    <div className="absolute w-24 h-24 rounded-full bg-blue-400/10 blur-xl" />

                    <div className="relative text-center">
                      <Users className="w-10 h-10 mx-auto text-blue-300 mb-5" />
                      <div className="text-xl font-medium">
                        Your knowledge
                      </div>
                      <div className="text-sm text-white/40 mt-2">
                        becomes part of something bigger
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPANIES */}
        <section
          id="companies"
          className="relative border-t border-white/[0.07] py-28"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="aspect-square max-w-lg mx-auto rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/[0.10] via-transparent to-blue-500/[0.08] p-8">
                  <div className="h-full rounded-[1.5rem] border border-white/[0.08] bg-black/30 backdrop-blur-xl flex items-center justify-center">
                    <div className="text-center">
                      <Building2 className="w-10 h-10 mx-auto text-indigo-300 mb-5" />
                      <div className="text-xl font-medium">
                        Specialized expertise
                      </div>
                      <div className="text-sm text-white/40 mt-2">
                        for ambitious AI systems
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300 mb-5">
                  For Companies
                </div>

                <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
                  Build better AI
                  <br />
                  with better
                  <br />
                  human intelligence.
                </h2>

                <p className="mt-7 max-w-xl text-lg leading-8 text-white/50">
                  Access specialized experts who can help train, evaluate,
                  validate, and improve your AI systems.
                </p>

                <button
                  onClick={() =>
                    (window.location.href = "/signup?type=company")
                  }
                  className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-white/90 transition"
                >
                  Work with IUVAI
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative border-t border-white/[0.07] py-32">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-blue-400/20 bg-blue-400/[0.06] mb-8">
              <Sparkles className="w-6 h-6 text-blue-300" />
            </div>

            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight">
              The human layer
              <br />
              behind artificial intelligence.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/45 leading-8">
              The future of AI isn't purely artificial.
              <br />
              It is powered by people.
            </p>

            <button
              onClick={() => (window.location.href = "/signup")}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black hover:bg-white/90 transition"
            >
              Join IUVAI
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.07]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-sm tracking-[0.25em] font-semibold">
            IUVAI
          </div>

          <div className="text-xs text-white/30">
            © {new Date().getFullYear()} IUVAI. Human intelligence
            infrastructure for tomorrow’s AI.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  number,
  title,
  text,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 hover:bg-white/[0.045] hover:border-white/[0.14] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.06] text-blue-300">
          {icon}
        </div>

        <span className="text-xs font-mono text-white/20">
          {number}
        </span>
      </div>

      <h3 className="mt-8 text-xl font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-white/40">
        {text}
      </p>
    </div>
  );
}
