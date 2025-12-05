import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, TrendingUp, X, Loader2, Globe, Building2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Template {
  _id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  tags: string[];
  config: any;
  is_system: boolean;
  organization_id: string;
}

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  onStartBlank: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onStartBlank,
}) => {
  const [activeTab, setActiveTab] = useState("system");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch templates on open
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.listTemplates({ search: searchQuery });
      setTemplates(res.templates);
    } catch (error) {
      console.error("Failed to fetch templates", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on active tab
  const filteredTemplates = templates.filter((template) => {
    if (activeTab === "system") return template.is_system;
    if (activeTab === "mine") return !template.is_system;
    return true;
  });

  const handleUseTemplate = (template: Template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !previewTemplate} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <DialogTitle className="text-2xl font-bold">Choose a Template</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Start with a professional design or use your team's templates
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="system" className="gap-2">
                    <Globe size={14} /> System Templates
                  </TabsTrigger>
                  <TabsTrigger value="mine" className="gap-2">
                    <Building2 size={14} /> My Templates
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTemplates()}
                  className="pl-10 h-9"
                />
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-gray-50/50">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {/* Blank Canvas Option (Always first) */}
                  <Card
                    className="group cursor-pointer hover:shadow-xl transition-all duration-200 border-2 border-dashed border-gray-200 hover:border-primary/50 bg-white"
                    onClick={() => {
                      onStartBlank();
                      onClose();
                    }}
                  >
                    <div className="h-48 bg-gray-50 flex items-center justify-center border-b group-hover:bg-gray-100 transition-colors">
                      <div className="text-center">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">✨</div>
                        <p className="text-gray-600 font-medium">Start from Scratch</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-1">Blank Canvas</h3>
                      <p className="text-xs text-gray-500">
                        Create your own design with complete freedom
                      </p>
                    </div>
                  </Card>

                  {filteredTemplates.map((template) => (
                    <Card
                      key={template._id}
                      className="group cursor-pointer hover:shadow-xl transition-all duration-200 overflow-hidden bg-white"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <div className="h-48 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center border-b relative overflow-hidden group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-blue-100 transition-colors">
                        <div className="text-6xl group-hover:scale-110 transition-transform duration-300 select-none">
                          {template.thumbnail || '🎨'}
                        </div>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseTemplate(template);
                            }}
                            className="bg-white text-black hover:bg-gray-100 font-medium"
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-base truncate" title={template.name}>{template.name}</h3>
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-5 shrink-0">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">
                          {template.description || 'No description provided'}
                        </p>

                        <div className="flex gap-1 flex-wrap">
                          {template.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 h-5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold mb-2">No templates found</h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    {activeTab === 'mine'
                      ? "You haven't saved any templates yet."
                      : "Try adjusting your search."}
                  </p>
                  {activeTab === 'mine' ? (
                    <p className="text-xs text-gray-400">Save a design as a template to see it here.</p>
                  ) : (
                    <Button variant="outline" onClick={() => setSearchQuery("")} size="sm">
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={true} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <span className="text-4xl">{previewTemplate.thumbnail || '🎨'}</span>
                {previewTemplate.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p className="text-gray-700">{previewTemplate.description || 'No description'}</p>
              </div>

              <div className="flex gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                  <Badge variant="secondary">{previewTemplate.category}</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Tags</h4>
                  <div className="flex gap-1 flex-wrap">
                    {previewTemplate.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t mt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  Use This Template
                </Button>
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Back to Gallery
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
