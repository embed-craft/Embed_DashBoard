import React from 'react';
import { FloaterRenderer } from './FloaterRenderer';

interface BannerRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    colors: any;
    config?: any;
    onConfigChange?: (config: any) => void;
    onDismiss?: () => void;
    isInteractive?: boolean;
    onNavigate?: (screenName: string) => void;
    scale?: number;
    scaleY?: number;
    onInterfaceAction?: (interfaceId: string) => void;
}

export const BannerRenderer: React.FC<BannerRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    onLayerUpdate,
    colors,
    config,
    onDismiss,
    isInteractive = false,
    onNavigate,
    onInterfaceAction,
    scale = 1,
    scaleY = 1
}) => {
    const position = config?.position || 'top';
    const isTop = position === 'top';

    const safeScale = (val: string | number | undefined, scaleFactor: number): string | undefined => {
        if (val === undefined || val === null) return undefined;
        if (typeof val === 'number') return `${val * scaleFactor}px`;
        if (typeof val === 'string') {
            if (val.endsWith('%')) return val; 
            if (val.endsWith('px')) {
                const num = parseFloat(val);
                if (!isNaN(num)) return `${num * scaleFactor}px`;
            }
            const parsed = parseFloat(val);
            if (!isNaN(parsed)) return `${parsed * scaleFactor}px`;
        }
        return val;
    };

    const bannerConfig = React.useMemo(() => {
        const modifiedConfig = { ...config };
        
        modifiedConfig.position = isTop ? 'top-center' : 'bottom-center';
        modifiedConfig.offsetX = 0;
        modifiedConfig.offsetY = 0;
        modifiedConfig.draggable = false;
        modifiedConfig.expanded = false;

        modifiedConfig.width = modifiedConfig.width || '100%';

        modifiedConfig.borderRadius = 0;
        modifiedConfig.backgroundColor = 'transparent';
        modifiedConfig.backgroundImageUrl = ''; 
        modifiedConfig.borderWidth = 0;
        modifiedConfig.shadow = { enabled: false };

        modifiedConfig.behavior = {
            ...(modifiedConfig.behavior || {}),
            draggable: false,
            snapToCorner: false,
            doubleTapToDismiss: false,
        };

        modifiedConfig.controls = {
            ...(modifiedConfig.controls || {}),
            closeButton: {
                show: modifiedConfig.controls?.closeButton?.show ?? modifiedConfig.showCloseButton ?? false,
                position: 'top-right',
                size: 14
            },
            expandButton: { show: false },
            muteButton: { show: false },
            progressBar: { show: false },
        };

        modifiedConfig.media = modifiedConfig.media || { url: '', type: 'none' };
        modifiedConfig.overflow = config?.overflow || 'hidden';
        modifiedConfig.overlay = { enabled: false };

        return modifiedConfig;
    }, [config, isTop]);

    const radiusValue = config?.borderRadius;
    let radiusPx = 0;
    if (typeof radiusValue === 'number') {
        radiusPx = radiusValue;
    } else if (typeof radiusValue === 'object' && radiusValue !== null) {
        const values = Object.values(radiusValue).filter(v => typeof v === 'number') as number[];
        if (values.length > 0) radiusPx = Math.max(...values);
    }

    const borderWidth = config?.borderWidth || 0;
    const borderColor = config?.borderColor || '#000000';
    const borderStyle = config?.borderStyle || 'solid';

    const outerWrapperStyle: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isTop ? 'flex-start' : 'flex-end',
        pointerEvents: 'none',
        zIndex: 10
    };

    const shadow = config?.shadow;
    const boxShadow = (shadow?.enabled)
        ? `0px ${isTop ? 4 * scale : -4 * scale}px ${(shadow.blur || 12) * scale}px ${(shadow.spread || 0) * scale}px ${shadow.color || 'rgba(0,0,0,0.2)'}`
        : undefined;

    return (
        <div style={outerWrapperStyle}>
            {config?.overlay?.enabled && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: config.overlay.color || '#000000',
                        opacity: config.overlay.opacity ?? 0.5,
                        backdropFilter: config.overlay.blur ? `blur(${config.overlay.blur * scale}px)` : undefined,
                        pointerEvents: 'auto',
                        zIndex: 0
                    }}
                    onClick={() => {
                        const shouldDismiss = config.overlay.dismissOnClick ?? true;
                        if (shouldDismiss && onDismiss) onDismiss();
                    }}
                />
            )}

            <div style={{
                pointerEvents: 'auto',
                width: safeScale(config?.width, scale) || '100%',
                height: safeScale(config?.height, scaleY) || 'auto',
                maxHeight: '100%',
                position: 'relative',
                backgroundColor: (config?.backgroundColor === 'transparent' || config?.backgroundColor === '#00000000')
                    ? 'transparent'
                    : (config?.backgroundColor || '#FFFFFF'),
                backgroundImage: config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                backgroundSize: config?.backgroundSize === 'fill' ? '100% 100%' : (config?.backgroundSize || 'cover'),
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',

                borderTopLeftRadius: !isTop ? `${radiusPx * scale}px` : undefined,
                borderTopRightRadius: !isTop ? `${radiusPx * scale}px` : undefined,
                borderBottomLeftRadius: isTop ? `${radiusPx * scale}px` : undefined,
                borderBottomRightRadius: isTop ? `${radiusPx * scale}px` : undefined,

                borderTop: (!isTop && borderWidth > 0) ? `${borderWidth * scale}px ${borderStyle} ${borderColor}` : undefined,
                borderBottom: (isTop && borderWidth > 0) ? `${borderWidth * scale}px ${borderStyle} ${borderColor}` : undefined,
                borderLeft: borderWidth > 0 ? `${borderWidth * scale}px ${borderStyle} ${borderColor}` : undefined,
                borderRight: borderWidth > 0 ? `${borderWidth * scale}px ${borderStyle} ${borderColor}` : undefined,

                boxShadow: boxShadow,
                overflow: config?.overflow === 'scroll' ? 'auto' : 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',

                paddingTop: isTop ? 'env(safe-area-inset-top)' : '0px',
                paddingBottom: !isTop ? 'env(safe-area-inset-bottom)' : '0px',
                zIndex: 1
            }}>
                <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0 }}>
                    <FloaterRenderer
                        layers={layers}
                        selectedLayerId={selectedLayerId}
                        onLayerSelect={onLayerSelect}
                        onLayerUpdate={onLayerUpdate}
                        colors={colors}
                        config={{
                            ...bannerConfig,
                            height: '100%',
                            overflow: config?.overflow || 'hidden'
                        }}
                        isInteractive={isInteractive}
                        onDismiss={onDismiss}
                        onNavigate={onNavigate}
                        onInterfaceAction={onInterfaceAction}
                        scale={scale}
                        scaleY={scaleY}
                    />
                </div>
            </div>
        </div>
    );
};
