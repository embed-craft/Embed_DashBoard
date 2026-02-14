import React from 'react';
import { Outlet } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Sidebar from './Sidebar';
import { theme } from '../../styles/design-tokens';

/**
 * AppLayout - Main application shell with sidebar navigation
 * Matches screenshot layout: fixed sidebar + main content area
 */
const AppLayout: React.FC = () => {
  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: theme.colors.background.page,
        overflow: 'hidden',
        display: 'flex', // Important for PanelGroup to fill width
      }}
    >
      <PanelGroup direction="horizontal">
        {/* Sidebar - Resizable */}
        <Panel defaultSize={15} minSize={5} maxSize={20} order={1} collapsible={true} onCollapse={() => {
          // Optional: logic when collapsed (e.g. show mini icon bar) - for now just collapse
        }} style={{ display: 'flex', flexDirection: 'column' }}>
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-1 focus:outline-none transition-colors hover:bg-indigo-500/50 bg-transparent flex items-center justify-center -ml-0.5 z-50" />

        {/* Main Content Area */}
        <Panel order={2} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <main
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <Outlet />
          </main>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default AppLayout;
