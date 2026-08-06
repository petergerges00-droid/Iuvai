import { ReactNode } from "react";
import { IuvaiBackground } from "./iuvai-background";
import { IuvaiLogo } from "./iuvai-logo";

interface IuvaiShellProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function IuvaiShell({
  children,
  showHeader = true,
}: IuvaiShellProps) {
  return (
    <div className="min-h-screen bg-[#05070d] text-white overflow-hidden">
      <IuvaiBackground />

      <div className="relative z-10 min-h-screen">
        {showHeader && (
          <header className="border-b border-white/[0.07] bg-[#05070d]/70 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
              <IuvaiLogo />

              <div className="text-xs uppercase tracking-[0.2em] text-white/30">
                Human Intelligence Infrastructure
              </div>
            </div>
          </header>
        )}

        <main>{children}</main>
      </div>
    </div>
  );
}
