import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Settings2,
  Users,
  KeyRound,
  Webhook,
  Gift,
  Palette,
  ListOrdered,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Shield,
  MoreHorizontal,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

import { theme } from "@/styles/design-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================================================
// Sidebar Nav Item
// ============================================================================
const SidebarNavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer outline-none border-none
      ${active
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-transparent'
      }
    `}
  >
    <Icon size={16} className={active ? 'text-indigo-600' : 'text-gray-400'} />
    {label}
  </button>
);

// ============================================================================
// General Tab Content
// ============================================================================
const GeneralContent = ({ user }: { user: any }) => {
  const orgName = user?.organization?.name || 'Your Organization';
  const orgId = user?.organization?._id || user?.organization?.id || '—';
  const userName = user?.name || user?.email?.split('@')[0] || '—';
  const userEmail = user?.email || '—';

  return (
    <div>
      {/* Tab Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">General</h2>
        <p className="text-sm text-gray-500 mt-1">Manage general settings for the workspace</p>
      </div>

      {/* Organization Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900">Organization</h3>
          <p className="text-sm text-gray-500 mt-0.5">Information related to your organization, editable only by admins</p>
        </div>
        <div className="border-t border-gray-100 pt-6 space-y-5">
          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Client ID</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 font-mono border border-gray-200">
                {orgId}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(orgId);
                  toast.success('Client ID copied to clipboard');
                }}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                title="Copy"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization Name</label>
            <div className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200">
              {orgName}
            </div>
          </div>

          {/* Name + Email row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200">
                {userName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200">
                {userEmail}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Section — inside General */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Account Security</h3>
            <p className="text-sm text-gray-500 mt-0.5">Manage your password and security settings</p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6">
          <form
            className="space-y-4 max-w-md"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
              const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
              const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

              if (newPassword !== confirmPassword) {
                toast.error('New passwords do not match');
                return;
              }
              if (newPassword.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
              }
              try {
                await apiClient.changePassword({ currentPassword, newPassword });
                toast.success('Password updated successfully');
                form.reset();
              } catch (error) {
                console.error('Failed to change password', error);
                toast.error('Failed to update password. Check your current password.');
              }
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required placeholder="Enter current password" className="bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required placeholder="Enter new password" className="bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="Confirm new password" className="bg-white" />
            </div>
            <Button type="submit" className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Team Tab Content
// ============================================================================
const TeamContent = ({ user }: { user: any }) => {
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

  React.useEffect(() => { fetchTeam(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await apiClient.inviteUser(email, name, role);
      if (res.tempPassword) {
        alert(`User invited successfully!\n\nEmail: ${email}\nTemporary Password: ${res.tempPassword}\n\nPlease share these credentials with the user securely.`);
      } else {
        toast.success('Invitation sent successfully');
      }
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
    <div>
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Team</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your team here</p>
        </div>
      </div>

      {/* Team members card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Team members</h3>
            <p className="text-sm text-gray-500 mt-0.5">These are all your team members.</p>
          </div>
          {user?.role === 'client_admin' && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                  <Plus size={16} />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a colleague to join your organization.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteName">Full Name <span className="text-red-500">*</span></Label>
                    <Input id="inviteName" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">Email Address <span className="text-red-500">*</span></Label>
                    <Input id="inviteEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteRole">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Loading team...</td></tr>
              ) : !team || team.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No team members yet. Invite someone!</td></tr>
              ) : (
                team.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {member.name || member.email?.split('@')[0] || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{member.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide
                        ${member.role === 'admin' || member.role === 'client_admin' ? 'text-gray-800' :
                          member.role === 'editor' ? 'text-gray-600' : 'text-gray-500'}
                      `}>
                        {member.role?.replace('client_', '').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {user?.role === 'client_admin' && member._id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent">
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700"
                              onClick={() => handleRemove(member._id)}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Keys Tab Content
// ============================================================================
const KeysContent = ({ user }: { user: any }) => {
  const [apiKey, setApiKeyState] = React.useState("Loading...");
  const [showKey, setShowKey] = React.useState(false);

  React.useEffect(() => {
    import("@/lib/api").then((api) => {
      setApiKeyState(api.getApiKey() || "No API Key Found");
    });
  }, []);

  const maskedKey = apiKey !== "Loading..." && apiKey !== "No API Key Found"
    ? '•'.repeat(Math.max(0, apiKey.length - 4)) + apiKey.slice(-4)
    : apiKey;

  return (
    <div>
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Keys</h2>
        <p className="text-sm text-gray-500 mt-1">Manage all your personal keys and secret keys.</p>
      </div>

      {/* Public Keys */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Public Keys</h3>
            <p className="text-sm text-gray-500 mt-0.5">These are your public keys, use them in the SDK.</p>
          </div>
          <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
            <Plus size={16} />
            Create new public key
          </Button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">Client Default Key</td>
                <td className="px-5 py-3.5 font-mono text-sm text-gray-600">
                  {showKey ? apiKey : maskedKey}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
                      title={showKey ? "Hide key" : "Show key"}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        toast.success("API Key copied to clipboard");
                      }}
                      className="p-2 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
                      title="Copy key"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Secret Keys */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Secret Keys</h3>
            <p className="text-sm text-gray-500 mt-0.5">These are all your private keys. Keep them somewhere safe.</p>
          </div>
          <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
            <Plus size={16} />
            Create new secret key
          </Button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">webhook key</td>
                <td className="px-5 py-3.5 text-gray-600">Webhook</td>
                <td className="px-5 py-3.5 text-gray-600">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="px-5 py-3.5 text-gray-600">{user?.email || '—'}</td>
                <td className="px-5 py-3.5 text-right">
                  <button className="p-2 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Webhooks Tab Content (preserved from original)
// ============================================================================
const WebhooksContent = () => {
  const { webhookUrl, setWebhookUrl } = useStore();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Webhooks</h2>
        <p className="text-sm text-gray-500 mt-1">Receive real-time notifications about campaign events</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl" className="text-sm font-medium text-gray-700">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                placeholder="https://your-domain.com/webhooks/nudge"
                className="font-mono text-sm bg-white"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => toast.success("Webhook URL saved successfully")}
              >
                Save
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm font-semibold mb-2 text-blue-900">Supported Events</p>
            <ul className="text-xs space-y-2 text-blue-800">
              <li className="flex items-center gap-2">✓ campaign.impression — When a nudge is shown</li>
              <li className="flex items-center gap-2">✓ campaign.click — When a user clicks a nudge</li>
              <li className="flex items-center gap-2">✓ campaign.conversion — When a conversion goal is met</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Placeholder tabs for future workspace items
// ============================================================================
const PlaceholderContent = ({ title, description }: { title: string; description: string }) => (
  <div>
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
        <Settings2 size={24} className="text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Coming Soon</h3>
      <p className="text-sm text-gray-500 max-w-sm">This feature is currently under development and will be available soon.</p>
    </div>
  </div>
);

// ============================================================================
// Main Settings Page
// ============================================================================
type SettingsTab = 'general' | 'team' | 'keys' | 'webhooks' | 'referral' | 'brand' | 'prioritization';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('general');

  const accountItems: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'General', icon: Settings2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'keys', label: 'Keys', icon: KeyRound },
  ];

  const workspaceItems: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'referral', label: 'Referral Settings', icon: Gift },
    { id: 'brand', label: 'Brand Guidelines', icon: Palette },
    { id: 'prioritization', label: 'Prioritization', icon: ListOrdered },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralContent user={user} />;
      case 'team':
        return <TeamContent user={user} />;
      case 'keys':
        return <KeysContent user={user} />;
      case 'webhooks':
        return <WebhooksContent />;
      case 'referral':
        return <PlaceholderContent title="Referral Settings" description="Configure your referral program settings" />;
      case 'brand':
        return <PlaceholderContent title="Brand Guidelines" description="Set up your brand colors, fonts, and assets" />;
      case 'prioritization':
        return <PlaceholderContent title="Prioritization" description="Configure campaign prioritization rules" />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50], display: 'flex' }}>
      {/* Left Sidebar Navigation */}
      <aside className="w-[200px] min-w-[200px] border-r border-gray-200 bg-white py-6 px-3 flex flex-col gap-6 overflow-y-auto">
        {/* ACCOUNT section */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Account</p>
          <div className="space-y-0.5">
            {accountItems.map(item => (
              <SidebarNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </div>
        </div>

        {/* WORKSPACE section */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Workspace</p>
          <div className="space-y-0.5">
            {workspaceItems.map(item => (
              <SidebarNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Settings;
