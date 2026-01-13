import React from 'react';
import { Layer } from '@/store/useEditorStore';
import { Check, ArrowRight, ArrowLeft, Play, Search, Home, X, Download, Upload, User, Settings } from 'lucide-react';

interface ButtonRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
    onClick?: () => void;
}

export const ButtonRenderer: React.FC<ButtonRendererProps> = ({ layer, scale = 1, scaleY = 1, onClick }) => {
    // SDK Parity: Safe Scale Helper
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const adjustColorBrightness = (color: string, percent: number) => {
        if (!color) return '#000000';
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const B = ((num >> 8) & 0x00ff) + amt;
        const G = (num & 0x0000ff) + amt;
        return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 + (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1);
    };

    const label = layer.content?.label || 'Button';
    const variant = layer.content?.buttonVariant || 'primary';
    // FIX: Prioritize style.backgroundColor defined by Editor
    const themeColor = layer.style?.backgroundColor || layer.content?.themeColor || '#6366F1';
    const textColor = layer.content?.textColor || '#FFFFFF';
    const fontSize = layer.content?.fontSize || 14;
    // FIX: ButtonEditor saves fontWeight to content.fontWeight, not style
    const fontWeight = layer.content?.fontWeight || layer.style?.fontWeight || 'medium';
    const borderRadius = layer.style?.borderRadius || 8;
    const iconName = layer.content?.buttonIcon;
    const iconPosition = layer.content?.buttonIconPosition || 'right';

    // SDK PARITY: Load Google Font if fontUrl is provided
    const fontUrl = layer.content?.fontUrl;
    const fontFamily = layer.content?.fontFamily || layer.style?.fontFamily;

    React.useEffect(() => {
        if (fontUrl && fontFamily) {
            // Check if font link already exists
            const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = fontUrl;
                document.head.appendChild(link);
            }
        }
    }, [fontUrl, fontFamily]);

    // Icon mapping
    const icons: Record<string, React.ReactNode> = {
        ArrowRight: <ArrowRight size={16} />,
        ArrowLeft: <ArrowLeft size={16} />,
        Play: <Play size={16} fill="currentColor" />,
        Search: <Search size={16} />,
        Home: <Home size={16} />,
        Check: <Check size={16} />,
        X: <X size={16} />,
        Download: <Download size={16} />,
        Upload: <Upload size={16} />,
        User: <User size={16} />,
        Settings: <Settings size={16} />,
    };

    const icon = iconName ? icons[iconName] : null;

    const baseStyle: React.CSSProperties = {
        // FIX: Default padding to 0, use scaleY for vertical padding (Parity with SDK/Input)
        padding: (() => {
            // Priority: Granular > Vertical/Horizontal > Single Padding > Default 12/10
            const pTop = layer.style?.paddingTop ?? layer.style?.paddingVertical ?? (layer.style?.padding != null ? layer.style.padding : 10);
            const pRight = layer.style?.paddingRight ?? layer.style?.paddingHorizontal ?? (layer.style?.padding != null ? layer.style.padding : 12);
            const pBottom = layer.style?.paddingBottom ?? layer.style?.paddingVertical ?? (layer.style?.padding != null ? layer.style.padding : 10);
            const pLeft = layer.style?.paddingLeft ?? layer.style?.paddingHorizontal ?? (layer.style?.padding != null ? layer.style.padding : 12);

            return `${safeScale(pTop, scaleY)} ${safeScale(pRight, scale)} ${safeScale(pBottom, scaleY)} ${safeScale(pLeft, scale)}`;
        })(),
        borderRadius: safeScale(borderRadius, scale),
        // FIX: Default slightly better logic for borderStyle if width > 0
        borderWidth: safeScale(layer.style?.borderWidth ?? 0, scale),
        borderStyle: layer.style?.borderStyle || (typeof layer.style?.borderWidth === 'number' && layer.style.borderWidth > 0 ? 'solid' : 'none'),
        // FIX: Default to themeColor for outline variant if no specific color is set, otherwise transparent
        borderColor: layer.style?.borderColor || (variant === 'outline' ? themeColor : 'transparent'),
        fontSize: safeScale(fontSize, scale),
        fontWeight,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexDirection: iconPosition === 'left' ? 'row-reverse' : 'row',
        width: '100%',
        height: '100%',
        fontFamily: layer.content?.fontFamily || layer.style?.fontFamily || 'inherit',
        lineHeight: 1,
        textAlign: 'center' as const,
        verticalAlign: 'middle',
        margin: 0,
        backgroundColor: themeColor, // Use theme/bg color
        color: textColor,
        outline: 'none',
        boxSizing: 'border-box', // Critical for padding/border to work with 100% width
    };

    let variantStyle: React.CSSProperties = {};

    switch (variant) {
        case 'primary':
            // Explicitly set bg if defined, else defaults are fine
            break;
        case 'secondary':
            variantStyle = {
                backgroundColor: `${themeColor}20`,
                color: themeColor,
            };
            break;
        case 'outline':
            variantStyle = {
                backgroundColor: 'transparent',
                // We use baseStyle properties for border now to allow overrides
                // border: `2px solid ${themeColor}`, 
                color: themeColor,
            };
            // Note: We don't use the 'border' shorthand here anymore because it conflicts with granular overrides.
            // baseStyle handles the defaults for outline (width/color) via the fallbacks above?
            // Wait, baseStyle borderWidth defaults to 0. 
            // We need to FORCE borderWidth to 2 for outline if undefined.
            if (layer.style?.borderWidth === undefined) {
                baseStyle.borderWidth = safeScale(2, scale);
                baseStyle.borderStyle = 'solid';
            }
            // And color is handled by baseStyle borderColor fallback.
            break;
        case 'ghost':
            variantStyle = {
                backgroundColor: 'transparent',
                color: themeColor,
            };
            if (layer.style?.backgroundColor !== undefined) delete (variantStyle as any).backgroundColor;
            break;
    }

    // Merge styles
    const finalStyle = {
        ...baseStyle,
        ...variantStyle,
        // Ensure manual overrides persist
        ...(layer.style?.backgroundColor ? { backgroundColor: layer.style.backgroundColor } : {}),
        ...(layer.style?.borderColor ? { borderColor: layer.style.borderColor } : {}),
        ...(layer.style?.borderWidth !== undefined ? { borderWidth: safeScale(layer.style.borderWidth, scale) } : {}),
        ...(layer.style?.borderStyle ? { borderStyle: layer.style.borderStyle } : {}),
        // Add shadow support
        ...(layer.style?.shadowEnabled ? {
            boxShadow: `${safeScale(0, scale)} ${safeScale(layer.style.shadowOffsetY || 4, scale)} ${safeScale(layer.style.shadowBlur || 0, scale)} ${safeScale(layer.style.shadowSpread || 0, scale)} ${layer.style.shadowColor || '#000000'}`
        } : {}),
    };


    return (
        <button style={finalStyle} onClick={onClick}>
            {/* Text Label */}
            <span style={{
                display: 'inline-block', // Required for transform
                transform: `translate(${safeScale(layer.style?.textOffsetX || 0, scale)}, ${safeScale(layer.style?.textOffsetY || 0, scale)})`
            }}>
                {label}
            </span>

            {/* Icon */}
            {icon && (
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    transform: `translate(${safeScale(layer.style?.iconOffsetX || 0, scale)}, ${safeScale(layer.style?.iconOffsetY || 0, scale)})`
                }}>
                    {icon}
                </span>
            )}
        </button>
    );
};
