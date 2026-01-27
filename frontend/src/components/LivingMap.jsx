import React, { useEffect, useRef } from 'react';

const LivingMap = ({ active }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Simulation Data
        const particles = Array.from({ length: 30 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? '#a3e635' : '#22d3ee' // Lime-400 or Cyan-400
        }));

        const roads = [];
        // Create a grid of roads
        for (let i = 0; i < 10; i++) roads.push({ type: 'h', y: i * 200 });
        for (let i = 0; i < 10; i++) roads.push({ type: 'v', x: i * 200 });

        const cars = Array.from({ length: 15 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.floor(Math.random() * 5) * 200, // Snap to horizontal roads
            speed: 2 + Math.random() * 3,
            dir: Math.random() > 0.5 ? 1 : -1,
            type: 'h'
        }));

        const draw = () => {
            ctx.fillStyle = '#09090b'; // Zinc-950
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Grid/Roads
            ctx.strokeStyle = '#18181b'; // Zinc-900
            ctx.lineWidth = 40;
            roads.forEach(road => {
                ctx.beginPath();
                if (road.type === 'h') {
                    ctx.moveTo(0, road.y);
                    ctx.lineTo(canvas.width, road.y);
                } else {
                    ctx.moveTo(road.x, 0);
                    ctx.lineTo(road.x, canvas.height);
                }
                ctx.stroke();
            });

            // Draw Road Lines
            ctx.strokeStyle = '#27272a'; // Zinc-800
            ctx.lineWidth = 2;
            ctx.setLineDash([20, 20]);
            roads.forEach(road => {
                ctx.beginPath();
                if (road.type === 'h') {
                    ctx.moveTo(0, road.y);
                    ctx.lineTo(canvas.width, road.y);
                } else {
                    ctx.moveTo(road.x, 0);
                    ctx.lineTo(road.x, canvas.height);
                }
                ctx.stroke();
            });
            ctx.setLineDash([]);

            // Draw "Cars"
            cars.forEach(car => {
                car.x += car.speed * car.dir;
                if (car.x > canvas.width) car.x = -50;
                if (car.x < -50) car.x = canvas.width;

                // Car Glow - Changed to Lime
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#84cc16'; // Lime-500
                ctx.fillStyle = '#bef264'; // Lime-300

                ctx.beginPath();
                ctx.roundRect(car.x, car.y - 6, 20, 12, 4);
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Draw Particles (Ambient City Lights)
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

export default LivingMap;
