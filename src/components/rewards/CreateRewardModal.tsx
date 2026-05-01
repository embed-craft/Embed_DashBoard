import React, { useState } from 'react';
import { theme } from '../../styles/design-tokens';
import { useStore, RewardItem } from '../../store/useStore';
import { X, UploadCloud, Plus } from 'lucide-react';

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
  const [inventory, setInventory] = useState<{ total_quantity: string }>({ total_quantity: editReward?.inventory?.total_quantity !== undefined && editReward?.inventory?.total_quantity !== null ? String(editReward.inventory.total_quantity) : '' });

  const [uploadMode, setUploadMode] = useState<'preset' | 'upload'>('preset');

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
    if (inventory.total_quantity !== undefined && inventory.total_quantity !== null && inventory.total_quantity !== '') {
        (payload as any).inventory = { total_quantity: Number(inventory.total_quantity), claimed_quantity: 0 };
    } else {
        (payload as any).inventory = { total_quantity: null, claimed_quantity: 0 };
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local object URL to simulate upload
      const objUrl = URL.createObjectURL(file);
      setFormData({ ...formData, iconUrl: objUrl });
      setUploadMode('upload');
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

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '640px',
        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: `1px solid ${theme.colors.border.default}`
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 24px', borderBottom: `1px solid ${theme.colors.gray[100]}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(8px)', zIndex: 10
        }}>
          <div>
             <h2 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary, margin: 0, letterSpacing: '-0.02em' }}>{editReward ? 'Edit Industrial Reward' : 'Create Industrial Reward'}</h2>
             <p style={{ fontSize: '12px', color: theme.colors.text.secondary, margin: '2px 0 0 0' }}>Configure dynamic metadata and visual assets for your gamification engine.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.text.secondary }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', marginBottom: '24px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '8px' }}>Reward Name <span style={{color: 'red'}}>*</span></label>
              <input 
                placeholder="e.g. 50% Off Swiggy"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.gray[200]}`, borderRadius: '8px', outline: 'none', transition: 'border 0.2s', fontSize: '13px' }} 
                onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary[500]}
                onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.gray[200]}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '8px' }}>Reward Archetype (Type)</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.gray[200]}`, borderRadius: '8px', outline: 'none', backgroundColor: '#fafafa', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }} 
              >
                <option value="coupon">Digital Coupon</option>
                <option value="badge">Digital Badge / NFT</option>
                <option value="points">Virtual Currency / Points</option>
                <option value="feature_unlock">App Feature Unlock</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '8px' }}>Internal Description</label>
            <textarea 
              placeholder="What does this reward do? (Visible only to admins)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.gray[200]}`, borderRadius: '8px', outline: 'none', resize: 'vertical', fontSize: '13px' }} 
              onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary[500]}
              onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.gray[200]}
            />
          </div>

          <div style={{ backgroundColor: '#fff8f1', padding: '16px', borderRadius: '8px', border: '1px solid #ffe8cc' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d97706', marginBottom: '4px' }}>Global Company Stock Limit (Vault)</label>
              <p style={{ fontSize: '11px', color: '#b45309', marginBottom: '8px', marginTop: 0 }}>If set, the backend will completely stop distributing this reward once this many people claim it across ALL campaigns globally.</p>
              <input 
                type="number"
                placeholder="Leave blank for infinite stock"
                value={inventory.total_quantity}
                onChange={(e) => setInventory({ total_quantity: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid #fcd34d`, borderRadius: '8px', outline: 'none', fontSize: '13px', backgroundColor: 'white' }} 
              />
          </div>

          {/* Conditional Fields Divider */}
          <div style={{ height: '1px', backgroundColor: theme.colors.gray[100], margin: '4px 0' }} />

          {/* Conditional Fields based on Type */}
          {formData.type === 'points' && (
            <div style={{ backgroundColor: theme.colors.gray[50], padding: '20px', borderRadius: '8px' }}>
               <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Amount to Credit</label>
               <input 
                 type="number"
                 value={pointsConfig.amount}
                 onChange={(e) => setPointsConfig({...pointsConfig, amount: Number(e.target.value)})}
                 style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none' }} 
               />
            </div>
          )}

          {formData.type === 'feature_unlock' && (
            <div style={{ backgroundColor: theme.colors.gray[50], padding: '20px', borderRadius: '8px' }}>
               <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Feature Flag / Key Name</label>
               <input 
                 placeholder="e.g., enable_dark_mode"
                 value={featureConfig.featureFlagId}
                 onChange={(e) => setFeatureConfig({...featureConfig, featureFlagId: e.target.value})}
                 style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none' }} 
               />
            </div>
          )}

          {/* Conditional Coupon Fields */}
          {formData.type === 'coupon' && (
            <div style={{ backgroundColor: theme.colors.gray[50], padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Type</label>
                <select 
                  value={couponConfig.couponType}
                  onChange={(e) => setCouponConfig({...couponConfig, couponType: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="flat">Flat</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Value</label>
                <input 
                  type="number"
                  value={couponConfig.couponValue}
                  onChange={(e) => setCouponConfig({...couponConfig, couponValue: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Code Type</label>
                <select 
                  value={couponConfig.codeType}
                  onChange={(e) => setCouponConfig({...couponConfig, codeType: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="static">Static</option>
                  <option value="bulk">Bulk</option>
                </select>
              </div>

              {couponConfig.codeType === 'static' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Code</label>
                  <input 
                    value={couponConfig.code}
                    placeholder="e.g. SAVE50"
                    onChange={(e) => setCouponConfig({...couponConfig, code: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none' }} 
                  />
                </div>
              )}

              {couponConfig.codeType === 'bulk' && (
                <div>
                  <div style={{ backgroundColor: '#f0f4ff', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #dbeafe' }}>
                    <p style={{ fontSize: '12px', color: '#3b82f6', margin: 0 }}>Your CSV should have a column header called <strong>code</strong> as the first column. Each row should contain a coupon code.</p>
                  </div>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', border: '1px solid #a78bfa', borderRadius: '8px',
                    backgroundColor: '#f5f3ff', cursor: 'pointer', fontSize: '13px',
                    color: '#7c3aed', fontWeight: 600, transition: 'all 0.2s'
                  }}>
                    <UploadCloud size={16} />
                    Upload CSV
                    <input type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: 'none' }} />
                  </label>
                  {bulkCodes.length > 0 && (
                    <p style={{ fontSize: '12px', color: theme.colors.text.secondary, marginTop: '8px' }}>
                      ✅ <strong>{bulkCodes.length}</strong> coupon codes parsed successfully.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Coupon Expiry Type</label>
                <select 
                  value={couponConfig.expiryType}
                  onChange={(e) => setCouponConfig({...couponConfig, expiryType: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="never">Never</option>
                  <option value="date">Date</option>
                </select>
              </div>

              {couponConfig.expiryType === 'date' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Expiry Date</label>
                  <input 
                    type="datetime-local"
                    value={couponConfig.expiryDate}
                    onChange={(e) => setCouponConfig({...couponConfig, expiryDate: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none', backgroundColor: 'white' }} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Reward Icon Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '12px' }}>Reward Icon</label>
            
            {/* Custom URL pasting */}
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="url"
                placeholder="Paste Image URL (https://...)"
                value={formData.iconUrl && !formData.iconUrl.startsWith('blob:') ? formData.iconUrl : ''}
                onChange={(e) => { setFormData({...formData, iconUrl: e.target.value}); setUploadMode('preset'); }}
                style={{ flex: 1, padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none', fontSize: '13px' }}
              />
              {formData.iconUrl && (
                 <img src={formData.iconUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: `1px solid ${theme.colors.gray[200]}`, backgroundColor: '#fafafa' }} />
              )}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px', color: theme.colors.text.secondary, fontSize: '12px' }}>
               — OR — 
            </div>

            {/* Custom Upload Box */}
            <label style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '32px 24px', border: `1px dashed ${theme.colors.primary[300]}`, borderRadius: '12px',
              backgroundColor: uploadMode === 'upload' && formData.iconUrl && formData.iconUrl.startsWith('blob:') ? theme.colors.primary[50] : 'white', 
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <UploadCloud size={24} color={theme.colors.text.secondary} style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', color: theme.colors.primary[600], marginBottom: '4px' }}>Click to Browse local system</div>
              <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>Accepts .jpg, .png and .gif files only</div>
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
              
              {uploadMode === 'upload' && formData.iconUrl && formData.iconUrl.startsWith('blob:') && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '13px', fontWeight: 500 }}>
                  ✓ Local file selected successfully
                </div>
              )}
            </label>
          </div>

          {/* Locked Reward Icon Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '12px' }}>Locked/Grayscale Icon <span style={{fontWeight: 400, color: theme.colors.gray[400]}}>(Optional)</span></label>
            
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="url"
                placeholder="Paste Image URL for Locked State (https://...)"
                value={formData.lockedIconUrl && !formData.lockedIconUrl.startsWith('blob:') ? formData.lockedIconUrl : ''}
                onChange={(e) => { setFormData({...formData, lockedIconUrl: e.target.value}); }}
                style={{ flex: 1, padding: '10px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', outline: 'none', fontSize: '13px' }}
              />
              {formData.lockedIconUrl && (
                 <img src={formData.lockedIconUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: `1px solid ${theme.colors.gray[200]}`, backgroundColor: '#fafafa', filter: 'grayscale(100%) opacity(80%)' }} />
              )}
            </div>
          </div>

          {/* Custom Variables */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary, marginBottom: '6px' }}>Custom Variables</label>
            <div style={{ border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', padding: '16px' }}>
              
              {(formData.customVariables || []).map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input placeholder="Key" value={v.key} onChange={(e) => updateCustomVar(i, 'key', e.target.value)} style={{ flex: 1, padding: '8px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '6px', outline: 'none', fontSize: '13px' }} />
                  <input placeholder="Value" value={v.value} onChange={(e) => updateCustomVar(i, 'value', e.target.value)} style={{ flex: 1, padding: '8px 12px', border: `1px solid ${theme.colors.border.default}`, borderRadius: '6px', outline: 'none', fontSize: '13px' }} />
                </div>
              ))}

              <button 
                onClick={addCustomVar}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.primary[600],
                  background: 'none', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: 0
                }}>
                <Plus size={14} /> Add Variable
              </button>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', borderTop: `1px solid ${theme.colors.gray[100]}`,
          display: 'flex', justifyContent: 'flex-end', gap: '12px',
          position: 'sticky', bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(8px)', zIndex: 10
        }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '10px 24px', borderRadius: '8px', border: `1px solid ${theme.colors.gray[300]}`,
              backgroundColor: 'white', color: theme.colors.text.primary, fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[50]}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!formData.name}
            style={{ 
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              backgroundColor: formData.name ? theme.colors.primary[600] : theme.colors.gray[300], 
              color: 'white', fontSize: '14px', fontWeight: 600, 
              cursor: formData.name ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              boxShadow: formData.name ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
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
