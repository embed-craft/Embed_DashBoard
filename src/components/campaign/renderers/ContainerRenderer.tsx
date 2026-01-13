import React from 'react';
import { Layer } from '@/store/useEditorStore';

interface ContainerRendererProps {
    layer: Layer;
    layers: Layer[];
    // Scale props kept in interface for consistency with other renderers if pattern changes,
    // but marked optional or unused to avoid lint errors if we strictly enforce it.
    // For now, I will remove them from the Destructuring to avoid "unused var" errors.
    scale?: number;
    scaleY?: number;
    renderChild: (layer: Layer) => React.ReactNode;
}

export const ContainerRenderer: React.FC<ContainerRendererProps> = ({
    layer,
    layers,
    renderChild
}) => {
    // Logic:
    // 1. ModalRenderer wraps this component in a <div> with all the styling (position, size, background, flex).
    // 2. We simply filter for our children and render them using the passed recursive callback.
    // 3. Children (e.g., Buttons inside) will be rendered by ModalRenderer's 'renderLayer', getting their OWN 
    //    wrapped divs with absolute properties relative to THIS container's div (because of relative/absolute context).

    const children = layers.filter(l => l.parent === layer.id);

    return (
        <>
            {children.map(child => renderChild(child))}
        </>
    );
};
