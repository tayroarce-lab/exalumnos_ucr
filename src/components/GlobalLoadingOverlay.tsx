'use client';

import React, { useEffect, useState } from 'react';
import '@/styles/globalOverlay.css';

import { Star, BookOpen, Triangle, Award, Microscope, Atom, Pencil, GraduationCap } from 'lucide-react';

// Converts rgb(r,g,b) string to [r, g, b]
function parseRgb(color: string): [number, number, number] | null {
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  return null;
}

// Returns saturation (0–1) of an rgb color — higher = more vivid
function getSaturation([r, g, b]: [number, number, number]): number {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  if (max === 0) return 0;
  return (max - min) / max;
}

// Returns brightness (0–1)
function getBrightness([r, g, b]: [number, number, number]): number {
  return (r * 299 + g * 587 + b * 114) / 255000;
}

// Returns true if the color is too close to white or transparent
function isWhiteOrTransparent(color: string): boolean {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true;
  const rgb = parseRgb(color);
  if (!rgb) return true;
  const [r, g, b] = rgb;
  // near-white: all channels > 220
  if (r > 220 && g > 220 && b > 220) return true;
  // near-black: very dark and unsaturated
  if (getBrightness(rgb) < 0.05 && getSaturation(rgb) < 0.1) return true;
  return false;
}

// Extracts all vivid colors from a gradient string
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

// Picks the most saturated/vivid color from a list
function mostVibrant(colors: string[]): string | null {
  let best: string | null = null;
  let bestScore = -1;
  for (const c of colors) {
    const rgb = parseRgb(c);
    if (!rgb) continue;
    const score = getSaturation(rgb) * 1.5 + getBrightness(rgb) * 0.5;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}

// Scan the page for up to 3 distinct vivid colors
function detectPageColors(): string[] {
  const candidates: string[] = [];
  const selectors = [
    '.login-left', '.register-left', 'header', 'nav',
    'main', '.dashboard-container', '[class*="bg-"]',
    'section', 'aside', 'footer', 'body'
  ];
  const seen = new Set<string>();

  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    for (const el of Array.from(els)) {
      const style = window.getComputedStyle(el);

      // Check gradient first
      if (style.backgroundImage && style.backgroundImage.includes('gradient')) {
        const gradColors = extractGradientColors(style.backgroundImage);
        for (const c of gradColors) {
          const key = c.replace(/\s/g, '');
          if (!seen.has(key) && !isWhiteOrTransparent(c)) {
            seen.add(key);
            candidates.push(c);
          }
        }
      }

      // Check solid bg
      const bg = style.backgroundColor;
      if (!isWhiteOrTransparent(bg)) {
        const key = bg.replace(/\s/g, '');
        if (!seen.has(key)) {
          seen.add(key);
          candidates.push(bg);
        }
      }

      if (candidates.length >= 6) break;
    }
    if (candidates.length >= 6) break;
  }

  // Sort by saturation descending and pick top 3
  const sorted = candidates.sort((a, b) => {
    const ra = parseRgb(a), rb = parseRgb(b);
    if (!ra || !rb) return 0;
    return getSaturation(rb) - getSaturation(ra);
  });

  return sorted.slice(0, 3).length > 0 ? sorted.slice(0, 3) : ['#003D73'];
}

export default function GlobalLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [pageColors, setPageColors] = useState<string[]>(['#003D73']);

  useEffect(() => {
    if (isLoading && typeof window !== 'undefined') {
      const colors = detectPageColors();
      setPageColors(colors.length > 0 ? colors : ['#003D73']);
    }
  }, [isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let activeRequests = 0;
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      activeRequests++;
      setTimeout(() => setIsLoading(true), 0);
      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        activeRequests--;
        if (activeRequests === 0) {
          setTimeout(() => setIsLoading(false), 0);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!isLoading) return null;

  // Assign colors cyclically: main color for cap, alternate dots
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
            <circle cx="50" cy="15" r="2"  fill={dotColors[0]} />
            <circle cx="75" cy="25" r="3"  fill={dotColors[1]} />
            <circle cx="85" cy="50" r="2"  fill={dotColors[2]} />
            <circle cx="75" cy="75" r="3"  fill={dotColors[3]} />
            <circle cx="50" cy="85" r="2"  fill={dotColors[4]} />
            <circle cx="25" cy="75" r="3"  fill={dotColors[5]} />
            <circle cx="15" cy="50" r="2"  fill={dotColors[6]} />
            <circle cx="25" cy="25" r="3"  fill={dotColors[7]} />
          </g>
        </svg>
      </div>
    </div>
  );
}


