import React, { useEffect, useRef } from 'react';
import '@/styles/cycleWisdom.css';

interface CycleWisdomOption3Props {
  title?: string;
  description?: string;
}

export default function CycleWisdomOption3({ title = 'Ciclo de Sabiduría', description = 'Descubre cómo colaborar y crecer juntos.' }: CycleWisdomOption3Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Set CSS variable for theme color based on computed background of parent
  useEffect(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;
    const style = getComputedStyle(parent);
    // Try background color first
    let bg = style.backgroundColor;
    // If transparent, try to extract colors from gradient
    if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
      const bgImg = style.backgroundImage;
      const colorRegex = /rgba?\([^)]*\)/g;
      const hexRegex = /#([0-9a-fA-F]{3,6})/g;
      const colors = [] as string[];
      let match;
      while ((match = colorRegex.exec(bgImg)) !== null) colors.push(match[0]);
      while ((match = hexRegex.exec(bgImg)) !== null) colors.push(match[0]);
      if (colors.length) {
        // Simple average of RGB components
        const avg = colors.reduce(
          (acc, col) => {
            // convert to rgb array
            const rgb = col.startsWith('#')
              ? hexToRgb(col)
              : rgbaStringToRgb(col);
            acc[0] += rgb[0];
            acc[1] += rgb[1];
            acc[2] += rgb[2];
            return acc;
          },
          [0, 0, 0]
        );
        const n = colors.length;
        const averaged = `rgb(${Math.round(avg[0] / n)}, ${Math.round(avg[1] / n)}, ${Math.round(avg[2] / n)})`;
        bg = averaged;
      }
    }
    // Apply as CSS variable on root for children to use
    document.documentElement.style.setProperty('--theme-color', bg);
  }, []);

  // Helpers to convert colour strings
  const hexToRgb = (hex: string) => {
    let cleaned = hex.replace('#', '');
    if (cleaned.length === 3) cleaned = cleaned.split('').map(c => c + c).join('');
    const num = parseInt(cleaned, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };
  const rgbaStringToRgb = (rgba: string) => {
    const nums = rgba
      .replace(/[rgba()]/g, '')
      .split(',')
      .map(v => parseFloat(v.trim()))
      .slice(0, 3);
    return nums as number[];
  };

  return (
    <section className="cycle-wisdom" ref={containerRef}>
      <h2 className="cycle-wisdom__title">{title}</h2>
      <p className="cycle-wisdom__desc">{description}</p>
      {/* Animated dots */}
      <div className="cycle-dots">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <button className="cycle-wisdom__btn" disabled>
        Continuar
      </button>
    </section>
  );
}
