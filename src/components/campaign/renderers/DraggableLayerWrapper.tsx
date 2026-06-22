import React, { useRef } from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import { Layer, useEditorStore } from '@/store/useEditorStore';

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

    const siblingBoundsRef = useRef<{ left: number, right: number, top: number, bottom: number, centerX: number, centerY: number }[]>([]);

    const handleStart = (e: DraggableEvent, data: DraggableData) => {
        e.stopPropagation();
        
        const parent = data.node.offsetParent as HTMLElement;
        if (!parent) return;
        
        // Cache sibling bounds for high-performance snapping
        const siblings = Array.from(parent.children).filter(c => c !== data.node && c.classList.contains('layer-item')) as HTMLElement[];
        
        siblingBoundsRef.current = siblings.map(sibling => {
            const left = sibling.offsetLeft;
            const top = sibling.offsetTop;
            const width = sibling.offsetWidth;
            const height = sibling.offsetHeight;
            
            return {
                left,
                right: left + width,
                top,
                bottom: top + height,
                centerX: left + width / 2,
                centerY: top + height / 2,
            };
        });
    };

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

        let newLeftPx = currentLeft + data.deltaX;
        let newTopPx = currentTop + data.deltaY;

        // --- Magnetic Snapping Logic ---
        const layerWidth = data.node.offsetWidth;
        const layerHeight = data.node.offsetHeight;
        
        const parentCenterX = refWidth / 2;
        const parentCenterY = refHeight / 2;
        
        const layerCenterX = newLeftPx + layerWidth / 2;
        const layerCenterY = newTopPx + layerHeight / 2;
        
        const SNAP_THRESHOLD = useEditorStore.getState().snapThreshold; // Dynamic threshold from store
        
        let snapX: number | null = null;
        let snapY: number | null = null;
        
        // 1. Check Parent Center
        if (Math.abs(layerCenterX - parentCenterX) <= SNAP_THRESHOLD) {
            newLeftPx = parentCenterX - layerWidth / 2;
            snapX = parentCenterX;
        }
        
        if (Math.abs(layerCenterY - parentCenterY) <= SNAP_THRESHOLD) {
            newTopPx = parentCenterY - layerHeight / 2;
            snapY = parentCenterY;
        }

        // 2. Check Sibling Edges
        const currentLayerBounds = {
            left: newLeftPx,
            right: newLeftPx + layerWidth,
            top: newTopPx,
            bottom: newTopPx + layerHeight,
            centerX: newLeftPx + layerWidth / 2,
            centerY: newTopPx + layerHeight / 2,
        };

        for (const bounds of siblingBoundsRef.current) {
            // X-Axis Snapping
            if (snapX === null) {
                if (Math.abs(currentLayerBounds.left - bounds.left) <= SNAP_THRESHOLD) { newLeftPx = bounds.left; snapX = bounds.left; }
                else if (Math.abs(currentLayerBounds.right - bounds.right) <= SNAP_THRESHOLD) { newLeftPx = bounds.right - layerWidth; snapX = bounds.right; }
                else if (Math.abs(currentLayerBounds.centerX - bounds.centerX) <= SNAP_THRESHOLD) { newLeftPx = bounds.centerX - layerWidth / 2; snapX = bounds.centerX; }
                else if (Math.abs(currentLayerBounds.left - bounds.right) <= SNAP_THRESHOLD) { newLeftPx = bounds.right; snapX = bounds.right; }
                else if (Math.abs(currentLayerBounds.right - bounds.left) <= SNAP_THRESHOLD) { newLeftPx = bounds.left - layerWidth; snapX = bounds.left; }
            }
            
            // Y-Axis Snapping
            if (snapY === null) {
                if (Math.abs(currentLayerBounds.top - bounds.top) <= SNAP_THRESHOLD) { newTopPx = bounds.top; snapY = bounds.top; }
                else if (Math.abs(currentLayerBounds.bottom - bounds.bottom) <= SNAP_THRESHOLD) { newTopPx = bounds.bottom - layerHeight; snapY = bounds.bottom; }
                else if (Math.abs(currentLayerBounds.centerY - bounds.centerY) <= SNAP_THRESHOLD) { newTopPx = bounds.centerY - layerHeight / 2; snapY = bounds.centerY; }
                else if (Math.abs(currentLayerBounds.top - bounds.bottom) <= SNAP_THRESHOLD) { newTopPx = bounds.bottom; snapY = bounds.bottom; }
                else if (Math.abs(currentLayerBounds.bottom - bounds.top) <= SNAP_THRESHOLD) { newTopPx = bounds.top - layerHeight; snapY = bounds.top; }
            }
        }
        // Calculate global coordinates for the magenta guide lines
        let parentOffsetX = 0;
        let parentOffsetY = 0;
        
        const phoneContent = document.getElementById('phone-preview-content');
        if (parent && phoneContent) {
            const parentRect = parent.getBoundingClientRect();
            const phoneRect = phoneContent.getBoundingClientRect();
            parentOffsetX = parentRect.left - phoneRect.left;
            parentOffsetY = parentRect.top - phoneRect.top;
        }

        const globalSnapX = snapX !== null ? snapX + parentOffsetX : null;
        const globalSnapY = snapY !== null ? snapY + parentOffsetY : null;

        // Notify store so the UI can draw magenta lines
        useEditorStore.getState().setSnapGuides({ x: globalSnapX, y: globalSnapY });
        // -------------------------------

        // Convert back to percentage using the SAME reference frame
        const newLeftPercent = refWidth > 0 ? `${(newLeftPx / refWidth) * 100}%` : '0%';
        const newTopPercent = refHeight > 0 ? `${(newTopPx / refHeight) * 100}%` : '0%';

        onLayerUpdate(layer.id, {
            style: {
                ...layer.style,
                left: newLeftPercent,
                top: newTopPercent,
                position: 'absolute'
            }
        });
    };

    const handleStop = () => {
        useEditorStore.getState().setSnapGuides(null);
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
                onStart={handleStart}
                onDrag={handleDrag}
                onStop={handleStop}
            >
                {content}
            </DraggableCore>
        );
    }

    return content;
};
