import React from 'react';

interface TooltipRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string) => void;
    colors: any;
    config?: any;
    onConfigChange?: (config: any) => void;
    targetElement?: {
        id: string;
        rect: { x: number; y: number; width: number; height: number };
        tagName: string;
    };
}

export const TooltipRenderer: React.FC<TooltipRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config = {},
    onConfigChange,
    targetElement
}) => {
    // Find the root container layer for the Tooltip
    const tooltipContainerLayer = layers.find(l => l.type === 'container' && l.name === 'Tooltip Container');

    const containerStyle = tooltipContainerLayer?.style || {};

    // Config defaults
    const position = config.position || 'bottom'; // top, bottom, left, right
    const backgroundColor = config.backgroundColor || '#1F2937';
    const borderRadius = config.borderRadius || 8;
    const padding = config.padding || 12;
    const arrowSize = config.arrowSize || 8;

    const renderLayer = (layer: any) => {
        const isSelected = selectedLayerId === layer.id;
        const style = layer.style || {};

        const selectionStyle = isSelected ? {
            outline: `2px solid ${colors.purple[500]}`,
            outlineOffset: '2px',
            zIndex: 10
        } : {};

        switch (layer.type) {
            case 'text':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            color: style.color || 'white',
                            fontSize: style.fontSize || '14px',
                            fontWeight: style.fontWeight,
                            textAlign: style.textAlign,
                        }}
                    >
                        {layer.content?.text || 'Tooltip Text'}
                    </div>
                );

            case 'image':
            case 'media':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            borderRadius: '4px'
                        }}
                    >
                        {layer.content?.imageUrl ? (
                            <img src={layer.content.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Tooltip media" />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Image</span>
                            </div>
                        )}
                    </div>
                );

            case 'button':
                return (
                    <button
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            border: 'none',
                            outline: 'none',
                        }}
                    >
                        {layer.content?.label || 'Button'}
                    </button>
                );

            case 'container':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            display: 'flex',
                            flexDirection: style.direction || 'column',
                            gap: style.gap ? `${style.gap}px` : '4px'
                        }}
                    >
                        {layer.children?.map((childId: string) => {
                            const child = layers.find(l => l.id === childId);
                            return child ? renderLayer(child) : null;
                        })}
                    </div>
                );

            default:
                return null;
        }
    };

    // Arrow Style Calculation
    const getArrowStyle = () => {
        const base = {
            position: 'absolute' as const,
            width: 0,
            height: 0,
            borderStyle: 'solid',
        };

        switch (position) {
            case 'top':
                return {
                    ...base,
                    bottom: `-${arrowSize}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
                    borderColor: `${backgroundColor} transparent transparent transparent`
                };
            case 'bottom':
                return {
                    ...base,
                    top: `-${arrowSize}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
                    borderColor: `transparent transparent ${backgroundColor} transparent`
                };
            case 'left':
                return {
                    ...base,
                    right: `-${arrowSize}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
                    borderColor: `transparent transparent transparent ${backgroundColor}`
                };
            case 'right':
                return {
                    ...base,
                    left: `-${arrowSize}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
                    borderColor: `transparent ${backgroundColor} transparent transparent`
                };
            default:
                return {};
        }
    };

    // --- RENDER ---

    const TooltipContent = (
        <div
            style={{
                backgroundColor: backgroundColor,
                borderRadius: `${borderRadius}px`,
                padding: `${padding}px`,
                position: 'relative',
                maxWidth: '250px',
                minWidth: '120px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                width: 'max-content',
                ...containerStyle,
                // Override container position if target provided, handled by wrapper
                ...(targetElement ? { position: 'relative', top: 'auto', left: 'auto', transform: 'none' } : {})
            }}
            onClick={(e) => {
                if (tooltipContainerLayer) {
                    e.stopPropagation();
                    onLayerSelect(tooltipContainerLayer.id);
                }
            }}
        >
            <div style={getArrowStyle()} />

            {tooltipContainerLayer?.children?.map((childId: string) => {
                const child = layers.find(l => l.id === childId);
                return child ? renderLayer(child) : null;
            })}

            {!tooltipContainerLayer && (
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    Tooltip Content
                </div>
            )}
        </div>
    );

    // Dynamic Positioning Logic
    if (targetElement) {
        const { x, y, width, height } = targetElement.rect;
        const gap = (arrowSize || 8) + 4; // Gap for arrow + spacing

        // Calculate wrapper position
        let wrapperStyle: React.CSSProperties = {
            position: 'absolute',
            zIndex: 50,
            pointerEvents: 'auto'
        };

        switch (position) {
            case 'top':
                wrapperStyle = { ...wrapperStyle, top: `${y - gap}px`, left: `${x + width / 2}px`, transform: 'translate(-50%, -100%)' };
                break;
            case 'bottom':
                wrapperStyle = { ...wrapperStyle, top: `${y + height + gap}px`, left: `${x + width / 2}px`, transform: 'translate(-50%, 0)' };
                break;
            case 'left':
                wrapperStyle = { ...wrapperStyle, top: `${y + height / 2}px`, left: `${x - gap}px`, transform: 'translate(-100%, -50%)' };
                break;
            case 'right':
                wrapperStyle = { ...wrapperStyle, top: `${y + height / 2}px`, left: `${x + width + gap}px`, transform: 'translate(0, -50%)' };
                break;
            // Configurable offsets support (optional, if config.offsetX/Y exist)
            case 'center-left': // Custom positions if needed map to nearest standard
            case 'center-right':
            default:
                wrapperStyle = { ...wrapperStyle, top: `${y + height + gap}px`, left: `${x + width / 2}px`, transform: 'translate(-50%, 0)' };
        }

        // Apply config offsets if they exist
        if (config.offsetX || config.offsetY) {
            // This would require more complex transform parsing, keeping it simple for now
            // Or adding marginLeft / marginTop
        }

        return (
            <>
                {/* Target Highlight */}
                <div style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    border: `2px dashed ${colors.primary[500]}`,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 40
                }} />

                {/* Tooltip Wrapper */}
                <div style={wrapperStyle}>
                    {TooltipContent}
                </div>
            </>
        );
    }

    // Fallback: Centered with Mock Anchors (for when no target is selected)
    const Anchor = () => (
        <div style={{
            width: '100px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6B7280', fontSize: '12px', border: '2px dashed #9CA3AF'
        }}>
            Target Element
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
            {position === 'bottom' && <Anchor />}
            {position === 'right' && <Anchor />}
            {TooltipContent}
            {position === 'top' && <Anchor />}
            {position === 'left' && <Anchor />}
        </div>
    );
};
