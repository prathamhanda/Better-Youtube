import { Chrome } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 px-6 md:px-12 lg:px-24 py-12">
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

        <motion.a
          href="#"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 gradient-red text-primary-foreground font-semibold px-6 py-3 rounded-xl text-sm glow-border transition-shadow duration-300 hover:shadow-[0_0_40px_hsl(348,100%,50%,0.4)]"
        >
          <Chrome size={16} />
          Add to Chrome
        </motion.a>

        <p className="text-sm text-muted-foreground">
          © 2025 BetterYoutube. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
