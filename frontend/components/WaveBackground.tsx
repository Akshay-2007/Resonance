"use client";

import React from "react";

export default function WaveBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Wave Grid Lines inspired by reference */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[600px] text-slate-300/60 dark:text-slate-700/25 transition-colors duration-500"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Concentric Resonance Rings - Left */}
        <circle cx="180" cy="400" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <circle cx="180" cy="400" r="180" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <circle cx="180" cy="400" r="240" stroke="currentColor" strokeWidth="1" opacity="0.25" />
        <circle cx="180" cy="400" r="300" stroke="currentColor" strokeWidth="1" opacity="0.15" />

        {/* Concentric Resonance Rings - Right */}
        <circle cx="1260" cy="380" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <circle cx="1260" cy="380" r="200" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <circle cx="1260" cy="380" r="260" stroke="currentColor" strokeWidth="1" opacity="0.25" />
        <circle cx="1260" cy="380" r="320" stroke="currentColor" strokeWidth="1" opacity="0.15" />

        {/* Dynamic Harmonic Wave Contours */}
        {Array.from({ length: 18 }).map((_, i) => {
          const offset = i * 14;
          const y1 = 280 + i * 12;
          const y2 = 420 + Math.sin(i * 0.5) * 30;
          const y3 = 250 + i * 15;
          const opacity = 0.25 + (i / 18) * 0.45;
          return (
            <path
              key={i}
              d={`M-50,${y1} C320,${y2 + offset * 0.6} 640,${y3 - offset * 0.4} 920,${440 + offset * 0.5} C1180,${340 - offset * 0.3} 1360,${y2} 1500,${y1 + 40}`}
              stroke="currentColor"
              strokeWidth="1.2"
              opacity={opacity}
              fill="none"
            />
          );
        })}
      </svg>
    </div>
  );
}
