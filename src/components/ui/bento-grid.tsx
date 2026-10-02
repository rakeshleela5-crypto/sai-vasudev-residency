import React, { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  onClick,
}: {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: any;
  description: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
}) => (
  <div
    key={name}
    onClick={onClick}
    className={cn(
      "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl border border-[rgba(212,175,55,0.25)] bg-[rgba(12,24,43,0.7)] p-6 transition-all duration-300 hover:border-[rgba(212,175,55,0.6)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] hover:scale-[1.01] cursor-pointer",
      className,
    )}
  >
    <div className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300 group-hover:opacity-70">
      {background}
    </div>

    <div className="relative z-10 flex flex-col gap-2">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(212,175,55,0.15)] text-[#f3c64c] border border-[rgba(212,175,55,0.3)] transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white tracking-wide font-serif pt-2 group-hover:text-[#f3c64c] transition-colors">
        {name}
      </h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed">{description}</p>
    </div>

    {cta && (
      <div className="relative z-10 pt-4 flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] group-hover:text-[#f3c64c] transition-all">
        <span>{cta}</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    )}
  </div>
);
