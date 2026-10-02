import React, { useState } from 'react';
import { 
  Clock, UserCheck, LogOut, CheckCircle2, AlertCircle, 
  ArrowRight, Shield, User, Bed, Calendar, Phone, 
  Sparkles, Check, ChevronRight, RefreshCw, Filter,
  Building, IndianRupee, Layers
} from 'lucide-react';
import { maskAadhaar } from '../utils/security';

/**
 * TodayActivity Component - Inspired by The Wild Oasis Community PMS
 * Provides front-desk staff with an immediate, high-priority feed of:
 * 1. Today's Due In / Arrivals (with 1-click Fast In-Person Check-In)
 * 2. Today's Due Out / Departures (with 1-click Fast Check-Out & Auto-Housekeeping Dispatch)
 */
export default function TodayActivity({
  arrivals = [],
  departures = [],
  onFastCheckIn,
  onFastCheckOut,
  onViewFolio,
  onViewGrc,
  onRefresh,
  fromDate = null,
  toDate = null,
  isFiltered = false
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'arrivals', 'departures'
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const totalActivities = arrivals.length + departures.length;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(26, 38, 57, 0.95))',
      border: '1px solid rgba(212, 175, 55, 0.35)',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
    }}>
      {/* Header Bar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{
              background: 'rgba(212, 175, 55, 0.18)',
              color: 'var(--gold-glow)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}>
              THE WILD OASIS OPERATIONAL FEED
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="var(--gold-glow)" /> Front-Desk Daily Action Center
            </span>
          </div>

          <h3 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#fff',
            margin: '0.35rem 0 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {isFiltered && fromDate && toDate 
              ? `Operational Activity (${fromDate} to ${toDate})` 
              : "Today's Operational Activity"}
            <span style={{
              background: totalActivities > 0 ? '#f59e0b' : '#34d399',
              color: '#060e1a',
              fontSize: '0.75rem',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {totalActivities} Active
            </span>
            {isFiltered && (
              <span style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                📅 Filter Active
              </span>
            )}
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isFiltered && fromDate && toDate
              ? `Showing arrivals and departures active between ${fromDate} and ${toDate}`
              : "Streamlined arrivals verification & automated housekeeping checkout turnover"}
          </p>
        </div>

        {/* Filter Pills & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            background: 'rgba(6, 14, 26, 0.85)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => setFilterMode('all')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterMode === 'all' ? 'var(--gold-glow)' : 'transparent',
                color: filterMode === 'all' ? '#060e1a' : '#94a3b8',
                border: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              All ({totalActivities})
            </button>
            <button
              onClick={() => setFilterMode('arrivals')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterMode === 'arrivals' ? '#38bdf8' : 'transparent',
                color: filterMode === 'arrivals' ? '#060e1a' : '#94a3b8',
                border: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📥 Arrivals ({arrivals.length})
            </button>
            <button
              onClick={() => setFilterMode('departures')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterMode === 'departures' ? '#fb923c' : 'transparent',
                color: filterMode === 'departures' ? '#060e1a' : '#94a3b8',
                border: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📤 Departures ({departures.length})
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            title="Refresh Feed"
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--gold-glow)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid: Arrivals & Departures side-by-side or stacked based on filter */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: filterMode === 'all' ? 'repeat(auto-fit, minmax(380px, 1fr))' : '1fr',
        gap: '1.25rem',
        marginTop: '1.25rem'
      }}>
        {/* SECTION 1: ARRIVALS QUEUE */}
        {(filterMode === 'all' || filterMode === 'arrivals') && (
          <div style={{
            background: 'rgba(6, 14, 26, 0.55)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.65rem',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  ARRIVING TODAY
                </span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                  {arrivals.length} Guest{arrivals.length !== 1 ? 's' : ''} Scheduled
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Standard Check-In: 11:00 AM
              </span>
            </div>

            {arrivals.length === 0 ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={24} color="#34d399" />
                <span>All scheduled arrivals for today have been checked in!</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {arrivals.map((booking) => {
                  const depositPaid = Number(booking.advanceDeposit || 0);
                  const isDepositFull = depositPaid >= Number(booking.totalAmount || 0);
                  const balanceDue = Math.max(0, Number(booking.totalAmount || 0) - depositPaid);

                  return (
                    <div
                      key={booking.bookingId || booking.id || Math.random()}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ minWidth: 200, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{
                            background: '#0284c7',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px'
                          }}>
                            Room {booking.roomNumber}
                          </span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                            {booking.guestName}
                          </span>
                          {booking.isB2b && (
                            <span style={{
                              background: 'rgba(167, 139, 250, 0.2)',
                              color: '#c084fc',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              Corporate BTC
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span>📞 {booking.guestPhone || 'Phone on file'}</span>
                          <span>• {booking.tier || 'Room'}</span>
                          <span>• {booking.nights || 1} Night{booking.nights > 1 ? 's' : ''}</span>
                        </div>

                        <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                          {isDepositFull ? (
                            <span style={{ color: '#34d399', fontWeight: 700 }}>
                              ✓ Full Advance Paid (₹{Number(booking.totalAmount).toLocaleString('en-IN')})
                            </span>
                          ) : depositPaid > 0 ? (
                            <span style={{ color: 'var(--gold-glow)', fontWeight: 700 }}>
                              ₹{depositPaid.toLocaleString('en-IN')} Advance Paid • ₹{balanceDue.toLocaleString('en-IN')} Due on Arrival
                            </span>
                          ) : (
                            <span style={{ color: '#f87171', fontWeight: 700 }}>
                              Pay at Desk: ₹{Number(booking.totalAmount || 1699).toLocaleString('en-IN')}
                            </span>
                          )}
                          <span style={{ color: '#64748b' }}>|</span>
                          <span style={{ color: '#cbd5e1' }}>
                            ID: {booking.idProofType || 'Govt ID'} ({booking.idProofMasked || 'Pending Scan'})
                          </span>
                        </div>
                      </div>

                      {/* Action Button: In-Person Fast Check-In */}
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {onViewGrc && (
                          <button
                            onClick={() => onViewGrc(booking)}
                            title="View / Print Guest Registration Card"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#cbd5e1',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            📄 GRC
                          </button>
                        )}
                        <button
                          onClick={() => onFastCheckIn(booking)}
                          className="btn-primary-gold"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 2px 10px rgba(212, 175, 55, 0.25)'
                          }}
                        >
                          <UserCheck size={14} /> Check In
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: DEPARTURES QUEUE */}
        {(filterMode === 'all' || filterMode === 'departures') && (
          <div style={{
            background: 'rgba(6, 14, 26, 0.55)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.65rem',
              borderBottom: '1px solid rgba(251, 146, 60, 0.2)',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  background: 'rgba(251, 146, 60, 0.2)',
                  color: '#fb923c',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  DEPARTING TODAY
                </span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                  {departures.length} Room{departures.length !== 1 ? 's' : ''} Due Out
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Standard Checkout: 12:00 PM
              </span>
            </div>

            {departures.length === 0 ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={24} color="#34d399" />
                <span>No pending check-outs scheduled for today.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {departures.map((item) => {
                  const roomNumber = item.roomNumber;
                  const guestName = item.currentGuestName || item.guestName || 'In-House Guest';
                  const balanceDue = Number(item.outstandingBalance !== undefined ? item.outstandingBalance : (item.balanceDue || 0));
                  const isZeroBalance = balanceDue <= 0.01;

                  return (
                    <div
                      key={roomNumber || Math.random()}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(251, 146, 60, 0.25)',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ minWidth: 200, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{
                            background: '#ea580c',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px'
                          }}>
                            Room {roomNumber}
                          </span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                            {guestName}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span>Floor {item.floor || Math.floor(Number(roomNumber) / 100) || 2}</span>
                          <span>• {item.tier || 'Room'}</span>
                          <span>• Keycard Handover Pending</span>
                        </div>

                        <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                          {isZeroBalance ? (
                            <span style={{
                              color: '#34d399',
                              fontWeight: 700,
                              background: 'rgba(52, 211, 153, 0.15)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid rgba(52, 211, 153, 0.3)'
                            }}>
                              ✓ Zero Balance (Clear to Depart)
                            </span>
                          ) : (
                            <span style={{
                              color: '#f87171',
                              fontWeight: 800,
                              background: 'rgba(239, 68, 68, 0.15)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                              ₹{balanceDue.toLocaleString('en-IN')} Folio Balance Due
                            </span>
                          )}
                          <span style={{ color: '#facc15', fontSize: '0.7rem' }}>
                            🧹 Automatic Vacant Dirty Dispatch
                          </span>
                        </div>
                      </div>

                      {/* Action Button: Check Out */}
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {onViewFolio && (
                          <button
                            onClick={() => onViewFolio(item)}
                            title="Inspect Master Folio & Incurred Charges"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#cbd5e1',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Folio
                          </button>
                        )}
                        <button
                          onClick={() => onFastCheckOut(item)}
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            border: '1px solid #ea580c',
                            background: isZeroBalance ? '#10b981' : '#ea580c',
                            color: '#fff',
                            boxShadow: '0 2px 10px rgba(234, 88, 12, 0.25)'
                          }}
                        >
                          <LogOut size={14} /> Check Out
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
