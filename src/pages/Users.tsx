import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Users,
    Filter,
    Download,
    Columns,
    ChevronDown,
    Plus,
    Calendar,
    Activity
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
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

import { useStore } from "@/store/useStore";

const UsersPage = () => {
    const { segments } = useStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchBy, setSearchBy] = useState<'name' | 'email' | 'id'>('name');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

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
                    status: 'active', // TODO: Add status to backend
                    lastActive: u.last_seen,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=random`,
                    location: u.properties?.location || 'Unknown',
                    device: u.device?.model || u.device?.platform || 'Unknown',
                    segments: [], // TODO: Add segments to backend
                    properties: u.properties || {},
                    events: [] // Fetched on detail view
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

    const navigate = useNavigate();

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
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: user.status === 'active' ? '#DEF7EC' : '#F3F4F6',
                    color: user.status === 'active' ? '#03543F' : '#6B7280',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                }}>
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

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
            <PageHeader
                title="Users"
                subtitle=""
                actions={
                    <Button variant="outline" className="gap-2 bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                        <Plus size={16} />
                        Create Cohort
                    </Button>
                }
            />

            {/* Custom Full Width Container */}
            <div style={{ padding: '32px', maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: theme.borderRadius.lg,
                            border: `1px solid ${theme.colors.border.default}`,
                            boxShadow: theme.shadows.sm,
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '16px 24px',
                                borderBottom: `1px solid ${theme.colors.border.default}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
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

                                    <div style={{ width: '300px' }}>
                                        <SearchInput
                                            placeholder={`Search by ${searchBy}...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button variant="ghost" className="gap-2 text-gray-500">
                                    <Columns size={14} />
                                    Toggle Columns
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
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: theme.borderRadius.lg,
                            border: `1px solid ${theme.colors.border.default}`,
                            boxShadow: theme.shadows.sm,
                            padding: '24px'
                        }}>
                            {segments.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-gray-900">No cohorts found</p>
                                    <p className="text-sm text-gray-500 mt-1">Create segments to group your users into cohorts.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => navigate('/segments')}
                                    >
                                        Go to Segments
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {segments.map((segment) => (
                                        <div
                                            key={segment.id}
                                            className="p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer bg-white group"
                                            onClick={() => navigate('/segments')}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{segment.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">Created {new Date(segment.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                                                    <Users size={12} />
                                                    {segment.users.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {segment.rules.slice(0, 3).map((rule: any) => (
                                                        <span key={rule.id} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs border border-gray-100">
                                                            {rule.field} {rule.operator} {rule.value}
                                                        </span>
                                                    ))}
                                                    {segment.rules.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-500 text-xs">
                                                            +{segment.rules.length - 3} more
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
