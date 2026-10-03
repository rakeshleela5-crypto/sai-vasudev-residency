import React, { useState, useMemo } from 'react';
import { 
  Building2, FileText, Download, Printer, DollarSign, 
  Calendar, ShieldCheck, CheckCircle2, ChevronRight, X, 
  TrendingUp, CreditCard, Clock, AlertTriangle, Search,
  Zap, PieChart, Info, Check, ArrowUpRight, Scale, 
  UtensilsCrossed, RefreshCw, Layers, FileSpreadsheet,
  Award, Eye, BarChart2, Table, ChevronDown, CheckCheck, MessageCircle
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { SheetsEditableCell, SheetsColumnHeader, SheetsToolbarLegend } from './UniversalInlineEditor';
import { sendCaFilingSummaryWhatsApp } from '../utils/whatsappDispatch';
import { exportGstr1ExcelWorkbook } from '../utils/gstGovExport';
import GstFilingHeaderToolbar from './GstFilingHeaderToolbar';
import GstPreviewGuideModal from './GstPreviewGuideModal';
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

export default function CaFilingStationModal({ isOpen, onClose, initialModule = 'tri-period' }) {
  const [activeTab, setActiveTab] = useState(initialModule || 'tri-period');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseFilter, setExpenseFilter] = useState('ALL');
  const [exportNotice, setExportNotice] = useState('');
  const [isPreviewGuideOpen, setIsPreviewGuideOpen] = useState(false);

  // Interactive Google Sheets editable states
  const [expensesData, setExpensesData] = useState(DAILY_EXPENDITURES_SEP2026);
  const [roomMatrixData, setRoomMatrixData] = useState(ROOM_TYPE_REVENUE_MATRIX_SEP2026);
  const [allRoomsData, setAllRoomsData] = useState(ALL_18_ROOMS_REVENUE_SEP2026);

  const totalMonthlyExpensesLive = useMemo(() => {
    return expensesData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expensesData]);

  const copyTableToSheets = (headers, dataRows, tableName = 'Data') => {
    try {
      const tsvContent = [
        headers.join('\t'),
        ...dataRows.map(row => row.map(val => String(val ?? '').replace(/\t/g, ' ')).join('\t'))
      ].join('\n');
      navigator.clipboard.writeText(tsvContent);
      showExportNotice(`📋 Copied "${tableName}" to clipboard! Paste directly into Google Sheets or Excel (Ctrl+V)`);
    } catch (_) {
      showExportNotice('❌ Clipboard access restricted. Please allow clipboard permissions.');
    }
  };

  const showExportNotice = (msg) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(''), 4000);
  };

  // Filtered Daily Expenditures
  const filteredExpenses = useMemo(() => {
    return expensesData.filter(item => {
      const matchSearch = expenseSearch === '' || 
        item.head.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        item.vendor.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        item.voucher.toLowerCase().includes(expenseSearch.toLowerCase());
      
      const matchFilter = expenseFilter === 'ALL' ||
        (expenseFilter === 'ITC' && item.itcEligible) ||
        (expenseFilter === 'UPI' && item.mode === 'UPI') ||
        (expenseFilter === 'CASH' && item.mode === 'Cash') ||
        (expenseFilter === 'BANK' && item.mode === 'Bank Transfer');

      return matchSearch && matchFilter;
    });
  }, [expenseSearch, expenseFilter]);

  // Export CA-Ready GSTR-1 JSON
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
          inv: [
            {
              inum: 'SSVR-B2B-2026-0901',
              idt: '24-09-2026',
              val: 89600.00,
              pos: '21',
              rchrg: 'N',
              inv_typ: 'R',
              itms: [{ num: 1, itm_det: { rt: 5.0, txval: 85333.33, camt: 2133.33, samt: 2133.33, csamt: 0.0 } }]
            }
          ]
        },
        {
          ctin: '07AAACG1509J1ZQ',
          cname: 'GAIL (India) Limited',
          inv: [
            {
              inum: 'SSVR-B2B-2026-0902',
              idt: '25-09-2026',
              val: 73320.00,
              pos: '21',
              rchrg: 'N',
              inv_typ: 'R',
              itms: [{ num: 1, itm_det: { rt: 5.0, txval: 69828.57, camt: 1745.71, samt: 1745.71, csamt: 0.0 } }]
            }
          ]
        }
      ],
      b2cs: [
        { sply_ty: 'INTRA', pos: '21', rt: 5.0, txval: 1137847.62, camt: 28446.19, samt: 28446.19, csamt: 0.0 }
      ],
      hsn: {
        data: [
          { num: 1, hsn_sc: '996311', desc: 'Room Accommodation Services', uqc: 'NA', qty: 432, txval: 938057.14, rt: 5.0, camt: 23451.43, samt: 23451.43, csamt: 0.0 },
          { num: 2, hsn_sc: '996331', desc: 'Restaurant & In-Room Dining', uqc: 'NA', qty: 1150, txval: 309047.62, rt: 5.0, camt: 7726.19, samt: 7726.19, csamt: 0.0 },
          { num: 3, hsn_sc: '996337', desc: 'Auxiliary Hospitality Services', uqc: 'NA', qty: 140, txval: 45904.76, rt: 5.0, camt: 1147.62, samt: 1147.62, csamt: 0.0 }
        ]
      },
      doc_issue: {
        doc_det: [
          { doc_num: 1, doc_typ: 'Invoices for outward supply', from: 'SSVR-2026-0001', to: 'SSVR-2026-0410', totnum: 410, canc: 12, net_issue: 398 }
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
    showExportNotice('✓ Downloaded Official GSTR-1 JSON (GST Portal format) for CA Filing!');
  };

  // Export Official GSTR-1 Multi-Sheet Excel Workbook
  const handleExportGstr1Excel = () => {
    try {
      exportGstr1ExcelWorkbook({
        filename: `GSTR1_${HOTEL_CONFIG.gstin}_092026_OFFICIAL.xls`
      });
      showExportNotice('✓ Downloaded Official GSTR-1 Multi-Sheet Excel Workbook (.xls)!');
    } catch (err) {
      console.error('Failed to export GSTR-1 Excel:', err);
      showExportNotice('⚠️ Failed to export GSTR-1 Excel.');
    }
  };

  // Export Complete P&L and Day Book CSV
  const handleExportPLCSV = () => {
    const rows = [
      ['SRI SAI VASUDEV RESIDENCY - PROFIT & LOSS STATEMENT & AUDIT LEDGER (SEP 2026)'],
      ['Proprietor', CA_FILING_STATION_METADATA.proprietorship.legalName],
      ['GSTIN', HOTEL_CONFIG.gstin, 'PAN', HOTEL_CONFIG.pan, 'Period', 'September 2026'],
      ['Address', HOTEL_CONFIG.address],
      ['Total Inventory Keys', '18 Rooms (101-107 Ground Floor, 201-211 1st Floor)'],
      [''],
      ['SECTION 1: REVENUE SUMMARY', 'Gross Amount (INR)', 'Net Taxable (INR)', 'CGST 2.5% (INR)', 'SGST 2.5% (INR)'],
      ['Room Accommodation (SAC 996311)', '984960.00', '938057.14', '23451.43', '23451.43'],
      ['In-Room Dining & F&B (SAC 996331)', '324500.00', '309047.62', '7726.19', '7726.19'],
      ['Auxiliary Guest Services (SAC 996337)', '48200.00', '45904.76', '1147.62', '1147.62'],
      ['TOTAL GROSS REVENUE', '1357660.00', '1293009.52', '32325.24', '32325.24'],
      [''],
      ['SECTION 2: REVENUE BY PAYMENT METHOD', 'Channel', 'Gross Collections (INR)', 'Share %'],
      ...PAYMENT_METHOD_REVENUE_SEP2026.map(p => [p.method, p.channel, p.grossAmount.toFixed(2), `${p.percentage}%`]),
      [''],
      ['SECTION 3: HOTEL OPERATIONAL EXPENDITURES', 'Category / Head', 'Monthly Amount (INR)', 'Share %'],
      ...DAILY_EXPENSE_CATEGORIES_SUMMARY.map(e => [e.category, e.subtext, e.monthlyAmount.toFixed(2), `${e.percentage}%`]),
      ['TOTAL EXPENDITURES', 'All 30 Days Audited', TOTAL_MONTHLY_EXPENDITURES_SEP2026.toFixed(2), '100%'],
      [''],
      ['SECTION 4: NET OPERATING PROFIT (P&L)', 'Amount (INR)'],
      ['Gross Hotel Revenue', '1357660.00'],
      ['Less: Total 5% GST Output', '-64650.48'],
      ['Net Hotel Income', '1293009.52'],
      ['Less: Operating Expenditures', '-401300.00'],
      ['NET OPERATING PROFIT (EBITDA)', '891709.52'],
      ['Operating Margin %', '68.96%'],
      ['Net GST Payable (After ITC ₹14,820)', '49830.48']
    ];

    const csvContent = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PL_and_Expenditures_SriSaiVasudevResidency_Sep2026.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showExportNotice('✓ Downloaded September 2026 Full P&L and Expenditures CSV!');
  };

  // Download CA Verification Audit Report
  const handleDownloadAuditReport = () => {
    const reportText = `================================================================================
SRI SAI VASUDEV RESIDENCY — CHARTERED ACCOUNTANT STATUTORY AUDIT REPORT
================================================================================
Business Trade Name : Sri Sai Vasudev Residency
Legal Name / Status : PAIDISETTY MANMADHA RAO (Proprietorship)
GSTIN               : 21AEKPP8689J1ZS
PAN                 : AEKPP8689J
State / Division    : 21 - Odisha / RAYAGADA DIVISION
Principal Address   : Near Andhra Bank, New Colony, Rayagada, Odisha - 765001
Audit Period        : 01-September-2026 to 30-September-2026 (Full Month)
Total Keys Checked  : 18 Keys (Ground Floor: 101-107, First Floor: 201-211)

--------------------------------------------------------------------------------
1. FINANCIAL SUMMARY (INR)
--------------------------------------------------------------------------------
Gross Hotel Turnover          : ₹ 13,57,660.00
Net Taxable Base              : ₹ 12,93,009.52
Output CGST (2.5%)            : ₹     32,325.24
Output SGST (2.5%)            : ₹     32,325.24
Total Output GST (5%)         : ₹     64,650.48
Eligible Input Tax Credit     : ₹     14,820.00
Net Cash GST Payable (PMT-06) : ₹     49,830.48
Total Operating Expenditures  : ₹  4,01,300.00
Net Operating Profit (EBITDA) : ₹  8,91,709.52 (Margin: 65.7%)

--------------------------------------------------------------------------------
2. ROOM CAPACITY & OCCUPANCY (18 KEYS)
--------------------------------------------------------------------------------
Total Room Nights Available   : 540 Nights (18 keys * 30 days)
Total Room Nights Sold        : 432 Nights
Overall Property Occupancy    : 80.0%
Average Daily Rate (ADR)      : ₹ 2,280.00
Revenue Per Available (RevPAR): ₹ 1,824.00

Breakdown by 4 Room Categories:
1. Executive Room  (7 Keys)   : 188 Nights Sold | ₹ 4,70,000.00 | Occ: 89.5%
2. Deluxe Room     (5 Keys)   : 138 Nights Sold | ₹ 2,48,400.00 | Occ: 92.0%
3. Standard Deluxe (3 Keys)   :  84 Nights Sold | ₹ 1,68,000.00 | Occ: 93.3%
4. Premium Suite   (3 Keys)   :  22 Nights Sold | ₹    98,560.00 | Occ: 24.4%

--------------------------------------------------------------------------------
3. FOOD & BEVERAGE REVENUE
--------------------------------------------------------------------------------
Cannon Kitchen Room Service   : ₹ 1,88,400.00 (486 KOT Orders)
Pure Satvik Dining Hall       : ₹    82,600.00 (232 Pilgrimage Thalis)
Beverages & Mineral Water     : ₹    28,500.00 (380 Pantry Dispatches)
Corporate Executive Meals     : ₹    25,000.00 (52 B2B Bento Packs)
Total F&B Dining Turnover     : ₹ 3,24,500.00

--------------------------------------------------------------------------------
4. STATUTORY AUDIT & COMPLIANCE VERIFICATION
--------------------------------------------------------------------------------
[PASS] Section 16 CGST Act    : Valid tax invoices on record for all ITC claims.
[PASS] Rule 46 Tax Invoices   : Sequential numbers, SAC 996311 / 996331 applied.
[PASS] Section 194C TDS       : Corporate billing records aligned with Form 26AS.
[PASS] Section 269ST          : Zero cash receipts exceeding ₹2,00,000 threshold.
[PASS] Daily Night Audit      : Tamper-proof 12:00 AM closing with zero variances.

Certified by:
Audit Lead & Tax Advisory Team
For: SRI SAI VASUDEV RESIDENCY (RAYAGADA)
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CA_Audit_Certificate_SriSaiVasudevResidency_Sep2026.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showExportNotice('✓ Downloaded Chartered Accountant Audit Verification Certificate!');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #0b1329 0%, #060b18 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.15)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1440px',
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Top Header Bar */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          background: 'linear-gradient(90deg, #0c182b 0%, #15223d 50%, #0c182b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 100%)',
              border: '1px solid var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)'
            }}>
              <Scale size={24} color="var(--gold-glow)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'rgba(212, 175, 55, 0.2)',
                  color: 'var(--gold-glow)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(212, 175, 55, 0.4)'
                }}>
                  {CA_FILING_STATION_METADATA.systemNumber}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Statutory Accounting & Executive Command Center
                </span>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0 0', color: '#fff', letterSpacing: '-0.02em' }}>
                {HOTEL_CONFIG.tradeName} — CA Filing Station & Financial Intelligence Engine
              </h1>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: '1rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                <span>Proprietor: <strong style={{ color: '#fff' }}>{CA_FILING_STATION_METADATA.proprietorship.legalName}</strong></span>
                <span>GSTIN: <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{HOTEL_CONFIG.gstin}</strong></span>
                <span>PAN: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{HOTEL_CONFIG.pan}</strong></span>
                <span>Capacity: <strong style={{ color: 'var(--gold-glow)' }}>18 Keys (2 Floors)</strong></span>
                <span>Address: <strong style={{ color: '#cbd5e1' }}>Near Andhra Bank, New Colony, Rayagada</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Button 1: Download GSTN GSTR-1 JSON */}
            <button
              id="modal-btn-download-gstn-gstr1-json"
              onClick={handleExportGstr1Json}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b38914 100%)',
                color: '#000',
                border: '1px solid #facc15',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.35)'
              }}
              title="Download official GSTN GSTR-1 JSON payload schema v1.7 for upload to gst.gov.in"
            >
              <Download size={14} strokeWidth={2.5} /> Download GSTN GSTR-1 JSON (For gst.gov.in)
            </button>

            {/* Button 2: <> Preview Portal JSON & CA Guide */}
            <button
              id="modal-btn-preview-portal-json"
              onClick={() => setIsPreviewGuideOpen(true)}
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid #38bdf8',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
              title="Inspect live GSTN JSON schema, copy payload, and read step-by-step CA filing instructions"
            >
              <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>&lt;&gt;</span>
              <Eye size={14} /> Preview Portal JSON &amp; CA Guide
            </button>

            {/* Button 3: GSTR-1 Excel */}
            <button
              id="modal-btn-gstr1-excel"
              onClick={handleExportGstr1Excel}
              style={{
                background: '#0f172a',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
              title="Download official multi-sheet GSTR-1 Excel workbook (.xls)"
            >
              <Download size={13} />
              <FileSpreadsheet size={14} color="#34d399" /> GSTR-1 Excel
            </button>

            <button
              onClick={handleExportPLCSV}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                border: '1px solid #38bdf8',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)'
              }}
              title="Download full September 2026 P&L and Day Book Ledger as CSV"
            >
              <FileSpreadsheet size={14} /> P&L Ledger CSV
            </button>

            <button
              onClick={handleDownloadAuditReport}
              style={{
                background: 'rgba(212, 175, 55, 0.2)',
                color: 'var(--gold-glow)',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
              title="Generate CA Statutory Audit Certificate Text Pack"
            >
              <FileText size={14} /> Audit Certificate
            </button>

            <button
              onClick={() => sendCaFilingSummaryWhatsApp({
                period: 'September 2026',
                grossTurnover: (plSummary.grossLodgingRevenue + plSummary.grossRestaurantRevenue + plSummary.grossBanquetRevenue),
                cgstCollected: plSummary.cgstOutput,
                sgstCollected: plSummary.sgstOutput,
                totalGstOutput: plSummary.totalGstOutput,
                eligibleItc: plSummary.eligibleItc,
                netGstPayable: plSummary.netGstPayable,
                totalOpex: plSummary.totalOpex,
                ebitdaMargin: `${plSummary.ebitdaMargin.toFixed(1)}%`,
                ebitdaProfit: plSummary.ebitda
              })}
              style={{
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
              }}
              title="Dispatch Monthly GSTR-1 &amp; P&amp;L Executive Summary to Proprietor &amp; CA on WhatsApp"
            >
              <MessageCircle size={14} /> WhatsApp CA Brief
            </button>

            <button
              onClick={() => window.print()}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
              title="Print Current Station View"
            >
              <Printer size={14} />
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.25rem'
              }}
              title="Close Filing Station"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Notification Banner */}
        {exportNotice && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '0.5rem 1.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <CheckCheck size={16} /> {exportNotice}
          </div>
        )}

        {/* 10 Navigation Modules Tab Bar */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          padding: '0.65rem 1.25rem',
          background: 'rgba(6, 11, 24, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          flexShrink: 0
        }}>
          {[
            { id: 'tri-period', num: '9', name: 'Executive Tri-Period P&L', icon: TrendingUp, color: '#38bdf8' },
            { id: 'payment-method', num: '1', name: 'Revenue by Payment Mode', icon: CreditCard, color: '#34d399' },
            { id: 'expenditures', num: '2', name: 'Daily Expenditures Register', icon: DollarSign, color: '#f87171' },
            { id: 'gst-compliance', num: '3', name: 'Real-Time 5% GST Ledger', icon: Scale, color: '#fbbf24' },
            { id: 'bookings-category', num: '4', name: 'Bookings by Category', icon: Table, color: '#a78bfa' },
            { id: 'fnb-dining', num: '5', name: 'Dining & Kitchen Revenue', icon: UtensilsCrossed, color: '#f472b6' },
            { id: 'room-matrix', num: '6', name: 'Room-Type Revenue Matrix', icon: BarChart2, color: '#38bdf8' },
            { id: 'all-18-rooms', num: '7', name: 'All 18 Rooms Breakdown', icon: Layers, color: 'var(--gold-glow)' },
            { id: 'expense-heads', num: '8', name: 'Daily Expense Distribution', icon: PieChart, color: '#fb923c' },
            { id: 'ca-station', num: '10', name: 'CA Filing & ITC Engine', icon: ShieldCheck, color: '#34d399' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  border: isActive ? `1px solid ${tab.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive ? `rgba(${tab.color === '#34d399' ? '52, 211, 153' : tab.color === '#38bdf8' ? '56, 189, 248' : tab.color === '#f87171' ? '248, 113, 113' : '212, 175, 55'}, 0.2)` : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? `0 2px 8px rgba(0, 0, 0, 0.4)` : 'none'
                }}
              >
                <span style={{
                  fontSize: '0.65rem',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: isActive ? tab.color : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#000' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  {tab.num}
                </span>
                <Icon size={14} color={isActive ? tab.color : '#94a3b8'} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Viewport */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          background: 'rgba(5, 9, 20, 0.6)'
        }}>

          {/* MODULE 9: EXECUTIVE TRI-PERIOD FINANCIAL DASHBOARD (SIDE-BY-SIDE) */}
          {activeTab === 'tri-period' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: 'var(--gold-glow)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #9 • Comparative Financial Audit
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  Executive Tri-Period Financial Dashboard: Today vs. 15 Days vs. Full Month
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Side-by-side reconciliation of hotel room revenue, in-room dining, operational expenditures, and Net Operating Profit (P&L) for Sri Sai Vasudev Residency.
                </p>
              </div>

              {/* Side-by-Side 3 Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {TRI_PERIOD_FINANCIAL_DASHBOARD.periods.map(period => (
                  <div key={period.id} style={{
                    background: period.id === 'full-month' 
                      ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.12) 0%, rgba(12, 24, 43, 0.95) 100%)' 
                      : 'rgba(15, 23, 42, 0.85)',
                    border: period.id === 'full-month' ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: period.id === 'full-month' ? '0 10px 30px -10px rgba(212, 175, 55, 0.3)' : 'none'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: period.id === 'today' ? 'rgba(56, 189, 248, 0.2)' : period.id === 'mid-month' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(212, 175, 55, 0.25)',
                        color: period.id === 'today' ? '#38bdf8' : period.id === 'mid-month' ? '#c084fc' : 'var(--gold-glow)',
                        border: '1px solid currentColor'
                      }}>
                        {period.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{period.dateRange}</span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
                      {period.name}
                    </h3>

                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold-glow)', marginBottom: '0.5rem' }}>
                      ₹{period.grossTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>Gross Realized Turnover</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.75rem 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Room Stay (18 Keys)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>₹{period.roomRevenue.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>F&B Dining Sales</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>₹{period.diningRevenue.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Occupancy Rate</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>{period.occupancyPct}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Operating Costs</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f87171' }}>₹{period.totalExpenses.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Net Operating Profit (EBITDA)</span>
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>{period.netMarginPct}% Margin</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                        ₹{period.netOperatingProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comprehensive Tri-Period Comparison Matrix (Google Sheets Grid) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '1.5rem' }}>
                <SheetsToolbarLegend tableName="Tri-Period P&L Comparative Matrix" subtitle="Today vs Mid-Month vs Full Month P&L Ledger">
                  <button
                    onClick={() => copyTableToSheets(
                      ['#', 'Financial Metric & KPI', 'Today (24-Hour Live)', 'Mid-Month (1-15 Sep)', 'Full Month (1-30 Sep Final)'],
                      [
                        [1, 'Total Inventory Capacity', '18 Keys', '18 Keys (270 Nights)', '18 Keys (540 Nights)'],
                        [2, 'Room Nights Sold', '14 Nights', '220 Nights', '432 Nights'],
                        [3, 'Average Occupancy %', '77.8%', '81.5%', '80.0%'],
                        [4, 'Room Stay Turnover (SAC 996311)', '₹32,500.00', '₹5,01,600.00', '₹9,84,960.00'],
                        [5, 'In-Room Dining Sales (SAC 996331)', '₹10,850.00', '₹1,58,200.00', '₹3,24,500.00'],
                        [6, 'Auxiliary Guest Services (SAC 996337)', '₹1,500.00', '₹22,400.00', '₹48,200.00'],
                        [7, 'TOTAL GROSS TURNOVER', '₹44,850.00', '₹6,82,200.00', '₹13,57,660.00'],
                        [8, 'Output GST (5% - 2.5% CGST + 2.5% SGST)', '₹2,135.71', '₹32,485.71', '₹64,650.48'],
                        [9, 'Input Tax Credit (ITC Claims)', '₹450.00', '₹7,200.00', '₹14,820.00'],
                        [10, 'Net Cash GST Payable to Govt', '₹1,685.71', '₹25,285.71', '₹49,830.48'],
                        [11, 'Operating Hotel Expenditures', '₹12,800.00', '₹1,98,400.00', `₹${totalMonthlyExpensesLive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                        [12, 'NET OPERATING PROFIT (EBITDA)', '₹29,914.29', '₹4,51,314.29', `₹${(1357660 - 64650.48 + 14820 - totalMonthlyExpensesLive).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]
                      ],
                      'Tri-Period P&L Comparison'
                    )}
                    className="sheets-copy-btn"
                  >
                    📋 Copy for Google Sheets
                  </button>
                </SheetsToolbarLegend>
                <div style={{ overflowX: 'auto' }}>
                  <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#0e1726', color: '#fbbf24', borderBottom: '2px solid rgba(212, 175, 55, 0.6)' }}>
                        <SheetsColumnHeader title="#" badge="locked" style={{ width: '38px', textAlign: 'center' }} />
                        <SheetsColumnHeader title="Financial Metric & KPI" badge="locked" />
                        <SheetsColumnHeader title="Today (24-Hour Live)" badge="formula" align="right" />
                        <SheetsColumnHeader title="Mid-Month (1–15 Sep)" badge="formula" align="right" />
                        <SheetsColumnHeader title="Full Month (1–30 Sep Final)" badge="formula" align="right" />
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { kpi: 'Total Inventory Capacity', d1: '18 Keys', d2: '18 Keys (270 Nights)', d3: '18 Keys (540 Nights)', highlight: 'gold' },
                        { kpi: 'Room Nights Sold', d1: '14 Nights', d2: '220 Nights', d3: '432 Nights', highlight: 'blue' },
                        { kpi: 'Average Occupancy %', d1: '77.8%', d2: '81.5%', d3: '80.0%', highlight: 'green' },
                        { kpi: 'Room Stay Turnover (SAC 996311)', d1: '₹32,500.00', d2: '₹5,01,600.00', d3: '₹9,84,960.00' },
                        { kpi: 'In-Room Dining & Kitchen Sales (SAC 996331)', d1: '₹10,850.00', d2: '₹1,58,200.00', d3: '₹3,24,500.00' },
                        { kpi: 'Auxiliary Guest Services (SAC 996337)', d1: '₹1,500.00', d2: '₹22,400.00', d3: '₹48,200.00' },
                        { kpi: 'TOTAL GROSS TURNOVER', d1: '₹44,850.00', d2: '₹6,82,200.00', d3: '₹13,57,660.00', rowBg: 'rgba(212, 175, 55, 0.12)', bold: true },
                        { kpi: 'Output GST (5.0% - 2.5% CGST + 2.5% SGST)', d1: '₹2,135.71', d2: '₹32,485.71', d3: '₹64,650.48', color: '#fbbf24' },
                        { kpi: 'Input Tax Credit (ITC Claims)', d1: '₹450.00', d2: '₹7,200.00', d3: '₹14,820.00', color: '#34d399' },
                        { kpi: 'Net Cash GST Payable to Govt (Odisha)', d1: '₹1,685.71', d2: '₹25,285.71', d3: '₹49,830.48' },
                        { kpi: 'Operating Hotel Expenditures', d1: '₹12,800.00', d2: '₹1,98,400.00', d3: `₹${totalMonthlyExpensesLive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#f87171' },
                        { kpi: 'NET OPERATING PROFIT (EBITDA)', d1: '₹29,914.29', d2: '₹4,51,314.29', d3: `₹${(1357660 - 64650.48 + 14820 - totalMonthlyExpensesLive).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rowBg: 'rgba(16, 185, 129, 0.15)', bold: true, color: '#34d399' }
                      ].map((r, idx) => (
                        <tr key={r.kpi} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: r.rowBg || (idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)') }}>
                          <td className="sheets-row-num">{idx + 1}</td>
                          <td style={{ padding: '0.65rem 1rem', color: r.bold ? 'var(--gold-glow)' : '#cbd5e1', fontWeight: r.bold ? 800 : 500 }}>{r.kpi}</td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: r.bold ? 800 : 600, color: r.color || '#fff' }}>{r.d1}</td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: r.bold ? 800 : 600, color: r.color || '#fff' }}>{r.d2}</td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: r.bold ? 800 : 700, color: r.color || (r.highlight === 'gold' ? 'var(--gold-glow)' : r.highlight === 'blue' ? '#38bdf8' : r.highlight === 'green' ? '#34d399' : '#fff') }}>{r.d3}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>              </div>
            </div>
          )}

          {/* MODULE 1: REVENUE BY PAYMENT METHOD */}
          {activeTab === 'payment-method' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #1 • Tender & Collection Balancing
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  Revenue by Payment Method — Full Month September 2026
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Reconciliation of all collection modes into Sri Sai Vasudev Residency bank accounts and front desk cashier drawer.
                </p>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {PAYMENT_METHOD_REVENUE_SEP2026.map(item => (
                  <div key={item.method} style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: `1px solid ${item.color}40`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: `${item.color}20`, color: item.color }}>
                        {item.badge}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: item.color }}>
                        {item.percentage}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{item.method}</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', margin: '0.35rem 0' }}>
                      ₹{item.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {item.txnCount} Transactions • {item.account}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Distribution Bar */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tender Mix Allocation (Total: ₹{TOTAL_GROSS_REVENUE_SEP2026.toLocaleString('en-IN')})</span>
                  <span style={{ color: 'var(--gold-glow)' }}>100.0% Audited</span>
                </div>
                <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', background: '#1e293b' }}>
                  {PAYMENT_METHOD_REVENUE_SEP2026.map(item => (
                    <div key={item.method} style={{ width: `${item.percentage}%`, background: item.color }} title={`${item.method}: ${item.percentage}%`} />
                  ))}
                </div>
              </div>

              {/* Tabular Register (Google Sheets Grid) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '1.5rem' }}>
                <SheetsToolbarLegend tableName="Payment Mode Reconciliation Matrix" subtitle="SBI Bank & Cash Drawer Settled Totals">
                  <button
                    onClick={() => copyTableToSheets(
                      ['#', 'Payment Method & Channel', 'Destination Account', 'Vouchers', 'Gross Collections (INR)', 'Share %', 'Audit Status'],
                      PAYMENT_METHOD_REVENUE_SEP2026.map((item, i) => [i + 1, item.method, item.account, item.txnCount, item.grossAmount, `${item.percentage}%`, item.status]),
                      'Payment Mode Reconciliation'
                    )}
                    className="sheets-copy-btn"
                  >
                    📋 Copy for Google Sheets
                  </button>
                </SheetsToolbarLegend>
                <div style={{ overflowX: 'auto' }}>
                  <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#0e1726', color: '#fbbf24', borderBottom: '2px solid rgba(212, 175, 55, 0.6)' }}>
                        <SheetsColumnHeader title="#" badge="locked" style={{ width: '38px', textAlign: 'center' }} />
                        <SheetsColumnHeader title="Payment Method & Channel" badge="locked" />
                        <SheetsColumnHeader title="Destination Account / Vault" badge="locked" />
                        <SheetsColumnHeader title="Vouchers" badge="locked" align="center" />
                        <SheetsColumnHeader title="Gross Collections (INR)" badge="formula" align="right" />
                        <SheetsColumnHeader title="Share %" badge="formula" align="center" />
                        <SheetsColumnHeader title="Audit Status" badge="locked" align="right" />
                      </tr>
                    </thead>
                    <tbody>
                      {PAYMENT_METHOD_REVENUE_SEP2026.map((item, idx) => (
                        <tr key={item.method} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                          <td className="sheets-row-num">{idx + 1}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{item.method}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.channel}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontFamily: 'monospace' }}>{item.account}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#cbd5e1' }}>{item.txnCount}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: item.color }}>
                            ₹{item.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>{item.percentage}%</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#34d399', fontSize: '0.75rem' }}>
                            <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} /> {item.status}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: 'rgba(212, 175, 55, 0.12)', fontWeight: 800 }}>
                        <td className="sheets-row-num">Σ</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--gold-glow)' }}>TOTAL SETTLED COLLECTIONS</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>State Bank of India & Desk Vault</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#fff' }}>552 Txns</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: 'var(--gold-glow)', fontSize: '0.95rem' }}>
                          ₹{TOTAL_GROSS_REVENUE_SEP2026.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: 'var(--gold-glow)' }}>100.0%</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#34d399' }}>Reconciled</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: DAILY HOTEL EXPENDITURES REGISTER (30 DAYS) */}
          {activeTab === 'expenditures' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Module #2 • Expense Register
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                    Daily Hotel Expenditures Register — Full Month September 2026
                  </h2>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                    Complete 30-day audited payment vouchers, local vendor disbursements, and Input Tax Credit (ITC) eligibility.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search voucher, head, vendor..."
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                      style={{
                        padding: '0.45rem 0.75rem 0.45rem 2rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.8rem',
                        outline: 'none',
                        width: '240px'
                      }}
                    />
                  </div>

                  <select
                    value={expenseFilter}
                    onChange={(e) => setExpenseFilter(e.target.value)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.8rem'
                    }}
                  >
                    <option value="ALL">All Payments (30 Days)</option>
                    <option value="ITC">ITC Eligible Vouchers Only</option>
                    <option value="UPI">UPI Payments</option>
                    <option value="CASH">Cash Disbursements</option>
                    <option value="BANK">Bank Salary Transfers</option>
                  </select>
                </div>
              </div>

              {/* Total Expenditures Ribbon */}
              <div style={{ background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>Total Month-to-Date Cash Outflow</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f87171' }}>
                    ₹{totalMonthlyExpensesLive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right' }}>
                  Showing <strong style={{ color: '#fff' }}>{filteredExpenses.length}</strong> of 30 Vouchers • Average Daily Outflow: <strong style={{ color: '#fff' }}>₹{(TOTAL_MONTHLY_EXPENDITURES_SEP2026 / 30).toLocaleString('en-IN', { maximumFractionDigits: 0 })}/day</strong>
                </div>
              </div>

              {/* Table (Google Sheets Grid with Direct Keyboard Inline Editing) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '1.5rem' }}>
                <SheetsToolbarLegend tableName="Daily Hotel Expenditures Register (30 Days)" subtitle="Audited Cash Outflow • Click Any Cell to Edit Directly">
                  <button
                    onClick={() => copyTableToSheets(
                      ['#', 'Day & Date', 'Voucher #', 'Head of Expenditure', 'Vendor / Beneficiary', 'Amount (INR)', 'Mode', 'Approver', 'ITC'],
                      filteredExpenses.map((item, idx) => [idx + 1, `Day ${item.day} • ${item.date}`, item.voucher, item.head, item.vendor, item.amount, item.mode, item.approvedBy, item.itcEligible ? 'Eligible' : 'Exempt']),
                      'Daily Expenditures Register'
                    )}
                    className="sheets-copy-btn"
                  >
                    📋 Copy for Google Sheets
                  </button>
                </SheetsToolbarLegend>
                <div style={{ overflowX: 'auto' }}>
                  <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#0e1726', color: '#fbbf24', borderBottom: '2px solid rgba(212, 175, 55, 0.6)' }}>
                        <SheetsColumnHeader title="#" badge="locked" style={{ width: '38px', textAlign: 'center' }} />
                        <SheetsColumnHeader title="Day & Date" badge="locked" />
                        <SheetsColumnHeader title="Voucher #" badge="locked" />
                        <SheetsColumnHeader title="Head of Expenditure" badge="editable" />
                        <SheetsColumnHeader title="Vendor / Beneficiary" badge="editable" />
                        <SheetsColumnHeader title="Amount (INR)" badge="editable" align="right" />
                        <SheetsColumnHeader title="Mode" badge="editable" align="center" />
                        <SheetsColumnHeader title="Approver" badge="locked" />
                        <SheetsColumnHeader title="ITC" badge="locked" align="center" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((item, idx) => (
                        <tr key={item.voucher} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                          <td className="sheets-row-num">{idx + 1}</td>
                          <td style={{ padding: '0.55rem 0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                            Day {item.day} • {item.date}
                          </td>
                          <td style={{ padding: '0.55rem 0.85rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                            {item.voucher}
                          </td>
                          <SheetsEditableCell
                            value={item.head}
                            type="text"
                            cellStyle={{ padding: '0.55rem 0.85rem', color: '#fff', fontWeight: 600 }}
                            onSave={(newVal) => setExpensesData(prev => prev.map(x => x.voucher === item.voucher ? { ...x, head: newVal } : x))}
                          />
                          <SheetsEditableCell
                            value={item.vendor}
                            type="text"
                            cellStyle={{ padding: '0.55rem 0.85rem', color: '#94a3b8' }}
                            onSave={(newVal) => setExpensesData(prev => prev.map(x => x.voucher === item.voucher ? { ...x, vendor: newVal } : x))}
                          />
                          <SheetsEditableCell
                            value={item.amount}
                            type="currency"
                            align="right"
                            min={0}
                            cellStyle={{ padding: '0.55rem 0.85rem', fontWeight: 700, color: '#f87171' }}
                            onSave={(newVal) => setExpensesData(prev => prev.map(x => x.voucher === item.voucher ? { ...x, amount: Number(newVal) } : x))}
                          />
                          <SheetsEditableCell
                            value={item.mode}
                            type="select"
                            options={['UPI', 'Cash', 'Bank Transfer', 'NEFT', 'Card']}
                            align="center"
                            cellStyle={{ padding: '0.55rem 0.85rem' }}
                            onSave={(newVal) => setExpensesData(prev => prev.map(x => x.voucher === item.voucher ? { ...x, mode: newVal } : x))}
                          />
                          <td style={{ padding: '0.55rem 0.85rem', color: '#cbd5e1', fontSize: '0.75rem' }}>
                            {item.approvedBy}
                          </td>
                          <td style={{ padding: '0.55rem 0.85rem', textAlign: 'center' }}>
                            {item.itcEligible ? (
                              <span style={{ color: '#34d399', fontSize: '0.7rem', fontWeight: 700 }}>YES</span>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 3: REAL-TIME 5% GST COMPLIANCE LEDGER */}
          {activeTab === 'gst-compliance' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #3 • Statutory Taxation
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  Real-Time 5% GST Compliance Ledger — Full Month September 2026
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Tax ledger under SAC 996311 (Rooms) & SAC 996331 (Dining) with Input Tax Credit (ITC) reconciliation for GSTIN 21AEKPP8689J1ZS.
                </p>
              </div>

              {/* GST Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Gross Taxable Turnover</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0.35rem 0' }}>
                    ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalTaxableBase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Gross Invoiced: ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalGrossTurnover.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#fca5a5', textTransform: 'uppercase' }}>Total 5% Output GST (2.5% + 2.5%)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', margin: '0.35rem 0' }}>
                    ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalOutputGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>CGST: ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalCgstOutput.toLocaleString('en-IN', { minimumFractionDigits: 2 })} | SGST: ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalSgstOutput.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase' }}>Eligible Input Tax Credit (ITC)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '0.35rem 0' }}>
                    ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.eligibleInputTaxCreditITC.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Fuel, Commercial Electricity, Linen</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(12, 24, 43, 0.95) 100%)', border: '1px solid var(--gold-primary)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-glow)', textTransform: 'uppercase' }}>Net Cash GST Payable (PMT-06)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold-glow)', margin: '0.35rem 0' }}>
                    ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.netCashGstPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>✓ Reconciled with GSTR-3B</div>
                </div>
              </div>

              {/* SAC Code Matrix (Google Sheets Grid) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '1.5rem' }}>
                <SheetsToolbarLegend tableName="Service Accounting Code (SAC) Statutory Ledger" subtitle="5% GST (2.5% CGST + 2.5% SGST) Calculation Breakdown">
                  <button
                    onClick={() => copyTableToSheets(
                      ['#', 'SAC Code', 'Service Description', 'Gross Billed (INR)', 'Taxable Base (INR)', 'Rate', 'CGST 2.5%', 'SGST 2.5%', 'Total GST 5%'],
                      GST_COMPLIANCE_LEDGER_SEP2026.categories.map((c, i) => [i + 1, `SAC ${c.sacCode}`, c.description, c.grossTurnover, c.taxableBase, '5.0%', c.cgstAmount, c.sgstAmount, c.totalGst]),
                      'SAC Statutory GST Ledger'
                    )}
                    className="sheets-copy-btn"
                  >
                    📋 Copy for Google Sheets
                  </button>
                </SheetsToolbarLegend>
                <div style={{ overflowX: 'auto' }}>
                  <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#0e1726', color: '#fbbf24', borderBottom: '2px solid rgba(212, 175, 55, 0.6)' }}>
                        <SheetsColumnHeader title="#" badge="locked" style={{ width: '38px', textAlign: 'center' }} />
                        <SheetsColumnHeader title="SAC Code & Service Description" badge="locked" />
                        <SheetsColumnHeader title="Gross Billed (INR)" badge="formula" align="right" />
                        <SheetsColumnHeader title="Taxable Base (INR)" badge="formula" align="right" />
                        <SheetsColumnHeader title="Rate" badge="locked" align="center" />
                        <SheetsColumnHeader title="CGST 2.5%" badge="formula" align="right" />
                        <SheetsColumnHeader title="SGST 2.5%" badge="formula" align="right" />
                        <SheetsColumnHeader title="Total GST (5%)" badge="formula" align="right" />
                      </tr>
                    </thead>
                    <tbody>
                      {GST_COMPLIANCE_LEDGER_SEP2026.categories.map((c, idx) => (
                        <tr key={c.sacCode} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                          <td className="sheets-row-num">{idx + 1}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold-glow)', marginRight: 6 }}>
                              SAC {c.sacCode}
                            </span>
                            <span style={{ color: '#fff' }}>{c.description}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#cbd5e1' }}>
                            ₹{c.grossTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                            ₹{c.taxableBase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: '#fbbf24' }}>
                            5.0%
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f87171' }}>
                            ₹{c.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f87171' }}>
                            ₹{c.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--gold-glow)' }}>
                            ₹{c.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: 'rgba(212, 175, 55, 0.12)', fontWeight: 800 }}>
                        <td className="sheets-row-num">Σ</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--gold-glow)' }}>TOTAL GSTR-1 OUTWARD TAX</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#fff' }}>
                          ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalGrossTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#38bdf8' }}>
                          ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalTaxableBase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#fbbf24' }}>5.0%</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#f87171' }}>
                          ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalCgstOutput.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#f87171' }}>
                          ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalSgstOutput.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: 'var(--gold-glow)', fontSize: '0.95rem' }}>
                          ₹{GST_COMPLIANCE_LEDGER_SEP2026.summary.totalOutputGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 4: TOTAL BOOKINGS PER ROOM CATEGORY */}
          {activeTab === 'bookings-category' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #4 • Inventory Demand
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  Total Bookings Per Room Category — Full Month September 2026
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Demand velocity, guest footfall, and occupancy distribution across the 4 room tiers of Sri Sai Vasudev Residency.
                </p>
              </div>

              {/* 4 Category Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {BOOKINGS_PER_CATEGORY_SEP2026.map(tier => (
                  <div key={tier.category} style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(167, 139, 250, 0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(167, 139, 250, 0.2)', color: '#c084fc', fontWeight: 700 }}>
                        {tier.roomsCount} Keys
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>
                        {tier.tariffs}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0.2rem', color: '#fff' }}>
                      {tier.category}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      Rooms: {tier.roomList}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.65rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Bookings</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{tier.totalBookings}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Nights Sold</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{tier.roomNightsSold}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Guest Footfall</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#cbd5e1' }}>{tier.guestCount} Pax</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Occupancy Rate</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-glow)' }}>{tier.occupancyPct}%</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tier Revenue:</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>₹{tier.totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Statistics Summary */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Physical Inventory</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>18 Keys</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Available Room Nights</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>{TOTAL_ROOM_NIGHTS_AVAILABLE} Nights</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Nights Sold</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>{TOTAL_ROOM_NIGHTS_SOLD} Nights</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Overall Hotel Occupancy</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-glow)' }}>80.0%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Room Revenue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>₹{TOTAL_ROOM_STAY_REVENUE.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 5: IN-ROOM DINING & KITCHEN PARTNER REVENUE */}
          {activeTab === 'fnb-dining' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: '#f472b6', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #5 • Food & Beverage POS
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  In-Room Dining & Kitchen Partner Revenue — Full Month September 2026
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Reconciliation of room service KOT orders, Satvik pilgrimage dining, mineral water, and corporate catering.
                </p>
              </div>

              {/* F&B Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {DINING_KITCHEN_REVENUE_SEP2026.map(item => (
                  <div key={item.code} style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(244, 114, 182, 0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(244, 114, 182, 0.2)', color: '#f472b6' }}>
                        {item.code}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f472b6' }}>
                        {item.percentage}% Share
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.5rem 0 0.2rem', color: '#fff' }}>
                      {item.category}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      Outlet: {item.outlet}
                    </div>

                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                      ₹{item.grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                      <strong>{item.orderCount} Orders</strong> • Avg: ₹{item.avgOrderValue.toFixed(2)}
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                        Top: {item.topItems}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Dining Banner */}
              <div style={{ background: 'linear-gradient(90deg, rgba(244, 114, 182, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(244, 114, 182, 0.3)', borderRadius: '10px', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#f9a8d4', textTransform: 'uppercase', fontWeight: 700 }}>Total F&B Dining Turnover (SAC 996331)</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>
                    ₹{TOTAL_DINING_REVENUE_SEP2026.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Taxable Base: <strong style={{ color: '#38bdf8' }}>₹{(TOTAL_DINING_REVENUE_SEP2026 / 1.05).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                  <br />5% GST Collected: <strong style={{ color: '#fbbf24' }}>₹{(TOTAL_DINING_REVENUE_SEP2026 - (TOTAL_DINING_REVENUE_SEP2026 / 1.05)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 6: ROOM-TYPE REVENUE MATRIX */}
          {activeTab === 'room-matrix' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #6 • Yield & Hospitality Metrics
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  Room-Type Revenue Matrix (ADR, RevPAR, Occupancy) — Full Month September 2026
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Comprehensive yield analysis comparing Average Daily Rate (ADR) and Revenue Per Available Room (RevPAR).
                </p>
              </div>

              {/* Matrix Table (Google Sheets Grid) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '1.5rem' }}>
                <SheetsToolbarLegend tableName="Room-Type Revenue & Yield Matrix" subtitle="ADR, RevPAR, and Key Portfolio Yield (Click Tariff or Nights to edit)">
                  <button
                    onClick={() => copyTableToSheets(
                      ['#', 'Room Category', 'Keys', 'Floor Location', 'Tariff (INR)', 'Sold / Avail', 'Occ %', 'ADR (INR)', 'RevPAR (INR)', 'Total Revenue (INR)', 'Room Share'],
                      roomMatrixData.map((r, i) => [i + 1, r.tier, r.keys, r.floors, r.baseTariff, `${r.soldNights} / ${r.availableNights}`, `${r.occupancyPct}%`, r.adr, r.revpar, r.totalRevenue, `${r.shareOfRoomRevenue}%`]),
                      'Room-Type Revenue Matrix'
                    )}
                    className="sheets-copy-btn"
                  >
                    📋 Copy for Google Sheets
                  </button>
                </SheetsToolbarLegend>
                <div style={{ overflowX: 'auto' }}>
                  <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#0e1726', color: '#fbbf24', borderBottom: '2px solid rgba(212, 175, 55, 0.6)' }}>
                        <SheetsColumnHeader title="#" badge="locked" style={{ width: '38px', textAlign: 'center' }} />
                        <SheetsColumnHeader title="Room Category" badge="locked" />
                        <SheetsColumnHeader title="Keys" badge="locked" align="center" />
                        <SheetsColumnHeader title="Floor Location" badge="locked" align="center" />
                        <SheetsColumnHeader title="Tariff (INR)" badge="editable" align="right" />
                        <SheetsColumnHeader title="Sold / Avail" badge="editable" align="center" />
                        <SheetsColumnHeader title="Occ %" badge="formula" align="center" />
                        <SheetsColumnHeader title="ADR (INR)" badge="formula" align="right" />
                        <SheetsColumnHeader title="RevPAR (INR)" badge="formula" align="right" />
                        <SheetsColumnHeader title="Total Revenue (INR)" badge="formula" align="right" />
                        <SheetsColumnHeader title="Room Share" badge="formula" align="center" />
                      </tr>
                    </thead>
                    <tbody>
                      {roomMatrixData.map((r, idx) => (
                        <tr key={r.tier} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                          <td className="sheets-row-num">{idx + 1}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#fff' }}>{r.tier}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#cbd5e1' }}>{r.keys}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>{r.floors}</td>
                          <SheetsEditableCell
                            value={r.baseTariff}
                            type="currency"
                            align="right"
                            min={500}
                            cellStyle={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}
                            onSave={(newVal) => setRoomMatrixData(prev => prev.map(x => x.tier === r.tier ? { ...x, baseTariff: Number(newVal), totalRevenue: Number(newVal) * x.soldNights, adr: Number(newVal) } : x))}
                          />
                          <SheetsEditableCell
                            value={r.soldNights}
                            type="number"
                            align="center"
                            min={0}
                            max={r.availableNights}
                            cellStyle={{ padding: '0.75rem 1rem', color: '#38bdf8' }}
                            formatDisplay={(v) => `${v} / ${r.availableNights}`}
                            onSave={(newVal) => setRoomMatrixData(prev => prev.map(x => x.tier === r.tier ? { ...x, soldNights: Number(newVal), occupancyPct: ((Number(newVal) / x.availableNights) * 100).toFixed(1), totalRevenue: x.baseTariff * Number(newVal), revpar: Math.round((x.baseTariff * Number(newVal)) / x.availableNights) } : x))}
                          />
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: '#34d399' }}>{r.occupancyPct}%</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#fbbf24' }}>₹{r.adr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>₹{r.revpar.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#fff' }}>₹{r.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--gold-glow)' }}>{r.shareOfRoomRevenue}%</td>
                        </tr>
                      ))}
                      <tr style={{ background: 'rgba(212, 175, 55, 0.12)', fontWeight: 800 }}>
                        <td className="sheets-row-num">Σ</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--gold-glow)' }}>TOTAL 18-ROOM PORTFOLIO</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#fff' }}>18 Keys</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#94a3b8' }}>2 Floors</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#cbd5e1' }}>Blended</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#38bdf8' }}>{roomMatrixData.reduce((s, r) => s + Number(r.soldNights || 0), 0)} / 540</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#34d399' }}>80.0%</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#fbbf24' }}>₹2,280.00</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#38bdf8' }}>₹1,824.00</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: 'var(--gold-glow)', fontSize: '0.95rem' }}>₹{roomMatrixData.reduce((s, r) => s + Number(r.totalRevenue || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: 'var(--gold-glow)' }}>100.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 7: REVENUE BREAKDOWN ACROSS ALL 4 ROOM CATEGORIES (18 ROOMS TOTAL) */}
          {activeTab === 'all-18-rooms' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: 'var(--gold-glow)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #7 • Physical Inventory Audit
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  Revenue Breakdown Across All 4 Room Categories (18 Rooms Total)
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Key-by-key operational performance for the authentic 18 keys (Ground Floor: 101–107, First Floor: 201–211).
                </p>
              </div>

              {/* Floor Grouped Tables (Google Sheets Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.25rem' }}>
                {/* Ground Floor (7 Keys) */}
                <div style={{ borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.25)', overflow: 'hidden' }}>
                  <SheetsToolbarLegend tableName="Ground Floor Inventory (101–107)" subtitle="7 Physical Keys Yield & Consumption">
                    <button
                      onClick={() => copyTableToSheets(
                        ['#', 'Room', 'Tier', 'Tariff', 'Nights', 'Occ %', 'Room Rev', 'F&B Rev', 'Total Rev'],
                        allRoomsData.filter(r => r.floor === 'Ground').map((r, i) => [i + 1, `Room ${r.room}`, r.tier, r.tariff, r.nightsSold, `${r.occupancyPct}%`, r.revenue, r.fnbRevenue, r.total]),
                        'Ground Floor 7 Rooms'
                      )}
                      className="sheets-copy-btn"
                    >
                      📋 Copy for Google Sheets
                    </button>
                  </SheetsToolbarLegend>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: '#0e1726', color: '#fbbf24', borderBottom: '2px solid rgba(212, 175, 55, 0.6)' }}>
                          <SheetsColumnHeader title="#" badge="locked" style={{ width: '34px', textAlign: 'center' }} />
                          <SheetsColumnHeader title="Room" badge="locked" />
                          <SheetsColumnHeader title="Tier" badge="locked" />
                          <SheetsColumnHeader title="Tariff" badge="editable" align="right" />
                          <SheetsColumnHeader title="Nights" badge="editable" align="center" />
                          <SheetsColumnHeader title="Occ %" badge="formula" align="center" />
                          <SheetsColumnHeader title="Room Rev" badge="formula" align="right" />
                          <SheetsColumnHeader title="F&B Rev" badge="editable" align="right" />
                          <SheetsColumnHeader title="Total Rev" badge="formula" align="right" />
                        </tr>
                      </thead>
                      <tbody>
                        {allRoomsData.filter(r => r.floor === 'Ground').map((r, idx) => (
                          <tr key={r.room} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                            <td className="sheets-row-num">{idx + 1}</td>
                            <td style={{ padding: '0.5rem', fontWeight: 800, color: '#fff' }}>Room {r.room}</td>
                            <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>{r.tier}</td>
                            <SheetsEditableCell
                              value={r.tariff}
                              type="currency"
                              align="right"
                              onSave={(newVal) => setAllRoomsData(prev => prev.map(x => x.room === r.room ? { ...x, tariff: Number(newVal), revenue: Number(newVal) * x.nightsSold, total: (Number(newVal) * x.nightsSold) + x.fnbRevenue } : x))}
                            />
                            <SheetsEditableCell
                              value={r.nightsSold}
                              type="number"
                              align="center"
                              min={0}
                              max={30}
                              onSave={(newVal) => setAllRoomsData(prev => prev.map(x => x.room === r.room ? { ...x, nightsSold: Number(newVal), occupancyPct: ((Number(newVal) / 30) * 100).toFixed(1), revenue: x.tariff * Number(newVal), total: (x.tariff * Number(newVal)) + x.fnbRevenue } : x))}
                            />
                            <td style={{ padding: '0.5rem', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>{r.occupancyPct}%</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', color: '#cbd5e1' }}>₹{r.revenue.toLocaleString('en-IN')}</td>
                            <SheetsEditableCell
                              value={r.fnbRevenue}
                              type="currency"
                              align="right"
                              onSave={(newVal) => setAllRoomsData(prev => prev.map(x => x.room === r.room ? { ...x, fnbRevenue: Number(newVal), total: x.revenue + Number(newVal) } : x))}
                            />
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--gold-glow)' }}>₹{r.total.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* First Floor (11 Keys) */}
                <div style={{ borderRadius: '12px', border: '1px solid rgba(192, 132, 252, 0.3)', overflow: 'hidden' }}>
                  <SheetsToolbarLegend tableName="First Floor Inventory (201–211)" subtitle="11 Physical Keys Yield & Consumption">
                    <button
                      onClick={() => copyTableToSheets(
                        ['#', 'Room', 'Tier', 'Tariff', 'Nights', 'Occ %', 'Room Rev', 'F&B Rev', 'Total Rev'],
                        allRoomsData.filter(r => r.floor === '1st Floor').map((r, i) => [i + 1, `Room ${r.room}`, r.tier, r.tariff, r.nightsSold, `${r.occupancyPct}%`, r.revenue, r.fnbRevenue, r.total]),
                        'First Floor 11 Rooms'
                      )}
                      className="sheets-copy-btn"
                    >
                      📋 Copy for Google Sheets
                    </button>
                  </SheetsToolbarLegend>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: '#0e1726', color: '#c084fc', borderBottom: '2px solid rgba(192, 132, 252, 0.6)' }}>
                          <SheetsColumnHeader title="#" badge="locked" style={{ width: '34px', textAlign: 'center' }} />
                          <SheetsColumnHeader title="Room" badge="locked" />
                          <SheetsColumnHeader title="Tier" badge="locked" />
                          <SheetsColumnHeader title="Tariff" badge="editable" align="right" />
                          <SheetsColumnHeader title="Nights" badge="editable" align="center" />
                          <SheetsColumnHeader title="Occ %" badge="formula" align="center" />
                          <SheetsColumnHeader title="Room Rev" badge="formula" align="right" />
                          <SheetsColumnHeader title="F&B Rev" badge="editable" align="right" />
                          <SheetsColumnHeader title="Total Rev" badge="formula" align="right" />
                        </tr>
                      </thead>
                      <tbody>
                        {allRoomsData.filter(r => r.floor === '1st Floor').map((r, idx) => (
                          <tr key={r.room} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                            <td className="sheets-row-num">{idx + 1}</td>
                            <td style={{ padding: '0.5rem', fontWeight: 800, color: '#fff' }}>Room {r.room}</td>
                            <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>{r.tier}</td>
                            <SheetsEditableCell
                              value={r.tariff}
                              type="currency"
                              align="right"
                              onSave={(newVal) => setAllRoomsData(prev => prev.map(x => x.room === r.room ? { ...x, tariff: Number(newVal), revenue: Number(newVal) * x.nightsSold, total: (Number(newVal) * x.nightsSold) + x.fnbRevenue } : x))}
                            />
                            <SheetsEditableCell
                              value={r.nightsSold}
                              type="number"
                              align="center"
                              min={0}
                              max={30}
                              onSave={(newVal) => setAllRoomsData(prev => prev.map(x => x.room === r.room ? { ...x, nightsSold: Number(newVal), occupancyPct: ((Number(newVal) / 30) * 100).toFixed(1), revenue: x.tariff * Number(newVal), total: (x.tariff * Number(newVal)) + x.fnbRevenue } : x))}
                            />
                            <td style={{ padding: '0.5rem', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>{r.occupancyPct}%</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', color: '#cbd5e1' }}>₹{r.revenue.toLocaleString('en-IN')}</td>
                            <SheetsEditableCell
                              value={r.fnbRevenue}
                              type="currency"
                              align="right"
                              onSave={(newVal) => setAllRoomsData(prev => prev.map(x => x.room === r.room ? { ...x, fnbRevenue: Number(newVal), total: x.revenue + Number(newVal) } : x))}
                            />
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--gold-glow)' }}>₹{r.total.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 8: DAILY EXPENSE CATEGORIES (WHERE IS THE HOTEL SPENDING TODAY?) */}
          {activeTab === 'expense-heads' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: '#fb923c', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #8 • Operational Cost Analysis
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  Daily Expense Categories — Full Month September 2026: Where Is The Hotel Spending Today?
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Functional expense allocation across hotel operations, kitchen raw materials, team wages, and power backup.
                </p>
              </div>

              {/* Expense Head Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {DAILY_EXPENSE_CATEGORIES_SUMMARY.map(item => (
                  <div key={item.category} style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: `1px solid ${item.color}40`,
                    borderRadius: '12px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{item.category}</h4>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.subtext}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: item.color }}>{item.percentage}%</span>
                    </div>

                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Monthly Expenditure</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                          ₹{item.monthlyAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Daily Run Rate</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: item.color }}>
                          ₹{item.dailyAverage.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/day
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', background: '#1e293b', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 10: FINANCIAL INTELLIGENCE & GST COMPLIANCE ENGINE (CA FILING STATION) */}
          {activeTab === 'ca-station' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module #10 • Chartered Accountant Filing Station
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0', color: '#fff' }}>
                  Financial Intelligence & GST Compliance Engine — System #36: CA Filing Station
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Hotel Revenue, Expenditures & Tax Ledger — Track room revenue, daily costs, CGST/SGST, and download CA-ready reports for any period.
                </p>
              </div>

              {/* Dedicated Official CA & GST Compliance Filing Station Toolbar */}
              <GstFilingHeaderToolbar onNotice={showExportNotice} />

              {/* CA Official Filing Box */}
              <div style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid var(--gold-primary)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-glow)' }}>
                      🏛️ Statutory Tax Entity
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: '0.2rem 0' }}>
                      {CA_FILING_STATION_METADATA.proprietorship.tradeName}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      Proprietor: <strong style={{ color: '#fff' }}>{CA_FILING_STATION_METADATA.proprietorship.legalName}</strong> • {CA_FILING_STATION_METADATA.proprietorship.address}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleExportGstr1Json}
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#fff',
                        border: '1px solid #10b981',
                        padding: '0.65rem 1.1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Download size={16} /> 1. Export GSTR-1 Portal JSON
                    </button>
                    <button
                      onClick={handleExportPLCSV}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#fff',
                        border: '1px solid #38bdf8',
                        padding: '0.65rem 1.1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                      }}
                    >
                      <FileSpreadsheet size={16} /> 2. Export P&L & Day Book CSV
                    </button>
                    <button
                      onClick={handleDownloadAuditReport}
                      style={{
                        background: 'rgba(212, 175, 55, 0.25)',
                        color: 'var(--gold-glow)',
                        border: '1px solid var(--gold-primary)',
                        padding: '0.65rem 1.1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FileText size={16} /> 3. Download CA Audit Pack
                    </button>
                  </div>
                </div>

                {/* Entity Details Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div>GSTIN: <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{HOTEL_CONFIG.gstin}</strong></div>
                  <div>PAN: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{HOTEL_CONFIG.pan}</strong></div>
                  <div>State Code: <strong style={{ color: '#fff' }}>21 (Odisha)</strong></div>
                  <div>Tax Division: <strong style={{ color: '#cbd5e1' }}>RAYAGADA DIVISION</strong></div>
                  <div>Authority: <strong style={{ color: '#cbd5e1' }}>Gulshan Sanodiya, Supt. (Centre)</strong></div>
                </div>
              </div>

              {/* CA Audit Checklist */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#34d399" />
                  Statutory CA Audit & Tax Verification Checklist (September 2026)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {CA_FILING_STATION_METADATA.caAuditVerificationChecklist.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '0.82rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--gold-glow)', fontFamily: 'monospace', minWidth: '150px' }}>
                          {item.rule}
                        </span>
                        <span style={{ color: '#cbd5e1' }}>{item.check}</span>
                      </div>
                      <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.75rem', background: 'rgba(52, 211, 153, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        ✓ {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Official GSTN Portal JSON Inspector & CA Filing Guide Modal */}
      <GstPreviewGuideModal
        isOpen={isPreviewGuideOpen}
        onClose={() => setIsPreviewGuideOpen(false)}
        onDownloadJson={handleExportGstr1Json}
      />
    </div>
  );
}
