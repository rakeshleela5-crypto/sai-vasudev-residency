import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, CheckCircle2, FileText, Phone, Mail, 
  Printer, Copy, Calculator, Calendar, Users, DollarSign, 
  ArrowRight, Sparkles, X, Check, Bed, Utensils, Receipt, MessageCircle
} from 'lucide-react';
import { CORPORATE_PARTNERS, HOTEL_CONFIG, ROOM_TIERS } from '../data/hotelData';
import { SheetsEditableCell } from './UniversalInlineEditor';
import { sendCorporateQuotationWhatsApp } from '../utils/whatsappDispatch';

export default function CorporatePortalModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('quotation'); // 'quotation' | 'onboarding'
  
  // ==========================================
  // TAB 1: B2B PROFORMA QUOTATION & ADVANCE ESCROW STATE
  // Inspired by Crater Invoice & ERPNext B2B Sales
  // ==========================================
  const [selectedPartnerId, setSelectedPartnerId] = useState('CORP-01'); // Linde India Ltd by default
  const [customClientName, setCustomClientName] = useState('');
  const [customClientGstin, setCustomClientGstin] = useState('');
  const [eventCategory, setEventCategory] = useState('corporate-stay'); // 'corporate-stay', 'banquet-conference', 'delegation'
  
  const [roomTierId, setRoomTierId] = useState('deluxe');
  const [roomCount, setRoomCount] = useState(5);
  const [nightCount, setNightCount] = useState(2);
  const [guestCount, setGuestCount] = useState(10);
  const [mealPlan, setMealPlan] = useState('CP'); // 'EP' (Room Only), 'CP' (Bed & Breakfast), 'MAP' (Bfast + Dinner)
  const [includeBanquetHall, setIncludeBanquetHall] = useState(false);
  const [includeAudioProjector, setIncludeAudioProjector] = useState(false);
  
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [advanceRecorded, setAdvanceRecorded] = useState(false);
  const [advanceTxRef, setAdvanceTxRef] = useState('');

  // ==========================================
  // TAB 2: CORPORATE ONBOARDING STATE
  // ==========================================
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [estimatedRooms, setEstimatedRooms] = useState('5-10 rooms/month');
  const [customTariffOverride, setCustomTariffOverride] = useState(null);

  if (!isOpen) return null;

  // Selected Corporate Partner
  const selectedPartner = CORPORATE_PARTNERS.find(c => c.id === selectedPartnerId) || {
    id: 'CUSTOM',
    name: customClientName || 'Corporate Client',
    gstin: customClientGstin || '21AABCL1234F1Z9',
    billingType: 'BTC',
    contractDiscount: 10
  };

  // Safely normalize ROOM_TIERS whether array or object
  const tierList = Array.isArray(ROOM_TIERS) ? ROOM_TIERS : Object.values(ROOM_TIERS || []);
  const selectedTier = tierList.find(t => t.id === roomTierId) || tierList[0] || { id: 'standard-deluxe', name: 'Standard Deluxe', tariff: 1699 };
  const baseRatePerNight = customTariffOverride !== null ? customTariffOverride : (selectedTier.tariff || selectedTier.baseRate || 1699);
  const discountRate = selectedPartner.contractDiscount || 0;
  const effectiveRoomRate = Math.round(baseRatePerNight * (1 - discountRate / 100));

  // Meal Plan Pricing per pax per day
  const mealRates = {
    EP: 0,
    CP: 180, // Buffet Breakfast
    MAP: 450 // Breakfast + Executive Satvik Dinner Buffet
  };
  const mealChargePerDay = (mealRates[mealPlan] || 0) * guestCount;

  // Ancillary Conference Hall Rentals
  const banquetHallCharge = includeBanquetHall ? 15000 * nightCount : 0;
  const avCharge = includeAudioProjector ? 3500 * nightCount : 0;

  // Subtotals
  const totalRoomTariff = effectiveRoomRate * roomCount * nightCount;
  const totalMealTariff = mealChargePerDay * nightCount;
  const totalAncillary = banquetHallCharge + avCharge;

  // Indian GST Separations (Rules from India-Compliance / ERPNext):
  // SAC 996311: Room Tariff (12% GST)
  // SAC 996331: Restaurant / Banquet Catering (5% GST)
  // SAC 997212: Banquet Hall Rental (18% GST)
  const roomGst = Math.round(totalRoomTariff * 0.12);
  const mealGst = Math.round(totalMealTariff * 0.05);
  const ancillaryGst = Math.round(totalAncillary * 0.18);
  const totalGst = roomGst + mealGst + ancillaryGst;

  const grandTotal = totalRoomTariff + totalMealTariff + totalAncillary + totalGst;
  // 30% Mandatory Advance Deposit Escrow
  const advanceRequired = Math.round(grandTotal * 0.30);
  const balanceOnCheckout = grandTotal - advanceRequired;

  const quotationNo = `SSVR/QUOT/2026-27/${selectedPartner.id.replace('CORP-', 'B2B-')}-0927`;

  const handlePrintQuotation = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `*${HOTEL_CONFIG.name.toUpperCase()} - B2B PROFORMA QUOTATION*\n` +
      `Quote No: ${quotationNo}\n` +
      `Client: ${selectedPartner.name} (GSTIN: ${selectedPartner.gstin})\n` +
      `Stay: ${roomCount}x ${selectedTier.name} for ${nightCount} Nights (${guestCount} Pax)\n` +
      `Meal Plan: ${mealPlan === 'EP' ? 'Room Only' : mealPlan === 'CP' ? 'Bed & Breakfast' : 'Breakfast + Dinner (MAP)'}\n` +
      `Total Estimate (Incl. GST): Rs. ${grandTotal.toLocaleString('en-IN')}\n` +
      `*Mandatory 30% Advance Deposit Required:* Rs. ${advanceRequired.toLocaleString('en-IN')}\n` +
      `Remittance: SBI Rayagada A/C 3892019482 (IFSC: SBIN0000169)`;
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  const handleConfirmAdvance = (e) => {
    e.preventDefault();
    if (!advanceTxRef) return;
    setAdvanceRecorded(true);

    // Sync to Cloudflare D1
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record_corporate_advance_quotation',
        payload: {
          quotationNo,
          partnerId: selectedPartner.id,
          companyName: selectedPartner.name,
          grandTotal,
          advanceRequired,
          advanceTxRef,
          roomCount,
          nightCount,
          status: 'Advance Confirmed'
        }
      })
    }).catch(err => console.warn('Offline quotation advance sync:', err));
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (!companyName || !gstin) return;

    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'apply_corporate_account',
        payload: {
          corporateId: `CORP-${Date.now().toString().slice(-4)}`,
          companyName,
          gstin,
          contactPerson,
          contactEmail,
          contactPhone: phone,
          estimatedRooms
        }
      })
    }).catch(err => console.warn('Offline corporate account application:', err));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 4000);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 100000 }}>
      <div className="modal-content" style={{ maxWidth: 960, maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div className="modal-header" style={{
          padding: '1.2rem 1.75rem',
          borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
          background: 'linear-gradient(90deg, #130e26, #0b0718)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              padding: '0.55rem',
              borderRadius: '10px',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                  Corporate B2B & Proforma Quotation Portal
                </h3>
                <span style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#c4b5fd',
                  border: '1px solid #8b5cf6',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}>
                  Rule 46 & India GST Compliant
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Enterprise quotation generator, 30% advance deposit escrow & pre-contracted industrial rates
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 12, 28, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0.4rem 1.75rem',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('quotation')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'quotation' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
              color: activeTab === 'quotation' ? '#c4b5fd' : 'var(--text-muted)',
              border: activeTab === 'quotation' ? '1px solid #8b5cf6' : '1px solid transparent'
            }}
          >
            <Receipt size={16} /> B2B Proforma Quotation & Advance Escrow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('onboarding')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'onboarding' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
              color: activeTab === 'onboarding' ? '#c4b5fd' : 'var(--text-muted)',
              border: activeTab === 'onboarding' ? '1px solid #8b5cf6' : '1px solid transparent'
            }}
          >
            <ShieldCheck size={16} /> Corporate Rule 46 Account Application
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          
          {/* TAB 1: B2B PROFORMA QUOTATION BUILDER */}
          {activeTab === 'quotation' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
              
              {/* Left Column: Parameter Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold-glow)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={15} /> SELECT CORPORATE PARTNER / CLIENT
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                      style={{
                        padding: '0.6rem',
                        background: '#1a162b',
                        color: '#fff',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: '6px',
                        fontSize: '0.88rem'
                      }}
                    >
                      {CORPORATE_PARTNERS.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.contractDiscount}% Pre-contracted Off ({c.gstin})
                        </option>
                      ))}
                      <option value="CUSTOM">+ New Corporate / Walk-in Banquet Client</option>
                    </select>

                    {selectedPartnerId === 'CUSTOM' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <input
                          type="text"
                          placeholder="Client / Company Name"
                          value={customClientName}
                          onChange={(e) => setCustomClientName(e.target.value)}
                          style={{ padding: '0.5rem', background: '#130e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                        />
                        <input
                          type="text"
                          placeholder="GSTIN (Optional)"
                          value={customClientGstin}
                          onChange={(e) => setCustomClientGstin(e.target.value)}
                          style={{ padding: '0.5rem', background: '#130e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Scope & Dates */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Bed size={15} /> ROOM RESERVATION SCOPE & MEAL PLAN
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Room Tier</label>
                      <select
                        value={roomTierId}
                        onChange={(e) => setRoomTierId(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', background: '#1a162b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.8rem' }}
                      >
                        {tierList.map(t => (
                          <option key={t.id} value={t.id}>{t.name} (Rack: ₹{t.tariff || t.baseRate || 1699})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Rooms</label>
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={roomCount}
                        onChange={(e) => setRoomCount(parseInt(e.target.value) || 1)}
                        style={{ width: '100%', padding: '0.5rem', background: '#1a162b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Nights</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={nightCount}
                        onChange={(e) => setNightCount(parseInt(e.target.value) || 1)}
                        style={{ width: '100%', padding: '0.5rem', background: '#1a162b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Pax (Guests)</label>
                      <input
                        type="number"
                        min="1"
                        max="80"
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                        style={{ width: '100%', padding: '0.5rem', background: '#1a162b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Meal Plan (F&B)</label>
                      <select
                        value={mealPlan}
                        onChange={(e) => setMealPlan(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', background: '#1a162b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.8rem' }}
                      >
                        <option value="EP">EP (Room Only - ₹0)</option>
                        <option value="CP">CP (Buffet Breakfast - ₹180/pax)</option>
                        <option value="MAP">MAP (Bfast + Satvik Dinner - ₹450/pax)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Banquet & Ancillary Add-ons */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={15} /> BANQUET & CONFERENCE FACILITIES
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#e2e8f0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={includeBanquetHall}
                        onChange={(e) => setIncludeBanquetHall(e.target.checked)}
                      />
                      <span>Sai Darbar Executive Banquet Hall (+₹15,000 / day)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#e2e8f0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={includeAudioProjector}
                        onChange={(e) => setIncludeAudioProjector(e.target.checked)}
                      />
                      <span>4K Laser Projector, JBL Audio & Podium Mic (+₹3,500 / day)</span>
                    </label>
                  </div>
                </div>

                {/* Advance Recording Form */}
                <div style={{
                  background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.15))',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} /> 30% ADVANCE ESCROW RECORDING
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0 0 0.6rem 0' }}>
                    Corporate policy requires a mandatory 30% advance deposit (<strong>₹{advanceRequired.toLocaleString('en-IN')}</strong>) to block inventory.
                  </p>

                  {advanceRecorded ? (
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                      ✓ Advance Deposit of ₹{advanceRequired.toLocaleString('en-IN')} confirmed via Ref #{advanceTxRef}!
                    </div>
                  ) : (
                    <form onSubmit={handleConfirmAdvance} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="NEFT / UTR / Cheque / UPI Ref #"
                        required
                        value={advanceTxRef}
                        onChange={(e) => setAdvanceTxRef(e.target.value)}
                        style={{ flex: 1, padding: '0.45rem 0.65rem', background: '#0e1f18', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                      />
                      <button
                        type="submit"
                        style={{
                          background: '#10b981',
                          color: '#000',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Record Advance
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column: Authentic Proforma Quotation Preview */}
              <div style={{
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '12px',
                padding: '1.4rem',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                position: 'sticky',
                top: 0
              }}>
                {/* Quotation Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #8b5cf6', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#4c1d95', letterSpacing: '0.5px' }}>
                      {HOTEL_CONFIG.name.toUpperCase()}
                    </h4>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                      Near Andhra Bank, New Colony, Rayagada, Odisha - 765001<br />
                      GSTIN: {HOTEL_CONFIG.gstin} | SAC: 996311 / 996331
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: '#8b5cf6', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      Proforma Quotation
                    </span>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                      {quotationNo}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      Date: {new Date().toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Billed To */}
                <div style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.72rem', marginBottom: '0.85rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                    Quotation Prepared For:
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                    {selectedPartner.name}
                  </div>
                  <div style={{ color: '#475569' }}>
                    GSTIN: {selectedPartner.gstin} • State: 21 (Odisha) • Contracted Discount: {discountRate}%
                  </div>
                </div>

                {/* Line Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', marginBottom: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#ede9fe', color: '#4c1d95', borderBottom: '1.5px solid #c4b5fd' }}>
                      <th style={{ textAlign: 'left', padding: '5px 6px' }}>SERVICE / ITEM</th>
                      <th style={{ textAlign: 'center', padding: '5px 4px' }}>SAC</th>
                      <th style={{ textAlign: 'center', padding: '5px 4px' }}>QTY</th>
                      <th style={{ textAlign: 'right', padding: '5px 6px' }}>NET (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 6px' }}>
                        <strong>{selectedTier.name}</strong> ({roomCount} Rms x {nightCount} Nts)<br />
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Rate: ₹{effectiveRoomRate}/nt (Rack ₹{baseRatePerNight})</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 4px', color: '#64748b' }}>996311</td>
                      <SheetsEditableCell
                        value={roomCount * nightCount}
                        type="number"
                        align="center"
                        min={1}
                        cellStyle={{ padding: '6px 4px' }}
                        onSave={(newVal) => setRoomCount(Math.max(1, Math.round(Number(newVal) / (nightCount || 1))))}
                      />
                      <SheetsEditableCell
                        value={totalRoomTariff}
                        type="currency"
                        align="right"
                        min={0}
                        cellStyle={{ padding: '6px 6px', fontWeight: 700 }}
                        onSave={(newVal) => {
                          const perNight = Math.round(Number(newVal) / ((roomCount || 1) * (nightCount || 1)));
                          setCustomTariffOverride(perNight);
                        }}
                      />
                    </tr>

                    {totalMealTariff > 0 && (
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 6px' }}>
                          <strong>Satvik Meal Plan ({mealPlan})</strong><br />
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>₹{mealRates[mealPlan]}/pax/day x {guestCount} Guests</span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px 4px', color: '#64748b' }}>996331</td>
                        <td style={{ textAlign: 'center', padding: '6px 4px' }}>{guestCount * nightCount}</td>
                        <td style={{ textAlign: 'right', padding: '6px 6px', fontWeight: 700 }}>₹{totalMealTariff.toLocaleString('en-IN')}</td>
                      </tr>
                    )}

                    {banquetHallCharge > 0 && (
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 6px' }}>
                          <strong>Sai Darbar Banquet Hall</strong> ({nightCount} Days)
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px 4px', color: '#64748b' }}>997212</td>
                        <td style={{ textAlign: 'center', padding: '6px 4px' }}>{nightCount}</td>
                        <td style={{ textAlign: 'right', padding: '6px 6px', fontWeight: 700 }}>₹{banquetHallCharge.toLocaleString('en-IN')}</td>
                      </tr>
                    )}

                    {avCharge > 0 && (
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 6px' }}>
                          <strong>4K Projector & JBL Audio Kit</strong>
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px 4px', color: '#64748b' }}>997212</td>
                        <td style={{ textAlign: 'center', padding: '6px 4px' }}>{nightCount}</td>
                        <td style={{ textAlign: 'right', padding: '6px 6px', fontWeight: 700 }}>₹{avCharge.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Subtotals & Taxes */}
                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Taxable Subtotal:</span>
                    <span>₹{(totalRoomTariff + totalMealTariff + totalAncillary).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Total Applicable GST:</span>
                    <span>₹{totalGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.88rem', color: '#1e1b4b', borderTop: '1.5px solid #cbd5e1', paddingTop: '4px', marginTop: '2px' }}>
                    <span>ESTIMATED GRAND TOTAL:</span>
                    <span style={{ color: '#6d28d9' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Escrow Deposit Highlight Box */}
                <div style={{
                  background: '#f5f3ff',
                  border: '1.5px dashed #8b5cf6',
                  borderRadius: '6px',
                  padding: '0.65rem 0.8rem',
                  marginTop: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
                        30% Advance Deposit Required
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4c1d95' }}>
                        ₹{advanceRequired.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.68rem', color: '#64748b' }}>
                      Balance on Checkout:<br />
                      <strong style={{ color: '#0f172a' }}>₹{balanceOnCheckout.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#6b7280', marginTop: '4px', borderTop: '1px dotted #c4b5fd', paddingTop: '3px' }}>
                    Bank Remittance: SBI Rayagada Main • A/C: 3892019482 • IFSC: SBIN0000169
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => sendCorporateQuotationWhatsApp({
                      quoteNumber: `SSVR/QUOT/${Date.now().toString().slice(-4)}`,
                      companyName: currentPartner?.name || customClientName || 'Corporate Partner',
                      gstin: currentPartner?.gstin || customClientGstin || '',
                      roomTier: selectedTier?.name || 'Executive Deluxe',
                      roomCount,
                      nightCount,
                      guestCount,
                      mealPlan,
                      includeBanquet: includeBanquetHall,
                      subtotal: roomSubtotal + mealTotal + banquetTotal,
                      gstAmount,
                      grandTotal,
                      advanceRequired,
                      balanceOnCheckout,
                      clientPhone: contactPhone
                    })}
                    style={{
                      flex: 1.3,
                      padding: '0.55rem',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                    }}
                    title="Send official quotation & advance deposit escrow details to client on WhatsApp"
                  >
                    <MessageCircle size={14} /> WhatsApp Quote
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedQuote ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    {copiedQuote ? 'Copied!' : 'Copy Summary'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintQuotation}
                    style={{
                      flex: 1.1,
                      padding: '0.5rem',
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Printer size={14} /> Print / Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORPORATE RULE 46 ACCOUNT APPLICATION */}
          {activeTab === 'onboarding' && (
            <div>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
                    Corporate Account Request Received!
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: 500, margin: '0 auto' }}>
                    Our corporate accounts desk will contact <strong>{contactEmail}</strong> within 2 hours with our Rule 46 corporate credit agreement and KYC paperwork.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Partner Badges */}
                  <div style={{
                    background: 'rgba(12, 24, 43, 0.8)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    padding: '1rem',
                    borderRadius: '10px',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 600, marginBottom: '0.5rem' }}>
                      ACTIVE RAYAGADA CORPORATE PREFERRED PARTNERS:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {CORPORATE_PARTNERS.map(c => (
                        <span 
                          key={c.id}
                          style={{
                            background: 'rgba(6, 14, 26, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '0.3rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            color: '#fff'
                          }}
                        >
                          {c.name} ({c.contractDiscount}% Pre-contracted Off)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Onboarding Form */}
                  <form onSubmit={handleOnboardingSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Enterprise / Organization Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Vedanta / Larsen & Toubro"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Corporate GSTIN (For ITC Pass)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="15-character GSTIN (e.g. 21AABCL1234F1Z9)"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Key Contact Person & Designation</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. S. Senapati (Admin Lead)"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Official Corporate Email</label>
                        <input 
                          type="email" 
                          className="form-input" 
                          placeholder="traveldesk@company.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Desk / Mobile Contact</label>
                        <input 
                          type="tel" 
                          className="form-input" 
                          placeholder="+91 6856 ..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Estimated Monthly Room Nights</label>
                        <select 
                          className="form-select"
                          value={estimatedRooms}
                          onChange={(e) => setEstimatedRooms(e.target.value)}
                        >
                          <option value="5-10 rooms/month">5 - 10 rooms / month</option>
                          <option value="10-25 rooms/month">10 - 25 rooms / month</option>
                          <option value="25-50+ rooms/month">25 - 50+ rooms / month (Enterprise)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                      <button type="button" onClick={onClose} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center' }}>
                        Submit Corporate Application
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
