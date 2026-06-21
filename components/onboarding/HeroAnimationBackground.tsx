"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroAnimationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedPercent, setLoadedPercent] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Preload all 123 frames
  useEffect(() => {
    let loadedCount = 0;
    const totalFrames = 123;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `/hero/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        setLoadedPercent(Math.round((loadedCount / totalFrames) * 100));
        if (loadedCount === totalFrames) {
          setImages(loadedImages);
        }
      };
      loadedImages.push(img);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Animation Loop
  useEffect(() => {
    if (images.length === 0) return;

    const fps = 24; // Smooth cinematic frame rate
    const interval = 1000 / fps;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= interval) {
        lastTimeRef.current = timestamp - (elapsed % interval);
        
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const img = images[frameRef.current];
            if (img && img.complete) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // Draw image with "cover" behavior
              const imgRatio = img.width / img.height;
              const canvasRatio = canvas.width / canvas.height;
              let drawWidth = canvas.width;
              let drawHeight = canvas.height;
              let offsetX = 0;
              let offsetY = 0;

              if (canvasRatio > imgRatio) {
                drawHeight = canvas.width / imgRatio;
                offsetY = (canvas.height - drawHeight) / 2;
              } else {
                drawWidth = canvas.height * imgRatio;
                offsetX = (canvas.width - drawWidth) / 2;
              }

              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
          }
        }

        frameRef.current = (frameRef.current + 1) % images.length;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [images]);

  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full object-cover opacity-60 mix-blend-luminosity"
      />
      {/* Loading Overlay */}
      {images.length === 0 && (
        <div className="absolute inset-0 bg-[#0e150e] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="font-label-caps text-label-caps text-on-surface-variant animate-pulse">
            LOADING EXPERIENCE ({loadedPercent}%)
          </p>
        </div>
      )}
    </div>
  );
}
