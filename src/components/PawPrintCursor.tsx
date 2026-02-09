import { useEffect, useState } from 'react';

interface PawPrint {
  id: number;
  x: number;
  y: number;
}

const PawPrintCursor = () => {
  const [pawPrints, setPawPrints] = useState<PawPrint[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();
    const THROTTLE_MS = 100; // Create paw print every 100ms

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < THROTTLE_MS) return;
      lastTime = now;

      const newPawPrint: PawPrint = {
        id: nextId,
        x: e.clientX,
        y: e.clientY,
      };

      setPawPrints((prev) => [...prev.slice(-15), newPawPrint]); // Keep max 15 paw prints
      setNextId((prev) => prev + 1);

      // Remove paw print after animation completes
      setTimeout(() => {
        setPawPrints((prev) => prev.filter((p) => p.id !== newPawPrint.id));
      }, 1500);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [nextId]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {pawPrints.map((pawPrint) => (
        <div
          key={pawPrint.id}
          className="absolute animate-paw-fade"
          style={{
            left: pawPrint.x - 12,
            top: pawPrint.y - 12,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary/30"
          >
            <path
              d="M12 18c-1.5 0-2.5-1-2.5-2.5S10.5 13 12 13s2.5 1 2.5 2.5S13.5 18 12 18z"
              fill="currentColor"
            />
            <ellipse cx="8.5" cy="12" rx="1.5" ry="2" fill="currentColor" />
            <ellipse cx="15.5" cy="12" rx="1.5" ry="2" fill="currentColor" />
            <ellipse cx="6" cy="8.5" rx="1.5" ry="2" fill="currentColor" />
            <ellipse cx="18" cy="8.5" rx="1.5" ry="2" fill="currentColor" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default PawPrintCursor;
