import React, { useState, useEffect } from 'react';
import { 
  FileText, Split, CreditCard, DollarSign, CheckCircle2, 
  Printer, Download, ShieldCheck, Clock, User, Bed, 
  UtensilsCrossed, AlertTriangle, Plus, X, ChevronRight, Lock,
  MessageCircle, Edit2, Trash2, Tag, Percent, ArrowRightLeft,
  ArrowRight, ShieldAlert, Check, HelpCircle, Layers, CheckCheck,
  Landmark, ReceiptText, RefreshCw, Building2, Users
} from 'lucide-react';
import { HOTEL_CONFIG, CORPORATE_PARTNERS } from '../data/hotelData';
import { SheetsColumnHeader, SheetsToolbarLegend, SheetsEditableCell } from './UniversalInlineEditor';

export default function MasterFolioModal({
  isOpen,
  onClose,
  rooms = [],
  bookings = [],
  transactions = [],
  onAddTransaction,
  onSettleFolio,
  initialRoomNumber = '402'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Active selected room folio (defaults to initialRoomNumber or '402')
  const [selectedRoom, setSelectedRoom] = useState(String(initialRoomNumber || '402'));

  useEffect(() => {
    if (initialRoomNumber) {
      setSelectedRoom(String(initialRoomNumber));
    }
  }, [initialRoomNumber, isOpen]);

  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger', 'sub-folios', 'split-bills', 'multi-settle'

  // Operational Notification Toast Banner
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Sub-Folio Windows State (Window A: Corporate BTC vs Window B: Personal Extras)
  const [windowAssignments, setWindowAssignments] = useState({});
  const [windowASettled, setWindowASettled] = useState(false);
  const [windowBSettled, setWindowBSettled] = useState(false);

  // Inter-Room Charge Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetTxn, setTransferTargetTxn] = useState(null);
  const [transferDestRoom, setTransferDestRoom] = useState('301');
  const [transferReason, setTransferReason] = useState('Senior Manager company food allowance covers junior officer dining');

  // Disputed Item Escrow State
  const [disputedTxns, setDisputedTxns] = useState({});
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeTargetTxn, setDisputeTargetTxn] = useState(null);
  const [disputeReasonInput, setDisputeReasonInput] = useState('Guest disputes unverified midnight dining KOT; F&B slip audit pending');

  // Colleague 50/50 & Custom Split Invoicing State
  const [splitSubTab, setSplitSubTab] = useState('tax-split'); // 'tax-split' | 'colleague-split'
  const [colleagueSplitRatio, setColleagueSplitRatio] = useState(50); // % for colleague 1
  const [colleague1Name, setColleague1Name] = useState('Anil Sharma (GAIL Regional)');
  const [colleague1Company, setColleague1Company] = useState('GAIL (India) Limited');
  const [colleague1Gstin, setColleague1Gstin] = useState('07AAACG1509J1ZQ');
  const [colleague2Name, setColleague2Name] = useState('Rajesh Verma (GAIL Project)');
  const [colleague2Company, setColleague2Company] = useState('GAIL (India) Limited');
  const [colleague2Gstin, setColleague2Gstin] = useState('07AAACG1509J1ZQ');

  // Security / Caution Deposit State
  const [cautionDeposit, setCautionDeposit] = useState(3000);
  const [cautionDepositApplied, setCautionDepositApplied] = useState(false);
  const [cautionVoucherPrinted, setCautionVoucherPrinted] = useState(false);

  // Split Invoice view state
  const [activeSplitView, setActiveSplitView] = useState('split'); // 'split', 'invoice-a', 'invoice-b'

  // Multi-tender payment state
  const [tenderRows, setTenderRows] = useState([
    { id: 1, mode: 'UPI', amount: 4000, ref: 'UPI/SBI/99182301' },
    { id: 2, mode: 'Cash', amount: 4588, ref: 'Front Desk Cash Drawer' }
  ]);
  const [isSettled, setIsSettled] = useState(false);

  // New Charge Posting Modal inside Folio
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [chargeType, setChargeType] = useState('Food & Beverage');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeOutlet, setChargeOutlet] = useState('Cannon Kitchen');

  // In-place Profile Edit Modal State
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [profileOverrides, setProfileOverrides] = useState({});
  const [formGuestName, setFormGuestName] = useState('');
  const [formGuestPhone, setFormGuestPhone] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formCorporateGstin, setFormCorporateGstin] = useState('');

  // Courtesy Discount Modal State
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percent'
  const [discountVal, setDiscountVal] = useState('500');
  const [discountReason, setDiscountReason] = useState('Managing Director Discretionary Courtesy');

  // Line-Item Void / Credit Note Modal State
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidTargetTxn, setVoidTargetTxn] = useState(null);
  const [voidReason, setVoidReason] = useState('Billing Discrepancy Correction');

  // Filter transactions for currently selected room
  const currentTxns = transactions.filter(t => t.roomNumber === selectedRoom);

  // Find booking details for room (with live profile overrides)
  const baseBooking = bookings.find(b => b.roomNumber === selectedRoom) || {
    guestName: selectedRoom === '402' ? 'Anil Sharma (GAIL Regional)' : 'In-House Guest',
    guestPhone: '+91 98210 44556',
    corporateGstin: selectedRoom === '402' ? '07AAACG1509J1ZQ' : null,
    companyName: selectedRoom === '402' ? 'GAIL (India) Limited' : 'Direct Walk-In'
  };

  const roomBooking = profileOverrides[selectedRoom] || baseBooking;

  // Calculations
  const totalDebits = currentTxns.reduce((sum, t) => sum + (t.debitAmount || 0), 0);
  const totalCredits = currentTxns.reduce((sum, t) => sum + (t.creditAmount || 0), 0);
  const balanceDue = Math.max(0, totalDebits - totalCredits);

  // Escrow & Disputed Items calculation (deducted from active checkout payable balance)
  const totalDisputed = currentTxns.filter(t => disputedTxns[t.transactionId]).reduce((sum, t) => sum + (t.debitAmount || 0), 0);
  const payableBalance = Math.max(0, balanceDue - totalDisputed);
  const effectivePayable = cautionDepositApplied ? Math.max(0, payableBalance - cautionDeposit) : payableBalance;
  const cautionRefundDue = (cautionDepositApplied && cautionDeposit > payableBalance) ? (cautionDeposit - payableBalance) : 0;

  // Sub-Folio Window Assignment helper
  const getItemWindow = (t) => {
    if (windowAssignments[t.transactionId]) {
      return windowAssignments[t.transactionId];
    }
    const isPersonal = t.invoiceCategory === 'Food' || 
                       t.sacCode === '996331' || 
                       t.outlet === 'Cannon Kitchen' ||
                       t.outlet === 'Room Service' ||
                       (t.description && (
                         t.description.toLowerCase().includes('dining') || 
                         t.description.toLowerCase().includes('kitchen') || 
                         t.description.toLowerCase().includes('restaurant') || 
                         t.description.toLowerCase().includes('laundry')
                       ));
    return isPersonal ? 'B' : 'A';
  };

  const handleToggleWindow = (txnId) => {
    const targetTxn = currentTxns.find(t => t.transactionId === txnId);
    const current = windowAssignments[txnId] || getItemWindow(targetTxn || {});
    const next = current === 'A' ? 'B' : 'A';
    setWindowAssignments(prev => ({ ...prev, [txnId]: next }));
    showToast(`✓ Shifted charge to Folio Window ${next} (${next === 'A' ? 'Corporate BTC Master' : 'Personal Guest Extras'})`);
  };

  const windowATxns = currentTxns.filter(t => getItemWindow(t) === 'A');
  const windowBTxns = currentTxns.filter(t => getItemWindow(t) === 'B');

  const windowADebits = windowATxns.reduce((sum, t) => sum + (t.debitAmount || 0), 0);
  const windowACredits = windowATxns.reduce((sum, t) => sum + (t.creditAmount || 0), 0);
  const windowABalance = Math.max(0, windowADebits - windowACredits);

  const windowBDebits = windowBTxns.reduce((sum, t) => sum + (t.debitAmount || 0), 0);
  const windowBCredits = windowBTxns.reduce((sum, t) => sum + (t.creditAmount || 0), 0);
  const windowBBalance = Math.max(0, windowBDebits - windowBCredits);

  // Split calculations
  // Invoice A: Accommodation & Laundry (SAC 996311 / 999799 - 12% / 18%)
  const roomTxns = currentTxns.filter(t => t.invoiceCategory === 'Room');
  const invoiceATotal = roomTxns.reduce((sum, t) => sum + t.debitAmount, 0);

  // Invoice B: Food & Beverage (SAC 996331 - 5%)
  const foodTxns = currentTxns.filter(t => t.invoiceCategory === 'Food');
  const invoiceBTotal = foodTxns.reduce((sum, t) => sum + t.debitAmount, 0);

  // Colleague Split Shares
  const colleague1Share = Math.round((balanceDue * (colleagueSplitRatio / 100)) * 100) / 100;
  const colleague2Share = Math.round((balanceDue - colleague1Share) * 100) / 100;

  const totalTendered = tenderRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const tenderVariance = effectivePayable - totalTendered;

  const handleAddTenderRow = () => {
    setTenderRows([
      ...tenderRows,
      { id: Date.now(), mode: 'Cash', amount: tenderVariance > 0 ? tenderVariance : 0, ref: '' }
    ]);
  };

  const handleRemoveTenderRow = (id) => {
    if (tenderRows.length > 1) {
      setTenderRows(tenderRows.filter(r => r.id !== id));
    }
  };

  const handleUpdateTender = (id, field, value) => {
    setTenderRows(tenderRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handlePostCharge = (e) => {
    e.preventDefault();
    if (!chargeDesc || !chargeAmount) return;

    const amt = parseFloat(chargeAmount);
    const isFood = chargeType.includes('Food') || chargeOutlet === 'Cannon Kitchen' || chargeOutlet === 'Room Service';
    const gstRate = isFood ? 5 : 12;
    const sacCode = isFood ? '996331' : '996311';

    const newTxn = {
      transactionId: `TXN-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: chargeType,
      outlet: chargeOutlet,
      itemCode: `MANUAL-${Date.now().toString().slice(-3)}`,
      description: chargeDesc,
      debitAmount: amt,
      creditAmount: 0,
      taxableBase: amt / (1 + gstRate / 100),
      gstRate,
      cgst: (amt / (1 + gstRate / 100)) * (gstRate / 200),
      sgst: (amt / (1 + gstRate / 100)) * (gstRate / 200),
      sacCode,
      invoiceCategory: isFood ? 'Food' : 'Room',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(newTxn);
    }
    setChargeModalOpen(false);
    setChargeDesc('');
    setChargeAmount('');
  };

  const handleOpenEditProfile = () => {
    setFormGuestName(roomBooking.guestName || '');
    setFormGuestPhone(roomBooking.guestPhone || '');
    setFormCompanyName(roomBooking.companyName || '');
    setFormCorporateGstin(roomBooking.corporateGstin || '');
    setEditProfileModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileOverrides(prev => ({
      ...prev,
      [selectedRoom]: {
        ...roomBooking,
        guestName: formGuestName,
        guestPhone: formGuestPhone,
        companyName: formCompanyName,
        corporateGstin: formCorporateGstin
      }
    }));
    setEditProfileModalOpen(false);
  };

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    const val = parseFloat(discountVal) || 0;
    if (val <= 0) return;

    let discountAmt = val;
    if (discountType === 'percent') {
      discountAmt = Math.round((balanceDue * (val / 100)) * 100) / 100;
    }

    if (discountAmt > balanceDue) {
      discountAmt = balanceDue;
    }

    const discountTxn = {
      transactionId: `ALW-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Allowance',
      outlet: 'Front Desk',
      itemCode: 'DISC-AUTH',
      description: `Manager Allowance (${discountReason})`,
      debitAmount: 0,
      creditAmount: discountAmt,
      taxableBase: discountAmt / 1.12,
      gstRate: 12,
      cgst: (discountAmt / 1.12) * 0.06,
      sgst: (discountAmt / 1.12) * 0.06,
      sacCode: '996311',
      invoiceCategory: 'Room',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(discountTxn);
    }
    setDiscountModalOpen(false);
  };

  const handleAddExtraBed = () => {
    const amt = 560; // ₹500 + 12% GST = ₹560
    const extraBedTxn = {
      transactionId: `BED-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Extra Bed / Rollaway',
      outlet: 'Housekeeping',
      itemCode: 'ROLLAWAY-BED',
      description: 'Extra Rollaway Bed Mattress (Night Tariff)',
      debitAmount: amt,
      creditAmount: 0,
      taxableBase: 500,
      gstRate: 12,
      cgst: 30,
      sgst: 30,
      sacCode: '996311',
      invoiceCategory: 'Room',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(extraBedTxn);
    }
    alert(`🛏️ Added Extra Rollaway Bed (₹500 + 12% GST = ₹560) to Room ${selectedRoom} Folio!`);
  };

  const handleOpenVoid = (txn) => {
    setVoidTargetTxn(txn);
    setVoidModalOpen(true);
  };

  const handleConfirmVoid = (e) => {
    e.preventDefault();
    if (!voidTargetTxn) return;

    const reversalAmt = voidTargetTxn.debitAmount || 0;
    const reversalTxn = {
      transactionId: `CN-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Credit Note / Reversal',
      outlet: voidTargetTxn.outlet,
      itemCode: 'SEC34-CREDIT-NOTE',
      description: `GST Sec 34 Credit Note: Reversal of ${voidTargetTxn.transactionId} (${voidReason})`,
      debitAmount: 0,
      creditAmount: reversalAmt,
      taxableBase: voidTargetTxn.taxableBase || (reversalAmt / (1 + (voidTargetTxn.gstRate || 12) / 100)),
      gstRate: voidTargetTxn.gstRate || 12,
      cgst: voidTargetTxn.cgst || 0,
      sgst: voidTargetTxn.sgst || 0,
      sacCode: voidTargetTxn.sacCode || '996311',
      invoiceCategory: voidTargetTxn.invoiceCategory || 'Room',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(reversalTxn);
    }
    setVoidModalOpen(false);
    setVoidTargetTxn(null);
  };

  const handleSendWhatsAppInvoice = () => {
    const rawPhone = (roomBooking.guestPhone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const message = 
`🏨 *${HOTEL_CONFIG.name.toUpperCase()}, RAYAGADA*
📍 ${HOTEL_CONFIG.address}
📞 ${HOTEL_CONFIG.phone} | GSTIN: ${HOTEL_CONFIG.gstin}
───────────────────────────────
📋 *TAX INVOICE & FOLIO SUMMARY*
Room Number: *${selectedRoom}*
Guest: *${roomBooking.guestName}*
Company: ${roomBooking.companyName || 'Direct Walk-In'}
${roomBooking.corporateGstin ? `Corporate GSTIN: ${roomBooking.corporateGstin}\n` : ''}Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
───────────────────────────────
🛏️ Room Charges (SAC 996311): ₹${invoiceATotal.toFixed(2)}
🍳 Restaurant F&B (SAC 996331): ₹${invoiceBTotal.toFixed(2)}
💰 Gross Debits: ₹${totalDebits.toFixed(2)}
💳 Advances / Paid: ₹${totalCredits.toFixed(2)}
⚖️ *Net Balance Due: ₹${balanceDue.toFixed(2)}*
───────────────────────────────
${balanceDue > 0 ? `💳 Quick UPI Pay: ${HOTEL_CONFIG.upiId}\n` : '✓ Status: FULLY SETTLED & PAID\n'}
🙏 *Thank you for staying at ${HOTEL_CONFIG.name}, Rayagada!*
Divine blessings of sacred Maa Majhighariani.`;

    const encoded = encodeURIComponent(message);
    const targetUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  const handleExecuteSettlement = () => {
    if (tenderVariance !== 0) {
      alert(`Settlement unbalanced! Variance of ₹${tenderVariance.toFixed(2)} must be 0 before checkout.`);
      return;
    }
    setIsSettled(true);
    if (onSettleFolio) {
      onSettleFolio(selectedRoom, tenderRows);
    }
  };

  // 1. Inter-Room Charge Transfer Handlers
  const handleOpenTransfer = (txn) => {
    setTransferTargetTxn(txn);
    const otherRooms = rooms.filter(r => r.roomNumber !== selectedRoom);
    if (otherRooms.length > 0 && !otherRooms.some(r => r.roomNumber === transferDestRoom)) {
      setTransferDestRoom(otherRooms[0].roomNumber);
    }
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!transferTargetTxn) return;

    const amt = transferTargetTxn.debitAmount || 0;
    const destRoom = transferDestRoom;

    // A. Transfer-Out Balancing Credit Memo on Source Room
    const transferOutTxn = {
      transactionId: `XFER-OUT-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Transfer Out',
      outlet: transferTargetTxn.outlet || 'Front Desk',
      itemCode: 'XFER-OUT',
      description: `➡️ TRANSFERRED OUT to Room ${destRoom}: [${transferTargetTxn.transactionId}] ${transferTargetTxn.description} (${transferReason})`,
      debitAmount: 0,
      creditAmount: amt,
      taxableBase: transferTargetTxn.taxableBase || 0,
      gstRate: transferTargetTxn.gstRate || 0,
      cgst: transferTargetTxn.cgst || 0,
      sgst: transferTargetTxn.sgst || 0,
      sacCode: transferTargetTxn.sacCode || '996331',
      invoiceCategory: transferTargetTxn.invoiceCategory || 'Food',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    // B. Transfer-In Debit Charge on Target Room
    const transferInTxn = {
      transactionId: `XFER-IN-${destRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${destRoom}`,
      bookingId: `BOOK-${destRoom}`,
      roomNumber: destRoom,
      transactionType: 'Transfer In',
      outlet: transferTargetTxn.outlet || 'Front Desk',
      itemCode: 'XFER-IN',
      description: `⬅️ TRANSFERRED IN from Room ${selectedRoom}: [${transferTargetTxn.transactionId}] ${transferTargetTxn.description} (${transferReason})`,
      debitAmount: amt,
      creditAmount: 0,
      taxableBase: transferTargetTxn.taxableBase || 0,
      gstRate: transferTargetTxn.gstRate || 0,
      cgst: transferTargetTxn.cgst || 0,
      sgst: transferTargetTxn.sgst || 0,
      sacCode: transferTargetTxn.sacCode || '996331',
      invoiceCategory: transferTargetTxn.invoiceCategory || 'Food',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(transferOutTxn);
      onAddTransaction(transferInTxn);
    }

    setTransferModalOpen(false);
    setTransferTargetTxn(null);
    showToast(`✓ Shifted ₹${amt.toFixed(2)} to Room ${destRoom} successfully! Balancing credit memo logged.`);
  };

  // 2. Disputed Item Escrow Handlers
  const handleOpenDispute = (txn) => {
    setDisputeTargetTxn(txn);
    setDisputeModalOpen(true);
  };

  const handleConfirmDispute = (e) => {
    e.preventDefault();
    if (!disputeTargetTxn) return;
    setDisputedTxns(prev => ({
      ...prev,
      [disputeTargetTxn.transactionId]: {
        reason: disputeReasonInput,
        heldAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        amount: disputeTargetTxn.debitAmount
      }
    }));
    setDisputeModalOpen(false);
    setDisputeTargetTxn(null);
    showToast(`🛡️ Placed in Dispute Escrow! ₹${(disputeTargetTxn.debitAmount || 0).toFixed(2)} excluded from payable checkout total.`);
  };

  const handleResolveDispute = (txnId, resolutionType) => {
    const txn = currentTxns.find(t => t.transactionId === txnId);
    if (!txn) return;

    if (resolutionType === 'release') {
      setDisputedTxns(prev => {
        const next = { ...prev };
        delete next[txnId];
        return next;
      });
      showToast(`✓ Dispute resolved: Charge re-admitted to active folio upon signed voucher verification.`);
    } else if (resolutionType === 'waive') {
      setDisputedTxns(prev => {
        const next = { ...prev };
        delete next[txnId];
        return next;
      });
      handleOpenVoid(txn);
    }
  };

  // 3. Sub-Folio Settlements
  const handleSettleWindowA = () => {
    const settleTx = {
      transactionId: `BTC-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Settlement BTC',
      outlet: 'Front Desk',
      itemCode: 'BTC-SETTLE',
      description: `Corporate BTC Settlement: ${roomBooking.companyName || 'Corporate Partner'} (SAC 996311 Ledger)`,
      debitAmount: 0,
      creditAmount: windowABalance,
      taxableBase: 0,
      gstRate: 0,
      cgst: 0,
      sgst: 0,
      sacCode: '996311',
      invoiceCategory: 'Room',
      isLocked: 1,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    if (onAddTransaction) onAddTransaction(settleTx);
    setWindowASettled(true);
    showToast(`✓ Window A (Corporate BTC: ₹${windowABalance.toFixed(2)}) settled to Company Ledger!`);
  };

  const handleSettleWindowB = () => {
    const settleTx = {
      transactionId: `DIR-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Settlement Guest',
      outlet: 'Front Desk',
      itemCode: 'GUEST-SETTLE',
      description: `Personal Extras Settlement: ${roomBooking.guestName} (UPI / Cash / Card)`,
      debitAmount: 0,
      creditAmount: windowBBalance,
      taxableBase: 0,
      gstRate: 0,
      cgst: 0,
      sgst: 0,
      sacCode: '996331',
      invoiceCategory: 'Food',
      isLocked: 1,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    if (onAddTransaction) onAddTransaction(settleTx);
    setWindowBSettled(true);
    showToast(`✓ Window B (Personal Extras: ₹${windowBBalance.toFixed(2)}) settled directly by guest!`);
  };

  // 4. Colleague Split WhatsApp
  const handleSendColleagueWhatsApp = (colleagueNum) => {
    const isFirst = colleagueNum === 1;
    const name = isFirst ? colleague1Name : colleague2Name;
    const comp = isFirst ? colleague1Company : colleague2Company;
    const gstin = isFirst ? colleague1Gstin : colleague2Gstin;
    const share = isFirst ? colleague1Share : colleague2Share;
    const pct = isFirst ? colleagueSplitRatio : (100 - colleagueSplitRatio);

    const msg = `🏨 *${HOTEL_CONFIG.name.toUpperCase()}, RAYAGADA*
📍 ${HOTEL_CONFIG.address}
📞 ${HOTEL_CONFIG.phone} | GSTIN: ${HOTEL_CONFIG.gstin}
───────────────────────────────
👥 *SHARED ROOM TAX INVOICE (COLLEAGUE SPLIT - ${pct}%)*
Room: *${selectedRoom}* | Invoice Part: *${isFirst ? 'A' : 'B'}*
Billed To: *${name}*
Company: ${comp}
${gstin ? `Corporate GSTIN: ${gstin}\n` : ''}Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
───────────────────────────────
💰 Total Room Ledger: ₹${balanceDue.toFixed(2)}
⚖️ *Your Share (${pct}%): ₹${share.toFixed(2)}*
Includes 12% GST on Room & 5% GST on Restaurant dining.
───────────────────────────────
💳 Quick UPI Payment: ${HOTEL_CONFIG.upiId}
🙏 Thank you for choosing ${HOTEL_CONFIG.name}!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel printable-sheet printable-folio" style={{
        width: '100%',
        maxWidth: 1280,
        maxHeight: '94vh',
        overflowY: 'auto',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Bar */}
        <div className="no-print" style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(20,25,45,0.9), rgba(10,14,28,0.95))',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              </span>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Master Guest Folio &amp; Split Billing Console
              </h2>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Single source of truth double-entry ledger • Zero ₹17k discrepancies • Permanent F&B binding
            </p>
          </div>

          {/* Room Selector Pills & Quick Dispatch Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Folio:</span>
            {['402', '301', '104'].map(rNum => (
              <button
                key={rNum}
                onClick={() => { setSelectedRoom(rNum); setIsSettled(false); }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedRoom === rNum ? 'var(--gold-primary)' : 'rgba(255,255,255,0.06)',
                  color: selectedRoom === rNum ? '#000' : 'var(--text-primary)',
                  border: selectedRoom === rNum ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Room {rNum} {rNum === '402' ? '(GAIL B2B)' : rNum === '301' ? '(Executive)' : '(Standard)'}
              </button>
            ))}

            <button
              onClick={handleSendWhatsAppInvoice}
              style={{
                padding: '0.42rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: '#25D366',
                color: '#060e1a',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
              }}
              title="Send Official Tax Invoice & Payment Link on WhatsApp"
            >
              <MessageCircle size={15} /> WhatsApp Invoice
            </button>

            <button
              onClick={() => window.print()}
              style={{
                padding: '0.42rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Printer size={15} /> Print
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                width: 36,
                height: 36,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {toastMessage && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.15)',
            borderBottom: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            padding: '0.65rem 2rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} /> {toastMessage}
          </div>
        )}

        {/* Guest Folio Summary Card */}
        <div style={{
          padding: '1.25rem 2rem',
          background: 'rgba(212, 175, 55, 0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guest Name / Corporate</div>
              <button 
                onClick={handleOpenEditProfile}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold-glow)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: 600
                }}
              >
                <Edit2 size={12} /> Edit Profile
              </button>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{roomBooking.guestName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-glow)' }}>{roomBooking.companyName} • {roomBooking.guestPhone}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corporate GSTIN</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
              {roomBooking.corporateGstin || 'B2C Direct Walk-in'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAC: 996311 (Room) / 996331 (F&B)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Debits (Gross)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#60a5fa' }}>₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentTxns.length} Ledger Line Items</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Advance & Credits</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Bank / UPI Receipts</div>
          </div>

          {totalDisputed > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldAlert size={12} /> Disputed in Escrow
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fbbf24' }}>
                -₹{totalDisputed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>Excluded from checkout</div>
            </div>
          )}

          {cautionDepositApplied && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={12} /> Caution Deposit
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>
                -₹{cautionDeposit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Applied against folio</div>
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {cautionRefundDue > 0 ? 'Refund Due to Guest' : 'Payable at Checkout'}
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: cautionRefundDue > 0 ? '#34d399' : (effectivePayable > 0 ? '#f87171' : '#34d399') }}>
              ₹{(cautionRefundDue > 0 ? cautionRefundDue : effectivePayable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: cautionRefundDue > 0 ? '#34d399' : (effectivePayable === 0 ? '#34d399' : '#f87171') }}>
              {cautionRefundDue > 0 ? '✓ Key Return Cash Refund' : (effectivePayable === 0 ? '✓ Folio Fully Cleared' : 'Pending Multi-Mode Settlement')}
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10, 14, 25, 0.5)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('ledger')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'ledger' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              color: activeTab === 'ledger' ? 'var(--gold-glow)' : 'var(--text-muted)',
              border: activeTab === 'ledger' ? '1px solid var(--gold-glow)' : '1px solid transparent'
            }}
          >
            <FileText size={16} /> Master Folio Ledger ({currentTxns.length})
          </button>

          <button
            onClick={() => setActiveTab('sub-folios')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'sub-folios' ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
              color: activeTab === 'sub-folios' ? '#c084fc' : 'var(--text-muted)',
              border: activeTab === 'sub-folios' ? '1px solid #c084fc' : '1px solid transparent'
            }}
          >
            <Layers size={16} /> Sub-Folio Windows (Window A: Corporate BTC | Window B: Personal)
          </button>

          <button
            onClick={() => setActiveTab('split-bills')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'split-bills' ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
              color: activeTab === 'split-bills' ? '#60a5fa' : 'var(--text-muted)',
              border: activeTab === 'split-bills' ? '1px solid #60a5fa' : '1px solid transparent'
            }}
          >
            <Split size={16} /> Split Invoicing (Room vs Food &amp; Colleague 50/50)
          </button>

          <button
            onClick={() => setActiveTab('multi-settle')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'multi-settle' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
              color: activeTab === 'multi-settle' ? '#34d399' : 'var(--text-muted)',
              border: activeTab === 'multi-settle' ? '1px solid #34d399' : '1px solid transparent'
            }}
          >
            <CreditCard size={16} /> Multi-Tender &amp; Caution Money Settlement
          </button>
        </div>

        {/* Tab 1: Master Folio Ledger */}
        {activeTab === 'ledger' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            {totalDisputed > 0 && (
              <div style={{
                background: 'rgba(251, 191, 36, 0.12)',
                border: '1px solid rgba(251, 191, 36, 0.35)',
                borderRadius: '8px',
                padding: '0.75rem 1.25rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fbbf24', fontSize: '0.85rem' }}>
                  <ShieldAlert size={18} />
                  <span>
                    <strong>Dispute Escrow Active:</strong> ₹{totalDisputed.toFixed(2)} held under review. Guest can settle remaining ₹{effectivePayable.toFixed(2)} and depart without cashier blockage.
                  </span>
                </div>
                <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid #fbbf24' }}>
                  Duty Manager Investigation Pending
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Master Folio Account Entries</h3>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Immutable audit trail. Every room rent, Cannon Kitchen order, and laundry voucher is tracked.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setChargeModalOpen(true)}
                  className="btn-primary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={14} /> Post Debit / KOT
                </button>
                <button
                  onClick={() => setDiscountModalOpen(true)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid var(--gold-glow)',
                    color: 'var(--gold-glow)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Tag size={14} /> Courtesy Allowance
                </button>
                <button
                  onClick={handleAddExtraBed}
                  style={{
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Bed size={14} /> + Extra Bed (₹560)
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <SheetsToolbarLegend 
                tableName={`Master Folio Multi-Room & Group Ledger • Room ${selectedRoom}`} 
                subtitle="Live Interactive Google Sheets Mode • Click any cell to edit inline • Enter to save"
              />
              <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <SheetsColumnHeader title="Txn ID / Time" badge="locked" style={{ padding: '0.75rem 1rem' }} />
                    <SheetsColumnHeader title="Outlet / Type" badge="locked" style={{ padding: '0.75rem 1rem' }} />
                    <SheetsColumnHeader title="Description" badge="editable" style={{ padding: '0.75rem 1rem' }} />
                    <SheetsColumnHeader title="SAC / HSN" badge="editable" align="center" style={{ padding: '0.75rem 1rem', width: '95px' }} />
                    <SheetsColumnHeader title="GST Rate" badge="editable" align="center" style={{ padding: '0.75rem 1rem', width: '100px' }} />
                    <SheetsColumnHeader title="Debit (₹)" badge="editable" align="right" style={{ padding: '0.75rem 1rem', width: '120px' }} />
                    <SheetsColumnHeader title="Credit (₹)" badge="editable" align="right" style={{ padding: '0.75rem 1rem', width: '120px' }} />
                    <SheetsColumnHeader title="Audit Status" badge="locked" align="center" style={{ padding: '0.75rem 1rem', width: '120px' }} />
                    <SheetsColumnHeader title="Action" badge="locked" align="center" style={{ padding: '0.75rem 1rem', width: '100px' }} />
                  </tr>
                </thead>
                <tbody>
                  {currentTxns.map((txn, idx) => {
                    const isDisputed = !!disputedTxns[txn.transactionId];
                    return (
                      <tr 
                        key={txn.transactionId}
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isDisputed ? 'rgba(251, 191, 36, 0.08)' : (idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'),
                          borderLeft: isDisputed ? '3px solid #fbbf24' : 'none'
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{txn.transactionId}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.createdAt}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className="badge" style={{
                            background: txn.outlet === 'Cannon Kitchen' ? 'rgba(245, 158, 11, 0.2)' : (txn.transactionType === 'Payment' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(96, 165, 250, 0.2)'),
                            color: txn.outlet === 'Cannon Kitchen' ? '#fbbf24' : (txn.transactionType === 'Payment' ? '#34d399' : '#60a5fa'),
                            fontSize: '0.75rem'
                          }}>
                            {txn.outlet}
                          </span>
                        </td>
                        <SheetsEditableCell
                          value={txn.description}
                          type="text"
                          cellStyle={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: 500 }}
                          onSave={(newVal) => {
                            txn.description = newVal;
                          }}
                        />
                        <SheetsEditableCell
                          value={txn.sacCode || '-'}
                          type="text"
                          align="center"
                          cellStyle={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#fbbf24' }}
                          onSave={(newVal) => {
                            txn.sacCode = newVal;
                          }}
                        />
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {txn.gstRate > 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {txn.gstRate}% (C:{txn.cgst.toFixed(1)} S:{txn.sgst.toFixed(1)})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                          )}
                        </td>
                        <SheetsEditableCell
                          value={txn.debitAmount || 0}
                          type="currency"
                          align="right"
                          className="cell-num"
                          min={0}
                          cellStyle={{ padding: '0.85rem 1rem', fontWeight: 600, color: txn.debitAmount > 0 ? '#f87171' : 'var(--text-muted)' }}
                          onSave={(newVal) => {
                            txn.debitAmount = Number(newVal);
                          }}
                        />
                        <SheetsEditableCell
                          value={txn.creditAmount || 0}
                          type="currency"
                          align="right"
                          className="cell-num"
                          min={0}
                          cellStyle={{ padding: '0.85rem 1rem', fontWeight: 600, color: txn.creditAmount > 0 ? '#34d399' : 'var(--text-muted)' }}
                          onSave={(newVal) => {
                            txn.creditAmount = Number(newVal);
                          }}
                        />
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          {isDisputed ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>
                              <ShieldAlert size={12} /> Under Escrow
                            </span>
                          ) : txn.isLocked ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                              <Lock size={12} /> 12 AM Locked
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#34d399', fontSize: '0.75rem' }}>
                              <CheckCircle2 size={12} /> Open Folio
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', flexWrap: 'nowrap' }}>
                            {txn.debitAmount > 0 && !txn.isLocked && (
                              <>
                                {/* Void / Credit Note */}
                                <button
                                  onClick={() => handleOpenVoid(txn)}
                                  title="Issue Credit Note Reversal (Sec 34 CGST Act)"
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    padding: '3px 7px',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <Trash2 size={11} /> Void
                                </button>

                                {/* Inter-Room Transfer */}
                                <button
                                  onClick={() => handleOpenTransfer(txn)}
                                  title="Transfer this charge to another room folio"
                                  style={{
                                    background: 'rgba(167, 139, 250, 0.15)',
                                    color: '#c084fc',
                                    border: '1px solid rgba(167, 139, 250, 0.35)',
                                    padding: '3px 7px',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <ArrowRightLeft size={11} /> Transfer
                                </button>

                                {/* Dispute / Escrow Hold */}
                                {!isDisputed ? (
                                  <button
                                    onClick={() => handleOpenDispute(txn)}
                                    title="Place charge into Dispute Escrow (excludes from checkout payable total)"
                                    style={{
                                      background: 'rgba(251, 191, 36, 0.15)',
                                      color: '#fbbf24',
                                      border: '1px solid rgba(251, 191, 36, 0.35)',
                                      padding: '3px 7px',
                                      borderRadius: '5px',
                                      fontSize: '0.72rem',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <ShieldAlert size={11} /> Escrow
                                  </button>
                                ) : (
                                  <div style={{ display: 'inline-flex', gap: '3px' }}>
                                    <button
                                      onClick={() => handleResolveDispute(txn.transactionId, 'release')}
                                      title="Dispute Resolved: Re-admit to payable bill"
                                      style={{
                                        background: 'rgba(52, 211, 153, 0.2)',
                                        color: '#34d399',
                                        border: '1px solid #34d399',
                                        padding: '3px 6px',
                                        borderRadius: '5px',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        fontWeight: 700
                                      }}
                                    >
                                      ✓ Release
                                    </button>
                                    <button
                                      onClick={() => handleResolveDispute(txn.transactionId, 'waive')}
                                      title="Dispute Upheld: Waive & Write Off"
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        color: '#f87171',
                                        border: '1px solid #f87171',
                                        padding: '3px 6px',
                                        borderRadius: '5px',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        fontWeight: 700
                                      }}
                                    >
                                      ✕ Waive
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'rgba(212, 175, 55, 0.08)', fontWeight: 700 }}>
                    <td colSpan={5} style={{ padding: '1rem', color: 'var(--gold-glow)' }}>
                      LEDGER RECONCILIATION SUMMARY (ROOM {selectedRoom})
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#f87171' }}>
                      ₹{totalDebits.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#34d399' }}>
                      ₹{totalCredits.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: effectivePayable > 0 ? '#f87171' : '#34d399' }}>
                      Payable: ₹{effectivePayable.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Sub-Folio Windows (Window A: Corporate Master BTC | Window B: Personal Extras) */}
        {activeTab === 'sub-folios' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(56,189,248,0.08))',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Layers size={16} /> ENTERPRISE SUB-FOLIO ARCHITECTURE (OPERA / IDS NEXT PROTOCOL)
                </div>
                <h4 style={{ color: '#fff', margin: '0.25rem 0', fontSize: '1.1rem' }}>
                  Dual-Window Billing Routing • Room {selectedRoom}
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: 750 }}>
                  Separates company-reimbursable accommodation charges (Window A → BTC Invoice with Corporate GSTIN) from personal dining, mini-bar, and personal incidentals (Window B → Guest UPI/Cash Receipt).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setWindowAssignments({});
                    showToast('✓ Reset routing rules: Tariff to Window A (Corporate), F&B to Window B (Personal)');
                  }}
                  className="btn-outline"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={13} /> Reset Auto-Routing
                </button>
              </div>
            </div>

            {/* Dual Sub-Folio Windows Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
              {/* WINDOW A: CORPORATE MASTER / BILL-TO-COMPANY */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(167, 139, 250, 0.35)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(167, 139, 250, 0.25)', color: '#c084fc', border: '1px solid #c084fc', fontWeight: 700 }}>
                        WINDOW A • CORPORATE MASTER (BTC)
                      </span>
                      {windowASettled && (
                        <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #34d399' }}>
                          ✓ BTC Settled
                        </span>
                      )}
                    </div>
                    <h4 style={{ color: '#fff', margin: '0.4rem 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
                      {roomBooking.companyName || 'Corporate Partner Account'}
                    </h4>
                    <div style={{ fontSize: '0.75rem', color: '#c084fc', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      GSTIN: {roomBooking.corporateGstin || '21AAACB2528H1ZA'} • Direct Company Ledger
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Window A Balance</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: windowABalance > 0 ? '#c084fc' : '#34d399' }}>
                      ₹{windowABalance.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Items in Window A */}
                <div style={{ flex: 1, overflowX: 'auto', marginBottom: '1rem' }}>
                  <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th style={{ padding: '0.5rem 0' }}>Item / Description</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>SAC</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount (₹)</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Routing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {windowATxns.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No charges in Window A. Click "→ Personal (B)" from Window B to shift.
                          </td>
                        </tr>
                      ) : (
                        windowATxns.map(t => (
                          <tr key={t.transactionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.55rem 0', color: '#fff' }}>
                              <div style={{ fontWeight: 600 }}>{t.description}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.transactionId}</div>
                            </td>
                            <td style={{ padding: '0.55rem 0', textAlign: 'center', fontFamily: 'monospace', color: '#fbbf24' }}>
                              {t.sacCode}
                            </td>
                            <td style={{ padding: '0.55rem 0', textAlign: 'right', fontWeight: 600, color: '#c084fc' }}>
                              ₹{t.debitAmount.toFixed(2)}
                            </td>
                            <td style={{ padding: '0.55rem 0', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleWindow(t.transactionId)}
                                title="Move this line item to Personal Folio (Window B)"
                                style={{
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  color: '#38bdf8',
                                  border: '1px solid rgba(56, 189, 248, 0.35)',
                                  borderRadius: '4px',
                                  padding: '2px 7px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                → Personal (B)
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => alert(`Printing Official Corporate BTC Tax Invoice for ${roomBooking.companyName || 'Corporate Partner'} (SAC 996311 • ₹${windowABalance.toFixed(2)})`)}
                    className="btn-outline"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Printer size={13} /> Print Corporate Invoice A
                  </button>

                  <button
                    type="button"
                    onClick={handleSettleWindowA}
                    disabled={windowASettled || windowABalance === 0}
                    style={{
                      background: windowASettled ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      color: windowASettled ? '#34d399' : '#fff',
                      border: windowASettled ? '1px solid #34d399' : 'none',
                      borderRadius: '6px',
                      padding: '0.45rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: (windowASettled || windowABalance === 0) ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <CheckCheck size={14} /> {windowASettled ? '✓ Settle to BTC Complete' : `Settle Window A (₹${windowABalance.toFixed(2)}) to BTC`}
                  </button>
                </div>
              </div>

              {/* WINDOW B: PERSONAL GUEST EXTRAS */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', border: '1px solid #38bdf8', fontWeight: 700 }}>
                        WINDOW B • PERSONAL EXTRAS
                      </span>
                      {windowBSettled && (
                        <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #34d399' }}>
                          ✓ Guest Paid
                        </span>
                      )}
                    </div>
                    <h4 style={{ color: '#fff', margin: '0.4rem 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
                      {roomBooking.guestName || 'In-House Guest'}
                    </h4>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                      Phone: {roomBooking.guestPhone || '+91 98210 44556'} • Direct UPI / Cash / Card
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Window B Balance</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: windowBBalance > 0 ? '#38bdf8' : '#34d399' }}>
                      ₹{windowBBalance.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Items in Window B */}
                <div style={{ flex: 1, overflowX: 'auto', marginBottom: '1rem' }}>
                  <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th style={{ padding: '0.5rem 0' }}>Item / Description</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>SAC</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount (₹)</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Routing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {windowBTxns.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No personal extras in Window B.
                          </td>
                        </tr>
                      ) : (
                        windowBTxns.map(t => (
                          <tr key={t.transactionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.55rem 0', color: '#fff' }}>
                              <div style={{ fontWeight: 600 }}>{t.description}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.transactionId}</div>
                            </td>
                            <td style={{ padding: '0.55rem 0', textAlign: 'center', fontFamily: 'monospace', color: '#fbbf24' }}>
                              {t.sacCode}
                            </td>
                            <td style={{ padding: '0.55rem 0', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                              ₹{t.debitAmount.toFixed(2)}
                            </td>
                            <td style={{ padding: '0.55rem 0', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleWindow(t.transactionId)}
                                title="Move this line item to Corporate Master (Window A)"
                                style={{
                                  background: 'rgba(167, 139, 250, 0.15)',
                                  color: '#c084fc',
                                  border: '1px solid rgba(167, 139, 250, 0.35)',
                                  borderRadius: '4px',
                                  padding: '2px 7px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                ← Corporate (A)
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => alert(`Printing Personal Extras Bill for ${roomBooking.guestName || 'Guest'} (SAC 996331 • ₹${windowBBalance.toFixed(2)})`)}
                    className="btn-outline"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Printer size={13} /> Print Guest Bill B
                  </button>

                  <button
                    type="button"
                    onClick={handleSettleWindowB}
                    disabled={windowBSettled || windowBBalance === 0}
                    style={{
                      background: windowBSettled ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: windowBSettled ? '#34d399' : '#fff',
                      border: windowBSettled ? '1px solid #34d399' : 'none',
                      borderRadius: '6px',
                      padding: '0.45rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: (windowBSettled || windowBBalance === 0) ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <CheckCheck size={14} /> {windowBSettled ? '✓ Personal Settle Complete' : `Settle Window B (₹${windowBBalance.toFixed(2)}) via UPI/Card`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Split Invoicing (Tax Split & Colleague 50/50 Split) */}
        {activeTab === 'split-bills' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            {/* Split Sub-Tabs Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSplitSubTab('tax-split')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: splitSubTab === 'tax-split' ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                  color: splitSubTab === 'tax-split' ? '#60a5fa' : 'var(--text-muted)',
                  border: splitSubTab === 'tax-split' ? '1px solid #60a5fa' : '1px solid transparent'
                }}
              >
                📋 Statutory Tax Split (Room 12% vs Food 5%)
              </button>
              <button
                type="button"
                onClick={() => setSplitSubTab('colleague-split')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: splitSubTab === 'colleague-split' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                  color: splitSubTab === 'colleague-split' ? '#34d399' : 'var(--text-muted)',
                  border: splitSubTab === 'colleague-split' ? '1px solid #34d399' : '1px solid transparent'
                }}
              >
                👥 Colleague 50/50 &amp; Custom % Bill Split
              </button>
            </div>

            {/* SUB-VIEW A: STATUTORY TAX CATEGORY SPLIT (ROOM 12% VS FOOD 5%) */}
            {splitSubTab === 'tax-split' && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(16,185,129,0.08))',
                  border: '1px solid rgba(96,165,250,0.3)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem' }}>
                      <Split size={16} /> THE CORPORATE SPLIT-INVOICING ENGINE (ROOM 402 CASE)
                    </div>
                    <h4 style={{ color: '#fff', margin: '0.25rem 0', fontSize: '1.1rem' }}>
                      Total Folio: ₹{totalDebits.toFixed(2)} Split into Two GST-Compliant Tax Invoices
                    </h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Corporate clients (GAIL, JK Paper) reject combined bills due to distinct food per-diem limits and differing GST rates (12% vs 5%).
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setActiveSplitView('split')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeSplitView === 'split' ? '#60a5fa' : 'rgba(255,255,255,0.08)',
                        color: activeSplitView === 'split' ? '#000' : '#fff',
                        border: 'none'
                      }}
                    >
                      Side-by-Side Split View
                    </button>
                    <button
                      onClick={() => setActiveSplitView('invoice-a')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeSplitView === 'invoice-a' ? '#38bdf8' : 'rgba(255,255,255,0.08)',
                        color: activeSplitView === 'invoice-a' ? '#000' : '#fff',
                        border: 'none'
                      }}
                    >
                      Invoice A (Room 12%)
                    </button>
                    <button
                      onClick={() => setActiveSplitView('invoice-b')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeSplitView === 'invoice-b' ? '#34d399' : 'rgba(255,255,255,0.08)',
                        color: activeSplitView === 'invoice-b' ? '#000' : '#fff',
                        border: 'none'
                      }}
                    >
                      Invoice B (Food 5%)
                    </button>
                  </div>
                </div>

                {/* Side-by-side Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
                  {/* INVOICE A: ROOM TARIFF & ACCOMMODATION */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>INVOICE A: ACCOMMODATION</span>
                        <h4 style={{ color: '#fff', margin: '0.4rem 0 0', fontSize: '1.05rem' }}>Tax Invoice #INV-ROOM-202609-0402</h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAC Code: 996311 • GST 12% (CGST 6% + SGST 6%)</div>
                      </div>
                      <button 
                        onClick={() => alert("Printing Official Tax Invoice A (Room Tariff) for Corporate Reimbursement")}
                        className="btn-outline" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Printer size={14} /> Print Bill A
                      </button>
                    </div>

                    <div style={{ flex: 1 }}>
                      <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '0.5rem 0' }}>Item / Service</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Taxable Base</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>GST (12%/18%)</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomTxns.map(t => (
                            <tr key={t.transactionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '0.6rem 0', color: '#fff' }}>{t.description}</td>
                              <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>₹{t.taxableBase.toFixed(2)}</td>
                              <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>₹{(t.cgst + t.sgst).toFixed(2)}</td>
                              <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>₹{t.debitAmount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                        <span>Invoice A Net Total:</span>
                        <span style={{ color: '#38bdf8' }}>₹{invoiceATotal.toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>
                        ✓ Eligible for Corporate Input Tax Credit (ITC) under GSTR-2B
                      </div>
                    </div>
                  </div>

                  {/* INVOICE B: FOOD & BEVERAGE */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>INVOICE B: RESTAURANT &amp; DINING</span>
                        <h4 style={{ color: '#fff', margin: '0.4rem 0 0', fontSize: '1.05rem' }}>Tax Invoice #INV-FOOD-202609-0402</h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAC Code: 996331 • GST 5% (CGST 2.5% + SGST 2.5%)</div>
                      </div>
                      <button 
                        onClick={() => alert("Printing Official Tax Invoice B (Cannon Kitchen Food Bill) for Corporate Per-Diem Reimbursement")}
                        className="btn-outline" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Printer size={14} /> Print Bill B
                      </button>
                    </div>

                    <div style={{ flex: 1 }}>
                      <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '0.5rem 0' }}>Item / Outlet</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Taxable Base</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>GST (5%)</th>
                            <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {foodTxns.map(t => (
                            <tr key={t.transactionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '0.6rem 0', color: '#fff' }}>{t.description}</td>
                              <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>₹{t.taxableBase.toFixed(2)}</td>
                              <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>₹{(t.cgst + t.sgst).toFixed(2)}</td>
                              <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, color: '#34d399' }}>₹{t.debitAmount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                        <span>Invoice B Net Total:</span>
                        <span style={{ color: '#34d399' }}>₹{invoiceBTotal.toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Food expenses billed cleanly without ITC as per statutory GST restaurant rules
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW B: COLLEAGUE 50/50 & CUSTOM % SPLIT */}
            {splitSubTab === 'colleague-split' && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(56,189,248,0.08))',
                  border: '1px solid rgba(52,211,153,0.3)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Users size={16} /> SHARED ROOM COLLEAGUE BILL SPLIT
                    </div>
                    <h4 style={{ color: '#fff', margin: '0.25rem 0', fontSize: '1.1rem' }}>
                      Total Folio ₹{balanceDue.toFixed(2)} Divided between Two In-House Guests
                    </h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Generates two independent tax invoices with separate GSTINs and names for company travel claims.
                    </p>
                  </div>

                  {/* Ratio Selector Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Split Ratio:</span>
                    {[
                      { label: '50% / 50% (Equal)', val: 50 },
                      { label: '60% / 40%', val: 60 },
                      { label: '70% / 30%', val: 70 },
                      { label: '80% / 20%', val: 80 }
                    ].map(r => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => setColleagueSplitRatio(r.val)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: colleagueSplitRatio === r.val ? 'var(--gold-primary)' : 'rgba(255,255,255,0.06)',
                          color: colleagueSplitRatio === r.val ? '#000' : 'var(--text-primary)',
                          border: colleagueSplitRatio === r.val ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colleague 1 & Colleague 2 Split Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
                  {/* COLLEAGUE 1 CARD */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(96, 165, 250, 0.35)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <span className="badge" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa', fontWeight: 700 }}>
                        COLLEAGUE 1 • SHARE ({colleagueSplitRatio}%)
                      </span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa' }}>
                        ₹{colleague1Share.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Guest Name</label>
                        <input
                          type="text"
                          value={colleague1Name}
                          onChange={(e) => setColleague1Name(e.target.value)}
                          className="form-input"
                          style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Company Name</label>
                          <input
                            type="text"
                            value={colleague1Company}
                            onChange={(e) => setColleague1Company(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Corporate GSTIN</label>
                          <input
                            type="text"
                            value={colleague1Gstin}
                            onChange={(e) => setColleague1Gstin(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.45rem', fontSize: '0.82rem', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        <span>Taxable Share ({colleagueSplitRatio}%):</span>
                        <span>₹{(colleague1Share / 1.12).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        <span>Applicable GST (CGST 6% + SGST 6%):</span>
                        <span>₹{(colleague1Share - (colleague1Share / 1.12)).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.35rem' }}>
                        <span>Invoice Part A Total:</span>
                        <span style={{ color: '#60a5fa' }}>₹{colleague1Share.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleSendColleagueWhatsApp(1)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, background: '#25D366', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <MessageCircle size={14} /> WhatsApp Invoice A
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Printing Tax Invoice Part A for ${colleague1Name} (Share: ₹${colleague1Share.toFixed(2)})`)}
                        className="btn-outline"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Printer size={14} /> Print Bill A
                      </button>
                    </div>
                  </div>

                  {/* COLLEAGUE 2 CARD */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 700 }}>
                        COLLEAGUE 2 • SHARE ({100 - colleagueSplitRatio}%)
                      </span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
                        ₹{colleague2Share.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Guest Name</label>
                        <input
                          type="text"
                          value={colleague2Name}
                          onChange={(e) => setColleague2Name(e.target.value)}
                          className="form-input"
                          style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Company Name</label>
                          <input
                            type="text"
                            value={colleague2Company}
                            onChange={(e) => setColleague2Company(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Corporate GSTIN</label>
                          <input
                            type="text"
                            value={colleague2Gstin}
                            onChange={(e) => setColleague2Gstin(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.45rem', fontSize: '0.82rem', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        <span>Taxable Share ({100 - colleagueSplitRatio}%):</span>
                        <span>₹{(colleague2Share / 1.12).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        <span>Applicable GST (CGST 6% + SGST 6%):</span>
                        <span>₹{(colleague2Share - (colleague2Share / 1.12)).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.35rem' }}>
                        <span>Invoice Part B Total:</span>
                        <span style={{ color: '#34d399' }}>₹{colleague2Share.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleSendColleagueWhatsApp(2)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, background: '#25D366', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <MessageCircle size={14} /> WhatsApp Invoice B
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Printing Tax Invoice Part B for ${colleague2Name} (Share: ₹${colleague2Share.toFixed(2)})`)}
                        className="btn-outline"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Printer size={14} /> Print Bill B
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Multi-Tender & Caution Money Payment Settlement Dialog */}
        {activeTab === 'multi-settle' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              {/* Caution / Security Deposit Reconciliation Card */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
                      <ShieldCheck size={16} /> CAUTION / SECURITY DEPOSIT RECONCILIATION
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Security deposit paid at check-in can be applied directly to clear the folio, with auto-calculation of refund on key return.
                    </div>
                  </div>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.4)' }}>
                    <input
                      type="checkbox"
                      checked={cautionDepositApplied}
                      onChange={(e) => {
                        setCautionDepositApplied(e.target.checked);
                        showToast(e.target.checked ? `✓ Applied ₹${cautionDeposit} Caution Deposit against Room ${selectedRoom} folio!` : 'Caution deposit removed from folio.');
                      }}
                      style={{ cursor: 'pointer', accentColor: '#34d399' }}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                      Apply Security Deposit
                    </span>
                  </label>
                </div>

                {cautionDepositApplied && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Deposit Amount Held (₹)</label>
                      <input
                        type="number"
                        value={cautionDeposit}
                        onChange={(e) => setCautionDeposit(Number(e.target.value) || 0)}
                        style={{ padding: '0.45rem', width: '100%', background: '#0b0f19', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Net Folio Payable</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: effectivePayable > 0 ? '#f87171' : '#34d399' }}>
                        ₹{effectivePayable.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cash Refund Due to Guest</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: cautionRefundDue > 0 ? '#34d399' : 'var(--text-muted)' }}>
                        {cautionRefundDue > 0 ? `₹${cautionRefundDue.toFixed(2)}` : 'None (Fully Absorbed)'}
                      </div>
                      {cautionRefundDue > 0 && (
                        <button
                          type="button"
                          onClick={() => alert(`🖨️ Printing Cashier Caution Refund Slip for Room ${selectedRoom}:\nGuest: ${roomBooking.guestName}\nRefund Amount: ₹${cautionRefundDue.toFixed(2)}\nTender: Cash Drawer\nKey Card: Verified Returned`)}
                          style={{
                            marginTop: '0.35rem',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            background: 'rgba(52, 211, 153, 0.2)',
                            color: '#34d399',
                            border: '1px solid #34d399',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Printer size={12} /> Print Refund Slip
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Multi-Tender Box */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.15rem' }}>
                  Multi-Mode Payment Settlement (Bill Split by Tender)
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Direct solution to MySoft flaw where entering UPI erased Cash drawer counts. Add multiple tender modes for a single invoice.
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(212, 175, 55, 0.08)',
                  padding: '1rem',
                  borderRadius: '8px',
                  margin: '1.25rem 0'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Payable Balance:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: effectivePayable > 0 ? '#f87171' : '#34d399' }}>
                      ₹{effectivePayable.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Tendered:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>₹{totalTendered.toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Variance / Unbalanced:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: tenderVariance === 0 ? '#34d399' : '#f87171' }}>
                      {tenderVariance === 0 ? '✓ Balanced (₹0.00)' : `₹${tenderVariance.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Tender Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {tenderRows.map((row, index) => (
                    <div key={row.id} style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <div style={{ width: 30, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                        #{index + 1}
                      </div>

                      <div style={{ width: 180 }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Tender Mode</label>
                        <select
                          value={row.mode}
                          onChange={(e) => handleUpdateTender(row.id, 'mode', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem',
                            background: '#0d111d',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="Cash">Cash (Front Desk Drawer)</option>
                          <option value="UPI">UPI (SBI / PhonePe QR)</option>
                          <option value="Card">Card (Swipe POS Machine)</option>
                          <option value="Corporate Credit">Corporate Credit (GAIL / JK Paper)</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      <div style={{ width: 140 }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Amount (₹)</label>
                        <input
                          type="number"
                          value={row.amount}
                          onChange={(e) => handleUpdateTender(row.id, 'amount', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem',
                            background: '#0d111d',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Reference / UTR / Auth Code</label>
                        <input
                          type="text"
                          value={row.ref}
                          placeholder="e.g. PhonePe UTR 4291840192 or Cheque #"
                          onChange={(e) => handleUpdateTender(row.id, 'ref', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem',
                            background: '#0d111d',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveTenderRow(row.id)}
                        disabled={tenderRows.length === 1}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          cursor: tenderRows.length === 1 ? 'not-allowed' : 'pointer',
                          marginTop: '1rem'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={handleAddTenderRow}
                    className="btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={14} /> Add Another Payment Mode
                  </button>

                  <button
                    onClick={handleExecuteSettlement}
                    disabled={tenderVariance !== 0 || isSettled}
                    className="btn-primary"
                    style={{
                      padding: '0.65rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      opacity: (tenderVariance !== 0 || isSettled) ? 0.5 : 1,
                      cursor: (tenderVariance !== 0 || isSettled) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSettled ? '✓ Settle Completed & Room Cleared' : 'Settle Folio & Check-Out Room'}
                  </button>
                </div>

                {isSettled && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '1px solid #34d399',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#34d399'
                  }}>
                    <CheckCircle2 size={22} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Settlement Successful &amp; Audit Locked!</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        All tender records logged to Cashier Shift Handover. Room {selectedRoom} released to 'Cleaning'.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Post New Charge inside Folio */}
        {chargeModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', margin: 0 }}>Post Debit to Room {selectedRoom}</h4>
                <button onClick={() => setChargeModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePostCharge}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Outlet / Category</label>
                  <select
                    value={chargeOutlet}
                    onChange={(e) => {
                      setChargeOutlet(e.target.value);
                      if (e.target.value === 'Cannon Kitchen') setChargeType('Food & Beverage');
                      else if (e.target.value === 'Room Service') setChargeType('Room Service');
                      else if (e.target.value === 'Laundry Dept') setChargeType('Laundry');
                    }}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Cannon Kitchen">Cannon Kitchen (Restaurant Dining)</option>
                    <option value="Room Service">In-Room Dining (Room Service)</option>
                    <option value="Laundry Dept">Laundry & Dry Cleaning</option>
                    <option value="Front Desk">Front Desk (Extra Bed / Tariff)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KOT #1052 Paneer Butter Masala & Roti"
                    value={chargeDesc}
                    onChange={(e) => setChargeDesc(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 450"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setChargeModalOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>
                    Post to Master Folio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: In-place Guest Profile Edit */}
        {editProfileModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Edit2 size={16} color="var(--gold-glow)" /> Edit Billing Profile (Room {selectedRoom})
                </h4>
                <button onClick={() => setEditProfileModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={formGuestName}
                    onChange={(e) => setFormGuestName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>WhatsApp / Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={formGuestPhone}
                    onChange={(e) => setFormGuestPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Company / Organization (Optional)</label>
                  <input
                    type="text"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="e.g. GAIL (India) Limited / JK Paper"
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Corporate GSTIN (Rule 46 ITC)</label>
                  <input
                    type="text"
                    value={formCorporateGstin}
                    onChange={(e) => setFormCorporateGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 21AABCH7663L1ZG"
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditProfileModalOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Apply Courtesy Discount / Allowance */}
        {discountModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={16} color="var(--gold-glow)" /> Apply Courtesy Allowance (Room {selectedRoom})
                </h4>
                <button onClick={() => setDiscountModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleApplyDiscount}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Discount Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: discountType === 'fixed' ? 'var(--gold-glow)' : '#0b0f19',
                        color: discountType === 'fixed' ? '#000' : '#fff',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      Fixed Amount (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: discountType === 'percent' ? 'var(--gold-glow)' : '#0b0f19',
                        color: discountType === 'percent' ? '#000' : '#fff',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    {discountType === 'fixed' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === 'percent' ? '100' : balanceDue}
                    value={discountVal}
                    onChange={(e) => setDiscountVal(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Current Net Balance Due: ₹{balanceDue.toFixed(2)}
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Authorized Reason</label>
                  <select
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Managing Director Discretionary Courtesy">MD Courtesy</option>
                    <option value="Corporate Volume Contract Discount">Corporate Volume Partner (JK/GAIL)</option>
                    <option value="Service Quality Recovery Allowance">Service Quality Recovery</option>
                    <option value="Long-Stay Devotee Courtesy">Long-Stay Pilgrim Courtesy</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setDiscountModalOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>
                    Post Allowance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Void / Credit Note Reversal (Section 34 CGST Act) */}
        {voidModalOpen && voidTargetTxn && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#f87171', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trash2 size={16} /> Issue GST Credit Note / Reversal
                </h4>
                <button onClick={() => setVoidModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmVoid}>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{voidTargetTxn.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Txn ID: {voidTargetTxn.transactionId} • Amount: ₹{voidTargetTxn.debitAmount?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '0.25rem' }}>
                    Section 34 CGST Act: This will create an offsetting Credit Note entry, zeroing out the charge on the folio without deleting the audit trail.
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Mandatory Audit Reason</label>
                  <select
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Wrong Room Bill Posting Error">Wrong Room Bill Posting Error</option>
                    <option value="Disputed KOT Food Quality Issue">Disputed KOT Food Quality Issue</option>
                    <option value="Late Check-Out Tariff Waived by GM">Late Check-Out Tariff Waived by GM</option>
                    <option value="Duplicate Charge Correction">Duplicate Charge Correction</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setVoidModalOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '0.4rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    Confirm Credit Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Inter-Room Charge Transfer */}
        {transferModalOpen && transferTargetTxn && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1rem' }}>
                  <ArrowRightLeft size={18} /> Transfer Charge to Another Room
                </h4>
                <button onClick={() => setTransferModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleExecuteTransfer}>
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{transferTargetTxn.description}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>Ref: {transferTargetTxn.transactionId}</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>Amount: ₹{(transferTargetTxn.debitAmount || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#7dd3fc', marginTop: '0.4rem', borderTop: '1px solid rgba(56, 189, 248, 0.15)', paddingTop: '0.4rem' }}>
                    Double-Entry Protocol: Room {selectedRoom} receives an offsetting credit memo; the destination room is immediately debited.
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Destination Room
                  </label>
                  <select
                    value={transferDestRoom}
                    onChange={(e) => setTransferDestRoom(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}
                  >
                    {rooms
                      .filter(r => r.roomNumber !== selectedRoom)
                      .map(r => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room {r.roomNumber} ({r.type || 'Standard'} {r.guestName ? `- ${r.guestName}` : ''})
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Transfer Authorization Reason
                  </label>
                  <select
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}
                  >
                    <option value="Guest requested bill moved to host/colleague room">Guest requested bill moved to host/colleague room</option>
                    <option value="Group corporate leader paying for delegates">Group corporate leader paying for delegates</option>
                    <option value="Cannon Kitchen KOT wrongly billed to this room">Cannon Kitchen KOT wrongly billed to this room</option>
                    <option value="Family booking multi-room consolidated settlement">Family booking multi-room consolidated settlement</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setTransferModalOpen(false)} className="btn-outline" style={{ padding: '0.45rem 0.9rem' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '0.45rem 1.1rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ArrowRightLeft size={15} /> Transfer Charge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Dispute Escrow & Hold */}
        {disputeModalOpen && disputeTargetTxn && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(251, 146, 60, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fb923c', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1rem' }}>
                  <ShieldAlert size={18} /> Place Item in Dispute Escrow
                </h4>
                <button onClick={() => setDisputeModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmDispute}>
                <div style={{ background: 'rgba(251, 146, 60, 0.08)', border: '1px solid rgba(251, 146, 60, 0.25)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{disputeTargetTxn.description}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>Txn: {disputeTargetTxn.transactionId}</span>
                    <span style={{ fontWeight: 700, color: '#fb923c' }}>Amount: ₹{(disputeTargetTxn.debitAmount || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#fed7aa', marginTop: '0.4rem', borderTop: '1px solid rgba(251, 146, 60, 0.15)', paddingTop: '0.4rem' }}>
                    Airport &amp; Morning Rush Protection: Placing this line item into escrow immediately subtracts ₹{(disputeTargetTxn.debitAmount || 0).toFixed(2)} from the checkout payable balance, letting the guest check out smoothly without blocking the desk.
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Dispute Reason / Front Desk Notes
                  </label>
                  <input
                    type="text"
                    required
                    value={disputeReasonInput}
                    onChange={(e) => setDisputeReasonInput(e.target.value)}
                    placeholder="e.g. Guest denies mini-bar usage; F&B Captain to audit KOT slip"
                    style={{ width: '100%', padding: '0.55rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setDisputeModalOpen(false)} className="btn-outline" style={{ padding: '0.45rem 0.9rem' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '0.45rem 1.1rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldAlert size={15} /> Hold in Escrow
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
