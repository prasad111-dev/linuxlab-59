const COLORS = ['#ee0000', '#ff6666', '#ff9e9e', '#d60000', '#b30000', '#ffffff', '#e5e7eb', '#111827'];

export function fireConfetti({ count = 90, x = 0.5, y = 0.3 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;width:100vw;height:100vh;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    return {
      x: canvas.width * x,
      y: canvas.height * y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      life: 1,
      decay: 0.006 + Math.random() * 0.008,
    };
  });

  let raf;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      if (p.life <= 0) continue;
      alive = true;
      p.vy += 0.15;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) {
      raf = requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };
  tick();

  return () => cancelAnimationFrame(raf);
}
