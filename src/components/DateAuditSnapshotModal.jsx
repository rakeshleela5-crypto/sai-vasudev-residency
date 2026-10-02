import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, X, Printer, Download, Search, CheckCircle2, 
  AlertTriangle, Bed, User, Building, Phone, Clock, FileSpreadsheet,
  IndianRupee, ShieldCheck, ArrowRight, RefreshCw, Eye, Utensils,
  ShoppingBag, Wrench, FileText, Database, Layers, TrendingUp, CreditCard,
  Check, Filter, Edit3, DollarSign, Package, Sparkles
} from 'lucide-react';
import { SheetsColumnHeader, SheetsToolbarLegend, SheetsEditableCell } from './UniversalInlineEditor';

/**
 * DateAuditSnapshotModal (Universal Context-Aware Pop View with Live Two-Way Inline Editing)
 * Enterprise-grade modal that pops up whenever [ Display ] is clicked
 * on the UniversalDateFilterBar across ANY module or tab in the project.
 * Automatically adapts its KPI cards, columns, and Google Sheets interactive table to match
 * the exact context (Rooms, Police Register, Cashier Settlements, GST Tax,
 * Day Book, Mandi Store, Kitchen POS, Maintenance, Transit Day-Use, Lost & Found,
 * Shift Logbook, Housekeeping, Linen Par Stock, Staff Payroll, Corporate B2B, or D1 Database).
 * 
 * Features:
 * - Direct single-click inline editing via SheetsEditableCell
 * - Two-way state synchronization back to the parent component
 * - Live KPI metric updates upon cell edit
 * - Column header badges (EDIT ✏️, FX ⚡, LOCK 🔒)
 * - Search across all fields, CSV export, and Print
 */
