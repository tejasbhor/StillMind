"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export default function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    document.addEventListener("mousemove", move, { passive: true });

    // Optional: detect hover on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        setHover(true);
      } else {
        setHover(false);
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div
      className={`cursor-dot hidden lg:block fixed pointer-events-none z-[99999] transition-all duration-150 ${
        hover ? "cursor-hover" : ""
      }`}
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
        width: hover ? 14 : 8,
        height: hover ? 14 : 8,
        background: "#7BA89A",
      }}
    />
  );
}
