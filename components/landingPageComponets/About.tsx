"use client";

import { motion, type Variants } from "framer-motion";
import { Brain, Target, ShieldCheck } from "lucide-react";

const sectionVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Uses the same high-quality easing
    },
  },
};

interface FeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureProps) => (
  <div className="flex flex-col p-6 rounded-2xl  bg-gray-950 text-white border shadow-2xl">
    <div className="shrink-0">
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-900 text-emerald-400">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-base text-slate-300">{description}</p>
    </div>
  </div>
);

const About = () => {
  return (
    <section id="about" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 text-white px-6 py-24">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(at top, rgba(16, 185, 129, 0.15), transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 space-y-24">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-base font-semibold leading-7 text-emerald-400">
            About Us
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Welcome to <span className="text-emerald-500 special-text bg-linear-to-r from-emerald-400 via-white to-emerald-700 bg-clip-text text-transparent">Curamind</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Our mission is to empower healthcare providers with intelligent
            tools that streamline documentation, improve diagnostic accuracy,
            and ultimately lead to better patient outcomes.
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="Built For Clinicians"
              description="Built by medical professionals, we understand the critical need for efficient and accurate documentation without sacrificing patient interaction."
            />
            <FeatureCard
              icon={Target}
              title="AI-Powered Accuracy"
              description="Leverage state-of-the-art, real-time transcription and AI-powered summaries to capture every detail with precision."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Secure & Compliant"
              description="Your data is protected with enterprise-grade security and full compliance with healthcare data handling standards."
            />
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See It In Action
          </h3>
          <div
            className="mt-10 w-full max-w-5xl mx-auto rounded-2xl
                       border-2 border-emerald-900/50 bg-slate-800
                       p-2 shadow-2xl shadow-emerald-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 z-50 bg-black/30 rounded-lg pointer-events-none" />
            <video
              className="w-full aspect-video rounded-lg"
              controls
              muted
              loop
              playsInline
              autoPlay
            >
              <source src="/About.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
