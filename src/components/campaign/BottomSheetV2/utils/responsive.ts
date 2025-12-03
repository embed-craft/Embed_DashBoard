import { Component, Breakpoint } from '../core/types';

/**
 * Resolve component properties based on the current breakpoint.
 * Merges responsive overrides into the component's base configuration.
 */
export function resolveResponsiveOverrides(
    component: Component,
    screenWidth: number = 375 // Default to mobile width
): Component {
    const { responsiveOverrides } = component;

    if (!responsiveOverrides || responsiveOverrides.length === 0) {
        return component;
    }

    // Determine current breakpoint
    let currentBreakpoint: Breakpoint = 'mobile';
    if (screenWidth >= 1024) {
        currentBreakpoint = 'desktop';
    } else if (screenWidth >= 768) {
        currentBreakpoint = 'tablet';
    }

    // Find applicable override
    const override = responsiveOverrides.find(o => o.breakpoint === currentBreakpoint);

    if (!override) {
        return component;
    }

    // Merge overrides
    // We create a new object to avoid mutating the original component
    const resolvedComponent: Component = {
        ...component,
        style: {
            ...component.style,
            ...(override.style || {}),
        },
        position: {
            ...component.position,
            ...(override.position || {}),
        },
    };

    // Handle visibility override
    if (override.visible !== undefined) {
        resolvedComponent.visible = override.visible;
    }

    return resolvedComponent;
}
