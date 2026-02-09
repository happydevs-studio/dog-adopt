import { useEffect, useState } from 'react';

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  velocity: { x: number; y: number };
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

const ConfettiCelebration = ({ trigger, onComplete }: ConfettiCelebrationProps) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#ff6b35', '#f7931e', '#fbb03b', '#ffd700', '#ff1744', '#ff4081'];
    const newConfetti: Confetti[] = [];

    // Create 30 confetti pieces
    for (let i = 0; i < 30; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 15,
          y: (Math.random() - 0.5) * 15 - 5,
        },
      });
    }

    setConfetti(newConfetti);
    setIsActive(true);

    // Clear confetti after animation
    const timeout = setTimeout(() => {
      setConfetti([]);
      setIsActive(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [trigger, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 animate-confetti-fall"
          style={{
            left: piece.x,
            top: piece.y,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            '--confetti-x': `${piece.velocity.x * 50}px`,
            '--confetti-y': `${piece.velocity.y * 50 + 500}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ConfettiCelebration;
