"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FloatingDockItem {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
}

export const FloatingDock = ({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-3 rounded-full border border-[rgba(212,175,55,0.4)] bg-[rgba(6,14,26,0.85)] px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.25)] backdrop-blur-xl",
        className,
      )}
    >
      {items.map((item, idx) => (
        <DockIcon key={idx} mouseX={mouseX} {...item} />
      ))}
    </motion.div>
  );
};

function DockIcon({
  mouseX,
  title,
  icon,
  onClick,
  badge,
}: FloatingDockItem & { mouseX: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [42, 58, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex aspect-square cursor-pointer items-center justify-center rounded-full bg-[rgba(19,34,61,0.9)] border border-[rgba(212,175,55,0.3)] text-[#f3c64c] shadow-md transition-colors hover:border-[#f3c64c] hover:bg-[rgba(212,175,55,0.2)]"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 5, x: "-50%" }}
            className="absolute -top-9 left-1/2 w-fit rounded-md border border-[rgba(212,175,55,0.4)] bg-[#060e1a] px-2.5 py-0.5 text-[11px] font-semibold text-[#fceec5] shadow-lg whitespace-nowrap pointer-events-none"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-center">{icon}</div>
      {badge && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ef4444] text-[8px] font-bold text-white">
          {badge}
        </span>
      )}
    </motion.div>
  );
}
