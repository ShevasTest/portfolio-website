"use client";

import { useEffect, useState } from "react";

function getIsCoarsePointer() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0
  );
}

export function useIsCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(getIsCoarsePointer);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");

    const handleChange = () => {
      setIsCoarsePointer(getIsCoarsePointer());
    };

    handleChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isCoarsePointer;
}
