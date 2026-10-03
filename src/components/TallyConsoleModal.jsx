import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Check, Plus, Trash2, Download, Printer, Search, Calendar, 
  ArrowRight, ShieldCheck, AlertCircle, RefreshCw, KeyRound, 
  BookOpen, Layers, FileCode, CheckCircle2, ChevronRight, Hash,
  DollarSign, Building2, HelpCircle
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import UniversalDateFilterBar from './UniversalDateFilterBar';
import { SheetsColumnHeader, SheetsToolbarLegend, SheetsEditableCell } from './UniversalInlineEditor';

export const DEFAULT_CHART_OF_ACCOUNTS = [
  // Cash & Bank
  { id: 'LED-001', name: 'Front Desk Cash Drawer', group: 'Cash-in-hand', balance: 24500.00, type: 'Dr' },
  { id: 'LED-002', name: 'Hotel Petty Cash Safe', group: 'Cash-in-hand', balance: 5000.00, type: 'Dr' },
  { id: 'LED-003', name: 'SBI Current A/c 49281', group: 'Bank Accounts', balance: 485200.00, type: 'Dr' },
  { id: 'LED-004', name: 'HDFC Merchant POS Settlement', group: 'Bank Accounts', balance: 134100.00, type: 'Dr' },
  { id: 'LED-005', name: 'PhonePe Merchant UPI QR', group: 'Bank Accounts', balance: 92450.00, type: 'Dr' },
  
  // Sundry Debtors (Receivables)
  { id: 'LED-010', name: 'Ashok Leyland Limited', group: 'Sundry Debtors', balance: 214500.00, type: 'Dr' },
  { id: 'LED-011', name: 'JK Paper Mills Ltd', group: 'Sundry Debtors', balance: 142000.00, type: 'Dr' },
  { id: 'LED-012', name: 'GAIL (India) Limited', group: 'Sundry Debtors', balance: 88500.00, type: 'Dr' },
  { id: 'LED-013', name: 'IMFA Therubali Division', group: 'Sundry Debtors', balance: 65000.00, type: 'Dr' },
  { id: 'LED-014', name: 'Guest Room Folio Ledger (In-House)', group: 'Sundry Debtors', balance: 34875.00, type: 'Dr' },
  
  // Sundry Creditors (Suppliers / Vendors)
  { id: 'LED-020', name: 'Rayagada Mandi Fresh Vegetables', group: 'Sundry Creditors', balance: 18400.00, type: 'Cr' },
  { id: 'LED-021', name: 'Sahu Dairy Milk & Paneer Depot', group: 'Sundry Creditors', balance: 12250.00, type: 'Cr' },
  { id: 'LED-022', name: 'ECoR Steam Laundry Contractors', group: 'Sundry Creditors', balance: 15600.00, type: 'Cr' },
  { id: 'LED-023', name: 'HPCL Commercial Gas Agency', group: 'Sundry Creditors', balance: 8900.00, type: 'Cr' },
  { id: 'LED-024', name: 'Sri Sai Linen & Guest Amenities', group: 'Sundry Creditors', balance: 24000.00, type: 'Cr' },

  // Direct Incomes
  { id: 'LED-030', name: 'Room Accommodation Revenue (SAC 996311)', group: 'Direct Incomes', balance: 1485000.00, type: 'Cr' },
  { id: 'LED-031', name: 'Cannon Restaurant Dining (SAC 996331)', group: 'Direct Incomes', balance: 412500.00, type: 'Cr' },
  { id: 'LED-032', name: 'Banquet & Conference Hall Revenue', group: 'Direct Incomes', balance: 195000.00, type: 'Cr' },

  // Expenses
  { id: 'LED-040', name: 'Kitchen Raw Materials & Groceries', group: 'Direct Expenses', balance: 185000.00, type: 'Dr' },
  { id: 'LED-041', name: 'Diesel Generator Fuel & Oil', group: 'Indirect Expenses', balance: 42500.00, type: 'Dr' },
  { id: 'LED-042', name: 'Hotel Electricity Bills (TPCODL)', group: 'Indirect Expenses', balance: 89400.00, type: 'Dr' },
  { id: 'LED-043', name: 'Staff Salaries & Overtime Wages', group: 'Indirect Expenses', balance: 345000.00, type: 'Dr' },

  // Duties & Taxes
  { id: 'LED-050', name: 'Output Central GST 2.5%', group: 'Duties & Taxes', balance: 28400.00, type: 'Cr' },
  { id: 'LED-051', name: 'Output State GST 2.5%', group: 'Duties & Taxes', balance: 28400.00, type: 'Cr' },
  { id: 'LED-052', name: 'Input Tax Credit CGST (Purchases)', group: 'Duties & Taxes', balance: 14200.00, type: 'Dr' },
  { id: 'LED-053', name: 'Input Tax Credit SGST (Purchases)', group: 'Duties & Taxes', balance: 14200.00, type: 'Dr' },
  { id: 'LED-054', name: 'TDS Payable u/s 194C / 194J', group: 'Duties & Taxes', balance: 6500.00, type: 'Cr' }
];

