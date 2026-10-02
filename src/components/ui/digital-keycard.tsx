"use client";

import React, { useRef, useState } from "react";
import { Sparkles, Wifi, ShieldCheck, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DigitalKeycardProps {
  guestName?: string;
  roomNumber?: string;
  tierName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  bookingId?: string;
  className?: string;
}

export function DigitalKeycard({
  guestName = "Valued Guest",
  roomNumber = "201",
  tierName = "Executive Room",
  checkInDate = "2026-09-22",
  checkOutDate = "2026-09-24",
  bookingId = "HSI-202609-001",
  className,
}: DigitalKeycardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div
      style={{ perspective: "1000px" }}
      className={cn("flex justify-center p-4", className)}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.15s ease-out",
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-[380px] h-[230px] rounded-2xl p-5 select-none cursor-pointer overflow-hidden border border-[rgba(243,198,76,0.6)] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.25)] bg-gradient-to-br from-[#162744] via-[#0c182b] to-[#060e1a]"
      >
        {/* Holographic foil glare reflection */}
        <div
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 230, 150, 0.35) 0%, rgba(56, 189, 248, 0.15) 40%, transparent 80%)`,
          }}
          className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-200"
        />

        {/* Brushed metallic textures & watermark */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Card Header */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.4)] text-[#f3c64c]">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[#d4af37]">
                Sri Sai Vasudev Residency
              </div>
              <div className="text-[9px] text-[#94a3b8] tracking-wider">
                DIGITAL SMART RFID KEY
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#d4af37]">
            <Wifi size={18} className="rotate-90 opacity-80" />
            <ShieldCheck size={18} className="text-[#38bdf8]" />
          </div>
        </div>

        {/* RFID Chip & Room Number */}
        <div className="relative z-10 mt-4 flex justify-between items-center">
          {/* Gold Smart Chip */}
          <div className="w-11 h-9 rounded-md bg-gradient-to-tr from-[#997e26] via-[#f3c64c] to-[#d4af37] p-[1px] shadow-md">
            <div className="w-full h-full rounded-[5px] bg-[#0c182b] flex flex-col justify-around p-1">
              <div className="h-[1px] bg-[rgba(212,175,55,0.4)]" />
              <div className="h-[1px] bg-[rgba(212,175,55,0.4)]" />
              <div className="h-[1px] bg-[rgba(212,175,55,0.4)]" />
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase text-[#94a3b8] font-medium">Room Key</div>
            <div className="text-2xl font-bold font-serif text-[#fceec5] tracking-wider drop-shadow-md">
              #{roomNumber}
            </div>
          </div>
        </div>

        {/* Card Footer: Guest & Dates */}
        <div className="absolute bottom-4 left-5 right-5 z-10 flex justify-between items-end border-t border-[rgba(212,175,55,0.2)] pt-2.5">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#94a3b8]">Authorized Guest</div>
            <div className="text-sm font-semibold text-white tracking-wide truncate max-w-[190px]">
              {guestName}
            </div>
            <div className="text-[10px] text-[#f3c64c]">{tierName}</div>
          </div>

          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-[#94a3b8]">Stay Period</div>
            <div className="text-[10px] font-medium text-slate-200">
              {checkInDate} → {checkOutDate}
            </div>
            <div className="text-[9px] text-[#38bdf8] font-mono">{bookingId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
