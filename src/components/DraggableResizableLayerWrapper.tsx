import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Layer, LayerStyle } from '@/store/useEditorStore';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import 'react-resizable/css/styles.css';

interface DraggableResizableLayerWrapperProps {
    layer: Layer;
    isSelected: boolean;
    onLayerSelect: (id: string) => void;
    onLayerUpdate?: (id: string, style: Partial<LayerStyle>) => void;
    baseStyle: React.CSSProperties;
    colors?: any; // Optional, fallback to default if not provided
    children: React.ReactNode;
    scale?: number; // Added scale prop for zoom support
    parentId?: string; // Added parentId for context
    showResizeHandles?: boolean; // explicit control
}

export const DraggableResizableLayerWrapper: React.FC<DraggableResizableLayerWrapperProps> = ({
    layer,
    isSelected,
    onLayerSelect,
    onLayerUpdate,
    baseStyle,
    colors = { primary: { 500: '#3B82F6' } }, // Default blue
    children,
    scale = 1,
    parentId,
    showResizeHandles
}) => {
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);

    // Measure on selection or when style changes (if not numeric)
    useLayoutEffect(() => {
        if (isSelected && nodeRef.current) {
            const { offsetWidth, offsetHeight } = nodeRef.current;
            setDimensions({ width: offsetWidth, height: offsetHeight });
        }
    }, [isSelected, layer.style?.width, layer.style?.height]);

    // Sync drag position with layer style
    useEffect(() => {
        setDragPos({
            x: parseFloat(String(layer.style?.left || 0)),
            y: parseFloat(String(layer.style?.top || 0))
        });
    }, [layer.style?.left, layer.style?.top]);

    const handleResizeStop = (e: any, data: ResizeCallbackData) => {
        if (onLayerUpdate) {
            onLayerUpdate(layer.id, { width: data.size.width, height: data.size.height });
            setDimensions({ width: data.size.width, height: data.size.height });
        }
    };

    const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
        if (onLayerUpdate) {
            onLayerUpdate(layer.id, { left: data.x, top: data.y });
        }
    };

    const width = typeof layer.style?.width === 'number' ? layer.style.width : dimensions?.width;
    const height = typeof layer.style?.height === 'number' ? layer.style.height : dimensions?.height;

    // Determine if we should show resizable handles
    // If showResizeHandles is explicitly passed, use it. Otherwise default to isSelected logic.
    const shouldShowResizable = showResizeHandles !== undefined
        ? (showResizeHandles && onLayerUpdate && width !== undefined && height !== undefined)
        : (isSelected && onLayerUpdate && width !== undefined && height !== undefined);

    // Remove top/left from baseStyle as Draggable handles it via transform
    const styleWithoutPos = { ...baseStyle, top: undefined, left: undefined, position: baseStyle.position || 'absolute' };

    if (shouldShowResizable) {
        return (
            <Draggable
                position={dragPos}
                onDrag={(e, data) => setDragPos({ x: data.x, y: data.y })}
                onStop={handleDragStop}
                cancel=".react-resizable-handle"
                bounds="parent"
                scale={scale}
                nodeRef={nodeRef}
            >
                <div
                    ref={nodeRef}
                    style={{
                        ...styleWithoutPos,
                        // Ensure wrapper doesn't collapse
                        display: 'inline-block',
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onLayerSelect(layer.id);
                    }}
                >
                    <ResizableBox
                        width={width!}
                        height={height!}
                        axis="both"
                        onResizeStop={handleResizeStop}
                        handle={
                            <span
                                className="react-resizable-handle react-resizable-handle-se"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '10px',
                                    height: '10px',
                                    cursor: 'se-resize',
                                    zIndex: 100
                                }}
                            />
                        }
                    // Pass scale to ResizableBox if supported, otherwise it might need custom handling
                    // react-resizable doesn't natively support scale prop in all versions, 
                    // but Draggable does. Resizing while scaled can be tricky.
                    >
                        <div style={{
                            width: '100%',
                            height: '100%',
                            outline: `2px solid ${colors.primary[500]}`,
                            outlineOffset: '2px',
                            cursor: isSelected ? 'move' : 'default'
                        }}>
                            {children}
                        </div>
                    </ResizableBox>
                </div>
            </Draggable>
        );
    }

    return (
        <Draggable
            position={dragPos}
            onDrag={(e, data) => setDragPos({ x: data.x, y: data.y })}
            onStop={handleDragStop}
            bounds="parent"
            scale={scale}
            nodeRef={nodeRef}
        >
            <div
                ref={nodeRef}
                style={{
                    ...styleWithoutPos,
                    outline: isSelected ? `2px solid ${colors.primary[500]}` : 'none',
                    outlineOffset: '2px',
                    cursor: isSelected ? 'move' : 'default'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onLayerSelect(layer.id);
                }}
            >
                {children}
            </div>
        </Draggable>
    );
};
