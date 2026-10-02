"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: number;
  label: string;
  description?: string;
}

export function AnimatedStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("w-full py-2", className)}>
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-[rgba(212,175,55,0.2)] z-0" />

        {/* Animated Progress Fill Line */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-[#d4af37] to-[#f3c64c] z-0"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div
              key={step.id}
              onClick={() => onStepClick && onStepClick(step.id)}
              className="relative z-10 flex flex-col items-center cursor-pointer group"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  boxShadow: isActive
                    ? "0 0 16px rgba(243, 198, 76, 0.6)"
                    : "none",
                }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  isCompleted
                    ? "border-[#10b981] bg-[#10b981] text-white"
                    : isActive
                    ? "border-[#f3c64c] bg-[#0c182b] text-[#f3c64c]"
                    : "border-[rgba(212,175,55,0.3)] bg-[#060e1a] text-slate-400 group-hover:border-[rgba(212,175,55,0.6)]",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </motion.div>

              <div className="mt-1.5 text-center">
                <span
                  className={cn(
                    "block text-[11px] font-semibold whitespace-nowrap",
                    isActive
                      ? "text-[#f3c64c]"
                      : isCompleted
                      ? "text-slate-200"
                      : "text-slate-500",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
