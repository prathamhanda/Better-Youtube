import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Chrome } from "lucide-react";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const cardRotateX = useTransform(springY, [-300, 300], [8, -8]);
  const cardRotateY = useTransform(springX, [-300, 300], [-8, 8]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set(e.clientX - cx);
      mouseY.set(e.clientY - cy);
      setMousePos({ x: e.clientX - cx, y: e.clientY - cy });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <section className="relative min-h-screen flex items-center justify-center section-padding overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(0,0%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,50%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(348,100%,50%) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            Chrome Extension v2.0
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-display leading-[1.05] tracking-tight mb-6">
            Take Back Your{" "}
            <span className="gradient-text-red glow-text">YouTube Focus.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10">
            Replace the infinite doom-scroll with tidy containers and pop out any video with native Picture-in-Picture. The ultimate aesthetic upgrade for YouTube.
          </p>

          <motion.a
            href="/download"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 gradient-red text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg glow-border-strong transition-shadow duration-300 hover:shadow-[0_0_50px_hsl(348,100%,50%,0.5)]"
          >
            <Chrome size={22} />
            Add to Chrome — It's Free
          </motion.a>
        </motion.div>

        {/* Right: floating glassmorphic card mockup */}
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          style={{ perspective: 1000 }}
        >
          <motion.div
            className="relative w-[320px] md:w-[380px]"
            style={{ rotateX: cardRotateX, rotateY: cardRotateY }}
          >
            {/* Main popup card */}
            <div className="glass-card rounded-2xl p-6 animate-float">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 gradient-red rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">BY</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">BetterYoutube</p>
                  <p className="text-xs text-muted-foreground">Extension Active</p>
                </div>
                <div className="ml-auto w-8 h-4 rounded-full bg-primary/30 flex items-end justify-end p-0.5">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
              </div>

              {/* Feature toggles */}
              {["Zen Scrolling", "Picture-in-Picture", "Focus Mode"].map((f, i) => (
                <div key={f} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <span className="text-sm text-secondary-foreground">{f}</span>
                  <div className={`w-9 h-5 rounded-full flex items-center p-0.5 ${i < 2 ? "bg-primary/30 justify-end" : "bg-muted justify-start"}`}>
                    <motion.div
                      className={`w-4 h-4 rounded-full ${i < 2 ? "bg-primary" : "bg-muted-foreground/50"}`}
                      layoutId={`toggle-${i}`}
                    />
                  </div>
                </div>
              ))}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="glass-card rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold font-display gradient-text-red">87%</p>
                  <p className="text-xs text-muted-foreground mt-1">Less Scrolling</p>
                </div>
                <div className="glass-card rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold font-display gradient-text-red">2x</p>
                  <p className="text-xs text-muted-foreground mt-1">Productivity</p>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl glass-card flex items-center justify-center"
              style={{ x: useTransform(springX, [-300, 300], [-15, 15]), y: useTransform(springY, [-300, 300], [-15, 15]) }}
            >
              <span className="text-3xl">🎯</span>
            </motion.div>
            <motion.div
              className="absolute -bottom-3 -left-3 w-16 h-16 rounded-xl glass-card flex items-center justify-center"
              style={{ x: useTransform(springX, [-300, 300], [10, -10]), y: useTransform(springY, [-300, 300], [10, -10]) }}
            >
              <span className="text-2xl">⚡</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
