import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Flag,
  Palette,
  Save,
  Rocket,
  CheckCircle2,
  Tag,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditorStore } from '@/store/useEditorStore';
import { TargetingStep } from '@/components/campaign/targeting/TargetingStep';
import { GoalsRolloutStep } from '@/components/campaign/steps/GoalsRolloutStep';
import { DesignStep } from '@/components/campaign/steps/DesignStep';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

type Step = 'targeting' | 'goals' | 'design';

const CampaignBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState<Step>('targeting');

  const {
    currentCampaign,
    loadCampaign,
    saveCampaign,
    updateCampaignName,
    isSaving,
    updateStatus,
    createCampaign,
    resetCurrentCampaign,
    updateTags
  } = useEditorStore();

  // Load campaign on mount
  useEffect(() => {
    const campaignId = searchParams.get('id');
    const experienceType = searchParams.get('experience');

    if (campaignId) {
      // Don't reload if it's already the current campaign (prevents overwriting local drafts)
      if (currentCampaign?.id === campaignId) return;
      loadCampaign(campaignId);
    }
  }, [searchParams, loadCampaign, currentCampaign?.id]);

  // Handle new campaign flow
  useEffect(() => {
    const experienceType = searchParams.get('experience');
    const nudgeType = searchParams.get('nudge');
    const campaignId = searchParams.get('id');

    // If we are in "Create New" mode (experience param exists, but NO campaign ID in URL)
    if (experienceType && !campaignId) {
      // If no nudge type is selected, we MUST reset the current campaign to show the selection screen
      if (!nudgeType) {
        if (currentCampaign) {
          resetCurrentCampaign();
        }
        setActiveStep('design');
      }
      // If nudge type IS selected, we create the campaign (if not already created matching this type)
      else {
        // Only create if we don't have a campaign or it's a different type/stale
        // But simpler: just let the user create it.
        // To avoid loops, check if currentCampaign matches the intent.
        if (!currentCampaign || currentCampaign.nudgeType !== nudgeType) {
          createCampaign(experienceType as any, nudgeType as any);
          setActiveStep('design');
        }
      }
    }
  }, [searchParams, createCampaign, resetCurrentCampaign, currentCampaign?.nudgeType]); // Minimized dependencies

  const handleSave = async () => {
    if (!currentCampaign) return;
    try {
      await saveCampaign();
      toast.success('Campaign saved successfully');
    } catch (error) {
      toast.error('Failed to save campaign');
    }
  };

  const handleLaunch = async () => {
    if (!currentCampaign) return;
    try {
      updateStatus('active');
      await saveCampaign();
      toast.success('Campaign launched successfully!');
      setTimeout(() => navigate('/campaigns'), 1500);
    } catch (error) {
      toast.error('Failed to launch campaign');
    }
  };

  const steps = [
    { id: 'targeting', label: 'Targeting', icon: Target },
    { id: 'goals', label: 'Goals & Rollout', icon: Flag },
    { id: 'design', label: 'Design', icon: Palette },
  ];

  if (!currentCampaign && !searchParams.get('id')) {
    // If no campaign loaded and no ID, maybe redirect or show loading
    // But CreateCampaignModal should have created one and navigated here with ID?
    // Actually CreateCampaignModal navigates to /campaign-builder WITHOUT ID in the previous code.
    // I need to fix CreateCampaignModal to pass the ID, OR handle "new campaign" state here.
    // If "new campaign", useEditorStore.currentCampaign might be set by CreateCampaignModal before navigation.
    // Let's assume currentCampaign is set if we came from Modal.
  }

  // In Design step, show only the editor (fullscreen)
  // if (activeStep === 'design') {
  //   return <DesignStep />;
  // }

  // For other steps, show the Campaign Builder layout with step navigation
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold">Campaign Builder</span>
        </div>

        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id as Step)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {step.label}
                  {isActive && <div className="ml-auto w-1 h-4 bg-primary rounded-full" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t text-xs text-muted-foreground">
          <p>Campaign ID:</p>
          <code className="bg-muted px-1 py-0.5 rounded">{currentCampaign?.id || 'New'}</code>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Input
              value={currentCampaign?.name || ''}
              onChange={(e) => updateCampaignName(e.target.value)}
              className="max-w-md font-medium text-lg border-transparent hover:border-input focus:border-input transition-colors px-0"
              placeholder="Untitled Campaign"
            />
            {currentCampaign?.status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentCampaign.status === 'active' ? 'bg-green-100 text-green-700' :
                currentCampaign.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                {currentCampaign.status.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Tag className="w-4 h-4" />
                  {currentCampaign?.tags?.length ? `${currentCampaign.tags.length} Tags` : 'Tags'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">Manage Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentCampaign?.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => {
                            const newTags = currentCampaign.tags?.filter((t) => t !== tag) || [];
                            updateTags(newTags);
                          }}
                        />
                      </Badge>
                    ))}
                    {!currentCampaign?.tags?.length && (
                      <span className="text-sm text-muted-foreground italic">No tags added</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          const val = input.value.trim();
                          if (val && !currentCampaign?.tags?.includes(val)) {
                            updateTags([...(currentCampaign?.tags || []), val]);
                            input.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={handleLaunch}>
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </Button>
          </div>
        </header>

        {/* Step Content */}
        <main className="flex-1 overflow-hidden relative">
          {!currentCampaign && !searchParams.get('experience') ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">No Campaign Loaded</h3>
                <p className="text-muted-foreground">Please select a campaign or create a new one.</p>
              </div>
              <Button onClick={() => navigate('/campaigns')}>
                Go to Campaigns
              </Button>
            </div>
          ) : (
            <>
              {activeStep === 'targeting' && <TargetingStep />}
              {activeStep === 'goals' && <GoalsRolloutStep />}
              {activeStep === 'design' && <DesignStep />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CampaignBuilder;
