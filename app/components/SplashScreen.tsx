"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Total duration ~3 seconds for a premium feel
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Allow exit animation to finish
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Staggered Text Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.8 // Wait for logo to settle
      }
    }
  };

  const letterVariants: Variants = {
    hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
    visible: { 
        y: 0, 
        opacity: 1, 
        filter: "blur(0px)",
        transition: { type: "spring", damping: 12, stiffness: 100 } 
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-linear-to-br from-[#112D4E] to-[#3F72AF] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1, 
            filter: "blur(20px)", 
            transition: { duration: 0.8, ease: "easeInOut" } 
          }}
        >
          {/* Ambient Background Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-white/10 rounded-full blur-[100px]" 
            />
            <motion.div 
               animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
               transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute -bottom-1/2 -right-1/2 w-[100%] h-[100%] bg-blue-300/10 rounded-full blur-[100px]" 
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Container with Physics-based Reveal */}
            <motion.div
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                duration: 1.5 
              }}
              className="w-32 h-32 sm:w-40 sm:h-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] shadow-[0_0_40px_rgba(59,130,246,0.3)] flex items-center justify-center mb-10 relative overflow-hidden group ring-1 ring-white/30"
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -skew-x-12"
                initial={{ x: "-150%" }}
                animate={{ x: "150%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
              />

              <img 
                src="/icons/flexigo_logo.jpg" 
                alt="FlexiGo Logo" 
                className="w-[75%] h-[75%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] rounded-xl" 
              />
            </motion.div>

            {/* Staggered Branding Text */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3 flex justify-center overflow-hidden">
                {Array.from("FlexiGo").map((letter, i) => (
                  <motion.span key={i} variants={letterVariants}>
                    {letter}
                  </motion.span>
                ))}
              </h1>
              
              <motion.div 
                 initial={{ opacity: 0, letterSpacing: "0.2em", y: 10 }}
                 animate={{ opacity: 1, letterSpacing: "0.4em", y: 0 }}
                 transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
                 className="text-white/70 text-xs sm:text-sm font-medium uppercase"
              >
                Workforce Redefined
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
