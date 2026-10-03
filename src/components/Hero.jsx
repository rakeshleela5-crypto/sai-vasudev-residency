import React from 'react';
import { 
  Calendar, Users, Sparkles, Layers, ShieldCheck, MapPin, 
  ArrowRight, Compass, Phone, CheckCircle2, Star, Wifi, Coffee, Building2
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS } from '../data/hotelData';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Marquee } from '@/components/ui/marquee';
import { SparklesCore } from '@/components/ui/sparkles';

export default function Hero({
  rooms = [],
  onOpenBooking,
  onOpen3DExplorer,
  onOpenVirtualTour,
  onOpenAiConcierge,
  searchDates,
  setSearchDates
}) {
  const getFloorAvailability = (floorNum) => {
    const floorRooms = rooms.filter(r => r.floor === floorNum);
    const available = floorRooms.filter(r => r.status === 'Available').length;
    const defaultTotal = floorNum === 1 ? 7 : 11;
    return { available, total: floorRooms.length || defaultTotal };
  };

  const fl1 = getFloorAvailability(1);
  const fl2 = getFloorAvailability(2);

  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '3.5rem 1.5rem 4rem 1.5rem' }}>
      {/* Cinematic Ken Burns Background Aura */}
      <div 
        className="ken-burns"
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(29, 78, 216, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />

      <div style={{ maxWidth: 1300, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Top Trust & Regional Badges with Visible Craft Edition Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem'
        }}>
          {/* Visible Emil Kowalski Design Craft Indicator */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(79, 70, 229, 0.25))',
              border: '1px solid rgba(168, 85, 247, 0.55)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#c084fc',
              boxShadow: '0 0 16px rgba(147, 51, 234, 0.35)'
            }}
          >
            <Sparkles size={14} /> ⚡ 2026 Production Edition • Emil Kowalski Craft Active
          </div>

          <div 
            className="aura-breathing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(212, 175, 55, 0.14)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--gold-glow)'
            }}
          >
            <ShieldCheck size={14} /> Rayagada's Premier <span style={{ color: '#fff', margin: '0 3px' }}><NumberTicker value={18} /></span>-Room Hospitality Landmark
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(29, 78, 216, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            color: '#38bdf8'
          }}>
            <MapPin size={13} /> 1.5 km to RGDA Railway Junction • 2.0 km to Maa Majhighariani Mandir
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem'
          }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={{ color: '#fff', fontWeight: 600 }}>4.96/5</span> (<span style={{ color: 'var(--gold-glow)' }}><NumberTicker value={2850} />+</span> Verified Stays)
            
            {/* Live Audio / Concierge Soundwave Indicator */}
            <div className="soundwave-container" style={{ marginLeft: '0.5rem' }} title="24/7 Live Guest Support Active">
              <span className="soundwave-bar"></span>
              <span className="soundwave-bar"></span>
              <span className="soundwave-bar"></span>
              <span className="soundwave-bar"></span>
            </div>
          </div>
        </div>

        {/* Hero Main Headline & Subtitle with Aceternity SparklesCore */}
        <div style={{ maxWidth: 900, marginBottom: '2.5rem', position: 'relative' }}>
          <div className="absolute -inset-x-10 -top-10 h-[220px] pointer-events-none opacity-40">
            <SparklesCore
              minSize={0.8}
              maxSize={2.2}
              particleDensity={35}
              particleColor="#f3c64c"
            />
          </div>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.2vw, 4rem)',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            position: 'relative',
            zIndex: 1,
            fontWeight: 800,
            letterSpacing: '0.01em'
          }}>
            Divine Serenity &amp; Corporate Prestige in the <span className="gold-gradient-text">Heart of Rayagada</span>
          </h1>
          <p style={{
            fontSize: '1.18rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 780,
            position: 'relative',
            zIndex: 1
          }}>
            Welcome to <strong>{HOTEL_CONFIG.name}</strong>, Near Andhra Bank, New Colony. Featuring 18 thoughtfully curated rooms across Ground &amp; 1st Floors, in-room Satvik &amp; Odia dining, seamless RGDA train transit pickups, and sacred Maa Majhighariani Temple pilgrimage assistance.
          </p>
        </div>

        {/* Real-Time 18-Room Availability Cards Across 2 Floors */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Ground Floor: 7 Keys (101 - 107) */}
          <div 
            className="glass-panel waterfall-item waterfall-delay-1" 
            style={{ 
              padding: '1.5rem 1.75rem',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              transition: 'transform 0.22s var(--ease-luxury), box-shadow 0.22s ease, border-color 0.22s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.2)';
              e.currentTarget.style.borderColor = 'var(--gold-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.45)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--gold-glow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                GROUND FLOOR • 7 ROOMS (101 - 107)
              </span>
              <span className={`badge-status ${fl1.available > 0 ? 'badge-available' : 'badge-occupied'}`}>
                {fl1.available > 0 && <span className="ripple-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-available)', marginRight: 4 }}></span>}
                {fl1.available} / {fl1.total} Available
              </span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#fff', fontWeight: 700 }}>Deluxe &amp; Executive Rooms</h4>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Rooms 101–107 • King / Queen Beds • 24/7 Hot Water • Wi-Fi &amp; Coffee Maker
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>₹1,500 – ₹2,500</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / night + GST</span>
              </div>
              <button 
                onClick={() => onOpenBooking(ROOM_TIERS[1] || ROOM_TIERS[0])}
                className="btn-primary-gold"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
              >
                Reserve Ground Floor
              </button>
            </div>
          </div>

          {/* First Floor: 11 Keys (201 - 211) */}
          <div 
            className="glass-panel waterfall-item waterfall-delay-2" 
            style={{ 
              padding: '1.5rem 1.75rem',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              transition: 'transform 0.22s var(--ease-luxury), box-shadow 0.22s ease, border-color 0.22s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.2)';
              e.currentTarget.style.borderColor = 'var(--gold-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.45)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--gold-glow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                1ST FLOOR • 11 ROOMS (201 - 211)
              </span>
              <span className={`badge-status ${fl2.available > 0 ? 'badge-available' : 'badge-occupied'}`}>
                {fl2.available > 0 && <span className="ripple-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-available)', marginRight: 4 }}></span>}
                {fl2.available} / {fl2.total} Available
              </span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#fff', fontWeight: 700 }}>Executive, Studio &amp; Premium Suites</h4>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Rooms 201–211 • Sofa Seating • Mini Fridge • Hair Dryer • King Size
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>₹1,500 – ₹3,000</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / night + GST</span>
              </div>
              <button 
                onClick={() => onOpenBooking(ROOM_TIERS[3] || ROOM_TIERS[2] || ROOM_TIERS[0])}
                className="btn-primary-gold"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
              >
                Reserve 1st Floor
              </button>
            </div>
          </div>
        </div>

        {/* Live Booking Engine Bar with Luxury Trust Ribbon */}
        <div className="glass-panel" style={{
          padding: '1.75rem 2rem',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          borderRadius: '18px',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.18)'
        }}>
          {/* Trust Ribbon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--gold-glow)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <CheckCircle2 size={16} color="var(--gold-glow)" /> Direct Reservation Engine • Best Rate Guarantee (Zero Broker Commission)
            </span>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
              ● Instant SAC 996311 GST Invoice • RGDA Station Shuttle
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            alignItems: 'flex-end'
          }}>
            {/* Check-In Date */}
            <div>
              <label className="form-label">
                <Calendar size={14} color="var(--gold-glow)" /> Check-In Date (12:00 PM)
              </label>
              <input 
                type="date"
                className="form-input"
                style={{ width: '100%' }}
                value={searchDates.checkIn}
                onChange={(e) => setSearchDates({ ...searchDates, checkIn: e.target.value })}
              />
            </div>

            {/* Check-Out Date */}
            <div>
              <label className="form-label">
                <Calendar size={14} color="var(--gold-glow)" /> Check-Out Date (12:00 PM)
              </label>
              <input 
                type="date"
                className="form-input"
                style={{ width: '100%' }}
                value={searchDates.checkOut}
                onChange={(e) => setSearchDates({ ...searchDates, checkOut: e.target.value })}
              />
            </div>

            {/* Adults & Children */}
            <div>
              <label className="form-label">
                <Users size={14} color="var(--gold-glow)" /> Guests & Room
              </label>
              <select 
                className="form-select"
                style={{ width: '100%' }}
                value={searchDates.guests}
                onChange={(e) => setSearchDates({ ...searchDates, guests: e.target.value })}
              >
                <option value="1">1 Adult (Executive)</option>
                <option value="2">2 Adults (Couple / Deluxe)</option>
                <option value="3">2 Adults + 1 Child (Standard)</option>
                <option value="4">3 Adults (Executive Corporate)</option>
                <option value="5">4 Adults (Family Suite)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                id="hero-instant-reserve-btn"
                onClick={() => onOpenBooking(ROOM_TIERS[0])}
                className="btn-primary-gold"
                style={{ 
                  flex: 1, 
                  padding: '0.85rem 1.4rem',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: '#060e1a',
                  background: 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #d4af37 100%)',
                  border: '1px solid #fef08a',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 25px rgba(234, 179, 8, 0.45), 0 0 15px rgba(250, 204, 21, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ color: '#060e1a', fontWeight: 800, letterSpacing: '0.03em' }}>
                  Instant Reserve
                </span>
                <ArrowRight size={18} strokeWidth={2.5} color="#060e1a" />
              </button>
              <button 
                onClick={onOpen3DExplorer}
                className="btn-secondary-sapphire"
                style={{ padding: '0.75rem', justifyContent: 'center' }}
                title="View 3D Floor Plan"
              >
                <Layers size={18} />
              </button>
              {onOpenVirtualTour && (
                <button 
                  onClick={onOpenVirtualTour}
                  className="btn-outline-gold"
                  style={{ 
                    padding: '0.75rem', 
                    justifyContent: 'center', 
                    background: 'rgba(217, 119, 6, 0.15)',
                    borderColor: 'rgba(245, 158, 11, 0.4)'
                  }}
                  title="Explore 360° Virtual Tour"
                >
                  <Compass size={18} color="#f59e0b" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Magic UI Infinite Marquee for Corporate & Regional Partners */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: 'var(--gold-glow)', 
            marginBottom: '0.75rem', 
            textAlign: 'center',
            fontWeight: 600
          }}>
            Trusted Corporate Corridors &amp; Pilgrimage Partners
          </div>
          <Marquee className="[--duration:28s]" pauseOnHover>
            {[
              { name: "JK Paper Ltd (Rayagada Mills)", badge: "Corporate B2B Rate Tie-up" },
              { name: "IMFA Therubali", badge: "Preferred Executive Stay" },
              { name: "Maa Majhighariani Temple Trust", badge: "Sacred Pilgrim Portal" },
              { name: "Utkal Alumina (Aditya Birla)", badge: "Industrial Guest Corridor" },
              { name: "East Coast Railways (RGDA)", badge: "1.5 km Station Pick-up" },
              { name: "Odisha Tourism Dev Corp", badge: "Verified Heritage Partner" },
            ].map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(12, 24, 43, 0.65)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Building2 size={13} color="var(--gold-glow)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                  {p.name}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  {p.badge}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
