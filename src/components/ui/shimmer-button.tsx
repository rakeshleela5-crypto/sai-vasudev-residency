import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#f3c64c",
      shimmerSize = "0.1em",
      shimmerDuration = "2.5s",
      borderRadius = "10px",
      background = "linear-gradient(135deg, #facc15 0%, #d4af37 100%)",
      className,
      children,
      style: propStyle,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
            background: background,
            borderRadius: borderRadius,
            ...(propStyle || {})
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-[rgba(212,175,55,0.4)] px-6 py-3 font-bold transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(212,175,55,0.8)] hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] active:scale-[0.98]",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* Spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* Spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        
        {/* Child Content */}
        <div className="relative z-10 flex items-center justify-center gap-1.5">
          {children}
        </div>

        {/* Highlight Backdrop */}
        <div
          className={cn(
            "insert-0 absolute size-full",
            "rounded-[var(--radius)] px-4 py-1.5 text-sm font-medium shadow-[inset_0_-2px_8px_rgba(212,175,55,0.15)]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-4px_12px_rgba(212,175,55,0.3)]",
          )}
        />

        {/* Inner backdrop */}
        <div
          style={{
            background: background,
            borderRadius: `calc(${borderRadius} - ${shimmerSize})`
          }}
          className={cn(
            "absolute inset-[var(--cut)] -z-20",
          )}
        />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
