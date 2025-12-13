"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LiveTranscriptionPanel } from "@/components/LiveTranscriptionFrontend";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const HeroPage = () => {
  return (
    <section id="home" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 text-white px-6 py-24">
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto text-center flex flex-col items-center mt-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400 sm:text-7xl special-text"
          variants={itemVariants}
        >
          Live AI{" "}
          <span className="bg-clip-text bg-linear-to-r from-emerald-400 via-white to-emerald-700">
            Transcription
          </span>
          <br />
          For Medical Professionals
        </motion.h1>

        <motion.p
          className="mt-5 max-w-2xl mx-auto text-lg text-gray-300"
          variants={itemVariants}
        >
          Capture every detail of your patient consultations in real-time. Our
          AI handles the notes, so you can focus on care.
        </motion.p>

        <motion.div className="mt-10" variants={itemVariants}>
          <Link href="/signup">
            <Button
              size="lg"
              className="rounded-full bg-emerald-500 text-gray-900 font-semibold transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Start Transcribing Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="mt-12 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <LiveTranscriptionPanel />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroPage;
