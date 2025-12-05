import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, Mail, CheckCircle } from "lucide-react";
import { theme } from "@/styles/design-tokens";

// ... inside component
export const TeamSettings = () => {
    const { user } = useAuth();
    const [team, setTeam] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [inviteLoading, setInviteLoading] = React.useState(false);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState('editor');

    const fetchTeam = async () => {
        try {
            const res = await apiClient.listTeam();
            setTeam(res.team);
        } catch (error) {
            console.error('Failed to fetch team', error);
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTeam();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.endsWith('@gmail.com')) {
            toast.error('Only Gmail addresses are supported currently');
            return;
        }

        setInviteLoading(true);
        try {
            await apiClient.inviteUser(email, name, role);
            toast.success('Invitation sent successfully');
            setInviteOpen(false);
            setName('');
            setEmail('');
            fetchTeam();
        } catch (error) {
            console.error('Failed to invite user', error);
            toast.error('Failed to send invitation');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!window.confirm('Are you sure you want to remove this team member?')) return;

        try {
            await apiClient.removeUser(userId);
            toast.success('Team member removed');
            fetchTeam();
        } catch (error) {
            console.error('Failed to remove user', error);
            toast.error('Failed to remove team member');
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border.default}`,
            padding: '32px',
            maxWidth: '800px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* ... icon and title ... */}
                    <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: theme.colors.primary[50], color: theme.colors.primary[600] }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary }}>Team Members</h3>
                        <p style={{ fontSize: '14px', color: theme.colors.text.secondary }}>Manage access to your organization</p>
                    </div>
                </div>

                {/* Only Client Admin can invite */}
                {user?.role === 'client_admin' && (
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Plus size={16} />
                                Invite Member
                            </Button>
                        </DialogTrigger>
                        {/* ... Dialog Content ... */}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite Team Member</DialogTitle>
                                <DialogDescription>
                                    Invite a colleague to join your organization. They must use a Gmail account.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleInvite} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Gmail Address <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="colleague@gmail.com"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">Must be a valid @gmail.com address</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="editor">Editor (Can create campaigns)</SelectItem>
                                            <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={inviteLoading}>
                                        {inviteLoading ? 'Sending...' : 'Send Invitation'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading team...</td></tr>
                        ) : team.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No team members yet. Invite someone!</td></tr>
                        ) : (
                            team.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.email}</div>
                                                <div className="text-xs text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.googleId ? (
                                            <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                                                <CheckCircle size={14} /> Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                                                <Mail size={14} /> Invited
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {user?.role === 'client_admin' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemove(user._id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
