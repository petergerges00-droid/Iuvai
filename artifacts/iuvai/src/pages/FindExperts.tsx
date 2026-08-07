import AppLayout from '@/components/layout/app-layout';

export default function FindExperts() {
  return (
    <AppLayout title="Find Experts">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
            IUVAI / Expert Network
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Find Experts
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Discover verified human experts for your AI projects.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/70 p-8">
          <p className="text-sm text-muted-foreground">
            Expert search will appear here.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
