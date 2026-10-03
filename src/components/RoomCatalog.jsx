import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, Wifi, Tv, Coffee, Wind, Compass, Sparkles, 
  ArrowRight, ShieldCheck, Users, Bed, Layers, Car, Briefcase,
  Zap, Clock, Utensils, MapPin, Building, CheckCircle2
} from 'lucide-react';
import { ROOM_TIERS } from '../data/hotelData';
import { calculateRoomTax } from '../utils/taxUtils';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';

export default function RoomCatalog({ onSelectTier, onOpen3DExplorer, onOpenVirtualTour, rooms = [], dynamicRates = null }) {
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('all');
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});

  const filterOptions = [
    { id: 'all', label: 'All 18 Rooms' },
    { id: '1', label: 'Ground Floor (101–107)' },
    { id: '2', label: '1st Floor (201–211)' }
  ];

  // Update sliding gold pill position dynamically
  useEffect(() => {
    const activeEl = tabRefs.current[selectedFloorFilter];
    const container = tabsContainerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setPillStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
        opacity: 1
      });
    }
  }, [selectedFloorFilter]);

  const filteredTiers = selectedFloorFilter === 'all' 
    ? ROOM_TIERS 
    : ROOM_TIERS.filter(t => t.floor === Number(selectedFloorFilter));

  const getTierStats = (tierName) => {
    const tierRooms = rooms.filter(r => r.tier === tierName);
    const available = tierRooms.filter(r => r.status === 'Available').length;
    return { available, total: tierRooms.length || 10 };
  };

  return (
    <section id="rooms" style={{ padding: '3.5rem 1.5rem 4.5rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--gold-glow)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem'
            }}>
              <Sparkles size={14} /> 18 Curated Inventory Rooms
            </div>
            <h2 style={{ fontSize: '2.4rem' }}>
              4 Accommodation Categories Across <span className="gold-gradient-text">2 Dedicated Floors</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: 650 }}>
              Engineered with soundproof glazing, high-speed 5G Wi-Fi, 24-hr hot water, and authentic Odia hospitality. Featuring 7 rooms on the Ground Floor and 11 rooms on the 1st Floor.
            </p>
          </div>

          {/* Luxury Sliding Pill Tabs Bar with WCAG Tablist */}
          <div className="category-tabs-container" ref={tabsContainerRef} role="tablist" aria-label="Floor Categories">
            <div 
              className="sliding-gold-pill" 
              style={{
                transform: `translateX(${pillStyle.left}px)`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
                transition: 'transform 0.24s var(--ease-luxury), width 0.24s var(--ease-luxury), opacity 0.2s ease'
              }}
            />
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                ref={(el) => (tabRefs.current[opt.id] = el)}
                onClick={() => setSelectedFloorFilter(opt.id)}
                role="tab"
                aria-selected={selectedFloorFilter === opt.id}
                className={`tab-btn-pill ${selectedFloorFilter === opt.id ? 'active' : ''}`}
                style={{
                  transition: 'color 0.2s ease, transform 0.15s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Tiers Display Grid with Waterfall Animation Cascade */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '2rem'
        }}>
          {filteredTiers.map((tier, idx) => {
            const effectiveTariff = (dynamicRates && dynamicRates[tier.id]) ? dynamicRates[tier.id].recommendedRate : tier.tariff;
            const isDynamic = dynamicRates && dynamicRates[tier.id] && dynamicRates[tier.id].recommendedRate !== tier.tariff;
            const tax = calculateRoomTax(effectiveTariff);
            const stats = getTierStats(tier.name);

            return (
              <CardSpotlight 
                key={tier.id}
                className="p-0 overflow-hidden border-[rgba(212,175,55,0.25)] bg-[rgba(12,24,43,0.75)] hover:border-[rgba(212,175,55,0.6)] flex flex-col"
                color="rgba(212, 175, 55, 0.16)"
              >
                {/* Room Image with Zoom on Hover */}
                <div style={{ position: 'relative', height: 230, width: '100%', overflow: 'hidden' }}>
                  <img 
                    src={tier.image} 
                    alt={tier.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    background: 'rgba(6, 14, 26, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--gold-glow)',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}>
                    Floor {tier.floor} • Keys {tier.roomsRange}
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: stats.available > 0 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {stats.available > 0 && <span className="ripple-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#fff' }}></span>}
                    {stats.available} Available
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    background: 'linear-gradient(to top, rgba(6, 14, 26, 0.95), transparent)'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--sapphire-light)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {tier.tag}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem' }}>{tier.name}</h3>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                        {isDynamic && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ₹{tier.tariff.toLocaleString()}
                          </span>
                        )}
                        ₹{effectiveTariff.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        +5% GST (₹{tax.totalTax})
                      </div>
                      {isDynamic && (
                        <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, marginTop: '0.15rem' }}>
                          ⚡ IDeaS G3 Yield Rate
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {tier.description}
                  </p>

                  {/* Room Specs */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    background: 'rgba(6, 14, 26, 0.5)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.25rem'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={14} color="var(--gold-champagne)" /> {tier.capacityAdults} Adults + {tier.capacityChildren} Child
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Bed size={14} color="var(--gold-champagne)" /> {tier.bedType}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={14} color="var(--gold-champagne)" /> {tier.areaSqFt} sq. ft.
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={14} color="var(--gold-champagne)" /> SAC: 996311
                    </span>
                  </div>

                  {/* Amenity Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {tier.amenities.map((am, amIdx) => (
                      <span 
                        key={amIdx}
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          color: '#e2e8f0'
                        }}
                      >
                        ✓ {am}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Action with Emil Kowalski Micro-Interactions */}
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.74rem',
                      color: '#38bdf8',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                      letterSpacing: '0.02em'
                    }}>
                      <CheckCircle2 size={13} color="#38bdf8" /> Direct Booking: Zero Broker Markup • Instant SAC 996311 Bill
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => onSelectTier({ ...tier, tariff: effectiveTariff })}
                        className="btn-primary-gold"
                        style={{ 
                          flex: 1, 
                          justifyContent: 'center', 
                          fontWeight: 700,
                          transition: 'transform 0.15s ease, box-shadow 0.2s ease'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        Instant Reserve <ArrowRight size={16} />
                      </button>
                      <button 
                        onClick={onOpen3DExplorer}
                        className="btn-secondary-sapphire"
                        style={{ 
                          padding: '0.75rem',
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title="View on 3D Floor Model"
                      >
                        <Layers size={16} />
                      </button>
                      {onOpenVirtualTour && (
                        <button 
                          onClick={() => {
                            const tierRoom = rooms.find(r => r.tier === tier.name);
                            const sceneId = tierRoom ? `room-${tierRoom.roomNumber}` : (tier.floor === 2 ? 'room-201' : 'room-101');
                            onOpenVirtualTour(sceneId);
                          }}
                          className="btn-outline-gold"
                          style={{ 
                            padding: '0.75rem',
                            borderColor: 'rgba(245, 158, 11, 0.5)',
                            background: 'rgba(217, 119, 6, 0.15)',
                            transition: 'transform 0.15s ease'
                          }}
                          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          title={`View ${tier.name} in 360° Virtual Tour`}
                        >
                          <Compass size={16} color="#f59e0b" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardSpotlight>
            );
          })}
        </div>

        {/* Bento Grid: Signature Amenities & Industrial Connectivity */}
        <div style={{ marginTop: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--gold-glow)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem'
            }}>
              <Sparkles size={14} /> The 5-Star Boutique Standard
            </div>
            <h3 style={{ fontSize: '2.2rem' }}>
              Engineered for <span className="gold-gradient-text">Divine Pilgrims &amp; Corporate Pioneers</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 650, margin: '0.5rem auto 0 auto' }}>
              From sacred rituals at Maa Majhighariani to multi-million corporate paper &amp; metallurgy corridors, experience uncompromising comfort.
            </p>
          </div>

          <BentoGrid>
            <BentoCard
              name="Maa Majhighariani Sacred Sanctuary"
              description="Located just 2.0 km from the sacred rock shrine. Enjoy dedicated early morning temple shuttle coordination and authentic ritual guidance."
              Icon={Compass}
              cta="Explore Pilgrimage Services"
              className="md:col-span-2"
              background={
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(212,175,55,0.15)] to-transparent" />
              }
            />
            <BentoCard
              name="Corporate B2B High-Speed Corridor"
              description="Tailored corporate invoicing (GSTIN 21AAACJ1288P1ZZ) for JK Paper, IMFA &amp; Utkal Alumina executives with ergonomic desks &amp; 100% DG backup."
              Icon={Briefcase}
              cta="Corporate Tariff Desk"
            />
            <BentoCard
              name="Pure Vegetarian Satvik Kitchen"
              description="Sattvic Odia delicacies, South Indian breakfast spreads, and tailored Jain dining prepared with pure ghee and mountain water."
              Icon={Utensils}
              cta="View Restaurant Menu"
            />
            <BentoCard
              name="1.5 km RGDA Junction Fast Transit"
              description="Seamless train transit assistance for Visakhapatnam, Bhubaneswar, and Raipur rail routes with 24/7 luggage concierge."
              Icon={Car}
              cta="Transit Information"
              className="md:col-span-2"
              background={
                <div className="absolute inset-0 bg-gradient-to-l from-[rgba(56,189,248,0.15)] to-transparent" />
              }
            />
            <BentoCard
              name="Interactive 3D Isometric Navigation"
              description="Tour all 18 authentic room keys across Ground and 1st Floors in real-time 3D rendered with Three.js web technology."
              Icon={Layers}
              onClick={onOpen3DExplorer}
              cta="Launch 3D Explorer"
            />
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}
