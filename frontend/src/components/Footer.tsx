import { Chrome } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionLink = motion.create(Link);

const Footer = () => {
  return (
    <footer className="border-t border-border/50">
      {/* Final CTA */}
      <div className="section-padding text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-6">
          Ready?
        </p>
        <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 leading-tight">
          Your Focus is Your{" "}
          <span className="gradient-text-red glow-text">Future.</span>
        </h2>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto">
          Join thousands who've reclaimed their attention on YouTube.
        </p>
        <MotionLink
          to="/download"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 gradient-red text-primary-foreground font-semibold px-10 py-5 rounded-xl text-lg glow-border-strong transition-shadow duration-300 hover:shadow-[0_0_60px_hsl(348,100%,50%,0.5)]"
        >
          <Chrome size={22} />
          Add to Chrome — It's Free
        </MotionLink>
      </div>

      {/* Bottom bar */}
      <div className="px-6 md:px-12 lg:px-24 py-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-red rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">BY</span>
            </div>
            <div>
              <span className="font-display font-semibold text-foreground">BetterYoutube</span>
              <span className="text-xs text-muted-foreground ml-2">v2.0</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2025 BetterYoutube. Crafted by Pratham Handa.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
