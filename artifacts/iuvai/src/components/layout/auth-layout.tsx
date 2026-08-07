import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Content */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] lg:px-20 lg:border-r border-border bg-card relative z-10 shadow-2xl">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-12">
            <div className="text-2xl font-bold tracking-tight text-primary font-sans flex items-center gap-3 mb-16">
  <div className="relative flex h-9 w-9 items-center justify-center">
    <div className="absolute left-0 h-7 w-7 rounded-full border border-primary/70 transition-all duration-300" />
    <div className="absolute right-0 h-7 w-7 rounded-full border border-primary/40 transition-all duration-300" />
    <div className="relative z-10 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
  </div>
  IUVAI
</div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
              {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 max-w-2xl px-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-foreground mb-6 font-sans">
              Where human expertise meets AI ambition.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-serif">
              The definitive human intelligence infrastructure platform connecting the world's most qualified experts with systems that need verified training, evaluation, and development.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
