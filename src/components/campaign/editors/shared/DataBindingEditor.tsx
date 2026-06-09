import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Link, Database, Copy, CheckCircle2, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';

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
    
    // Test Harness States
    const [testParams, setTestParams] = useState(content.testParameters || '{}');
    const [testingError, setTestingError] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    // Sync state if content.testParameters changes externally
    useEffect(() => {
        if (content.testParameters) {
            setTestParams(content.testParameters);
        }
    }, [content.testParameters]);

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

    const handleIntrospectCustomApi = async () => {
        setIsTesting(true);
        setTestingError(null);
        try {
            let url = content.dataSourceUrl;
            if (!url) throw new Error('API Endpoint URL is required');

            // Parse test parameters
            let params: Record<string, any> = {};
            try {
                if (testParams && testParams.trim() !== '') {
                    params = JSON.parse(testParams);
                }
            } catch (e) {
                throw new Error('Test Variables must be valid JSON');
            }

            // Interpolate URL parameters
            Object.entries(params).forEach(([key, val]) => {
                const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
                url = url.replace(regex, String(val));
            });

            // Parse headers and interpolate
            let headers: Record<string, string> = {
                'Accept': 'application/json'
            };
            if (content.dataSourceHeaders) {
                let parsedHeaders: Record<string, string> = {};
                try {
                    parsedHeaders = JSON.parse(content.dataSourceHeaders);
                } catch (e) {
                    // Try parsing as raw lines "Key: Value"
                    content.dataSourceHeaders.split('\n').forEach((line: string) => {
                        const idx = line.indexOf(':');
                        if (idx !== -1) {
                            const k = line.substring(0, idx).trim();
                            const v = line.substring(idx + 1).trim();
                            if (k) parsedHeaders[k] = v;
                        }
                    });
                }
                
                Object.entries(parsedHeaders).forEach(([k, v]) => {
                    let interpolatedVal = v;
                    Object.entries(params).forEach(([paramKey, paramVal]) => {
                        const regex = new RegExp(`\\{\\{\\s*${paramKey}\\s*\\}\\}`, 'g');
                        interpolatedVal = interpolatedVal.replace(regex, String(paramVal));
                    });
                    headers[k] = interpolatedVal;
                });
            }

            // Trigger fetch
            const fetchOptions: RequestInit = {
                method: content.dataSourceMethod || 'GET',
                headers
            };

            const res = await fetch(url, fetchOptions);
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            
            const json = await res.json();

            // Extract the list/data based on responseDataPath
            let rawData = json;
            if (content.responseDataPath) {
                const pathParts = content.responseDataPath.split('.');
                for (const part of pathParts) {
                    if (rawData && typeof rawData === 'object' && part in rawData) {
                        rawData = rawData[part];
                    } else {
                        rawData = null;
                        break;
                    }
                }
            }

            // Standard array resolver fallback
            let arr: any[] = [];
            if (Array.isArray(rawData)) {
                arr = rawData;
            } else if (rawData && typeof rawData === 'object') {
                arr = rawData.data || rawData.items || rawData.rewards || rawData.results || [];
                if (!Array.isArray(arr)) {
                    arr = [rawData]; // Simple object wrap
                }
            }

            if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null) {
                const keys = Object.keys(arr[0]);
                const schema = keys.map(k => ({ key: k, type: typeof arr[0][k] }));
                
                updateLayer(selectedLayerId, {
                    content: {
                        ...layer.content,
                        cached_schema: schema,
                        testParameters: testParams
                    }
                });
                setIsVariablesOpen(true);
            } else if (typeof rawData === 'object' && rawData !== null) {
                const keys = Object.keys(rawData);
                const schema = keys.map(k => ({ key: k, type: typeof rawData[k] }));
                updateLayer(selectedLayerId, {
                    content: {
                        ...layer.content,
                        cached_schema: schema,
                        testParameters: testParams
                    }
                });
                setIsVariablesOpen(true);
            } else {
                throw new Error('API response does not contain an object or list of objects at the specified path');
            }

        } catch (err: any) {
            console.error('Testing custom API failed:', err);
            setTestingError(err.message || 'Introspection failed');
        } finally {
            setIsTesting(false);
        }
    };

    const effectiveSourceId = inheritance.isInheriting ? inheritance.sourceId : content.dataSourceId;
    
    // Find the currently active Data Source object to get its schema
    const activeDataSource = liveDataSources.find(ds => ds._id === effectiveSourceId);
    const schemaToDisplay = activeDataSource 
        ? activeDataSource.cached_schema 
        : (content.dataSourceId === 'custom-api' ? content.cached_schema : null);

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
                                            dataSourceUrl: undefined,
                                            dataSourceMethod: undefined,
                                            dataSourceHeaders: undefined,
                                            responseDataPath: undefined,
                                            cached_schema: undefined,
                                            testParameters: undefined
                                        }
                                    });
                                    return;
                                }
                                if (val === 'custom-api') {
                                    updateLayer(selectedLayerId, {
                                        content: {
                                            ...layer.content,
                                            dataSourceId: 'custom-api',
                                            dataSourceUrl: layer.content.dataSourceUrl || '',
                                            dataSourceMethod: layer.content.dataSourceMethod || 'GET',
                                            dataSourceHeaders: layer.content.dataSourceHeaders || '{}',
                                            responseDataPath: layer.content.responseDataPath || '',
                                            cached_schema: layer.content.cached_schema || []
                                        }
                                    });
                                    return;
                                }
                                const feed = liveDataSources.find(d => d._id === val);
                                updateLayer(selectedLayerId, {
                                    content: {
                                        ...layer.content,
                                        dataSourceId: val,
                                        dataSourceUrl: feed ? feed.endpoint_url : '',
                                        dataSourceMethod: undefined,
                                        dataSourceHeaders: undefined,
                                        responseDataPath: undefined,
                                        cached_schema: undefined,
                                        testParameters: undefined
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
                                <SelectItem value="custom-api">➕ Custom API Endpoint</SelectItem>
                                {liveDataSources.map(ds => (
                                    <SelectItem key={ds._id} value={ds._id}>{ds.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Custom API Configuration Panel */}
            {content.dataSourceId === 'custom-api' && !inheritance.isInheriting && (
                <div className="space-y-4 border rounded-lg p-3 bg-gray-50 border-gray-200">
                    <h5 className="text-[11px] font-semibold text-gray-700 tracking-wide uppercase">Custom API Configuration</h5>
                    
                    <div className="space-y-2">
                        <Label className="text-[10px] text-gray-600 font-medium">API Endpoint URL</Label>
                        <Input
                            placeholder="https://api.zomato.com/v1/restaurants?lat={{latitude}}&lng={{longitude}}"
                            value={content.dataSourceUrl || ''}
                            onChange={(e) => updateLayer(selectedLayerId, {
                                content: { ...layer.content, dataSourceUrl: e.target.value }
                            })}
                            className="h-8 text-xs bg-white"
                        />
                        <span className="text-[9px] text-gray-400 block leading-tight">Use {"`{{variable}}`"} for dynamic user properties.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-[10px] text-gray-600 font-medium">HTTP Method</Label>
                            <Select
                                value={content.dataSourceMethod || 'GET'}
                                onValueChange={(val) => updateLayer(selectedLayerId, {
                                    content: { ...layer.content, dataSourceMethod: val }
                                })}
                            >
                                <SelectTrigger className="h-8 text-xs bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] text-gray-600 font-medium">Response List Path</Label>
                            <Input
                                placeholder="data.restaurants"
                                value={content.responseDataPath || ''}
                                onChange={(e) => updateLayer(selectedLayerId, {
                                    content: { ...layer.content, responseDataPath: e.target.value }
                                })}
                                className="h-8 text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] text-gray-600 font-medium">Custom Headers (JSON)</Label>
                        <Textarea
                            placeholder='{"Authorization": "Bearer {{authToken}}"}'
                            value={content.dataSourceHeaders || ''}
                            onChange={(e) => updateLayer(selectedLayerId, {
                                content: { ...layer.content, dataSourceHeaders: e.target.value }
                            })}
                            className="text-xs bg-white font-mono min-h-16"
                        />
                    </div>

                    {/* Developer Test Harness */}
                    <div className="pt-3 border-t border-gray-200 space-y-2.5">
                        <Label className="text-[10px] font-semibold text-gray-600 uppercase flex items-center gap-1">
                            <span>🧪 Introspection / Test Variables (JSON)</span>
                        </Label>
                        <Textarea
                            placeholder='{"latitude": 12.9716, "longitude": 77.5946, "authToken": "jwt_dev_token"}'
                            value={testParams}
                            onChange={(e) => {
                                setTestParams(e.target.value);
                                updateLayer(selectedLayerId, {
                                    content: { ...layer.content, testParameters: e.target.value }
                                });
                            }}
                            className="text-xs bg-white font-mono min-h-16"
                        />

                        {testingError && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-[10px] text-red-700 flex items-start gap-1.5 leading-tight">
                                <AlertCircle size={14} className="shrink-0 text-red-500 mt-0.5" />
                                <span>{testingError}</span>
                            </div>
                        )}

                        <Button
                            onClick={handleIntrospectCustomApi}
                            disabled={isTesting}
                            className="w-full h-8 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 animate-in fade-in-50"
                        >
                            {isTesting ? <Loader2 size={12} className="animate-spin" /> : null}
                            {isTesting ? 'Testing API...' : 'Test & Introspect API'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Available Variables Section */}
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
                                {schemaToDisplay && schemaToDisplay.map((field: any) => (
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

                                {(!schemaToDisplay || schemaToDisplay.length === 0) && (
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
