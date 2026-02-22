import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FileText } from "lucide-react";

const terminalLines = [
  { cmd: "$ focus --block shorts", delay: 0 },
  { cmd: "→ Shorts feed: blocked", delay: 0.6 },
  { cmd: "$ focus --block comments", delay: 1.2 },
  { cmd: "→ Comment section: hidden", delay: 1.8 },
  { cmd: "$ focus --block recommendations", delay: 2.4 },
  { cmd: "→ Sidebar recommendations: removed", delay: 3.0 },
  { cmd: "", delay: 3.6 },
  { cmd: "✓ Focus Mode active. Distractions eliminated.", delay: 3.8 },
];

const FocusModeSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    terminalLines.forEach((line, idx) => {
      timers.push(
        setTimeout(() => setVisibleLines(idx + 1), (line.delay + 0.8) * 1000)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Terminal visual */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-md glass-card rounded-2xl overflow-hidden glow-border">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText size={12} />
                  focus-mode.sh
                </div>
              </div>
            </div>

            {/* Terminal body */}
            <div className="p-5 font-mono text-sm min-h-[240px] space-y-2">
              {terminalLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={i < visibleLines ? { opacity: 1, x: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={
                    line.cmd.startsWith("$")
                      ? "text-secondary-foreground"
                      : line.cmd.startsWith("✓")
                      ? "text-primary font-semibold mt-2"
                      : "text-primary/70"
                  }
                >
                  {line.cmd}
                </motion.div>
              ))}

              {/* Blinking cursor */}
              {visibleLines < terminalLines.length && (
                <motion.span
                  className="inline-block w-2 h-4 bg-primary/80"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            Feature 03
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
            Erase the{" "}
            <span className="gradient-text-red">Noise.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            Shorts, clickbait thumbnails, and noisy comment sections — gone. Focus Mode strips YouTube down to what matters: your chosen content, nothing else.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FocusModeSection;
