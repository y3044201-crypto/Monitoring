import React, { useEffect, useRef, useState } from 'react';

interface FuturisticLoadingScreenProps {
  onClose?: () => void;
  fullScreen?: boolean;
  progress?: number; // Optional progress (0 - 100)
  title?: string;
  subtitle?: string;
  duration?: number; // Duration in ms for auto-step (default 1600ms)
}

export const FuturisticLoadingScreen: React.FC<FuturisticLoadingScreenProps> = ({
  onClose,
  fullScreen = true,
  progress,
  title = 'LOADING',
  subtitle,
  duration = 1600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic progress state (0 - 100)
  const [currentProgress, setCurrentProgress] = useState<number>(() =>
    progress !== undefined ? progress : 0
  );

  // Smoothly update currentProgress towards target `progress` OR auto-increment to 100% if `progress` is undefined
  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;
    let timeoutId: NodeJS.Timeout;

    if (progress !== undefined) {
      // Smooth interpolation towards explicit `progress` prop
      const target = Math.min(100, Math.max(0, progress));
      const step = () => {
        setCurrentProgress((prev) => {
          const diff = target - prev;
          if (Math.abs(diff) < 0.2) {
            if (target >= 100 && onClose) {
              onClose();
            }
            return target;
          }
          return prev + diff * 0.12;
        });
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    } else {
      // Auto-animating dynamic loading progression from 0% to 100%
      const startVal = 0;
      const stepDuration = duration || 1400; // Smooth sweep to 100%

      const autoStep = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const p = Math.min(1, elapsed / stepDuration);

        // Smooth cubic ease-out progression reaching 100%
        // Ease Out Cubic: 1 - Math.pow(1 - p, 3)
        const val = startVal + (100 - startVal) * (1 - Math.pow(1 - p, 3));

        setCurrentProgress(val);

        if (p < 1) {
          animId = requestAnimationFrame(autoStep);
        } else {
          setCurrentProgress(100);
          if (onClose) {
            onClose();
          }
        }
      };

      animId = requestAnimationFrame(autoStep);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [progress, onClose]);

  // Particle Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Floating soft neon blue particles
    const particleCount = 45;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      maxAlpha: number;
      pulseSpeed: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.min(width, height) * 0.35;
      particles.push({
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        radius: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        maxAlpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Render Floating Neon Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        p.alpha += p.pulseSpeed;
        if (p.alpha > p.maxAlpha || p.alpha < 0.1) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > Math.min(width, height) * 0.42) {
          p.vx = -p.vx;
          p.vy = -p.vy;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 191, 255, ${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Calculate SVG Circle Parameters for Flexible Dynamic Arc
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const displayPercent = Math.min(100, Math.max(0, currentProgress));
  const strokeDashoffset = circumference - (circumference * displayPercent) / 100;
  const roundedPercent = Math.round(displayPercent);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-[3px] select-none cursor-wait pointer-events-auto animate-in fade-in duration-300 ${
        !fullScreen ? 'absolute rounded-3xl' : ''
      }`}
    >
      {/* Background Canvas for Particle Ambient Field */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Optional Close Button if presented as Modal overlay */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-30 p-2.5 rounded-full bg-slate-900/60 border border-cyan-500/30 hover:bg-slate-800 text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,191,255,0.2)]"
          title="Tutup Loading"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* ISOLATED CENTERING OBJECT: ULTRA-PREMIUM FUTURISTIC HUD LOADING CIRCLE */}
      <div className="relative z-10 flex items-center justify-center w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] md:w-[440px] md:h-[440px]">
        
        {/* Soft Volumetric Background Glow Sphere */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#00BFFF]/20 via-[#33CCFF]/15 to-[#80EFFF]/10 blur-3xl animate-pulse pointer-events-none" />

        {/* SVG Concentric HUD Rings & Dynamic Progress Arc */}
        <svg className="w-full h-full overflow-visible drop-shadow-[0_0_35px_rgba(0,191,255,0.35)]" viewBox="0 0 400 400" fill="none">
          <defs>
            {/* Electric Blue & Cyan Primary Gradient */}
            <linearGradient id="electricArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#80EFFF" />
              <stop offset="50%" stopColor="#33CCFF" />
              <stop offset="100%" stopColor="#00BFFF" />
            </linearGradient>

            {/* Dark Titanium Metallic Gradient */}
            <linearGradient id="metalChromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Bevel Highlight Gradient */}
            <linearGradient id="metalBevelGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00BFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0F172A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#33CCFF" stopOpacity="0.9" />
            </linearGradient>

            {/* High-Intensity Bloom Filter */}
            <filter id="neonBloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feGaussianBlur stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Sharp Glow Filter */}
            <filter id="sharpGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* DYNAMICALLY ROTATING OUTERMOST TITANIUM CHROME BEVEL RING */}
          <g className="animate-[spin_18s_linear_infinite_reverse]" style={{ transformOrigin: '200px 200px' }}>
            <circle
              cx="200"
              cy="200"
              r="175"
              stroke="url(#metalChromeGrad)"
              strokeWidth="3"
              opacity="0.85"
            />
            <circle
              cx="200"
              cy="200"
              r="175"
              stroke="url(#metalBevelGrad)"
              strokeWidth="1.5"
              strokeDasharray="12 24 36 24"
              opacity="0.8"
            />
          </g>

          {/* DYNAMICALLY ROTATING HUD OUTER ACCENT RING (Slow Clockwise Orbit) */}
          <g className="animate-[spin_24s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
            <circle
              cx="200"
              cy="200"
              r="168"
              stroke="#00BFFF"
              strokeWidth="1"
              strokeDasharray="4 20 60 20"
              opacity="0.5"
            />
          </g>

          {/* Background Radial Track (100%) */}
          <circle
            cx="200"
            cy="200"
            r="150"
            stroke="#0F172A"
            strokeWidth="12"
            className="drop-shadow-inner"
          />
          <circle
            cx="200"
            cy="200"
            r="150"
            stroke="rgba(0, 191, 255, 0.12)"
            strokeWidth="12"
          />

          {/* DYNAMICALLY ROTATING RADIAL TICKS (HUD Markers) */}
          <g className="animate-[spin_40s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i * 6 * Math.PI) / 180;
              const isFilled = i / 60 <= displayPercent / 100;
              const x1 = 200 + Math.cos(angle) * 161;
              const y1 = 200 + Math.sin(angle) * 161;
              const x2 = 200 + Math.cos(angle) * (i % 5 === 0 ? 167 : 165);
              const y2 = 200 + Math.sin(angle) * (i % 5 === 0 ? 167 : 165);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isFilled ? '#33CCFF' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={i % 5 === 0 ? 2 : 1}
                  opacity={isFilled ? 0.95 : 0.35}
                  filter={isFilled ? 'url(#sharpGlow)' : undefined}
                />
              );
            })}
          </g>

          {/* MAIN DYNAMIC PROGRESS ARC (Rotated -90deg so it starts at top 12 o'clock) */}
          <g transform="rotate(-90 200 200)">
            <circle
              cx="200"
              cy="200"
              r="150"
              stroke="url(#electricArcGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              filter="url(#neonBloom)"
            />

            {/* Glowing Leading Edge Bead at current progress percentage */}
            {(() => {
              const endAngle = (displayPercent / 100) * 360 * (Math.PI / 180);
              const beadX = 200 + Math.cos(endAngle) * 150;
              const beadY = 200 + Math.sin(endAngle) * 150;
              return (
                <g>
                  <circle
                    cx={beadX}
                    cy={beadY}
                    r="9"
                    fill="#80EFFF"
                    filter="url(#neonBloom)"
                  />
                  <circle
                    cx={beadX}
                    cy={beadY}
                    r="4"
                    fill="#FFFFFF"
                  />
                </g>
              );
            })()}
          </g>

          {/* ROTATING SEGMENTED ARC 1: Outer Clockwise Orbit Ring */}
          <g className="animate-[spin_8s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
            <circle
              cx="200"
              cy="200"
              r="132"
              stroke="#00BFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="120 180 60 120"
              opacity="0.85"
              filter="url(#sharpGlow)"
            />
          </g>

          {/* ROTATING SEGMENTED ARC 2: Counter-Clockwise Thin Cyan Arc */}
          <g className="animate-[spin_4.5s_linear_infinite_reverse]" style={{ transformOrigin: '200px 200px' }}>
            <circle
              cx="200"
              cy="200"
              r="118"
              stroke="#33CCFF"
              strokeWidth="1.5"
              strokeDasharray="40 100 80 60"
              opacity="0.9"
              filter="url(#sharpGlow)"
            />
          </g>

          {/* ROTATING SEGMENTED ARC 3: Micro Dashed Innermost HUD Ring */}
          <g className="animate-[spin_12s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
            <circle
              cx="200"
              cy="200"
              r="104"
              stroke="#80EFFF"
              strokeWidth="1"
              strokeDasharray="6 12 18 12"
              opacity="0.6"
            />
          </g>

          {/* Central Glassmorphic Core Circle Overlay */}
          <circle
            cx="200"
            cy="200"
            r="92"
            fill="#0F172A"
            fillOpacity="0.85"
            stroke="rgba(0, 191, 255, 0.25)"
            strokeWidth="1.5"
            filter="url(#sharpGlow)"
          />

          <circle
            cx="200"
            cy="200"
            r="90"
            fill="url(#metalChromeGrad)"
            fillOpacity="0.5"
          />

          {/* Subtle Top Refraction Lens Light */}
          <path
            d="M 120 170 A 90 90 0 0 1 280 170 C 250 185 150 185 120 170 Z"
            fill="rgba(255, 255, 255, 0.08)"
          />
        </svg>

        {/* CENTERED TYPOGRAPHY (DYNAMIC PERCENTAGE) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none space-y-1">
          
          {/* Top Label: LOADING or Custom Title */}
          <span className="text-[11px] sm:text-[12px] font-mono font-bold tracking-[0.35em] text-[#80EFFF] uppercase drop-shadow-[0_0_12px_rgba(0,191,255,0.8)]">
            {title}
          </span>

          {/* Main Percentage: Dynamic (e.g. 82%, 95%, 100%) */}
          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-[#80EFFF] to-[#00BFFF] drop-shadow-[0_0_20px_rgba(0,191,255,0.9)] my-0.5">
            {roundedPercent}%
          </span>

          {/* Sub Label: PLEASE WAIT... or SYSTEM READY when 100% */}
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.25em] text-[#33CCFF]/90 animate-pulse uppercase">
            {roundedPercent >= 100 ? 'SYSTEM READY' : (subtitle || 'PLEASE WAIT...')}
          </span>

        </div>

      </div>
    </div>
  );
};

