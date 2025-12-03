import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/design-tokens';

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user && user.role !== 'super_admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F9F9F7', fontFamily: '"Inter", sans-serif' }}>
            {/* Admin Sidebar */}
            <div style={{ width: '220px', backgroundColor: '#F9F9F7', borderRight: '1px solid #E5E5E5', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid #E5E5E5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: '#1A1A1A', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#F9F9F7', fontSize: '12px', fontWeight: 'bold', fontFamily: 'serif' }}>E</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1A1A1A', fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '-0.02em' }}>EmbedCraft</h2>
                    </div>
                    <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '30px' }}>Admin Portal</span>
                </div>

                <nav style={{ flex: 1, padding: '20px 12px' }}>
                    <div style={{ marginBottom: '10px', paddingLeft: '10px', fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Main Menu</div>
                    <NavLink
                        to="/admin"
                        end
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 10px',
                            borderRadius: '4px',
                            marginBottom: '2px',
                            textDecoration: 'none',
                            color: isActive ? '#1A1A1A' : '#666',
                            backgroundColor: isActive ? '#E5E5E5' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                        })}
                    >
                        <span style={{ marginRight: '8px', opacity: 0.7, fontSize: '10px' }}>●</span> Clients
                    </NavLink>
                    <NavLink
                        to="/admin/stats"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 10px',
                            borderRadius: '4px',
                            marginBottom: '2px',
                            textDecoration: 'none',
                            color: isActive ? '#1A1A1A' : '#666',
                            backgroundColor: isActive ? '#E5E5E5' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                        })}
                    >
                        <span style={{ marginRight: '8px', opacity: 0.7, fontSize: '10px' }}>●</span> Global Stats
                    </NavLink>
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid #E5E5E5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: '#1A1A1A' }}>
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</div>
                            <div style={{ fontSize: '10px', color: '#666' }}>Super Admin</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '6px',
                            border: '1px solid #E5E5E5',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            color: '#1A1A1A',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#999'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#E5E5E5'}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
