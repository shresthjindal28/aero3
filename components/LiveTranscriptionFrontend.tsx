"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Mic, Stethoscope, Sparkles } from "lucide-react";

const transcriptionLines = [
  "Patient presents with intermittent chest pain...",
  "History of hypertension, well-controlled on medication...",
  "Physical examination reveals normal heart sounds...",
  "Recommend EKG and cardiac enzyme testing...",
  "Follow-up appointment scheduled in two weeks...",
];

export function LiveTranscriptionPanel() {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (charIndex < transcriptionLines[currentLine].length) {
      const timeout = setTimeout(() => {
        setDisplayedText(
          transcriptionLines[currentLine].slice(0, charIndex + 1)
        );
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLine((currentLine + 1) % transcriptionLines.length);
        setCharIndex(0);
        setDisplayedText("");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentLine]);

  return (
    <div className="max-w-4xl mx-auto bg-linear-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-black/90">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md animate-pulse" />
            <div className="relative bg-linear-to-br from-emerald-500 to-teal-500 p-2 rounded-full">
              <Mic className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <div className="text-sm text-white">Live Transcription</div>
            <div className="text-xs text-gray-500">
              Powered by AI models and agents
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">GPT-4 Medical</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Transcription Content */}
      <div className="p-6 min-h-[200px] relative bg-black/80">
        <div className="space-y-2 mb-2">
          {currentLine > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.4, y: 0 }}
              className="text-gray-300"
            >
              {transcriptionLines[currentLine - 1]}
            </motion.div>
          )}
        </div>
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
          <div className="flex-1">
            <motion.div
              className="text-white text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {displayedText}
              <motion.span
                className="inline-block w-[2px] h-5 bg-emerald-400 ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-emerald-400/50 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-black/90 border-t border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Confidence:</span>
            <span className="text-emerald-400">98.7%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Words/min:</span>
            <span className="text-emerald-400">142</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Duration:</span>
            <span className="text-emerald-400">2:34</span>
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-gray-500">Medical terminology:</span>{" "}
            <span className="text-emerald-400">Detected</span>
          </div>
        </div>
      </div>
    </div>
  );
}