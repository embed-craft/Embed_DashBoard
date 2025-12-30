import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import confetti from 'canvas-confetti';

interface ConfettiProps {
    duration?: number;
    recycle?: boolean;
    containerId?: string;
    type?: 'confetti' | 'fireworks' | 'money';
}

export const Confetti: React.FC<ConfettiProps> = ({ duration = 3000, recycle = false, containerId, type = 'confetti' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const confetiRef = useRef<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!mounted || !canvasRef.current) return;

        const canvas = canvasRef.current;
        confetiRef.current = confetti.create(canvas, {
            resize: true,
            useWorker: true
        });

        const myConfetti = confetiRef.current;
        let animationEnd = Date.now() + duration;
        let interval: any;

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        // Configuration based on type
        if (type === 'fireworks') {
            const fireworkTick = () => {
                if (Date.now() > animationEnd && !recycle) return;

                myConfetti({
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: 0,
                    particleCount: 50,
                    origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                    colors: ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C']
                });

                // Keep firing randomly
                if (!recycle && Date.now() > animationEnd) return;
                setTimeout(fireworkTick, randomInRange(200, 500));
            };
            fireworkTick();

        } else if (type === 'money') {
            // Money Rain: Green papers and Gold coins falling
            const colors = ['#85bb65', '#ffd700', '#f4c430'];

            const frame = () => {
                if (Date.now() > animationEnd && !recycle) return;

                myConfetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                    shapes: ['square', 'circle'],
                    scalar: 1.5,
                    gravity: 1.2,
                    drift: 1,
                    ticks: 300
                });
                myConfetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                    shapes: ['square', 'circle'],
                    scalar: 1.5,
                    gravity: 1.2,
                    drift: -1,
                    ticks: 300
                });

                if (recycle || Date.now() < animationEnd) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

        } else {
            // Standard Confetti - Cannon from bottom
            const frame = () => {
                if (Date.now() > animationEnd && !recycle) return; // 3 seconds

                myConfetti({
                    particleCount: 7, // More density per frame
                    angle: 90,
                    spread: 90, // Wide spread
                    origin: { y: 1.1 }, // Slightly below screen
                    startVelocity: 55, // Higher velocity to cover full phone
                    decay: 0.91,
                    gravity: 1.0,
                    ticks: 300,
                    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
                });

                if (recycle || Date.now() < animationEnd) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }

        return () => {
            clearInterval(interval);
            if (confetiRef.current) {
                confetiRef.current.reset();
            }
        };

    }, [duration, recycle, type, mounted]);

    // Styles for full coverage of the container
    const style: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2147483647
    };

    if (!mounted) return null;
    const container = containerId ? document.getElementById(containerId) : document.body;
    if (container) {
        return ReactDOM.createPortal(<canvas ref={canvasRef} style={style} />, container);
    }
    return null;
};
