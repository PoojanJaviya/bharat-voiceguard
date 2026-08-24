import React, { useEffect, useRef } from 'react';
import { useDemo } from '../context/DemoContext';

const AudioWaveform: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { callState, riskLevel } = useDemo();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = 80;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get color based on risk
    const getWaveColor = (opacity: number) => {
      if (callState === 'idle' || callState === 'ended') {
        return `rgba(71, 85, 105, ${opacity})`; // slate-600
      }
      if (riskLevel === 'LOW RISK') {
        return `rgba(16, 185, 129, ${opacity})`; // emerald-500
      }
      if (riskLevel === 'VERIFY') {
        return `rgba(245, 158, 11, ${opacity})`; // amber-500
      }
      return `rgba(239, 68, 68, ${opacity})`; // rose-500
    };

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Adjust parameters based on call status
      let lines = 3;
      let baseAmplitude = 0;
      let frequency = 0.015;
      let speed = 0.08;

      if (callState === 'calling') {
        baseAmplitude = 12;
        speed = 0.12;
        frequency = 0.03;
      } else if (callState === 'active') {
        speed = 0.06;
        if (riskLevel === 'LOW RISK') {
          baseAmplitude = 18;
          frequency = 0.02;
        } else if (riskLevel === 'VERIFY') {
          baseAmplitude = 26;
          frequency = 0.035;
          speed = 0.09;
        } else {
          baseAmplitude = 34; // High turbulence
          frequency = 0.055;
          speed = 0.15;
        }
      } else {
        // Resting flatline wave
        baseAmplitude = 1.5;
        frequency = 0.005;
        speed = 0.01;
        lines = 1;
      }

      // Draw multi-layered sine waves
      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const amplitude = baseAmplitude * (1 - i * 0.3);
        const currentPhase = phase + i * Math.PI * 0.4;
        
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.strokeStyle = getWaveColor(i === 0 ? 0.8 : 0.3);

        for (let x = 0; x < width; x++) {
          // Add sine wave modulation
          const sinValue = Math.sin(x * frequency + currentPhase);
          
          // Edge feathering / envelope (taper the wave at the ends so it looks neat)
          const envelope = Math.sin((x / width) * Math.PI);
          
          const y = centerY + sinValue * amplitude * envelope;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += speed;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [callState, riskLevel]);

  return (
    <div className="w-full bg-navy-950/65 rounded-xl border border-navy-800/80 p-2.5 flex items-center justify-center overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full block h-20"
        id="audio-waveform-canvas"
      />
    </div>
  );
};

export default AudioWaveform;
