import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RoomCatalog from './components/RoomCatalog';
import SatvikDining from './components/SatvikDining';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import CookieConsentBanner from './components/CookieConsentBanner';

// Resilient Dynamic Code-Splitting: Automatically handles Cloudflare deployments and new bundle hashes
const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('Chunk load error detected (new Cloudflare deployment active). Refreshing bundle...', error);
      const isRefreshed = sessionStorage.getItem('hsi_chunk_refreshed');
      if (!isRefreshed) {
        sessionStorage.setItem('hsi_chunk_refreshed', 'true');
        window.location.reload();
        return new Promise(() => {}); // prevent throwing before reload
      }
      sessionStorage.removeItem('hsi_chunk_refreshed');
      throw error;
    }
  });
};

import ErrorBoundary from './components/ErrorBoundary';

const FloorExplorer3DModal = lazyWithRetry(() => import('./components/FloorExplorer3DModal'));
const VirtualTour360Modal = lazyWithRetry(() => import('./components/VirtualTour360Modal'));
const BookingModal = lazyWithRetry(() => import('./components/BookingModal'));
const BookingReceiptModal = lazyWithRetry(() => import('./components/BookingReceiptModal'));
const ReceptionAdmin = lazyWithRetry(() => import('./components/ReceptionAdmin'));
const FinancialAnalytics = lazyWithRetry(() => import('./components/FinancialAnalytics'));
const CaFilingStationModal = lazyWithRetry(() => import('./components/CaFilingStationModal'));
const AutonomousBotFleetModal = lazyWithRetry(() => import('./components/AutonomousBotFleetModal'));
const FoodOrderModal = lazyWithRetry(() => import('./components/FoodOrderModal'));
const DarshanAdvisorModal = lazyWithRetry(() => import('./components/DarshanAdvisorModal'));
const AiConciergeModal = lazyWithRetry(() => import('./components/AiConciergeModal'));
const CorporatePortalModal = lazyWithRetry(() => import('./components/CorporatePortalModal'));
const FolioActionsModal = lazyWithRetry(() => import('./components/FolioActionsModal'));
const CannonKitchenPOS = lazyWithRetry(() => import('./components/CannonKitchenPOS'));
const AccountsLedgerModal = lazyWithRetry(() => import('./components/AccountsLedgerModal'));
const NightAuditModal = lazyWithRetry(() => import('./components/NightAuditModal'));
const StoreInventoryModal = lazyWithRetry(() => import('./components/StoreInventoryModal'));
const DirectorPortal = lazyWithRetry(() => import('./components/DirectorPortal'));
const RevenueManagementModal = lazyWithRetry(() => import('./components/RevenueManagementModal'));
const LegalPoliciesModal = lazyWithRetry(() => import('./components/LegalPoliciesModal'));
const DpdpDataRightsModal = lazyWithRetry(() => import('./components/DpdpDataRightsModal'));
const InRoomGuestPortal = lazyWithRetry(() => import('./components/InRoomGuestPortal'));

