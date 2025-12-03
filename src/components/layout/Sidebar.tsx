import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Megaphone,
  Workflow,
  Gift,
  Zap,
  Users,
  FileText,
  Code,
  FolderOpen,
  LayoutTemplate,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { theme } from '../../styles/design-tokens';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
    { path: '/flows', label: 'Flows', icon: Workflow },
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
      className={cn(
        "flex flex-col h-screen bg-white border-r transition-all duration-300 ease-in-out z-50",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
      style={{
        borderRight: `1px solid ${theme.colors.border.default}`,
      }}
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: theme.colors.primary[600],
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: isCollapsed ? '0' : '12px',
            color: 'white',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            E
          </div>
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
        </ul>

        <div style={{ marginTop: '8px', borderTop: `1px solid ${theme.colors.border.default}`, paddingTop: '8px' }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            className="hover:bg-gray-100"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <>
                <PanelLeftClose size={20} style={{ marginRight: '12px' }} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
