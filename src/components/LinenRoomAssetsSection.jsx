import React, { useState } from 'react';
import { 
  Layers, Package, ShieldCheck, RefreshCw, AlertTriangle, 
  CheckCircle2, Plus, ArrowUpRight, ArrowDownLeft, Trash2, Printer, X
} from 'lucide-react';
import { SheetsEditableCell, SheetsColumnHeader, SheetsToolbarLegend } from './UniversalInlineEditor';

const INITIAL_LINEN = [
  { id: 'L-01', item: 'King Bed Sheets (300 TC)', parStock: 160, inRooms: 78, inStore: 45, atDhobi: 32, damaged: 5 },
  { id: 'L-02', item: 'Single Bed Sheets', parStock: 80, inRooms: 20, inStore: 35, atDhobi: 22, damaged: 3 },
  { id: 'L-03', item: 'Pillow Covers (Cotton)', parStock: 240, inRooms: 120, inStore: 65, atDhobi: 50, damaged: 5 },
  { id: 'L-04', item: 'Bath Towels (Heavy Terry)', parStock: 160, inRooms: 76, inStore: 40, atDhobi: 40, damaged: 4 },
  { id: 'L-05', item: 'Hand Towels', parStock: 120, inRooms: 50, inStore: 42, atDhobi: 25, damaged: 3 },
  { id: 'L-06', item: 'Floor Bath Mats', parStock: 80, inRooms: 39, inStore: 25, atDhobi: 14, damaged: 2 },
  { id: 'L-07', item: 'Duvet Covers (White)', parStock: 90, inRooms: 40, inStore: 30, atDhobi: 18, damaged: 2 }
];

const ROOM_ASSET_CHECKLIST = [
  { id: 'A-01', name: 'Smart LED TV Remote', defaultQty: 1, replacementCost: 450 },
  { id: 'A-02', name: 'Split AC Remote Control', defaultQty: 1, replacementCost: 650 },
  { id: 'A-03', name: 'Electric Kettle & Cord', defaultQty: 1, replacementCost: 1200 },
  { id: 'A-04', name: 'Wooden Coat Hangers', defaultQty: 6, replacementCost: 300 },
  { id: 'A-05', name: 'Glass Tumblers (Set of 2)', defaultQty: 2, replacementCost: 150 },
  { id: 'A-06', name: 'Geyser & Electrical Fittings', defaultQty: 1, replacementCost: 2500 }
];

