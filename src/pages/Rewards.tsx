import React, { useState, useEffect } from 'react';
import { theme } from '../styles/design-tokens';
import { useStore, RewardItem } from '../store/useStore';
import { Plus, Search, MoreHorizontal, LayoutGrid, Clock, Gift } from 'lucide-react';
import CreateRewardModal from '../components/rewards/CreateRewardModal';
import { format } from 'date-fns';

const Rewards = () => {
  const { rewards, deleteReward, fetchRewards } = useStore();
  const [activeTab, setActiveTab] = useState<'rewards' | 'distribution' | 'delivery'>('rewards');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Hydrate Data on Mount
  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const filteredRewards = rewards.filter((r) =>
    (r.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Click outside overlay for dropdown */}
      {activeDropdown && (
        <div 
          onClick={() => setActiveDropdown(null)} 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} 
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            backgroundColor: theme.colors.primary[50], display: 'flex', 
            alignItems: 'center', justifyContent: 'center' 
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: theme.colors.text.primary, margin: 0 }}>
            Rewards
          </h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'black', color: 'white',
            border: 'none', borderRadius: '8px', padding: '10px 16px',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(31, 41, 55)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'black'}
        >
          <Plus size={18} />
          Create Reward
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.colors.border.default}`, marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('rewards')}
          style={{
            padding: '12px 16px', border: 'none', background: 'none',
            borderBottom: activeTab === 'rewards' ? `2px solid ${theme.colors.primary[600]}` : '2px solid transparent',
            color: activeTab === 'rewards' ? theme.colors.primary[600] : theme.colors.text.secondary,
            fontWeight: activeTab === 'rewards' ? 600 : 500, fontSize: '14px', cursor: 'pointer',
          }}
        >
          Rewards
        </button>
        <button
          onClick={() => setActiveTab('distribution')}
          style={{
            padding: '12px 16px', border: 'none', background: 'none',
            borderBottom: activeTab === 'distribution' ? `2px solid ${theme.colors.primary[600]}` : '2px solid transparent',
            color: activeTab === 'distribution' ? theme.colors.primary[600] : theme.colors.text.secondary,
            fontWeight: activeTab === 'distribution' ? 600 : 500, fontSize: '14px', cursor: 'pointer',
          }}
        >
          Distribution Logs
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          style={{
            padding: '12px 16px', border: 'none', background: 'none',
            borderBottom: activeTab === 'delivery' ? `2px solid ${theme.colors.primary[600]}` : '2px solid transparent',
            color: activeTab === 'delivery' ? theme.colors.primary[600] : theme.colors.text.secondary,
            fontWeight: activeTab === 'delivery' ? 600 : 500, fontSize: '14px', cursor: 'pointer',
          }}
        >
          Delivery
        </button>
      </div>

      {activeTab === 'rewards' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${theme.colors.border.default}`, overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.border.default}` }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary }} />
              <input
                type="text"
                placeholder="Search Rewards.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px 10px 38px',
                  border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px',
                  fontSize: '14px', outline: 'none',
                }}
              />
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
              border: `1px solid ${theme.colors.border.default}`, padding: '8px 12px',
              borderRadius: '6px', fontSize: '14px', color: theme.colors.text.secondary, cursor: 'pointer'
            }}>
              <LayoutGrid size={16} /> Toggle Columns
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: theme.colors.gray[50], borderBottom: `1px solid ${theme.colors.border.default}` }}>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>Name</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>Type</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Created at <Clock size={14} /></div>
                  </th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Updated at <Clock size={14} /></div>
                  </th>
                  <th style={{ padding: '16px', width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRewards.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: theme.colors.text.secondary }}>
                      No rewards found. Created one to get started!
                    </td>
                  </tr>
                ) : (
                  filteredRewards.map((reward) => (
                    <tr key={reward.id} style={{ borderBottom: `1px solid ${theme.colors.border.default}` }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {reward.iconUrl ? (
                            <img src={reward.iconUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: theme.colors.gray[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Gift size={16} color={theme.colors.gray[500]} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: theme.colors.text.primary, fontSize: '14px' }}>{reward.name}</div>
                            <div style={{ color: theme.colors.text.secondary, fontSize: '12px', marginTop: '2px', fontFamily: 'monospace' }}>{reward.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                          backgroundColor: reward.type === 'coupon' ? '#FFF3E0' : '#E3F2FD',
                          color: reward.type === 'coupon' ? '#E65100' : '#1565C0'
                        }}>
                          {reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: theme.colors.text.secondary, fontSize: '14px' }}>
                        {format(new Date(reward.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </td>
                      <td style={{ padding: '16px', color: theme.colors.text.secondary, fontSize: '14px' }}>
                        {format(new Date(reward.updatedAt), 'dd MMM yyyy, hh:mm a')}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', position: 'relative' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === reward.id ? null : reward.id);
                          }}
                          style={{
                            background: activeDropdown === reward.id ? theme.colors.gray[100] : 'none', 
                            border: 'none', cursor: 'pointer', borderRadius: '4px',
                            color: theme.colors.text.secondary, padding: '4px',
                            transition: 'background 0.2s'
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeDropdown === reward.id && (
                          <div style={{
                            position: 'absolute',
                            right: '32px',
                            top: '40px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            border: `1px solid ${theme.colors.border.default}`,
                            zIndex: 10,
                            minWidth: '120px',
                            overflow: 'hidden'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(null);
                                setEditingReward(reward);
                                setIsCreateModalOpen(true);
                              }}
                              style={{
                                width: '100%', padding: '10px 16px', textAlign: 'left',
                                border: 'none', background: 'none', cursor: 'pointer',
                                fontSize: '13px', color: theme.colors.text.primary,
                                borderBottom: `1px solid ${theme.colors.border.default}`
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[50]}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(null);
                                if (window.confirm("Are you sure you want to delete this reward?")) {
                                  deleteReward(reward.id);
                                }
                              }}
                              style={{
                                width: '100%', padding: '10px 16px', textAlign: 'left',
                                border: 'none', background: 'none', cursor: 'pointer',
                                fontSize: '13px', color: '#EF4444'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination Mock */}
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', borderTop: `1px solid ${theme.colors.border.default}`, color: theme.colors.text.secondary, fontSize: '13px' }}>
              <div>Rows per page: <select style={{ border: 'none', outline: 'none', background: 'transparent' }}><option>10</option></select></div>
              <div>Page 1 of 1</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ cursor: 'not-allowed', opacity: 0.5 }}>{'<<'}</span>
                <span style={{ cursor: 'not-allowed', opacity: 0.5 }}>{'<'}</span>
                <span style={{ cursor: 'not-allowed', opacity: 0.5 }}>{'>'}</span>
                <span style={{ cursor: 'not-allowed', opacity: 0.5 }}>{'>>'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'distribution' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${theme.colors.border.default}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.border.default}` }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.text.secondary }} />
              <input
                type="text"
                placeholder="Search Logs.."
                style={{
                  width: '100%', padding: '10px 12px 10px 38px',
                  border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px',
                  fontSize: '14px', outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '8px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}>Filter by Status</button>
              <button style={{ padding: '8px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}>Export CSV</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: theme.colors.gray[50], borderBottom: `1px solid ${theme.colors.border.default}` }}>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>Log ID</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>Reward ID</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>User ID</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>Distribution Date</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>Status</th>
                </tr>
              </thead>
              <tbody>
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: theme.colors.text.secondary }}>
                      <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p>No distribution logs recorded yet.</p>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', border: `1px solid ${theme.colors.gray[200]}`, maxWidth: '800px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary, margin: '0 0 4px 0' }}>Webhook Delivery</h3>
            <p style={{ color: theme.colors.text.secondary, margin: 0, fontSize: '14px' }}>Securely push reward distribution events to your backend servers in real-time.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: theme.colors.gray[50], borderRadius: '8px', border: `1px solid ${theme.colors.gray[200]}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: theme.colors.text.primary }}>Enable Webhooks</div>
                <div style={{ fontSize: '13px', color: theme.colors.text.secondary, marginTop: '2px' }}>Send HTTP POST requests when users claim a reward.</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.primary[600], transition: '.4s', borderRadius: '34px' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: '22px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                </span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '8px' }}>Webhook Endpoint URL</label>
              <input 
                type="url"
                placeholder="https://api.yourdomain.com/webhooks/rewards"
                defaultValue="https://api.yourdomain.com/callbacks"
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${theme.colors.gray[200]}`, borderRadius: '8px', outline: 'none', transition: 'border 0.2s', fontSize: '14px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '8px' }}>Secret Signature Key (HMAC)</label>
              <input 
                type="password"
                defaultValue="ninja_sec_99a8b1z_example_key"
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${theme.colors.gray[200]}`, borderRadius: '8px', outline: 'none', transition: 'border 0.2s', fontSize: '14px' }} 
              />
              <p style={{ fontSize: '12px', color: theme.colors.text.secondary, margin: '6px 0 0 0' }}>Used to verify the webhook payload originates securely from EmbedCraft Servers.</p>
            </div>

            <div style={{ height: '1px', backgroundColor: theme.colors.gray[200], margin: '16px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.text.primary, margin: '0 0 4px 0' }}>In-App Ninja SDK Sync</h3>
                <p style={{ color: theme.colors.text.secondary, margin: 0, fontSize: '13px' }}>Automatically sync claimed rewards and point balances directly to the frontend SDK cache.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.primary[600], transition: '.4s', borderRadius: '34px' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: '22px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                </span>
              </label>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  backgroundColor: theme.colors.primary[600], color: 'white', fontSize: '14px', fontWeight: 600, 
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {(isCreateModalOpen || editingReward) && (
        <CreateRewardModal 
           onClose={() => {
              setIsCreateModalOpen(false);
              setEditingReward(null);
           }} 
           editReward={editingReward} 
        />
      )}
    </div>
  );
};

export default Rewards;
