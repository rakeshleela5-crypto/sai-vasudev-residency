import React, { useState } from 'react';
import { 
  Search, X, Check, DollarSign, ArrowRightLeft, Users, Link2, 
  RefreshCw, MinusCircle, PlusCircle, FileText, UserCheck, 
  Split, Building2, Calendar, ShieldCheck, AlertCircle, 
  CreditCard, CheckCircle2, ChevronRight, Tag, RotateCcw, 
  Receipt, Clock, Lock, CheckCheck, Sparkles, Layers, ShieldAlert, Printer, MessageCircle
} from 'lucide-react';
import { HOTEL_CONFIG, POST_CHARGE_CATEGORIES, CORPORATE_PARTNERS } from '../data/hotelData';
import { SheetsColumnHeader, SheetsToolbarLegend, SheetsEditableCell } from './UniversalInlineEditor';

export default function FolioActionsModal({
  isOpen,
  onClose,
  room: propRoom,
  rooms = [],
  transactions = [],
  onAddTransaction,
  onUpdateFolio,
  onShiftRoom,
  onCheckoutRoom,
  onOpenSplitInvoice,
  onOpenMasterFolio
}) {
  // Safe room fallback so hooks initialize deterministically even when modal is closed
  const safePropRoom = propRoom || (rooms && rooms[0]) || { roomNumber: '201', tier: 'Executive Room' };
  const [activeRoomState, setActiveRoomState] = useState(safePropRoom);
  React.useEffect(() => {
    if (propRoom) {
      setActiveRoomState(propRoom);
    }
  }, [propRoom]);
  const room = activeRoomState || safePropRoom;

  // Search Bar 1: Room & Guest Switcher State
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [roomSearchDropdownOpen, setRoomSearchDropdownOpen] = useState(false);

  // Search Bar 2: 17 Actions Quick-Finder State
  const [actionSearchTerm, setActionSearchTerm] = useState('');

  // Search Bar 3: Line-Item Ledger & Voucher Filter State
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState('');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState('ALL');

  // Room Switcher Handler
  const handleSwitchRoom = (targetRoom) => {
    setActiveRoomState(targetRoom);
    setRoomSearchDropdownOpen(false);
    setRoomSearchTerm('');

    const matched = (transactions || []).filter(t => t.roomNumber === targetRoom.roomNumber);
    if (matched.length > 0) {
      setFolioTransactions(matched.map(t => ({
        id: t.transactionId || t.id,
        date: t.createdAt ? t.createdAt.slice(0, 10) : '22/09/2026',
        type: t.transactionType === 'Food & Beverage' ? 'DINING' : t.transactionType === 'Payment' ? 'ADVANCE' : 'TARIFF',
        desc: t.description || `${t.outlet || 'PMS'} - ${t.itemCode || ''}`,
        sac: t.sacCode || (t.transactionType === 'Food & Beverage' ? '996331' : '996311'),
        debit: Number(t.debitAmount) || 0,
        credit: Number(t.creditAmount) || 0,
        operator: t.createdBy || 'Front Desk'
      })));
    } else {
      setFolioTransactions([
        { id: `TX-${targetRoom.roomNumber}-1`, date: '22/09/2026', type: 'TARIFF', desc: `Room Tariff - ${targetRoom.tier || 'Executive AC'} (Day 1)`, sac: '996311', debit: Number(targetRoom.tariff || 2199), credit: 0, operator: 'Front Desk' },
        { id: `TX-${targetRoom.roomNumber}-2`, date: '22/09/2026', type: 'DINING', desc: 'Fenugreek Restaurant - KOT #18412 (Executive Thali)', sac: '996331', debit: 350.00, credit: 0, operator: 'Sadananda' },
        { id: `TX-${targetRoom.roomNumber}-3`, date: '22/09/2026', type: 'ADVANCE', desc: 'Check-In Advance (UPI PhonePe)', sac: '-', debit: 0, credit: 1500.00, operator: 'Front Desk' }
      ]);
    }
    showFeedback(`✓ Switched to Room ${targetRoom.roomNumber} • ${targetRoom.currentGuestName || 'Guest'}`);
  };

  // Sync Guest Details when active room changes
  React.useEffect(() => {
    if (room) {
      setGuestName(room.currentGuestName || (room.status === 'Occupied' ? 'In-House Guest' : 'Walk-In Guest'));
      setAdultPax(room.pax ? parseInt(room.pax) || 1 : 1);
      if (room.currentGuestName?.includes('ASHOK') || room.roomNumber === '301') {
        setGuestCompany('Linde India Ltd');
        setGuestGstin('21AAACB2528H1ZA');
        setGuestPhone('+91 6305202068');
      } else if (room.currentGuestName?.includes('BALARAM') || room.roomNumber === '302') {
        setGuestCompany('Vedanta Alumina Ltd');
        setGuestGstin('21AABCV4912J1ZX');
        setGuestPhone('+91 94372 10982');
      } else if (room.currentGuestName?.includes('MURTHY') || room.roomNumber === '204') {
        setGuestCompany('JK Paper Mills Ltd');
        setGuestGstin('21AAACJ1024L1Z2');
        setGuestPhone('+91 98480 33119');
      } else {
        setGuestCompany(room.company || 'Direct Walk-In');
        setGuestGstin(room.corporateGstin || '');
        setGuestPhone(room.phone || '+91 94370 22555');
      }
    }
  }, [room?.roomNumber]);

  // Selected Action Tab (Enhanced with Reversals, Multi-Tender Split Settlement, and Late Checkout)
  const [selectedAction, setSelectedAction] = useState('ledger'); // 'ledger', 'charges', 'advance', 'split-settle', 'late-checkout', 'change-room', 'pax-change', 'link-room', 'swap-room', 'paid-out', 'allowance', 'edit-guest', 'split-folio'
  const [actionSuccess, setActionSuccess] = useState('');

  // Map central live transactions or fallback
  const getInitialTxs = () => {
    const matched = (transactions || []).filter(t => t.roomNumber === room.roomNumber);
    if (matched.length > 0) {
      return matched.map(t => ({
        id: t.transactionId || t.id,
        date: t.createdAt ? t.createdAt.slice(0, 10) : '22/09/2026',
        type: t.transactionType === 'Food & Beverage' ? 'DINING' : t.transactionType === 'Payment' ? 'ADVANCE' : 'TARIFF',
        desc: t.description || `${t.outlet || 'PMS'} - ${t.itemCode || ''}`,
        sac: t.sacCode || (t.transactionType === 'Food & Beverage' ? '996331' : '996311'),
        debit: Number(t.debitAmount) || 0,
        credit: Number(t.creditAmount) || 0,
        operator: t.createdBy || 'Front Desk'
      }));
    }
    return [
      { id: 'TX-101', date: '17/09/2026', type: 'TARIFF', desc: `Room Tariff - ${room.tier || 'Executive Room'} (Day 1)`, sac: '996311', debit: Number(room.tariff || 2999), credit: 0, operator: 'Sudhakar Reddy' },
      { id: 'TX-102', date: '18/09/2026', type: 'TARIFF', desc: `Room Tariff - ${room.tier || 'Executive Room'} (Day 2)`, sac: '996311', debit: Number(room.tariff || 2999), credit: 0, operator: 'Sudhakar Reddy' },
      { id: 'TX-103', date: '18/09/2026', type: 'DINING', desc: 'Fenugreek Restaurant - KOT #18346 (Veg Fried Rice)', sac: '996331', debit: 294.00, credit: 0, operator: 'Sadananda' },
      { id: 'TX-104', date: '19/09/2026', type: 'TARIFF', desc: `Room Tariff - ${room.tier || 'Executive Room'} (Day 3)`, sac: '996311', debit: Number(room.tariff || 2999), credit: 0, operator: 'Sudhakar Reddy' },
      { id: 'TX-105', date: '19/09/2026', type: 'DINING', desc: 'Fenugreek Restaurant - KOT #18372 (Paneer Tikka + Water)', sac: '996331', debit: 325.50, credit: 0, operator: 'Koti' },
      { id: 'TX-106', date: '20/09/2026', type: 'TARIFF', desc: `Room Tariff - ${room.tier || 'Executive Room'} (Day 4)`, sac: '996311', debit: Number(room.tariff || 2999), credit: 0, operator: 'Sudhakar Reddy' },
      { id: 'TX-107', date: '20/09/2026', type: 'DINING', desc: 'Fenugreek Restaurant - KOT #18401 (Dal Makhani + Naan)', sac: '996331', debit: 325.50, credit: 0, operator: 'Deepak' },
      { id: 'TX-108', date: '17/09/2026', type: 'ADVANCE', desc: 'Check-In Advance (UPI SBI Merchant QR)', sac: '-', debit: 0, credit: 3000.00, operator: 'Front Desk' }
    ];
  };

  // Live Folio Transactions with Double-Entry Balancing & Reversals
  const [folioTransactions, setFolioTransactions] = useState(getInitialTxs);

  React.useEffect(() => {
    const matched = (transactions || []).filter(t => t.roomNumber === room.roomNumber);
    if (matched.length > 0) {
      setFolioTransactions(getInitialTxs());
    }
  }, [transactions, room.roomNumber]);

  // Spreadsheet Cell Update Handler (Recalculates debits, credits, and Net Outstanding dynamically)
  const handleUpdateLedgerCell = (txId, field, newVal) => {
    const updated = folioTransactions.map(tx => {
      if (tx.id === txId) {
        return { ...tx, [field]: newVal };
      }
      return tx;
    });
    setFolioTransactions(updated);
    if (onUpdateFolio) {
      onUpdateFolio(room.roomNumber, { transactions: updated });
    }
    showFeedback(`✓ Updated transaction ${txId} [${field}]: ${newVal}`);
  };

  // Reversal Dialog State
  const [reversingTx, setReversingTx] = useState(null);
  const [reversalReason, setReversalReason] = useState('Billed to Wrong Room by Mistake');

  // Multi-Tender Split Settlement State
  const totalDebits = folioTransactions.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCredits = folioTransactions.reduce((sum, tx) => sum + tx.credit, 0);
  const netOutstanding = Math.max(0, totalDebits - totalCredits);

  const [settleCash, setSettleCash] = useState('');
  const [settleUpi, setSettleUpi] = useState('');
  const [settleUpiRef, setSettleUpiRef] = useState('UPI-' + Date.now().toString().slice(-6));
  const [settleCard, setSettleCard] = useState('');
  const [settleCardRef, setSettleCardRef] = useState('AUTH-9412');
  const [settleBtc, setSettleBtc] = useState('');
  const [settleBtcCompany, setSettleBtcCompany] = useState('Linde India Ltd');

  const allocatedTenders = (Number(settleCash) || 0) + (Number(settleUpi) || 0) + (Number(settleCard) || 0) + (Number(settleBtc) || 0);
  const tenderVariance = netOutstanding - allocatedTenders;

  // Late Checkout Calculator State
  const [checkoutTargetTime, setCheckoutTargetTime] = useState('14:30');
  const [lateFeePolicy, setLateFeePolicy] = useState('half-day'); // 'grace', 'half-day', 'full-day'

  // Standard Form States
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceMode, setAdvanceMode] = useState('UPI');
  const [advanceRef, setAdvanceRef] = useState('');

  const [targetRoomNo, setTargetRoomNo] = useState('');
  const [shiftReason, setShiftReason] = useState('Guest Requested Upgrade / Quiet Wing');

  const [adultPax, setAdultPax] = useState(room.pax ? parseInt(room.pax) || 1 : 1);
  const [childPax, setChildPax] = useState(0);

  const [masterCorporate, setMasterCorporate] = useState('CORP-12'); // Linde India Ltd default

  const [paidOutAmount, setPaidOutAmount] = useState('');
  const [paidOutPurpose, setPaidOutPurpose] = useState('Taxi Fare to Rayagada Station');
  const [paidOutReceiver, setPaidOutReceiver] = useState('Local Auto/Taxi Driver');

  const [chargeCategory, setChargeCategory] = useState('FENUGREEK_RESTAURANT');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeRemarks, setChargeRemarks] = useState('');

  const [allowanceAmount, setAllowanceAmount] = useState('');
  const [allowanceReason, setAllowanceReason] = useState('Commercial Courtesy Discount by GM');

  const [guestName, setGuestName] = useState(room.currentGuestName || 'MR. P ASHOK');
  const [guestCompany, setGuestCompany] = useState('Linde India Ltd');
  const [guestGstin, setGuestGstin] = useState('21AAACB2528H1ZA');
  const [guestPhone, setGuestPhone] = useState('+91 6305202068');

  // 14. Sub-Folio Windows State (Window A: Corporate BTC vs Window B: Personal Extras)
  const [windowAssignments, setWindowAssignments] = useState({});
  const [windowASettled, setWindowASettled] = useState(false);
  const [windowBSettled, setWindowBSettled] = useState(false);

  // 15. Disputed Item Escrow State
  const [disputedTxns, setDisputedTxns] = useState({});
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeTargetTxn, setDisputeTargetTxn] = useState(null);
  const [disputeReasonInput, setDisputeReasonInput] = useState('Guest questioned restaurant / service charge');

  // 16. Colleague 50/50 & Custom % Split State
  const [colleagueSplitRatio, setColleagueSplitRatio] = useState(50);
  const [colleague1Name, setColleague1Name] = useState(guestName || 'MR. P ASHOK');
  const [colleague1Company, setColleague1Company] = useState(guestCompany || 'Linde India Ltd');
  const [colleague1Gstin, setColleague1Gstin] = useState(guestGstin || '21AAACB2528H1ZA');
  const [colleague1Phone, setColleague1Phone] = useState(guestPhone || '+91 6305202068');

  const [colleague2Name, setColleague2Name] = useState('MR. S PATNAIK');
  const [colleague2Company, setColleague2Company] = useState('JK Paper Ltd');
  const [colleague2Gstin, setColleague2Gstin] = useState('21AAACJ1234F1ZQ');
  const [colleague2Phone, setColleague2Phone] = useState('+91 94371 44520');

  // 17. Caution / Security Deposit State
  const [cautionDeposit, setCautionDeposit] = useState(1000);
  const [cautionDepositApplied, setCautionDepositApplied] = useState(false);

  // Helper for Sub-Folio item window (Window A: Room Tariff SAC 996311 @ 12%, Window B: F&B/Extras SAC 996331 @ 5%)
  const getItemWindow = (tx) => {
    if (windowAssignments[tx.id]) return windowAssignments[tx.id];
    const isFoodOrLaundry = tx.type === 'DINING' || tx.sac === '996331' || 
      (tx.desc && (tx.desc.toLowerCase().includes('fenugreek') || tx.desc.toLowerCase().includes('restaurant') || tx.desc.toLowerCase().includes('kot') || tx.desc.toLowerCase().includes('laundry')));
    return isFoodOrLaundry ? 'B' : 'A';
  };

  const windowATxns = folioTransactions.filter(t => getItemWindow(t) === 'A');
  const windowBTxns = folioTransactions.filter(t => getItemWindow(t) === 'B');
  const windowADebits = windowATxns.reduce((s, t) => s + (t.debit || 0), 0);
  const windowACredits = windowATxns.reduce((s, t) => s + (t.credit || 0), 0);
  const windowABalance = Math.max(0, windowADebits - windowACredits);
  const windowBDebits = windowBTxns.reduce((s, t) => s + (t.debit || 0), 0);
  const windowBCredits = windowBTxns.reduce((s, t) => s + (t.credit || 0), 0);
  const windowBBalance = Math.max(0, windowBDebits - windowBCredits);

  const handleToggleWindow = (txId) => {
    const curr = getItemWindow(folioTransactions.find(t => t.id === txId) || { id: txId });
    const target = curr === 'A' ? 'B' : 'A';
    setWindowAssignments(prev => ({ ...prev, [txId]: target }));
    showFeedback(`✓ Shifted line item to Window ${target}!`);
  };

  const handleSettleWindowA = () => {
    setWindowASettled(true);
    showFeedback(`✓ Window A (Corporate BTC) marked SETTLED for ${guestCompany || 'Company'}!`);
  };

  const handleSettleWindowB = () => {
    setWindowBSettled(true);
    showFeedback(`✓ Window B (Personal Extras) marked SETTLED via Guest Direct Tender!`);
  };

  // Disputed Items Handlers
  const totalDisputed = Object.values(disputedTxns).reduce((sum, d) => sum + (d.amount || 0), 0);
  const payableBalance = Math.max(0, netOutstanding - totalDisputed);
  const effectivePayable = Math.max(0, payableBalance - (cautionDepositApplied ? cautionDeposit : 0));
  const cautionRefundDue = cautionDepositApplied ? Math.max(0, cautionDeposit - payableBalance) : 0;

  const handleOpenDisputeModal = (tx) => {
    setDisputeTargetTxn(tx);
    setDisputeModalOpen(true);
  };

  const handleConfirmDisputeAction = (e) => {
    e.preventDefault();
    if (!disputeTargetTxn) return;
    setDisputedTxns(prev => ({
      ...prev,
      [disputeTargetTxn.id]: {
        reason: disputeReasonInput,
        heldAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        amount: disputeTargetTxn.debit
      }
    }));
    setDisputeModalOpen(false);
    setDisputeTargetTxn(null);
    showFeedback(`🛡️ Placed in Dispute Escrow! ₹${(disputeTargetTxn.debit || 0).toFixed(2)} held out of checkout payable total.`);
  };

  const handleResolveDisputeAction = (txId, resolutionType) => {
    const tx = folioTransactions.find(t => t.id === txId);
    if (!tx) return;

    if (resolutionType === 'release') {
      setDisputedTxns(prev => {
        const next = { ...prev };
        delete next[txId];
        return next;
      });
      showFeedback(`✓ Dispute resolved: Charge re-admitted to active folio upon verified guest voucher.`);
    } else if (resolutionType === 'waive') {
      setDisputedTxns(prev => {
        const next = { ...prev };
        delete next[txId];
        return next;
      });
      const reversalMemo = {
        id: `CN-${room.roomNumber}-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString('en-IN'),
        type: 'REVERSAL',
        desc: `Credit Note / Dispute Waived: Reversal of ${tx.id} [${disputedTxns[txId]?.reason || 'Waived by Duty Mgr'}]`,
        sac: tx.sac || '996331',
        debit: 0,
        credit: tx.debit,
        operator: 'Duty Manager (Patnaik)'
      };
      setFolioTransactions([reversalMemo, ...folioTransactions]);
      syncFolioTransactionToEdge(reversalMemo);
      showFeedback(`✓ Disputed item waived! Credit note of ₹${tx.debit.toFixed(2)} posted to zero out balance.`);
    }
  };

  // Colleague Split Handlers
  const colleague1Share = (netOutstanding * colleagueSplitRatio) / 100;
  const colleague2Share = netOutstanding - colleague1Share;

  const handleSendColleagueWhatsApp = (colleagueNum) => {
    const isC1 = colleagueNum === 1;
    const cName = isC1 ? colleague1Name : colleague2Name;
    const cComp = isC1 ? colleague1Company : colleague2Company;
    const cGstin = isC1 ? colleague1Gstin : colleague2Gstin;
    const cShare = isC1 ? colleague1Share : colleague2Share;
    const cPhone = (isC1 ? colleague1Phone : colleague2Phone).replace(/\D/g, '');
    const cleanPhone = cPhone.length === 10 ? `91${cPhone}` : cPhone;
    const ratio = isC1 ? colleagueSplitRatio : (100 - colleagueSplitRatio);

    const message = 
`🏨 *${HOTEL_CONFIG.name.toUpperCase()}, RAYAGADA*
📍 ${HOTEL_CONFIG.address}
📞 ${HOTEL_CONFIG.phone} | GSTIN: ${HOTEL_CONFIG.gstin}
───────────────────────────────
📋 *SPLIT TAX INVOICE (PART ${isC1 ? 'A' : 'B'} - ${ratio}%)*
Room Number: *${room.roomNumber}*
Executive: *${cName}*
Company: *${cComp}*
${cGstin ? `Corporate GSTIN: ${cGstin}\n` : ''}Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
───────────────────────────────
💰 Total Room Outstanding: ₹${netOutstanding.toFixed(2)}
📊 Agreed Split Share: *${ratio}%*
💵 Taxable Base: ₹${(cShare / 1.12).toFixed(2)}
⚖️ Applicable GST (CGST 6% + SGST 6%): ₹${(cShare - (cShare / 1.12)).toFixed(2)}
🏷️ *Net Payable Share: ₹${cShare.toFixed(2)}*
───────────────────────────────
💳 Quick UPI Pay: ${HOTEL_CONFIG.upiId}
🙏 *Thank you for staying at ${HOTEL_CONFIG.name}!*`;

    const encoded = encodeURIComponent(message);
    const targetUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  // Available vacant rooms for shift
  const vacantRooms = rooms.filter(r => r.status === 'Available');

  const showFeedback = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Dispatch folio transaction to Cloudflare Edge D1
  const syncFolioTransactionToEdge = (tx) => {
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'post_folio_transaction',
        payload: {
          transactionId: tx.id || `TXN-${room.roomNumber}-${Date.now()}`,
          folioId: `FOLIO-${room.roomNumber}`,
          bookingId: room.currentBookingId || null,
          roomNumber: room.roomNumber,
          transactionType: tx.type || 'Room Charge',
          outlet: tx.outlet || 'Front Desk',
          itemCode: tx.sac || 'MISC',
          description: tx.desc,
          debitAmount: tx.debit || 0,
          creditAmount: tx.credit || 0,
          taxableBase: (tx.debit || 0) / 1.12,
          gstRate: 12,
          cgst: ((tx.debit || 0) / 1.12) * 0.06,
          sgst: ((tx.debit || 0) / 1.12) * 0.06,
          sacCode: tx.sac || '996311',
          createdBy: tx.operator || 'Duty Manager'
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          console.log(`✓ Folio transaction synced to Cloudflare D1:`, data.transactionId);
        }
      })
      .catch(err => console.warn('Offline folio transaction fallback:', err));
  };

  // 1. Post Charge
  const handlePostCharge = (e) => {
    e.preventDefault();
    if (!chargeAmount) return;
    const cat = POST_CHARGE_CATEGORIES.find(c => c.id === chargeCategory);
    const amount = Number(chargeAmount);

    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: chargeCategory,
      desc: `${cat?.name || chargeCategory} (${chargeRemarks || 'Front Office Charge'})`,
      sac: cat?.sac || '996331',
      debit: amount,
      credit: 0,
      operator: 'Duty Manager'
    };

    setFolioTransactions([newTx, ...folioTransactions]);
    syncFolioTransactionToEdge(newTx);
    showFeedback(`✓ Posted ₹${amount.toFixed(2)} [${cat?.name || chargeCategory}] to Room ${room.roomNumber} folio!`);
    setChargeAmount('');
    setChargeRemarks('');
  };

  // 2. Void / Reversal (Double-Entry Balancing Memo)
  const handleConfirmReversal = (e) => {
    e.preventDefault();
    if (!reversingTx) return;

    const balancingCreditMemo = {
      id: `REV-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: 'REVERSAL',
      desc: `↩️ Balancing Reversal of [${reversingTx.id}] ${reversingTx.desc} [Reason: ${reversalReason}]`,
      sac: reversingTx.sac,
      debit: 0,
      credit: reversingTx.debit, // Balances the original debit exactly!
      operator: 'Authorized Auditor (S. Patnaik)',
      reversedTxId: reversingTx.id,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedTxs = [
      balancingCreditMemo,
      ...folioTransactions.map(t => t.id === reversingTx.id ? { ...t, isReversed: true, reversalMemoId: balancingCreditMemo.id } : t)
    ];

    setFolioTransactions(updatedTxs);
    syncFolioTransactionToEdge(balancingCreditMemo);
    if (onUpdateFolio) {
      onUpdateFolio(room.roomNumber, { transactions: updatedTxs });
    }
    showFeedback(`✓ Reversed Transaction ${reversingTx.id}! Balancing credit memo of ₹${reversingTx.debit.toFixed(2)} posted.`);
    setReversingTx(null);
  };

  // 3. Multi-Tender Split Settlement Execution
  const handleCompleteSplitCheckout = () => {
    if (Math.abs(tenderVariance) > 1) {
      alert(`Cannot settle folio: Tender variance of ₹${tenderVariance.toFixed(2)} remaining. Total allocated must equal ₹${netOutstanding.toFixed(2)}.`);
      return;
    }

    const tendersSummary = [];
    if (Number(settleCash) > 0) tendersSummary.push(`Cash: ₹${Number(settleCash).toLocaleString('en-IN')}`);
    if (Number(settleUpi) > 0) tendersSummary.push(`UPI: ₹${Number(settleUpi).toLocaleString('en-IN')} (${settleUpiRef})`);
    if (Number(settleCard) > 0) tendersSummary.push(`Card: ₹${Number(settleCard).toLocaleString('en-IN')} (${settleCardRef})`);
    if (Number(settleBtc) > 0) tendersSummary.push(`BTC: ₹${Number(settleBtc).toLocaleString('en-IN')} (${settleBtcCompany})`);

    const settlementTx = {
      id: `SETTLE-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: 'SETTLEMENT',
      desc: `Full Checkout Settlement [${tendersSummary.join(' + ')}]`,
      sac: '-',
      debit: 0,
      credit: allocatedTenders,
      operator: 'Front Desk Lead (K. Simhachalam)',
      tenders: {
        cash: Number(settleCash) || 0,
        upi: Number(settleUpi) || 0,
        upiRef: settleUpiRef,
        card: Number(settleCard) || 0,
        cardRef: settleCardRef,
        btc: Number(settleBtc) || 0,
        btcCompany: settleBtcCompany
      }
    };

    const finalTxs = [settlementTx, ...folioTransactions];
    setFolioTransactions(finalTxs);
    if (onUpdateFolio) {
      onUpdateFolio(room.roomNumber, { transactions: finalTxs, isSettled: true });
    }
    showFeedback(`✓ Succeeded! Room ${room.roomNumber} folio settled across ${tendersSummary.length} payment tenders. Room released to Cleaning.`);

    if (onCheckoutRoom) {
      onCheckoutRoom(room.roomNumber, {
        tendersSummary,
        totalSettled: allocatedTenders,
        transactions: finalTxs
      });
    }
  };

  // Inter-Room Folio Transfer State (Owner Video: Timestamps 2:15 - 4:40)
  const otherRooms = rooms.filter(r => r.roomNumber !== room.roomNumber);
  const [transferTargetRoom, setTransferTargetRoom] = useState(otherRooms[0]?.roomNumber || '206');
  const [selectedTxToTransfer, setSelectedTxToTransfer] = useState(null);
  const [transferReason, setTransferReason] = useState('Senior Officer company food allowance covers Junior Officer dining (₹1,500)');

  // 4. Apply Late Checkout Surcharge
  const handleApplyLateCheckout = () => {
    const baseTariff = room.tariff || 2999;
    let fee = 0;
    let desc = '';

    if (lateFeePolicy === 'grace') {
      fee = 0;
      desc = `Late Checkout Grace Period until ${checkoutTargetTime} (Waiver by GM)`;
    } else if (lateFeePolicy === 'half-day') {
      fee = baseTariff * 0.5;
      desc = `Late Checkout Surcharge (Half-Day 50% Tariff until ${checkoutTargetTime})`;
    } else {
      fee = baseTariff;
      desc = `Late Checkout Surcharge (Full Day 100% Tariff after 18:00 PM)`;
    }

    if (fee > 0) {
      const lateTx = {
        id: `LATE-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString('en-IN'),
        type: 'LATE_CHECKOUT',
        desc,
        sac: '996311',
        debit: fee,
        credit: 0,
        operator: 'Duty Manager'
      };
      const updatedTxs = [lateTx, ...folioTransactions];
      setFolioTransactions(updatedTxs);
      if (onUpdateFolio) onUpdateFolio(room.roomNumber, { transactions: updatedTxs });
      showFeedback(`✓ Added ${desc} of ₹${fee.toFixed(2)} to Room ${room.roomNumber} folio.`);
    } else {
      showFeedback(`✓ Grace period extension granted until ${checkoutTargetTime}. Zero surcharge applied.`);
    }
  };

  // 4B. REMOVE TARIFF / WAIVE LATE STAY TARIFF (Owner Video: Timestamps 1:40 - 2:05)
  // "Regular guest aithe vaddu anukunte adhi REMOVE cheyali!"
  const handleRemoveTariff = () => {
    const tariffTxs = folioTransactions.filter(t => 
      (t.type === 'LATE_CHECKOUT' || t.desc.toLowerCase().includes('late') || t.desc.toLowerCase().includes('surcharge')) && 
      !t.isReversed && t.debit > 0
    );

    if (tariffTxs.length === 0) {
      // If no late checkout fee, check if there's any active tariff debit to waive
      const anyTariff = folioTransactions.find(t => t.type === 'TARIFF' && !t.isReversed && t.debit > 0);
      if (anyTariff) {
        const waiverMemo = {
          id: `WAIVE-${Date.now().toString().slice(-4)}`,
          date: new Date().toLocaleDateString('en-IN'),
          type: 'REVERSAL',
          desc: `↩️ REMOVE TARIFF: Courtesy Tariff Waiver for Regular / VIP Guest [Authorized by Eswara MD]`,
          sac: anyTariff.sac || '996311',
          debit: 0,
          credit: anyTariff.debit,
          operator: 'Authorized Front Office Manager',
          reversedTxId: anyTariff.id,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        const updatedTxs = [
          waiverMemo,
          ...folioTransactions.map(t => t.id === anyTariff.id ? { ...t, isReversed: true, reversalMemoId: waiverMemo.id } : t)
        ];
        setFolioTransactions(updatedTxs);
        if (onUpdateFolio) onUpdateFolio(room.roomNumber, { transactions: updatedTxs });
        showFeedback(`✓ Succeeded! Removed tariff of ₹${anyTariff.debit.toFixed(2)} for Regular/VIP guest! Waiver memo posted.`);
        return;
      }
      showFeedback(`No active late stay tariff debits found on Room ${room.roomNumber} folio to remove.`);
      return;
    }

    const latestTariff = tariffTxs[0];
    const waiverMemo = {
      id: `WAIVE-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: 'REVERSAL',
      desc: `↩️ REMOVE TARIFF: Late Checkout Hourly Surcharge Waived for Regular / VIP Guest [Owner Rule]`,
      sac: latestTariff.sac || '996311',
      debit: 0,
      credit: latestTariff.debit,
      operator: 'Authorized Front Office Manager',
      reversedTxId: latestTariff.id,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedTxs = [
      waiverMemo,
      ...folioTransactions.map(t => t.id === latestTariff.id ? { ...t, isReversed: true, reversalMemoId: waiverMemo.id } : t)
    ];
    setFolioTransactions(updatedTxs);
    if (onUpdateFolio) onUpdateFolio(room.roomNumber, { transactions: updatedTxs });
    showFeedback(`✓ Succeeded! Removed late stay surcharge of ₹${latestTariff.debit.toFixed(2)} for Regular/VIP guest.`);
  };

  // 5. Inter-Room Folio Bill Transfer (Owner Video: Timestamps 2:15 - 4:40)
  const handleExecuteTransfer = () => {
    if (!selectedTxToTransfer) {
      alert('Please click and select a charge from the folio ledger below to transfer.');
      return;
    }

    const txToMove = folioTransactions.find(t => t.id === selectedTxToTransfer);
    if (!txToMove) return;

    const transferOutMemo = {
      id: `XFER-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: 'TRANSFER_OUT',
      desc: `➡️ TRANSFER FOLIO: Shifted [${txToMove.id}] ${txToMove.desc} to Room ${transferTargetRoom} [Reason: ${transferReason}]`,
      sac: txToMove.sac || '996331',
      debit: 0,
      credit: txToMove.debit,
      operator: 'Front Desk Cashier',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedCurrentTxs = [
      transferOutMemo,
      ...folioTransactions.map(t => t.id === txToMove.id ? { ...t, isTransferred: true, transferredTo: transferTargetRoom } : t)
    ];

    setFolioTransactions(updatedCurrentTxs);
    if (onUpdateFolio) {
      onUpdateFolio(room.roomNumber, { transactions: updatedCurrentTxs });
    }

    showFeedback(`✓ Transferred ₹${txToMove.debit.toFixed(2)} [${txToMove.desc}] from Room ${room.roomNumber} to Room ${transferTargetRoom} successfully!`);
    setSelectedTxToTransfer(null);
  };
  // 18 Rooms List for Universal Quick Switcher
  const allRoomsCatalog = rooms && rooms.length > 0 ? rooms : [
    { roomNumber: '101', tier: 'Standard Non-AC', status: 'Available', tariff: 1000 },
    { roomNumber: '102', tier: 'Standard Non-AC', status: 'Available', tariff: 1000 },
    { roomNumber: '201', tier: 'Executive AC', status: 'Available', tariff: 1800 },
    { roomNumber: '204', tier: 'Executive AC', status: 'Occupied', currentGuestName: 'K. RAMA MURTHY', balanceDue: 450, tariff: 1800 },
    { roomNumber: '206', tier: 'Executive AC', status: 'Occupied', currentGuestName: 'LAVAKANTA OJHA', balanceDue: 962, tariff: 1800 },
    { roomNumber: '210', tier: 'Studio Room', status: 'Available', tariff: 2500 },
    { roomNumber: '211', tier: 'Premium Suite Room', status: 'Occupied', currentGuestName: 'MR. P ASHOK', balanceDue: 2199, tariff: 3000 }
  ];

  const filteredRooms = allRoomsCatalog.filter(r => {
    if (!roomSearchTerm.trim()) return true;
    const term = roomSearchTerm.toLowerCase();
    return (
      r.roomNumber.toLowerCase().includes(term) ||
      (r.currentGuestName && r.currentGuestName.toLowerCase().includes(term)) ||
      (r.tier && r.tier.toLowerCase().includes(term)) ||
      (r.status && r.status.toLowerCase().includes(term))
    );
  }).sort((a, b) => {
    if (a.status === 'Occupied' && b.status !== 'Occupied') return -1;
    if (b.status === 'Occupied' && a.status !== 'Occupied') return 1;
    return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
  });

  // 17 Primary Folio Actions with Smart Keyword Search
  const ALL_ACTIONS = [
    { id: 'ledger', label: '1. Folio Ledger & Voids', icon: Receipt, color: '#38bdf8', keywords: ['void', 'reverse', 'audit', 'credit note', 'memo', 'bill', 'view'] },
    { id: 'charges', label: '2. Post Charges (11 Types)', icon: PlusCircle, color: '#38bdf8', keywords: ['post', 'room service', 'laundry', 'pos', 'extra', 'food', 'charge', 'add'] },
    { id: 'late-checkout', label: '3. Remove Tariff (Late Waiver)', icon: Clock, color: '#fbbf24', keywords: ['tariff', 'waiver', 'late', 'discount', 'half day', 'checkout'] },
    { id: 'transfer-folio', label: '4. Transfer Folio (Inter-Room Bill)', icon: ArrowRightLeft, color: '#a78bfa', keywords: ['transfer', 'inter-room', 'move', 'balance', 'route'] },
    { id: 'split-folio', label: '5. Split Folio (Room vs F&B)', icon: Split, color: '#34d399', keywords: ['split', 'food', 'beverage', 'room vs f&b', 'separate', 'dining'] },
    { id: 'link-room', label: '6. Link Room (Multi-Room)', icon: Link2, color: '#60a5fa', keywords: ['link', 'master', 'family', 'group', 'multi-room', 'connect'] },
    { id: 'change-room', label: '7. Change Room (Room Shift)', icon: RefreshCw, color: '#fbbf24', keywords: ['shift', 'change', 'upgrade', 'swap', 'move room'] },
    { id: 'edit-guest', label: '8. Edit Guest & GSTIN Details', icon: UserCheck, color: '#38bdf8', keywords: ['guest', 'gstin', 'company', 'tax', 'profile', 'name', 'phone'] },
    { id: 'split-settle', label: '9. Split-Tender Settlement', icon: CheckCheck, color: '#34d399', keywords: ['settle', 'phonepe', 'cash', 'upi', 'tender', 'checkout', 'payment'] },
    { id: 'advance', label: '10. Tag Advance (Deposit Receipt)', icon: DollarSign, color: '#34d399', keywords: ['advance', 'deposit', 'receipt', 'qr', 'upi', 'pre-payment'] },
    { id: 'paid-out', label: '11. Paid Out (Drawer Cash)', icon: MinusCircle, color: '#f87171', keywords: ['paid out', 'drawer', 'cash', 'vendor', 'disbursement', 'taxi'] },
    { id: 'allowance', label: '12. Allowance & Courtesy Discount', icon: Tag, color: '#fb923c', keywords: ['allowance', 'courtesy', 'rebate', 'discount', 'concession'] },
    { id: 'pax-change', label: '13. Pax Change (Single ↔ Double)', icon: Users, color: '#a78bfa', keywords: ['pax', 'single', 'double', 'triple', 'occupancy', 'guest count', 'extra bed'] },
    { id: 'sub-folio-windows', label: '14. Sub-Folio Windows (A: BTC / B: Extras)', icon: Layers, color: '#38bdf8', keywords: ['sub-folio', 'window a', 'window b', 'btc', 'corporate', 'extras', 'dual', 'route'] },
    { id: 'dispute-escrow', label: '15. Disputed Item Escrow (Hold)', icon: ShieldAlert, color: '#fb923c', keywords: ['dispute', 'escrow', 'hold', 'contested', 'fast checkout', 'lock'] },
    { id: 'colleague-split', label: '16. Colleague 50/50 & Custom % Split', icon: Split, color: '#34d399', keywords: ['colleague', '50/50', 'split bill', 'two bills', 'gst', 'share', 'whatsapp'] },
    { id: 'caution-deposit', label: '17. Caution / Security Deposit & Refund', icon: ShieldCheck, color: '#10b981', keywords: ['caution', 'security', 'key refund', 'deposit', 'return', 'voucher'] }
  ];

  const filteredActions = ALL_ACTIONS.filter(act => {
    if (!actionSearchTerm.trim()) return true;
    const term = actionSearchTerm.toLowerCase();
    return act.label.toLowerCase().includes(term) ||
      act.id.toLowerCase().includes(term) ||
      (act.keywords && act.keywords.some(k => k.toLowerCase().includes(term)));
  });

  // Filtered Ledger Transactions (Search Bar 3)
  const visibleLedgerTransactions = folioTransactions.filter(tx => {
    if (ledgerCategoryFilter !== 'ALL') {
      if (ledgerCategoryFilter === 'TARIFF' && tx.type !== 'TARIFF' && tx.type !== 'ROOM_RENT') return false;
      if (ledgerCategoryFilter === 'DINING' && tx.type !== 'DINING' && !tx.type?.includes('RESTAURANT') && !tx.type?.includes('FOOD')) return false;
      if (ledgerCategoryFilter === 'ADVANCE' && tx.type !== 'ADVANCE' && tx.type !== 'SETTLEMENT') return false;
      if (ledgerCategoryFilter === 'REVERSAL' && tx.type !== 'REVERSAL' && !tx.isReversed) return false;
    }
    if (!ledgerSearchTerm.trim()) return true;
    const term = ledgerSearchTerm.toLowerCase();
    return (
      (tx.desc && tx.desc.toLowerCase().includes(term)) ||
      (tx.id && tx.id.toLowerCase().includes(term)) ||
      (tx.date && tx.date.toLowerCase().includes(term)) ||
      (tx.operator && tx.operator.toLowerCase().includes(term)) ||
      (tx.sac && tx.sac.toLowerCase().includes(term))
    );
  });

  if (!isOpen || !propRoom) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.94)',
      backdropFilter: 'blur(12px)',
      zIndex: 2200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1180,
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        boxShadow: '0 25px 70px rgba(0,0,0,0.9)',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          background: 'linear-gradient(90deg, rgba(20,25,48,0.98), rgba(12,16,32,0.99))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #60a5fa', fontWeight: 700 }}>
                ENTERPRISE FOLIO CONTROLS
              </span>
              <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 700, whiteSpace: 'nowrap' }}>
                Room {room.roomNumber} Folio Operations
              </h2>
            </div>
            <div style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Guest:</span>
              <SheetsEditableCell
                tag="span"
                value={guestName}
                onChange={(val) => {
                  setGuestName(val);
                  if (onUpdateFolio) onUpdateFolio(room.roomNumber, { guestName: val });
                }}
                style={{ color: '#fff', fontWeight: 700, padding: '1px 6px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '4px' }}
                tooltip="Click to edit guest name inline"
              />
              <span>• Company:</span>
              <SheetsEditableCell
                tag="span"
                value={guestCompany}
                onChange={(val) => {
                  setGuestCompany(val);
                  if (onUpdateFolio) onUpdateFolio(room.roomNumber, { company: val });
                }}
                style={{ color: '#fbbf24', fontWeight: 700, padding: '1px 6px', background: 'rgba(251, 191, 36, 0.08)', borderRadius: '4px' }}
                tooltip="Click to edit corporate billing entity inline"
              />
              <span>• Phone:</span>
              <SheetsEditableCell
                tag="span"
                value={guestPhone}
                onChange={(val) => {
                  setGuestPhone(val);
                  if (onUpdateFolio) onUpdateFolio(room.roomNumber, { phone: val });
                }}
                style={{ color: '#93c5fd', fontWeight: 600, padding: '1px 6px', background: 'rgba(147, 197, 253, 0.08)', borderRadius: '4px' }}
                tooltip="Click to edit guest phone inline"
              />
              <span>• Net Outstanding:</span>
              <strong style={{ color: netOutstanding > 0 ? '#f87171' : '#34d399', fontSize: '0.95rem' }}>
                ₹{netOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          {/* SEARCH BAR 1: Universal Room & Guest Quick-Switcher */}
          <div style={{ position: 'relative', width: 280, minWidth: 230, zIndex: 1100 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.45)',
              border: roomSearchDropdownOpen ? '1px solid var(--gold-glow)' : '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '8px',
              padding: '5px 10px',
              boxShadow: roomSearchDropdownOpen ? '0 0 12px rgba(212, 175, 55, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}>
              <Search size={14} style={{ color: 'var(--gold-glow)', marginRight: '8px', flexShrink: 0 }} />
              <input 
                type="text"
                value={roomSearchTerm}
                onChange={(e) => {
                  setRoomSearchTerm(e.target.value);
                  if (!roomSearchDropdownOpen) setRoomSearchDropdownOpen(true);
                }}
                onFocus={() => setRoomSearchDropdownOpen(true)}
                placeholder={`Switch Room (Active: ${room.roomNumber})...`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  width: '100%'
                }}
              />
              {roomSearchTerm ? (
                <button
                  type="button"
                  onClick={() => setRoomSearchTerm('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={13} />
                </button>
              ) : (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                  18 Rooms
                </span>
              )}
            </div>

            {/* Floating Dropdown for Room Switcher */}
            {roomSearchDropdownOpen && (
              <>
                <div 
                  onClick={() => setRoomSearchDropdownOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 1099 }}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  maxHeight: 280,
                  background: 'rgba(11, 15, 28, 0.98)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '10px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.85)',
                  zIndex: 1100,
                  overflowY: 'auto',
                  padding: '6px'
                }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>SWITCH ACTIVE FOLIO</span>
                    <span style={{ color: 'var(--gold-glow)' }}>{filteredRooms.length} rooms</span>
                  </div>
                  {filteredRooms.map(r => {
                    const isCurrent = r.roomNumber === room.roomNumber;
                    const isOcc = r.status === 'Occupied';
                    return (
                      <div
                        key={r.roomNumber}
                        onClick={() => handleSwitchRoom(r)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isCurrent ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                          border: isCurrent ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                          marginBottom: '2px',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: isCurrent ? 'var(--gold-glow)' : '#fff',
                            fontFamily: 'monospace'
                          }}>
                            {r.roomNumber}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.76rem', color: '#fff', fontWeight: 600 }}>
                              {r.currentGuestName || (isOcc ? 'Occupied Guest' : 'Vacant Room')}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {r.tier || 'Executive'}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '10px',
                            background: isOcc ? 'rgba(56, 189, 248, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                            color: isOcc ? '#38bdf8' : '#34d399',
                            border: isOcc ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(52, 211, 153, 0.4)'
                          }}>
                            {isOcc ? 'Occupied' : 'Available'}
                          </span>
                          {isCurrent && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--gold-glow)', fontWeight: 700, marginTop: '2px' }}>
                              Active ✓
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                if (onOpenSplitInvoice) {
                  onOpenSplitInvoice('a4');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.5) 100%)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.5)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.25)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              title="Preview & Print Official Consolidated Tax Invoice / Non-GST Bill (FMBIL / NGST Series with Taxable Breakdown)"
            >
              <FileText size={16} /> 🧾 Tax / Non-GST Bill
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                width: 34,
                height: 34,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionSuccess && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.15)',
            borderBottom: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            padding: '0.65rem 1.75rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} /> {actionSuccess}
          </div>
        )}

        {/* Main Body: 2 Columns */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar: Operational Actions Menu */}
          <div style={{
            width: 270,
            background: 'rgba(8, 12, 22, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: '0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.2rem 0.5rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Primary Folio Actions</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                {filteredActions.length} of 17
              </span>
            </div>

            {/* SEARCH BAR 2: 17 Actions Quick-Finder */}
            <div style={{ position: 'relative', marginBottom: '0.4rem', padding: '0 0.2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: actionSearchTerm ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '4px 8px'
              }}>
                <Search size={13} style={{ color: actionSearchTerm ? 'var(--gold-glow)' : 'var(--text-muted)', marginRight: '6px', flexShrink: 0 }} />
                <input 
                  type="text"
                  value={actionSearchTerm}
                  onChange={(e) => setActionSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredActions.length > 0) {
                      setSelectedAction(filteredActions[0].id);
                    }
                  }}
                  placeholder="Filter 17 actions (split, pax...)"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '0.74rem',
                    width: '100%'
                  }}
                />
                {actionSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setActionSearchTerm('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {filteredActions.length === 0 ? (
              <div style={{ padding: '1rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                No action found matching "{actionSearchTerm}".
                <button
                  type="button"
                  onClick={() => setActionSearchTerm('')}
                  style={{ display: 'block', margin: '0.4rem auto 0', background: 'transparent', border: 'none', color: 'var(--gold-glow)', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline' }}
                >
                  Reset filter
                </button>
              </div>
            ) : (
              filteredActions.map(act => {
                const Icon = act.icon;
                const isActive = selectedAction === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => setSelectedAction(act.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      color: isActive ? 'var(--gold-glow)' : '#cbd5e1',
                      border: isActive ? '1px solid var(--gold-glow)' : '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={15} color={isActive ? 'var(--gold-glow)' : act.color} />
                    <span>{act.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Workspace: Selected Action Details */}
          <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>
            {/* ACTION: LIVE FOLIO LEDGER & REVERSAL / VOID (IDS Next Standard) */}
            {selectedAction === 'ledger' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                      Itemized Folio Ledger &amp; Audited Reversals
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Click "↩️ Void / Reverse" on any erroneous line item to post a balancing credit memo without deleting records.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAction('charges')}
                    className="btn-primary-gold"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                  >
                    + Post New Charge
                  </button>
                </div>

                {/* SEARCH BAR 3: Line-Item Ledger Filter with Search Box & Category Quick Chips */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 260, position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text"
                      value={ledgerSearchTerm}
                      onChange={(e) => setLedgerSearchTerm(e.target.value)}
                      placeholder="Search description, KOT #, SAC, operator, date..."
                      style={{
                        width: '100%',
                        padding: '0.4rem 2rem 0.4rem 2rem',
                        background: 'rgba(0,0,0,0.3)',
                        border: ledgerSearchTerm ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.78rem'
                      }}
                    />
                    {ledgerSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setLedgerSearchTerm('')}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Chips */}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                      { id: 'ALL', label: `All (${folioTransactions.length})` },
                      { id: 'TARIFF', label: 'Tariff' },
                      { id: 'DINING', label: 'Dining / KOT' },
                      { id: 'ADVANCE', label: 'Payments' },
                      { id: 'REVERSAL', label: 'Disputes & Voids' }
                    ].map(cat => {
                      const isSel = ledgerCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setLedgerCategoryFilter(cat.id)}
                          style={{
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: isSel ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.05)',
                            color: isSel ? 'var(--gold-glow)' : 'var(--text-muted)',
                            border: isSel ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                    {(ledgerSearchTerm || ledgerCategoryFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => { setLedgerSearchTerm(''); setLedgerCategoryFilter('ALL'); }}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          background: 'transparent',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Google Sheets Interactive Folio Ledger Toolbar & Legend */}
                <SheetsToolbarLegend 
                  tableName={`Room ${room.roomNumber} Itemized Folio Ledger & Reversals`} 
                  subtitle="Live Interactive Google Sheets Mode • Click any cell to edit inline • Enter or Tab to commit"
                />

                {/* Interactive Sheets Ledger Table */}
                <table className="sheets-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1.5rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <SheetsColumnHeader title="Date / Tx #" badge="locked" align="left" style={{ padding: '0.7rem' }} />
                      <SheetsColumnHeader title="Description & Details" badge="editable" align="left" style={{ padding: '0.7rem' }} />
                      <SheetsColumnHeader title="SAC" badge="editable" align="center" style={{ padding: '0.7rem', width: '90px' }} />
                      <SheetsColumnHeader title="Debit (₹)" badge="editable" align="right" style={{ padding: '0.7rem', width: '125px' }} />
                      <SheetsColumnHeader title="Credit (₹)" badge="editable" align="right" style={{ padding: '0.7rem', width: '125px' }} />
                      <SheetsColumnHeader title="Action" badge="locked" align="center" style={{ padding: '0.7rem', width: '110px' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLedgerTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.35rem', fontWeight: 600 }}>No ledger items match your search</div>
                          <div style={{ fontSize: '0.78rem' }}>Try clearing the search term or category chip to show all {folioTransactions.length} entries.</div>
                          <button
                            type="button"
                            onClick={() => { setLedgerSearchTerm(''); setLedgerCategoryFilter('ALL'); }}
                            style={{
                              marginTop: '0.75rem',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              background: 'rgba(212, 175, 55, 0.2)',
                              color: 'var(--gold-glow)',
                              border: '1px solid var(--gold-glow)',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          >
                            Reset Search Filter
                          </button>
                        </td>
                      </tr>
                    ) : (
                    visibleLedgerTransactions.map(tx => {
                      const isReversal = tx.type === 'REVERSAL';
                      const isAdvance = tx.type === 'ADVANCE' || tx.type === 'SETTLEMENT';
                      return (
                        <tr key={tx.id} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isReversal ? 'rgba(244, 63, 94, 0.05)' : 'transparent'
                        }}>
                          <td style={{ padding: '0.7rem' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{tx.date}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{tx.id}</div>
                          </td>
                          <SheetsEditableCell
                            value={tx.desc}
                            onChange={(newDesc) => handleUpdateLedgerCell(tx.id, 'desc', newDesc)}
                disabled={tx.isReversed}
                            style={{ padding: '0.7rem' }}
                            formatDisplay={(val) => (
                              <div>
                                <div style={{ fontWeight: 600, color: isReversal ? '#f43f5e' : '#f8fafc' }}>
                                  {val}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  Operator: {tx.operator}
                                </div>
                              </div>
                            )}
                            tooltip="Click to edit item description"
                          />
                          <SheetsEditableCell
                            value={tx.sac || '-'}
                            onChange={(newSac) => handleUpdateLedgerCell(tx.id, 'sac', newSac)}
                disabled={tx.isReversed}
                            align="center"
                            style={{ padding: '0.7rem', fontFamily: 'monospace', color: '#fbbf24' }}
                            tooltip="Click to edit GST SAC Code"
                          />
                          <SheetsEditableCell
                            value={tx.debit || 0}
                            type="currency"
                            onChange={(newDebit) => handleUpdateLedgerCell(tx.id, 'debit', Number(newDebit) || 0)}
                disabled={tx.isReversed || tx.type === 'REVERSAL' || tx.type === 'SETTLEMENT'}
                            align="right"
                            style={{ padding: '0.7rem', fontWeight: 600, color: tx.debit > 0 ? '#f87171' : 'var(--text-muted)' }}
                            tooltip="Click to edit debit amount (Net Outstanding recalculates dynamically)"
                          />
                          <SheetsEditableCell
                            value={tx.credit || 0}
                            type="currency"
                            onChange={(newCredit) => handleUpdateLedgerCell(tx.id, 'credit', Number(newCredit) || 0)}
                disabled={tx.isReversed}
                            align="right"
                            style={{ padding: '0.7rem', fontWeight: 600, color: tx.credit > 0 ? '#34d399' : 'var(--text-muted)' }}
                            tooltip="Click to edit credit/advance amount (Net Outstanding recalculates dynamically)"
                          />
                          <td style={{ padding: '0.7rem', textAlign: 'center' }}>
                            {tx.isReversed ? (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: 'rgba(244, 63, 94, 0.15)',
                                color: '#f43f5e',
                                border: '1px solid rgba(244, 63, 94, 0.3)'
                              }}>
                                ✓ Reversed
                              </span>
                            ) : tx.type === 'REVERSAL' ? (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: 'rgba(52, 211, 153, 0.15)',
                                color: '#34d399',
                                border: '1px solid rgba(52, 211, 153, 0.3)'
                              }}>
                                Credit Memo
                              </span>
                            ) : tx.type === 'SETTLEMENT' ? (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: 'rgba(56, 189, 248, 0.15)',
                                color: '#38bdf8',
                                border: '1px solid rgba(56, 189, 248, 0.3)'
                              }}>
                                Settled
                              </span>
                            ) : tx.debit > 0 && !isReversal ? (
                              <button
                                onClick={() => setReversingTx(tx)}
                                title="Reverse this charge with audited credit memo"
                                style={{
                                  padding: '3px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  color: '#cbd5e1',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                                  e.currentTarget.style.color = '#fca5a5';
                                  e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                  e.currentTarget.style.color = '#cbd5e1';
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                }}
                              >
                                ↩️ Reverse
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(212, 175, 55, 0.08)', fontWeight: 800 }}>
                      <td colSpan="3" style={{ padding: '0.75rem', color: 'var(--gold-glow)' }}>
                        CURRENT NET OUTSTANDING (INR) <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', marginLeft: '6px' }}>FX ⚡ Σ(DEBITS) - Σ(CREDITS)</span>:
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171' }}>
                        ₹{totalDebits.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399' }}>
                        ₹{totalCredits.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--gold-glow)', fontSize: '1rem' }}>
                        ₹{netOutstanding.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Reversal Confirmation Dialog */}
                {reversingTx && (
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <RotateCcw size={18} color="#f43f5e" />
                      <strong style={{ color: '#f43f5e', fontSize: '0.95rem' }}>
                        Reverse Charge: {reversingTx.desc} (₹{reversingTx.debit.toFixed(2)})
                      </strong>
                    </div>

                    <form onSubmit={handleConfirmReversal} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className="form-group">
                        <label className="form-label">Mandatory Audit Reversal Reason</label>
                        <select
                          className="form-select"
                          value={reversalReason}
                          onChange={(e) => setReversalReason(e.target.value)}
                        >
                          <option value="Billed to Wrong Room by Mistake">Billed to Wrong Room by Mistake</option>
                          <option value="Guest Billing Dispute Resolved by GM">Guest Billing Dispute Resolved by GM</option>
                          <option value="Duplicate Order Punched in POS">Duplicate Order Punched in POS</option>
                          <option value="Service Quality Courtesy Waiver">Service Quality Courtesy Waiver</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button type="submit" className="btn-primary-gold" style={{ background: '#f43f5e', borderColor: '#f43f5e' }}>
                          Confirm Reversal Memo (-₹{reversingTx.debit.toFixed(2)})
                        </button>
                        <button type="button" onClick={() => setReversingTx(null)} className="btn-outline-gold">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ACTION: MULTI-TENDER SPLIT SETTLEMENT */}
            {selectedAction === 'split-settle' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Multi-Tender Split Settlement at Checkout
                </h3>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Split the guest's folio payment across Cash, UPI (PhonePe), Card Swipe, and Corporate Credit (Linde/JK Paper).
                </p>

                {/* Net Due Summary Card */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-glow)', textTransform: 'uppercase' }}>Total Folio Balance Payable</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                      ₹{netOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: tenderVariance === 0 ? '#34d399' : '#f87171', textTransform: 'uppercase', fontWeight: 700 }}>
                      {tenderVariance === 0 ? '✓ 100% Balanced' : `Unallocated Variance: ₹${tenderVariance.toFixed(2)}`}
                    </span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Total Allocated: ₹{allocatedTenders.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quick Allocation Presets */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSettleUpi(netOutstanding.toFixed(2));
                      setSettleCash('');
                      setSettleCard('');
                      setSettleBtc('');
                    }}
                    style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', cursor: 'pointer' }}
                  >
                    100% UPI (PhonePe)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSettleCash(netOutstanding.toFixed(2));
                      setSettleUpi('');
                      setSettleCard('');
                      setSettleBtc('');
                    }}
                    style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600, background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', cursor: 'pointer' }}
                  >
                    100% Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSettleCard(netOutstanding.toFixed(2));
                      setSettleCash('');
                      setSettleUpi('');
                      setSettleBtc('');
                    }}
                    style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600, background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)', cursor: 'pointer' }}
                  >
                    100% Card Swipe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSettleBtc(netOutstanding.toFixed(2));
                      setSettleCash('');
                      setSettleUpi('');
                      setSettleCard('');
                    }}
                    style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600, background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', cursor: 'pointer' }}
                  >
                    100% BTC Corporate
                  </button>
                  {tenderVariance > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentUpi = Number(settleUpi) || 0;
                        setSettleUpi((currentUpi + tenderVariance).toFixed(2));
                      }}
                      style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', border: '1px solid var(--gold-glow)', cursor: 'pointer' }}
                    >
                      + Auto-Add ₹{tenderVariance.toFixed(2)} to UPI
                    </button>
                  )}
                </div>

                {/* Split Tender Form */}
                <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Tender 1: Cash */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      💵 Tender 1: Physical Cash (Front Desk Drawer)
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 1000.00"
                      value={settleCash}
                      onChange={(e) => setSettleCash(e.target.value)}
                    />
                  </div>

                  {/* Tender 2: UPI */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      📱 Tender 2: UPI / QR Payment (PhonePe, GooglePay, Paytm)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="UPI Amount (₹)"
                        value={settleUpi}
                        onChange={(e) => setSettleUpi(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Bank UTR / Ref #"
                        value={settleUpiRef}
                        onChange={(e) => setSettleUpiRef(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tender 3: Card Swipe */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      💳 Tender 3: Credit / Debit Card Swipe (POS Terminal)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Card Amount (₹)"
                        value={settleCard}
                        onChange={(e) => setSettleCard(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Auth Code / Terminal Batch"
                        value={settleCardRef}
                        onChange={(e) => setSettleCardRef(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tender 4: Corporate Credit (BTC) */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      🏢 Tender 4: Bill To Company (BTC Corporate Ledger)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="BTC Billed Amount (₹)"
                        value={settleBtc}
                        onChange={(e) => setSettleBtc(e.target.value)}
                      />
                      <select
                        className="form-select"
                        value={settleBtcCompany}
                        onChange={(e) => setSettleBtcCompany(e.target.value)}
                      >
                        {CORPORATE_PARTNERS.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleCompleteSplitCheckout}
                    disabled={Math.abs(tenderVariance) > 1}
                    className="btn-primary-gold"
                    style={{
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      opacity: Math.abs(tenderVariance) <= 1 ? 1 : 0.5,
                      cursor: Math.abs(tenderVariance) <= 1 ? 'pointer' : 'not-allowed',
                      marginTop: '0.5rem'
                    }}
                  >
                    Complete Split-Tender Checkout &amp; Release Key
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: LATE CHECKOUT & 24-HOUR CYCLE CALCULATOR */}
            {selectedAction === 'late-checkout' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  24-Hour Cycle &amp; Late Checkout Surcharge Calculator
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Standard checkout is 12:00 PM (or 24-hour cycle from arrival). Calculate half-day (50%) or full-day extension charges.
                </p>

                <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Requested Departure Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={checkoutTargetTime}
                      onChange={(e) => setCheckoutTargetTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Late Checkout Policy</label>
                    <select
                      className="form-select"
                      value={lateFeePolicy}
                      onChange={(e) => setLateFeePolicy(e.target.value)}
                    >
                      <option value="grace">Grace Period (Free Extension until 14:00 PM - GM Courtesy)</option>
                      <option value="half-day">Half-Day Tariff (+50% Base Room Rate - Until 18:00 PM)</option>
                      <option value="full-day">Full-Day Tariff (+100% Base Room Rate - Post 18:00 PM)</option>
                    </select>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span>Base Room Tariff:</span>
                      <strong style={{ color: '#fff' }}>₹{room.tariff || 2999}.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 700 }}>
                      <span>Applicable Surcharge:</span>
                      <span>
                        {lateFeePolicy === 'grace' ? '₹0.00 (Waiver)' : lateFeePolicy === 'half-day' ? `+ ₹${((room.tariff || 2999) * 0.5).toFixed(2)} (50%)` : `+ ₹${(room.tariff || 2999).toFixed(2)} (100%)`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleApplyLateCheckout}
                      className="btn-primary-gold"
                    >
                      Apply Extension Surcharge to Folio
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveTariff}
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.2))',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Waive / Remove Late Stay Hourly Tariff for Regular/VIP Guest"
                    >
                      <RotateCcw size={15} /> ⚡ Remove Tariff (Regular/VIP Waiver)
                    </button>
                  </div>

                  {/* OWNER'S EXACT VIDEO EXPLANATION BANNER (Timestamps 1:40 - 2:05) */}
                  <div style={{
                    marginTop: '1rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.8rem',
                    color: '#fca5a5',
                    lineHeight: 1.5
                  }}>
                    <strong>Operating Policy:</strong> <em>"Late stay charges (past standard 12:00 PM check-out) can be waived for authorized preferred corporate or loyal guests at manager discretion."</em>
                    <br />
                    Clicking <strong>Remove Tariff</strong> immediately posts an authorized GM waiver credit memo to zero-out the late tariff before final checkout.
                  </div>
                </div>
              </div>
            )}

            {/* ACTION: CHARGES (POST DEBIT) */}
            {selectedAction === 'charges' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Post Manual Folio Charge (MySoft charges.php)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Post dining, laundry, extra bed, or miscellaneous charges directly to Room {room.roomNumber} folio.
                </p>

                <form onSubmit={handlePostCharge} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Charge Category / Service Ledger</label>
                    <select
                      className="form-select"
                      value={chargeCategory}
                      onChange={(e) => setChargeCategory(e.target.value)}
                    >
                      {POST_CHARGE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (SAC {cat.sac} • {cat.taxRate}% GST)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Charge Amount Base (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 962.00"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Voucher / KOT Reference No.</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. KOT-F2627-18346"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service Description / Remarks</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Fenugreek Restaurant Dinner - Veg Fried Rice + Mineral Water"
                      value={chargeRemarks}
                      onChange={(e) => setChargeRemarks(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Post Charge to Folio
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: ROOM ADVANCE */}
            {selectedAction === 'advance' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Record Advance Deposit
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Collect partial payment or security deposit against Room {room.roomNumber} folio.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!advanceAmount) return;
                  const amt = Number(advanceAmount);
                  const newAdvTx = {
                    id: `ADV-${Date.now().toString().slice(-4)}`,
                    date: new Date().toLocaleDateString('en-IN'),
                    type: 'ADVANCE',
                    desc: `Advance Deposit (${advanceMode} • Ref: ${advanceRef || 'Direct'})`,
                    sac: '-',
                    debit: 0,
                    credit: amt,
                    operator: 'Duty Manager'
                  };
                  setFolioTransactions([newAdvTx, ...folioTransactions]);
                  showFeedback(`✓ Recorded Advance of ₹${amt.toFixed(2)} via ${advanceMode}.`);
                  setAdvanceAmount('');
                }} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Advance Amount Received (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 5000.00"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Payment Tender Mode</label>
                      <select
                        className="form-select"
                        value={advanceMode}
                        onChange={(e) => setAdvanceMode(e.target.value)}
                      >
                        <option value="UPI">UPI (PhonePe / GooglePay / SBI QR)</option>
                        <option value="Cash">Cash (Front Desk Physical Drawer)</option>
                        <option value="Card">Card Swipe (HDFC / Axis POS)</option>
                        <option value="NEFT">NEFT / RTGS Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transaction / Bank UTR Reference</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. SBI-UPI-884129384729"
                      value={advanceRef}
                      onChange={(e) => setAdvanceRef(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Record &amp; Print Advance Receipt
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: CHANGE ROOM (SHIFT) */}
            {selectedAction === 'change-room' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Change Room (Room Shift)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Seamlessly shift {guestName} from Room {room.roomNumber} to another vacant room key.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!targetRoomNo) return;
                  showFeedback(`✓ Shifted Guest from Room ${room.roomNumber} to Room ${targetRoomNo}. Folio balance transferred.`);
                  if (onShiftRoom) onShiftRoom(room.roomNumber, targetRoomNo, shiftReason);
                }} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Target Vacant Room</label>
                    <select
                      className="form-select"
                      value={targetRoomNo}
                      onChange={(e) => setTargetRoomNo(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Key from {vacantRooms.length} Vacant Keys --</option>
                      {vacantRooms.map(r => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room {r.roomNumber} (Floor {r.floor} • {r.tier} - ₹{r.tariff}/night)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reason for Room Shift</label>
                    <select
                      className="form-select"
                      value={shiftReason}
                      onChange={(e) => setShiftReason(e.target.value)}
                    >
                      <option value="Guest Requested Upgrade / Quiet Wing">Guest Requested Upgrade / Quiet Wing</option>
                      <option value="AC Maintenance / Technical Issue (AC PRBLM)">AC Maintenance / Technical Issue (AC PRBLM)</option>
                      <option value="Plumbing Issue">Plumbing Issue</option>
                      <option value="Extended Stay Extension">Extended Stay Extension</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Confirm Room Shift &amp; Transfer Folio
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: PAX CHANGE */}
            {selectedAction === 'pax-change' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Pax Change (Adults / Children)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Update guest occupancy numbers for Room {room.roomNumber} and recalculate meal plan allowances.
                </p>

                <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Adults Count</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        className="form-input"
                        value={adultPax}
                        onChange={(e) => setAdultPax(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Children Count</label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        className="form-input"
                        value={childPax}
                        onChange={(e) => setChildPax(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => showFeedback(`✓ Occupancy updated to ${adultPax} Adults + ${childPax} Children.`)}
                    className="btn-primary-gold"
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                  >
                    Save Pax Configuration
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: LINK ROOM (CORPORATE BILLING) */}
            {selectedAction === 'link-room' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Link Room to Corporate Master Account
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Combine multiple rooms under a master corporate credit ledger (e.g. Linde India Ltd, JK Paper, Ashok Leyland).
                </p>

                <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Master Corporate Partner</label>
                    <select
                      className="form-select"
                      value={masterCorporate}
                      onChange={(e) => setMasterCorporate(e.target.value)}
                    >
                      {CORPORATE_PARTNERS.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.gstin})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => showFeedback(`✓ Room ${room.roomNumber} linked to corporate account!`)}
                    className="btn-primary-gold"
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                  >
                    Link to Corporate Ledger
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: PAID OUT (DRAWER CASH) */}
            {selectedAction === 'paid-out' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Paid Out (Guest Cash Disbursement)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Disburse cash from the front desk drawer on behalf of the guest (taxi, medicine, parcel) and debit the room folio.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!paidOutAmount) return;
                  const amt = Number(paidOutAmount);
                  const paidOutTx = {
                    id: `PO-${Date.now().toString().slice(-4)}`,
                    date: new Date().toLocaleDateString('en-IN'),
                    type: 'PAID_OUT',
                    desc: `Paid Out: ${paidOutPurpose} (Paid to ${paidOutReceiver})`,
                    sac: '000000',
                    debit: amt,
                    credit: 0,
                    operator: 'Duty Manager'
                  };
                  setFolioTransactions([paidOutTx, ...folioTransactions]);
                  showFeedback(`✓ Paid Out ₹${amt.toFixed(2)} disbursed from Front Desk Drawer.`);
                  setPaidOutAmount('');
                }} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Cash Amount Disbursed (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 500.00"
                        value={paidOutAmount}
                        onChange={(e) => setPaidOutAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Receiver Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={paidOutReceiver}
                        onChange={(e) => setPaidOutReceiver(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Disbursement Purpose</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paidOutPurpose}
                      onChange={(e) => setPaidOutPurpose(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Disburse Cash &amp; Debit Folio
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: ALLOWANCE (RATE DISCOUNT) */}
            {selectedAction === 'allowance' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Rate Allowance / Courtesy Adjustment
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Apply an authorized credit allowance to adjust tariff or compensate for service recovery.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!allowanceAmount) return;
                  const amt = Number(allowanceAmount);
                  const allowTx = {
                    id: `ALW-${Date.now().toString().slice(-4)}`,
                    date: new Date().toLocaleDateString('en-IN'),
                    type: 'ALLOWANCE',
                    desc: `Credit Allowance (${allowanceReason})`,
                    sac: '996311',
                    debit: 0,
                    credit: amt,
                    operator: 'General Manager'
                  };
                  setFolioTransactions([allowTx, ...folioTransactions]);
                  showFeedback(`✓ Credit Allowance of ₹${amt.toFixed(2)} applied.`);
                  setAllowanceAmount('');
                }} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Allowance Amount to Credit (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 500.00"
                      value={allowanceAmount}
                      onChange={(e) => setAllowanceAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manager Approval &amp; Reason</label>
                    <input
                      type="text"
                      className="form-input"
                      value={allowanceReason}
                      onChange={(e) => setAllowanceReason(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Apply Credit Allowance
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: EDIT GUEST INFO */}
            {selectedAction === 'edit-guest' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Edit In-House Guest Profile
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Update guest details, GSTIN, phone, and corporate designation post check-in.
                </p>

                <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Guest Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Company / Organisation</label>
                      <input
                        type="text"
                        className="form-input"
                        value={guestCompany}
                        onChange={(e) => setGuestCompany(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Corporate GSTIN</label>
                      <input
                        type="text"
                        className="form-input"
                        value={guestGstin}
                        onChange={(e) => setGuestGstin(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={() => showFeedback(`✓ Guest profile updated for ${guestName} (${guestCompany})!`)}
                    className="btn-primary-gold"
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: TRANSFER FOLIO (INTER-ROOM BILL TRANSFER - Owner Video: Timestamps 2:15 - 4:40) */}
            {selectedAction === 'transfer-folio' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge" style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#c084fc', border: '1px solid #c084fc', fontWeight: 700 }}>
                    INTER-ROOM TRANSFER
                  </span>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                    Transfer Folio • Inter-Room Bill Transfer
                  </h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  Move restaurant food bills or other charges between rooms (e.g. Senior Officer covering Junior Officer's dining allowance, or correcting a wrong room dining slip).
                </p>

                {/* Quick Presets */}
                <div style={{
                  background: 'rgba(12, 24, 43, 0.7)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    ⚡ Common Transfer Scenarios:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setTransferReason('Senior Officer ₹1,500 daily food allowance covers Junior Officer dining (Linde India Ltd)');
                        const diningTx = folioTransactions.find(t => t.type === 'DINING' || t.desc.toLowerCase().includes('fenugreek') || t.desc.toLowerCase().includes('restaurant'));
                        if (diningTx) setSelectedTxToTransfer(diningTx.id);
                      }}
                      style={{
                        background: 'rgba(167, 139, 250, 0.15)',
                        color: '#c084fc',
                        border: '1px solid rgba(167, 139, 250, 0.4)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      👔 Scenario 1: Senior Officer Covers Junior Officer (₹1,500 Allowance)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTransferReason('Wrong room number written by restaurant steward on KOT slip (Move to correct room)');
                        const diningTx = folioTransactions.find(t => t.type === 'DINING' || t.desc.toLowerCase().includes('fenugreek'));
                        if (diningTx) setSelectedTxToTransfer(diningTx.id);
                      }}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      🧾 Scenario 2: Wrong Room Slip Posted by Mistake
                    </button>
                  </div>
                </div>

                {/* Transfer Form Grid */}
                <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Step 1: Select Transaction */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: '#38bdf8' }}>
                      Step 1: Select Bill / Charge to Transfer from Room {room.roomNumber}:
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                      {folioTransactions.filter(t => !t.isReversed && !t.isTransferred && t.debit > 0).map(t => {
                        const isSelected = selectedTxToTransfer === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTxToTransfer(t.id)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: `1px solid ${isSelected ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`,
                              background: isSelected ? 'rgba(167, 139, 250, 0.18)' : 'rgba(255,255,255,0.02)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="radio"
                                name="txTransfer"
                                checked={isSelected}
                                onChange={() => setSelectedTxToTransfer(t.id)}
                              />
                              <div>
                                <strong style={{ color: isSelected ? '#c084fc' : '#fff', fontSize: '0.82rem' }}>
                                  [{t.id}] {t.desc}
                                </strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {t.date} • SAC {t.sac} • Operator: {t.operator}
                                </div>
                              </div>
                            </div>
                            <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>
                              ₹{t.debit.toFixed(2)}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Destination Room & Reason */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, color: '#38bdf8' }}>
                        Step 2: Destination Room to Receive Charge:
                      </label>
                      <select
                        className="form-select"
                        value={transferTargetRoom}
                        onChange={(e) => setTransferTargetRoom(e.target.value)}
                      >
                        {otherRooms.map(r => (
                          <option key={r.roomNumber} value={r.roomNumber}>
                            Room {r.roomNumber} ({r.currentGuestName || 'Guest'} - {r.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, color: '#38bdf8' }}>
                        Step 3: Transfer Reason / Audit Memo:
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        placeholder="e.g. Senior Officer covers Junior Officer dining"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleExecuteTransfer}
                    disabled={!selectedTxToTransfer}
                    style={{
                      background: selectedTxToTransfer ? 'linear-gradient(135deg, #a78bfa, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                      color: selectedTxToTransfer ? '#060e1a' : '#64748b',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: selectedTxToTransfer ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      alignSelf: 'flex-start',
                      boxShadow: selectedTxToTransfer ? '0 4px 20px rgba(167, 139, 250, 0.4)' : 'none'
                    }}
                  >
                    <ArrowRightLeft size={16} /> Execute Inter-Room Folio Transfer
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: SPLIT FOLIO (ROOM VS F&B) */}
            {selectedAction === 'split-folio' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Corporate Split Billing (Room vs Food Invoices)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Standard Corporate Billing SOP: Automatically splits Room Tariff (SAC 996311) to Corporate BTC and Fenugreek Restaurant Dining (SAC 996331) to Guest Direct settlement.
                </p>

                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  maxWidth: 620,
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
                    Folio Split Schedule for Room {room.roomNumber} ({guestName} - {guestCompany}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem' }}>
                      <span>Invoice A (Bill #01499): Room Tariff (SAC 996311)</span>
                      <strong style={{ color: '#fff' }}>₹12,596.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem' }}>
                      <span>Invoice B (Bill #01500): Fenugreek Restaurant Dining (SAC 996331)</span>
                      <strong style={{ color: '#34d399' }}>₹962.00</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      if (onOpenSplitInvoice) onOpenSplitInvoice('a4');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    🧾 Consolidated Tax / Non-GST Bill
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenSplitInvoice) onOpenSplitInvoice('room');
                    }}
                    className="btn-primary-gold"
                  >
                    View / Print Room Invoice (₹12,596)
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenSplitInvoice) onOpenSplitInvoice('food');
                    }}
                    className="btn-secondary-sapphire"
                  >
                    View / Print Food Invoice (₹962)
                  </button>
                </div>
              </div>
            )}

            {/* ACTION 14: SUB-FOLIO WINDOWS (A: CORPORATE BTC vs B: PERSONAL EXTRAS) */}
            {selectedAction === 'sub-folio-windows' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', fontWeight: 700 }}>
                        ACTION 14 • DUAL SUB-FOLIOS
                      </span>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                        Sub-Folio Windows (Window A vs Window B)
                      </h3>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Essential for Rayagada corporate visitors (JK Paper, GAIL, IMFA, Vedanta). Separates company-reimbursable room accommodation (SAC 996311 @ 12% ITC) from personal F&amp;B and laundry extras (SAC 996331 @ 5%).
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => alert(`Printing Window A Tax Invoice for ${guestCompany || 'Company'} (₹${windowABalance.toFixed(2)})`)}
                      className="btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Printer size={14} /> Print Window A Bill
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Printing Window B Extras Invoice for ${guestName || 'Guest'} (₹${windowBBalance.toFixed(2)})`)}
                      className="btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Printer size={14} /> Print Window B Bill
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                  {/* WINDOW A: CORPORATE MASTER BTC */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700, fontSize: '0.72rem' }}>
                          WINDOW A • CORPORATE MASTER
                        </span>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                          Company: {guestCompany || 'Linde India Ltd'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Billed To Company (BTC) • SAC 996311 (12% ITC)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Window A Due</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: windowASettled ? '#34d399' : '#38bdf8' }}>
                          {windowASettled ? '✓ SETTLED' : `₹${windowABalance.toFixed(2)}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', overflowY: 'auto', maxHeight: 300 }}>
                      {windowATxns.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
                          No charges routed to Window A.
                        </div>
                      ) : (
                        windowATxns.map(tx => (
                          <div key={tx.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.78rem'
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{tx.desc}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.id} • {tx.date}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, color: '#38bdf8' }}>₹{(tx.debit || 0).toFixed(2)}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleWindow(tx.id)}
                                title="Move this charge to Window B (Personal Extras)"
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '0.68rem',
                                  borderRadius: '4px',
                                  background: 'rgba(251, 146, 60, 0.2)',
                                  color: '#fb923c',
                                  border: '1px solid rgba(251, 146, 60, 0.4)',
                                  cursor: 'pointer'
                                }}
                              >
                                Move to B ➡️
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={windowASettled || windowABalance === 0}
                      onClick={handleSettleWindowA}
                      style={{
                        padding: '0.6rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: windowASettled ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                        color: windowASettled ? '#34d399' : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: (windowASettled || windowABalance === 0) ? 'not-allowed' : 'pointer',
                        opacity: (windowASettled || windowABalance === 0) ? 0.6 : 1
                      }}
                    >
                      {windowASettled ? '✓ Window A Settled to Company BTC' : `Settle Window A (BTC ₹${windowABalance.toFixed(2)})`}
                    </button>
                  </div>

                  {/* WINDOW B: PERSONAL EXTRAS */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(251, 146, 60, 0.35)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span className="badge" style={{ background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', fontWeight: 700, fontSize: '0.72rem' }}>
                          WINDOW B • PERSONAL EXTRAS
                        </span>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                          Guest: {guestName || 'Direct Guest'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Direct Self-Pay (UPI/Cash/Card) • Dining, Laundry, Minibar
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Window B Due</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: windowBSettled ? '#34d399' : '#fb923c' }}>
                          {windowBSettled ? '✓ SETTLED' : `₹${windowBBalance.toFixed(2)}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', overflowY: 'auto', maxHeight: 300 }}>
                      {windowBTxns.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
                          No charges routed to Window B.
                        </div>
                      ) : (
                        windowBTxns.map(tx => (
                          <div key={tx.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.78rem'
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{tx.desc}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.id} • {tx.date}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, color: '#fb923c' }}>₹{(tx.debit || 0).toFixed(2)}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleWindow(tx.id)}
                                title="Move this charge back to Window A (Corporate Master)"
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '0.68rem',
                                  borderRadius: '4px',
                                  background: 'rgba(56, 189, 248, 0.2)',
                                  color: '#38bdf8',
                                  border: '1px solid rgba(56, 189, 248, 0.4)',
                                  cursor: 'pointer'
                                }}
                              >
                                ⬅️ Move to A
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={windowBSettled || windowBBalance === 0}
                      onClick={handleSettleWindowB}
                      style={{
                        padding: '0.6rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: windowBSettled ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, #ea580c, #c2410c)',
                        color: windowBSettled ? '#34d399' : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: (windowBSettled || windowBBalance === 0) ? 'not-allowed' : 'pointer',
                        opacity: (windowBSettled || windowBBalance === 0) ? 0.6 : 1
                      }}
                    >
                      {windowBSettled ? '✓ Window B Settled via Direct Pay' : `Settle Window B (Guest Pay ₹${windowBBalance.toFixed(2)})`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION 15: DISPUTED ITEM ESCROW & FAST CHECK-OUT HOLD */}
            {selectedAction === 'dispute-escrow' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge" style={{ background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', border: '1px solid #fb923c', fontWeight: 700 }}>
                    ACTION 15 • ESCROW MANAGEMENT
                  </span>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                    Disputed Item Escrow &amp; Fast Checkout Hold
                  </h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Morning Rush &amp; Rayagada Railway Station Protection: Place contested line items into escrow so they are immediately deducted from the payable balance. The guest settles uncontested items and departs on time; Duty Manager investigates later.
                </p>

                {/* Status Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Billed Debits</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>₹{totalDebits.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#fb923c' }}>Held in Dispute Escrow</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fb923c' }}>
                      {totalDisputed > 0 ? `₹${totalDisputed.toFixed(2)}` : '₹0.00 (None Held)'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Active Net Checkout Payable</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: payableBalance > 0 ? '#38bdf8' : '#34d399' }}>
                      ₹{payableBalance.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Items in Escrow */}
                {Object.keys(disputedTxns).length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#fb923c', margin: '0 0 0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldAlert size={16} /> Currently Held in Escrow ({Object.keys(disputedTxns).length} items)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(disputedTxns).map(([txId, dispute]) => {
                        const tx = folioTransactions.find(t => t.id === txId) || { desc: txId };
                        return (
                          <div key={txId} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(251, 146, 60, 0.08)',
                            border: '1px solid rgba(251, 146, 60, 0.3)',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>{tx.desc}</div>
                              <div style={{ fontSize: '0.72rem', color: '#fed7aa', marginTop: '0.2rem' }}>
                                Reason: <strong>{dispute.reason}</strong> • Held at {dispute.heldAt}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb923c' }}>
                                ₹{(dispute.amount || 0).toFixed(2)}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleResolveDisputeAction(txId, 'release')}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  background: 'rgba(56, 189, 248, 0.2)',
                                  color: '#38bdf8',
                                  border: '1px solid #38bdf8',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Release (Verified Slip)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResolveDisputeAction(txId, 'waive')}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: '#f87171',
                                  border: '1px solid #f87171',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Waive (GST Credit Note)
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Folio Charges to Put into Escrow */}
                <h4 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>
                  Billed Line Items (Click to Place in Escrow)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {folioTransactions.filter(t => t.debit > 0 && !t.isReversed).map(tx => {
                    const isHeld = !!disputedTxns[tx.id];
                    return (
                      <div key={tx.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isHeld ? 'rgba(251, 146, 60, 0.05)' : 'rgba(0,0,0,0.3)',
                        border: isHeld ? '1px dashed rgba(251, 146, 60, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                        padding: '0.65rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, color: isHeld ? '#fed7aa' : '#fff' }}>{tx.desc}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.id} • {tx.type} • {tx.date}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: isHeld ? '#fb923c' : '#38bdf8' }}>₹{tx.debit.toFixed(2)}</span>
                          {isHeld ? (
                            <span className="badge" style={{ background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c' }}>
                              In Escrow
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenDisputeModal(tx)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                background: 'rgba(251, 146, 60, 0.15)',
                                color: '#fb923c',
                                border: '1px solid rgba(251, 146, 60, 0.35)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <ShieldAlert size={13} /> Hold in Escrow
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTION 16: COLLEAGUE 50/50 & CUSTOM % SPLIT */}
            {selectedAction === 'colleague-split' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #34d399', fontWeight: 700 }}>
                    ACTION 16 • DUAL CORPORATE SPLIT
                  </span>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                    Colleague 50/50 &amp; Custom % Bill Split (Dual Corporate GST Bills)
                  </h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Solves the common corporate requirement when two company engineers or business delegates share a room and need separate GST invoices with distinct corporate GSTINs to claim company travel reimbursement.
                </p>

                {/* Ratio Slider */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                      Split Percentage: {colleagueSplitRatio}% (Part A) / {100 - colleagueSplitRatio}% (Part B)
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => setColleagueSplitRatio(50)}
                        className="btn-outline"
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      >
                        50 / 50
                      </button>
                      <button
                        type="button"
                        onClick={() => setColleagueSplitRatio(60)}
                        className="btn-outline"
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      >
                        60 / 40
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="99"
                    value={colleagueSplitRatio}
                    onChange={(e) => setColleagueSplitRatio(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-glow)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>Colleague 1 Share: ₹{colleague1Share.toFixed(2)}</span>
                    <span>Colleague 2 Share: ₹{colleague2Share.toFixed(2)}</span>
                  </div>
                </div>

                {/* Dual Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {/* COLLEAGUE 1 */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700 }}>
                        COLLEAGUE 1 • SHARE ({colleagueSplitRatio}%)
                      </span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                        ₹{colleague1Share.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Name</label>
                        <input
                          type="text"
                          value={colleague1Name}
                          onChange={(e) => setColleague1Name(e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', background: '#0b0f19', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Company</label>
                          <input
                            type="text"
                            value={colleague1Company}
                            onChange={(e) => setColleague1Company(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', background: '#0b0f19', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Corporate GSTIN</label>
                          <input
                            type="text"
                            value={colleague1Gstin}
                            onChange={(e) => setColleague1Gstin(e.target.value.toUpperCase())}
                            style={{ width: '100%', padding: '0.4rem', background: '#0b0f19', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Taxable Share ({colleagueSplitRatio}%):</span>
                        <span>₹{(colleague1Share / 1.12).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <span>Applicable GST (12%):</span>
                        <span>₹{(colleague1Share - (colleague1Share / 1.12)).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.3rem', marginTop: '0.3rem' }}>
                        <span>Invoice Part A Total:</span>
                        <span style={{ color: '#38bdf8' }}>₹{colleague1Share.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSendColleagueWhatsApp(1)}
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', fontWeight: 700, background: '#25D366', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <MessageCircle size={14} /> WhatsApp Invoice A
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Printing Tax Invoice Part A for ${colleague1Name} (Share: ₹${colleague1Share.toFixed(2)})`)}
                        className="btn-outline"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Printer size={14} /> Print Bill
                      </button>
                    </div>
                  </div>

                  {/* COLLEAGUE 2 */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 700 }}>
                        COLLEAGUE 2 • SHARE ({100 - colleagueSplitRatio}%)
                      </span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                        ₹{colleague2Share.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Name</label>
                        <input
                          type="text"
                          value={colleague2Name}
                          onChange={(e) => setColleague2Name(e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', background: '#0b0f19', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Company</label>
                          <input
                            type="text"
                            value={colleague2Company}
                            onChange={(e) => setColleague2Company(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', background: '#0b0f19', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Corporate GSTIN</label>
                          <input
                            type="text"
                            value={colleague2Gstin}
                            onChange={(e) => setColleague2Gstin(e.target.value.toUpperCase())}
                            style={{ width: '100%', padding: '0.4rem', background: '#0b0f19', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Taxable Share ({100 - colleagueSplitRatio}%):</span>
                        <span>₹{(colleague2Share / 1.12).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <span>Applicable GST (12%):</span>
                        <span>₹{(colleague2Share - (colleague2Share / 1.12)).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.3rem', marginTop: '0.3rem' }}>
                        <span>Invoice Part B Total:</span>
                        <span style={{ color: '#34d399' }}>₹{colleague2Share.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSendColleagueWhatsApp(2)}
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', fontWeight: 700, background: '#25D366', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <MessageCircle size={14} /> WhatsApp Invoice B
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Printing Tax Invoice Part B for ${colleague2Name} (Share: ₹${colleague2Share.toFixed(2)})`)}
                        className="btn-outline"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Printer size={14} /> Print Bill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION 17: CAUTION / SECURITY DEPOSIT RECONCILIATION & REFUND */}
            {selectedAction === 'caution-deposit' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #34d399', fontWeight: 700 }}>
                    ACTION 17 • SECURITY DEPOSIT
                  </span>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                    Caution / Security Deposit Reconciliation &amp; Refund
                  </h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Reconcile security deposit collected during guest check-in against final room damages, minibar, or outstanding tariff. Automatically calculates exact cash refund voucher due to guest upon key card return.
                </p>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={18} /> Apply Security Deposit Against Folio
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Toggle this on to deduct check-in caution money directly from the net payable folio balance.
                      </div>
                    </div>

                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(0,0,0,0.3)', padding: '0.45rem 0.9rem', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.4)' }}>
                      <input
                        type="checkbox"
                        checked={cautionDepositApplied}
                        onChange={(e) => {
                          setCautionDepositApplied(e.target.checked);
                          showFeedback(e.target.checked ? `✓ Applied ₹${cautionDeposit} Caution Deposit against Room ${room.roomNumber} folio!` : 'Caution deposit removed from folio.');
                        }}
                        style={{ cursor: 'pointer', accentColor: '#34d399' }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                        {cautionDepositApplied ? '✓ Deposit Applied' : 'Apply Deposit'}
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Deposit Amount Held (₹)</label>
                      <input
                        type="number"
                        value={cautionDeposit}
                        onChange={(e) => setCautionDeposit(Number(e.target.value) || 0)}
                        style={{ padding: '0.5rem', width: '100%', background: '#0b0f19', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Folio Balance</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                        ₹{netOutstanding.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payable After Deposit</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: effectivePayable > 0 ? '#f87171' : '#34d399' }}>
                        ₹{effectivePayable.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Refund Due to Guest</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: cautionRefundDue > 0 ? '#34d399' : 'var(--text-muted)' }}>
                        {cautionRefundDue > 0 ? `₹${cautionRefundDue.toFixed(2)}` : 'None (Fully Absorbed)'}
                      </div>
                    </div>
                  </div>

                  {cautionDepositApplied && cautionRefundDue > 0 && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#34d399' }}>
                        ✓ Guest returned key card intact. Cashier drawer refund slip ready.
                      </div>
                      <button
                        type="button"
                        onClick={() => alert(`🖨️ CASHIER CAUTION REFUND SLIP\n${HOTEL_CONFIG.name}, Rayagada\nRoom: ${room.roomNumber}\nGuest: ${guestName}\nRefund Due: ₹${cautionRefundDue.toFixed(2)}\nTender: Front Desk Cash Drawer\nKey Return: Verified`)}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: 'rgba(52, 211, 153, 0.25)',
                          color: '#34d399',
                          border: '1px solid #34d399',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Printer size={15} /> Print Refund Slip
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Modal: Dispute Escrow Hold Dialog */}
        {disputeModalOpen && disputeTargetTxn && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2300
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(251, 146, 60, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fb923c', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1rem' }}>
                  <ShieldAlert size={18} /> Place Item in Dispute Escrow
                </h4>
                <button onClick={() => setDisputeModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmDisputeAction}>
                <div style={{ background: 'rgba(251, 146, 60, 0.08)', border: '1px solid rgba(251, 146, 60, 0.25)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{disputeTargetTxn.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>Ref: {disputeTargetTxn.id}</span>
                    <span style={{ fontWeight: 700, color: '#fb923c' }}>Amount: ₹{(disputeTargetTxn.debit || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#fed7aa', marginTop: '0.4rem', borderTop: '1px solid rgba(251, 146, 60, 0.15)', paddingTop: '0.4rem' }}>
                    Fast Checkout Hold: This line item will be subtracted from the checkout payable balance immediately.
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
                    placeholder="e.g. Guest denies mini-bar/service charge; F&B Captain to audit KOT slip"
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
