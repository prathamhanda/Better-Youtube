import { useEffect, useState } from "react";

const Spotlight = () => {
  const [pos, setPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="spotlight"
      style={{ left: pos.x, top: pos.y }}
    />
  );
};

export default Spotlight;