export const INITIAL_DAYBOOK_VOUCHERS = [
  {
    voucherNo: 'HSI/RCP/2627-0481',
    type: 'Receipt',
    typeCode: 'F6',
    date: '2026-09-26',
    refNo: 'ROOM-301-SETTLE',
    narration: 'Settlement of Room 301 (Mr. P Ashok) CP Package bill FMBIL2627-01499 via PhonePe UPI',
    lines: [
      { drCr: 'Dr', ledgerId: 'LED-005', ledgerName: 'PhonePe Merchant UPI QR', amount: 10588.60 },
      { drCr: 'Cr', ledgerId: 'LED-030', ledgerName: 'Room Accommodation Revenue (SAC 996311)', amount: 9003.91 },
      { drCr: 'Cr', ledgerId: 'LED-031', ledgerName: 'Cannon Restaurant Dining (SAC 996331)', amount: 1080.47 },
      { drCr: 'Cr', ledgerId: 'LED-050', ledgerName: 'Output Central GST 2.5%', amount: 252.11 },
      { drCr: 'Cr', ledgerId: 'LED-051', ledgerName: 'Output State GST 2.5%', amount: 252.11 }
    ]
  },
  {
    voucherNo: 'HSI/CNT/2627-0104',
    type: 'Contra',
    typeCode: 'F4',
    date: '2026-09-26',
    refNo: 'BANK-DEP-0926',
    narration: 'Cash deposit from Front Desk cash drawer into SBI Current A/c (Denom: 500x30, 200x25)',
    lines: [
      { drCr: 'Dr', ledgerId: 'LED-003', ledgerName: 'SBI Current A/c 49281', amount: 20000.00 },
      { drCr: 'Cr', ledgerId: 'LED-001', ledgerName: 'Front Desk Cash Drawer', amount: 20000.00 }
    ]
  },
  {
    voucherNo: 'HSI/PAY/2627-0312',
    type: 'Payment',
    typeCode: 'F5',
    date: '2026-09-25',
    refNo: 'MANDI-SEPT-W4',
    narration: 'Payment to Rayagada Mandi for morning delivery of fresh vegetables & potatoes',
    lines: [
      { drCr: 'Dr', ledgerId: 'LED-020', ledgerName: 'Rayagada Mandi Fresh Vegetables', amount: 3450.00 },
      { drCr: 'Cr', ledgerId: 'LED-002', ledgerName: 'Hotel Petty Cash Safe', amount: 3450.00 }
    ]
  },
  {
    voucherNo: 'HSI/JRN/2627-0089',
    type: 'Journal',
    typeCode: 'F7',
    date: '2026-09-25',
    refNo: 'ASHOK-TDS-ADJ',
    narration: 'TDS Deduction 2% by Ashok Leyland Ltd on corporate conference catering bill u/s 194C',
    lines: [
      { drCr: 'Dr', ledgerId: 'LED-054', ledgerName: 'TDS Payable u/s 194C / 194J', amount: 4290.00 },
      { drCr: 'Cr', ledgerId: 'LED-010', ledgerName: 'Ashok Leyland Limited', amount: 4290.00 }
    ]
  }
];

