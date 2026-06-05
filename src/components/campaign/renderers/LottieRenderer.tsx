import React, { useEffect, useRef, useState } from 'react';
import { Layer } from '@/store/useEditorStore';
import lottie, { AnimationItem } from 'lottie-web';
import { useGridElementData } from '@/components/campaign/renderers/GridElementContext';

interface LottieRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
    isActive?: boolean;
}

export const LottieRenderer: React.FC<LottieRendererProps> = ({ layer, scale = 1, scaleY = 1, isActive = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<AnimationItem | null>(null);
    const [animAspectRatio, setAnimAspectRatio] = useState<string | undefined>(undefined);

    // SDK Parity: Safe Scale Helper (same as MediaRenderer)
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const hasExplicitWidth = layer.style?.width || layer.size?.width;
    const hasExplicitHeight = layer.style?.height || layer.size?.height;

    // Grid Data Binding: resolve mapped_key for dynamic lottie URL
    const { dataItem } = useGridElementData();
    let lottieUrl = layer.content?.lottieUrl || '';
    
    if (dataItem && layer.content?.mapped_key) {
        const paths = layer.content.mapped_key.split('.');
        let value: any = dataItem;
        for (const p of paths) {
            if (value && typeof value === 'object') value = value[p];
            else { value = null; break; }
        }
        if (value != null) lottieUrl = String(value);
    }

    const objectFit = layer.style?.objectFit || 'contain';

    // Convert objectFit to SVG preserveAspectRatio
    let preserveAspectRatio = 'xMidYMid meet'; // contain
    if (objectFit === 'cover') {
        preserveAspectRatio = 'xMidYMid slice';
    } else if (objectFit === 'fill') {
        preserveAspectRatio = 'none';
    }

    // Core lottie-web integration
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current || (!lottieUrl && !layer.content?.lottieJson)) return;

        let isCancelled = false;

        const loadAnim = async () => {
            // Clean up previous instance
            if (animRef.current) {
                animRef.current.destroy();
                animRef.current = null;
            }
            setLoadError(null);

            try {
                let animationData = null;

                // 1. Handle JSON data directly
                if (layer.content?.lottieJson) {
                    try {
                        animationData = typeof layer.content.lottieJson === 'string'
                            ? JSON.parse(layer.content.lottieJson)
                            : layer.content.lottieJson;
                    } catch (e) {
                        console.error("Invalid Lottie JSON");
                        setLoadError("Invalid Lottie JSON data");
                        return;
                    }
                } 
                // 2. Handle URL - manual fetch with proxy fallback
                else if (lottieUrl) {
                    try {
                        let response = await fetch(lottieUrl);
                        
                        // If direct fetch fails (likely CORS), try proxy
                        if (!response.ok || response.type === 'error') {
                            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(lottieUrl)}`;
                            const proxyRes = await fetch(proxyUrl);
                            const data = await proxyRes.json();
                            if (data.contents) {
                                animationData = typeof data.contents === 'string' 
                                    ? JSON.parse(data.contents) 
                                    : data.contents;
                            } else {
                                throw new Error("Proxy failed to return content");
                            }
                        } else {
                            animationData = await response.json();
                        }
                    } catch (e: any) {
                        console.error("Lottie fetch error:", e);
                        
                        // Last ditch effort: try proxy directly if fetch threw TypeError (common for CORS)
                        if (e.name === 'TypeError') {
                            try {
                                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(lottieUrl)}`;
                                const proxyRes = await fetch(proxyUrl);
                                animationData = await proxyRes.json();
                            } catch (proxyError) {
                                console.error("Lottie proxy error:", proxyError);
                            }
                        }

                        if (!animationData) {
                            setLoadError("CORS Blocked: The server hosting this Lottie file does not allow direct access. Try pasting the JSON data instead.");
                            return;
                        }
                    }
                }

                if (isCancelled || !animationData) return;

                const anim = lottie.loadAnimation({
                    container: containerRef.current!,
                    renderer: 'svg',
                    loop: layer.content?.loop ?? true,
                    autoplay: layer.content?.autoPlay ?? true,
                    animationData: animationData,
                    rendererSettings: {
                        preserveAspectRatio: preserveAspectRatio,
                    }
                });

                animRef.current = anim;
                anim.setSpeed(layer.content?.speed ?? 1);

                anim.addEventListener('DOMLoaded', () => {
                    if (isCancelled || !containerRef.current) return;

                    const animData = (anim as any).animationData;
                    if (animData?.w && animData?.h) {
                        setAnimAspectRatio(`${animData.w} / ${animData.h}`);
                    }

                    const svg = containerRef.current.querySelector('svg');
                    if (svg) {
                        svg.setAttribute('preserveAspectRatio', preserveAspectRatio);
                        svg.style.width = '100%';
                        svg.style.height = '100%';
                        svg.style.display = 'block';
                    }
                    anim.resize();
                });

                // ResizeObserver
                const resizeObserver = new ResizeObserver(() => {
                    if (animRef.current) {
                        animRef.current.resize();
                    }
                });
                resizeObserver.observe(containerRef.current);
                (anim as any)._resizeObserver = resizeObserver;

            } catch (error) {
                console.error('Error initializing lottie:', error);
                setLoadError("Initialization failed");
            }
        };

        loadAnim();

        return () => {
            isCancelled = true;
            if (animRef.current) {
                if ((animRef.current as any)._resizeObserver) {
                    (animRef.current as any)._resizeObserver.disconnect();
                }
                animRef.current.destroy();
                animRef.current = null;
            }
        };
    }, [lottieUrl, layer.content?.lottieJson, preserveAspectRatio, layer.content?.loop, layer.content?.autoPlay, layer.content?.speed]);

    // Playback controls based on active state (useful if in a carousel)
    useEffect(() => {
        if (!animRef.current) return;
        const autoPlay = layer.content?.autoPlay ?? true;
        if (isActive && autoPlay) {
            animRef.current.play();
        } else if (!isActive) {
            animRef.current.pause();
        }
    }, [isActive, layer.content?.autoPlay]);

    if (!lottieUrl && !layer.content?.lottieJson) {
        return (
            <div
                style={{
                    width: hasExplicitWidth ? '100%' : 100,
                    height: hasExplicitHeight ? '100%' : 100,
                    backgroundColor: '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                        ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                        : safeScale(layer.style?.borderRadius || 0, scale),
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x1="7" y1="2" x2="7" y2="22"></line>
                    <line x1="17" y1="2" x2="17" y2="22"></line>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                </svg>
            </div>
        );
    }

    // Container always fills parent at 100%. When one parent dimension is "auto" (undefined),
    // the CSS aspect-ratio (set in DOMLoaded from animation data) computes the missing dimension.
    // SVG inside always fills 100% of this container. This is fight-proof against lottie-web's
    // resize() which continuously re-applies fixed pixel attrs on the SVG.
    return (
        <div
            ref={containerRef}
            draggable={false}
            style={{
                width: hasExplicitWidth ? '100%' : 'auto',
                height: hasExplicitHeight ? '100%' : 'auto',
                display: 'block',
                userSelect: 'none',
                overflow: 'hidden',
                opacity: layer.style?.opacity ?? 1,
                borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                    ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                    : safeScale(layer.style?.borderRadius || 0, scale),
                aspectRatio: (!hasExplicitWidth || !hasExplicitHeight) ? (animAspectRatio || layer.style?.aspectRatio) : layer.style?.aspectRatio,
                filter: typeof layer.style?.filter === 'object'
                    ? [
                        layer.style.filter.blur ? `blur(${safeScale(layer.style.filter.blur, scale)})` : '',
                        layer.style.filter.brightness ? `brightness(${layer.style.filter.brightness}%)` : '',
                        layer.style.filter.contrast ? `contrast(${layer.style.filter.contrast}%)` : '',
                        layer.style.filter.grayscale ? `grayscale(${layer.style.filter.grayscale}%)` : ''
                    ].filter(Boolean).join(' ')
                    : layer.style?.filter,
                boxShadow: layer.style?.shadowEnabled
                    ? `${safeScale(0, scale)} ${safeScale(layer.style.shadowOffsetY || 4, scale)} ${safeScale(layer.style.shadowBlur || 0, scale)} ${safeScale(layer.style.shadowSpread || 0, scale)} ${layer.style.shadowColor || '#000000'}`
                    : layer.style?.boxShadow,
                position: 'relative',
            }}
        >
            {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-500 p-4 text-center z-10">
                    <span className="text-lg mb-2">⚠️</span>
                    <p className="text-[10px] font-medium leading-tight">{loadError}</p>
                </div>
            )}
        </div>
    );
};
