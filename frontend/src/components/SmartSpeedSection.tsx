import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Gauge } from "lucide-react";

const SmartSpeedSection = () => {
  const ref = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [speed, setSpeed] = useState(1.0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const newSpeed = Math.round((0.5 + x * 2.5) * 100) / 100;
    setSpeed(Math.min(3.0, Math.max(0.5, newSpeed)));
  };

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            Feature 04
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
            Master the{" "}
            <span className="gradient-text-red">Pace.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            Dynamically control playback speed with precision. Skip through filler at 2.5x or slow down for crucial moments — all with a smooth, intuitive interface.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-4 italic">
            ↑ Move your mouse across the speed display
          </p>
        </motion.div>

        {/* Interactive speed display */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center"
        >
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative w-full max-w-sm glass-card rounded-2xl p-8 cursor-crosshair glow-border"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center">
                <Gauge size={24} className="text-primary" />
              </div>

              <motion.p
                className="text-7xl md:text-8xl font-display font-bold gradient-text-red glow-text tabular-nums"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.3 }}
                key={speed}
              >
                {speed.toFixed(2)}x
              </motion.p>

              {/* Speed bar */}
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${((speed - 0.5) / 2.5) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>

              <div className="flex justify-between w-full text-xs text-muted-foreground">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
                <span>3.0x</span>
              </div>

              {/* Particle dots that speed up */}
              <div className="flex gap-1.5 mt-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/60"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: Math.max(0.2, 1.5 / speed),
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SmartSpeedSection;
    