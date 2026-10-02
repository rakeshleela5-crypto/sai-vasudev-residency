import React, { useState } from 'react';
import { Utensils, Sparkles, ShoppingBag, Check, Plus, AlertCircle } from 'lucide-react';
import { RESTAURANT_MENU } from '../data/hotelData';

export default function SatvikDining({ onOpenOrderModal }) {
  const [jainFilterOnly, setJainFilterOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Odia Delicacies', 'Satvik & Jain', 'Breakfast', 'Main Course', 'Beverages'];

  const filteredMenu = RESTAURANT_MENU.filter(item => {
    const matchesJain = !jainFilterOnly || item.isJain;
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    return matchesJain && matchesCat;
  });

  return (
    <section style={{ padding: '3.5rem 1.5rem', background: 'rgba(6, 14, 26, 0.4)' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem'
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
              <Utensils size={14} /> Authentic Culinary Heritage
            </div>
            <h2 style={{ fontSize: '2.4rem' }}>
              Odia Delicacies & Pure <span className="gold-gradient-text">Satvik / Jain Kitchen</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: 650 }}>
              Savor traditional Chhena Poda, Dalma, and pure Satvik recipes prepared strictly without onion or garlic in pure desi ghee for pilgrim sanctity.
            </p>
          </div>

          {/* Jain Filter Toggle & Order CTA */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: jainFilterOnly ? 'rgba(16, 185, 129, 0.2)' : 'rgba(12, 24, 43, 0.6)',
              border: jainFilterOnly ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: jainFilterOnly ? '#10b981' : '#cbd5e1'
            }}>
              <input 
                type="checkbox" 
                checked={jainFilterOnly} 
                onChange={(e) => setJainFilterOnly(e.target.checked)} 
              />
              🥬 100% Satvik & Jain Only (No Onion/Garlic)
            </label>

            <button 
              onClick={() => onOpenOrderModal()}
              className="btn-primary-gold"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
            >
              <ShoppingBag size={16} /> Order In-Room Dining
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '0.55rem', overflowX: 'auto', marginBottom: '2.25rem', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.45rem 1.05rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: activeCategory === cat ? 700 : 500,
                whiteSpace: 'nowrap',
                background: activeCategory === cat 
                  ? 'linear-gradient(135deg, var(--gold-glow) 0%, #aa831b 100%)' 
                  : 'rgba(12, 24, 43, 0.65)',
                color: activeCategory === cat ? '#060e1a' : '#94a3b8',
                border: activeCategory === cat ? '1px solid var(--gold-glow)' : '1px solid rgba(212, 175, 55, 0.2)',
                boxShadow: activeCategory === cat ? '0 0 16px rgba(212, 175, 55, 0.35)' : 'none',
                cursor: 'pointer',
                transform: activeCategory === cat ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.2s var(--ease-luxury), background 0.2s ease, border-color 0.2s ease, color 0.2s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = activeCategory === cat ? 'scale(1.02)' : 'scale(1)'}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid with Emil Kowalski Spring Elevation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredMenu.map(item => (
            <div 
              key={item.id}
              className="glass-panel group"
              style={{
                padding: '1.6rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'rgba(12, 24, 43, 0.78)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                transition: 'transform 0.22s var(--ease-luxury), box-shadow 0.22s ease, border-color 0.22s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 18px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.22)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.65)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.45)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{
                      width: 15,
                      height: 15,
                      border: '1.5px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 1,
                      borderRadius: 3
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}></span>
                    </span>
                    <h3 style={{ fontSize: '1.18rem', fontWeight: 700 }} className="font-serif group-hover:text-[#f3c64c] transition-colors">{item.name}</h3>
                  </div>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                    ₹{item.price}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  {item.isJain && (
                    <span style={{
                      fontSize: '0.72rem',
                      background: 'rgba(16, 185, 129, 0.16)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '5px',
                      fontWeight: 700
                    }}>
                      🥬 Pure Satvik / Jain
                    </span>
                  )}
                  {item.isSpecial && (
                    <span style={{
                      fontSize: '0.72rem',
                      background: 'rgba(212, 175, 55, 0.18)',
                      color: 'var(--gold-glow)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '5px',
                      fontWeight: 700
                    }}>
                      ⭐ Odia Special
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.4rem' }}>
                  {item.description}
                </p>
              </div>

              <button 
                onClick={() => onOpenOrderModal(item)}
                className="btn-outline-gold group-hover:bg-[#d4af37] group-hover:text-[#060e1a] transition-all"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  fontSize: '0.85rem', 
                  padding: '0.6rem', 
                  fontWeight: 700,
                  transition: 'transform 0.15s ease, background 0.2s ease, color 0.2s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Plus size={16} /> Add to In-Room Tray
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
