"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden bg-[#060e1a] w-full rounded-2xl z-0 pt-8 pb-12",
        className,
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: "10rem" }}
          whileInView={{ opacity: 1, width: "24rem" }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-44 overflow-visible w-[24rem] bg-gradient-conic from-[#d4af37] via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-[100%] left-0 bg-[#060e1a] h-32 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-32 h-[100%] left-0 bg-[#060e1a] bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0.5, width: "10rem" }}
          whileInView={{ opacity: 1, width: "24rem" }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-44 w-[24rem] bg-gradient-conic from-transparent via-transparent to-[#d4af37] text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-32 h-[100%] right-0 bg-[#060e1a] bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-[#060e1a] h-32 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Central glow & blur */}
        <div className="absolute top-1/2 h-36 w-full translate-y-8 scale-x-150 bg-[#060e1a] blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-36 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-28 w-[20rem] -translate-y-1/2 rounded-full bg-[#f3c64c] opacity-30 blur-3xl"></div>

        <motion.div
          initial={{ width: "6rem" }}
          whileInView={{ width: "14rem" }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-28 w-56 -translate-y-[4.5rem] rounded-full bg-[#d4af37] opacity-40 blur-2xl"
        ></motion.div>

        <motion.div
          initial={{ width: "10rem" }}
          whileInView={{ width: "22rem" }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[22rem] -translate-y-[5rem] bg-[#fceec5]"
        ></motion.div>

        <div className="absolute inset-auto z-40 h-36 w-full -translate-y-[10rem] bg-[#060e1a]"></div>
      </div>

      <div className="relative z-50 flex -translate-y-16 flex-col items-center px-4 w-full">
        {children}
      </div>
    </div>
  );
};
