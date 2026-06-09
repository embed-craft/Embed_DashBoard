import React from 'react';
import { Layer } from '@/store/useEditorStore';
import { getYouTubeId } from '@/lib/utils';
import { useGridElementData } from '@/components/campaign/renderers/GridElementContext';

interface MediaRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
    muted?: boolean;
    isActive?: boolean;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({ layer, scale = 1, scaleY = 1, muted = true, isActive = false }) => {
    // SDK Parity: Safe Scale Helper
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    // Determine if layer has explicit dimensions or should auto-fit
    const hasExplicitWidth = layer.style?.width || layer.size?.width;
    const hasExplicitHeight = layer.style?.height || layer.size?.height;

    // FIX: Render Grey Box Placeholder if URL is empty (Parity with Flutter)
    if (!layer.content?.imageUrl) {
        return (
            <div
                style={{
                    width: hasExplicitWidth ? '100%' : 100,
                    height: hasExplicitHeight ? '100%' : 100,
                    backgroundColor: '#E5E7EB', // grey-200
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                        ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                        : safeScale(layer.style?.borderRadius || 0, scale),
                }}
            >
                {/* Simple broken image representation */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                    <line x1="3" y1="3" x2="21" y2="21" />
                </svg>
            </div>
        );
    }

    // Grid Data Binding: resolve mapped_key for dynamic image URL
    const { dataItem } = useGridElementData();
    let imageUrl = layer.content?.imageUrl || '';
    
    if (dataItem && layer.content?.mapped_key) {
        const paths = layer.content.mapped_key.split('.');
        let value: any = dataItem;
        for (const p of paths) {
            if (value && typeof value === 'object') value = value[p];
            else { value = null; break; }
        }
        if (value != null) imageUrl = String(value);
    }

    const youtubeId = getYouTubeId(imageUrl);
    const isVideo = imageUrl.toLowerCase().match(/\.(mp4|webm|ogg)$/);

    if (youtubeId) {
        return (
            <div
                style={{
                    width: hasExplicitWidth ? '100%' : 'auto',
                    height: hasExplicitHeight ? '100%' : 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block',
                    overflow: 'hidden',
                    borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                        ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                        : safeScale(layer.style?.borderRadius || 0, scale),
                    opacity: layer.style?.opacity ?? 1,
                }}
            >
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isActive ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&enablejsapi=1`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                        pointerEvents: 'none', // Prevent interaction if in background or just meant for display
                        objectFit: layer.style?.objectFit || 'cover',
                        width: '100%',
                        height: '100%',
                    }}
                />
            </div>
        );
    }

    if (isVideo) {
        return (
            <video
                key={isActive ? 'playing' : 'paused'}
                src={layer.content?.imageUrl}
                autoPlay={isActive}
                muted={muted}
                loop
                playsInline
                controls={false}
                style={{
                    width: hasExplicitWidth ? '100%' : 'auto',
                    height: hasExplicitHeight ? '100%' : 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block',
                    opacity: layer.style?.opacity ?? 1,
                    borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                        ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                        : safeScale(layer.style?.borderRadius || 0, scale),
                    objectFit: layer.style?.objectFit || 'cover',
                }}
            />
        );
    }

    const cleanUrl = imageUrl.split('?')[0].toLowerCase();
    const isLottie = cleanUrl.endsWith('.json');
    const isRive = cleanUrl.endsWith('.riv');
    const isPdf = cleanUrl.endsWith('.pdf');
    const isCsv = cleanUrl.endsWith('.csv');
    const isTxt = cleanUrl.endsWith('.txt');

    if (isLottie || isRive || isPdf || isCsv || isTxt) {
        let extLabel = "DOC";
        if (isLottie) extLabel = "LOTTIE";
        else if (isRive) extLabel = "RIVE";
        else if (isPdf) extLabel = "PDF";
        else if (isCsv) extLabel = "CSV";
        else if (isTxt) extLabel = "TXT";

        return (
            <div
                style={{
                    width: hasExplicitWidth ? '100%' : 120,
                    height: hasExplicitHeight ? '100%' : 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                        ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                        : safeScale(layer.style?.borderRadius || 0, scale),
                    border: '1px solid #cbd5e1',
                    padding: '8px',
                    boxSizing: 'border-box',
                    gap: '4px',
                    color: '#475569',
                    fontFamily: 'sans-serif',
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                </svg>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>{extLabel} FILE</span>
                <span style={{ fontSize: '8px', color: '#94a3b8', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={imageUrl.split('/').pop()}>
                    {imageUrl.split('/').pop()?.split('?')[0]}
                </span>
            </div>
        );
    }

    return (
        <img
            src={layer.content?.imageUrl}
            alt={layer.name}
            draggable={false}
            style={{
                width: hasExplicitWidth ? '100%' : 'auto',
                height: hasExplicitHeight ? '100%' : 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
                userSelect: 'none',
                opacity: layer.style?.opacity ?? 1,
                borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                    ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                    : safeScale(layer.style?.borderRadius || 0, scale),
                borderWidth: safeScale(layer.style?.borderWidth || 0, scale),
                borderStyle: layer.style?.borderStyle || (layer.style?.borderWidth ? 'solid' : 'none'),
                borderColor: layer.style?.borderColor || 'transparent',
                objectFit: layer.style?.objectFit || 'contain',
                filter: typeof layer.style?.filter === 'object'
                    ? [
                        layer.style.filter.blur ? `blur(${safeScale(layer.style.filter.blur, scale)})` : '',
                        layer.style.filter.brightness ? `brightness(${layer.style.filter.brightness}%)` : '',
                        layer.style.filter.contrast ? `contrast(${layer.style.filter.contrast}%)` : '',
                        layer.style.filter.grayscale ? `grayscale(${layer.style.filter.grayscale}%)` : ''
                    ].filter(Boolean).join(' ')
                    : layer.style?.filter,
                aspectRatio: layer.style?.aspectRatio,
                boxShadow: layer.style?.shadowEnabled
                    ? `${safeScale(0, scale)} ${safeScale(layer.style.shadowOffsetY || 4, scale)} ${safeScale(layer.style.shadowBlur || 0, scale)} ${safeScale(layer.style.shadowSpread || 0, scale)} ${layer.style.shadowColor || '#000000'}`
                    : layer.style?.boxShadow,
            }}
        />
    );
};
