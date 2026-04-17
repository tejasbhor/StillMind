"use client";

import { useEffect, useState } from "react";

export default function ScrollManager() {
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const enableSnap = () => {
      const container = document.querySelector("main.snap-container");
      container?.classList.add("loaded");
      setPageLoaded(true);
    };

    const timer = setTimeout(enableSnap, 1200);
    const handleScroll = () => {
      enableSnap();
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleScroll);
    };

    window.addEventListener("wheel", handleScroll, { once: true });
    window.addEventListener("touchstart", handleScroll, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleScroll);
    };
  }, []);

  return null; // Side-effect only component
}
