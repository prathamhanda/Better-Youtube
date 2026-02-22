import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { SkipForward } from "lucide-react";

const SponsorBlockSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [phase, setPhase] = useState<"approaching" | "skipping" | "done">("approaching");

  useEffect(() => {
    if (!isInView) return;
    const t1 = setTimeout(() => setPhase("skipping"), 2200);
    const t2 = setTimeout(() => setPhase("done"), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isInView]);

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="order-2 lg:order-1 flex justify-center"
        >
          <div className="w-full max-w-md glass-card rounded-2xl p-6 glow-border">
            {/* Mini video area */}
            <div className="aspect-video rounded-xl bg-muted/30 mb-4 flex items-center justify-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-primary/10"
                animate={phase === "skipping" ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
              <div className="flex items-center gap-2 text-muted-foreground">
                <SkipForward size={20} className={phase === "skipping" ? "text-primary" : ""} />
                <span className="text-sm font-medium">
                  {phase === "done" ? "Sponsor skipped!" : phase === "skipping" ? "Skipping..." : "Playing..."}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-3 rounded-full bg-muted overflow-hidden">
              {/* Sponsor segment */}
              <div
                className="absolute h-full bg-primary/30 border-l border-r border-primary/50"
                style={{ left: "35%", width: "20%" }}
              />

              {/* Playhead */}
              <motion.div
                className="absolute top-0 h-full bg-foreground/80 rounded-full"
                style={{ width: 4 }}
                initial={{ left: "10%" }}
                animate={
                  isInView
                    ? phase === "done"
                      ? { left: "80%" }
                      : phase === "skipping"
                      ? { left: "56%" }
                      : { left: "34%" }
                    : {}
                }
                transition={
                  phase === "skipping"
                    ? { duration: 0.15, ease: "easeOut" }
                    : { duration: 2, ease: "linear" }
                }
              />
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>0:00</span>
              <span className="text-primary/70">Sponsor · 2:10 – 3:45</span>
              <span>8:22</span>
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="order-1 lg:order-2"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            Feature 05
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
            Skip the{" "}
            <span className="gradient-text-red">Sell.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            Integrated SponsorBlock automatically identifies and skips sponsor segments, intros, and filler — so you only watch the content you came for.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SponsorBlockSection;
