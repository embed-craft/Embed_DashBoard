import React, { useRef } from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import { Layer } from '@/store/useEditorStore';

interface DraggableLayerWrapperProps {
    layer: Layer;
    children: React.ReactNode;
    isSelected: boolean;
    isInteractive: boolean;
    scale: number;
    onLayerUpdate?: (id: string, updates: any) => void;
    onLayerSelect: (id: string) => void;
    onLayerAction?: (layer: Layer) => void; // Optional: Handler for interactive actions
    designWidth?: number;
    designHeight?: number;
    className?: string; // Optional: Additional classes
    style?: React.CSSProperties; // Optional: Base styles
    isDraggable?: boolean; // FIX: Control draggable behavior
}

// Helper: Parse value to pixels
const getPixelValue = (val: string | number | undefined, refSize: number): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const str = val.toString().trim();
    if (str.endsWith('px')) return parseFloat(str);
    if (str.endsWith('%')) return (parseFloat(str) / 100) * refSize;
    if (!isNaN(parseFloat(str))) return parseFloat(str);
    return 0;
};

export const DraggableLayerWrapper: React.FC<DraggableLayerWrapperProps> = ({
    layer,
    children,
    isSelected,
    isInteractive,
    scale,
    onLayerUpdate,
    onLayerSelect,
    onLayerAction,
    designWidth = 393,
    designHeight = 852,
    className,
    style,
    isDraggable = true // FIX: Default to true for backward compatibility
}) => {
    // Check both layer.style.position AND the passed style prop for position: absolute
    const isAbsolute = layer.style?.position === 'absolute' || layer.style?.position === 'fixed' ||
        style?.position === 'absolute' || style?.position === 'fixed';
    const nodeRef = useRef<HTMLDivElement>(null);

    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
        if (!onLayerUpdate) return;

        // Dynamic Reference Frame: Use the actual container size if available
        // This ensures dragging works correctly inside Modals/Containers of variable sizes
        const parent = data.node.offsetParent as HTMLElement;
        const refWidth = parent ? parent.offsetWidth : designWidth;
        const refHeight = parent ? parent.offsetHeight : designHeight;

        // Calculate current pixels based on the CORRECT reference frame
        const currentLeft = getPixelValue(layer.style?.left, refWidth);
        const currentTop = getPixelValue(layer.style?.top, refHeight);

        const newLeftPx = currentLeft + data.deltaX;
        const newTopPx = currentTop + data.deltaY;

        // Convert back to percentage using the SAME reference frame
        const newLeftPercent = `${(newLeftPx / refWidth) * 100}%`;
        const newTopPercent = `${(newTopPx / refHeight) * 100}%`;

        onLayerUpdate(layer.id, {
            style: {
                ...layer.style,
                left: newLeftPercent,
                top: newTopPercent,
                position: 'absolute'
            }
        });
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isInteractive && onLayerAction) {
            onLayerAction(layer);
        } else {
            onLayerSelect(layer.id);
        }
    };

    const wrapperStyle: React.CSSProperties = {
        ...style,
        cursor: isInteractive || !isAbsolute ? 'pointer' : (isSelected ? 'move' : 'pointer'),
        userSelect: 'none', // Prevent selection during drag operations
    };

    const content = (
        <div
            ref={nodeRef}
            key={layer.id}
            className={className || `layer-item ${layer.type}-layer`}
            style={wrapperStyle}
            onClick={handleClick}
        >
            {children}
        </div>
    );

    if (isAbsolute) {
        return (
            <DraggableCore
                key={layer.id}
                nodeRef={nodeRef}
                disabled={!isSelected || isInteractive || !isDraggable}
                scale={scale}
                onStart={(e) => e.stopPropagation()}
                onDrag={handleDrag}
            >
                {content}
            </DraggableCore>
        );
    }

    return content;
};
