import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Sliders, Shield, Zap, Calculator, HelpCircle, 
  Layers, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  RotateCcw, Sparkles, Building, Lock, Globe, Percent, FileText, 
  Check, X, RefreshCw, ChevronRight, BarChart2, DollarSign, Calendar
} from 'lucide-react';
import { 
  BASE_ROOM_CONFIG, 
  RAYAGADA_COMP_SET, 
  calculateContinuousMicroRate, 
  calculateAllTierMicroRates, 
  calculateObpRates, 
  calculateUnconstrainedDemandAndWash, 
  calculateGroupDisplacementMAR, 
  explainRateRecommendation, 
  simulateWhatIfScenario, 
  calculateChannelNetRevPAR 
} from '../utils/g3RmsEngine';
import { CORPORATE_PARTNERS, HOTEL_CONFIG } from '../data/hotelData';
import UniversalDateFilterBar from './UniversalDateFilterBar';
import { SheetsColumnHeader, SheetsToolbarLegend, SheetsEditableCell } from './UniversalInlineEditor';

export default function RevenueManagementModal({
  isOpen,
  onClose,
  currentOccupancy = 68,
  onPublishRates,
  activeRates = null
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
  // Active Tab: 'yielding' | 'mar' | 'investigator' | 'sandbox' | 'guardrails' | 'netrevpar'
  const [activeTab, setActiveTab] = useState('yielding');
  const [rmsFromDate, setRmsFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rmsToDate, setRmsToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isRmsDateFilterActive, setIsRmsDateFilterActive] = useState(true);

  // Automation Mode: 'autonomous' | 'exception' | 'interactive'
  const [automationMode, setAutomationMode] = useState('exception');

  // QloApps & IDS Next Seasonal Price Rules & Festival Multipliers Engine
  const [seasonalRules, setSeasonalRules] = useState([
    {
      id: 'rule_chaitra_yatra',
      name: 'Maa Majhighariani Chaitra Yatra Mahotsav',
      period: '18-Mar to 02-Apr (Annual)',
      category: 'Pilgrim / Temple Surge',
      multiplier: 1.40, // +40%
      minNights: 2,
      appliedTiers: 'All Tiers',
      isActive: true,
      description: 'Devotees visit Majhighariani Temple from AP, Telangana, and Odisha. Room demand exceeds 400% capacity.'
    },
    {
      id: 'rule_durga_puja',
      name: 'Durga Puja & Dussehra Festive Season',
      period: '15-Oct to 24-Oct (Annual)',
      category: 'Holiday / Festive',
      multiplier: 1.25, // +25%
      minNights: 1,
      appliedTiers: 'All Tiers',
      isActive: true,
      description: 'Rayagada town cultural carnivals, visiting NRI families, and tourist inflow for Devagiri caves.'
    },
    {
      id: 'rule_industrial_shutdown',
      name: 'JK Paper Mills & Utkal Alumina Annual Shutdown',
      period: '10-Nov to 25-Nov',
      category: 'Corporate Industrial Surge',
      multiplier: 1.15, // +15%
      minNights: 3,
      appliedTiers: 'Executive & Suites',
      isActive: true,
      description: 'OEM maintenance engineers from Voith, Andritz, Siemens, and L&T occupy premium rooms for 2 weeks.'
    },
    {
      id: 'rule_weekend_getaway',
      name: 'Rayagada Weekend Leisure & Waterfall Trek Surge',
      period: 'Every Friday to Sunday',
      category: 'Weekend Leisure',
      multiplier: 1.10, // +10%
      minNights: 1,
      appliedTiers: 'Deluxe & Executive',
      isActive: true,
      description: 'Weekend travelers visiting Hanging Bridge, Hatipathar, and Chatikona waterfalls.'
    },
    {
      id: 'rule_monsoon_green',
      name: 'Eastern Ghats Monsoon Eco-Tourism Promotion',
      period: '01-Jul to 15-Aug',
      category: 'Seasonal Value Offer',
      multiplier: 0.90, // -10% discount
      minNights: 2,
      appliedTiers: 'Standard & Deluxe',
      isActive: false,
      description: 'Monsoon off-season green value package boosting mid-week corporate and leisure occupancy.'
    }
  ]);

  const toggleSeasonalRule = (ruleId) => {
    setSeasonalRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  // Yielding Simulation Sliders State
  const [simOccupancy, setSimOccupancy] = useState(currentOccupancy || 70);
  const [simDta, setSimDta] = useState(3); // Days to arrival
  const [simVelocity, setSimVelocity] = useState(4); // Picked up rooms in 48h
  const [isFestivalSurge, setIsFestivalSurge] = useState(false);
  const [compSetShift, setCompSetShift] = useState(1.04); // +4%

  // Group Displacement MAR State
  const [selectedCorporateId, setSelectedCorporateId] = useState('CORP-01');
  const [rfpRooms, setRfpRooms] = useState(12);
  const [rfpNights, setRfpNights] = useState(3);
  const [rfpOfferedRate, setRfpOfferedRate] = useState(1850);
  const [rfpRoomTier, setRfpRoomTier] = useState('executive-room');
  const [rfpHotelOcc, setRfpHotelOcc] = useState(78);
  const [rfpBanquetSpend, setRfpBanquetSpend] = useState(35000);
  const [rfpHallRental, setRfpHallRental] = useState(15000);
  const [savedRfps, setSavedRfps] = useState([
    {
      id: 'RFP-2026-0901',
      companyName: 'Ashok Leyland Limited',
      rooms: 12,
      nights: 3,
      offeredRate: 2150,
      mar: 1980,
      netGain: 6120,
      verdict: 'RECOMMENDED ACCEPT'
    },
    {
      id: 'RFP-2026-0902',
      companyName: 'JK Paper Mills Ltd',
      rooms: 16,
      nights: 2,
      offeredRate: 1800,
      mar: 1920,
      netGain: -3840,
      verdict: 'REJECT / COUNTER-OFFER'
    }
  ]);
  const [compSetList, setCompSetList] = useState(RAYAGADA_COMP_SET);

  // The Investigator State
  const [investigatorTier, setInvestigatorTier] = useState('standard-deluxe');
  const [investigatorDate, setInvestigatorDate] = useState('2026-09-24');

  // What-If Sandbox State
  const [sandboxScenario, setSandboxScenario] = useState('renovation');
  const [sandboxOfflineRooms, setSandboxOfflineRooms] = useState(8);
  const [sandboxCompPriceChange, setSandboxCompPriceChange] = useState(-20);
  const [sandboxDemandShock, setSandboxDemandShock] = useState(2.5);

  // Rate Guardrails State
  const [guardrails, setGuardrails] = useState({
    'standard-deluxe': { floor: 1499, ceiling: 3200 },
    'deluxe-room': { floor: 1899, ceiling: 3900 },
    'executive-room': { floor: 2499, ceiling: 5200 },
    'premium-suite': { floor: 3499, ceiling: 7999 }
  });
  const [compSetPegPercent, setCompSetPegPercent] = useState(8); // Comp-set + 8%
  const [otaThrottleThreshold, setOtaThrottleThreshold] = useState(80); // Throttle OTAs above 80% occ
  const [publishedToast, setPublishedToast] = useState(false);

  // 1. Calculate live micro-rates across all tiers
  const liveMicroRates = useMemo(() => {
    return calculateAllTierMicroRates({
      occupancyRate: simOccupancy,
      daysToArrival: simDta,
      pickupVelocity48h: simVelocity,
      isFestival: isFestivalSurge,
      competitorRateIndex: compSetShift
    });
  }, [simOccupancy, simDta, simVelocity, isFestivalSurge, compSetShift]);

  // 2. Calculate Unconstrained Demand & Wash
  const unconstrainedData = useMemo(() => {
    return calculateUnconstrainedDemandAndWash({
      physicalCapacity: 18,
      currentOnTheBooks: Math.round((simOccupancy / 100) * 18),
      daysToArrival: simDta,
      pickupPace: simVelocity,
      isFestival: isFestivalSurge
    });
  }, [simOccupancy, simDta, simVelocity, isFestivalSurge]);

  // 3. Corporate Group Displacement MAR Result
  const selectedCorporate = CORPORATE_PARTNERS.find(c => c.id === selectedCorporateId) || CORPORATE_PARTNERS[0];
  const marResult = useMemo(() => {
    return calculateGroupDisplacementMAR({
      companyName: selectedCorporate.name,
      requestedRooms: rfpRooms,
      stayNights: rfpNights,
      offeredRatePerNight: rfpOfferedRate,
      roomTier: rfpRoomTier,
      expectedTransientADR: liveMicroRates[rfpRoomTier]?.recommendedRate || 2899,
      hotelProjectedOccupancy: rfpHotelOcc,
      ancillaryBanquetSpend: rfpBanquetSpend,
      ancillaryHallRental: rfpHallRental
    });
  }, [selectedCorporate, rfpRooms, rfpNights, rfpOfferedRate, rfpRoomTier, liveMicroRates, rfpHotelOcc, rfpBanquetSpend, rfpHallRental]);

  // 4. The Investigator Breakdown Result
  const investigatorResult = useMemo(() => {
    return explainRateRecommendation(investigatorTier, investigatorDate, {
      occupancyRate: simOccupancy,
      daysToArrival: simDta,
      pickupVelocity48h: simVelocity,
      isFestival: isFestivalSurge,
      competitorRateIndex: compSetShift
    });
  }, [investigatorTier, investigatorDate, simOccupancy, simDta, simVelocity, isFestivalSurge, compSetShift]);

  // 5. What-If Sandbox Result
  const sandboxResult = useMemo(() => {
    let inputs = {};
    if (sandboxScenario === 'renovation') inputs = { offlineRooms: sandboxOfflineRooms };
    else if (sandboxScenario === 'competitor_price_war') inputs = { priceChangePercent: sandboxCompPriceChange };
    else inputs = { demandMultiplier: sandboxDemandShock };

    return simulateWhatIfScenario(sandboxScenario, inputs);
  }, [sandboxScenario, sandboxOfflineRooms, sandboxCompPriceChange, sandboxDemandShock]);

  // 6. Net RevPAR Channel Optimization Result
  const netRevPARData = useMemo(() => {
    const avgADR = Math.round(
      (liveMicroRates['standard-deluxe'].recommendedRate * 0.35) +
      (liveMicroRates['deluxe-room'].recommendedRate * 0.30) +
      (liveMicroRates['executive-room'].recommendedRate * 0.20) +
      (liveMicroRates['premium-suite'].recommendedRate * 0.15)
    );
    const roomsSold = Math.round((simOccupancy / 100) * 18);
    return calculateChannelNetRevPAR(avgADR, roomsSold);
  }, [liveMicroRates, simOccupancy]);

  const handlePublishAll = () => {
    if (onPublishRates) {
      onPublishRates(liveMicroRates);
    }
    setPublishedToast(true);
    setTimeout(() => setPublishedToast(false), 3500);
  };

  const handleSaveRfp = () => {
    const newEntry = {
      id: `RFP-${Date.now().toString().slice(-4)}`,
      companyName: marResult.companyName,
      rooms: marResult.requestedRooms,
      nights: marResult.stayNights,
      offeredRate: marResult.offeredRatePerNight,
      mar: marResult.minimumAcceptableRate,
      verdict: marResult.verdict,
      netGain: marResult.netEconomicGainLoss,
      timestamp: new Date().toLocaleTimeString('en-IN')
    };
    setSavedRfps(prev => [newEntry, ...prev]);
    alert(`✓ RFP Proposal for ${marResult.companyName} evaluated and recorded in RMS Audit Ledger!`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '1rem'
    }}>
      <div className="modal-container" style={{
        background: 'linear-gradient(145deg, #090e1a 0%, #0d1527 100%)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.15)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1280px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        color: '#f1f5f9',
        overflow: 'hidden'
      }}>
        {/* Top Header Bar */}
        <div style={{
          padding: '1.1rem 1.75rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          background: 'linear-gradient(90deg, rgba(12, 19, 36, 0.95), rgba(18, 27, 52, 0.95))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #d4af37, #996515)',
                color: '#000',
                padding: '0.4rem 0.65rem',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Zap size={16} /> IDeaS SAS G3
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Revenue Director's Console <span style={{ color: 'var(--gold-glow)', fontSize: '0.9rem', fontWeight: 500 }}>• Enterprise Yield Engine</span>
              </h2>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                TAJ & ACCOR STANDARD
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Autonomous continuous dynamic micro-rate yielding, corporate RFP MAR solver, and unconstrained demand modeling for {HOTEL_CONFIG.name} (18 Rooms).
            </p>
          </div>

          {/* Right Header Actions: Mode Toggle & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Automation Mode Selector */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '0.25rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <button
                onClick={() => setAutomationMode('autonomous')}
                style={{
                  background: automationMode === 'autonomous' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: automationMode === 'autonomous' ? '#38bdf8' : '#94a3b8',
                  border: automationMode === 'autonomous' ? '1px solid #38bdf8' : 'none',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Continuous 24/7 autonomous rate publication without human touch"
              >
                Auto-Pilot
              </button>
              <button
                onClick={() => setAutomationMode('exception')}
                style={{
                  background: automationMode === 'exception' ? 'rgba(212, 175, 55, 0.25)' : 'transparent',
                  color: automationMode === 'exception' ? 'var(--gold-glow)' : '#94a3b8',
                  border: automationMode === 'exception' ? '1px solid var(--gold-primary)' : 'none',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Pushes automatically until surge pace threshold triggers approval hold"
              >
                Exception-Based (Std)
              </button>
              <button
                onClick={() => setAutomationMode('interactive')}
                style={{
                  background: automationMode === 'interactive' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                  color: automationMode === 'interactive' ? '#c084fc' : '#94a3b8',
                  border: automationMode === 'interactive' ? '1px solid #a855f7' : 'none',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Requires Director 1-click approval for all rate changes"
              >
                Interactive Advisory
              </button>
            </div>

            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Global Metric Ribbon */}
        <div style={{
          background: 'rgba(11, 18, 33, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          padding: '0.55rem 1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          fontSize: '0.78rem'
        }}>
          <div>
            <span style={{ color: '#64748b' }}>Simulated Occupancy:</span>
            <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1rem' }}>
              {simOccupancy}% <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({Math.round((simOccupancy / 100) * 18)}/18 Rms)</span>
            </div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Unconstrained Demand:</span>
            <div style={{ color: unconstrainedData.isConstrained ? '#f59e0b' : '#34d399', fontWeight: 800, fontSize: '1rem' }}>
              {unconstrainedData.unconstrainedDemand} Rooms <span style={{ fontSize: '0.72rem' }}>({unconstrainedData.compressionRatio}x cap)</span>
            </div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Wash / Attrition %:</span>
            <div style={{ color: '#cbd5e1', fontWeight: 800, fontSize: '1rem' }}>
              {unconstrainedData.blendedWashPercent}% <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({unconstrainedData.expectedCancellations} rms)</span>
            </div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Safe Overbooking:</span>
            <div style={{ color: unconstrainedData.authorizedOverbookingRooms > 0 ? '#10b981' : '#94a3b8', fontWeight: 800, fontSize: '1rem' }}>
              +{unconstrainedData.authorizedOverbookingRooms} Room (Max {unconstrainedData.maxSellableInventory})
            </div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Direct Web Net Margin:</span>
            <div style={{ color: 'var(--gold-glow)', fontWeight: 800, fontSize: '1rem' }}>
              97.5% <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>(vs 80% OTA)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#090e1a',
          padding: '0 1.5rem',
          overflowX: 'auto',
          gap: '0.5rem'
        }}>
          {[
            { id: 'yielding', label: '1. Yielding & Micro-Rates', icon: <TrendingUp size={15} /> },
            { id: 'seasonal-rules', label: '2. Seasonal & Festival Rules', icon: <Calendar size={15} /> },
            { id: 'mar', label: '3. Corporate Group MAR', icon: <Calculator size={15} /> },
            { id: 'investigator', label: '4. The Investigator (Explainable AI)', icon: <HelpCircle size={15} /> },
            { id: 'sandbox', label: '5. What-If Scenario Sandbox', icon: <Sliders size={15} /> },
            { id: 'guardrails', label: '6. Rate Guardrails & Comp-Set', icon: <Shield size={15} /> },
            { id: 'netrevpar', label: '7. Net RevPAR & Channels', icon: <Globe size={15} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.85rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: activeTab === tab.id ? 'var(--gold-glow)' : '#94a3b8',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--gold-primary)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#0b1120' }}>
          {/* Authentic Mysoft Universal Date Range Selector Bar (Screenshot Identical) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <UniversalDateFilterBar
              fromDate={rmsFromDate}
              toDate={rmsToDate}
              moduleType="generic"
              auditItems={seasonalRules.map(r => ({
                rule: r.name,
                period: r.period,
                category: r.category,
                surge: `+${((r.multiplier - 1) * 100).toFixed(0)}%`,
                minNights: `${r.minNights} Night(s)`,
                status: r.isActive ? 'Active Surge' : 'Inactive'
              }))}
              columns={[
                { key: 'rule', label: 'PRICING SURGE EVENT' },
                { key: 'period', label: 'AUDIT DATES / SEASON' },
                { key: 'category', label: 'DEMAND CATEGORY' },
                { key: 'surge', label: 'RATE MULTIPLIER', align: 'right' },
                { key: 'minNights', label: 'MIN STAY', align: 'center' },
                { key: 'status', label: 'ENGINE STATUS' }
              ]}
              onDateChange={(from, to) => {
                setRmsFromDate(from);
                setRmsToDate(to);
              }}
              onDisplay={(from, to) => {
                setRmsFromDate(from);
                setRmsToDate(to);
                setIsRmsDateFilterActive(true);
              }}
              title={`REVENUE MANAGEMENT & DYNAMIC YIELDING (${activeTab.toUpperCase()})`}
              totalCount={39}
              totalAmount={46280}
              onExportCSV={() => window.print()}
              onPrint={() => window.print()}
            />
          </div>

          {/* =========================================================================
              TAB 1: CONTINUOUS MICRO-RATE YIELDING ENGINE
             ========================================================================= */}
          {activeTab === 'yielding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Simulation Calibration Controls Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sliders size={18} color="var(--gold-primary)" />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                      Real-Time Demand Calibration & Elasticity Drivers
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer', color: '#cbd5e1' }}>
                      <input 
                        type="checkbox" 
                        checked={isFestivalSurge} 
                        onChange={(e) => setIsFestivalSurge(e.target.checked)} 
                        style={{ accentColor: 'var(--gold-primary)' }}
                      />
                      <span style={{ color: isFestivalSurge ? 'var(--gold-glow)' : 'inherit', fontWeight: isFestivalSurge ? 800 : 400 }}>
                        🕉️ Maa Majhighariani Chaiti Festival / Rath Yatra Compression
                      </span>
                    </label>

                    <button
                      onClick={() => {
                        setSimOccupancy(68);
                        setSimDta(3);
                        setSimVelocity(4);
                        setIsFestivalSurge(false);
                        setCompSetShift(1.04);
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#94a3b8',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  {/* Slider 1: Occupancy */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>Live Occupancy Rate</span>
                      <span style={{ color: '#38bdf8', fontWeight: 800 }}>{simOccupancy}% ({Math.round((simOccupancy / 100) * 18)}/18 rooms)</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      step="5"
                      value={simOccupancy} 
                      onChange={(e) => setSimOccupancy(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#38bdf8' }}
                    />
                  </div>

                  {/* Slider 2: Days to Arrival */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>Days to Arrival (DTA)</span>
                      <span style={{ color: '#f59e0b', fontWeight: 800 }}>{simDta} Days Out</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="30" 
                      step="1"
                      value={simDta} 
                      onChange={(e) => setSimDta(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                  </div>

                  {/* Slider 3: Pickup Velocity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>48h Pickup Velocity</span>
                      <span style={{ color: '#10b981', fontWeight: 800 }}>+{simVelocity} Rooms / 48h</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="12" 
                      step="1"
                      value={simVelocity} 
                      onChange={(e) => setSimVelocity(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                  </div>

                  {/* Slider 4: Competitor Rate Spread */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>Comp-Set Price Index</span>
                      <span style={{ color: 'var(--gold-glow)', fontWeight: 800 }}>
                        {compSetShift >= 1.0 ? `+${Math.round((compSetShift - 1) * 100)}%` : `-${Math.round((1 - compSetShift) * 100)}%`} vs Baseline
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0.85" 
                      max="1.25" 
                      step="0.01"
                      value={compSetShift} 
                      onChange={(e) => setCompSetShift(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
                    />
                  </div>
                </div>
              </div>

              {/* 4-Tier Continuous Micro-Rate Yield Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
                {Object.keys(BASE_ROOM_CONFIG).map(tierKey => {
                  const item = liveMicroRates[tierKey];
                  const obpSingle = calculateObpRates(item.recommendedRate, 1);
                  const obpTriple = calculateObpRates(item.recommendedRate, 3);
                  const isSuite = tierKey === 'executive-room' || tierKey === 'premium-suite';
                  const isSuiteProtected = isSuite && simOccupancy >= 70;

                  return (
                    <div key={tierKey} style={{
                      background: 'linear-gradient(145deg, #111827 0%, #172033 100%)',
                      border: isSuiteProtected ? '1px solid rgba(212, 175, 55, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}>
                      {isSuiteProtected && (
                        <span style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '12px',
                          background: 'linear-gradient(90deg, #d4af37, #b8860b)',
                          color: '#000',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          letterSpacing: '0.05em'
                        }}>
                          SUITE PREMIUM PROTECTION
                        </span>
                      )}

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                            {item.tierName}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#94a3b8',
                            background: 'rgba(255,255,255,0.06)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px'
                          }}>
                            10 Rooms
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', margin: '0.75rem 0' }}>
                          <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--gold-glow)' }}>
                            ₹{item.recommendedRate.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'line-through' }}>
                            ₹{item.baseTariff.toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: item.rateChangeRupees >= 0 ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {item.rateChangeRupees >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {item.rateChangeRupees >= 0 ? `+₹${item.rateChangeRupees}` : `-₹${Math.abs(item.rateChangeRupees)}`} ({item.rateChangePercent}%)
                          </span>
                        </div>

                        {/* Hurdle Rate & Guardrails */}
                        <div style={{
                          background: 'rgba(0,0,0,0.25)',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          fontSize: '0.75rem',
                          marginBottom: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                            <span>Dynamic Hurdle Rate:</span>
                            <span style={{ color: '#f59e0b', fontWeight: 700 }}>₹{item.hurdleRate.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                            <span>Guardrails (Floor / Ceiling):</span>
                            <span>₹{item.rateFloor} – ₹{item.rateCeiling}</span>
                          </div>
                        </div>

                        {/* Occupancy-Based Pricing (OBP) Deltas */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.65rem', fontSize: '0.75rem' }}>
                          <div style={{ color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
                            Occupancy-Based Pricing (OBP):
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
                            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: '4px' }}>
                              <div style={{ color: '#64748b', fontSize: '0.65rem' }}>1 Guest</div>
                              <div style={{ color: '#38bdf8', fontWeight: 700 }}>₹{obpSingle}</div>
                            </div>
                            <div style={{ background: 'rgba(212,175,55,0.1)', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.3)' }}>
                              <div style={{ color: 'var(--gold-glow)', fontSize: '0.65rem' }}>2 Guests</div>
                              <div style={{ color: '#f8fafc', fontWeight: 700 }}>₹{item.recommendedRate}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: '4px' }}>
                              <div style={{ color: '#64748b', fontSize: '0.65rem' }}>3 Guests</div>
                              <div style={{ color: '#34d399', fontWeight: 700 }}>₹{obpTriple}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Publish Action Bar */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(16, 24, 39, 0.9), rgba(30, 41, 59, 0.9))',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '12px',
                padding: '1.1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
                    ⚡ One-Click Dynamic Rate Broadcasting (HTNG API Specification)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Transmits continuous micro-rates instantly to Direct Web Engine, Reception Admin, and CRS.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {publishedToast && (
                    <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={16} /> Rates Successfully Broadcasted to Booking Engine!
                    </span>
                  )}

                  <button
                    onClick={handlePublishAll}
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #996515)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.65rem 1.4rem',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <Zap size={16} /> Publish Rates to Live Booking Engine & PMS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: QLOAPPS & IDS NEXT SEASONAL PRICE RULES & FESTIVAL MULTIPLIERS
             ========================================================================= */}
          {activeTab === 'seasonal-rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Header Banner */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #d4af37, #996515)',
                      color: '#060e1a',
                      padding: '0.4rem',
                      borderRadius: '8px'
                    }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
                        Seasonal Calendar Rate Rules &amp; Regional Event Engine
                      </h3>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                        QloApps &amp; IDS Next Protocol • Automated date-locked rate multipliers, minimum stay (MLOS) restrictions, and pilgrim demand capture.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                      ✓ {seasonalRules.filter(r => r.isActive).length} Active Rules
                    </div>
                    <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', color: 'var(--gold-glow)', fontWeight: 700 }}>
                      Peak Surge: +40%
                    </div>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Multiplier Range</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>0.90x ~ 1.40x</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Discount incentives to peak compression</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Projected Peak Season ADR</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold-glow)', marginTop: '2px' }}>₹3,849.00</div>
                    <div style={{ fontSize: '0.7rem', color: '#34d399' }}>+47.0% above baseline ₹2,618</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Peak Occ Compression</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>96.5%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chaitra Yatra &amp; Puja season</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Estimated RevPAR Gain</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#a855f7', marginTop: '2px' }}>+₹840 / Room</div>
                    <div style={{ fontSize: '0.7rem', color: '#c084fc' }}>Incremental margin capture</div>
                  </div>
                </div>
              </div>

              {/* Rules Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {seasonalRules.map(rule => {
                  const isSurge = rule.multiplier >= 1.0;
                  const pct = Math.round((rule.multiplier - 1.0) * 100);

                  return (
                    <div
                      key={rule.id}
                      style={{
                        background: rule.isActive ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.35)',
                        border: rule.isActive 
                          ? (isSurge ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(56, 189, 248, 0.35)') 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        transition: 'all 0.2s ease',
                        opacity: rule.isActive ? 1 : 0.65
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 700 }}>
                              {rule.name}
                            </h4>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.06)',
                              color: '#cbd5e1',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                              {rule.category}
                            </span>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: isSurge ? 'rgba(212, 175, 55, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: isSurge ? 'var(--gold-glow)' : '#38bdf8',
                              fontWeight: 700
                            }}>
                              {pct >= 0 ? `+${pct}% Surge (${rule.multiplier}x)` : `${pct}% Discount (${rule.multiplier}x)`}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                            📅 <strong>Calendar Window:</strong> {rule.period} • <strong>Min Stay:</strong> {rule.minNights} Night{rule.minNights > 1 ? 's' : ''} • <strong>Scope:</strong> {rule.appliedTiers}
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleSeasonalRule(rule.id)}
                          style={{
                            padding: '0.45rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: rule.isActive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: rule.isActive ? '#34d399' : '#94a3b8',
                            border: rule.isActive ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          {rule.isActive ? '✓ Rule Active' : '○ Inactive'}
                        </button>
                      </div>

                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                        {rule.description}
                      </p>

                      {/* Live Tier Tariff Impact Comparison Bar */}
                      <div style={{
                        background: 'rgba(6, 14, 26, 0.8)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>
                          Projected Dynamic Room Tariff Impact:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.75rem' }}>
                          <div>
                            <span style={{ color: '#94a3b8' }}>Standard Deluxe:</span>
                            <div style={{ fontWeight: 700, color: rule.isActive ? 'var(--gold-glow)' : '#cbd5e1' }}>
                              ₹{Math.round(1999 * rule.multiplier).toLocaleString()} <span style={{ fontSize: '0.65rem', color: '#64748b' }}>(Base ₹1,999)</span>
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#94a3b8' }}>Deluxe Room:</span>
                            <div style={{ fontWeight: 700, color: rule.isActive ? 'var(--gold-glow)' : '#cbd5e1' }}>
                              ₹{Math.round(2499 * rule.multiplier).toLocaleString()} <span style={{ fontSize: '0.65rem', color: '#64748b' }}>(Base ₹2,499)</span>
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#94a3b8' }}>Executive Room:</span>
                            <div style={{ fontWeight: 700, color: rule.isActive ? 'var(--gold-glow)' : '#cbd5e1' }}>
                              ₹{Math.round(3499 * rule.multiplier).toLocaleString()} <span style={{ fontSize: '0.65rem', color: '#64748b' }}>(Base ₹3,499)</span>
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#94a3b8' }}>Premium Suite:</span>
                            <div style={{ fontWeight: 700, color: rule.isActive ? 'var(--gold-glow)' : '#cbd5e1' }}>
                              ₹{Math.round(5999 * rule.multiplier).toLocaleString()} <span style={{ fontSize: '0.65rem', color: '#64748b' }}>(Base ₹5,999)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Button: Apply to Simulation */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--gold-glow)', fontWeight: 700 }}>
                    Synchronize Rules with Active Micro-Rate Yield Simulator
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Push seasonal multipliers into Tab 1 (Yielding &amp; Micro-Rates) and simulate peak occupancy compression.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsFestivalSurge(true);
                    setSimOccupancy(92);
                    setSimVelocity(7);
                    setActiveTab('yielding');
                  }}
                  className="btn-primary-gold"
                  style={{ padding: '0.6rem 1.3rem', fontSize: '0.82rem', fontWeight: 800 }}
                >
                  Apply Chaitra Yatra Multiplier (+40%) &amp; View Rates →
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: CORPORATE GROUP DISPLACEMENT & MAR CALCULATOR
             ========================================================================= */}
          {activeTab === 'mar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Calculator size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
                    Corporate Group Minimum Acceptable Rate (MAR) Engine
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Evaluate group blocks for Rayagada industrial partners (JK Paper, IMFA, Utkal Alumina, ECoR). Calculates whether committing rooms displaces higher-paying transient or pilgrim guests, factoring in Cannon Kitchen banquet offsets.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
                {/* Left Column: RFP Inputs */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--gold-glow)', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                    📝 Corporate RFP Parameters
                  </div>

                  {/* Corporate Client Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                      Corporate Partner Client
                    </label>
                    <select
                      value={selectedCorporateId}
                      onChange={(e) => setSelectedCorporateId(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#090e1a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#f8fafc',
                        padding: '0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    >
                      {CORPORATE_PARTNERS.map(corp => (
                        <option key={corp.id} value={corp.id}>
                          {corp.name} ({corp.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rooms & Nights */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                        Requested Rooms (Max 25)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        value={rfpRooms}
                        onChange={(e) => setRfpRooms(Number(e.target.value))}
                        style={{
                          width: '100%',
                          background: '#090e1a',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#f8fafc',
                          padding: '0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                        Length of Stay (Nights)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={rfpNights}
                        onChange={(e) => setRfpNights(Number(e.target.value))}
                        style={{
                          width: '100%',
                          background: '#090e1a',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#f8fafc',
                          padding: '0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Offered Rate & Room Tier */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                        Offered Rate / Night (₹)
                      </label>
                      <input
                        type="number"
                        step="50"
                        value={rfpOfferedRate}
                        onChange={(e) => setRfpOfferedRate(Number(e.target.value))}
                        style={{
                          width: '100%',
                          background: '#090e1a',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#f8fafc',
                          padding: '0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                        Room Tier Requested
                      </label>
                      <select
                        value={rfpRoomTier}
                        onChange={(e) => setRfpRoomTier(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#090e1a',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#f8fafc',
                          padding: '0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="standard-deluxe">Standard Deluxe</option>
                        <option value="deluxe-room">Deluxe Room</option>
                        <option value="executive-room">Executive Room</option>
                        <option value="premium-suite">Premium Suite</option>
                      </select>
                    </div>
                  </div>

                  {/* Hotel Projected Occupancy During Dates */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>Hotel Projected Occupancy During Period</span>
                      <span style={{ color: '#38bdf8', fontWeight: 800 }}>{rfpHotelOcc}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={rfpHotelOcc}
                      onChange={(e) => setRfpHotelOcc(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#38bdf8' }}
                    />
                  </div>

                  {/* Ancillary Spend Offsets */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                        Banquet F&B Spend (₹)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={rfpBanquetSpend}
                        onChange={(e) => setRfpBanquetSpend(Number(e.target.value))}
                        style={{
                          width: '100%',
                          background: '#090e1a',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#f8fafc',
                          padding: '0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                        Conference Hall Rental (₹)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={rfpHallRental}
                        onChange={(e) => setRfpHallRental(Number(e.target.value))}
                        style={{
                          width: '100%',
                          background: '#090e1a',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#f8fafc',
                          padding: '0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Algorithmic MAR Verdict & Financial Decomposition */}
                <div style={{
                  background: 'linear-gradient(145deg, #111827 0%, #17223b 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8' }}>
                        IDeaS G3 ALGORITHMIC VERDICT
                      </span>
                      <span style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: marResult.recommendationBadge === 'success' ? 'rgba(16, 185, 129, 0.25)' :
                                   marResult.recommendationBadge === 'warning' ? 'rgba(245, 158, 11, 0.25)' :
                                   marResult.recommendationBadge === 'negotiate' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                        color: marResult.recommendationBadge === 'success' ? '#34d399' :
                               marResult.recommendationBadge === 'warning' ? '#fbbf24' :
                               marResult.recommendationBadge === 'negotiate' ? '#c084fc' : '#f87171',
                        border: '1px solid currentColor'
                      }}>
                        {marResult.verdict}
                      </span>
                    </div>

                    {/* MAR Large Display */}
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Calculated Minimum Acceptable Rate (MAR)
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--gold-glow)', margin: '0.25rem 0' }}>
                        ₹{marResult.minimumAcceptableRate.toLocaleString()}
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}> / room night</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: marResult.breakevenGapPerNight >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                        {marResult.breakevenGapPerNight >= 0 
                          ? `✓ Offered rate has +₹${marResult.breakevenGapPerNight} profit cushion above MAR`
                          : `⚠ Offered rate is ₹${Math.abs(marResult.breakevenGapPerNight)} below breakeven threshold`}
                      </div>
                    </div>

                    {/* Displacement Equation Waterfall */}
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Total Group Room Nights:</span>
                        <span style={{ fontWeight: 700 }}>{marResult.totalGroupRoomNights} nights ({rfpRooms} rms × {rfpNights} nts)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Displaced Transient Rooms / Night:</span>
                        <span style={{ fontWeight: 700, color: '#f59e0b' }}>{marResult.displacedRoomsPerNight} rooms / night</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Displaced Net Transient Profit Lost:</span>
                        <span style={{ fontWeight: 700, color: '#ef4444' }}>-₹{marResult.netTransientProfitLost.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Ancillary F&B & Hall Rental Offset Profit:</span>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>+₹{marResult.ancillaryProfitContribution.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.45rem' }}>
                        <span style={{ color: '#f8fafc', fontWeight: 800 }}>Net Bottom-Line Impact:</span>
                        <span style={{
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          color: marResult.netEconomicGainLoss >= 0 ? '#34d399' : '#f87171'
                        }}>
                          {marResult.netEconomicGainLoss >= 0 ? '+' : ''}₹{marResult.netEconomicGainLoss.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Explanatory Reasoning */}
                    <div style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.75rem',
                      color: '#e2e8f0',
                      lineHeight: '1.4'
                    }}>
                      {marResult.reasoning}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={handleSaveRfp}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #d4af37, #996515)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.65rem',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Check size={14} /> Record in RFP Audit Ledger
                    </button>
                    <button
                      onClick={() => alert(`✓ Official Corporate Quotation for ${marResult.companyName} generated!\nQuoted Rate: ₹${Math.max(rfpOfferedRate, marResult.minimumAcceptableRate)}/night.\nIncludes free High-Speed Enterprise Wi-Fi & Station Transit.`)}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#e2e8f0',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <FileText size={14} /> Print Quote
                    </button>
                  </div>
                </div>
              </div>

              {/* Saved RFP Evaluations Log */}
              {savedRfps.length > 0 && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    📋 Evaluated RFPs History (Audit Trail)
                  </div>
                  <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '0.5rem' }}><SheetsColumnHeader label="RFP ID" type="locked" /></th>
                          <th style={{ padding: '0.5rem' }}><SheetsColumnHeader label="Corporate Partner" type="locked" /></th>
                          <th style={{ padding: '0.5rem' }}><SheetsColumnHeader label="Rooms/Nights" type="locked" /></th>
                          <th style={{ padding: '0.5rem' }}><SheetsColumnHeader label="Offered Rate" type="editable" /></th>
                          <th style={{ padding: '0.5rem' }}><SheetsColumnHeader label="Breakeven MAR" type="locked" /></th>
                          <th style={{ padding: '0.5rem' }}><SheetsColumnHeader label="Net Impact" type="formula" /></th>
                          <th style={{ padding: '0.5rem' }}><SheetsColumnHeader label="Verdict" type="locked" /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {savedRfps.map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: 'var(--gold-glow)' }}>{r.id}</td>
                            <td style={{ padding: '0.5rem', fontWeight: 700 }}>{r.companyName}</td>
                            <td style={{ padding: '0.5rem' }}>{r.rooms} rms × {r.nights} nts</td>
                            <SheetsEditableCell
                              value={r.offeredRate}
                              type="number"
                              cellStyle={{ padding: '0.5rem' }}
                              onSave={(newVal) => {
                                const rateVal = parseFloat(newVal) || 0;
                                setSavedRfps(prev => prev.map(rec => {
                                  if (rec.id === r.id) {
                                    const netGain = (rateVal - rec.mar) * rec.rooms * rec.nights;
                                    return {
                                      ...rec,
                                      offeredRate: rateVal,
                                      netGain,
                                      verdict: rateVal >= rec.mar ? 'RECOMMENDED ACCEPT' : 'REJECT / COUNTER-OFFER'
                                    };
                                  }
                                  return rec;
                                }));
                              }}
                            />
                            <td style={{ padding: '0.5rem', fontWeight: 700, color: 'var(--gold-glow)' }}>₹{r.mar}</td>
                            <td style={{ padding: '0.5rem', color: r.netGain >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                              {r.netGain >= 0 ? '+' : ''}₹{r.netGain}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <span style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                background: r.netGain >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                color: r.netGain >= 0 ? '#34d399' : '#f87171'
                              }}>
                                {r.verdict}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 3: "THE INVESTIGATOR" - EXPLAINABLE AI REVENUE ATTRIBUTION
             ========================================================================= */}
          {activeTab === 'investigator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <HelpCircle size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
                    The Investigator: Explainable AI Price Decomposition
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Solves the hospitality "black box" dilemma. Deconstructs the exact mathematical attributions (pickup pacing, comp-set rate movement, days-to-arrival curve) behind every single rate recommendation.
                </p>
              </div>

              {/* Selector Controls: Date Horizon & Room Tier */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                background: 'rgba(15, 23, 42, 0.65)',
                padding: '1rem',
                borderRadius: '10px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Room Class Tier
                  </label>
                  <select
                    value={investigatorTier}
                    onChange={(e) => setInvestigatorTier(e.target.value)}
                    style={{
                      background: '#090e1a',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#f8fafc',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="standard-deluxe">Standard Deluxe (Fl 1)</option>
                    <option value="deluxe-room">Deluxe Room (Fl 2)</option>
                    <option value="executive-room">Executive Room (Fl 3)</option>
                    <option value="premium-suite">Premium Suite (Fl 4)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Stay Target Horizon
                  </label>
                  <select
                    value={investigatorDate}
                    onChange={(e) => setInvestigatorDate(e.target.value)}
                    style={{
                      background: '#090e1a',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#f8fafc',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="2026-09-22">Today (DTA 0 - High Compression)</option>
                    <option value="2026-09-24">This Weekend (DTA 2 - Corporate Transit)</option>
                    <option value="2026-10-02">Maa Majhighariani Chaiti Festival (DTA 10)</option>
                    <option value="2026-10-20">Rath Yatra Regional Concourse (DTA 28)</option>
                    <option value="2026-11-15">JK Paper Plant Maintenance Turnaround (DTA 54)</option>
                  </select>
                </div>

                {/* Forecast Confidence Meter */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Statistical Confidence</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399' }}>
                      {investigatorResult.confidencePercent}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>RMSE Standard Error</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8' }}>
                      ±{investigatorResult.rmseStandardError} rms
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribution Waterfall Visualizer */}
              <div style={{
                background: 'linear-gradient(145deg, #111827 0%, #172033 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                      Yield Recommendation Waterfall Breakdown
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {investigatorResult.tierName} for {investigatorResult.targetDate}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Yield Rate: </span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gold-glow)' }}>
                      ₹{investigatorResult.recommendedRate.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {investigatorResult.attributionWaterfall.map((step, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.85rem 1.1rem',
                      borderRadius: '8px',
                      borderLeft: step.type === 'base' ? '4px solid #64748b' : '4px solid #10b981'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                          {step.factor}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {step.description}
                        </div>
                      </div>

                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: step.type === 'base' ? '#cbd5e1' : '#34d399' }}>
                        {step.type === 'base' ? `₹${step.amount.toLocaleString()}` : `+₹${step.amount.toLocaleString()}`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Narrative Summary */}
                <div style={{
                  marginTop: '1.25rem',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.82rem',
                  color: '#e2e8f0',
                  lineHeight: '1.5'
                }}>
                  <strong style={{ color: 'var(--gold-glow)' }}>Executive Diagnostic Narrative: </strong>
                  {investigatorResult.narrative}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: WHAT-IF SCENARIO SANDBOX (DIGITAL TWIN SIMULATION)
             ========================================================================= */}
          {activeTab === 'sandbox' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Sliders size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
                    What-If Strategic Sandbox: Risk-Free Digital Twin Simulation
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Model macro scenarios in a virtual digital twin environment without altering live public rates. Test room renovation offline capacity, rival price cuts, and pilgrimage demand spikes.
                </p>
              </div>

              {/* Scenario Selection Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <button
                  onClick={() => setSandboxScenario('renovation')}
                  style={{
                    background: sandboxScenario === 'renovation' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: sandboxScenario === 'renovation' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#f8fafc'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: sandboxScenario === 'renovation' ? '#38bdf8' : 'inherit', marginBottom: '0.25rem' }}>
                    🔨 1. Renovation Modeling
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Take 4 to 12 rooms offline for floor remodeling. Computes compression lift and RevPAR impact.
                  </div>
                </button>

                <button
                  onClick={() => setSandboxScenario('competitor_price_war')}
                  style={{
                    background: sandboxScenario === 'competitor_price_war' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: sandboxScenario === 'competitor_price_war' ? '2px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#f8fafc'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: sandboxScenario === 'competitor_price_war' ? 'var(--gold-glow)' : 'inherit', marginBottom: '0.25rem' }}>
                    ⚔️ 2. Competitor Price Warfare
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Hotel Tejasvi slashes rates by 20%. Predicts market deflection and recommends response.
                  </div>
                </button>

                <button
                  onClick={() => setSandboxScenario('festival')}
                  style={{
                    background: sandboxScenario === 'festival' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: sandboxScenario === 'festival' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#f8fafc'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: sandboxScenario === 'festival' ? '#c084fc' : 'inherit', marginBottom: '0.25rem' }}>
                    🕉️ 3. Chaiti Festival Surge (2.5x)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Simulate 250% pilgrim surge. Calculates optimal MinLOS=2 and OTA inventory shutdown.
                  </div>
                </button>
              </div>

              {/* Dynamic Interactive Slider for the chosen scenario */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                {sandboxScenario === 'renovation' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>Rooms Taken Offline for Renovation:</span>
                      <span style={{ color: '#38bdf8', fontWeight: 800 }}>{sandboxOfflineRooms} Rooms ({18 - sandboxOfflineRooms} Active Sellable)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="9"
                      step="1"
                      value={sandboxOfflineRooms}
                      onChange={(e) => setSandboxOfflineRooms(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#38bdf8' }}
                    />
                  </div>
                )}

                {sandboxScenario === 'competitor_price_war' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>Competitor (Hotel Tejasvi) Tariff Shift:</span>
                      <span style={{ color: 'var(--gold-glow)', fontWeight: 800 }}>{sandboxCompPriceChange > 0 ? `+${sandboxCompPriceChange}%` : `${sandboxCompPriceChange}%`}</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="5"
                      value={sandboxCompPriceChange}
                      onChange={(e) => setSandboxCompPriceChange(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
                    />
                  </div>
                )}

                {sandboxScenario === 'festival' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>Pilgrim Demand Shock Multiplier:</span>
                      <span style={{ color: '#c084fc', fontWeight: 800 }}>{sandboxDemandShock}x Unconstrained Demand</span>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="4.0"
                      step="0.25"
                      value={sandboxDemandShock}
                      onChange={(e) => setSandboxDemandShock(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#a855f7' }}
                    />
                  </div>
                )}
              </div>

              {/* Sandbox Projection Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Projected Occupancy</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', margin: '0.25rem 0' }}>
                    {sandboxResult.projectedOccupancy}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>vs 68% baseline</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Projected ADR</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold-glow)', margin: '0.25rem 0' }}>
                    ₹{sandboxResult.projectedADR.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>vs ₹2,280 baseline</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Projected RevPAR</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '0.25rem 0' }}>
                    ₹{sandboxResult.projectedRevPAR.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: sandboxResult.revparChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
                    {sandboxResult.revparChangePercent >= 0 ? '+' : ''}{sandboxResult.revparChangePercent}% vs baseline
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Net Period Revenue Impact</div>
                  <div style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    color: sandboxResult.monthlyRevenueImpact >= 0 ? '#34d399' : '#f87171',
                    margin: '0.25rem 0'
                  }}>
                    {sandboxResult.monthlyRevenueImpact >= 0 ? '+' : ''}₹{sandboxResult.monthlyRevenueImpact.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Bottom-line turnover</div>
                </div>
              </div>

              {/* Strategic Executive Recommendation Box */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(15, 23, 42, 0.95))',
                border: '1px solid var(--gold-primary)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={18} color="var(--gold-glow)" />
                  <span style={{ fontWeight: 800, color: 'var(--gold-glow)', fontSize: '0.95rem' }}>
                    Strategic Commercial Recommendation:
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', lineHeight: '1.5' }}>
                  {sandboxResult.recommendation}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: RATE GUARDRAILS, HURDLE RATES & OVERBOOKING MATRIX
             ========================================================================= */}
          {activeTab === 'guardrails' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Shield size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
                    Strategic Rate Guardrails & Competitor Comp-Set Matrix
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Enforces strict minimum floors (protecting brand prestige and operating costs) and ceilings. Establishes automatic competitor peg rules (+8% above Rayagada comp-set).
                </p>
              </div>

              {/* Rayagada Local Competitor Comp-Set Table */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem' }}>
                    🏨 Rayagada Primary Competitor Comp-Set (Real-Time Rate Shopper)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gold-glow)', fontWeight: 700 }}>
                    Active Rule: {HOTEL_CONFIG.name} = Comp-Set Benchmark + {compSetPegPercent}%
                  </div>
                </div>

                <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '0.65rem' }}><SheetsColumnHeader label="Property Name" type="locked" /></th>
                        <th style={{ padding: '0.65rem', textAlign: 'right' }}><SheetsColumnHeader label="Standard Rate" type="editable" align="right" /></th>
                        <th style={{ padding: '0.65rem', textAlign: 'right' }}><SheetsColumnHeader label="Executive Rate" type="editable" align="right" /></th>
                        <th style={{ padding: '0.65rem', textAlign: 'center' }}><SheetsColumnHeader label="Est. Occupancy" type="editable" align="center" /></th>
                        <th style={{ padding: '0.65rem' }}><SheetsColumnHeader label="Comp Weight" type="locked" /></th>
                        <th style={{ padding: '0.65rem' }}><SheetsColumnHeader label="HSI Spread Target" type="formula" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {compSetList.map(comp => (
                        <tr key={comp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.65rem', fontWeight: 700, color: '#f8fafc' }}>{comp.name}</td>
                          <SheetsEditableCell
                            value={comp.standardRate}
                            type="currency"
                            align="right"
                            min={0}
                            cellStyle={{ padding: '0.65rem', color: '#38bdf8' }}
                            onSave={(newVal) => setCompSetList(prev => prev.map(c => c.id === comp.id ? { ...c, standardRate: Number(newVal) } : c))}
                          />
                          <SheetsEditableCell
                            value={comp.executiveRate}
                            type="currency"
                            align="right"
                            min={0}
                            cellStyle={{ padding: '0.65rem', color: '#38bdf8' }}
                            onSave={(newVal) => setCompSetList(prev => prev.map(c => c.id === comp.id ? { ...c, executiveRate: Number(newVal) } : c))}
                          />
                          <SheetsEditableCell
                            value={comp.occupancyEst}
                            type="number"
                            align="center"
                            min={0}
                            max={100}
                            suffix="%"
                            cellStyle={{ padding: '0.65rem' }}
                            onSave={(newVal) => setCompSetList(prev => prev.map(c => c.id === comp.id ? { ...c, occupancyEst: Number(newVal) } : c))}
                          />
                          <td style={{ padding: '0.65rem', color: '#94a3b8' }}>{(comp.weight * 100)}%</td>
                          <td style={{ padding: '0.65rem', color: 'var(--gold-glow)', fontWeight: 700 }}>
                            ₹{Math.round(comp.standardRate * (1 + compSetPegPercent / 100))} (+{compSetPegPercent}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rate Floor & Ceiling Guardrail Editor */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem', marginBottom: '0.85rem' }}>
                  🔒 Room Tier Strategic Rate Floors & Ceilings (Hard Guardrails)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {Object.keys(guardrails).map(tierKey => {
                    const cfg = BASE_ROOM_CONFIG[tierKey];
                    return (
                      <div key={tierKey} style={{
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
                          {cfg.name}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#ef4444', marginBottom: '0.25rem' }}>
                              Hard Floor (₹)
                            </label>
                            <input
                              type="number"
                              value={guardrails[tierKey].floor}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setGuardrails(prev => ({
                                  ...prev,
                                  [tierKey]: { ...prev[tierKey], floor: val }
                                }));
                              }}
                              style={{
                                width: '100%',
                                background: '#090e1a',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#f8fafc',
                                padding: '0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#10b981', marginBottom: '0.25rem' }}>
                              Ceiling (₹)
                            </label>
                            <input
                              type="number"
                              value={guardrails[tierKey].ceiling}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setGuardrails(prev => ({
                                  ...prev,
                                  [tierKey]: { ...prev[tierKey], ceiling: val }
                                }));
                              }}
                              style={{
                                width: '100%',
                                background: '#090e1a',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                color: '#f8fafc',
                                padding: '0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => alert("✓ Strategic Rate Floors & Ceilings saved! Algorithm cannot violate these boundaries under any condition.")}
                    style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      border: '1px solid var(--gold-primary)',
                      color: 'var(--gold-glow)',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Save Rate Boundaries
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: NET REVPAR & DIRECT CHANNEL OPTIMIZATION
             ========================================================================= */}
          {activeTab === 'netrevpar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Globe size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
                    Net RevPAR & Direct Channel Profit Optimization
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Shifts focus from top-line gross turnover to bottom-line net profit. Compares direct portal net margin (97.5%) against high OTA commission erosion (18%–22%), and triggers algorithmic OTA inventory throttling.
                </p>
              </div>

              {/* 3 Channel Net Yield Matrix Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* Channel 1: Direct Web Portal */}
                <div style={{
                  background: 'linear-gradient(145deg, #091f1a 0%, #0d2822 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                      🌐 Direct Web Portal & UPI
                    </span>
                    <span style={{
                      background: 'rgba(52, 211, 153, 0.2)',
                      color: '#34d399',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      97.5% NET MARGIN
                    </span>
                  </div>

                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', margin: '0.5rem 0' }}>
                    ₹{netRevPARData.direct.netADR} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Net ADR</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Acquisition Deduction:</span>
                      <span>2.5% (Payment Gateway fee)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Rooms Sold (Simulated):</span>
                      <span style={{ fontWeight: 700 }}>{netRevPARData.direct.rooms} rooms</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Net Revenue Retained:</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>₹{(netRevPARData.direct.gross - netRevPARData.direct.fee).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Channel 2: OTAs (MakeMyTrip / Agoda) */}
                <div style={{
                  background: 'linear-gradient(145deg, #261111 0%, #331616 100%)',
                  border: '1px solid rgba(248, 113, 113, 0.4)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: '#f87171', fontSize: '0.95rem' }}>
                      🏨 Online Travel Agencies (OTAs)
                    </span>
                    <span style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      80.0% NET MARGIN
                    </span>
                  </div>

                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', margin: '0.5rem 0' }}>
                    ₹{netRevPARData.ota.netADR} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Net ADR</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>OTA Commission Erosion:</span>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>-20% per booking</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Rooms Sold (Simulated):</span>
                      <span style={{ fontWeight: 700 }}>{netRevPARData.ota.rooms} rooms</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Commission Lost to Intermediary:</span>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>-₹{netRevPARData.ota.commissionErosion.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Channel 3: Corporate Direct Contracts */}
                <div style={{
                  background: 'linear-gradient(145deg, #181928 0%, #1f2138 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: '#c084fc', fontSize: '0.95rem' }}>
                      🏢 Corporate Contracts (JK/IMFA)
                    </span>
                    <span style={{
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#c084fc',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      88.0% NET MARGIN
                    </span>
                  </div>

                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', margin: '0.5rem 0' }}>
                    ₹{netRevPARData.corporate.netADR} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Net ADR</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Contractual Discount / Admin:</span>
                      <span>12.0%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Rooms Sold (Simulated):</span>
                      <span style={{ fontWeight: 700 }}>{netRevPARData.corporate.rooms} rooms</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Direct B2B Folio Invoiced:</span>
                      <span style={{ color: '#c084fc', fontWeight: 700 }}>₹{netRevPARData.corporate.gross.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Booking Profit Opportunity Calculator */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(15, 23, 42, 0.9))',
                border: '1px solid var(--gold-primary)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', fontWeight: 800 }}>
                    💰 DIRECT CONVERSION VALUE CAPTURE
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc', margin: '0.25rem 0' }}>
                    Converting 50% of OTA bookings to Direct Web Portal saves:
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    By offering perks like complimentary railway station transit and 10% Cannon Kitchen vouchers instead of paying 20% OTA commission.
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399' }}>
                    +₹{netRevPARData.monthlyCommissionSavings.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>net profit saved / month</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
