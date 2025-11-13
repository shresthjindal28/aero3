import { motion } from "framer-motion";

import { Heart, Activity, Stethoscope, Pill, Brain, Microscope } from "lucide-react";

const icons = [
  { Icon: Heart, position: { top: "15%", left: "10%" }, color: "text-red-400", delay: 0 },
  { Icon: Activity, position: { top: "25%", right: "12%" }, color: "text-cyan-400", delay: 0.5 },
  { Icon: Stethoscope, position: { top: "65%", left: "8%" }, color: "text-blue-400", delay: 1 },
  { Icon: Pill, position: { top: "70%", right: "15%" }, color: "text-purple-400", delay: 1.5 },
  { Icon: Brain, position: { top: "45%", left: "5%" }, color: "text-pink-400", delay: 2 },
  { Icon: Microscope, position: { top: "50%", right: "8%" }, color: "text-green-400", delay: 2.5 },
];

export function FloatingMedicalIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {icons.map(({ Icon, position, color, delay }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={position}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.15, 0.25, 0.15, 0],
            y: [0, -50, -100],
            scale: [0.8, 1, 0.9],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 10,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative">
            {/* Neon glow */}
            <div className={`absolute inset-0 ${color} opacity-40 blur-xl scale-150`}>
              <Icon className="w-12 h-12" strokeWidth={2} />
            </div>
            {/* Icon */}
            <Icon className={`w-12 h-12 ${color} relative z-10`} strokeWidth={2} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
