import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/design-tokens';

const Stats: React.FC = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        fetch(`${apiUrl}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, [token]);

    if (!stats) return <div>Loading...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.text.primary, marginBottom: '24px' }}>Global Stats</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Clients</h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 700, color: theme.colors.primary[600] }}>{stats.totalOrgs}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Nudges</h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 700, color: theme.colors.primary[600] }}>{stats.totalNudges}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Events</h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 700, color: theme.colors.primary[600] }}>{stats.totalEvents}</p>
                </div>
            </div>
        </div>
    );
};

export default Stats;
