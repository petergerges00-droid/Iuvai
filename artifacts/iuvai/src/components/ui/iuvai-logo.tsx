import { Link } from 'wouter';

interface IUVAILogoProps {
  href?: string;
  className?: string;
}

export function IUVAILogo({
  href = '/',
  className = '',
}: IUVAILogoProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 ${className}`}
    >
      {/* Exact locked IUVAI logo from landing page */}
      <div className="relative flex h-9 w-9 items-center justify-center">
        <div className="absolute left-0 h-7 w-7 rounded-full border border-primary/70 transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_18px_rgba(99,102,241,0.35)]" />

        <div className="absolute right-0 h-7 w-7 rounded-full border border-primary/40 transition-all duration-300 group-hover:border-primary/80 group-hover:shadow-[0_0_18px_rgba(99,102,241,0.25)]" />

        <div className="relative z-10 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
      </div>

      <span className="text-base font-semibold tracking-[0.12em]">
        IUVAI Studio
      </span>
    </Link>
  );
}

export default IUVAILogo;
