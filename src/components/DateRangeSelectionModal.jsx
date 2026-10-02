import React, { useState } from 'react';
import { Calendar, X, Check, Clock, ChevronRight, Sparkles, Filter, ArrowRight } from 'lucide-react';

export default function DateRangeSelectionModal({
  isOpen,
  onClose,
  fromDate,
  toDate,
  onApply
}) {
  const [tempFrom, setTempFrom] = useState(fromDate || new Date().toISOString().slice(0, 10));
  const [tempTo, setTempTo] = useState(toDate || new Date().toISOString().slice(0, 10));

  React.useEffect(() => {
    if (isOpen) {
      if (fromDate) setTempFrom(fromDate);
      if (toDate) setTempTo(toDate);
    }
  }, [isOpen, fromDate, toDate]);

  if (!isOpen) return null;

  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const calculateDays = () => {
    try {
      const d1 = new Date(tempFrom + 'T00:00:00');
      const d2 = new Date(tempTo + 'T00:00:00');
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return '1 Day Audit Window (Snapshot)';
      if (diffDays < 0) return 'Invalid Range (To Date earlier than From Date)';
      return `${diffDays} Nights / ${diffDays + 1} Days Stay Period`;
    } catch {
      return '1 Day Window';
    }
  };

  const handlePreset = (type) => {
    const today = new Date();
    let f = today.toISOString().slice(0, 10);
    let t = today.toISOString().slice(0, 10);

    if (type === 'today') {
      // today to today
    } else if (type === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      f = y.toISOString().slice(0, 10);
      t = y.toISOString().slice(0, 10);
    } else if (type === 'tomorrow') {
      const tm = new Date(today);
      tm.setDate(tm.getDate() + 1);
      f = tm.toISOString().slice(0, 10);
      t = tm.toISOString().slice(0, 10);
    } else if (type === 'last7') {
      const p = new Date(today);
      p.setDate(p.getDate() - 6);
      f = p.toISOString().slice(0, 10);
    } else if (type === 'next7') {
      const n = new Date(today);
      n.setDate(n.getDate() + 6);
      t = n.toISOString().slice(0, 10);
    } else if (type === 'thisMonth') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      f = first.toISOString().slice(0, 10);
      t = last.toISOString().slice(0, 10);
    } else if (type === 'lastMonth') {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      f = first.toISOString().slice(0, 10);
      t = last.toISOString().slice(0, 10);
    } else if (type === 'fyYear') {
      const first = new Date(today.getFullYear(), 3, 1); // 1st April
      if (today.getMonth() < 3) first.setFullYear(today.getFullYear() - 1);
      const last = new Date(first.getFullYear() + 1, 2, 31); // 31st March
      f = first.toISOString().slice(0, 10);
      t = last.toISOString().slice(0, 10);
    }

    setTempFrom(f);
    setTempTo(t);
  };

  const handleSaveAndApply = () => {
    if (onApply) {
      onApply(tempFrom, tempTo);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(3, 7, 18, 0.78)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}
    onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(145deg, #0b1526 0%, #0f1f38 100%)',
          borderRadius: '12px',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          background: 'linear-gradient(90deg, #091322 0%, #13243f 100%)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              <Calendar size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                MASTER TABULAR ROOM LEDGER DATES
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                Front Office Module (FOM) Audit & Real-Time Occupancy Window
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Quick Preset Buttons */}
          <div>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
              ⚡ Quick Audit Presets
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'today', label: 'Today', icon: '📍' },
                { id: 'yesterday', label: 'Yesterday', icon: '⏪' },
                { id: 'tomorrow', label: 'Tomorrow', icon: '⏩' },
                { id: 'last7', label: 'Last 7 Days', icon: '📅' },
                { id: 'next7', label: 'Next 7 Days', icon: '🗓️' },
                { id: 'thisMonth', label: 'This Month', icon: '📊' },
                { id: 'lastMonth', label: 'Last Month', icon: '📉' },
                { id: 'fyYear', label: 'FY 2026-27', icon: '🏛️' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePreset(p.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '8px 6px',
                    color: '#e2e8f0',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: 'rgba(3, 7, 18, 0.45)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {/* From Date */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24' }}>
                  FROM DATE :
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {formatFriendlyDate(tempFrom)}
                </span>
              </div>
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                style={{
                  width: '100%',
                  background: '#040914',
                  border: '1.5px solid rgba(56, 189, 248, 0.5)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                }}
              />
            </div>

            {/* To Date */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24' }}>
                  TO DATE :
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {formatFriendlyDate(tempTo)}
                </span>
              </div>
              <input
                type="date"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value)}
                style={{
                  width: '100%',
                  background: '#040914',
                  border: '1.5px solid rgba(56, 189, 248, 0.5)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                }}
              />
            </div>
          </div>

          {/* Stay Span & Audit Status Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px dashed rgba(56, 189, 248, 0.35)',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                {calculateDays()}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              All 39 Keys Synchronized
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          padding: '1rem 1.25rem',
          background: 'rgba(9, 19, 34, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndApply}
            style={{
              padding: '8px 22px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              border: '1px solid #4ade80',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.45)',
              transition: 'all 0.15s ease'
            }}
          >
            <Check size={16} />
            Apply & Display Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
