import { useEffect, useState } from "react";

function phoneLandscape() {
  const touch =
    window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 1;
  if (!touch) return false;
  const landscape = window.matchMedia("(orientation: landscape)").matches;
  const h = window.visualViewport?.height ?? window.innerHeight;
  return landscape && h <= 520;
}

export function useLandscape() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const apply = () => {
      const next = phoneLandscape();
      setOn((prev) => (prev === next ? prev : next));
    };
    apply();
    const mq = window.matchMedia("(orientation: landscape)");
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);
  return on;
}
