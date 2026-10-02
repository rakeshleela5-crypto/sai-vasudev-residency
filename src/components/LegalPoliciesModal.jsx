import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Scale, FileText, Cookie, AlertCircle, CheckCircle2, Building, Mail, Phone } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function LegalPoliciesModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: 850, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
              padding: '0.5rem',
              borderRadius: '8px',
              color: '#060e1a'
            }}>
              <Scale size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Statutory Disclosures & Guest Policies</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Compliant with India DPDP Act 2023, Sarai Act 1867 & Consumer Protection Act 2020
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close legal modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(6, 14, 26, 0.5)',
          padding: '0.5rem 1.5rem',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'privacy', label: 'Privacy Notice (DPDP)', icon: ShieldCheck },
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'refund', label: 'Refund & Cancellation', icon: Scale },
            { id: 'cookies', label: 'Cookie Policy', icon: Cookie }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #d4af37' : '1px solid transparent',
                  background: isActive ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                  color: isActive ? '#d4af37' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', lineHeight: 1.6, fontSize: '0.88rem', color: '#cbd5e1' }}>
          
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div>
              <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#d4af37' }}>Statutory Notice under Digital Personal Data Protection (DPDP) Act 2023</strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#e2e8f0' }}>
                  {HOTEL_CONFIG.name} acts as the Data Fiduciary for personal data collected during room reservations, front desk check-in, and dining orders.
                </p>
              </div>

              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>1. Personal Data Collected</h4>
              <p>We collect only the minimum data required by law and for service delivery:</p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Identity Data:</strong> Full Name, Age/Adult confirmation, Government Photo ID type and masked identifier (e.g., Aadhaar masked to last 4 digits per UIDAI guidelines).</li>
                <li><strong>Contact Data:</strong> Mobile Phone Number, Email Address (for booking confirmation & digital tax invoices).</li>
                <li><strong>Statutory Sarai Act Data:</strong> State of origin, arrival date/time, purpose of visit, and departure details as mandated under the Sarai Act, 1867 for police register compliance.</li>
                <li><strong>Financial Data:</strong> UPI transaction references, split-tender modes, corporate GSTIN. We never store credit card numbers, CVVs, or bank net banking passwords.</li>
              </ul>

              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>2. Lawful Purpose & Data Minimization</h4>
              <p>Your data is processed strictly for:</p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li>Room availability allocation and reservation management.</li>
                <li>Compliance with local police authorities under the Sarai Act, 1867.</li>
                <li>GST Rule 46 compliant tax invoicing (SAC Code: 996311 / 996331).</li>
              </ul>

              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>3. Data Retention & 30-Day Auto-Purge Protocol</h4>
              <p>
                In strict adherence to Section 8 of the DPDP Act 2023, guest consent and transient reservation logs are scheduled for automated scrubbing 30 days after check-out, except where statutory accounting and tax regulations require longer retention.
              </p>

              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>4. Grievance Redressal Officer</h4>
              <p>For any data access, correction, or erasure requests, contact our designated Data Protection Officer:</p>
              <div style={{ background: 'rgba(12, 24, 43, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div><strong>Officer:</strong> R. K. Mohapatra (Data Grievance Officer)</div>
                <div><strong>Address:</strong> {HOTEL_CONFIG.name}, {HOTEL_CONFIG.address}</div>
                <div><strong>Email:</strong> {HOTEL_CONFIG.email}</div>
                <div><strong>Desk Phone:</strong> {HOTEL_CONFIG.phone}</div>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>1. Check-In & Check-Out Policy</h4>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Standard Check-In:</strong> 12:00 PM (Noon). Early check-in is subject to availability and dynamic day-rate allowances.</li>
                <li><strong>Standard Check-Out:</strong> 12:00 PM (Noon - 24 hour hotel cycle). Late check-out beyond 1:00 PM incurs half-day tariff; beyond 4:00 PM incurs full day tariff.</li>
              </ul>

              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>2. Mandatory Identity Verification (Sarai Act 1867)</h4>
              <p>
                As per statutory directives of the District Police Administration of Rayagada, Odisha, every adult guest (18+ years) must produce valid original government-issued photo identification at check-in (Aadhaar, Passport, Driving License, or Voter ID). PAN Card is not accepted as proof of address. Check-in will be denied to individuals failing to present original ID.
              </p>

              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>3. Guest Conduct & Sanctity</h4>
              <p>
                {HOTEL_CONFIG.name} maintains pure vegetarian (Satvik) culinary traditions. Bringing non-vegetarian food or prohibited substances into guest rooms or dining areas is strictly prohibited.
              </p>

              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>4. Governing Law & Jurisdiction</h4>
              <p>
                Any legal dispute, arbitration, or claim arising out of bookings or stay agreements shall be exclusively subject to the jurisdiction of the competent civil courts at <strong>Rayagada, Odisha, India</strong>.
              </p>
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION */}
          {activeTab === 'refund' && (
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>1. Cancellation Windows & Refund Schedules</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem', borderRadius: 8 }}>
                  <strong style={{ color: '#34d399' }}>✓ More than 48 Hours Before Check-in:</strong>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>100% Full Refund of advance deposit (less standard payment gateway processing fee of 2.5%).</div>
                </div>
                <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.85rem', borderRadius: 8 }}>
                  <strong style={{ color: '#facc15' }}>⚠ Between 24 to 48 Hours Before Check-in:</strong>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>50% Refund of the first night advance deposit.</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.85rem', borderRadius: 8 }}>
                  <strong style={{ color: '#f87171' }}>✗ Less than 24 Hours or No-Show:</strong>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Non-refundable. Entire 1st night advance is retained to compensate for blocked inventory displacement.</div>
                </div>
              </div>

              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>2. Refund Processing Timeline</h4>
              <p>
                Approved refunds will be processed back to the original source instrument (UPI VPA / Bank Account) within 5 to 7 business banking days as per RBI guidelines.
              </p>
            </div>
          )}

          {/* TAB 4: COOKIE POLICY */}
          {activeTab === 'cookies' && (
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>1. What Cookies We Use</h4>
              <p>
                We believe in privacy-first hospitality. {HOTEL_CONFIG.name} uses strictly necessary cookies and local storage tokens to operate our digital reservation engine:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Essential Session Storage:</strong> Stores active room hold timer (10-minute hold lock) and booking cart items.</li>
                <li><strong>Security & Authentication:</strong> Validates authenticated duty staff sessions (`hsi_admin_pin` in temporary session memory).</li>
                <li><strong>Consent Preferences:</strong> Remembers your cookie acceptance choice (`hsi_cookie_consent`).</li>
              </ul>
              <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>2. No Third-Party Tracking</h4>
              <p>
                We do not deploy third-party advertising cookies, cross-site trackers, or commercial data brokers. Your browsing history remains private.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GSTIN: {HOTEL_CONFIG.gstin} • Trade License Reg: Rayagada Municipality
          </div>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
