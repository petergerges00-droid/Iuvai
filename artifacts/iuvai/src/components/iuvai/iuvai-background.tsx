export function IuvaiBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Main ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.14),transparent_38%)]" />

      {/* Secondary glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_45%,rgba(99,102,241,0.08),transparent_30%)]" />

      {/* Technical grid */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Subtle center glow */}
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/[0.025] blur-3xl" />
    </div>
  );
}
