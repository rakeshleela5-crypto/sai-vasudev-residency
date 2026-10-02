import React, { useState } from 'react';
import { 
  X, BellRing, Sparkles, CheckCircle2, Clock, User, 
  AlertTriangle, Plus, Droplets, BedDouble, Wrench, ShieldCheck
} from 'lucide-react';

export default function RoomServicesCareModal({
  isOpen,
  onClose,
  rooms = [],
  staff = [],
  serviceRequests = [],
  onAddRequest,
  onUpdateRequestStatus
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'Pending', 'In Progress', 'Completed'
  const [showNewForm, setShowNewForm] = useState(false);
  const [roomNumber, setRoomNumber] = useState('101');
  const [serviceType, setServiceType] = useState('Housekeeping');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [assignedStaff, setAssignedStaff] = useState('Duty Boy');

  if (!isOpen) return null;

  const pendingCount = serviceRequests.filter(r => r.status === 'Pending').length;
  const inProgressCount = serviceRequests.filter(r => r.status === 'In Progress').length;

  const filteredRequests = serviceRequests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleSubmitNew = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReq = {
      requestId: `REQ-${Date.now().toString().slice(-6)}`,
      roomNumber,
      serviceType,
      description,
      priority,
      status: 'Pending',
      assignedStaff,
      requestedAt: new Date().toISOString()
    };

    if (onAddRequest) {
      onAddRequest(newReq);
    }

    setDescription('');
    setShowNewForm(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #060e1a 100%)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(212, 175, 55, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'rgba(250, 204, 21, 0.15)',
              border: '1px solid #facc15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#facc15'
            }}>
              <BellRing size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                  Room Services &amp; Guest Care Dispatch
                </h3>
                {pendingCount > 0 && (
                  <span style={{
                    background: '#f59e0b',
                    color: '#060e1a',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                39-Room Guest Care, Housekeeping Requests, Extra Linen &amp; Turnaround Tickets
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              style={{
                background: 'var(--gold-glow)',
                color: '#060e1a',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Plus size={15} /> Lodge Service Call
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* New Ticket Form (Collapsible) */}
        {showNewForm && (
          <form 
            onSubmit={handleSubmitNew}
            style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(212, 175, 55, 0.06)',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem'
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: 3 }}>
                Room Number:
              </label>
              <select
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.45rem',
                  fontSize: '0.85rem'
                }}
              >
                {rooms.map(r => (
                  <option key={r.roomNumber} value={r.roomNumber}>
                    Room {r.roomNumber} ({r.tier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: 3 }}>
                Service Category:
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.45rem',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Housekeeping">Housekeeping / Cleaning</option>
                <option value="Linen Change">Linen &amp; Towel Change</option>
                <option value="Extra Water">Extra Mineral Water Bottles</option>
                <option value="Toiletries">Dental Kit / Soap / Toiletries</option>
                <option value="Luggage Assistance">Luggage &amp; Porter Assistance</option>
                <option value="Maintenance">Geyser / AC / Electrical Fix</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: 3 }}>
                Priority Level:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.45rem',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Normal">Normal (ETA 30 Mins)</option>
                <option value="High">High (ETA 15 Mins)</option>
                <option value="Urgent">🚨 Urgent (Immediate / VIP)</option>
                <option value="Low">Low (Next Housekeeping Round)</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: 3 }}>
                Guest Request Details / Special Instructions:
              </label>
              <input
                type="text"
                placeholder="e.g. Guest requested 2 extra Kinley water bottles and 2 fresh bath towels"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#94a3b8',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: 'var(--gold-glow)',
                  border: 'none',
                  color: '#060e1a',
                  padding: '0.4rem 1.1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Dispatch Ticket
              </button>
            </div>
          </form>
        )}

        {/* Filter Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          padding: '0.75rem 1.5rem',
          background: 'rgba(0,0,0,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {[
            { id: 'all', label: `All Requests (${serviceRequests.length})` },
            { id: 'Pending', label: `⏳ Pending (${pendingCount})`, alert: pendingCount > 0 },
            { id: 'In Progress', label: `🔄 In Progress (${inProgressCount})` },
            { id: 'Completed', label: `✓ Resolved & Closed` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: filter === t.id ? '1px solid var(--gold-glow)' : '1px solid transparent',
                background: filter === t.id ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: filter === t.id ? 'var(--gold-glow)' : t.alert ? '#f59e0b' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Request Tickets List */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: 300 }}>
          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 0.75rem auto', color: '#34d399', opacity: 0.6 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>All guest care requests are clear!</div>
              <div style={{ fontSize: '0.78rem', marginTop: 4 }}>Any incoming front desk service calls will appear here.</div>
            </div>
          ) : (
            filteredRequests.map(req => {
              const isPending = req.status === 'Pending';
              const isInProgress = req.status === 'In Progress';
              const isCompleted = req.status === 'Completed';

              return (
                <div
                  key={req.requestId || req.request_id}
                  style={{
                    background: isPending ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: isPending ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                      <span style={{
                        background: '#0a192f',
                        color: 'var(--gold-glow)',
                        border: '1px solid var(--gold-glow)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 800
                      }}>
                        Room {req.roomNumber || req.room_number}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        {req.serviceType || req.service_type}
                      </span>
                      {req.priority === 'Urgent' && (
                        <span style={{ background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                          URGENT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {req.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                      Lodge Time: {new Date(req.requestedAt || req.requested_at || Date.now()).toLocaleTimeString()} • Staff Assigned: <strong>{req.assignedStaff || req.assigned_staff || 'Duty Boy'}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {isPending && (
                      <button
                        onClick={() => onUpdateRequestStatus(req.requestId || req.request_id, 'In Progress')}
                        style={{
                          background: '#facc15',
                          color: '#060e1a',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Assign &amp; In Progress
                      </button>
                    )}

                    {(isPending || isInProgress) && (
                      <button
                        onClick={() => onUpdateRequestStatus(req.requestId || req.request_id, 'Completed')}
                        style={{
                          background: '#34d399',
                          color: '#060e1a',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <CheckCircle2 size={13} /> Mark Resolved
                      </button>
                    )}

                    {isCompleted && (
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={15} /> Closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
