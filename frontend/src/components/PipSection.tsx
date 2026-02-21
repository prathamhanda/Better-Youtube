import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Maximize2 } from "lucide-react";

const PipSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hovered, setHovered] = useState(false);

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="order-2 lg:order-1 flex justify-center"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative w-full max-w-md">
            {/* Main player */}
            <div className="glass-card rounded-2xl overflow-hidden aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center">
                  <Play size={24} className="text-foreground ml-1" />
                </div>
              </div>
              {/* Player controls */}
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-3">
                <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-1/3 rounded-full bg-primary" />
                </div>
                <Maximize2 size={14} className="text-muted-foreground" />
              </div>
              {/* PiP button */}
              <motion.div
                className="absolute top-3 right-3 glass-card rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                animate={hovered ? { boxShadow: "0 0 20px hsl(348,100%,50%,0.5)" } : {}}
              >
                <div className="w-4 h-3 rounded-sm border border-primary/60 relative">
                  <div className="absolute bottom-0 right-0 w-2 h-1.5 bg-primary rounded-sm" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">PiP</span>
              </motion.div>
            </div>

            {/* Floating PiP window */}
            <motion.div
              className="absolute glass-card rounded-xl overflow-hidden shadow-2xl"
              initial={{ width: 0, height: 0, bottom: 20, right: 20, opacity: 0 }}
              animate={
                hovered
                  ? { width: 180, height: 110, bottom: -30, right: -30, opacity: 1 }
                  : { width: 0, height: 0, bottom: 20, right: 20, opacity: 0 }
              }
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{ boxShadow: "0 0 30px hsl(348,100%,50%,0.3)" }}
            >
              <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                <Play size={16} className="text-foreground ml-0.5" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div className="h-full w-1/3 bg-primary" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="order-1 lg:order-2"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">Feature 02</p>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
            Multitask like a{" "}
            <span className="gradient-text-red">Pro.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            A convenient PiP button is added directly to YouTube's player. Pop out any video and watch while you work, browse, or study — without losing your place.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-4 italic">
            ↑ Hover over the player to see PiP in action
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PipSection;
