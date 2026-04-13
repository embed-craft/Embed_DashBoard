import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Link, Database, Copy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface DataBindingEditorProps {
    layer: any;
    selectedLayerId: string;
    updateLayer: (id: string, updates: any) => void;
}

export const DataBindingEditor: React.FC<DataBindingEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer
}) => {
    const content = layer.content || {};
    const { currentCampaign } = useEditorStore();
    const layers = currentCampaign?.layers || [];

    const [liveDataSources, setLiveDataSources] = useState<any[]>([]);
    const [isLoadingSources, setIsLoadingSources] = useState(false);
    const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
    const [isVariablesOpen, setIsVariablesOpen] = useState(false);
    
    // Check for Parent Inheritance
    const checkParentDataSource = () => {
        let current = layers.find(l => l.id === layer.id);
        while (current && current.parent) {
            const parent = layers.find(l => l.id === current?.parent);
            if (parent && parent.content?.dataSourceId) {
                return { isInheriting: true, sourceId: parent.content.dataSourceId };
            }
            current = parent;
        }
        return { isInheriting: false, sourceId: null };
    };

    const inheritance = checkParentDataSource();

    useEffect(() => {
        const fetchFeeds = async () => {
            setIsLoadingSources(true);
            try {
                const baseUrl = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');
                const res = await fetch(`${baseUrl}/v1/admin/datasources`);
                if (res.ok) {
                    const data = await res.json();
                    
                    const clean = data.filter((ds: any) => 
                        ds.name !== 'User Tasks (Live)' && 
                        ds.name !== 'Daily Rewards (Live)'
                    );
                    setLiveDataSources(clean);
                }
            } catch (err) {
                console.warn('Could not fetch server DataSources', err);
            } finally {
                setIsLoadingSources(false);
            }
        };
        fetchFeeds();
    }, []);

    const handleCopy = (variable: string) => {
        navigator.clipboard.writeText(variable);
        setCopiedVariable(variable);
        setTimeout(() => setCopiedVariable(null), 2000);
    };

    const effectiveSourceId = inheritance.isInheriting ? inheritance.sourceId : content.dataSourceId;
    
    // Find the currently active Data Source object to get its schema
    const activeDataSource = liveDataSources.find(ds => ds._id === effectiveSourceId);

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div className="space-y-4 border rounded-lg p-3 bg-indigo-50/30">
                <h5 className="text-[12px] font-semibold text-indigo-900 flex items-center gap-1.5 mb-3">
                    <Link size={14} className="text-indigo-600" />
                    Data Context Provider
                </h5>
                <p className="text-[10px] text-indigo-700/70 mb-3 leading-relaxed">
                    Attach a data source to this layer. All nested child elements will inherit this data via variables.
                </p>
                
                <div className="space-y-3">
                    <Label className="text-[10px] text-indigo-700 font-medium tracking-wide uppercase">Connect Data Source</Label>
                    
                    {inheritance.isInheriting ? (
                        <div className="flex items-center gap-2 p-2 bg-indigo-100/50 border border-indigo-200 rounded-md text-indigo-800 text-xs">
                            <Link size={14} className="text-indigo-600" />
                            <span className="font-medium">Inheriting Data Context from Parent Layer</span>
                        </div>
                    ) : (
                        <Select
                            value={content.dataSourceId || 'none'}
                            onValueChange={(val) => {
                                if (val === 'none') {
                                    updateLayer(selectedLayerId, {
                                        content: {
                                            ...layer.content,
                                            dataSourceId: undefined,
                                            dataSourceUrl: undefined
                                        }
                                    });
                                    return;
                                }
                                const feed = liveDataSources.find(d => d._id === val);
                                updateLayer(selectedLayerId, {
                                    content: {
                                        ...layer.content,
                                        dataSourceId: val,
                                        dataSourceUrl: feed ? feed.endpoint_url : ''
                                    }
                                });
                            }}
                        >
                            <SelectTrigger className="h-8 text-[11px] bg-white border-indigo-200">
                                <SelectValue placeholder={isLoadingSources ? 'Loading sources...' : 'Select data source'} />
                            </SelectTrigger>
                            <SelectContent>
                                {layer.type !== 'grid-container' && (
                                    <SelectItem value="none">None (Static Layout)</SelectItem>
                                )}
                                {liveDataSources.map(ds => (
                                    <SelectItem key={ds._id} value={ds._id}>{ds.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {content.dataSourceId && (
                <div className="border rounded-lg border-emerald-200 bg-emerald-50/50 overflow-hidden">
                    <button 
                        onClick={() => setIsVariablesOpen(!isVariablesOpen)}
                        className="w-full flex items-center justify-between p-3"
                    >
                        <h5 className="text-[12px] font-semibold text-emerald-900 flex items-center gap-1.5">
                            <Database size={14} className="text-emerald-600" />
                            Available Variables
                        </h5>
                        {isVariablesOpen ? <ChevronUp size={14} className="text-emerald-600" /> : <ChevronDown size={14} className="text-emerald-600" />}
                    </button>
                    
                    {isVariablesOpen && (
                        <div className="px-3 pb-3 space-y-4">
                            <p className="text-[10px] text-emerald-700 leading-relaxed">
                                This container is bound to data. You can copy the variables below and paste them into any Text, Image, or Button layer inside this container.
                            </p>

                            <div className="space-y-2">
                                {activeDataSource?.cached_schema && activeDataSource.cached_schema.map((field: any) => (
                                    <div key={field.key} className="flex justify-between items-center group bg-white border border-emerald-100 rounded p-1.5 hover:border-emerald-300 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-emerald-600/70 font-semibold uppercase">{field.key}</span>
                                            <span className="text-[11px] font-mono text-gray-800">{'{{'}{field.key}{'}}'}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleCopy(`{{${field.key}}}`)}
                                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                                            title="Click to copy"
                                        >
                                            {copiedVariable === `{{${field.key}}}` ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                ))}

                                {(!activeDataSource?.cached_schema || activeDataSource.cached_schema.length === 0) && (
                                    <div className="flex justify-between items-center bg-white border border-emerald-100 rounded p-1.5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-emerald-600/70 font-semibold uppercase">API Data</span>
                                            <span className="text-[11px] font-mono text-gray-800">{'{{your_json_key}}'}</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-600 font-medium px-2">Custom</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
