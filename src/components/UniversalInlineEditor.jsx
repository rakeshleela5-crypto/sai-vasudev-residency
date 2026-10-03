/**
 * UniversalInlineEditor.jsx — Sri Sai Vasudev Residency
 * ─────────────────────────────────────────────────────
 * All named exports kept 100% backward-compatible.
 *
 * Architecture change (v2):
 *  - useUniversalInlineEdit  → pure no-op (editEngine.js handles everything globally)
 *  - InlineEditorBanner      → always-on floating status chip (no toggle)
 *  - InlineText              → self-contained contenteditable span (unchanged)
 *  - SheetsEditableCell      → self-contained click-to-input cell  (unchanged)
 *  - SheetsColumnHeader      → th with badge (unchanged)
 *  - SheetsToolbarLegend     → table status bar (unchanged)
 *
 * The actual click-to-edit behaviour for plain <td> cells is handled by
 * the document-centric singleton in src/editEngine.js which is imported
 * once in main.jsx.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Edit3, Check, RotateCcw, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   useUniversalInlineEdit — NOW A TRUE NO-OP
   editEngine.js handles ALL plain-td editing globally.
   Kept for backward compatibility — removing it would break 13+ imports.
   ───────────────────────────────────────────────────────────────────────── */
export function useUniversalInlineEdit(_options) {
  // No-op: the global editEngine (mounted in main.jsx) owns all td editing.
  // SheetsEditableCell components self-manage their own <input> overlay.
}

/* ─────────────────────────────────────────────────────────────────────────
   UniversalInlineContainer — thin wrapper, no longer attaches its own hook
   ───────────────────────────────────────────────────────────────────────── */
