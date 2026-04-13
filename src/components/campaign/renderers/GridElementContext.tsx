import React, { createContext, useContext } from 'react';

/**
 * GridElementContext
 * 
 * This React Context provides the current loop data item from the Grid Container's
 * fetched JSON array to all descendant renderers (Text, Image, ScratchFoil, etc).
 * 
 * When a Grid Container fetches data from `dataSourceUrl`, it iterates the array
 * and wraps each cloned Grid Element template in this provider, passing the
 * current `dataItem` object. Child layers can then use `mapped_key` to resolve
 * dynamic values from this context.
 */

export interface GridElementContextValue {
  /** The current JSON object from the data source array for this grid cell */
  dataItem: Record<string, any> | null;
  /** The index of this item in the data array */
  index: number;
}

const GridElementCtx = createContext<GridElementContextValue>({
  dataItem: null,
  index: 0,
});

export const GridElementProvider: React.FC<{
  dataItem: Record<string, any>;
  index: number;
  children: React.ReactNode;
}> = ({ dataItem, index, children }) => {
  return (
    <GridElementCtx.Provider value={{ dataItem, index }}>
      {children}
    </GridElementCtx.Provider>
  );
};

/**
 * Hook to access the grid element data context.
 * Returns null dataItem when not inside a grid loop (safe fallback).
 */
export const useGridElementData = (): GridElementContextValue => {
  return useContext(GridElementCtx);
};

/**
 * Utility to interpolate `{{key.subkey}}` in strings using Grid dataItem payload
 */
export const interpolateDataBinding = (text: string | undefined | null, dataItem: Record<string, any> | null): string => {
    if (!text || typeof text !== 'string' || !dataItem) return text || '';
    
    return text.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (match, key) => {
        const paths = key.split('.');
        let value: any = dataItem;
        for (const p of paths) {
            if (value && typeof value === 'object') value = value[p];
            else { value = null; break; }
        }
        return value != null ? String(value) : match;
    });
};
