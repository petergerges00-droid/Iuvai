import { useLocation } from 'wouter';

export default function AutomationRequest() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => setLocation('/company-dashboard')}
          className="mb-8 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-semibold tracking-tight">
          Automation Request
        </h1>

        <p className="mt-3 text-muted-foreground">
          Tell us what you want to automate.
        </p>

        <div className="mt-8 rounded-xl border bg-card p-6">
          <p className="text-sm">
            Automation request page loaded successfully.
          </p>
        </div>
      </div>
    </div>
  );
}