export default function GlobalLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);

  const [themeColor, setThemeColor] = useState('#003D73');

  useEffect(() => {
    if (isLoading && typeof window !== 'undefined') {
      const getAverageColor = (element: Element) => {
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;
        const bgColor = style.backgroundColor;

        if (bgImage && bgImage.includes('gradient')) {
          const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)|rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)|#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g;
          const matches = [...bgImage.matchAll(rgbRegex)];
          if (matches.length > 0) {
            let r = 0, g = 0, b = 0, count = 0;
            for (const match of matches) {
              if (match[1]) { r+=parseInt(match[1]); g+=parseInt(match[2]); b+=parseInt(match[3]); count++; }
              else if (match[4]) { r+=parseInt(match[4]); g+=parseInt(match[5]); b+=parseInt(match[6]); count++; }
              else if (match[7]) {
                const hex = match[7];
                if (hex.length === 3) {
                  r += parseInt(hex[0]+hex[0], 16); g += parseInt(hex[1]+hex[1], 16); b += parseInt(hex[2]+hex[2], 16);
                } else {
                  r += parseInt(hex.substring(0,2), 16); g += parseInt(hex.substring(2,4), 16); b += parseInt(hex.substring(4,6), 16);
                }
                count++;
              }
            }
            if (count > 0) return `rgb(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)})`;
          }
        }
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' && bgColor !== 'rgb(255, 255, 255)' && bgColor !== '#ffffff') {
          return bgColor;
        }
        return null;
      };

      const containers = document.querySelectorAll('.login-left, .register-left, main, .dashboard-container, [class*="bg-"]');
      let foundColor = null;
      for (let i = 0; i < containers.length; i++) {
        foundColor = getAverageColor(containers[i]);
        if (foundColor) break;
      }
      setThemeColor(foundColor || '#003D73');
    }
  }, [isLoading]);

  useEffect(() => {
    // We only want to patch fetch in the browser
    if (typeof window === 'undefined') return;

    let activeRequests = 0;
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      activeRequests++;
      setTimeout(() => setIsLoading(true), 0);

      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        activeRequests--;
        if (activeRequests === 0) {
          setTimeout(() => setIsLoading(false), 0);
        }
      }
    };

    // Cleanup when component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!isLoading) return null;

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
        <svg className="global-overlay-spinner" viewBox="0 0 100 100" style={{ '--theme-color': themeColor } as React.CSSProperties}>
          <g className="cap-icon" fill="var(--theme-color)">
            {/* Top diamond of the cap */}
            <polygon points="50,38 68,46 50,54 32,46" />
            {/* Base of the cap */}
            <path d="M 36 48 L 36 56 C 36 60, 64 60, 64 56 L 64 48 Z" />
            {/* Tassel */}
            <rect x="65" y="46" width="2" height="12" />
            <circle cx="66" cy="59" r="1.5" />
          </g>
          <g className="dots">
            <circle cx="50" cy="15" r="2" fill="var(--theme-color)" opacity="0.5" />
            <circle cx="75" cy="25" r="3" fill="var(--theme-color)" />
            <circle cx="85" cy="50" r="2" fill="var(--theme-color)" opacity="0.5" />
            <circle cx="75" cy="75" r="3" fill="var(--theme-color)" />
            <circle cx="50" cy="85" r="2" fill="var(--theme-color)" opacity="0.5" />
            <circle cx="25" cy="75" r="3" fill="var(--theme-color)" />
            <circle cx="15" cy="50" r="2" fill="var(--theme-color)" opacity="0.5" />
            <circle cx="25" cy="25" r="3" fill="var(--theme-color)" />
          </g>
        </svg>
      </div>
    </div>
  );
}