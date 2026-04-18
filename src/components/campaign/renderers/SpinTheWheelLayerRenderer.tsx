import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layer } from '@/store/useEditorStore';
import { useEditorStore } from '@/store/useEditorStore';

// API base URL for backend calls
const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');

// Default colors when no sections exist
const DEFAULT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
];

interface SpinTheWheelLayerRendererProps {
    layer: Layer;
    scale: number;
    scaleY?: number;
    isInteractive?: boolean;
    layers?: Layer[];
    renderChild?: (layer: Layer) => React.ReactNode;
    selectedLayerId?: string | null;
}

export const SpinTheWheelLayerRenderer: React.FC<SpinTheWheelLayerRendererProps> = ({
    layer,
    scale,
    scaleY = scale,
    isInteractive = false,
    layers = [],
    renderChild,
    selectedLayerId,
}) => {
    const { currentCampaign, previewUserId } = useEditorStore();
    const sections = currentCampaign?.spinTheWheelConfig?.sections || [];
    const content = layer.content || {};

    // ─── Spin State ───────────────────────────────────────────────
    const [isSpinning, setIsSpinning] = useState(false);
    const isSpinningRef = useRef(false); // Ref to avoid stale closure
    const [rotation, setRotation] = useState(0);
    const [spinsLeft, setSpinsLeft] = useState(content.maxAttempts ?? 50);
    const spinsLeftRef = useRef(spinsLeft);
    const [resultIndex, setResultIndex] = useState<number | null>(null);
    const [showResult, setShowResult] = useState<'congrats' | 'betterLuck' | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number; size: number }>>([]);
    const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const rotationRef = useRef(0);

    // Keep refs in sync with state
    useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);
    useEffect(() => { spinsLeftRef.current = spinsLeft; }, [spinsLeft]);
    useEffect(() => { rotationRef.current = rotation; }, [rotation]);

    // Expose spinsLeft for placeholder replacement in text/button layers
    useEffect(() => {
        (window as any).__stwSpinsLeft = spinsLeft;
        (window as any).__stwMaxSpins = content.maxAttempts ?? 50;
    }, [spinsLeft, content.maxAttempts]);

    // FIX 1: Sync spinsLeft with content changes
    useEffect(() => {
        setSpinsLeft(content.maxAttempts ?? 50);
    }, [content.maxAttempts]);

    // Measure actual container size with ref + ResizeObserver
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 320, height: 320 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const update = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Wheel scale from editor config (default 1.0)
    const wheelScale = content.wheelScale ?? 1.0;

    // Determine wheel size from actual rendered container
    const diameter = Math.min(containerSize.width, containerSize.height) * 0.70 * wheelScale;
    const radius = diameter / 2;
    // SVG viewBox uses a fixed coordinate space
    const svgBaseDiameter = 300; // Fixed SVG coordinate space
    const svgRadius = svgBaseDiameter / 2;
    const svgCx = svgBaseDiameter / 2;
    const svgCy = svgBaseDiameter / 2;
    const innerRadius = radius * 0.15;
    const svgInnerRadius = svgRadius * 0.15;

    // Build slices
    const sliceCount = sections.length > 0 ? sections.length : 6;
    const anglePerSlice = (2 * Math.PI) / sliceCount;
    const degreesPerSlice = 360 / sliceCount;

    // SVG arc path helper (uses SVG-space coordinates)
    const describeArc = (startAngle: number, endAngle: number, r: number): string => {
        const x1 = svgCx + r * Math.cos(startAngle);
        const y1 = svgCy + r * Math.sin(startAngle);
        const x2 = svgCx + r * Math.cos(endAngle);
        const y2 = svgCy + r * Math.sin(endAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        return `M ${svgCx} ${svgCy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    // Pointer dimensions
    const pointerSize = radius * 0.18;
    const pointerImage = content.pointerImage;
    const wheelImage = content.wheelImage;

    // ─── Spin Logic ───────────────────────────────────────────────
    const winningCriteria = currentCampaign?.spinTheWheelConfig?.winningCriteria || 'weight';

    const getWinnerByWeight = useCallback((): number => {
        if (sections.length === 0) return Math.floor(Math.random() * sliceCount);

        const getEffectiveWeight = (s: any) => {
            if (winningCriteria === 'audience' && s.audienceId && s.audienceId.trim() !== '') {
                return 0;
            }
            const w = s.weight !== undefined ? Number(s.weight) : 1;
            return w > 0 ? w : 0;
        };

        const eligibleIndices = sections
            .map((s, index) => ({ index, weight: getEffectiveWeight(s) }))
            .filter(s => s.weight > 0);

        if (eligibleIndices.length === 0) {
             return Math.floor(Math.random() * sliceCount);
        }

        const totalWeight = eligibleIndices.reduce((sum, s) => sum + s.weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < eligibleIndices.length; i++) {
            random -= eligibleIndices[i].weight;
            if (random <= 0) return eligibleIndices[i].index;
        }
        
        return eligibleIndices[eligibleIndices.length - 1].index;
    }, [sections, sliceCount, winningCriteria]);

    const triggerConfetti = useCallback(() => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', '#DDA0DD', '#FFD700', '#FF69B4', '#00CED1'];
        const pieces = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.8,
            size: 6 + Math.random() * 10,
        }));
        setConfettiPieces(pieces);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
    }, []);

    // ─── Animate wheel to a specific winning index ───────────────
    const animateToIndex = useCallback((winnerIdx: number) => {
        const currentRotation = rotationRef.current;
        const targetSectionAngle = winnerIdx * degreesPerSlice + degreesPerSlice / 2;
        const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
        const requiredAbsoluteRotation = 360 - targetSectionAngle;
        
        // Add random scatter offset inside the winning slice bounding box exactly matching Flutter SDK:
        // final randomOffset = (math.Random().nextDouble() * (sliceAngle * 0.8)) - (sliceAngle * 0.4);
        const randomOffset = (Math.random() * (degreesPerSlice * 0.8)) - (degreesPerSlice * 0.4);

        let delta = requiredAbsoluteRotation - (currentRotation % 360);
        if (delta < 0) delta += 360;
        const targetRotation = currentRotation + delta + extraSpins + randomOffset;
        const spinDuration = content.spinDuration || 3000;

        setRotation(targetRotation);
        rotationRef.current = targetRotation;

        spinTimeoutRef.current = setTimeout(() => {
            isSpinningRef.current = false;
            setIsSpinning(false);
            setResultIndex(winnerIdx);

            setSpinsLeft(prev => {
                const newVal = Math.max(0, prev - 1);
                spinsLeftRef.current = newVal;
                return newVal;
            });

            const winnerSection = sections[winnerIdx];
            (window as any).__stwResult = winnerSection ? {
                name: winnerSection.name,
                rewardId: winnerSection.rewardId,
                sectionIndex: winnerIdx,
            } : null;

            const isWin = !!(winnerSection && winnerSection.rewardId && winnerSection.rewardId !== '' && winnerSection.rewardId !== 'no_reward');

            if (isWin) {
                if (content.showCongratsScreen) {
                    setShowResult('congrats');
                    setTimeout(() => setShowResult(null), 3000);
                }
                if (content.addConfetti !== false) {
                    triggerConfetti();
                }
            } else {
                if (content.showBetterLuckScreen) {
                    setShowResult('betterLuck');
                    setTimeout(() => setShowResult(null), 3000);
                }
            }
        }, spinDuration + 200);
    }, [degreesPerSlice, sections, content, triggerConfetti]);

    const triggerSpin = useCallback(() => {
        // Use refs to avoid stale closure issues
        if (isSpinningRef.current) return;
        if (spinsLeftRef.current <= 0) {
            console.log('[STW] No spins remaining');
            return;
        }

        isSpinningRef.current = true;
        setIsSpinning(true);
        setShowResult(null);
        setResultIndex(null);

        // ── Server-Side Spin: When a simulated User ID is present, call the backend ──
        // This saves the reward to the user's ledger (wallet) for real persistence
        if (previewUserId && currentCampaign?.id) {
            const token = localStorage.getItem('token');
            console.log('[STW] Server-side spin for user:', previewUserId, 'campaign:', currentCampaign.id);

            fetch(`${API_BASE}/api/v1/game/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    userId: previewUserId,
                    campaignId: currentCampaign.id,
                    previewConfig: currentCampaign.spinTheWheelConfig,
                }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.winningIndex !== undefined) {
                    console.log('[STW] Server result: winning index', data.winningIndex, '-', data.message);
                    animateToIndex(data.winningIndex);
                } else {
                    // Server rejected (e.g., max attempts reached, no sections)
                    console.warn('[STW] Server spin rejected:', data.error);
                    isSpinningRef.current = false;
                    setIsSpinning(false);
                    // Show error briefly via betterLuck screen
                    setShowResult('betterLuck');
                    setTimeout(() => setShowResult(null), 3000);
                }
            })
            .catch(err => {
                console.error('[STW] Server spin error:', err);
                // Fallback to local random on network failure
                const winnerIdx = getWinnerByWeight();
                animateToIndex(winnerIdx);
            });
            return;
        }

        // ── Client-Side Spin: No user ID — pure local random (design preview) ──
        const winnerIdx = getWinnerByWeight();
        animateToIndex(winnerIdx);
    }, [getWinnerByWeight, animateToIndex, previewUserId, currentCampaign]);

    // ─── Event Listener ───────────────────────────────────────────
    useEffect(() => {
        const handleSpinEvent = () => {
            if (isInteractive) {
                triggerSpin();
            }
        };

        window.addEventListener('spinTheWheel', handleSpinEvent);
        return () => {
            window.removeEventListener('spinTheWheel', handleSpinEvent);
            if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
        };
    }, [isInteractive, triggerSpin]);

    const handleSpinClick = () => {
        if (isInteractive) {
            triggerSpin();
        }
    };

    const spinDuration = content.spinDuration || 3000;
    const resultSection = resultIndex !== null ? sections[resultIndex] : null;

    // FIX 4: Generate clip-path for section image to cover entire arc
    const getSectionClipPath = (index: number): string => {
        const startAngleDeg = (index * degreesPerSlice) - 90;
        const endAngleDeg = ((index + 1) * degreesPerSlice) - 90;
        // Create polygon points for the section arc
        const points: string[] = [];
        points.push('50% 50%'); // Center
        const steps = 20; // Smooth arc approximation
        for (let s = 0; s <= steps; s++) {
            const angle = (startAngleDeg + (endAngleDeg - startAngleDeg) * (s / steps)) * (Math.PI / 180);
            const px = 50 + 50 * Math.cos(angle);
            const py = 50 + 50 * Math.sin(angle);
            points.push(`${px}% ${py}%`);
        }
        return `polygon(${points.join(', ')})`;
    };

    return (
        <div ref={containerRef} style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'visible',
            // FIX 5: Pass through layer background styles
            backgroundColor: layer.style?.backgroundColor || undefined,
            backgroundImage: layer.style?.backgroundImage ? `url(${layer.style.backgroundImage})` : undefined,
            backgroundSize: layer.style?.backgroundSize || 'cover',
            backgroundPosition: layer.style?.backgroundPosition || 'center',
            backgroundRepeat: 'no-repeat',
            // FIX 6: Pass through spacing
            padding: typeof layer.style?.padding === 'number' ? layer.style.padding : undefined,
            gap: typeof layer.style?.gap === 'number' ? layer.style.gap : undefined,
        }}>
            {/* FIX 3: Confetti Layer */}
            {showConfetti && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 20,
                    overflow: 'hidden',
                }}>
                    {confettiPieces.map(piece => (
                        <div
                            key={piece.id}
                            style={{
                                position: 'absolute',
                                left: `${piece.x}%`,
                                top: `${piece.y}%`,
                                width: piece.size,
                                height: piece.size * (content.confettiImage ? 1 : 0.6),
                                backgroundColor: content.confettiImage ? undefined : piece.color,
                                backgroundImage: content.confettiImage ? `url(${content.confettiImage})` : undefined,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                borderRadius: content.confettiImage ? 2 : '2px',
                                animation: `stw-confetti-fall ${1.5 + Math.random() * 1.5}s ease-in forwards`,
                                animationDelay: `${piece.delay}s`,
                                transform: `rotate(${Math.random() * 360}deg)`,
                            }}
                        />
                    ))}
                    <style>{`
                        @keyframes stw-confetti-fall {
                            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                            25% { opacity: 1; }
                            100% { transform: translateY(${containerSize.height + 50}px) rotate(${360 + Math.random() * 720}deg); opacity: 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* Animation keyframes for children */}
            <style>{`
                @keyframes stw-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes stw-pop-in { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>

            {/* Wheel Container */}
            <div style={{ position: 'relative', width: diameter, height: diameter }}>

                {/* Rotating Wheel Wrapper */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    transition: isSpinning ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
                    transform: `rotate(${rotation}deg)`,
                }}>
                    {/* Mode 1: Custom Wheel Image */}
                    {wheelImage ? (
                        <img
                            src={wheelImage}
                            alt="Spin Wheel"
                            referrerPolicy="no-referrer"
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
                            }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        /* Mode 2: SVG Wheel */
                        <svg
                            viewBox={`-10 -10 ${svgBaseDiameter + 20} ${svgBaseDiameter + 20}`}
                            width="100%"
                            height="100%"
                            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
                        >
                            {/* Defs for section clip paths */}
                            <defs>
                                {Array.from({ length: sliceCount }).map((_, i) => {
                                    const startAngle = i * anglePerSlice - Math.PI / 2;
                                    const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
                                    return (
                                        <clipPath key={`clip-${i}`} id={`section-clip-${layer.id}-${i}`}>
                                            <path d={describeArc(startAngle, endAngle, svgRadius)} />
                                        </clipPath>
                                    );
                                })}
                            </defs>

                            {/* Outer ring */}
                            <circle
                                cx={svgCx}
                                cy={svgCy}
                                r={svgRadius + 4}
                                fill="none"
                                stroke={content.accentColor || '#1F2937'}
                                strokeWidth={8}
                            />

                            {/* Sections */}
                            {Array.from({ length: sliceCount }).map((_, i) => {
                                const startAngle = i * anglePerSlice - Math.PI / 2;
                                const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
                                const midAngle = (startAngle + endAngle) / 2;
                                const sec = sections[i];
                                const color = sec?.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
                                const name = sec?.name || `Section ${i + 1}`;

                                const textR = svgRadius * 0.62;
                                const textX = svgCx + textR * Math.cos(midAngle);
                                const textY = svgCy + textR * Math.sin(midAngle);
                                const textRotation = (midAngle * 180) / Math.PI + 90;

                                return (
                                    <g key={i}>
                                        {/* Section arc fill */}
                                        <path
                                            d={describeArc(startAngle, endAngle, svgRadius)}
                                            fill={color}
                                            stroke="rgba(255,255,255,0.3)"
                                            strokeWidth={1.5}
                                        />

                                        {/* FIX 4: Section image covers entire arc */}
                                        {sec?.image && (
                                            <image
                                                href={sec.image}
                                                x={svgCx - svgRadius}
                                                y={svgCy - svgRadius}
                                                width={svgRadius * 2}
                                                height={svgRadius * 2}
                                                preserveAspectRatio="xMidYMid slice"
                                                clipPath={`url(#section-clip-${layer.id}-${i})`}
                                            />
                                        )}

                                        {/* Section label (on top of image) */}
                                        <text
                                            x={textX}
                                            y={textY}
                                            fill={content.textColor || '#FFFFFF'}
                                            fontSize={Math.max(8, Math.min(14, svgRadius / sliceCount * 1.2))}
                                            fontWeight={600}
                                            fontFamily="Inter, system-ui, sans-serif"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                                            style={{
                                                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            {name.length > 12 ? name.slice(0, 11) + '…' : name}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Center circle */}
                            <circle
                                cx={svgCx}
                                cy={svgCy}
                                r={svgInnerRadius}
                                fill={content.accentColor || '#1F2937'}
                                stroke="white"
                                strokeWidth={3}
                            />

                            {/* Decorative dots */}
                            {Array.from({ length: sliceCount }).map((_, i) => {
                                const angle = i * anglePerSlice - Math.PI / 2;
                                const dotX = svgCx + (svgRadius + 4) * Math.cos(angle);
                                const dotY = svgCy + (svgRadius + 4) * Math.sin(angle);
                                return (
                                    <circle
                                        key={`dot-${i}`}
                                        cx={dotX}
                                        cy={dotY}
                                        r={3}
                                        fill="white"
                                    />
                                );
                            })}
                        </svg>
                    )}
                </div>

                {/* Spin Button — center overlay (does NOT rotate) */}
                <div
                    style={{
                        position: 'absolute',
                        top: `calc(50% + ${content.spinButtonOffsetY ?? 0}px)`,
                        left: `calc(50% + ${content.spinButtonOffsetX ?? 0}px)`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5,
                        cursor: isInteractive && !isSpinning && spinsLeft > 0 ? 'pointer' : 'default',
                    }}
                    onClick={handleSpinClick}
                >
                    {content.spinButtonImage ? (
                        <img
                            src={content.spinButtonImage}
                            alt="Spin Button"
                            referrerPolicy="no-referrer"
                            style={{
                                width: innerRadius * 3,
                                height: innerRadius * 3,
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))',
                                opacity: 1,
                            }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    ) : (
                        <div style={{
                            width: innerRadius * 2.5,
                            height: innerRadius * 2.5,
                            borderRadius: '50%',
                            backgroundColor: content.accentColor || '#1F2937',
                            border: '3px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            opacity: 1,
                            transition: 'transform 0.15s',
                        }}>
                            <span style={{
                                color: 'white',
                                fontSize: innerRadius * 0.5,
                                fontWeight: 700,
                                fontFamily: 'Inter, system-ui, sans-serif',
                                letterSpacing: 1,
                            }}>
                                SPIN
                            </span>
                        </div>
                    )}
                </div>

                {/* Pointer / Indicator (does NOT rotate) */}
                <div style={{
                    position: 'absolute',
                    top: -pointerSize * 0.3 + (content.pointerOffsetY ?? 0),
                    left: `calc(50% + ${content.pointerOffsetX ?? 0}px)`,
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}>
                    {pointerImage ? (
                        <img
                            src={pointerImage}
                            alt="Pointer"
                            referrerPolicy="no-referrer"
                            style={{
                                width: pointerSize * 1.5,
                                height: pointerSize * 1.5,
                                objectFit: 'contain',
                            }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    ) : (
                        <svg
                            width={pointerSize * 1.5}
                            height={pointerSize * 1.5}
                            viewBox="0 0 40 40"
                        >
                            <polygon
                                points="20,38 6,6 34,6"
                                fill={content.accentColor || '#1F2937'}
                                stroke="white"
                                strokeWidth={2}
                            />
                        </svg>
                    )}
                </div>
            </div>




            {/* Empty state message */}
            {sections.length === 0 && !wheelImage && (
                <p style={{
                    marginTop: 12,
                    fontSize: 11,
                    color: '#9CA3AF',
                    textAlign: 'center',
                    fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                    Add sections in the <span style={{ color: '#6366F1', fontWeight: 600 }}>Rewards</span> tab
                </p>
            )}

            {/* Child layers: Congrats, Better Luck (overlays), and Spins Counter (always visible) */}
            {renderChild && layers.length > 0 && (() => {
                const childLayers = layers.filter(l => l.parent === layer.id);

                return childLayers.map(child => {
                    const childName = (child.name || '').toLowerCase();
                    const isCongrats = childName.includes('congrats');
                    const isBetterLuck = childName.includes('better luck') || childName.includes('betterluck');
                    const isOverlayChild = isCongrats || isBetterLuck;

                    // Non-overlay children (e.g. Spins Counter button) — always render
                    if (!isOverlayChild) {
                        return (
                            <React.Fragment key={child.id}>
                                {renderChild(child)}
                            </React.Fragment>
                        );
                    }

                    // Overlay children (Congrats / Better Luck)
                    const isChildSelected = selectedLayerId === child.id;
                    const hasSelectedDescendant = layers.some(l => l.parent === child.id && selectedLayerId === l.id);
                    const showInDesign = !isInteractive && (isChildSelected || hasSelectedDescendant);
                    const showInPreview = isInteractive && (
                        (isCongrats && showResult === 'congrats') ||
                        (isBetterLuck && showResult === 'betterLuck')
                    );

                    if (!showInDesign && !showInPreview) return null;

                    return (
                        <div
                            key={child.id}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 30,
                                backgroundColor: 'transparent',
                                animation: showInPreview ? 'stw-fade-in 0.3s ease-out' : undefined,
                            }}
                        >
                            {renderChild(child)}
                        </div>
                    );
                });
            })()}
        </div>
    );
};
