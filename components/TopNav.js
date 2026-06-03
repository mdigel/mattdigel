'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const items = [
  { label: 'Home', href: '/', external: false },
  { label: 'Projects', href: '/projects', external: false },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/matt-digel/', external: true },
];

// Matches the rainbow glow behind the "What You're Looking For" button.
const GRADIENT =
  'linear-gradient(135deg, rgba(128, 0, 255, 0.9), rgba(0, 128, 255, 0.9), rgba(0, 255, 255, 0.9), rgba(0, 255, 128, 0.9), rgba(200, 255, 0, 0.9))';

export default function TopNav() {
  const pathname = usePathname();
  const activeIndex = items.findIndex((it) => !it.external && it.href === pathname);
  const itemRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  const measure = useCallback(() => {
    const el = itemRefs.current[activeIndex];
    if (el && activeIndex >= 0) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
    } else {
      setIndicator((prev) => ({ ...prev, visible: false }));
    }
  }, [activeIndex]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, pathname]);

  return (
    <nav className="absolute top-0 left-0 w-full flex justify-center px-6 pt-6 z-20">
      <div className="relative flex items-center gap-6 max-w-2xl w-full">
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
              '0 0 6px rgba(0, 128, 255, 0.6), 0 0 12px rgba(0, 255, 255, 0.5)',
            opacity: indicator.visible ? 1 : 0,
            transition: 'left 300ms ease, width 300ms ease, opacity 200ms ease',
          }}
        />
      </div>
    </nav>
  );
}