export function UniversalInlineContainer({
  children,
  className = '',
  style     = {},
  storagePrefix = 'hsi_universal'
}) {
  return (
    <div
      className={`hsi-universal-container hsi-live-edit-active ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   InlineText — self-contained click-to-type span / block element
   Works independently of editEngine (it manages its own contenteditable).
   ───────────────────────────────────────────────────────────────────────── */
export function InlineText({
  value       = '',
  onSave,
  isActive    = true,
  tag         = 'span',
  className   = '',
  style       = {},
  placeholder = 'Type here…',
  type        = 'text',
  multiline   = false,
  field       = '',
  roomId      = '',
  bookingId   = ''
}) {
  const elRef          = useRef(null);
  const [focused,   setFocused]   = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const origRef = useRef(value);

  useEffect(() => {
    origRef.current = value;
    if (elRef.current && document.activeElement !== elRef.current) {
      elRef.current.innerText = value != null ? String(value) : '';
    }
  }, [value]);

  const handleFocus = () => {
    setFocused(true);
    origRef.current = elRef.current ? elRef.current.innerText : value;
  };

  const handleBlur = () => {
    setFocused(false);
    if (!elRef.current) return;
    const next = elRef.current.innerText.trim();
    if (next !== String(origRef.current).trim()) {
      if (type === 'number') {
        const n = parseFloat(next.replace(/[^0-9.-]+/g, '')) || 0;
        if (onSave) onSave(n, next);
      } else {
        if (onSave) onSave(next);
      }
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      elRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (elRef.current) {
        elRef.current.innerText = String(origRef.current || '');
        elRef.current.blur();
      }
    }
  };

  const Tag = tag;
  return (
    <Tag
      ref={elRef}
      contentEditable={isActive}
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-field={field}
      data-room-id={roomId}
      data-booking-id={bookingId}
      title={isActive ? 'Click to type and edit directly' : ''}
      className={`hsi-inline-text ${isActive ? 'hsi-inline-editable' : ''} ${className}`}
      style={{
        display:         tag === 'span' ? 'inline-block' : 'block',
        cursor:          isActive ? 'text' : 'inherit',
        outline:         focused     ? '2px solid var(--gold-glow, #f3c64c)'
                       : isActive   ? '1px dashed rgba(243,198,76,0.4)'
                       : 'none',
        outlineOffset:   '2px',
        borderRadius:    '3px',
        padding:         isActive ? '1px 3px' : '0',
        backgroundColor: focused    ? 'rgba(6,14,26,0.95)'
                       : justSaved  ? 'rgba(16,185,129,0.25)'
                       : isActive   ? 'rgba(243,198,76,0.06)'
                       : 'transparent',
        color:           justSaved ? '#34d399' : focused ? '#fff' : 'inherit',
        transition:      'all 0.15s ease',
        minWidth:        isActive && !value ? '30px' : 'auto',
        ...style
      }}
      data-placeholder={placeholder}
    >
      {value != null ? String(value) : ''}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   InlineEditorBanner — always-on floating chip (no toggle, no close button)
   Shows keyboard shortcuts. Position: fixed bottom-right.
   ───────────────────────────────────────────────────────────────────────── */
export function InlineEditorBanner({
  label    = 'Direct Keyboard Edit Mode',
  onReset,
  // Legacy props accepted but ignored:
  isActive,
  onToggle
}) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="no-print"
      style={{
        position:       'fixed',
        bottom:         '24px',
        right:          '24px',
        zIndex:         999999,
        background:     'linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98))',
        border:         '1.5px solid var(--gold-glow,#f3c64c)',
        borderRadius:   '30px',
        padding:        '8px 18px',
        display:        'flex',
        alignItems:     'center',
        gap:            '12px',
        boxShadow:      '0 8px 32px rgba(0,0,0,0.75),0 0 16px rgba(243,198,76,0.35)',
        backdropFilter: 'blur(16px)',
        color:          '#fff',
        fontSize:       '0.82rem',
        fontWeight:     600,
        animation:      'pulse 3s infinite ease-in-out',
        userSelect:     'none'
      }}
    >
      {/* Status dot + label */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{
          display:'inline-block', width:'8px', height:'8px',
          borderRadius:'50%', backgroundColor:'#34d399', boxShadow:'0 0 8px #34d399'
        }} />
        <Edit3 size={15} color="var(--gold-glow,#f3c64c)" />
        <span>{label}: <strong style={{ color:'#34d399' }}>ALWAYS ON</strong></span>
      </div>

      {/* Shortcut hints */}
      <span style={{
        color:'var(--text-muted,#94a3b8)', fontSize:'0.75rem',
        borderLeft:'1px solid rgba(255,255,255,0.15)', paddingLeft:'10px'
      }}>
        Click any cell to type •{' '}
        <kbd style={{ background:'rgba(255,255,255,0.12)', padding:'1px 5px', borderRadius:'3px' }}>Enter</kbd> save •{' '}
        <kbd style={{ background:'rgba(255,255,255,0.12)', padding:'1px 5px', borderRadius:'3px' }}>Esc</kbd> cancel •{' '}
        <kbd style={{ background:'rgba(255,255,255,0.12)', padding:'1px 5px', borderRadius:'3px' }}>Tab</kbd> next cell
      </span>

      {/* Reset button */}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          style={{
            background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)',
            color:'#fca5a5', borderRadius:'20px', padding:'3px 10px',
            fontSize:'0.72rem', cursor:'pointer', fontWeight:600,
            display:'inline-flex', alignItems:'center', gap:'4px'
          }}
          title="Reset all inline edits to defaults"
        >
          <RotateCcw size={11} /> Reset
        </button>
      )}

      {/* Dismiss (just hides the banner — editing stays on) */}
      <button
        type="button"
        onClick={() => setVisible(false)}
        style={{
          background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)',
          color:'#94a3b8', borderRadius:'50%', width:'22px', height:'22px',
          fontSize:'0.75rem', cursor:'pointer', display:'flex',
          alignItems:'center', justifyContent:'center', flexShrink:0
        }}
        title="Hide this banner (editing stays on)"
      >
        ×
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SheetsEditableCell — self-contained click-to-input grid cell (unchanged)
   This component manages its own editing state with a real <input> /
   <select> overlay. editEngine.js deliberately skips .sheets-editable-cell.
   ───────────────────────────────────────────────────────────────────────── */
export function SheetsEditableCell({
  value       = '',
  onSave,
  type        = 'text',
  options     = [],
  min, max, step = 1,
  tag         = 'td',
  className   = '',
  style       = {},
  cellStyle   = {},
  inputStyle  = {},
  align       = 'left',
  prefix      = '',
  suffix      = '',
  placeholder = '—',
  disabled    = false,
  formatDisplay,
  storageKey  = '',
  field       = '',
  rowId       = '',
  tooltip     = 'Click to edit'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [curVal,    setCurVal]    = useState(value != null ? value : '');
  const [justSaved, setJustSaved] = useState(false);
  const origRef  = useRef(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurVal(value != null ? value : '');
    origRef.current = value;
  }, [value]);

  const startEdit = () => { if (!disabled) setIsEditing(true); };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (typeof inputRef.current.select === 'function') inputRef.current.select();
    }
  }, [isEditing]);

  const commit = () => {
    if (!isEditing) return;
    setIsEditing(false);
    let final = curVal;
    if (type === 'number' || type === 'currency') {
      const p = parseFloat(String(curVal).replace(/[^0-9.-]+/g, ''));
      final = isNaN(p) ? 0 : p;
      if (min !== undefined && final < min) final = min;
      if (max !== undefined && final > max) final = max;
    } else if (typeof curVal === 'string') {
      final = curVal.trim();
    }
    if (String(final) !== String(origRef.current)) {
      if (onSave) onSave(final, origRef.current, field);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1400);
      if (storageKey) {
        try {
          const s = JSON.parse(localStorage.getItem(storageKey) || '{}');
          s[rowId && field ? `${rowId}:${field}` : field || 'val'] = final;
          localStorage.setItem(storageKey, JSON.stringify(s));
        } catch (_) {}
      }
      window.dispatchEvent(new CustomEvent('hsi:text-edited', {
        detail: { field, rowId, newValue: final, oldValue: origRef.current }
      }));
    }
  };

  const cancel = () => {
    setCurVal(origRef.current != null ? origRef.current : '');
    setIsEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); commit(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    else if (e.key === 'Tab')   { commit(); }
  };

  const display = () => {
    if (formatDisplay) return formatDisplay(curVal);
    if (type === 'currency') {
      return `${prefix || '₹'}${(Number(curVal)||0).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2})}${suffix}`;
    }
    if (type === 'select') {
      const m = options.find(o => (typeof o === 'object' ? o.value === curVal : o === curVal));
      if (m?.badgeStyle) return (
        <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:'4px', fontSize:'0.72rem', fontWeight:700, ...m.badgeStyle }}>
          {m.label || m.value}
        </span>
      );
      return `${prefix}${m && typeof m === 'object' ? m.label : curVal || placeholder}${suffix}`;
    }
    if (type === 'number') {
      const n = Number(curVal);
      return isNaN(n) ? placeholder : `${prefix}${n.toLocaleString('en-IN')}${suffix}`;
    }
    return `${prefix}${curVal !== '' && curVal != null ? curVal : placeholder}${suffix}`;
  };

  const Tag = tag;
  return (
    <Tag
      className={`sheets-editable-cell ${isEditing ? 'sheets-cell-editing' : ''} ${justSaved ? 'hsi-save-success-flash' : ''} ${className}`}
      onClick={!isEditing ? startEdit : undefined}
      title={disabled ? undefined : tooltip}
      data-field={field}
      data-row-key={rowId}
      style={{
        position:'relative', textAlign:align, verticalAlign:'middle',
        cursor: disabled ? 'default' : 'pointer',
        userSelect: isEditing ? 'auto' : 'none',
        ...cellStyle, ...style
      }}
    >
      {isEditing ? (
        <div style={{ position:'relative', width:'100%', display:'flex', alignItems:'center' }}>
          {type === 'select' ? (
            <select
              ref={inputRef}
              value={curVal}
              onChange={e => setCurVal(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKey}
              className="sheets-cell-select"
              style={{
                width:'100%', background:'#090e17', border:'1.5px solid #38bdf8',
                borderRadius:'4px', color:'#fff', padding:'2px 6px',
                fontSize:'0.8rem', fontWeight:600, outline:'none',
                boxShadow:'0 0 8px rgba(56,189,248,0.5)', ...inputStyle
              }}
            >
              {options.map((o,i) => {
                const v = typeof o === 'object' ? o.value : o;
                const l = typeof o === 'object' ? o.label  : o;
                return <option key={i} value={v}>{l}</option>;
              })}
            </select>
          ) : (
            <input
              ref={inputRef}
              type={type === 'currency' ? 'number' : type}
              value={curVal}
              onChange={e => setCurVal(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKey}
              step={step} min={min} max={max}
              className="sheets-cell-input"
              style={{
                width:'100%', background:'#090e17', border:'1.5px solid #38bdf8',
                borderRadius:'3px', color:'#fff', padding:'2px 6px',
                fontSize:'0.82rem', fontWeight:700, textAlign:align, outline:'none',
                boxShadow:'0 0 8px rgba(56,189,248,0.6)',
                fontFamily: type === 'currency' || type === 'number' ? 'SF Mono,monospace' : 'inherit',
                ...inputStyle
              }}
            />
          )}
          <div className="sheets-cell-handle" />
        </div>
      ) : (
        <div style={{
          display:'flex', alignItems:'center',
          justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
          gap:'6px', width:'100%'
        }}>
          <span style={{
            fontFamily: type === 'currency' || type === 'number' ? 'SF Mono,monospace' : 'inherit',
            fontWeight: type === 'currency' || type === 'number' ? 700 : 'inherit'
          }}>
            {display()}
          </span>
          {!disabled && (
            <span className="sheets-cell-pencil" style={{ fontSize:'0.65rem', color:'#38bdf8', pointerEvents:'none' }}>
              ✏️
            </span>
          )}
        </div>
      )}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SheetsColumnHeader — th with EDIT / FX / LOCK badge (unchanged)
   ───────────────────────────────────────────────────────────────────────── */
export function SheetsColumnHeader({
  title,
  badge      = 'editable',   // default always editable now
  badgeLabel = null,
  align      = 'left',
  width,
  style      = {},
  className  = '',
  children
}) {
  const getBadge = () => {
    if (badge === 'editable') return { text: badgeLabel || 'EDIT ✏️', cls: 'sheets-hdr-badge sheets-hdr-editable', tip: 'Click any cell in this column to edit directly' };
    if (badge === 'formula')  return { text: badgeLabel || 'FX ⚡',   cls: 'sheets-hdr-badge sheets-hdr-formula',  tip: 'Auto-calculated — updates when input cells change' };
    if (badge === 'locked')   return { text: badgeLabel || 'LOCK 🔒', cls: 'sheets-hdr-badge sheets-hdr-locked',   tip: 'System record — read only' };
    return null;
  };
  const b = getBadge();

  return (
    <th
      className={`sheets-grid-th ${className}`}
      style={{ width, textAlign: align, padding:'0.65rem 0.75rem', verticalAlign:'middle', ...style }}
    >
      <div style={{
        display:'inline-flex', alignItems:'center',
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        gap:'6px', width:'100%', whiteSpace:'nowrap'
      }}>
        <span>{title || children}</span>
        {b && <span className={b.cls} title={b.tip}>{b.text}</span>}
      </div>
    </th>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SheetsToolbarLegend — compact status banner above grid tables (unchanged)
   ───────────────────────────────────────────────────────────────────────── */
export function SheetsToolbarLegend({
  tableName = 'Live Spreadsheet Matrix',
  subtitle  = 'Interactive Google Sheets Mode',
  style     = {},
  children
}) {
  return (
    <div
      className="sheets-toolbar-legend no-print"
      style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:'0.5rem', padding:'0.45rem 0.85rem',
        background:'linear-gradient(90deg,rgba(15,23,42,0.95),rgba(30,41,59,0.85))',
        border:'1px solid rgba(56,189,248,0.25)', borderRadius:'8px 8px 0 0',
        fontSize:'0.74rem', color:'#e2e8f0', ...style
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
        <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#10b981', boxShadow:'0 0 6px #10b981' }} />
        <strong style={{ color:'#fff', fontSize:'0.78rem' }}>{tableName}</strong>
        <span style={{ color:'var(--text-muted,#94a3b8)', borderLeft:'1px solid rgba(255,255,255,0.15)', paddingLeft:'8px' }}>
          {subtitle}
        </span>
        {children && <div style={{ marginLeft:'6px', display:'inline-flex', alignItems:'center' }}>{children}</div>}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.68rem' }}>
          <span className="sheets-hdr-badge sheets-hdr-editable">EDIT ✏️ Direct Edit</span>
          <span className="sheets-hdr-badge sheets-hdr-formula">FX ⚡ Auto Formula</span>
          <span className="sheets-hdr-badge sheets-hdr-locked">LOCK 🔒 System Protected</span>
        </div>
        <span style={{ color:'#64748b', fontSize:'0.7rem' }}>
          <kbd style={{ background:'rgba(255,255,255,0.08)', padding:'1px 4px', borderRadius:'3px', color:'#cbd5e1' }}>Enter</kbd> Save •{' '}
          <kbd style={{ background:'rgba(255,255,255,0.08)', padding:'1px 4px', borderRadius:'3px', color:'#cbd5e1', marginLeft:'3px' }}>Esc</kbd> Cancel •{' '}
          <kbd style={{ background:'rgba(255,255,255,0.08)', padding:'1px 4px', borderRadius:'3px', color:'#cbd5e1', marginLeft:'3px' }}>Tab</kbd> Next
        </span>
      </div>
    </div>
  );
}

export default InlineText;
