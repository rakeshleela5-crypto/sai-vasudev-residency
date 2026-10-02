import React, { useState } from 'react';
import { 
  X, Check, UserCheck, ShieldCheck, CreditCard, 
  DollarSign, Coffee, Car, AlertTriangle, FileText, 
  Sparkles, Bed, Phone, MapPin, IndianRupee, KeyRound
} from 'lucide-react';
import { maskAadhaar } from '../utils/security';
import { calculateRoomTax } from '../utils/taxUtils';

/**
 * CheckInReviewModal Component - Inspired by The Wild Oasis Community PMS
 * Dedicated front-desk in-person check-in workflow for pre-booked arrivals:
 * 1. Physical Govt ID verification
 * 2. Breakfast & logistics add-on upsell
 * 3. Payment collection for pending deposit / arrival balance
 * 4. Room status handover to 'Occupied'
 */
export default function CheckInReviewModal({
  isOpen,
  onClose,
  booking,
  onConfirmCheckIn,
  breakfastRate = 250,
  cabRate = 350
}) {
  if (!isOpen || !booking) return null;

  const roomNumber = booking.roomNumber;
  const guestName = booking.guestName || 'Valued Guest';
  const guestPhone = booking.guestPhone || '+91 94370 00000';
  const tier = booking.tier || 'Executive AC';
  const nights = Number(booking.nights) || 1;
  const adults = Number(booking.adults) || 1;
  const advanceDeposit = Number(booking.advanceDeposit || 0);

  // Add-on states (The Wild Oasis Upsells)
  const [includeBreakfast, setIncludeBreakfast] = useState(booking.mealPlan === 'CP' || booking.mealPlan === 'MAP' || false);
  const [includeStationDrop, setIncludeStationDrop] = useState(false);
  const [extraBedCount, setExtraBedCount] = useState(0);

  // ID Verification & Compliance
  const [idVerified, setIdVerified] = useState(false);
  const [keycardIssued, setKeycardIssued] = useState(false);
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI', 'Cash', 'Card', 'BTC'
  const [upiRef, setUpiRef] = useState('');

  // Financial calculations
  const baseRoomTariff = Number(booking.tariffPerNight || booking.baseTotal || 1699) * nights;
  const breakfastTotal = includeBreakfast ? (breakfastRate * adults * nights) : 0;
  const cabTotal = includeStationDrop ? cabRate : 0;
  const extraBedTotal = extraBedCount * 400 * nights;

  const totalAddons = breakfastTotal + cabTotal + extraBedTotal;
  const grossTotal = baseRoomTariff + totalAddons;
  const gstAmount = Math.round(grossTotal * 0.12 * 100) / 100;
  const netPayable = grossTotal + gstAmount;
  const balanceDue = Math.max(0, netPayable - advanceDeposit);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idVerified) {
      alert('Statutory Compliance Notice: You must physically verify the guest Government ID before issuing room keys (Sarai Act 1867 & DPDP 2023).');
      return;
    }

    const checkInData = {
      bookingId: booking.bookingId || booking.id,
      roomNumber,
      guestName,
      tier,
      nights,
      addons: {
        breakfast: includeBreakfast ? { rate: breakfastRate, total: breakfastTotal } : null,
        stationDrop: includeStationDrop ? { fare: cabRate } : null,
        extraBed: extraBedCount > 0 ? { count: extraBedCount, total: extraBedTotal } : null
      },
      payment: {
        mode: paymentMode,
        amountCollected: balanceDue,
        upiRef: paymentMode === 'UPI' ? (upiRef || `UPI-${Date.now().toString().slice(-6)}`) : null,
        totalStayAmount: netPayable
      },
      keycardIssued
    };

    onConfirmCheckIn(booking, checkInData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #0b1528, #050d1a)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: 680,
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: '1.75rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="badge" style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                FRONT-DESK CHECK-IN VERIFICATION
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Booking #{booking.bookingId || 'DIRECT'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '0.35rem 0 0' }}>
              Check In: {guestName}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Assigned to <strong style={{ color: 'var(--gold-glow)' }}>Room {roomNumber}</strong> • {tier} • {nights} Night{nights > 1 ? 's' : ''}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* STEP 1: Guest Identity & DPDP Verification */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.65rem 0', color: 'var(--gold-glow)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> 1. Statutory Identity Verification (Sarai Act &amp; DPDP 2023)
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              marginBottom: '0.75rem'
            }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>Mobile Phone</span>
                <strong>{guestPhone}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>State / Origin</span>
                <strong>{booking.stateOfOrigin || booking.origin || 'Odisha'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>Govt ID on Record</span>
                <strong>{booking.idProofType || 'Aadhaar'} ({booking.idProofMasked || 'XXXX-XXXX-8821'})</strong>
              </div>
            </div>

            {/* Mandatory Checkbox - Starts UNCHECKED */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              background: idVerified ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${idVerified ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '8px',
              padding: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}>
              <input
                type="checkbox"
                checked={idVerified}
                onChange={(e) => setIdVerified(e.target.checked)}
                style={{ marginTop: '2px', accentColor: '#34d399', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.78rem', color: idVerified ? '#34d399' : '#f87171', fontWeight: 600 }}>
                I confirm I have physically inspected and validated the guest's original Govt ID and obtained digital guest consent.
              </span>
            </label>
          </div>

          {/* STEP 2: Optional Upsells & Amenities (The Wild Oasis Style) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.65rem 0', color: 'var(--gold-glow)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Coffee size={16} /> 2. Operational Upsells &amp; Services
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Breakfast Upsell Toggle */}
              <label style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: includeBreakfast ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: includeBreakfast ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={includeBreakfast}
                    onChange={(e) => setIncludeBreakfast(e.target.checked)}
                    style={{ accentColor: 'var(--gold-glow)', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                      Satvik Buffet Breakfast Plan (CP)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Fresh South Indian &amp; Odia breakfast served 07:30 - 10:00 AM (₹{breakfastRate}/day)
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                  +₹{breakfastTotal.toLocaleString('en-IN')}
                </span>
              </label>

              {/* Station Drop Cab Transfer */}
              <label style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: includeStationDrop ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: includeStationDrop ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={includeStationDrop}
                    onChange={(e) => setIncludeStationDrop(e.target.checked)}
                    style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                      Rayagada Junction (RGDA) Checkout Station Drop
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      AC cab transfer reserved for departure train (SAC 996412)
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>
                  +₹{cabTotal.toLocaleString('en-IN')}
                </span>
              </label>

              {/* Keycard Issuance Check */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={keycardIssued}
                  onChange={(e) => setKeycardIssued(e.target.checked)}
                  style={{ accentColor: 'var(--gold-glow)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <KeyRound size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Physical RFID keycard encoded &amp; handed over to guest
                </span>
              </label>
            </div>
          </div>

          {/* STEP 3: Financial Settlement & Folio Balance */}
          <div style={{
            background: 'rgba(6, 14, 26, 0.75)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '10px',
            padding: '1.1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Room Base ({nights}N @ ₹{booking.tariffPerNight || 1699}/n):</span>
              <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700 }}>₹{baseRoomTariff.toLocaleString('en-IN')}</span>
            </div>

            {totalAddons > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Selected Add-ons (Breakfast / Cab):</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--gold-glow)', fontWeight: 700 }}>+₹{totalAddons.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>GST (12% SAC 996311/996331):</span>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#34d399' }}>Advance Deposit Already Credited:</span>
              <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700 }}>-₹{advanceDeposit.toLocaleString('en-IN')}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
              paddingTop: '0.75rem',
              marginTop: '0.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fff' }}>
                  Net Balance Due on Arrival:
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Total Stay Value: ₹{netPayable.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: balanceDue > 0 ? '#fbbf24' : '#34d399' }}>
                ₹{balanceDue.toLocaleString('en-IN')}
              </div>
            </div>

            {/* If balance is due, show payment tender buttons */}
            {balanceDue > 0 && (
              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  Select Arrival Balance Settlement Tender:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['UPI', 'Cash', 'Card', 'BTC'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: paymentMode === mode ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.1)',
                        background: paymentMode === mode ? 'var(--gold-glow)' : 'rgba(255,255,255,0.04)',
                        color: paymentMode === mode ? '#060e1a' : '#cbd5e1'
                      }}
                    >
                      {mode === 'BTC' ? 'Corporate BTC' : mode}
                    </button>
                  ))}
                </div>

                {paymentMode === 'UPI' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="UPI Transaction ID (e.g. PhonePe 948102)"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        fontSize: '0.78rem'
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.5rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!idVerified}
              className="btn-primary-gold"
              style={{
                padding: '0.65rem 1.5rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                opacity: idVerified ? 1 : 0.45,
                cursor: idVerified ? 'pointer' : 'not-allowed',
                boxShadow: idVerified ? '0 4px 20px rgba(212, 175, 55, 0.35)' : 'none'
              }}
            >
              <UserCheck size={16} /> Confirm Check-In &amp; Occupy Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
