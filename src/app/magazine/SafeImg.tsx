"use client";

import React, { useEffect, useRef, useState } from "react";

/** <img> that renders `fallback` (or nothing) when the image fails, including failures before hydration. */
export default function SafeImg({
  fallback = null,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallback?: React.ReactNode }) {
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);

  if (broken || !props.src) return <>{fallback}</>;
  return <img ref={ref} {...props} onError={() => setBroken(true)} />;
}
