import { useEffect, useRef } from 'react';

const COLORS = [
  '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
  '#EF4444', '#EC4899', '#06B6D4', '#F97316',
  '#A78BFA', '#34D399', '#FB923C', '#F472B6',
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  w: number; h: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
}

export function ConfettiEffect({ onDone }: { onDone?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep latest onDone in a ref so the effect never needs to re-run when the
  // parent re-renders (e.g. setCompleting(false) in finally), which would
  // restart the animation mid-flight.
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles: Particle[] = [];

    // Three emitters spread across the screen, angled upward
    const emitters = [
      { x: W * 0.2, angle: -Math.PI / 2 + 0.5 },
      { x: W * 0.5, angle: -Math.PI / 2 },
      { x: W * 0.8, angle: -Math.PI / 2 - 0.5 },
    ];

    emitters.forEach(em => {
      for (let i = 0; i < 60; i++) {
        const spread = (Math.random() - 0.5) * 1.4;
        const speed = Math.random() * 16 + 8;
        const angle = em.angle + spread;
        particles.push({
          x: em.x + (Math.random() - 0.5) * 40,
          y: H * 0.6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          w: Math.random() * 12 + 5,
          h: Math.random() * 6 + 3,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 16,
          opacity: 1,
        });
      }
    });

    let rafId: number;
    let startTime: number | null = null;
    const DURATION = 3400;

    function draw(ts: number) {
      if (!startTime) startTime = ts;
      const progress = (ts - startTime) / DURATION;

      ctx!.clearRect(0, 0, W, H);

      let anyVisible = false;

      for (const p of particles) {
        p.vy += 0.4;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, 1 - progress * 1.3);

        if (p.opacity > 0.02 && p.y < H + 60) anyVisible = true;

        ctx!.save();
        ctx!.globalAlpha = p.opacity;
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      if (anyVisible && progress < 1.8) {
        rafId = requestAnimationFrame(draw);
      } else {
        onDoneRef.current?.();
      }
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — onDone updates via ref above

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[85] pointer-events-none"
      aria-hidden="true"
    />
  );
}
