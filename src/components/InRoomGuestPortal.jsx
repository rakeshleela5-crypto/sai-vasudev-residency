import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Utensils, Bell, Wifi, Phone, Clock, CheckCircle2, 
  Sparkles, Coffee, Droplets, Bed, Wrench, ShieldCheck, 
  Plus, Minus, ShoppingBag, X, Send, Search, Check, AlertCircle, MessageCircle
} from 'lucide-react';
import { RESTAURANT_MENU, HOTEL_CONFIG } from '../data/hotelData';
import { sendInRoomConciergeWhatsApp } from '../utils/whatsappDispatch';

export default function InRoomGuestPortal({
  roomNumber = '204',
  onPlaceFoodOrder,
  onRequestRoomService,
  onExitToFullWebsite,
  activeFoodOrders = [],
  activeRoomServices = []
}) {
  // 3 Primary Tabs
  const [activeTab, setActiveTab] = useState('dining'); // 'dining', 'services', 'wifi'

  // Dining Sub-States
  const [diningCategory, setDiningCategory] = useState('All');
  const [satvikOnly, setSatvikOnly] = useState(false);
  const [searchDish, setSearchDish] = useState('');
  const [cart, setCart] = useState([]);
  const [cookingNotes, setCookingNotes] = useState('');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');

  // Room Services Sub-States
  const [customServiceDesc, setCustomServiceDesc] = useState('');
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState('');

  // Wi-Fi QR
  const [wifiQrUrl, setWifiQrUrl] = useState('');
  const [copiedWifi, setCopiedWifi] = useState(false);

  // Generate Wi-Fi QR code
  useEffect(() => {
    const wifiString = `WIFI:S:Hotel_Sai_Guest;T:WPA;P:SaiRayagada765;H:false;;`;
    QRCode.toDataURL(wifiString, {
      width: 320,
      margin: 2,
      color: { dark: '#0a192f', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    })
      .then(url => setWifiQrUrl(url))
      .catch(err => console.error('Wi-Fi QR error:', err));
  }, []);

  // Filter Menu
  const categories = ['All', 'Chef Specials', 'Odia Delicacies', 'Satvik & Jain', 'Main Course', 'Rice & Breads', 'Beverages'];
  
  const filteredDishes = RESTAURANT_MENU.filter(dish => {
    if (satvikOnly && !dish.isJain) return false;
    if (diningCategory === 'Chef Specials' && !dish.isSpecial) return false;
    if (diningCategory !== 'All' && diningCategory !== 'Chef Specials' && dish.category !== diningCategory) return false;
    if (searchDish.trim()) {
      const q = searchDish.toLowerCase();
      return dish.name.toLowerCase().includes(q) || dish.itemCode.includes(q) || (dish.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Cart operations
  const addToCart = (dish) => {
    const existing = cart.find(c => c.dish.id === dish.id);
    if (existing) {
      setCart(cart.map(c => c.dish.id === dish.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { dish, quantity: 1 }]);
    }
  };

  const removeFromCart = (dishId) => {
    const existing = cart.find(c => c.dish.id === dishId);
    if (!existing) return;
    if (existing.quantity === 1) {
      setCart(cart.filter(c => c.dish.id !== dishId));
    } else {
      setCart(cart.map(c => c.dish.id === dishId ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const getDishPrice = (dish) => dish.roomServicePrice || Math.round(dish.price * 1.10);

  const cartTotal = cart.reduce((sum, c) => sum + (getDishPrice(c.dish) * c.quantity), 0);
  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  // Submit in-room food order
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const orderId = `KOT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      orderId,
      roomNumber,
      outlet: 'Cannon Kitchen (Room Service)',
      orderType: 'room',
      status: 'Received',
      items: cart.map(c => ({
        name: c.dish.name,
        quantity: c.quantity,
        price: getDishPrice(c.dish),
        notes: cookingNotes || (c.dish.isJain ? 'Satvik Pure Veg' : '')
      })),
      totalAmount: cartTotal,
      is_jain_satvik: cart.some(c => c.dish.isJain) ? 1 : 0,
      captain: 'In-Room QR Order',
      created_at: new Date().toISOString()
    };

    if (onPlaceFoodOrder) {
      onPlaceFoodOrder(newOrder);
    }

    setOrderSuccessMsg(`✓ Order #${orderId} placed! Kitchen is preparing your dishes.`);
    setCart([]);
    setCookingNotes('');
    setTimeout(() => setOrderSuccessMsg(''), 6000);
  };

  // Quick Room Service Request Presets
  const QUICK_SERVICES = [
    {
      id: 'water',
      title: 'Extra Drinking Water',
      desc: '2x Kinley 1L sealed mineral water bottles with clean glasses',
      icon: <Droplets size={22} color="#38bdf8" />,
      type: 'Extra Water'
    },
    {
      id: 'linen',
      title: 'Fresh Towels & Linen',
      desc: '2x fresh plush terry bath towels and 2x pillow covers',
      icon: <Bed size={22} color="#a855f7" />,
      type: 'Linen Change'
    },
    {
      id: 'cleaning',
      title: 'Room Cleaning & Turn-Down',
      desc: 'Floor mopping, waste bin disposal, and fresh bed making',
      icon: <Sparkles size={22} color="#fbbf24" />,
      type: 'Housekeeping'
    },
    {
      id: 'toiletries',
      title: 'Ayurvedic Toiletries Kit',
      desc: 'Herbal soap, gentle shampoo, dental kit, and body lotion',
      icon: <ShieldCheck size={22} color="#34d399" />,
      type: 'Toiletries'
    },
    {
      id: 'kettle',
      title: 'Tea & Coffee Kettle Refill',
      desc: 'Taj Mahal tea bags, Bru coffee sachets, creamer, and sugar',
      icon: <Coffee size={22} color="#f97316" />,
      type: 'Kettle Refill'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Assistance',
      desc: 'Geyser hot water check, AC remote, TV setup, or router check',
      icon: <Wrench size={22} color="#ef4444" />,
      type: 'Maintenance'
    }
  ];

  const handleSendServiceRequest = (serviceType, description) => {
    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      requestId: reqId,
      roomNumber,
      serviceType,
      description,
      priority: 'Normal',
      status: 'Pending',
      assignedStaff: 'On-Duty Steward',
      requestedAt: new Date().toISOString()
    };

    if (onRequestRoomService) {
      onRequestRoomService(newReq);
    }

    setServiceSuccessMsg(`✓ ${serviceType} request received for Room ${roomNumber}! Attendant dispatched (ETA ~10 mins).`);
    setCustomServiceDesc('');
    setTimeout(() => setServiceSuccessMsg(''), 6000);
  };

  const handleCopyWifi = () => {
    navigator.clipboard.writeText('SaiRayagada765');
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  // Filter active orders and service calls for this room
  const thisRoomOrders = activeFoodOrders.filter(o => o.roomNumber === roomNumber);
  const thisRoomServices = activeRoomServices.filter(s => s.roomNumber === roomNumber);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050b14 0%, #0a1120 50%, #030712 100%)',
      color: '#fff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '560px',
      margin: '0 auto',
      boxShadow: '0 0 50px rgba(0,0,0,0.8)',
      position: 'relative',
      paddingBottom: cart.length > 0 ? '110px' : '30px'
    }}>
      {/* Top Header Card */}
      <header style={{
        padding: '1.25rem 1.25rem 1rem',
        background: 'linear-gradient(135deg, rgba(20,25,40,0.95), rgba(10,15,25,0.98))',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                background: 'rgba(212, 175, 55, 0.2)',
                color: 'var(--gold-glow, #fbbf24)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {HOTEL_CONFIG.name.toUpperCase()}
              </span>
            </div>
            <h1 style={{
              margin: '0.25rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              <span>Room {roomNumber}</span>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>Digital Guest Key</span>
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => sendInRoomConciergeWhatsApp({
                roomNumber,
                guestName: `Room ${roomNumber} Guest`,
                serviceType: 'Front Desk Concierge',
                details: 'Guest requested direct WhatsApp Concierge chat.'
              })}
              style={{
                background: 'rgba(37, 211, 102, 0.15)',
                border: '1px solid #25D366',
                color: '#4ade80',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Chat directly with Front Desk on WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </button>
            <a
              href="tel:+917978043585"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Phone size={13} />
              <span>Call Desk</span>
            </a>
          </div>
        </div>

        {/* 3 Core In-Room Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.4rem',
          marginTop: '1rem',
          background: 'rgba(0,0,0,0.4)',
          padding: '0.25rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            onClick={() => setActiveTab('dining')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              background: activeTab === 'dining' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: activeTab === 'dining' ? '#000' : 'var(--text-muted, #94a3b8)',
              transition: 'all 0.15s ease'
            }}
          >
            <Utensils size={16} />
            <span>Food Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              background: activeTab === 'services' ? 'linear-gradient(135deg, #38bdf8, #0284c7)' : 'transparent',
              color: activeTab === 'services' ? '#000' : 'var(--text-muted, #94a3b8)',
              transition: 'all 0.15s ease'
            }}
          >
            <Bell size={16} />
            <span>Room Services</span>
          </button>

          <button
            onClick={() => setActiveTab('wifi')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              background: activeTab === 'wifi' ? 'linear-gradient(135deg, #34d399, #059669)' : 'transparent',
              color: activeTab === 'wifi' ? '#000' : 'var(--text-muted, #94a3b8)',
              transition: 'all 0.15s ease'
            }}
          >
            <Wifi size={16} />
            <span>Guest Wi-Fi</span>
          </button>
        </div>
      </header>

      {/* Main Tab Views */}
      <main style={{ flex: 1, padding: '1rem 1.25rem' }}>
        {/* ========================================================
            TAB 1: IN-ROOM FOOD MENU & ORDERING
            ======================================================== */}
        {activeTab === 'dining' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Status Banner */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem'
            }}>
              <div>
                <strong style={{ color: '#fbbf24' }}>Cannon Kitchen is Open</strong>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                  24x7 In-Room Service • Freshly Cooked • ~20 Mins
                </div>
              </div>
              <span style={{
                background: '#10b981',
                width: 10,
                height: 10,
                borderRadius: '50%',
                boxShadow: '0 0 10px #10b981'
              }} />
            </div>

            {/* Active Orders Tracker for this Room */}
            {thisRoomOrders.length > 0 && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '12px',
                padding: '0.85rem 1rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} /> Active In-Room Orders:
                </div>
                {thisRoomOrders.map(ord => (
                  <div key={ord.orderId || ord.order_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '0.35rem 0', borderBottom: '1px dotted rgba(255,255,255,0.1)' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#fff' }}>#{ord.orderId || ord.order_id}</span>
                      <span style={{ color: '#94a3b8', marginLeft: '0.35rem' }}>
                        ({ord.items?.length || 1} items • ₹{ord.totalAmount})
                      </span>
                    </div>
                    <span style={{
                      background: ord.status === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: ord.status === 'Delivered' ? '#34d399' : '#fbbf24',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Success Toast */}
            {orderSuccessMsg && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{orderSuccessMsg}</span>
              </div>
            )}

            {/* Dietary Toggle & Search */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={searchDish}
                  onChange={(e) => setSearchDish(e.target.value)}
                  placeholder="Search dishes (e.g. Paneer, Rice)..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.5rem 0.5rem 2rem',
                    background: '#0d1525',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <button
                onClick={() => setSatvikOnly(!satvikOnly)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: satvikOnly ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                  background: satvikOnly ? 'rgba(16, 185, 129, 0.2)' : '#0d1525',
                  color: satvikOnly ? '#34d399' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={13} color={satvikOnly ? '#34d399' : '#94a3b8'} />
                Satvik Only
              </button>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setDiningCategory(cat)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: diningCategory === cat ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                    background: diningCategory === cat ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: diningCategory === cat ? '#fbbf24' : '#cbd5e1'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dish Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredDishes.map(dish => {
                const inCart = cart.find(c => c.dish.id === dish.id);
                const price = getDishPrice(dish);

                return (
                  <div
                    key={dish.id}
                    style={{
                      background: 'linear-gradient(145deg, #0e1726, #090e18)',
                      border: inCart ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{
                          width: 13,
                          height: 13,
                          border: dish.isVeg ? '1.5px solid #16a34a' : '1.5px solid #dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '2px'
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: dish.isVeg ? '#16a34a' : '#dc2626'
                          }} />
                        </span>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>
                          {dish.name}
                        </h4>
                      </div>

                      {dish.isJain && (
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          marginBottom: '0.25rem'
                        }}>
                          🌿 Satvik (No Onion / Garlic)
                        </span>
                      )}

                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.3' }}>
                        {dish.description || dish.category}
                      </p>

                      <div style={{ marginTop: '0.35rem', fontWeight: 800, color: 'var(--gold-glow, #fbbf24)', fontSize: '0.95rem' }}>
                        ₹{price}
                      </div>
                    </div>

                    {/* Quantity or Add Button */}
                    <div>
                      {inCart ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid #f59e0b',
                          borderRadius: '8px',
                          padding: '0.25rem 0.4rem'
                        }}>
                          <button
                            onClick={() => removeFromCart(dish.id)}
                            style={{
                              background: '#f59e0b',
                              border: 'none',
                              color: '#000',
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', minWidth: 18, textAlign: 'center' }}>
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(dish)}
                            style={{
                              background: '#f59e0b',
                              border: 'none',
                              color: '#000',
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(dish)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fbbf24',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Plus size={13} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ROOM SERVICES & HOUSEKEEPING CARE
            ======================================================== */}
        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '10px',
              padding: '0.85rem 1rem'
            }}>
              <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>Instant Room Assistance</strong>
              <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>
                Tap any button below to notify hotel housekeeping. Our attendant will arrive at Room {roomNumber} in ~10 minutes.
              </p>
            </div>

            {/* Success Toast */}
            {serviceSuccessMsg && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{serviceSuccessMsg}</span>
              </div>
            )}

            {/* Active Requests Tracker */}
            {thisRoomServices.length > 0 && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '12px',
                padding: '0.85rem 1rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} /> Active Service Calls for Room {roomNumber}:
                </div>
                {thisRoomServices.map(req => (
                  <div key={req.requestId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '0.35rem 0', borderBottom: '1px dotted rgba(255,255,255,0.1)' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#fff' }}>{req.serviceType}</span>
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{req.description}</div>
                    </div>
                    <span style={{
                      background: req.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                      color: req.status === 'Resolved' ? '#34d399' : '#c084fc',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick 1-Tap Service Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {QUICK_SERVICES.map(srv => (
                <div
                  key={srv.id}
                  style={{
                    background: 'linear-gradient(145deg, #0e1726, #090e18)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {srv.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
                        {srv.title}
                      </h4>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.3' }}>
                        {srv.desc}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                    <button
                      onClick={() => handleSendServiceRequest(srv.type, srv.desc)}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Request
                    </button>
                    <button
                      type="button"
                      onClick={() => sendInRoomConciergeWhatsApp({
                        roomNumber,
                        guestName: `Room ${roomNumber} Guest`,
                        serviceType: srv.type,
                        details: srv.desc
                      })}
                      style={{
                        background: 'rgba(37, 211, 102, 0.15)',
                        border: '1px solid #25D366',
                        color: '#4ade80',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Send directly to Front Desk WhatsApp"
                    >
                      <MessageCircle size={11} /> WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Request Box */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1rem',
              marginTop: '0.5rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#fff' }}>
                Any other request?
              </h4>
              <textarea
                value={customServiceDesc}
                onChange={(e) => setCustomServiceDesc(e.target.value)}
                placeholder="e.g. Please send extra blankets, dental kit, or wake-up call at 6:00 AM..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: '#0d1525',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={() => {
                  if (!customServiceDesc.trim()) return;
                  handleSendServiceRequest('Special Request', customServiceDesc);
                }}
                disabled={!customServiceDesc.trim()}
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.6rem',
                  background: customServiceDesc.trim() ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                  color: customServiceDesc.trim() ? '#000' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: customServiceDesc.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Send Request to Reception
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: GUEST WI-FI CONNECT & QR
            ======================================================== */}
        {activeTab === 'wifi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                color: '#34d399'
              }}>
                <Wifi size={26} />
              </div>
              <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                High-Speed Fiber Wi-Fi
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Complimentary 100 Mbps fiber internet for in-room guests.
              </p>
            </div>

            {/* Scannable Wi-Fi QR Card */}
            <div style={{
              background: '#ffffff',
              padding: '1.25rem',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {wifiQrUrl ? (
                <img
                  src={wifiQrUrl}
                  alt="Wi-Fi QR Code"
                  style={{ width: 220, height: 220, display: 'block' }}
                />
              ) : (
                <div style={{ width: 220, height: 220, background: '#eee' }} />
              )}
              <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Scan with camera to auto-connect
              </div>
            </div>

            {/* Network Credentials Box */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(145deg, #0e1726, #090e18)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '1.25rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Wi-Fi Network (SSID)
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                  Hotel_Sai_Guest
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Network Password
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginTop: '4px'
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '1px' }}>
                    SaiRayagada765
                  </span>
                  <button
                    onClick={handleCopyWifi}
                    style={{
                      background: copiedWifi ? '#10b981' : '#f59e0b',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {copiedWifi ? <Check size={12} /> : null}
                    {copiedWifi ? 'Copied!' : 'Copy Password'}
                  </button>
                </div>
              </div>

              <div style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}>
                <span>Speed: <strong style={{ color: '#34d399' }}>100 Mbps Unlimited</strong></span>
                <span>Security: <strong style={{ color: '#fff' }}>WPA2 Protected</strong></span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Drawer (When items are in cart) */}
      {cart.length > 0 && activeTab === 'dining' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '560px',
          margin: '0 auto',
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), #090e18)',
          borderTop: '1.5px solid #f59e0b',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.8)',
          padding: '1rem 1.25rem',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{
                background: '#f59e0b',
                color: '#000',
                width: 24,
                height: 24,
                borderRadius: '50%',
                fontWeight: 900,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartItemCount}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                Your Room {roomNumber} Order
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Amount: </span>
              <strong style={{ color: 'var(--gold-glow, #fbbf24)', fontSize: '1.1rem' }}>₹{cartTotal}</strong>
            </div>
          </div>

          {/* Quick Cooking Instruction Note */}
          <input
            type="text"
            value={cookingNotes}
            onChange={(e) => setCookingNotes(e.target.value)}
            placeholder="Special instructions (e.g. less spicy, extra hot)..."
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              background: '#0d1525',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.75rem',
              marginBottom: '0.65rem',
              boxSizing: 'border-box'
            }}
          />

          <button
            onClick={handlePlaceOrder}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem'
            }}
          >
            <Send size={16} /> Place Order &amp; Bill to Room {roomNumber}
          </button>
        </div>
      )}

      {/* Subtle Footer Link to Full Website */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem 1rem 1rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 'auto'
      }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', color: '#64748b' }}>
          {HOTEL_CONFIG.name} • Near Andhra Bank, New Colony, Rayagada • Direct In-Room Companion
        </p>
        {onExitToFullWebsite && (
          <button
            onClick={onExitToFullWebsite}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Visiting with friends? Explore Full Hotel Website &rarr;
          </button>
        )}
      </footer>
    </div>
  );
}
