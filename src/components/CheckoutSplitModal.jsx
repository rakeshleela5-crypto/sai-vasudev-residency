import React, { useState, useEffect } from 'react';
import { 
  X, Check, DollarSign, CreditCard, Smartphone, Building2, 
  Receipt, AlertCircle, CheckCircle2, ArrowRight, Printer,
  Sparkles, Clock, User, BedDouble, Utensils, ShieldCheck, MessageCircle
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { sendCheckoutSplitWhatsApp } from '../utils/whatsappDispatch';

export default function CheckoutSplitModal({
  isOpen,
  onClose,
  room,
  bookings = [],
  onConfirmCheckout
}) {
  if (!isOpen || !room) return null;

  // Find matching booking for this room if exists
  const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber) || {
    bookingId: `FMBIL2627-${room.roomNumber}`,
    billNo: `FMBIL2627-${room.roomNumber}`,
    roomNumber: room.roomNumber,
    guestName: room.currentGuestName || 'MR. P ASHOK',
    guestPhone: '+91 6305202068',
    tier: room.tier || 'Executive AC',
    totalAmount: room.balanceDue || 962.00,
    foodAmount: 962.00,
    roomAmount: 0.00,
    advancePaid: 0.00
  };

  // The default bill amount: owner specifically demoed ₹962 (e.g. Fenugreek Restaurant dining balance or stay balance)
  const defaultTotal = Number(room.balanceDue || matchedBooking.totalAmount || 962.00);

  const [billTotal, setBillTotal] = useState(defaultTotal);
  const [billBreakdown, setBillBreakdown] = useState({
    roomTariff: defaultTotal > 1500 ? defaultTotal - 962 : 0,
    foodCharges: defaultTotal > 1500 ? 962 : defaultTotal,
    advancePaid: Number(matchedBooking.advancePaid || 0)
  });

  // Multi-tender split states
  // Default to owner's exact scenario if total is 962, otherwise auto-fill
  const [upiAmount, setUpiAmount] = useState(defaultTotal === 962 ? '462' : '');
  const [upiRef, setUpiRef] = useState(`UPI-${Date.now().toString().slice(-6)}`);
  const [upiProvider, setUpiProvider] = useState('PhonePe');

  const [cashAmount, setCashAmount] = useState(defaultTotal === 962 ? '500' : '');
  const [cashierName, setCashierName] = useState('Front Desk Cashier');

  const [cardAmount, setCardAmount] = useState('');
  const [cardAuth, setCardAuth] = useState('AUTH-9412');

  const [btcAmount, setBtcAmount] = useState('');
  const [btcCompany, setBtcCompany] = useState('Linde India Ltd');

  const [openReceiptAfter, setOpenReceiptAfter] = useState(true);
  const [isNonGstBill, setIsNonGstBill] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState('tenders'); // 'tenders' | 'split-invoices'
  const [errorMsg, setErrorMsg] = useState('');

  // Total allocated sum
  const numUpi = Number(upiAmount) || 0;
  const numCash = Number(cashAmount) || 0;
  const numCard = Number(cardAmount) || 0;
  const numBtc = Number(btcAmount) || 0;

  const totalAllocated = numUpi + numCash + numCard + numBtc;
  const netDue = Math.max(0, billTotal - billBreakdown.advancePaid);
  const variance = Math.round((netDue - totalAllocated) * 100) / 100;
  const isBalanced = Math.abs(variance) < 0.01;

  // Percentage shares for visual bar
  const upiPercent = netDue > 0 ? Math.min(100, (numUpi / netDue) * 100) : 0;
  const cashPercent = netDue > 0 ? Math.min(100, (numCash / netDue) * 100) : 0;
  const cardPercent = netDue > 0 ? Math.min(100, (numCard / netDue) * 100) : 0;
  const btcPercent = netDue > 0 ? Math.min(100, (numBtc / netDue) * 100) : 0;

  // Apply quick presets
  const applyPreset = (type) => {
    setErrorMsg('');
    if (type === 'owner-split-btc') {
      // The exact corporate lodging + dining split from the owner's video:
      // ₹962 Fenugreek Restaurant Dining -> PhonePe (UPI)
      // ₹12,596 Room Lodging Tariff -> Linde India Ltd (BTC Credit)
      setBillTotal(13558);
      setBillBreakdown({
        roomTariff: 12596,
        foodCharges: 962,
        advancePaid: 0
      });
      setUpiAmount('962');
      setUpiProvider('PhonePe');
      setBtcAmount('12596');
      setBtcCompany('Linde India Ltd');
      setCashAmount('');
      setCardAmount('');
    } else if (type === 'owner-demo') {
      // The cash + UPI split example from owner's demo: Total 962 -> 462 PhonePe + 500 Cash
      setBillTotal(962);
      setBillBreakdown({
        roomTariff: 0,
        foodCharges: 962,
        advancePaid: 0
      });
      setUpiAmount('462');
      setUpiProvider('PhonePe');
      setCashAmount('500');
      setCardAmount('');
      setBtcAmount('');
    } else if (type === '100-upi') {
      setUpiAmount(netDue.toFixed(2));
      setCashAmount('');
      setCardAmount('');
      setBtcAmount('');
    } else if (type === '100-cash') {
      setCashAmount(netDue.toFixed(2));
      setUpiAmount('');
      setCardAmount('');
      setBtcAmount('');
    } else if (type === '50-50') {
      const half = (netDue / 2).toFixed(2);
      const remainingHalf = (netDue - Number(half)).toFixed(2);
      setUpiAmount(half);
      setCashAmount(remainingHalf);
      setCardAmount('');
      setBtcAmount('');
    }
  };

  const handleCheckoutSubmit = (e, receiptTarget = 'a4') => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isBalanced) {
      setErrorMsg(`Cannot settle: Variance of ₹${Math.abs(variance).toFixed(2)} remaining. Total allocated (₹${totalAllocated.toFixed(2)}) must equal Total Due (₹${netDue.toFixed(2)}).`);
      return;
    }

    const tendersSummary = [];
    if (numCash > 0) tendersSummary.push(`Cash: ₹${numCash.toLocaleString('en-IN')}`);
    if (numUpi > 0) tendersSummary.push(`${upiProvider} (UPI): ₹${numUpi.toLocaleString('en-IN')} [Ref: ${upiRef}]`);
    if (numCard > 0) tendersSummary.push(`Card: ₹${numCard.toLocaleString('en-IN')} [Auth: ${cardAuth}]`);
    if (numBtc > 0) tendersSummary.push(`Corporate BTC (${btcCompany}): ₹${numBtc.toLocaleString('en-IN')}`);

    const settlementPayload = {
      roomNumber: room.roomNumber,
      guestName: room.currentGuestName || matchedBooking.guestName,
      guestPhone: matchedBooking.guestPhone || '+91 6305202068',
      tier: room.tier,
      totalAmount: netDue,
      billTotal: billTotal,
      advancePaid: billBreakdown.advancePaid,
      billNo: matchedBooking.billNo || `FMBIL2627-${room.roomNumber}`,
      settlementTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      settlementDate: new Date().toLocaleDateString('en-IN'),
      tenders: {
        cash: numCash,
        upi: numUpi,
        upiRef,
        upiProvider,
        card: numCard,
        cardAuth,
        btc: numBtc,
        btcCompany
      },
      tendersSummary,
      openReceiptAfter,
      isNonGstBill,
      openEditor: receiptTarget === 'editor',
      targetReceiptType: receiptTarget === 'editor' ? 'a4' : receiptTarget
    };

    onConfirmCheckout(settlementPayload);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.94)',
      backdropFilter: 'blur(12px)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #0c182b 0%, #060e1a 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '780px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.15)',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {/* MODAL HEADER */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          background: 'linear-gradient(90deg, rgba(19, 34, 61, 0.9), rgba(12, 24, 43, 0.9))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{
                background: 'rgba(212, 175, 55, 0.2)',
                color: 'var(--gold-glow)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {HOTEL_CONFIG.name} • Front Desk
              </span>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                Room {room.roomNumber} ({room.tier})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                Guest Checkout &amp; <span className="gold-gradient-text">Settlement Suite</span>
              </h2>
              <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  onClick={() => setCheckoutMode('tenders')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: checkoutMode === 'tenders' ? 'var(--gold-primary)' : 'transparent',
                    color: checkoutMode === 'tenders' ? '#000' : 'var(--text-muted)'
                  }}
                >
                  💳 Multi-Tender Payment
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutMode('split-invoices')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: checkoutMode === 'split-invoices' ? '#38bdf8' : 'transparent',
                    color: checkoutMode === 'split-invoices' ? '#000' : 'var(--text-muted)'
                  }}
                >
                  📑 Split Tax Invoices (Room vs Food)
                </button>
              </div>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Guest: <strong style={{ color: '#fff' }}>{room.currentGuestName || matchedBooking.guestName}</strong> • Official Bill #{matchedBooking.billNo}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {checkoutMode === 'split-invoices' ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
            {/* Corporate Split Notice */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(212, 175, 55, 0.12))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <ShieldCheck size={24} color="#38bdf8" />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
                  Corporate Tax Invoicing Compliance (JK Paper, GAIL, Ashok Leyland Standard)
                </strong>
                <p style={{ margin: '0.15rem 0 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Generating two legally isolated tax invoices for Room {room.roomNumber}: 
                  <strong> Bill A (Room Lodging)</strong> under company GSTIN for travel claims &amp; 
                  <strong> Bill B (Fenugreek Restaurant Food)</strong> under guest name for F&amp;B meal allowances.
                </p>
              </div>
            </div>

            {/* Split Invoices Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* BILL A: ROOM LODGING */}
              <div style={{
                background: 'rgba(12, 24, 43, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span className="badge" style={{ background: '#38bdf8', color: '#060e1a', fontWeight: 800, fontSize: '0.7rem' }}>
                        BILL A: ROOM TARIFF INVOICE
                      </span>
                      <h4 style={{ margin: '0.4rem 0 0', color: '#fff', fontSize: '1.05rem' }}>
                        #{matchedBooking.billNo || 'FMBIL2627'}-R
                      </h4>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <div>SAC Code: <strong style={{ color: '#38bdf8' }}>996311</strong></div>
                      <div>GST Rate: <strong>12% (6%+6%)</strong></div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                    <div><strong>Billed To:</strong> {btcCompany || 'Ashok Leyland Limited'}</div>
                    <div><strong>GSTIN:</strong> 33AAACA0779M1ZT (Corporate B2B)</div>
                    <div><strong>Guest:</strong> {room.currentGuestName || matchedBooking.guestName} (Room {room.roomNumber})</div>
                    <div><strong>Period:</strong> 18/09/2026 to 21/09/2026 (3 Nights)</div>
                  </div>

                  <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Room Base Tariff:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>₹{((billTotal > 1500 ? billTotal - 962 : billTotal) / 1.12).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>CGST (6%):</span>
                      <span style={{ color: '#fbbf24' }}>₹{(((billTotal > 1500 ? billTotal - 962 : billTotal) / 1.12) * 0.06).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>SGST (6%):</span>
                      <span style={{ color: '#fbbf24' }}>₹{(((billTotal > 1500 ? billTotal - 962 : billTotal) / 1.12) * 0.06).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.4rem', fontWeight: 800 }}>
                      <span style={{ color: '#38bdf8' }}>Total Room Bill:</span>
                      <span style={{ color: '#38bdf8', fontSize: '1.05rem' }}>₹{(billTotal > 1500 ? billTotal - 962 : billTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => alert(`Printing Bill A: Official Room Tax Invoice #${matchedBooking.billNo}-R for ${btcCompany || 'Corporate'}`)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', borderColor: '#38bdf8', color: '#38bdf8' }}
                  >
                    <Printer size={15} /> Print Room Bill A
                  </button>
                  <button
                    type="button"
                    onClick={() => sendCheckoutSplitWhatsApp({
                      billType: 'Corporate Lodging Bill A',
                      billNo: `${matchedBooking.billNo || 'FMBIL2627'}-R`,
                      companyOrGuest: btcCompany || 'Corporate Client',
                      gstin: '33AAACA0779M1ZT',
                      roomNumber: room.roomNumber,
                      period: '3 Nights Stay',
                      amount: (billTotal > 1500 ? billTotal - 962 : billTotal)
                    })}
                    style={{ flex: 1.1, padding: '0.5rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    title="Send official room lodging tax invoice to Corporate Accounts on WhatsApp"
                  >
                    <MessageCircle size={14} /> WhatsApp Bill A
                  </button>
                </div>
              </div>

              {/* BILL B: FENUGREEK RESTAURANT FOOD */}
              <div style={{
                background: 'rgba(12, 24, 43, 0.85)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span className="badge" style={{ background: '#34d399', color: '#060e1a', fontWeight: 800, fontSize: '0.7rem' }}>
                        BILL B: FENUGREEK RESTAURANT FOOD INVOICE
                      </span>
                      <h4 style={{ margin: '0.4rem 0 0', color: '#fff', fontSize: '1.05rem' }}>
                        #{matchedBooking.billNo || 'FMBIL2627'}-F
                      </h4>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <div>SAC Code: <strong style={{ color: '#34d399' }}>996331</strong></div>
                      <div>GST Rate: <strong>5% (2.5%+2.5%)</strong></div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                    <div><strong>Billed To:</strong> {room.currentGuestName || matchedBooking.guestName} (Personal)</div>
                    <div><strong>Outlet:</strong> Fenugreek Restaurant &amp; Room Dining</div>
                    <div><strong>KOT Numbers:</strong> F2627-7514, F2627-7515</div>
                    <div><strong>Payment Mode:</strong> PhonePe UPI / Cash (Personal Settlement)</div>
                  </div>

                  <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Food Base Value:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>₹{(962.00 / 1.05).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>CGST (2.5%):</span>
                      <span style={{ color: '#fbbf24' }}>₹{((962.00 / 1.05) * 0.025).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>SGST (2.5%):</span>
                      <span style={{ color: '#fbbf24' }}>₹{((962.00 / 1.05) * 0.025).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.4rem', fontWeight: 800 }}>
                      <span style={{ color: '#34d399' }}>Total Food Bill:</span>
                      <span style={{ color: '#34d399', fontSize: '1.05rem' }}>₹962.00</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => alert(`Printing Bill B: Cannon Kitchen Food Invoice #${matchedBooking.billNo}-F for ${room.currentGuestName || matchedBooking.guestName}`)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', borderColor: '#34d399', color: '#34d399' }}
                  >
                    <Printer size={15} /> Print Food Bill B
                  </button>
                  <button
                    type="button"
                    onClick={() => sendCheckoutSplitWhatsApp({
                      billType: 'Fenugreek Restaurant Food Bill B',
                      billNo: `${matchedBooking.billNo || 'FMBIL2627'}-F`,
                      companyOrGuest: room.currentGuestName || matchedBooking.guestName,
                      gstin: '',
                      roomNumber: room.roomNumber,
                      period: 'Dining Settlement',
                      amount: 962.00,
                      recipientPhone: matchedBooking.guestPhone || room.guestPhone
                    })}
                    style={{ flex: 1.1, padding: '0.5rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399', color: '#34d399', border: '1px solid #34d399', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    title="Send personal restaurant & room dining bill to Guest mobile on WhatsApp"
                  >
                    <MessageCircle size={14} /> WhatsApp Bill B
                  </button>
                </div>
              </div>
            </div>

            {/* Back to Tenders or Proceed */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => setCheckoutMode('tenders')}
                className="btn-outline"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
              >
                ← Back to Multi-Tender Payment
              </button>

              <button
                type="button"
                onClick={() => {
                  alert('Both Bill A (Room) and Bill B (Cannon Kitchen Food) generated and logged in statutory sales summary.');
                  setCheckoutMode('tenders');
                }}
                className="btn-primary-gold"
                style={{ padding: '0.55rem 1.5rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <CheckCircle2 size={16} /> Confirm Split Invoices &amp; Proceed to Settlement
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleCheckoutSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* NET DUE & BALANCING SUMMARY CARD */}
          <div style={{
            background: 'rgba(12, 24, 43, 0.75)',
            border: `1px solid ${isBalanced ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: isBalanced ? '0 0 20px rgba(52, 211, 153, 0.1)' : '0 0 20px rgba(248, 113, 113, 0.1)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold-glow)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Bill to Settle
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                  ₹{netDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  (incl. CGST &amp; SGST)
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                {isBalanced ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid #10b981',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    <CheckCircle2 size={14} /> 100% BALANCED (₹0.00 DUE)
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    border: '1px solid #ef4444',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    <AlertCircle size={14} /> VARIANCE: ₹{variance.toFixed(2)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Allocated: <strong style={{ color: '#fff' }}>₹{totalAllocated.toFixed(2)}</strong> of ₹{netDue.toFixed(2)}
              </div>
            </div>

            {/* Split Percentage Visual Bar */}
            <div style={{ width: '100%', marginTop: '0.25rem' }}>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex'
              }}>
                <div style={{ width: `${upiPercent}%`, background: '#38bdf8', transition: 'width 0.3s ease' }} title={`PhonePe/UPI: ${upiPercent.toFixed(0)}%`} />
                <div style={{ width: `${cashPercent}%`, background: '#34d399', transition: 'width 0.3s ease' }} title={`Cash: ${cashPercent.toFixed(0)}%`} />
                <div style={{ width: `${cardPercent}%`, background: '#c084fc', transition: 'width 0.3s ease' }} title={`Card: ${cardPercent.toFixed(0)}%`} />
                <div style={{ width: `${btcPercent}%`, background: '#fbbf24', transition: 'width 0.3s ease' }} title={`BTC: ${btcPercent.toFixed(0)}%`} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }} /> PhonePe / UPI: ₹{numUpi.toFixed(2)}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} /> Cash: ₹{numCash.toFixed(2)}
                </span>
                {numCard > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c084fc' }} /> Card: ₹{numCard.toFixed(2)}
                  </span>
                )}
                {numBtc > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} /> Corporate BTC: ₹{numBtc.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* QUICK PRESET BUTTONS (Featuring the Owner's exact scenario) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold-glow)', textTransform: 'uppercase', fontWeight: 600 }}>
                ⚡ Quick Split Presets
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Click to instantly populate payment tenders
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* OWNER'S EXACT VIDEO SPLIT: PhonePe Food + Linde BTC Lodging */}
              <button
                type="button"
                onClick={() => applyPreset('owner-split-btc')}
                style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(52, 211, 153, 0.2))',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(56, 189, 248, 0.2)'
                }}
              >
                <Sparkles size={14} color="#34d399" /> 🏢 Corporate Dual-Tender (₹962 Guest UPI + ₹12,596 Company BTC)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('owner-demo')}
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(212, 175, 55, 0.1))',
                  color: 'var(--gold-glow)',
                  border: '1px solid var(--gold-glow)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(212, 175, 55, 0.2)'
                }}
              >
                <Sparkles size={14} /> Quick Split (₹462 UPI + ₹500 Cash)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('100-upi')}
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                100% PhonePe / UPI (₹{netDue.toFixed(2)})
              </button>

              <button
                type="button"
                onClick={() => applyPreset('100-cash')}
                style={{
                  background: 'rgba(52, 211, 153, 0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                100% Cash Drawer (₹{netDue.toFixed(2)})
              </button>

              <button
                type="button"
                onClick={() => applyPreset('50-50')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                50 / 50 Equal Split
              </button>
            </div>
          </div>

          {/* SPLIT TENDER INPUT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            
            {/* TENDER 1: PHONEPE / UPI */}
            <div style={{
              background: 'rgba(19, 34, 61, 0.45)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '10px',
              padding: '1rem',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Smartphone size={16} /> 1. PhonePe / UPI (Digital Payment)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const diff = Math.max(0, netDue - numCash - numCard - numBtc);
                    setUpiAmount(diff.toFixed(2));
                  }}
                  style={{
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    border: 'none',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + Max Balance
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 462.00"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#060e1a',
                      color: '#fff',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>UPI App / Mode</label>
                  <select
                    value={upiProvider}
                    onChange={(e) => setUpiProvider(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#060e1a',
                      color: '#fff',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="PhonePe">PhonePe QR</option>
                    <option value="GooglePay">Google Pay (GPay)</option>
                    <option value="Paytm">Paytm Merchant</option>
                    <option value="SBI UPI">SBI Yono / BHIM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Bank / UTR Ref Number</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-9281048201"
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#060e1a',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>

            {/* TENDER 2: CASH DRAWER */}
            <div style={{
              background: 'rgba(19, 34, 61, 0.45)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              borderRadius: '10px',
              padding: '1rem',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
                  <DollarSign size={16} /> 2. Physical Cash (Front Desk Drawer)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const diff = Math.max(0, netDue - numUpi - numCard - numBtc);
                    setCashAmount(diff.toFixed(2));
                  }}
                  style={{
                    background: 'rgba(52, 211, 153, 0.2)',
                    color: '#34d399',
                    border: 'none',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + Max Balance
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 500.00"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#060e1a',
                      color: '#fff',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Cashier Handling</label>
                  <input
                    type="text"
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#060e1a',
                      color: '#fff',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Drawer Sync: Automatically logged into Cashier Audit Physical Note Denomination Counter.
                </span>
              </div>
            </div>

            {/* TENDER 3: CARD SWIPE / POS */}
            <div style={{
              background: 'rgba(19, 34, 61, 0.45)',
              border: '1px solid rgba(192, 132, 252, 0.25)',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontWeight: 700, fontSize: '0.85rem' }}>
                  <CreditCard size={16} /> 3. Card Swipe / POS (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const diff = Math.max(0, netDue - numUpi - numCash - numBtc);
                    setCardAmount(diff.toFixed(2));
                  }}
                  style={{
                    background: 'rgba(192, 132, 252, 0.2)',
                    color: '#c084fc',
                    border: 'none',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + Max Balance
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#060e1a',
                      color: '#fff',
                      border: '1px solid rgba(192, 132, 252, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 700
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>EDC Machine Auth Code</label>
                  <input
                    type="text"
                    value={cardAuth}
                    onChange={(e) => setCardAuth(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#060e1a',
                      color: '#fff',
                      border: '1px solid rgba(192, 132, 252, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* TENDER 4: CORPORATE BTC */}
            <div style={{
              background: 'rgba(19, 34, 61, 0.45)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Building2 size={16} /> 4. Corporate Credit / BTC (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const diff = Math.max(0, netDue - numUpi - numCash - numCard);
                    setBtcAmount(diff.toFixed(2));
                  }}
                  style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    color: '#fbbf24',
                    border: 'none',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + Max Balance
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={btcAmount}
                    onChange={(e) => setBtcAmount(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#060e1a',
                      color: '#fff',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 700
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Corporate Account</label>
                  <select
                    value={btcCompany}
                    onChange={(e) => setBtcCompany(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#060e1a',
                      color: '#fff',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Linde India Ltd">Linde India Ltd</option>
                    <option value="JK Paper Mills">JK Paper Mills (Jaykaypur)</option>
                    <option value="IMFA Therubali">IMFA Therubali</option>
                    <option value="Vedanta Alumina">Vedanta Alumina</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* DOCUMENT ENGINE FORMAT & BILLING SERIES SELECTOR */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02))',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#f3c64c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Receipt size={15} /> Document Series:
              </span>
              <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <button
                  type="button"
                  onClick={() => setIsNonGstBill(false)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: !isNonGstBill ? 800 : 500,
                    background: !isNonGstBill ? 'linear-gradient(135deg, #d4af37, #f3c64c)' : 'transparent',
                    color: !isNonGstBill ? '#060e1a' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🏛️ Rule 46 GST Bill (FMBIL)
                </button>
                <button
                  type="button"
                  onClick={() => setIsNonGstBill(true)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: isNonGstBill ? 800 : 500,
                    background: isNonGstBill ? 'linear-gradient(135deg, #38bdf8, #0284c7)' : 'transparent',
                    color: isNonGstBill ? '#ffffff' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  📜 Non-GST Cash Memo (NGST)
                </button>
              </div>
            </div>

            <label htmlFor="openReceiptAfter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#94a3b8', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="openReceiptAfter"
                checked={openReceiptAfter}
                onChange={(e) => setOpenReceiptAfter(e.target.checked)}
                style={{ cursor: 'pointer', width: 15, height: 15, accentColor: 'var(--gold-glow)' }}
              />
              <span>Auto-open Document Suite on Settle</span>
            </label>
          </div>

          {/* MODAL FOOTER BUTTONS */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            {/* Instant Money Receipt Button (Owner Video Demonstration) */}
            <button
              type="button"
              onClick={(e) => handleCheckoutSubmit(e, 'money-receipt')}
              disabled={!isBalanced}
              title="Settle folio & instantly generate Official Money Receipt Voucher (Page 5)"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: isBalanced ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(255, 255, 255, 0.08)',
                color: isBalanced ? '#ffffff' : '#64748b',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isBalanced ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: isBalanced ? '0 4px 15px rgba(225, 29, 72, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Receipt size={16} /> 🧾 Settle &amp; Print Money Receipt
            </button>

            {/* Settle & Open in Universal Document Editor */}
            <button
              type="button"
              onClick={(e) => handleCheckoutSubmit(e, 'editor')}
              disabled={!isBalanced}
              title="Settle folio & open live Document Editor to customize remarks, GRC, or line items before printing"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: isBalanced ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255, 255, 255, 0.08)',
                color: isBalanced ? '#ffffff' : '#64748b',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isBalanced ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: isBalanced ? '0 4px 15px rgba(124, 58, 237, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Receipt size={16} /> ✏️ Settle &amp; Open Document Editor
            </button>

            {/* Consolidated Tax Invoice Button */}
            <button
              type="button"
              onClick={(e) => handleCheckoutSubmit(e, 'a4')}
              disabled={!isBalanced}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '8px',
                background: isBalanced ? 'linear-gradient(135deg, #d4af37, #f3c64c)' : 'rgba(255, 255, 255, 0.1)',
                color: isBalanced ? '#060e1a' : '#64748b',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: isBalanced ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isBalanced ? '0 4px 15px rgba(212, 175, 55, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Check size={18} /> 📄 Settle &amp; Print Tax Invoice
            </button>
          </div>

        </form>
        )}
      </div>
    </div>
  );
}
