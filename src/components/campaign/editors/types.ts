export interface LayerEditorProps {
    layer: any;
    selectedLayerId: string;
    updateLayer: (id: string, updates: any) => void;
    // For syncing with main config (legacy SDK support)
    handleTooltipUpdate?: (key: string, value: any) => void;
    colors?: any;
}

export type StyleUpdateHandler = (key: string, value: any) => void;