export default function LinenRoomAssetsSection({
  rooms = [],
  onSaveLinenUpdate
}) {
  const [linenData, setLinenData] = useState(INITIAL_LINEN);
  const [selectedRoom, setSelectedRoom] = useState('101');
  const [checklistState, setChecklistState] = useState({
    'A-01': true,
    'A-02': true,
    'A-03': true,
    'A-04': true,
    'A-05': true,
    'A-06': true
  });
  const [inspectionResult, setInspectionResult] = useState(null);
  const [dhobiModalOpen, setDhobiModalOpen] = useState(false);
  const [dhobiAction, setDhobiAction] = useState('dispatch'); // 'dispatch' | 'receive'
  const [selectedLinenId, setSelectedLinenId] = useState('L-01');
  const [dhobiQty, setDhobiQty] = useState(10);
  const [dhobiVendor, setDhobiVendor] = useState('Rayagada Express Laundry & Dry Cleaners');

  // Handle Dhobi Laundry Dispatch & Return
  const handleDhobiSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(dhobiQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    setLinenData(prev => prev.map(item => {
      if (item.id === selectedLinenId) {
        if (dhobiAction === 'dispatch') {
          // Sent from inStore to atDhobi
          const safeQty = Math.min(qty, item.inStore);
          return {
            ...item,
            inStore: item.inStore - safeQty,
            atDhobi: item.atDhobi + safeQty
          };
        } else {
          // Received from atDhobi back to inStore
          const safeQty = Math.min(qty, item.atDhobi);
          return {
            ...item,
            atDhobi: item.atDhobi - safeQty,
            inStore: item.inStore + safeQty
          };
        }
      }
      return item;
    }));

    if (onSaveLinenUpdate) {
      onSaveLinenUpdate({
        action: dhobiAction,
        itemId: selectedLinenId,
        quantity: qty,
        vendor: dhobiVendor,
        timestamp: new Date().toISOString()
      });
    }

    // Direct D1 Sync for Linen & Dhobi movements
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'update_linen_inventory',
        payload: {
          itemId: selectedLinenId,
          actionType: dhobiAction === 'dispatch' ? 'send_dhobi' : 'receive_dhobi',
          quantity: qty,
          vendor: dhobiVendor
        }
      })
    }).catch(err => console.warn('Linen inventory sync fallback:', err));

    setDhobiModalOpen(false);
  };

  // Handle Room Asset Inspection Verification
  const handleVerifyRoomAssets = () => {
    const missing = ROOM_ASSET_CHECKLIST.filter(item => !checklistState[item.id]);
    const penaltyTotal = missing.reduce((acc, curr) => acc + curr.replacementCost, 0);

    setInspectionResult({
      roomNumber: selectedRoom,
      allIntact: missing.length === 0,
      missingItems: missing,
      penaltyTotal,
      inspectedAt: new Date().toLocaleTimeString()
    });
  };

  return (
    <div style={{
      background: 'rgba(12, 24, 43, 0.9)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '14px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      {/* Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'rgba(167, 139, 250, 0.15)',
            border: '1px solid #a78bfa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a78bfa'
          }}>
            <Layers size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
              Part 3: Linen Par Stock &amp; Room Asset Custody
            </h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Laundry Vendor Dispatches, Par Level Control &amp; Room Checkout Defect Inspection
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setDhobiAction('dispatch');
              setDhobiModalOpen(true);
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ArrowUpRight size={14} /> Send to Dhobi
          </button>
          <button
            onClick={() => {
              setDhobiAction('receive');
              setDhobiModalOpen(true);
            }}
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid #10b981',
              color: '#6ee7b7',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ArrowDownLeft size={14} /> Receive from Dhobi
          </button>
        </div>
      </div>

      {/* Grid: Left = Linen Par Matrix, Right = Room Asset Checkout Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left: Linen Par Stock Matrix */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-glow)', marginBottom: '0.65rem' }}>
            🧺 Linen Par Stock &amp; Circulation Matrix (18 Rooms)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <SheetsToolbarLegend tableName="Linen Par Stock & Circulation Matrix" subtitle="Housekeeping 18-Room Stock Control" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <SheetsColumnHeader title="Linen Item" badge="locked" style={{ padding: '8px 10px' }} />
                  <SheetsColumnHeader title="Par Stock" badge="editable" align="center" style={{ padding: '8px' }} />
                  <SheetsColumnHeader title="In Rooms" badge="editable" align="center" style={{ padding: '8px' }} />
                  <SheetsColumnHeader title="Fresh Store" badge="editable" align="center" style={{ padding: '8px' }} />
                  <SheetsColumnHeader title="At Dhobi" badge="editable" align="center" style={{ padding: '8px' }} />
                  <SheetsColumnHeader title="Damaged" badge="editable" align="center" style={{ padding: '8px' }} />
                </tr>
              </thead>
              <tbody>
                {linenData.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{l.item}</td>
                    <SheetsEditableCell
                      value={l.parStock}
                      type="number"
                      align="center"
                      min={0}
                      cellStyle={{ padding: '8px', color: 'var(--gold-glow)', fontWeight: 700 }}
                      onSave={(newVal) => setLinenData(prev => prev.map(item => item.id === l.id ? { ...item, parStock: Number(newVal) } : item))}
                    />
                    <SheetsEditableCell
                      value={l.inRooms}
                      type="number"
                      align="center"
                      min={0}
                      cellStyle={{ padding: '8px', color: '#e2e8f0' }}
                      onSave={(newVal) => setLinenData(prev => prev.map(item => item.id === l.id ? { ...item, inRooms: Number(newVal) } : item))}
                    />
                    <SheetsEditableCell
                      value={l.inStore}
                      type="number"
                      align="center"
                      min={0}
                      cellStyle={{ padding: '8px', color: '#34d399', fontWeight: 700 }}
                      onSave={(newVal) => setLinenData(prev => prev.map(item => item.id === l.id ? { ...item, inStore: Number(newVal) } : item))}
                    />
                    <SheetsEditableCell
                      value={l.atDhobi}
                      type="number"
                      align="center"
                      min={0}
                      cellStyle={{ padding: '8px', color: '#f59e0b', fontWeight: 700 }}
                      onSave={(newVal) => setLinenData(prev => prev.map(item => item.id === l.id ? { ...item, atDhobi: Number(newVal) } : item))}
                    />
                    <SheetsEditableCell
                      value={l.damaged}
                      type="number"
                      align="center"
                      min={0}
                      cellStyle={{ padding: '8px', color: '#ef4444', fontWeight: 600 }}
                      onSave={(newVal) => setLinenData(prev => prev.map(item => item.id === l.id ? { ...item, damaged: Number(newVal) } : item))}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Room Checkout Asset Checklist */}
        <div style={{
          background: 'rgba(6, 14, 26, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
              🔍 Room Checkout Asset Custody Inspector
            </div>
            <select
              value={selectedRoom}
              onChange={(e) => {
                setSelectedRoom(e.target.value);
                setInspectionResult(null);
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                padding: '3px 8px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              {rooms.map(r => (
                <option key={r.roomNumber} value={r.roomNumber}>
                  Room {r.roomNumber} ({r.tier})
                </option>
              ))}
            </select>
          </div>

          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.72rem', color: '#94a3b8' }}>
            Front desk checks these fixtures prior to guest deposit refund:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
            {ROOM_ASSET_CHECKLIST.map(item => (
              <label 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  color: checklistState[item.id] ? '#e2e8f0' : '#f87171'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={checklistState[item.id] || false}
                    onChange={(e) => setChecklistState(prev => ({
                      ...prev,
                      [item.id]: e.target.checked
                    }))}
                  />
                  <span>{item.name} (Qty: {item.defaultQty})</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Penalty: ₹{item.replacementCost}
                </span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleVerifyRoomAssets}
              style={{
                background: '#38bdf8',
                color: '#060e1a',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Verify Room {selectedRoom} Checklist
            </button>

            {inspectionResult && (
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: inspectionResult.allIntact ? '#34d399' : '#f87171'
              }}>
                {inspectionResult.allIntact ? '✓ All Assets Intact' : `⚠️ ₹${inspectionResult.penaltyTotal} Surcharge Due`}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Dhobi Modal */}
      {dhobiModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <form
            onSubmit={handleDhobiSubmit}
            style={{
              background: '#0a192f',
              border: '1px solid var(--gold-glow)',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '420px',
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--gold-glow)', fontWeight: 800 }}>
                {dhobiAction === 'dispatch' ? '🚚 Dispatch Dirty Linen to Laundry' : '📥 Receive Clean Linen from Laundry'}
              </h4>
              <button
                type="button"
                onClick={() => setDhobiModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: 3 }}>
                  Select Linen Item:
                </label>
                <select
                  value={selectedLinenId}
                  onChange={(e) => setSelectedLinenId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '0.45rem',
                    fontSize: '0.85rem'
                  }}
                >
                  {linenData.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.item} (Store: {l.inStore}, At Dhobi: {l.atDhobi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: 3 }}>
                  Quantity of Pieces:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={dhobiQty}
                  onChange={(e) => setDhobiQty(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: 'var(--gold-glow)',
                    fontWeight: 800,
                    padding: '0.45rem',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: 3 }}>
                  Laundry Vendor:
                </label>
                <input
                  type="text"
                  value={dhobiVendor}
                  onChange={(e) => setDhobiVendor(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '0.45rem',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setDhobiModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#94a3b8',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'var(--gold-glow)',
                    border: 'none',
                    color: '#060e1a',
                    padding: '0.4rem 1.1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Entry
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
