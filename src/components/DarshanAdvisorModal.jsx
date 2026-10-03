import React, { useState } from 'react';
import { X, Compass, MapPin, Clock, Car, Phone, Sparkles, Calendar, CheckCircle2, MessageCircle } from 'lucide-react';
import { SPIRITUAL_SIGHTS, HOTEL_CONFIG } from '../data/hotelData';
import { LampContainer } from '@/components/ui/lamp';
import { sendDarshanGuideWhatsApp } from '../utils/whatsappDispatch';

export default function DarshanAdvisorModal({ isOpen, onClose }) {
  const [shuttleRequested, setShuttleRequested] = useState(false);
  const [selectedSight, setSelectedSight] = useState(SPIRITUAL_SIGHTS[0].name);

  if (!isOpen) return null;

  const handleRequestShuttle = (e) => {
    e.preventDefault();
    setShuttleRequested(true);
    setTimeout(() => setShuttleRequested(false), 4000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-content-large" style={{ maxHeight: '88vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '0.45rem',
              borderRadius: '8px',
              color: '#fff'
            }}>
              <Compass size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Temple Darshan & RGDA Train Transit Advisor</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {HOTEL_CONFIG.name} Travel Desk • 1.5 km from RGDA Junction • 2.0 km from Maa Majhighariani
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto' }}>
          {/* Top Temple Highlight with Aceternity Divine Lamp Container */}
          <div style={{ marginBottom: '2rem' }}>
            <LampContainer className="min-h-[220px] pt-4 pb-6 border border-[rgba(212,175,55,0.3)] shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-glow)', fontWeight: 600, fontSize: '0.85rem' }}>
                <Sparkles size={16} /> Presiding Deity of Rayagada
              </div>
              <h3 style={{ fontSize: '1.7rem', margin: '0.4rem 0 0.6rem 0', textAlign: 'center' }} className="font-serif gold-gradient-text">
                Maa Majhighariani Temple Darshan Guide
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 760, textAlign: 'center' }}>
                The temple is celebrated throughout Odisha and Andhra Pradesh. Devotees offer prayers for safe journeys and health. Goddess Majhighariani is worshipped without a sculpted idol, represented by the sacred rock shrine. <strong>Wednesdays and Fridays</strong> witness profound Chandi Patha rituals with massive footfall.
              </p>
            </LampContainer>
          </div>

          {/* Spiritual Sites Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            {SPIRITUAL_SIGHTS.map(sight => (
              <div 
                key={sight.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  background: 'rgba(12, 24, 43, 0.7)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1.15rem', color: '#fff' }}>{sight.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--sapphire-light)', fontWeight: 600 }}>
                    {sight.distance}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} /> {sight.timings}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>
                  <strong>Special Days:</strong> {sight.specialDays}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {sight.highlights}
                </p>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '0.6rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Hotel Shuttle:</span>
                  <span style={{ fontWeight: 600, color: 'var(--gold-glow)' }}>{sight.shuttleTariff}</span>
                </div>

                <button
                  type="button"
                  onClick={() => sendDarshanGuideWhatsApp({
                    templeName: sight.name,
                    timings: sight.timings,
                    distance: sight.distance,
                    specialNotes: `${sight.highlights} Special Days: ${sight.specialDays}`
                  })}
                  style={{
                    marginTop: '0.6rem',
                    width: '100%',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    background: 'rgba(37, 211, 102, 0.15)',
                    border: '1px solid #25D366',
                    color: '#4ade80',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                  title="Send temple timings, distance, and route guide to WhatsApp"
                >
                  <MessageCircle size={14} /> Send Guide &amp; Route to WhatsApp
                </button>
              </div>
            ))}
          </div>

          {/* RGDA Train Transit Information */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(19, 34, 61, 0.5)', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
              <Car size={18} /> Rayagada Railway Junction (RGDA) Key Trains & Station Transfer
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              {HOTEL_CONFIG.name} is located just 1.5 km (5-minute drive) from Rayagada Station platform exits. Free pickup is extended to all Executive Room and Suite guests.
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.8rem'
            }}>
              <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '0.75rem', borderRadius: '6px' }}>
                <strong style={{ color: '#fff' }}>Hirakhand Express (18447/18448)</strong>
                <div style={{ color: 'var(--text-muted)' }}>Bhubaneswar ↔ Rayagada ↔ Jagdalpur</div>
              </div>
              <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '0.75rem', borderRadius: '6px' }}>
                <strong style={{ color: '#fff' }}>Samaleshwari Express (18005/18006)</strong>
                <div style={{ color: 'var(--text-muted)' }}>Howrah ↔ Rayagada ↔ Koraput</div>
              </div>
              <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '0.75rem', borderRadius: '6px' }}>
                <strong style={{ color: '#fff' }}>Visakhapatnam Intercity (18511/18512)</strong>
                <div style={{ color: 'var(--text-muted)' }}>Daily South Coastal Transit to VSKP</div>
              </div>
            </div>
          </div>

          {/* Quick Shuttle Booking Request Form */}
          <div style={{ background: 'rgba(12, 24, 43, 0.9)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '1.25rem', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--gold-glow)' }}>
              Request Dedicated Darshan Shuttle or Station Pickup:
            </h4>
            {shuttleRequested ? (
              <div style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Shuttle request logged! Reception desk driver will coordinate directly with your mobile.
              </div>
            ) : (
              <form onSubmit={handleRequestShuttle} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select 
                  className="form-select" 
                  style={{ flex: 1, minWidth: '220px', fontSize: '0.85rem' }}
                  value={selectedSight}
                  onChange={(e) => setSelectedSight(e.target.value)}
                >
                  <option value="Maa Majhighariani Temple">Maa Majhighariani Temple (2.0 km)</option>
                  <option value="Rayagada Railway Station RGDA">Rayagada Railway Station (RGDA) (1.5 km)</option>
                  <option value="Devagiri Cave">Devagiri Hill Cave (38 km)</option>
                  <option value="Jagannath Temple">Raniguda Jagannath Temple (3.5 km)</option>
                </select>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Your Room # or Mobile" 
                  style={{ width: '180px', fontSize: '0.85rem' }}
                  required
                />
                <button type="submit" className="btn-primary-gold" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                  Dispatch Driver
                </button>
                <a
                  href={`https://wa.me/917978043585?text=${encodeURIComponent(`Hello Sri Sai Vasudev Travel Desk, I would like to schedule a station transfer or cab for: ${selectedSight}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    background: '#16a34a',
                    color: '#ffffff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                  title="Connect directly with Travel Desk on WhatsApp"
                >
                  <MessageCircle size={15} /> WhatsApp Desk
                </a>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
