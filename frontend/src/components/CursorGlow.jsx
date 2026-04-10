import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const moveCursor = (e) => {
      // Mengubah CSS Variable secara global di elemen root
      // Ini jauh lebih cepat daripada memicu render ulang komponen React
      document.documentElement.style.setProperty('--x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--y', `${e.clientY}px`);
    };

    const handleHover = () => document.body.classList.add('is-hovering');
    const handleUnhover = () => document.body.classList.remove('is-hovering');

    window.addEventListener("mousemove", moveCursor, { passive: true });

    // Efek membesar saat hover tombol/link
    const interactives = document.querySelectorAll('button, a, .interactive');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', handleHover);
      el.addEventListener('mouseleave', handleUnhover);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', handleHover);
        el.removeEventListener('mouseleave', handleUnhover);
      });
    };
  }, []);

  return (
    <>
      {/* Spotlight Background (Cahaya ungu yang sangat halus) */}
      <div className="cursor-aura" />
      
      {/* Titik Kursor Utama */}
      <div className="cursor-dot">
        <div className="cursor-dot-inner" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --x: -100px;
          --y: -100px;
        }

        /* Menghilangkan kursor default agar tidak bentrok */
        body, button, a {
          cursor: none !important;
        }

        /* SPOTLIGHT AURA - Hardware Accelerated */
        .cursor-aura {
          position: fixed;
          top: 0;
          left: 0;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          transform: translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0);
          will-change: transform;
        }

        /* DOT CURSOR - Super Responsive */
        .cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          pointer-events: none;
          z-index: 9999;
          /* translate3d memindahkan beban ke GPU */
          transform: translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0);
          will-change: transform;
          transition: width 0.2s, height 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%;
        }

        .cursor-dot-inner {
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px white;
        }

        /* Efek saat Hover tombol (Instant) */
        .is-hovering .cursor-dot {
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.8);
        }

        /* Matikan di mobile untuk performa maksimal */
        @media (max-width: 1024px) {
          .cursor-aura, .cursor-dot { display: none; }
          body { cursor: auto !important; }
        }
      `}} />
    </>
  );
}