import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Clock, MapPin, ShieldCheck, Utensils, FileText, CreditCard } from 'lucide-react';

const FAQS = [
  {
    id: 'checkin',
    icon: Clock,
    question: "What are the standard check-in and check-out timings?",
    answer: "Standard Check-In is at 12:00 PM (Noon) and Check-Out is at 12:00 PM (24-hour stay cycle). Early check-in and late check-out are subject to real-time room availability and can be coordinated directly with our 24/7 reception desk at +91 6856 225555."
  },
  {
    id: 'proximity',
    icon: MapPin,
    question: "How close is the hotel to Rayagada Railway Station & Maa Majhighariani Temple?",
    answer: "Sri Sai Vasudev Residency is centrally located Near Andhra Bank, New Colony, Rayagada. Rayagada Railway Junction (RGDA) is just 1.5 km away (a 5-minute drive; complimentary station pickup is included for Executive & Suite guests). The sacred Maa Majhighariani Temple is only 2.0 km away (7-minute drive) with specialized early morning darshan coordination."
  },
  {
    id: 'id-proof',
    icon: ShieldCheck,
    question: "What government identity proofs are mandatory for check-in?",
    answer: "As mandated by the District Police Administration under the Sarai Act 1867, every adult guest (18+ years) must present an original government-issued photo ID at check-in (Aadhaar, Passport, Voter ID, or Driving License). Under UIDAI guidelines, we only record masked Aadhaar numbers (last 4 digits) for your privacy. PAN cards are not accepted as proof of address."
  },
  {
    id: 'satvik-dining',
    icon: Utensils,
    question: "Do you serve authentic Odia cuisine and pure Satvik / Jain food?",
    answer: "Yes. Our in-house Fenugreek Restaurant specializes in authentic regional Odia delicacies (such as Dalma, Pakhala Thali, and fresh Rayagada Chhena Poda) as well as 100% pure vegetarian, onion-garlic-free Satvik and Jain thalis prepared according to strict dietary traditions."
  },
  {
    id: 'corporate-gst',
    icon: FileText,
    question: "Can we receive corporate GST tax invoices for business travel?",
    answer: "Absolutely. We generate Rule 46 compliant B2B tax invoices carrying our Odisha GSTIN (21AEKPP8689J1ZS) with statutory SAC codes (996311 for room accommodation, 996331 for dining). Corporate guests from JK Paper, IMFA, Utkal Alumina, and East Coast Railway can enter their company GSTIN during reservation to pass through 100% Input Tax Credit (ITC)."
  },
  {
    id: 'refund-policy',
    icon: CreditCard,
    question: "What is your reservation cancellation and refund policy?",
    answer: "Cancellations submitted more than 48 hours prior to check-in receive a 100% full refund (less gateway fees). Cancellations between 24 to 48 hours receive a 50% refund. Cancellations within 24 hours of arrival or no-shows are non-refundable to cover inventory displacement. Refunds are disbursed to the original UPI/bank account within 5–7 banking days."
  }
];

export default function FaqSection({ onOpenBooking }) {
  const [openId, setOpenId] = useState('checkin');

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" style={{
      padding: '5rem 1.5rem',
      background: 'linear-gradient(180deg, #060e1a 0%, #0c182b 100%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.15)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '9999px',
            color: '#d4af37',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem'
          }}>
            <HelpCircle size={14} />
            Guest Inquiries & Transparency
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.2rem',
            color: '#ffffff',
            letterSpacing: '0.02em',
            marginBottom: '0.5rem'
          }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: 600, margin: '0 auto' }}>
            Everything you need to know regarding check-in procedures, temple transit, Satvik dining, and corporate invoicing at Rayagada's premier hospitality address.
          </p>
        </div>

        {/* Accordion List */}
        {/* Accordion List with Emil Kowalski Fluid CSS Grid Motion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {FAQS.map(faq => {
            const Icon = faq.icon;
            const isOpen = openId === faq.id;

            return (
              <div 
                key={faq.id}
                style={{
                  background: isOpen ? 'linear-gradient(135deg, rgba(12, 24, 43, 0.95), rgba(18, 34, 60, 0.9))' : 'rgba(6, 14, 26, 0.65)',
                  border: isOpen ? '1px solid var(--gold-glow)' : '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '14px',
                  boxShadow: isOpen ? '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.15)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
                  overflow: 'hidden',
                  transition: 'transform 0.24s var(--ease-luxury), box-shadow 0.24s ease, border-color 0.24s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                  }
                }}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s ease'
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      padding: '0.5rem',
                      borderRadius: '10px',
                      background: isOpen ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(243, 198, 76, 0.15))' : 'rgba(255, 255, 255, 0.05)',
                      border: isOpen ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isOpen ? 'var(--gold-glow)' : '#94a3b8',
                      transition: 'all 0.24s var(--ease-luxury)'
                    }}>
                      <Icon size={19} />
                    </div>
                    <span style={{ fontSize: '1.02rem', fontWeight: 700, color: isOpen ? '#fff' : '#e2e8f0', letterSpacing: '0.01em' }}>
                      {faq.question}
                    </span>
                  </div>

                  <div style={{
                    color: isOpen ? 'var(--gold-glow)' : '#64748b',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s var(--ease-spring), color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ChevronDown size={22} />
                  </div>
                </button>

                {/* Smooth CSS Grid Accordion Drawer */}
                <div 
                  id={`faq-answer-${faq.id}`}
                  className={`accordion-grid ${isOpen ? 'is-open' : ''}`}
                >
                  <div className="accordion-inner">
                    <div style={{
                      padding: '0.2rem 1.6rem 1.4rem 4.1rem',
                      fontSize: '0.9rem',
                      lineHeight: 1.65,
                      color: '#cbd5e1',
                      borderTop: '1px solid rgba(212, 175, 55, 0.12)'
                    }}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assistance Banner */}
        <div style={{
          marginTop: '2.5rem',
          textAlign: 'center',
          background: 'rgba(12, 24, 43, 0.5)',
          border: '1px dashed rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
              Have a special request or large group reservation?
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Our front desk manager is on duty 24/7 at +91 6856 225555.
            </div>
          </div>

          <button
            onClick={onOpenBooking}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
          >
            Reserve Your Room Direct
          </button>
        </div>

      </div>
    </section>
  );
}
