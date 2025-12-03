import React, { useState } from 'react';
import { theme } from '@/styles/design-tokens';
import { toast } from 'sonner';
import {
    Search,
    Plus,
    LayoutTemplate,
    MoreHorizontal,
    Trash2,
    Copy,
    Smartphone,
    Monitor
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Templates = () => {
    const { templates, fetchTemplates, addTemplate, deleteTemplate } = useStore();

    React.useEffect(() => {
        fetchTemplates();
    }, []);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: '', type: 'modal' });

    const handleCreate = () => {
        if (!newTemplate.name) {
            toast.error('Please enter a template name');
            return;
        }
        addTemplate(newTemplate);
        setNewTemplate({ name: '', type: 'modal' });
        setIsCreateOpen(false);
        toast.success('Template created successfully');
    };

    const handleDelete = (id: string) => {
        deleteTemplate(id);
        toast.success('Template deleted');
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
            <PageHeader
                title="Templates"
                subtitle="Manage your campaign templates"
                actions={
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                                <Plus size={16} />
                                New Template
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Template</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Template Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Holiday Sale Banner"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <select
                                        id="type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newTemplate.type}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                                    >
                                        <option value="modal">Modal</option>
                                        <option value="banner">Banner</option>
                                        <option value="tooltip">Tooltip</option>
                                        <option value="floater">Floater</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">Create Template</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            />

            <PageContainer>
                <Tabs defaultValue="your_templates" className="w-full">
                    <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start h-auto p-0 rounded-none mb-6">
                        <TabsTrigger
                            value="your_templates"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
                        >
                            Your Templates
                        </TabsTrigger>
                        <TabsTrigger
                            value="general_templates"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
                        >
                            General Templates
                        </TabsTrigger>
                    </TabsList>

                    <div className="mb-6 w-[300px]">
                        <SearchInput
                            placeholder="Search Templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <TabsContent value="your_templates" className="mt-0">
                        {filteredTemplates.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                <LayoutTemplate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTemplates.map((template) => (
                                    <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                        <div className="aspect-[4/3] bg-gray-100 relative flex items-center justify-center">
                                            {template.type === 'modal' ? <Smartphone className="text-gray-400 h-12 w-12" /> : <Monitor className="text-gray-400 h-12 w-12" />}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button variant="secondary" size="sm">Preview</Button>
                                                <Button variant="secondary" size="sm">Use</Button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1 capitalize">{template.type}</p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                            <MoreHorizontal size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                                <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="general_templates">
                        <div className="text-center py-12 text-gray-500">
                            General templates coming soon.
                        </div>
                    </TabsContent>
                </Tabs>
            </PageContainer>
        </div>
    );
};

export default Templates;
