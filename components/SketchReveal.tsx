"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type SketchRevealProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export default function SketchReveal({
  src,
  alt,
  width,
  height,
  className = "",
}: SketchRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sketch-reveal ${start ? "animate-sketch" : ""} ${className}`}
      style={{ maxWidth: `${width}px` }}
    >
      <div className="sketch-frame">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority
          className="sketch-image"
        />
        <div className="sketch-paper" />
        <div className="sketch-pencil-line" />
      </div>
    </div>
  );
}
