'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCityData } from './cityGeometry';
import styles from './CityHero.module.css';

interface PinConfig {
  id: number;
  name: string;
  nearby: string;
  hasDot: boolean;
  dotColor?: string;
  ringColor: string;
  stemHeight: number;
  bobClassKey: 'pinbob' | 'pinbobB' | 'pinbobC';
  slug: string;
  iconPath: React.ReactNode;
}

const PIN_ITEMS: PinConfig[] = [
  {
    id: 0,
    name: 'PLUMBER',
    nearby: '• 3 Nearby',
    hasDot: true,
    dotColor: '#2fbf71',
    ringColor: '#2fbf71',
    stemHeight: 52,
    bobClassKey: 'pinbob',
    slug: 'plumber',
    iconPath: <path d="M12 2.7s6 6.3 6 10.6a6 6 0 0 1-12 0C6 9 12 2.7 12 2.7z" />,
  },
  {
    id: 1,
    name: 'MAID',
    nearby: '• 4 Nearby',
    hasDot: true,
    dotColor: '#2fbf71',
    ringColor: 'currentColor',
    stemHeight: 50,
    bobClassKey: 'pinbobB',
    slug: 'cleaning',
    iconPath: <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  },
  {
    id: 2,
    name: 'ELECTRICIAN',
    nearby: '• Available Now',
    hasDot: false,
    ringColor: '#E59A1F',
    stemHeight: 54,
    bobClassKey: 'pinbobC',
    slug: 'electrician',
    iconPath: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    id: 3,
    name: 'MECHANIC',
    nearby: '• 2 Nearby',
    hasDot: true,
    dotColor: '#2fbf71',
    ringColor: '#e5484d',
    stemHeight: 56,
    bobClassKey: 'pinbob',
    slug: 'mechanic',
    iconPath: (
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    ),
  },
  {
    id: 4,
    name: 'CARPENTER',
    nearby: '',
    hasDot: false,
    ringColor: 'currentColor',
    stemHeight: 52,
    bobClassKey: 'pinbobB',
    slug: 'carpenter',
    iconPath: <path d="M3 20l6-6M14 4l6 6-3 3-6-6zM8 10l6 6" />,
  },
  {
    id: 5,
    name: 'CLEANER',
    nearby: '• 5 Nearby',
    hasDot: true,
    dotColor: '#2fbf71',
    ringColor: '#2fbf71',
    stemHeight: 50,
    bobClassKey: 'pinbob',
    slug: 'cleaning',
    iconPath: (
      <>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
        <path d="M19 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
      </>
    ),
  },
  {
    id: 6,
    name: 'HVAC',
    nearby: '• Available Now',
    hasDot: false,
    ringColor: '#E59A1F',
    stemHeight: 52,
    bobClassKey: 'pinbobB',
    slug: 'hvac',
    iconPath: (
      <>
        <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    id: 7,
    name: 'HANDYMAN',
    nearby: '• 3 Nearby',
    hasDot: true,
    dotColor: '#2fbf71',
    ringColor: '#2fbf71',
    stemHeight: 54,
    bobClassKey: 'pinbobC',
    slug: 'handyman',
    iconPath: (
      <>
        <path d="M14 4l6 6-3 3-6-6zM3 21l8-8" />
        <path d="M11 7l-4 4" />
      </>
    ),
  },
  {
    id: 8,
    name: 'PAINTER',
    nearby: '• 2 Nearby',
    hasDot: true,
    dotColor: '#2fbf71',
    ringColor: 'currentColor',
    stemHeight: 56,
    bobClassKey: 'pinbob',
    slug: 'handyman',
    iconPath: (
      <>
        <rect x="3" y="3" width="14" height="6" rx="1.5" />
        <path d="M17 6h3v5h-9v3" />
        <rect x="9" y="14" width="4" height="7" rx="1" />
      </>
    ),
  },
  {
    id: 9,
    name: 'GARDENER',
    nearby: '• 4 Nearby',
    hasDot: true,
    dotColor: '#2fbf71',
    ringColor: '#2fbf71',
    stemHeight: 50,
    bobClassKey: 'pinbobB',
    slug: 'handyman',
    iconPath: (
      <>
        <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16z" />
        <path d="M4 21c3-6 6-9 10-11" />
      </>
    ),
  },
  {
    id: 10,
    name: 'PEST CONTROL',
    nearby: '• Available Now',
    hasDot: false,
    ringColor: '#e5484d',
    stemHeight: 52,
    bobClassKey: 'pinbobC',
    slug: 'cleaning',
    iconPath: (
      <>
        <path d="M12 8a4 4 0 0 1 4 4v3a4 4 0 0 1-8 0v-3a4 4 0 0 1 4-4z" />
        <path d="M8 12H4M16 12h4M8 16H3M16 16h5M10 8l-2-3M14 8l2-3" />
      </>
    ),
  },
];

export default function CityHero() {
  const router = useRouter();
  const [mode, setMode] = useState<'day' | 'night'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('plumber');

  const city = useMemo(() => getCityData(), []);

  const isNight = mode === 'night';
  const t = isNight
    ? {
        bg: '#0b1226',
        text: '#eef2ff',
        card: '#131c38',
        chip: 'rgba(19,28,56,0.92)',
        border: '#2a3766',
        sub: '#aab4d6',
      }
    : {
        bg: '#ffffff',
        text: '#0f1d3f',
        card: '#ffffff',
        chip: 'rgba(255,255,255,0.92)',
        border: '#e6e3da',
        sub: '#4b5578',
      };

  const accent = '#E59A1F';
  const wf = isNight ? 'url(#glassNight)' : 'url(#glassDay)';
  const offF = isNight ? 'url(#glassOff)' : 'none';
  const wv = isNight ? '1;0.4;1' : '1;0.85;1';
  const ho = isNight ? '0.9' : '0';
  const overlay = isNight ? '0.34' : '0';
  const cloudOp = '0';
  const sunOp = isNight ? '0' : '1';
  const lampOp = isNight ? '0.95' : '0';

  // Camera & Interaction Refs
  const stageRef = useRef<HTMLElement | null>(null);
  const camRef = useRef({ z: 1, cx: 720, cy: 400 });
  const tgtRef = useRef({ z: 1, cx: 720, cy: 400 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Viewport calculation matching Main.dc.html
  const getVM = useCallback(() => {
    const el = stageRef.current;
    if (!el) return { r: { left: 0, top: 0, width: 1440, height: 800 }, s: 1, ox: 0, oy: 0 };
    const r = el.getBoundingClientRect();
    const s = Math.max(r.width / 1440, r.height / 800);
    return {
      r,
      s,
      ox: (r.width - 1440 * s) / 2,
      oy: (r.height - 800 * s) / 2,
    };
  }, []);

  const clampTgt = useCallback(() => {
    const m = getVM();
    const tgt = tgtRef.current;
    const hw = m.r.width / m.s / 2 / tgt.z;
    const hh = m.r.height / m.s / 2 / tgt.z;
    const x0 = -180 + hw;
    const x1 = 1620 - hw;
    const y0 = -100 + hh;
    const y1 = 900 - hh;
    tgt.cx = x0 > x1 ? 720 : Math.min(x1, Math.max(x0, tgt.cx));
    tgt.cy = y0 > y1 ? 400 : Math.min(y1, Math.max(y0, tgt.cy));
  }, [getVM]);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, nz: number, minZ = 0.8) => {
      const tgt = tgtRef.current;
      const m = getVM();
      nz = Math.min(3, Math.max(minZ, nz));
      if (nz === tgt.z) return;
      const qx = (clientX - m.r.left - m.ox) / m.s;
      const qy = (clientY - m.r.top - m.oy) / m.s;
      const wx = tgt.cx + (qx - 720) / tgt.z;
      const wy = tgt.cy + (qy - 400) / tgt.z;
      tgt.z = nz;
      tgt.cx = wx - (qx - 720) / nz;
      tgt.cy = wy - (qy - 400) / nz;
      clampTgt();
    },
    [getVM, clampTgt]
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const tgt = tgtRef.current;
      tgt.z = Math.min(3, Math.max(0.8, tgt.z * factor));
      clampTgt();
    },
    [clampTgt]
  );

  const zoomFit = useCallback(() => {
    tgtRef.current.z = 1;
    tgtRef.current.cx = 720;
    tgtRef.current.cy = 400;
  }, []);

  // Set up RAF Animation Loop for smooth camera pan/zoom & live pin tracking
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let reduceMotion = false;
    try {
      reduceMotion = !!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      // ignore
    }

    const pd = city.pinData;

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = lastTimeRef.current ? Math.min(0.05, (now - lastTimeRef.current) / 1000) : 0.016;
      lastTimeRef.current = now;

      const c = camRef.current;
      const t = tgtRef.current;
      const k = 1 - Math.exp(-dt * 14);
      c.z += (t.z - c.z) * k;
      c.cx += (t.cx - c.cx) * k;
      c.cy += (t.cy - c.cy) * k;

      const tr = `translate(720 400) scale(${c.z.toFixed(4)}) translate(${(-c.cx).toFixed(2)} ${(-c.cy).toFixed(2)})`;
      const gw = document.getElementById('city-world');
      const gg = document.getElementById('city-glow');
      if (gw && gw.getAttribute('transform') !== tr) gw.setAttribute('transform', tr);
      if (gg && gg.getAttribute('transform') !== tr) gg.setAttribute('transform', tr);

      if (!pd) return;
      const m = getVM();
      const tm = reduceMotion ? 0 : now / 1000;

      for (let i = 0; i < pd.length; i++) {
        const p = pd[i];
        const d = (((tm * p.speed + p.off) % p.len) + p.len) % p.len;
        let j = 0;
        while (j < p.route.length - 2 && d > p.cum[j + 1]) j++;
        const a = p.route[j];
        const b = p.route[j + 1];
        const segLen = p.cum[j + 1] - p.cum[j];
        const u = segLen > 0 ? (d - p.cum[j]) / segLen : 0;
        const wx = a[0] + (b[0] - a[0]) * u;
        const wy = a[1] + (b[1] - a[1]) * u;

        const ew = document.getElementById(`pw${i}`);
        if (ew) {
          const v = `translate(${wx.toFixed(1)} ${wy.toFixed(1)})`;
          if (ew.getAttribute('transform') !== v) ew.setAttribute('transform', v);
        }

        const ef = document.getElementById(`pw${i}f`);
        if (ef) {
          const want = b[0] < a[0] ? 'scale(-1.45 1.45)' : 'scale(1.45 1.45)';
          if (ef.getAttribute('transform') !== want) ef.setAttribute('transform', want);
        }

        const px = m.ox + m.s * (720 + c.z * (wx - c.cx));
        const py = m.oy + m.s * (400 + c.z * (wy - c.cy)) - 2 - 36 * c.z * m.s;
        const ep = document.getElementById(`pin-${i}`);
        if (ep) {
          const v2 = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
          if (ep.style.transform !== v2) ep.style.transform = v2;
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    // Wheel zooming with passive: false to allow e.preventDefault()
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-card]')) return;

      const tgt = tgtRef.current;
      const pinch = e.ctrlKey || e.metaKey;
      if (!pinch && e.deltaY > 0 && tgt.z <= 1.001) return;

      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      zoomAt(e.clientX, e.clientY, tgt.z * Math.exp(-dy * (pinch ? 0.01 : 0.0016)), pinch ? 0.8 : 1);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [city, getVM, zoomAt]);

  // Pointer event handlers for pan dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (target?.closest('button, input, select, a, [data-card]')) return;

    dragRef.current = { x: e.clientX, y: e.clientY };
    if (stageRef.current) {
      stageRef.current.style.cursor = 'grabbing';
      try {
        stageRef.current.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    const m = getVM();
    const tgt = tgtRef.current;
    tgt.cx -= (e.clientX - dragRef.current.x) / (m.s * tgt.z);
    tgt.cy -= (e.clientY - dragRef.current.y) / (m.s * tgt.z);
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
    clampTgt();
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    if (stageRef.current) {
      stageRef.current.style.cursor = 'grab';
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, input, select, a, [data-card]')) return;
    zoomAt(e.clientX, e.clientY, tgtRef.current.z * 1.7, 0.8);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qParam = searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : '';
    router.push(`/book/${selectedCategory}${qParam}`);
  };

  return (
    <div
      className={styles.cityHeroRoot}
      style={{
        backgroundColor: t.bg,
        color: t.text,
      }}
    >
      {/* Top Navigation Bar */}
      <header className={styles.header}>
        <Link href="/" className={styles.brandLogo} aria-label="Avatar Home">
          AVATAR
        </Link>

        <nav className={styles.navLinks} aria-label="Primary Navigation">
          <Link href="/#services" className={styles.navLink}>
            Services
          </Link>
          <Link href="/#how-it-works" className={styles.navLink}>
            How It Works
          </Link>
          <Link href="/#workers" className={styles.navLink}>
            Workers
          </Link>
        </nav>

        <div className={styles.headerActions}>
          {/* Day / Night Theme Toggle */}
          <button
            type="button"
            className={styles.themeToggleBtn}
            onClick={() => setMode(isNight ? 'day' : 'night')}
            aria-label={isNight ? 'Switch to light theme' : 'Switch to dark theme'}
            style={{
              border: `1.5px solid ${t.text}`,
              backgroundColor: t.bg,
              color: t.text,
            }}
          >
            {isNight ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>

          <Link
            href="/provider/register"
            className={styles.providerBtn}
            style={{
              border: `1.5px solid ${t.text}`,
              backgroundColor: t.bg,
              color: t.text,
            }}
          >
            Become a Provider
          </Link>

          <Link href="/book/plumber" className={styles.bookNowBtn}>
            Book Now
          </Link>
        </div>
      </header>

      {/* Main Interactive Isometric Stage with Real-Time Pan/Zoom */}
      <section
        id="hero-city"
        ref={stageRef}
        className={styles.stageSection}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        aria-label="Interactive animated city stage. Click and drag to pan, scroll to zoom."
      >
        <svg
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Animated isometric city with moving cars, walking people, traffic lights and swaying trees"
          className={styles.citySvg}
        >
          <defs>
            <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="0.6" stopColor="#1a1a3a" stopOpacity="0.04" />
              <stop offset="1" stopColor="#1a1a3a" stopOpacity="0.34" />
            </linearGradient>
            <linearGradient id="glassDay" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f1f9ff" />
              <stop offset="0.5" stopColor="#a9cde6" />
              <stop offset="1" stopColor="#6f9dbf" />
            </linearGradient>
            <linearGradient id="glassNight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff0b8" />
              <stop offset="1" stopColor="#ffc35a" />
            </linearGradient>
            <linearGradient id="glassOff" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2d3656" />
              <stop offset="1" stopColor="#1a2038" />
            </linearGradient>
            <radialGradient id="lampGlow">
              <stop offset="0" stopColor="#fff1b0" stopOpacity="0.95" />
              <stop offset="1" stopColor="#fff1b0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sunGlow" cx="0.2" cy="0.05" r="0.8">
              <stop offset="0" stopColor="#fff4d2" stopOpacity="0.5" />
              <stop offset="1" stopColor="#fff4d2" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hazeTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#dcecfa" stopOpacity="0.65" />
              <stop offset="1" stopColor="#dcecfa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hazeBot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f1d3f" stopOpacity="0" />
              <stop offset="1" stopColor="#0f1d3f" stopOpacity="0.28" />
            </linearGradient>
          </defs>

          {/* Grass Background */}
          <rect x="0" y="0" width="1440" height="800" fill="#86c45a" />

          {/* Camera World Group with Smooth RAF Transform */}
          <g id="city-world" transform="translate(0 0)">
            {/* Base Blocks */}
            {city.blocks.map((b, i) => (
              <polygon key={`b-${i}`} points={b.p} fill="#d9d3c5" />
            ))}

            {/* Roads */}
            {city.roads.map((r, i) => (
              <polygon key={`r-${i}`} points={r.p} fill="#585d74" stroke="#4a4e63" strokeWidth="1" />
            ))}

            {/* Dashed Lane Markings */}
            {city.dashes.map((d, i) => (
              <line key={`d-${i}`} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke="#f3efe2" strokeWidth="1.6" strokeDasharray="9 11" opacity="0.85" />
            ))}

            {/* Pedestrian Crossings (Zebras) */}
            {city.zebras.map((z, i) => (
              <path key={`z-${i}`} d={z.d} fill="#f3efe2" opacity="0.8" />
            ))}

            {/* Lawns */}
            {city.grass.map((g, i) => (
              <polygon key={`g-${i}`} points={g.p} fill={g.c} />
            ))}

            {/* Plazas */}
            {city.plazas.map((pz, i) => (
              <polygon key={`pz-${i}`} points={pz.p} fill="#e6d7ad" />
            ))}

            {/* Moving Cars & Service Vans */}
            {/* Moving Cars & Service Vans (Upgraded Vector Models & One-Way Multi-Vehicle Flow) */}
            {city.cars.map((c, i) => (
              <g key={`car-${i}`} transform={c.tf}>
                <g>
                  <animateTransform attributeName="transform" type="translate" values={c.vals} keyTimes={c.kt} dur={`${c.dur}s`} begin={`${c.begin}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.04;0.96;1" dur={`${c.dur}s`} begin={`${c.begin}s`} repeatCount="indefinite" />
                  <polygon points={c.cone} fill="rgba(255,240,175,0.42)" opacity={ho} />
                  <ellipse cx={c.w1x} cy={c.w1y} rx="2.6" ry="3.1" fill="#101015" />
                  <polygon points={c.bl} fill={c.cl} />
                  <polygon points={c.br} fill={c.cr} />
                  <polygon points={c.bl} fill="url(#wallShade)" />
                  <polygon points={c.br} fill="url(#wallShade)" />
                  <polygon points={c.skirtL} fill="rgba(0,0,0,0.28)" />
                  <polygon points={c.skirtR} fill="rgba(0,0,0,0.34)" />
                  <path d={c.doors} stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" fill="none" />
                  <ellipse cx={c.w2x} cy={c.w2y} rx="2.8" ry="3.3" fill="#15151c" />
                  <ellipse cx={c.w2x} cy={c.w2y} rx="1.4" ry="1.7" fill="#aeb4bd" />
                  <ellipse cx={c.w3x} cy={c.w3y} rx="2.8" ry="3.3" fill="#15151c" />
                  <ellipse cx={c.w3x} cy={c.w3y} rx="1.4" ry="1.7" fill="#aeb4bd" />
                  <polygon points={c.bt} fill={c.ct} />
                  <polygon points={c.kl} fill={c.cl} />
                  <polygon points={c.kr} fill={c.cr} />
                  <polygon points={c.gl} fill="#a9cbe0" />
                  <polygon points={c.gr} fill="#7ea3bd" />
                  <polygon points={c.gl} fill="rgba(255,255,255,0.25)" transform="translate(0 -0.6)" />
                  <polygon points={c.kt2} fill={c.ct} />
                  {c.sign && <polygon points={c.sign} fill="#fff6c8" />}
                  <polygon points={c.tl} fill="#ff3b3b" />
                  <polygon points={c.plate} fill="#f1f1ea" />
                  <circle cx={c.hx} cy={c.hy} r="18" fill="url(#lampGlow)" opacity={ho} />
                  <circle cx={c.hx} cy={c.hy} r="1.8" fill="#fff6c8" />
                </g>
              </g>
            ))}

            {/* Scene Elements: Depth-Sorted Trees, Lamps, Walkers, Specialists (isPW), Fountains, Buildings, Houses */}
            {city.scene.map((it, i) => {
              if (it.isPW) {
                return (
                  <g key={`pw-${it.id}`} id={it.id} transform="translate(-9999 -9999)">
                    <g>
                      <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur="0.5s" begin={`${it.bb}s`} repeatCount="indefinite" />
                      <g id={`${it.id}f`} transform="scale(1.45 1.45)">
                        <g>
                          <animateTransform attributeName="transform" type="rotate" values="-22 -1.7 -8;22 -1.7 -8;-22 -1.7 -8" dur="1s" begin={`${it.bb}s`} repeatCount="indefinite" />
                          <rect x="-2.8" y="-8.6" width="2.4" height="8.2" rx="1.1" fill={it.pants} />
                          <rect x="-2.8" y="-8.6" width="2.4" height="8.2" rx="1.1" fill="rgba(0,0,0,0.22)" />
                          <path d="M-3.4 -1.2 H0.4 A1.5 1.5 0 0 1 1.9 0.3 V0.5 H-3.4 Z" fill="#1c1c24" />
                          <rect x="-3.4" y="0.1" width="5.3" height="0.5" fill="#d9d9de" />
                        </g>
                        <g>
                          <animateTransform attributeName="transform" type="rotate" values="-20 3.7 -16.5;20 3.7 -16.5;-20 3.7 -16.5" dur="1s" begin={`${it.bb}s`} repeatCount="indefinite" />
                          <rect x="3.2" y="-17" width="1.8" height="7.4" rx="0.9" fill={it.shirt} />
                          <rect x="3.2" y="-17" width="1.8" height="7.4" rx="0.9" fill="rgba(0,0,0,0.3)" />
                          <circle cx="4.1" cy="-9.3" r="1.2" fill={it.skin} />
                        </g>
                        <rect x="-6.4" y="-16.5" width="3.2" height="7.8" rx="1.2" fill={it.bag} />
                        <rect x="-1.1" y="-19" width="2.2" height="2.6" rx="0.6" fill={it.skin} />
                        <rect x="-3.7" y="-17.6" width="7.4" height="10.8" rx="2.5" fill={it.shirt} />
                        <rect x="0.4" y="-17.6" width="3.3" height="10.8" rx="1.6" fill="rgba(0,0,0,0.17)" />
                        <rect x="-3.7" y="-16.3" width="7.4" height="2.2" fill={it.vest} />
                        <rect x="-2.7" y="-13.2" width="5.4" height="6.2" rx="1" fill={it.apron} />
                        <rect x="-3.7" y="-8.4" width="7.4" height="1.3" fill="rgba(20,20,30,0.55)" />
                        <path d="M-1.4 -17.6 L0 -15.9 L1.4 -17.6 Z" fill="rgba(255,255,255,0.55)" />
                        <g>
                          <animateTransform attributeName="transform" type="rotate" values="22 1.7 -8;-22 1.7 -8;22 1.7 -8" dur="1s" begin={`${it.bb}s`} repeatCount="indefinite" />
                          <rect x="0.5" y="-8.6" width="2.4" height="8.2" rx="1.1" fill={it.pants} />
                          <path d="M-0.1 -1.2 H3.9 A1.5 1.5 0 0 1 5.4 0.3 V0.5 H-0.1 Z" fill="#26262f" />
                          <rect x="-0.1" y="0.1" width="5.5" height="0.5" fill="#f1f1f4" />
                        </g>
                        <g>
                          <animateTransform attributeName="transform" type="rotate" values="20 -3.7 -16.5;-20 -3.7 -16.5;20 -3.7 -16.5" dur="1s" begin={`${it.bb}s`} repeatCount="indefinite" />
                          <rect x="-5" y="-17" width="1.8" height="7.4" rx="0.9" fill={it.shirt} />
                          <circle cx="-4.1" cy="-9.3" r="1.2" fill={it.skin} />
                        </g>
                        <rect x="-4.1" y="-22.4" width="2.6" height="4.2" rx="1.2" fill={it.hair} />
                        <circle cx="0" cy="-21" r="3.7" fill={it.skin} />
                        <ellipse cx="-3.4" cy="-20.8" rx="0.8" ry="1.1" fill={it.skin} />
                        <path d="M-3.8 -21.2 A3.8 3.8 0 0 1 3.8 -21.4 Q2.2 -23 0.2 -22.4 Q-1.6 -22 -3.8 -21.2 Z" fill={it.hair} />
                        <circle cx="2" cy="-20.9" r="0.55" fill="#1a1a1a" />
                        <path d="M1.2 -21.9 L2.9 -21.8" stroke="rgba(30,20,15,0.7)" strokeWidth="0.35" fill="none" />
                        <path d="M1 -19.3 Q2 -18.7 3 -19.3" stroke="rgba(120,40,40,0.7)" strokeWidth="0.4" fill="none" />
                        <path d="M-4.1 -21.6 A4.1 4.1 0 0 1 4.1 -21.6 Z" fill={it.hat} />
                        <rect x="-4.5" y="-22.6" width="9.6" height="1.1" rx="0.5" fill={it.brim} />
                      </g>
                    </g>
                  </g>
                );
              }
              if (it.isTree) {
                return (
                  <g key={`tree-${i}`}>
                    <ellipse cx={it.cx} cy={it.by} rx="11" ry="5" fill="rgba(20,40,10,0.22)" />
                    <rect x={it.tx} y={it.ty} width="4" height="20" fill="#7d5233" />
                    <g>
                      <animateTransform attributeName="transform" type="rotate" values={it.sw} dur={`${it.swd}s`} begin={`${it.swb}s`} repeatCount="indefinite" />
                      <circle cx={it.cx} cy={it.cy} r={it.r} fill={it.canopyC} />
                      <circle cx={it.hx} cy={it.hy} r={it.hr} fill={it.canopyC2} />
                      <circle cx={it.sx} cy={it.sy} r={it.sr} fill="rgba(10,50,20,0.22)" />
                    </g>
                  </g>
                );
              }

              if (it.isBldg) {
                return (
                  <g key={`bldg-${i}`}>
                    <polygon points={it.shadow} fill="rgba(15,35,15,0.24)" />
                    <polygon points={it.left} fill={it.cl} />
                    <polygon points={it.right} fill={it.cr} />
                    <polygon points={it.left} fill="url(#wallShade)" />
                    <polygon points={it.right} fill="url(#wallShade)" />
                    <path d={it.shop} fill="#2a3b50" />
                    <path d={it.winL} fill={wf} stroke="rgba(20,25,45,0.55)" strokeWidth="0.5" />
                    <path d={it.winLo} fill={offF} />
                    <path d={it.winR} fill={wf} stroke="rgba(20,25,45,0.55)" strokeWidth="0.5">
                      <animate attributeName="opacity" values={wv} dur={`${it.fd}s`} begin={`${it.fb}s`} repeatCount="indefinite" />
                    </path>
                    <path d={it.winRo} fill={offF} />
                    <path d={it.awnA} fill={it.awnC} />
                    <path d={it.awnB} fill="#f6f1e6" />
                    <polygon points={it.cornL} fill="rgba(255,255,255,0.22)" />
                    <polygon points={it.cornR} fill="rgba(255,255,255,0.1)" />
                    <polygon points={it.door} fill="#46372f" />
                    <path d={it.edge} stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
                    <polygon points={it.top} fill={it.ct} stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" strokeLinejoin="round" />
                    <polygon points={it.topIn} fill={it.ctIn} />
                    {it.tkw > 0 && <rect x={it.tkx} y={it.tky} width={it.tkw} height="9" fill="#8a6a4f" />}
                    {it.tkw > 0 && <ellipse cx={it.tkcx} cy={it.tky} rx={it.tkr} ry="2.4" fill="#b08a68" />}
                    {it.acl && <polygon points={it.acl} fill="#aeb4bd" />}
                    {it.acr && <polygon points={it.acr} fill="#8f959f" />}
                    {it.act && <polygon points={it.act} fill="#d7dbe0" />}
                  </g>
                );
              }

              if (it.isHouse) {
                return (
                  <g key={`house-${i}`}>
                    <polygon points={it.shadow} fill="rgba(15,35,15,0.24)" />
                    <polygon points={it.right} fill={it.cr} />
                    <polygon points={it.left} fill={it.cl} />
                    <polygon points={it.left} fill="url(#wallShade)" />
                    <polygon points={it.right} fill="url(#wallShade)" />
                    <path d={it.winL} fill={wf} stroke="rgba(20,25,45,0.55)" strokeWidth="0.5" />
                    <path d={it.winLo} fill={offF} />
                    <path d={it.winR} fill={wf} stroke="rgba(20,25,45,0.55)" strokeWidth="0.5" />
                    <path d={it.winRo} fill={offF} />
                    <polygon points={it.door} fill="#5a3f31" />
                    <polygon points={it.gable} fill={it.cr} />
                    <polygon points={it.roof} fill={it.roofC} stroke="rgba(0,0,0,0.14)" strokeWidth="0.8" strokeLinejoin="round" />
                    <path d={it.edge} stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
                  </g>
                );
              }

              if (it.isFountain) {
                return (
                  <g key={`fountain-${i}`}>
                    <ellipse cx={it.cx} cy={it.by} rx="30" ry="15" fill="#cbbf9f" />
                    <ellipse cx={it.cx} cy={it.by} rx="25" ry="12.5" fill="#6cc2e8" />
                    <ellipse cx={it.cx} cy={it.by} rx="4" ry="2" fill="none" stroke="#ffffff" strokeWidth="1.4">
                      <animate attributeName="rx" values="4;24" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="ry" values="2;12" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0" dur="2.4s" repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx={it.cx} cy={it.by} rx="4" ry="2" fill="none" stroke="#ffffff" strokeWidth="1.4">
                      <animate attributeName="rx" values="4;24" dur="2.4s" begin="-1.2s" repeatCount="indefinite" />
                      <animate attributeName="ry" values="2;12" dur="2.4s" begin="-1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0" dur="2.4s" begin="-1.2s" repeatCount="indefinite" />
                    </ellipse>
                    <rect x={it.px} y={it.py} width="6" height="20" fill="#d8ccae" />
                    <ellipse cx={it.cx} cy={it.py} rx="12" ry="6" fill="#bfe8f7" />
                    <ellipse cx={it.cx} cy={it.sp} rx="3" ry="4" fill="#eefaff" opacity="0.9">
                      <animate attributeName="ry" values="3;8;3" dur="1.2s" repeatCount="indefinite" />
                    </ellipse>
                  </g>
                );
              }

              if (it.isLamp) {
                return (
                  <g key={`lamp-${i}`}>
                    <ellipse cx={it.cx} cy={it.by} rx="4" ry="2" fill="rgba(10,20,10,0.25)" />
                    <rect x={it.tx} y={it.ty} width="2" height="30" fill="#3a4050" />
                    <circle cx={it.cx} cy={it.cy} r="3" fill="#fff3c4" />
                  </g>
                );
              }

              if (it.isLight) {
                return (
                  <g key={`light-${i}`}>
                    <ellipse cx={it.cx} cy={it.by} rx="4" ry="2" fill="rgba(10,20,10,0.25)" />
                    <rect x={it.tx} y={it.ty} width="2" height="30" fill="#2c303c" />
                    <rect x={it.hx} y={it.hy} width="7" height="17" rx="2" fill="#1d212b" />
                    <circle cx={it.cx} cy={it.r1} r="2.3" fill="#ff4b4b">
                      <animate attributeName="opacity" calcMode="discrete" keyTimes="0;0.40625;0.5" values="0.18;0.18;1" dur="16s" begin="0s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={it.cx} cy={it.r2} r="2.3" fill="#ffc53d">
                      <animate attributeName="opacity" calcMode="discrete" keyTimes="0;0.40625;0.5" values="0.18;1;0.18" dur="16s" begin="0s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={it.cx} cy={it.r3} r="2.3" fill="#3ddc84">
                      <animate attributeName="opacity" calcMode="discrete" keyTimes="0;0.40625;0.5" values="1;0.18;0.18" dur="16s" begin="0s" repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              }

              if (it.isWalker) {
                return (
                  <g key={`walker-${i}`} transform={it.tf}>
                    <g>
                      <animateTransform attributeName="transform" type="translate" values={it.vals} dur={`${it.dur}s`} begin={`${it.begin}s`} repeatCount="indefinite" />
                      <g>
                        <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur="0.5s" begin={`${it.bb}s`} repeatCount="indefinite" />
                        <g transform={`scale(${it.sc})`}>
                          <g>
                            <animateTransform attributeName="transform" type="scale" calcMode="discrete" values={it.fl} keyTimes="0;0.5" dur={`${it.dur}s`} begin={`${it.begin}s`} repeatCount="indefinite" />
                            <g>
                              <animateTransform attributeName="transform" type="rotate" values="-22 -1.7 -8;22 -1.7 -8;-22 -1.7 -8" dur="1s" begin={`${it.bb}s`} repeatCount="indefinite" />
                              <rect x="-2.8" y="-8.6" width="2.4" height="8.2" rx="1.1" fill={it.pants} />
                              <rect x="-2.8" y="-8.6" width="2.4" height="8.2" rx="1.1" fill="rgba(0,0,0,0.22)" />
                              <path d="M-3.4 -1.2 H0.4 A1.5 1.5 0 0 1 1.9 0.3 V0.5 H-3.4 Z" fill="#1c1c24" />
                              <rect x="-3.4" y="0.1" width="5.3" height="0.5" fill="#d9d9de" />
                            </g>
                            <g>
                              <animateTransform attributeName="transform" type="rotate" values="-20 3.7 -16.5;20 3.7 -16.5;-20 3.7 -16.5" dur="1s" begin={`${it.bb}s`} repeatCount="indefinite" />
                              <rect x="3.2" y="-17" width="1.8" height="7.4" rx="0.9" fill={it.shirt} />
                              <rect x="3.2" y="-17" width="1.8" height="7.4" rx="0.9" fill="rgba(0,0,0,0.3)" />
                              <circle cx="4.1" cy="-9.3" r="1.2" fill={it.skin} />
                            </g>
                            <rect x="-6.4" y="-16.5" width="3.2" height="7.8" rx="1.2" fill={it.bag} />
                            <rect x="-1.1" y="-19" width="2.2" height="2.6" rx="0.6" fill={it.skin} />
                            <rect x="-3.7" y="-17.6" width="7.4" height="10.8" rx="2.5" fill={it.shirt} />
                            <rect x="0.4" y="-17.6" width="3.3" height="10.8" rx="1.6" fill="rgba(0,0,0,0.17)" />
                            <rect x="-3.7" y="-16.3" width="7.4" height="2.2" fill={it.vest} />
                            <rect x="-2.7" y="-13.2" width="5.4" height="6.2" rx="1" fill={it.apron} />
                            <rect x="-3.7" y="-8.4" width="7.4" height="1.3" fill="rgba(20,20,30,0.55)" />
                            <path d="M-1.4 -17.6 L0 -15.9 L1.4 -17.6 Z" fill="rgba(255,255,255,0.55)" />
                            <g>
                              <animateTransform attributeName="transform" type="rotate" values="22 1.7 -8;-22 1.7 -8;22 1.7 -8" dur="1s" begin={`${it.bb}s`} repeatCount="indefinite" />
                              <rect x="0.5" y="-8.6" width="2.4" height="8.2" rx="1.1" fill={it.pants} />
                              <path d="M-0.1 -1.2 H3.9 A1.5 1.5 0 0 1 5.4 0.3 V0.5 H-0.1 Z" fill="#26262f" />
                              <rect x="-0.1" y="0.1" width="5.5" height="0.5" fill="#f1f1f4" />
                            </g>
                            <g>
                              <animateTransform attributeName="transform" type="rotate" values="20 -3.7 -16.5;-20 -3.7 -16.5;20 -3.7 -16.5" dur="1s" begin={`${it.bb}s`} repeatCount="indefinite" />
                              <rect x="-5" y="-17" width="1.8" height="7.4" rx="0.9" fill={it.shirt} />
                              <circle cx="-4.1" cy="-9.3" r="1.2" fill={it.skin} />
                            </g>
                            <rect x="-4.1" y="-22.4" width="2.6" height="4.2" rx="1.2" fill={it.hair} />
                            <circle cx="0" cy="-21" r="3.7" fill={it.skin} />
                            <ellipse cx="-3.4" cy="-20.8" rx="0.8" ry="1.1" fill={it.skin} />
                            <path d="M-3.8 -21.2 A3.8 3.8 0 0 1 3.8 -21.4 Q2.2 -23 0.2 -22.4 Q-1.6 -22 -3.8 -21.2 Z" fill={it.hair} />
                            <circle cx="2" cy="-20.9" r="0.55" fill="#1a1a1a" />
                            <path d="M1.2 -21.9 L2.9 -21.8" stroke="rgba(30,20,15,0.7)" strokeWidth="0.35" fill="none" />
                            <path d="M1 -19.3 Q2 -18.7 3 -19.3" stroke="rgba(120,40,40,0.7)" strokeWidth="0.4" fill="none" />
                            <path d="M-4.1 -21.6 A4.1 4.1 0 0 1 4.1 -21.6 Z" fill={it.hat} />
                            <rect x="-4.5" y="-22.6" width="9.6" height="1.1" rx="0.5" fill={it.brim} />
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                );
              }

              return null;
            })}

            {/* Service Van Overlay Labels (Plumber · 4 min - rendered above buildings) */}
            {city.vanLabels.map((c, i) => (
              <g key={`van-lbl-${i}`} transform={c.tf}>
                <g>
                  <animateTransform attributeName="transform" type="translate" values={c.vals} keyTimes={c.kt} dur={`${c.dur}s`} begin={`${c.begin}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.04;0.96;1" dur={`${c.dur}s`} begin={`${c.begin}s`} repeatCount="indefinite" />
                  <g>
                    <rect x="-58" y="-56" width="116" height="24" rx="12" fill="#ffffff" />
                    <polygon points="-5,-32 5,-32 0,-25" fill="#ffffff" />
                    <circle cx="-45" cy="-44" r="3.5" fill="#2fbf71" />
                    <text x="5" y="-40" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f1d3f" fontFamily="Plus Jakarta Sans, system-ui, sans-serif">
                      Plumber · 4 min
                    </text>
                  </g>
                </g>
              </g>
            ))}
          </g>

          {/* Drifting Clouds */}
          <g opacity={cloudOp}>
            <g>
              <animateTransform attributeName="transform" type="translate" from="-320 0" to="1760 0" dur="150s" begin="-45s" repeatCount="indefinite" />
              <ellipse cx="0" cy="90" rx="90" ry="22" fill="#ffffff" opacity="0.7" />
              <ellipse cx="-40" cy="80" rx="48" ry="20" fill="#ffffff" opacity="0.7" />
              <ellipse cx="38" cy="78" rx="52" ry="22" fill="#ffffff" opacity="0.7" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="translate" from="-320 0" to="1760 0" dur="210s" begin="-120s" repeatCount="indefinite" />
              <ellipse cx="0" cy="420" rx="110" ry="24" fill="#ffffff" opacity="0.5" />
              <ellipse cx="-50" cy="408" rx="56" ry="22" fill="#ffffff" opacity="0.5" />
              <ellipse cx="48" cy="406" rx="60" ry="24" fill="#ffffff" opacity="0.5" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="translate" from="-320 0" to="1760 0" dur="180s" begin="-10s" repeatCount="indefinite" />
              <ellipse cx="0" cy="700" rx="100" ry="22" fill="#ffffff" opacity="0.45" />
              <ellipse cx="-44" cy="690" rx="50" ry="20" fill="#ffffff" opacity="0.45" />
            </g>
          </g>

          {/* Lighting & Atmos Shading */}
          <rect x="0" y="0" width="1440" height="800" fill="url(#sunGlow)" opacity={sunOp} style={{ pointerEvents: 'none' }} />
          <rect x="0" y="0" width="1440" height="240" fill="url(#hazeTop)" style={{ pointerEvents: 'none' }} />
          <rect x="0" y="560" width="1440" height="240" fill="url(#hazeBot)" style={{ pointerEvents: 'none' }} />
          <rect
            x="0"
            y="0"
            width="1440"
            height="800"
            fill="#0b1740"
            opacity={overlay}
            style={{ mixBlendMode: 'multiply', pointerEvents: 'none', transition: 'opacity 0.8s ease' }}
          />

          {/* Streetlamp Glow Halos (Transformed with Camera) */}
          <g id="city-glow" transform="translate(0 0)" style={{ pointerEvents: 'none' }}>
            {city.glows.map((gl, i) => (
              <circle key={`gl-${i}`} cx={gl.cx} cy={gl.cy} r="40" fill="url(#lampGlow)" opacity={lampOp} style={{ mixBlendMode: 'screen' }} />
            ))}
          </g>
        </svg>

        {/* Dynamic Screen-Space Pin Layer (Continuously tracks workers in RAF) */}
        <div id="pin-layer" className={styles.pinLayer}>
          {PIN_ITEMS.map((p) => {
            const bobClass =
              p.bobClassKey === 'pinbobB'
                ? styles.pinbobB
                : p.bobClassKey === 'pinbobC'
                ? styles.pinbobC
                : styles.pinbob;
            const ringColor = p.ringColor === 'currentColor' ? t.text : p.ringColor;
            const isElectrician = p.name === 'ELECTRICIAN';

            return (
              <div id={`pin-${p.id}`} className={styles.pinAnchor} key={`pin-${p.id}`}>
                <div className={bobClass}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      bottom: -7,
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      type="button"
                      className={`${styles.pill} ${styles.pp}`}
                      onClick={() => router.push(`/book/${p.slug}`)}
                      style={{
                        pointerEvents: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '44px',
                        padding: '0 16px',
                        border: 0,
                        borderRadius: '999px',
                        backgroundColor: isElectrician ? accent : t.card,
                        color: isElectrician ? '#1b1b1b' : t.text,
                        font: "800 12px 'Plus Jakarta Sans', system-ui, sans-serif",
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 14px rgba(15, 29, 63, 0.22)',
                        cursor: 'pointer',
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isElectrician ? '#1b1b1b' : t.text}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {p.iconPath}
                      </svg>
                      <span>{p.name}</span>
                      {p.nearby && (
                        <span className={styles.pn} style={{ fontWeight: 600, opacity: isElectrician ? 1 : 0.65 }}>
                          {p.nearby}
                        </span>
                      )}
                      {p.hasDot && (
                        <span
                          className={styles.pn}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: p.dotColor || '#2fbf71',
                          }}
                        />
                      )}
                    </button>
                    <div style={{ width: 2, height: p.stemHeight, backgroundColor: t.text }} />
                    <div
                      style={{
                        position: 'relative',
                        width: 14,
                        height: 14,
                        boxSizing: 'border-box',
                        borderRadius: '50%',
                        backgroundColor: t.card,
                        border: `3px solid ${ringColor}`,
                      }}
                    >
                      <span
                        className={styles.ring}
                        style={{
                          position: 'absolute',
                          left: -8,
                          top: -8,
                          width: 22,
                          height: 22,
                          boxSizing: 'border-box',
                          borderRadius: '50%',
                          border: `2px solid ${ringColor}`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Camera View Controls (+ / - / Reset) matching Main.dc.html */}
        <div className={styles.zoomControls}>
          <button
            type="button"
            className={`${styles.pill} ${styles.zoomBtn}`}
            onClick={() => zoomBy(1.35)}
            aria-label="Zoom in"
            style={{
              border: `1px solid ${t.border}`,
              backgroundColor: t.card,
              color: t.text,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.pill} ${styles.zoomBtn}`}
            onClick={() => zoomBy(1 / 1.35)}
            aria-label="Zoom out"
            style={{
              border: `1px solid ${t.border}`,
              backgroundColor: t.card,
              color: t.text,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.pill} ${styles.zoomBtn}`}
            onClick={zoomFit}
            aria-label="Reset view"
            style={{
              border: `1px solid ${t.border}`,
              backgroundColor: t.card,
              color: t.text,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          </button>
        </div>

        {/* Centered Search Card Overlay */}
        <div className={styles.searchOverlay} data-card="1">
          <div
            className={styles.liveBadge}
            style={{
              backgroundColor: t.chip,
              color: t.text,
            }}
          >
            <span className={styles.livedot} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#e5484d' }} />
            <span>LIVE IN YOUR CITY</span>
          </div>

          <div
            className={styles.searchBoxCard}
            style={{
              backgroundColor: t.card,
            }}
          >
            <form onSubmit={handleSearchSubmit}>
              <div
                className={styles.searchInputsRow}
                style={{
                  border: `1.5px solid ${t.text}`,
                }}
              >
                <input
                  type="text"
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you need help with? (e.g. leaking faucet, bad wiring)"
                  aria-label="What do you need help with?"
                  style={{ color: t.text }}
                />

                <select
                  className={styles.categorySelect}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Service category"
                  style={{
                    borderLeft: `1px solid ${t.border}`,
                    color: t.text,
                  }}
                >
                  <option value="cleaning">House Cleaning</option>
                  <option value="cleaning">Maid</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="handyman">Handyman</option>
                  <option value="hvac">HVAC Repair</option>
                </select>

                <button type="submit" className={styles.searchSubmitBtn}>
                  Search
                </button>
              </div>
            </form>

            <div className={styles.searchSubtitle} style={{ color: t.sub }}>
              Describe your job • Connect with nearby workers • Book instantly.
            </div>
          </div>
        </div>
      </section>

      {/* Docked Bottom Bar: Trade Tools, Scroll Indicator, Trust Metrics */}
      <footer
        className={styles.bottomBar}
        style={{
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2.7s6 6.3 6 10.6a6 6 0 0 1-12 0C6 9 12 2.7 12 2.7z" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
          </svg>
        </div>

        <a
          href="#services"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <svg className={styles.nudge} width="16" height="26" viewBox="0 0 16 26" fill="none" stroke={t.text} strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <rect x="1" y="1" width="14" height="24" rx="7" />
            <path d="M8 6v5" />
          </svg>
          <span>Scroll to discover more ↓</span>
        </a>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={accent} stroke={accent} strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>15 Min</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: t.sub }}>Avg Arrival</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a8f5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>KYC</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: t.sub }}>Verifieds</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={accent} stroke={accent} strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>4.9/5</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: t.sub }}>Rating</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
