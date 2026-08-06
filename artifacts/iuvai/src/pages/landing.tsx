import { Link } from 'wouter';
import { ArrowRight, Brain, ShieldCheck, Users, Sparkles } from 'lucide-react';


export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Iuvai
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How It Works
            </a>
            <a href="#experts" className="text-sm text-muted-foreground hover:text-foreground">
              For Experts
            </a>
            <a href="#companies" className="text-sm text-muted-foreground hover:text-foreground">
              For Companies
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium hover:text-primary sm:block"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Human expertise for better AI
              </div>

              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                The human expertise
                <span className="block text-primary">
                  behind better AI.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Iuvai connects qualified experts with companies building,
                evaluating, and improving artificial intelligence.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Join Iuvai
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-base font-semibold transition hover:bg-muted"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Value proposition */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                Real Expertise
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Connect AI companies with professionals who understand
                complex real-world domains.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                Verified Professionals
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Experts build profiles, submit credentials, and demonstrate
                their domain knowledge.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                Meaningful Work
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Give experts opportunities to contribute to the development
                of the next generation of AI.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Expertise meets opportunity.
            </h2>

            <p className="mt-4 text-muted-foreground">
              Iuvai is designed to make the connection between qualified
              professionals and AI companies simple.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border p-8">
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold">
                Create your profile
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Tell us about your professional background, expertise,
                specialization, and skills.
              </p>
            </div>

            <div className="rounded-2xl border p-8">
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold">
                Get verified
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Submit your resume and credentials so your expertise can be
                reviewed.
              </p>
            </div>

            <div className="rounded-2xl border p-8">
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold">
                Work with AI companies
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Access projects that match your professional expertise and
                contribute to improving AI systems.
              </p>
            </div>
          </div>
        </section>

        {/* Experts */}
        <section id="experts" className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
                For Experts
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Your expertise can help shape the future of AI.
              </h2>

              <p className="mt-5 text-lg leading-8 text-primary-foreground/80">
                Iuvai gives professionals across specialized fields a way
                to apply their knowledge to AI development, evaluation, and
                training.
              </p>

              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary transition hover:bg-white/90"
              >
                Become an Expert
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Companies */}
        <section id="companies" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                For Companies
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Build AI with people who know the domain.
              </h2>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Access qualified professionals who can provide the domain
                knowledge needed to train, evaluate, and improve AI systems.
              </p>

              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Partner With Iuvai
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-8">
              <div className="grid gap-6">
                <div>
                  <h3 className="font-semibold">
                    Domain-specific expertise
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Professionals with knowledge across specialized fields.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Human evaluation
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Human judgment where automated evaluation isn't enough.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Scalable talent
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Build a pool of qualified experts around your projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to build better AI?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join Iuvai and become part of the human expertise powering
              the next generation of artificial intelligence.
            </p>

            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="font-semibold text-foreground">
            Iuvai
          </div>

          <p>
            © {new Date().getFullYear()} Iuvai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
