"use client";

import * as React from "react";
import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
  const lenis = new Lenis({
    duration: 0.8,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  const observer = new ResizeObserver(() => {
    lenis.resize();
  });

  observer.observe(document.body);

  return () => {
    observer.disconnect();
    lenis.destroy();
  };
}, []);

  return <>{children}</>;
}