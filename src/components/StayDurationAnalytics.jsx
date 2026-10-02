import React, { useState } from 'react';
import { 
  PieChart, BarChart2, TrendingUp, Clock, Calendar, 
  Users, DollarSign, Award, ChevronRight, Sparkles 
} from 'lucide-react';

/**
 * StayDurationAnalytics Component - Inspired by The Wild Oasis Community PMS
 * Provides operational analytics on guest stay lengths across:
 * 1. 1 Night (Train commuters / railway transit)
 * 2. 2-3 Nights (Maa Majhighariani temple pilgrims & weekend visitors)
 * 3. 4-7 Nights (Industrial plant engineers & technical auditors)
 * 4. 8+ Nights (Long-stay project teams & shutdown contractors)
 */
export default function StayDurationAnalytics({ bookings = [] }) {
  const [horizon, setHorizon] = useState('30d'); // '7d', '30d', '90d'

  // Curated benchmark datasets for Rayagada hospitality profile across horizons
  const HORIZON_DATA = {
    '7d': {
      totalBookings: 42,
      alos: 2.4, // Average Length of Stay in nights
      totalRevenue: 228400,
      segments: [
        {
          id: '1-night',
          label: '1 Night',
          subtitle: 'Railway Transit & Express Train Commuters',
          count: 16,
          pct: 38.1,
          revenue: 35184,
          adr: 2199,
          color: '#38bdf8',
          gradient: 'linear-gradient(90deg, #0284c7, #38bdf8)'
        },
        {
          id: '2-3-nights',
          label: '2-3 Nights',
          subtitle: 'Maa Majhighariani Pilgrims & Weekend Visitors',
          count: 18,
          pct: 42.9,
          revenue: 104200,
          adr: 2315,
          color: '#fbbf24',
          gradient: 'linear-gradient(90deg, #d97706, #fbbf24)'
        },
        {
          id: '4-7-nights',
          label: '4-7 Nights',
          subtitle: 'Industrial Plant Engineers (JK Paper / Utkal)',
          count: 6,
          pct: 14.3,
          revenue: 64800,
          adr: 2160,
          color: '#34d399',
          gradient: 'linear-gradient(90deg, #059669, #34d399)'
        },
        {
          id: '8-plus-nights',
          label: '8+ Nights',
          subtitle: 'Turnaround Contractors & GAIL Pipeline Teams',
          count: 2,
          pct: 4.8,
          revenue: 24216,
          adr: 1513,
          color: '#c084fc',
          gradient: 'linear-gradient(90deg, #7c3aed, #c084fc)'
        }
      ]
    },
    '30d': {
      totalBookings: 186,
      alos: 2.8,
      totalRevenue: 1084200,
      segments: [
        {
          id: '1-night',
          label: '1 Night',
          subtitle: 'Railway Transit & Express Train Commuters',
          count: 62,
          pct: 33.3,
          revenue: 136338,
          adr: 2199,
          color: '#38bdf8',
          gradient: 'linear-gradient(90deg, #0284c7, #38bdf8)'
        },
        {
          id: '2-3-nights',
          label: '2-3 Nights',
          subtitle: 'Maa Majhighariani Pilgrims & Weekend Visitors',
          count: 78,
          pct: 41.9,
          revenue: 452400,
          adr: 2320,
          color: '#fbbf24',
          gradient: 'linear-gradient(90deg, #d97706, #fbbf24)'
        },
        {
          id: '4-7-nights',
          label: '4-7 Nights',
          subtitle: 'Industrial Plant Engineers (JK Paper / Utkal)',
          count: 36,
          pct: 19.4,
          revenue: 388800,
          adr: 2160,
          color: '#34d399',
          gradient: 'linear-gradient(90deg, #059669, #34d399)'
        },
        {
          id: '8-plus-nights',
          label: '8+ Nights',
          subtitle: 'Turnaround Contractors & GAIL Pipeline Teams',
          count: 10,
          pct: 5.4,
          revenue: 106662,
          adr: 1777,
          color: '#c084fc',
          gradient: 'linear-gradient(90deg, #7c3aed, #c084fc)'
        }
      ]
    },
    '90d': {
      totalBookings: 564,
      alos: 2.9,
      totalRevenue: 3412000,
      segments: [
        {
          id: '1-night',
          label: '1 Night',
          subtitle: 'Railway Transit & Express Train Commuters',
          count: 175,
          pct: 31.0,
          revenue: 384825,
          adr: 2199,
          color: '#38bdf8',
          gradient: 'linear-gradient(90deg, #0284c7, #38bdf8)'
        },
        {
          id: '2-3-nights',
          label: '2-3 Nights',
          subtitle: 'Maa Majhighariani Pilgrims & Weekend Visitors',
          count: 242,
          pct: 42.9,
          revenue: 1403600,
          adr: 2320,
          color: '#fbbf24',
          gradient: 'linear-gradient(90deg, #d97706, #fbbf24)'
        },
        {
          id: '4-7-nights',
          label: '4-7 Nights',
          subtitle: 'Industrial Plant Engineers (JK Paper / Utkal)',
          count: 118,
          pct: 20.9,
          revenue: 1274400,
          adr: 2160,
          color: '#34d399',
          gradient: 'linear-gradient(90deg, #059669, #34d399)'
        },
        {
          id: '8-plus-nights',
          label: '8+ Nights',
          subtitle: 'Turnaround Contractors & GAIL Pipeline Teams',
          count: 29,
          pct: 5.1,
          revenue: 349175,
          adr: 1777,
          color: '#c084fc',
          gradient: 'linear-gradient(90deg, #7c3aed, #c084fc)'
        }
      ]
    }
  };

  const currentData = HORIZON_DATA[horizon];

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(26, 38, 57, 0.95))',
      border: '1px solid rgba(212, 175, 55, 0.35)',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
      marginBottom: '1.5rem'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span className="badge" style={{
              background: 'rgba(212, 175, 55, 0.18)',
              color: 'var(--gold-glow)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              THE WILD OASIS ANALYTICS
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Guest Cohort Length-of-Stay Segmentation
            </span>
          </div>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: '#fff',
            margin: '0.35rem 0 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Stay Duration Distribution &amp; Cohort Revenue
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Analyzes stay lengths to optimize Minimum Length of Stay (MLOS) and dynamic rate yields
          </p>
        </div>

        {/* Time Horizon Pill Selector */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(6, 14, 26, 0.85)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Last 90 Days' }
          ].map(h => (
            <button
              key={h.id}
              onClick={() => setHorizon(h.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: horizon === h.id ? 'var(--gold-glow)' : 'transparent',
                color: horizon === h.id ? '#060e1a' : '#94a3b8',
                border: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem',
        margin: '1.25rem 0'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '0.85rem 1rem'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Average Length of Stay (ALOS)
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold-glow)', marginTop: '0.2rem' }}>
            {currentData.alos} Nights
          </div>
          <span style={{ fontSize: '0.7rem', color: '#34d399' }}>
            ↑ +0.3 nights vs Rayagada market avg
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '0.85rem 1rem'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Cohort Stays
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.2rem' }}>
            {currentData.totalBookings} Stays
          </div>
          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
            ₹{currentData.totalRevenue.toLocaleString('en-IN')} Gross Room Revenue
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '0.85rem 1rem'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Dominant Volume Cohort
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24', marginTop: '0.2rem' }}>
            2-3 Nights (42.9%)
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            Maa Majhighariani Temple Devotees
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '0.85rem 1rem'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Most Profitable Cohort
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
            4-7 Nights Corporate
          </div>
          <span style={{ fontSize: '0.7rem', color: '#34d399' }}>
            35.8% of Total Room Revenue
          </span>
        </div>
      </div>

      {/* Visual Proportional Stacked Meter */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex',
          height: '24px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.5)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {currentData.segments.map(seg => (
            <div
              key={seg.id}
              style={{
                width: `${seg.pct}%`,
                background: seg.gradient,
                transition: 'width 0.4s ease'
              }}
              title={`${seg.label}: ${seg.pct}% (${seg.count} Stays)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginTop: '0.65rem',
          fontSize: '0.75rem'
        }}>
          {currentData.segments.map(seg => (
            <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color }} />
              <strong style={{ color: '#fff' }}>{seg.label}:</strong>
              <span style={{ color: seg.color, fontWeight: 700 }}>{seg.pct}%</span>
              <span style={{ color: '#64748b' }}>({seg.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Segment Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.85rem'
      }}>
        {currentData.segments.map(seg => (
          <div
            key={seg.id}
            style={{
              background: 'rgba(6, 14, 26, 0.65)',
              border: `1px solid ${seg.color}35`,
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  background: `${seg.color}20`,
                  color: seg.color,
                  border: `1px solid ${seg.color}40`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '0.75rem'
                }}>
                  {seg.label}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>
                  {seg.pct}%
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: '1.3' }}>
                {seg.subtitle}
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '0.5rem',
              marginTop: '0.65rem',
              fontSize: '0.74rem'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>Volume</span>
                <strong style={{ color: '#cbd5e1' }}>{seg.count} Stays</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>Revenue</span>
                <strong style={{ color: 'var(--gold-glow)' }}>₹{seg.revenue.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
