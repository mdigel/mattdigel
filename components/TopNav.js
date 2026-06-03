'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const items = [
  { label: 'Home', href: '/', external: false },
  { label: 'Projects', href: '/projects', external: false },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/matt-digel/', external: true },
];

// Matches the muted rainbow glow behind the "What You're Looking For" button.
const GRADIENT =
  'linear-gradient(135deg, rgba(128, 0, 255, 0.4), rgba(0, 128, 255, 0.4), rgba(0, 255, 255, 0.4), rgba(0, 255, 128, 0.4), rgba(200, 255, 0, 0.4))';

export default function TopNav() {
  const pathname = usePathname();
  const activeIndex = items.findIndex((it) => !it.external && it.href === pathname);
  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

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

  return (
    <nav className="absolute top-0 left-0 w-full flex justify-center px-6 pt-6 z-20">
      <div ref={navRef} className="relative flex items-center gap-6 max-w-2xl w-full">
        {items.map((item, i) => {
          const className =
            'text-sm transition-colors ' +
            (i === activeIndex
              ? 'text-foreground'
              : 'text-foreground/80 hover:text-foreground');
          const sharedProps = {
            ref: (el) => (itemRefs.current[i] = el),
            className,
          };
          return item.external ? (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              {...sharedProps}
            >
              {item.label}
            </a>
          ) : (
            <Link key={item.href} href={item.href} {...sharedProps}>
              {item.label}
            </Link>
          );
        })}
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
    </nav>
  );
}
