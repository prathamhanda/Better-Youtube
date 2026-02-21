import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ZenScrollingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const messyItems = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    width: `${50 + Math.random() * 50}%`,
  }));

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">Feature 01</p>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
            End the{" "}
            <span className="gradient-text-red">Infinite Scroll.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            No more endless doom-scrolling. BetterYoutube contains recommendations and comments in a sleek, fixed-height scrollable box — so you stay in control.
          </p>
        </motion.div>

        {/* Interactive visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative w-full max-w-sm">
            {/* Before: messy list fading out */}
            <motion.div
              className="absolute inset-0 space-y-2 p-4"
              initial={{ opacity: 1 }}
              animate={isInView ? { opacity: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {messyItems.map((item) => (
                <div
                  key={item.id}
                  className="h-8 rounded-md bg-muted/50"
                  style={{ width: item.width }}
                />
              ))}
              <div className="h-8 rounded-md bg-muted/30 w-3/4" />
              <div className="h-8 rounded-md bg-muted/20 w-1/2" />
              <div className="h-8 rounded-md bg-muted/10 w-2/3" />
            </motion.div>

            {/* After: clean glassmorphic container */}
            <motion.div
              className="glass-card rounded-2xl p-1 glow-border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="rounded-xl bg-background/50 p-4 h-[300px] overflow-y-auto space-y-3"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "hsl(348,100%,50%) transparent",
                }}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 1.4 + i * 0.1 }}
                    className="glass-card rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-16 h-10 rounded-lg bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 rounded bg-foreground/20 w-3/4" />
                      <div className="h-2 rounded bg-muted-foreground/20 w-1/2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ZenScrollingSection;
