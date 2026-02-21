import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

const socials = [
  { icon: Github, href: "https://github.com/prathamhanda", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/prathamh/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:prathamhanda10@gmail.com", label: "Mail" },
];

const CreatorSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const avatarUrl = `${import.meta.env.BASE_URL}Pratham-PFP.jpg`;

  return (
    <section ref={ref} className="section-padding">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-sm text-muted-foreground uppercase tracking-widest mb-10"
        >
          The Creator
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="glass-card glass-card-hover rounded-2xl p-8 md:p-10 max-w-md mx-auto transition-all duration-500"
        >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-muted mx-auto mb-5 overflow-hidden">
            <img 
              src={avatarUrl}
              alt="Pratham Handa" 
              className="w-full h-full object-cover"
            />
            </div>

          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Pratham Handa</h3>
          <p className="text-muted-foreground mb-6">Building tools that respect your attention.</p>

          <div className="flex justify-center gap-4">
            {socials.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-300"
                aria-label={s.label}
              >
                <s.icon size={18} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CreatorSection;
