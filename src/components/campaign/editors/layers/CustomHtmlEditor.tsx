import React, { useState } from 'react';
import { Code, Move, Link as LinkIcon, FileCode, MonitorPlay, Braces, Database, Settings } from 'lucide-react';
import { SizeControls } from '@/components/campaign/editors/shared/SizeControls';
import { PositionEditor } from '@/components/editor/style/PositionEditor';
import { DataBindingEditor } from '@/components/campaign/editors/shared/DataBindingEditor';

// UI Components
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface CustomHtmlEditorProps {
    layer: any;
    selectedLayerId: string;
    updateLayer: (id: string, updates: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    colors: any;
}

export const CustomHtmlEditor: React.FC<CustomHtmlEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    colors
}) => {
    const updateContent = (key: string, value: any) => {
        updateLayer(selectedLayerId, {
            content: { ...layer.content, [key]: value }
        });
    };

    const content = layer.content || {};
    const style = layer.style || {};

    const [activeTab, setActiveTab] = useState<'code' | 'bridge' | 'layout' | 'data'>('code');
    const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'js'>('html');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="pb-4 mb-2 border-b border-gray-100 flex-shrink-0">
                <h4 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Code size={14} className="text-indigo-600" />
                    </div>
                    Custom HTML
                </h4>
                <p className="text-[11px] text-gray-500 ml-9 mt-1">
                    Embed custom code with bridging capabilities.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100/50 rounded-lg mb-4 gap-1 flex-shrink-0">
                {(['code', 'bridge', 'layout', 'data'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${activeTab === tab
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        {tab === 'code' && <FileCode size={12} />}
                        {tab === 'bridge' && <LinkIcon size={12} />}
                        {tab === 'layout' && <Move size={12} />}
                        {tab === 'data' && <Database size={12} />}
                        <span className="capitalize">{tab}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-20 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                {/* 0. DATA TAB */}
                {activeTab === 'data' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <DataBindingEditor
                            layer={layer}
                            selectedLayerId={selectedLayerId}
                            updateLayer={updateLayer}
                        />
                    </div>
                )}

                {/* 1. CODE TAB */}
                {activeTab === 'code' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-200">


                        {/* Editors */}
                        <div className="space-y-3 flex-1 flex flex-col min-h-[250px]">
                            <div className="flex items-center justify-between">
                                <h5 className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5">
                                    <Braces size={12} /> Source Code
                                </h5>
                            </div>
                            
                            <div className="flex rounded-t-md bg-gray-900 p-1 gap-1">
                                {(['html', 'css', 'js'] as const).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setActiveCodeTab(lang)}
                                        className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                                            activeCodeTab === lang
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex-1 bg-gray-900 rounded-b-md border-t-2 border-gray-800 p-2 relative group">
                                {activeCodeTab === 'html' && (
                                    <textarea
                                        value={content.html || ''}
                                        onChange={(e) => updateContent('html', e.target.value)}
                                        className="w-full min-h-[200px] bg-transparent text-gray-100 font-mono text-[11px] leading-relaxed resize-y focus:outline-none scrollbar-thin scrollbar-thumb-gray-700"
                                        placeholder="<div>Hello World</div>"
                                        spellCheck={false}
                                    />
                                )}
                                {activeCodeTab === 'css' && (
                                    <textarea
                                        value={content.css || ''}
                                        onChange={(e) => updateContent('css', e.target.value)}
                                        className="w-full min-h-[200px] bg-transparent text-blue-300 font-mono text-[11px] leading-relaxed resize-y focus:outline-none scrollbar-thin scrollbar-thumb-gray-700"
                                        placeholder=".my-class { color: red; }"
                                        spellCheck={false}
                                    />
                                )}
                                {activeCodeTab === 'js' && (
                                    <textarea
                                        value={content.javascript || ''}
                                        onChange={(e) => updateContent('javascript', e.target.value)}
                                        className="w-full min-h-[200px] bg-transparent text-yellow-300 font-mono text-[11px] leading-relaxed resize-y focus:outline-none scrollbar-thin scrollbar-thumb-gray-700"
                                        placeholder="console.log('Mounted!');"
                                        spellCheck={false}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* 2. BRIDGE TAB */}
                {activeTab === 'bridge' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <div className="space-y-3">
                            <h5 className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5">
                                <Settings size={12} /> JavaScript Bridge
                            </h5>
                            <p className="text-[10px] text-gray-500">
                                Connect your custom HTML code with the SDK to trigger actions.
                            </p>

                        </div>

                        <Separator className="bg-gray-100" />

                        <div className="space-y-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                            <h5 className="text-[11px] font-semibold text-indigo-900">API Documentation</h5>
                            <p className="text-[10px] text-indigo-700">Use the injected <code className="bg-indigo-100 px-1 rounded text-indigo-900 font-mono">window.ninja</code> object inside your JS.</p>
                            
                            <div className="space-y-2 mt-2">
                                <div className="bg-white border border-indigo-100 rounded p-2 overflow-x-auto">
                                    <pre className="text-[9px] font-mono text-gray-800">
{`// Trigger custom action
window.ninja.triggerAction('my_action', { 
  itemId: 123 
});

// Helper: Close modal
window.ninja.dismiss();

// Helper: Open URL
window.ninja.openUrl('https://...');`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. LAYOUT TAB */}
                {activeTab === 'layout' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <div className="space-y-3">
                            <h5 className="text-[12px] font-semibold text-gray-900">Dimensions</h5>
                            <SizeControls
                                layer={layer}
                                selectedLayerId={selectedLayerId}
                                updateLayer={updateLayer}
                                onStyleUpdate={onStyleUpdate}
                                colors={colors}
                            />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                            <h5 className="text-[12px] font-semibold text-gray-900">Overflow & Scrolling</h5>
                            <div className="grid grid-cols-2 gap-2">
                                {['hidden', 'auto', 'scroll', 'visible'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => onStyleUpdate('overflow', opt)}
                                        className={`py-1.5 px-2 text-[10px] font-medium rounded border ${
                                            (style.overflow || 'hidden') === opt
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="capitalize">{opt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <h5 className="text-[12px] font-semibold text-gray-900">Position & Stacking</h5>
                            <PositionEditor
                                style={layer.style || {}}
                                onChange={(updates) => updateLayer(selectedLayerId, { style: { ...layer.style, ...updates } })}
                                colors={colors}
                                showZIndex={true}
                                showCoordinates={true}
                                showPositionType={false}
                                allowedPositions={['absolute']}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
