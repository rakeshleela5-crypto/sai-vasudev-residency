import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Printer, CheckCircle2, Download, ShieldCheck, Hotel, 
  Calendar, User, FileText, Receipt, Sparkles, Building2,
  CreditCard, Split, UtensilsCrossed, BedDouble, UserCheck, Key,
  Plus, Trash2, Edit3, Save, Check, RefreshCw, Calculator, Percent,
  MessageCircle
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { DigitalKeycard } from '@/components/ui/digital-keycard';
import { SheetsEditableCell, useUniversalInlineEdit, InlineEditorBanner, SheetsColumnHeader, SheetsToolbarLegend } from './UniversalInlineEditor';

// Indian Numbering System Converter for Statutory Tax Invoices
function convertNumberToIndianWords(num) {
  if (!num || isNaN(num)) return 'Indian Rupees Zero Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n) => {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  };
  
  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);
  let words = 'Indian Rupees ' + inWords(integerPart).trim();
  if (decimalPart > 0) {
    words += ' and ' + inWords(decimalPart).trim() + ' Paise';
  }
  return words + ' Only';
}

export default function BookingReceiptModal({ 
  isOpen, 
  onClose, 
  booking, 
  initialType = 'a4',
  onUpdateBooking,
  onAddTransaction
}) {
  // View modes: 'a4' (Consolidated), 'room-split' (Page 3), 'food-split' (Page 2), 'grc' (Page 1), 'money-receipt' (Page 5), 'pos' (Thermal), 'keycard' (3D RFID)
  const [invoiceType, setInvoiceType] = useState(initialType || 'a4');
  const [isNonGstBill, setIsNonGstBill] = useState(Boolean(booking?.isNonGstBill));
  const isLiveEditMode = true; // Always-on inline editing
  const [includeLetterhead, setIncludeLetterhead] = useState(true);
  const [rule48Copy, setRule48Copy] = useState('ORIGINAL FOR RECIPIENT');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const receiptContainerRef = useRef(null);

  useUniversalInlineEdit({
    isActive: isLiveEditMode,
    containerRef: receiptContainerRef,
    storagePrefix: 'hsi_receipt'
  });

  // Editable Guest & Corporate Header Details
  const [editHeader, setEditHeader] = useState({
    guestName: '',
    guestPhone: '',
    company: '',
    corporateGstin: '',
    billingAddress: '',
    stateCode: '21',
    stateName: 'Odisha',
    roomNumber: '201',
    tier: 'Executive AC',
    planCode: 'CP',
    grcNo: '684',
    checkInDate: '',
    checkOutDate: '',
    billNo: ''
  });

  // Dynamic Line Items State (Room stay, F&B, Add-ons, Custom services)
  const [lineItems, setLineItems] = useState([]);

  // Frontend GST Engine Controller State
  const [isGstPanelOpen, setIsGstPanelOpen] = useState(false);
  const [gstSlab, setGstSlab] = useState(12); // 12% default for rooms <= 7500; options: 12, 18, 5, 0
  const [taxType, setTaxType] = useState('intra'); // 'intra' (CGST+SGST) or 'inter' (IGST)
  const [isRcm, setIsRcm] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState('Director Approved Concession');
  const [customRoundOff, setCustomRoundOff] = useState(0);

  // Multi-Tender Breakdown State
  const [tenders, setTenders] = useState({
    cash: 500,
    upi: 1000,
    upiProvider: 'PhonePe',
    upiRef: 'UPI-849102',
    card: 0,
    cardAuth: '',
    btc: 0,
    btcCompany: 'Linde India Ltd'
  });

  // Synchronize state when modal opens or booking changes
  useEffect(() => {
    if (booking && isOpen) {
      setInvoiceType(initialType || 'a4');
      if (booking.isNonGstBill !== undefined) {
        setIsNonGstBill(Boolean(booking.isNonGstBill));
      }
      if (booking.isLiveEditMode !== undefined) {
        setIsLiveEditMode(Boolean(booking.isLiveEditMode));
      }
      const nights = Number(booking.nights || 4);
      const tariff = Number(booking.tariffPerNight || booking.tariff || 2999);
      const foodAmt = Number(booking.foodAmount || 900);

      setEditHeader({
        guestName: booking.guestName || 'MR. P ASHOK',
        guestPhone: booking.guestPhone || '+91 6305202068',
        company: booking.company || 'LINDE INDIA LTD',
        corporateGstin: booking.corporateGstin || '21AAACB2528H1ZA',
        billingAddress: booking.billingAddress || 'Rayagada Field Project Office, Rayagada - 765001',
        stateCode: booking.corporateGstin?.slice(0, 2) || '21',
        stateName: booking.corporateGstin?.slice(0, 2) === '21' ? 'Odisha' : 'Other State',
        roomNumber: String(booking.roomNumber || '301'),
        tier: booking.tier || 'Executive AC',
        planCode: booking.mealPlan || booking.plan || 'CP',
        grcNo: booking.grcNo || '684',
        checkInDate: booking.checkInDate || '17-Sep-2026 20:44',
        checkOutDate: booking.checkOutDate || '21-Sep-2026 14:15',
        billNo: booking.billNo || `FMBIL2627-${String(booking.roomNumber || '1499').padStart(5, '0')}`
      });

      // Initial line items
      const initialItems = [
        {
          id: 'item-1',
          desc: `Accommodation Stay - ${booking.tier || 'Executive AC'} (Room ${booking.roomNumber || '301'})`,
          subDesc: `Plan: ${booking.mealPlan || 'CP'} • ${nights} Nights Stay`,
          sac: '996311',
          qty: nights,
          rate: tariff,
          isExempt: false
        },
        {
          id: 'item-2',
          desc: 'Cannon Kitchen Restaurant - Food & Dining',
          subDesc: 'Satvik Dining & Thali Service (KOT F2627-18346)',
          sac: '996331',
          qty: 1,
          rate: foodAmt,
          isExempt: false
        }
      ];

      if (Array.isArray(booking.selectedAddOns)) {
        booking.selectedAddOns.forEach((addon, idx) => {
          initialItems.push({
            id: `addon-${idx}`,
            desc: addon.name || 'Extra Service',
            subDesc: addon.pricingType === 'per_night' ? `${nights} Nights Package` : 'One-time Facility',
            sac: addon.sac || '996311',
            qty: addon.pricingType === 'per_night' ? nights : 1,
            rate: Number(addon.price || 0),
            isExempt: false
          });
        });
      }

      setLineItems(initialItems);

      // Auto-detect interstate if corporate GSTIN is outside Odisha (21)
      const gstinState = booking.corporateGstin ? booking.corporateGstin.slice(0, 2) : '21';
      if (gstinState && gstinState !== '21') {
        setTaxType('inter');
      } else {
        setTaxType('intra');
      }

      // Initialize tenders
      const bTenders = booking.tenders || {};
      const adv = Number(booking.advanceDeposit || booking.advancePaid || 5000);
      setTenders({
        cash: bTenders.cash !== undefined ? bTenders.cash : 500,
        upi: bTenders.upi !== undefined ? bTenders.upi : (adv >= 1000 ? 1000 : adv),
        upiProvider: bTenders.upiProvider || 'PhonePe',
        upiRef: bTenders.upiRef || 'UPI-849102',
        card: bTenders.card !== undefined ? bTenders.card : 0,
        cardAuth: bTenders.cardAuth || '',
        btc: bTenders.btc !== undefined ? bTenders.btc : (booking.isB2b ? Math.max(0, (booking.totalAmount || 13538) - adv) : 0),
        btcCompany: booking.company || 'Linde India Ltd'
      });
    }
  }, [isOpen, booking, initialType]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    // Record Rule 48 Multi-Copy Statutory Print Audit Log in Cloudflare D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'log_invoice_print',
        payload: {
          invoiceNo: booking?.billNo || `INV-${booking?.roomNumber || 'GEN'}-${Date.now().toString().slice(-4)}`,
          bookingId: booking?.bookingId || booking?.id || null,
          roomNumber: String(booking?.roomNumber || ''),
          guestOrCompany: booking?.companyName || booking?.guestName || 'Valued Guest',
          rule48Copy: rule48Copy || 'ORIGINAL FOR RECIPIENT',
          documentType: isNonGstBill ? 'Non-GST Bill of Supply (SAC 996311)' : 'Tax Invoice (SAC 996311)'
        }
      })
    }).catch(() => {});

    window.print();
  };

  // Live Recalculations from lineItems & GST Engine
  const baseTaxable = lineItems
    .filter(item => !isNonGstBill && !item.isExempt)
    .reduce((sum, item) => sum + (Number(item.qty || 1) * Number(item.rate || 0)), 0);

  const exemptBase = lineItems
    .filter(item => isNonGstBill || item.isExempt)
    .reduce((sum, item) => sum + (Number(item.qty || 1) * Number(item.rate || 0)), 0);

  const netTaxable = Math.max(0, baseTaxable - Number(discountAmount || 0));

  const effectiveSlab = isNonGstBill ? 0 : Number(gstSlab || 12);
  const cgstRate = taxType === 'intra' ? (effectiveSlab / 2) : 0;
  const sgstRate = taxType === 'intra' ? (effectiveSlab / 2) : 0;
  const igstRate = taxType === 'inter' ? effectiveSlab : 0;

  const cgstAmount = Number(((netTaxable * cgstRate) / 100).toFixed(2));
  const sgstAmount = Number(((netTaxable * sgstRate) / 100).toFixed(2));
  const igstAmount = Number(((netTaxable * igstRate) / 100).toFixed(2));
  const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;

  const unroundedTotal = netTaxable + exemptBase + totalTaxAmount;
  const autoRoundOff = Number((Math.round(unroundedTotal) - unroundedTotal).toFixed(2));
  const effectiveRoundOff = customRoundOff !== 0 ? customRoundOff : autoRoundOff;
  const grandTotal = Math.round(unroundedTotal + effectiveRoundOff);

  const advancePaid = Number(booking.advanceDeposit || booking.advancePaid || 5000);
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  // Room Split calculations (Page 3 of hotel_documents.pdf)
  const roomItems = lineItems.filter(item => item.sac === '996311' || item.desc?.toLowerCase().includes('accommodation') || item.desc?.toLowerCase().includes('tariff') || item.desc?.toLowerCase().includes('room'));
  const roomTariffBase = roomItems.length > 0
    ? roomItems.reduce((sum, item) => sum + (Number(item.qty || 1) * Number(item.rate || 0)), 0)
    : 11996.00;
  const roomGstVal = Number(((roomTariffBase * 5) / 100).toFixed(2));
  const roomSgst = Number((roomGstVal / 2).toFixed(2));
  const roomCgst = Number((roomGstVal / 2).toFixed(2));
  const roomTotal = Number((roomTariffBase + roomGstVal).toFixed(2));

  // Food Split calculations (Page 2 of hotel_documents.pdf - Cannon Kitchen)
  const foodItems = lineItems.filter(item => item.sac === '996331' || item.desc?.toLowerCase().includes('dining') || item.desc?.toLowerCase().includes('restaurant') || item.desc?.toLowerCase().includes('food'));
  const foodBase = foodItems.length > 0
    ? foodItems.reduce((sum, item) => sum + (Number(item.qty || 1) * Number(item.rate || 0)), 0)
    : 900.00;
  const foodGstVal = Number(((foodBase * 5) / 100).toFixed(2));
  const foodSgst = Number((foodGstVal / 2).toFixed(2));
  const foodCgst = Number((foodGstVal / 2).toFixed(2));
  const foodTotal = Number((foodBase + foodGstVal).toFixed(2));

  const effectiveBillNo = isNonGstBill 
    ? `NGST2627-${String(editHeader.roomNumber || '1499').padStart(5, '0')}`
    : (editHeader.billNo || `FMBIL2627-${String(editHeader.roomNumber || '1499').padStart(5, '0')}`);
  const billNo = effectiveBillNo;

  // Handler to Add a Line Item
  const handleAddLineItem = (presetType) => {
    let newItem = {
      id: `item-${Date.now()}`,
      desc: 'Custom Service / Facility',
      subDesc: 'Service Charge',
      sac: '996311',
      qty: 1,
      rate: 500,
      isExempt: false
    };

    if (presetType === 'extra-bed') {
      newItem = {
        id: `item-${Date.now()}`,
        desc: 'Extra Bed / Rollaway Mattress with Linen',
        subDesc: 'Housekeeping Rollaway Bed Facility',
        sac: '996311',
        qty: 1,
        rate: 400,
        isExempt: false
      };
    } else if (presetType === 'station-transfer') {
      newItem = {
        id: `item-${Date.now()}`,
        desc: 'Railway Station / Temple Cab Transfer',
        subDesc: 'RGDA Station Drop / Maa Majhighariani Shuttle',
        sac: '996412',
        qty: 1,
        rate: 350,
        isExempt: false
      };
    } else if (presetType === 'late-checkout') {
      newItem = {
        id: `item-${Date.now()}`,
        desc: 'Late Check-Out Retention Charge',
        subDesc: 'Extended Room Occupancy until 16:00 PM',
        sac: '996311',
        qty: 1,
        rate: 500,
        isExempt: false
      };
    } else if (presetType === 'laundry') {
      newItem = {
        id: `item-${Date.now()}`,
        desc: 'Express Laundry & Steam Press Service',
        subDesc: 'Executive Garment Laundry',
        sac: '999799',
        qty: 1,
        rate: 150,
        isExempt: false
      };
    } else if (presetType === 'dining') {
      newItem = {
        id: `item-${Date.now()}`,
        desc: 'Satvik Executive Dining / In-Room Service',
        subDesc: 'Chef Special Thali & Fresh Beverages',
        sac: '996331',
        qty: 1,
        rate: 350,
        isExempt: false
      };
    }

    setLineItems(prev => [...prev, newItem]);
  };

  // Handler to Delete a Line Item
  const handleDeleteLineItem = (id) => {
    if (lineItems.length <= 1) {
      alert('At least one line item must remain on the invoice.');
      return;
    }
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  // Handler to Update a Line Item
  const handleUpdateLineItem = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'qty' || field === 'rate' ? Number(value) : value
        };
      }
      return item;
    }));
  };

  // Handler to Save and Propagate to App State, Folio, and Accounts Day Book
  const handleSaveInvoice = () => {
    const updated = {
      ...booking,
      guestName: editHeader.guestName,
      guestPhone: editHeader.guestPhone,
      company: editHeader.company,
      corporateGstin: editHeader.corporateGstin,
      billingAddress: editHeader.billingAddress,
      roomNumber: editHeader.roomNumber,
      tier: editHeader.tier,
      mealPlan: editHeader.planCode,
      checkInDate: editHeader.checkInDate,
      checkOutDate: editHeader.checkOutDate,
      billNo: effectiveBillNo,
      baseTotal: netTaxable,
      taxableBase: netTaxable,
      cgst: cgstAmount,
      sgst: sgstAmount,
      igst: igstAmount,
      totalAmount: grandTotal,
      balanceDue: balanceDue,
      gstSlab: effectiveSlab,
      taxType,
      isNonGstBill,
      lineItems,
      tenders,
      discountAmount,
      discountReason,
      effectiveRoundOff
    };

    if (onUpdateBooking) {
      onUpdateBooking(updated);
    }

    // Broadcast update across windows and modals
    try {
      window.dispatchEvent(new CustomEvent('hsi_invoice_updated', { detail: updated }));
    } catch (e) {
      console.warn('Dispatch failed:', e);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // WhatsApp GST Tax Folio Dispatch
  const handleSendWhatsAppInvoice = () => {
    const rawPhone = (editHeader.guestPhone || booking.guestPhone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : (rawPhone.length > 10 ? rawPhone : '916305202068');
    
    const msg = 
`*SRI SAI VASUDEV RESIDENCY - OFFICIAL GST TAX INVOICE*
🏛️ *Near Andhra Bank, New Colony, Rayagada, Odisha - 765001*
📞 Front Desk: +91 8895225555 / +91 8249258377 | GSTIN: 21AEKPP8689J1ZS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear *${editHeader.guestName || booking.guestName || 'Valued Guest'}*,

Thank you for choosing Sri Sai Vasudev Residency! Here is your official GST tax folio summary:

📄 *Bill / Invoice No:* ${billNo}
🚪 *Room Number:* ${editHeader.roomNumber || booking.roomNumber} (${editHeader.tier || booking.tier || 'Executive AC'})
📅 *Stay Duration:* ${editHeader.checkInDate || booking.checkInDate} to ${editHeader.checkOutDate || booking.checkOutDate}
🏷️ *Tax Category:* ${isNonGstBill ? 'Exempt / Non-GST' : `${gstSlab}% GST (${taxType === 'intra' ? 'CGST+SGST' : 'IGST'})`}

💰 *Taxable Base:* ₹${netTaxable.toLocaleString('en-IN')}
📊 *Total GST:* ₹${totalTaxAmount.toLocaleString('en-IN')}
💵 *Grand Total (Rounded):* ₹${grandTotal.toLocaleString('en-IN')}
✅ *Advance / Deposit Paid:* ₹${advancePaid.toLocaleString('en-IN')}
${balanceDue > 0 ? `⚠️ *Balance Payable at Desk:* ₹${balanceDue.toLocaleString('en-IN')}` : '✨ *Settlement Status:* Fully Settled & Cleared'}

🔗 *View Digital Folio & RFID Keycard:*
${window.location.origin}/?bill=${billNo}&room=${editHeader.roomNumber || booking.roomNumber}

🙏 *We wish you a pleasant journey! Jay Jagannath!*`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="official-invoice-overlay" onClick={onClose}>
      <div 
        ref={receiptContainerRef} 
        className={'official-invoice-modal-content'} 
        style={{ maxWidth: 1040, width: '100%', position: 'relative' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="invoice-action-bar no-print">
          {/* Row 1: Header Title & Room Tag with Pinned Close Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              <FileText size={16} color="var(--gold-glow)" style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--gold-glow)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} /> Universal Document Editor Engine
                  <span style={{
                    background: !isNonGstBill ? 'rgba(212, 175, 55, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: !isNonGstBill ? 'var(--gold-glow)' : '#38bdf8',
                    border: !isNonGstBill ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)',
                    fontSize: '0.66rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    {!isNonGstBill ? '🏛️ Rule 46 GST' : '📜 Non-GST Cash Memo'}
                  </span>
                </span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#94a3b8', 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  Room {booking.roomNumber || '301'} • {booking.guestName || 'MR. P ASHOK'} • 
                  {invoiceType === 'grc' ? 'Official GRC Registration Form' :
                   invoiceType === 'room-split' ? 'Room Stay Tariff (Page 3)' :
                   invoiceType === 'food-split' ? 'Cannon Kitchen Dining (Page 2)' :
                   invoiceType === 'money-receipt' ? 'Money Receipt & Advance Voucher (Page 5)' :
                   invoiceType === 'pos' ? '80mm Thermal Receipt' :
                   invoiceType === 'keycard' ? '3D Smart RFID Pass' :
                   'Consolidated Tax Invoice / Bill of Supply (A4)'}
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose} 
              className="modal-close-btn" 
              title="Close Modal (Esc)"
              style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '6px', 
                padding: '4px 8px', 
                color: '#f87171',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.74rem',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              <X size={15} /> Close (Esc)
            </button>
          </div>

          {/* Row 2: Primary Actions Toolbar (Responsive Scroll Strip) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: '6px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '2px',
            scrollbarWidth: 'none'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              

              {invoiceType !== 'keycard' && (
                <button
                  type="button"
                  onClick={() => setIncludeLetterhead(!includeLetterhead)}
                  style={{
                    background: includeLetterhead ? 'rgba(255,255,255,0.06)' : 'rgba(245, 158, 11, 0.2)',
                    border: includeLetterhead ? '1px solid rgba(255,255,255,0.2)' : '1px solid #f59e0b',
                    color: includeLetterhead ? '#cbd5e1' : '#fbbf24',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                  title="Toggle Header for Blank A4 Paper vs. Pre-Printed Hotel Letterhead Pads"
                >
                  <Building2 size={13} /> {includeLetterhead ? '🏢 Header: On (Blank A4)' : '📄 Header: Off (Pre-printed Pad)'}
                </button>
              )}

              {['a4', 'room-split', 'food-split'].includes(invoiceType) && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '2px 4px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  gap: '3px'
                }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', padding: '0 4px', fontWeight: 600 }}>Rule 48:</span>
                  {[
                    { id: 'ORIGINAL FOR RECIPIENT', label: 'Original' },
                    { id: 'DUPLICATE FOR TRANSPORTER', label: 'Duplicate' },
                    { id: 'TRIPLICATE FOR SUPPLIER', label: 'Triplicate' }
                  ].map(cp => (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => setRule48Copy(cp.id)}
                      style={{
                        background: rule48Copy === cp.id ? '#0284c7' : 'transparent',
                        border: 'none',
                        color: rule48Copy === cp.id ? '#fff' : '#94a3b8',
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: rule48Copy === cp.id ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {cp.label}
                    </button>
                  ))}
                </div>
              )}

              {invoiceType !== 'keycard' && isLiveEditMode && (
                <button
                  type="button"
                  onClick={handleSaveInvoice}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '1px solid #34d399',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <Save size={13} /> Save Folio
                </button>
              )}

              {invoiceType === 'a4' && isLiveEditMode && (
                <button
                  type="button"
                  onClick={() => setIsGstPanelOpen(!isGstPanelOpen)}
                  style={{
                    background: isGstPanelOpen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.12)',
                    border: isGstPanelOpen ? '1px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                  title="Toggle GST Engine & Quick Add Line Items"
                >
                  <Calculator size={13} /> {isGstPanelOpen ? '▲ Hide GST/Add-ons' : `▼ GST (${gstSlab}%) & Add-ons`}
                </button>
              )}

              {saveSuccess && (
                <span style={{
                  fontSize: '0.72rem',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #34d399',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap'
                }}>
                  <Check size={12} /> Saved!
                </span>
              )}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {invoiceType !== 'keycard' && (
                <button 
                  type="button"
                  onClick={handlePrint} 
                  className="btn-primary-gold" 
                  style={{ padding: '5px 12px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                >
                  <Printer size={13} /> {
                    invoiceType === 'grc' ? 'Print GRC' :
                    invoiceType === 'money-receipt' ? 'Print Receipt' :
                    invoiceType === 'pos' ? 'Print Thermal' :
                    invoiceType === 'room-split' ? 'Print Room' :
                    invoiceType === 'food-split' ? 'Print Dining' :
                    'Print Invoice'
                  }
                </button>
              )}

              {invoiceType !== 'keycard' && (
                <button 
                  type="button"
                  onClick={handleSendWhatsAppInvoice} 
                  style={{ 
                    padding: '5px 12px', 
                    fontSize: '0.74rem', 
                    fontWeight: 700,
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    border: '1px solid #25D366',
                    color: '#ffffff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)'
                  }}
                  title="Send Official GST Tax Invoice to Guest's WhatsApp"
                >
                  <MessageCircle size={13} /> WhatsApp Bill
                </button>
              )}
            </div>
          </div>

          {/* Row 3: Frontend GST Engine & Quick Line-Item Controller Strip */}
          {invoiceType === 'a4' && isLiveEditMode && isGstPanelOpen && (
            <div style={{
              background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {/* GST Slab Selector & Tax Mode */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Calculator size={14} /> GST Engine:
                </span>
                
                {/* Slab Dropdown */}
                <select
                  value={gstSlab}
                  onChange={(e) => setGstSlab(Number(e.target.value))}
                  style={{
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #38bdf8',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  <option value={12}>12% Standard (Rooms ≤ ₹7,500)</option>
                  <option value={18}>18% Luxury (Rooms &gt; ₹7,500)</option>
                  <option value={5}>5% F&amp;B / Restaurant</option>
                  <option value={0}>0% Non-GST / Exempt</option>
                </select>

                {/* Intrastate vs Interstate Switch */}
                <div style={{ display: 'inline-flex', background: '#020617', padding: '2px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button
                    type="button"
                    onClick={() => setTaxType('intra')}
                    style={{
                      background: taxType === 'intra' ? '#0284c7' : 'transparent',
                      color: taxType === 'intra' ? '#fff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Intrastate (CGST 6% + SGST 6%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxType('inter')}
                    style={{
                      background: taxType === 'inter' ? '#0284c7' : 'transparent',
                      color: taxType === 'inter' ? '#fff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Interstate (IGST 12%)
                  </button>
                </div>

                {/* RCM Toggle */}
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isRcm}
                    onChange={(e) => setIsRcm(e.target.checked)}
                  />
                  RCM (Reverse Charge)
                </label>

                {/* Live Discount Input */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#facc15' }}>
                  <span>Discount ₹:</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                    style={{ width: '60px', background: '#020617', color: '#facc15', border: '1px solid #eab308', borderRadius: '4px', padding: '2px 4px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right' }}
                  />
                </div>
              </div>

              {/* Quick Add Line Item Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Add:</span>
                <button
                  type="button"
                  onClick={() => handleAddLineItem('extra-bed')}
                  style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', color: 'var(--gold-glow)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                >
                  + Extra Bed (₹400)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLineItem('station-transfer')}
                  style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                >
                  + Station Cab (₹350)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLineItem('late-checkout')}
                  style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#fb7185', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                >
                  + Late Checkout (₹500)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLineItem('dining')}
                  style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', color: '#34d399', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                >
                  + Satvik Dining (₹350)
                </button>
              </div>
            </div>
          )}

          {/* Row 4: Document Switcher Tabs Rail (Horizontal Scroll with Flex Shrink 0) */}
          <div className="invoice-tabs-scroll-rail">
            {/* Sheet 1: GST vs Non-GST Billing Series Selector */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(0,0,0,0.6)',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.18)',
              marginRight: '6px',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setIsNonGstBill(false)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: !isNonGstBill ? 800 : 600,
                  cursor: 'pointer',
                  background: !isNonGstBill ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.35) 0%, rgba(212, 175, 55, 0.15) 100%)' : 'transparent',
                  color: !isNonGstBill ? '#ffffff' : '#cbd5e1',
                  border: !isNonGstBill ? '1px solid #f3c64c' : '1px solid transparent',
                  boxShadow: !isNonGstBill ? '0 0 10px rgba(243, 198, 76, 0.3)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                🏛️ GST Bill (FMBIL)
              </button>
              <button
                type="button"
                onClick={() => setIsNonGstBill(true)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: isNonGstBill ? 800 : 600,
                  cursor: 'pointer',
                  background: isNonGstBill ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.35) 0%, rgba(56, 189, 248, 0.15) 100%)' : 'transparent',
                  color: isNonGstBill ? '#ffffff' : '#cbd5e1',
                  border: isNonGstBill ? '1px solid #38bdf8' : '1px solid transparent',
                  boxShadow: isNonGstBill ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                📜 Non-GST Bill (NGST)
              </button>
            </div>

            {[
              { id: 'a4', label: 'Consolidated Tax Invoice' },
              { id: 'room-split', label: 'Room Bill #01499 (Page 3)' },
              { id: 'food-split', label: 'Cannon Kitchen Food Bill #01500 (Page 2)' },
              { id: 'grc', label: 'Official GRC Form (Page 1)' },
              { id: 'money-receipt', label: 'Money Receipt Voucher (Page 5)' },
              { id: 'pos', label: '80mm Slip' },
              { id: 'keycard', label: '3D Smart Keycard', isKeycard: true }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInvoiceType(tab.id)}
                className={`doc-switcher-tab ${invoiceType === tab.id ? 'active' : ''}`}
              >
                {tab.isKeycard && <Key size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW 0: 3D HOLOGRAPHIC DIGITAL SMART KEYCARD (Uiverse.io / 21st.dev) */}
        {invoiceType === 'keycard' && (
          <div style={{
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(6, 14, 26, 0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--gold-glow)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.4rem'
              }}>
                <Sparkles size={14} /> Interactive 3D Digital RFID Card
              </div>
              <h3 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }} className="font-serif">
                Guest Room Access Key
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Move your cursor to experience the dynamic holographic glare and realistic perspective tilt.
              </p>
            </div>

            <DigitalKeycard 
              guestName={booking.guestName || "Distinguished Guest"}
              roomNumber={booking.roomNumber || "301"}
              tierName={booking.tier || "Executive Room"}
              checkInDate={booking.checkInDate || "2026-09-22"}
              checkOutDate={booking.checkOutDate || "2026-09-24"}
              bookingId={booking.bookingId || "HSI-202609-001"}
            />

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <div>✓ Instant 24-Hr Check-In Token</div>
              <div>✓ Active Wi-Fi SSID: <code>HotelSai_Executive</code></div>
              <div>✓ In-Room Dining Extension: <code>Dial 9</code></div>
            </div>
          </div>
        )}

        {invoiceType !== 'keycard' && (
          <div className="invoice-sheet-scroll-wrapper">
            <div className="mobile-swipe-guide no-print">
              <span>↔ Swipe horizontally to view full legal A4 columns &amp; totals</span>
            </div>

            {/* VIEW 1: CONSOLIDATED A4 TAX INVOICE */}
            {invoiceType === 'a4' && (
          <div className={`tax-invoice-sheet ${!includeLetterhead ? 'preprinted-pad-mode' : ''}`}>
            <div className="sheet-header">
              <div className="header-left">
                <span className="page-mark" style={{ fontWeight: 800, letterSpacing: '0.5px' }}>
                  {isNonGstBill ? `${rule48Copy} / NON-GST BILL` : `${rule48Copy} / RULE 48`}
                </span>
                <h1 className="tax-invoice-title" style={{ letterSpacing: '1px' }}>
                  {isNonGstBill ? 'NON-GST BILL / BILL OF SUPPLY' : 'TAX INVOICE / GUEST FOLIO'}
                </h1>
                <div className="copy-type">
                  {isNonGstBill 
                    ? 'Section 31(3)(c) of CGST / OGST Rules (Non-Taxable & Exempt Supplies)' 
                    : 'Rule 46 of CGST / OGST Rules, 2017'}
                </div>
              </div>
              <div className="header-right">
                <div className="hotel-brand-block">
                  <div className="hotel-trade-name" style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                    {(HOTEL_CONFIG.legalName || HOTEL_CONFIG.name || 'SRI SAI VASUDEV RESIDENCY').toUpperCase()}
                  </div>
                  <div className="address-line">{HOTEL_CONFIG.address}</div>
                  <div className="contact-line">
                    GSTIN: <span className="text-bold-gstin">{HOTEL_CONFIG.gstin}</span> | State Code: {HOTEL_CONFIG.stateCode} ({HOTEL_CONFIG.state || HOTEL_CONFIG.stateName || 'Odisha'})
                  </div>
                  <div className="contact-line">
                    Ph: {(HOTEL_CONFIG.phones || [HOTEL_CONFIG.phone, HOTEL_CONFIG.altPhone].filter(Boolean)).join(', ')} | Tel: {HOTEL_CONFIG.landline}
                  </div>
                  <div className="contact-line" style={{ fontSize: '9px', color: '#64748b' }}>
                    Web: {HOTEL_CONFIG.website} | Email: {HOTEL_CONFIG.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="particulars-grid">
              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Bill / Invoice No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <input 
                        type="text" 
                        value={editHeader.billNo} 
                        onChange={(e) => setEditHeader(prev => ({ ...prev, billNo: e.target.value }))}
                        style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '10px', fontWeight: 'bold', width: '150px' }}
                      />
                    ) : (
                      <strong style={{ color: '#0f172a' }}>{billNo}</strong>
                    )}
                  </span>
                </div>
                <div className="field-row">
                  <span className="field-label">Bill Date &amp; Time</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {new Date().toLocaleDateString('en-IN')} 14:15:47
                  </span>
                </div>
                <div className="field-row">
                  <span className="field-label">GRC Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <input 
                        type="text" 
                        value={editHeader.grcNo} 
                        onChange={(e) => setEditHeader(prev => ({ ...prev, grcNo: e.target.value }))}
                        style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '10px', width: '90px' }}
                      />
                    ) : (
                      <strong>G.Regn.No. {editHeader.grcNo}</strong>
                    )}
                  </span>
                </div>
                <div className="field-row">
                  <span className="field-label">Room Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <input 
                          type="text" 
                          value={editHeader.roomNumber} 
                          onChange={(e) => setEditHeader(prev => ({ ...prev, roomNumber: e.target.value }))}
                          style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '10px', fontWeight: 'bold', width: '50px' }}
                        />
                        <input 
                          type="text" 
                          value={editHeader.tier} 
                          onChange={(e) => setEditHeader(prev => ({ ...prev, tier: e.target.value }))}
                          style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '10px', width: '90px' }}
                        />
                      </div>
                    ) : (
                      <strong>Room {editHeader.roomNumber} ({editHeader.tier})</strong>
                    )}
                  </span>
                </div>
                <div className="field-row">
                  <span className="field-label">Meal Plan</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <select
                        value={editHeader.planCode}
                        onChange={(e) => setEditHeader(prev => ({ ...prev, planCode: e.target.value }))}
                        style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '10px', fontWeight: 'bold' }}
                      >
                        <option value="EP">EP (European Plan - Room Only)</option>
                        <option value="CP">CP (Continental Plan - Satvik Breakfast)</option>
                        <option value="MAP">MAP (Modified American - Breakfast + Dinner)</option>
                        <option value="AP">AP (American Plan - All Meals)</option>
                      </select>
                    ) : (
                      <strong>{editHeader.planCode} (Continental Plan)</strong>
                    )}
                  </span>
                </div>
              </div>

              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Guest / Billed To</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <input 
                        type="text" 
                        value={editHeader.guestName} 
                        onChange={(e) => setEditHeader(prev => ({ ...prev, guestName: e.target.value }))}
                        style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '10px', fontWeight: 'bold', width: '180px', textTransform: 'uppercase' }}
                      />
                    ) : (
                      <strong style={{ textTransform: 'uppercase' }}>{editHeader.guestName}</strong>
                    )}
                  </span>
                </div>
                <div className="field-row">
                  <span className="field-label">Contact Mobile</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <input 
                        type="text" 
                        value={editHeader.guestPhone} 
                        onChange={(e) => setEditHeader(prev => ({ ...prev, guestPhone: e.target.value }))}
                        style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '10px', width: '130px' }}
                      />
                    ) : (
                      <span>{editHeader.guestPhone}</span>
                    )}
                  </span>
                </div>
                <div className="field-row">
                  <span className="field-label">Company / Account</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <input 
                        type="text" 
                        value={editHeader.company} 
                        onChange={(e) => setEditHeader(prev => ({ ...prev, company: e.target.value }))}
                        style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '10px', width: '180px' }}
                      />
                    ) : (
                      <span>{editHeader.company}</span>
                    )}
                  </span>
                </div>
                <div className="field-row">
                  <span className="field-label">Corporate GSTIN</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <input 
                        type="text" 
                        value={editHeader.corporateGstin} 
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setEditHeader(prev => ({ ...prev, corporateGstin: val }));
                          if (val.length >= 2) {
                            const statePrefix = val.slice(0, 2);
                            if (statePrefix !== '21') {
                              setTaxType('inter');
                            } else {
                              setTaxType('intra');
                            }
                          }
                        }}
                        placeholder="e.g. 21AAACB2528H1ZA"
                        style={{ border: '1px dashed #38bdf8', padding: '1px 4px', fontSize: '10px', fontWeight: 'bold', width: '160px', fontFamily: 'monospace' }}
                      />
                    ) : (
                      <span className="text-bold-gstin">{editHeader.corporateGstin}</span>
                    )}
                  </span>
                </div>
                <div className="field-row">
                  <span className="field-label">Check-In / Out</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">
                    {isLiveEditMode ? (
                      <div style={{ display: 'inline-flex', gap: '3px' }}>
                        <input 
                          type="text" 
                          value={editHeader.checkInDate} 
                          onChange={(e) => setEditHeader(prev => ({ ...prev, checkInDate: e.target.value }))}
                          style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '9px', width: '100px' }}
                        />
                        <span>to</span>
                        <input 
                          type="text" 
                          value={editHeader.checkOutDate} 
                          onChange={(e) => setEditHeader(prev => ({ ...prev, checkOutDate: e.target.value }))}
                          style={{ border: '1px dashed #cbd5e1', padding: '1px 4px', fontSize: '9px', width: '100px' }}
                        />
                      </div>
                    ) : (
                      <span>{editHeader.checkInDate} to {editHeader.checkOutDate}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Sheet 1: Explicit Taxable vs Non-Taxable Columns & Dynamic Line Item Editor */}
            {/* SheetsToolbarLegend: screen-only, never prints on the statutory invoice */}
            <div className="no-print" style={{ margin: '0.4rem 0 0.2rem 0' }}>
              <SheetsToolbarLegend
                tableName="Consolidated Tax Invoice — Line Items"
                subtitle="Rule 46 of CGST/OGST Rules, 2017 · Editable line items only"
              />
            </div>
            <table className="ledger-table sheets-grid-table">
              <thead>
                <tr>
                  <SheetsColumnHeader title="#" badge="locked" align="center" width="30px" />
                  <SheetsColumnHeader title="Date & Service Particulars" badge="editable" />
                  <SheetsColumnHeader title="SAC" badge="editable" align="center" width="65px" />
                  <SheetsColumnHeader title="Qty" badge="editable" align="center" width="50px" />
                  <SheetsColumnHeader title="Rate (₹)" badge="editable" align="right" className="th-amount" width="85px" />
                  <SheetsColumnHeader title="Taxable Val (₹)" badge="formula" align="right" className="th-amount" width="95px" />
                  <SheetsColumnHeader title="Non-Taxable (₹)" badge="editable" align="right" className="th-amount" width="105px" />
                  <SheetsColumnHeader title="Line Total (₹)" badge="formula" align="right" className="th-amount" width="95px" />
                  <SheetsColumnHeader title="Act" badge="locked" align="center" width="30px" className="no-print" />
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const lineTotal = Number(item.qty || 1) * Number(item.rate || 0);
                  const isItemTaxable = !isNonGstBill && !item.isExempt;
                  return (
                    <tr key={item.id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <SheetsEditableCell
                          tag="div"
                          value={item.desc}
                          onSave={(val) => handleUpdateLineItem(item.id, 'desc', val)}
                          disabled={!isLiveEditMode}
                          style={{ width: '100%', fontSize: '10.5px', fontWeight: 'bold' }}
                        />
                        {(item.subDesc || isLiveEditMode) && (
                          <SheetsEditableCell
                            tag="div"
                            value={item.subDesc || ''}
                            onSave={(val) => handleUpdateLineItem(item.id, 'subDesc', val)}
                            disabled={!isLiveEditMode}
                            placeholder="Sub notes / stay details"
                            style={{ width: '100%', fontSize: '9px', color: '#64748b', marginTop: '2px' }}
                          />
                        )}
                      </td>
                      <SheetsEditableCell
                        value={item.sac}
                        onSave={(val) => handleUpdateLineItem(item.id, 'sac', val)}
                        disabled={!isLiveEditMode}
                        align="center"
                        style={{ fontSize: '10px' }}
                      />
                      <SheetsEditableCell
                        type="number"
                        value={item.qty}
                        onSave={(val) => handleUpdateLineItem(item.id, 'qty', val)}
                        disabled={!isLiveEditMode}
                        align="center"
                        style={{ fontSize: '10px' }}
                      />
                      <SheetsEditableCell
                        type="currency"
                        value={item.rate}
                        onSave={(val) => handleUpdateLineItem(item.id, 'rate', val)}
                        disabled={!isLiveEditMode}
                        align="right"
                        style={{ fontSize: '10px' }}
                      />
                      <td className="text-right">
                        {isItemTaxable ? `₹${lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                      </td>
                      <td className="text-right">
                        {!isItemTaxable ? `₹${lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                      </td>
                      <td className="text-right" style={{ fontWeight: 600 }}>
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      {(
                        <td style={{ textAlign: 'center' }} className="no-print">
                          <button
                            type="button"
                            onClick={() => handleDeleteLineItem(item.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                            title="Delete Line Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* In edit mode, provide quick add line item trigger */}
                {(
                  <tr className="no-print" style={{ background: '#f8fafc' }}>
                    <td colSpan="9" style={{ padding: '6px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>+ Add Line Item:</span>
                        <button
                          type="button"
                          onClick={() => handleAddLineItem('custom')}
                          style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', cursor: 'pointer' }}
                        >
                          + Custom Service
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddLineItem('extra-bed')}
                          style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', cursor: 'pointer' }}
                        >
                          + Extra Bed (₹400)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddLineItem('station-transfer')}
                          style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', cursor: 'pointer' }}
                        >
                          + Station Cab (₹350)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddLineItem('dining')}
                          style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', cursor: 'pointer' }}
                        >
                          + Satvik Dining (₹350)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddLineItem('laundry')}
                          style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', cursor: 'pointer' }}
                        >
                          + Laundry (₹150)
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Taxable Base (₹):</td>
                  <td className="text-right" style={{ fontWeight: 'bold' }}>
                    ₹{netTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {<td className="no-print"></td>}
                </tr>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Non-Taxable / Exempt Base (₹):</td>
                  <td className="text-right" style={{ fontWeight: 'bold', color: isNonGstBill ? '#0284c7' : '#64748b' }}>
                    ₹{exemptBase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {<td className="no-print"></td>}
                </tr>

                {discountAmount > 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'right', color: '#b45309' }}>
                      Approved Discount / Tariff Concession ({discountReason}):
                    </td>
                    <td className="text-right" style={{ color: '#b45309', fontWeight: 600 }}>
                      -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    {<td className="no-print"></td>}
                  </tr>
                )}

                {!isNonGstBill && taxType === 'intra' && (
                  <>
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'right' }}>
                        Central GST (CGST @ {cgstRate}%):
                      </td>
                      <td className="text-right">₹{cgstAmount.toFixed(2)}</td>
                      {<td className="no-print"></td>}
                    </tr>
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'right' }}>
                        Odisha State GST (SGST @ {sgstRate}%):
                      </td>
                      <td className="text-right">₹{sgstAmount.toFixed(2)}</td>
                      {<td className="no-print"></td>}
                    </tr>
                  </>
                )}

                {!isNonGstBill && taxType === 'inter' && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'right' }}>
                      Integrated GST (IGST @ {igstRate}% - Interstate Supply):
                    </td>
                    <td className="text-right">₹{igstAmount.toFixed(2)}</td>
                    {<td className="no-print"></td>}
                  </tr>
                )}

                {isNonGstBill && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'right', color: '#64748b', fontStyle: 'italic', fontSize: '9.5px' }}>
                      GST Exemption: Exempt / Non-GST Supply under Section 11 of CGST Act
                    </td>
                    <td className="text-right" style={{ color: '#64748b' }}>₹0.00 (Exempt)</td>
                    {<td className="no-print"></td>}
                  </tr>
                )}

                {effectiveRoundOff !== 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'right', fontSize: '9.5px', color: '#64748b' }}>
                      Rounding Adjustment (Rule 26/GST):
                    </td>
                    <td className="text-right" style={{ fontSize: '9.5px', color: '#64748b' }}>
                      {effectiveRoundOff >= 0 ? '+' : ''}₹{effectiveRoundOff.toFixed(2)}
                    </td>
                    {<td className="no-print"></td>}
                  </tr>
                )}

                <tr className="tfoot-round">
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 900, fontSize: '12px' }}>
                    {isNonGstBill ? 'NON-GST BILL TOTAL (INR):' : 'CONSOLIDATED TOTAL (INR):'}
                  </td>
                  <td className="text-right text-net-amount">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {<td className="no-print"></td>}
                </tr>
              </tfoot>
            </table>

            <div className="in-words-row">
              <span className="in-words-label">Amount in Words:</span>
              <span className="in-words-value">
                {convertNumberToIndianWords(grandTotal)}
              </span>
            </div>

            {/* Audited Multi-Tender Settlement & Folio Reversals Transparency (Zero Leakage Protocol) */}
            {(() => {
              const tenders = booking.tenders || {
                cash: booking.paymentMode === 'Cash' ? (booking.totalAmount || 13538) : (booking.advanceDeposit && booking.paymentMode?.includes('Cash') ? booking.advanceDeposit : 500),
                upi: booking.paymentMode?.includes('UPI') ? (booking.advanceDeposit || 1000) : 1000,
                card: booking.paymentMode?.includes('Card') ? (booking.totalAmount || 13538) : 0,
                btc: booking.isB2b ? (booking.balanceDue || Math.max(0, (booking.totalAmount || 13538) - 1500)) : (booking.billingType === 'BTC' ? booking.totalAmount : 0),
                btcCompany: booking.company || 'Linde India Ltd'
              };

              const reversalsList = booking.reversals || [
                { memoId: 'REV-103', desc: 'Cannon Kitchen Restaurant KOT #18346 duplicate punch credit memo', sac: '996331', amount: 294.00, operator: 'S. Patnaik (Auditor)' }
              ];

              const upiLabel = tenders.upiProvider ? `${tenders.upiProvider} (UPI)` : 'UPI';
              const tenderSummaryText = [
                tenders.cash > 0 && `Cash ₹${tenders.cash.toLocaleString('en-IN')}`,
                tenders.upi > 0 && `${upiLabel} ₹${tenders.upi.toLocaleString('en-IN')}${tenders.upiRef ? ` [${tenders.upiRef}]` : ''}`,
                tenders.card > 0 && `Card ₹${tenders.card.toLocaleString('en-IN')}`,
                tenders.btc > 0 && `Billed to ${tenders.btcCompany} ₹${tenders.btc.toLocaleString('en-IN')}`
              ].filter(Boolean).join(' + ');

              return (
                <div style={{
                  margin: '12px 0',
                  border: '1px solid #0f172a',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  fontSize: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px' }}>
                    <strong style={{ textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.5px' }}>
                      Audited Settlement &amp; Multi-Tender Split Breakdown
                    </strong>
                    <span style={{ color: (booking.balanceDue && Number(booking.balanceDue) > 0) ? '#d97706' : '#059669', fontWeight: 'bold' }}>
                      {(booking.balanceDue && Number(booking.balanceDue) > 0)
                        ? `⚠️ ADVANCE: ₹${Number(booking.advanceDeposit || 0).toLocaleString('en-IN')} PAID • ₹${Number(booking.balanceDue).toLocaleString('en-IN')} DUE AT CHECK-IN`
                        : '✓ STATUS: FULLY SETTLED / NIL BALANCE'}
                    </span>
                  </div>

                  {/* Multi-Tender Summary Pill */}
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '3px', marginBottom: '8px', fontSize: '9.5px', color: '#065f46' }}>
                    <strong>Multi-Tender Breakdown: </strong>
                    <span>Paid: {tenderSummaryText || `Direct Settlement (${booking.paymentMode || 'Paid'})`}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div style={{ background: '#fff', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Cash Tender</span>
                      {isLiveEditMode ? (
                        <input
                          type="number"
                          value={tenders.cash}
                          onChange={(e) => setTenders(prev => ({ ...prev, cash: Number(e.target.value) || 0 }))}
                          style={{ width: '100%', border: '1px dashed #94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                        />
                      ) : (
                        <strong style={{ color: '#0f172a', fontSize: '11px' }}>₹{Number(tenders.cash || 0).toLocaleString('en-IN')}</strong>
                      )}
                      <span style={{ display: 'block', fontSize: '8px', color: '#94a3b8' }}>Front Desk Drawer</span>
                    </div>
                    <div style={{ background: '#fff', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>{tenders.upiProvider || 'UPI'} (Merchant QR)</span>
                      {isLiveEditMode ? (
                        <input
                          type="number"
                          value={tenders.upi}
                          onChange={(e) => setTenders(prev => ({ ...prev, upi: Number(e.target.value) || 0 }))}
                          style={{ width: '100%', border: '1px dashed #94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                        />
                      ) : (
                        <strong style={{ color: '#0f172a', fontSize: '11px' }}>₹{Number(tenders.upi || 0).toLocaleString('en-IN')}</strong>
                      )}
                      {tenders.upiRef && <span style={{ display: 'block', fontSize: '8px', color: '#0284c7', fontFamily: 'monospace' }}>{tenders.upiRef}</span>}
                    </div>
                    <div style={{ background: '#fff', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Card / POS Swipe</span>
                      {isLiveEditMode ? (
                        <input
                          type="number"
                          value={tenders.card}
                          onChange={(e) => setTenders(prev => ({ ...prev, card: Number(e.target.value) || 0 }))}
                          style={{ width: '100%', border: '1px dashed #94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                        />
                      ) : (
                        <strong style={{ color: '#0f172a', fontSize: '11px' }}>₹{Number(tenders.card || 0).toLocaleString('en-IN')}</strong>
                      )}
                      {tenders.cardAuth && <span style={{ display: 'block', fontSize: '8px', color: '#9333ea', fontFamily: 'monospace' }}>{tenders.cardAuth}</span>}
                    </div>
                    <div style={{ background: '#fff', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Corporate BTC ({tenders.btcCompany})</span>
                      {isLiveEditMode ? (
                        <input
                          type="number"
                          value={tenders.btc}
                          onChange={(e) => setTenders(prev => ({ ...prev, btc: Number(e.target.value) || 0 }))}
                          style={{ width: '100%', border: '1px dashed #94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                        />
                      ) : (
                        <strong style={{ color: '#0f172a', fontSize: '11px' }}>₹{Number(tenders.btc || 0).toLocaleString('en-IN')}</strong>
                      )}
                    </div>
                  </div>

                  {/* Audited Credit Memos / Reversals Transparency Note */}
                  {reversalsList.length > 0 && (
                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '9px' }}>
                          ↩️ Section 34 CGST Act Balancing Credit Memos / Reversals:
                        </span>
                        <span style={{ color: '#64748b', fontSize: '9px' }}>
                          Audited by: {reversalsList[0].operator}
                        </span>
                      </div>
                      {reversalsList.map((rev, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff1f2', padding: '3px 6px', borderRadius: '3px', marginBottom: '2px', fontSize: '8.5px', color: '#9f1239' }}>
                          <span>[{rev.memoId}] {rev.desc} (SAC {rev.sac})</span>
                          <strong style={{ color: '#dc2626' }}>-₹{rev.amount.toFixed(2)} Credit Memo</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '9px' }}>
                    <span>Folio Cashier / Duty Manager: <strong>Sudhakar Reddy (Shift A)</strong></span>
                    <span>Net Reconciled Drawer Remittance: <strong>₹{(booking.totalAmount || 13537.84).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                  </div>
                </div>
              );
            })()}

            <div className="sheet-footer-strip">
              Sri Sai Vasudev Residency • Near Andhra Bank, New Colony, Rayagada - 765001 • GSTIN: 21AEKPP8689J1ZS • Thank You For Staying!
            </div>
          </div>
        )}

        {/* VIEW 2: ROOM TARIFF INVOICE (Page 3 of hotel_documents.pdf - Bill #01499) */}
        {invoiceType === 'room-split' && (
          <div className={`tax-invoice-sheet ${!includeLetterhead ? 'preprinted-pad-mode' : ''}`}>
            <div className="sheet-header">
              <div className="header-left">
                <span className="page-mark" style={{ background: '#0284c7', fontWeight: 800 }}>
                  {rule48Copy} • SAC 996311 LODGING
                </span>
                <h1 className="tax-invoice-title" style={{ letterSpacing: '1px' }}>ROOM TARIFF TAX INVOICE</h1>
                <div className="copy-type">SAC 996311 (Hotel Accommodation Services)</div>
              </div>
              <div className="header-right">
                <div className="hotel-brand-block">
                  <div className="hotel-trade-name" style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                    {(HOTEL_CONFIG.legalName || HOTEL_CONFIG.name || 'SRI SAI VASUDEV RESIDENCY').toUpperCase()}
                  </div>
                  <div className="address-line">{HOTEL_CONFIG.address}</div>
                  <div className="contact-line">
                    GSTIN: <span className="text-bold-gstin">{HOTEL_CONFIG.gstin}</span> | State: 21 (Odisha)
                  </div>
                </div>
              </div>
            </div>

            <div className="particulars-grid">
              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Bill No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>FMBIL2627-01499</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Bill Date</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">21-Sep-2026 14:15:47</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Room Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>Room 402</strong> (Executive Room)</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Plan Code</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>CP</strong></span>
                </div>
              </div>

              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Guest Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>MR. P ASHOK</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Company Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>LINDE INDIA LTD</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">GSTIN No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value text-bold-gstin">21AAACB2528H1ZA</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Check In / Out</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">17-Sep-2026 to 21-Sep-2026 (4 Nights)</span>
                </div>
              </div>
            </div>

            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Date</th>
                  <th>Description</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>SAC</th>
                  <th className="th-amount" style={{ width: '110px' }}>Tax Amount (₹)</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>GST %</th>
                  <th className="th-amount" style={{ width: '100px' }}>GST Amount</th>
                  <th className="th-amount" style={{ width: '110px' }}>Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '17-Sep-2026', desc: 'Tariff', taxVal: 2999.00, gstPct: 5, gstVal: 149.96, tot: 3148.96 },
                  { date: '18-Sep-2026', desc: 'Tariff', taxVal: 2999.00, gstPct: 5, gstVal: 149.96, tot: 3148.96 },
                  { date: '19-Sep-2026', desc: 'Tariff', taxVal: 2999.00, gstPct: 5, gstVal: 149.96, tot: 3148.96 },
                  { date: '20-Sep-2026', desc: 'Tariff', taxVal: 2999.00, gstPct: 5, gstVal: 149.96, tot: 3148.96 }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td><strong>{row.desc}</strong></td>
                    <td style={{ textAlign: 'center' }}>996311</td>
                    <td className="text-right">₹{row.taxVal.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{row.gstPct}%</td>
                    <td className="text-right">₹{row.gstVal.toFixed(2)}</td>
                    <td className="text-right">₹{row.tot.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Day Total (Taxable Value):</td>
                  <td className="text-right" style={{ fontWeight: 'bold' }}>₹{roomTariffBase.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>SGST 2.5%:</td>
                  <td className="text-right">₹{roomSgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>CGST 2.5%:</td>
                  <td className="text-right">₹{roomCgst.toFixed(2)}</td>
                </tr>
                <tr className="tfoot-round">
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 900, fontSize: '12px' }}>NET PAYABLE (INR):</td>
                  <td className="text-right text-net-amount">₹{roomTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="in-words-row">
              <span className="in-words-label">Amount in Words:</span>
              <span className="in-words-value">
                INR Twelve thousand five hundred ninety-six only
              </span>
            </div>

            <div style={{ marginTop: '15px', fontSize: '9px', color: '#64748b', textAlign: 'center' }}>
              I agree that I am personally liable for the full payment of the bill in the event it is not paid by the company or person indicated. All disputes subject to Odisha jurisdiction.
            </div>
          </div>
        )}

        {/* VIEW 3: CANNON KITCHEN RESTAURANT FOOD INVOICE (Page 2 of hotel_documents.pdf - Bill #01500) */}
        {invoiceType === 'food-split' && (
          <div className={`tax-invoice-sheet ${!includeLetterhead ? 'preprinted-pad-mode' : ''}`}>
            <div className="sheet-header">
              <div className="header-left">
                <span className="page-mark" style={{ background: '#059669' }}>F&amp;B DINING MEAL REIMBURSEMENT COPY</span>
                <h1 className="tax-invoice-title" style={{ letterSpacing: '1px' }}>CANNON KITCHEN RESTAURANT INVOICE</h1>
                <div className="copy-type">SAC 996331 (Restaurant &amp; In-Room Dining Services)</div>
              </div>
              <div className="header-right">
                <div className="hotel-brand-block">
                  <div className="hotel-trade-name" style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                    {(HOTEL_CONFIG.legalName || HOTEL_CONFIG.name || 'SRI SAI VASUDEV RESIDENCY').toUpperCase()}
                  </div>
                  <div className="address-line">CANNON KITCHEN RESTAURANT • Rayagada, Odisha - 765001</div>
                  <div className="contact-line">
                    GSTIN: <span className="text-bold-gstin">{HOTEL_CONFIG.gstin}</span> | State: 21 (Odisha)
                  </div>
                </div>
              </div>
            </div>

            <div className="particulars-grid">
              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Bill No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>FMBIL2627-01500</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Bill Date</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">21-Sep-2026 14:15:47</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Room Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>Room 402</strong></span>
                </div>
              </div>

              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Guest Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>MR. P ASHOK</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Company Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>LINDE INDIA LTD</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Corporate GSTIN</span>
                  <span className="field-colon">:</span>
                  <span className="field-value text-bold-gstin">21AAACB2528H1ZA</span>
                </div>
              </div>
            </div>

            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Date</th>
                  <th>Description</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>SAC</th>
                  <th className="th-amount" style={{ width: '110px' }}>Tax Amount (₹)</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>GST %</th>
                  <th className="th-amount" style={{ width: '100px' }}>GST Amount</th>
                  <th className="th-amount" style={{ width: '110px' }}>Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '18-Sep-2026', desc: 'CANNON KITCHEN RESTAURANT', taxVal: 280.00, gstPct: 5, gstVal: 14.00, tot: 294.00 },
                  { date: '19-Sep-2026', desc: 'CANNON KITCHEN RESTAURANT', taxVal: 310.00, gstPct: 5, gstVal: 15.50, tot: 325.50 },
                  { date: '20-Sep-2026', desc: 'CANNON KITCHEN RESTAURANT', taxVal: 310.00, gstPct: 5, gstVal: 15.50, tot: 325.50 }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td><strong>{row.desc}</strong></td>
                    <td style={{ textAlign: 'center' }}>996331</td>
                    <td className="text-right">₹{row.taxVal.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{row.gstPct}%</td>
                    <td className="text-right">₹{row.gstVal.toFixed(2)}</td>
                    <td className="text-right">₹{row.tot.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Day Total (Taxable Dining):</td>
                  <td className="text-right" style={{ fontWeight: 'bold' }}>₹{foodBase.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>SGST 2.5%:</td>
                  <td className="text-right">₹{foodSgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>CGST 2.5%:</td>
                  <td className="text-right">₹{foodCgst.toFixed(2)}</td>
                </tr>
                <tr className="tfoot-round">
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 900, fontSize: '12px' }}>NET PAYABLE (INR):</td>
                  <td className="text-right text-net-amount" style={{ color: '#059669' }}>₹{foodTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="in-words-row">
              <span className="in-words-label">Amount in Words:</span>
              <span className="in-words-value">
                INR Nine hundred sixty-two only
              </span>
            </div>

            <div style={{ marginTop: '15px', fontSize: '9px', color: '#64748b', textAlign: 'center' }}>
              Cannon Kitchen Restaurant • Sri Sai Vasudev Residency • FSSAI Lic &amp; Satvik Hygiene Certified
            </div>
          </div>
        )}

        {/* VIEW 4: OFFICIAL GUEST REGISTRATION CARD (Page 1 of hotel_documents.pdf - G.Regn.No. 684) */}
        {invoiceType === 'grc' && (
          <div className={`tax-invoice-sheet ${!includeLetterhead ? 'preprinted-pad-mode' : ''}`} style={{ background: '#ffffff', color: '#0f172a', border: '2px solid #0f172a' }}>
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
                  {HOTEL_CONFIG.name.toUpperCase()}
                </h1>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  {HOTEL_CONFIG.address}
                </div>
                <div style={{ fontSize: '10px', color: '#334155' }}>
                  Ph: {HOTEL_CONFIG.phone} | Email: {HOTEL_CONFIG.email}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#dc2626' }}>
                  G.Regn.No. {booking.grcNo || editHeader.grcNo || `GRC-${booking.roomNumber}`}
                </div>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  Bill No: <strong>{billNo}</strong>
                </div>
              </div>
            </div>

            {/* GRC Form Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', borderBottom: '1px solid #0f172a', fontSize: '11px' }}>
              {/* Left Column: Guest Particulars */}
              <div style={{ padding: '10px', borderRight: '1px solid #0f172a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Name:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{booking.guestName || 'GUEST'}</span></div>
                <div><strong>Designation / Profession:</strong> {booking.designation || (booking.company ? 'Corporate Official' : 'Executive / Guest')}</div>
                <div><strong>Company / Organisation:</strong> {booking.company || 'Direct Guest (Individual Stay)'}</div>
                <div><strong>Address:</strong> {booking.address || booking.origin || 'Rayagada / Odisha Visitor'}</div>
                <div><strong>Phone No:</strong> {booking.guestPhone || '+91 94370 22555'}</div>
                <div><strong>No. of Persons:</strong> {booking.pax || 1} Person(s) | Adult Stay</div>
                <div><strong>Arrived from:</strong> {booking.origin || 'Odisha / Direct'}</div>
                <div><strong>Arrived Date &amp; Time:</strong> {booking.checkInDate || '22/09/2026'} &amp; Time: {booking.checkInTime || '11:00 AM'}</div>
                <div><strong>Departure Date:</strong> {booking.checkOutDate || '23/09/2026 (12:00 PM)'}</div>
                <div><strong>Purpose of visit:</strong> {booking.company ? '[ ✓ ] Company / Business  [ ] Tourism' : '[ ✓ ] Tourism / Personal  [ ] Business'}</div>
              </div>

              {/* Right Column: Office Use & Billing Instructions */}
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc' }}>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>
                  FOR OFFICE USE ONLY
                </div>
                <div><strong>ROOM NO.:</strong> <span style={{ color: '#0284c7', fontWeight: 800 }}>{booking.roomNumber}</span></div>
                <div><strong>ROOM TYPE:</strong> {booking.tier || 'Executive Room'}</div>
                <div><strong>ROOM RATE:</strong> ₹{Number(booking.tariff || booking.roomRate || booking.totalAmount || 2199).toLocaleString('en-IN')}.00 / night</div>
                <div><strong>BOOKED BY:</strong> {booking.company ? 'Corporate BTC Ledger' : 'Front Desk Direct Walk-In'}</div>
                <div><strong>BILLING INSTRUCTION:</strong> {booking.paymentMode || 'Cash / UPI Settlement'} ({booking.nights || 1} Night Stay)</div>
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  <strong>Receptionist's Signature:</strong> <em>Sudhakar Reddy (Front Desk Lead)</em>
                </div>
              </div>
            </div>

            {/* 24-Hour Policy Notice */}
            <div style={{ padding: '8px 10px', background: '#fffbeb', borderBottom: '1px solid #0f172a', fontSize: '10px', fontWeight: 600, color: '#92400e' }}>
              CHECK-IN and CHECK-OUT time is 24 hours and extension of stay must be re-confirmed with the duty manager.
            </div>

            {/* Guest Signature & Declaration */}
            <div style={{ padding: '12px 10px', fontSize: '10px', color: '#334155' }}>
              <p style={{ margin: '0 0 10px', lineHeight: 1.4 }}>
                I agree that I am personally liable for the full payment of the bill in the event it is not paid by the company of person indicated. May we request you to return the Room Key. All disputes subject to Odisha jurisdiction.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                <div>
                  <div style={{ borderBottom: '1px solid #0f172a', width: '200px', marginBottom: '4px' }}></div>
                  <strong>Guest's Signature</strong>
                </div>
                <div>
                  <div style={{ borderBottom: '1px solid #0f172a', width: '200px', marginBottom: '4px' }}></div>
                  <strong>Authorized Duty Manager</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4B: OFFICIAL CASH / UPI MONEY RECEIPT VOUCHER (Page 5 & Owner Video Demo) */}
        {invoiceType === 'money-receipt' && (
          <div className={`tax-invoice-sheet ${!includeLetterhead ? 'preprinted-pad-mode' : ''}`} style={{ 
            background: '#ffffff', 
            color: '#0f172a', 
            border: '2px solid #b91c1c', 
            padding: '24px 28px',
            maxWidth: '820px',
            margin: '0 auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #b91c1c', paddingBottom: '12px' }}>
              <div>
                <span style={{ 
                  background: '#b91c1c', 
                  color: '#fff', 
                  fontSize: '9px', 
                  fontWeight: 900, 
                  padding: '2px 6px', 
                  borderRadius: '3px',
                  letterSpacing: '0.05em' 
                }}>
                  OFFICIAL PAYMENT VOUCHER • GUEST ORIGINAL
                </span>
                <h1 style={{ margin: '6px 0 2px 0', fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
                  SRI SAI VASUDEV RESIDENCY
                </h1>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  Near Andhra Bank, New Colony, RAYAGADA - 765 001. Odisha
                </div>
                <div style={{ fontSize: '10px', color: '#475569' }}>
                  GSTIN: <strong>21AEKPP8689J1ZS</strong> | PAN: <strong>AEKPP8689J</strong> | State: 21 (Odisha)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#b91c1c' }}>
                  MONEY RECEIPT
                </div>
                <div style={{ fontSize: '11px', color: '#0f172a', marginTop: '2px' }}>
                  Receipt No: <strong>HSI/MR/26-27/{booking.roomNumber || '301'}</strong>
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong> ({new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 0', fontSize: '12px', lineHeight: 2.2 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px dotted #94a3b8' }}>
                <span style={{ minWidth: '180px', color: '#475569', fontWeight: 600 }}>Received with thanks from :</span>
                <strong style={{ fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', flex: 1 }}>
                  {booking.guestName || 'MR. P ASHOK'}
                </strong>
                <span style={{ color: '#64748b' }}>Room No: <strong>{booking.roomNumber || '301'}</strong> ({booking.tier || 'Executive AC'})</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px dotted #94a3b8' }}>
                <span style={{ minWidth: '180px', color: '#475569', fontWeight: 600 }}>Company Name / Account :</span>
                <span style={{ flex: 1, color: '#0f172a', fontWeight: 600 }}>
                  {booking.company || 'LINDE INDIA LTD (Direct Guest Settlement)'}
                </span>
                <span style={{ color: '#64748b' }}>Folio / Bill: <strong>{billNo}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px dotted #94a3b8' }}>
                <span style={{ minWidth: '180px', color: '#475569', fontWeight: 600 }}>The Sum of Rupees :</span>
                <strong style={{ color: '#059669', flex: 1, fontSize: '13px' }}>
                  INR Nine hundred sixty-two only (₹{foodTotal.toFixed(2)})
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px dotted #94a3b8' }}>
                <span style={{ minWidth: '180px', color: '#475569', fontWeight: 600 }}>By Tender / Mode of Payment :</span>
                <div style={{ flex: 1, display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                    ✓ PhonePe (UPI) • Ref: UPI-849102 / SBI Merchant QR
                  </span>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>
                    Status: <strong style={{ color: '#059669' }}>SETTLED &amp; CLEARED</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px dotted #94a3b8' }}>
                <span style={{ minWidth: '180px', color: '#475569', fontWeight: 600 }}>Towards Settlement Of :</span>
                <span style={{ flex: 1, color: '#0f172a' }}>
                  Cannon Kitchen Restaurant Dining &amp; Room Service Meals (SAC 996331)
                </span>
                <span style={{ color: '#b45309', fontWeight: 600, fontSize: '11px' }}>
                  * Room Tariff (₹{roomTotal.toFixed(2)}) transferred to Corporate BTC Credit
                </span>
              </div>
            </div>

            {/* Bottom Signatures and Stamp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', paddingTop: '10px' }}>
              <div style={{ 
                border: '1px dashed #cbd5e1', 
                padding: '10px 14px', 
                borderRadius: '6px', 
                background: '#f8fafc',
                fontSize: '10px',
                color: '#64748b',
                maxWidth: '300px'
              }}>
                <div>• Valid subject to realization of UPI/Bank transfer</div>
                <div>• Computer generated cash/tender voucher</div>
                <div>• All disputes subject to Rayagada, Odisha jurisdiction</div>
              </div>

              <div style={{ display: 'flex', gap: '40px', textAlign: 'center', fontSize: '11px' }}>
                <div>
                  <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'cursive', fontSize: '13px', color: '#334155' }}>{booking.guestName ? booking.guestName.split(' ')[0] : 'Guest'}</span>
                  </div>
                  <div style={{ borderBottom: '1px solid #0f172a', width: '130px', marginBottom: '4px' }}></div>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Guest Signature</span>
                </div>

                <div>
                  <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '12px' }}>K. Simhachalam</span>
                  </div>
                  <div style={{ borderBottom: '1px solid #0f172a', width: '150px', marginBottom: '4px' }}></div>
                  <span style={{ color: '#475569', fontWeight: 700 }}>Authorized Cashier / MD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: 80MM THERMAL SLIP */}
        {invoiceType === 'pos' && (
          <div className="printable-receipt thermal-receipt-sheet printable-pos-slip" style={{
            background: '#ffffff',
            color: '#060e1a',
            padding: '1.5rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            maxWidth: '380px',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #94a3b8', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <h2 style={{ color: '#0c182b', fontSize: '1.25rem', margin: 0, fontWeight: 900 }}>
                {(HOTEL_CONFIG.legalName || HOTEL_CONFIG.name || 'SRI SAI VASUDEV RESIDENCY').toUpperCase()}
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>
                {HOTEL_CONFIG.address}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.35rem' }}>
                GSTIN: {HOTEL_CONFIG.gstin} • SAC: 996311 / 996331
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', lineHeight: 1.5, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div><strong>BILL NO:</strong> {billNo}</div>
              <div><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN')}</div>
              <div><strong>GUEST:</strong> {booking.guestName}</div>
              <div><strong>COMPANY:</strong> {booking.company || 'LINDE INDIA LTD'}</div>
              <div><strong>ROOM:</strong> {booking.roomNumber} ({booking.tier})</div>
              <div><strong>CHECK-IN:</strong> 17-Sep-2026 (20:44)</div>
              <div><strong>CHECK-OUT:</strong> 21-Sep-2026 (14:15)</div>
            </div>

            <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', marginBottom: '0.85rem' }}>
              <tbody>
                <tr>
                  <td>Room Tariff (4 Nts)</td>
                  <td style={{ textAlign: 'right' }}>₹11,996.00</td>
                </tr>
                <tr>
                  <td>Cannon Kitchen Dining</td>
                  <td style={{ textAlign: 'right' }}>₹900.00</td>
                </tr>
                <tr>
                  <td>CGST (2.5%)</td>
                  <td style={{ textAlign: 'right' }}>₹320.92</td>
                </tr>
                <tr>
                  <td>SGST (2.5%)</td>
                  <td style={{ textAlign: 'right' }}>₹320.92</td>
                </tr>
                <tr style={{ borderTop: '2px dashed #0f172a', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  <td style={{ paddingTop: '0.4rem' }}>NET TOTAL</td>
                  <td style={{ textAlign: 'right', paddingTop: '0.4rem' }}>₹13,537.84</td>
                </tr>
                <tr style={{ fontSize: '0.72rem', color: '#475569' }}>
                  <td style={{ paddingTop: '0.3rem' }}>UPI (SBI Merchant QR):</td>
                  <td style={{ textAlign: 'right', paddingTop: '0.3rem' }}>₹5,000.00</td>
                </tr>
                <tr style={{ fontSize: '0.72rem', color: '#475569' }}>
                  <td>BTC (Linde India Ltd):</td>
                  <td style={{ textAlign: 'right' }}>₹8,537.84</td>
                </tr>
                <tr style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 'bold' }}>
                  <td>Balance Due:</td>
                  <td style={{ textAlign: 'right' }}>₹0.00 (PAID)</td>
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.65rem', color: '#64748b' }}>
              <div>* Sarai Act 1867 &amp; DPDP Act 2023 Verified *</div>
              <div>Thank you for staying at {HOTEL_CONFIG.name}!</div>
            </div>
          </div>
        )}
          </div>
        )}
        {/* UNIVERSAL INLINE KEYBOARD EDIT MODE FLOATING HUD BANNER */}
        <InlineEditorBanner
          isActive={true}
          onToggle={() => setIsLiveEditMode(false)}
          label="Folio & Receipt Keyboard Edit Mode"
          onReset={() => {
            if (window.confirm('Reset all receipt text edits back to default?')) {
              localStorage.removeItem('hsi_receipt_edits');
              window.location.reload();
            }
          }}
        />
      </div>
    </div>
  );
}
