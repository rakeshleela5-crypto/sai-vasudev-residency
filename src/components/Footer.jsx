import React from 'react';
import { Hotel, MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles, Heart } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function Footer({ 
  onOpenDarshan, 
  onOpenDining, 
  onOpenCorporate, 
  onOpenBotFleet,
  onOpenLegal,
  onOpenDataRights
}) {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, #0c182b 0%, #060e1a 100%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.25)',
      padding: '4rem 1.5rem 2.5rem 1.5rem',
      color: 'var(--text-secondary)'
    }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Col 1: Property Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f3c64c 0%, #d4af37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060e1a'
              }}>
                <Hotel size={22} />
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', color: '#fff', letterSpacing: '0.03em' }}>
                {HOTEL_CONFIG.name.toUpperCase()}
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Premier 18-room executive and pilgrim destination in Rayagada, Odisha. Offering refined comfort, authentic Odia cuisine, and seamless access to sacred shrines and regional industrial hubs.
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-glow)' }}>
              GSTIN: {HOTEL_CONFIG.gstin} • SAC: {HOTEL_CONFIG.sacCode}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.2rem', letterSpacing: '0.05em' }}>
              EXPERIENCE & SERVICES
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li>
                <a href="#inventory" style={{ color: 'inherit', transition: 'color 0.2s', textDecoration: 'none' }}>
                  18-Room Inventory Catalog
                </a>
              </li>
              <li>
                <button onClick={onOpenDining} style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  Odia Delicacies & Satvik Dining
                </button>
              </li>
              <li>
                <button onClick={onOpenDarshan} style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  Maa Majhighariani Darshan Advisor
                </button>
              </li>
              <li>
                <button onClick={onOpenCorporate} style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  Corporate B2B Invoicing (JK/IMFA/Utkal)
                </button>
              </li>
              <li>
                <button onClick={onOpenBotFleet} style={{ background: 'none', border: 'none', color: '#38bdf8', textAlign: 'left', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  20-Bot Autonomous Hotel Fleet
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Desk */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.2rem', letterSpacing: '0.05em' }}>
              RECEPTION & DESK
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <MapPin size={16} color="var(--gold-glow)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <span>{HOTEL_CONFIG.address}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Phone size={16} color="var(--gold-glow)" style={{ flexShrink: 0 }} />
                <span>Switchboard: {HOTEL_CONFIG.phone}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Phone size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>Landline: {HOTEL_CONFIG.landline}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Mail size={16} color="var(--gold-glow)" style={{ flexShrink: 0 }} />
                <span>{HOTEL_CONFIG.email}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Proximity & Statutory Notice */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.2rem', letterSpacing: '0.05em' }}>
              STATUTORY COMPLIANCE
            </h4>
            <div style={{
              background: 'rgba(6, 14, 26, 0.6)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
              lineHeight: 1.5
            }}>
              <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '0.25rem' }}>
                ✓ Sarai Act 1867 Certified
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Registered with Rayagada Town Police Station.
              </div>
              <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '0.25rem' }}>
                ✓ DPDP Act 2023 Compliant
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                30-day automated PII auto-purge enforced at edge.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rights Line */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.78rem'
        }}>
          <div>
            © {new Date().getFullYear()} {HOTEL_CONFIG.name}. All Rights Reserved. {HOTEL_CONFIG.address}.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}
            >
              Privacy Policy (DPDP)
            </button>
            <button
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}
            >
              Terms of Service & Sarai Act
            </button>
            <button
              onClick={() => onOpenLegal && onOpenLegal('refund')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}
            >
              Refund & Cancellation
            </button>
            <button
              onClick={() => onOpenLegal && onOpenLegal('cookies')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}
            >
              Cookie Policy
            </button>
            <button
              onClick={onOpenDataRights}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                cursor: 'pointer',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                font: 'inherit',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              🛡 Exercise DPDP Rights
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
