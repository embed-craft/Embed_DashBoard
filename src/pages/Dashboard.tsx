import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import {
  Activity,
  Users,
  Target,
  Zap,
  TrendingUp,
  Eye,
  Calendar,
  ArrowRight,
  MousePointerClick
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart
} from "recharts";

import { useStore } from "@/store/useStore";
import PageHeader from "@/components/layout/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
import { theme } from "@/styles/design-tokens";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color, trend }: any) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: '24px',
    border: `1px solid ${theme.colors.border.default}`,
    boxShadow: theme.shadows.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default'
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = theme.shadows.md;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = theme.shadows.sm;
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '14px', color: theme.colors.text.secondary, fontWeight: 500 }}>{title}</p>
        <h3 style={{ fontSize: '28px', fontWeight: 700, color: theme.colors.text.primary, marginTop: '8px' }}>{value}</h3>
      </div>
      <div style={{
        padding: '10px',
        borderRadius: '12px',
        backgroundColor: `${color}15`, // 15% opacity
        color: color
      }}>
        <Icon size={20} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '13px',
        fontWeight: 600,
        color: trend === 'up' ? theme.colors.success : theme.colors.error,
        backgroundColor: trend === 'up' ? '#ECFDF5' : '#FEF2F2',
        padding: '2px 8px',
        borderRadius: '100px'
      }}>
        <TrendingUp size={12} style={{ transform: trend === 'down' ? 'rotate(180deg)' : 'none' }} />
        {change}
      </div>
      <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>vs last week</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { campaigns, analyticsData, simulateEvent, syncCampaigns, initializeAnalytics } = useStore();
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [selectedMetric, setSelectedMetric] = useState('impressions_clicks');

  const [stats, setStats] = useState({
    activeCampaigns: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    daily: [] as any[]
  });

  // Fetch campaigns and stats from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await import('@/lib/api');

        // 1. Fetch Campaigns
        const { campaigns: backendCampaigns } = await api.listCampaigns({ limit: 100 });
        const dashboardCampaigns = backendCampaigns.map((bc: any) => ({
          id: bc.id || bc._id || bc.nudge_id,
          name: bc.name,
          status: bc.status as 'active' | 'paused' | 'draft',
          trigger: bc.trigger,
          segment: 'All Users',
          impressions: 0, // These will be updated if we merge stats, for now keep 0 or fetch individual
          clicks: 0,
          conversions: 0,
          conversion: '0.0',
          config: bc.config,
          rules: (bc.rules || []).map((r: any) => ({
            id: r.id,
            type: r.type as 'event' | 'attribute',
            field: r.field,
            operator: r.operator,
            value: String(r.value),
          })),
          createdAt: bc.createdAt || new Date().toISOString(),
          updatedAt: bc.updatedAt || new Date().toISOString(),
        }));
        syncCampaigns(dashboardCampaigns);

        // 2. Fetch Dashboard Stats
        const dashboardStats = await api.apiClient.getDashboardStats();
        setStats({
          activeCampaigns: dashboardStats.activeCampaigns,
          impressions: dashboardStats.totals.impressions,
          clicks: dashboardStats.totals.clicks,
          conversions: dashboardStats.totals.conversions,
          daily: dashboardStats.daily
        });

        // Update global analytics data for charts
        // Note: We might need to update the store's analyticsData if other components use it
        // For now, we can just use local state for the charts in this component or update store
        // updateAnalytics(dashboardStats.daily); // If we add this action

      } catch (error) {
        console.error('Dashboard: Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []); // Remove dependencies to run once on mount

  // Calculate derived metrics
  const avgConversion = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100).toFixed(1) : '0.0';

  const statCards = [
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      change: "+0%", // Dynamic change requires historical data comparison
      trend: 'up',
      icon: Zap,
      color: theme.colors.primary[500]
    },
    {
      title: "Total Impressions",
      value: `${(stats.impressions / 1000).toFixed(1)}K`,
      change: "+0%",
      trend: 'up',
      icon: Eye,
      color: theme.colors.info
    },
    {
      title: "Total Clicks",
      value: `${(stats.clicks / 1000).toFixed(1)}K`,
      change: "+0%",
      trend: 'up',
      icon: MousePointerClick,
      color: theme.colors.warning
    },
    {
      title: "Conversion Rate",
      value: `${avgConversion}%`,
      change: "+0%",
      trend: 'up',
      icon: Target,
      color: theme.colors.success
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: `1px solid ${theme.colors.border.default}`,
          padding: '12px',
          borderRadius: '8px',
          boxShadow: theme.shadows.lg
        }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: theme.colors.text.primary }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
              <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{entry.name}:</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.text.primary }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of your EmbedCraft performance"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'white',
              border: `1px solid ${theme.colors.border.default}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              color: theme.colors.text.primary,
              cursor: 'pointer'
            }}>
              <Calendar size={16} className="text-gray-500" />
              {dateRange}
            </button>
          </div>
        }
      />

      <PageContainer>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Weekly Performance */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: theme.borderRadius.lg,
            padding: '24px',
            border: `1px solid ${theme.colors.border.default}`,
            boxShadow: theme.shadows.sm
          }}>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.text.primary }}>Weekly Performance</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.colors.border.default}`,
                  fontSize: '12px',
                  color: theme.colors.text.secondary
                }}
              >
                <option value="impressions_clicks">Impressions vs Clicks</option>
                <option value="conversions">Conversions</option>
              </select>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.daily} barGap={0} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border.default} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.colors.gray[50] }} />
                  {selectedMetric === 'impressions_clicks' ? (
                    <>
                      <Bar
                        dataKey="impressions"
                        name="Impressions"
                        fill={theme.colors.primary[500]}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="clicks"
                        name="Clicks"
                        fill={theme.colors.primary[200]}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </>
                  ) : (
                    <Bar
                      dataKey="conversions"
                      name="Conversions"
                      fill={theme.colors.success}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Trend */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: theme.borderRadius.lg,
            padding: '24px',
            border: `1px solid ${theme.colors.border.default}`,
            boxShadow: theme.shadows.sm
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.text.primary }}>Engagement Trend</h3>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.daily}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.colors.primary[500]} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={theme.colors.primary[500]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.colors.warning} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={theme.colors.warning} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border.default} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    name="Impressions"
                    stroke={theme.colors.primary[500]}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorImpressions)"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    name="Clicks"
                    stroke={theme.colors.warning}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: theme.borderRadius.lg,
          padding: '24px',
          border: `1px solid ${theme.colors.border.default}`,
          boxShadow: theme.shadows.sm
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '20px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { title: 'Manage Campaigns', desc: 'View and edit all campaigns', icon: Activity, path: '/campaigns', color: theme.colors.primary[500] },
              { title: 'User Segments', desc: 'Create targeting rules', icon: Users, path: '/segments', color: theme.colors.info },
              { title: 'View Analytics', desc: 'Detailed performance metrics', icon: TrendingUp, path: '/analytics', color: theme.colors.success }
            ].map((action) => (
              <Link key={action.title} to={action.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border.default}`,
                  backgroundColor: 'white',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary[200];
                    e.currentTarget.style.backgroundColor = theme.colors.primary[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.default;
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: `${action.color}15`,
                    color: action.color
                  }}>
                    <action.icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '4px' }}>{action.title}</h4>
                    <p style={{ fontSize: '13px', color: theme.colors.text.secondary }}>{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default Dashboard;
