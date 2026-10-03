import React, { useState, useEffect } from 'react';
import { 
  Scale, Hotel, Phone, Clock, Layers, Utensils, Compass, Bot, 
  ShieldCheck, Lock, Sparkles, Building2, Menu, X, ShoppingBag, 
  MapPin, CheckCircle2, FileText, MessageCircle, LogOut, Database
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpen3DExplorer,
  onOpenVirtualTour,
  onOpenDining,
  onOpenDarshan,
  onOpenAiConcierge,
  onOpenBotFleet,
  onOpenCorporate,
  onOpenMasterFolio,
  onOpenCannonKitchenPOS,
  onOpenAccountsLedger,
  onOpenNightAudit,
  onOpenStoreInventory,
  onOpenDirectorPortal,
  onOpenRevenueManagement,
  onOpenD1Database,
  onOpenCaFilingStation,
  cartCount = 0,
  rooms = [],
  adminPinVerified,
  setAdminPinVerified,
  showPinPrompt: propShowPinPrompt,
  setShowPinPrompt: propSetShowPinPrompt
}) {
  const [timeString, setTimeString] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalShowPinPrompt, setInternalShowPinPrompt] = useState(false);
  const showPinPrompt = propShowPinPrompt !== undefined ? propShowPinPrompt : internalShowPinPrompt;
  const setShowPinPrompt = propSetShowPinPrompt !== undefined ? propSetShowPinPrompt : setInternalShowPinPrompt;
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [scrollPercent, setScrollPercent] = useState(0);

  // Global Escape key listener: Instant return from PMS to guest website
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && currentView === 'pms') {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        const isEditable = document.activeElement && (document.activeElement.isContentEditable || activeTag === 'input' || activeTag === 'textarea');
        const hasOpenModal = document.querySelector('.official-invoice-overlay, .modal-overlay, .pos-settle-overlay');
        if (!isEditable && !hasOpenModal) {
          setCurrentView('guest');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, setCurrentView]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdminAccess = () => {
    const hasPin = adminPinVerified || localStorage.getItem('hsi_admin_pin') === '7650' || sessionStorage.getItem('hsi_admin_pin') === '7650';
    if (hasPin) {
      if (!adminPinVerified) setAdminPinVerified(true);
      setCurrentView(currentView === 'pms' ? 'guest' : 'pms');
    } else {
      setShowPinPrompt(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hsi_admin_pin');
    localStorage.removeItem('hsi_admin_pin');
    setAdminPinVerified(false);
    setCurrentView('guest');
  };

  const verifyPin = async (e, directPin) => {
    if (e && e.preventDefault) e.preventDefault();
    const pin = (directPin || enteredPin || '').trim();
    if (!pin) {
      setPinError('Please enter the administrative security PIN.');
      return;
    }

    const defaultStaffPin = '7650';
    const validLocalPin = sessionStorage.getItem('hsi_admin_pin') || localStorage.getItem('hsi_admin_pin') || defaultStaffPin;

    try {
      const res = await fetch('/api/sync', {
        headers: { 'X-Admin-Key': pin }
      });
      const data = await res.json().catch(() => null);
      if (data && data.isAdmin) {
        sessionStorage.setItem('hsi_admin_pin', pin);
        localStorage.setItem('hsi_admin_pin', pin);
        setAdminPinVerified(true);
        setShowPinPrompt(false);
        setPinError('');
        setEnteredPin('');
        setCurrentView('pms');
        return;
      } else if (pin === validLocalPin || pin === defaultStaffPin) {
        // Fallback for duty staff authorization
        sessionStorage.setItem('hsi_admin_pin', pin);
        localStorage.setItem('hsi_admin_pin', pin);
        setAdminPinVerified(true);
        setShowPinPrompt(false);
        setPinError('');
        setEnteredPin('');
        setCurrentView('pms');
        return;
      } else {
        setPinError('Invalid Security PIN. Authorization Denied.');
      }
    } catch {
      if (pin === validLocalPin || pin === defaultStaffPin) {
        sessionStorage.setItem('hsi_admin_pin', pin);
        localStorage.setItem('hsi_admin_pin', pin);
        setAdminPinVerified(true);
        setShowPinPrompt(false);
        setPinError('');
        setEnteredPin('');
        setCurrentView('pms');
      } else {
        setPinError('Invalid Security PIN. Access Denied.');
      }
    }
  };

  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
  const availableCount = rooms.filter(r => r.status === 'Available').length;

  return (
    <>
      {/* Top Viewport Scroll Progress Line */}
      <div className="scroll-progress-line" style={{ width: `${scrollPercent}%` }} />

      {/* Top Statutory & Proximity Announcement Bar */}
      <div className="navbar-top-strip" style={{
        background: 'linear-gradient(90deg, #0c182b 0%, #13223d 50%, #0c182b 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        padding: '0.4rem 1rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gold-glow)' }}>
            <MapPin size={13} /> {HOTEL_CONFIG.distanceStation} | {HOTEL_CONFIG.distanceTemple}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={13} color="#38bdf8" /> 24-Hr Desk: {HOTEL_CONFIG.landline}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <a 
            href={`https://wa.me/917978043585?text=Hello%20${encodeURIComponent(HOTEL_CONFIG.name)}%20Front%20Desk,%20I%20would%20like%20to%20inquire%20about%20a%20booking`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              color: '#4ade80', 
              textDecoration: 'none',
              fontWeight: 700
            }}
            title="Chat with Front Desk on WhatsApp"
          >
            <MessageCircle size={13} color="#4ade80" /> WhatsApp Desk: +91 79780 43585
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ color: 'var(--gold-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
            GSTIN: {HOTEL_CONFIG.gstin}
          </span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>
            ● IST: {timeString}
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span className="badge-status badge-available">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
              {availableCount} Available
            </span>
            <span className="badge-status badge-occupied">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
              {occupiedCount} Occupied
            </span>
          </div>
        </div>
      </div>

      {/* IDS Next Enterprise Operational Quick Bar (For Owner & Consultant Audit) */}
      <div className="navbar-erp-quickbar" style={{
        background: 'linear-gradient(90deg, rgba(8,12,24,0.98), rgba(18,24,44,0.98))',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        padding: '0.4rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        maxWidth: '100vw',
        width: '100%',
        boxSizing: 'border-box',
        gap: '0.5rem',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'nowrap' }}>
          <span style={{
            fontSize: '0.7rem',
            background: 'rgba(212, 175, 55, 0.25)',
            color: 'var(--gold-glow)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            fontWeight: 800,
            border: '1px solid var(--gold-primary)'
          }}>
            IDS NEXT ERP
          </span>

          <button
            onClick={onOpenMasterFolio}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(96, 165, 250, 0.18)',
              border: '1px solid rgba(96, 165, 250, 0.4)',
              color: '#60a5fa',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            📄 Primary Folio (1-17 Actions)
          </button>

          <button
            onClick={onOpenCannonKitchenPOS}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            🍳 Fenugreek Restaurant POS (Code 214)
          </button>

          <button
            onClick={onOpenAccountsLedger}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(52, 211, 153, 0.18)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: '#34d399',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            📊 Accounts Day Book & B2B GST
          </button>

          <button
            onClick={onOpenCaFilingStation}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.28), rgba(245, 158, 11, 0.18))',
              border: '1.5px solid var(--gold-primary)',
              color: 'var(--gold-glow)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.25)'
            }}
            title="Open System #36: CA Filing Station & Financial Intelligence Engine (10 Modules)"
          >
            <Scale size={13} color="var(--gold-glow)" /> 🏛️ System #36: CA Filing Station
          </button>

          <button
            onClick={onOpenD1Database}
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.28), rgba(14, 165, 233, 0.18))',
              border: '1.5px solid rgba(56, 189, 248, 0.7)',
              color: '#38bdf8',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)'
            }}
            title="Open Cloudflare D1 Master Database Console (All 68 Tables)"
          >
            <Database size={13} color="#38bdf8" /> 🗄️ D1 Database Hub (68 Tables)
          </button>

          <button
            onClick={onOpenNightAudit}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(192, 132, 252, 0.18)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              color: '#c084fc',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            🌙 12 AM Night Audit Lock
          </button>

          <button
            onClick={onOpenDirectorPortal}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(212, 175, 55, 0.18)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: 'var(--gold-glow)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            📱 Remote Director Portal
          </button>

          <button
            onClick={onOpenStoreInventory}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#6ee7b7',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            🥬 Mandi Store
          </button>

          <button
            onClick={onOpenRevenueManagement}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.28), rgba(245, 158, 11, 0.22))',
              border: '1px solid var(--gold-primary)',
              color: 'var(--gold-glow)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.2)'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
            ⚡ IDeaS G3 RMS Console
          </button>


        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={handleAdminAccess}
            style={{
              fontSize: '0.75rem',
              color: '#fff',
              background: currentView === 'pms' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'rgba(255,255,255,0.04)',
              border: currentView === 'pms' ? '1px solid #f87171' : '1px solid rgba(56, 189, 248, 0.3)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease',
              boxShadow: currentView === 'pms' ? '0 0 12px rgba(220, 38, 38, 0.45)' : 'none'
            }}
            title={currentView === 'pms' ? 'Exit PMS and return to Public Website (Esc)' : 'Open Front Desk PMS Console'}
          >
            {currentView === 'pms' ? (
              <>
                <LogOut size={13} color="#ffffff" /> Exit PMS to Website (Esc)
              </>
            ) : (
              <>
                <Lock size={13} color="#38bdf8" /> Front Desk Enterprise PMS
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'rgba(6, 14, 26, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.22)',
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{
          maxWidth: 1380,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Logo & Hotel Title */}
          <div 
            onClick={() => setCurrentView('guest')} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f3c64c 0%, #d4af37 50%, #997e26 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(212, 175, 55, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
              <Hotel size={26} color="#060e1a" strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
                  {HOTEL_CONFIG.name.toUpperCase()}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  background: 'rgba(212, 175, 55, 0.18)',
                  color: 'var(--gold-glow)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  RAYAGADA
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(212, 175, 55, 0.25))',
                  color: '#e9d5ff',
                  border: '1px solid rgba(192, 132, 252, 0.65)',
                  padding: '0.12rem 0.55rem',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)',
                  letterSpacing: '0.04em'
                }}>
                  ✨ 2026 CRAFT ED.
                </span>
              </div>
              <div className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Premier 18-Room Executive &amp; Pilgrim Hotel • Near Andhra Bank, New Colony • Emil Kowalski UI Motion
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div style={{ display: 'none', alignItems: 'center', gap: '1.5rem', '@media (min-width: 992px)': { display: 'flex' } }} className="desktop-nav-links">
            <button 
              onClick={() => setCurrentView('guest')}
              style={{
                color: currentView === 'guest' ? 'var(--gold-glow)' : 'var(--text-primary)',
                fontWeight: currentView === 'guest' ? 600 : 400,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              Rooms & 18-Inventory
            </button>

            <button 
              onClick={onOpen3DExplorer}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(29, 78, 216, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px'
              }}
            >
              <Layers size={15} color="#38bdf8" /> 3D Floor Explorer
            </button>

            <button 
              onClick={onOpenVirtualTour}
              style={{
                color: '#fef08a',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25), rgba(245, 158, 11, 0.15))',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)'
              }}
              title="Experience 360° Panoramic Virtual Tour"
            >
              <Compass size={15} color="#f59e0b" /> 360° Tour
            </button>

            <button 
              onClick={onOpenCannonKitchenPOS}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Utensils size={15} color="#34d399" /> Fenugreek Restaurant POS
            </button>

            <button 
              onClick={onOpenAccountsLedger}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Scale size={15} color="var(--gold-glow)" /> Audit Reconciler
            </button>

            <button 
              onClick={onOpenCorporate}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Building2 size={15} color="#8b5cf6" /> Corporate Ledgers
            </button>

            <button 
              onClick={onOpenD1Database}
              style={{
                color: '#38bdf8',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 700,
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Inspect All 68 Cloudflare D1 Database Tables Live"
            >
              <Database size={14} color="#38bdf8" /> 🗄️ 68-Table DB Hub
            </button>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* AI Concierge Trigger */}
            <button 
              onClick={onOpenAiConcierge}
              className="btn-outline-gold"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              title="24/7 AI Concierge"
            >
              <Sparkles size={15} color="var(--gold-glow)" />
              <span className="hide-on-mobile">AI Concierge</span>
            </button>

            {/* Back-Office PMS / Reception Toggle */}
            <button 
              onClick={handleAdminAccess}
              style={{
                background: currentView === 'pms' 
                  ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' 
                  : 'rgba(12, 24, 43, 0.8)',
                border: currentView === 'pms' 
                  ? '1px solid #f87171' 
                  : '1px solid rgba(212, 175, 55, 0.35)',
                color: '#fff',
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: currentView === 'pms' ? '0 0 15px rgba(220, 38, 38, 0.5)' : 'none',
                cursor: 'pointer'
              }}
              title={currentView === 'pms' ? 'Exit PMS and return to Public Website (Esc)' : 'Open Front Desk PMS Console'}
            >
              {currentView === 'pms' ? (
                <>
                  <LogOut size={16} color="#ffffff" /> Exit PMS to Website
                </>
              ) : (
                <>
                  <Lock size={15} color="var(--gold-champagne)" /> Front Desk PMS
                </>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: '#fff', padding: '0.4rem' }}
              className="show-on-mobile"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button 
              onClick={() => { 
                handleAdminAccess(); 
                setMobileMenuOpen(false); 
              }} 
              style={{ 
                textAlign: 'left', 
                color: '#fff', 
                padding: '0.65rem 0.95rem',
                borderRadius: '8px',
                background: currentView === 'pms' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'rgba(212, 175, 55, 0.18)',
                border: currentView === 'pms' ? '1px solid #f87171' : '1px solid rgba(212, 175, 55, 0.4)',
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {currentView === 'pms' ? (
                <>
                  <LogOut size={16} /> 🚪 Exit PMS to Guest Website (Esc)
                </>
              ) : (
                <>
                  <Lock size={16} /> 🔒 Front Desk Enterprise PMS (Tape Chart & Billing)
                </>
              )}
            </button>
            <button onClick={() => { setCurrentView('guest'); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#fff', padding: '0.4rem 0' }}>
              🏨 18-Room Inventory Catalog
            </button>
            <button onClick={() => { onOpen3DExplorer(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#38bdf8', padding: '0.4rem 0' }}>
              🏛️ 3D Multi-Floor Explorer
            </button>
            <button onClick={() => { onOpenVirtualTour?.(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#f59e0b', padding: '0.4rem 0', fontWeight: 600 }}>
              🌐 360° Panoramic Virtual Tour
            </button>
            <button onClick={() => { onOpenCannonKitchenPOS(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#34d399', padding: '0.4rem 0' }}>
              🍳 Fenugreek Restaurant Multi-Outlet POS
            </button>
            <button onClick={() => { onOpenAccountsLedger(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: 'var(--gold-glow)', padding: '0.4rem 0' }}>
              ⚖️ Accounts Day Book & GST Audit
            </button>
            <button onClick={() => { onOpenCorporate(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#a78bfa', padding: '0.4rem 0' }}>
              🏢 Corporate B2B (Ashok Leyland / JK Paper)
            </button>

            <button onClick={() => { onOpenD1Database?.(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#38bdf8', padding: '0.4rem 0', fontWeight: 800 }}>
              🗄️ Cloudflare D1 Database Hub (68 Tables)
            </button>

            <button onClick={() => { onOpenRevenueManagement(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: 'var(--gold-glow)', padding: '0.4rem 0', fontWeight: 800 }}>
              ⚡ IDeaS G3 RMS Console
            </button>
          </div>
        )}
      </nav>

      {/* Admin Verification Modal */}
      {showPinPrompt && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} color="var(--gold-glow)" />
                <h3 style={{ fontSize: '1.15rem' }}>Reception & PMS Security Check</h3>
              </div>
              <button onClick={() => setShowPinPrompt(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Access to {HOTEL_CONFIG.name} Front Desk Management, 18-Room Tape Chart, Night Audit, and Sarai Act Police Register requires duty staff authorization.
              </p>

              <form onSubmit={verifyPin}>
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={14} /> Front Desk Security PIN
                  </label>
                  <input 
                    type="password" 
                    className="form-input"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    maxLength={6}
                    autoFocus
                    required
                    style={{ letterSpacing: '0.3em', fontSize: '1.3rem', textAlign: 'center' }}
                  />
                </div>

                {pinError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {pinError}
                  </div>
                )}

                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginTop: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#bae6fd' }}>
                    <strong>Duty Staff Authorization:</strong> Default PIN is <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>7650</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => verifyPin(null, '7650')}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    ⚡ Quick Unlock as Duty Manager
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowPinPrompt(false)}
                    className="btn-outline-gold"
                    style={{ padding: '0.6rem 1.2rem' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary-gold"
                    style={{ padding: '0.6rem 1.4rem' }}
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .show-on-mobile {
            display: none !important;
          }
        }
        @media (max-width: 991px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
