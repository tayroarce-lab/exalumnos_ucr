'use client';

import React, { useEffect, useState } from 'react';
import '@/styles/globalOverlay.css';

import { Star, BookOpen, Triangle, Award, Microscope, Atom, Pencil, GraduationCap } from 'lucide-react';

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
