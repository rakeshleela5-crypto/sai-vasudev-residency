"use client";

import React, { useId, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}

export const SparklesCore: React.FC<ParticlesProps> = ({
  id,
  className,
  background = "transparent",
  minSize = 0.6,
  maxSize = 2.4,
  particleColor = "#f3c64c",
  particleDensity = 45,
}) => {
  const generatedId = useId();
  const canvasId = id || generatedId;
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; size: number; opacity: number; speedY: number }>
  >([]);

  useEffect(() => {
    const generated: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      speedY: number;
    }> = [];
    for (let i = 0; i < particleDensity; i++) {
      generated.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random() * 0.7 + 0.3,
        speedY: Math.random() * 0.4 + 0.1,
      });
    }
    setParticles(generated);
  }, [maxSize, minSize, particleDensity]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ background }}
    >
      <svg className="h-full w-full">
        {particles.map((p, i) => (
          <motion.circle
            key={i}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r={p.size}
            fill={particleColor}
            initial={{ opacity: p.opacity, y: 0 }}
            animate={{
              opacity: [p.opacity, p.opacity * 0.3, p.opacity],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 5) * 0.5,
            }}
          />
        ))}
      </svg>
    </div>
  );
};
