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
      w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-all duration-150 cursor-pointer outline-none border-none
      ${active
        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600/20'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-transparent'
      }
    `}
  >
    <Icon size={18} className={active ? 'text-blue-600' : 'text-gray-500'} />
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
    <div className="max-w-4xl">
      {/* Tab Title */}
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">General Settings</h2>
        <p className="text-base text-gray-500 mt-2">Manage general workspace configuration and organization details.</p>
      </div>

      {/* Organization Section */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-lg mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Organization Information</h3>
          <p className="text-sm text-gray-500 mt-1">Information related to your organization, editable only by admins.</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Client ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Client ID</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 rounded-md text-base text-gray-800 font-mono border border-gray-300 shadow-sm">
                {orgId}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(orgId);
                  toast.success('Client ID copied to clipboard');
                }}
                className="h-auto py-3 px-4 border-gray-300 text-gray-700 hover:bg-gray-100 text-base font-medium shadow-sm"
                title="Copy"
              >
                <Copy size={18} className="mr-2 text-gray-500" />
                Copy
              </Button>
            </div>
          </div>

          {/* Organization Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
            <div className="px-4 py-3 bg-gray-50 rounded-md text-base text-gray-800 border border-gray-300 shadow-sm">
              {orgName}
            </div>
          </div>

          {/* Name + Email row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
              <div className="px-4 py-3 bg-gray-50 rounded-md text-base text-gray-800 border border-gray-300 shadow-sm">
                {userName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="px-4 py-3 bg-gray-50 rounded-md text-base text-gray-800 border border-gray-300 shadow-sm">
                {userEmail}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Section */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-white border border-gray-200 shadow-sm text-gray-700">
            <Shield size={22} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your password and security settings.</p>
          </div>
        </div>
        <div className="p-6">
          <form
            className="space-y-6 max-w-md"
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
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required placeholder="Enter current password" className="bg-white border-gray-300 shadow-sm h-11 text-base px-4 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required placeholder="Enter new password" className="bg-white border-gray-300 shadow-sm h-11 text-base px-4 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="Confirm new password" className="bg-white border-gray-300 shadow-sm h-11 text-base px-4 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <Button type="submit" className="mt-4 bg-gray-900 hover:bg-black text-white h-11 px-6 text-base font-medium rounded-md shadow-sm">
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
    <div className="max-w-5xl">
      {/* Title */}
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Team Management</h2>
        <p className="text-base text-gray-500 mt-2">Manage roles and permissions for your team members.</p>
      </div>

      {/* Team members card */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Members</h3>
            <p className="text-sm text-gray-500 mt-1">Users who have access to this workspace.</p>
          </div>
          {user?.role === 'client_admin' && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 px-4 bg-gray-900 hover:bg-black text-white text-base font-medium rounded-md shadow-sm">
                  <Plus size={18} className="mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl">Invite Team Member</DialogTitle>
                  <DialogDescription className="text-base mt-2">
                    Invite a colleague to join your organization and grant them access.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="inviteName" className="text-sm font-semibold">Full Name <span className="text-red-500">*</span></Label>
                    <Input id="inviteName" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required className="h-11 text-base focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail" className="text-sm font-semibold">Email Address <span className="text-red-500">*</span></Label>
                    <Input id="inviteEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" required className="h-11 text-base focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteRole" className="text-sm font-semibold">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-11 text-base focus:ring-blue-500 focus:border-blue-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Editor (Can create campaigns)</SelectItem>
                        <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={inviteLoading} className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700">
                      {inviteLoading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-base text-left">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-base">Loading team...</td></tr>
              ) : !team || team.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-base flex flex-col items-center gap-3">
                    <Users size={32} className="text-gray-300"/>
                    No team members yet. Invite someone!
                </td></tr>
              ) : (
                team.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {member.name || member.email?.split('@')[0] || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border
                        ${member.role === 'admin' || member.role === 'client_admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          member.role === 'editor' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
                      `}>
                        {member.role?.replace('client_', '').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user?.role === 'client_admin' && member._id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer border border-transparent hover:border-gray-300 bg-transparent">
                              <MoreHorizontal size={20} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="text-red-700 focus:text-red-800 focus:bg-red-50 text-base py-2 cursor-pointer"
                              onClick={() => handleRemove(member._id)}
                            >
                              <Trash2 size={16} className="mr-3" />
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
    <div className="max-w-5xl">
      {/* Title */}
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">API Keys</h2>
        <p className="text-base text-gray-500 mt-2">Manage your public and private keys for SDK and API integration.</p>
      </div>

      {/* Public Keys */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-lg mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Public Client Keys</h3>
            <p className="text-sm text-gray-500 mt-1">Use these keys strictly in your frontend SDK initialization.</p>
          </div>
          <Button variant="outline" className="h-10 px-4 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-base font-medium shadow-sm">
            <Plus size={18} className="mr-2" />
            Create Public Key
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-base text-left">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50">Key</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">Client Default Key</td>
                <td className="px-6 py-4 font-mono text-base text-gray-700">
                  {showKey ? apiKey : maskedKey}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowKey(!showKey)}
                      className="px-3 border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm bg-white"
                      title={showKey ? "Hide key" : "Show key"}
                    >
                      {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        toast.success("API Key copied to clipboard");
                      }}
                      className="px-3 border-gray-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 shadow-sm bg-white"
                      title="Copy key"
                    >
                      <Copy size={18} className="mr-2" /> Copy
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Secret Keys */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Secret Server Keys</h3>
            <p className="text-sm text-gray-500 mt-1">Keep these safe. Use only in your backend environments.</p>
          </div>
          <Button className="h-10 px-4 bg-gray-900 hover:bg-black text-white text-base font-medium shadow-sm">
            <Plus size={18} className="mr-2" />
            Create Secret Key
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-base text-left">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50">Permissions</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50">Created At</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-widest bg-gray-50/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">Backend Automation Key</td>
                <td className="px-6 py-4 text-gray-600"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">FULL ACCESS</span></td>
                <td className="px-6 py-4 text-gray-600 font-mono text-sm">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" className="px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm bg-white" title="Revoke Key">
                    <Trash2 size={18} className="mr-2"/> Revoke
                  </Button>
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
// Webhooks Tab Content
// ============================================================================
const WebhooksContent = () => {
  const { webhookUrl, setWebhookUrl } = useStore();

  return (
    <div className="max-w-4xl">
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Webhooks</h2>
        <p className="text-base text-gray-500 mt-2">Subscribe to real-time event streams from your workspace.</p>
      </div>

      <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Endpoint Configuration</h3>
          <p className="text-sm text-gray-500 mt-1">Specify where EmbedCraft should send POST requests for events.</p>
        </div>
        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="webhookUrl" className="text-base font-semibold text-gray-900">Primary Delivery URL</Label>
            <div className="flex gap-4">
              <Input
                id="webhookUrl"
                placeholder="https://your-domain.com/webhooks/embedcraft"
                className="font-mono text-base h-12 bg-white border-gray-300 shadow-sm px-4 focus:ring-blue-500 focus:border-blue-500 flex-1"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium shadow-sm transition-colors"
                onClick={() => toast.success("Webhook URL saved successfully")}
              >
                Save Endpoint
              </Button>
            </div>
            <p className="text-sm text-gray-500">Endpoints must accept incoming HTTPS POST requests securely.</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
               <span className="text-sm font-semibold text-gray-800">Event Catalog</span>
            </div>
            <div className="p-4 bg-white font-mono text-sm space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                 <div className="mt-0.5 min-w-[20px]"><div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div></div>
                 <div>
                    <span className="font-bold text-gray-900">campaign.impression</span>
                    <p className="text-gray-500 mt-1">Dispatched whenever a user views a campaign.</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <div className="mt-0.5 min-w-[20px]"><div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div></div>
                 <div>
                    <span className="font-bold text-gray-900">campaign.click</span>
                    <p className="text-gray-500 mt-1">Dispatched when a user interacts with a call-to-action button.</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <div className="mt-0.5 min-w-[20px]"><div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div></div>
                 <div>
                    <span className="font-bold text-gray-900">campaign.conversion</span>
                    <p className="text-gray-500 mt-1">Dispatched only when the final conversion goal is met.</p>
                 </div>
              </div>
            </div>
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
  <div className="max-w-4xl">
    <div className="mb-8 border-b border-gray-200 pb-5">
      <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h2>
      <p className="text-base text-gray-500 mt-2">{description}</p>
    </div>
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 shadow-sm">
        <Settings2 size={32} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
      <p className="text-base text-gray-500 max-w-md">This enterprise feature module is currently under development and will be rolled out to your workspace shortly.</p>
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
    { id: 'keys', label: 'API Keys', icon: KeyRound },
  ];

  const workspaceItems: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'referral', label: 'Referral Engine', icon: Gift },
    { id: 'brand', label: 'Brand Guidelines', icon: Palette },
    { id: 'prioritization', label: 'Prioritization Rules', icon: ListOrdered },
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
        return <PlaceholderContent title="Referral Settings" description="Configure your global referral program settings." />;
      case 'brand':
        return <PlaceholderContent title="Brand Guidelines" description="Set up your workspace brand colors, typography, and assets." />;
      case 'prioritization':
        return <PlaceholderContent title="Prioritization" description="Configure global campaign delivery prioritization rules." />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex' }}>
      {/* Left Sidebar Navigation */}
      <aside className="w-[280px] min-w-[280px] border-r border-gray-200 bg-white py-8 px-5 flex flex-col gap-8 shadow-sm z-10 relative">
        {/* ACCOUNT section */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-3">Account Setup</p>
          <div className="space-y-1">
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-3">Workspace Setup</p>
          <div className="space-y-1">
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
        <div className="w-full max-w-[1200px] mx-auto p-10 lg:p-14">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Settings;
