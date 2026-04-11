import { Chrome } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const EXTENSION_NAME = "BetterYoutube";
const ADD_TO_CHROME_TO = "/download";

const FloatingScrollNav = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      setIsVisible(window.scrollY > 64);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Quick actions"
        className={
          "pointer-events-auto glass-card rounded-full " +
          "w-full max-w-md sm:w-auto " +
          "px-3 py-2 sm:px-3.5 sm:py-2.5 " +
          "flex items-center justify-between gap-3 " +
          "transition-all duration-200 " +
          (isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2")
        }
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 gradient-red rounded-xl flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-xs">BY</span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-foreground text-sm leading-none truncate">
              {EXTENSION_NAME}
            </p>
            <p className="text-xs text-muted-foreground leading-none hidden sm:block">
              Chrome extension
            </p>
          </div>
        </div>

        <Link
          to={ADD_TO_CHROME_TO}
          className={
            "inline-flex items-center gap-2 gradient-red text-primary-foreground " +
            "font-semibold rounded-full " +
            "px-3 py-2 sm:px-4 sm:py-2 " +
            "text-xs sm:text-sm glow-border"
          }
        >
          <Chrome className="h-4 w-4" />
          <span className="whitespace-nowrap">Add to Chrome</span>
        </Link>
      </nav>
    </div>
  );
};

export default FloatingScrollNav;
