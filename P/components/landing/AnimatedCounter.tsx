"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  duration?: number;
  label: string;
}

export function AnimatedCounter({ end, suffix = "", duration = 2, label }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        
        // Easing function (easeOutQuart)
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOut * end));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    } else {
      setCount(0); // Reset when scrolled out of view
    }
  }, [isInView, end, duration]);

  return (
    <div className="landing-stat" ref={ref}>
      <span className="landing-stat-value">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="landing-stat-label">{label}</span>
    </div>
  );
}
