import React, { useState } from 'react';
import { 
  X, Utensils, Bell, CheckCircle2, Clock, Truck, 
  AlertCircle, ChefHat, DollarSign, Volume2, Sparkles
} from 'lucide-react';
import { playOrderAlert } from '../utils/soundAlert';

export default function LiveOrdersDrawerModal({
  isOpen,
  onClose,
  foodOrders = [],
  onUpdateOrderStatus,
  onBillToRoom
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'Received', 'Preparing', 'Out for Delivery', 'Delivered'
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  // Filter orders
  const filteredOrders = foodOrders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const newOrdersCount = foodOrders.filter(o => o.status === 'Received').length;
  const preparingCount = foodOrders.filter(o => o.status === 'Preparing').length;

  const handleTestSound = () => {
    playOrderAlert();
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
        maxWidth: '840px',
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
              background: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <Utensils size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                  Live Food Orders &amp; Kitchen Dispatch
                </h3>
                {newOrdersCount > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    animation: 'pulse 1.5s infinite'
                  }}>
                    {newOrdersCount} New
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Cannon Kitchen &amp; In-Room Dining Live KOT Monitoring &amp; Turnaround Dispatch
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleTestSound}
              title="Test Order Chime"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#cbd5e1',
                padding: '0.4rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Volume2 size={14} color="#fbbf24" /> Sound Test
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

        {/* Filter Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          padding: '0.75rem 1.5rem',
          background: 'rgba(0,0,0,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'all', label: `All Orders (${foodOrders.length})` },
            { id: 'Received', label: `🚨 Received (${newOrdersCount})`, alert: newOrdersCount > 0 },
            { id: 'Preparing', label: `👨‍🍳 In Kitchen (${preparingCount})` },
            { id: 'Out for Delivery', label: `🛵 Out for Delivery` },
            { id: 'Delivered', label: `✓ Delivered & Billed` }
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
                color: filter === t.id ? 'var(--gold-glow)' : t.alert ? '#f87171' : '#94a3b8',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 320 }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <Utensils size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No orders currently in this status</div>
              <div style={{ fontSize: '0.78rem', marginTop: 4 }}>New room orders from guest QR or POS will appear here live.</div>
            </div>
          ) : (
            filteredOrders.map(order => {
              const isReceived = order.status === 'Received';
              const isPreparing = order.status === 'Preparing';
              const isOut = order.status === 'Out for Delivery';
              const isDelivered = order.status === 'Delivered';

              return (
                <div
                  key={order.order_id || order.orderId}
                  style={{
                    background: isReceived ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: isReceived ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.1rem 1.25rem',
                    boxShadow: isReceived ? '0 0 15px rgba(239, 68, 68, 0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          background: '#0a192f',
                          color: 'var(--gold-glow)',
                          border: '1px solid var(--gold-glow)',
                          padding: '2px 10px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 800
                        }}>
                          Room {order.room_number || order.roomNumber}
                        </span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                          {order.guest_name || order.guestName}
                        </span>
                        {order.is_jain_satvik ? (
                          <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                            🌱 Satvik Pure Veg
                          </span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                        KOT #{order.order_id || order.orderId} • Outlet: {order.outlet || 'Cannon Kitchen'} • {new Date(order.created_at || Date.now()).toLocaleTimeString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                        ₹{Number(order.total_amount || order.totalAmount || 0).toFixed(2)}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isReceived ? 'rgba(239, 68, 68, 0.2)' : isPreparing ? 'rgba(251, 191, 36, 0.2)' : isOut ? 'rgba(56, 189, 248, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                        color: isReceived ? '#f87171' : isPreparing ? '#fbbf24' : isOut ? '#38bdf8' : '#34d399',
                        marginTop: 3
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.85rem',
                    fontSize: '0.82rem',
                    color: '#e2e8f0'
                  }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>
                          <strong>{item.quantity}x</strong> {item.name}
                        </span>
                        <span style={{ color: '#cbd5e1' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {isReceived && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.order_id || order.orderId, 'Preparing')}
                        style={{
                          background: '#fbbf24',
                          color: '#060e1a',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <ChefHat size={14} /> Send to Kitchen (Preparing)
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.order_id || order.orderId, 'Out for Delivery')}
                        style={{
                          background: '#38bdf8',
                          color: '#060e1a',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Truck size={14} /> Out for Delivery
                      </button>
                    )}

                    {(isPreparing || isOut) && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.order_id || order.orderId, 'Delivered')}
                        style={{
                          background: '#34d399',
                          color: '#060e1a',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <CheckCircle2 size={14} /> Delivered &amp; Complete
                      </button>
                    )}

                    {order.payment_status !== 'Billed to Room' && (
                      <button
                        onClick={() => {
                          if (onBillToRoom) {
                            onBillToRoom({
                              roomNumber: order.room_number || order.roomNumber,
                              orderId: order.order_id || order.orderId,
                              guestName: order.guest_name || order.guestName,
                              totalAmount: order.total_amount || order.totalAmount
                            });
                          }
                        }}
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid var(--gold-glow)',
                          color: 'var(--gold-glow)',
                          borderRadius: '6px',
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <DollarSign size={14} /> Bill to Room Master Folio
                      </button>
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
