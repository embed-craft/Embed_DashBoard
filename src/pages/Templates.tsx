import React, { useState } from 'react';
import { theme } from '@/styles/design-tokens';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
    Search,
    Plus,
    LayoutTemplate,
    MoreHorizontal,
    Trash2,
    Copy,
    Smartphone,
    Monitor,
    Filter,
    Clock,
    User as UserIcon,
    History
} from 'lucide-react';
import { useStore, Template } from '@/store/useStore';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { CreateTemplateDialog } from '@/components/campaign/CreateTemplateDialog';

// Helper to generate consistent color from string
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
};

const UserAvatar = ({ user, className }: { user?: { name: string, email: string }, className?: string }) => {
    if (!user) return null;
    const displayName = user.name || user.email.split('@')[0]; // Fallback to email username
    const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
    const bg = stringToColor(user.email || 'default');

    return (
        <Avatar className={className}>
            <AvatarFallback style={{ backgroundColor: `${bg}20`, color: bg, borderColor: `${bg}40`, borderStyle: 'solid', borderWidth: '1px' }} className="text-xs font-medium">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
};

const Templates = () => {
    const navigate = useNavigate();
    const { templates, fetchTemplates, deleteTemplate } = useStore();

    React.useEffect(() => {
        fetchTemplates();
    }, []);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('your_templates');

    const handleEdit = (template: any) => {
        const templateId = template._id || template.id;
        navigate(`/campaign-builder?mode=template&id=${templateId}`);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this template?')) {
            deleteTemplate(id);
            toast.success('Template deleted');
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isSystem = template.type === 'system' || (template as any).is_system; // Handle legacy check

        if (activeTab === 'system') return matchesSearch && isSystem;
        if (activeTab === 'your_templates') return matchesSearch && !isSystem; // Simplification, ideally verify ownership
        return matchesSearch;
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9F9F7' }}>
            <PageHeader
                title="Templates"
                subtitle="Design and manage campaign templates"
                actions={
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-black text-white hover:bg-gray-800">
                        <Plus className="mr-2 h-4 w-4" /> Create Template
                    </Button>
                }
            />

            <PageContainer>
                <div className="flex flex-col space-y-6">
                    {/* Controls Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                            <TabsList className="bg-gray-100 p-1">
                                <TabsTrigger value="your_templates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Your Templates</TabsTrigger>
                                <TabsTrigger value="system" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">System Library</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-[300px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 bg-gray-50 border-gray-200"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                                <Filter className="h-4 w-4 text-gray-500" />
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    {filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <LayoutTemplate className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                            <p className="mt-1 text-sm text-gray-500 max-w-sm text-center">
                                {searchQuery ? `No matches for "${searchQuery}"` : "Get started by creating your first template manually."}
                            </p>
                            {!searchQuery && (
                                <Button variant="outline" className="mt-6" onClick={() => setIsCreateOpen(true)}>
                                    Create New Template
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredTemplates.map((template) => (
                                <Card
                                    key={template.id || template._id}
                                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 bg-white"
                                    onClick={() => handleEdit(template)}
                                >
                                    {/* Thumbnail Area */}
                                    <div className="aspect-[16/10] bg-gray-50 relative border-b border-gray-100 overflow-hidden">
                                        {/* Mockup / Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                                            {template.type === 'modal' ? <Smartphone size={48} strokeWidth={1} /> : <Monitor size={48} strokeWidth={1} />}
                                        </div>

                                        {/* Type Badge */}
                                        <div className="absolute top-3 left-3">
                                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm border border-gray-100/50 shadow-sm text-xs font-normal uppercase tracking-wide">
                                                {template.type}
                                            </Badge>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                            <Button size="sm" variant="secondary" className="h-8 text-xs font-medium">
                                                Edit Design
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Details Area */}
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900 truncate pr-2 group-hover:text-purple-600 transition-colors">
                                                {template.name}
                                            </h3>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-gray-400 hover:text-gray-900" onClick={(e) => e.stopPropagation()}>
                                                        <MoreHorizontal size={14} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(template); }}>
                                                        Edit Template
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* TODO: duplicate */ }}>
                                                        <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={(e) => handleDelete(template._id || template.id, e)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Collaboration Strip */}
                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center -space-x-2">
                                                <TooltipProvider>
                                                    {template.createdBy && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="relative z-10 ring-2 ring-white rounded-full cursor-help">
                                                                    <UserAvatar user={template.createdBy} className="h-6 w-6" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom" className="text-xs p-3 max-w-[200px]">
                                                                <div className="font-semibold mb-1">Created By</div>
                                                                <div className="mb-2">
                                                                    <p className="font-medium text-gray-900">{template.createdBy.name || template.createdBy.email}</p>
                                                                    <p className="text-gray-400 text-[10px]">{new Date(template.createdAt).toLocaleString()}</p>
                                                                </div>

                                                                {template.lastEditedBy && (
                                                                    <>
                                                                        <div className="font-semibold mb-1 border-t pt-2 mt-1">Last Edited By</div>
                                                                        <div>
                                                                            <p className="font-medium text-gray-900">{template.lastEditedBy.name || template.lastEditedBy.email}</p>
                                                                            <p className="text-gray-400 text-[10px]">{formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </TooltipProvider>
                                            </div>

                                            <div className="flex items-center text-[10px] text-gray-400 font-medium">
                                                <Clock size={10} className="mr-1" />
                                                {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </PageContainer>

            <CreateTemplateDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={(tpl) => handleEdit(tpl)}
            />
        </div >
    );
};

export default Templates;
