import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieConsentBanner({ onOpenPolicy }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('hsi_cookie_consent');
    if (!consent) {
      // Short delay so it smoothly slides up after page load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type) => {
    localStorage.setItem('hsi_cookie_consent', type);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      left: '1.25rem',
      right: '1.25rem',
      maxWidth: 820,
      margin: '0 auto',
      zIndex: 9999,
      background: 'rgba(6, 14, 26, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(212, 175, 55, 0.35)',
      borderRadius: '14px',
      padding: '1rem 1.25rem',
      boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: 280 }}>
        <div style={{
          background: 'rgba(212, 175, 55, 0.15)',
          padding: '0.45rem',
          borderRadius: '8px',
          color: '#d4af37',
          flexShrink: 0
        }}>
          <Cookie size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.2rem' }}>
            Privacy & Essential Cookies (DPDP Act 2023)
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
            We use strictly necessary session cookies to hold real-time room inventory, prevent reservation collisions, and power secure guest check-in. No third-party ad trackers.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={onOpenPolicy}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#d4af37',
            fontSize: '0.8rem',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '0.4rem 0.6rem'
          }}
        >
          View Policy
        </button>

        <button
          onClick={() => handleAccept('essential')}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#e2e8f0',
            fontSize: '0.8rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
        >
          Essential Only
        </button>

        <button
          onClick={() => handleAccept('all')}
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
            border: 'none',
            color: '#060e1a',
            fontSize: '0.8rem',
            padding: '0.45rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 4px 10px rgba(212, 175, 55, 0.2)'
          }}
        >
          Accept All
        </button>

        <button
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss banner"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '0.25rem',
            marginLeft: '0.25rem'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
