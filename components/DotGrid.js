'use client';

import { useEffect, useRef } from 'react';

// Tunables
const SPACING = 20; // px between dots
const DOT_RADIUS = 1.1;
const DOT_COLOR = '#DBDBDE';
const REPEL_RADIUS = 160; // how close the pointer must be to push a dot
const REPEL_STRENGTH = 2.6; // pointer push force
const BURST_RADIUS = 280; // tap shockwave reach (mobile)
const BURST_STRENGTH = 11; // tap push force
const BURST_FRAMES = 42; // how long a tap shockwave lasts
const SPRING = 0.1; // pull back toward origin
const FRICTION = 0.8; // velocity damping

export default function DotGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let dots = [];
    let raf = 0;

    const pointer = { x: -9999, y: -9999, active: false };
    const bursts = []; // { x, y, life }

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      const cols = Math.ceil(width / SPACING);
      const rows = Math.ceil(height / SPACING);
      const offsetX = (width - cols * SPACING) / 2 + SPACING / 2;
      const offsetY = (height - rows * SPACING) / 2 + SPACING / 2;
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const ox = offsetX + c * SPACING;
          const oy = offsetY + r * SPACING;
          dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
        }
      }
    };

    const repel = (dot, px, py, radius, strength) => {
      const dx = dot.x - px;
      const dy = dot.y - py;
      const distSq = dx * dx + dy * dy;
      const r = radius;
      if (distSq < r * r && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / r) * strength;
        dot.vx += (dx / dist) * force;
        dot.vy += (dy / dist) * force;
      }
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      // age out bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].life -= 1;
        if (bursts[i].life <= 0) bursts.splice(i, 1);
      }

      ctx.fillStyle = DOT_COLOR;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        if (pointer.active) {
          repel(dot, pointer.x, pointer.y, REPEL_RADIUS, REPEL_STRENGTH);
        }
        for (let b = 0; b < bursts.length; b++) {
          const burst = bursts[b];
          const progress = burst.life / BURST_FRAMES; // 1 -> 0
          repel(dot, burst.x, burst.y, BURST_RADIUS, BURST_STRENGTH * progress);
        }

        // spring back to origin
        dot.vx += (dot.ox - dot.x) * SPRING;
        dot.vy += (dot.oy - dot.y) * SPRING;
        dot.vx *= FRICTION;
        dot.vy *= FRICTION;
        dot.x += dot.vx;
        dot.y += dot.vy;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return; // touch is handled as a tap burst
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerOut = () => {
      pointer.active = false;
    };
    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse') return; // mouse uses the move handler
      bursts.push({ x: e.clientX, y: e.clientY, life: BURST_FRAMES });
    };
    const onResize = () => build();

    build();
    frame();

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('mouseleave', onPointerOut);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseleave', onPointerOut);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