export default function TallyConsoleModal({ 
  isOpen = true, 
  onClose, 
  isEmbedded = false, 
  onToggleFullscreen 
}) {
  // Navigation: 'gateway', 'voucher-entry', 'day-book', 'chart-of-accounts', 'tally-export'
  const [currentView, setCurrentView] = useState('gateway');
  const [voucherType, setVoucherType] = useState('Receipt'); // 'Contra', 'Payment', 'Receipt', 'Journal', 'Sales', 'Purchase'
  const [voucherDate, setVoucherDate] = useState('2026-09-26');
  const [voucherNarration, setVoucherNarration] = useState('');
  const [voucherRef, setVoucherRef] = useState('');
  
  // Authentic Mysoft Universal Date Range Selector States
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [filterFromDate, setFilterFromDate] = useState(todayStr);
  const [filterToDate, setFilterToDate] = useState(todayStr);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  // Ledger and Vouchers list
  const [ledgers, setLedgers] = useState(DEFAULT_CHART_OF_ACCOUNTS);
  const [vouchers, setVouchers] = useState(INITIAL_DAYBOOK_VOUCHERS);
  const [selectedVoucherForView, setSelectedVoucherForView] = useState(null);

  const parseDateToIso = (dStr) => {
    if (!dStr || typeof dStr !== 'string') return null;
    if (dStr.includes('/')) {
      const parts = dStr.split(' ')[0].split('/');
      if (parts.length === 3) {
        return parts[0].length === 4 ? `${parts[0]}-${parts[1]}-${parts[2]}` : `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } else if (dStr.includes('T')) {
      return dStr.split('T')[0];
    } else if (dStr.includes('-')) {
      return dStr.split(' ')[0];
    }
    return null;
  };

  const isDateInRange = (dStr) => {
    const iso = parseDateToIso(dStr);
    if (!iso) return true;
    return iso >= filterFromDate && iso <= filterToDate;
  };

  const filteredVouchers = useMemo(() => {
    if (!isDateFilterActive) return vouchers;
    return vouchers.filter(v => isDateInRange(v.date));
  }, [vouchers, isDateFilterActive, filterFromDate, filterToDate]);

  const totalVoucherDebit = useMemo(() => {
    return filteredVouchers.reduce((sum, v) => {
      const drSum = v.lines.filter(l => l.drCr === 'Dr').reduce((s, l) => s + (l.amount || 0), 0);
      return sum + drSum;
    }, 0);
  }, [filteredVouchers]);

  // Voucher Grid Rows
  const [voucherRows, setVoucherRows] = useState([
    { id: 1, drCr: 'Dr', ledgerId: 'LED-005', amount: '' },
    { id: 2, drCr: 'Cr', ledgerId: 'LED-030', amount: '' }
  ]);

  // Inline Fast Ledger Creation (Alt + C)
  const [isQuickLedgerOpen, setIsQuickLedgerOpen] = useState(false);
  const [quickLedgerForm, setQuickLedgerForm] = useState({
    name: '',
    group: 'Sundry Creditors',
    openingBalance: 0,
    type: 'Cr'
  });

  const [notification, setNotification] = useState('');

  // Live Cloudflare D1 Synchronization for Tally Master Ledgers and Vouchers
  useEffect(() => {
    if (!isOpen && !isEmbedded) return;
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      headers: { 'X-Admin-Key': adminPin }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          if (Array.isArray(data.data.tallyLedgers) && data.data.tallyLedgers.length > 0) {
            const mappedLedgers = data.data.tallyLedgers.map(l => ({
              id: l.ledger_id || l.id,
              name: l.ledger_name || l.name,
              group: l.group_name || l.group,
              balance: Number(l.current_balance !== undefined ? l.current_balance : l.balance) || 0,
              type: l.balance_type || l.type || 'Dr'
            }));
            setLedgers(mappedLedgers);
          }
          if (Array.isArray(data.data.tallyVouchers) && data.data.tallyVouchers.length > 0) {
            const mappedVouchers = data.data.tallyVouchers.map(v => ({
              voucherNo: v.voucher_no || v.voucherNo,
              type: v.voucher_type || v.type,
              typeCode: v.type_code || v.typeCode,
              date: v.voucher_date || v.date,
              refNo: v.ref_no || v.refNo || '',
              narration: v.narration || '',
              lines: []
            }));
            setVouchers(mappedVouchers);
          }
        }
      })
      .catch(err => console.debug('Offline Tally D1 sync:', err));
  }, [isOpen, isEmbedded]);

  // Keyboard Navigation Handling (Tally ERP 9 / TallyPrime Hotkeys)
  useEffect(() => {
    if (!isOpen && !isEmbedded) return;

    const handleKeyDown = (e) => {
      // Escape: Step back or exit
      if (e.key === 'Escape') {
        if (isQuickLedgerOpen) {
          setIsQuickLedgerOpen(false);
        } else if (currentView !== 'gateway') {
          setCurrentView('gateway');
        } else {
          onClose();
        }
        return;
      }

      // Alt + C: Instant Ledger Creation
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsQuickLedgerOpen(true);
        return;
      }

      // Alt + A: Add Row
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleAddRow();
        return;
      }

      // Function keys for Voucher Types
      if (e.key === 'F4') {
        e.preventDefault();
        openVoucherEntry('Contra');
      } else if (e.key === 'F5') {
        e.preventDefault();
        openVoucherEntry('Payment');
      } else if (e.key === 'F6') {
        e.preventDefault();
        openVoucherEntry('Receipt');
      } else if (e.key === 'F7') {
        e.preventDefault();
        openVoucherEntry('Journal');
      } else if (e.key === 'F8') {
        e.preventDefault();
        openVoucherEntry('Sales');
      } else if (e.key === 'F9') {
        e.preventDefault();
        openVoucherEntry('Purchase');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentView, isQuickLedgerOpen, voucherRows]);

  const openVoucherEntry = (type) => {
    setVoucherType(type);
    setCurrentView('voucher-entry');
    setVoucherNarration('');
    setVoucherRef(`REF-${Date.now().toString().slice(-6)}`);
    
    // Default sensible rows based on voucher type
    if (type === 'Contra') {
      setVoucherRows([
        { id: 1, drCr: 'Dr', ledgerId: 'LED-003', amount: '' }, // SBI
        { id: 2, drCr: 'Cr', ledgerId: 'LED-001', amount: '' }  // Cash
      ]);
    } else if (type === 'Payment') {
      setVoucherRows([
        { id: 1, drCr: 'Dr', ledgerId: 'LED-020', amount: '' }, // Mandi
        { id: 2, drCr: 'Cr', ledgerId: 'LED-002', amount: '' }  // Petty Cash
      ]);
    } else if (type === 'Receipt') {
      setVoucherRows([
        { id: 1, drCr: 'Dr', ledgerId: 'LED-005', amount: '' }, // UPI
        { id: 2, drCr: 'Cr', ledgerId: 'LED-030', amount: '' }  // Room Rev
      ]);
    } else {
      setVoucherRows([
        { id: 1, drCr: 'Dr', ledgerId: ledgers[0]?.id || '', amount: '' },
        { id: 2, drCr: 'Cr', ledgerId: ledgers[1]?.id || '', amount: '' }
      ]);
    }
  };

  const handleAddRow = () => {
    setVoucherRows(prev => [
      ...prev,
      { id: Date.now(), drCr: prev.length % 2 === 0 ? 'Dr' : 'Cr', ledgerId: ledgers[0]?.id || '', amount: '' }
    ]);
  };

  const handleRemoveRow = (id) => {
    if (voucherRows.length <= 2) {
      setNotification('A double-entry voucher must contain at least 2 rows (Dr and Cr).');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    setVoucherRows(prev => prev.filter(r => r.id !== id));
  };

  const handleRowChange = (id, field, value) => {
    setVoucherRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Calculations: Debit vs Credit
  const totalDebit = voucherRows
    .filter(r => r.drCr === 'Dr')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalCredit = voucherRows
    .filter(r => r.drCr === 'Cr')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSaveVoucher = (e) => {
    e.preventDefault();
    if (!isBalanced) {
      setNotification(`Cannot post voucher! Debit (₹${totalDebit.toFixed(2)}) must equal Credit (₹${totalCredit.toFixed(2)}). Difference: ₹${difference.toFixed(2)}`);
      setTimeout(() => setNotification(''), 4500);
      return;
    }

    const typePrefix = {
      Contra: 'CNT',
      Payment: 'PAY',
      Receipt: 'RCP',
      Journal: 'JRN',
      Sales: 'SLS',
      Purchase: 'PUR'
    }[voucherType] || 'VCH';

    const newVoucher = {
      voucherNo: `HSI/${typePrefix}/2627-${String(vouchers.length + 1).padStart(4, '0')}`,
      type: voucherType,
      typeCode: { Contra: 'F4', Payment: 'F5', Receipt: 'F6', Journal: 'F7', Sales: 'F8', Purchase: 'F9' }[voucherType],
      date: voucherDate,
      refNo: voucherRef || `REF-${Date.now().toString().slice(-4)}`,
      narration: voucherNarration || `${voucherType} entry posted on ${voucherDate}`,
      lines: voucherRows.map(r => {
        const lObj = ledgers.find(l => l.id === r.ledgerId);
        return {
          drCr: r.drCr,
          ledgerId: r.ledgerId,
          ledgerName: lObj?.name || 'Ledger',
          amount: Number(r.amount) || 0
        };
      })
    };

    setVouchers([newVoucher, ...vouchers]);

    // Dispatch double-entry balanced voucher to Cloudflare D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'save_tally_voucher',
        payload: {
          voucher_no: newVoucher.voucherNo,
          voucher_type: newVoucher.type,
          type_code: newVoucher.typeCode,
          voucher_date: newVoucher.date,
          ref_no: newVoucher.refNo,
          narration: newVoucher.narration,
          total_debit: totalDebit,
          total_credit: totalCredit,
          is_balanced: 1,
          lines: newVoucher.lines.map((l, idx) => ({
            line_id: `${newVoucher.voucherNo}-L${idx + 1}`,
            dr_cr: l.drCr,
            ledger_id: l.ledgerId,
            ledger_name: l.ledgerName,
            amount: l.amount
          }))
        }
      })
    }).catch(err => console.warn('Tally voucher cloud sync error:', err));

    setNotification(`✓ Voucher ${newVoucher.voucherNo} posted successfully! Synced to D1 tally_vouchers.`);
    setTimeout(() => setNotification(''), 4000);
    setCurrentView('day-book');
  };

  const handleSaveQuickLedger = (e) => {
    e.preventDefault();
    if (!quickLedgerForm.name.trim()) return;

    const newLedger = {
      id: `LED-${String(ledgers.length + 1).padStart(3, '0')}`,
      name: quickLedgerForm.name.trim(),
      group: quickLedgerForm.group,
      balance: Number(quickLedgerForm.openingBalance) || 0,
      type: quickLedgerForm.type
    };

    setLedgers([...ledgers, newLedger]);

    // Dispatch Master Ledger to Cloudflare D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'save_tally_ledger',
        payload: {
          ledger_id: newLedger.id,
          ledger_name: newLedger.name,
          group_name: newLedger.group,
          opening_balance: newLedger.balance,
          current_balance: newLedger.balance,
          balance_type: newLedger.type
        }
      })
    }).catch(err => console.warn('Tally ledger cloud sync error:', err));

    setIsQuickLedgerOpen(false);
    setQuickLedgerForm({ name: '', group: 'Sundry Creditors', openingBalance: 0, type: 'Cr' });
    setNotification(`✓ Created Master Ledger: ${newLedger.name} under ${newLedger.group}. Synced to D1 tally_ledgers.`);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleExportTallyXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters and Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${HOTEL_CONFIG.legalName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <!-- LEDGER MASTERS -->
        ${ledgers.map(l => `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${l.name}" ACTION="Create">
            <NAME>${l.name}</NAME>
            <PARENT>${l.group}</PARENT>
            <OPENINGBALANCE>${l.type === 'Cr' ? '-' : ''}${l.balance}</OPENINGBALANCE>
            <ISBILLWISEON>Yes</ISBILLWISEON>
          </LEDGER>
        </TALLYMESSAGE>`).join('')}

        <!-- DAYBOOK VOUCHERS -->
        ${filteredVouchers.map(v => `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${v.type}" ACTION="Create">
            <DATE>${v.date.replace(/-/g, '')}</DATE>
            <VOUCHERTYPENAME>${v.type}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${v.voucherNo}</VOUCHERNUMBER>
            <REFERENCE>${v.refNo}</REFERENCE>
            <NARRATION>${v.narration}</NARRATION>
            ${v.lines.map(line => `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${line.ledgerName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${line.drCr === 'Dr' ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${line.drCr === 'Cr' ? '' : '-'}${line.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`).join('')}
          </VOUCHER>
        </TALLYMESSAGE>`).join('')}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TallyPrime_Export_HotelSai_${new Date().toISOString().slice(0,10)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotification('✓ TallyPrime XML export generated! Ready for direct import via Gateway of Tally -> Import Data.');
    setTimeout(() => setNotification(''), 5000);
  };

  if (!isOpen && !isEmbedded) return null;

  const terminalContent = (
    <div style={{
      width: '100%',
      maxWidth: isEmbedded ? '100%' : 1280,
      height: isEmbedded ? 'auto' : '92vh',
      minHeight: isEmbedded ? '800px' : undefined,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '12px',
      border: '2px solid #0284c7',
      backgroundColor: '#0a192f',
      color: '#e2e8f0',
      boxShadow: isEmbedded ? '0 10px 40px rgba(0,0,0,0.6)' : '0 25px 80px rgba(0,0,0,0.95)',
      overflow: 'hidden',
      fontFamily: "'Courier New', Courier, monospace"
    }}>
      {/* Tally Prime Style Top Header */}
      <div style={{
        backgroundColor: '#0369a1',
        padding: '0.6rem 1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '0.9rem',
        borderBottom: '2px solid #38bdf8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ backgroundColor: '#f59e0b', color: '#000', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900 }}>
            TALLY PRIME CONSOLE
          </span>
          <span>Gateway of Tally • {HOTEL_CONFIG.legalName} • FY 2026-2027</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#bae6fd', fontFamily: 'sans-serif' }}>
            Hotkeys: <kbd style={{ background: '#075985', padding: '0.1rem 0.3rem', borderRadius: 3 }}>F4-F9</kbd> Vouchers • <kbd style={{ background: '#075985', padding: '0.1rem 0.3rem', borderRadius: 3 }}>Alt+C</kbd> New Ledger • <kbd style={{ background: '#075985', padding: '0.1rem 0.3rem', borderRadius: 3 }}>Esc</kbd> Back
          </span>
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                padding: '3px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Open Tally Prime in Fullscreen Terminal Window"
            >
              ⛶ Fullscreen
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                width: 28,
                height: 28,
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Console"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

        {/* Action Notification Bar */}
        {notification && (
          <div style={{
            backgroundColor: notification.startsWith('✓') ? '#065f46' : '#991b1b',
            color: '#fff',
            padding: '0.45rem 1.2rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={14} /> {notification}
          </div>
        )}

        {/* Function Keys Navigation Bar (F1 - F10) */}
        <div style={{
          backgroundColor: '#072448',
          borderBottom: '1px solid #1e3a8a',
          padding: '0.4rem 1rem',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setCurrentView('gateway')}
            style={{
              background: currentView === 'gateway' ? '#0284c7' : '#0f172a',
              color: '#fff',
              border: '1px solid #38bdf8',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🏠 Gateway
          </button>

          <button
            onClick={() => openVoucherEntry('Contra')}
            style={{
              background: currentView === 'voucher-entry' && voucherType === 'Contra' ? '#0284c7' : '#0f172a',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            F4 Contra
          </button>

          <button
            onClick={() => openVoucherEntry('Payment')}
            style={{
              background: currentView === 'voucher-entry' && voucherType === 'Payment' ? '#0284c7' : '#0f172a',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            F5 Payment
          </button>

          <button
            onClick={() => openVoucherEntry('Receipt')}
            style={{
              background: currentView === 'voucher-entry' && voucherType === 'Receipt' ? '#0284c7' : '#0f172a',
              color: '#10b981',
              border: '1px solid #10b981',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            F6 Receipt
          </button>

          <button
            onClick={() => openVoucherEntry('Journal')}
            style={{
              background: currentView === 'voucher-entry' && voucherType === 'Journal' ? '#0284c7' : '#0f172a',
              color: '#f59e0b',
              border: '1px solid #f59e0b',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            F7 Journal
          </button>

          <button
            onClick={() => openVoucherEntry('Sales')}
            style={{
              background: currentView === 'voucher-entry' && voucherType === 'Sales' ? '#0284c7' : '#0f172a',
              color: '#c084fc',
              border: '1px solid #c084fc',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            F8 Sales
          </button>

          <button
            onClick={() => openVoucherEntry('Purchase')}
            style={{
              background: currentView === 'voucher-entry' && voucherType === 'Purchase' ? '#0284c7' : '#0f172a',
              color: '#fb923c',
              border: '1px solid #fb923c',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            F9 Purchase
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => setCurrentView('day-book')}
            style={{
              background: currentView === 'day-book' ? '#0284c7' : '#0f172a',
              color: '#fef08a',
              border: '1px solid #facc15',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📅 Day Book ({vouchers.length})
          </button>

          <button
            onClick={() => setCurrentView('chart-of-accounts')}
            style={{
              background: currentView === 'chart-of-accounts' ? '#0284c7' : '#0f172a',
              color: '#e2e8f0',
              border: '1px solid #64748b',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📊 Chart of Accounts ({ledgers.length})
          </button>

          <button
            onClick={handleExportTallyXml}
            style={{
              background: '#047857',
              color: '#fff',
              border: '1px solid #10b981',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Download size={13} /> Export Tally XML
          </button>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
          
          {/* VIEW 1: GATEWAY OF TALLY */}
          {currentView === 'gateway' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: '100%' }}>
              {/* Left Pane: Company Information */}
              <div style={{ border: '1px solid #1e3a8a', backgroundColor: '#07162c', borderRadius: 8, padding: '1.2rem' }}>
                <div style={{ borderBottom: '1px solid #1e3a8a', paddingBottom: '0.6rem', marginBottom: '1rem', color: '#38bdf8', fontWeight: 700 }}>
                  CURRENT COMPANY DETAILS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: '0.6rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Company Name:</span>
                  <strong style={{ color: '#fef08a' }}>{HOTEL_CONFIG.legalName}</strong>

                  <span style={{ color: '#94a3b8' }}>GSTIN:</span>
                  <strong style={{ color: '#34d399' }}>{HOTEL_CONFIG.gstin}</strong>

                  <span style={{ color: '#94a3b8' }}>State:</span>
                  <span>Odisha (State Code: 21)</span>

                  <span style={{ color: '#94a3b8' }}>Financial Year:</span>
                  <span>1-Apr-2026 to 31-Mar-2027</span>

                  <span style={{ color: '#94a3b8' }}>Books Beginning:</span>
                  <span>1-Apr-2026</span>

                  <span style={{ color: '#94a3b8' }}>Last Voucher Date:</span>
                  <strong style={{ color: '#38bdf8' }}>{vouchers[0]?.date || '2026-09-26'}</strong>

                  <span style={{ color: '#94a3b8' }}>Total Vouchers:</span>
                  <span>{vouchers.length} Posted</span>

                  <span style={{ color: '#94a3b8' }}>Active Ledgers:</span>
                  <span>{ledgers.length} Accounts in Chart</span>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '0.8rem', backgroundColor: '#0b2447', borderRadius: 6, border: '1px solid #1d4ed8' }}>
                  <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    ⚡ QUICK SPEED ENTRY TIPS
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    <li>Press <strong>F4</strong> to record a cash-to-bank deposit or withdrawal</li>
                    <li>Press <strong>F6</strong> to settle a guest room stay or Cannon dining bill</li>
                    <li>Press <strong>F5</strong> to record vendor mandi or laundry petty cash payments</li>
                    <li>Press <strong>Alt + C</strong> inside any voucher row to create a new ledger immediately</li>
                    <li>Download the <strong>Tally XML file</strong> to directly sync your accounts into desktop TallyPrime!</li>
                  </ul>
                </div>
              </div>

              {/* Right Pane: Classic Gateway Menu Box */}
              <div style={{
                border: '2px solid #0284c7',
                backgroundColor: '#0c2240',
                borderRadius: 8,
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  backgroundColor: '#0369a1',
                  color: '#fff',
                  textAlign: 'center',
                  padding: '0.4rem',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  borderRadius: 4,
                  marginBottom: '1rem'
                }}>
                  GATEWAY OF TALLY
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {/* Masters Section */}
                  <div>
                    <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1px dashed #334155', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                      MASTERS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.8rem' }}>
                      <button 
                        onClick={() => setCurrentView('chart-of-accounts')}
                        style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.2rem 0' }}
                        onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
                        onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 900 }}>A</span>ccounts Info (Chart of Accounts)
                      </button>
                      <button 
                        onClick={() => setIsQuickLedgerOpen(true)}
                        style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.2rem 0' }}
                        onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
                        onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 900 }}>L</span>edger Creation (Alt + C)
                      </button>
                    </div>
                  </div>

                  {/* Transactions Section */}
                  <div>
                    <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1px dashed #334155', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                      TRANSACTIONS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.8rem' }}>
                      <button 
                        onClick={() => openVoucherEntry('Receipt')}
                        style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.2rem 0' }}
                        onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
                        onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 900 }}>V</span>ouchers Entry (F4 - F9)
                      </button>
                      <button 
                        onClick={() => openVoucherEntry('Contra')}
                        style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.2rem 0' }}
                        onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
                        onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 900 }}>C</span>ontra Bank / Cash Transfer (F4)
                      </button>
                    </div>
                  </div>

                  {/* Reports Section */}
                  <div>
                    <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1px dashed #334155', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                      REPORTS & UTILITIES
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.8rem' }}>
                      <button 
                        onClick={() => setCurrentView('day-book')}
                        style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.2rem 0' }}
                        onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
                        onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 900 }}>D</span>ay Book (Daily Journal)
                      </button>
                      <button 
                        onClick={handleExportTallyXml}
                        style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.2rem 0' }}
                        onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
                        onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 900 }}>E</span>xport to TallyPrime XML
                      </button>
                      <button 
                        onClick={onClose}
                        style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.2rem 0' }}
                        onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
                        onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 900 }}>Q</span>uit (Esc)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: VOUCHER ENTRY (F4 - F9) */}
          {currentView === 'voucher-entry' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
              {/* Voucher Header Strip */}
              <div style={{
                backgroundColor: '#0c2240',
                border: '1px solid #0284c7',
                borderRadius: 6,
                padding: '0.75rem 1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{
                    backgroundColor: voucherType === 'Payment' ? '#ef4444' : voucherType === 'Receipt' ? '#10b981' : voucherType === 'Contra' ? '#0284c7' : '#f59e0b',
                    color: '#fff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 4,
                    fontWeight: 900,
                    fontSize: '0.85rem'
                  }}>
                    {voucherType.toUpperCase()} VOUCHER
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Type: <strong style={{ color: '#fff' }}>Accounting Voucher</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Voucher Date:</span>
                    <input 
                      type="date"
                      value={voucherDate}
                      onChange={(e) => setVoucherDate(e.target.value)}
                      style={{
                        backgroundColor: '#07162c',
                        border: '1px solid #38bdf8',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 4,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Ref / Folio:</span>
                    <input 
                      type="text"
                      value={voucherRef}
                      onChange={(e) => setVoucherRef(e.target.value)}
                      placeholder="e.g. ROOM-301 / CASH-DROP"
                      style={{
                        backgroundColor: '#07162c',
                        border: '1px solid #38bdf8',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 4,
                        fontFamily: 'inherit',
                        width: 160
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Double-Entry Voucher Grid */}
              <div style={{
                flex: 1,
                border: '1px solid #1e3a8a',
                borderRadius: 6,
                backgroundColor: '#07162c',
                overflowY: 'auto'
              }}>
                <SheetsToolbarLegend style={{ margin: '0.4rem 0.6rem 0.6rem 0.6rem' }} />
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0c2240', borderBottom: '2px solid #0284c7', color: '#38bdf8' }}>
                      <th style={{ padding: '0.6rem 0.8rem', width: 90 }}><SheetsColumnHeader label="By / To" type="locked" /></th>
                      <th style={{ padding: '0.6rem 0.8rem' }}><SheetsColumnHeader label="Particulars (Account / Ledger)" type="editable" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 140, textAlign: 'right' }}><SheetsColumnHeader label="Debit (₹)" type="editable" align="right" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 140, textAlign: 'right' }}><SheetsColumnHeader label="Credit (₹)" type="editable" align="right" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 70, textAlign: 'center' }}><SheetsColumnHeader label="Act" type="locked" align="center" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucherRows.map((row, idx) => {
                      const selectedLedger = ledgers.find(l => l.id === row.ledgerId);
                      return (
                        <tr key={row.id} style={{ borderBottom: '1px solid #1e293b' }}>
                          {/* By / To Toggle */}
                          <td style={{ padding: '0.5rem 0.8rem' }}>
                            <select
                              value={row.drCr}
                              onChange={(e) => handleRowChange(row.id, 'drCr', e.target.value)}
                              style={{
                                backgroundColor: row.drCr === 'Dr' ? '#1e3a8a' : '#14532d',
                                color: '#fff',
                                border: '1px solid #38bdf8',
                                padding: '0.25rem 0.4rem',
                                borderRadius: 4,
                                fontWeight: 700,
                                fontFamily: 'inherit'
                              }}
                            >
                              <option value="Dr">Dr (By)</option>
                              <option value="Cr">Cr (To)</option>
                            </select>
                          </td>

                          {/* Particulars Ledger Dropdown */}
                          <td style={{ padding: '0.5rem 0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <select
                                value={row.ledgerId}
                                onChange={(e) => handleRowChange(row.id, 'ledgerId', e.target.value)}
                                style={{
                                  backgroundColor: '#0c2240',
                                  border: '1px solid #334155',
                                  color: '#f8fafc',
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: 4,
                                  width: '100%',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {ledgers.map(l => (
                                  <option key={l.id} value={l.id}>
                                    {l.name} [{l.group}] — Bal: ₹{l.balance.toFixed(2)} {l.type}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                title="Quick Create New Ledger (Alt + C)"
                                onClick={() => setIsQuickLedgerOpen(true)}
                                style={{
                                  backgroundColor: '#0369a1',
                                  border: 'none',
                                  color: '#fff',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontSize: '0.72rem',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                + Alt+C
                              </button>
                            </div>
                          </td>

                          {/* Debit Input */}
                          <td style={{ padding: '0.5rem 0.8rem', textAlign: 'right' }}>
                            {row.drCr === 'Dr' ? (
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={row.amount}
                                onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                                style={{
                                  backgroundColor: '#0c2240',
                                  border: '1px solid #38bdf8',
                                  color: '#fff',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: 4,
                                  textAlign: 'right',
                                  width: '100%',
                                  fontFamily: 'inherit',
                                  fontWeight: 700
                                }}
                              />
                            ) : (
                              <span style={{ color: '#475569' }}>—</span>
                            )}
                          </td>

                          {/* Credit Input */}
                          <td style={{ padding: '0.5rem 0.8rem', textAlign: 'right' }}>
                            {row.drCr === 'Cr' ? (
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={row.amount}
                                onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                                style={{
                                  backgroundColor: '#0c2240',
                                  border: '1px solid #10b981',
                                  color: '#fff',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: 4,
                                  textAlign: 'right',
                                  width: '100%',
                                  fontFamily: 'inherit',
                                  fontWeight: 700
                                }}
                              />
                            ) : (
                              <span style={{ color: '#475569' }}>—</span>
                            )}
                          </td>

                          {/* Remove Row */}
                          <td style={{ padding: '0.5rem 0.8rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Row Button & Narration */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleAddRow}
                  style={{
                    backgroundColor: '#1e3a8a',
                    border: '1px solid #38bdf8',
                    color: '#fff',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Plus size={14} /> Add Line (Alt + A)
                </button>

                <div style={{ fontSize: '0.85rem' }}>
                  Press <kbd style={{ background: '#0c2240', border: '1px solid #38bdf8', padding: '0.1rem 0.3rem', borderRadius: 3 }}>Tab</kbd> to move to Narration
                </div>
              </div>

              {/* Narration Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Narration:
                </label>
                <input
                  type="text"
                  placeholder="Being amount received / paid towards..."
                  value={voucherNarration}
                  onChange={(e) => setVoucherNarration(e.target.value)}
                  style={{
                    backgroundColor: '#07162c',
                    border: '1px solid #38bdf8',
                    color: '#fff',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 4,
                    fontFamily: 'inherit',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Footer Balancing Strip & Post Button */}
              <div style={{
                backgroundColor: '#0c2240',
                border: isBalanced ? '1px solid #10b981' : '1px solid #ef4444',
                borderRadius: 6,
                padding: '0.8rem 1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>TOTAL DEBITS</span>
                    <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>₹{totalDebit.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>TOTAL CREDITS</span>
                    <strong style={{ color: '#10b981', fontSize: '1.05rem' }}>₹{totalCredit.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>VARIANCE</span>
                    <strong style={{ color: isBalanced ? '#10b981' : '#ef4444', fontSize: '1.05rem' }}>
                      {isBalanced ? '✓ BALANCED (₹0.00)' : `₹${difference.toFixed(2)} Unbalanced`}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentView('gateway')}
                    style={{
                      backgroundColor: '#334155',
                      border: 'none',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: 4,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel (Esc)
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveVoucher}
                    disabled={!isBalanced}
                    style={{
                      backgroundColor: isBalanced ? '#059669' : '#475569',
                      border: isBalanced ? '1px solid #10b981' : 'none',
                      color: '#fff',
                      padding: '0.5rem 1.4rem',
                      borderRadius: 4,
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      cursor: isBalanced ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <CheckCircle2 size={16} /> Accept & Post Voucher (Enter)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: DAY BOOK */}
          {currentView === 'day-book' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fef08a', fontSize: '1.1rem' }}>
                    DAY BOOK (CHRONOLOGICAL AUDIT JOURNAL)
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                    Double-Entry Vouchers for Hotel Rooms, Restaurant POS, Mandi Purchases & Cash Drops
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    onClick={() => openVoucherEntry('Receipt')}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + New Voucher
                  </button>
                  <button
                    onClick={handleExportTallyXml}
                    style={{
                      backgroundColor: '#047857',
                      color: '#fff',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Download size={13} /> Export XML
                  </button>
                </div>
              </div>

              {/* Authentic Mysoft Universal Date Range Selector Bar (Screenshot Identical) */}
              <UniversalDateFilterBar
                fromDate={filterFromDate}
                toDate={filterToDate}
                moduleType="daybook"
                auditItems={filteredVouchers.flatMap(v => (v.lines || []).map(l => ({
                  voucherNo: v.voucherNo,
                  date: v.date,
                  type: l.drCr === 'Dr' ? 'debit' : 'credit',
                  drCr: l.drCr,
                  accountHead: l.ledgerName,
                  particulars: `${v.type} - ${l.ledgerName}`,
                  amount: l.amount,
                  balance: l.amount
                })))}
                onDateChange={(from, to) => {
                  setFilterFromDate(from);
                  setFilterToDate(to);
                }}
                onDisplay={(from, to) => {
                  setFilterFromDate(from);
                  setFilterToDate(to);
                  setIsDateFilterActive(true);
                }}
                title="TALLY PRIME AUDIT JOURNAL"
                totalCount={filteredVouchers.length}
                totalAmount={totalVoucherDebit}
                onExportCSV={() => {
                  const csv = "Date,VoucherNo,Type,Ledger,DrCr,Amount\n" +
                    filteredVouchers.flatMap(v => v.lines.map(l => `"${v.date}","${v.voucherNo}","${v.type}","${l.ledgerName}","${l.drCr}",${l.amount}`)).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Tally_DayBook_${filterFromDate}_to_${filterToDate}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                onPrint={() => window.print()}
                compact={true}
              />

              {/* Day Book Table */}
              <div style={{
                flex: 1,
                border: '1px solid #1e3a8a',
                borderRadius: 6,
                backgroundColor: '#07162c',
                overflowY: 'auto'
              }}>
                <SheetsToolbarLegend style={{ margin: '0.4rem 0.6rem 0.6rem 0.6rem' }} />
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0c2240', borderBottom: '2px solid #0284c7', color: '#38bdf8' }}>
                      <th style={{ padding: '0.6rem 0.8rem', width: 110 }}><SheetsColumnHeader label="Date" type="editable" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 160 }}><SheetsColumnHeader label="Voucher No" type="locked" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 90 }}><SheetsColumnHeader label="Type" type="locked" /></th>
                      <th style={{ padding: '0.6rem 0.8rem' }}><SheetsColumnHeader label="Particulars / Ledger Breakdown" type="locked" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 120, textAlign: 'right' }}><SheetsColumnHeader label="Total (₹)" type="formula" align="right" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVouchers.map(v => {
                      const vTotal = v.lines
                        .filter(l => l.drCr === 'Dr')
                        .reduce((sum, l) => sum + l.amount, 0);

                      return (
                        <tr key={v.voucherNo} style={{ borderBottom: '1px solid #1e293b' }}>
                          <SheetsEditableCell
                            value={v.date}
                            type="text"
                            cellStyle={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}
                            onSave={(newVal) => setVouchers(prev => prev.map(rec => rec.voucherNo === v.voucherNo ? { ...rec, date: newVal } : rec))}
                          />
                          <td style={{ padding: '0.6rem 0.8rem', color: '#38bdf8', fontWeight: 700 }}>{v.voucherNo}</td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <span style={{
                              backgroundColor: v.type === 'Payment' ? '#991b1b' : v.type === 'Receipt' ? '#065f46' : v.type === 'Contra' ? '#0369a1' : '#78350f',
                              color: '#fff',
                              padding: '0.15rem 0.4rem',
                              borderRadius: 3,
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              {v.type} ({v.typeCode})
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {v.lines.map((l, lIdx) => (
                                <div key={lIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                                  <span style={{ color: l.drCr === 'Dr' ? '#93c5fd' : '#86efac' }}>
                                    {l.drCr} <strong>{l.ledgerName}</strong>
                                  </span>
                                  <span style={{ color: '#cbd5e1' }}>₹{l.amount.toFixed(2)}</span>
                                </div>
                              ))}
                              <div style={{ marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Narration:</span>
                                <SheetsEditableCell
                                  value={v.narration || 'General Operational Expense'}
                                  type="text"
                                  tag="span"
                                  cellStyle={{ color: '#94a3b8', fontSize: '0.72rem', fontStyle: 'italic' }}
                                  onSave={(newVal) => setVouchers(prev => prev.map(rec => rec.voucherNo === v.voucherNo ? { ...rec, narration: newVal } : rec))}
                                />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 900, color: '#fef08a' }}>
                            ₹{vTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 4: CHART OF ACCOUNTS */}
          {currentView === 'chart-of-accounts' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>
                    CHART OF ACCOUNTS (LEDGER MASTERS)
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                    All 28 Primary & Secondary Ledger Accounts for {HOTEL_CONFIG.name}
                  </p>
                </div>

                <button
                  onClick={() => setIsQuickLedgerOpen(true)}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Plus size={14} /> New Ledger (Alt + C)
                </button>
              </div>

              {/* Accounts Table */}
              <div style={{
                flex: 1,
                border: '1px solid #1e3a8a',
                borderRadius: 6,
                backgroundColor: '#07162c',
                overflowY: 'auto'
              }}>
                <SheetsToolbarLegend style={{ margin: '0.4rem 0.6rem 0.6rem 0.6rem' }} />
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0c2240', borderBottom: '2px solid #0284c7', color: '#38bdf8' }}>
                      <th style={{ padding: '0.6rem 0.8rem', width: 90 }}><SheetsColumnHeader label="Code" type="locked" /></th>
                      <th style={{ padding: '0.6rem 0.8rem' }}><SheetsColumnHeader label="Ledger Account Name" type="editable" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 180 }}><SheetsColumnHeader label="Parent Group" type="editable" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 140, textAlign: 'right' }}><SheetsColumnHeader label="Closing Balance" type="editable" align="right" /></th>
                      <th style={{ padding: '0.6rem 0.8rem', width: 80, textAlign: 'center' }}><SheetsColumnHeader label="Dr/Cr" type="editable" align="center" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgers.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '0.5rem 0.8rem', color: '#94a3b8' }}>{l.id}</td>
                        <SheetsEditableCell
                          value={l.name}
                          type="text"
                          cellStyle={{ padding: '0.5rem 0.8rem', color: '#fff', fontWeight: 700 }}
                          onSave={(newVal) => setLedgers(prev => prev.map(rec => rec.id === l.id ? { ...rec, name: newVal } : rec))}
                        />
                        <SheetsEditableCell
                          value={l.group}
                          type="text"
                          cellStyle={{ padding: '0.5rem 0.8rem', color: '#f59e0b' }}
                          onSave={(newVal) => setLedgers(prev => prev.map(rec => rec.id === l.id ? { ...rec, group: newVal } : rec))}
                        />
                        <SheetsEditableCell
                          value={l.balance}
                          type="number"
                          cellStyle={{ padding: '0.5rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#f8fafc' }}
                          onSave={(newVal) => setLedgers(prev => prev.map(rec => rec.id === l.id ? { ...rec, balance: parseFloat(newVal) || 0 } : rec))}
                        />
                        <td style={{ padding: '0.5rem 0.8rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setLedgers(prev => prev.map(rec => rec.id === l.id ? { ...rec, type: rec.type === 'Dr' ? 'Cr' : 'Dr' } : rec))}
                            style={{
                              backgroundColor: l.type === 'Dr' ? '#1e3a8a' : '#14532d',
                              color: '#fff',
                              padding: '0.1rem 0.4rem',
                              borderRadius: 3,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Click to toggle Dr / Cr"
                          >
                            {l.type}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* MODAL: QUICK LEDGER CREATION (ALT + C) */}
        {isQuickLedgerOpen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div style={{
              backgroundColor: '#0c2240',
              border: '2px solid #38bdf8',
              borderRadius: 8,
              width: 480,
              padding: '1.4rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #1e3a8a', paddingBottom: '0.5rem' }}>
                <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>LEDGER CREATION (ALT + C)</strong>
                <button onClick={() => setIsQuickLedgerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveQuickLedger} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                    Ledger Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sahu Electrical Repairs"
                    value={quickLedgerForm.name}
                    onChange={(e) => setQuickLedgerForm({ ...quickLedgerForm, name: e.target.value })}
                    style={{
                      backgroundColor: '#07162c',
                      border: '1px solid #38bdf8',
                      color: '#fff',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 4,
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                    Under (Parent Group):
                  </label>
                  <select
                    value={quickLedgerForm.group}
                    onChange={(e) => setQuickLedgerForm({ ...quickLedgerForm, group: e.target.value })}
                    style={{
                      backgroundColor: '#07162c',
                      border: '1px solid #38bdf8',
                      color: '#fff',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 4,
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="Bank Accounts">Bank Accounts</option>
                    <option value="Cash-in-hand">Cash-in-hand</option>
                    <option value="Sundry Debtors">Sundry Debtors (Corporate Clients)</option>
                    <option value="Sundry Creditors">Sundry Creditors (Suppliers / Mandi)</option>
                    <option value="Direct Incomes">Direct Incomes (Room / Food Revenue)</option>
                    <option value="Direct Expenses">Direct Expenses (Raw Materials)</option>
                    <option value="Indirect Expenses">Indirect Expenses (Staff, Electricity)</option>
                    <option value="Duties & Taxes">Duties & Taxes (CGST, SGST, TDS)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.6rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                      Opening Balance (₹):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={quickLedgerForm.openingBalance}
                      onChange={(e) => setQuickLedgerForm({ ...quickLedgerForm, openingBalance: e.target.value })}
                      style={{
                        backgroundColor: '#07162c',
                        border: '1px solid #38bdf8',
                        color: '#fff',
                        padding: '0.4rem 0.6rem',
                        borderRadius: 4,
                        width: '100%',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                      Dr / Cr:
                    </label>
                    <select
                      value={quickLedgerForm.type}
                      onChange={(e) => setQuickLedgerForm({ ...quickLedgerForm, type: e.target.value })}
                      style={{
                        backgroundColor: '#07162c',
                        border: '1px solid #38bdf8',
                        color: '#fff',
                        padding: '0.4rem 0.6rem',
                        borderRadius: 4,
                        width: '100%',
                        fontFamily: 'inherit'
                      }}
                    >
                      <option value="Cr">Cr</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsQuickLedgerOpen(false)}
                    style={{
                      backgroundColor: '#334155',
                      border: 'none',
                      color: '#fff',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#059669',
                      border: 'none',
                      color: '#fff',
                      padding: '0.4rem 1.2rem',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Save Master Ledger
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </div>
  );

  if (isEmbedded) {
    return terminalContent;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 20, 0.95)',
      backdropFilter: 'blur(14px)',
      zIndex: 2100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'Courier New', Courier, monospace"
    }}>
      {terminalContent}
    </div>
  );
}