export default function DateAuditSnapshotModal({
  isOpen,
  onClose,
  fromDate,
  toDate,
  title = "REAL-TIME AUDIT WINDOW SNAPSHOT",
  subtitle = "",
  moduleType = null,
  rooms = [],
  auditItems = null,
  columns = null,
  kpis = null,
  totalCount = null,
  totalAmount = null,
  onExportCSV = null,
  onExportExcel = null,
  onPrint = null,
  onUpdateItem = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localItems, setLocalItems] = useState([]);
  const [editFeedback, setEditFeedback] = useState(null);

  // Synchronize local state whenever auditItems, rooms, or modal open status changes
  useEffect(() => {
    if (auditItems && Array.isArray(auditItems) && auditItems.length > 0) {
      setLocalItems(auditItems);
    } else if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      setLocalItems(rooms);
    } else {
      setLocalItems([]);
    }
  }, [auditItems, rooms, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Format date to Indian format DD/MM/YYYY
  const formatDisplayDate = (dStr) => {
    if (!dStr) return '';
    try {
      const [y, m, d] = dStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dStr;
    } catch {
      return dStr;
    }
  };

  // Compute duration
  const dateDuration = useMemo(() => {
    try {
      const d1 = new Date(fromDate + 'T00:00:00');
      const d2 = new Date(toDate + 'T00:00:00');
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return '1 Day Audit Snapshot (Same-Day View)';
      if (diffDays < 0) return 'Notice: To Date precedes From Date';
      return `${diffDays} Nights / ${diffDays + 1} Days Audit Range`;
    } catch {
      return 'Selected Audit Window';
    }
  }, [fromDate, toDate]);

  // Determine effective module type strictly based on active context
  const effectiveModule = useMemo(() => {
    if (moduleType) return moduleType.toLowerCase();
    const t = (title || '').toLowerCase();
    if (t.includes('police')) return 'police';
    if (t.includes('cashier') || t.includes('settlement')) return 'cashier';
    if (t.includes('gst') || t.includes('tax')) return 'gst';
    if (t.includes('day-book') || t.includes('day book') || t.includes('petty cash')) return 'daybook';
    if (t.includes('vendor')) return 'store-vendors';
    if (t.includes('recipe') || t.includes('bom')) return 'store-bom';
    if (t.includes('corp') || t.includes('city ledger')) return 'corporate';
    if (t.includes('kitchen') || t.includes('kds') || t.includes('pos') || t.includes('food')) return 'pos';
    if (t.includes('store') || t.includes('purchase') || t.includes('requisition') || t.includes('inventory')) return 'store';
    if (t.includes('maintenance') || t.includes('ooo') || t.includes('work order')) return 'maintenance';
    if (t.includes('lost')) return 'lost-found';
    if (t.includes('transit') || t.includes('dayuse') || t.includes('day-use') || t.includes('station')) return 'transit';
    if (t.includes('shift') || t.includes('handover') || t.includes('logbook')) return 'shift-logbook';
    if (t.includes('housekeeping')) return 'housekeeping';
    if (t.includes('linen')) return 'linen';
    if (t.includes('staff') || t.includes('payroll')) return 'staff';
    if (t.includes('outstanding') || t.includes('aging')) return 'outstanding';
    if (t.includes('booking') || t.includes('visualiz')) return 'bookings';
    if (t.includes('occupancy')) return 'occupancy';
    if (t.includes('dpdp')) return 'dpdp';
    if (t.includes('setting') || t.includes('operations')) return 'settings';
    if (t.includes('tally')) return 'tally';
    if (t.includes('d1') || t.includes('database')) return 'd1';
    if (rooms && rooms.length > 0 && (!auditItems || auditItems.length === 0)) return 'rooms';
    if (auditItems && auditItems.length > 0) return 'generic';
    return 'rooms';
  }, [moduleType, title, rooms, auditItems]);

  // Handle cell edit within modal with reactive state updates & parent callback
  const handleCellEdit = (item, field, newVal) => {
    setLocalItems(prev => prev.map((it) => {
      const isMatch = (it.roomNumber && (it.roomNumber === item.roomNumber || it.roomNumber === item.room_number)) ||
                      (it.id && it.id === item.id) ||
                      (it.billNo && it.billNo === item.billNo) ||
                      (it.billNumber && it.billNumber === item.billNumber) ||
                      (it.voucherNo && it.voucherNo === item.voucherNo) ||
                      (it.ticketId && it.ticketId === item.ticketId) ||
                      (it.purchaseId && it.purchaseId === item.purchaseId) ||
                      (it.requisitionId && it.requisitionId === item.requisitionId) ||
                      (it.orderId && it.orderId === item.orderId) ||
                      (it.invoiceNo && it.invoiceNo === item.invoiceNo) ||
                      (it.vendor && it.vendor === item.vendor) ||
                      (it.vendorName && it.vendorName === item.vendorName) ||
                      (it.itemName && it.itemName === item.itemName) ||
                      (it.code && it.code === item.code) ||
                      (it.shift && it.shift === item.shift) ||
                      (it === item);
      if (!isMatch) return it;

      const updated = { ...it, [field]: newVal };

      // Formula auto-calculations
      // 1. Cashier tender sum
      if (['cash', 'upi', 'card', 'cashTender', 'upiTender', 'cardTender'].includes(field)) {
        const c = Number(field === 'cash' || field === 'cashTender' ? newVal : (it.cashTender || it.cash || 0));
        const u = Number(field === 'upi' || field === 'upiTender' ? newVal : (it.upiTender || it.upi || 0));
        const cd = Number(field === 'card' || field === 'cardTender' ? newVal : (it.cardTender || it.card || 0));
        updated.totalAmount = c + u + cd;
        updated.amount = c + u + cd;
      }
      // 2. GST taxable recalculations (CGST 2.5%, SGST 2.5%, Gross 105%)
      if (field === 'taxableAmount' || field === 'baseAmount') {
        const base = Number(newVal) || 0;
        updated.cgst = Math.round(base * 0.025 * 100) / 100;
        updated.sgst = Math.round(base * 0.025 * 100) / 100;
        updated.totalAmount = base + updated.cgst + updated.sgst;
      }
      // 3. Room fields
      if (field === 'status') {
        updated.effectiveStatus = newVal;
      }
      if (field === 'guestName' || field === 'effectiveGuestName') {
        updated.effectiveGuestName = newVal;
        updated.guestName = newVal;
      }
      if (field === 'phone' || field === 'effectivePhone') {
        updated.effectivePhone = newVal;
        updated.phone = newVal;
      }
      if (field === 'tariff' || field === 'effectiveTariff') {
        updated.effectiveTariff = Number(newVal);
        updated.tariff = Number(newVal);
      }
      if (field === 'balanceDue' || field === 'effectiveBalanceDue') {
        updated.effectiveBalanceDue = Number(newVal);
        updated.balanceDue = Number(newVal);
      }

      return updated;
    }));

    // Trigger visual toast badge
    setEditFeedback(`Updated ${field} to "${newVal}" (Synced with Master Table)`);
    setTimeout(() => setEditFeedback(null), 2500);

    // Two-way synchronization with parent state
    if (onUpdateItem) {
      onUpdateItem(item, field, newVal);
    }
  };

  // Dynamic search across all fields of any object in localItems
  const filteredItems = useMemo(() => {
    if (!localItems || localItems.length === 0) return [];
    let items = [...localItems];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      items = items.filter(item => {
        if (!item || typeof item !== 'object') return false;
        return Object.values(item).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q);
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    if (statusFilter !== 'all') {
      items = items.filter(item => {
        const s = (item.status || item.effectiveStatus || item.paymentStatus || item.billStatus || '').toLowerCase();
        return s.includes(statusFilter.toLowerCase());
      });
    }

    return items;
  }, [localItems, searchTerm, statusFilter]);

  // Specific KPI computations depending on module
  const computedStats = useMemo(() => {
    const count = filteredItems.length;

    if (effectiveModule === 'rooms' || effectiveModule === 'occupancy') {
      const occupied = filteredItems.filter(r => (r.effectiveStatus || r.status || '').toLowerCase().includes('occupied')).length;
      const vacantClean = filteredItems.filter(r => (r.effectiveStatus || r.status) === 'Available' || (r.effectiveStatus || r.status) === 'Vacant Clean').length;
      const vacantDirty = filteredItems.filter(r => (r.effectiveStatus || r.status) === 'Vacant Dirty' || (r.effectiveStatus || r.status) === 'Cleaning').length;
      const ooo = filteredItems.filter(r => (r.effectiveStatus || r.status) === 'Maintenance' || (r.effectiveStatus || r.status) === 'OOO' || (r.effectiveStatus || r.status) === 'VIP Hold').length;
      const rev = filteredItems.reduce((sum, r) => {
        const isOcc = (r.effectiveStatus || r.status || '').toLowerCase().includes('occupied');
        return sum + (isOcc ? Number(r.effectiveTariff || r.tariff || 0) : 0);
      }, 0);
      const bal = filteredItems.reduce((sum, r) => sum + Number(r.effectiveBalanceDue || r.outstanding_balance || r.balanceDue || 0), 0);
      return [
        { label: 'Scope Keys', value: count, sub: 'Physical Inventory', color: '#38bdf8', icon: <Layers size={16} /> },
        { label: 'Occupied In-House', value: occupied, sub: `${count > 0 ? Math.round((occupied/count)*100) : 0}% Occupancy`, color: '#f59e0b', icon: <Bed size={16} /> },
        { label: 'Vacant Ready', value: vacantClean, sub: 'Clean & Inspected', color: '#10b981', icon: <CheckCircle2 size={16} /> },
        { label: 'Turnaround / OOO', value: vacantDirty + ooo, sub: `${vacantDirty} Dirty | ${ooo} OOO`, color: '#ec4899', icon: <AlertTriangle size={16} /> },
        { label: 'Tariff Revenue', value: `₹${(totalAmount || rev).toLocaleString('en-IN')}`, sub: 'Active Room Folios', color: '#60a5fa', icon: <TrendingUp size={16} /> },
        { label: 'Outstanding Balance', value: `₹${bal.toLocaleString('en-IN')}`, sub: 'Pending Check-out Due', color: bal > 0 ? '#ef4444' : '#10b981', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'police' || effectiveModule === 'dpdp') {
      const interstate = filteredItems.filter(b => b.isInterstate || b.is_interstate || (b.stateOfOrigin && b.stateOfOrigin.toLowerCase() !== 'odisha')).length;
      const aadhaarVerified = filteredItems.filter(b => (b.idProofType || b.id_proof_type || b.idProofMasked || '').toLowerCase().includes('aadhaar')).length;
      const totalRev = filteredItems.reduce((s, b) => s + Number(b.totalAmount || b.tariff || 0), 0);
      return [
        { label: 'Guest Registrations', value: count, sub: 'Audited Check-ins', color: '#38bdf8', icon: <User size={16} /> },
        { label: 'Interstate Guests', value: interstate, sub: `${count > 0 ? Math.round((interstate/count)*100) : 0}% Form-C Scope`, color: '#f59e0b', icon: <ShieldCheck size={16} /> },
        { label: 'Local / State Guests', value: count - interstate, sub: 'Odisha Residents', color: '#10b981', icon: <Building size={16} /> },
        { label: 'Aadhaar Verified', value: aadhaarVerified, sub: 'Masked UID / DigiLocker', color: '#a855f7', icon: <CheckCircle2 size={16} /> },
        { label: 'Registered Folio Sum', value: `₹${(totalAmount || totalRev).toLocaleString('en-IN')}`, sub: 'Total Stay Value', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'cashier') {
      const cashSum = filteredItems.reduce((s, c) => s + Number(c.cashTender || c.cash || 0), 0);
      const upiSum = filteredItems.reduce((s, c) => s + Number(c.upiTender || c.upi || 0), 0);
      const cardSum = filteredItems.reduce((s, c) => s + Number(c.cardTender || c.card || 0), 0);
      const gross = filteredItems.reduce((s, c) => s + Number(c.totalAmount || c.amount || 0), 0);
      return [
        { label: 'Settled Bills', value: count, sub: 'Front Desk Invoices', color: '#38bdf8', icon: <FileText size={16} /> },
        { label: 'Cash Drawer Collection', value: `₹${cashSum.toLocaleString('en-IN')}`, sub: 'Physical Cash Tender', color: '#10b981', icon: <IndianRupee size={16} /> },
        { label: 'UPI / QR Payments', value: `₹${upiSum.toLocaleString('en-IN')}`, sub: 'Direct Bank Settlement', color: '#8b5cf6', icon: <CreditCard size={16} /> },
        { label: 'Card & POS Swipes', value: `₹${cardSum.toLocaleString('en-IN')}`, sub: 'EDC Terminal Receipts', color: '#f59e0b', icon: <CreditCard size={16} /> },
        { label: 'Gross Net Realized', value: `₹${(totalAmount || gross).toLocaleString('en-IN')}`, sub: 'Shift Total Collection', color: '#34d399', icon: <TrendingUp size={16} /> }
      ];
    }

    if (effectiveModule === 'gst') {
      const taxable = filteredItems.reduce((s, g) => s + Number(g.taxableAmount || g.baseAmount || 0), 0);
      const cgst = filteredItems.reduce((s, g) => s + Number(g.cgst || (Number(g.taxableAmount || 0) * 0.025)), 0);
      const sgst = filteredItems.reduce((s, g) => s + Number(g.sgst || (Number(g.taxableAmount || 0) * 0.025)), 0);
      const gross = filteredItems.reduce((s, g) => s + Number(g.totalAmount || g.grandTotal || 0), 0);
      return [
        { label: 'B2B/B2C Invoices', value: count, sub: 'SAC 996311 (Accommodation)', color: '#38bdf8', icon: <FileText size={16} /> },
        { label: 'Taxable Turnover', value: `₹${taxable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Net Tariff Base', color: '#10b981', icon: <IndianRupee size={16} /> },
        { label: 'CGST 2.5%', value: `₹${cgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Central GST Output', color: '#f59e0b', icon: <TrendingUp size={16} /> },
        { label: 'SGST 2.5%', value: `₹${sgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Odisha State GST Output', color: '#ec4899', icon: <TrendingUp size={16} /> },
        { label: 'Total Invoiced Value', value: `₹${(totalAmount || gross).toLocaleString('en-IN')}`, sub: 'Inclusive of GST', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'daybook') {
      const debits = filteredItems.reduce((s, d) => s + (d.type === 'debit' || d.drCr === 'Dr' ? Number(d.amount || 0) : 0), 0);
      const credits = filteredItems.reduce((s, d) => s + (d.type === 'credit' || d.drCr === 'Cr' ? Number(d.amount || 0) : 0), 0);
      const net = credits - debits;
      return [
        { label: 'Audited Vouchers', value: count, sub: 'Day Book Entries', color: '#38bdf8', icon: <FileText size={16} /> },
        { label: 'Cash Inflows (Credits)', value: `₹${credits.toLocaleString('en-IN')}`, sub: 'Collections / Advances', color: '#10b981', icon: <TrendingUp size={16} /> },
        { label: 'Cash Outflows (Debits)', value: `₹${debits.toLocaleString('en-IN')}`, sub: 'Petty Expenses & Payouts', color: '#ef4444', icon: <AlertTriangle size={16} /> },
        { label: 'Net Cash Realization', value: `₹${net.toLocaleString('en-IN')}`, sub: 'Shift Cash Margin', color: net >= 0 ? '#34d399' : '#f87171', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'pos' || effectiveModule === 'pos-consumption') {
      const gross = filteredItems.reduce((s, o) => {
        if (o.totalAmount) return s + Number(o.totalAmount);
        const itemSum = (o.items || []).reduce((sub, it) => sub + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
        return s + itemSum;
      }, 0);
      const tableOrders = filteredItems.filter(o => o.tableNumber || o.table_number || o.tableNo).length;
      return [
        { label: 'KOTs & Food Orders', value: count, sub: 'Restaurant & Room Service', color: '#38bdf8', icon: <Utensils size={16} /> },
        { label: 'Table Dining Orders', value: tableOrders, sub: 'Dine-In Operations', color: '#f59e0b', icon: <Building size={16} /> },
        { label: 'Room Service & Takeaway', value: count - tableOrders, sub: 'Direct In-Room Delivery', color: '#10b981', icon: <Bed size={16} /> },
        { label: 'Total Food Revenue', value: `₹${(totalAmount || gross).toLocaleString('en-IN')}`, sub: 'F&B Gross Sales', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'store' || effectiveModule === 'store-requisitions') {
      const totalCost = filteredItems.reduce((s, p) => s + Number(p.totalAmount || p.amount || p.approxCost || 0), 0);
      const verified = filteredItems.filter(p => (p.paymentStatus || p.status || '').toLowerCase().includes('paid') || (p.status || '').toLowerCase().includes('approved') || (p.status || '').toLowerCase().includes('received')).length;
      return [
        { label: 'Stock Transactions', value: count, sub: 'Inward & Requisitions', color: '#38bdf8', icon: <ShoppingBag size={16} /> },
        { label: 'Approved & Settled', value: verified, sub: 'Inventory Verified', color: '#10b981', icon: <CheckCircle2 size={16} /> },
        { label: 'Pending / In-Transit', value: count - verified, sub: 'Pending Verification', color: '#f59e0b', icon: <Clock size={16} /> },
        { label: 'Total Inventory Spend', value: `₹${(totalAmount || totalCost).toLocaleString('en-IN')}`, sub: 'Mandi & Grocery Outflow', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'store-vendors') {
      const totInvoiced = filteredItems.reduce((s, v) => s + Number(v.totalInvoiced || v.invoiced || 0), 0);
      const totPaid = filteredItems.reduce((s, v) => s + Number(v.totalPaid || v.paid || 0), 0);
      const totDue = filteredItems.reduce((s, v) => s + Number(v.balanceDue || v.due || 0), 0);
      return [
        { label: 'Rayagada Vendors', value: count, sub: 'Suppliers on Ledger', color: '#38bdf8', icon: <Building size={16} /> },
        { label: 'Total Billed', value: `₹${totInvoiced.toLocaleString('en-IN')}`, sub: 'Cumulative Purchases', color: '#60a5fa', icon: <FileText size={16} /> },
        { label: 'Amount Paid', value: `₹${totPaid.toLocaleString('en-IN')}`, sub: 'Disbursed to Vendors', color: '#10b981', icon: <IndianRupee size={16} /> },
        { label: 'Outstanding Balance', value: `₹${totDue.toLocaleString('en-IN')}`, sub: 'Vendor Accounts Payable', color: '#f87171', icon: <AlertTriangle size={16} /> }
      ];
    }

    if (effectiveModule === 'maintenance') {
      const open = filteredItems.filter(m => (m.status || '').toLowerCase().includes('open') || (m.status || '').toLowerCase().includes('progress')).length;
      const resolved = filteredItems.filter(m => (m.status || '').toLowerCase().includes('resolved') || (m.status || '').toLowerCase().includes('completed')).length;
      return [
        { label: 'Work Orders', value: count, sub: 'Active Maintenance Logs', color: '#38bdf8', icon: <Wrench size={16} /> },
        { label: 'In Progress / Open', value: open, sub: 'Needs Engineering Attention', color: '#ef4444', icon: <AlertTriangle size={16} /> },
        { label: 'Resolved Tickets', value: resolved, sub: 'Verified & Fixed', color: '#10b981', icon: <CheckCircle2 size={16} /> }
      ];
    }

    if (effectiveModule === 'transit') {
      const totalRev = filteredItems.reduce((s, t) => s + Number(t.tariff || 0), 0);
      const activeTransit = filteredItems.filter(t => (t.status || '').toLowerCase().includes('transit') || (t.status || '').toLowerCase().includes('occupied')).length;
      return [
        { label: 'Transit Stays', value: count, sub: 'Rayagada Junction Matrix', color: '#38bdf8', icon: <Bed size={16} /> },
        { label: 'Active In-Transit', value: activeTransit, sub: 'Currently In-Room', color: '#f59e0b', icon: <Clock size={16} /> },
        { label: 'Completed Stays', value: count - activeTransit, sub: 'Departed / Settled', color: '#10b981', icon: <CheckCircle2 size={16} /> },
        { label: 'Transit Revenue', value: `₹${(totalAmount || totalRev).toLocaleString('en-IN')}`, sub: 'Day-Use Tariff Sum', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'lost-found') {
      const claimed = filteredItems.filter(l => (l.status || '').toLowerCase().includes('claimed')).length;
      return [
        { label: 'Custody Articles', value: count, sub: 'Found Items Logged', color: '#38bdf8', icon: <ShoppingBag size={16} /> },
        { label: 'In Custody Locker', value: count - claimed, sub: 'Awaiting Guest Claim', color: '#f59e0b', icon: <AlertTriangle size={16} /> },
        { label: 'Claimed & Returned', value: claimed, sub: 'Verified & Handed Over', color: '#10b981', icon: <CheckCircle2 size={16} /> }
      ];
    }

    if (effectiveModule === 'shift-logbook') {
      const signed = filteredItems.filter(s => s.handoverSigned === 'Signed' || s.handoverSigned === true).length;
      const cashSum = filteredItems.reduce((s, it) => s + Number(it.shiftCashCollected || 0), 0);
      const upiSum = filteredItems.reduce((s, it) => s + Number(it.shiftUpiCollected || 0), 0);
      return [
        { label: 'Operational Shifts', value: count, sub: 'Morning, Evening, Night', color: '#38bdf8', icon: <Clock size={16} /> },
        { label: 'Handover Verified', value: signed, sub: `${signed} of ${count} Shifts Signed`, color: '#10b981', icon: <CheckCircle2 size={16} /> },
        { label: 'Cash Drawer Float', value: `₹${cashSum.toLocaleString('en-IN')}`, sub: 'Physical Shift Cash', color: '#f59e0b', icon: <IndianRupee size={16} /> },
        { label: 'UPI / Digital Bank', value: `₹${upiSum.toLocaleString('en-IN')}`, sub: 'Shift Digital Collection', color: '#a855f7', icon: <CreditCard size={16} /> }
      ];
    }

    if (effectiveModule === 'housekeeping') {
      const clean = filteredItems.filter(r => (r.status || '').toLowerCase().includes('clean') || (r.status || '').toLowerCase().includes('available')).length;
      const dirty = filteredItems.filter(r => (r.status || '').toLowerCase().includes('dirty') || (r.status || '').toLowerCase().includes('cleaning')).length;
      return [
        { label: 'Tracked Rooms', value: count, sub: '39-Room Property Keys', color: '#38bdf8', icon: <Bed size={16} /> },
        { label: 'Clean & Inspected', value: clean, sub: 'Ready for Guest Check-in', color: '#10b981', icon: <CheckCircle2 size={16} /> },
        { label: 'Dirty / Turnaround', value: dirty, sub: 'Attendant Work Order Scope', color: '#ef4444', icon: <AlertTriangle size={16} /> }
      ];
    }

    if (effectiveModule === 'corporate' || effectiveModule === 'outstanding') {
      const totDebits = filteredItems.reduce((s, d) => s + Number(d.debit || d.totalInvoiced || d.amount || 0), 0);
      const totCredits = filteredItems.reduce((s, c) => s + Number(c.credit || c.paid || 0), 0);
      const bal = filteredItems.reduce((s, b) => s + Number(b.balanceDue || b.outstanding || (Number(b.debit || 0) - Number(b.credit || 0))), 0);
      return [
        { label: 'B2B Client Records', value: count, sub: 'Corporate Folios / Ledgers', color: '#38bdf8', icon: <Building size={16} /> },
        { label: 'Total Invoiced (DR)', value: `₹${totDebits.toLocaleString('en-IN')}`, sub: 'Direct Bill Charges', color: '#60a5fa', icon: <FileText size={16} /> },
        { label: 'Received (CR)', value: `₹${totCredits.toLocaleString('en-IN')}`, sub: 'Bank / NEFT Settlements', color: '#10b981', icon: <TrendingUp size={16} /> },
        { label: 'Net Outstanding Due', value: `₹${bal.toLocaleString('en-IN')}`, sub: 'Pending Corporate Payment', color: bal > 0 ? '#ef4444' : '#10b981', icon: <IndianRupee size={16} /> }
      ];
    }

    // Generic Fallback KPIs
    const amt = totalAmount !== null ? totalAmount : filteredItems.reduce((s, it) => {
      const a = Number(it.amount || it.totalAmount || it.tariff || it.total || it.price || 0);
      return s + (isNaN(a) ? 0 : a);
    }, 0);

    return [
      { label: 'Total Audited Records', value: count, sub: 'Active Matching Rows', color: '#38bdf8', icon: <Database size={16} /> },
      { label: 'Audit Window Range', value: `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`, sub: dateDuration, color: '#f59e0b', icon: <Calendar size={16} /> },
      { label: 'Cumulative Valuation', value: amt > 0 ? `₹${amt.toLocaleString('en-IN')}` : `${count} Records Active`, sub: 'Transaction Metric', color: '#10b981', icon: <IndianRupee size={16} /> }
    ];
  }, [effectiveModule, filteredItems, fromDate, toDate, dateDuration, totalAmount]);

  if (!isOpen) return null;

  // Handle CSV export
  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    if (filteredItems.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = Object.keys(filteredItems[0]).filter(k => typeof filteredItems[0][k] !== 'object');
    const csvRows = [
      headers.join(','),
      ...filteredItems.map(row => 
        headers.map(h => {
          const val = row[h] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `HOTEL_SAI_${effectiveModule.toUpperCase()}_AUDIT_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Print
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div 
      className="modal-backdrop-dark"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="modal-content-luxury"
        style={{
          width: '96vw',
          maxWidth: '1380px',
          maxHeight: '92vh',
          background: 'linear-gradient(180deg, #0b1528 0%, #060b14 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.45)',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* MODAL HEADER */}
        <div 
          style={{
            padding: '1rem 1.6rem',
            background: 'linear-gradient(90deg, #0f274a 0%, #0d1e38 50%, #091322 100%)',
            borderBottom: '1.5px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Eye size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                  {title}
                </h3>
                <span 
                  style={{
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {effectiveModule} TAB ACTIVE
                </span>
                <span 
                  style={{
                    background: 'rgba(52, 211, 153, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.45)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Direct click any cell to edit. Changes immediately reflect in the underlying main ledger"
                >
                  <Sparkles size={11} /> ✏️ Inline Spreadsheet Edit: ACTIVE
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '0.78rem', color: '#94a3b8' }}>
                <span>From: <strong style={{ color: '#fbbf24' }}>{formatDisplayDate(fromDate)}</strong></span>
                <span>•</span>
                <span>To: <strong style={{ color: '#fbbf24' }}>{formatDisplayDate(toDate)}</strong></span>
                <span>•</span>
                <span style={{ color: '#38bdf8' }}>{dateDuration}</span>
                {subtitle && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#cbd5e1' }}>{subtitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editFeedback && (
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                animation: 'pulse 1.5s infinite'
              }}>
                <Check size={12} /> {editFeedback}
              </span>
            )}

            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Download filtered dataset as CSV"
            >
              <Download size={14} /> CSV
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Print official audit ledger"
            >
              <Printer size={14} /> Print
            </button>

            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close Audit Window (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* STATS & KPI STRIP */}
        <div 
          style={{
            padding: '0.85rem 1.6rem',
            background: '#070d18',
            borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
            gap: '12px'
          }}
        >
          {computedStats.map((kpi, idx) => (
            <div 
              key={idx}
              style={{
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: `1px solid ${kpi.color}35`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }}
            >
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: `${kpi.color}20`,
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {kpi.icon}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '1px 0' }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.68rem', color: kpi.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {kpi.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div 
          style={{
            padding: '0.65rem 1.6rem',
            background: '#091222',
            borderBottom: '1px solid rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${effectiveModule.toUpperCase()} records by any keyword, party, room, amount, or ID...`}
              style={{
                width: '100%',
                padding: '7px 12px 7px 36px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <X 
                size={14} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
              Showing <strong style={{ color: '#38bdf8' }}>{filteredItems.length}</strong> of {localItems.length} entries
            </span>
          </div>
        </div>

        {/* TABULAR CONTENT AREA WITH GOOGLE SHEETS LIVE INLINE EDITING */}
        <div style={{ flex: 1, overflow: 'auto', background: '#070d18' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
              <AlertTriangle size={36} style={{ margin: '0 auto 12px', color: '#f59e0b', opacity: 0.8 }} />
              <h4 style={{ margin: '0 0 6px', color: '#e2e8f0', fontSize: '1.05rem' }}>No Records Match Current Filter</h4>
              <p style={{ margin: 0, fontSize: '0.84rem' }}>
                No active data points found for module "{effectiveModule}" between {formatDisplayDate(fromDate)} and {formatDisplayDate(toDate)}.
              </p>
            </div>
          ) : (
            <div>
              <SheetsToolbarLegend 
                tableName={`${effectiveModule.toUpperCase()} Audit Pop-Up Matrix`} 
                subtitle={`Window: ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)} • Single-click any cell to edit`} 
              />
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }} className="sheets-grid-table">
                <thead>
                  <tr style={{ background: '#0b162c', color: '#94a3b8', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', position: 'sticky', top: 0, zIndex: 10 }}>
                    {/* ROOMS / OCCUPANCY */}
                    {(effectiveModule === 'rooms' || effectiveModule === 'occupancy') && (
                      <>
                        <SheetsColumnHeader title="ROOM #" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="FLOOR" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="CATEGORY" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px', width: '130px' }} />
                        <SheetsColumnHeader title="IN-HOUSE GUEST" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PHONE" badge="editable" style={{ padding: '10px 14px', width: '130px' }} />
                        <SheetsColumnHeader title="STAY PERIOD" badge="editable" style={{ padding: '10px 14px', width: '140px' }} />
                        <SheetsColumnHeader title="TARIFF" badge="editable" align="right" style={{ padding: '10px 14px', width: '110px' }} />
                        <SheetsColumnHeader title="BALANCE DUE" badge="editable" align="right" style={{ padding: '10px 14px', width: '120px' }} />
                      </>
                    )}

                    {/* POLICE REGISTER / SARAI ACT */}
                    {effectiveModule === 'police' && (
                      <>
                        <SheetsColumnHeader title="ROOM #" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="GUEST FULL NAME" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="MOBILE" badge="editable" style={{ padding: '10px 14px', width: '130px' }} />
                        <SheetsColumnHeader title="ID PROOF / AADHAAR" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATE OF ORIGIN" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="INTERSTATE?" badge="editable" style={{ padding: '10px 14px', width: '110px' }} />
                        <SheetsColumnHeader title="CHECK-IN" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CHECK-OUT" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="FOLIO VALUE" badge="editable" align="right" style={{ padding: '10px 14px', width: '110px' }} />
                      </>
                    )}

                    {/* CASHIER AUDIT & SETTLEMENTS */}
                    {effectiveModule === 'cashier' && (
                      <>
                        <SheetsColumnHeader title="BILL / FOLIO #" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DATE / TIME" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ROOM" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="GUEST NAME" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CASH (₹)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="UPI / DIGITAL (₹)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CARD / OTHER (₹)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TOTAL AMOUNT" badge="formula" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CASHIER" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* GST TAX INVOICES */}
                    {effectiveModule === 'gst' && (
                      <>
                        <SheetsColumnHeader title="INVOICE #" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DATE" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ROOM" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="GUEST / CORPORATE ENTITY" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="GSTIN" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TAXABLE BASE" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CGST (2.5%)" badge="formula" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="SGST (2.5%)" badge="formula" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="GROSS INVOICED" badge="formula" align="right" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* DAY BOOK & PETTY CASH */}
                    {effectiveModule === 'daybook' && (
                      <>
                        <SheetsColumnHeader title="VOUCHER #" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DATE / TIME" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ACCOUNT HEAD" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PARTICULARS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DEBIT (DR)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CREDIT (CR)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="BALANCE" badge="formula" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* KITCHEN POS & FOOD ORDERS */}
                    {(effectiveModule === 'pos' || effectiveModule === 'pos-consumption') && (
                      <>
                        <SheetsColumnHeader title="ORDER / KOT #" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TABLE / ROOM #" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STEWARD" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ITEMS SUMMARY" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ORDER TYPE" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="AMOUNT (₹)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* STORE PURCHASES & REQUISITIONS */}
                    {(effectiveModule === 'store' || effectiveModule === 'store-requisitions') && (
                      <>
                        <SheetsColumnHeader title="PO / REQ #" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="VENDOR / DEPT" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CATEGORY" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ITEMS / SPECIFICATION" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TOTAL AMOUNT" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="RECEIVED BY" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* VENDOR CREDIT LEDGER */}
                    {effectiveModule === 'store-vendors' && (
                      <>
                        <SheetsColumnHeader title="VENDOR NAME" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CATEGORY" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CREDIT TERMS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TOTAL INVOICED" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="AMOUNT PAID" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="BALANCE DUE" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* RECIPE BOM */}
                    {effectiveModule === 'store-bom' && (
                      <>
                        <SheetsColumnHeader title="RECIPE ITEM" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CATEGORY" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PORTION YIELD" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="RAW INGREDIENTS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="BASE COST (₹)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="SELLING PRICE (₹)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* MAINTENANCE & OOO */}
                    {effectiveModule === 'maintenance' && (
                      <>
                        <SheetsColumnHeader title="TICKET #" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ROOM #" badge="editable" style={{ padding: '10px 14px', width: '90px' }} />
                        <SheetsColumnHeader title="CATEGORY" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ISSUE DESCRIPTION" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TECHNICIAN" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PRIORITY" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* TRANSIT & STATION TRANSFER */}
                    {effectiveModule === 'transit' && (
                      <>
                        <SheetsColumnHeader title="ROOM #" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="GUEST NAME" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PHONE" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ORIGIN / TRAIN" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PURPOSE" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="SLOT DURATION" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CHECK-IN" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="EXPECTED OUT" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TARIFF (₹)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* LOST & FOUND */}
                    {effectiveModule === 'lost-found' && (
                      <>
                        <SheetsColumnHeader title="CUSTODY REF #" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ROOM / AREA" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ITEM DESCRIPTION" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="FOUND DATE" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="FOUND BY" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CUSTODY STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CLAIMED BY / CONTACT" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* SHIFT LOGBOOK */}
                    {effectiveModule === 'shift-logbook' && (
                      <>
                        <SheetsColumnHeader title="SHIFT" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DUTY SHIFT LEAD" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="OPENING CASH FLOAT" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CASH COLLECTED" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="UPI / DIGITAL" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TOTAL SHIFT SUM" badge="formula" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="HANDOVER STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="SIGNED AT" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* HOUSEKEEPING */}
                    {effectiveModule === 'housekeeping' && (
                      <>
                        <SheetsColumnHeader title="ROOM #" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="FLOOR" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="ROOM STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ASSIGNED ATTENDANT" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="INSPECTION STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="LINEN STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* LINEN ASSETS */}
                    {effectiveModule === 'linen' && (
                      <>
                        <SheetsColumnHeader title="LINEN ITEM" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CATEGORY" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="IN CIRCULATION" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="FLOOR PAR STOCK" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="LAUNDRY CYCLE" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DAMAGED / CONDEMNED" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="UNIT COST (₹)" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* STAFF PAYROLL */}
                    {effectiveModule === 'staff' && (
                      <>
                        <SheetsColumnHeader title="EMP ID" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STAFF NAME" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DEPARTMENT" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DESIGNATION" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="DAYS WORKED" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="MONTHLY SALARY" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PAYABLE DUES" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* CORPORATE / OUTSTANDING */}
                    {(effectiveModule === 'corporate' || effectiveModule === 'outstanding') && (
                      <>
                        <SheetsColumnHeader title="CLIENT / ENTITY" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="INVOICED / DEBIT" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="RECEIVED / CREDIT" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="BALANCE DUE" badge="formula" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="0-30 DAYS AGING" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="31-60 DAYS" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* BOOKINGS VISUALIZER */}
                    {effectiveModule === 'bookings' && (
                      <>
                        <SheetsColumnHeader title="BOOKING ID" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="ROOM #" badge="locked" style={{ padding: '10px 14px', width: '80px' }} />
                        <SheetsColumnHeader title="GUEST NAME" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PHONE" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CHECK-IN" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CHECK-OUT" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CHANNEL" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="TARIFF" badge="editable" align="right" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* DPDP ACT COMPLIANCE */}
                    {effectiveModule === 'dpdp' && (
                      <>
                        <SheetsColumnHeader title="RECORD ID" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="GUEST NAME" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PHONE" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="MASKED AADHAAR" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="CONSENT STATUS" badge="editable" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="PURPOSE" badge="locked" style={{ padding: '10px 14px' }} />
                        <SheetsColumnHeader title="RETENTION LIMIT" badge="locked" style={{ padding: '10px 14px' }} />
                      </>
                    )}

                    {/* Fallback Dynamic Headers for other datasets */}
                    {!['rooms', 'police', 'cashier', 'gst', 'daybook', 'pos', 'pos-consumption', 'store', 'store-requisitions', 'store-vendors', 'store-bom', 'maintenance', 'transit', 'lost-found', 'shift-logbook', 'housekeeping', 'linen', 'staff', 'corporate', 'outstanding', 'bookings', 'occupancy', 'dpdp'].includes(effectiveModule) && (
                      columns ? columns.map((col, idx) => (
                        <SheetsColumnHeader key={idx} title={col.label || col.key} badge="editable" align={col.align || 'left'} style={{ padding: '10px 14px' }} />
                      )) : (
                        Object.keys(filteredItems[0] || {}).slice(0, 8).map((k, idx) => (
                          <SheetsColumnHeader key={idx} title={k.replace(/_/g, ' ').toUpperCase()} badge="editable" style={{ padding: '10px 14px' }} />
                        ))
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    const rowBg = isEven ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.7)';

                    // ROOMS & OCCUPANCY
                    if (effectiveModule === 'rooms' || effectiveModule === 'occupancy') {
                      const status = item.effectiveStatus || item.status || 'Available';
                      const bal = Number(item.effectiveBalanceDue ?? item.outstanding_balance ?? item.balanceDue ?? 0);
                      const tar = Number(item.effectiveTariff ?? item.tariff ?? 0);

                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 800, color: '#38bdf8' }}>{item.roomNumber}</td>
                          <td style={{ padding: '8px 14px', color: '#94a3b8' }}>F{item.floor}</td>
                          <td style={{ padding: '8px 14px', color: '#cbd5e1' }}>{item.tier}</td>
                          <SheetsEditableCell
                            value={status}
                            type="select"
                            options={[
                              { value: 'Available', label: 'Available', badgeStyle: { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' } },
                              { value: 'Occupied', label: 'Occupied', badgeStyle: { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' } },
                              { value: 'Vacant Clean', label: 'Vacant Clean', badgeStyle: { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' } },
                              { value: 'Vacant Dirty', label: 'Vacant Dirty', badgeStyle: { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' } },
                              { value: 'Cleaning', label: 'Cleaning', badgeStyle: { background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' } },
                              { value: 'Maintenance', label: 'Maintenance', badgeStyle: { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' } },
                              { value: 'OOO', label: 'OOO', badgeStyle: { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' } }
                            ]}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                          <SheetsEditableCell
                            value={item.effectiveGuestName || item.guestName || ''}
                            placeholder="Add Guest Name..."
                            onSave={(val) => handleCellEdit(item, 'guestName', val)}
                            cellStyle={{ fontWeight: 600, color: '#ffffff' }}
                          />
                          <SheetsEditableCell
                            value={item.effectivePhone || item.phone || ''}
                            placeholder="Add Phone..."
                            onSave={(val) => handleCellEdit(item, 'phone', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.effectiveStayPeriod || item.stayPeriod || ''}
                            placeholder="e.g. 1 Night"
                            onSave={(val) => handleCellEdit(item, 'stayPeriod', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={tar}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'tariff', val)}
                            cellStyle={{ fontWeight: 700, color: '#e2e8f0' }}
                          />
                          <SheetsEditableCell
                            value={bal}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'balanceDue', val)}
                            cellStyle={{ fontWeight: 800, color: bal > 0 ? '#f87171' : '#34d399' }}
                          />
                        </tr>
                      );
                    }

                    // POLICE REGISTER
                    if (effectiveModule === 'police') {
                      const isInter = item.isInterstate || item.is_interstate;
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 800, color: '#38bdf8' }}>{item.roomNumber || item.room_number}</td>
                          <SheetsEditableCell
                            value={item.guestName || item.guest_name || ''}
                            onSave={(val) => handleCellEdit(item, 'guestName', val)}
                            cellStyle={{ fontWeight: 700, color: '#ffffff' }}
                          />
                          <SheetsEditableCell
                            value={item.guestPhone || item.guest_phone || ''}
                            onSave={(val) => handleCellEdit(item, 'guestPhone', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.idProofMasked || item.id_proof_masked || item.idProofType || 'Aadhaar'}
                            onSave={(val) => handleCellEdit(item, 'idProofMasked', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.stateOfOrigin || item.state_of_origin || 'Odisha'}
                            onSave={(val) => handleCellEdit(item, 'stateOfOrigin', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={isInter ? 'YES' : 'NO'}
                            type="select"
                            options={[
                              { value: 'YES', label: 'Interstate', badgeStyle: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' } },
                              { value: 'NO', label: 'Local State', badgeStyle: { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' } }
                            ]}
                            onSave={(val) => handleCellEdit(item, 'isInterstate', val === 'YES')}
                          />
                          <SheetsEditableCell
                            value={item.checkInDate || item.check_in_date || fromDate}
                            onSave={(val) => handleCellEdit(item, 'checkInDate', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.checkOutDate || item.check_out_date || toDate}
                            onSave={(val) => handleCellEdit(item, 'checkOutDate', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.totalAmount || item.tariff || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'totalAmount', val)}
                            cellStyle={{ fontWeight: 700, color: '#e2e8f0' }}
                          />
                        </tr>
                      );
                    }

                    // CASHIER AUDIT
                    if (effectiveModule === 'cashier') {
                      const cash = Number(item.cashTender ?? item.cash ?? 0);
                      const upi = Number(item.upiTender ?? item.upi ?? 0);
                      const card = Number(item.cardTender ?? item.card ?? 0);
                      const total = cash + upi + card;

                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.billNumber || item.id || `BIL-${idx+101}`}</td>
                          <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{item.date || item.settlement_date || fromDate}</td>
                          <td style={{ padding: '8px 14px', color: '#cbd5e1' }}>{item.roomNumber || item.room_number || '—'}</td>
                          <SheetsEditableCell
                            value={item.guestName || item.guest_name || 'Guest'}
                            onSave={(val) => handleCellEdit(item, 'guestName', val)}
                            cellStyle={{ color: '#ffffff', fontWeight: 600 }}
                          />
                          <SheetsEditableCell
                            value={cash}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'cashTender', val)}
                            cellStyle={{ color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={upi}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'upiTender', val)}
                            cellStyle={{ color: '#818cf8' }}
                          />
                          <SheetsEditableCell
                            value={card}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'cardTender', val)}
                            cellStyle={{ color: '#fbbf24' }}
                          />
                          <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                            ₹{total.toLocaleString('en-IN')}
                          </td>
                          <SheetsEditableCell
                            value={item.cashierName || item.cashier || 'Front Desk'}
                            onSave={(val) => handleCellEdit(item, 'cashierName', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                        </tr>
                      );
                    }

                    // GST TAX INVOICES
                    if (effectiveModule === 'gst') {
                      const taxable = Number(item.taxableAmount ?? item.baseAmount ?? 0);
                      const cgst = Number(item.cgst ?? Math.round(taxable * 0.025 * 100)/100);
                      const sgst = Number(item.sgst ?? Math.round(taxable * 0.025 * 100)/100);
                      const tot = taxable + cgst + sgst;

                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.invoiceNo || item.invoice_number || `INV-${idx+1}`}</td>
                          <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{item.date || fromDate}</td>
                          <td style={{ padding: '8px 14px', color: '#cbd5e1' }}>{item.roomNumber || item.room_number || '—'}</td>
                          <SheetsEditableCell
                            value={item.guestName || item.companyName || 'Guest'}
                            onSave={(val) => handleCellEdit(item, 'guestName', val)}
                            cellStyle={{ color: '#ffffff', fontWeight: 600 }}
                          />
                          <SheetsEditableCell
                            value={item.gstin || 'Unregistered'}
                            onSave={(val) => handleCellEdit(item, 'gstin', val)}
                            cellStyle={{ color: '#a78bfa' }}
                          />
                          <SheetsEditableCell
                            value={taxable}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'taxableAmount', val)}
                            cellStyle={{ color: '#e2e8f0' }}
                          />
                          <td style={{ padding: '8px 14px', textAlign: 'right', color: '#fbbf24' }}>
                            ₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '8px 14px', textAlign: 'right', color: '#f472b6' }}>
                            ₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                            ₹{tot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    }

                    // DAY BOOK
                    if (effectiveModule === 'daybook') {
                      const isDr = item.type === 'debit' || item.drCr === 'Dr';
                      const amt = Number(item.amount || 0);

                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.voucherNo || item.voucher_no || item.id}</td>
                          <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{item.date || item.timestamp}</td>
                          <SheetsEditableCell
                            value={item.accountHead || item.category || 'Front Desk'}
                            onSave={(val) => handleCellEdit(item, 'accountHead', val)}
                            cellStyle={{ color: '#cbd5e1', fontWeight: 600 }}
                          />
                          <SheetsEditableCell
                            value={item.particulars || item.description || item.narration || ''}
                            onSave={(val) => handleCellEdit(item, 'particulars', val)}
                            cellStyle={{ color: '#e2e8f0' }}
                          />
                          <SheetsEditableCell
                            value={isDr ? amt : 0}
                            type="currency"
                            align="right"
                            onSave={(val) => {
                              handleCellEdit(item, 'amount', val);
                              handleCellEdit(item, 'type', 'debit');
                            }}
                            cellStyle={{ color: isDr ? '#f87171' : '#64748b' }}
                          />
                          <SheetsEditableCell
                            value={!isDr ? amt : 0}
                            type="currency"
                            align="right"
                            onSave={(val) => {
                              handleCellEdit(item, 'amount', val);
                              handleCellEdit(item, 'type', 'credit');
                            }}
                            cellStyle={{ color: !isDr ? '#34d399' : '#64748b' }}
                          />
                          <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: '#e2e8f0' }}>
                            ₹{Number(item.balance || amt).toLocaleString('en-IN')}
                          </td>
                          <SheetsEditableCell
                            value={item.status || 'Posted'}
                            type="select"
                            options={['Posted', 'Pending', 'Audited']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // KITCHEN POS
                    if (effectiveModule === 'pos' || effectiveModule === 'pos-consumption') {
                      const amt = Number(item.totalAmount || (item.items || []).reduce((s, it) => s + (it.price * it.quantity), 0) || 0);
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.orderId || item.kotId || item.id}</td>
                          <SheetsEditableCell
                            value={item.tableNumber || item.tableNo || 'Room Svc'}
                            onSave={(val) => handleCellEdit(item, 'tableNumber', val)}
                            cellStyle={{ fontWeight: 700, color: '#fbbf24' }}
                          />
                          <SheetsEditableCell
                            value={item.stewardName || item.waiter || 'Steward'}
                            onSave={(val) => handleCellEdit(item, 'stewardName', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.itemsSummary || (item.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ') || 'F&B Items'}
                            onSave={(val) => handleCellEdit(item, 'itemsSummary', val)}
                            cellStyle={{ color: '#e2e8f0' }}
                          />
                          <SheetsEditableCell
                            value={item.orderType || 'Dine-In'}
                            type="select"
                            options={['Dine-In', 'Room Service', 'Takeaway']}
                            onSave={(val) => handleCellEdit(item, 'orderType', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={amt}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'totalAmount', val)}
                            cellStyle={{ fontWeight: 800, color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={item.status || 'Settled'}
                            type="select"
                            options={['Settled', 'Pending', 'Complimentary']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // STORE & REQUISITIONS
                    if (effectiveModule === 'store' || effectiveModule === 'store-requisitions') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.purchaseId || item.requisitionId || item.id}</td>
                          <SheetsEditableCell
                            value={item.vendorName || item.targetOutlet || item.department || 'Vendor'}
                            onSave={(val) => handleCellEdit(item, 'vendorName', val)}
                            cellStyle={{ color: '#ffffff', fontWeight: 600 }}
                          />
                          <SheetsEditableCell
                            value={item.category || 'Store'}
                            onSave={(val) => handleCellEdit(item, 'category', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.itemsSummary || item.itemName || 'Supplies'}
                            onSave={(val) => handleCellEdit(item, 'itemsSummary', val)}
                            cellStyle={{ color: '#e2e8f0' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.totalAmount || item.amount || item.approxCost || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'totalAmount', val)}
                            cellStyle={{ fontWeight: 800, color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={item.paymentStatus || item.status || 'Received'}
                            type="select"
                            options={['Received', 'Approved', 'Pending', 'Settled']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                          <SheetsEditableCell
                            value={item.receivedBy || item.issuedBy || 'Store Manager'}
                            onSave={(val) => handleCellEdit(item, 'receivedBy', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                        </tr>
                      );
                    }

                    // VENDOR CREDIT LEDGER
                    if (effectiveModule === 'store-vendors') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.vendor || item.vendorName}</td>
                          <SheetsEditableCell
                            value={item.category || 'General Supplies'}
                            onSave={(val) => handleCellEdit(item, 'category', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.terms || 'Net 15 Days'}
                            onSave={(val) => handleCellEdit(item, 'terms', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.totalInvoiced || item.invoiced || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'totalInvoiced', val)}
                            cellStyle={{ color: '#60a5fa' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.totalPaid || item.paid || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'totalPaid', val)}
                            cellStyle={{ color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.balanceDue || item.due || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'balanceDue', val)}
                            cellStyle={{ fontWeight: 800, color: '#f87171' }}
                          />
                          <SheetsEditableCell
                            value={item.status || 'Active'}
                            type="select"
                            options={['Current', 'Pending', 'Overdue']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // RECIPE BOM
                    if (effectiveModule === 'store-bom') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.dishName || item.itemName}</td>
                          <SheetsEditableCell
                            value={item.category || 'Main Course'}
                            onSave={(val) => handleCellEdit(item, 'category', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.portionYield || '1 Portion'}
                            onSave={(val) => handleCellEdit(item, 'portionYield', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.rawIngredients || item.ingredientsSummary || 'Raw Ingredients'}
                            onSave={(val) => handleCellEdit(item, 'rawIngredients', val)}
                            cellStyle={{ color: '#e2e8f0' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.baseCost || item.cost || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'baseCost', val)}
                            cellStyle={{ color: '#f59e0b' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.sellingPrice || item.price || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'sellingPrice', val)}
                            cellStyle={{ fontWeight: 700, color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={item.status || 'Active'}
                            type="select"
                            options={['Active', 'Review Required', 'Archived']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // MAINTENANCE & OOO
                    if (effectiveModule === 'maintenance') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.ticketId || item.id || `WO-${idx+1}`}</td>
                          <SheetsEditableCell
                            value={item.roomNumber || item.room_number || 'General'}
                            onSave={(val) => handleCellEdit(item, 'roomNumber', val)}
                            cellStyle={{ fontWeight: 800, color: '#fbbf24' }}
                          />
                          <SheetsEditableCell
                            value={item.category || item.issueCategory || 'Plumbing'}
                            onSave={(val) => handleCellEdit(item, 'category', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.description || item.issueDescription || ''}
                            onSave={(val) => handleCellEdit(item, 'description', val)}
                            cellStyle={{ color: '#e2e8f0' }}
                          />
                          <SheetsEditableCell
                            value={item.technician || item.assignedTo || 'Duty Tech'}
                            onSave={(val) => handleCellEdit(item, 'technician', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.priority || 'Normal'}
                            type="select"
                            options={['Emergency', 'High', 'Normal', 'Low']}
                            onSave={(val) => handleCellEdit(item, 'priority', val)}
                          />
                          <SheetsEditableCell
                            value={item.status || 'Open'}
                            type="select"
                            options={['Open', 'In Progress', 'Resolved', 'Closed']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // TRANSIT & STATION TRANSFERS
                    if (effectiveModule === 'transit') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 800, color: '#38bdf8' }}>{item.roomNumber}</td>
                          <SheetsEditableCell
                            value={item.guestName || 'Guest'}
                            onSave={(val) => handleCellEdit(item, 'guestName', val)}
                            cellStyle={{ fontWeight: 600, color: '#ffffff' }}
                          />
                          <SheetsEditableCell
                            value={item.phone || ''}
                            onSave={(val) => handleCellEdit(item, 'phone', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.origin || item.train || 'Rayagada Train'}
                            onSave={(val) => handleCellEdit(item, 'origin', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.purpose || 'Transit Layover'}
                            onSave={(val) => handleCellEdit(item, 'purpose', val)}
                            cellStyle={{ color: '#e2e8f0' }}
                          />
                          <SheetsEditableCell
                            value={item.slotDuration || '6 Hours'}
                            type="select"
                            options={['3 Hours', '6 Hours', '12 Hours', '24 Hours']}
                            onSave={(val) => handleCellEdit(item, 'slotDuration', val)}
                          />
                          <SheetsEditableCell
                            value={item.checkInTime || '10:00 AM'}
                            onSave={(val) => handleCellEdit(item, 'checkInTime', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.expectedCheckOut || '04:00 PM'}
                            onSave={(val) => handleCellEdit(item, 'expectedCheckOut', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.tariff || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'tariff', val)}
                            cellStyle={{ fontWeight: 800, color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={item.status || 'In-Transit'}
                            type="select"
                            options={['In-Transit', 'Completed', 'Cancelled']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // LOST & FOUND
                    if (effectiveModule === 'lost-found') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.id || item.refNo}</td>
                          <SheetsEditableCell
                            value={item.location || item.roomNumber || 'Room'}
                            onSave={(val) => handleCellEdit(item, 'location', val)}
                            cellStyle={{ fontWeight: 700, color: '#fbbf24' }}
                          />
                          <SheetsEditableCell
                            value={item.item || item.description || 'Article'}
                            onSave={(val) => handleCellEdit(item, 'item', val)}
                            cellStyle={{ color: '#ffffff' }}
                          />
                          <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{item.foundDate || fromDate}</td>
                          <SheetsEditableCell
                            value={item.foundBy || 'Housekeeping'}
                            onSave={(val) => handleCellEdit(item, 'foundBy', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.status || 'In Custody Locker'}
                            type="select"
                            options={['In Custody Locker', 'Claimed & Handed Over', 'Disposed']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                          <SheetsEditableCell
                            value={item.claimedBy || '—'}
                            onSave={(val) => handleCellEdit(item, 'claimedBy', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                        </tr>
                      );
                    }

                    // SHIFT LOGBOOK
                    if (effectiveModule === 'shift-logbook') {
                      const c = Number(item.shiftCashCollected || 0);
                      const u = Number(item.shiftUpiCollected || 0);
                      const total = c + u;
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 800, color: '#38bdf8' }}>{item.shift}</td>
                          <SheetsEditableCell
                            value={item.shiftLead || 'Duty Lead'}
                            onSave={(val) => handleCellEdit(item, 'shiftLead', val)}
                            cellStyle={{ color: '#ffffff', fontWeight: 600 }}
                          />
                          <SheetsEditableCell
                            value={Number(item.openingCash || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'openingCash', val)}
                            cellStyle={{ color: '#fbbf24' }}
                          />
                          <SheetsEditableCell
                            value={c}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'shiftCashCollected', val)}
                            cellStyle={{ color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={u}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'shiftUpiCollected', val)}
                            cellStyle={{ color: '#818cf8' }}
                          />
                          <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                            ₹{total.toLocaleString('en-IN')}
                          </td>
                          <SheetsEditableCell
                            value={item.handoverSigned || 'Pending'}
                            type="select"
                            options={['Signed', 'Pending']}
                            onSave={(val) => handleCellEdit(item, 'handoverSigned', val)}
                          />
                          <SheetsEditableCell
                            value={item.signedAt || '—'}
                            onSave={(val) => handleCellEdit(item, 'signedAt', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                        </tr>
                      );
                    }

                    // HOUSEKEEPING
                    if (effectiveModule === 'housekeeping') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 800, color: '#38bdf8' }}>{item.roomNumber}</td>
                          <td style={{ padding: '8px 14px', color: '#94a3b8' }}>F{item.floor}</td>
                          <SheetsEditableCell
                            value={item.status || 'Available'}
                            type="select"
                            options={['Vacant Clean', 'Vacant Dirty', 'Cleaning', 'Occupied Clean', 'Occupied Dirty', 'Maintenance', 'OOO']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                          <SheetsEditableCell
                            value={item.attendant || (item.floor === 1 ? 'Laxmi Gouda' : 'Kailash Sabar')}
                            onSave={(val) => handleCellEdit(item, 'attendant', val)}
                            cellStyle={{ color: '#ffffff' }}
                          />
                          <SheetsEditableCell
                            value={item.inspectionStatus || 'Inspected'}
                            type="select"
                            options={['Inspected', 'Pending', 'Priority Turnaround']}
                            onSave={(val) => handleCellEdit(item, 'inspectionStatus', val)}
                          />
                          <SheetsEditableCell
                            value={item.linenStatus || 'Par Replaced'}
                            type="select"
                            options={['Par Replaced', 'Laundry Sent', 'Pending']}
                            onSave={(val) => handleCellEdit(item, 'linenStatus', val)}
                          />
                        </tr>
                      );
                    }

                    // LINEN ASSETS
                    if (effectiveModule === 'linen') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.item || item.name}</td>
                          <td style={{ padding: '8px 14px', color: '#cbd5e1' }}>{item.category || 'Bedding'}</td>
                          <SheetsEditableCell
                            value={Number(item.inCirculation || 0)}
                            type="number"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'inCirculation', val)}
                            cellStyle={{ color: '#34d399', fontWeight: 700 }}
                          />
                          <SheetsEditableCell
                            value={Number(item.floorPar || 0)}
                            type="number"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'floorPar', val)}
                            cellStyle={{ color: '#fbbf24' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.laundryCycle || 0)}
                            type="number"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'laundryCycle', val)}
                            cellStyle={{ color: '#818cf8' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.damaged || 0)}
                            type="number"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'damaged', val)}
                            cellStyle={{ color: '#f87171' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.unitCost || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'unitCost', val)}
                            cellStyle={{ color: '#e2e8f0' }}
                          />
                        </tr>
                      );
                    }

                    // STAFF PAYROLL
                    if (effectiveModule === 'staff') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.empId || item.id}</td>
                          <SheetsEditableCell
                            value={item.name || 'Staff Member'}
                            onSave={(val) => handleCellEdit(item, 'name', val)}
                            cellStyle={{ color: '#ffffff', fontWeight: 600 }}
                          />
                          <SheetsEditableCell
                            value={item.department || 'Front Office'}
                            onSave={(val) => handleCellEdit(item, 'department', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.designation || 'Staff'}
                            onSave={(val) => handleCellEdit(item, 'designation', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.daysWorked || 26)}
                            type="number"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'daysWorked', val)}
                            cellStyle={{ color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.monthlySalary || item.salary || 18000)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'monthlySalary', val)}
                            cellStyle={{ color: '#fbbf24', fontWeight: 700 }}
                          />
                          <SheetsEditableCell
                            value={Number(item.payableDues || item.payable || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'payableDues', val)}
                            cellStyle={{ color: '#e2e8f0', fontWeight: 800 }}
                          />
                          <SheetsEditableCell
                            value={item.status || 'Active Duty'}
                            type="select"
                            options={['Active Duty', 'On Leave', 'Relieved']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // CORPORATE & OUTSTANDING
                    if (effectiveModule === 'corporate' || effectiveModule === 'outstanding') {
                      const deb = Number(item.debit || item.totalInvoiced || item.amount || 0);
                      const cred = Number(item.credit || item.totalPaid || item.paid || 0);
                      const bal = Number(item.balanceDue || item.balance || (deb - cred));

                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.client || item.corporate || item.party || 'Corporate Client'}</td>
                          <SheetsEditableCell
                            value={deb}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'debit', val)}
                            cellStyle={{ color: '#60a5fa' }}
                          />
                          <SheetsEditableCell
                            value={cred}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'credit', val)}
                            cellStyle={{ color: '#34d399' }}
                          />
                          <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 800, color: bal > 0 ? '#f87171' : '#34d399' }}>
                            ₹{bal.toLocaleString('en-IN')}
                          </td>
                          <SheetsEditableCell
                            value={Number(item.aging30 || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'aging30', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={Number(item.aging60 || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'aging60', val)}
                            cellStyle={{ color: '#f59e0b' }}
                          />
                          <SheetsEditableCell
                            value={item.status || 'Active'}
                            type="select"
                            options={['Regular', 'Follow-up Required', 'Legal Notice']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // BOOKINGS VISUALIZER
                    if (effectiveModule === 'bookings') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.bookingId || item.id}</td>
                          <td style={{ padding: '8px 14px', fontWeight: 800, color: '#fbbf24' }}>{item.roomNumber}</td>
                          <SheetsEditableCell
                            value={item.guestName || 'Guest'}
                            onSave={(val) => handleCellEdit(item, 'guestName', val)}
                            cellStyle={{ color: '#ffffff', fontWeight: 600 }}
                          />
                          <SheetsEditableCell
                            value={item.guestPhone || item.phone || ''}
                            onSave={(val) => handleCellEdit(item, 'phone', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.checkIn || item.checkInDate || fromDate}
                            onSave={(val) => handleCellEdit(item, 'checkIn', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.checkOut || item.checkOutDate || toDate}
                            onSave={(val) => handleCellEdit(item, 'checkOut', val)}
                            cellStyle={{ color: '#cbd5e1' }}
                          />
                          <SheetsEditableCell
                            value={item.channel || item.source || 'Walk-in'}
                            type="select"
                            options={['Walk-in', 'Direct Call', 'MakeMyTrip', 'Booking.com', 'Corporate']}
                            onSave={(val) => handleCellEdit(item, 'channel', val)}
                          />
                          <SheetsEditableCell
                            value={Number(item.totalAmount || item.tariff || 0)}
                            type="currency"
                            align="right"
                            onSave={(val) => handleCellEdit(item, 'totalAmount', val)}
                            cellStyle={{ fontWeight: 800, color: '#34d399' }}
                          />
                          <SheetsEditableCell
                            value={item.status || 'Confirmed'}
                            type="select"
                            options={['Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled']}
                            onSave={(val) => handleCellEdit(item, 'status', val)}
                          />
                        </tr>
                      );
                    }

                    // DPDP ACT COMPLIANCE
                    if (effectiveModule === 'dpdp') {
                      return (
                        <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.id || `DPDP-${idx+1}`}</td>
                          <SheetsEditableCell
                            value={item.guestName || 'Guest'}
                            onSave={(val) => handleCellEdit(item, 'guestName', val)}
                            cellStyle={{ color: '#ffffff', fontWeight: 600 }}
                          />
                          <SheetsEditableCell
                            value={item.phone || item.guestPhone || ''}
                            onSave={(val) => handleCellEdit(item, 'phone', val)}
                            cellStyle={{ color: '#94a3b8' }}
                          />
                          <SheetsEditableCell
                            value={item.idProofMasked || 'XXXX-XXXX-1234'}
                            onSave={(val) => handleCellEdit(item, 'idProofMasked', val)}
                            cellStyle={{ color: '#a78bfa' }}
                          />
                          <SheetsEditableCell
                            value={item.consentStatus || 'Explicit Granted'}
                            type="select"
                            options={['Explicit Granted', 'Revoked', 'Pending']}
                            onSave={(val) => handleCellEdit(item, 'consentStatus', val)}
                          />
                          <td style={{ padding: '8px 14px', color: '#cbd5e1' }}>Hospitality Stay Record</td>
                          <td style={{ padding: '8px 14px', color: '#10b981' }}>7 Years (Sarai Act)</td>
                        </tr>
                      );
                    }

                    // Generic Fallback Row with SheetsEditableCell
                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        {columns ? columns.map((col, cIdx) => (
                          <SheetsEditableCell
                            key={cIdx}
                            value={item[col.key]}
                            type={col.type || (typeof item[col.key] === 'number' ? 'number' : 'text')}
                            align={col.align || 'left'}
                            onSave={(val) => handleCellEdit(item, col.key, val)}
                          />
                        )) : (
                          Object.keys(item).slice(0, 8).map((k, kIdx) => (
                            <SheetsEditableCell
                              key={kIdx}
                              value={typeof item[k] === 'object' ? JSON.stringify(item[k]) : item[k]}
                              type={typeof item[k] === 'number' ? 'number' : 'text'}
                              onSave={(val) => handleCellEdit(item, k, val)}
                            />
                          ))
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div 
          style={{
            padding: '0.85rem 1.6rem',
            background: '#07101f',
            borderTop: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Interactive Real-Time Spreadsheet Window • Edits sync seamlessly with Master Ledgers</span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px 18px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
            }}
          >
            Close Audit Snapshot
          </button>
        </div>
      </div>
    </div>
  );
}
