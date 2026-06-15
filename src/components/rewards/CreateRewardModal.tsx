import React, { useState } from 'react';
import { theme } from '../../styles/design-tokens';
import { useStore, RewardItem } from '../../store/useStore';
import { X, UploadCloud, Plus, Gift, Coins, Key, Award, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateRewardModalProps {
  onClose: () => void;
  editReward?: RewardItem | null;
}

const CreateRewardModal: React.FC<CreateRewardModalProps> = ({ onClose, editReward }) => {
  const { addReward, updateReward } = useStore();
  
  const [formData, setFormData] = useState<Partial<RewardItem>>({
    name: editReward?.name || '',
    description: editReward?.description || '',
    type: editReward?.type || 'coupon',
    iconUrl: editReward?.iconUrl || '',
    lockedIconUrl: editReward?.lockedIconUrl || '',
    customVariables: editReward?.customVariables || []
  });

  const [couponConfig, setCouponConfig] = useState({
    couponType: editReward?.couponConfig?.couponType || 'flat',
    couponValue: editReward?.couponConfig?.couponValue || '',
    codeType: editReward?.couponConfig?.codeType || 'static',
    code: editReward?.couponConfig?.code || '',
    expiryType: editReward?.couponConfig?.expiryType || 'never',
    expiryDate: editReward?.couponConfig?.expiryDate || ''
  });
  const [bulkCodes, setBulkCodes] = useState<string[]>(editReward?.couponConfig?.bulkCodes || []);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      // Skip header if it looks like one
      const startIdx = lines[0]?.toLowerCase() === 'code' ? 1 : 0;
      const codes = lines.slice(startIdx).filter(c => c.length > 0);
      setBulkCodes(codes);
    };
    reader.readAsText(file);
  };

  const [pointsConfig, setPointsConfig] = useState({ amount: editReward?.pointsConfig?.amount || 100 });
  const [featureConfig, setFeatureConfig] = useState({ featureFlagId: editReward?.featureConfig?.featureFlagId || '' });
  const [inventory, setInventory] = useState<{ total_quantity: string }>({ 
    total_quantity: editReward?.inventory?.total_quantity !== undefined && editReward?.inventory?.total_quantity !== null ? String(editReward.inventory.total_quantity) : '' 
  });

  const [uploadMode, setUploadMode] = useState<'preset' | 'upload'>('preset');
  const [uploading, setUploading] = useState(false);
  const [lockedUploading, setLockedUploading] = useState(false);

  // For visual tracking of focus state in forms
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Stock limit toggle state
  const [hasLimit, setHasLimit] = useState(
    editReward?.inventory?.total_quantity !== undefined && 
    editReward?.inventory?.total_quantity !== null && 
    String(editReward.inventory.total_quantity) !== ''
  );

  const handleCreate = async () => {
    if (!formData.name) return;
    
    // Construct final payload
    const payload: Omit<RewardItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      description: formData.description,
      type: formData.type!,
      iconUrl: formData.iconUrl,
      lockedIconUrl: formData.lockedIconUrl,
      customVariables: formData.customVariables
    };

    if (formData.type === 'coupon') {
      payload.couponConfig = {
         couponType: couponConfig.couponType,
         couponValue: couponConfig.couponValue,
         codeType: couponConfig.codeType,
         code: couponConfig.codeType === 'static' ? couponConfig.code : '',
         bulkCodes: couponConfig.codeType === 'bulk' ? bulkCodes : undefined,
         expiryType: couponConfig.expiryType,
         expiryDate: couponConfig.expiryDate
      };
    } else if (formData.type === 'points') {
      payload.pointsConfig = { amount: Number(pointsConfig.amount) };
    } else if (formData.type === 'feature_unlock') {
      payload.featureConfig = { featureFlagId: featureConfig.featureFlagId };
    }

    // Embed The Vault Limit
    if (hasLimit && inventory.total_quantity !== undefined && inventory.total_quantity !== null && inventory.total_quantity !== '') {
        (payload as any).inventory = { 
            total_quantity: Number(inventory.total_quantity), 
            claimed_quantity: editReward?.inventory?.claimed_quantity || 0 
        };
    } else {
        (payload as any).inventory = { 
            total_quantity: null, 
            claimed_quantity: editReward?.inventory?.claimed_quantity || 0 
        };
    }

    try {
        if (editReward) {
            await updateReward(editReward.id, payload);
        } else {
            await addReward(payload);
        }
        onClose();
    } catch(e) {
        alert("Failed to save reward to database.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'iconUrl' | 'lockedIconUrl' = 'iconUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds 10MB limit');
      return;
    }

    if (targetField === 'iconUrl') setUploading(true);
    else setLockedUploading(true);

    try {
      const api = await import('@/lib/api');
      const newAsset = await api.apiClient.uploadAsset(file);

      // Resolve the full asset URL
      const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');
      const getAssetUrl = (url: string): string => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
        return `${API_BASE}${url}`;
      };

      const finalUrl = getAssetUrl(newAsset.url);
      setFormData(prev => ({ ...prev, [targetField]: finalUrl }));
      if (targetField === 'iconUrl') setUploadMode('upload');
      toast.success(`${targetField === 'iconUrl' ? 'Icon' : 'Locked Icon'} uploaded successfully`);
    } catch (err: any) {
      console.error('Failed to upload icon:', err);
      toast.error(err?.message || 'Failed to upload icon');
    } finally {
      setUploading(false);
      setLockedUploading(false);
    }
  };

  const addCustomVar = () => {
    setFormData({ 
      ...formData, 
      customVariables: [...(formData.customVariables || []), { key: '', value: '' }] 
    });
  };

  const updateCustomVar = (index: number, field: 'key' | 'value', val: string) => {
    const vars = [...(formData.customVariables || [])];
    vars[index][field] = val;
    setFormData({ ...formData, customVariables: vars });
  };

  const removeCustomVar = (index: number) => {
    const vars = [...(formData.customVariables || [])];
    vars.splice(index, 1);
    setFormData({ ...formData, customVariables: vars });
  };

  const archetypes = [
    { id: 'coupon', name: 'Digital Coupon', desc: 'Flat/Percentage code', icon: Gift },
    { id: 'badge', name: 'Badge / NFT', desc: 'Award collectibles', icon: Award },
    { id: 'points', name: 'Virtual Points', desc: 'Credit user wallet', icon: Coins },
    { id: 'feature_unlock', name: 'Feature Unlock', desc: 'Unlock premium app features', icon: Key },
  ] as const;

  // Custom Input Styling
  const getInputStyle = (fieldName: string): React.CSSProperties => ({
    width: '100%',
    padding: '10px 14px',
    border: `1.5px solid ${focusedField === fieldName ? theme.colors.primary[500] : theme.colors.border.default}`,
    borderRadius: '8px',
    outline: 'none',
    fontSize: '13px',
    color: theme.colors.text.primary,
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === fieldName ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : 'none',
    fontFamily: 'inherit',
  });

  const sectionContainerStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: '12px',
    border: `1px solid ${theme.colors.border.default}`,
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.3)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
      <div className="hide-scrollbar" style={{
        backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '640px',
        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', border: `1px solid ${theme.colors.border.default}`
      }}>
        {/* Header */}
        <div style={{ 
          padding: '18px 24px', borderBottom: `1px solid ${theme.colors.border.light}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(8px)', zIndex: 10
        }}>
          <div>
             <h2 style={{ fontSize: '18px', fontWeight: 700, color: theme.colors.text.primary, margin: 0, letterSpacing: '-0.02em', fontFamily: 'inherit' }}>
               {editReward ? 'Edit Industrial Reward' : 'Create Industrial Reward'}
             </h2>
             <p style={{ fontSize: '12px', color: theme.colors.text.secondary, margin: '4px 0 0 0', fontWeight: 400 }}>
               Configure dynamic metadata and visual assets for your gamification engine.
             </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.text.secondary,
              padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.background.hover}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="hide-scrollbar" style={{ 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          overflowY: 'auto'
        }}>
          
          {/* Section 1: Reward Info */}
          <div style={sectionContainerStyle}>
            {/* Archetype Card Grid */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '8px' }}>
                Reward Archetype (Type) <span style={{ color: theme.colors.red[500] }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {archetypes.map((arch) => {
                  const IconComponent = arch.icon;
                  const isSelected = formData.type === arch.id;
                  return (
                    <div 
                      key={arch.id}
                      onClick={() => setFormData({ ...formData, type: arch.id })}
                      style={{
                        padding: '12px',
                        border: `1.5px solid ${isSelected ? theme.colors.primary[500] : theme.colors.border.default}`,
                        borderRadius: '10px',
                        backgroundColor: isSelected ? `${theme.colors.primary[50]}` : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: isSelected ? '0 2px 4px rgba(99, 102, 241, 0.05)' : 'none',
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = theme.colors.border.hover;
                          e.currentTarget.style.backgroundColor = theme.colors.background.hover;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = theme.colors.border.default;
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#ffffff' : theme.colors.slate[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? theme.colors.primary[500] : theme.colors.slate[500],
                        flexShrink: 0,
                        border: `1px solid ${isSelected ? theme.colors.primary[100] : 'transparent'}`,
                      }}>
                        <IconComponent size={16} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? theme.colors.primary[700] : theme.colors.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {arch.name}
                        </span>
                        <span style={{ fontSize: '10px', color: theme.colors.text.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {arch.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '6px' }}>
                Reward Name <span style={{ color: theme.colors.red[500] }}>*</span>
              </label>
              <input 
                placeholder="e.g. 50% Off Swiggy"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={getInputStyle('name')}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '6px' }}>
                Internal Description
              </label>
              <textarea 
                placeholder="What does this reward do? (Visible only to admins)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                style={{ ...getInputStyle('description'), resize: 'vertical' }}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Section 2: Vault Stock Limit */}
          <div style={sectionContainerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text.primary }}>Global Stock Limit (Vault)</span>
                <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>Automatically stop reward distribution after reaching limit</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setHasLimit(!hasLimit);
                  if (hasLimit) {
                    setInventory({ total_quantity: '' });
                  }
                }}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  backgroundColor: hasLimit ? theme.colors.primary[500] : theme.colors.gray[300],
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  padding: 0,
                  outline: 'none'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: '2px',
                  left: hasLimit ? '20px' : '2px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                }} />
              </button>
            </div>

            {hasLimit && (
              <div style={{
                padding: '14px',
                backgroundColor: theme.colors.slate[50],
                borderRadius: '8px',
                border: `1px solid ${theme.colors.border.default}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: theme.colors.text.primary }}>
                  Max Quantity Available
                </label>
                <input 
                  type="number"
                  placeholder="e.g. 500"
                  value={inventory.total_quantity}
                  onChange={(e) => setInventory({ total_quantity: e.target.value })}
                  style={getInputStyle('quantity')}
                  onFocus={() => setFocusedField('quantity')}
                  onBlur={() => setFocusedField(null)}
                />
                <span style={{ fontSize: '11px', color: theme.colors.text.secondary }}>
                  If left blank or set to 0, limits won't be applied.
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Conditional Configurations */}
          {formData.type === 'points' && (
            <div style={sectionContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${theme.colors.border.light}`, paddingBottom: '10px' }}>
                <Coins size={18} color={theme.colors.primary[500]} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text.primary }}>Virtual Currency Configuration</span>
              </div>
              <div>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Amount to Credit</label>
                 <input 
                   type="number"
                   value={pointsConfig.amount}
                   onChange={(e) => setPointsConfig({...pointsConfig, amount: Number(e.target.value)})}
                   style={getInputStyle('amount')}
                   onFocus={() => setFocusedField('amount')}
                   onBlur={() => setFocusedField(null)}
                 />
              </div>
            </div>
          )}

          {formData.type === 'feature_unlock' && (
            <div style={sectionContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${theme.colors.border.light}`, paddingBottom: '10px' }}>
                <Key size={18} color={theme.colors.primary[500]} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text.primary }}>Feature Unlock Settings</span>
              </div>
              <div>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Feature Flag / Key Name</label>
                 <input 
                   placeholder="e.g., enable_dark_mode"
                   value={featureConfig.featureFlagId}
                   onChange={(e) => setFeatureConfig({...featureConfig, featureFlagId: e.target.value})}
                   style={getInputStyle('featureFlagId')} 
                   onFocus={() => setFocusedField('featureFlagId')}
                   onBlur={() => setFocusedField(null)}
                 />
              </div>
            </div>
          )}

          {formData.type === 'coupon' && (
            <div style={sectionContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${theme.colors.border.light}`, paddingBottom: '10px' }}>
                <Gift size={18} color={theme.colors.primary[500]} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text.primary }}>Digital Coupon Configuration</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Type</label>
                  <select 
                    value={couponConfig.couponType}
                    onChange={(e) => setCouponConfig({...couponConfig, couponType: e.target.value})}
                    style={getInputStyle('couponType')}
                    onFocus={() => setFocusedField('couponType')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="flat">Flat Value</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Value</label>
                  <input 
                    type="number"
                    value={couponConfig.couponValue}
                    onChange={(e) => setCouponConfig({...couponConfig, couponValue: e.target.value})}
                    placeholder="e.g. 50"
                    style={getInputStyle('couponValue')}
                    onFocus={() => setFocusedField('couponValue')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Code Type</label>
                  <select 
                    value={couponConfig.codeType}
                    onChange={(e) => setCouponConfig({...couponConfig, codeType: e.target.value})}
                    style={getInputStyle('codeType')}
                    onFocus={() => setFocusedField('codeType')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="static">Static Code (Single)</option>
                    <option value="bulk">Bulk Upload (CSV List)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Expiry Type</label>
                  <select 
                    value={couponConfig.expiryType}
                    onChange={(e) => setCouponConfig({...couponConfig, expiryType: e.target.value})}
                    style={getInputStyle('expiryType')}
                    onFocus={() => setFocusedField('expiryType')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="never">Never Expire</option>
                    <option value="date">Specific Date</option>
                  </select>
                </div>
              </div>

              {couponConfig.codeType === 'static' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Code</label>
                  <input 
                    value={couponConfig.code}
                    placeholder="e.g. SAVE50"
                    onChange={(e) => setCouponConfig({...couponConfig, code: e.target.value})}
                    style={getInputStyle('code')}
                    onFocus={() => setFocusedField('code')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              )}

              {couponConfig.codeType === 'bulk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ backgroundColor: '#f0f4ff', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                    <p style={{ fontSize: '11px', color: '#1e40af', margin: 0 }}>
                      CSV must contain a <strong>code</strong> column header. Each row beneath it represents one unique coupon code.
                    </p>
                  </div>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '8px 16px', border: '1px solid #a78bfa', borderRadius: '8px',
                    backgroundColor: '#f5f3ff', cursor: 'pointer', fontSize: '12px',
                    color: '#7c3aed', fontWeight: 600, transition: 'all 0.2s', alignSelf: 'flex-start'
                  }}>
                    <UploadCloud size={14} />
                    Upload CSV
                    <input type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: 'none' }} />
                  </label>
                  {bulkCodes.length > 0 && (
                    <p style={{ fontSize: '12px', color: theme.colors.success, marginTop: '4px', fontWeight: 500 }}>
                      ✓ {bulkCodes.length} coupon codes loaded.
                    </p>
                  )}
                </div>
              )}

              {couponConfig.expiryType === 'date' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Expiry Date</label>
                  <input 
                    type="datetime-local"
                    value={couponConfig.expiryDate}
                    onChange={(e) => setCouponConfig({...couponConfig, expiryDate: e.target.value})}
                    style={getInputStyle('expiryDate')} 
                    onFocus={() => setFocusedField('expiryDate')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Section 4: Visual Assets */}
          <div style={sectionContainerStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: `1px solid ${theme.colors.border.light}`, paddingBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text.primary }}>Visual Assets</span>
              <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>Upload custom icons or link external image URLs</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
              {/* Active State Icon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.text.primary }}>Active Reward Icon</label>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="url"
                    placeholder="Image URL (https://...)"
                    value={formData.iconUrl && !formData.iconUrl.startsWith('blob:') ? formData.iconUrl : ''}
                    onChange={(e) => { setFormData({...formData, iconUrl: e.target.value}); setUploadMode('preset'); }}
                    style={getInputStyle('iconUrl')}
                    onFocus={() => setFocusedField('iconUrl')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.iconUrl && (
                     <img src={formData.iconUrl} alt="Preview" style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '8px', border: `1px solid ${theme.colors.border.default}`, backgroundColor: theme.colors.slate[50], flexShrink: 0 }} />
                  )}
                </div>

                <label style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '16px 12px', border: `1.5px dashed ${uploading ? '#cbd5e1' : theme.colors.primary[200]}`, borderRadius: '10px',
                  backgroundColor: uploading ? '#f8fafc' : (uploadMode === 'upload' && formData.iconUrl && !formData.iconUrl.startsWith('blob:') ? theme.colors.primary[50] : 'white'), 
                  cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  pointerEvents: uploading ? 'none' : 'auto', minHeight: '90px'
                }}>
                  {uploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div className="animate-spin" style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: theme.colors.primary[500] }} />
                      <div style={{ fontSize: '10px', color: theme.colors.text.secondary }}>Uploading...</div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={18} color={theme.colors.text.secondary} style={{ marginBottom: '4px' }} />
                      <span style={{ fontSize: '11px', color: theme.colors.primary[600], fontWeight: 600 }}>Upload Icon</span>
                      <span style={{ fontSize: '9px', color: theme.colors.text.secondary }}>JPG, PNG, GIF</span>
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'iconUrl')} disabled={uploading} />
                    </>
                  )}
                </label>
              </div>

              {/* Locked / Grayscale Icon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.text.primary }}>Locked / Grayscale Icon (Optional)</label>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="url"
                    placeholder="Grayscale URL (https://...)"
                    value={formData.lockedIconUrl && !formData.lockedIconUrl.startsWith('blob:') ? formData.lockedIconUrl : ''}
                    onChange={(e) => setFormData({...formData, lockedIconUrl: e.target.value})}
                    style={getInputStyle('lockedIconUrl')}
                    onFocus={() => setFocusedField('lockedIconUrl')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.lockedIconUrl && (
                     <img src={formData.lockedIconUrl} alt="Preview" style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '8px', border: `1px solid ${theme.colors.border.default}`, backgroundColor: theme.colors.slate[50], flexShrink: 0, filter: 'grayscale(100%) opacity(80%)' }} />
                  )}
                </div>

                <label style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '16px 12px', border: `1.5px dashed ${lockedUploading ? '#cbd5e1' : theme.colors.primary[200]}`, borderRadius: '10px',
                  backgroundColor: lockedUploading ? '#f8fafc' : (formData.lockedIconUrl && !formData.lockedIconUrl.startsWith('blob:') ? theme.colors.primary[50] : 'white'), 
                  cursor: lockedUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  pointerEvents: lockedUploading ? 'none' : 'auto', minHeight: '90px'
                }}>
                  {lockedUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div className="animate-spin" style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: theme.colors.primary[500] }} />
                      <div style={{ fontSize: '10px', color: theme.colors.text.secondary }}>Uploading...</div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={18} color={theme.colors.text.secondary} style={{ marginBottom: '4px' }} />
                      <span style={{ fontSize: '11px', color: theme.colors.primary[600], fontWeight: 600 }}>Upload Icon</span>
                      <span style={{ fontSize: '9px', color: theme.colors.text.secondary }}>JPG, PNG, GIF</span>
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'lockedIconUrl')} disabled={lockedUploading} />
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Section 5: Custom Variables */}
          <div style={sectionContainerStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text.primary }}>Custom Variables</span>
              <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>Attach dynamic metadata properties to this reward</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              {(formData.customVariables || []).map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    placeholder="Key (e.g. merchant_id)" 
                    value={v.key} 
                    onChange={(e) => updateCustomVar(i, 'key', e.target.value)} 
                    style={{ ...getInputStyle(`varKey-${i}`), flex: 1 }} 
                    onFocus={() => setFocusedField(`varKey-${i}`)}
                    onBlur={() => setFocusedField(null)}
                  />
                  <input 
                    placeholder="Value" 
                    value={v.value} 
                    onChange={(e) => updateCustomVar(i, 'value', e.target.value)} 
                    style={{ ...getInputStyle(`varVal-${i}`), flex: 1 }} 
                    onFocus={() => setFocusedField(`varVal-${i}`)}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomVar(i)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.colors.red[500],
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.red[50]}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button"
                onClick={addCustomVar}
                style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', 
                  color: theme.colors.primary[600], border: `1px dashed ${theme.colors.primary[300]}`, 
                  borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 500, 
                  cursor: 'pointer', backgroundColor: 'transparent', transition: 'all 0.2s',
                  marginTop: (formData.customVariables || []).length > 0 ? '6px' : '0'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary[50];
                  e.currentTarget.style.borderColor = theme.colors.primary[500];
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = theme.colors.primary[300];
                }}
              >
                <Plus size={14} /> Add Custom Variable
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', borderTop: `1px solid ${theme.colors.border.light}`,
          display: 'flex', justifyContent: 'flex-end', gap: '12px',
          position: 'sticky', bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(8px)', zIndex: 10
        }}>
          <button 
            type="button"
            onClick={onClose}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: `1px solid ${theme.colors.gray[300]}`,
              backgroundColor: 'white', color: theme.colors.text.primary, fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[50]}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleCreate}
            disabled={!formData.name}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              backgroundColor: formData.name ? theme.colors.primary[600] : theme.colors.gray[300], 
              color: 'white', fontSize: '13px', fontWeight: 600, 
              cursor: formData.name ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              boxShadow: formData.name ? '0 4px 6px -1px rgba(99, 102, 241, 0.1), 0 2px 4px -1px rgba(99, 102, 241, 0.05)' : 'none'
            }}
            onMouseOver={(e) => { if(formData.name) e.currentTarget.style.backgroundColor = theme.colors.primary[700] }}
            onMouseOut={(e) => { if(formData.name) e.currentTarget.style.backgroundColor = theme.colors.primary[600] }}
          >
            {editReward ? 'Save Changes' : 'Create Reward'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateRewardModal;
