import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Megaphone,
  Zap,
  Users,
  FileText,
  Code,
  FolderOpen,
  LayoutTemplate,
  Settings,
  HelpCircle,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { theme } from '../../styles/design-tokens';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Monitor width to determine collapsed state (Icon Mode)
  useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Toggle collapsed state if width is below threshold (e.g. 160px)
        setIsCollapsed(entry.contentRect.width < 160);
      }
    });

    observer.observe(sidebarRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
    { path: '/events', label: 'Events', icon: Zap },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/pages', label: 'Pages', icon: FileText },
    { path: '/apis', label: 'APIs', icon: Code },
    { path: '/assets', label: 'Assets', icon: FolderOpen },
    { path: '/templates', label: 'Templates', icon: LayoutTemplate },
  ];

  return (
    <div
      ref={sidebarRef}
      className="flex flex-col h-full bg-white w-full transition-all duration-300 ease-in-out z-50 overflow-hidden"
    // Removed border-right to prevent double border with resize handle
    >
      {/* Logo Area */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        padding: isCollapsed ? '0' : '0 24px',
        borderBottom: `1px solid ${theme.colors.border.default}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <img
            src="/logo.png"
            alt="EmbedCraft Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              objectFit: 'contain',
              marginRight: isCollapsed ? '0' : '12px',
              flexShrink: 0
            }}
          />
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}>
                EmbedCraft
              </span>
              <ChevronDown size={16} color={theme.colors.text.secondary} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', overflowX: 'hidden' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={isCollapsed ? item.label : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? theme.colors.primary[600] : theme.colors.text.secondary,
                    backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      marginRight: isCollapsed ? '0' : '12px',
                      color: isActive ? theme.colors.primary[500] : theme.colors.gray[400],
                      flexShrink: 0
                    }}
                  />
                  {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${theme.colors.border.default}`,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>
            <NavLink
              to="/settings"
              title={isCollapsed ? "Settings" : ""}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? theme.colors.primary[600] : theme.colors.text.secondary,
                backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease'
              })}
            >
              <Settings size={20} style={{ marginRight: isCollapsed ? '0' : '12px', flexShrink: 0 }} />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/support"
              title={isCollapsed ? "Support" : ""}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? theme.colors.primary[600] : theme.colors.text.secondary,
                backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease'
              })}
            >
              <HelpCircle size={20} style={{ marginRight: isCollapsed ? '0' : '12px', flexShrink: 0 }} />
              {!isCollapsed && <span>Support</span>}
            </NavLink>
          </li>
          <li>
            <button
              onClick={handleLogout}
              title={isCollapsed ? "Logout" : ""}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: theme.colors.red[600],
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              className="hover:bg-red-50"
            >
              <LogOut size={20} style={{ marginRight: isCollapsed ? '0' : '12px', flexShrink: 0 }} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
        {/* Removed redundant Collapse button; allow Resizing to control state. */}
      </div>
    </div>
  );
};

export default Sidebar;
