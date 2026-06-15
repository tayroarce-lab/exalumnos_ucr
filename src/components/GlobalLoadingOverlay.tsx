'use client';

import React, { useEffect, useState } from 'react';
import '@/styles/globalOverlay.css';
import { Star, BookOpen, Triangle, Award, Microscope, Atom, Pencil, GraduationCap } from 'lucide-react';

// ─── Color Utilities ─────────────────────────────────────────────────────────

function parseRgb(color: string): [number, number, number] | null {
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  return null;
}

function getSaturation([r, g, b]: [number, number, number]): number {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  if (max === 0) return 0;
  return (max - min) / max;
}

function getBrightness([r, g, b]: [number, number, number]): number {
  return (r * 299 + g * 587 + b * 114) / 255000;
}

function isWhiteOrTransparent(color: string): boolean {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true;
  const rgb = parseRgb(color);
  if (!rgb) return true;
  const [r, g, b] = rgb;
  if (r > 220 && g > 220 && b > 220) return true; // near-white
  if (getBrightness(rgb) < 0.05 && getSaturation(rgb) < 0.1) return true; // near-black unsaturated
  return false;
}

function extractGradientColors(bgImage: string): string[] {
  const rgbRegex = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
  const colors: string[] = [];
  let m;
  while ((m = rgbRegex.exec(bgImage)) !== null) {
    const col = `rgb(${m[1]}, ${m[2]}, ${m[3]})`;
    if (!isWhiteOrTransparent(col)) colors.push(col);
  }
  return colors;
}

// Scan the page for up to 3 distinct vivid colors, sorted by saturation
function detectPageColors(): string[] {
  const candidates: string[] = [];
  const selectors = [
    '.login-left', '.register-left', 'header', 'nav',
    'main', '.dashboard-container', '[class*="bg-"]',
    'section', 'aside', 'footer', 'body',
  ];
  const seen = new Set<string>();

  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    for (const el of Array.from(els)) {
      const style = window.getComputedStyle(el);

      if (style.backgroundImage && style.backgroundImage.includes('gradient')) {
        for (const c of extractGradientColors(style.backgroundImage)) {
          const key = c.replace(/\s/g, '');
          if (!seen.has(key)) { seen.add(key); candidates.push(c); }
        }
      }

      const bg = style.backgroundColor;
      if (!isWhiteOrTransparent(bg)) {
        const key = bg.replace(/\s/g, '');
        if (!seen.has(key)) { seen.add(key); candidates.push(bg); }
      }

      if (candidates.length >= 6) break;
    }
    if (candidates.length >= 6) break;
  }

  const sorted = [...candidates].sort((a, b) => {
    const ra = parseRgb(a), rb = parseRgb(b);
    if (!ra || !rb) return 0;
    return getSaturation(rb) - getSaturation(ra);
  });

  return sorted.slice(0, 3).length > 0 ? sorted.slice(0, 3) : ['#003D73'];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GlobalLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [pageColors, setPageColors] = useState<string[]>(['#003D73']);

  // Detect page colors every time loading starts
  useEffect(() => {
    if (isLoading && typeof window !== 'undefined') {
      const colors = detectPageColors();
      setPageColors(colors.length > 0 ? colors : ['#003D73']);
    }
  }, [isLoading]);

  // Intercept all window.fetch calls
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let activeRequests = 0;
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      activeRequests++;
      setTimeout(() => setIsLoading(true), 0);
      try {
        return await originalFetch(...args);
      } finally {
        activeRequests--;
        if (activeRequests === 0) {
          setTimeout(() => setIsLoading(false), 0);
        }
      }
    };

    return () => { window.fetch = originalFetch; };
  }, []);

  if (!isLoading) return null;

  // Main cap color = most vibrant, dots alternate through all detected colors
  const c0 = pageColors[0] ?? '#003D73';
  const c1 = pageColors[1] ?? c0;
  const c2 = pageColors[2] ?? c1;
  const dotColors = [c0, c1, c2, c0, c1, c2, c0, c1];

  return (
    <div className="global-overlay-container">
      <div className="floating-symbols-wrapper">
        <GraduationCap className="floating-symbol symbol-1" />
        <Microscope className="floating-symbol symbol-2" />
        <Star className="floating-symbol symbol-3" />
        <BookOpen className="floating-symbol symbol-4" />
        <Triangle className="floating-symbol symbol-5" />
        <Award className="floating-symbol symbol-6" />
        <Atom className="floating-symbol symbol-7" />
        <Pencil className="floating-symbol symbol-8" />
      </div>
      <div className="global-overlay-box">
        <svg className="global-overlay-spinner" viewBox="0 0 100 100">
          <g className="cap-icon" fill={c0}>
            <polygon points="50,38 68,46 50,54 32,46" />
            <path d="M 36 48 L 36 56 C 36 60, 64 60, 64 56 L 64 48 Z" />
            <rect x="65" y="46" width="2" height="12" />
            <circle cx="66" cy="59" r="1.5" />
          </g>
          <g className="dots">
            <circle cx="50" cy="15" r="2" fill={dotColors[0]} />
            <circle cx="75" cy="25" r="3" fill={dotColors[1]} />
            <circle cx="85" cy="50" r="2" fill={dotColors[2]} />
            <circle cx="75" cy="75" r="3" fill={dotColors[3]} />
            <circle cx="50" cy="85" r="2" fill={dotColors[4]} />
            <circle cx="25" cy="75" r="3" fill={dotColors[5]} />
            <circle cx="15" cy="50" r="2" fill={dotColors[6]} />
            <circle cx="25" cy="25" r="3" fill={dotColors[7]} />
          </g>
        </svg>
      </div>
    </div>
  );
}