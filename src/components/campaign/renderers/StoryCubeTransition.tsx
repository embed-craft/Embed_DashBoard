import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

interface StoryCubeTransitionProps {
    activeStoryId: string | null;
    children: React.ReactNode;
}

/**
 * StoryCubeTransition provides a high-fidelity 3D "Cube" flip between stories.
 */
export const StoryCubeTransition: React.FC<StoryCubeTransitionProps> = ({ activeStoryId, children }) => {
    const { currentCampaign } = useEditorStore();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [incomingChildren, setIncomingChildren] = useState<React.ReactNode | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    
    const prevIdRef = useRef(activeStoryId);
    const stories = currentCampaign?.stories || [];

    useEffect(() => {
        if (activeStoryId !== prevIdRef.current && activeStoryId && prevIdRef.current) {
            // New story detected - determine direction
            const prevIndex = stories.findIndex(s => s.id === prevIdRef.current);
            const currIndex = stories.findIndex(s => s.id === activeStoryId);
            
            // Determine direction (wrap-around logic included)
            const isForward = (currIndex > prevIndex && !(prevIndex === 0 && currIndex === stories.length - 1)) 
                || (prevIndex === stories.length - 1 && currIndex === 0);
            
            setDirection(isForward ? 'forward' : 'backward');
            setIncomingChildren(children);
            setIsTransitioning(true);
            
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setDisplayChildren(children);
                setIncomingChildren(null);
                prevIdRef.current = activeStoryId;
            }, 600);

            return () => clearTimeout(timer);
        } else {
            // Just update children if no story change (initial or slide change)
            setDisplayChildren(children);
            prevIdRef.current = activeStoryId;
        }
    }, [activeStoryId, stories.length, children]);

    if (!isTransitioning) {
        return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
    }

    // Parameters for the 393px width cube
    const halfWidth = 196.5; 
    const incomingDeg = direction === 'forward' ? 90 : -90;
    const rotationDeg = direction === 'forward' ? -90 : 90;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            perspective: '1800px',
            backgroundColor: '#000',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transform: `translateZ(-${halfWidth}px)`,
                animation: `cubeRotate-${direction} 0.35s cubic-bezier(0.1, 0, 0, 1) forwards`,
                willChange: 'transform',
            }}>
                {/* Outgoing Face */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: `rotateY(0deg) translateZ(${halfWidth}px)`,
                    zIndex: 2,
                    willChange: 'transform, opacity',
                }}>
                    {displayChildren}
                    {/* Shadow Layer for Outgoing */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: '#000',
                        pointerEvents: 'none',
                        animation: 'shadowOut 0.35s ease-in forwards',
                        zIndex: 10,
                    }} />
                </div>

                {/* Incoming Face */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: `rotateY(${incomingDeg}deg) translateZ(${halfWidth}px)`,
                    zIndex: 1,
                    willChange: 'transform, opacity',
                }}>
                    {incomingChildren}
                    {/* Shadow Layer for Incoming */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: '#000',
                        pointerEvents: 'none',
                        animation: 'shadowIn 0.35s ease-out forwards',
                        zIndex: 10,
                    }} />
                </div>
            </div>

            <style>
                {`
                    @keyframes cubeRotate-forward {
                        0%   { transform: translateZ(-${halfWidth}px) rotateY(0deg); }
                        100% { transform: translateZ(-${halfWidth}px) rotateY(-90deg); }
                    }
                    @keyframes cubeRotate-backward {
                        0%   { transform: translateZ(-${halfWidth}px) rotateY(0deg); }
                        100% { transform: translateZ(-${halfWidth}px) rotateY(90deg); }
                    }
                    @keyframes shadowOut {
                        0%   { opacity: 0; }
                        100% { opacity: 0.6; }
                    }
                    @keyframes shadowIn {
                        0%   { opacity: 0.6; }
                        100% { opacity: 0; }
                    }
                `}
            </style>
        </div>
    );
};

export default StoryCubeTransition;
