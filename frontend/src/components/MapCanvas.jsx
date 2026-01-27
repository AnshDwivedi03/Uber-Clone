import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const MapCanvas = ({ isRideActive, userLocation, captainLocation }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Living Map Animation (Idle State)
    useEffect(() => {
        if (isRideActive) return;

        const ctx = canvasRef.current.getContext('2d');
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        canvasRef.current.width = width;
        canvasRef.current.height = height;

        const particles = [];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 2 + 1,
                d: Math.random() * particleCount
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#18181b'; // Dark Surface
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#ccff00'; // Brand Primary
            ctx.beginPath();
            for (let i = 0; i < particleCount; i++) {
                const p = particles[i];
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
            }
            ctx.fill();
            update();
            requestAnimationFrame(animate);
        };

        const update = () => {
            for (let i = 0; i < particleCount; i++) {
                const p = particles[i];
                p.y += Math.cos(p.d) + 1 + p.r / 2;
                p.x += Math.sin(0) * 2;
                if (p.x > width + 5 || p.x < -5 || p.y > height) {
                    if (i % 3 > 0) {
                        particles[i] = { x: Math.random() * width, y: -10, r: p.r, d: p.d };
                    } else {
                        if (Math.sin(0) > 0) {
                            particles[i] = { x: -5, y: Math.random() * height, r: p.r, d: p.d };
                        } else {
                            particles[i] = { x: width + 5, y: Math.random() * height, r: p.r, d: p.d };
                        }
                    }
                }
            }
        };

        const animId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animId);
    }, [isRideActive]);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-dark-bg">
            {!isRideActive ? (
                <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-20" />
            ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                    {/* Placeholder for real Map (Google Maps / Mapbox) */}
                    <p>Map Active (Navigation Mode)</p>
                    {/* Here you would integrate the standard Map component */}
                </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent pointer-events-none" />
        </div>
    );
};

export default MapCanvas;
