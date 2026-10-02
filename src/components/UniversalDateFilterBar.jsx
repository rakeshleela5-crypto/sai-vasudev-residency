import React, { useState } from 'react';
import { Calendar, Download, Printer, FileSpreadsheet, RefreshCw, FileText, ExternalLink, SlidersHorizontal, Eye } from 'lucide-react';
import DateRangeSelectionModal from './DateRangeSelectionModal';
import DateAuditSnapshotModal from './DateAuditSnapshotModal';

/**
 * UniversalDateFilterBar
 * Authentic MysoftIndia Enterprise Date Range Controller
 * Matches Rayagada Hotel Reception Front Office Console
 * "From : [ Date ]   To : [ Date ]   [ Display ]   [ Date Range Modal ]"
 */
export default function UniversalDateFilterBar({
  fromDate,
  toDate,
  onDateChange,
  onDisplay,
  title = '',
  totalCount = null,
  totalAmount = null,
  onExportCSV = null,
  onExportExcel = null,
  onPrint = null,
  showPresets = true,
  compact = false,
  extraStats = null,
  auditRooms = [],
  rooms = [],
  auditItems = null,
  moduleType = null,
  columns = null,
  kpis = null,
  subtitle = "",
  onUpdateItem = null
}) {
  const [internalFrom, setInternalFrom] = useState(fromDate || new Date().toISOString().slice(0, 10));
  const [internalTo, setInternalTo] = useState(toDate || new Date().toISOString().slice(0, 10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDisplaying, setIsDisplaying] = useState(false);

  React.useEffect(() => {
    if (fromDate) setInternalFrom(fromDate);
    if (toDate) setInternalTo(toDate);
  }, [fromDate, toDate]);

  const formatMysoftDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleApply = (fromVal = internalFrom, toVal = internalTo, openPopView = true) => {
    setIsDisplaying(true);
    setTimeout(() => setIsDisplaying(false), 900);
    if (onDateChange) {
      onDateChange(fromVal, toVal);
    }
    if (onDisplay) {
      onDisplay(fromVal, toVal);
    }
    // Launch Pop View Modal when Display is triggered
    if (openPopView) {
      setIsAuditModalOpen(true);
    }
  };

  const setPreset = (type) => {
    const today = new Date();
    let f = today.toISOString().slice(0, 10);
    let t = today.toISOString().slice(0, 10);

    if (type === 'today') {
      // today
    } else if (type === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      f = y.toISOString().slice(0, 10);
      t = y.toISOString().slice(0, 10);
    } else if (type === '7days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 6);
      f = past.toISOString().slice(0, 10);
    } else if (type === 'thisMonth') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      f = first.toISOString().slice(0, 10);
      t = last.toISOString().slice(0, 10);
    } else if (type === 'year') {
      const first = new Date(today.getFullYear(), 3, 1); // Indian FY starting April
      if (today.getMonth() < 3) first.setFullYear(today.getFullYear() - 1);
      const last = new Date(first.getFullYear() + 1, 2, 31);
      f = first.toISOString().slice(0, 10);
      t = last.toISOString().slice(0, 10);
    }

    setInternalFrom(f);
    setInternalTo(t);
    handleApply(f, t, false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      background: 'linear-gradient(180deg, #0d1e38 0%, #091322 100%)',
      border: '1.5px solid rgba(56, 189, 248, 0.45)',
      borderRadius: '8px',
      padding: compact ? '8px 12px' : '10px 16px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      marginBottom: '1rem',
      width: '100%'
    }}>
      {/* Top Command Line: From Date, To Date, Vibrant Green Display Button, Modal Trigger, and Quick Presets */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* FROM DATE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              From :
            </span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="date"
                value={internalFrom}
                onChange={(e) => {
                  setInternalFrom(e.target.value);
                  if (onDateChange) onDateChange(e.target.value, internalTo);
                }}
                style={{
                  background: '#040914',
                  border: '1.5px solid rgba(56, 189, 248, 0.5)',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* TO DATE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              To :
            </span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="date"
                value={internalTo}
                onChange={(e) => {
                  setInternalTo(e.target.value);
                  if (onDateChange) onDateChange(internalFrom, e.target.value);
                }}
                style={{
                  background: '#040914',
                  border: '1.5px solid rgba(56, 189, 248, 0.5)',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* Authentic Mysoft Green Display Button with instant feedback */}
          <button
            type="button"
            onClick={() => handleApply()}
            style={{
              background: isDisplaying
                ? 'linear-gradient(180deg, #15803d 0%, #14532d 100%)'
                : 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              border: isDisplaying ? '1.5px solid #bbf7d0' : '1px solid #86efac',
              borderRadius: '5px',
              color: '#ffffff',
              padding: '5px 20px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isDisplaying
                ? '0 0 16px rgba(34, 197, 94, 0.8), inset 0 2px 4px rgba(0,0,0,0.4)'
                : '0 2px 10px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              transform: isDisplaying ? 'scale(0.97)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}
            title="Filter records between selected dates"
          >
            {isDisplaying ? '✓ Displayed' : 'Display'}
          </button>

          {/* Dedicated Dates Selection Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1.5px solid rgba(56, 189, 248, 0.6)',
              borderRadius: '5px',
              color: '#38bdf8',
              padding: '5px 12px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            title="Open Dedicated Date Range Picker & Audit Presets Modal"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.28)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
              e.currentTarget.style.color = '#38bdf8';
            }}
          >
            <Calendar size={14} />
            📅 Dates Selection Modal
          </button>

          {/* Quick Presets */}
          {showPresets && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: 'thisMonth', label: 'This Month' },
                { id: 'year', label: 'FY Year' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    color: '#94a3b8',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Tools: Column Visibility, CSV, Excel, Print, PDF as shown in authentic Mysoft photo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => alert("All 12 Columns Active: Room #, Floor, Tier, Status, In-House Guest, Phone, Company, Stay Period, Tariff, Balance Due, Key/HK, Actions")}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#cbd5e1',
              borderRadius: '4px',
              padding: '4px 9px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Toggle visible columns"
          >
            <SlidersHorizontal size={12} />
            Column visibility
          </button>

          {onExportCSV && (
            <button
              type="button"
              onClick={onExportCSV}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#cbd5e1',
                borderRadius: '4px',
                padding: '4px 9px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Export filtered records to CSV"
            >
              CSV
            </button>
          )}

          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#cbd5e1',
                borderRadius: '4px',
                padding: '4px 9px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Export to Excel Spreadsheet"
            >
              Excel
            </button>
          )}

          <button
            type="button"
            onClick={onPrint || (() => window.print())}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#cbd5e1',
              borderRadius: '4px',
              padding: '4px 9px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Print Current Filtered View"
          >
            <Printer size={12} />
            Print
          </button>
        </div>
      </div>

      {/* Dynamic Report Header Banner matching Mysoft screenshot (solid blue ribbon directly crowning table) */}
      {title && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 14px',
          background: 'linear-gradient(90deg, #1d4ed8 0%, #1e40af 50%, #172554 100%)',
          border: '1px solid rgba(96, 165, 250, 0.4)',
          borderRadius: '5px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
        }}>
          <span style={{
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#fef08a' }}>★</span>
            {title} FROM {formatMysoftDate(internalFrom)} TO {formatMysoftDate(internalTo)}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {extraStats}
            {totalCount !== null && (
              <span style={{ fontSize: '0.78rem', color: '#e0e7ff' }}>
                Records: <strong style={{ color: '#ffffff', fontSize: '0.84rem' }}>{totalCount}</strong>
              </span>
            )}
            {totalAmount !== null && (
              <span style={{ fontSize: '0.82rem', color: '#fef08a', fontWeight: 800 }}>
                Total: ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dates Selection Modal Component */}
      <DateRangeSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fromDate={internalFrom}
        toDate={internalTo}
        onApply={(f, t) => {
          setInternalFrom(f);
          setInternalTo(t);
          handleApply(f, t, true);
        }}
      />

      {/* Real-Time Audit Snapshot Pop View Modal */}
      <DateAuditSnapshotModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        fromDate={internalFrom}
        toDate={internalTo}
        title={title ? `${title} (AUDIT SNAPSHOT)` : "REAL-TIME AUDIT WINDOW SNAPSHOT"}
        subtitle={subtitle}
        moduleType={moduleType}
        rooms={auditRooms && auditRooms.length > 0 ? auditRooms : rooms}
        auditItems={auditItems}
        columns={columns}
        kpis={kpis}
        totalCount={totalCount}
        totalAmount={totalAmount}
        onExportCSV={onExportCSV}
        onExportExcel={onExportExcel}
        onPrint={onPrint}
        onUpdateItem={onUpdateItem}
      />
    </div>
  );
}
