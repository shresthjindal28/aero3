"use client"
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

export function StethoscopeAnimation() {
  return (
    <div className="relative h-screen w-screen flex items-center justify-center">
      {/* Ambient shadow */}
      <motion.div
        className="absolute bottom-0 w-48 h-12 bg-linear-to-r from-transparent via-slate-300/30 to-transparent rounded-full blur-xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Stethoscope SVG with floating animation */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <defs>
            {/* Gradients for modern look */}
            <linearGradient id="tubeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            
            <linearGradient id="earGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            
            <linearGradient id="chestpieceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>

            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Left earpiece */}
          <path
            d="M 50 60 Q 45 50 50 40 L 75 45 Q 80 50 75 60 Z"
            fill="url(#earGradient)"
            filter="url(#softShadow)"
          />
          <circle cx="52" cy="50" r="6" fill="#94a3b8" opacity="0.6"/>

          {/* Right earpiece */}
          <path
            d="M 190 60 Q 195 50 190 40 L 165 45 Q 160 50 165 60 Z"
            fill="url(#earGradient)"
            filter="url(#softShadow)"
          />
          <circle cx="188" cy="50" r="6" fill="#94a3b8" opacity="0.6"/>

          {/* Left tube from earpiece */}
          <motion.path
            d="M 62 55 Q 65 70 70 85 Q 75 100 85 110"
            stroke="url(#tubeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            filter="url(#softShadow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Right tube from earpiece */}
          <motion.path
            d="M 178 55 Q 175 70 170 85 Q 165 100 155 110"
            stroke="url(#tubeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            filter="url(#softShadow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Y-junction */}
          <circle cx="120" cy="125" r="8" fill="#2563eb" filter="url(#softShadow)"/>
          
          {/* Left tube to junction */}
          <motion.path
            d="M 85 110 Q 95 115 105 120 L 113 123"
            stroke="url(#tubeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            filter="url(#softShadow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          />

          {/* Right tube to junction */}
          <motion.path
            d="M 155 110 Q 145 115 135 120 L 127 123"
            stroke="url(#tubeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            filter="url(#softShadow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          />

          {/* Main tube from junction to chestpiece */}
          <motion.path
            d="M 120 133 Q 122 155 120 175"
            stroke="url(#tubeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            filter="url(#softShadow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
          />

          {/* Chestpiece (diaphragm) */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "backOut" }}
          >
            {/* Outer ring */}
            <circle 
              cx="120" 
              cy="190" 
              r="28" 
              fill="url(#chestpieceGradient)"
              filter="url(#softShadow)"
            />
            
            {/* Inner ring detail */}
            <circle 
              cx="120" 
              cy="190" 
              r="22" 
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              opacity="0.5"
            />
            
            {/* Diaphragm */}
            <circle 
              cx="120" 
              cy="190" 
              r="18" 
              fill="#0c4a6e"
              opacity="0.8"
            />
            
            {/* Highlight */}
            <ellipse
              cx="115"
              cy="185"
              rx="8"
              ry="6"
              fill="white"
              opacity="0.3"
            />

            {/* Rim detail */}
            <circle 
              cx="120" 
              cy="190" 
              r="28" 
              fill="none"
              stroke="#0e7490"
              strokeWidth="1.5"
            />
          </motion.g>

          {/* Pulse effect on chestpiece */}
          <motion.circle
            cx="120"
            cy="190"
            r="28"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            opacity="0"
            animate={{
              scale: [1, 1.3, 1.6],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 2,
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function LoaderGate({ children, duration = 3000 }: { children: ReactNode; duration?: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), duration);
    return () => clearTimeout(t);
  }, [duration]);
  return ready ? <>{children}</> : <StethoscopeAnimation />;
}
