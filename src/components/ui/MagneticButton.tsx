"use client";

import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { motion } from "framer-motion";
import { useIsCoarsePointer } from "@/hooks/useIsCoarsePointer";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className = "",
  href,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isCoarsePointer = useIsCoarsePointer();

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setPosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={isCoarsePointer ? undefined : handleMouseMove}
      onMouseLeave={isCoarsePointer ? undefined : handleMouseLeave}
      animate={
        isCoarsePointer ? { x: 0, y: 0 } : { x: position.x, y: position.y }
      }
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      whileTap={{ scale: 0.98 }}
      style={{ touchAction: "manipulation" }}
    >
      {href ? (
        <a href={href} className={className}>
          {children}
        </a>
      ) : (
        <div className={className}>{children}</div>
      )}
    </motion.div>
  );
}
