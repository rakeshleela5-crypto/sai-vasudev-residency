import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Utensils, AlertCircle, MessageCircle } from 'lucide-react';
import { RESTAURANT_MENU, HOTEL_CONFIG } from '../data/hotelData';
import { playSuccessChime } from '../utils/soundAlert';
import { sendRoomServiceOrderWhatsApp } from '../utils/whatsappDispatch';

export default function FoodOrderModal({ isOpen, onClose, initialItem = null, rooms = [], onBillToRoom }) {
  const [cart, setCart] = useState(initialItem ? [{ ...initialItem, qty: 1 }] : []);
  const [roomNumber, setRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [billingMode, setBillingMode] = useState('Bill to Room Folio');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const addItemToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const gst = Math.round(subtotal * 0.05 * 100) / 100; // 5% Restaurant GST
  const total = subtotal + gst;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!roomNumber) return;

    setSubmitting(true);
    const kotId = `IR-KOT-${Date.now().toString().slice(-4)}`;
    const itemsDescription = cart.map(c => `${c.qty}x ${c.name}`).join(', ');

    const payload = {
      kotId,
      roomNumber,
      guestName: guestName || `Room ${roomNumber} Guest`,
      items: cart,
      subtotal,
      gst,
      totalAmount: total,
      isJain: cart.some(i => i.isJain),
      billingMode
    };

    try {
      // Connect to central Front Desk & Accountant Folio Pipeline
      if (billingMode === 'Bill to Room Folio' && onBillToRoom) {
        onBillToRoom({
          kotId,
          roomNumber,
          outlet: 'In-Room Dining (Satvik Tray)',
          items: cart,
          grossSubtotal: subtotal,
          discount: 0,
          discountReason: 'None',
          subtotal,
          gst,
          totalAmount: total,
          isNonCommercial: false,
          description: `In-Room Dining (${itemsDescription})`,
          captainName: 'In-Room Service Captain',
          createdAt: new Date().toISOString()
        });
      } else {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'place_food_order', payload })
        }).catch(() => {});
      }
      const orderSummary = {
        orderId: kotId,
        roomNumber,
        guestName,
        items: cart,
        totalAmount: total,
        notes: `Billing: ${billingMode}. Satvik pure vegetarian kitchen preparation.`
      };
      setLastPlacedOrder(orderSummary);
      playSuccessChime();
      setOrderSubmitted(true);
    } catch (err) {
      console.warn("Order sync note:", err);
      const fallbackOrder = {
        orderId: kotId,
        roomNumber,
        guestName,
        items: cart,
        totalAmount: total,
        notes: `Billing: ${billingMode}. Satvik pure vegetarian preparation.`
      };
      setLastPlacedOrder(fallbackOrder);
      playSuccessChime();
      setOrderSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 540 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={20} color="var(--gold-glow)" />
            <h3 style={{ fontSize: '1.2rem' }}>In-Room Odia &amp; Satvik Dining Tray</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {orderSubmitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
                Order Dispatched to Kitchen!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Your order for <strong>Room {roomNumber}</strong> has been transmitted to our Satvik kitchen. Delivery estimate: 20-25 minutes.
              </p>

              {/* WhatsApp KOT & Slip Dispatch Bar */}
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (lastPlacedOrder) {
                      sendRoomServiceOrderWhatsApp(lastPlacedOrder, 'kitchen');
                    }
                  }}
                  style={{
                    padding: '0.55rem 1rem',
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                  }}
                  title="Dispatch Kitchen Order Ticket directly to Chef WhatsApp"
                >
                  <MessageCircle size={15} /> WhatsApp KOT to Chef
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (lastPlacedOrder) {
                      sendRoomServiceOrderWhatsApp(lastPlacedOrder, 'guest');
                    }
                  }}
                  style={{
                    padding: '0.55rem 1rem',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid #38bdf8',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                  title="Send itemized order slip to Guest WhatsApp"
                >
                  <MessageCircle size={15} /> WhatsApp Order Slip
                </button>
              </div>

              <button 
                onClick={() => {
                  setOrderSubmitted(false);
                  setCart([]);
                  onClose();
                }} 
                className="btn-primary-gold"
                style={{ padding: '0.6rem 1.8rem' }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder}>
              {/* Room Key Picker */}
              <div className="form-group">
                <label className="form-label">Deliver to Room Key (18 Inventory)</label>
                <select 
                  className="form-select"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                >
                  <option value="">-- Choose In-House Room --</option>
                  {rooms.map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • {r.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Tray Items ({cart.reduce((sum, i) => sum + i.qty, 0)})
                </label>
                {cart.length === 0 ? (
                  <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: 'rgba(6, 14, 26, 0.5)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem'
                  }}>
                    Your dining tray is empty. Add dishes below:
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                      {RESTAURANT_MENU.slice(0, 3).map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => addItemToCart(m)}
                          className="btn-outline-gold"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          + {m.name} (₹{m.price})
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cart.map(item => (
                      <div 
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(6, 14, 26, 0.6)',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price} each</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <button 
                            type="button" 
                            onClick={() => updateQty(item.id, -1)}
                            style={{ 
                              padding: '0.3rem 0.5rem', 
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.88)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center', color: '#fff' }}>{item.qty}</span>
                          <button 
                            type="button" 
                            onClick={() => updateQty(item.id, 1)}
                            style={{ 
                              padding: '0.3rem 0.5rem', 
                              borderRadius: '6px',
                              background: 'rgba(212, 175, 55, 0.2)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              color: 'var(--gold-glow)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.88)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                          <span style={{ fontWeight: 800, minWidth: '65px', textAlign: 'right', color: 'var(--gold-glow)' }}>
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtotal Calculation Box */}
              {cart.length > 0 && (
                <div style={{
                  background: 'rgba(12, 24, 43, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    <span>Food Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                    <span>Restaurant GST 5% (SAC 996331):</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '0.5rem', fontWeight: 800, color: 'var(--gold-glow)', fontSize: '1rem' }}>
                    <span>Total Billed:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Billing Mode */}
              <div className="form-group">
                <label className="form-label">Payment Settlement Mode</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Bill to Room Folio', 'UPI on Delivery', 'Cash on Delivery'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBillingMode(mode)}
                      style={{
                        flex: 1,
                        padding: '0.55rem 0.3rem',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: billingMode === mode ? 700 : 500,
                        background: billingMode === mode ? 'linear-gradient(135deg, var(--gold-glow) 0%, #b8860b 100%)' : 'rgba(6, 14, 26, 0.7)',
                        color: billingMode === mode ? '#060e1a' : '#94a3b8',
                        border: billingMode === mode ? '1px solid var(--gold-glow)' : '1px solid rgba(212, 175, 55, 0.25)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, background 0.2s ease',
                        boxShadow: billingMode === mode ? '0 0 12px rgba(212, 175, 55, 0.3)' : 'none'
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="btn-outline-gold" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || cart.length === 0 || !roomNumber}
                  className="btn-primary-gold" 
                  style={{ 
                    flex: 2, 
                    justifyContent: 'center', 
                    opacity: (cart.length === 0 || !roomNumber) ? 0.6 : 1,
                    fontWeight: 700
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {submitting ? 'Dispatching...' : `Confirm Order • ₹${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
