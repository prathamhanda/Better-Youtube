import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Monitor, Feather } from "lucide-react";

const features = [
  { icon: Zap, label: "Automatic Integration", desc: "Works instantly on YouTube" },
  { icon: Monitor, label: "Maintains Native UI", desc: "No visual clutter added" },
  { icon: Feather, label: "Lightweight & Fast", desc: "Under 50KB, zero lag" },
];

const PerformanceBar = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className="text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mb-4">
                  <f.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">{f.label}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PerformanceBar;
