import React, { useState, useRef, useEffect } from 'react';
import { 
  UtensilsCrossed, Plus, Minus, Trash2, Printer, CheckCircle2, 
  Search, Hash, DollarSign, Smartphone, Bed, ShieldCheck, X, 
  Send, Sparkles, Clock, AlertCircle, ArrowRightLeft, MessageCircle, FilePlus,
  FileSpreadsheet, Download, ChefHat, Bell, Volume2, VolumeX, Truck, Flame, RefreshCw, Eye, AlertTriangle, Filter,
  CreditCard, QrCode
} from 'lucide-react';
import { RESTAURANT_MENU, HOTEL_CONFIG, MYPOS_CANNON_KITCHEN_LAYOUT } from '../data/hotelData';
import { playOrderAlert, playSuccessChime } from '../utils/soundAlert';
import UniversalDateFilterBar from './UniversalDateFilterBar';
import { SheetsEditableCell, SheetsColumnHeader, SheetsToolbarLegend } from './UniversalInlineEditor';

export default function CannonKitchenPOS({
  isOpen,
  onClose,
  rooms = [],
  onBillToRoom,
  foodOrders: propFoodOrders,
  onUpdateOrderStatus: propUpdateOrderStatus,
  onAddFoodOrder: propAddFoodOrder
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  // View Mode: 'tableGrid' | 'menu' | 'liveOrders' (Kitchen Display System)
  const [posViewMode, setPosViewMode] = useState('tableGrid');

  // Live Food Orders Data (KDS Queue)
  const DEFAULT_KITCHEN_ORDERS = [
    {
      orderId: 'KOT-8491',
      roomNumber: '204',
      guestName: 'BIJAY PASWAN',
      outlet: 'Cannon Kitchen',
      orderType: 'room',
      status: 'Received',
      items: [
        { name: 'Paneer Butter Masala', quantity: 1, price: 240, notes: 'Stone-ground mustard gravy, mild' },
        { name: 'Butter Tandoori Roti', quantity: 4, price: 30, notes: 'Freshly baked and crisp' },
        { name: 'Jeera Rice', quantity: 1, price: 160, notes: 'Fragrant cumin tadka' }
      ],
      totalAmount: 520,
      is_jain_satvik: 0,
      captain: 'KOTI',
      created_at: new Date(Date.now() - 6 * 60000).toISOString()
    },
    {
      orderId: 'KOT-8492',
      roomNumber: '102',
      guestName: 'UTKARSH SRIVASTAVA',
      outlet: 'Cannon Kitchen',
      orderType: 'room',
      status: 'Received',
      items: [
        { name: 'Dal Tadka (Satvik Pure Veg)', quantity: 1, price: 180, notes: 'No Onion, No Garlic, Desi Ghee' },
        { name: 'Steamed Basmati Rice', quantity: 2, price: 90, notes: 'Hot steamed fresh' },
        { name: 'Curd & Salad Platter', quantity: 1, price: 80, notes: 'Chilled cucumber & lemon' }
      ],
      totalAmount: 440,
      is_jain_satvik: 1,
      captain: 'SADANANDA',
      created_at: new Date(Date.now() - 2 * 60000).toISOString()
    },
    {
      orderId: 'KOT-7514',
      tableNumber: '6',
      guestName: 'P. K. Mohapatra',
      outlet: 'Cannon Kitchen',
      orderType: 'table',
      status: 'Preparing',
      items: [
        { name: 'Mutton Kassa (Odisha Style)', quantity: 2, price: 420, notes: 'Spicy mustard & whole spices' },
        { name: 'Butter Tandoori Roti', quantity: 6, price: 25, notes: 'Extra butter' },
        { name: 'Fresh Lime Soda (Sweet/Salt)', quantity: 2, price: 70, notes: 'Chilled with ice' }
      ],
      totalAmount: 1190,
      is_jain_satvik: 0,
      captain: 'KOTI',
      created_at: new Date(Date.now() - 14 * 60000).toISOString()
    },
    {
      orderId: 'KOT-7515',
      tableNumber: 'B',
      guestName: 'Dr. Tripathy',
      outlet: 'Drop In Bar',
      orderType: 'table',
      status: 'Preparing',
      items: [
        { name: 'Chicken Dum Biryani (Chef Special)', quantity: 2, price: 260, notes: 'Dum cooked, with raita' },
        { name: 'Chilli Chicken Dry', quantity: 1, price: 240, notes: 'Crispy starter' }
      ],
      totalAmount: 760,
      is_jain_satvik: 0,
      captain: 'SADANANDA',
      created_at: new Date(Date.now() - 18 * 60000).toISOString()
    }
  ];

  const [localFoodOrders, setLocalFoodOrders] = useState(DEFAULT_KITCHEN_ORDERS);
  const currentOrders = (propFoodOrders && propFoodOrders.length > 0) ? propFoodOrders : localFoodOrders;

  // KDS Filters & Sound Controls
  const [kdsStatusFilter, setKdsStatusFilter] = useState('all'); // 'all', 'Received', 'Preparing', 'Out for Delivery', 'Delivered'
  const [kdsOutletFilter, setKdsOutletFilter] = useState('all'); // 'all', 'Cannon Kitchen', 'Drop In Bar', 'Room Service', 'Online'
  const [kdsSearchQuery, setKdsSearchQuery] = useState('');
  const [kdsSoundEnabled, setKdsSoundEnabled] = useState(true);

  // KOT Slip Printable Ticket Modal
  const [printKotModalOrder, setPrintKotModalOrder] = useState(null);

  // Live KOT Void Confirmation Modal
  const [voidKotOrder, setVoidKotOrder] = useState(null);
  const [voidKotReason, setVoidKotReason] = useState('Guest Changed Mind');
  const [voidKotCustomNote, setVoidKotCustomNote] = useState('');

  // Outlet selection: 'Cannon Kitchen (Dine-In)', 'Bar Outlet', 'Room Service', 'Swiggy / Zomato'
  const [selectedOutlet, setSelectedOutlet] = useState('Cannon Kitchen');
  
  // Table or Room selector
  const [orderType, setOrderType] = useState('room'); // 'room', 'table', 'delivery'
  const [targetRoom, setTargetRoom] = useState('402');
  const [tableNumber, setTableNumber] = useState('6');
  const [captainName, setCaptainName] = useState('KOTI');

  // Fast numeric code input state
  const [codeQuery, setCodeQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const codeInputRef = useRef(null);

  // Cart / KOT Items with Cooking Modifiers
  const [cart, setCart] = useState([
    {
      item: RESTAURANT_MENU.find(m => m.itemCode === '214') || RESTAURANT_MENU[4],
      quantity: 1,
      notes: 'Stone-ground mustard gravy',
      cookingTags: ['Satvik', 'Mild']
    },
    {
      item: RESTAURANT_MENU.find(m => m.itemCode === '307') || RESTAURANT_MENU[7],
      quantity: 2,
      notes: 'Extra hot and steamed fresh',
      cookingTags: ['Spicy']
    }
  ]);

  // Item Void / Cancellation State with Mandatory Reason
  const [voidTargetIndex, setVoidTargetIndex] = useState(null);
  const [voidReason, setVoidReason] = useState('Guest Changed Mind');
  const [voidCustomNote, setVoidCustomNote] = useState('');
  const [voidAuditLogs, setVoidAuditLogs] = useState([]);

  // Bill Discount & NC (Non-Commercial) Billing State
  const [discountType, setDiscountType] = useState('none'); // 'none', 'percentage', 'flat'
  const [discountValue, setDiscountValue] = useState(10);
  const [discountReason, setDiscountReason] = useState('Managing Director Courtesy');
  const [isNonCommercial, setIsNonCommercial] = useState(false);
  const [ncReason, setNcReason] = useState('Managing Director Eswara VIP Dining');

  const [kotSentSuccess, setKotSentSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  // Custom / Off-Menu Dish State (Open Item Punch)
  const [customDishModalOpen, setCustomDishModalOpen] = useState(false);
  const [customDishName, setCustomDishName] = useState('');
  const [customDishPrice, setCustomDishPrice] = useState('');
  const [customDishCategory, setCustomDishCategory] = useState('Chef Special / Custom Prep');

  // Table Shift & Merge Modal State
  const [tableShiftModalOpen, setTableShiftModalOpen] = useState(false);
  const [tableShiftTarget, setTableShiftTarget] = useState('8');
  const [tableMergeModalOpen, setTableMergeModalOpen] = useState(false);
  const [tableMergeSource, setTableMergeSource] = useState('7');
  const [tableMergeTarget, setTableMergeTarget] = useState('6');

  // Sheet 2 Requirement: Daily Item Sales & Quantity Register (Sale ఆ వివరణ)
  const [showDailySalesModal, setShowDailySalesModal] = useState(false);
  const [dailySalesCategoryFilter, setDailySalesCategoryFilter] = useState('all');
  const [salesFromDate, setSalesFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [salesToDate, setSalesToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSalesDateFilterActive, setIsSalesDateFilterActive] = useState(false);

  // Direct Table Bill Settlement Modal & Dynamic UPI QR State
  const [tableSettlementModalOpen, setTableSettlementModalOpen] = useState(false);
  const [settlementPaymentMode, setSettlementPaymentMode] = useState('cash'); // 'cash', 'upi', 'card', 'split'
  const [cashTendered, setCashTendered] = useState('');
  const [splitCashAmount, setSplitCashAmount] = useState('');
  const [guestPhoneForInvoice, setGuestPhoneForInvoice] = useState('');
  const [settledTaxReceipt, setSettledTaxReceipt] = useState(null);
  const [managerVoidPin, setManagerVoidPin] = useState('');
  const [managerPinError, setManagerPinError] = useState('');

  const [dailySalesItems, setDailySalesItems] = useState([
    { code: '102', name: 'Chicken Dum Biryani (Chef Special)', cat: 'Food (Non-Veg)', qty: 38, rate: 260, totalSales: 9880 },
    { code: '101', name: 'Butter Chicken Boneless', cat: 'Food (Non-Veg)', qty: 24, rate: 320, totalSales: 7680 },
    { code: '214', name: 'Mushroom Masala (Code 214)', cat: 'Food (Veg)', qty: 26, rate: 220, totalSales: 5720 },
    { code: '215', name: 'Paneer Butter Masala', cat: 'Food (Veg)', qty: 32, rate: 210, totalSales: 6720 },
    { code: '307', name: 'Plain Steamed Rice (Code 307)', cat: 'Food (Rice & Breads)', qty: 55, rate: 90, totalSales: 4950 },
    { code: '308', name: 'Dal Fry (Yellow Lentils Tadka)', cat: 'Food (Rice & Breads)', qty: 42, rate: 140, totalSales: 5880 },
    { code: '309', name: 'Butter Tandoori Roti', cat: 'Food (Rice & Breads)', qty: 110, rate: 25, totalSales: 2750 },
    { code: '201', name: 'Mutton Kassa (Odisha Style)', cat: 'Food (Non-Veg)', qty: 14, rate: 420, totalSales: 5880 },
    { code: '202', name: 'Mutton Rogan Josh', cat: 'Food (Non-Veg)', qty: 12, rate: 440, totalSales: 5280 },
    { code: '103', name: 'Chilli Chicken Dry', cat: 'Food (Non-Veg)', qty: 18, rate: 240, totalSales: 4320 },
    { code: '401', name: 'Fresh Lime Soda (Sweet/Salt)', cat: 'Beverages', qty: 28, rate: 70, totalSales: 1960 },
    { code: '402', name: 'Packaged Mineral Water (1L)', cat: 'Beverages', qty: 45, rate: 30, totalSales: 1350 }
  ]);

  const handleDownloadDailySalesCSV = () => {
    const headers = ['Item Code', 'Item Description (వివరణ)', 'Category', 'Total Quantity Sold', 'Rate (INR)', 'Total Amount (INR)'];
    const rows = dailySalesItems.map(i => [
      i.code,
      `"${i.name}"`,
      i.cat,
      i.qty,
      i.rate,
      i.totalSales
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cannon_Kitchen_Daily_Sales_Quantity_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showPosToast('✓ Downloaded Daily Sales & Quantity CSV Report!');
  };

  const [posFeedbackToast, setPosFeedbackToast] = useState('');

  const showPosToast = (msg) => {
    setPosFeedbackToast(msg);
    setTimeout(() => setPosFeedbackToast(''), 4500);
  };

  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [isOpen]);

  // Determine price based on active outlet (Owner Requirement: Swiggy/Zomato Surge Pricing)
  const getItemPrice = (item) => {
    if (selectedOutlet === 'Room Service') return item.roomServicePrice || Math.round(item.price * 1.10);
    if (selectedOutlet === 'Swiggy' || selectedOutlet === 'Zomato') return item.swiggyPrice || Math.round(item.price * 1.25);
    if (selectedOutlet === 'Drop In Bar') return item.barPrice || Math.round(item.price * 1.05);
    return item.dineInPrice || item.price;
  };

  // Parse code and multiplier (e.g. "54*3", "3*54", "54x2", "2x54")
  const parseCodeAndQty = (input) => {
    const raw = (input || '').trim().toLowerCase();
    if (!raw) return { code: '', qty: 1 };
    
    if (raw.includes('*') || raw.includes('x')) {
      const sep = raw.includes('*') ? '*' : 'x';
      const parts = raw.split(sep).map(p => p.trim());
      if (parts.length === 2) {
        if (RESTAURANT_MENU.some(m => m.itemCode === parts[0])) {
          return { code: parts[0], qty: Math.max(1, parseInt(parts[1], 10) || 1) };
        }
        if (RESTAURANT_MENU.some(m => m.itemCode === parts[1])) {
          return { code: parts[1], qty: Math.max(1, parseInt(parts[0], 10) || 1) };
        }
        return { code: parts[0], qty: Math.max(1, parseInt(parts[1], 10) || 1) };
      }
    }
    return { code: raw, qty: 1 };
  };

  // Add item by numeric code (Fast Numpad Flow with Multiplier like 54*3)
  const handleCodeSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!codeQuery.trim()) return;

    const { code, qty } = parseCodeAndQty(codeQuery);
    const matched = RESTAURANT_MENU.find(m => m.itemCode === code);
    if (matched) {
      addItemToCart(matched, qty);
      setCodeQuery('');
      // Auto-switch to 'menu' catalog so the user sees the active catalog and item
      if (posViewMode === 'tableGrid') {
        setPosViewMode('menu');
      }
    } else {
      alert(`Item code "${code}" not found in Menu. Try 54 (Salt & Pepper Corn), 214 (Mushroom Masala), 307 (Rice) or 116 (Andhra Chicken).`);
    }
  };

  const addItemToCart = (item, qty = 1) => {
    const quantityToAdd = Math.max(1, qty);
    const existingIndex = cart.findIndex(c => c.item.id === item.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantityToAdd;
      setCart(updated);
    } else {
      setCart([...cart, { item, quantity: quantityToAdd, notes: '', cookingTags: [] }]);
    }
    const unitPrice = getItemPrice(item);
    showPosToast(`✓ Added ${quantityToAdd > 1 ? `${quantityToAdd}x ` : ''}[Code #${item.itemCode || '0'}] ${item.name} (₹${unitPrice * quantityToAdd}) to KOT Ticket!`);
    playSuccessChime();
  };

  const updateQuantity = (itemId, delta) => {
    const updated = cart.map(c => {
      if (c.item.id === itemId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter(Boolean);
    setCart(updated);
  };

  const toggleCookingTag = (index, tag) => {
    const updated = [...cart];
    const item = updated[index];
    const tags = item.cookingTags || [];
    if (tags.includes(tag)) {
      item.cookingTags = tags.filter(t => t !== tag);
    } else {
      item.cookingTags = [...tags, tag];
    }
    setCart(updated);
  };

  const handleConfirmItemVoid = () => {
    if (voidTargetIndex === null) return;
    const target = cart[voidTargetIndex];
    const voidRecord = {
      id: `VOID-${Date.now().toString().slice(-4)}`,
      itemName: target.item.name,
      itemCode: target.item.itemCode || '0',
      quantity: target.quantity,
      amount: getItemPrice(target.item) * target.quantity,
      reason: voidReason,
      notes: voidCustomNote || 'None',
      captain: captainName,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    // Dispatch to Cloudflare D1 restaurant_kot_voids table
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'log_kot_void',
        payload: {
          voidId: voidRecord.id,
          roomOrTable: orderType === 'room' ? `Room ${targetRoom}` : `Table ${tableNumber}`,
          itemCode: voidRecord.itemCode,
          itemName: voidRecord.itemName,
          quantity: voidRecord.quantity,
          amount: voidRecord.amount,
          reason: voidRecord.reason,
          notes: voidRecord.notes,
          captain: voidRecord.captain
        }
      })
    }).catch(err => console.warn('Offline void logging:', err));

    setVoidAuditLogs([voidRecord, ...voidAuditLogs]);
    setCart(cart.filter((_, idx) => idx !== voidTargetIndex));
    setVoidTargetIndex(null);
    setVoidCustomNote('');
  };

  // Add Custom / Off-Menu Open Dish to Cart
  const handleAddCustomDish = (e) => {
    e.preventDefault();
    if (!customDishName.trim() || !customDishPrice) return;
    const numPrice = Math.max(1, Number(customDishPrice) || 50);
    const customItem = {
      id: `CUSTOM-${Date.now().toString().slice(-5)}`,
      itemCode: '999',
      name: customDishName.trim(),
      category: customDishCategory,
      price: numPrice,
      dineInPrice: numPrice,
      roomServicePrice: Math.round(numPrice * 1.10),
      isCustom: true
    };
    addItemToCart(customItem);
    showPosToast(`✓ Added custom item "${customDishName}" (₹${numPrice}) to KOT!`);
    setCustomDishModalOpen(false);
    setCustomDishName('');
    setCustomDishPrice('');
  };

  // WhatsApp Dining Bill & Itemized KOT Dispatch
  const handleSendWhatsAppDiningBill = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add dishes to generate a bill.');
      return;
    }

    const itemsSummary = cart.map(c => 
      `• ${c.quantity}x ${c.item.name}${c.cookingTags?.length ? ` [${c.cookingTags.join(', ')}]` : ''} - ₹${(getItemPrice(c.item) * c.quantity).toFixed(0)}`
    ).join('\n');

    const discountSummary = calculatedDiscount > 0 
      ? `\nLess Discount (${isNonCommercial ? 'NC Comp' : discountReason}): -₹${calculatedDiscount.toFixed(2)}` 
      : '';

    const destinationLabel = orderType === 'room' 
      ? `Room Folio: Room ${targetRoom}` 
      : `Dine-In Table: Table ${tableNumber}`;

    const text = `🍽️ *CANNON KITCHEN & RESTAURANT - DINING BILL*
${HOTEL_CONFIG.name}, Rayagada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${new Date().toLocaleDateString('en-IN')} | Time: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
Outlet: ${selectedOutlet}
${destinationLabel}
Duty Captain: ${captainName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*ORDERED DISHES & KOT:*
${itemsSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gross Subtotal: ₹${grossSubtotal.toFixed(2)}${discountSummary}
GST @ 5% (SAC 996331): ₹${gst.toFixed(2)}
*TOTAL PAYABLE: ₹${isNonCommercial ? '0.00 (NC Comp Approved)' : netTotal.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Payment Options: Cash / SBI UPI QR / Bill to Room
UPI Payee VPA: eswara.hotel@sbi
Thank you for dining at Cannon Kitchen! 🙏`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    showPosToast('✓ Dining Bill formatted & dispatched to WhatsApp!');
  };

  // Table Shift / Reassignment Handler with Cloudflare D1 Sync
  const handleConfirmTableShift = (e) => {
    e.preventDefault();
    if (!tableShiftTarget) return;

    const oldTable = tableNumber;
    setTableNumber(tableShiftTarget);
    setTableShiftModalOpen(false);

    // Sync to Cloudflare D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'shift_table',
        payload: {
          fromTable: oldTable,
          toTable: tableShiftTarget,
          captain: captainName,
          reason: 'Floor Reassignment'
        }
      })
    }).catch(err => console.warn('Offline table shift fallback:', err));

    showPosToast(`✓ Table shifted from Table ${oldTable} to Table ${tableShiftTarget}! Active KOT transferred.`);
  };

  // Table Merge Handler with Cloudflare D1 Sync
  const handleConfirmTableMerge = (e) => {
    e.preventDefault();
    if (!tableMergeSource || !tableMergeTarget || tableMergeSource === tableMergeTarget) {
      alert('Source table and Target table must be distinct.');
      return;
    }

    setTableNumber(tableMergeTarget);
    setTableMergeModalOpen(false);

    // Sync to Cloudflare D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'merge_tables',
        payload: {
          sourceTable: tableMergeSource,
          targetTable: tableMergeTarget,
          captain: captainName
        }
      })
    }).catch(err => console.warn('Offline table merge fallback:', err));

    showPosToast(`✓ Table ${tableMergeSource} successfully merged into Table ${tableMergeTarget}! Kitchen orders combined.`);
  };

  // Tax calculations (F&B: 5% GST without ITC under SAC 996331) with Discount & NC Support
  const grossSubtotal = cart.reduce((sum, c) => sum + (getItemPrice(c.item) * c.quantity), 0);
  
  let calculatedDiscount = 0;
  if (!isNonCommercial) {
    if (discountType === 'percentage') {
      calculatedDiscount = (grossSubtotal * (Number(discountValue) || 0)) / 100;
    } else if (discountType === 'flat') {
      calculatedDiscount = Math.min(grossSubtotal, Number(discountValue) || 0);
    }
  } else {
    calculatedDiscount = grossSubtotal; // 100% complimentary NC
  }

  const taxableSubtotal = isNonCommercial ? 0 : Math.max(0, grossSubtotal - calculatedDiscount);
  const gst = isNonCommercial ? 0 : taxableSubtotal * 0.05;
  const netTotal = isNonCommercial ? 0 : taxableSubtotal + gst;

  // Live Food Orders status counters
  const receivedOrdersCount = currentOrders.filter(o => o.status === 'Received').length;
  const preparingOrdersCount = currentOrders.filter(o => o.status === 'Preparing').length;
  const outForDeliveryOrdersCount = currentOrders.filter(o => o.status === 'Out for Delivery').length;
  const deliveredOrdersCount = currentOrders.filter(o => o.status === 'Delivered').length;

  const getElapsedMinutes = (createdAt) => {
    if (!createdAt) return 0;
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const handleUpdateKdsStatus = (orderId, newStatus) => {
    if (propUpdateOrderStatus) {
      propUpdateOrderStatus(orderId, newStatus);
    }
    setLocalFoodOrders(prev => prev.map(o => {
      if ((o.orderId || o.order_id) === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));

    // Cloudflare Edge Sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'update_order_status',
        payload: { orderId, status: newStatus }
      })
    }).catch(err => console.warn('Offline order status sync:', err));

    if (kdsSoundEnabled && (newStatus === 'Preparing' || newStatus === 'Out for Delivery')) {
      playOrderAlert();
    }
    showPosToast(`✓ Order #${orderId} moved to "${newStatus}"!`);
  };

  const handleConfirmVoidKot = () => {
    if (!voidKotOrder) return;
    const orderId = voidKotOrder.orderId || voidKotOrder.order_id;
    handleUpdateKdsStatus(orderId, 'Voided');

    // Cloudflare Edge void audit logging
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'log_kot_void',
        payload: {
          voidId: `VOID-${Date.now().toString().slice(-6)}`,
          roomOrTable: voidKotOrder.roomNumber ? `Room ${voidKotOrder.roomNumber}` : `Table ${voidKotOrder.tableNumber || 'Unknown'}`,
          itemCode: 'KOT-ALL',
          itemName: `KOT #${orderId} (${voidKotOrder.items?.map(i => i.name).join(', ') || 'Dishes'})`,
          quantity: voidKotOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1,
          amount: voidKotOrder.totalAmount || 0,
          reason: voidKotReason,
          notes: voidKotCustomNote || 'Full KOT voided from Kitchen Display System',
          captain: voidKotOrder.captain || captainName
        }
      })
    }).catch(err => console.warn('Offline void sync:', err));

    showPosToast(`❌ KOT #${orderId} marked VOID (${voidKotReason})`);
    setVoidKotOrder(null);
    setVoidKotCustomNote('');
  };

  const handlePrintAndSendTableKOT = () => {
    if (cart.length === 0) return;
    const kotId = `CK-KOT-${Date.now().toString().slice(-4)}`;
    const newKotOrder = {
      orderId: kotId,
      tableNumber,
      roomNumber: null,
      guestName: `Table ${tableNumber} Guest`,
      outlet: selectedOutlet,
      orderType: 'table',
      status: 'Received',
      items: cart.map(c => ({
        name: c.item.name,
        quantity: c.quantity,
        price: getItemPrice(c.item),
        notes: `${c.notes || ''}${c.cookingTags?.length ? ` [${c.cookingTags.join(', ')}]` : ''}`
      })),
      totalAmount: netTotal,
      is_jain_satvik: cart.some(c => c.cookingTags?.includes('Satvik')) ? 1 : 0,
      captain: captainName,
      created_at: new Date().toISOString()
    };

    if (propAddFoodOrder) {
      propAddFoodOrder(newKotOrder);
    }
    setLocalFoodOrders(prev => [newKotOrder, ...prev]);

    if (kdsSoundEnabled) playOrderAlert();
    setPrintKotModalOrder(newKotOrder);
    setCart([]);
    showPosToast(`✓ KOT #${kotId} for Table ${tableNumber} sent to Kitchen KDS queue!`);
  };

  // Direct Table Bill Settlement (Cash, Dynamic UPI QR, Card, Split)
  const handleConfirmTableSettlement = () => {
    if (cart.length === 0) return;

    const invoiceId = `CK-INV-${Date.now().toString().slice(-4)}`;
    const billItems = cart.map(c => ({
      name: c.item.name,
      itemCode: c.item.itemCode || '0',
      quantity: c.quantity,
      price: getItemPrice(c.item),
      amount: getItemPrice(c.item) * c.quantity
    }));
    const totalPayable = netTotal;

    const receipt = {
      invoiceId,
      tableNumber,
      outlet: selectedOutlet,
      items: billItems,
      subtotal: taxableSubtotal,
      gst,
      totalAmount: totalPayable,
      paymentMode: settlementPaymentMode,
      cashTendered: settlementPaymentMode === 'cash' ? (parseFloat(cashTendered) || totalPayable) : null,
      changeDue: settlementPaymentMode === 'cash' ? Math.max(0, (parseFloat(cashTendered) || totalPayable) - totalPayable) : 0,
      splitDetails: settlementPaymentMode === 'split' ? {
        cash: parseFloat(splitCashAmount) || 0,
        upi: Math.max(0, totalPayable - (parseFloat(splitCashAmount) || 0))
      } : null,
      captain: captainName,
      created_at: new Date().toISOString()
    };

    setSettledTaxReceipt(receipt);
    setTableSettlementModalOpen(false);
    setCart([]);
    showPosToast(`✓ Table ${tableNumber} Settled (₹${totalPayable.toFixed(2)}) via ${settlementPaymentMode.toUpperCase()}!`);
    playSuccessChime();

    // Log settlement to local orders list as Delivered / Settled
    const settlementKot = {
      orderId: invoiceId,
      tableNumber,
      guestName: `Table ${tableNumber} Guest`,
      outlet: selectedOutlet,
      orderType: 'table',
      status: 'Delivered',
      items: billItems,
      totalAmount: totalPayable,
      captain: captainName,
      created_at: new Date().toISOString()
    };
    setLocalFoodOrders(prev => [settlementKot, ...prev]);

    // Cloudflare D1 Sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'record_table_settlement',
        payload: receipt
      })
    }).catch(err => console.debug('Settlement log:', err));
  };

  const handleSendSettlementWhatsApp = (customPhone = null) => {
    const data = settledTaxReceipt || {
      invoiceId: `CK-EST-${Date.now().toString().slice(-4)}`,
      tableNumber,
      totalAmount: netTotal,
      gst,
      items: cart.map(c => ({ name: c.item.name, quantity: c.quantity, price: getItemPrice(c.item) })),
      paymentMode: settlementPaymentMode
    };
    const phone = (customPhone || guestPhoneForInvoice || '').replace(/\D/g, '');
    const itemList = data.items.map(i => `• ${i.quantity}x ${i.name} = ₹${(i.quantity * i.price).toFixed(0)}`).join('\n');
    const msg = `*${HOTEL_CONFIG.name.toUpperCase()} - CANNON KITCHEN*\n` +
      `🧾 Tax Invoice: #${data.invoiceId}\n` +
      `🍽️ Table: ${data.tableNumber} | Rayagada (Odisha)\n` +
      `--------------------------------\n` +
      `${itemList}\n` +
      `--------------------------------\n` +
      `*Gross Total:* ₹${data.totalAmount.toFixed(2)}\n` +
      `(Includes 5% Restaurant GST - SAC 996331)\n` +
      `Payment Status: *PAID (${(data.paymentMode || 'UPI/Cash').toUpperCase()})*\n` +
      `GSTIN: ${HOTEL_CONFIG.gstin}\n` +
      `Thank you for dining with us! 🙏`;
    
    const url = phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Handle "Bill to Room" action with KDS routing
  const handleTransferToRoom = () => {
    if (cart.length === 0) return;

    const kotId = `CK-KOT-${Date.now().toString().slice(-4)}`;
    const itemsDescription = cart.map(c => {
      const tagStr = (c.cookingTags && c.cookingTags.length > 0) ? ` [${c.cookingTags.join(', ')}]` : '';
      return `${c.quantity}x ${c.item.name}${tagStr}`;
    }).join(', ');

    const payload = {
      kotId,
      roomNumber: targetRoom,
      outlet: selectedOutlet,
      items: cart,
      grossSubtotal,
      discount: calculatedDiscount,
      discountReason: isNonCommercial ? `NC Comp: ${ncReason}` : (discountType !== 'none' ? `${discountReason} (${discountType === 'percentage' ? discountValue + '%' : '₹' + discountValue})` : 'None'),
      subtotal: taxableSubtotal,
      gst,
      totalAmount: netTotal,
      isNonCommercial,
      ncReason: isNonCommercial ? ncReason : null,
      description: `${selectedOutlet} Order (${itemsDescription})${isNonCommercial ? ' [NC COMPLIMENTARY]' : ''}`,
      captainName,
      createdAt: new Date().toISOString()
    };

    if (onBillToRoom) {
      onBillToRoom(payload);
    }

    const newKotOrder = {
      orderId: kotId,
      roomNumber: targetRoom,
      tableNumber: null,
      guestName: rooms.find(r => r.number === targetRoom)?.guestName || `Room ${targetRoom} Guest`,
      outlet: selectedOutlet,
      orderType: 'room',
      status: 'Received',
      items: cart.map(c => ({
        name: c.item.name,
        quantity: c.quantity,
        price: getItemPrice(c.item),
        notes: `${c.notes || ''}${c.cookingTags?.length ? ` [${c.cookingTags.join(', ')}]` : ''}`
      })),
      totalAmount: netTotal,
      is_jain_satvik: cart.some(c => c.cookingTags?.includes('Satvik')) ? 1 : 0,
      captain: captainName,
      created_at: new Date().toISOString()
    };

    if (propAddFoodOrder) {
      propAddFoodOrder(newKotOrder);
    }
    setLocalFoodOrders(prev => [newKotOrder, ...prev]);

    if (kdsSoundEnabled) playOrderAlert();
    setLastOrderDetails(payload);
    setKotSentSuccess(true);
    setCart([]);
    showPosToast(`✓ In-Room KOT #${kotId} debited to Room ${targetRoom} & routed to Live KDS!`);
  };

  // Filtered menu list for visual clicking
  const filteredMenu = RESTAURANT_MENU.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.itemCode.includes(searchQuery);
    return matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1340,
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(90deg, rgba(25,20,10,0.95), rgba(15,12,8,0.98))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b' }}>
                HIGH-SPEED F&B POS
              </span>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Cannon Kitchen & Multi-Outlet Order Terminal
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Numpad short codes • Differential outlet pricing • Seamless "Bill to Room" Folio transfer
            </p>
          </div>

          {/* Outlet Selector Tabs (Official Outlets with Dynamic Channel Pricing) */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '10px', overflowX: 'auto' }}>
            {[
              { id: 'Cannon Kitchen', label: 'Cannon Kitchen', markup: 'Dine-In (Base Rate)' },
              { id: 'Drop In Bar', label: 'Drop In Bar', markup: 'Lounge (+5% Code D)' },
              { id: 'Room Service', label: 'Room Service', markup: '24x7 In-Room (+10%)' },
              { id: 'Swiggy', label: 'Swiggy Delivery', markup: 'Online (+25% Surge)' },
              { id: 'Zomato', label: 'Zomato Delivery', markup: 'Online (+25% Surge)' }
            ].map(outlet => (
              <button
                key={outlet.id}
                onClick={() => setSelectedOutlet(outlet.id)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  background: selectedOutlet === outlet.id ? 'var(--gold-primary)' : 'transparent',
                  color: selectedOutlet === outlet.id ? '#000' : 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <span>{outlet.label}</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.85 }}>{outlet.markup}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Bar (Screenshot 20: Table Grid vs Code Entry) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 1.75rem',
          background: 'rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPosViewMode('tableGrid')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: posViewMode === 'tableGrid' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: posViewMode === 'tableGrid' ? '#34d399' : 'var(--text-muted)',
                border: posViewMode === 'tableGrid' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '2px', background: '#10b981' }}></span>
              🔲 Dining Table Floor Grid
            </button>
            <button
              onClick={() => setPosViewMode('menu')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: posViewMode === 'menu' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: posViewMode === 'menu' ? '#fbbf24' : 'var(--text-muted)',
                border: posViewMode === 'menu' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              📋 Fast Code & Dish Catalog
            </button>
            <button
              onClick={() => setPosViewMode('liveOrders')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: posViewMode === 'liveOrders' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                color: posViewMode === 'liveOrders' ? '#f87171' : 'var(--text-muted)',
                border: posViewMode === 'liveOrders' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                position: 'relative'
              }}
            >
              <Flame size={13} color="#f87171" />
              🍳 Live Food Orders (KDS)
              {receivedOrdersCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {receivedOrdersCount} New
                </span>
              )}
            </button>
            <button
              onClick={() => setShowDailySalesModal(true)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: 'rgba(212, 175, 55, 0.2)',
                color: 'var(--gold-glow)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              📊 Daily Sales &amp; Qty (ఆ వివరణ)
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Duty Steward: <strong style={{ color: 'var(--gold-glow)' }}>{captainName}</strong></span>
            <span>Active Table: <strong style={{ color: '#38bdf8' }}>Table {tableNumber}</strong></span>
            <button
              type="button"
              onClick={() => setTableShiftModalOpen(true)}
              title="Shift or Reassign Dining Table"
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <ArrowRightLeft size={11} /> Shift Table
            </button>
            <span>Target Room: <strong style={{ color: '#34d399' }}>Room {targetRoom}</strong></span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {posViewMode === 'liveOrders' ? (
            /* ========================================================
               CANNON KITCHEN DISPLAY SYSTEM (KDS) & LIVE FOOD ORDERS
               ======================================================== */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#070b14', overflow: 'hidden' }}>
              {/* KDS Control Ribbon */}
              <div style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, rgba(20,15,10,0.95), rgba(10,14,24,0.98))',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f87171'
                  }}>
                    <ChefHat size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                        Live Kitchen Display System (KDS)
                      </span>
                      {receivedOrdersCount > 0 && (
                        <span style={{
                          background: '#ef4444',
                          color: '#fff',
                          padding: '1px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 800
                        }}>
                          {receivedOrdersCount} New Action Required
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Chef Station • 18 In-Room Dining &amp; 12 Dine-In Tables KOT Turnaround Monitor
                    </div>
                  </div>
                </div>

                {/* Status KPI Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All KOTs', count: currentOrders.length, color: '#94a3b8' },
                    { id: 'Received', label: '🚨 Received', count: receivedOrdersCount, color: '#ef4444' },
                    { id: 'Preparing', label: '👨‍🍳 Cooking', count: preparingOrdersCount, color: '#f59e0b' },
                    { id: 'Out for Delivery', label: '🛵 Ready/Dispatch', count: outForDeliveryOrdersCount, color: '#38bdf8' },
                    { id: 'Delivered', label: '✓ Delivered', count: deliveredOrdersCount, color: '#10b981' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setKdsStatusFilter(tab.id)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: kdsStatusFilter === tab.id ? `1px solid ${tab.color}` : '1px solid rgba(255,255,255,0.1)',
                        background: kdsStatusFilter === tab.id ? `${tab.color}22` : 'rgba(255,255,255,0.03)',
                        color: kdsStatusFilter === tab.id ? tab.color : '#cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{
                        background: kdsStatusFilter === tab.id ? tab.color : 'rgba(255,255,255,0.1)',
                        color: kdsStatusFilter === tab.id ? '#000' : '#fff',
                        padding: '1px 5px',
                        borderRadius: '8px',
                        fontSize: '0.65rem',
                        fontWeight: 800
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Right Quick Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      playOrderAlert();
                      showPosToast('🔔 Kitchen Order Bell chimed!');
                    }}
                    title="Ring Kitchen Order Bell"
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid #f59e0b',
                      color: '#fbbf24',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Bell size={13} /> Chime
                  </button>

                  <button
                    onClick={() => setKdsSoundEnabled(!kdsSoundEnabled)}
                    title={kdsSoundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
                    style={{
                      background: kdsSoundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                      border: kdsSoundEnabled ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      color: kdsSoundEnabled ? '#34d399' : '#94a3b8',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {kdsSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    {kdsSoundEnabled ? 'Audio ON' : 'Muted'}
                  </button>

                  <button
                    onClick={() => setPosViewMode('tableGrid')}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      border: 'none',
                      color: '#000',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Plus size={14} /> + Punch New Order
                  </button>
                </div>
              </div>

              {/* Authentic Mysoft Universal Date Range Selector Bar (Screenshot Identical) */}
              <div style={{ padding: '0.65rem 1.5rem 0', background: '#070b14' }}>
                <UniversalDateFilterBar
                  fromDate={salesFromDate}
                  toDate={salesToDate}
                  moduleType="pos"
                  auditItems={currentOrders}
                  onDateChange={(from, to) => {
                    setSalesFromDate(from);
                    setSalesToDate(to);
                  }}
                  onDisplay={(from, to) => {
                    setSalesFromDate(from);
                    setSalesToDate(to);
                    setIsSalesDateFilterActive(true);
                  }}
                  title="CANNON KITCHEN ORDER TRACKER &amp; KDS REGISTER"
                  onUpdateItem={(item, field, newVal) => {
                    setLocalFoodOrders(prev => prev.map(o => (o.id === item.id || o.orderId === item.orderId) ? { ...o, [field]: newVal } : o));
                    if (propUpdateOrderStatus && field === 'status') {
                      propUpdateOrderStatus(item.orderId || item.id, newVal);
                    }
                  }}
                  totalCount={currentOrders.length}
                  totalAmount={currentOrders.reduce((sum, o) => sum + (o.items?.reduce((s, it) => s + (it.price * it.quantity), 0) || 0), 0)}
                  onExportCSV={() => window.print()}
                  onPrint={() => window.print()}
                  compact={true}
                />
              </div>

              {/* Outlet Filter Bar & Search */}
              <div style={{
                padding: '0.5rem 1.5rem',
                background: 'rgba(0,0,0,0.3)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginRight: '0.25rem' }}>
                    <Filter size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                    Outlet:
                  </span>
                  {[
                    { id: 'all', label: 'All Outlets' },
                    { id: 'Cannon Kitchen', label: '🍽️ Cannon Kitchen' },
                    { id: 'Room Service', label: '🛏️ In-Room Dining' },
                    { id: 'Drop In Bar', label: '🍸 Drop In Bar' },
                    { id: 'Online', label: '🛵 Swiggy / Zomato' }
                  ].map(out => (
                    <button
                      key={out.id}
                      onClick={() => setKdsOutletFilter(out.id)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '5px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: kdsOutletFilter === out.id ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)',
                        background: kdsOutletFilter === out.id ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                        color: kdsOutletFilter === out.id ? '#fbbf24' : '#94a3b8'
                      }}
                    >
                      {out.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={kdsSearchQuery}
                    onChange={(e) => setKdsSearchQuery(e.target.value)}
                    placeholder="Search KOT, Room, Table, Dish..."
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.65rem 0.35rem 2rem',
                      background: '#0d111d',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.75rem'
                    }}
                  />
                  {kdsSearchQuery && (
                    <button
                      onClick={() => setKdsSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* KDS Ticket Cards Grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                {(() => {
                  const filteredList = currentOrders.filter(order => {
                    if (kdsStatusFilter !== 'all' && order.status !== kdsStatusFilter) return false;
                    if (kdsOutletFilter !== 'all') {
                      if (kdsOutletFilter === 'Cannon Kitchen' && order.outlet !== 'Cannon Kitchen') return false;
                      if (kdsOutletFilter === 'Drop In Bar' && order.outlet !== 'Drop In Bar') return false;
                      if (kdsOutletFilter === 'Room Service' && order.outlet !== 'Room Service' && order.orderType !== 'room') return false;
                      if (kdsOutletFilter === 'Online' && !['Swiggy', 'Zomato'].includes(order.outlet)) return false;
                    }
                    if (isSalesDateFilterActive && (order.date || order.created_at)) {
                      const d = (order.date || order.created_at).slice(0, 10);
                      if (d < salesFromDate || d > salesToDate) return false;
                    }
                    if (kdsSearchQuery.trim()) {
                      const q = kdsSearchQuery.toLowerCase();
                      const idMatch = (order.orderId || order.order_id || '').toLowerCase().includes(q);
                      const roomMatch = (order.roomNumber || '').toLowerCase().includes(q);
                      const tableMatch = (order.tableNumber || '').toLowerCase().includes(q);
                      const guestMatch = (order.guestName || '').toLowerCase().includes(q);
                      const itemMatch = order.items?.some(i => (i.name || '').toLowerCase().includes(q));
                      if (!idMatch && !roomMatch && !tableMatch && !guestMatch && !itemMatch) return false;
                    }
                    return true;
                  });

                  if (filteredList.length === 0) {
                    return (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem 1rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center'
                      }}>
                        <UtensilsCrossed size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: '#fbbf24' }} />
                        <h4 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>No Food Orders in this Queue</h4>
                        <p style={{ fontSize: '0.8rem', maxWidth: 420, margin: '0 0 1.25rem' }}>
                          There are currently no active KOT tickets matching the selected status or outlet filter.
                        </p>
                        <button
                          onClick={() => setPosViewMode('tableGrid')}
                          className="btn-primary"
                          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                          + Punch New Dining / Room Order
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                      gap: '1rem'
                    }}>
                      {filteredList.map(order => {
                        const orderId = order.orderId || order.order_id;
                        const elapsedMins = getElapsedMinutes(order.created_at);
                        const isDelayed = order.status !== 'Delivered' && elapsedMins >= 20;

                        // Status Color Mapping
                        let statusColor = '#94a3b8';
                        let statusBg = 'rgba(148, 163, 184, 0.15)';
                        let statusLabel = order.status;
                        if (order.status === 'Received') {
                          statusColor = '#ef4444';
                          statusBg = 'rgba(239, 68, 68, 0.2)';
                          statusLabel = '🚨 Received / New';
                        } else if (order.status === 'Preparing') {
                          statusColor = '#f59e0b';
                          statusBg = 'rgba(245, 158, 11, 0.2)';
                          statusLabel = '👨‍🍳 In Cooking';
                        } else if (order.status === 'Out for Delivery') {
                          statusColor = '#38bdf8';
                          statusBg = 'rgba(56, 189, 248, 0.2)';
                          statusLabel = '🛵 Out for Delivery';
                        } else if (order.status === 'Delivered') {
                          statusColor = '#10b981';
                          statusBg = 'rgba(16, 185, 129, 0.2)';
                          statusLabel = '✓ Delivered & Settled';
                        }

                        return (
                          <div
                            key={orderId}
                            style={{
                              background: 'linear-gradient(145deg, #0e1726, #090e18)',
                              border: order.status === 'Received'
                                ? '1.5px solid rgba(239, 68, 68, 0.6)'
                                : order.status === 'Preparing'
                                ? '1.5px solid rgba(245, 158, 11, 0.5)'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              padding: '1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                              boxShadow: order.status === 'Received'
                                ? '0 4px 20px rgba(239, 68, 68, 0.15)'
                                : '0 4px 15px rgba(0,0,0,0.5)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {/* Card Top: Order ID & Status */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{
                                  fontWeight: 800,
                                  fontSize: '0.95rem',
                                  color: '#fff',
                                  fontFamily: 'monospace'
                                }}>
                                  #{orderId}
                                </span>
                                <span style={{
                                  background: 'rgba(255,255,255,0.06)',
                                  color: '#cbd5e1',
                                  fontSize: '0.65rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {order.outlet || 'Cannon Kitchen'}
                                </span>
                              </div>

                              <span style={{
                                background: statusBg,
                                color: statusColor,
                                border: `1px solid ${statusColor}44`,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                {statusLabel}
                              </span>
                            </div>

                            {/* Destination & Elapsed Time */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(255,255,255,0.02)',
                              padding: '0.45rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {order.roomNumber ? (
                                  <span style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Bed size={13} /> Room {order.roomNumber}
                                  </span>
                                ) : (
                                  <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <UtensilsCrossed size={13} /> Table {order.tableNumber || 'Dining'}
                                  </span>
                                )}
                                <span style={{ color: 'var(--text-muted)' }}>•</span>
                                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                                  {order.guestName || 'Guest'}
                                </span>
                              </div>

                              <div>
                                {isDelayed ? (
                                  <span style={{
                                    color: '#ef4444',
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(239, 68, 68, 0.4)'
                                  }}>
                                    ⚠️ {elapsedMins}m (Delayed)
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Clock size={11} /> {elapsedMins}m ago
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Dietary / Satvik Warning Badge */}
                            {order.is_jain_satvik ? (
                              <div style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid #10b981',
                                borderRadius: '6px',
                                padding: '0.3rem 0.55rem',
                                color: '#34d399',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}>
                                <Sparkles size={13} color="#34d399" />
                                <span>Satvik Pure Veg • Strict No Onion / No Garlic</span>
                              </div>
                            ) : null}

                            {/* Items List */}
                            <div style={{
                              background: 'rgba(0,0,0,0.3)',
                              borderRadius: '8px',
                              padding: '0.65rem 0.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem',
                              border: '1px solid rgba(255,255,255,0.04)'
                            }}>
                              {order.items?.map((it, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.8rem' }}>
                                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                                    <span style={{
                                      background: 'rgba(251, 191, 36, 0.18)',
                                      color: '#fbbf24',
                                      fontWeight: 800,
                                      fontSize: '0.72rem',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      marginTop: '1px'
                                    }}>
                                      {it.quantity}x
                                    </span>
                                    <div>
                                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                                        {it.name}
                                      </div>
                                      {it.notes && (
                                        <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontStyle: 'italic', marginTop: '1px' }}>
                                          Note: {it.notes}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.78rem' }}>
                                    ₹{((it.price || 0) * (it.quantity || 1)).toFixed(0)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Bill Total & Steward Info */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '0.25rem',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)'
                            }}>
                              <span>Steward: <strong style={{ color: '#cbd5e1' }}>{order.captain || 'KOTI'}</strong></span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>Total:</span>
                                <strong style={{ color: 'var(--gold-glow)', fontSize: '0.95rem' }}>
                                  ₹{(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                </strong>
                              </div>
                            </div>

                            {/* Action Control Buttons */}
                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                              {order.status === 'Received' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateKdsStatus(orderId, 'Preparing')}
                                    style={{
                                      flex: 2,
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                      color: '#000',
                                      border: 'none',
                                      fontWeight: 800,
                                      fontSize: '0.78rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.35rem'
                                    }}
                                  >
                                    <Flame size={14} /> Start Cooking
                                  </button>
                                  <button
                                    onClick={() => setVoidKotOrder(order)}
                                    title="Cancel or Void Order"
                                    style={{
                                      flex: 0.8,
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      background: 'rgba(239, 68, 68, 0.15)',
                                      color: '#f87171',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      fontWeight: 700,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Void
                                  </button>
                                  <button
                                    onClick={() => setPrintKotModalOrder(order)}
                                    title="Print Thermal KOT Ticket"
                                    style={{
                                      flex: 0.8,
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      background: 'rgba(255,255,255,0.08)',
                                      color: '#cbd5e1',
                                      border: '1px solid rgba(255,255,255,0.15)',
                                      fontWeight: 700,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Printer size={14} />
                                  </button>
                                </>
                              )}

                              {order.status === 'Preparing' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateKdsStatus(orderId, 'Out for Delivery')}
                                    style={{
                                      flex: 2,
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                      color: '#fff',
                                      border: 'none',
                                      fontWeight: 800,
                                      fontSize: '0.78rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.35rem'
                                    }}
                                  >
                                    <Truck size={14} /> Ready / Dispatch
                                  </button>
                                  <button
                                    onClick={() => setPrintKotModalOrder(order)}
                                    title="Print Thermal KOT Ticket"
                                    style={{
                                      flex: 0.8,
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      background: 'rgba(255,255,255,0.08)',
                                      color: '#cbd5e1',
                                      border: '1px solid rgba(255,255,255,0.15)',
                                      fontWeight: 700,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Printer size={14} />
                                  </button>
                                </>
                              )}

                              {order.status === 'Out for Delivery' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateKdsStatus(orderId, 'Delivered')}
                                    style={{
                                      flex: 2,
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      background: 'linear-gradient(135deg, #10b981, #059669)',
                                      color: '#fff',
                                      border: 'none',
                                      fontWeight: 800,
                                      fontSize: '0.78rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.35rem'
                                    }}
                                  >
                                    <CheckCircle2 size={14} /> Mark Served &amp; Done
                                  </button>
                                  <button
                                    onClick={() => setPrintKotModalOrder(order)}
                                    title="Print Thermal KOT Ticket"
                                    style={{
                                      flex: 0.8,
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      background: 'rgba(255,255,255,0.08)',
                                      color: '#cbd5e1',
                                      border: '1px solid rgba(255,255,255,0.15)',
                                      fontWeight: 700,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Printer size={14} />
                                  </button>
                                </>
                              )}

                              {order.status === 'Delivered' && (
                                <button
                                  onClick={() => setPrintKotModalOrder(order)}
                                  style={{
                                    width: '100%',
                                    padding: '0.45rem',
                                    borderRadius: '6px',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#cbd5e1',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem'
                                  }}
                                >
                                  <Printer size={13} /> View / Reprint Thermal Slip
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <>
              {/* Left Column: Menu Items & Short Code Numpad Entry OR Table Grid */}
              <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {/* Quick Fast Numpad Input Bar */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {(() => {
                const { code: pCode, qty: pQty } = parseCodeAndQty(codeQuery);
                const previewItem = pCode ? RESTAURANT_MENU.find(m => m.itemCode === pCode) : null;
                return (
                  <form onSubmit={handleCodeSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', width: 190 }}>
                      <Hash size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#fbbf24' }} />
                      <input
                        ref={codeInputRef}
                        type="text"
                        placeholder="Code or Code*Qty (e.g. 54*3)"
                        value={codeQuery}
                        onChange={(e) => setCodeQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                          background: '#0d111d',
                          border: previewItem ? '1.5px solid #10b981' : '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          boxShadow: previewItem ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', fontWeight: 700, background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      Enter [↵]
                    </button>
                    {previewItem && (
                      <button
                        type="button"
                        onClick={handleCodeSubmit}
                        style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 0 12px rgba(16, 185, 129, 0.35)'
                        }}
                      >
                        <span>✓ {pQty > 1 ? `${pQty}x ` : ''}#{previewItem.itemCode}: {previewItem.name} (₹{getItemPrice(previewItem) * pQty})</span>
                        <span style={{ background: '#10b981', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>+ Add to Cart</span>
                      </button>
                    )}
                  </form>
                );
              })()}

              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Or search by dish name, code (e.g. 54), category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim() && posViewMode === 'tableGrid') {
                      setPosViewMode('menu');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                    background: '#0d111d',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setCustomDishModalOpen(true)}
                title="Punch Off-Menu / Open Kitchen Dish"
                style={{
                  padding: '0.55rem 0.85rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <FilePlus size={14} /> + Custom Dish
              </button>
            </div>

            {/* Quick Reference Code Strip (Interactive Click-to-Add) */}
            <div style={{
              padding: '0.5rem 1.5rem',
              background: 'rgba(245, 158, 11, 0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={13} /> Quick Codes:
              </span>
              {[
                { code: '54', label: 'Salt & Pepper Corn' },
                { code: '214', label: 'Mushroom Masala' },
                { code: '215', label: 'Paneer Butter' },
                { code: '307', label: 'Steam Rice' },
                { code: '347', label: 'Butter Naan' },
                { code: '116', label: 'Andhra Chicken' },
                { code: '1', label: 'Tea' }
              ].map(qc => {
                const item = RESTAURANT_MENU.find(m => m.itemCode === qc.code);
                return (
                  <button
                    key={qc.code}
                    type="button"
                    onClick={() => {
                      if (item) {
                        addItemToCart(item);
                        if (posViewMode === 'tableGrid') setPosViewMode('menu');
                      }
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '6px',
                      padding: '0.2rem 0.55rem',
                      color: '#cbd5e1',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#fbbf24';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.background = 'rgba(245,158,11,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.color = '#cbd5e1';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    <strong style={{ color: '#fbbf24' }}>#{qc.code}</strong> {qc.label} {item ? `(₹${getItemPrice(item)})` : ''}
                  </button>
                );
              })}
            </div>

            {/* Conditional Content: Authentic MySoft Table Grid OR Fast Dish Catalog */}
            {posViewMode === 'tableGrid' ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Active KOTs Alert Banner */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }}></span>
                    <strong style={{ color: '#fbbf24' }}>Active Kitchen Orders Running:</strong>
                    <span style={{ color: '#cbd5e1' }}>Table 6 (KOT #F2627-7514 • KOTI • ₹1,190) | Table B (KOT #F2627-7515 • SADANANDA)</span>
                  </div>
                  <span style={{ color: '#94a3b8' }}>Tap any table or room button to select and add dishes</span>
                </div>

                {/* Table Command & Control Operational Action Bar */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
                  border: '1.5px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '12px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid var(--gold-glow)',
                      borderRadius: '8px',
                      padding: '0.4rem 0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '90px'
                    }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--gold-glow)', fontWeight: 800, letterSpacing: '0.05em' }}>SELECTED</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>Table {tableNumber}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: tableNumber === '6' || tableNumber === 'B' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.2)',
                          color: tableNumber === '6' || tableNumber === 'B' ? '#fbbf24' : '#34d399',
                          border: tableNumber === '6' || tableNumber === 'B' ? '1px solid #f59e0b' : '1px solid #10b981'
                        }}>
                          {tableNumber === '6' ? 'KOT #F2627-7514 RUNNING (₹1,190)' : tableNumber === 'B' ? 'KOT #F2627-7515 RUNNING (₹760)' : 'VACANT / READY'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                          Captain: <strong style={{ color: 'var(--gold-glow)' }}>{captainName}</strong>
                        </span>
                      </div>
                      
                      {/* Captain Quick Switchers */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Switch Captain:</span>
                        {['KOTI', 'SADANANDA', 'RAMESH', 'SURESH'].map(cName => (
                          <button
                            key={cName}
                            type="button"
                            onClick={() => {
                              setCaptainName(cName);
                              showPosToast(`Captain switched to ${cName}`);
                            }}
                            style={{
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: captainName === cName ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                              color: captainName === cName ? '#38bdf8' : '#94a3b8',
                              border: captainName === cName ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            {cName}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setTableShiftModalOpen(true)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: 'rgba(168, 85, 247, 0.2)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        color: '#c084fc',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}
                    >
                      <ArrowRightLeft size={14} /> ⇄ Shift Table
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTableMergeSource(tableNumber);
                        setTableMergeTarget(tableNumber === '6' ? '7' : '6');
                        setTableMergeModalOpen(true);
                      }}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: 'rgba(6, 182, 212, 0.2)',
                        border: '1px solid rgba(6, 182, 212, 0.4)',
                        color: '#22d3ee',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}
                    >
                      🔗 Merge Tables
                    </button>

                    <button
                      type="button"
                      onClick={() => setTableSettlementModalOpen(true)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#34d399',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}
                    >
                      <CreditCard size={14} /> 💳 Direct Settle
                    </button>

                    <button
                      type="button"
                      onClick={() => setPosViewMode('menu')}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: 'var(--gold-glow)',
                        border: '1px solid var(--gold-glow)',
                        color: '#000',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}
                    >
                      🍽️ Punch / Add Dishes
                    </button>
                  </div>
                </div>

                {/* Section 1: Main Dining Tables (1 - 18) */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-glow)', marginBottom: '0.5rem' }}>
                    🍽️ Ground Floor Main Dining (Tables 1 – 18)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.65rem' }}>
                    {MYPOS_CANNON_KITCHEN_LAYOUT.tables.filter(t => t.section === 'Main Dining').map(table => {
                      const activeKot = MYPOS_CANNON_KITCHEN_LAYOUT.activeKotOrders.find(k => k.tableId === table.id);
                      const isSelected = tableNumber === table.id;

                      return (
                        <div
                          key={table.id}
                          onClick={() => {
                            setTableNumber(table.id);
                            setOrderType('table');
                            if (activeKot) setCaptainName(activeKot.steward);
                          }}
                          style={{
                            background: activeKot 
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.35))'
                              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.25))',
                            border: isSelected 
                              ? '2px solid var(--gold-glow)' 
                              : activeKot ? '1px solid #f59e0b' : '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '8px',
                            padding: '0.6rem 0.4rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: activeKot ? '#fbbf24' : '#34d399' }}>
                            {table.label}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            {activeKot ? `₹${activeKot.amount} (${activeKot.steward})` : 'VACANT'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Terrace & Bar Lounge (1A - 13A & 1B - 5B) */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
                    🍸 Terrace & Bar Lounge (Tables 1A–13A & 1B–5B)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.65rem' }}>
                    {[
                      ...MYPOS_CANNON_KITCHEN_LAYOUT.tables.filter(t => t.section === 'Terrace Dining'),
                      ...MYPOS_CANNON_KITCHEN_LAYOUT.tables.filter(t => t.section === 'Bar Lounge')
                    ].map(table => {
                      const activeKot = MYPOS_CANNON_KITCHEN_LAYOUT.activeKotOrders.find(k => k.tableId === table.id);
                      const isSelected = tableNumber === table.id;

                      return (
                        <div
                          key={table.id}
                          onClick={() => {
                            setTableNumber(table.id);
                            setOrderType('table');
                            setSelectedOutlet(table.section === 'Bar Lounge' ? 'Bar Outlet' : 'Cannon Kitchen');
                          }}
                          style={{
                            background: activeKot 
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.35))'
                              : 'rgba(56, 189, 248, 0.12)',
                            border: isSelected 
                              ? '2px solid var(--gold-glow)' 
                              : activeKot ? '1px solid #f59e0b' : '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '8px',
                            padding: '0.6rem 0.4rem',
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: activeKot ? '#fbbf24' : '#38bdf8' }}>
                            {table.label}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                            {activeKot ? activeKot.status : 'VACANT'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Banquets, Halls & PDRs */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem' }}>
                    🏛️ Private Dining Rooms & Banquets (PDR, PAR3–16, A/C Conference)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem' }}>
                    {MYPOS_CANNON_KITCHEN_LAYOUT.tables.filter(t => t.section === 'PDR' || t.section === 'Banquet' || t.section === 'Admin').map(table => {
                      const isSelected = tableNumber === table.id;

                      return (
                        <div
                          key={table.id}
                          onClick={() => {
                            setTableNumber(table.id);
                            setOrderType('table');
                          }}
                          style={{
                            background: 'rgba(168, 85, 247, 0.12)',
                            border: isSelected ? '2px solid var(--gold-glow)' : '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '8px',
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#c084fc' }}>
                            {table.id}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {table.label} ({table.pax} Pax)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Direct Room Service Transfer Buttons */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>
                    🛎️ Direct Room Service Transfer Keys (Bill to Folio)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.65rem' }}>
                    {['201', '202', '206', '207', '208', '301', '304', '305', '308', '402', '408', '409', '410', '411', '412', '413', '415', '416'].map(rNum => {
                      const isSelected = targetRoom === rNum && orderType === 'room';
                      return (
                        <button
                          key={rNum}
                          onClick={() => {
                            setTargetRoom(rNum);
                            setOrderType('room');
                            setSelectedOutlet('Room Service');
                          }}
                          style={{
                            background: isSelected ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                            border: isSelected ? '2px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            padding: '0.55rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: isSelected ? 'var(--gold-glow)' : '#f8fafc',
                            fontWeight: 800,
                            fontSize: '0.85rem'
                          }}
                        >
                          R-{rNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Fast Dish Catalog View */
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.85rem',
                alignContent: 'flex-start'
              }}>
              {filteredMenu.map(dish => {
                const activePrice = getItemPrice(dish);
                return (
                  <div
                    key={dish.id}
                    onClick={() => addItemToCart(dish)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#fbbf24';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700 }}>
                        #{dish.itemCode}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: dish.isVeg ? '#34d399' : '#f87171' }}>
                        {dish.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', marginBottom: '0.25rem', lineHeight: '1.2' }}>
                      {dish.name}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {dish.category}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>
                        ₹{activePrice.toFixed(0)}
                      </span>
                      <button
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          color: '#fff',
                          width: 26,
                          height: 26,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* Right Column: Order Cart & Bill-to-Room Action */}
          <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', background: 'rgba(10, 14, 25, 0.4)' }}>
            {/* Order Destination Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setOrderType('room')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: orderType === 'room' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: orderType === 'room' ? '#38bdf8' : 'var(--text-muted)',
                    border: orderType === 'room' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Bill to In-House Room
                </button>
                <button
                  onClick={() => setOrderType('table')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: orderType === 'table' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                    color: orderType === 'table' ? '#34d399' : 'var(--text-muted)',
                    border: orderType === 'table' ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Restaurant Dine-In Table
                </button>
              </div>

              {orderType === 'room' ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Target Room Folio</label>
                    <select
                      value={targetRoom}
                      onChange={(e) => setTargetRoom(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        background: '#0d111d',
                        color: '#fff',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      {rooms.filter(r => r.status === 'Occupied').length > 0 ? (
                        rooms.filter(r => r.status === 'Occupied').map(r => (
                          <option key={r.roomNumber} value={r.roomNumber}>
                            Room {r.roomNumber} - {r.currentGuestName || 'Guest'} (₹{(r.balanceDue || 0).toLocaleString()})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="402">Room 402 - P ASHOK (Linde India Ltd)</option>
                          <option value="201">Room 201 - LAVAKANTA OJHA (Akchem)</option>
                          <option value="202">Room 202 - SATYARANJAN SAHOO</option>
                          <option value="410">Room 410 - BIJAY PASWAN (PRADAN)</option>
                          <option value="206">Room 206 - S S HAMEED</option>
                          <option value="207">Room 207 - SAHANAWAZ HUSSAIN</option>
                          <option value="301">Room 301 - UTKARSH SRIVASTAVA</option>
                          <option value="304">Room 304 - SUPHAL CHANDRA MAHATO</option>
                          <option value="305">Room 305 - K RAJESH KUMAR</option>
                          <option value="408">Room 408 - SARATH CHANDRA MADIREDDY</option>
                          <option value="416">Room 416 - SUMER KUMA</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div style={{ width: 130 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Captain / Waiter</label>
                    <input
                      type="text"
                      value={captainName}
                      onChange={(e) => setCaptainName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        background: '#0d111d',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Dining Table #</label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        background: '#0d111d',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="T-01">Table 1 (Window Vista)</option>
                      <option value="T-02">Table 2 (Family 6-Seater)</option>
                      <option value="T-03">Table 3 (4-Seater)</option>
                      <option value="T-04">Table 4 (Executive)</option>
                      <option value="T-05">Table 5 (Bar Counter)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <UtensilsCrossed size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <div>No items in active KOT.</div>
                  <div style={{ fontSize: '0.8rem' }}>Type a code like 214 or click menu items.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cart.map((c, i) => {
                    const price = getItemPrice(c.item);
                    const activeTags = c.cookingTags || [];

                    return (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                              {c.item.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              #{c.item.itemCode} • ₹{price.toFixed(0)} each
                            </div>
                          </div>

                          {/* Quantity controls & Void button */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (c.quantity === 1) {
                                  setVoidTargetIndex(i);
                                } else {
                                  updateQuantity(c.item.id, -1);
                                }
                              }}
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: 'none',
                                color: '#fff',
                                width: 24,
                                height: 24,
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ fontWeight: 700, color: '#fff', minWidth: 20, textAlign: 'center', fontSize: '0.85rem' }}>
                              {c.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(c.item.id, 1)}
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: 'none',
                                color: '#fff',
                                width: 24,
                                height: 24,
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <Plus size={12} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setVoidTargetIndex(i)}
                              title="Cancel / Void Item with Mandatory Reason"
                              style={{
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#f87171',
                                width: 24,
                                height: 24,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div style={{ width: 75, textAlign: 'right', fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem' }}>
                            ₹{(price * c.quantity).toFixed(0)}
                          </div>
                        </div>

                        {/* Cooking Instruction Modifiers Strip */}
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Modifiers:</span>
                          {[
                            { id: 'Satvik / No Onion & Garlic', label: 'Satvik / No Onion & Garlic' },
                            { id: 'Jain Prep', label: 'Jain Prep' },
                            { id: 'Medium Spicy', label: 'Medium Spicy' },
                            { id: 'Less Oil', label: 'Less Oil' },
                            { id: 'Extra Crispy', label: 'Extra Crispy' }
                          ].map(tag => {
                            const isSelected = activeTags.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleCookingTag(i, tag.id)}
                                style={{
                                  padding: '1px 6px',
                                  borderRadius: '3px',
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  background: isSelected ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.05)',
                                  color: isSelected ? 'var(--gold-glow)' : '#94a3b8',
                                  border: isSelected ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.1)'
                                }}
                              >
                                {isSelected ? '✓ ' : ''}{tag.label}
                              </button>
                            );
                          })}
                        </div>

                        <input
                          type="text"
                          placeholder="Special kitchen prep notes..."
                          value={c.notes || ''}
                          onChange={(e) => {
                            const updated = [...cart];
                            updated[i].notes = e.target.value;
                            setCart(updated);
                          }}
                          style={{
                            width: '100%',
                            background: '#070b14',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            color: '#cbd5e1',
                            fontSize: '0.72rem',
                            padding: '0.25rem 0.5rem'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Void Audit Log Trail */}
              {voidAuditLogs.length > 0 && (
                <div style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '0.6rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171', marginBottom: '0.25rem' }}>
                    🚨 Audited Item Voids in Current Order:
                  </div>
                  {voidAuditLogs.map(v => (
                    <div key={v.id} style={{ fontSize: '0.68rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{v.quantity}x {v.itemName} (Reason: {v.reason})</span>
                      <span style={{ color: '#f87171' }}>-₹{v.amount.toFixed(0)} at {v.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Summary & Modifiers Footer */}
            <div style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {/* Discount and NC Billing Toolbar */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '0.65rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gold-glow)', fontWeight: 700 }}>
                    🏷️ Bill Discount &amp; NC Billing Controls:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isNonCommercial) {
                          setIsNonCommercial(true);
                          setNcReason('MD Paidisetty Manmadha Rao (Eswara) VIP Courtesy');
                          showPosToast('👑 MD Eswara VIP Courtesy applied (100% Complimentary NC)!');
                          playSuccessChime();
                        } else {
                          setIsNonCommercial(false);
                          showPosToast('Standard billing mode restored.');
                        }
                      }}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: isNonCommercial ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(180, 83, 9, 0.35))',
                        color: isNonCommercial ? '#fff' : 'var(--gold-glow)',
                        border: isNonCommercial ? '1px solid #ef4444' : '1px solid var(--gold-glow)'
                      }}
                    >
                      👑 {isNonCommercial ? '✓ 100% NC Active (MD Courtesy)' : 'MD Eswara VIP Courtesy (100% NC)'}
                    </button>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', cursor: 'pointer', color: isNonCommercial ? '#f87171' : '#cbd5e1' }}>
                      <input
                        type="checkbox"
                        checked={isNonCommercial}
                        onChange={(e) => setIsNonCommercial(e.target.checked)}
                      />
                      <strong style={{ color: isNonCommercial ? '#f87171' : 'inherit' }}>NC Comp</strong>
                    </label>
                  </div>
                </div>

                {!isNonCommercial ? (
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[
                      { type: 'none', label: 'No Disc' },
                      { type: 'percentage', val: 5, label: '5%' },
                      { type: 'percentage', val: 10, label: '10%' },
                      { type: 'percentage', val: 15, label: '15%' },
                      { type: 'flat', val: 100, label: 'Custom Flat (₹)' }
                    ].map((btn, idx) => {
                      const isSelected = discountType === btn.type && (btn.type === 'none' || btn.type === 'flat' || discountValue === btn.val);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setDiscountType(btn.type);
                            if (btn.val !== undefined) setDiscountValue(btn.val);
                          }}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: isSelected ? 'var(--gold-glow)' : 'rgba(255,255,255,0.05)',
                            color: isSelected ? '#000' : '#cbd5e1',
                            border: isSelected ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          {btn.label}
                        </button>
                      );
                    })}

                    {discountType === 'flat' && (
                      <input
                        type="number"
                        placeholder="₹ Amount"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                        style={{
                          width: '75px',
                          padding: '2px 6px',
                          background: '#0d111d',
                          color: '#34d399',
                          fontWeight: 700,
                          border: '1px solid rgba(52, 211, 153, 0.4)',
                          borderRadius: '4px',
                          fontSize: '0.72rem'
                        }}
                      />
                    )}

                    {discountType !== 'none' && (
                      <select
                        value={discountReason}
                        onChange={(e) => setDiscountReason(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '2px 6px',
                          background: '#0d111d',
                          color: '#fff',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRadius: '4px',
                          fontSize: '0.72rem'
                        }}
                      >
                        <option value="Managing Director Courtesy">MD Courtesy</option>
                        <option value="Corporate Contract Discount">Corporate Contract</option>
                        <option value="Management Courtesy">Management Courtesy</option>
                        <option value="Food Quality Recovery">Food Quality Recovery</option>
                        <option value="Loyal Regular Guest">Loyal Regular Guest</option>
                        <option value="GM Discretionary Allowance">GM Discretionary Allowance</option>
                      </select>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#f87171' }}>NC Reason:</span>
                    <select
                      value={ncReason}
                      onChange={(e) => setNcReason(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '2px 6px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        border: '1px solid #ef4444',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}
                    >
                      <option value="Executive Management Dining">Executive VIP Dining</option>
                      <option value="Executive Management Review">Management Audit Review</option>
                      <option value="Chef Kitchen Tasting & QC">Chef Tasting &amp; QC Sampling</option>
                      <option value="Staff / Duty Meal">Staff / Duty Meal Allocation</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Financial Calculation Lines */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Gross F&amp;B Subtotal ({cart.length} items):</span>
                <span>₹{grossSubtotal.toFixed(2)}</span>
              </div>

              {calculatedDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#34d399' }}>
                  <span>Less Discount ({isNonCommercial ? 'NC Comp' : discountReason}):</span>
                  <span>-₹{calculatedDiscount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>GST @ 5% (SAC 996331):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#fff',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '0.4rem'
              }}>
                <span>Net KOT Total:</span>
                <span style={{ color: isNonCommercial ? '#34d399' : '#fbbf24' }}>
                  {isNonCommercial ? '₹0.00 (NC Approved)' : `₹${netTotal.toFixed(2)}`}
                </span>
              </div>

              {kotSentSuccess && (
                <div style={{
                  padding: '0.65rem',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid #34d399',
                  borderRadius: '6px',
                  color: '#34d399',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} />
                  <div>
                    <strong>KOT #{lastOrderDetails?.kotId} Transferred!</strong>
                    <div>₹{lastOrderDetails?.totalAmount.toFixed(2)} billed to Room {lastOrderDetails?.roomNumber} Master Folio.</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                {orderType === 'room' ? (
                  <button
                    onClick={handleTransferToRoom}
                    disabled={cart.length === 0}
                    className="btn-primary"
                    style={{
                      flex: 1.5,
                      padding: '0.7rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: '#f59e0b',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: cart.length === 0 ? 0.5 : 1,
                      cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Bed size={16} /> Bill to Room {targetRoom} Folio
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePrintAndSendTableKOT}
                      disabled={cart.length === 0}
                      className="btn-outline"
                      title="Send KOT ticket to kitchen without settling payment yet"
                      style={{
                        flex: 1,
                        padding: '0.7rem 0.4rem',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '6px',
                        cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      KOT (T-{tableNumber})
                    </button>
                    <button
                      onClick={() => setTableSettlementModalOpen(true)}
                      disabled={cart.length === 0}
                      className="btn-primary"
                      title="Settle bill immediately with Cash, UPI QR, or Split Tender"
                      style={{
                        flex: 1.4,
                        padding: '0.7rem 0.4rem',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                        cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <CreditCard size={15} /> Settle T-{tableNumber}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleSendWhatsAppDiningBill}
                  disabled={cart.length === 0}
                  title="Dispatch itemized dining bill to WhatsApp"
                  style={{
                    flex: 1,
                    padding: '0.7rem 0.5rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: cart.length === 0 ? 0.5 : 1
                  }}
                >
                  <MessageCircle size={15} /> WhatsApp Bill
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* ========================================================
            MODAL: AUTHENTIC KITCHEN ORDER TICKET (KOT) THERMAL SLIP
            ======================================================== */}
        {printKotModalOrder && (
          <div className="pos-print-overlay" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}>
            <div className="printable-receipt printable-pos-slip thermal-receipt-sheet" style={{
              background: '#ffffff',
              color: '#000000',
              width: '100%',
              maxWidth: '380px',
              padding: '1.5rem',
              borderRadius: '8px',
              fontFamily: 'monospace, "Courier New", Courier',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{HOTEL_CONFIG.name}</div>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.15rem', fontWeight: 900 }}>CANNON KITCHEN</h3>
                <div style={{ fontSize: '0.72rem', color: '#333' }}>Near Andhra Bank, New Colony, Rayagada (Odisha)</div>
                <div style={{ fontSize: '0.72rem', color: '#333' }}>GSTIN: {HOTEL_CONFIG.gstin}</div>
                <div style={{
                  margin: '0.5rem 0 0.2rem',
                  padding: '3px 0',
                  borderTop: '1px solid #000',
                  borderBottom: '1px solid #000',
                  fontSize: '0.8rem',
                  fontWeight: 900
                }}>
                  --- KITCHEN ORDER TICKET (KOT) ---
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>
                  TOKEN #{printKotModalOrder.orderId || printKotModalOrder.order_id}
                </div>
              </div>

              {/* Meta */}
              <div style={{ fontSize: '0.75rem', lineHeight: '1.45', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>Date:</strong> {new Date(printKotModalOrder.created_at || Date.now()).toLocaleDateString('en-IN')}</span>
                  <span><strong>Time:</strong> {new Date(printKotModalOrder.created_at || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div><strong>Outlet:</strong> {printKotModalOrder.outlet || 'Cannon Kitchen'}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, marginTop: '2px', color: '#b91c1c' }}>
                  {printKotModalOrder.roomNumber ? `ROOM: ${printKotModalOrder.roomNumber} (${printKotModalOrder.guestName || 'In-Room'})` : `TABLE: ${printKotModalOrder.tableNumber || 'Main Dining'}`}
                </div>
                <div><strong>Duty Steward:</strong> {printKotModalOrder.captain || captainName}</div>
                {printKotModalOrder.is_jain_satvik ? (
                  <div style={{ fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                    ** STRICT SATVIK (NO ONION / NO GARLIC) **
                  </div>
                ) : null}
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px dashed #000', borderTop: '1px dashed #000' }}>
                    <th style={{ textAlign: 'left', padding: '0.3rem 0' }}>QTY</th>
                    <th style={{ textAlign: 'left', padding: '0.3rem 0' }}>ITEM DESCRIPTION</th>
                    <th style={{ textAlign: 'right', padding: '0.3rem 0' }}>AMT</th>
                  </tr>
                </thead>
                <tbody>
                  {printKotModalOrder.items?.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px dotted #ccc' }}>
                      <td style={{ verticalAlign: 'top', padding: '0.35rem 0', fontWeight: 900, fontSize: '0.85rem' }}>
                        {it.quantity}x
                      </td>
                      <td style={{ verticalAlign: 'top', padding: '0.35rem 0' }}>
                        <div style={{ fontWeight: 700 }}>{it.name}</div>
                        {it.notes && (
                          <div style={{ fontSize: '0.7rem', color: '#555', fontStyle: 'italic', marginTop: '1px' }}>
                            Prep Note: {it.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ verticalAlign: 'top', padding: '0.35rem 0', textAlign: 'right', fontWeight: 700 }}>
                        ₹{((it.price || 0) * (it.quantity || 1)).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{
                borderTop: '1px dashed #000',
                paddingTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                fontWeight: 900,
                marginBottom: '0.75rem'
              }}>
                <span>TOTAL AMOUNT:</span>
                <span>₹{(printKotModalOrder.totalAmount || 0).toFixed(2)}</span>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#444', borderTop: '1px dashed #000', paddingTop: '0.5rem' }}>
                HOTEL COPY • KITCHEN PRODUCTION ONLY • RAYAGADA
              </div>

              {/* Actions */}
              <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1.5,
                    padding: '0.6rem',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Printer size={15} /> Print Thermal Slip (Ctrl+P)
                </button>
                <button
                  onClick={() => setPrintKotModalOrder(null)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: '#e2e8f0',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: TABLE DIRECT SETTLEMENT & DYNAMIC UPI QR
            ======================================================== */}
        {tableSettlementModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#0d1322',
              color: '#ffffff',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
              borderRadius: '14px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={20} color="#10b981" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>
                      Table {tableNumber} Settlement
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                    Cannon Kitchen Dine-In • Captain: {captainName}
                  </div>
                </div>
                <button
                  onClick={() => setTableSettlementModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Bill Summary Card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span>Dishes ({cart.reduce((s, c) => s + c.quantity, 0)} Items):</span>
                  <span>₹{taxableSubtotal.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span>5% GST (2.5% CGST + 2.5% SGST • SAC 996331):</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span>Discount:</span>
                    <span>-₹{calculatedDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px dashed rgba(255,255,255,0.15)',
                  paddingTop: '0.5rem',
                  marginTop: '0.35rem'
                }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>Net Total Due:</span>
                  <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#fbbf24' }}>
                    ₹{netTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Tender Switcher */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Select Tender / Payment Mode:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {[
                    { id: 'cash', label: '💵 Cash' },
                    { id: 'upi', label: '📱 SBI UPI QR' },
                    { id: 'card', label: '💳 Card' },
                    { id: 'split', label: '🔀 Split (Cash+UPI)' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSettlementPaymentMode(m.id)}
                      style={{
                        padding: '0.55rem 0.2rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: settlementPaymentMode === m.id ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                        background: settlementPaymentMode === m.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: settlementPaymentMode === m.id ? '#34d399' : '#cbd5e1'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Specific Content */}
              {settlementPaymentMode === 'cash' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Cash Received from Guest (₹)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder={`e.g. ${Math.ceil(netTotal / 100) * 100}`}
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.55rem',
                        background: '#070b14',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => setCashTendered(Math.round(netTotal).toString())}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.72rem',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      Exact ₹{Math.round(netTotal)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashTendered((Math.ceil(netTotal / 100) * 100).toString())}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.72rem',
                        background: 'rgba(56, 189, 248, 0.2)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      Round ₹{Math.ceil(netTotal / 100) * 100}
                    </button>
                    {[500, 1000, 2000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashTendered(amt.toString())}
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.72rem',
                          background: 'rgba(255,255,255,0.08)',
                          color: '#cbd5e1',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  {parseFloat(cashTendered) >= netTotal && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 78, 59, 0.3))',
                      border: '1.5px solid #10b981',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                        💰 Balance Cash Return to Guest:
                      </span>
                      <span style={{ fontSize: '1.2rem', color: '#34d399', fontWeight: 900 }}>
                        ₹{(parseFloat(cashTendered) - netTotal).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {settlementPaymentMode === 'upi' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    Scan with PhonePe, Google Pay, Paytm, or BHIM:
                  </div>
                  <div style={{ display: 'inline-block', padding: '8px', background: '#fff', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=eswara.hotel@sbi&pn=Hotel%20Sai%20International&am=${netTotal.toFixed(2)}&cu=INR&tn=Table%20${tableNumber}%20Food%20Bill`)}`}
                      alt="SBI UPI QR Code"
                      style={{ width: 160, height: 160, display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Payee VPA: <strong style={{ color: '#fff' }}>eswara.hotel@sbi</strong> • Amount: <strong style={{ color: '#fbbf24' }}>₹{netTotal.toFixed(2)}</strong>
                  </div>
                </div>
              )}

              {settlementPaymentMode === 'split' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>Cash Portion (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={splitCashAmount}
                        onChange={(e) => setSplitCashAmount(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', background: '#070b14', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>UPI Portion (₹)</label>
                      <div style={{ padding: '0.5rem', background: '#111827', color: '#fbbf24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontWeight: 800 }}>
                        ₹{Math.max(0, netTotal - (parseFloat(splitCashAmount) || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {parseFloat(splitCashAmount) > 0 && parseFloat(splitCashAmount) < netTotal && (
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Scan UPI QR for remaining balance:</span>
                      <div style={{ display: 'inline-block', padding: '6px', background: '#fff', borderRadius: '6px', marginTop: '4px' }}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`upi://pay?pa=eswara.hotel@sbi&pn=Hotel%20Sai%20International&am=${Math.max(0, netTotal - (parseFloat(splitCashAmount) || 0)).toFixed(2)}&cu=INR&tn=Table%20${tableNumber}%20Split%20UPI`)}`}
                          alt="Split UPI QR"
                          style={{ width: 120, height: 120, display: 'block' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp e-Bill Dispatch Bar */}
              <div style={{ marginBottom: '1.25rem', padding: '0.65rem 0.85rem', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, marginBottom: '0.3rem' }}>
                  📱 Send Paperless WhatsApp Tax Invoice to Guest:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="tel"
                    placeholder="Guest 10-digit mobile number"
                    value={guestPhoneForInvoice}
                    onChange={(e) => setGuestPhoneForInvoice(e.target.value)}
                    style={{ flex: 1, padding: '0.45rem', background: '#070b14', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendSettlementWhatsApp()}
                    style={{ padding: '0.45rem 0.75rem', background: '#10b981', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleConfirmTableSettlement}
                  style={{
                    flex: 1.5,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  ✓ Complete Settlement &amp; Print Bill
                </button>
                <button
                  type="button"
                  onClick={() => setTableSettlementModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: AUTHENTIC TAX INVOICE PRINTABLE SLIP
            ======================================================== */}
        {settledTaxReceipt && (
          <div className="pos-print-overlay" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}>
            <div className="printable-receipt printable-pos-slip thermal-receipt-sheet" style={{
              background: '#ffffff',
              color: '#000000',
              width: '100%',
              maxWidth: '380px',
              padding: '1.5rem',
              borderRadius: '8px',
              fontFamily: 'monospace, "Courier New", Courier',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 800 }}>{HOTEL_CONFIG.name}</div>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.25rem', fontWeight: 900 }}>CANNON KITCHEN</h3>
                <div style={{ fontSize: '0.72rem', color: '#333' }}>Near Andhra Bank, New Colony, Rayagada (Odisha)</div>
                <div style={{ fontSize: '0.72rem', color: '#333' }}>GSTIN: {HOTEL_CONFIG.gstin} • SAC: 996331</div>
                <div style={{
                  margin: '0.5rem 0 0.2rem',
                  padding: '3px 0',
                  borderTop: '1px solid #000',
                  borderBottom: '1px solid #000',
                  fontSize: '0.85rem',
                  fontWeight: 900
                }}>
                  *** RETAIL TAX INVOICE ***
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>
                  INVOICE #{settledTaxReceipt.invoiceId}
                </div>
              </div>

              {/* Meta */}
              <div style={{ fontSize: '0.75rem', lineHeight: '1.45', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>Date:</strong> {new Date(settledTaxReceipt.created_at).toLocaleDateString('en-IN')}</span>
                  <span><strong>Time:</strong> {new Date(settledTaxReceipt.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div><strong>Outlet:</strong> {settledTaxReceipt.outlet || 'Cannon Kitchen'}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, marginTop: '2px', color: '#000' }}>
                  TABLE: {settledTaxReceipt.tableNumber} (Dine-In)
                </div>
                <div><strong>Payment Tender:</strong> {settledTaxReceipt.paymentMode?.toUpperCase()}</div>
                <div><strong>Captain / Cashier:</strong> {settledTaxReceipt.captain}</div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px dashed #000', borderTop: '1px dashed #000' }}>
                    <th style={{ textAlign: 'left', padding: '0.3rem 0' }}>QTY</th>
                    <th style={{ textAlign: 'left', padding: '0.3rem 0' }}>ITEM</th>
                    <th style={{ textAlign: 'right', padding: '0.3rem 0' }}>RATE</th>
                    <th style={{ textAlign: 'right', padding: '0.3rem 0' }}>AMT</th>
                  </tr>
                </thead>
                <tbody>
                  {settledTaxReceipt.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px dotted #ccc' }}>
                      <td style={{ padding: '0.3rem 0', fontWeight: 700 }}>{it.quantity}</td>
                      <td style={{ padding: '0.3rem 0' }}>{it.name}</td>
                      <td style={{ textAlign: 'right', padding: '0.3rem 0' }}>₹{it.price}</td>
                      <td style={{ textAlign: 'right', padding: '0.3rem 0', fontWeight: 700 }}>₹{it.amount || it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculations */}
              <div style={{ fontSize: '0.78rem', borderTop: '1px dashed #000', paddingTop: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Taxable Subtotal:</span>
                  <span>₹{settledTaxReceipt.subtotal?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>CGST (2.5%):</span>
                  <span>₹{(settledTaxReceipt.gst / 2).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>SGST (2.5%):</span>
                  <span>₹{(settledTaxReceipt.gst / 2).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.95rem', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '4px' }}>
                  <span>TOTAL PAID:</span>
                  <span>₹{settledTaxReceipt.totalAmount.toFixed(2)}</span>
                </div>
                {settledTaxReceipt.cashTendered && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#555', marginTop: '3px' }}>
                    <span>Cash Tendered / Change:</span>
                    <span>₹{settledTaxReceipt.cashTendered} / ₹{settledTaxReceipt.changeDue?.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#444', borderTop: '1px dashed #000', paddingTop: '0.5rem' }}>
                THANK YOU FOR VISITING CANNON KITCHEN! • HAVE A BLESSED JOURNEY
              </div>

              {/* Actions */}
              <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1.5,
                    padding: '0.6rem',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Printer size={15} /> Print Tax Slip (Ctrl+P)
                </button>
                <button
                  onClick={() => handleSendSettlementWhatsApp()}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
                <button
                  onClick={() => setSettledTaxReceipt(null)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    background: '#e2e8f0',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: KDS KOT CANCEL & VOID CONFIRMATION
            ======================================================== */}
        {voidKotOrder && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '440px',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171'
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                    Void KOT #{voidKotOrder.orderId || voidKotOrder.order_id}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                    Mandatory reason required for F&amp;B daily audit register
                  </p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                color: '#cbd5e1'
              }}>
                <div><strong>Destination:</strong> {voidKotOrder.roomNumber ? `Room ${voidKotOrder.roomNumber}` : `Table ${voidKotOrder.tableNumber}`}</div>
                <div><strong>Dishes:</strong> {voidKotOrder.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                <div style={{ color: 'var(--gold-glow)', fontWeight: 700, marginTop: '0.25rem' }}>
                  Total Value: ₹{(voidKotOrder.totalAmount || 0).toFixed(2)}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Cancellation / Void Reason
                </label>
                <select
                  value={voidKotReason}
                  onChange={(e) => setVoidKotReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="Guest Changed Mind">Guest Changed Mind</option>
                  <option value="Duplicate Order Punched">Duplicate Order Punched</option>
                  <option value="Kitchen Out of Stock">Kitchen Out of Stock / Ingredient Depleted</option>
                  <option value="Guest Checked Out Early">Guest Checked Out Early</option>
                  <option value="Preparation Delay Cancellation">Preparation Delay Cancellation</option>
                  <option value="MD Non-Commercial Comp">Managing Director VIP Comp</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Custom Supervisor Note (Optional)
                </label>
                <input
                  type="text"
                  value={voidKotCustomNote}
                  onChange={(e) => setVoidKotCustomNote(e.target.value)}
                  placeholder="e.g. Guest switched to Chinese menu..."
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleConfirmVoidKot}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Void &amp; Log Audit
                </button>
                <button
                  onClick={() => setVoidKotOrder(null)}
                  style={{
                    padding: '0.65rem 1rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ITEM VOID / CANCELLATION REASON */}
        {voidTargetIndex !== null && cart[voidTargetIndex] && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: 440,
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trash2 size={18} /> Confirm Item Cancellation / Void
                </h3>
                <button
                  onClick={() => setVoidTargetIndex(null)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 1rem', lineHeight: 1.4 }}>
                Voiding <strong>{cart[voidTargetIndex].quantity}x {cart[voidTargetIndex].item.name}</strong> (₹{(getItemPrice(cart[voidTargetIndex].item) * cart[voidTargetIndex].quantity).toFixed(0)}). A mandatory cancellation reason is required for the kitchen auditor:
              </p>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mandatory Void Reason</label>
                <select
                  className="form-select"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', background: '#070b14', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}
                >
                  <option value="Guest Changed Mind">Guest Changed Mind</option>
                  <option value="Kitchen Out of Stock">Kitchen Out of Stock</option>
                  <option value="Duplicate Punch Error">Duplicate Punch Error</option>
                  <option value="Captain Mistake">Captain / Order Entry Mistake</option>
                  <option value="Food Preparation Delay">Food Preparation Delay</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Additional Audit Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Guest replaced with 307 rice instead"
                  value={voidCustomNote}
                  onChange={(e) => setVoidCustomNote(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', background: '#070b14', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setVoidTargetIndex(null)}
                  className="btn-outline"
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                >
                  Keep Item
                </button>
                <button
                  type="button"
                  onClick={handleConfirmItemVoid}
                  className="btn-primary"
                  style={{ flex: 1.5, padding: '0.6rem', fontSize: '0.85rem', background: '#ef4444', borderColor: '#ef4444' }}
                >
                  Confirm Audited Void
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CUSTOM / OFF-MENU OPEN DISH ADDER */}
        {customDishModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#0d1322',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: 440,
              padding: '1.5rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FilePlus size={20} color="#38bdf8" />
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Add Custom / Off-Menu Dish</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomDishModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddCustomDish}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dish Name / Prep Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Baby Khichdi (Salt & Ghee only)"
                    value={customDishName}
                    onChange={(e) => setCustomDishName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.55rem', background: '#070b14', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="120"
                      min="1"
                      value={customDishPrice}
                      onChange={(e) => setCustomDishPrice(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.55rem', background: '#070b14', color: '#fff', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700 }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kitchen Section</label>
                    <select
                      value={customDishCategory}
                      onChange={(e) => setCustomDishCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', background: '#070b14', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      <option value="South Indian / Special">South Indian / Special</option>
                      <option value="North Indian / Gravy">North Indian / Gravy</option>
                      <option value="Beverages & Milk">Beverages & Milk</option>
                      <option value="Continental / Snacks">Continental / Snacks</option>
                      <option value="Chef Special Prep">Chef Special Prep</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setCustomDishModalOpen(false)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '0.6rem', fontSize: '0.85rem', background: '#0284c7', borderColor: '#0284c7', color: '#fff' }}
                  >
                    + Add to Cart
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: TABLE SHIFT & REASSIGNMENT */}
        {tableShiftModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#0d1322',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: 440,
              padding: '1.5rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRightLeft size={20} color="#c084fc" />
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Shift / Reassign Table</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTableShiftModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmTableShift}>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CURRENT TABLE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    Table {tableNumber} ({cart.length} active items in KOT)
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select Destination Table</label>
                  <select
                    className="form-select"
                    value={tableShiftTarget}
                    onChange={(e) => setTableShiftTarget(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', background: '#070b14', color: '#fff', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '6px' }}
                  >
                    <optgroup label="Ground Floor Main Dining (Tables 1 - 18)">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(tbl => (
                        <option key={tbl} value={tbl.toString()} disabled={tbl.toString() === tableNumber.toString()}>
                          Table {tbl} {tbl.toString() === tableNumber.toString() ? '(Current Selected)' : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Terrace Dining (1A - 13A)">
                      {['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A', '13A'].map(tbl => (
                        <option key={tbl} value={tbl} disabled={tbl === tableNumber}>
                          Table {tbl} {tbl === tableNumber ? '(Current Selected)' : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Drop In Bar Lounge (1B - 5B)">
                      {['1B', '2B', '3B', '4B', '5B'].map(tbl => (
                        <option key={tbl} value={tbl} disabled={tbl === tableNumber}>
                          Table {tbl} {tbl === tableNumber ? '(Current Selected)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setTableShiftModalOpen(false)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '0.6rem', fontSize: '0.85rem', background: '#9333ea', borderColor: '#9333ea', color: '#fff' }}
                  >
                    Confirm Table Shift ⇄
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: TABLE MERGE & CONSOLIDATION */}
        {tableMergeModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#0d1322',
              border: '1.5px solid rgba(6, 182, 212, 0.5)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: 460,
              padding: '1.5rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🔗</span>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Merge &amp; Consolidate Tables</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTableMergeModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmTableMerge}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 700, marginBottom: '0.2rem' }}>CONSOLIDATION PROTOCOL</div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Orders and running KOT tickets will be automatically transferred from the Source Table into the Master Destination Table.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                      Source Table (To Clear)
                    </label>
                    <select
                      className="form-select"
                      value={tableMergeSource}
                      onChange={(e) => setTableMergeSource(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', background: '#070b14', color: '#fff', border: '1px solid rgba(248, 113, 113, 0.4)', borderRadius: '6px' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(tbl => (
                        <option key={tbl} value={tbl.toString()}>
                          Table {tbl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                      Master Destination Table
                    </label>
                    <select
                      className="form-select"
                      value={tableMergeTarget}
                      onChange={(e) => setTableMergeTarget(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', background: '#070b14', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '6px', fontWeight: 700 }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(tbl => (
                        <option key={tbl} value={tbl.toString()} disabled={tbl.toString() === tableMergeSource}>
                          Table {tbl} {tbl.toString() === tableMergeSource ? '(Source Selected)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setTableMergeModalOpen(false)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '0.6rem', fontSize: '0.85rem', background: '#0891b2', borderColor: '#0891b2', color: '#fff' }}
                  >
                    Confirm Table Merge 🔗
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: DAILY ITEM SALES & QUANTITY REGISTER (Sheet 2: Sale ఆ వివరణ) */}
        {showDailySalesModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem',
            backdropFilter: 'blur(6px)'
          }}>
            <div style={{
              background: '#0d1527',
              border: '1px solid var(--gold-glow)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: 960,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              color: '#fff'
            }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <UtensilsCrossed size={22} color="var(--gold-glow)" />
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                      Cannon Kitchen Daily Sales &amp; Quantity Register
                    </h3>
                    <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', border: '1px solid var(--gold-glow)', fontSize: '0.72rem' }}>
                      Sheet 2: ఆ వివరణ (Item Breakdown)
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Itemized consumption, dish yield, and total quantity sold across Food &amp; Beverage categories
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={handleDownloadDailySalesCSV}
                    className="btn-primary-gold"
                    style={{
                      padding: '0.45rem 0.95rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <FileSpreadsheet size={15} /> 📥 Export CSV (వివరణ)
                  </button>
                  <button
                    onClick={() => setShowDailySalesModal(false)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Authentic Mysoft Universal Date Range Selector Bar (Screenshot Identical) */}
              <UniversalDateFilterBar
                fromDate={salesFromDate}
                toDate={salesToDate}
                moduleType="pos"
                auditItems={dailySalesItems}
                onDateChange={(from, to) => {
                  setSalesFromDate(from);
                  setSalesToDate(to);
                }}
                onDisplay={(from, to) => {
                  setSalesFromDate(from);
                  setSalesToDate(to);
                  setIsSalesDateFilterActive(true);
                }}
                title="KITCHEN ITEM CONSUMPTION & SALES REGISTER"
                onUpdateItem={(item, field, newVal) => {
                  setDailySalesItems(prev => prev.map(it => it.code === item.code ? { ...it, [field]: newVal } : it));
                }}
                totalCount={446}
                totalAmount={70015}
                onExportCSV={handleDownloadDailySalesCSV}
                onPrint={() => window.print()}
                compact={true}
              />

              {/* KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 600 }}>🍗 Non-Veg Delicacies</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginTop: '0.15rem' }}>₹33,040.00</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>92 Portions (Biryani &amp; Mutton)</div>
                </div>

                <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 600 }}>🍄 Veg &amp; Paneer Specials</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginTop: '0.15rem' }}>₹12,440.00</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>58 Portions (Mushroom Masala)</div>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 600 }}>🍚 Rice &amp; Tandoori Breads</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginTop: '0.15rem' }}>₹13,580.00</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>207 Units (Code 307 &amp; Roti)</div>
                </div>

                <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold-glow)', textTransform: 'uppercase', fontWeight: 700 }}>Total Kitchen Turnover</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold-glow)', marginTop: '0.15rem' }}>₹70,015.00</div>
                  <div style={{ fontSize: '0.7rem', color: '#34d399' }}>446 Total Dishes / Units Sold</div>
                </div>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Items (446)' },
                  { id: 'Food (Non-Veg)', label: '🍗 Non-Veg (92)' },
                  { id: 'Food (Veg)', label: '🍄 Veg Dishes (58)' },
                  { id: 'Food (Rice & Breads)', label: '🍚 Rice & Breads (207)' },
                  { id: 'Beverages', label: '🥤 Beverages (73)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDailySalesCategoryFilter(tab.id)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: dailySalesCategoryFilter === tab.id ? 'var(--gold-glow)' : 'rgba(255,255,255,0.04)',
                      color: dailySalesCategoryFilter === tab.id ? '#060e1a' : '#94a3b8',
                      border: dailySalesCategoryFilter === tab.id ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Items Table */}
              <div style={{ flex: 1, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                <SheetsToolbarLegend tableName="Cannon Kitchen Daily Sales & Revenue Register" subtitle="Point of Sale Food & Beverage Menu Matrix" />
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <SheetsColumnHeader title="Code" badge="locked" style={{ padding: '0.65rem 0.85rem' }} />
                      <SheetsColumnHeader title="Dish / Beverage Description (వివరణ)" badge="editable" style={{ padding: '0.65rem 0.85rem' }} />
                      <SheetsColumnHeader title="Category" badge="editable" style={{ padding: '0.65rem 0.85rem' }} />
                      <SheetsColumnHeader title="Units Sold (Total Qty)" badge="editable" align="center" style={{ padding: '0.65rem 0.85rem', color: '#38bdf8' }} />
                      <SheetsColumnHeader title="Dine-In Rate" badge="editable" align="right" style={{ padding: '0.65rem 0.85rem' }} />
                      <SheetsColumnHeader title="Total Sales" badge="formula" align="right" style={{ padding: '0.65rem 0.85rem', color: 'var(--gold-glow)' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {dailySalesItems
                      .filter(i => dailySalesCategoryFilter === 'all' || i.cat === dailySalesCategoryFilter)
                      .map((row, idx) => (
                        <tr key={idx} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                        }}>
                          <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', color: 'var(--gold-glow)', fontWeight: 700 }}>
                            #{row.code}
                          </td>
                          <SheetsEditableCell
                            value={row.name}
                            type="text"
                            cellStyle={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#fff' }}
                            onSave={(newVal) => setDailySalesItems(prev => prev.map(item => item.code === row.code ? { ...item, name: newVal } : item))}
                          />
                          <SheetsEditableCell
                            value={row.cat}
                            type="select"
                            options={['Food (Non-Veg)', 'Food (Veg)', 'Food (Rice & Breads)', 'Beverages', 'Satvik (No Onion/Garlic)']}
                            cellStyle={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}
                            onSave={(newVal) => setDailySalesItems(prev => prev.map(item => item.code === row.code ? { ...item, cat: newVal } : item))}
                          />
                          <SheetsEditableCell
                            value={row.qty}
                            type="number"
                            align="center"
                            className="cell-num"
                            min={0}
                            cellStyle={{ padding: '0.65rem 0.85rem', color: '#38bdf8', fontWeight: 800, fontSize: '0.9rem' }}
                            onSave={(newVal) => {
                              const q = Number(newVal);
                              setDailySalesItems(prev => prev.map(item => item.code === row.code ? { ...item, qty: q, totalSales: q * item.rate } : item));
                            }}
                          />
                          <SheetsEditableCell
                            value={row.rate}
                            type="currency"
                            align="right"
                            className="cell-num"
                            min={0}
                            cellStyle={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}
                            onSave={(newVal) => {
                              const r = Number(newVal);
                              setDailySalesItems(prev => prev.map(item => item.code === row.code ? { ...item, rate: r, totalSales: item.qty * r } : item));
                            }}
                          />
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800, color: 'var(--gold-glow)' }}>
                            ₹{row.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(255,255,255,0.06)', fontWeight: 800 }}>
                      <td colSpan={3} style={{ padding: '0.75rem 0.85rem', color: 'var(--gold-glow)' }}>TOTALS</td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', color: '#38bdf8', fontSize: '0.95rem' }}>
                        {dailySalesItems.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0)}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>-</td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: 'var(--gold-glow)', fontSize: '0.95rem' }}>
                        ₹{dailySalesItems.reduce((acc, curr) => acc + (Number(curr.totalSales) || (Number(curr.qty) * Number(curr.rate)) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING ACTION TOAST */}
        {posFeedbackToast && (
          <div style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#0f172a',
            color: '#38bdf8',
            border: '1px solid #38bdf8',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
            zIndex: 100001,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} color="#34d399" />
            <span>{posFeedbackToast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
