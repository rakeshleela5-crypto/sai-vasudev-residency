import React, { useState } from 'react';
import { 
  FileText, Download, Building2, TrendingUp, ShieldCheck, 
  Printer, CheckCircle2, DollarSign, Calendar, RefreshCw,
  Scale, Layers, CreditCard, Table, UtensilsCrossed, BarChart2,
  PieChart, Maximize2, CheckCheck, FileSpreadsheet
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { 
  PAYMENT_METHOD_REVENUE_SEP2026,
  TOTAL_GROSS_REVENUE_SEP2026,
  DAILY_EXPENDITURES_SEP2026,
  TOTAL_MONTHLY_EXPENDITURES_SEP2026,
  GST_COMPLIANCE_LEDGER_SEP2026,
  BOOKINGS_PER_CATEGORY_SEP2026,
  TOTAL_ROOM_NIGHTS_AVAILABLE,
  TOTAL_ROOM_NIGHTS_SOLD,
  TOTAL_ROOM_STAY_REVENUE,
  DINING_KITCHEN_REVENUE_SEP2026,
  TOTAL_DINING_REVENUE_SEP2026,
  ROOM_TYPE_REVENUE_MATRIX_SEP2026,
  ALL_18_ROOMS_REVENUE_SEP2026,
  DAILY_EXPENSE_CATEGORIES_SUMMARY,
  TRI_PERIOD_FINANCIAL_DASHBOARD,
  CA_FILING_STATION_METADATA
} from '../data/caFilingData';
import CaFilingStationModal from './CaFilingStationModal';
import { SheetsEditableCell, SheetsColumnHeader, SheetsToolbarLegend } from './UniversalInlineEditor';
import GstFilingHeaderToolbar from './GstFilingHeaderToolbar';

export default function FinancialAnalytics({ bookings = [] }) {
  const [activeTab, setActiveTab] = useState('tri-period');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [expensesPreview, setExpensesPreview] = useState(DAILY_EXPENDITURES_SEP2026.slice(-8));

  const triggerNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const copyTableToSheets = (headers, dataRows, title = 'Data') => {
    try {
      const tsv = [
        headers.join('\t'),
        ...dataRows.map(r => r.map(c => String(c ?? '').replace(/\t/g, ' ')).join('\t'))
      ].join('\n');
      navigator.clipboard.writeText(tsv);
      triggerNotice(`📋 Copied "${title}" to clipboard! Paste directly into Google Sheets or Excel (Ctrl+V)`);
    } catch (_) {
      triggerNotice('❌ Clipboard access restricted.');
    }
  };

  const handleExportGstr1Json = () => {
    const gstr1Payload = {
      gstin: HOTEL_CONFIG.gstin,
      fp: '092026',
      legal_name: CA_FILING_STATION_METADATA.proprietorship.legalName,
      trade_name: HOTEL_CONFIG.tradeName,
      b2b: [
        {
          ctin: '21AAACJ1288P1ZZ',
          cname: 'JK Paper Mills Ltd.',
          inv: [{ inum: 'SSVR-B2B-2026-0901', idt: '24-09-2026', val: 89600.00, pos: '21', rchrg: 'N', inv_typ: 'R', itms: [{ num: 1, itm_det: { rt: 5.0, txval: 85333.33, camt: 2133.33, samt: 2133.33, csamt: 0.0 } }] }]
        }
      ],
      b2cs: [{ sply_ty: 'INTRA', pos: '21', rt: 5.0, txval: 1137847.62, camt: 28446.19, samt: 28446.19, csamt: 0.0 }],
      hsn: {
        data: [
          { num: 1, hsn_sc: '996311', desc: 'Room Accommodation Services', uqc: 'NA', qty: 432, txval: 938057.14, rt: 5.0, camt: 23451.43, samt: 23451.43, csamt: 0.0 },
          { num: 2, hsn_sc: '996331', desc: 'Restaurant & In-Room Dining', uqc: 'NA', qty: 1150, txval: 309047.62, rt: 5.0, camt: 7726.19, samt: 7726.19, csamt: 0.0 },
          { num: 3, hsn_sc: '996337', desc: 'Auxiliary Hospitality Services', uqc: 'NA', qty: 140, txval: 45904.76, rt: 5.0, camt: 1147.62, samt: 1147.62, csamt: 0.0 }
        ]
      }
    };
    const blob = new Blob([JSON.stringify(gstr1Payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${HOTEL_CONFIG.gstin}_092026_CA_FINAL.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerNotice('✓ Downloaded Official GSTR-1 JSON for CA Filing Portal!');
  };

  const handleExportCsv = () => {
    const rows = [
      ['SRI SAI VASUDEV RESIDENCY - SEPTEMBER 2026 PROFIT & LOSS AUDIT LEDGER'],
      ['Proprietor', CA_FILING_STATION_METADATA.proprietorship.legalName],
      ['GSTIN', HOTEL_CONFIG.gstin, 'PAN', HOTEL_CONFIG.pan],
      ['Address', HOTEL_CONFIG.address],
      ['Inventory', '18 Rooms (Ground Floor: 101-107, 1st Floor: 201-211)'],
      [''],
      ['HEAD', 'GROSS TURNOVER', 'NET TAXABLE', 'CGST 2.5%', 'SGST 2.5%'],
      ['Room Accommodation (SAC 996311)', '984960.00', '938057.14', '23451.43', '23451.43'],
      ['Dining & Kitchen KOT (SAC 996331)', '324500.00', '309047.62', '7726.19', '7726.19'],
      ['Auxiliary Services (SAC 996337)', '48200.00', '45904.76', '1147.62', '1147.62'],
      ['TOTAL TURNOVER', '1357660.00', '1293009.52', '32325.24', '32325.24'],
      [''],
      ['TOTAL EXPENDITURES (30 DAYS)', '401300.00'],
      ['NET OPERATING PROFIT (EBITDA)', '891709.52'],
      ['NET MARGIN %', '65.7%']
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PL_Audit_SriSaiVasudevResidency_Sep2026.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerNotice('✓ Downloaded P&L Audit CSV!');
  };

  return (
    <div id="ca-filing-station" className="glass-panel" style={{ padding: '2rem', maxWidth: 1400, margin: '2.5rem auto' }}>
      {/* Official CA & GST Filing Station Header Toolbar */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)',
              color: 'var(--gold-glow)',
              border: '1px solid var(--gold-primary)',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.2)'
            }}
          >
            <Maximize2 size={14} /> Launch Full-Screen Station &amp; All 10 Modules
          </button>
        </div>

        <GstFilingHeaderToolbar
          onNotice={triggerNotice}
        />
      </div>

      {notification && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCheck size={16} /> {notification}
        </div>
      )}

      {/* 10 Navigation Modules Bar */}
      <div style={{
        display: 'flex',
        gap: '0.35rem',
        padding: '0.5rem 0',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {[
          { id: 'tri-period', num: '9', name: 'Tri-Period P&L', icon: TrendingUp },
          { id: 'payment-method', num: '1', name: 'Revenue by Payment', icon: CreditCard },
          { id: 'expenditures', num: '2', name: 'Daily Expenditures', icon: DollarSign },
          { id: 'gst-compliance', num: '3', name: '5% GST Ledger', icon: Scale },
          { id: 'bookings-category', num: '4', name: 'Bookings by Category', icon: Table },
          { id: 'fnb-dining', num: '5', name: 'Dining Revenue', icon: UtensilsCrossed },
          { id: 'room-matrix', num: '6', name: 'Yield Matrix', icon: BarChart2 },
          { id: 'all-18-rooms', num: '7', name: 'All 18 Rooms', icon: Layers },
          { id: 'expense-heads', num: '8', name: 'Expense Heads', icon: PieChart },
          { id: 'ca-station', num: '10', name: 'CA Filing Engine', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: isActive ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? 'var(--gold-glow)' : '#94a3b8',
                fontSize: '0.76rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{
                fontSize: '0.65rem',
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: isActive ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.1)',
                color: isActive ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800
              }}>
                {tab.num}
              </span>
              <Icon size={13} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* MODULE 9: TRI-PERIOD PREVIEW */}
      {activeTab === 'tri-period' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {TRI_PERIOD_FINANCIAL_DASHBOARD.periods.map(period => (
              <div key={period.id} style={{
                background: period.id === 'full-month' 
                  ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)' 
                  : 'rgba(15, 23, 42, 0.7)',
                border: period.id === 'full-month' ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '1.25rem'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--gold-glow)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {period.status}
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.2rem 0 0.5rem', color: '#fff' }}>
                  {period.name}
                </h4>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--gold-glow)' }}>
                  ₹{period.grossTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.35rem 0' }}>
                  Room: ₹{period.roomRevenue.toLocaleString('en-IN')} | Dining: ₹{period.diningRevenue.toLocaleString('en-IN')}
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem 0.75rem', borderRadius: '6px', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Net Operating Profit:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                    ₹{period.netOperatingProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary-gold"
              style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Maximize2 size={16} /> Open Full 10-Module CA Filing Station
            </button>
          </div>
        </div>
      )}

      {/* MODULE 1: REVENUE BY PAYMENT METHOD PREVIEW */}
      {activeTab === 'payment-method' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {PAYMENT_METHOD_REVENUE_SEP2026.map(item => (
              <div key={item.method} style={{ background: 'rgba(15, 23, 42, 0.7)', border: `1px solid ${item.color}40`, padding: '1rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.method}</span>
                  <span style={{ fontWeight: 800 }}>{item.percentage}%</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0.35rem 0' }}>
                  ₹{item.grossAmount.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.txnCount} Collections Settled</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 2: DAILY EXPENDITURES PREVIEW (Google Sheets Grid) */}
      {activeTab === 'expenditures' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.25)', overflow: 'hidden' }}>
            <SheetsToolbarLegend
              tableName="Recent Daily Vouchers (Full Month Total: ₹4,01,300)"
              subtitle="Direct Keyboard Editable Snapshot"
            >
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  onClick={() => copyTableToSheets(
                    ['#', 'Date', 'Voucher', 'Head of Expenditure', 'Amount (INR)', 'Mode'],
                    expensesPreview.map((e, idx) => [idx + 1, e.date, e.voucher, e.head, e.amount, e.mode]),
                    'Recent Vouchers'
                  )}
                  className="sheets-copy-btn"
                >
                  📋 Copy for Google Sheets
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  style={{ color: 'var(--gold-glow)', fontSize: '0.72rem', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                >
                  All 30 Days in Station →
                </button>
              </div>
            </SheetsToolbarLegend>
            <div style={{ overflowX: 'auto' }}>
              <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#0e1726', color: '#fbbf24', borderBottom: '2px solid rgba(212, 175, 55, 0.6)' }}>
                    <SheetsColumnHeader title="#" badge="locked" style={{ width: '38px', textAlign: 'center' }} />
                    <SheetsColumnHeader title="Date" badge="locked" />
                    <SheetsColumnHeader title="Voucher" badge="locked" />
                    <SheetsColumnHeader title="Head of Expenditure" badge="editable" />
                    <SheetsColumnHeader title="Amount (INR)" badge="editable" align="right" />
                    <SheetsColumnHeader title="Mode" badge="editable" align="center" />
                  </tr>
                </thead>
                <tbody>
                  {expensesPreview.map((e, idx) => (
                    <tr key={e.voucher} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                      <td className="sheets-row-num">{idx + 1}</td>
                      <td style={{ padding: '0.5rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>{e.date}</td>
                      <td style={{ padding: '0.5rem', color: '#38bdf8', fontFamily: 'monospace' }}>{e.voucher}</td>
                      <SheetsEditableCell
                        value={e.head}
                        type="text"
                        cellStyle={{ padding: '0.5rem', color: '#fff', fontWeight: 600 }}
                        onSave={(newVal) => setExpensesPreview(prev => prev.map(x => x.voucher === e.voucher ? { ...x, head: newVal } : x))}
                      />
                      <SheetsEditableCell
                        value={e.amount}
                        type="currency"
                        align="right"
                        min={0}
                        cellStyle={{ padding: '0.5rem', fontWeight: 700, color: '#f87171' }}
                        onSave={(newVal) => setExpensesPreview(prev => prev.map(x => x.voucher === e.voucher ? { ...x, amount: Number(newVal) } : x))}
                      />
                      <SheetsEditableCell
                        value={e.mode}
                        type="select"
                        options={['UPI', 'Cash', 'Bank Transfer', 'NEFT', 'Card']}
                        align="center"
                        cellStyle={{ padding: '0.5rem' }}
                        onSave={(newVal) => setExpensesPreview(prev => prev.map(x => x.voucher === e.voucher ? { ...x, mode: newVal } : x))}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: 5% GST COMPLIANCE PREVIEW */}
      {activeTab === 'gst-compliance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Gross Taxable Turnover</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalTaxableBase.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#fca5a5' }}>5% Output GST (2.5% + 2.5%)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalOutputGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>Eligible ITC Claims</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.eligibleInputTaxCreditITC.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--gold-primary)', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-glow)' }}>Net GST Payable (PMT-06)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold-glow)' }}>₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.netCashGstPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 7: ALL 18 ROOMS PREVIEW */}
      {activeTab === 'all-18-rooms' && (
        <div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--gold-glow)' }}>
              18 Physical Keys Performance (7 Ground Floor: 101–107, 11 First Floor: 201–211)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.65rem' }}>
              {ALL_18_ROOMS_REVENUE_SEP2026.map(r => (
                <div key={r.room} style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                    <strong style={{ color: '#fff' }}>Room {r.room}</strong>
                    <span style={{ color: '#38bdf8' }}>{r.floor}</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gold-glow)', margin: '0.2rem 0' }}>
                    ₹{r.total.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                    {r.nightsSold} nights • {r.occupancyPct}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS FALLBACK TO MODAL LAUNCH */}
      {['bookings-category', 'fnb-dining', 'room-matrix', 'expense-heads', 'ca-station'].includes(activeTab) && (
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Detailed {activeTab.replace('-', ' ').toUpperCase()} Module
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '600px', margin: '0 auto 1.25rem' }}>
            Launch the full-screen CA Filing Station to view complete tabular data, interactive filters, and one-click statutory export tools for this module.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary-gold"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Maximize2 size={16} /> Open Module in CA Filing Station
          </button>
        </div>
      )}

      {/* Full-Screen Station Modal */}
      <CaFilingStationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialModule={activeTab}
      />
    </div>
  );
}
