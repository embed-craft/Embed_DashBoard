import React, { useState, useEffect } from 'react';
import { Layer } from '@/store/useEditorStore';
import { GridElementProvider } from '@/components/campaign/renderers/GridElementContext';
import { ContainerRenderer } from '@/components/campaign/renderers/ContainerRenderer';
import { useEditorStore } from '@/store/useEditorStore';
import { getApiKey } from '@/lib/api';

interface GridContainerRendererProps {
  layer: Layer;
  layers: Layer[];
  renderChild: (layer: Layer) => React.ReactNode;
  scale?: number;
  scaleY?: number;
}

/**
 * GridContainerRenderer
 *
 * Renders a CSS Grid layout. If `dataSourceUrl` is configured, it fetches JSON
 * from that URL and loops the single Grid Element template for each data item,
 * wrapping each clone in a GridElementProvider so child layers can resolve
 * their `mapped_key` bindings.
 *
 * In editor preview mode (no live fetch), it mocks 4 ghost items at reduced
 * opacity so the designer can visualize the grid layout.
 */
export const GridContainerRenderer: React.FC<GridContainerRendererProps> = ({
  layer,
  layers,
  renderChild,
  scale = 1,
  scaleY = 1,
}) => {
  const content = layer.content || {};
  const style = layer.style || {};

  const span = content.span ?? 2;
  const gridGapX = content.gridGapX ?? 0;  // Column gap (horizontal)
  const gridGapY = content.gridGapY ?? 0;  // Row gap (vertical)
  const dataSourceUrl = content.dataSourceUrl;
  const shimmerEnabled = content.shimmerEnabled ?? true;

  // Data fetching state
  const [data, setData] = useState<Record<string, any>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUserId = useEditorStore(state => state.previewUserId);

  // Fetch data from URL when configured
  useEffect(() => {
    if (!dataSourceUrl) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    let fetchUrl = dataSourceUrl;
    
    // Resolve relative URLs to the API backend directly, identical to dashboard fetch logic
    if (fetchUrl.startsWith('/')) {
        const baseUrl = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');
        fetchUrl = `${baseUrl}${fetchUrl}`;
    }
    
    if (previewUserId) {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      fetchUrl += `${separator}userId=${encodeURIComponent(previewUserId)}`;
    }

    const apiKey = getApiKey();
    const headers: Record<string, string> = {
        'Accept': 'application/json'
    };
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    fetch(fetchUrl, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        // Accept either a raw array or an object with a `data` / `items` / `rewards` key
        let arr: any[] = [];
        if (Array.isArray(json)) {
          arr = json;
        } else if (json && typeof json === 'object') {
          arr = json.data || json.items || json.rewards || json.results || [];
        }
        setData(arr);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('GridContainer fetch error:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataSourceUrl, previewUserId]);

  // Find the single Grid Element template child
  const templateChild = layers.find(
    (l) => l.parent === layer.id && l.type === 'grid_item'
  );

  // Grid CSS
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${span}, 1fr)`,
    columnGap: `${gridGapX * scale}px`,
    rowGap: `${gridGapY * scale}px`,
    alignContent: 'start', // Packs rows tightly at the top rather than stretching across 100% height
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: style.backgroundColor || 'transparent',
  };

  // Shimmer placeholder
  const ShimmerCell: React.FC = () => (
    <div
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '8px',
        minHeight: '80px',
      }}
    />
  );

  // Loading state
  if (loading && shimmerEnabled) {
    return (
      <div style={gridStyle}>
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        {Array.from({ length: span * 2 }).map((_, i) => (
          <ShimmerCell key={`shimmer-${i}`} />
        ))}
      </div>
    );
  }

  // Data loaded — render template for each item
  if (data && templateChild) {
    return (
      <div style={gridStyle}>
        {data.map((item, index) => (
          <GridElementProvider key={`grid-el-${index}`} dataItem={item} index={index}>
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
              {renderChild(templateChild)}
            </div>
          </GridElementProvider>
        ))}
      </div>
    );
  }

  // No data / no URL — editor preview with mock ghosts
  if (templateChild) {
    return (
      <div style={gridStyle}>
        {/* Real template (full opacity) */}
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
          {renderChild(templateChild)}
        </div>
        {/* Ghost clones for visual preview */}
        {[1, 2, 3].map((i) => (
          <div key={`mock-${i}`} style={{ position: 'relative', opacity: 0.35, width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
            {renderChild(templateChild)}
          </div>
        ))}
      </div>
    );
  }

  // No template child yet — empty state
  return (
    <div
      style={{
        ...gridStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        color: '#9ca3af',
        fontSize: `${12 * scale}px`,
      }}
    >
      Add a Grid Element child to define the loop template
    </div>
  );
};
