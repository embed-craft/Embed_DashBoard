import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/design-tokens';

interface Organization {
    _id: string;
    name: string;
    admin_email: string;
    status: 'active' | 'inactive';
    plan_limit: number;
    contract_end_date?: string;
    api_key: string;
}

const Clients: React.FC = () => {
    const { token } = useAuth();
    const [clients, setClients] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Organization | null>(null);

    // Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [subscriptionMonths, setSubscriptionMonths] = useState(6); // Default to 6 months

    const fetchClients = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/admin/clients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setClients(data);
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Calculate contract end date
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + subscriptionMonths);

            const res = await fetch('http://localhost:4000/api/admin/client', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newName,
                    adminEmail: newEmail,
                    password: newPassword,
                    contractEndDate: endDate.toISOString()
                })
            });

            if (res.ok) {
                setShowCreateModal(false);
                setNewName('');
                setNewEmail('');
                setNewPassword('');
                setSubscriptionMonths(6);
                fetchClients(); // Refresh list
            } else {
                alert('Failed to create client');
            }
        } catch (error) {
            console.error('Error creating client', error);
        }
    };

    const handleUpdateStatus = async (orgId: string, newStatus: 'active' | 'inactive') => {
        try {
            const res = await fetch(`http://localhost:4000/api/admin/client/${orgId}/contract`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Update local state
                setClients(prev => prev.map(c => c._id === orgId ? { ...c, status: newStatus } : c));
                if (selectedClient && selectedClient._id === orgId) {
                    setSelectedClient(prev => prev ? { ...prev, status: newStatus } : null);
                }
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    if (loading) return <div style={{ padding: '32px', fontFamily: '"Inter", sans-serif', color: '#666', fontSize: '13px' }}>Loading client data...</div>;

    return (
        <div style={{ fontFamily: '"Inter", sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1A1A', fontFamily: '"Playfair Display", Georgia, serif', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Clients</h1>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Manage your organization's client portfolio.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        backgroundColor: '#1A1A1A',
                        color: '#F9F9F7',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
                >
                    + New Client
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '4px', border: '1px solid #E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ borderBottom: '1px solid #E5E5E5' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Company Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Contact</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plan Limit</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>API Key</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '10px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client._id} style={{ borderBottom: '1px solid #F0F0F0', transition: 'background-color 0.1s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#1A1A1A', fontWeight: 500, fontFamily: '"Playfair Display", Georgia, serif' }}>{client.name}</td>
                                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#444' }}>{client.admin_email}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={{
                                        padding: '3px 8px',
                                        borderRadius: '100px',
                                        fontSize: '10px',
                                        fontWeight: 500,
                                        backgroundColor: client.status === 'active' ? '#F0FDF4' : '#FEF2F2',
                                        color: client.status === 'active' ? '#15803D' : '#B91C1C',
                                        border: `1px solid ${client.status === 'active' ? '#DCFCE7' : '#FECACA'}`,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {client.status}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#444', fontFamily: 'monospace' }}>{client.plan_limit.toLocaleString()}</td>
                                <td style={{ padding: '14px 16px', fontSize: '11px', fontFamily: 'monospace', color: '#888' }}>
                                    {client.api_key.substring(0, 12)}...
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => setSelectedClient(client)}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            color: '#666',
                                            marginRight: '8px',
                                            fontWeight: 500
                                        }}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(client._id, client.status === 'active' ? 'inactive' : 'active')}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            color: client.status === 'active' ? '#B91C1C' : '#15803D',
                                            fontWeight: 600,
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        {client.status === 'active' ? 'Pause' : 'Resume'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Client Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '4px', width: '400px', border: '1px solid #E5E5E5', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontFamily: '"Playfair Display", Georgia, serif', color: '#1A1A1A' }}>Add New Client</h2>
                        <form onSubmit={handleCreateClient}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', fontWeight: 600 }}>Company Name</label>
                                <input
                                    value={newName} onChange={e => setNewName(e.target.value)} required
                                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E5E5', borderRadius: '4px', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={(e) => e.target.style.borderColor = '#1A1A1A'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', fontWeight: 600 }}>Admin Email</label>
                                <input
                                    type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required
                                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E5E5', borderRadius: '4px', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={(e) => e.target.style.borderColor = '#1A1A1A'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', fontWeight: 600 }}>Subscription Period (Months)</label>
                                <select
                                    value={subscriptionMonths} onChange={e => setSubscriptionMonths(Number(e.target.value))}
                                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E5E5', borderRadius: '4px', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s', backgroundColor: 'white' }}
                                    onFocus={(e) => e.target.style.borderColor = '#1A1A1A'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                                >
                                    <option value={1}>1 Month</option>
                                    <option value={3}>3 Months</option>
                                    <option value={6}>6 Months</option>
                                    <option value={12}>12 Months</option>
                                    <option value={24}>24 Months</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', fontWeight: 600 }}>Password</label>
                                <input
                                    type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E5E5', borderRadius: '4px', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={(e) => e.target.style.borderColor = '#1A1A1A'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: '#666', fontSize: '12px', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#1A1A1A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Create Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Client Details Modal */}
            {selectedClient && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '4px', width: '500px', border: '1px solid #E5E5E5', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '20px', fontFamily: '"Playfair Display", Georgia, serif', color: '#1A1A1A' }}>{selectedClient.name}</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>{selectedClient.admin_email}</p>
                            </div>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: '100px',
                                fontSize: '11px',
                                fontWeight: 500,
                                backgroundColor: selectedClient.status === 'active' ? '#F0FDF4' : '#FEF2F2',
                                color: selectedClient.status === 'active' ? '#15803D' : '#B91C1C',
                                border: `1px solid ${selectedClient.status === 'active' ? '#DCFCE7' : '#FECACA'}`,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {selectedClient.status}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#999', marginBottom: '4px' }}>Plan Limit</label>
                                <div style={{ fontSize: '14px', color: '#1A1A1A', fontFamily: 'monospace' }}>{selectedClient.plan_limit.toLocaleString()}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#999', marginBottom: '4px' }}>Contract End</label>
                                <div style={{ fontSize: '14px', color: '#1A1A1A' }}>
                                    {selectedClient.contract_end_date ? new Date(selectedClient.contract_end_date).toLocaleDateString() : 'No Expiry'}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#999', marginBottom: '4px' }}>API Key</label>
                            <div style={{ backgroundColor: '#F9F9F7', padding: '10px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', color: '#444', border: '1px solid #E5E5E5', wordBreak: 'break-all' }}>
                                {selectedClient.api_key}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E5E5', paddingTop: '20px' }}>
                            <button
                                onClick={() => handleUpdateStatus(selectedClient._id, selectedClient.status === 'active' ? 'inactive' : 'active')}
                                style={{
                                    backgroundColor: selectedClient.status === 'active' ? '#FEF2F2' : '#F0FDF4',
                                    color: selectedClient.status === 'active' ? '#B91C1C' : '#15803D',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {selectedClient.status === 'active' ? 'Pause Subscription' : 'Resume Subscription'}
                            </button>
                            <button onClick={() => setSelectedClient(null)} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: '#666', fontSize: '12px', fontWeight: 500 }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
