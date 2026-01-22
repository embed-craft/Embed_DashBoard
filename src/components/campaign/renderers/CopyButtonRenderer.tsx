import React from 'react';
import { Layer } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { Copy, Layout, FileText, Link as LinkIcon, Check } from 'lucide-react';

interface CopyButtonRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
    colors?: any; // strict typing if available
}

export const CopyButtonRenderer: React.FC<CopyButtonRendererProps> = ({
    layer,
    scale = 1,
    scaleY = 1,
    colors
}) => {
    // Helper for safe scaling
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        if (typeof val === 'string' && (val.endsWith('%') || val.endsWith('vh') || val.endsWith('vw'))) return val;
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const style = layer.style || {};
    const content = layer.content || {};

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (content.copyText) {
            navigator.clipboard.writeText(content.copyText)
                .then(() => {
                    if (content.showToast) {
                        toast.success(content.toastMessage || 'Copied to clipboard!');
                    }
                })
                .catch((err) => {
                    console.error('Failed to copy keys:', err);
                    toast.error('Failed to copy');
                });
        }
    };

    const triggerMode = content.copyTrigger || 'anywhere';

    return (
        <button
            onClick={triggerMode === 'anywhere' ? handleClick : undefined}
            style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
                // padding/margin handled below dynamically
                outline: 'none',
                cursor: triggerMode === 'anywhere' ? 'pointer' : 'default', // Only show pointer if whole button is clickable
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Text left, icon right
                gap: safeScale(8, scale),
                // Flatten style props that apply to the button itself
                backgroundColor: style.backgroundColor || 'transparent',
                borderRadius: safeScale(style.borderRadius ?? 6, scale),
                borderWidth: safeScale(style.borderWidth ?? 1, scale),
                borderColor: style.borderColor || '#D1D5DB',
                borderStyle: style.borderStyle || 'solid',
                // Apply shadow if any
                boxShadow: style.shadowEnabled
                    ? `${safeScale(0, scale)} ${safeScale(style.shadowOffsetY ?? 4, scale)} ${safeScale(style.shadowBlur || 0, scale)} ${safeScale(style.shadowSpread || 0, scale)} ${style.shadowColor || '#000000'}`
                    : style.boxShadow,
                color: content.textColor || colors?.text?.primary || '#000000', // Ensure text color
                fontFamily: content.fontFamily || style.fontFamily || 'inherit',
                fontSize: safeScale(style.fontSize || 14, scale),
                fontWeight: style.fontWeight,
                boxSizing: 'border-box', // Ensure padding doesn't overflow
                // Apply spacing
                // Apply spacing (granular support)
                padding: (() => {
                    const pTop = style.paddingTop ?? style.paddingVertical ?? (style.padding !== undefined ? style.padding : 0);
                    const pRight = style.paddingRight ?? style.paddingHorizontal ?? (style.padding !== undefined ? style.padding : 0);
                    const pBottom = style.paddingBottom ?? style.paddingVertical ?? (style.padding !== undefined ? style.padding : 0);
                    const pLeft = style.paddingLeft ?? style.paddingHorizontal ?? (style.padding !== undefined ? style.padding : 0);

                    return `${safeScale(pTop, scaleY)} ${safeScale(pRight, scale)} ${safeScale(pBottom, scaleY)} ${safeScale(pLeft, scale)}`;
                })(),
                margin: 0,
            }}
            title={triggerMode === 'anywhere' ? "Click to copy" : ""}
        >
            <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1, // Take available space
                textAlign: 'left',
                // Apply Text Offsets
                transform: `translate(${safeScale(style.textOffsetX || 0, scale)}, ${safeScale(style.textOffsetY || 0, scale)})`,
                display: 'block', // Ensure transform works
            }}>
                {content.copyText || 'Copy Code'}
            </span>

            {/* Icon Rendering */}
            <div
                onClick={triggerMode === 'icon' ? handleClick : undefined}
                style={{
                    // Apply Icon Offsets
                    transform: `translate(${safeScale(style.iconOffsetX || 0, scale)}, ${safeScale(style.iconOffsetY || 0, scale)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: triggerMode === 'icon' ? 'pointer' : 'inherit', // Explicit pointer if icon is trigger
                    padding: '4px', // Add slight hit area padding if it is the trigger? optional
                    pointerEvents: triggerMode === 'icon' ? 'auto' : 'inherit'
                }}>
                {(() => {
                    const iconName = content.copyIcon || 'Copy';
                    const size = safeScale(16, scale); // Common size
                    const IconProps = { size, strokeWidth: 2 };

                    switch (iconName) {
                        case 'Clipboard': return <Layout {...IconProps} />; // FIX: Use Layout icon to match Editor
                        case 'FileText': return <FileText {...IconProps} />;
                        case 'Link': return <LinkIcon {...IconProps} />;
                        // case 'Share': return <Share {...IconProps} />; // Share not imported, keep generic if needed or add
                        case 'Check': return <Check {...IconProps} />;
                        case 'Copy':
                        default:
                            return <Copy size={size} />;
                    }
                })()}
            </div>
        </button>
    );
};