import { INITIAL_ROOMS_INVENTORY, ROOM_TIERS, INITIAL_FOLIO_TRANSACTIONS, CORPORATE_PARTNERS } from './data/hotelData';
import { calculateAllTierMicroRates } from './utils/g3RmsEngine';
import { FloatingDock } from '@/components/ui/floating-dock';
import { Hotel, Layers, Compass, Utensils, ShieldCheck, Sparkles, Scale, MessageCircle, Terminal, Database } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window === 'undefined') return 'guest';
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'pms' || window.location.hash === '#pms') {
      return 'pms';
    }
    return 'guest';
  });
  const [rooms, setRooms] = useState(INITIAL_ROOMS_INVENTORY);
  const [transactions, setTransactions] = useState(INITIAL_FOLIO_TRANSACTIONS);
  const [pmsInitialTab, setPmsInitialTab] = useState('tape-chart');

  const handleOpenD1Database = () => {
    setPmsInitialTab('d1-database-explorer');
    setCurrentView('pms');
  };

  // Automatic SPA Freshness: Seamlessly detects new Cloudflare Pages deployments
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentScripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    const checkFreshness = async () => {
      try {
        const res = await fetch('/index.html', { method: 'GET', cache: 'no-store' });
        if (!res.ok) return;
        const text = await res.text();
        const match = text.match(/assets\/index-[a-zA-Z0-9_-]+\.js/);
        if (match && match[0] && currentScripts.length > 0) {
          const hasCurrent = currentScripts.some(src => src.includes(match[0]));
          if (!hasCurrent) {
            console.info('⚡ Fresh Cloudflare Pages bundle detected. Synchronizing live assets...');
            // Reload if on guest landing page and not in mid-booking
            if (currentView === 'guest' && !sessionStorage.getItem('hsi_booking_active')) {
              window.location.reload();
            }
          }
        }
      } catch {
        // Network offline or transient error
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkFreshness();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    const timer = setInterval(checkFreshness, 45000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(timer);
    };
  }, [currentView]);

  // Dedicated In-Room Guest Portal State (Triggered when room QR code is scanned)
  const [inRoomPortalState, setInRoomPortalState] = useState(() => {
    if (typeof window === 'undefined') return { active: false, roomNumber: '204' };
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    const source = params.get('source');
    const action = params.get('action');
    const mode = params.get('mode');
    const portal = params.get('portal');

    // Trigger dedicated in-room guest portal when QR is scanned
    if (source === 'room_qr' || mode === 'in_room' || portal === 'inroom' || (action === 'dining' && room) || (room && (source || mode))) {
      return { active: true, roomNumber: room || '204' };
    }
    return { active: false, roomNumber: '204' };
  });

  // Dedicated Room Services state (Towels, Extra Water, Housekeeping, Toiletries, Maintenance)
  const [roomServices, setRoomServices] = useState([
    {
      requestId: 'REQ-1092',
      roomNumber: '105',
      serviceType: 'Extra Water',
      description: 'Guest requested 2 extra Kinley water bottles and clean glasses',
      priority: 'Normal',
      status: 'Pending',
      assignedStaff: 'Babula Sahu',
      requestedAt: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      requestId: 'REQ-1093',
      roomNumber: '202',
      serviceType: 'Linen Change',
      description: 'Replace king bedsheet and 2 fresh terry bath towels',
      priority: 'Normal',
      status: 'Pending',
      assignedStaff: 'Anita Majhi',
      requestedAt: new Date(Date.now() - 25 * 60000).toISOString()
    }
  ]);
  const [bookings, setBookings] = useState([
    {
      bookingId: 'SSVR-202609-0001',
      roomNumber: '104',
      tier: 'Standard Deluxe',
      guestName: 'Santosh Patra',
      guestPhone: '+91 94371 22334',
      idProofType: 'Aadhaar',
      idProofMasked: 'XXXX-XXXX-8821',
      stateOfOrigin: 'Odisha',
      isInterstate: false,
      checkInDate: '2026-09-20',
      checkOutDate: '2026-09-22',
      nights: 2,
      adults: 2,
      children: 0,
      tariffPerNight: 1699,
      baseTotal: 3398,
      cgst: 84.95,
      sgst: 84.95,
      totalAmount: 3567.90,
      advanceDeposit: 3567.90,
      balanceDue: 0,
      paymentMode: 'UPI',
      paymentStatus: 'Paid',
      bookingStatus: 'Checked In',
      isB2b: false
    },
    {
      bookingId: 'SSVR-202609-0002',
      roomNumber: '205',
      tier: 'Executive Room',
      guestName: 'Vikram Singhania (JK Paper)',
      guestPhone: '+91 98101 55667',
      idProofType: 'Passport',
      idProofMasked: 'XXXX-XXXX-9901',
      stateOfOrigin: 'Maharashtra',
      isInterstate: true,
      checkInDate: '2026-09-21',
      checkOutDate: '2026-09-24',
      nights: 3,
      adults: 1,
      children: 0,
      tariffPerNight: 2464, // 15% corporate discount on ₹2,899
      baseTotal: 7392,
      cgst: 184.80,
      sgst: 184.80,
      totalAmount: 7761.60,
      advanceDeposit: 0,
      balanceDue: 7761.60,
      paymentMode: 'Corporate B2B',
      paymentStatus: 'Pending Payment at Check-Out',
      bookingStatus: 'Checked In',
      isB2b: true,
      corporateGstin: '21AAACJ1288P1ZZ'
    },
    {
      bookingId: 'SSVR-202609-0004',
      roomNumber: '211',
      tier: 'Premium Suite',
      guestName: 'Anil Sharma (GAIL Regional Project Team)',
      guestPhone: '+91 98210 44556',
      idProofType: 'Aadhaar',
      idProofMasked: 'XXXX-XXXX-4491',
      stateOfOrigin: 'Delhi',
      isInterstate: true,
      checkInDate: '2026-09-20',
      checkOutDate: '2026-09-22',
      nights: 2,
      adults: 2,
      children: 0,
      tariffPerNight: 3999,
      baseTotal: 7998,
      cgst: 479.88,
      sgst: 479.88,
      totalAmount: 13588.00, // Exact demonstration total (Room + F&B + Laundry)
      advanceDeposit: 5000.00,
      balanceDue: 8588.00,
      paymentMode: 'Split Tender (UPI + Cash)',
      paymentStatus: 'Pending Final Settlement',
      bookingStatus: 'Checked In',
      isB2b: true,
      corporateGstin: '07AAACG1509J1ZQ'
    }
  ]);

  const [corporatePartners, setCorporatePartners] = useState(CORPORATE_PARTNERS);
  const [adminPinVerified, setAdminPinVerified] = useState(() => {
    if (typeof window === 'undefined') return false;
    const pin = sessionStorage.getItem('hsi_admin_pin') || localStorage.getItem('hsi_admin_pin');
    return pin === '7650' || Boolean(pin);
  });
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('privacy');
  const [dataRightsModalOpen, setDataRightsModalOpen] = useState(false);

  const getVerifiedAdminPin = () => {
    return sessionStorage.getItem('hsi_admin_pin') || localStorage.getItem('hsi_admin_pin') || '7650';
  };

  // Core Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTierForBooking, setSelectedTierForBooking] = useState(null);
  const [selectedRoomNumForBooking, setSelectedRoomNumForBooking] = useState(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentReceiptBooking, setCurrentReceiptBooking] = useState(null);

  const [floorExplorerOpen, setFloorExplorerOpen] = useState(false);
  const [virtualTourOpen, setVirtualTourOpen] = useState(false);
  const [virtualTourSceneId, setVirtualTourSceneId] = useState('entrance-gate');

  const handleOpenVirtualTour = (sceneId = 'entrance-gate') => {
    setVirtualTourSceneId(sceneId);
    setVirtualTourOpen(true);
  };
  const [diningModalOpen, setDiningModalOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [darshanModalOpen, setDarshanModalOpen] = useState(false);
  const [aiConciergeOpen, setAiConciergeOpen] = useState(false);
  const [botFleetOpen, setBotFleetOpen] = useState(false);
  const [corporateModalOpen, setCorporateModalOpen] = useState(false);

  // IDS Next Operational Modules State
  const [folioModalOpen, setFolioModalOpen] = useState(false);
  const [selectedFolioRoomNumber, setSelectedFolioRoomNumber] = useState('211');

  const handleOpenMasterFolio = (roomNumber) => {
    if (roomNumber) {
      setSelectedFolioRoomNumber(String(roomNumber));
    }
    setFolioModalOpen(true);
  };

  const [posModalOpen, setPosModalOpen] = useState(false);
  const [accountsModalOpen, setAccountsModalOpen] = useState(false);
  const [accountsInitialTab, setAccountsInitialTab] = useState('tally-erp');
  const [nightAuditModalOpen, setNightAuditModalOpen] = useState(false);

  const handleOpenAccountsWithTab = (tab = 'tally-erp') => {
    setAccountsInitialTab(tab);
    setAccountsModalOpen(true);
  };
  const [storeInventoryModalOpen, setStoreInventoryModalOpen] = useState(false);
  const [directorPortalOpen, setDirectorPortalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [caFilingModalOpen, setCaFilingModalOpen] = useState(false);
  const [dynamicRates, setDynamicRates] = useState(() => calculateAllTierMicroRates({ occupancyRate: 68, daysToArrival: 3, pickupVelocity48h: 4 }));

  // Live Food Orders & KDS State shared across Front Desk & Cannon Kitchen POS
  const [foodOrders, setFoodOrders] = useState([
    {
      orderId: 'KOT-8491',
      roomNumber: '204',
      guestName: 'BIJAY PASWAN',
      outlet: 'Cannon Kitchen',
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
      roomNumber: '206',
      guestName: 'UTKARSH SRIVASTAVA',
      outlet: 'Cannon Kitchen',
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
  ]);

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setFoodOrders(prev => prev.map(o => {
      if ((o.orderId || o.order_id) === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));

    const adminPin = adminPinVerified ? getVerifiedAdminPin() : '';
    if (!adminPin) return;
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
  };

  const handleAddFoodOrder = (newOrder) => {
    setFoodOrders(prev => [newOrder, ...prev]);
  };

  // Dedicated In-Room Guest Portal Handlers
  const handlePlaceFoodOrderFromGuestPortal = (newOrder) => {
    handleAddFoodOrder(newOrder);

    // Auto-debit into Master Folio transaction ledger for that room
    const kotTx = {
      transactionId: `TXN-KOT-${newOrder.roomNumber}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${newOrder.roomNumber}`,
      bookingId: bookings.find(b => b.roomNumber === newOrder.roomNumber && b.bookingStatus === 'Checked In')?.bookingId || `SSVR-FOLIO-${newOrder.roomNumber}`,
      roomNumber: newOrder.roomNumber,
      transactionType: 'F&B POS',
      outlet: newOrder.outlet || 'Cannon Kitchen (Room Service)',
      itemCode: 'KOT-FOOD',
      description: `In-Room Food Order (${newOrder.orderId}) - ${newOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
      debitAmount: Number(newOrder.totalAmount),
      creditAmount: 0,
      taxableBase: Math.round((newOrder.totalAmount / 1.05) * 100) / 100,
      gstRate: 5,
      cgst: Math.round(((newOrder.totalAmount / 1.05) * 0.025) * 100) / 100,
      sgst: Math.round(((newOrder.totalAmount / 1.05) * 0.025) * 100) / 100,
      sacCode: '996331',
      isLocked: 0,
      createdBy: `In-Room QR (Room ${newOrder.roomNumber})`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setTransactions(prev => [kotTx, ...prev]);

    // Update room outstanding balance
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === newOrder.roomNumber) {
        return {
          ...r,
          outstandingBalance: (r.outstandingBalance || 0) + Number(newOrder.totalAmount)
        };
      }
      return r;
    }));

    // Post to Cloudflare D1 via public guest action
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'place_food_order',
        payload: {
          roomNumber: newOrder.roomNumber,
          guestName: `Room ${newOrder.roomNumber} In-House Guest`,
          items: newOrder.items,
          subtotal: Math.round((newOrder.totalAmount / 1.05) * 100) / 100,
          gst: Math.round((newOrder.totalAmount - (newOrder.totalAmount / 1.05)) * 100) / 100,
          totalAmount: newOrder.totalAmount,
          isJain: newOrder.is_jain_satvik === 1
        }
      })
    }).catch(err => console.warn('Offline in-room food order sync:', err));
  };

  const handleRequestRoomServiceFromGuestPortal = (newReq) => {
    setRoomServices(prev => [newReq, ...prev]);

    // Post to Cloudflare D1 via public guest action
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'place_room_service',
        payload: {
          roomNumber: newReq.roomNumber,
          serviceType: newReq.serviceType,
          description: newReq.description,
          priority: newReq.priority || 'Normal'
        }
      })
    }).catch(err => console.warn('Offline room service sync:', err));
  };

  const [searchDates, setSearchDates] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: '2'
  });

  // Sync with Cloudflare Edge on mount and view changes
  useEffect(() => {
    const adminPin = adminPinVerified ? getVerifiedAdminPin() : '';
    const headers = adminPin ? { 'X-Admin-Key': adminPin } : {};

    fetch('/api/sync', { headers })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          if (data.data.rooms && data.data.rooms.length > 0) {
            const mappedRooms = data.data.rooms.map(r => ({
              ...r,
              roomNumber: r.roomNumber || r.room_number,
              roomType: r.roomType || r.room_type || 'EXEDEL',
              floor: r.floor,
              tariff: r.tariff,
              basePrice: r.basePrice || r.tariff,
              outstandingBalance: r.outstandingBalance !== undefined ? r.outstandingBalance : (r.outstanding_balance !== undefined ? r.outstanding_balance : 0),
              balanceDue: r.balanceDue !== undefined ? r.balanceDue : (r.outstanding_balance !== undefined ? r.outstanding_balance : 0),
              pax: r.pax || '1 Pax',
              currentGuestName: r.currentGuestName || r.current_guest_name,
              currentBookingId: r.currentBookingId || r.current_booking_id,
              status: r.status
            }));
            setRooms(mappedRooms);
          }
          if (data.data.bookings && data.data.bookings.length > 0) {
            const mappedBookings = data.data.bookings.map(b => ({
              ...b,
              bookingId: b.booking_id || b.bookingId,
              roomNumber: b.room_number || b.roomNumber,
              guestName: b.guest_name || b.guestName,
              guestPhone: b.guest_phone || b.guestPhone,
              guestEmail: b.guest_email || b.guestEmail,
              checkInDate: b.check_in_date || b.checkInDate,
              checkOutDate: b.check_out_date || b.checkOutDate,
              tariffPerNight: b.tariff_per_night !== undefined ? b.tariff_per_night : b.tariffPerNight,
              baseTotal: b.base_total !== undefined ? b.base_total : b.baseTotal,
              cgst: b.cgst,
              sgst: b.sgst,
              totalAmount: b.total_amount !== undefined ? b.total_amount : b.totalAmount,
              advanceDeposit: b.advance_deposit !== undefined ? b.advance_deposit : b.advanceDeposit,
              balanceDue: b.balance_due !== undefined ? b.balance_due : b.balanceDue,
              paymentMode: b.payment_mode || b.paymentMode,
              paymentStatus: b.payment_status || b.paymentStatus,
              bookingStatus: b.booking_status || b.bookingStatus,
              isB2b: b.is_b2b !== undefined ? b.is_b2b : b.isB2b,
              corporateId: b.corporate_id || b.corporateId,
              corporateGstin: b.corporate_gstin || b.corporateGstin,
              companyName: b.company_name || b.companyName || '',
              billNo: b.bill_no || b.billNo || `INV-${b.room_number || b.roomNumber}-${(b.booking_id || b.bookingId || '').slice(-4)}`
            }));
            setBookings(mappedBookings);
          }
          if (data.data.corporatePartners && data.data.corporatePartners.length > 0) {
            setCorporatePartners(data.data.corporatePartners);
          }
          if (data.data.folioTransactions && data.data.folioTransactions.length > 0) {
            const mappedTxs = data.data.folioTransactions.map(t => ({
              transactionId: t.transaction_id || t.transactionId,
              folioId: t.folio_id || t.folioId,
              bookingId: t.booking_id || t.bookingId,
              roomNumber: t.room_number || t.roomNumber,
              transactionType: t.transaction_type || t.transactionType,
              outlet: t.outlet,
              itemCode: t.item_code || t.itemCode,
              description: t.description,
              debitAmount: t.debit_amount !== undefined ? t.debit_amount : t.debitAmount,
              creditAmount: t.credit_amount !== undefined ? t.credit_amount : t.creditAmount,
              taxableBase: t.taxable_base !== undefined ? t.taxable_base : t.taxableBase,
              gstRate: t.gst_rate !== undefined ? t.gst_rate : t.gstRate,
              cgst: t.cgst,
              sgst: t.sgst,
              sacCode: t.sac_code || t.sacCode,
              invoiceId: t.invoice_id || t.invoiceId,
              isLocked: t.is_locked !== undefined ? t.is_locked : t.isLocked,
              createdBy: t.created_by || t.createdBy,
              createdAt: t.created_at || t.createdAt || t.date
            }));
            setTransactions(mappedTxs);
          }
          if (data.data.foodOrders && data.data.foodOrders.length > 0) {
            setFoodOrders(data.data.foodOrders);
          }
          if (data.data.roomServiceRequests && data.data.roomServiceRequests.length > 0) {
            setRoomServices(data.data.roomServiceRequests);
          }
        }
      })
      .catch(err => {
        console.debug("Edge sync offline, initialized with 18-inventory state:", err);
      });
  }, [currentView, adminPinVerified]);

  const handleOpenBooking = (tier, roomNumber = null) => {
    setSelectedTierForBooking(tier || ROOM_TIERS[0]);
    setSelectedRoomNumForBooking(roomNumber);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (newBooking) => {
    setBookings(prev => [newBooking, ...prev]);
    // Update room status and outstanding balance on front desk matrix
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === newBooking.roomNumber) {
        return {
          ...r,
          status: 'Occupied',
          currentGuestName: newBooking.guestName,
          currentBookingId: newBooking.bookingId,
          outstandingBalance: newBooking.balanceDue !== undefined ? newBooking.balanceDue : (newBooking.totalAmount || r.tariff || 1699)
        };
      }
      return r;
    }));

    // Persist new booking to Cloudflare D1
    try {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_booking', payload: newBooking })
      }).catch(err => console.warn("Cloudflare D1 save_booking background sync:", err));
    } catch (e) {}

    // Auto-inject Day-1 Room Tariff debit and Advance Deposit credit into central transactions ledger
    const initialTxs = [];
    const tariffAmount = Number(newBooking.tariffPerNight || newBooking.baseTotal || 1699);
    initialTxs.push({
      transactionId: `TXN-TARIFF-${newBooking.roomNumber}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${newBooking.roomNumber}`,
      bookingId: newBooking.bookingId,
      roomNumber: newBooking.roomNumber,
      transactionType: 'Room Charge',
      outlet: 'Front Desk PMS',
      itemCode: 'TARIFF-DAY1',
      description: `Room Tariff - ${newBooking.tier || 'Room'} (Day 1 Check-In)`,
      debitAmount: tariffAmount,
      creditAmount: 0,
      taxableBase: tariffAmount,
      gstRate: tariffAmount > 7500 ? 18 : (tariffAmount > 0 ? 12 : 0),
      cgst: Math.round(tariffAmount * 0.06 * 100) / 100,
      sgst: Math.round(tariffAmount * 0.06 * 100) / 100,
      sacCode: '996311',
      isLocked: 0,
      createdBy: 'Front Desk Reception',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    });

    if (newBooking.advanceDeposit && Number(newBooking.advanceDeposit) > 0) {
      initialTxs.push({
        transactionId: `TXN-ADV-${newBooking.roomNumber}-${Date.now().toString().slice(-4)}`,
        folioId: `FOLIO-${newBooking.roomNumber}`,
        bookingId: newBooking.bookingId,
        roomNumber: newBooking.roomNumber,
        transactionType: 'Payment',
        outlet: 'Front Desk PMS',
        itemCode: 'ADVANCE',
        description: `Check-In Advance Deposit (${newBooking.paymentMode || 'UPI'})`,
        debitAmount: 0,
        creditAmount: Number(newBooking.advanceDeposit),
        taxableBase: 0,
        gstRate: 0,
        cgst: 0,
        sgst: 0,
        sacCode: '-',
        isLocked: 0,
        createdBy: 'Front Desk Reception',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
    }

    setTransactions(prev => [...initialTxs, ...prev]);

    // Dispatch initial transactions to Cloudflare D1
    const adminPin = getVerifiedAdminPin();
    if (adminPin) {
      initialTxs.forEach(tx => {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
          body: JSON.stringify({ action: 'post_folio_transaction', payload: tx })
        }).catch(() => {});
      });
    }

    setCurrentReceiptBooking(newBooking);
    setReceiptModalOpen(true);
  };

  const handleUpdateRoomStatus = (roomNumber, status, guestName = null, bookingId = null) => {
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === roomNumber) {
        return {
          ...r,
          status,
          currentGuestName: status === 'Available' ? null : (guestName !== undefined ? guestName : r.currentGuestName),
          currentBookingId: status === 'Available' ? null : (bookingId !== undefined ? bookingId : r.currentBookingId)
        };
      }
      return r;
    }));

    // Send update to Edge
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'update_room_status',
        payload: { roomNumber, status, guestName, bookingId }
      })
    }).catch(() => {});
  };

  const handleRunNightAudit = () => {
    setNightAuditModalOpen(true);
  };

  const handleAddTransaction = (newTxn) => {
    setTransactions(prev => [newTxn, ...prev]);

    // Dispatch to Cloudflare Edge D1
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'post_folio_transaction',
        payload: newTxn
      })
    }).catch(err => console.warn('Offline transaction sync:', err));
  };

  const handleBillToRoomFromPOS = (payload) => {
    const newTxn = {
      transactionId: `TXN-${payload.roomNumber}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${payload.roomNumber}`,
      bookingId: `BOOK-${payload.roomNumber}`,
      roomNumber: payload.roomNumber,
      transactionType: 'Food & Beverage',
      outlet: payload.outlet || 'Fenugreek Restaurant',
      itemCode: payload.kotId,
      description: payload.description,
      debitAmount: payload.totalAmount,
      creditAmount: 0,
      taxableBase: payload.subtotal,
      gstRate: 5,
      cgst: payload.gst / 2,
      sgst: payload.gst / 2,
      sacCode: '996331',
      invoiceCategory: 'Food',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setTransactions(prev => [newTxn, ...prev]);

    // Immediately update room outstanding balance on front desk matrix
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === payload.roomNumber) {
        const currentBal = Number(r.outstandingBalance !== undefined ? r.outstandingBalance : (r.tariff || 0));
        return {
          ...r,
          outstandingBalance: Math.round((currentBal + payload.totalAmount) * 100) / 100
        };
      }
      return r;
    }));

    // Immediately update booking balance due
    setBookings(prev => prev.map(b => {
      if ((b.roomNumber === payload.roomNumber || b.room_number === payload.roomNumber) && b.bookingStatus !== 'Checked Out') {
        const currentBal = Number(b.balanceDue !== undefined ? b.balanceDue : (b.totalAmount || 0));
        return {
          ...b,
          balanceDue: Math.round((currentBal + payload.totalAmount) * 100) / 100
        };
      }
      return b;
    }));

    // Dispatch to Cloudflare Edge D1
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'bill_kot_to_room',
        payload: {
          roomNumber: payload.roomNumber,
          kotId: payload.kotId,
          items: payload.items || [],
          subtotal: payload.subtotal,
          gst: payload.gst,
          totalAmount: payload.totalAmount,
          description: payload.description,
          outlet: payload.outlet || 'Fenugreek Restaurant',
          captainName: payload.captainName || 'F&B Captain'
        }
      })
    }).catch(err => console.warn('Offline KOT room bill sync:', err));

    // Also propagate to Live Food Orders & KDS queue
    handleAddFoodOrder({
      orderId: payload.kotId,
      roomNumber: payload.roomNumber,
      tableNumber: null,
      guestName: rooms.find(r => r.roomNumber === payload.roomNumber)?.currentGuestName || `Room ${payload.roomNumber} Guest`,
      outlet: payload.outlet || 'Cannon Kitchen',
      status: 'Received',
      items: payload.items?.map(it => ({
        name: it.item?.name || it.name,
        quantity: it.quantity,
        price: it.item?.price || it.price,
        notes: it.notes
      })) || [],
      totalAmount: payload.totalAmount,
      is_jain_satvik: payload.items?.some(it => it.cookingTags?.includes('Satvik')) ? 1 : 0,
      captain: payload.captainName || 'KOTI',
      created_at: new Date().toISOString()
    });

    alert(`✓ KOT #${payload.kotId} (${payload.outlet || 'Fenugreek Restaurant'}) of ₹${payload.totalAmount.toFixed(2)} debited directly to Room ${payload.roomNumber} Master Folio & synced to D1!`);
  };

  const handleSettleFolio = (roomNumber, tenderRows) => {
    handleUpdateRoomStatus(roomNumber, 'Cleaning');
    setTransactions(prev => prev.map(t => t.roomNumber === roomNumber ? { ...t, isLocked: 1 } : t));

    // Dispatch to Cloudflare Edge D1
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'settle_split_payment',
        payload: {
          folioId: `FOLIO-${roomNumber}`,
          roomNumber,
          invoiceId: `INV-${roomNumber}`,
          tenderRows
        }
      })
    }).catch(err => console.warn('Offline split settlement sync:', err));

    alert(`✓ Room ${roomNumber} folio settled via ${tenderRows.length} tenders! Room status changed to 'Cleaning'.`);
  };

  const handleExecuteNightAudit = (auditPayload) => {
    setTransactions(prev => prev.map(t => ({ ...t, isLocked: 1 })));

    // Dispatch to Cloudflare Edge D1
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'execute_night_audit',
        payload: auditPayload
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          console.log(`✓ Night Audit synced to Cloudflare D1 (auditId: ${data.auditId})`);
        }
      })
      .catch(err => console.warn('Offline night audit sync:', err));

    alert(`✓ Night Audit for ${auditPayload.businessDate} executed & synced to Cloudflare D1! All transactions locked (is_locked = 1). Business date rolled.`);
  };

  // Dedicated In-Room Guest Portal View (When QR Code is scanned in a guest room)
  // Shows ONLY: 1. Food Menu (Cannon Kitchen) | 2. Room Services Care | 3. High-Speed Wi-Fi QR
  if (inRoomPortalState.active) {
    return (
      <Suspense fallback={
        <div style={{
          minHeight: '100vh',
          background: '#0a192f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold-glow, #d4af37)',
          fontWeight: 800,
          fontSize: '1.2rem',
          letterSpacing: '0.5px'
        }}>
          Loading Hotel Sai In-Room Companion...
        </div>
      }>
        <InRoomGuestPortal 
          roomNumber={inRoomPortalState.roomNumber}
          onPlaceFoodOrder={handlePlaceFoodOrderFromGuestPortal}
          onRequestRoomService={handleRequestRoomServiceFromGuestPortal}
          onExitToFullWebsite={() => {
            setInRoomPortalState({ active: false, roomNumber: inRoomPortalState.roomNumber });
            if (typeof window !== 'undefined' && window.history) {
              window.history.pushState({}, '', window.location.pathname);
            }
          }}
          activeFoodOrders={foodOrders}
          activeRoomServices={roomServices}
        />
      </Suspense>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar with 18-room counter & view switcher */}
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpen3DExplorer={() => setFloorExplorerOpen(true)}
        onOpenVirtualTour={() => handleOpenVirtualTour('entrance-gate')}
        onOpenDining={() => setDiningModalOpen(true)}
        onOpenDarshan={() => setDarshanModalOpen(true)}
        onOpenAiConcierge={() => setAiConciergeOpen(true)}
        onOpenBotFleet={() => setBotFleetOpen(true)}
        onOpenCorporate={() => setCorporateModalOpen(true)}
        onOpenMasterFolio={handleOpenMasterFolio}
        onOpenCannonKitchenPOS={() => setPosModalOpen(true)}
        onOpenAccountsLedger={() => setAccountsModalOpen(true)}
        onOpenNightAudit={() => setNightAuditModalOpen(true)}
        onOpenStoreInventory={() => setStoreInventoryModalOpen(true)}
        onOpenDirectorPortal={() => setDirectorPortalOpen(true)}
        onOpenRevenueManagement={() => setRevenueModalOpen(true)}
        onOpenD1Database={handleOpenD1Database}
        onOpenCaFilingStation={() => setCaFilingModalOpen(true)}
        rooms={rooms}
        adminPinVerified={adminPinVerified}
        setAdminPinVerified={setAdminPinVerified}
        showPinPrompt={showPinPrompt}
        setShowPinPrompt={setShowPinPrompt}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'guest' ? (
          <>
            <Hero 
              rooms={rooms}
              onOpenBooking={handleOpenBooking}
              onOpen3DExplorer={() => setFloorExplorerOpen(true)}
              onOpenVirtualTour={() => handleOpenVirtualTour('entrance-gate')}
              onOpenAiConcierge={() => setAiConciergeOpen(true)}
              searchDates={searchDates}
              setSearchDates={setSearchDates}
            />

            <div id="inventory">
              <RoomCatalog 
                rooms={rooms}
                dynamicRates={dynamicRates}
                onSelectTier={handleOpenBooking}
                onOpen3DExplorer={() => setFloorExplorerOpen(true)}
                onOpenVirtualTour={handleOpenVirtualTour}
              />
            </div>

            <SatvikDining 
              onOpenOrderModal={(item) => {
                setSelectedFoodItem(item);
                setDiningModalOpen(true);
              }}
            />

            <FaqSection 
              onOpenBooking={() => handleOpenBooking(ROOM_TIERS[0])}
            />

            <Suspense fallback={null}>
              <FinancialAnalytics bookings={bookings} />
            </Suspense>
          </>
        ) : (
          <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gold-glow)' }}>Loading Front Desk PMS...</div>}>
            <ErrorBoundary onExit={() => setCurrentView('guest')}>
              <ReceptionAdmin 
                rooms={rooms}
                bookings={bookings}
                transactions={transactions}
                initialTab={pmsInitialTab}
                onAddTransaction={handleAddTransaction}
                onUpdateRoomStatus={handleUpdateRoomStatus}
                onNewBooking={handleBookingSuccess}
                onUpdateBooking={(updated) => {
                  if (updated && (updated.bookingId || updated.id)) {
                    const bId = updated.bookingId || updated.id;
                    setBookings(prev => prev.map(b => (b.bookingId === bId || b.id === bId || b.roomNumber === updated.roomNumber) ? { ...b, ...updated } : b));
                  }
                }}
                onRunNightAudit={handleRunNightAudit}
                onExitPMS={() => setCurrentView('guest')}
                onOpenMasterFolio={handleOpenMasterFolio}
                onOpenRestaurantPOS={() => setPosModalOpen(true)}
                onOpenAccountsLedger={(tab) => handleOpenAccountsWithTab(tab || 'tally-erp')}
                onOpenStoreInventory={() => setStoreInventoryModalOpen(true)}
                onOpenNightAuditModal={() => setNightAuditModalOpen(true)}
                onOpenDirectorPortal={() => setDirectorPortalOpen(true)}
                onOpenRevenueManagement={() => setRevenueModalOpen(true)}
                onOpenCaFilingStation={() => setCaFilingModalOpen(true)}
                foodOrders={foodOrders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                roomServices={roomServices}
                onAddRoomService={handleRequestRoomServiceFromGuestPortal}
              />
            </ErrorBoundary>

            <FinancialAnalytics bookings={bookings} />
          </Suspense>
        )}
      </main>

      {/* On-Demand Modals with Suspense Code-Splitting */}
      <Suspense fallback={null}>
        <FloorExplorer3DModal 
          isOpen={floorExplorerOpen}
          onClose={() => setFloorExplorerOpen(false)}
          rooms={rooms}
          onBookRoom={(tier, roomNumber) => handleOpenBooking(tier, roomNumber)}
          onOpen360Tour={(sceneId) => handleOpenVirtualTour(sceneId)}
        />

        <VirtualTour360Modal 
          isOpen={virtualTourOpen}
          onClose={() => setVirtualTourOpen(false)}
          initialSceneId={virtualTourSceneId}
          onOpen3DExplorer={() => setFloorExplorerOpen(true)}
          onBookRoom={(tier, roomNumber) => handleOpenBooking(tier, roomNumber)}
        />

        <BookingModal 
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          initialTier={selectedTierForBooking}
          initialRoomNumber={selectedRoomNumForBooking}
          rooms={rooms}
          bookings={bookings}
          dynamicRates={dynamicRates}
          onBookingSuccess={handleBookingSuccess}
        />

        <BookingReceiptModal 
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          booking={currentReceiptBooking}
          onUpdateBooking={(updated) => {
            if (updated && (updated.bookingId || updated.id)) {
              const bId = updated.bookingId || updated.id;
              setBookings(prev => prev.map(b => (b.bookingId === bId || b.id === bId) ? { ...b, ...updated } : b));
              setCurrentReceiptBooking(updated);
            }
          }}
        />

        <FoodOrderModal 
          isOpen={diningModalOpen}
          onClose={() => {
            setDiningModalOpen(false);
            setSelectedFoodItem(null);
          }}
          initialItem={selectedFoodItem}
          rooms={rooms}
          onBillToRoom={handleBillToRoomFromPOS}
        />

        <DarshanAdvisorModal 
          isOpen={darshanModalOpen}
          onClose={() => setDarshanModalOpen(false)}
        />

        <AiConciergeModal 
          isOpen={aiConciergeOpen}
          onClose={() => setAiConciergeOpen(false)}
        />

        <AutonomousBotFleetModal 
          isOpen={botFleetOpen}
          onClose={() => setBotFleetOpen(false)}
        />

        <CorporatePortalModal 
          isOpen={corporateModalOpen}
          onClose={() => setCorporateModalOpen(false)}
        />

        {/* IDS Next Enterprise Operational Modals - Unified Primary Folio (1-17 Actions) */}
        {folioModalOpen && (
          <FolioActionsModal 
            isOpen={folioModalOpen}
            onClose={() => setFolioModalOpen(false)}
            room={rooms.find(r => String(r.roomNumber) === String(selectedFolioRoomNumber)) || rooms.find(r => r.status === 'Occupied') || rooms[0]}
            rooms={rooms}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onShiftRoom={(fromRoom, toRoom) => {
              handleUpdateRoomStatus(fromRoom, 'Available', null, null);
              handleUpdateRoomStatus(toRoom, 'Occupied', 'Guest', null);
              setFolioModalOpen(false);
            }}
            onCheckoutRoom={(roomNumber) => {
              handleUpdateRoomStatus(roomNumber, 'Cleaning', null, null);
              setFolioModalOpen(false);
            }}
          />
        )}

        {posModalOpen && (
          <CannonKitchenPOS 
            isOpen={posModalOpen}
            onClose={() => setPosModalOpen(false)}
            rooms={rooms}
            onBillToRoom={handleBillToRoomFromPOS}
            foodOrders={foodOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddFoodOrder={handleAddFoodOrder}
          />
        )}

        {accountsModalOpen && (
          <AccountsLedgerModal 
            isOpen={accountsModalOpen}
            onClose={() => setAccountsModalOpen(false)}
            bookings={bookings}
            rooms={rooms}
            transactions={transactions}
            corporatePartners={corporatePartners}
            onAddTransaction={handleAddTransaction}
            initialTab={accountsInitialTab}
          />
        )}

        {nightAuditModalOpen && (
          <NightAuditModal 
            isOpen={nightAuditModalOpen}
            onClose={() => setNightAuditModalOpen(false)}
            rooms={rooms}
            bookings={bookings}
            transactions={transactions}
            onExecuteNightAudit={handleExecuteNightAudit}
          />
        )}

        {storeInventoryModalOpen && (
          <StoreInventoryModal 
            isOpen={storeInventoryModalOpen}
            onClose={() => setStoreInventoryModalOpen(false)}
          />
        )}

        {directorPortalOpen && (
          <DirectorPortal 
            isOpen={directorPortalOpen}
            onClose={() => setDirectorPortalOpen(false)}
            rooms={rooms}
            bookings={bookings}
            onOpenRevenueManagement={() => {
              setDirectorPortalOpen(false);
              setRevenueModalOpen(true);
            }}
          />
        )}

        {/* IDeaS SAS G3 RMS Platform Revenue Director's Console */}
        {revenueModalOpen && (
          <RevenueManagementModal 
            isOpen={revenueModalOpen}
            onClose={() => setRevenueModalOpen(false)}
            currentOccupancy={Math.round((rooms.filter(r => r.status === 'Occupied').length / (rooms.length || 18)) * 100)}
            activeRates={dynamicRates}
          onPublishRates={(newRates) => {
            setDynamicRates(newRates);
            setRooms(prev => prev.map(r => {
              const tierId = r.tier === 'Standard Deluxe' ? 'standard-deluxe' :
                             r.tier === 'Deluxe Room' ? 'deluxe-room' :
                             r.tier === 'Executive Room' ? 'executive-room' : 'premium-suite';
              if (newRates[tierId]) {
                return { ...r, tariff: newRates[tierId].recommendedRate };
              }
              return r;
            }));

            // Persist published rates to Cloudflare D1
            const adminPin = getVerifiedAdminPin();
            if (adminPin) {
              fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
                body: JSON.stringify({ action: 'publish_dynamic_rates', payload: { rates: newRates } })
              }).catch(e => console.warn('D1 rate publish sync:', e));
            }

            alert("⚡ IDeaS G3 RMS: Continuous dynamic micro-rates published to live booking engine, room catalog, front desk reception, and synced to Cloudflare D1!");
          }}
        />
        )}

        {/* Statutory Legal & Compliance Modals */}
        <LegalPoliciesModal 
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          initialTab={legalModalTab}
        />

        <DpdpDataRightsModal 
          isOpen={dataRightsModalOpen}
          onClose={() => setDataRightsModalOpen(false)}
        />

        {/* System #36: CA Filing Station & Financial Intelligence Engine Modal */}
        {caFilingModalOpen && (
          <CaFilingStationModal 
            isOpen={caFilingModalOpen}
            onClose={() => setCaFilingModalOpen(false)}
          />
        )}
      </Suspense>

      <Footer 
        onOpenDarshan={() => setDarshanModalOpen(true)}
        onOpenDining={() => setDiningModalOpen(true)}
        onOpenCorporate={() => setCorporateModalOpen(true)}
        onOpenBotFleet={() => setBotFleetOpen(true)}
        onOpenLegal={(tab) => {
          setLegalModalTab(tab);
          setLegalModalOpen(true);
        }}
        onOpenDataRights={() => setDataRightsModalOpen(true)}
      />

      <CookieConsentBanner 
        onOpenPolicy={() => {
          setLegalModalTab('cookies');
          setLegalModalOpen(true);
        }}
      />

      {/* 21st.dev / Magic UI Floating Luxury Navigation Dock */}
      <FloatingDock 
        items={[
          {
            title: "Reserve Luxury Room",
            icon: <Hotel className="h-5 w-5" />,
            onClick: () => handleOpenBooking(ROOM_TIERS[0])
          },
          {
            title: "3D Isometric Tour",
            icon: <Layers className="h-5 w-5" />,
            onClick: () => setFloorExplorerOpen(true)
          },
          {
            title: "360° Virtual Tour",
            icon: <Compass className="h-5 w-5 text-amber-400" />,
            onClick: () => handleOpenVirtualTour('entrance-gate')
          },
          {
            title: "Tally Prime ERP",
            icon: <Terminal className="h-5 w-5 text-sky-400" />,
            onClick: () => handleOpenAccountsWithTab('tally-erp')
          },
          {
            title: "Accounts Day Book",
            icon: <Scale className="h-5 w-5" />,
            onClick: () => handleOpenAccountsWithTab('reconciliation-audit')
          },
          {
            title: "System #36: CA Filing Station",
            icon: <Scale className="h-5 w-5 text-amber-300" />,
            onClick: () => setCaFilingModalOpen(true)
          },
          {
            title: "Cannon Kitchen POS",
            icon: <Utensils className="h-5 w-5" />,
            onClick: () => setPosModalOpen(true)
          },
          {
            title: "D1 Database (68 Tables)",
            icon: <Database className="h-5 w-5 text-amber-400" />,
            onClick: handleOpenD1Database
          },

          {
            title: "24/7 WhatsApp Concierge",
            icon: <MessageCircle className="h-5 w-5 text-emerald-400" />,
            onClick: () => window.open('https://wa.me/917978043585?text=Hello%20Sri%20Sai%20Vasudev%20Residency%20Front%20Desk,%20I%20would%20like%20to%20inquire%20about%20a%20booking', '_blank', 'noopener,noreferrer')
          },
          {
            title: currentView === 'pms' ? "Exit PMS (Return to Website)" : "Reception PMS",
            icon: <ShieldCheck className="h-5 w-5" />,
            onClick: () => {
              if (currentView === 'pms') {
                setCurrentView('guest');
              } else if (adminPinVerified) {
                setCurrentView('pms');
              } else {
                setShowPinPrompt(true);
              }
            }
          }
        ]}
      />

      {/* 24/7 Floating WhatsApp Direct Concierge (Bottom Left) */}
      {currentView === 'guest' && (
        <a
          href="https://wa.me/917978043585?text=Hello%20Sri%20Sai%20Vasudev%20Residency%20Front%20Desk,%20I%20would%20like%20to%20inquire%20about%20a%20booking"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 890,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '50px',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(8px)'
          }}
          className="whatsapp-floating-concierge"
          title="Instant 24/7 Front Desk WhatsApp Support"
        >
          <MessageCircle size={18} />
          <span className="hide-on-mobile">WhatsApp Desk</span>
        </a>
      )}
    </div>
  );
}
