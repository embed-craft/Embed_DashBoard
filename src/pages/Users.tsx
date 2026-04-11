import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Users,
    Columns,
    ChevronDown,
    Plus,
    X,
    Filter,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/shared/DataTable';
import SearchInput from '@/components/shared/SearchInput';
import { theme } from '@/styles/design-tokens';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { useStore } from "@/store/useStore";
import { useEditorStore } from "@/store/useEditorStore";

const UsersPage = () => {
    const navigate = useNavigate();
    const { segments, addSegment, fetchSegments } = useStore();
    const { availableProperties, fetchMetadata } = useEditorStore();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchBy, setSearchBy] = useState<'name' | 'email' | 'id'>('name');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    // Cohort Builder State
    const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
    const [cohortName, setCohortName] = useState('');
    const [cohortRules, setCohortRules] = useState<any[]>([{ id: Date.now().toString(), type: 'attribute', field: '', operator: 'eq', value: '' }]);
    const [conditionType, setConditionType] = useState<'ALL' | 'ANY'>('ALL');

    useEffect(() => {
        fetchMetadata();
        fetchSegments();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const api = await import('@/lib/api');
                const offset = (page - 1) * LIMIT;
                const data = await api.listUsers({ limit: LIMIT, offset });

                // Map backend user to frontend format
                const mappedUsers = (data.users || []).map((u: any) => ({
                    id: u.user_id,
                    name: u.name || 'Anonymous',
                    email: u.email || '-',
                    status: 'active',
                    lastActive: u.last_seen,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=random`,
                    location: u.properties?.location || 'Unknown',
                    device: u.device?.model || u.device?.platform || 'Unknown',
                    segments: [],
                    properties: u.properties || {},
                    events: []
                }));

                setUsers(mappedUsers);
                setTotalPages(Math.ceil((data.total || 0) / LIMIT));
            } catch (error) {
                console.error('Failed to fetch users:', error);
                toast.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page]);

    const handleUserClick = (user: any) => {
        navigate(`/users/${user.id}`);
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        if (searchBy === 'name') return user.name?.toLowerCase().includes(query);
        if (searchBy === 'email') return user.email?.toLowerCase().includes(query);
        if (searchBy === 'id') return user.id?.toLowerCase().includes(query);
        return false;
    });

    const columns = [
        {
            key: 'name',
            header: 'Name',
            width: '25%',
            render: (user: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                </div>
            )
        },
        { key: 'email', header: 'Email', width: '30%' },
        { key: 'id', header: 'User ID', width: '20%' },
        {
            key: 'status',
            header: 'Status',
            width: '15%',
            render: (user: any) => (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                    {user.status || 'Unknown'}
                </span>
            )
        },
        {
            key: 'lastActive',
            header: 'Last Active',
            width: '10%',
            render: (user: any) => (
                <span className="text-gray-500">
                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : '-'}
                </span>
            )
        }
    ];

    const addRule = () => {
        setCohortRules([...cohortRules, { id: Date.now().toString(), type: 'attribute', field: '', operator: 'eq', value: '' }]);
    };

    const removeRule = (id: string) => {
        setCohortRules(cohortRules.filter(r => r.id !== id));
    };

    const updateRule = (id: string, updates: any) => {
        setCohortRules(cohortRules.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const handleCreateCohort = async () => {
        if (!cohortName.trim()) {
            toast.error("Cohort Name is required.");
            return;
        }

        const validRules = cohortRules.filter(r => r.field && r.operator && r.value);
        if (validRules.length === 0) {
            toast.error("At least one valid condition is required.");
            return;
        }

        const payload = {
            name: cohortName,
            conditions: conditionType,
            rules: validRules,
            users: 0 // initial size
        };

        try {
            await addSegment(payload);
            toast.success("Cohort created successfully!");
            setIsCohortModalOpen(false);
            setCohortName('');
            setCohortRules([{ id: Date.now().toString(), type: 'attribute', field: '', operator: 'eq', value: '' }]);
            setConditionType('ALL');
        } catch(e) {
            toast.error("Failed to create cohort.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="Users"
                subtitle=""
                actions={
                    <Button 
                        variant="default" 
                        onClick={() => setIsCohortModalOpen(true)}
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Plus size={16} />
                        Create Cohort
                    </Button>
                }
            />

            <div className="p-8 max-w-full mx-auto flex flex-col gap-8">
                {/* INLINE COHORT BUILDER MODAL */}
                {isCohortModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Create Cohort</h2>
                                    <p className="text-sm text-gray-500 mt-1">Define an audience using user properties.</p>
                                </div>
                                <button onClick={() => setIsCohortModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Cohort Name</label>
                                        <Input 
                                            placeholder="e.g. VIP Users" 
                                            value={cohortName} 
                                            onChange={(e) => setCohortName(e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <label className="text-sm font-medium text-gray-700">Conditions match:</label>
                                            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                                                <button
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${conditionType === 'ALL' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                                    onClick={() => setConditionType('ALL')}
                                                >
                                                    ALL (And)
                                                </button>
                                                <button
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${conditionType === 'ANY' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                                    onClick={() => setConditionType('ANY')}
                                                >
                                                    ANY (Or)
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {cohortRules.map((rule, idx) => (
                                                <div key={rule.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                                    <span className="text-xs font-medium text-gray-400 w-12 shrink-0">
                                                        {idx === 0 ? 'Where' : (conditionType === 'ALL' ? 'And' : 'Or')}
                                                    </span>
                                                    
                                                    <select 
                                                        className="flex-1 text-sm border-gray-300 rounded-md py-1.5 px-2 bg-gray-50 border focus:border-purple-500 focus:ring-purple-500"
                                                        value={rule.field}
                                                        onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                                                    >
                                                        <option value="">Select Property...</option>
                                                        {availableProperties.map(prop => (
                                                            <option key={prop._id || prop.name} value={prop.name}>{prop.name || prop._id}</option>
                                                        ))}
                                                    </select>

                                                    <select 
                                                        className="w-32 text-sm border-gray-300 rounded-md py-1.5 px-2 bg-gray-50 border focus:border-purple-500 focus:ring-purple-500"
                                                        value={rule.operator}
                                                        onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                                                    >
                                                        <option value="eq">Equals</option>
                                                        <option value="neq">Not equals</option>
                                                        <option value="contains">Contains</option>
                                                        <option value="gt">Greater than</option>
                                                        <option value="lt">Less than</option>
                                                    </select>

                                                    <input 
                                                        type="text" 
                                                        className="flex-1 text-sm border-gray-300 rounded-md py-1.5 px-2 bg-gray-50 border focus:border-purple-500 focus:ring-purple-500"
                                                        placeholder="Value"
                                                        value={rule.value}
                                                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                                    />

                                                    {cohortRules.length > 1 && (
                                                        <button onClick={() => removeRule(rule.id)} className="text-red-400 hover:text-red-600 p-1">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={addRule}
                                            className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1.5 mt-2"
                                        >
                                            <Plus size={16} />
                                            Add Condition
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                                <Button variant="outline" onClick={() => setIsCohortModalOpen(false)}>Cancel</Button>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleCreateCohort}>Save Cohort</Button>
                            </div>
                        </div>
                    </div>
                )}


                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start h-auto p-0 rounded-none mb-6">
                        <TabsTrigger
                            value="users"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
                        >
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                Users
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="cohorts"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
                        >
                            <div className="flex items-center gap-2">
                                <Users size={16} />
                                Cohorts
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="mt-0">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
                                <div className="flex gap-3 items-center flex-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="gap-2 capitalize">
                                                Search By: {searchBy}
                                                <ChevronDown size={14} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => setSearchBy('name')}>Name</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSearchBy('email')}>Email</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSearchBy('id')}>ID</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="w-[300px]">
                                        <SearchInput
                                            placeholder={`Search by ${searchBy}...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button variant="ghost" className="gap-2 text-gray-500">
                                    <Columns size={14} />
                                    Columns
                                </Button>
                            </div>

                            <DataTable
                                data={filteredUsers}
                                columns={columns}
                                isLoading={loading}
                                onRowClick={handleUserClick}
                                emptyMessage="No users found."
                            />

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Page {page} of {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1 || loading}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages || loading}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="cohorts">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            {segments.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-gray-900">No cohorts found</p>
                                    <p className="text-sm text-gray-500 mt-1">Create cohorts to group your users using property filters.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4 border-purple-200 text-purple-700 hover:bg-purple-50"
                                        onClick={() => setIsCohortModalOpen(true)}
                                    >
                                        <Plus size={16} className="mr-2" /> Create First Cohort
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {segments.map((segment) => (
                                        <div
                                            key={segment.id}
                                            className="p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer bg-white group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{segment.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">Created {new Date(segment.createdAt || Date.now()).toLocaleDateString()}</p>
                                                </div>
                                                <div className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                                                    <Users size={12} />
                                                    {segment.users?.toLocaleString() || '0'}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(segment.rules || []).slice(0, 3).map((rule: any) => (
                                                        <span key={rule.id} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs border border-gray-100">
                                                            {rule.field} {rule.operator} {rule.value}
                                                        </span>
                                                    ))}
                                                    {(segment.rules || []).length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-500 text-xs">
                                                            +{(segment.rules || []).length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default UsersPage;
