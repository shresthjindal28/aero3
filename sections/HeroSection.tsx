"use client"

import { motion } from "framer-motion";

import { LiveTranscriptionPanel } from "@/components/LiveTranscriptionPanel";
import { FloatingMedicalIcons } from "@/components/FloatingMedicalIcons";

export function ModernHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-20">


      {/* Neon glow background */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
<div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      {/* Floating Medical Icons */}
      <FloatingMedicalIcons />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">

        {/* Live Transcription Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <LiveTranscriptionPanel />
        </motion.div>
      </div>
    </section>
  );
}
