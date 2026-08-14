import { useLocation } from 'wouter';

export default function AutomationRequest() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => setLocation('/company-dashboard')}
          className="mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to dashboard
        </button>

        <div className="rounded-xl border bg-card p-8">
          <h1 className="text-3xl font-semibold">
            Request AI Automation
          </h1>

          <p className="mt-3 text-muted-foreground">
            Tell IUVAI what you want to automate and our team will
            review your request.
          </p>

          <div className="mt-8 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Automation request page is working.
          </div>
        </div>
      </div>
    </div>
  );
}
