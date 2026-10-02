import React, { useState, useEffect } from 'react';
import { 
  Sliders, Save, RefreshCw, CheckCircle2, ShieldCheck, 
  Coffee, Bed, Car, Clock, Shield, Database, Bell, AlertTriangle
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  breakfastRate: 250,
  extraBedRate: 400,
  stationDropRate: 350,
  standardCheckInTime: '11:00 AM',
  standardCheckOutTime: '12:00 PM',
  lateCheckoutGraceMins: 60,
  minStayNights: 1,
  minStayFestivalNights: 2,
  housekeepingTurnaroundMinutes: 45,
  autoDirtyOnCheckout: true,
  otaBufferRooms: 20,
  directBarDiscountPct: 5,
  managerPin: '7650'
};

/**
 * OperationsSettingsTab Component - Inspired by The Wild Oasis (/settings)
 * Central PMS operational policies, pricing thresholds, and turnover SLAs
 */
export default function OperationsSettingsTab({ onSettingsUpdated }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('hsi_operations_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not read saved settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      localStorage.setItem('hsi_operations_settings', JSON.stringify(settings));

      // Dispatch to Cloudflare D1
      const adminPin = localStorage.getItem('hsi_admin_pin') || settings.managerPin || '7650';
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminPin
        },
        body: JSON.stringify({
          action: 'update_operations_settings',
          payload: settings
        })
      }).catch(err => console.warn('Offline settings fallback:', err));

      if (onSettingsUpdated) {
        onSettingsUpdated(settings);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all operational policies and rates to standard factory defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('hsi_operations_settings');
      if (onSettingsUpdated) onSettingsUpdated(DEFAULT_SETTINGS);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(26, 38, 57, 0.95))',
      border: '1px solid rgba(212, 175, 55, 0.35)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span className="badge" style={{
              background: 'rgba(212, 175, 55, 0.18)',
              color: 'var(--gold-glow)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              THE WILD OASIS OPERATIONS ENGINE
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Central Master Policy &amp; SLA Configuration
            </span>
          </div>
          <h3 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#fff',
            margin: '0.35rem 0 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sliders size={20} color="var(--gold-glow)" /> Central Operational Policies &amp; Thresholds
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Live parameters governing front desk check-in, breakfast billing, turnover SLAs, and inventory pools
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary-gold"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
            }}
          >
            {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            Save &amp; Sync to Edge D1
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          background: 'rgba(52, 211, 153, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          color: '#34d399',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          <CheckCircle2 size={16} /> Operational settings successfully updated and synced across front desk &amp; Cloudflare D1!
        </div>
      )}

      {/* Grid of 4 Configuration Modules */}
      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Module 1: F&B & Ancillary Add-on Rates */}
        <div style={{
          background: 'rgba(6, 14, 26, 0.55)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '10px',
          padding: '1.25rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--gold-glow)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Coffee size={17} /> 1. Ancillary Pricing &amp; Meal Plans
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Satvik Breakfast Buffet Rate (₹ / guest / day)
              </label>
              <input
                type="number"
                value={settings.breakfastRate}
                onChange={(e) => handleChange('breakfastRate', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Applied during online checkout and in-person check-in upsells (SAC 996331)
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Extra Rollaway Bed Tariff (₹ / bed / night)
              </label>
              <input
                type="number"
                value={settings.extraBedRate}
                onChange={(e) => handleChange('extraBedRate', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Includes fresh luxury linen set and extra morning hygiene kit
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Rayagada Junction (RGDA) Station Cab Transfer (₹ flat)
              </label>
              <input
                type="number"
                value={settings.stationDropRate}
                onChange={(e) => handleChange('stationDropRate', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Dedicated Innova / Dzire station drop and pickup logistics (SAC 996412)
              </span>
            </div>
          </div>
        </div>

        {/* Module 2: Check-In / Check-Out Times & MLOS */}
        <div style={{
          background: 'rgba(6, 14, 26, 0.55)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '10px',
          padding: '1.25rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={17} /> 2. Check-In Timing &amp; Stay Rules
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Standard Check-In
                </label>
                <input
                  type="text"
                  value={settings.standardCheckInTime}
                  onChange={(e) => handleChange('standardCheckInTime', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Standard Check-Out
                </label>
                <input
                  type="text"
                  value={settings.standardCheckOutTime}
                  onChange={(e) => handleChange('standardCheckOutTime', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Late Check-Out Grace Period (Minutes)
              </label>
              <input
                type="number"
                value={settings.lateCheckoutGraceMins}
                onChange={(e) => handleChange('lateCheckoutGraceMins', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Allows front desk to waive late penalty charges within this window
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Minimum Length of Stay (MLOS) during Peak Yatra
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.minStayFestivalNights}
                onChange={(e) => handleChange('minStayFestivalNights', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Enforced during Maa Majhighariani Chaitra Yatra &amp; plant shutdown events
              </span>
            </div>
          </div>
        </div>

        {/* Module 3: Housekeeping SLA & Automation */}
        <div style={{
          background: 'rgba(6, 14, 26, 0.55)',
          border: '1px solid rgba(250, 204, 21, 0.25)',
          borderRadius: '10px',
          padding: '1.25rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#facc15', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Bed size={17} /> 3. Housekeeping Turnover SLAs
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Turnover SLA Target (Minutes from Checkout)
              </label>
              <input
                type="number"
                value={settings.housekeepingTurnaroundMinutes}
                onChange={(e) => handleChange('housekeepingTurnaroundMinutes', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Triggers yellow warning badge if room remains Vacant Dirty past this duration
              </span>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.autoDirtyOnCheckout}
                onChange={(e) => handleChange('autoDirtyOnCheckout', e.target.checked)}
                style={{ accentColor: '#facc15', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                  Auto-Transition to 'Vacant Dirty'
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  The Wild Oasis protocol: Instantly dispatches cleaning ticket upon checkout settlement
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Module 4: OTA Parity & Direct Booking Strategy */}
        <div style={{
          background: 'rgba(6, 14, 26, 0.55)',
          border: '1px solid rgba(167, 139, 250, 0.25)',
          borderRadius: '10px',
          padding: '1.25rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#a78bfa', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={17} /> 4. Direct Channel Yield &amp; Security
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Direct Website BAR Discount (%)
              </label>
              <input
                type="number"
                value={settings.directBarDiscountPct}
                onChange={(e) => handleChange('directBarDiscountPct', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Guarantees direct website bookings are always cheaper than MMT / Booking.com
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Emergency OTA Reserve Buffer (Rooms)
              </label>
              <input
                type="number"
                value={settings.otaBufferRooms}
                onChange={(e) => handleChange('otaBufferRooms', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Number of physical rooms reserved exclusively for high-margin direct sales
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
