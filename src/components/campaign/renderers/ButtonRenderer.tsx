import React from 'react';
import { Layer } from '@/store/useEditorStore';
import { Check, ArrowRight, ArrowLeft, Play, Search, Home, X, Download, Upload, User, Settings } from 'lucide-react';

interface ButtonRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
}

export const ButtonRenderer: React.FC<ButtonRendererProps> = ({ layer, scale = 1, scaleY = 1 }) => {
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
    const fontWeight = layer.style?.fontWeight || '600';
    const borderRadius = layer.style?.borderRadius || 8;
    const iconName = layer.content?.buttonIcon;
    const iconPosition = layer.content?.buttonIconPosition || 'right';

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
        // FIX: Read padding from layer.style instead of hardcoded values (SDK parity)
        padding: `${safeScale(layer.style?.paddingTop ?? 10, scaleY)} ${safeScale(layer.style?.paddingRight ?? 20, scale)} ${safeScale(layer.style?.paddingBottom ?? 10, scaleY)} ${safeScale(layer.style?.paddingLeft ?? 20, scale)}`,
        borderRadius: 'inherit', // Parent wrapper handles radius
        fontSize: safeScale(fontSize, scale),
        fontWeight,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexDirection: iconPosition === 'left' ? 'row-reverse' : 'row',
        border: 'none',
        outline: 'none',
        width: '100%',
        height: '100%',
        fontFamily: layer.style?.fontFamily || 'inherit',
        lineHeight: 1.0,
        backgroundColor: 'transparent', // Wrapper handles background usually, but variant might override
        color: textColor
    };

    let variantStyle: React.CSSProperties = {};

    // Apply variants implies we might need to set internal background if wrapper doesn't handle it.
    // In BottomSheetRenderer, the wrapper gets the background for 'button' type.
    // HOWEVER, for variants like 'outline', 'ghost', etc., the background logic differs.
    // Ideally, the wrapper should be transparent and the button handles it, OR the wrapper handles it.
    // BottomSheetRenderer:
    // wrapper.style.backgroundColor = layer.style?.backgroundColor || themeColor
    // button.style.backgroundColor = 'transparent'

    // This means the Wrapper is the colored box.
    // The Button is just the text/icon container.

    // BUT what about 'outline' variant? Border is usually on the button?
    // Let's stick to the BottomSheet pattern: Wrapper = Box, Button = Content.
    // Wait, BottomSheetRenderer says:
    /*
       ...(layer.type === 'button' ? {
          backgroundColor: layer.style?.backgroundColor || layer.content.themeColor || '#6366f1'
       } : {})
    */
    // So the WRAPPER gets the color.
    // And the BUTTON has backgroundColor: 'transparent'.

    // So ButtonRenderer just renders the content?
    // No, ModalRenderer has complex logic for 'comic', '3d', etc. inside renderButton.
    // BottomSheetRenderer seemed simpler in the view I saw.

    // ModalRenderer logic was:
    /*
        switch (variant) {
              case 'primary':
                  variantStyle = {
                      backgroundColor: themeColor,
                      color: textColor,
                      boxShadow: ...
                  };
    */
    // So ModalRenderer applies styles to the BUTTON element, not just the wrapper?
    // Let's check ModalRenderer wrapper style.
    /*
       wrapper style includes:
       ...(layer.type === 'button' ? {
           backgroundColor: layer.style?.backgroundColor || layer.content.themeColor || '#6366f1'
       } : {})
    */
    // It seems ModalRenderer wrapper ALSO gets the color.
    // If the button ALSO gets the color, that's fine (nested).

    // To resolve this cleanly:
    // The ButtonRenderer should style the <button> element.
    // The parent (Renderer) should hopefully NOT double-apply the background if the child handles it.
    // Or, we assume standard 'primary' button relies on Wrapper background, and 'transparent' button background.

    // Let's include the full ModalRenderer variant logic for maximum fidelity.

    let content = (
        <>
            <span style={{ textAlign: 'center', width: '100%' }}>{label}</span>
            {icon && <span>{icon}</span>}
        </>
    );

    switch (variant) {
        case 'primary':
            // Standard solid button.
            // If wrapper has color, we can be transparent.
            variantStyle = {
                // backgroundColor: themeColor, // Handled by wrapper?
                color: textColor,
            };
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
                border: `2px solid ${themeColor}`,
                color: themeColor,
            };
            break;
        case 'ghost':
            variantStyle = {
                backgroundColor: 'transparent',
                color: themeColor,
            };
            break;
        // ... Add other variants as needed from ModalRenderer ...
        default:
            variantStyle = {
                color: textColor
            };
    }

    // Merge styles
    const finalStyle = {
        ...baseStyle,
        ...variantStyle,
        // Ensure font overrides
        fontSize: safeScale(layer.content?.fontSize || 14, scale),
        fontWeight: layer.style?.fontWeight || '600',
    };

    return (
        <button style={finalStyle}>
            {content}
        </button>
    );
};
