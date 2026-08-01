import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * BackToTopButton Component
 * 
 * Spesifikasi & Fitur Premium:
 * - Design: Glassmorphism + Soft Shadow + Neon Glow (Warna #2563EB, #3B82F6, #06B6D4)
 * - Responsif: 60px (Desktop), 55px (Tablet), 50px (Mobile)
 * - Performa: Optimized dengan requestAnimationFrame scroll listener
 * - Efek Interaktif:
 *   - Pulse Glow & Floating Animation saat idle
 *   - Hover lift & icon translate up
 *   - Shimmer light reflection
 *   - Micro-interaction Ripple effect saat diklik
 *   - Smooth scrolling ke bagian paling atas
 *   - Smooth Fade + Slide + Bounce entrance/exit animation
 */

interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface BackToTopButtonProps {
  forceHide?: boolean;
}

export const BackToTopButton: React.FC<BackToTopButtonProps> = ({ forceHide = false }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Detect detail modal / detail page open state on document body
  useEffect(() => {
    const checkDetailOpen = () => {
      setIsDetailOpen(Boolean(document.querySelector('[data-detail-open="true"]')));
    };

    checkDetailOpen();

    const observer = new MutationObserver(checkDetailOpen);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['data-detail-open'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  // High-performance scroll tracking menggunakan requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Tombol muncul saat pengguna melakukan scroll lebih dari 250px
          if (window.scrollY > 250) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Listen pada window scroll dengan passive event listener untuk performa tinggi
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Panggil sekali untuk cek posisi awal
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handler klik tombol dengan smooth scroll ke paling atas
  const scrollToTop = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Buat efek Ripple pada titik koordinat klik
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple: Ripple = { x, y, id: Date.now() };

      setRipples((prev) => [...prev, newRipple]);

      // Hapus ripple setelah animasi selesai (650ms)
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 650);
    }

    // Perform smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const shouldShow = isVisible && !forceHide && !isDetailOpen;

  return (
    <div
      className={`fixed z-50 bottom-5 right-5 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        shouldShow
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-12 scale-75 pointer-events-none'
      }`}
    >
      {/* Container Tombol dengan Tooltip Micro-interaction */}
      <div className="relative group">
        {/* Tooltip Hover "Kembali ke Atas" */}
        <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/90 text-cyan-300 text-[11px] font-semibold rounded-lg border border-cyan-500/30 backdrop-blur-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap flex items-center gap-1.5">
          <span>Kembali ke Atas</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        </div>

        {/* Tombol Back To Top Utama */}
        <button
          ref={buttonRef}
          onClick={scrollToTop}
          aria-label="Back to Top"
          title="Kembali ke atas"
          className="back-to-top-btn relative flex items-center justify-center rounded-full text-white cursor-pointer overflow-hidden shadow-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950
            /* Ukuran Responsif: Mobile 50px, Tablet 55px, Desktop 60px */
            w-[50px] h-[50px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]"
        >
          {/* Shimmer Light Line Reflection */}
          <span className="shimmer-line" />

          {/* Render Active Click Ripples */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="ripple-effect"
              style={{
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
              }}
            />
          ))}

          {/* Modern Futuristic Up Arrow SVG */}
          <svg
            className="btt-icon w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 ease-out text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
            <path d="M12 9v12" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </svg>

          {/* Ambient Inner Ring Light */}
          <span className="absolute inset-0 rounded-full border border-white/40 pointer-events-none" />
        </button>
      </div>
    </div>
  );
};

export default BackToTopButton;
