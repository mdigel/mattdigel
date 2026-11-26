'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const items = [
  { label: 'Home', href: '/', external: false },
  { label: 'Projects', href: '/projects', external: false },
  { label: 'Writing', href: '/writing-samples', external: false },
  { label: 'Strava', href: '/strava', external: false },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/matt-digel/', external: true },
];

// Matches the muted rainbow glow behind the "What You're Looking For" button.
const GRADIENT =
  'linear-gradient(135deg, rgba(128, 0, 255, 0.4), rgba(0, 128, 255, 0.4), rgba(0, 255, 255, 0.4), rgba(0, 255, 128, 0.4), rgba(200, 255, 0, 0.4))';

function NavLink({ item, active, className, onNavigate, linkRef }) {
  const shared = {
    ref: linkRef,
    className,
    onClick: onNavigate,
  };

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        {...shared}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} {...shared}>
      {item.label}
    </Link>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  // Nested pages (e.g. a single writing sample) keep their section underlined.
  const activeIndex = items.findIndex(
    (it) =>
      !it.external &&
      (it.href === pathname || (it.href !== '/' && pathname.startsWith(`${it.href}/`)))
  );
  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const menuRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const [menuOpen, setMenuOpen] = useState(false);

  const measure = useCallback(() => {
    const el = itemRefs.current[activeIndex];
    // The width can be 0 if we measure before the nav has been laid out
    // (e.g. while the home page's intro animation is still showing). Treat
    // that as "not ready" so the underline doesn't vanish.
    if (el && activeIndex >= 0 && el.offsetWidth > 0) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
      return true;
    }
    setIndicator((prev) => ({ ...prev, visible: false }));
    return false;
  }, [activeIndex]);

  useLayoutEffect(() => {
    // Retry on the next few frames until the items have real dimensions,
    // which covers the delayed reveal from FirstLoadAnimation.
    let frame;
    let attempts = 0;
    const tick = () => {
      if (measure() || attempts >= 20) return;
      attempts += 1;
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [measure, pathname]);

  useEffect(() => {
    if (!navRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(navRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Close mobile menu on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape + outside click for the mobile menu.
  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen]);

  const activeLabel =
    activeIndex >= 0 ? items[activeIndex].label : items[0].label;

  return (
    <nav className="absolute top-0 left-0 w-full flex justify-center px-6 pt-6 z-20">
      {/* Desktop */}
      <div
        ref={navRef}
        className="relative hidden sm:flex items-center gap-6 max-w-2xl w-full"
      >
        {items.map((item, i) => (
          <NavLink
            key={item.href}
            item={item}
            active={i === activeIndex}
            linkRef={(el) => {
              itemRefs.current[i] = el;
            }}
            className={
              'text-sm transition-colors ' +
              (i === activeIndex
                ? 'text-foreground'
                : 'text-foreground/80 hover:text-foreground')
            }
          />
        ))}
        <span
          aria-hidden
          className="pointer-events-none absolute h-0.5 rounded-full"
          style={{
            left: indicator.left,
            width: indicator.width,
            bottom: -4,
            backgroundImage: GRADIENT,
            boxShadow:
              '0 0 5px rgba(0, 128, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.25)',
            opacity: indicator.visible ? 1 : 0,
            transition: 'left 300ms ease, width 300ms ease, opacity 200ms ease',
          }}
        />
      </div>

      {/* Mobile: current section + compact menu */}
      <div ref={menuRef} className="relative flex sm:hidden items-center justify-between max-w-2xl w-full">
        <span className="text-sm text-foreground">{activeLabel}</span>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex items-center justify-center w-9 h-9 -mr-2 text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
        >
          <span className="sr-only">{menuOpen ? 'Close' : 'Menu'}</span>
          <span className="relative block w-4 h-3" aria-hidden>
            <span
              className="absolute left-0 right-0 h-px bg-current transition-transform duration-200 ease-out"
              style={{
                top: menuOpen ? '6px' : '0px',
                transform: menuOpen ? 'rotate(45deg)' : 'none',
              }}
            />
            <span
              className="absolute left-0 right-0 top-[6px] h-px bg-current transition-opacity duration-150"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="absolute left-0 right-0 h-px bg-current transition-transform duration-200 ease-out"
              style={{
                top: menuOpen ? '6px' : '12px',
                transform: menuOpen ? 'rotate(-45deg)' : 'none',
              }}
            />
          </span>
        </button>

        <div
          id="mobile-nav-menu"
          role="menu"
          aria-hidden={!menuOpen}
          className={
            'absolute top-full right-0 mt-3 w-44 origin-top-right rounded-lg border border-border bg-white py-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out ' +
            (menuOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-1 pointer-events-none')
          }
        >
          {items.map((item, i) => (
            <NavLink
              key={item.href}
              item={item}
              active={i === activeIndex}
              onNavigate={() => setMenuOpen(false)}
              className={
                'block px-4 py-2.5 text-sm transition-colors ' +
                (i === activeIndex
                  ? 'text-foreground'
                  : 'text-foreground/70 hover:text-foreground hover:bg-gray-50')
              }
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
