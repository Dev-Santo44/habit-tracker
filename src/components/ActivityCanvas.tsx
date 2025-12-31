'use client';

import React, { useRef, useEffect } from 'react';

interface ActivityCanvasProps {
    activityLevel: number; // 0 to 1
}

export default function ActivityCanvas({ activityLevel }: ActivityCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        class Particle {
            x: number;
            y: number;
            size: number;
            baseX: number;
            baseY: number;
            density: number;
            color: string;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.baseX = this.x;
                this.baseY = this.y;
                this.size = Math.random() * 2 + 1;
                this.density = (Math.random() * 20) + 1;
                const hue = 250 + (activityLevel * 60);
                this.color = `hsla(${hue}, 80%, 70%, ${0.2 + activityLevel * 0.3})`;
            }

            update() {
                if (mouseRef.current.active) {
                    const dx = mouseRef.current.x - this.x;
                    const dy = mouseRef.current.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const maxDistance = 150;

                    if (distance < maxDistance) {
                        const force = (maxDistance - distance) / maxDistance;
                        const directionX = (dx / distance) * force * this.density;
                        const directionY = (dy / distance) * force * this.density;
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        if (this.x !== this.baseX) {
                            this.x -= (this.x - this.baseX) / 20;
                        }
                        if (this.y !== this.baseY) {
                            this.y -= (this.y - this.baseY) / 20;
                        }
                    }
                } else {
                    if (this.x !== this.baseX) {
                        this.x -= (this.x - this.baseX) / 20;
                    }
                    if (this.y !== this.baseY) {
                        this.y -= (this.y - this.baseY) / 20;
                    }
                }

                // Gentle float
                this.baseX += Math.sin(Date.now() / 2000 + this.density) * 0.1;
                this.baseY += Math.cos(Date.now() / 2000 + this.density) * 0.1;
            }

            draw() {
                ctx!.fillStyle = this.color;
                ctx!.shadowBlur = 15;
                ctx!.shadowColor = this.color;
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fill();
                ctx!.shadowBlur = 0; // Reset for other drawings
            }
        }

        const init = () => {
            particles = [];
            const numberOfParticles = 120 + Math.floor(activityLevel * 250);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Connect particles
            ctx.strokeStyle = `hsla(${250 + activityLevel * 40}, 70%, 50%, 0.08)`;
            ctx.lineWidth = 0.8;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;
            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width = displayWidth;
                canvas.height = displayHeight;
                init();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
            mouseRef.current.active = true;
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        handleResize();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [activityLevel]);

    return (
        <div className="absolute inset-0 -z-10 opacity-70">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />
        </div>
    );
}
