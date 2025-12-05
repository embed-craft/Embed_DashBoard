import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '@/store/useEditorStore';
import { DesignStep } from '@/components/campaign/steps/DesignStep';
import { theme } from '@/styles/design-tokens';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TemplateEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        loadCampaign,
        setEditorMode,
        currentCampaign,
        setShowEditor
    } = useEditorStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initEditor = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                setEditorMode('template');

                // Import API dynamically to avoid circular deps
                const api = await import('@/lib/api');
                const template = await api.apiClient.getTemplate(id);

                if (!template) {
                    toast.error('Template not found');
                    navigate('/templates');
                    return;
                }

                // Convert template to campaign format for the editor
                // Ensure we preserve the ID so updates go to the right place
                const campaignData = {
                    ...template,
                    id: template._id || template.id, // Handle MongoDB _id
                    nudgeType: template.type,
                    experienceType: 'nudges', // Default for now
                    status: 'draft',
                    // Ensure layers exist
                    layers: template.layers || [],
                    // Ensure configs exist
                    bottomSheetConfig: template.config?.mode ? template.config : undefined,
                    modalConfig: template.config?.width ? template.config : undefined,
                    // Initialize other required fields
                    history: [template.layers || []],
                    historyIndex: 0,
                    createdAt: template.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isDirty: false,
                };

                await loadCampaign(campaignData);
                setShowEditor(true);
            } catch (error) {
                console.error('Failed to load template:', error);
                toast.error('Failed to load template editor');
                navigate('/templates');
            } finally {
                setIsLoading(false);
            }
        };

        initEditor();

        // Cleanup: Reset mode when leaving
        return () => {
            setEditorMode('campaign');
            setShowEditor(false);
        };
    }, [id, navigate, loadCampaign, setEditorMode, setShowEditor]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading Template Editor...</p>
                </div>
            </div>
        );
    }

    if (!currentCampaign) {
        return null;
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-50">
            <DesignStep />
        </div>
    );
};

export default TemplateEditor;
