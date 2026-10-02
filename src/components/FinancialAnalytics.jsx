import React, { useState } from 'react';
import { 
  FileText, Download, Building2, TrendingUp, ShieldCheck, 
  Printer, CheckCircle2, DollarSign, Calendar, RefreshCw
} from 'lucide-react';
import { HOTEL_CONFIG, CORPORATE_PARTNERS } from '../data/hotelData';
import { generateGstr1Json, downloadGstr1File, calculateRoomTax } from '../utils/taxUtils';

export default function FinancialAnalytics({ bookings = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('09');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [gstr1Preview, setGstr1Preview] = useState(null);

  // Compute totals
  const totalTaxable = bookings.reduce((sum, b) => sum + (b.baseTotal || b.tariffPerNight || 0), 0);
  const totalCgst = bookings.reduce((sum, b) => sum + (b.cgst || 0), 0);
  const totalSgst = bookings.reduce((sum, b) => sum + (b.sgst || 0), 0);
  const totalGross = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const b2bBookings = bookings.filter(b => b.isB2b || b.corporateGstin);
  const b2cBookings = bookings.filter(b => !b.isB2b && !b.corporateGstin);

  const handleGenerateGstr1 = () => {
    const json = generateGstr1Json({
      bookings,
      month: selectedMonth,
      year: selectedYear,
      hotelGstin: HOTEL_CONFIG.gstin
    });
    setGstr1Preview(json);
  };

  const handleDownload = () => {
    if (!gstr1Preview) {
      const json = generateGstr1Json({
        bookings,
        month: selectedMonth,
        year: selectedYear,
        hotelGstin: HOTEL_CONFIG.gstin
      });
      downloadGstr1File(json, `GSTR1_${HOTEL_CONFIG.gstin}_${selectedMonth}${selectedYear}.json`);
    } else {
      downloadGstr1File(gstr1Preview, `GSTR1_${HOTEL_CONFIG.gstin}_${selectedMonth}${selectedYear}.json`);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: 1380, margin: '2rem auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-glow)', fontSize: '0.8rem', fontWeight: 600 }}>
            <FileText size={15} /> Statutory Taxation & GSTR-1 Generator
          </div>
          <h2 style={{ fontSize: '2rem' }}>Financial Invoicing & Government GSTN Engine</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Hotel Sai International • GSTIN: {HOTEL_CONFIG.gstin} • State: 21-Odisha • SAC: 996311
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select 
            className="form-select" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
          >
            <option value="09">September (09)</option>
            <option value="10">October (10)</option>
            <option value="11">November (11)</option>
            <option value="12">December (12)</option>
          </select>
          <select 
            className="form-select" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <button 
            onClick={handleGenerateGstr1}
            className="btn-secondary-sapphire"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} /> Compile GSTR-1
          </button>
          <button 
            onClick={handleDownload}
            className="btn-primary-gold"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
          >
            <Download size={15} /> Download Official GSTR-1 JSON
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: 'rgba(6, 14, 26, 0.65)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gross Taxable Value (SAC 996311)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
            ₹{totalTaxable.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bookings.length} Registered Stays</div>
        </div>

        <div style={{ background: 'rgba(6, 14, 26, 0.65)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CGST 2.5% Collected</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-glow)', marginTop: '0.25rem' }}>
            ₹{totalCgst.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Central Goods & Service Tax</div>
        </div>

        <div style={{ background: 'rgba(6, 14, 26, 0.65)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SGST 2.5% Collected</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
            ₹{totalSgst.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Odisha State GST</div>
        </div>

        <div style={{ background: 'rgba(6, 14, 26, 0.65)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Invoice Turnovers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            ₹{totalGross.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>B2B + B2C Combined</div>
        </div>
      </div>

      {/* Official Government GSTN Specifications Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Table breakdown explanation */}
        <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--gold-glow)', marginBottom: '1rem' }}>
            Official GSTR-1 Return Tables (100% GSTN Compliant)
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--gold-glow)', fontWeight: 600 }}>Table 4A:</span>
              <span><strong>B2B Invoices</strong> - Corporate partner stays with verified GSTIN (JK Paper, IMFA, Utkal Alumina, ECoR). Includes ITC pass-through.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--sapphire-light)', fontWeight: 600 }}>Table 7:</span>
              <span><strong>B2C Small</strong> - Intra-state consumers and individual pilgrim stays under ₹2.5 Lakhs per invoice.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Table 12:</span>
              <span><strong>HSN/SAC Summary</strong> - Aggregated SAC 996311 (Hotel Accommodation) with gross value, taxable value, and tax breakdown.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: '#c084fc', fontWeight: 600 }}>Table 13:</span>
              <span><strong>Document Register</strong> - Tracks outward tax invoices issued (From HSI-0001 to latest), cancellations, and net count.</span>
            </li>
          </ul>
        </div>

        {/* Corporate Partners List */}
        <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#38bdf8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} /> Rayagada Corporate Partners (B2B Directory)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            {CORPORATE_PARTNERS.map(corp => (
              <div key={corp.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{corp.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GSTIN: <code>{corp.gstin}</code></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{corp.contractDiscount}% Off</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net {corp.creditDays} Days</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JSON Payload Inspection Box */}
      {gstr1Preview && (
        <div style={{ background: '#020617', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--gold-glow)', fontWeight: 600, fontSize: '0.9rem' }}>
              Government GSTR-1 JSON Output Preview (Ready for gst.gov.in Direct Upload):
            </span>
            <button onClick={handleDownload} className="btn-primary-gold" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>
              <Download size={14} /> Download .json
            </button>
          </div>
          <pre style={{
            color: '#a5f3fc',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.5)',
            padding: '1rem',
            borderRadius: '6px'
          }}>
            {JSON.stringify(gstr1Preview, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
