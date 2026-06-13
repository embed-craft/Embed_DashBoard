import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEnvironment } from '../../context/EnvironmentContext';
import type { Environment } from '../../context/EnvironmentContext';
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
  LogOut,
  Gift,
  BookOpen
} from 'lucide-react';
import { theme } from '../../styles/design-tokens';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentEnv, switchEnvironment, environments, organizationName } = useEnvironment();
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false);
  const envDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (envDropdownRef.current && !envDropdownRef.current.contains(e.target as Node)) {
        setEnvDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    { path: '/rewards', label: 'Rewards', icon: Gift },
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
      {/* Logo + Org Name + Environment Switcher */}
      <div style={{
        padding: isCollapsed ? '16px 0' : '16px 20px',
        borderBottom: `1px solid ${theme.colors.border.default}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Logo + Org Name Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <img
            src="/logo.png"
            alt="EmbedCraft Logo"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          {!isCollapsed && (
            <span style={{
              marginLeft: '10px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#000000',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {organizationName || 'EmbedCraft'}
            </span>
          )}
        </div>

        {/* Environment Switcher */}
        {!isCollapsed && environments && (
          <div ref={envDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setEnvDropdownOpen(!envDropdownOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                color: '#000000',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <span>{currentEnv === 'staging' ? 'Staging Environment' : 'Production Environment'}</span>
              <ChevronDown size={14} style={{
                transform: envDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                color: '#64748B',
              }} />
            </button>

            {/* Dropdown Popover */}
            {envDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                zIndex: 100,
                overflow: 'hidden',
                padding: '4px',
              }}>
                {(['production', 'staging'] as Environment[]).map((env) => (
                  <button
                    key={env}
                    onClick={() => {
                      if (env !== currentEnv) {
                        switchEnvironment(env);
                      }
                      setEnvDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: env === currentEnv ? '#F1F5F9' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: env === currentEnv ? 600 : 400,
                      color: '#000000',
                      textAlign: 'left',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseOver={(e) => {
                      if (env !== currentEnv) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseOut={(e) => {
                      if (env !== currentEnv) e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <span>{env === 'staging' ? 'Staging Environment' : 'Production Environment'}</span>
                    {env === currentEnv && (
                      <span style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsed env indicator */}
        {isCollapsed && (
          <div
            title={currentEnv === 'staging' ? 'Staging Environment' : 'Production Environment'}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: currentEnv === 'staging' ? '#E2E8F0' : '#000000',
              color: currentEnv === 'staging' ? '#000000' : '#FFFFFF',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            {currentEnv === 'staging' ? 'S' : 'P'}
          </div>
        )}
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
            <a
              href="https://docs.embedcraft.com"
              target="_blank"
              rel="noopener noreferrer"
              title={isCollapsed ? "Documentation" : ""}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: theme.colors.text.secondary,
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.15s ease'
              }}
              className="hover:bg-slate-50 text-slate-700"
            >
              <BookOpen size={20} style={{ marginRight: isCollapsed ? '0' : '12px', flexShrink: 0, color: theme.colors.gray[400] }} />
              {!isCollapsed && <span>Documentation</span>}
            </a>
          </li>
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
