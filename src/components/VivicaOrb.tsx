
import React, { useEffect, useRef } from 'react';

interface VivicaOrbProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking';
  audioLevel: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
}

export const VivicaOrb: React.FC<VivicaOrbProps> = ({ state, audioLevel, canvasRef }) => {
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'listening': return { r: 144, g: 72, b: 248 }; // #9048F8 - Bluish Purple
      case 'processing': return { r: 232, g: 48, b: 232 }; // #E830E8 - Fuchsia
      case 'speaking': return { r: 128, g: 56, b: 240 }; // #8038F0 - Bluish Purple
      default: return { r: 88, g: 0, b: 96 }; // #580060 - Plum Purple
    }
  };

  const createParticle = (centerX: number, centerY: number, baseRadius: number) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = baseRadius + Math.random() * 20;
    const speed = 0.5 + Math.random() * 1.5;
    
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 60 + Math.random() * 60,
      size: 2 + Math.random() * 3,
      opacity: 0.8
    };
  };

  const updateParticles = (centerX: number, centerY: number, baseRadius: number, shouldEmit: boolean) => {
    const particles = particlesRef.current;
    
    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;
      particle.opacity = 1 - (particle.life / particle.maxLife);
      
      if (particle.life >= particle.maxLife) {
        particles.splice(i, 1);
      }
    }
    
    // Emit new particles
    if (shouldEmit && particles.length < 50) {
      if (Math.random() < 0.3) {
        particles.push(createParticle(centerX, centerY, baseRadius));
      }
    }
  };

  const drawOrb = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const time = timeRef.current;
    const color = getStateColor(state);
    const baseRadius = 60 + audioLevel * 20;
    const pulseRadius = baseRadius + Math.sin(time * 0.05) * 8;
    const shouldEmitParticles = state !== 'idle';

    // Update particles
    updateParticles(centerX, centerY, baseRadius, shouldEmitParticles);

    // Draw particles
    const particles = particlesRef.current;
    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity * 0.6;
      
      // Particle glow
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, `rgb(${color.r}, ${color.g}, ${color.b})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Particle core
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });

    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.3;
    const outerGlow = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, pulseRadius * 2.5
    );
    outerGlow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`);
    outerGlow.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`);
    outerGlow.addColorStop(1, 'transparent');
    
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Main orb gradient
    const orbGradient = ctx.createRadialGradient(
      centerX - pulseRadius * 0.3, centerY - pulseRadius * 0.3, 0,
      centerX, centerY, pulseRadius
    );
    orbGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    orbGradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`);
    orbGradient.addColorStop(0.7, `rgba(${Math.floor(color.r * 0.7)}, ${Math.floor(color.g * 0.7)}, ${Math.floor(color.b * 0.7)}, 0.6)`);
    orbGradient.addColorStop(1, `rgba(${Math.floor(color.r * 0.4)}, ${Math.floor(color.g * 0.4)}, ${Math.floor(color.b * 0.4)}, 0.3)`);

    // Main orb
    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.save();
    ctx.globalAlpha = 0.6;
    const highlight = ctx.createRadialGradient(
      centerX - pulseRadius * 0.4, centerY - pulseRadius * 0.4, 0,
      centerX - pulseRadius * 0.4, centerY - pulseRadius * 0.4, pulseRadius * 0.5
    );
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlight.addColorStop(1, 'transparent');
    
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw orb
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    drawOrb(ctx, centerX, centerY);

    timeRef.current += 1;
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, audioLevel]);

  return null;
};
