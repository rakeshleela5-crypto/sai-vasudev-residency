import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Send, Lock } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function DpdpDataRightsModal({ isOpen, onClose }) {
  const [guestName, setGuestName] = useState('');
  const [contact, setContact] = useState('');
  const [requestType, setRequestType] = useState('Erasure'); // 'Access', 'Correction', 'Erasure', 'Grievance'
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim() || !contact.trim()) {
      setError('Please provide your name and contact details.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_data_rights',
          payload: {
            guestName: guestName.trim(),
            contact: contact.trim(),
            requestType,
            details: details.trim()
          }
        })
      });

      const data = await res.json();
      if (data && data.success) {
        setSubmittedId(data.requestId || `DPDP-${Date.now()}`);
      } else {
        setError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      // Fallback offline confirmation
      setSubmittedId(`DPDP-OFFLINE-${Date.now().toString().slice(-6)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedId(null);
    setGuestName('');
    setContact('');
    setDetails('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1150 }}>
      <div className="modal-content" style={{ maxWidth: 620 }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              padding: '0.5rem',
              borderRadius: '8px',
              color: '#fff'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Exercise Your Data Rights</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Statutory Self-Service Portal under India DPDP Act 2023 (Section 11, 12 & 13)
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close DPDP modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {submittedId ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
              <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
                Data Rights Request Registered
              </h4>
              <div style={{
                display: 'inline-block',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                color: '#34d399',
                fontSize: '0.9rem',
                fontWeight: 700,
                marginBottom: '1rem',
                fontFamily: 'monospace'
              }}>
                Tracking Ticket: {submittedId}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 1.5rem auto' }}>
                Your <strong>{requestType}</strong> request has been dispatched to our Grievance Redressal Desk. Our Data Protection Officer will process your record and communicate the outcome to <strong>{contact}</strong> within 72 business hours.
              </p>
              <button onClick={handleReset} className="btn btn-primary" style={{ padding: '0.6rem 2rem' }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#a7f3d0' }}>
                As a Data Principal, you have the right to request a summary of your personal data, seek correction of inaccurate records, or request complete erasure of your stay history once mandatory statutory tax/police retention periods elapse.
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Guest Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Chandra Patra"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone or Email *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 94371 00000 / email"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Select Statutory Right *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { id: 'Erasure', label: 'Right to Erasure (Purge Data)', desc: 'Delete my stay records' },
                    { id: 'Access', label: 'Right to Access', desc: 'Summary of stored data' },
                    { id: 'Correction', label: 'Right to Correction', desc: 'Update inaccurate data' },
                    { id: 'Grievance', label: 'Lodge Grievance', desc: 'Escalate to DPO' }
                  ].map(item => {
                    const isSelected = requestType === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setRequestType(item.id)}
                        style={{
                          background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(12, 24, 43, 0.6)',
                          border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 8,
                          padding: '0.65rem 0.5rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: '#fff',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#34d399' : '#fff' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Details / Specific Booking Number (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Specify booking dates, room numbers, or any specific records you wish to address..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8',
                    padding: '0.55rem 1.25rem',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: '#10b981',
                    padding: '0.55rem 1.5rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Transmit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
