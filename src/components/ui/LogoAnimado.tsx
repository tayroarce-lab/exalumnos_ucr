'use client';
import { useEffect, useState, useMemo } from 'react';
import Image, { StaticImageData } from 'next/image';

interface LogoAnimadoProps {
  src: string | StaticImageData;
}

export default function LogoAnimado({ src }: LogoAnimadoProps) {
  const [mounted, setMounted] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setMounted(true);
    // La animación dura aproximadamente 1.5s total (max delay 0.5s + 1s logoSnap)
    const timer = setTimeout(() => setSettled(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const dotsData = useMemo(() => {
    const dots = [];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 26 + Math.random() * 22;
      const dx = (Math.cos(a) * d).toFixed(1) + 'cqw';
      const dy = (Math.sin(a) * d).toFixed(1) + 'cqh';
      const oa = a + (Math.random() - 0.5) * 0.7;
      const od = d * (1.4 + Math.random() * 0.9);
      const ox = (Math.cos(oa) * od).toFixed(1) + 'cqw';
      const oy = (Math.sin(oa) * od).toFixed(1) + 'cqh';
      const sz = (0.5 + Math.random() * 1.1).toFixed(2) + 'cqmin';
      const isOrange = i % 4 !== 0;
      const delay = (Math.random() * 0.14).toFixed(3);
      dots.push({ dx, dy, ox, oy, sz, isOrange, delay });
    }
    return dots;
  }, []);

  const streaksData = useMemo(() => {
    const streaks = [];
    for (let i = 0; i < 11; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 24 + Math.random() * 20;
      const dx = (Math.cos(a) * d).toFixed(1) + 'cqw';
      const dy = (Math.sin(a) * d).toFixed(1) + 'cqh';
      const od = d * (1.6 + Math.random() * 0.8);
      const ox = (Math.cos(a) * od).toFixed(1) + 'cqw';
      const oy = (Math.sin(a) * od).toFixed(1) + 'cqh';
      const rot = (a * 180 / Math.PI).toFixed(1) + 'deg';
      const len = (3.5 + Math.random() * 4).toFixed(2) + 'cqmin';
      const isOrange = i % 3 !== 0;
      const delay = (Math.random() * 0.12).toFixed(3);
      streaks.push({ dx, dy, ox, oy, rot, len, isOrange, delay });
    }
    return streaks;
  }, []);

  const accent = '#FF8A2B';
  const acc = (a: number) => `color-mix(in srgb, ${accent} ${a}%, transparent)`;
  const accLight = `color-mix(in srgb, ${accent}, white 22%)`;
  const shadow = 'drop-shadow(0 12px 30px rgba(6,55,85,.32))';
  const orangeGlow = `drop-shadow(0 0 16px ${acc(50)})`;
  const logoW = '70cqmin'; // original was 34cqmin but the container is smaller now

  const renderLogoStatic = () => (
    <div style={{ position: 'relative', width: '85%', filter: shadow, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
      <Image 
        src={src} 
        alt="Logo UCR" 
        style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0 4px 20px rgba(0,0,0,0.8))' }} 
        priority
      />
    </div>
  );

  if (!mounted || settled) {
    return renderLogoStatic();
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', containerType: 'size', zIndex: 10 }}>
      {/* Explosión central */}
      <div style={{ position: 'absolute', width: '85%', aspectRatio: '1', borderRadius: '50%', background: `repeating-conic-gradient(from 0deg, ${acc(55)} 0deg 4deg, ${acc(0)} 4deg 16deg)`, mixBlendMode: 'screen', maskImage: 'radial-gradient(circle, #000 24%, transparent 64%)', WebkitMaskImage: 'radial-gradient(circle, #000 24%, transparent 64%)', animation: 'rayBurst .85s ease-out .5s both' }} />
      <div style={{ position: 'absolute', width: '30%', aspectRatio: '1', borderRadius: '50%', border: `2px solid ${acc(85)}`, animation: 'shockwave .85s cubic-bezier(.15,.7,.3,1) .52s both' }} />
      
      {/* Líneas (streaks) */}
      {streaksData.map((s, i) => (
        <div key={`s${i}`} style={{
          position: 'absolute', top: '50%', left: '50%', width: s.len, height: '0.4cqmin', borderRadius: '1cqmin',
          background: `linear-gradient(90deg, ${s.isOrange ? acc(0) : 'rgba(255,255,255,0)'}, ${s.isOrange ? accent : '#ffffff'})`,
          boxShadow: `0 0 8px ${s.isOrange ? acc(70) : 'rgba(255,255,255,.8)'}`,
          '--dx': s.dx, '--dy': s.dy, '--ox': s.ox, '--oy': s.oy, '--rot': s.rot,
          animation: `streakConverge .9s cubic-bezier(.5,0,.5,1) ${s.delay}s both`
        } as React.CSSProperties} />
      ))}
      
      {/* Partículas (dots) */}
      {dotsData.map((d, i) => (
        <div key={`d${i}`} style={{
          position: 'absolute', top: '50%', left: '50%', width: d.sz, height: d.sz, borderRadius: '50%',
          background: d.isOrange ? (i % 2 ? accent : `color-mix(in srgb, ${accent}, white 28%)`) : '#ffffff',
          boxShadow: `0 0 10px ${d.isOrange ? acc(85) : 'rgba(255,255,255,.9)'}`,
          '--dx': d.dx, '--dy': d.dy, '--ox': d.ox, '--oy': d.oy,
          animation: `particleConverge .9s cubic-bezier(.5,0,.5,1) ${d.delay}s both`
        } as React.CSSProperties} />
      ))}
      
      {/* Destello de impacto */}
      <div style={{ position: 'absolute', width: '50%', aspectRatio: '1', borderRadius: '50%', background: `radial-gradient(circle, ${accLight} 0%, ${acc(0)} 62%)`, mixBlendMode: 'screen', animation: 'impactFlash .5s ease-out .48s both' }} />
      
      {/* Logo en sí con el snap final */}
      <div style={{ position: 'relative', width: logoW, animation: 'logoSnap 1s cubic-bezier(.18,.85,.25,1) .52s both', filter: shadow + ' ' + orangeGlow }}>
        <Image src={src} alt="Logo UCR" style={{ width: '100%', display: 'block', height: 'auto', filter: 'brightness(0) invert(1) drop-shadow(0 4px 20px rgba(0,0,0,0.8))' }} priority />
      </div>
    </div>
  );
}
