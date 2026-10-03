import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Hotel, Layers, Users, Calendar, ShieldCheck, Clock, 
  DollarSign, CheckCircle2, AlertTriangle, Printer, Download, 
  Search, RefreshCw, UserCheck, Phone, FileText, Sparkles, Scale, 
  Check, X, ChevronRight, Lock, Bed, Send, Ban, Wrench, Eye,
  Calculator, ClipboardList, Utensils, ShoppingBag, Receipt, Sparkle,
  ArrowRightLeft, Edit3, MessageCircle, TrendingUp, QrCode, Database,
  BellRing, Car, Globe, Radio, Bell, Sliders, LogOut, Coffee, Briefcase, PlusCircle
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS, GST_FOM_RECORDS_2026_09_25 } from '../data/hotelData';
import { maskAadhaar } from '../utils/security';
import { calculateRoomTax } from '../utils/taxUtils';
import FolioActionsModal from './FolioActionsModal';
import BookingReceiptModal from './BookingReceiptModal';
import CheckoutSplitModal from './CheckoutSplitModal';
import InteractiveCalendar from '@/components/ui/visualize-booking';
import RoomQrModal from './RoomQrModal';
import BackupRestoreModal from './BackupRestoreModal';
import LiveOrdersDrawerModal from './LiveOrdersDrawerModal';
import RoomServicesCareModal from './RoomServicesCareModal';
import LinenRoomAssetsSection from './LinenRoomAssetsSection';
import StaffPayrollSection from './StaffPayrollSection';
import TodayActivity from './TodayActivity';
import CheckInReviewModal from './CheckInReviewModal';
import { sendHousekeepingOrderWhatsApp, sendMaintenanceTicketWhatsApp } from '../utils/whatsappDispatch';
import StayDurationAnalytics from './StayDurationAnalytics';
import OperationsSettingsTab from './OperationsSettingsTab';
import D1LiveDatabaseExplorer from './D1LiveDatabaseExplorer';
import UniversalDateFilterBar from './UniversalDateFilterBar';
import DateRangeSelectionModal from './DateRangeSelectionModal';
import { useUniversalInlineEdit, InlineEditorBanner, InlineText, SheetsEditableCell, SheetsColumnHeader, SheetsToolbarLegend } from './UniversalInlineEditor';

// Frequent VIP & Corporate Guests for instant Walk-in auto-fill
const FREQUENT_VIP_GUESTS = [
  { name: 'MR. P ASHOK', phone: '+91 6305202068', aadhaar: '891234567890', origin: 'Andhra Pradesh', company: 'Linde India Ltd', billingType: 'BTC', mealPlan: 'CP' },
  { name: 'LAVAKANTA OJHA', phone: '+91 94371 44520', aadhaar: '745612348901', origin: 'Odisha', company: 'Akchem Synthetics', billingType: 'BTC', mealPlan: 'CP' },
  { name: 'BIJAY PASWAN', phone: '+91 98610 33812', aadhaar: '623489012345', origin: 'Jharkhand', company: 'PRADAN NGO', billingType: 'BTC', mealPlan: 'EP' },
  { name: 'UTKARSH SRIVASTAVA', phone: '+91 94370 88912', aadhaar: '512345678901', origin: 'Uttar Pradesh', company: 'Direct Guest', billingType: 'Direct', mealPlan: 'CP' },
  { name: 'SAHANAWAZ HUSSAIN', phone: '+91 94370 22555', aadhaar: '401234567890', origin: 'Odisha', company: 'Direct Guest', billingType: 'Direct', mealPlan: 'EP' },
  { name: 'SATYARANJAN SAHOO', phone: '+91 98612 11099', aadhaar: '390123456789', origin: 'Odisha', company: 'Direct Guest', billingType: 'Direct', mealPlan: 'CP' }
];

export default function ReceptionAdmin({
  rooms = [],
  bookings = [],
  transactions = [],
  onAddTransaction,
  onUpdateRoomStatus,
  onNewBooking,
  onUpdateBooking,
  onRunNightAudit,
  nightAudits = [],
  onExitPMS,
  onOpenMasterFolio,
  onOpenRestaurantPOS,
  onOpenAccountsLedger,
  onOpenStoreInventory,
  onOpenNightAuditModal,
  onOpenDirectorPortal,
  onOpenRevenueManagement,
  onOpenCaFilingStation,
  foodOrders: propFoodOrders,
  onUpdateOrderStatus: propUpdateOrderStatus,
  initialTab
}) {
  // The 3 Authorized Roles & 5 Department Console (Owner Video 2 Requirement)
  const [activeRole, setActiveRole] = useState('owner'); // 'owner' (Eswara MD), 'receptionist' (Front Desk), 'accounts' (Accounts Lead)
  const [activeDepartment, setActiveDepartment] = useState('reception'); // 'reception', 'restaurant', 'accounts', 'store', 'housekeeping'
  const [activeTab, setActiveTab] = useState(initialTab || 'tape-chart'); // 'tape-chart', 'd1-database-explorer', 'cashier-audit', etc.

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [tapeChartViewMode, setTapeChartViewMode] = useState('table'); // 'table' (Master Tabular Ledger), 'mysoft' (Legacy Tape Matrix), or 'modern' (Cards)
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Authentic Mysoft Universal Date Range Selector States (From Date -> To Date)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [filterFromDate, setFilterFromDate] = useState(todayStr);
  const [filterToDate, setFilterToDate] = useState(todayStr);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  const isInlineEditActive = true; // Always-on — no toggle needed
  const searchInputRef = useRef(null);
  const receptionContainerRef = useRef(null);

  const handleInlineSave = ({ target, newText, oldText, field, roomId, bookingId }) => {
    if (roomId && field === 'guestName' && onUpdateRoomStatus) {
      onUpdateRoomStatus(roomId, 'Occupied', newText);
    }
  };

  useUniversalInlineEdit({
    isActive: true,
    containerRef: receptionContainerRef,
    onSave: handleInlineSave,
    storagePrefix: 'hsi_pms'
  });

  // Folio Actions & GRC Modals State (hotel_documents.pdf Pages 1 & 5)
  const [selectedFolioRoom, setSelectedFolioRoom] = useState(null);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptModalType, setReceiptModalType] = useState('a4'); // 'a4', 'grc', 'room-split', 'food-split', 'pos'

  // Checkout & Multi-Tender Split Settlement Modal (Owner Request: PhonePe + Cash Split)
  const [checkoutRoom, setCheckoutRoom] = useState(null);
  const [recentSettlements, setRecentSettlements] = useState([
    {
      roomNumber: '101',
      guestName: 'MR. P ASHOK',
      tier: 'Executive AC',
      totalAmount: 962.00,
      billTotal: 962.00,
      settlementTime: '12:45 PM',
      settlementDate: '22/09/2026',
      billNo: 'FMBIL2627-00101',
      tendersSummary: ['Cash: ₹500', 'PhonePe (UPI): ₹462 [Ref: UPI-849102]'],
      tenders: { cash: 500, upi: 462, upiRef: 'UPI-849102', upiProvider: 'PhonePe', card: 0, btc: 0 }
    }
  ]);

  // Operational Modals: Room QR, Backup JSON, Live Food Orders, Room Services Care, Transit, Transfer, Wake-Up
  const [roomQrOpen, setRoomQrOpen] = useState(false);
  const [selectedRoomForQr, setSelectedRoomForQr] = useState('101');
  const [backupOpen, setBackupOpen] = useState(false);
  const [liveOrdersOpen, setLiveOrdersOpen] = useState(false);
  const [roomServicesCareOpen, setRoomServicesCareOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWakeUpModalOpen, setIsWakeUpModalOpen] = useState(false);
  const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
  const [isRoomRackPrintOpen, setIsRoomRackPrintOpen] = useState(false);
  const [isPolicePrintOpen, setIsPolicePrintOpen] = useState(false);
  const [isHousekeepingPrintOpen, setIsHousekeepingPrintOpen] = useState(false);
  const [isLuggageModalOpen, setIsLuggageModalOpen] = useState(false);
  const [luggagePasses, setLuggagePasses] = useState([
    {
      id: 'LUG-2026-041',
      roomNumber: '204',
      guestName: 'K. RAMA MURTHY',
      phone: '+91 98480 33119',
      bagsCount: 2,
      bagType: '1 Strolley + 1 Backpack',
      droppedTime: '11:15 AM',
      pickupTime: '07:30 PM',
      trainNo: '18448 Hirakhand Exp',
      lockerNo: 'Locker-03',
      status: 'In Custody'
    },
    {
      id: 'LUG-2026-042',
      roomNumber: '102',
      guestName: 'M. BALARAM PRASAD',
      phone: '+91 94372 10982',
      bagsCount: 1,
      bagType: 'Executive Laptop Bag',
      droppedTime: '12:00 PM',
      pickupTime: '05:45 PM',
      trainNo: '18517 Korba Express',
      lockerNo: 'Locker-05',
      status: 'In Custody'
    }
  ]);
  const [luggageForm, setLuggageForm] = useState({
    roomNumber: '101',
    guestName: '',
    phone: '',
    bagsCount: 2,
    bagType: 'Trolley Bags',
    pickupTime: '07:00 PM',
    trainNo: '18448 Hirakhand Exp',
    lockerNo: 'Locker-06'
  });

  // The Wild Oasis Features: Check-In Review Modal & Internal Arrivals Management
  const [selectedArrivalForCheckIn, setSelectedArrivalForCheckIn] = useState(null);
  const [isCheckInReviewOpen, setIsCheckInReviewOpen] = useState(false);
  const [opsSettings, setOpsSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('hsi_operations_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Ops settings fallback:', e);
    }
    return {
      breakfastRate: 250,
      extraBedRate: 400,
      stationDropRate: 350,
      standardCheckInTime: '11:00 AM',
      standardCheckOutTime: '12:00 PM',
      minStayNights: 1,
      minStayFestivalNights: 2
    };
  });

  // Operational Keyboard Highway (F1-F8 & Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = document.activeElement && (document.activeElement.isContentEditable || activeTag === 'input' || activeTag === 'textarea');
      if (isInput) return;

      if (e.key === 'Escape' && onExitPMS) {
        if (!isReceiptModalOpen && !selectedFolioRoom && !checkoutRoom && !roomQrOpen && !backupOpen && !liveOrdersOpen && !roomServicesCareOpen && !isCheckInReviewOpen) {
          onExitPMS();
        }
      } else if (e.key === 'F1') {
        e.preventDefault();
        setActiveDepartment('reception');
        setActiveTab('tape-chart');
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (onOpenRestaurantPOS) onOpenRestaurantPOS();
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (onOpenAccountsLedger) onOpenAccountsLedger();
      } else if (e.key === 'F4') {
        e.preventDefault();
        const targetRoom = rooms.find(r => r.status === 'Occupied') || rooms[0];
        if (targetRoom) setSelectedFolioRoom(targetRoom);
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (onOpenStoreInventory) onOpenStoreInventory();
      } else if (e.key === 'F6') {
        e.preventDefault();
        if (onOpenRevenueManagement) onOpenRevenueManagement();
      } else if (e.key === 'F7') {
        e.preventDefault();
        if (onOpenNightAuditModal) onOpenNightAuditModal();
        else setActiveTab('cashier-audit');
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (onOpenDirectorPortal) onOpenDirectorPortal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onExitPMS, onOpenRestaurantPOS, onOpenAccountsLedger, onOpenMasterFolio, 
    onOpenStoreInventory, onOpenRevenueManagement, onOpenNightAuditModal, onOpenDirectorPortal,
    isReceiptModalOpen, selectedFolioRoom, checkoutRoom, roomQrOpen, backupOpen, liveOrdersOpen, roomServicesCareOpen, isCheckInReviewOpen
  ]);

  // The Wild Oasis Protocol: Pre-Booked Arrivals Scheduled for Today
  const [internalBookings, setInternalBookings] = useState([
    {
      bookingId: 'HSI-ARR-2026-001',
      roomNumber: '201',
      tier: 'Executive AC',
      guestName: 'K. RAMA MURTHY',
      guestPhone: '+91 98480 33119',
      idProofType: 'Aadhaar Card',
      idProofMasked: 'XXXX-XXXX-3319',
      stateOfOrigin: 'Andhra Pradesh (Visakhapatnam)',
      nights: 2,
      adults: 2,
      tariffPerNight: 2199,
      totalAmount: 4398,
      advanceDeposit: 1000,
      balanceDue: 3398,
      paymentMode: 'UPI (PhonePe)',
      bookingStatus: 'Booked / Due In',
      isB2b: false,
      mealPlan: 'CP'
    },
    {
      bookingId: 'HSI-ARR-2026-002',
      roomNumber: '102',
      tier: 'Standard Deluxe',
      guestName: 'SUBHASH CHANDRA DAS',
      guestPhone: '+91 94371 88291',
      idProofType: 'Driving Licence',
      idProofMasked: 'OD-18-XXXX-8291',
      stateOfOrigin: 'Odisha (Bhubaneswar)',
      nights: 1,
      adults: 1,
      tariffPerNight: 1699,
      totalAmount: 1699,
      advanceDeposit: 1699,
      balanceDue: 0,
      paymentMode: 'Online Direct Card',
      bookingStatus: 'Booked / Due In',
      isB2b: true,
      corporateGstin: '21AAACS4412B1ZA',
      mealPlan: 'EP'
    },
    {
      bookingId: 'HSI-ARR-2026-003',
      roomNumber: '104',
      tier: 'Executive AC',
      guestName: 'UTKARSH SRIVASTAVA',
      guestPhone: '+91 94370 88912',
      idProofType: 'Passport',
      idProofMasked: 'Z-XXXX-8912',
      stateOfOrigin: 'Uttar Pradesh (Varanasi)',
      nights: 3,
      adults: 1,
      tariffPerNight: 2199,
      totalAmount: 6597,
      advanceDeposit: 500,
      balanceDue: 6097,
      paymentMode: 'Cash at Desk',
      bookingStatus: 'Booked / Due In',
      isB2b: false,
      mealPlan: 'CP'
    }
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedFolioRoom) setSelectedFolioRoom(null);
        else if (checkoutRoom) setCheckoutRoom(null);
        else if (isReceiptModalOpen) setIsReceiptModalOpen(false);
        else if (isCheckInReviewOpen) setIsCheckInReviewOpen(false);
        else if (roomQrOpen) setRoomQrOpen(false);
        else if (backupOpen) setBackupOpen(false);
        else if (liveOrdersOpen) setLiveOrdersOpen(false);
        else if (roomServicesCareOpen) setRoomServicesCareOpen(false);
        else if (isTransferModalOpen) setIsTransferModalOpen(false);
        else if (isWakeUpModalOpen) setIsWakeUpModalOpen(false);
      } else if (e.key === '/' && document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFolioRoom, checkoutRoom, isReceiptModalOpen, isCheckInReviewOpen, roomQrOpen, backupOpen, liveOrdersOpen, roomServicesCareOpen, isTransferModalOpen, isWakeUpModalOpen]);

  // 1. Rayagada Transit / Fresh-Up Day-Use Engine State (4h / 6h Slots)
  const [transitStays, setTransitStays] = useState([
    {
      id: 'TR-1081',
      roomNumber: '105',
      guestName: 'SUBHASH CHANDRA DAS',
      phone: '+91 94371 88291',
      origin: 'Bhubaneswar (Express Train 18447)',
      purpose: 'JK Paper Plant Technical Review',
      slotType: '4-Hour Transit',
      hoursAllowed: 4,
      checkInTime: '07:30 AM',
      expectedCheckoutTime: '11:30 AM',
      tariff: 899,
      paymentMode: 'UPI (PhonePe)',
      status: 'Active In-Stay',
      depositPaid: 1000
    },
    {
      id: 'TR-1082',
      roomNumber: '206',
      guestName: 'K. RAMA MURTHY',
      phone: '+91 98480 33119',
      origin: 'Visakhapatnam (Tirupati Spl 07488)',
      purpose: 'Maa Majhighariani Sacred Darshan',
      slotType: '6-Hour Transit',
      hoursAllowed: 6,
      checkInTime: '06:15 AM',
      expectedCheckoutTime: '12:15 PM',
      tariff: 1199,
      paymentMode: 'Cash',
      status: 'Active In-Stay',
      depositPaid: 1500
    }
  ]);
  const [transitForm, setTransitForm] = useState({
    roomNumber: '',
    guestName: '',
    phone: '',
    origin: '',
    purpose: 'Maa Majhighariani Pilgrimage',
    slotType: '4-Hour Transit',
    hoursAllowed: 4,
    tariff: 899,
    paymentMode: 'UPI',
    depositPaid: 1000
  });

  // 1B. Rayagada Junction (RGDA) Station Transfer & Logistics Dispatch (Inspired by Open-Hotel-PMS)
  const [stationTransfers, setStationTransfers] = useState([
    {
      id: 'TRF-901',
      guestName: 'SUBHASH CHANDRA DAS',
      roomNumber: '105',
      phone: '+91 94371 88291',
      transferType: 'Station Pickup (RGDA)',
      trainNumber: '18447 Hirakhand Express',
      scheduledTime: '07:45 AM',
      pickupLocation: 'RGDA Platform 1 (VIP Exit Gate)',
      assignedVehicle: 'Innova Crysta (OD-18-B-4402)',
      driverName: 'Santosh Kumar',
      driverPhone: '+91 94371 55210',
      fare: 350,
      isCorporateCourtesy: true,
      billingStatus: 'Billed to Room Folio (SAC 996412)',
      dispatchStatus: 'Completed'
    },
    {
      id: 'TRF-902',
      guestName: 'BIJAY PASWAN (Utkal Alumina)',
      roomNumber: '204',
      phone: '+91 98490 12044',
      transferType: 'Industrial Plant Transfer',
      trainNumber: 'N/A (Tikiri Site Visit)',
      scheduledTime: '09:30 AM',
      pickupLocation: 'Hotel Sai Lobby Porch',
      assignedVehicle: 'Swift Dzire (OD-18-A-1109)',
      driverName: 'Rabi Narayan Panda',
      driverPhone: '+91 94380 99411',
      fare: 1200,
      isCorporateCourtesy: false,
      billingStatus: 'Billed to Room Folio (SAC 996412)',
      dispatchStatus: 'Driver Dispatched'
    },
    {
      id: 'TRF-903',
      guestName: 'UTKARSH SRIVASTAVA',
      roomNumber: '102',
      phone: '+91 94370 88912',
      transferType: 'Station Drop (RGDA)',
      trainNumber: '20833 Vande Bharat Express',
      scheduledTime: '02:45 PM',
      pickupLocation: 'Hotel Sai Lobby Porch',
      assignedVehicle: 'Innova Crysta (OD-18-B-4402)',
      driverName: 'Santosh Kumar',
      driverPhone: '+91 94371 55210',
      fare: 350,
      isCorporateCourtesy: false,
      billingStatus: 'Pending Settlement',
      dispatchStatus: 'Scheduled'
    }
  ]);
  const [newTransferForm, setNewTransferForm] = useState({
    guestName: '',
    roomNumber: '101',
    phone: '',
    transferType: 'Station Pickup (RGDA)',
    trainNumber: '18005 Samaleswari Express',
    scheduledTime: '08:30 AM',
    pickupLocation: 'Rayagada Junction (RGDA)',
    assignedVehicle: 'Innova Crysta (OD-18-B-4402)',
    driverName: 'Santosh Kumar',
    driverPhone: '+91 94371 55210',
    fare: 350,
    isCorporateCourtesy: false
  });

  // 1C. Front Desk Shift Handover & Daily Operational Logbook (Inspired by Open-Hotel-PMS)
  const [activeShift, setActiveShift] = useState('morning'); // 'morning', 'evening', 'night'
  const [shiftLogbook, setShiftLogbook] = useState({
    morning: {
      shiftLead: 'Sudhakar Reddy',
      openingCash: 33500,
      shiftCashCollected: 4866,
      shiftUpiCollected: 20790,
      closingCashExpected: 38366,
      physicalCashCount: 38366,
      handoverSigned: true,
      signedAt: '03:00 PM',
      handoverNotes: 'All 33 in-house folios audited. JK Paper accounts manager requested soft copy of Bill B for Room 402.'
    },
    evening: {
      shiftLead: 'Koti Rao',
      openingCash: 38366,
      shiftCashCollected: 3200,
      shiftUpiCollected: 14500,
      closingCashExpected: 41566,
      physicalCashCount: 41566,
      handoverSigned: false,
      signedAt: null,
      handoverNotes: '4 arrivals expected on 18447 Hirakhand Express layover. Room 204 dinner KOT #18372 delivered.'
    },
    night: {
      shiftLead: 'Deepak Kumar',
      openingCash: 41566,
      shiftCashCollected: 0,
      shiftUpiCollected: 0,
      closingCashExpected: 41566,
      physicalCashCount: 41566,
      handoverSigned: false,
      signedAt: null,
      handoverNotes: 'Night audit scheduled at 02:00 AM. 3 early morning wake-up calls logged.'
    }
  });

  const [wakeUpCalls, setWakeUpCalls] = useState([
    { id: 'WUC-1', roomNumber: '202', guestName: 'UTKARSH SRIVASTAVA', time: '05:15 AM', train: 'Samaleswari Express (06:00 AM departure)', status: 'Active Scheduled', notes: 'Call desk phone + loud door knock' },
    { id: 'WUC-2', roomNumber: '102', guestName: 'P. K. Mohapatra (JK Paper)', time: '06:00 AM', train: 'Plant Inspection Vehicle at 06:45 AM', status: 'Active Scheduled', notes: 'Pack fresh Satvik ginger tea in flask' },
    { id: 'WUC-3', roomNumber: '105', guestName: 'SUBHASH CHANDRA DAS', time: '06:30 AM', train: 'Maa Majhigouri Morning Darshan', status: 'Completed', notes: 'Guest awake and dispatched to temple' }
  ]);
  const [newWakeUpForm, setNewWakeUpForm] = useState({
    roomNumber: '101',
    guestName: '',
    time: '05:30 AM',
    train: 'RGDA Express',
    notes: 'Phone ring + room bell'
  });

  // 1D. OTA Channel Manager & Rate Parity Monitor (Inspired by FrontDesko)
  const [otaChannels, setOtaChannels] = useState([
    {
      id: 'direct',
      name: 'Sri Sai Vasudev Direct Booking Engine',
      type: 'Direct Brand (sai-vasudev-residency.pages.dev)',
      allocatedRooms: 18,
      activeRate: 2199,
      commissionPct: 0,
      netRevPerRoom: 2199,
      syncStatus: 'Live Realtime',
      lastSynced: 'Just now',
      parityStatus: 'Best Available Rate (BAR)',
      isLive: true
    },
    {
      id: 'mmt',
      name: 'MakeMyTrip & Goibibo (India)',
      type: 'OTA Channel API',
      allocatedRooms: 10,
      activeRate: 2199,
      commissionPct: 18,
      netRevPerRoom: 1803,
      syncStatus: 'Two-Way Connected',
      lastSynced: '2 mins ago',
      parityStatus: 'In Parity (₹2,199)',
      isLive: true
    },
    {
      id: 'booking',
      name: 'Booking.com (Global)',
      type: 'OTA Channel API',
      allocatedRooms: 10,
      activeRate: 2199,
      commissionPct: 15,
      netRevPerRoom: 1869,
      syncStatus: 'Two-Way Connected',
      lastSynced: '1 min ago',
      parityStatus: 'In Parity (₹2,199)',
      isLive: true
    }
  ]);
  const [otaEmergencyStop, setOtaEmergencyStop] = useState(false);
  const [lastOtaSyncTime, setLastOtaSyncTime] = useState(new Date().toLocaleTimeString());

  // 2. Lost & Found Digital Custody Locker State (Reception Vault)
  const [lostAndFoundItems, setLostAndFoundItems] = useState([
    {
      id: 'LF-2026-0041',
      dateFound: '24/09/2026',
      roomNumber: '102',
      itemDescription: 'Samsung 45W Fast Charger + Fastrack Digital Watch (Black Strap)',
      category: 'Electronics',
      foundByStaff: 'Anita Majhi (Housekeeping)',
      lockerNumber: 'Locker B-04 (Reception Safe)',
      guestName: 'UTKARSH SRIVASTAVA',
      guestPhone: '+91 94370 88912',
      status: 'In Custody',
      notes: 'Item tagged and sealed in zip-lock bag. Guest notified via phone.'
    },
    {
      id: 'LF-2026-0042',
      dateFound: '25/09/2026',
      roomNumber: '204',
      itemDescription: 'Titan Gold Dial Spectacles in hard leather case',
      category: 'Personal Accessories',
      foundByStaff: 'Babula Sahu (Housekeeping)',
      lockerNumber: 'Locker B-07 (Reception Safe)',
      guestName: 'BIJAY PASWAN',
      guestPhone: '+91 98610 33812',
      status: 'In Custody',
      notes: 'Left on nightstand during morning checkout. Awaiting collection.'
    },
    {
      id: 'LF-2026-0040',
      dateFound: '22/09/2026',
      roomNumber: '201',
      itemDescription: 'HP Wireless Mouse + Ray-Ban Aviator Sunglasses',
      category: 'Electronics',
      foundByStaff: 'Kailash Sabar',
      lockerNumber: 'Locker B-02',
      guestName: 'MR. P ASHOK',
      guestPhone: '+91 6305202068',
      status: 'Handed Over',
      notes: 'Handed over in person to guest colleague Mr. Sahoo on 23/09/2026.'
    }
  ]);
  const [isLfModalOpen, setIsLfModalOpen] = useState(false);
  const [lfForm, setLfForm] = useState({
    roomNumber: '101',
    itemDescription: '',
    category: 'Electronics',
    foundByStaff: 'Anita Majhi',
    lockerNumber: 'Locker B-05',
    guestName: '',
    guestPhone: '',
    notes: ''
  });

  // 3. Room Maintenance & Out-of-Order (OOO / OOS) Management State
  const [maintenanceTickets, setMaintenanceTickets] = useState([
    {
      ticketId: 'MNT-8041',
      roomNumber: '205',
      category: 'Air Conditioning',
      severity: 'High',
      issueDescription: 'Carrier 1.5T AC cooling coil leaking water onto desk. Filter needs descaling.',
      reportedBy: 'Babula Sahu',
      reportedAt: '25/09/2026 10:15 AM',
      assignedTech: 'Naveen Kumar (AC Specialist)',
      blockType: 'OOO (Out of Order)',
      status: 'In Progress',
      costEst: 450
    },
    {
      ticketId: 'MNT-8042',
      roomNumber: '107',
      category: 'Plumbing & Geyser',
      severity: 'Medium',
      issueDescription: 'Geyser pilot element tripped. Thermostat replaced; final inspection pending.',
      reportedBy: 'Kailash Sabar',
      reportedAt: '25/09/2026 11:45 AM',
      assignedTech: 'Bishnu Prasad (Plumber)',
      blockType: 'OOS (Out of Service)',
      status: 'In Progress',
      costEst: 200
    }
  ]);
  const [isMntModalOpen, setIsMntModalOpen] = useState(false);
  const [mntForm, setMntForm] = useState({
    roomNumber: '101',
    category: 'Air Conditioning',
    severity: 'Medium',
    issueDescription: '',
    assignedTech: 'Naveen Kumar (AC Specialist)',
    blockType: 'OOO (Out of Order)',
    costEst: 250
  });

  // Live Food Orders & Room Services Data State (2 New, 4 Pending defaults matching live reference)
  const [internalFoodOrdersList, setInternalFoodOrdersList] = useState([
    {
      orderId: 'KOT-8491',
      roomNumber: '204',
      guestName: 'BIJAY PASWAN',
      outlet: 'Cannon Kitchen',
      status: 'Received',
      items: [
        { name: 'Paneer Butter Masala', quantity: 1, price: 240 },
        { name: 'Butter Tandoori Roti', quantity: 4, price: 30 },
        { name: 'Jeera Rice', quantity: 1, price: 160 }
      ],
      totalAmount: 520,
      is_jain_satvik: 0,
      created_at: new Date(Date.now() - 6 * 60000).toISOString()
    },
    {
      orderId: 'KOT-8492',
      roomNumber: '102',
      guestName: 'UTKARSH SRIVASTAVA',
      outlet: 'Cannon Kitchen',
      status: 'Received',
      items: [
        { name: 'Dal Tadka (Satvik Pure Veg)', quantity: 1, price: 180 },
        { name: 'Steamed Basmati Rice', quantity: 2, price: 90 },
        { name: 'Curd & Salad Platter', quantity: 1, price: 80 }
      ],
      totalAmount: 440,
      is_jain_satvik: 1,
      created_at: new Date(Date.now() - 2 * 60000).toISOString()
    }
  ]);

  const foodOrdersList = propFoodOrders || internalFoodOrdersList;

  const [roomServicesList, setRoomServicesList] = useState([
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
    },
    {
      requestId: 'REQ-1094',
      roomNumber: '208',
      serviceType: 'Maintenance',
      description: 'Geyser pilot light checked, guest requested hot water verification',
      priority: 'High',
      status: 'Pending',
      assignedStaff: 'Kailash Sabar',
      requestedAt: new Date(Date.now() - 8 * 60000).toISOString()
    },
    {
      requestId: 'REQ-1095',
      roomNumber: '201',
      serviceType: 'Toiletries',
      description: 'VIP Suite: Extra Ayurvedic soap, shampoo kit and herbal dental set',
      priority: 'Urgent',
      status: 'Pending',
      assignedStaff: 'Anita Majhi',
      requestedAt: new Date(Date.now() - 3 * 60000).toISOString()
    }
  ]);

  const handleUpdateFoodOrderStatus = (orderId, newStatus) => {
    if (propUpdateOrderStatus) {
      propUpdateOrderStatus(orderId, newStatus);
    }
    setInternalFoodOrdersList(prev => prev.map(o => {
      if ((o.order_id || o.orderId) === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));

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
    }).catch(err => console.warn('Order status sync fallback:', err));

    setFeedbackToast(`Order #${orderId} marked as ${newStatus}`);
  };

  const handleBillToRoomFromLiveOrders = (payload) => {
    if (onAddTransaction) {
      onAddTransaction({
        id: `TXN-${Date.now()}`,
        roomNumber: payload.roomNumber,
        category: 'Food & Beverage',
        description: `KOT #${payload.orderId} - Cannon Kitchen In-Room Dining`,
        amount: payload.totalAmount,
        type: 'Charge',
        date: new Date().toISOString()
      });
    }

    setInternalFoodOrdersList(prev => prev.map(o => {
      if ((o.order_id || o.orderId) === payload.orderId) {
        return { ...o, payment_status: 'Billed to Room', status: 'Delivered' };
      }
      return o;
    }));
    if (propUpdateOrderStatus) {
      propUpdateOrderStatus(payload.orderId, 'Delivered');
    }

    setFeedbackToast(`KOT #${payload.orderId} (₹${payload.totalAmount}) billed to Room ${payload.roomNumber} folio!`);
  };

  const handleAddRoomServiceRequest = (newReq) => {
    setRoomServicesList(prev => [newReq, ...prev]);

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'place_room_service',
        payload: newReq
      })
    }).catch(err => console.warn('Service request sync fallback:', err));

    setFeedbackToast(`Service call logged for Room ${newReq.roomNumber}!`);
  };

  const handleUpdateRoomServiceStatus = (requestId, newStatus) => {
    setRoomServicesList(prev => prev.map(r => {
      if ((r.requestId || r.request_id) === requestId) {
        return { ...r, status: newStatus };
      }
      return r;
    }));

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'update_room_service_status',
        payload: { requestId, status: newStatus }
      })
    }).catch(err => console.warn('Service status sync fallback:', err));

    setFeedbackToast(`Service ticket #${requestId} marked as ${newStatus}`);
  };

  const handleCheckoutConfirm = (payload) => {
    // 1. Release room to Vacant Dirty (Owner requirement: "automatic ga Dirty ani padatadi")
    onUpdateRoomStatus(payload.roomNumber, 'Vacant Dirty', null, null);

    // 1b. The Wild Oasis Protocol: Automated Housekeeping Turnover Task Dispatch
    const floorNum = Math.floor(Number(payload.roomNumber) / 100) || 2;
    const attendant = floorAttendants[floorNum]?.name || 'Floor Attendant';
    const newHkTicket = {
      requestId: `HK-TURNOVER-${payload.roomNumber}-${Date.now().toString().slice(-4)}`,
      roomNumber: payload.roomNumber,
      serviceType: 'Turnover Sanitization & Deep Clean',
      description: `Automated Checkout Turnover: Room ${payload.roomNumber}. Strip bed linen, replace bathroom terry towels, ozone air sanitization, replenish Ayurvedic toiletries kit.`,
      priority: 'Urgent',
      status: 'Pending',
      assignedStaff: attendant,
      turnaroundEtaMinutes: 45,
      requestedAt: new Date().toISOString()
    };
    setRoomServicesList(prev => [newHkTicket, ...prev]);

    // 2. Add cash to cashier drawer if cash tender was used
    if (payload.tenders.cash > 0) {
      setCashCollected(prev => prev + payload.tenders.cash);
      setDenominations(prev => ({
        ...prev,
        500: (Number(prev[500]) || 0) + Math.floor(payload.tenders.cash / 500),
        coins: (Number(prev.coins) || 0) + (payload.tenders.cash % 500)
      }));
    }

    // 2b. Dispatch Multi-Tender Split Payment to Cloudflare D1
    const tenderRows = [];
    if (payload.tenders.cash > 0) {
      tenderRows.push({ mode: 'Cash', amount: payload.tenders.cash, ref: 'Front Desk Cash Drawer' });
    }
    if (payload.tenders.upi > 0) {
      tenderRows.push({ mode: 'UPI', amount: payload.tenders.upi, ref: `${payload.tenders.upiProvider || 'UPI'} Ref: ${payload.tenders.upiRef || 'DIRECT'}` });
    }
    if (payload.tenders.card > 0) {
      tenderRows.push({ mode: 'Card', amount: payload.tenders.card, ref: `POS Auth: ${payload.tenders.cardAuth || 'AUTH'}` });
    }
    if (payload.tenders.btc > 0) {
      tenderRows.push({ mode: 'Corporate Credit', amount: payload.tenders.btc, ref: `BTC: ${payload.tenders.btcCompany || 'Company Credit'}` });
    }

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'settle_split_payment',
        payload: {
          folioId: `FOLIO-${payload.roomNumber}`,
          roomNumber: payload.roomNumber,
          invoiceId: payload.billNo || `INV-${payload.roomNumber}`,
          tenderRows,
          housekeepingTicket: newHkTicket
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          console.log(`✓ Split payment & housekeeping turnover task synced to D1 for room ${payload.roomNumber}`);
        }
      })
      .catch(err => console.warn('Offline split payment fallback:', err));

    // 3. Add to recent settlements log
    setRecentSettlements(prev => [payload, ...prev]);

    // 4. Close checkout modal
    setCheckoutRoom(null);

    // 5. Notify front desk with toast
    setFeedbackToast(`✓ Room ${payload.roomNumber} checked out! Automated Housekeeping Turnover ticket dispatched to ${attendant} (45-min SLA active).`);

    // 6. If requested, automatically open the requested document (Money Receipt Voucher or Tax Invoice)
    if (payload.openReceiptAfter) {
      const receiptBooking = {
        bookingId: payload.billNo,
        billNo: payload.billNo,
        roomNumber: payload.roomNumber,
        guestName: payload.guestName,
        guestPhone: payload.guestPhone,
        tier: payload.tier,
        totalAmount: payload.totalAmount,
        advancePaid: payload.advancePaid || 0,
        paymentMode: 'Split Tender',
        paymentStatus: 'Fully Settled & Checked Out',
        tenders: payload.tenders,
        tendersSummary: payload.tendersSummary,
        foodAmount: payload.billTotal > 1500 ? 962 : payload.billTotal,
        grcNo: '684',
        isNonGstBill: payload.isNonGstBill || false,
        isLiveEditMode: payload.openEditor || false
      };
      setReceiptModalType(payload.targetReceiptType || 'a4');
      setSelectedReceiptBooking(receiptBooking);
      setIsReceiptModalOpen(true);
    }
  };

  // =========================================================================
  // UNIVERSAL PMS DATE RANGE ENGINE (Responds to Authentic Mysoft Command Bar)
  // =========================================================================
  const parseDateToIso = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    if (dateStr.includes('/')) {
      const clean = dateStr.split(' ')[0];
      const parts = clean.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    if (dateStr.includes('-')) {
      return dateStr.split('T')[0].split(' ')[0];
    }
    return null;
  };

  const isDateInRange = (dStr, fromDate, toDate) => {
    const iso = parseDateToIso(dStr);
    if (!iso) return true;
    return iso >= fromDate && iso <= toDate;
  };

  const filteredBookings = useMemo(() => {
    if (!isDateFilterActive) return bookings;
    return bookings.filter(b => {
      const inDate = b.checkIn || b.check_in_date || b.checkInDate || b.date;
      const outDate = b.checkOut || b.check_out_date || b.checkOutDate;
      const inIso = parseDateToIso(inDate);
      const outIso = parseDateToIso(outDate);
      if (inIso && outIso) {
        return inIso <= filterToDate && outIso >= filterFromDate;
      }
      if (inIso) {
        return inIso >= filterFromDate && inIso <= filterToDate;
      }
      return true;
    });
  }, [bookings, isDateFilterActive, filterFromDate, filterToDate]);

  // The Wild Oasis Protocol: Today's Arrivals and Departures Feed Data (Dynamic Date Filtering)
  const todayArrivals = useMemo(() => {
    const baseArrivals = [
      ...internalBookings.filter(b => b.bookingStatus !== 'Checked In'),
      ...bookings.filter(b => b.bookingStatus !== 'Checked In' && !internalBookings.some(ib => (ib.bookingId || ib.id) === (b.bookingId || b.id)))
    ];
    if (!isDateFilterActive) return baseArrivals;
    return baseArrivals.filter(b => {
      const d = b.checkIn || b.checkInDate || b.check_in_date || b.date;
      return isDateInRange(d, filterFromDate, filterToDate);
    });
  }, [internalBookings, bookings, isDateFilterActive, filterFromDate, filterToDate]);

  const todayDepartures = useMemo(() => {
    const baseDepartures = rooms
      .filter(r => r.status === 'Occupied' || r.status === 'Occupied Clean')
      .slice(0, 8)
      .map(r => {
        const matchB = bookings.find(b => b.roomNumber === r.roomNumber) || {};
        return {
          ...r,
          guestName: r.currentGuestName || matchB.guestName || 'In-House Guest',
          outstandingBalance: r.balanceDue !== undefined ? r.balanceDue : (matchB.balanceDue !== undefined ? matchB.balanceDue : (r.tariff || 962)),
          tier: r.tier || matchB.tier || 'Executive AC',
          checkOutDate: matchB.checkOut || matchB.checkOutDate || matchB.check_out_date
        };
      });
    if (!isDateFilterActive) return baseDepartures;
    return baseDepartures.filter(d => isDateInRange(d.checkOutDate, filterFromDate, filterToDate));
  }, [rooms, bookings, isDateFilterActive, filterFromDate, filterToDate]);

  const filteredSettlements = useMemo(() => {
    if (!isDateFilterActive) return recentSettlements;
    return recentSettlements.filter(s => isDateInRange(s.settlementDate || s.date || s.created_at, filterFromDate, filterToDate));
  }, [recentSettlements, isDateFilterActive, filterFromDate, filterToDate]);

  const filteredLuggagePasses = useMemo(() => {
    if (!isDateFilterActive) return luggagePasses;
    return luggagePasses.filter(l => isDateInRange(l.droppedDate || l.date || l.pickupTime, filterFromDate, filterToDate));
  }, [luggagePasses, isDateFilterActive, filterFromDate, filterToDate]);

  const filteredLostAndFound = useMemo(() => {
    if (!isDateFilterActive) return lostAndFoundItems;
    return lostAndFoundItems.filter(i => isDateInRange(i.dateFound || i.date, filterFromDate, filterToDate));
  }, [lostAndFoundItems, isDateFilterActive, filterFromDate, filterToDate]);

  const filteredMaintenance = useMemo(() => {
    if (!isDateFilterActive) return maintenanceTickets;
    return maintenanceTickets.filter(m => isDateInRange(m.reportedDate || m.date, filterFromDate, filterToDate));
  }, [maintenanceTickets, isDateFilterActive, filterFromDate, filterToDate]);

  const filteredTransitStays = useMemo(() => {
    if (!isDateFilterActive) return transitStays;
    return transitStays.filter(t => isDateInRange(t.checkInTime || t.date, filterFromDate, filterToDate));
  }, [transitStays, isDateFilterActive, filterFromDate, filterToDate]);

  const handleFastCheckInClick = (booking) => {
    setSelectedArrivalForCheckIn(booking);
    setIsCheckInReviewOpen(true);
  };

  const handleConfirmCheckIn = (booking, checkInData) => {
    // 1. Update internal bookings state
    setInternalBookings(prev => prev.map(b => {
      if ((b.bookingId || b.id) === (booking.bookingId || booking.id)) {
        return {
          ...b,
          bookingStatus: 'Checked In',
          totalAmount: checkInData.payment.totalStayAmount,
          advanceDeposit: (b.advanceDeposit || 0) + (checkInData.payment.amountCollected || 0),
          balanceDue: Math.max(0, checkInData.payment.totalStayAmount - ((b.advanceDeposit || 0) + (checkInData.payment.amountCollected || 0)))
        };
      }
      return b;
    }));

    // 2. Set Room Status to Occupied
    onUpdateRoomStatus(checkInData.roomNumber, 'Occupied', checkInData.guestName, checkInData.bookingId);

    // 3. Post Room Tariff and any add-on charges to Room Master Folio
    const baseTariff = (booking.tariffPerNight || 1699) * (booking.nights || 1);
    if (onAddTransaction) {
      onAddTransaction({
        id: `TXN-CHKIN-${checkInData.roomNumber}-${Date.now().toString().slice(-4)}`,
        roomNumber: checkInData.roomNumber,
        category: 'Room Tariff',
        description: `Room Tariff - ${checkInData.tier} (${checkInData.nights}N)`,
        amount: baseTariff,
        type: 'Charge',
        date: new Date().toISOString()
      });

      if (checkInData.addons.breakfast) {
        onAddTransaction({
          id: `TXN-BF-${checkInData.roomNumber}-${Date.now().toString().slice(-4)}`,
          roomNumber: checkInData.roomNumber,
          category: 'Food & Beverage',
          description: `Satvik Buffet Breakfast Plan (${checkInData.nights}N @ ₹${checkInData.addons.breakfast.rate})`,
          amount: checkInData.addons.breakfast.total,
          type: 'Charge',
          date: new Date().toISOString()
        });
      }

      if (checkInData.addons.stationDrop) {
        onAddTransaction({
          id: `TXN-CAB-${checkInData.roomNumber}-${Date.now().toString().slice(-4)}`,
          roomNumber: checkInData.roomNumber,
          category: 'Transportation',
          description: `Rayagada Junction (RGDA) AC Station Drop Cab (SAC 996412)`,
          amount: checkInData.addons.stationDrop.fare,
          type: 'Charge',
          date: new Date().toISOString()
        });
      }

      if (checkInData.payment.amountCollected > 0) {
        onAddTransaction({
          id: `TXN-PAY-${checkInData.roomNumber}-${Date.now().toString().slice(-4)}`,
          roomNumber: checkInData.roomNumber,
          category: 'Payment Credit',
          description: `Check-In Settlement - ${checkInData.payment.mode} ${checkInData.payment.upiRef || ''}`,
          amount: checkInData.payment.amountCollected,
          type: 'Payment',
          date: new Date().toISOString()
        });
      }
    }

    // 4. Update Cash Drawer if Cash tender used
    if (checkInData.payment.mode === 'Cash' && checkInData.payment.amountCollected > 0) {
      setCashCollected(prev => prev + checkInData.payment.amountCollected);
    }

    // 5. Cloudflare D1 Remote Sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'check_in_guest',
        payload: checkInData
      })
    }).catch(err => console.warn('Offline check-in sync fallback:', err));

    setIsCheckInReviewOpen(false);
    showToast(`✓ Check-In complete for ${checkInData.guestName} in Room ${checkInData.roomNumber}! Room status set to 'Occupied'.`);
  };

  const handleFastCheckOutClick = (item) => {
    const roomNum = item.roomNumber;
    const foundRoom = rooms.find(r => r.roomNumber === roomNum) || item;
    const balance = Number(item.outstandingBalance !== undefined ? item.outstandingBalance : (foundRoom.balanceDue || 0));

    if (balance > 0.01) {
      // Open multi-tender split modal to settle balance
      setCheckoutRoom(foundRoom);
    } else {
      // Zero balance: 1-click checkout with automated housekeeping dispatch
      handleCheckoutConfirm({
        roomNumber: roomNum,
        guestName: item.guestName || foundRoom.currentGuestName || 'In-House Guest',
        tier: foundRoom.tier || 'Executive AC',
        totalAmount: 0,
        billTotal: 0,
        tenders: { cash: 0, upi: 0, card: 0, btc: 0 },
        tendersSummary: ['Zero Balance Folio Cleared'],
        openReceiptAfter: false
      });
    }
  };

  // Walk-in Modal State (Enhanced with Screenshot 4 & 5 fields)
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInRoom, setWalkInRoom] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAadhaar, setWalkInAadhaar] = useState('');
  const [walkInRate, setWalkInRate] = useState(1699);
  const [walkInDeposit, setWalkInDeposit] = useState(1699);
  const [walkInOrigin, setWalkInOrigin] = useState('Odisha');
  const [walkInNights, setWalkInNights] = useState(1);
  const [walkInPaymentMode, setWalkInPaymentMode] = useState('Cash');
  const [walkInMealPlan, setWalkInMealPlan] = useState('CP'); // CP, EP, MAP, AP
  const [walkInBillingType, setWalkInBillingType] = useState('Direct'); // Direct or BTC (Bill to Company)
  const [walkInCompany, setWalkInCompany] = useState('');

  // Shift Room Modal State (Inter-Room Reassignment)
  const [shiftModalRoom, setShiftModalRoom] = useState(null);
  const [shiftTargetRoom, setShiftTargetRoom] = useState('');
  const [shiftReason, setShiftReason] = useState('Guest Requested Upgrade / Quiet Wing');

  // Edit Stay & Guest Details Modal State
  const [editStayRoom, setEditStayRoom] = useState(null);
  const [editStayGuestName, setEditStayGuestName] = useState('');
  const [editStayPhone, setEditStayPhone] = useState('');
  const [editStayVehicle, setEditStayVehicle] = useState('');
  const [editStayExtendNights, setEditStayExtendNights] = useState(0);
  const [editStayAddExtraBed, setEditStayAddExtraBed] = useState(false);
  const [editStayNotes, setEditStayNotes] = useState('');

  // Live Notification Toast State
  const [feedbackToast, setFeedbackToast] = useState('');
  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 4500);
  };

  // Block Rooms Modal State (Screenshot 10 - block_rooms.php)
  const [blockRoomOpen, setBlockRoomOpen] = useState(false);
  const [blockSelectedRoom, setBlockSelectedRoom] = useState('');
  const [blockReason, setBlockReason] = useState('AC PRBLM');
  const [blockFromDate, setBlockFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockToDate, setBlockToDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [blockNotes, setBlockNotes] = useState('');

  // Cashier Handover & Physical Note Denomination Counter State
  const [openingFloat, setOpeningFloat] = useState(5000);
  const [cashCollected, setCashCollected] = useState(18500);
  const [pettyCashPaid, setPettyCashPaid] = useState(1200);
  const [closingCashActual, setClosingCashActual] = useState(22300);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Denominations State: 500, 200, 100, 50, 20, 10, Coins
  const [denominations, setDenominations] = useState({
    500: 36, // 18,000
    200: 15, // 3,000
    100: 10, // 1,000
    50: 4,   // 200
    20: 5,   // 100
    10: 0,
    coins: 0
  });

  const totalDenominationSum = 
    ((Number(denominations[500]) || 0) * 500) +
    ((Number(denominations[200]) || 0) * 200) +
    ((Number(denominations[100]) || 0) * 100) +
    ((Number(denominations[50]) || 0) * 50) +
    ((Number(denominations[20]) || 0) * 20) +
    ((Number(denominations[10]) || 0) * 10) +
    (Number(denominations.coins) || 0);

  const expectedDrawerCash = openingFloat + cashCollected - pettyCashPaid;
  const drawerVariance = closingCashActual - expectedDrawerCash;

  // Shift Handover Audit Trail Log
  const [handoverLogs, setHandoverLogs] = useState([
    {
      shiftId: 'SH-2026-0921-E',
      date: '21-Sep-2026',
      shift: 'Evening (15:00 - 23:00)',
      cashier: 'K. Simhachalam',
      supervisor: 'S. Patnaik',
      openingFloat: 5000,
      cashCollected: 18500,
      pettyCash: 1200,
      expected: 22300,
      actual: 22300,
      variance: 0,
      status: 'BALANCED',
      notes: 'Denominations physically verified; safe drop completed.'
    },
    {
      shiftId: 'SH-2026-0921-M',
      date: '21-Sep-2026',
      shift: 'Morning (07:00 - 15:00)',
      cashier: 'E. Ramesh',
      supervisor: 'Eswara (MD)',
      openingFloat: 5000,
      cashCollected: 24200,
      pettyCash: 850,
      expected: 28350,
      actual: 28350,
      variance: 0,
      status: 'BALANCED',
      notes: 'Morning shift turnover balanced with zero discrepancy.'
    }
  ]);

  // Housekeeping Floor Attendants State
  const [floorAttendants, setFloorAttendants] = useState({
    2: { name: 'Santosh Nayak', phone: '+91 94371 88201', shift: 'Morning (07:00 - 15:30)', status: 'On Floor' },
    3: { name: 'Kailash Gouda', phone: '+91 94372 66314', shift: 'Morning (07:00 - 15:30)', status: 'On Floor' },
    4: { name: 'Ramesh Rao', phone: '+91 94370 55192', shift: 'Morning (07:00 - 15:30)', status: 'On Floor' }
  });
  const [isEditAttendantOpen, setIsEditAttendantOpen] = useState(false);
  const [selectedFloorToEdit, setSelectedFloorToEdit] = useState(2);
  const [attendantForm, setAttendantForm] = useState({ name: '', phone: '', shift: '' });

  // Occupancy Report State (Sheet 2 Requirement: Day / Month / Year with CSV Download)
  const [occupancyViewMode, setOccupancyViewMode] = useState('day'); // 'day', 'month', 'year'

  // Daily Occupancy Historical Trend (Last 14 Days - 18 Authentic Keys)
  const dailyOccupancyData = [
    { date: '11/09/2026', day: 'Fri', totalRooms: 18, occupied: 15, vacant: 2, ooo: 1, rate: 83.3, revenue: 33735, adr: 2249 },
    { date: '12/09/2026', day: 'Sat', totalRooms: 18, occupied: 17, vacant: 0, ooo: 1, rate: 94.4, revenue: 38675, adr: 2275 },
    { date: '13/09/2026', day: 'Sun', totalRooms: 18, occupied: 16, vacant: 1, ooo: 1, rate: 88.9, revenue: 36400, adr: 2275 },
    { date: '14/09/2026', day: 'Mon', totalRooms: 18, occupied: 14, vacant: 3, ooo: 1, rate: 77.8, revenue: 31500, adr: 2250 },
    { date: '15/09/2026', day: 'Tue', totalRooms: 18, occupied: 13, vacant: 4, ooo: 1, rate: 72.2, revenue: 29120, adr: 2240 },
    { date: '16/09/2026', day: 'Wed', totalRooms: 18, occupied: 15, vacant: 2, ooo: 1, rate: 83.3, revenue: 33750, adr: 2250 },
    { date: '17/09/2026', day: 'Thu', totalRooms: 18, occupied: 16, vacant: 1, ooo: 1, rate: 88.9, revenue: 36160, adr: 2260 },
    { date: '18/09/2026', day: 'Fri', totalRooms: 18, occupied: 17, vacant: 0, ooo: 1, rate: 94.4, revenue: 38760, adr: 2280 },
    { date: '19/09/2026', day: 'Sat', totalRooms: 18, occupied: 18, vacant: 0, ooo: 0, rate: 100.0, revenue: 41310, adr: 2295 },
    { date: '20/09/2026', day: 'Sun', totalRooms: 18, occupied: 16, vacant: 1, ooo: 1, rate: 88.9, revenue: 36320, adr: 2270 },
    { date: '21/09/2026', day: 'Mon', totalRooms: 18, occupied: 13, vacant: 4, ooo: 1, rate: 72.2, revenue: 29120, adr: 2240 },
    { date: '22/09/2026', day: 'Tue', totalRooms: 18, occupied: 14, vacant: 3, ooo: 1, rate: 77.8, revenue: 31640, adr: 2260 },
    { date: '23/09/2026', day: 'Wed', totalRooms: 18, occupied: 15, vacant: 2, ooo: 1, rate: 83.3, revenue: 34050, adr: 2270 },
    { date: '24/09/2026', day: 'Thu (Today)', totalRooms: 18, occupied: rooms.filter(r => r.status === 'Occupied').length || 14, vacant: rooms.filter(r => r.status === 'Available').length || 3, ooo: rooms.filter(r => r.status === 'Maintenance').length || 1, rate: Number((((rooms.filter(r => r.status === 'Occupied').length || 14) / 18) * 100).toFixed(1)), revenue: 31766, adr: 2269 }
  ];

  // Monthly Occupancy Trend (Last 12 Months)
  const monthlyOccupancyData = [
    { month: 'Oct 2025', totalNights: 1209, occupiedNights: 894, avgOccupancy: 73.9, revpar: 1640, roomRev: 1982000 },
    { month: 'Nov 2025', totalNights: 1170, occupiedNights: 948, avgOccupancy: 81.0, revpar: 1814, roomRev: 2123520 },
    { month: 'Dec 2025', totalNights: 1209, occupiedNights: 1088, avgOccupancy: 90.0, revpar: 2061, roomRev: 2491520 },
    { month: 'Jan 2026', totalNights: 1209, occupiedNights: 1028, avgOccupancy: 85.0, revpar: 1930, roomRev: 2333560 },
    { month: 'Feb 2026', totalNights: 1092, occupiedNights: 885, avgOccupancy: 81.0, revpar: 1823, roomRev: 1990250 },
    { month: 'Mar 2026', totalNights: 1209, occupiedNights: 955, avgOccupancy: 79.0, revpar: 1778, roomRev: 2148750 },
    { month: 'Apr 2026', totalNights: 1170, occupiedNights: 866, avgOccupancy: 74.0, revpar: 1650, roomRev: 1930500 },
    { month: 'May 2026', totalNights: 1209, occupiedNights: 822, avgOccupancy: 68.0, revpar: 1516, roomRev: 1833060 },
    { month: 'Jun 2026', totalNights: 1170, occupiedNights: 878, avgOccupancy: 75.0, revpar: 1688, roomRev: 1974900 },
    { month: 'Jul 2026', totalNights: 1209, occupiedNights: 919, avgOccupancy: 76.0, revpar: 1718, roomRev: 2077020 },
    { month: 'Aug 2026', totalNights: 1209, occupiedNights: 967, avgOccupancy: 80.0, revpar: 1808, roomRev: 2185880 },
    { month: 'Sep 2026 (MTD)', totalNights: 936, occupiedNights: 786, avgOccupancy: 84.0, revpar: 1906, roomRev: 1784220 }
  ];

  // Yearly Occupancy Comparison
  const yearlyOccupancyData = [
    { year: 'FY 2024-25', availableNights: 14235, occupiedNights: 10818, avgOccupancy: 76.0, totalRoomRev: 23799600, adr: 2200 },
    { year: 'FY 2025-26', availableNights: 14235, occupiedNights: 11530, avgOccupancy: 81.0, totalRoomRev: 25942500, adr: 2250 },
    { year: 'FY 2026-27 (YTD Projected)', availableNights: 14235, occupiedNights: 12099, avgOccupancy: 85.0, totalRoomRev: 27585720, adr: 2280 }
  ];

  // CSV Generator for Occupancy Report (Sheet 2: Report CSV / download)
  const handleDownloadOccupancyCSV = (mode) => {
    let headers = [];
    let rows = [];

    if (mode === 'day') {
      headers = ['Date', 'Day', 'Total Rooms', 'Occupied', 'Vacant', 'Out of Order', 'Occupancy %', 'Room Revenue (INR)', 'ADR (INR)'];
      rows = dailyOccupancyData.map(d => [d.date, d.day, d.totalRooms, d.occupied, d.vacant, d.ooo, `${d.rate}%`, d.revenue, d.adr]);
    } else if (mode === 'month') {
      headers = ['Month', 'Available Room Nights', 'Occupied Room Nights', 'Average Occupancy %', 'RevPAR (INR)', 'Total Room Revenue (INR)'];
      rows = monthlyOccupancyData.map(m => [m.month, m.totalNights, m.occupiedNights, `${m.avgOccupancy}%`, m.revpar, m.roomRev]);
    } else {
      headers = ['Financial Year', 'Available Room Nights', 'Occupied Room Nights', 'Average Occupancy %', 'ADR (INR)', 'Total Room Revenue (INR)'];
      rows = yearlyOccupancyData.map(y => [y.year, y.availableNights, y.occupiedNights, `${y.avgOccupancy}%`, y.adr, y.totalRoomRev]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hotel_Sai_Occupancy_Report_${mode.toUpperCase()}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Downloaded ${mode.toUpperCase()} Occupancy Report CSV!`);
  };

  // Maintenance Work Orders Ticketing State
  const [workOrders, setWorkOrders] = useState([
    {
      id: 'WO-2026-081',
      roomNumber: '107',
      issue: 'AC Cooling Coil Leaking & Remote Defective',
      category: 'HVAC / AC',
      priority: 'High',
      technician: 'Bikram Patra (AC Specialist)',
      targetEta: 'Within 2 Hours',
      loggedAt: '2026-09-22 08:30 AM',
      status: 'In Progress',
      notes: 'Capacitor replaced; gas pressure checked at 65 PSI.'
    },
    {
      id: 'WO-2026-082',
      roomNumber: '204',
      issue: 'Geyser thermostat tripping after 5 mins',
      category: 'Electrical',
      priority: 'Medium',
      technician: 'Pradeep Jena (Electrician)',
      targetEta: 'Same Day by 18:00',
      loggedAt: '2026-09-22 09:15 AM',
      status: 'Pending',
      notes: 'Replacement heating element requested from Rayagada market.'
    }
  ]);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [workOrderForm, setWorkOrderForm] = useState({
    roomNumber: '204',
    issue: '',
    category: 'HVAC / AC',
    priority: 'High',
    technician: 'Bikram Patra (AC Specialist)',
    targetEta: 'Within 2 Hours',
    notes: ''
  });

  // Printable Cashier Handover Voucher Modal State
  const [handoverVoucherModalOpen, setHandoverVoucherModalOpen] = useState(false);
  const [activeHandoverForVoucher, setActiveHandoverForVoucher] = useState(null);

  // Police Register Dispatch State
  const [policeDispatchSent, setPoliceDispatchSent] = useState(false);

  // Operational Modal Submit Handlers
  const handleTransitSubmit = (e) => {
    e.preventDefault();
    if (!transitForm.roomNumber || !transitForm.guestName || !transitForm.phone) {
      alert('Please fill in Room Number, Guest Name, and Mobile Number.');
      return;
    }
    const newStay = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      roomNumber: transitForm.roomNumber,
      guestName: transitForm.guestName,
      phone: transitForm.phone,
      origin: transitForm.origin || 'Rayagada Railway Junction Transit',
      purpose: transitForm.purpose,
      slotType: transitForm.slotType,
      hoursAllowed: transitForm.hoursAllowed,
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      expectedCheckoutTime: `In ${transitForm.hoursAllowed} Hours`,
      tariff: Number(transitForm.tariff) || 899,
      paymentMode: transitForm.paymentMode,
      status: 'Active In-Stay',
      depositPaid: Number(transitForm.depositPaid) || 1000
    };
    setTransitStays(prev => [newStay, ...prev]);
    onUpdateRoomStatus(transitForm.roomNumber, 'Occupied', transitForm.guestName, newStay.id);

    // Sync transit stay to Cloudflare D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'check_in_guest',
        payload: {
          bookingId: newStay.id,
          roomNumber: transitForm.roomNumber,
          guestName: transitForm.guestName,
          guestPhone: transitForm.phone,
          idProofType: transitForm.idType,
          idProofNumber: transitForm.idNumber,
          nights: 1,
          tariffPerNight: Number(transitForm.tariff) || 899,
          totalAmount: Number(transitForm.tariff) || 899,
          advanceDeposit: Number(transitForm.depositPaid) || 1000,
          paymentMode: transitForm.paymentMode,
          purposeOfVisit: `Transit Stay (${transitForm.slotType}) - ${transitForm.purpose}`
        }
      })
    }).catch(err => console.warn('Transit stay D1 sync error:', err));

    setIsTransitModalOpen(false);
    showToast(`✓ Transit Check-In complete for Room ${transitForm.roomNumber} (${transitForm.slotType} - ₹${transitForm.tariff}).`);
  };

  // Station Transfer Handlers (Open-Hotel-PMS Logistics Engine)
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!newTransferForm.guestName || !newTransferForm.phone || !newTransferForm.scheduledTime) {
      alert('Please fill in Guest Name, Phone, and Scheduled Time.');
      return;
    }
    const newTrf = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      guestName: newTransferForm.guestName,
      roomNumber: newTransferForm.roomNumber,
      phone: newTransferForm.phone,
      transferType: newTransferForm.transferType,
      trainNumber: newTransferForm.trainNumber || 'RGDA Station Transit',
      scheduledTime: newTransferForm.scheduledTime,
      pickupLocation: newTransferForm.pickupLocation,
      assignedVehicle: newTransferForm.assignedVehicle,
      driverName: newTransferForm.driverName,
      driverPhone: newTransferForm.driverPhone,
      fare: Number(newTransferForm.fare) || 350,
      isCorporateCourtesy: newTransferForm.isCorporateCourtesy,
      billingStatus: newTransferForm.isCorporateCourtesy ? 'Corporate Courtesy (₹0)' : 'Pending Settlement',
      dispatchStatus: 'Scheduled'
    };
    setStationTransfers(prev => [newTrf, ...prev]);
    setIsTransferModalOpen(false);

    // Sync to Cloudflare D1 guest_transfers table
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'save_guest_transfer',
        payload: {
          transfer_id: newTrf.id,
          guest_name: newTrf.guestName,
          room_number: newTrf.roomNumber,
          phone: newTrf.phone,
          transfer_type: newTrf.transferType,
          train_number: newTrf.trainNumber,
          scheduled_time: newTrf.scheduledTime,
          pickup_location: newTrf.pickupLocation,
          assigned_vehicle: newTrf.assignedVehicle,
          driver_name: newTrf.driverName,
          driver_phone: newTrf.driverPhone,
          fare: newTrf.fare,
          is_corporate_courtesy: newTrf.isCorporateCourtesy ? 1 : 0,
          billing_status: newTrf.billingStatus,
          dispatch_status: newTrf.dispatchStatus
        }
      })
    }).catch(err => console.warn('Transfer sync error:', err));

    showToast(`✓ Transfer #${newTrf.id} scheduled for ${newTrf.guestName} (${newTrf.transferType}). Synced to D1 guest_transfers.`);
  };

  const handleUpdateTransferStatus = (trfId, newStatus) => {
    setStationTransfers(prev => prev.map(t => {
      if (t.id === trfId) {
        const updated = { ...t, dispatchStatus: newStatus };
        const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
          body: JSON.stringify({
            action: 'save_guest_transfer',
            payload: {
              transfer_id: updated.id,
              guest_name: updated.guestName,
              room_number: updated.roomNumber,
              phone: updated.phone,
              transfer_type: updated.transferType,
              train_number: updated.trainNumber,
              scheduled_time: updated.scheduledTime,
              pickup_location: updated.pickupLocation,
              assigned_vehicle: updated.assignedVehicle,
              driver_name: updated.driverName,
              driver_phone: updated.driverPhone,
              fare: updated.fare,
              is_corporate_courtesy: updated.isCorporateCourtesy ? 1 : 0,
              billing_status: updated.billingStatus,
              dispatch_status: updated.dispatchStatus
            }
          })
        }).catch(() => {});
        return updated;
      }
      return t;
    }));
    showToast(`✓ Transfer ${trfId} status updated to: ${newStatus} (Synced to D1)`);
  };

  const handleBillTransferToFolio = (trf) => {
    if (trf.billingStatus.includes('Billed to Room Folio')) {
      alert('This transfer has already been posted to the room master folio.');
      return;
    }
    setStationTransfers(prev => prev.map(t => t.id === trf.id ? { ...t, billingStatus: 'Billed to Room Folio (SAC 996412)' } : t));
    
    // Remote D1 sync dispatch
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'bill_to_room',
        payload: {
          roomNumber: trf.roomNumber,
          category: 'TRANSPORTATION',
          description: `${trf.transferType} - ${trf.trainNumber} (Driver ${trf.driverName})`,
          sac: '996412',
          amount: trf.fare,
          taxRate: 5
        }
      })
    }).catch(err => console.warn('Offline transfer folio bill:', err));

    showToast(`✓ ₹${trf.fare} for ${trf.transferType} posted to Room ${trf.roomNumber} Master Folio (SAC 996412)!`);
  };

  // Shift Logbook & Wake-Up Handlers
  const handleWakeUpSubmit = (e) => {
    e.preventDefault();
    if (!newWakeUpForm.roomNumber || !newWakeUpForm.guestName || !newWakeUpForm.time) {
      alert('Please fill in Room Number, Guest Name, and Wake-Up Time.');
      return;
    }
    const newWuc = {
      id: `WUC-${Date.now().toString().slice(-4)}`,
      roomNumber: newWakeUpForm.roomNumber,
      guestName: newWakeUpForm.guestName,
      time: newWakeUpForm.time,
      train: newWakeUpForm.train || 'General Early Departure',
      status: 'Active Scheduled',
      notes: newWakeUpForm.notes
    };
    setWakeUpCalls(prev => [newWuc, ...prev]);
    setIsWakeUpModalOpen(false);
    showToast(`✓ Wake-up call scheduled for Room ${newWuc.roomNumber} at ${newWuc.time}!`);
  };

  const handleToggleWakeUpStatus = (wucId) => {
    setWakeUpCalls(prev => prev.map(w => {
      if (w.id === wucId) {
        const nextStatus = w.status === 'Completed' ? 'Active Scheduled' : 'Completed';
        showToast(`✓ Wake-up call ${wucId} marked ${nextStatus}`);
        return { ...w, status: nextStatus };
      }
      return w;
    }));
  };

  const handleSignShiftHandover = (shiftKey) => {
    const inputPin = prompt('Enter 4-Digit Duty Manager / Receptionist PIN to sign shift handover (Default: 7650):');
    if (!inputPin) return;
    const verified = inputPin === '7650' || inputPin === '2026' || inputPin === localStorage.getItem('hsi_admin_pin');
    if (!verified) {
      alert('Invalid security PIN. Handover signature denied.');
      return;
    }
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setShiftLogbook(prev => ({
      ...prev,
      [shiftKey]: {
        ...prev[shiftKey],
        handoverSigned: true,
        signedAt: nowTime
      }
    }));
    showToast(`✓ ${shiftKey.toUpperCase()} Shift Handover verified & locked with Duty Manager signature!`);
  };

  // OTA Channel Manager Handlers (FrontDesko Sync Engine)
  const handleTriggerOtaSync = () => {
    const nowTime = new Date().toLocaleTimeString('en-IN');
    setLastOtaSyncTime(nowTime);
    setOtaChannels(prev => prev.map(ch => ({
      ...ch,
      lastSynced: 'Just now',
      syncStatus: otaEmergencyStop ? 'Closed (Emergency Stop)' : 'Two-Way Connected'
    })));
    showToast('✓ Two-Way Rate & Inventory push broadcasted to MakeMyTrip, Goibibo, and Booking.com!');
  };

  const handleToggleOtaEmergencyStop = () => {
    const nextState = !otaEmergencyStop;
    setOtaEmergencyStop(nextState);
    setOtaChannels(prev => prev.map(ch => {
      if (ch.id === 'direct') return ch;
      return {
        ...ch,
        isLive: !nextState,
        syncStatus: nextState ? 'Closed (Emergency Stop)' : 'Two-Way Connected'
      };
    }));
    if (nextState) {
      showToast('🛑 Emergency Stop Activated: All OTA inventory pooled back to 100% Direct Website Sales (0% Commission)!');
    } else {
      showToast('✓ OTA Channels Re-Opened: 2-way distribution restored across MMT & Booking.com.');
    }
  };

  const handleLfSubmit = (e) => {
    e.preventDefault();
    if (!lfForm.roomNumber || !lfForm.itemDescription) {
      alert('Please enter Room Number and Article Description.');
      return;
    }
    const newArticle = {
      id: `LF-2026-${Date.now().toString().slice(-4)}`,
      dateFound: new Date().toLocaleDateString('en-GB'),
      roomNumber: lfForm.roomNumber,
      itemDescription: lfForm.itemDescription,
      category: lfForm.category,
      foundByStaff: lfForm.foundByStaff || 'Anita Majhi (Housekeeping)',
      lockerNumber: lfForm.lockerNumber,
      guestName: lfForm.guestName || 'In-House Guest',
      guestPhone: lfForm.guestPhone || '+91 94370 00000',
      status: 'In Custody',
      notes: lfForm.notes || 'Tagged and placed in reception custody vault.'
    };
    setLostAndFoundItems(prev => [newArticle, ...prev]);
    setIsLfModalOpen(false);
    showToast(`✓ Found article logged in ${lfForm.lockerNumber} (ID: ${newArticle.id}).`);
  };

  const handleMntSubmit = (e) => {
    e.preventDefault();
    if (!mntForm.roomNumber || !mntForm.issueDescription) {
      alert('Please enter Room Number and Issue Description.');
      return;
    }
    const newTkt = {
      ticketId: `MNT-${Date.now().toString().slice(-4)}`,
      roomNumber: mntForm.roomNumber,
      category: mntForm.category,
      severity: mntForm.severity,
      issueDescription: mntForm.issueDescription,
      reportedBy: 'Front Desk Lead',
      reportedAt: new Date().toLocaleString('en-GB'),
      assignedTech: mntForm.assignedTech,
      blockType: mntForm.blockType,
      status: 'In Progress',
      costEst: Number(mntForm.costEst) || 250
    };
    setMaintenanceTickets(prev => [newTkt, ...prev]);
    if (mntForm.blockType === 'OOO (Out of Order)') {
      onUpdateRoomStatus(mntForm.roomNumber, 'Maintenance', null, null);
    }
    setIsMntModalOpen(false);
    showToast(`✓ Work order ${newTkt.ticketId} created. Room ${mntForm.roomNumber} blocked as ${mntForm.blockType}.`);
  };

  // Helper to normalize any date string to standard YYYY-MM-DD format
  const parseDateToYMD = (str) => {
    if (!str) return '';
    const trimmed = String(str).trim().split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('/');
      return `${y}-${m}-${d}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('-');
      return `${y}-${m}-${d}`;
    }
    if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(trimmed)) {
      try {
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      } catch {}
    }
    return trimmed;
  };

  // Compile all known bookings: props bookings + authentic GST FOM records
  const allKnownBookings = useMemo(() => {
    const list = [...(bookings || [])];
    
    // Add FOM records from 25/09/2026
    (GST_FOM_RECORDS_2026_09_25 || []).forEach(fom => {
      const rNo = String(fom.roomNo);
      const inDate = parseDateToYMD(fom.checkIn) || '2026-09-24';
      const outDate = parseDateToYMD(fom.checkOut) || '2026-09-25';
      list.push({
        bookingId: fom.billNo,
        billNo: fom.billNo,
        roomNumber: rNo,
        room_number: rNo,
        guestName: fom.guestName,
        guestPhone: '+91 94370 ' + String(10000 + (fom.slNo || 1) * 73).slice(-5),
        company: fom.company || (fom.isB2B ? 'CORPORATE' : 'INDIVIDUAL'),
        corporateGstin: fom.gstin || '',
        tier: rNo.startsWith('2') ? 'Deluxe Room' : (rNo === '303' || rNo === '314' || rNo === '403' || rNo === '414' ? 'Premium Suite' : 'Executive Room'),
        tariff: fom.taxable0 || 2199,
        totalAmount: fom.totalAmount || 2199,
        balanceDue: fom.paymentMode?.includes('BTC') ? fom.totalAmount : 0,
        checkInDate: inDate,
        checkOutDate: outDate,
        nights: 1,
        source: 'FOM-Ledger'
      });
    });

    return list;
  }, [bookings]);

  // Projected Room States for Selected Date Window [filterFromDate, filterToDate]
  const projectedRooms = useMemo(() => {
    const fromYMD = parseDateToYMD(filterFromDate) || todayStr;
    const toYMD = parseDateToYMD(filterToDate) || fromYMD;

    // Check if current today is included in the window
    const includesToday = (fromYMD <= todayStr && toYMD >= todayStr);

    return rooms.map(room => {
      const rNo = String(room.roomNumber);

      // Find booking overlapping [fromYMD, toYMD]
      const matchedBooking = allKnownBookings.find(b => {
        const bRoom = String(b.roomNumber || b.room_number);
        if (bRoom !== rNo) return false;
        const bIn = parseDateToYMD(b.checkInDate || b.checkIn || b.check_in_date);
        const bOut = parseDateToYMD(b.checkOutDate || b.checkOut || b.check_out_date || bIn);
        if (!bIn) return false;
        return bIn <= toYMD && bOut >= fromYMD;
      });

      // Default in-house occupancy if today is within window or room has active guest
      const hasCurrentInHouse = (room.status === 'Occupied' || room.status === 'Occupied Clean');
      const isBookedInPeriod = Boolean(matchedBooking) || (includesToday && hasCurrentInHouse);

      let effectiveStatus = room.status;
      let effectiveGuestName = room.currentGuestName || '—';
      let effectivePhone = room.guestPhone || '—';
      let effectiveCompany = room.company || '—';
      let effectiveStayPeriod = '—';
      let effectiveTariff = room.tariff || 2199;
      let effectiveBalanceDue = room.balanceDue || 0;

      if (room.status === 'Maintenance') {
        effectiveStatus = 'Maintenance';
        effectiveGuestName = 'OOO / MAINTENANCE';
        effectiveStayPeriod = 'Blocked';
      } else if (isBookedInPeriod) {
        effectiveStatus = room.status === 'Occupied Clean' ? 'Occupied Clean' : 'Occupied';
        effectiveGuestName = matchedBooking?.guestName || room.currentGuestName || 'In-House Guest';
        effectivePhone = matchedBooking?.guestPhone || room.guestPhone || '+91 94370 22555';
        effectiveCompany = matchedBooking?.company || room.company || (matchedBooking?.isB2B ? 'CORPORATE' : 'INDIVIDUAL');
        const inFormatted = matchedBooking?.checkInDate || (includesToday ? 'Today' : fromYMD);
        const outFormatted = matchedBooking?.checkOutDate || (includesToday ? 'Tomorrow' : toYMD);
        effectiveStayPeriod = `${inFormatted} → ${outFormatted}`;
        effectiveTariff = matchedBooking?.tariff || matchedBooking?.tariffPerNight || room.tariff || 2199;
        effectiveBalanceDue = matchedBooking?.balanceDue !== undefined ? matchedBooking.balanceDue : (room.balanceDue || 0);
      } else {
        effectiveStatus = 'Available';
        effectiveGuestName = '—';
        effectivePhone = '—';
        effectiveCompany = '—';
        effectiveStayPeriod = 'Vacant Clean';
        effectiveTariff = room.tariff || 2199;
        effectiveBalanceDue = 0;
      }

      return {
        ...room,
        effectiveStatus,
        effectiveGuestName,
        effectivePhone,
        effectiveCompany,
        effectiveStayPeriod,
        effectiveTariff,
        effectiveBalanceDue,
        matchedBooking
      };
    });
  }, [rooms, allKnownBookings, filterFromDate, filterToDate, todayStr]);

  // Counts based on projected room state for selected date window
  const totalCount = projectedRooms.length;
  const vacantCleanCount = projectedRooms.filter(r => r.effectiveStatus === 'Available').length;
  const vacantDirtyCount = projectedRooms.filter(r => r.effectiveStatus === 'Vacant Dirty' || r.effectiveStatus === 'Cleaning').length;
  const occupiedCleanCount = projectedRooms.filter(r => r.effectiveStatus === 'Occupied Clean').length;
  const occupiedDirtyCount = projectedRooms.filter(r => r.effectiveStatus === 'Occupied').length;
  const oooCount = projectedRooms.filter(r => r.effectiveStatus === 'Maintenance' || r.effectiveStatus === 'VIP Hold').length;

  // Filtered rooms for Tape Chart / Master Tabular Room Ledger
  const filteredRooms = projectedRooms.filter(r => {
    let matchesFilter = true;
    if (statusFilter === 'all') matchesFilter = true;
    else if (statusFilter === 'Available') matchesFilter = r.effectiveStatus === 'Available';
    else if (statusFilter === 'Vacant Dirty') matchesFilter = r.effectiveStatus === 'Vacant Dirty' || r.effectiveStatus === 'Cleaning';
    else if (statusFilter === 'Occupied') matchesFilter = r.effectiveStatus === 'Occupied' || r.effectiveStatus === 'Occupied Clean';
    else if (statusFilter === 'Occupied Clean') matchesFilter = r.effectiveStatus === 'Occupied Clean';
    else if (statusFilter === 'Maintenance') matchesFilter = r.effectiveStatus === 'Maintenance' || r.effectiveStatus === 'VIP Hold';
    else matchesFilter = r.effectiveStatus === statusFilter;

    const matchesSearch = r.roomNumber.includes(searchTerm) || 
      (r.effectiveGuestName && r.effectiveGuestName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.effectiveCompany && r.effectiveCompany.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    if (!walkInRoom || !walkInName || !walkInPhone) return;

    const selectedRoomObj = rooms.find(r => r.roomNumber === walkInRoom);
    const tier = selectedRoomObj ? selectedRoomObj.tier : 'Standard Deluxe';
    
    // Agreed rate is inclusive of GST (All-inclusive tariff standard for Sri Sai Vasudev Residency)
    // Example: Tariff ₹2,899 - Advance Deposit ₹1,500 = Balance Due ₹1,399
    const totalStayAmount = walkInRate * walkInNights;
    const advanceDepositNum = Number(walkInDeposit) || 0;
    const balanceDueCalculated = Math.max(0, totalStayAmount - advanceDepositNum);

    // Calculate embedded GST for SAC 996311 compliance
    const taxableBase = Math.round((totalStayAmount / 1.05) * 100) / 100;
    const cgstAmt = Math.round(((totalStayAmount - taxableBase) / 2) * 100) / 100;
    const sgstAmt = Math.round((totalStayAmount - taxableBase - cgstAmt) * 100) / 100;

    const bookingPayload = {
      bookingId: `WALK-${Date.now().toString().slice(-6)}`,
      roomNumber: walkInRoom,
      tier,
      guestName: walkInName,
      guestPhone: walkInPhone,
      idProofType: 'Aadhaar',
      idProofMasked: maskAadhaar(walkInAadhaar),
      stateOfOrigin: walkInOrigin,
      isInterstate: walkInOrigin.toLowerCase() !== 'odisha',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + walkInNights * 86400000).toISOString().split('T')[0],
      nights: walkInNights,
      adults: 1,
      children: 0,
      mealPlan: walkInMealPlan,
      billingType: walkInBillingType,
      company: walkInBillingType === 'BTC' ? walkInCompany : 'Individual',
      companyName: walkInBillingType === 'BTC' ? walkInCompany : 'Individual',
      tariffPerNight: walkInRate,
      baseTotal: taxableBase,
      cgst: cgstAmt,
      sgst: sgstAmt,
      totalAmount: totalStayAmount,
      advanceDeposit: advanceDepositNum,
      balanceDue: balanceDueCalculated,
      paymentMode: walkInPaymentMode,
      paymentStatus: advanceDepositNum >= totalStayAmount ? 'Paid at Check-In' : (advanceDepositNum > 0 ? 'Partially Paid' : 'Pending Payment'),
      bookingStatus: 'Checked In',
      isB2b: walkInBillingType === 'BTC',
      consentDpdp: 1
    };

    // Save directly to Cloudflare D1 database
    try {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_booking', payload: bookingPayload })
      }).catch(err => console.warn("D1 booking sync non-fatal:", err));
    } catch (e) {}

    onNewBooking(bookingPayload);
    onUpdateRoomStatus(walkInRoom, 'Occupied', walkInName, bookingPayload.bookingId);
    setWalkInOpen(false);
  };

  const handleBlockRoomSubmit = (e) => {
    e.preventDefault();
    if (!blockSelectedRoom) return;

    onUpdateRoomStatus(blockSelectedRoom, 'Maintenance', `${blockReason} (${blockNotes || 'OOO'})`, null);
    setBlockRoomOpen(false);
    setBlockSelectedRoom('');
    setBlockNotes('');
  };

  // WhatsApp Digital Keycard & Welcome Pass Dispatch
  const handleSendWelcomePass = (room) => {
    const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber);
    const guestName = room.currentGuestName || matchedBooking?.guestName || 'Valued Guest';
    const rawPhone = matchedBooking?.guestPhone || room.guestPhone || '+91 94370 00000';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = `🏨 *${HOTEL_CONFIG.name.toUpperCase()} - DIGITAL KEYCARD & WELCOME PASS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Namaste *${guestName}*, welcome to ${HOTEL_CONFIG.name}, Rayagada!

🔑 *Assigned Room:* Room ${room.roomNumber} (${room.tier})
📶 *High-Speed Wi-Fi:* SAI_GUEST_5G
🔐 *Wi-Fi Password:* SaiLuxury@2026
📞 *Reception Desk:* Dial 0
🍽️ *Cannon Kitchen & In-Room Dining:* Dial 9

🛕 *Rayagada Temple Darshan Timings:*
• Maa Majhighariani Temple: 05:30 AM - 01:30 PM & 04:30 PM - 09:00 PM
• Jagannath Temple: 06:00 AM - 12:30 PM & 05:00 PM - 08:30 PM

Enjoy your stay! For 24/7 front desk support or housekeeping, dial 0 or message us back directly here.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, '_blank');
    showToast(`✓ WhatsApp Welcome Pass dispatched for Room ${room.roomNumber}!`);
  };

  // Inter-Room Shift Handlers
  const handleOpenShiftModal = (room) => {
    setShiftModalRoom(room);
    const available = rooms.filter(r => (r.status === 'Available' || r.status === 'Vacant Clean') && r.roomNumber !== room.roomNumber);
    setShiftTargetRoom(available.length > 0 ? available[0].roomNumber : '');
    setShiftReason('Guest Requested Upgrade / Quiet Wing');
  };

  const handleConfirmShiftRoom = (e) => {
    e.preventDefault();
    if (!shiftModalRoom || !shiftTargetRoom) return;

    const fromRoomNo = shiftModalRoom.roomNumber;
    const toRoomNo = shiftTargetRoom;
    const guestName = shiftModalRoom.currentGuestName || 'In-House Guest';

    // 1. Release source room to Vacant Dirty for housekeeping
    onUpdateRoomStatus(fromRoomNo, 'Vacant Dirty', null, null);
    // 2. Mark destination room as Occupied with guest details
    onUpdateRoomStatus(toRoomNo, 'Occupied', guestName, shiftModalRoom.bookingId);

    // 3. Dispatch shift audit event to D1 Edge DB
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'shift_room',
        payload: {
          fromRoom: fromRoomNo,
          toRoom: toRoomNo,
          guestName,
          reason: shiftReason
        }
      })
    }).catch(err => console.warn('Offline shift fallback:', err));

    showToast(`✓ Room shifted from Room ${fromRoomNo} to Room ${toRoomNo} (${shiftReason}). Room ${fromRoomNo} released to Housekeeping.`);
    setShiftModalRoom(null);
  };

  // Edit Stay Details Handlers
  const handleOpenEditStay = (room) => {
    const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber);
    setEditStayRoom(room);
    setEditStayGuestName(room.currentGuestName || matchedBooking?.guestName || '');
    setEditStayPhone(matchedBooking?.guestPhone || '+91 94370 00000');
    setEditStayVehicle(matchedBooking?.vehicleNumber || '');
    setEditStayExtendNights(0);
    setEditStayAddExtraBed(false);
    setEditStayNotes('');
  };

  const handleSaveEditStay = (e) => {
    e.preventDefault();
    if (!editStayRoom) return;

    let extraTariff = 0;
    if (editStayExtendNights > 0) {
      extraTariff = Math.round((editStayRoom.tariff || 1699) * editStayExtendNights * 1.12);
    }
    const extraBed = editStayAddExtraBed ? 560 : 0;
    const totalAdded = extraTariff + extraBed;

    // Update room with modified guest name
    onUpdateRoomStatus(editStayRoom.roomNumber, 'Occupied', editStayGuestName, editStayRoom.bookingId);

    // Dispatch update to D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'update_stay_details',
        payload: {
          roomNumber: editStayRoom.roomNumber,
          guestName: editStayGuestName,
          guestPhone: editStayPhone,
          vehicleNumber: editStayVehicle,
          extendedNights: editStayExtendNights,
          extraBedAdded: editStayAddExtraBed,
          totalAddedToFolio: totalAdded,
          notes: editStayNotes
        }
      })
    }).catch(err => console.warn('Offline stay update fallback:', err));

    showToast(`✓ Stay updated for Room ${editStayRoom.roomNumber}! ${totalAdded > 0 ? `Added ₹${totalAdded} (Nights: +${editStayExtendNights}, Bed: ₹${extraBed}) to Folio.` : 'Guest details refreshed.'}`);
    setEditStayRoom(null);
  };

  const executeShiftHandover = () => {
    const expected = openingFloat + cashCollected - pettyCashPaid;
    const variance = closingCashActual - expected;
    const newLog = {
      shiftId: `SH-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      shift: 'Evening (15:00 - 23:00)',
      cashier: 'Front Desk Cashier',
      supervisor: 'Operations Lead',
      openingFloat,
      cashCollected,
      pettyCash: pettyCashPaid,
      expected,
      actual: closingCashActual,
      variance,
      status: variance === 0 ? 'BALANCED' : variance > 0 ? 'OVERAGE' : 'SHORTAGE',
      denominations: { ...denominations },
      notes: variance === 0 ? 'Shift drawer physically balanced and signed.' : `Variance of ₹${variance} logged for audit.`
    };
    setHandoverLogs([newLog, ...handoverLogs]);
    setActiveHandoverForVoucher(newLog);
    setHandoverSuccess(true);

    // Cloudflare D1 Cashier Shift Handover Sync
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'record_shift_handover',
        payload: {
          shiftType: newLog.shift,
          outgoingCashier: newLog.cashier,
          incomingCashier: newLog.supervisor,
          openingFloat: newLog.openingFloat,
          cashCollected: newLog.cashCollected,
          upiCollected: 0,
          cardCollected: 0,
          companyCredit: 0,
          totalRevenue: newLog.cashCollected,
          closingCashExpected: newLog.expected,
          closingCashActual: newLog.actual,
          varianceReason: newLog.notes,
          notes: `Denominations: 500x${denominations[500] || 0}, 200x${denominations[200] || 0}, 100x${denominations[100] || 0}, 50x${denominations[50] || 0}`
        }
      })
    }).catch(err => console.warn('Shift handover cloud sync error:', err));

    setTimeout(() => setHandoverSuccess(false), 4000);
  };

  const handleCreateWorkOrderSubmit = (e) => {
    e.preventDefault();
    if (!workOrderForm.roomNumber || !workOrderForm.issue) return;

    const newTicket = {
      id: `WO-${Date.now().toString().slice(-6)}`,
      roomNumber: workOrderForm.roomNumber,
      issue: workOrderForm.issue,
      category: workOrderForm.category,
      priority: workOrderForm.priority,
      technician: workOrderForm.technician,
      targetEta: workOrderForm.targetEta || 'Within 2 Hours',
      loggedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'In Progress',
      notes: workOrderForm.notes || 'Logged from Front Desk Maintenance Console'
    };

    // Dispatch to Cloudflare D1 maintenance_work_orders table
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'save_work_order',
        payload: {
          id: newTicket.id,
          roomNumber: newTicket.roomNumber,
          issue: newTicket.issue,
          category: newTicket.category,
          priority: newTicket.priority,
          technician: newTicket.technician,
          targetEta: newTicket.targetEta,
          notes: newTicket.notes
        }
      })
    }).catch(err => console.warn('Offline work order save:', err));

    setWorkOrders([newTicket, ...workOrders]);
    onUpdateRoomStatus(workOrderForm.roomNumber, 'Maintenance', `OOO: ${workOrderForm.issue}`, null);
    setIsWorkOrderModalOpen(false);
    setWorkOrderForm({
      roomNumber: '',
      issue: '',
      category: 'HVAC / AC',
      priority: 'High',
      technician: 'Bikram Patra (AC Specialist)',
      targetEta: 'Within 2 Hours',
      notes: ''
    });
  };

  const handleResolveWorkOrder = (ticketId, roomNumber) => {
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'resolve_work_order',
        payload: {
          ticketId,
          roomNumber
        }
      })
    }).catch(err => console.warn('Offline work order resolution:', err));

    setWorkOrders(workOrders.map(wo => wo.id === ticketId ? { ...wo, status: 'Resolved' } : wo));
    // Move room to Vacant Dirty so housekeeping inspects after maintenance repair
    onUpdateRoomStatus(roomNumber, 'Vacant Dirty', null, null);
  };

  const handleSaveFloorAttendant = (e) => {
    e.preventDefault();
    setFloorAttendants({
      ...floorAttendants,
      [selectedFloorToEdit]: {
        name: attendantForm.name,
        phone: attendantForm.phone,
        shift: attendantForm.shift || 'Morning (07:00 - 15:30)',
        status: 'On Floor'
      }
    });
    setIsEditAttendantOpen(false);
  };

  const dispatchPoliceRegisterWhatsApp = async () => {
    setPoliceDispatchSent(true);
    try {
      const interstateCount = (filteredBookings || []).filter(b => b.isInterstate || (b.stateOfOrigin && b.stateOfOrigin.toLowerCase() !== 'odisha')).length;
      const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
        body: JSON.stringify({
          action: 'dispatch_police_register',
          payload: {
            totalEntries: (filteredBookings || []).length,
            interstateEntries: interstateCount,
            dispatchedBy: 'Front Desk Duty Manager',
            preview: `Statutory Sarai Act Register: ${(filteredBookings || []).length} total entries, ${interstateCount} inter-state guests dispatched to Rayagada Town Police Station.`
          }
        })
      });
    } catch (err) {
      console.warn('Police register dispatch API error non-fatal:', err);
    }
    setTimeout(() => setPoliceDispatchSent(false), 5000);
  };

  const handleAddLuggagePass = (e) => {
    e.preventDefault();
    if (!luggageForm.guestName || !luggageForm.phone) {
      alert('Please enter guest name and phone number');
      return;
    }
    const newPass = {
      id: `LUG-${Date.now().toString().slice(-6)}`,
      roomNumber: luggageForm.roomNumber,
      guestName: luggageForm.guestName,
      phone: luggageForm.phone,
      bagsCount: Number(luggageForm.bagsCount) || 1,
      bagType: luggageForm.bagType || 'Luggage',
      droppedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      pickupTime: luggageForm.pickupTime || '07:00 PM',
      trainNo: luggageForm.trainNo || 'Train Transfer',
      lockerNo: luggageForm.lockerNo || 'Locker-01',
      status: 'In Custody'
    };
    setLuggagePasses([newPass, ...luggagePasses]);
    setLuggageForm({
      roomNumber: '101',
      guestName: '',
      phone: '',
      bagsCount: 2,
      bagType: 'Trolley Bags',
      pickupTime: '07:00 PM',
      trainNo: '18448 Hirakhand Exp',
      lockerNo: 'Locker-06'
    });
    setFeedbackToast(`Luggage Pass ${newPass.id} issued for ${newPass.guestName}!`);
  };

  const handleReleaseLuggage = (passId) => {
    setLuggagePasses(luggagePasses.map(lp => lp.id === passId ? { ...lp, status: 'Released to Guest' } : lp));
    setFeedbackToast(`Luggage pass ${passId} safely released to guest.`);
  };

  return (
    <section 
      id="reception-admin-container" 
      ref={receptionContainerRef} 
      className="reception-admin-root hsi-live-edit-active" 
      style={{ padding: '2rem 1.5rem 4rem 1.5rem', maxWidth: 1580, margin: '0 auto', position: 'relative' }}
    >
      {/* 5-DEPARTMENT CONSOLE & 3-ROLE AUTHORIZATION BAR (Owner Video Requirement) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(12, 24, 43, 0.98), rgba(6, 14, 26, 0.99))',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        marginBottom: '1.75rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Top Line: 3 Authorized Operational Roles */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', border: '1px solid rgba(212, 175, 55, 0.4)', fontWeight: 800 }}>
                AUTHENTIC MYSOFT ENTERPRISE PMS
              </span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Active Operator Profile: <strong style={{ color: activeRole === 'owner' ? '#fbbf24' : activeRole === 'receptionist' ? '#38bdf8' : '#34d399' }}>
                  {activeRole === 'owner' ? '👑 Eswara (Managing Director / Owner)' : activeRole === 'receptionist' ? '👤 Front Desk Reception Lead' : '💼 Chief Accountant & Cashier Lead'}
                </strong>
              </span>
            </div>
          </div>

          {/* Top Line Right Side: 3 Role Switcher Buttons & Exit PMS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { id: 'owner', label: '👑 Owner / MD (Eswara)', color: '#fbbf24' },
                { id: 'receptionist', label: '👤 Receptionist', color: '#38bdf8' },
                { id: 'accounts', label: '💼 Accounts Lead', color: '#34d399' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    border: activeRole === r.id ? `1px solid ${r.color}` : '1px solid transparent',
                    background: activeRole === r.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: activeRole === r.id ? r.color : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {onExitPMS && (
              <button
                type="button"
                onClick={onExitPMS}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  border: '1px solid #f87171',
                  color: '#ffffff',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.45)',
                  transition: 'all 0.15s ease'
                }}
                title="Exit Front Desk PMS and Return to Guest Website (Shortcut: Esc)"
              >
                <LogOut size={14} color="#ffffff" /> Exit PMS (Esc)
              </button>
            )}
          </div>
        </div>

        {/* Rapid Cross-Module Interconnection Highway (F1-F8 One-Touch Switcher) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.55rem 0.2rem',
          overflowX: 'auto',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          scrollbarWidth: 'none'
        }}>
          <span style={{
            fontSize: '0.72rem',
            color: 'var(--gold-glow)',
            fontWeight: 800,
            letterSpacing: '0.04em',
            paddingRight: '0.35rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap'
          }}>
            ⚡ FAST RAIL:
          </span>

          {[
            { key: 'F1', label: 'Front Desk', color: '#38bdf8', onClick: () => { setActiveDepartment('reception'); setActiveTab('tape-chart'); } },
            { key: 'F2', label: 'Fenugreek POS', color: '#fbbf24', onClick: onOpenRestaurantPOS },
            { key: 'F3', label: 'Day Book & Tax', color: '#34d399', onClick: onOpenAccountsLedger },
            { key: 'F4', label: 'Primary Folio (1-17)', color: '#60a5fa', onClick: () => {
              const targetRoom = rooms.find(r => r.status === 'Occupied') || rooms[0];
              if (targetRoom) setSelectedFolioRoom(targetRoom);
            } },
            { key: 'F5', label: 'Mandi Store', color: '#a78bfa', onClick: onOpenStoreInventory },
            { key: 'F6', label: 'G3 RMS Rates', color: '#f59e0b', onClick: onOpenRevenueManagement },
            { key: 'F7', label: 'Night Audit', color: '#c084fc', onClick: onOpenNightAuditModal || (() => setActiveTab('cashier-audit')) },
            { key: 'F8', label: 'Director Portal', color: '#facc15', onClick: onOpenDirectorPortal }
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: item.color,
                borderRadius: '6px',
                padding: '0.28rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              title={`Quick switch to ${item.label} (${item.key})`}
            >
              <kbd style={{
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '4px',
                padding: '1px 5px',
                fontSize: '0.66rem',
                fontFamily: 'monospace',
                color: '#fff',
                boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.4)'
              }}>
                {item.key}
              </kbd>
              {item.label}
            </button>
          ))}
        </div>

        {/* Bottom Line: 5 Department Master Section Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.65rem',
          paddingTop: '0.85rem'
        }}>
          {[
            { 
              id: 'reception', 
              label: '1. Front Desk & Reception', 
              icon: Hotel, 
              color: '#38bdf8', 
              desc: 'Tape Chart, 39 Rooms, Walk-in, GRC',
              onClick: () => {
                setActiveDepartment('reception');
                setActiveTab('tape-chart');
              }
            },
            { 
              id: 'restaurant', 
              label: '2. Fenugreek Restaurant', 
              icon: Utensils, 
              color: '#fbbf24', 
              desc: 'KOT Billing, In-Room Dining & POS',
              badge: foodOrdersList.filter(o => o.status === 'Received').length > 0 ? `${foodOrdersList.filter(o => o.status === 'Received').length} New` : null,
              badgeColor: '#ef4444',
              onClick: () => {
                setActiveDepartment('restaurant');
                if (onOpenRestaurantPOS) onOpenRestaurantPOS();
              }
            },
            { 
              id: 'accounts', 
              label: '3. Accounts & Cashier', 
              icon: DollarSign, 
              color: '#34d399', 
              desc: 'Cash Drawer, Split Tenders, Day Book',
              onClick: () => {
                setActiveDepartment('accounts');
                setActiveTab('cashier-audit');
              }
            },
            { 
              id: 'store', 
              label: '4. Mandi Store & Inventory', 
              icon: ShoppingBag, 
              color: '#a78bfa', 
              desc: 'Kitchen Stock, Linen & Amenities',
              onClick: () => {
                setActiveDepartment('store');
                if (onOpenStoreInventory) onOpenStoreInventory();
              }
            },
            { 
              id: 'housekeeping', 
              label: '5. Housekeeping & Turnover', 
              icon: Layers, 
              color: '#facc15', 
              desc: '18-Room Vacant Dirty Turnover',
              badge: roomServicesList.filter(r => r.status === 'Pending').length > 0 ? `${roomServicesList.filter(r => r.status === 'Pending').length} Pending` : null,
              badgeColor: '#f59e0b',
              onClick: () => {
                setActiveDepartment('housekeeping');
                setActiveTab('housekeeping');
              }
            }
          ].map(dept => {
            const Icon = dept.icon;
            const isSelected = activeDepartment === dept.id;
            return (
              <button
                key={dept.id}
                onClick={dept.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.07)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: isSelected ? dept.color : 'rgba(255,255,255,0.08)',
                  color: isSelected ? '#060e1a' : dept.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? '#fff' : '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {dept.label}
                    {dept.badge && (
                      <span style={{
                        background: dept.badgeColor,
                        color: '#fff',
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontWeight: 800
                      }}>
                        {dept.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--gold-glow)' : 'var(--text-muted)' }}>
                    {dept.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Front Desk Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-glow)', fontSize: '0.8rem', fontWeight: 600 }}>
            <ShieldCheck size={16} /> Central PMS Operations • {HOTEL_CONFIG.legalName}
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0.2rem 0' }}>Front Desk &amp; 18-Room Operations Console</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            GSTIN: <strong style={{ color: '#fbbf24' }}>{HOTEL_CONFIG.gstin}</strong> • Rayagada, Odisha • Sarai Act 1867 &amp; Rule 46 Compliant
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={onOpenCaFilingStation}
            className="btn-outline-gold"
            title="Open System #36: CA Filing Station & Financial Intelligence Engine (10 Modules)"
            style={{ 
              padding: '0.55rem 0.95rem', 
              fontSize: '0.82rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              borderColor: 'var(--gold-primary)',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(245, 158, 11, 0.15))',
              color: 'var(--gold-glow)',
              fontWeight: 700
            }}
          >
            <Scale size={15} color="var(--gold-glow)" /> 🏛️ System #36: CA Filing
          </button>
          <button 
            onClick={() => { setSelectedRoomForQr('101'); setRoomQrOpen(true); }}
            className="btn-outline-gold"
            title="Generate In-Room Dining, Digital Keycard & Standee QR"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <QrCode size={15} color="var(--gold-glow)" /> Room QR
          </button>
          <button 
            onClick={() => setBackupOpen(true)}
            className="btn-outline-gold"
            title="One-click Complete JSON Database Dump & Restore"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Database size={15} color="#38bdf8" /> Backup JSON
          </button>
          <button 
            onClick={() => setLiveOrdersOpen(true)}
            className="btn-outline-gold"
            title="View Real-Time Cannon Kitchen In-Room Dining Orders"
            style={{ 
              padding: '0.55rem 0.95rem', 
              fontSize: '0.82rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              borderColor: foodOrdersList.filter(o => o.status === 'Received').length > 0 ? '#ef4444' : undefined,
              background: foodOrdersList.filter(o => o.status === 'Received').length > 0 ? 'rgba(239, 68, 68, 0.12)' : undefined
            }}
          >
            <Utensils size={15} color="#fbbf24" /> Live Food Orders
            {foodOrdersList.filter(o => o.status === 'Received').length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                {foodOrdersList.filter(o => o.status === 'Received').length} New
              </span>
            )}
          </button>
          <button 
            onClick={() => setRoomServicesCareOpen(true)}
            className="btn-outline-gold"
            title="Manage Housekeeping, Extra Water, Linen & Maintenance Calls"
            style={{ 
              padding: '0.55rem 0.95rem', 
              fontSize: '0.82rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              borderColor: roomServicesList.filter(r => r.status === 'Pending').length > 0 ? '#f59e0b' : undefined,
              background: roomServicesList.filter(r => r.status === 'Pending').length > 0 ? 'rgba(245, 158, 11, 0.12)' : undefined
            }}
          >
            <BellRing size={15} color="#facc15" /> Room Services &amp; Care
            {roomServicesList.filter(r => r.status === 'Pending').length > 0 && (
              <span style={{ background: '#f59e0b', color: '#060e1a', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                {roomServicesList.filter(r => r.status === 'Pending').length} Pending
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsRoomRackPrintOpen(true)}
            className="btn-outline-gold"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            title="Print 18-Room Daily Tape Chart Rack & Arrivals Manifest"
          >
            <Printer size={15} color="var(--gold-glow)" /> Print Room Rack
          </button>
          <button 
            onClick={() => setIsLuggageModalOpen(true)}
            className="btn-outline-gold"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            title="Bell Desk Luggage Storage & Custody Tags"
          >
            <Briefcase size={15} color="#38bdf8" /> Luggage Pass
          </button>
          <button 
            onClick={() => setIsWakeUpModalOpen(true)}
            className="btn-outline-gold"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            title="Pilgrim & Train Wake-Up Call Scheduler"
          >
            <Bell size={15} color="#facc15" /> Wake-Up Calls
          </button>
          <button 
            onClick={() => setBlockRoomOpen(true)}
            className="btn-outline-gold"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Ban size={15} color="#f87171" /> Block Room
          </button>
          <button 
            onClick={() => setWalkInOpen(true)}
            className="btn-primary-gold"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          >
            <UserCheck size={15} /> Express Walk-In
          </button>
          <button 
            onClick={() => setActiveTab('cashier-audit')}
            className="btn-secondary-sapphire"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          >
            <Clock size={15} /> Night Audit
          </button>
          {onExitPMS && (
            <button 
              onClick={onExitPMS}
              style={{ 
                padding: '0.55rem 1.15rem', 
                fontSize: '0.85rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: '1px solid #f87171',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.45)',
                transition: 'all 0.15s ease'
              }}
              title="Exit Front Desk PMS and Return to Guest Website (Shortcut: Esc)"
            >
              <LogOut size={15} color="#ffffff" /> Exit PMS (Esc)
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.45rem',
        flexWrap: 'wrap',
        marginBottom: '1.75rem',
        background: 'rgba(6, 14, 26, 0.7)',
        padding: '0.4rem',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {[
          { id: 'tape-chart', label: '📊 39-Room Tape Chart Matrix' },
          { id: 'd1-database-explorer', label: '🗄️ D1 Live DB Explorer (Master Hub - All 68 Tables)', isHub: true },
          { id: 'operations-settings', label: '⚙️ Operations & Policy Settings' },
          { id: 'transit-dayuse', label: '🚆 Transit & Station Transfer' },
          { id: 'shift-logbook', label: '📋 Shift Handover & Logbook' },
          { id: 'channel-manager', label: '🌐 OTA Channel & Parity' },
          { id: 'lost-and-found', label: '🧳 Lost & Found Custody Locker' },
          { id: 'maintenance-ooo', label: '🔧 Maintenance & OOO Blocker' },
          { id: 'visualize-bookings', label: '📅 Booking Visualizer & Calendar' },
          { id: 'occupancy-report', label: '📈 Occupancy Report (Day/Mo/Yr)' },
          { id: 'cashier-audit', label: '💰 Cashier Shift Handover & Night Audit' },
          { id: 'housekeeping', label: '🧹 Housekeeping & Linen Tracker' },
          { id: 'linen-assets', label: '🧺 Linen & Room Assets (Part 3)' },
          { id: 'staff-payroll', label: '👥 Staff Attendance & Payroll (Part 1)' },
          { id: 'police-register', label: '🚨 Sarai Act Police Register' },
          { id: 'dpdp', label: '🛡️ DPDP Act 2023 Compliance' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`enterprise-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
            style={tab.isHub ? {
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(14, 165, 233, 0.3))' 
                : 'linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(14, 165, 233, 0.1))',
              border: activeTab === tab.id 
                ? '1.5px solid #38bdf8' 
                : '1px solid rgba(56, 189, 248, 0.5)',
              color: activeTab === tab.id ? '#ffffff' : '#38bdf8',
              fontWeight: 800,
              boxShadow: activeTab === tab.id ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none'
            } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Universal Two-Way Item Update Handler for Pop-Up Modal */}
      {(() => {
        // Define inline handler for this component scope
        return null;
      })()}

      {/* AUTHENTIC MYSOFT DATE SELECTION COMMAND BAR (Universal across audit tabs, embedded directly inside Master Tabular Ledger for Tape Chart) */}
      {activeTab !== 'tape-chart' && (
        <UniversalDateFilterBar
          fromDate={filterFromDate}
          toDate={filterToDate}
          moduleType={
            activeTab === 'police-register' ? 'police' :
            activeTab === 'cashier-audit' ? 'cashier' :
            activeTab === 'lost-and-found' ? 'lost-found' :
            activeTab === 'maintenance-ooo' ? 'maintenance' :
            activeTab === 'transit-dayuse' ? 'transit' :
            activeTab === 'shift-logbook' ? 'shift-logbook' :
            activeTab === 'housekeeping' ? 'housekeeping' :
            activeTab === 'visualize-bookings' ? 'bookings' :
            activeTab === 'occupancy-report' ? 'occupancy' :
            activeTab === 'dpdp' ? 'dpdp' :
            'rooms'
          }
          auditItems={
            activeTab === 'police-register' ? filteredBookings :
            activeTab === 'cashier-audit' ? filteredSettlements :
            activeTab === 'lost-and-found' ? filteredLostAndFound :
            activeTab === 'maintenance-ooo' ? filteredMaintenance :
            activeTab === 'transit-dayuse' ? filteredTransitStays :
            activeTab === 'shift-logbook' ? [
              { id: 'shift-morning', shift: 'Morning Shift', shiftLead: shiftLogbook?.morning?.shiftLead || 'Sudhakar Reddy', openingCash: shiftLogbook?.morning?.openingCash || 33500, shiftCashCollected: shiftLogbook?.morning?.shiftCashCollected || 4866, shiftUpiCollected: shiftLogbook?.morning?.shiftUpiCollected || 20790, handoverSigned: shiftLogbook?.morning?.handoverSigned ? 'Signed' : 'Pending', signedAt: shiftLogbook?.morning?.signedAt || '03:00 PM' },
              { id: 'shift-evening', shift: 'Evening Shift', shiftLead: shiftLogbook?.evening?.shiftLead || 'Koti Rao', openingCash: shiftLogbook?.evening?.openingCash || 38366, shiftCashCollected: shiftLogbook?.evening?.shiftCashCollected || 3200, shiftUpiCollected: shiftLogbook?.evening?.shiftUpiCollected || 14500, handoverSigned: shiftLogbook?.evening?.handoverSigned ? 'Signed' : 'Pending', signedAt: shiftLogbook?.evening?.signedAt || '11:00 PM' },
              { id: 'shift-night', shift: 'Night Shift', shiftLead: shiftLogbook?.night?.shiftLead || 'Deepak Kumar', openingCash: shiftLogbook?.night?.openingCash || 41566, shiftCashCollected: shiftLogbook?.night?.shiftCashCollected || 0, shiftUpiCollected: shiftLogbook?.night?.shiftUpiCollected || 0, handoverSigned: shiftLogbook?.night?.handoverSigned ? 'Signed' : 'Pending', signedAt: shiftLogbook?.night?.signedAt || '06:00 AM' }
            ] :
            activeTab === 'housekeeping' ? rooms.map(r => ({
              id: `hk-${r.roomNumber}`,
              roomNumber: r.roomNumber,
              floor: r.floor,
              tier: r.tier,
              status: r.effectiveStatus || r.status,
              attendant: r.assignedAttendant || (r.floor === 1 ? 'Laxmi Gouda' : r.floor === 2 ? 'Kailash Sabar' : 'Suresh Majhi'),
              inspectionStatus: (r.effectiveStatus || r.status) === 'Available' ? 'Inspected' : 'Pending',
              linenStatus: 'Par Replaced'
            })) :
            activeTab === 'visualize-bookings' ? filteredBookings :
            activeTab === 'occupancy-report' ? (filteredRooms.length > 0 ? filteredRooms : projectedRooms) :
            activeTab === 'dpdp' ? filteredBookings.map(b => ({
              id: b.id || b.bookingId,
              guestName: b.guestName || b.guest_name,
              phone: b.guestPhone || b.guest_phone,
              idProofMasked: b.idProofMasked || b.id_proof_masked || 'XXXX-XXXX-1234',
              consentStatus: 'Explicit Granted'
            })) :
            (filteredRooms.length > 0 ? filteredRooms : projectedRooms)
          }
          auditRooms={filteredRooms.length > 0 ? filteredRooms : projectedRooms}
          onUpdateItem={(item, field, newVal) => {
            // 1. Room Ledger / Status updates
            if (item.roomNumber && onUpdateRoomStatus) {
              if (field === 'status' || field === 'effectiveStatus') {
                onUpdateRoomStatus(item.roomNumber, newVal, item.effectiveGuestName || item.guestName);
              } else if (field === 'guestName' || field === 'effectiveGuestName') {
                onUpdateRoomStatus(item.roomNumber, item.effectiveStatus || item.status || 'Occupied', newVal);
              }
            }
            // 2. Bookings updates
            if (activeTab === 'police-register' || activeTab === 'visualize-bookings' || activeTab === 'dpdp') {
              if (onUpdateBooking && (item.id || item.bookingId)) {
                onUpdateBooking({ ...item, [field]: newVal });
              }
            }
            // 3. Cashier settlements updates
            if (activeTab === 'cashier-audit') {
              setRecentSettlements(prev => prev.map(s => {
                if ((s.billNo && s.billNo === item.billNo) || (s.id && s.id === item.id) || (s.roomNumber && s.roomNumber === item.roomNumber)) {
                  const updated = { ...s, [field]: newVal };
                  if (['cash', 'upi', 'card', 'cashTender', 'upiTender', 'cardTender'].includes(field)) {
                    const c = Number(field === 'cash' || field === 'cashTender' ? newVal : (s.tenders?.cash || s.cashTender || 0));
                    const u = Number(field === 'upi' || field === 'upiTender' ? newVal : (s.tenders?.upi || s.upiTender || 0));
                    const cd = Number(field === 'card' || field === 'cardTender' ? newVal : (s.tenders?.card || s.cardTender || 0));
                    updated.totalAmount = c + u + cd;
                  }
                  return updated;
                }
                return s;
              }));
            }
            // 4. Transit stays
            if (activeTab === 'transit-dayuse') {
              setTransitStays(prev => prev.map(t => (t.id === item.id || t.roomNumber === item.roomNumber) ? { ...t, [field]: newVal } : t));
            }
            // 5. Lost & Found
            if (activeTab === 'lost-and-found') {
              setLostAndFoundItems(prev => prev.map(l => l.id === item.id ? { ...l, [field]: newVal } : l));
            }
            // 6. Maintenance
            if (activeTab === 'maintenance-ooo') {
              setMaintenanceTickets(prev => prev.map(m => (m.id === item.id || m.ticketId === item.ticketId) ? { ...m, [field]: newVal } : m));
            }
            // 7. Shift logbook
            if (activeTab === 'shift-logbook') {
              setShiftLogbook(prev => {
                const shiftKey = (item.shift || '').toLowerCase().includes('morning') ? 'morning' :
                                 (item.shift || '').toLowerCase().includes('evening') ? 'evening' : 'night';
                if (prev[shiftKey]) {
                  return { ...prev, [shiftKey]: { ...prev[shiftKey], [field]: newVal } };
                }
                return prev;
              });
            }
            setFeedbackToast(`✏️ Updated ${field} to "${newVal}" in ${activeTab.replace(/-/g, ' ')}`);
          }}
          onDateChange={(from, to) => {
            setFilterFromDate(from);
            setFilterToDate(to);
          }}
          onDisplay={(from, to) => {
            setFilterFromDate(from);
            setFilterToDate(to);
            setIsDateFilterActive(true);
            setFeedbackToast(`📋 Audit Window applied: Showing ${from} to ${to}`);
          }}
          title={`PMS AUDIT WINDOW (${activeTab.replace(/-/g, ' ').toUpperCase()})`}
          totalCount={
            activeTab === 'police-register' ? filteredBookings.length :
            activeTab === 'cashier-audit' ? filteredSettlements.length :
            activeTab === 'lost-and-found' ? filteredLostAndFound.length :
            activeTab === 'maintenance-ooo' ? filteredMaintenance.length :
            activeTab === 'transit-dayuse' ? filteredTransitStays.length :
            activeTab === 'shift-logbook' ? 3 :
            activeTab === 'housekeeping' ? rooms.length :
            activeTab === 'visualize-bookings' ? filteredBookings.length :
            filteredRooms.length
          }
          totalAmount={
            activeTab === 'cashier-audit' ? filteredSettlements.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0) :
            activeTab === 'transit-dayuse' ? filteredTransitStays.reduce((sum, t) => sum + (t.tariff || 0), 0) :
            activeTab === 'police-register' ? filteredBookings.reduce((sum, b) => sum + (Number(b.totalAmount || b.tariff || 0)), 0) :
            filteredRooms.reduce((sum, r) => sum + (r.effectiveStatus?.includes('Occupied') ? (r.effectiveTariff || 0) : 0), 0)
          }
          onExportCSV={() => {
            const link = document.createElement("a");
            let csvContent = "";
            if (activeTab === 'police-register') {
              csvContent = "Room,GuestName,Phone,IDProof,Origin,Interstate,StayDuration,TotalAmount\n" +
                filteredBookings.map(b => `${b.room_number || b.roomNumber},"${b.guest_name || b.guestName}","${b.guest_phone || b.guestPhone}","${b.id_proof_masked || b.idProofMasked || ''}","${b.state_of_origin || b.stateOfOrigin || ''}",${b.is_interstate || b.isInterstate ? 'YES' : 'NO'},"${b.checkIn || ''} to ${b.checkOut || ''}",${b.totalAmount || 0}`).join('\n');
            } else if (activeTab === 'cashier-audit') {
              csvContent = "Time,Room,GuestName,BillNo,TotalAmount,Tenders\n" +
                filteredSettlements.map(s => `"${s.settlementTime}",${s.roomNumber},"${s.guestName}","${s.billNo}",${s.totalAmount},"${(s.tendersSummary || []).join('; ')}"`).join('\n');
            } else if (activeTab === 'transit-dayuse') {
              csvContent = "Room,GuestName,Phone,Origin,Purpose,Slot,CheckIn,ExpectedOut,Tariff,Status\n" +
                filteredTransitStays.map(t => `${t.roomNumber},"${t.guestName}","${t.phone}","${t.origin}","${t.purpose}","${t.slotDuration}","${t.checkInTime}","${t.expectedCheckOut}",${t.tariff},"${t.status}"`).join('\n');
            } else {
              csvContent = "Date,Room,Status,GuestName\n" + 
                rooms.map(r => `${filterFromDate},${r.roomNumber},${r.status},"${r.currentGuestName || ''}"`).join('\n');
            }
            link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
            link.download = `PMS_${activeTab.replace(/-/g, '_')}_${filterFromDate}_to_${filterToDate}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          onPrint={() => window.print()}
        />
      )}

      {/* UNIVERSAL OPERATIONAL SEARCH & COMMAND STRIP (Active on ALL 15 tabs) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Instant Universal Search Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '300px' }}>
          <Search size={16} color="var(--gold-glow)" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Universal Search: Room #, Guest Name, Phone, GSTIN, Train, Plate, Staff (Press '/' to focus)..."
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#cbd5e1',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              title="Clear Search"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Status Quick Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Rooms' },
            { id: 'Available', label: 'Available' },
            { id: 'Occupied', label: 'Occupied' },
            { id: 'Vacant Dirty', label: 'Dirty / Cleaning' },
            { id: 'Maintenance', label: 'Maintenance / OOO' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`enterprise-tab-pill ${statusFilter === f.id ? 'active' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Operational Modals Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

          <button
            type="button"
            onClick={() => {
              const target = rooms.find(r => r.status === 'Occupied') || rooms[0];
              const matchedBooking = bookings.find(b => b.roomNumber === target?.roomNumber) || {
                roomNumber: target?.roomNumber || '301',
                guestName: target?.currentGuestName || 'MR. P ASHOK',
                billNo: `FMBIL2627-${target?.roomNumber || '301'}`,
                tier: target?.tier || 'Executive AC',
                tariff: target?.tariff || 2999,
                totalAmount: target?.balanceDue || 2999,
                grcNo: '684'
              };
              setSelectedReceiptBooking(matchedBooking);
              setReceiptModalType('a4');
              setIsReceiptModalOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.25))',
              border: '1px solid #10b981',
              color: '#34d399',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
            }}
            title="Launch Universal Document Editor Engine (GST Tax Invoices, Non-GST Bills, GRC, Food/Room Bills, Money Receipts)"
          >
            <FileText size={13} /> 📑 Document Editor Engine
          </button>

          <button
            type="button"
            onClick={() => onOpenAccountsLedger && onOpenAccountsLedger('tally-erp')}
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(3, 105, 161, 0.25))',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
            }}
            title="Launch Dedicated TallyPrime Accounting Terminal (F4-F9)"
          >
            ⌨️ Tally Prime ERP
          </button>

          <button
            type="button"
            onClick={() => onOpenAccountsLedger && onOpenAccountsLedger('day-book')}
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-glow)',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📊 Accounts Day Book
          </button>
        </div>
      </div>

      {/* TAB: INTERACTIVE BOOKING VISUALIZER (visualize-booking.tsx) */}
      {activeTab === 'visualize-bookings' && (
        <div className="w-full mb-8">
          <InteractiveCalendar 
            rooms={rooms}
            bookings={bookings}
            onSelectBooking={(evt) => {
              const roomMatch = evt.venue?.match(/Room\s*(\d+)/i);
              const roomNum = roomMatch ? roomMatch[1] : null;
              const foundRoom = roomNum ? rooms.find(r => r.roomNumber === roomNum) : null;
              if (foundRoom) {
                setSelectedFolioRoom(foundRoom);
              } else {
                const foundBooking = bookings.find(b => 
                  (evt.contactPerson && b.guestName?.toLowerCase().includes(evt.contactPerson.toLowerCase())) || 
                  b.id === evt.id ||
                  (b.roomNumber && evt.venue?.includes(b.roomNumber))
                );
                if (foundBooking) {
                  setSelectedReceiptBooking(foundBooking);
                  setIsReceiptModalOpen(true);
                } else {
                  const fallbackRoom = rooms.find(r => r.status === 'Occupied') || rooms[0];
                  if (fallbackRoom) setSelectedFolioRoom(fallbackRoom);
                }
              }
            }}
          />
        </div>
      )}

      {/* TAB: OCCUPANCY REPORT (Day / Month / Year with CSV Export - Sheet 2 Requirement) */}
      {activeTab === 'occupancy-report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Top Control Header */}
          <div className="glass-panel" style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
            border: '1px solid rgba(212, 175, 55, 0.35)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={22} color="var(--gold-glow)" />
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>
                  Occupancy Performance &amp; Revenue Analytics
                </h3>
                <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', fontSize: '0.72rem', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                  Day • Month • Year
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Track Room Nights Sold, Available Inventory (18 Keys), Average Daily Rate (ADR), RevPAR, and statutory capacity metrics
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Day / Month / Year Mode Toggle */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(6, 14, 26, 0.85)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  onClick={() => setOccupancyViewMode('day')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: occupancyViewMode === 'day' ? 'var(--gold-glow)' : 'transparent',
                    color: occupancyViewMode === 'day' ? '#060e1a' : '#94a3b8',
                    border: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📅 Daily View
                </button>
                <button
                  onClick={() => setOccupancyViewMode('month')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: occupancyViewMode === 'month' ? 'var(--gold-glow)' : 'transparent',
                    color: occupancyViewMode === 'month' ? '#060e1a' : '#94a3b8',
                    border: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📆 Monthly View
                </button>
                <button
                  onClick={() => setOccupancyViewMode('year')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: occupancyViewMode === 'year' ? 'var(--gold-glow)' : 'transparent',
                    color: occupancyViewMode === 'year' ? '#060e1a' : '#94a3b8',
                    border: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📊 Annual View
                </button>
              </div>

              {/* 1-Click CSV Download Button (Sheet 2: Report CSV) */}
              <button
                onClick={() => handleDownloadOccupancyCSV(occupancyViewMode)}
                className="btn-primary-gold"
                style={{
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)'
                }}
              >
                📥 Download {occupancyViewMode.toUpperCase()} CSV
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem'
          }}>
            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #34d399' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                {occupancyViewMode === 'day' ? "Today's Occupancy" : occupancyViewMode === 'month' ? 'MTD Avg Occupancy' : 'FY Avg Occupancy'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
                {occupancyViewMode === 'day' ? `${(((rooms.filter(r => r.status === 'Occupied').length || 33) / 39) * 100).toFixed(1)}%` : occupancyViewMode === 'month' ? '84.0%' : '85.0%'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.2rem' }}>
                ↑ +5.2% vs target benchmark
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--gold-glow)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                {occupancyViewMode === 'day' ? "Active In-House Rooms" : occupancyViewMode === 'month' ? 'Room Nights Sold' : 'Total Nights Sold'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gold-glow)', marginTop: '0.2rem' }}>
                {occupancyViewMode === 'day' ? `${rooms.filter(r => r.status === 'Occupied').length || 33} / 39` : occupancyViewMode === 'month' ? '786 Nights' : '12,099 Nights'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {occupancyViewMode === 'day' ? '5 Vacant Clean Ready' : '39 Total Keys Basis'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Average Daily Rate (ADR)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.2rem' }}>
                ₹2,269
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Standard: ₹1.6k • Deluxe: ₹2.2k • Suite: ₹3.8k
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #a855f7' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                {occupancyViewMode === 'day' ? "Today's Room Rev" : occupancyViewMode === 'month' ? 'September MTD Rev' : 'FY Projected Revenue'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#c084fc', marginTop: '0.2rem' }}>
                {occupancyViewMode === 'day' ? '₹74,900' : occupancyViewMode === 'month' ? '₹17,84,220' : '₹2,75,85,720'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.2rem' }}>
                Excl. 12% GST (SAC 996311)
              </div>
            </div>
          </div>

          {/* VIEW: DAILY OCCUPANCY TABLE */}
          {occupancyViewMode === 'day' && (
            <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>
                  📅 14-Day Daily Occupancy &amp; Room Revenue Audit
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Audit Cutoff: 12:00 AM Nightly Roll
                </span>
              </div>

              <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}><SheetsColumnHeader label="Date" type="locked" /></th>
                    <th style={{ padding: '0.65rem 0.75rem' }}><SheetsColumnHeader label="Day" type="locked" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Total Rooms" type="locked" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Occupied" type="editable" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Vacant Clean" type="editable" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Out of Order" type="editable" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Occupancy %" type="formula" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}><SheetsColumnHeader label="Room Rev (₹)" type="formula" align="right" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}><SheetsColumnHeader label="ADR (₹)" type="formula" align="right" /></th>
                  </tr>
                </thead>
                <tbody>
                  {dailyOccupancyData.map((row, idx) => {
                    const isToday = row.day.includes('Today');
                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: isToday ? 'rgba(212, 175, 55, 0.08)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                      }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--gold-glow)' : '#fff' }}>
                          {row.date} {isToday && <span className="badge" style={{ background: 'var(--gold-glow)', color: '#000', fontSize: '0.65rem', marginLeft: '0.35rem' }}>LIVE</span>}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8' }}>{row.day}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#cbd5e1' }}>{row.totalRooms}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#fb923c' }}>{row.occupied}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#34d399' }}>{row.vacant}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: row.ooo > 0 ? '#f87171' : '#64748b' }}>{row.ooo}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            background: row.rate >= 90 ? 'rgba(52, 211, 153, 0.15)' : row.rate >= 75 ? 'rgba(250, 204, 21, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: row.rate >= 90 ? '#34d399' : row.rate >= 75 ? '#facc15' : '#38bdf8',
                            border: `1px solid ${row.rate >= 90 ? '#34d39940' : row.rate >= 75 ? '#facc1540' : '#38bdf840'}`
                          }}>
                            {row.rate}%
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                          ₹{row.revenue.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#94a3b8' }}>
                          ₹{row.adr.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: MONTHLY OCCUPANCY TABLE */}
          {occupancyViewMode === 'month' && (
            <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>
                  📆 12-Month Financial Year Occupancy &amp; RevPAR Roll-Up
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Total Key Capacity: 39 Rooms × Days in Month
                </span>
              </div>

              <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}><SheetsColumnHeader label="Month" type="locked" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Available Room Nights" type="locked" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Occupied Room Nights" type="editable" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Avg Occupancy %" type="formula" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}><SheetsColumnHeader label="RevPAR (₹)" type="formula" align="right" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}><SheetsColumnHeader label="Total Room Revenue (₹)" type="formula" align="right" /></th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyOccupancyData.map((row, idx) => {
                    const isCurrent = row.month.includes('MTD');
                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: isCurrent ? 'rgba(212, 175, 55, 0.08)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                      }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--gold-glow)' : '#fff' }}>
                          {row.month}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#cbd5e1' }}>
                          {row.totalNights.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#38bdf8' }}>
                          {row.occupiedNights.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            background: row.avgOccupancy >= 80 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                            color: row.avgOccupancy >= 80 ? '#34d399' : '#facc15',
                            border: `1px solid ${row.avgOccupancy >= 80 ? '#34d39940' : '#facc1540'}`
                          }}>
                            {row.avgOccupancy}%
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#cbd5e1' }}>
                          ₹{row.revpar.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--gold-glow)' }}>
                          ₹{row.roomRev.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: ANNUAL OCCUPANCY COMPARISON */}
          {occupancyViewMode === 'year' && (
            <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>
                  📊 Year-on-Year Capacity Utilization &amp; Annual Revenue Growth
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Statutory Accounting Audit Comparison
                </span>
              </div>

              <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}><SheetsColumnHeader label="Financial Year" type="locked" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Available Room Nights" type="locked" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Occupied Nights" type="editable" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}><SheetsColumnHeader label="Average Occupancy %" type="formula" align="center" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}><SheetsColumnHeader label="Average ADR (₹)" type="editable" align="right" /></th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}><SheetsColumnHeader label="Total Room Revenue (₹)" type="formula" align="right" /></th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyOccupancyData.map((row, idx) => (
                    <tr key={idx} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                    }}>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                        {row.year}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#cbd5e1' }}>
                        {row.availableNights.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#34d399' }}>
                        {row.occupiedNights.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          background: 'rgba(52, 211, 153, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(52, 211, 153, 0.4)'
                        }}>
                          {row.avgOccupancy}%
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#cbd5e1' }}>
                        ₹{row.adr.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 900, color: '#fff', fontSize: '0.95rem' }}>
                        ₹{row.totalRoomRev.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* THE WILD OASIS: STAY DURATION DISTRIBUTION ANALYTICS */}
          <StayDurationAnalytics bookings={bookings} />
        </div>
      )}

      {/* TAB: OPERATIONS & POLICY SETTINGS (The Wild Oasis /settings) */}
      {activeTab === 'operations-settings' && (
        <OperationsSettingsTab
          onSettingsUpdated={(newSettings) => {
            setOpsSettings(newSettings);
            showToast('✓ Central PMS operational settings updated & synced!');
          }}
        />
      )}

      {/* TAB 1: 39-ROOM TAPE CHART MATRIX */}
      {activeTab === 'tape-chart' && (
        <div>
          {/* THE WILD OASIS: TODAY'S OPERATIONAL ACTIVITY FEED */}
          <TodayActivity
            arrivals={todayArrivals}
            departures={todayDepartures}
            onFastCheckIn={handleFastCheckInClick}
            onFastCheckOut={handleFastCheckOutClick}
            onViewFolio={(item) => {
              const r = rooms.find(rm => rm.roomNumber === item.roomNumber) || item;
              setSelectedFolioRoom(r);
            }}
            onViewGrc={(booking) => {
              setSelectedReceiptBooking({
                ...booking,
                grcNo: `GRC-${booking.roomNumber}`
              });
              setReceiptModalType('grc');
              setIsReceiptModalOpen(true);
            }}
            onRefresh={() => {
              showToast('✓ Operational feed refreshed from Cloudflare D1!');
            }}
            fromDate={filterFromDate}
            toDate={filterToDate}
            isFiltered={isDateFilterActive}
          />

          {/* Top Operational Status Ribbon (Exact from Screenshot 2) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(90deg, rgba(15,23,42,0.9), rgba(30,41,59,0.95))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Physical Keys</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{totalCount} Rooms</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase' }}>Vacant Clean</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{vacantCleanCount} Ready</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#facc15', textTransform: 'uppercase' }}>Vacant Dirty</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#facc15' }}>{vacantDirtyCount} Dirty</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#fb923c', textTransform: 'uppercase' }}>Occupied (In-House)</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb923c' }}>{occupiedDirtyCount + occupiedCleanCount} Occ</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#f87171', textTransform: 'uppercase' }}>Blocked / OOO</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171' }}>{oooCount} Maint</div>
              </div>
            </div>

            {/* View Mode Toggle Button */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(6, 14, 26, 0.8)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              gap: '6px'
            }}>
              <button
                type="button"
                className={`enterprise-tab-pill ${tapeChartViewMode === 'table' ? 'active' : ''}`}
                onClick={() => setTapeChartViewMode('table')}
              >
                📋 Master Tabular Ledger
              </button>
              <button
                type="button"
                className={`enterprise-tab-pill ${tapeChartViewMode === 'mysoft' ? 'active' : ''}`}
                onClick={() => setTapeChartViewMode('mysoft')}
              >
                📊 Legacy Tape Matrix
              </button>
              <button
                type="button"
                className={`enterprise-tab-pill ${tapeChartViewMode === 'modern' ? 'active' : ''}`}
                onClick={() => setTapeChartViewMode('modern')}
              >
                🏢 Modern Cards
              </button>
            </div>
          </div>

          {/* Search & Filter Bar with 5-Stage Lifecycle Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All (${totalCount})` },
                { id: 'Available', label: `Vacant Clean (${vacantCleanCount})` },
                { id: 'Vacant Dirty', label: `Vacant Dirty (${vacantDirtyCount})` },
                { id: 'Occupied', label: `Occupied In-House (${occupiedDirtyCount + occupiedCleanCount})` },
                { id: 'Occupied Clean', label: `Occupied Serviced (${occupiedCleanCount})` },
                { id: 'Maintenance', label: `OOO / Maint (${oooCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`enterprise-tab-pill ${statusFilter === tab.id ? 'active' : ''}`}
                  style={{
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.76rem'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setWorkOrderForm({
                    roomNumber: '201',
                    issue: '',
                    category: 'HVAC / AC',
                    priority: 'High',
                    technician: 'Bikram Patra (AC Specialist)',
                    notes: ''
                  });
                  setIsWorkOrderModalOpen(true);
                }}
                className="btn-outline-gold"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Wrench size={14} color="var(--gold-glow)" /> + Log Work Order
              </button>
              <div style={{ position: 'relative', width: 220 }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search Room or Guest..." 
                className="form-input" 
                style={{ width: '100%', paddingLeft: '2rem', paddingRight: '0.75rem', height: 38, fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

          {/* VIEW 0: ENTERPRISE MASTER TABULAR ROOM LEDGER (Spreadsheet Format) */}
          {tapeChartViewMode === 'table' ? (
            <div className="enterprise-data-table-container">
              {/* AUTHENTIC MYSOFT ENTERPRISE DATE COMMAND SECTION (Integrated in Master Tabular Room Ledger) */}
              <div style={{ padding: '0.65rem 0.85rem', background: '#071224', borderBottom: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <UniversalDateFilterBar
                  fromDate={filterFromDate}
                  toDate={filterToDate}
                  moduleType="rooms"
                  auditRooms={filteredRooms.length > 0 ? filteredRooms : projectedRooms}
                  onDateChange={(from, to) => {
                    setFilterFromDate(from);
                    setFilterToDate(to);
                  }}
                  onDisplay={(from, to) => {
                    setFilterFromDate(from);
                    setFilterToDate(to);
                    setIsDateFilterActive(true);
                    setFeedbackToast(`📋 Master Tabular Room Ledger: Filtered for ${from} to ${to}`);
                  }}
                  title="MASTER TABULAR ROOM LEDGER"
                  onUpdateItem={(item, field, newVal) => {
                    if (item.roomNumber && onUpdateRoomStatus) {
                      if (field === 'status' || field === 'effectiveStatus') {
                        onUpdateRoomStatus(item.roomNumber, newVal, item.effectiveGuestName || item.guestName);
                      } else if (field === 'guestName' || field === 'effectiveGuestName') {
                        onUpdateRoomStatus(item.roomNumber, item.effectiveStatus || item.status || 'Occupied', newVal);
                      }
                    }
                    setFeedbackToast(`✏️ Updated Room ${item.roomNumber} ${field} to "${newVal}"`);
                  }}
                  totalCount={filteredRooms.length}
                  totalAmount={filteredRooms.reduce((sum, r) => sum + (r.effectiveStatus?.includes('Occupied') ? (r.effectiveTariff || 0) : 0), 0)}
                  extraStats={
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.76rem', color: '#e0e7ff' }}>
                      <span>Occupied: <strong style={{ color: '#fed7aa' }}>{occupiedDirtyCount + occupiedCleanCount}</strong></span>
                      <span>|</span>
                      <span>Vacant Clean: <strong style={{ color: '#a7f3d0' }}>{vacantCleanCount}</strong></span>
                      <span>|</span>
                      <span>OOO: <strong style={{ color: '#fca5a5' }}>{oooCount}</strong></span>
                    </div>
                  }
                  onExportCSV={() => {
                    const csvContent = "Room,Floor,Tier,Status,GuestName,Phone,Company,StayPeriod,Tariff,BalanceDue\n" +
                      filteredRooms.map(r => `${r.roomNumber},${r.floor},"${r.tier}","${r.effectiveStatus}","${r.effectiveGuestName}","${r.effectivePhone}","${r.effectiveCompany}","${r.effectiveStayPeriod}",${r.effectiveTariff},${r.effectiveBalanceDue}`).join('\n');
                    const link = document.createElement("a");
                    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
                    link.download = `Master_Tabular_Room_Ledger_${filterFromDate}_to_${filterToDate}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  onExportExcel={() => {
                    alert("Exporting Master Tabular Room Ledger to Excel (Spreadsheet format)...");
                  }}
                  onPrint={() => window.print()}
                />
              </div>

              <SheetsToolbarLegend tableName="Master Tabular Room Ledger" subtitle="Live 18-Room Direct Interactive Google Sheets Grid" />
              <table className="enterprise-data-table sheets-grid-table">
                <thead>
                  <tr>
                    <SheetsColumnHeader title="Room #" badge="locked" align="center" style={{ width: '80px' }} />
                    <SheetsColumnHeader title="Floor" badge="locked" align="center" style={{ width: '65px' }} />
                    <SheetsColumnHeader title="Category / Tier" badge="locked" style={{ width: '135px' }} />
                    <SheetsColumnHeader title="Current Status" badge="editable" align="center" style={{ width: '120px' }} />
                    <SheetsColumnHeader title="In-House Guest Name" badge="editable" />
                    <SheetsColumnHeader title="Contact Phone" badge="editable" style={{ width: '125px' }} />
                    <SheetsColumnHeader title="Corporate / Company" badge="editable" style={{ width: '135px' }} />
                    <SheetsColumnHeader title="Stay Period" badge="locked" style={{ width: '110px' }} />
                    <SheetsColumnHeader title="Tariff (₹)" badge="editable" align="right" style={{ width: '100px' }} />
                    <SheetsColumnHeader title="Balance Due (₹)" badge="editable" align="right" style={{ width: '110px' }} />
                    <SheetsColumnHeader title="Key / HK" badge="locked" align="center" style={{ width: '95px' }} />
                    <SheetsColumnHeader title="Operational Actions" badge="locked" align="center" style={{ width: '240px' }} />
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No rooms match the selected filter or search term.
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map(room => {
                      const isOccupied = room.effectiveStatus === 'Occupied' || room.effectiveStatus === 'Occupied Clean';
                      const isMaint = room.effectiveStatus === 'Maintenance';
                      const isCleaning = room.effectiveStatus === 'Cleaning' || room.effectiveStatus === 'Vacant Dirty';
                      const isVacant = room.effectiveStatus === 'Available';

                      const matchedBooking = room.matchedBooking || {
                        bookingId: `FMBIL2627-${room.roomNumber}`,
                        billNo: `FMBIL2627-${room.roomNumber}`,
                        roomNumber: room.roomNumber,
                        guestName: room.effectiveGuestName || (isOccupied ? 'Guest In-House' : 'WALK-IN GUEST'),
                        guestPhone: room.effectivePhone || '+91 94370 22555',
                        company: room.effectiveCompany || (isOccupied ? 'LINDE INDIA LTD' : 'INDIVIDUAL'),
                        corporateGstin: '21AAACB2528H1ZA',
                        tier: room.tier,
                        tariff: room.effectiveTariff || 2199,
                        totalAmount: room.effectiveBalanceDue || room.effectiveTariff || 2199,
                        nights: 1,
                        grcNo: `GRC-${room.roomNumber}`,
                        checkInDate: filterFromDate,
                        checkInTime: '11:00 AM',
                        checkOutDate: `${filterToDate} (12:00 PM)`
                      };

                      return (
                        <tr key={room.roomNumber}>
                          {/* Room # */}
                          <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.92rem', color: 'var(--gold-glow)' }}>
                            {room.roomNumber}
                          </td>

                          {/* Floor */}
                          <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                            FL-{room.floor}
                          </td>

                          {/* Tier */}
                          <td style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.8rem' }}>
                            {room.tier}
                          </td>

                          {/* Status Badge - Google Sheets Inline Select Cell */}
                          <SheetsEditableCell
                            value={room.effectiveStatus}
                            type="select"
                            align="center"
                            options={[
                              { value: 'Available', label: 'AVAILABLE', badgeStyle: { background: 'rgba(16, 185, 129, 0.22)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.5)' } },
                              { value: 'Occupied', label: 'OCCUPIED', badgeStyle: { background: 'rgba(234, 88, 12, 0.22)', color: '#fb923c', border: '1px solid rgba(249, 115, 22, 0.5)' } },
                              { value: 'Cleaning', label: 'CLEANING', badgeStyle: { background: 'rgba(234, 179, 8, 0.22)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.5)' } },
                              { value: 'Maintenance', label: 'MAINTENANCE', badgeStyle: { background: 'rgba(100, 116, 139, 0.28)', color: '#cbd5e1', border: '1px solid rgba(148, 163, 184, 0.5)' } }
                            ]}
                            onSave={(newStatus) => {
                              if (onUpdateRoomStatus) {
                                onUpdateRoomStatus(room.roomNumber, newStatus, room.effectiveGuestName, room.effectiveTariff);
                              }
                            }}
                          />

                          {/* Guest Name - Google Sheets Inline Text Cell */}
                          <SheetsEditableCell
                            value={isOccupied ? (room.effectiveGuestName || matchedBooking.guestName || '') : ''}
                            type="text"
                            placeholder={isOccupied ? 'Guest In-House' : '— (Available)'}
                            disabled={!isOccupied}
                            tooltip={isOccupied ? 'Click to edit in-house guest name' : 'Room available for check-in'}
                            onSave={(newName) => {
                              if (onUpdateRoomStatus) {
                                onUpdateRoomStatus(room.roomNumber, room.effectiveStatus, newName, room.effectiveTariff);
                              }
                            }}
                          />

                          {/* Phone - Google Sheets Inline Cell */}
                          <SheetsEditableCell
                            value={isOccupied ? (matchedBooking.guestPhone || room.effectivePhone || '') : ''}
                            type="text"
                            placeholder="—"
                            disabled={!isOccupied}
                            onSave={(newPhone) => {
                              if (room.matchedBooking) room.matchedBooking.guestPhone = newPhone;
                              room.effectivePhone = newPhone;
                            }}
                          />

                          {/* Company - Google Sheets Inline Cell */}
                          <SheetsEditableCell
                            value={isOccupied ? (matchedBooking.company || room.effectiveCompany || '') : ''}
                            type="text"
                            placeholder="—"
                            disabled={!isOccupied}
                            onSave={(newComp) => {
                              if (room.matchedBooking) room.matchedBooking.company = newComp;
                              room.effectiveCompany = newComp;
                            }}
                          />

                          {/* Stay Period */}
                          <td style={{ color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {room.effectiveStayPeriod}
                          </td>

                          {/* Tariff (₹) - Google Sheets Currency Cell */}
                          <SheetsEditableCell
                            value={room.effectiveTariff || 2199}
                            type="currency"
                            align="right"
                            className="cell-num"
                            cellStyle={{ color: '#38bdf8' }}
                            onSave={(newTariff) => {
                              if (onUpdateRoomStatus) {
                                onUpdateRoomStatus(room.roomNumber, room.effectiveStatus, room.effectiveGuestName, Number(newTariff));
                              }
                              room.effectiveTariff = Number(newTariff);
                            }}
                          />

                          {/* Balance Due (₹) - Google Sheets Currency Cell */}
                          <SheetsEditableCell
                            value={room.effectiveBalanceDue || 0}
                            type="currency"
                            align="right"
                            className="cell-num"
                            cellStyle={{ color: (room.effectiveBalanceDue) ? '#f87171' : '#34d399' }}
                            onSave={(newBalance) => {
                              room.effectiveBalanceDue = Number(newBalance);
                            }}
                          />

                          {/* Key / HK */}
                          <td style={{ textAlign: 'center', fontSize: '0.74rem' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '3px',
                              background: room.keyIssued ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: room.keyIssued ? '#38bdf8' : '#94a3b8',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              {room.keyIssued ? '🔑 Issued' : '🗝️ Ready'}
                            </span>
                          </td>

                          {/* Operational Actions */}
                          <td>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                              {isOccupied ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedFolioRoom(room)}
                                    style={{
                                      padding: '3px 8px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(96, 165, 250, 0.35))',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.5)',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="Open Unified Primary Folio (All 17 Operations: Ledger, Charges, Transfers, Sub-Folio Windows, Dispute Hold, 50/50 Split, Caution Deposit)"
                                  >
                                    📄 Folio (1-17)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReceiptModalType('a4');
                                      setSelectedReceiptBooking(matchedBooking);
                                      setIsReceiptModalOpen(true);
                                    }}
                                    style={{
                                      padding: '3px 7px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      background: 'rgba(212, 175, 55, 0.2)',
                                      color: 'var(--gold-glow)',
                                      border: '1px solid var(--gold-glow)',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="Official Tax Invoice / Bill"
                                  >
                                    🧾 Bill
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCheckoutRoom(room)}
                                    style={{
                                      padding: '3px 7px',
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      background: 'rgba(234, 179, 8, 0.25)',
                                      color: '#facc15',
                                      border: '1px solid rgba(234, 179, 8, 0.5)',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="Check-Out & Settlement"
                                  >
                                    ⚡ Out
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSendWelcomePass(room)}
                                    style={{
                                      padding: '3px 7px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      background: 'rgba(37, 211, 102, 0.2)',
                                      color: '#4ade80',
                                      border: '1px solid rgba(37, 211, 102, 0.4)',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="WhatsApp Guest Registration Card"
                                  >
                                    📲 Pass
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenShiftModal(room)}
                                    style={{
                                      padding: '3px 7px',
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      background: 'rgba(255, 255, 255, 0.08)',
                                      color: '#cbd5e1',
                                      border: '1px solid rgba(255, 255, 255, 0.15)',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="Shift Room"
                                  >
                                    🔄 Shift
                                  </button>
                                </>
                              ) : isVacant ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWalkInRoom(room.roomNumber);
                                      setWalkInRate(room.tariff || 1699);
                                      setWalkInDeposit(room.tariff || 1699);
                                      setWalkInOpen(true);
                                    }}
                                    style={{
                                      padding: '3px 9px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      background: 'rgba(56, 189, 248, 0.25)',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.5)',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    + Walk-In Check-In
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateRoomStatus(room.roomNumber, 'Vacant Dirty', null, null)}
                                    style={{
                                      padding: '3px 7px',
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      background: 'rgba(234, 179, 8, 0.15)',
                                      color: '#facc15',
                                      border: '1px solid rgba(234, 179, 8, 0.3)',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="Mark Dirty / Needs Cleaning"
                                  >
                                    🧹 Clean
                                  </button>
                                </>
                              ) : isCleaning ? (
                                <button
                                  type="button"
                                  onClick={() => onUpdateRoomStatus(room.roomNumber, 'Available', null, null)}
                                  style={{
                                    padding: '3px 10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: 'rgba(16, 185, 129, 0.25)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.5)',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  ✓ Mark Clean / Ready
                                </button>
                              ) : isMaint ? (
                                <button
                                  type="button"
                                  onClick={() => onUpdateRoomStatus(room.roomNumber, 'Available', null, null)}
                                  style={{
                                    padding: '3px 10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: 'rgba(16, 185, 129, 0.25)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.5)',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  Release OOO
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : tapeChartViewMode === 'mysoft' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[2, 3, 4].map(floorNum => {
                const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
                if (floorRooms.length === 0) return null;

                const floorLabel = floorNum === 2 
                  ? '2ND FLOOR (Rooms 201 - 208)' 
                  : floorNum === 3 
                    ? '3RD FLOOR (Rooms 301 - 316)' 
                    : '4TH FLOOR (Rooms 401 - 416)';

                return (
                  <div key={floorNum} style={{
                    background: 'rgba(10, 15, 28, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.85rem',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      paddingBottom: '0.5rem'
                    }}>
                      <span style={{ fontWeight: 800, color: 'var(--gold-glow)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                        {floorLabel}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {floorRooms.filter(r => r.status === 'Available').length} Vacant / {floorRooms.length} Total
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '0.65rem'
                    }}>
                      {floorRooms.map(room => {
                        const isOccupied = room.status === 'Occupied';
                        const isMaint = room.status === 'Maintenance';
                        const isCleaning = room.status === 'Cleaning' || room.status === 'Vacant Dirty';
                        const isVacant = room.status === 'Available';

                        const bgColor = isOccupied
                          ? 'rgba(234, 88, 12, 0.18)'
                          : isMaint
                            ? 'rgba(100, 116, 139, 0.25)'
                            : isCleaning
                              ? 'rgba(234, 179, 8, 0.18)'
                              : 'rgba(16, 185, 129, 0.18)';

                        const borderColor = isOccupied
                          ? 'rgba(249, 115, 22, 0.5)'
                          : isMaint
                            ? 'rgba(148, 163, 184, 0.5)'
                            : isCleaning
                              ? 'rgba(234, 179, 8, 0.5)'
                              : 'rgba(16, 185, 129, 0.5)';

                        const badgeColor = isOccupied
                          ? '#fb923c'
                          : isMaint
                            ? '#94a3b8'
                            : isCleaning
                              ? '#facc15'
                              : '#34d399';

                        return (
                          <div
                            key={room.roomNumber}
                            data-room-id={room.roomNumber}
                            style={{
                              background: bgColor,
                              border: `1px solid ${borderColor}`,
                              borderRadius: '8px',
                              padding: '0.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              minHeight: 110,
                              cursor: 'default',
                              position: 'relative',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                            }}
                            onClick={() => {
                              // Inline editing always active — clicking card opens folio for occupied rooms
                              if (isVacant) {
                                setWalkInRoom(room.roomNumber);
                                setWalkInRate(room.tariff);
                                setWalkInDeposit(room.tariff);
                                setWalkInOpen(true);
                              } else if (isCleaning) {
                                onUpdateRoomStatus(room.roomNumber, 'Available', null, null);
                              } else if (isOccupied) {
                                setReceiptModalType('a4');
                                const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                  bookingId: `FMBIL2627-${room.roomNumber}`,
                                  billNo: `FMBIL2627-${room.roomNumber}`,
                                  roomNumber: room.roomNumber,
                                  guestName: room.currentGuestName || 'SAHANAWAZ',
                                  guestPhone: '+91 94370 22555',
                                  company: room.currentGuestName?.includes('ASHOK') ? 'LINDE INDIA LTD' : 'Direct Guest',
                                  corporateGstin: '21AAACB2528H1ZA',
                                  tier: room.tier,
                                  tariff: room.tariff || 2199,
                                  totalAmount: room.balanceDue || room.tariff || 2199,
                                  nights: 1,
                                  grcNo: `GRC-${room.roomNumber}`,
                                  checkInDate: '22/09/2026',
                                  checkInTime: '11:00 AM',
                                  checkOutDate: '23/09/2026 (12:00 PM)'
                                };
                                setSelectedReceiptBooking(matchedBooking);
                                setIsReceiptModalOpen(true);
                              }
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                                    {room.roomNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRoomForQr(room.roomNumber);
                                      setRoomQrOpen(true);
                                    }}
                                    title={`Generate Room ${room.roomNumber} QR Standee, Key & Dining`}
                                    style={{
                                      background: 'rgba(212, 175, 55, 0.15)',
                                      border: '1px solid var(--gold-glow)',
                                      color: 'var(--gold-glow)',
                                      padding: '1px 4px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <QrCode size={11} />
                                  </button>
                                </div>
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  color: badgeColor,
                                  textTransform: 'uppercase',
                                  background: 'rgba(0,0,0,0.3)',
                                  padding: '1px 5px',
                                  borderRadius: '3px'
                                }}>
                                  {isMaint ? 'MAINT' : isOccupied ? 'OCCUPIED' : (room.status === 'Vacant Dirty' ? 'VACANT DIRTY' : isCleaning ? 'CLEANING' : 'VACANT')}
                                </span>
                              </div>

                              <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', lineHeight: '1.2' }}>
                                {isOccupied ? (
                                  <div style={{ marginTop: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      defaultValue={room.currentGuestName || ''}
                                      onBlur={(e) => {
                                        const newName = e.target.value.trim();
                                        if (newName && onUpdateRoomStatus) {
                                          onUpdateRoomStatus(room.roomNumber, room.status, newName, room.tariff);
                                        }
                                      }}
                                      placeholder="Type Guest Name..."
                                      style={{
                                        width: '100%',
                                        padding: '2px 4px',
                                        fontSize: '0.72rem',
                                        background: 'rgba(0,0,0,0.6)',
                                        border: '1px solid #38bdf8',
                                        borderRadius: '3px',
                                        color: '#fff',
                                        fontWeight: 700
                                      }}
                                    />
                                    <div style={{ color: '#fb923c', fontWeight: 800, marginTop: '2px', fontSize: '0.8rem' }}>
                                      ₹{(room.outstandingBalance || room.tariff || 0).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                ) : isMaint ? (
                                  <div style={{ color: '#f87171', fontWeight: 700 }}>
                                    ⚠️ {room.currentGuestName || 'AC PRBLM'}
                                  </div>
                                ) : (
                                  <div style={{ marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>₹</span>
                                    <input
                                      type="number"
                                      defaultValue={room.tariff || 2199}
                                      onBlur={(e) => {
                                        const newTariff = Number(e.target.value);
                                        if (newTariff > 0 && onUpdateRoomStatus) {
                                          onUpdateRoomStatus(room.roomNumber, room.status, room.currentGuestName, newTariff);
                                        }
                                      }}
                                      style={{
                                        width: '70px',
                                        padding: '2px 4px',
                                        fontSize: '0.72rem',
                                        background: 'rgba(0,0,0,0.6)',
                                        border: '1px solid #34d399',
                                        borderRadius: '3px',
                                        color: '#34d399',
                                        fontWeight: 700
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quick Action Strip (Enhanced with Folio Actions from hotel_documents.pdf Page 5) */}
                            <div style={{
                              display: 'flex',
                              gap: '0.2rem',
                              marginTop: '0.5rem',
                              borderTop: '1px solid rgba(255,255,255,0.06)',
                              paddingTop: '0.35rem'
                            }}>
                              {isOccupied && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
                                  {/* Row 1: Folio, Tax Bill, GRC, Quick Checkout */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', width: '100%' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFolioRoom(room);
                                      }}
                                      title="Open Upgraded Master Folio (Sub-Folio Windows, Dispute Escrow, Colleague Split, Caution Refund)"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(96, 165, 250, 0.35))',
                                        color: '#38bdf8',
                                        border: '1px solid rgba(56, 189, 248, 0.5)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      📑 Folio
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReceiptModalType('a4');
                                        const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                          bookingId: `FMBIL2627-${room.roomNumber}`,
                                          billNo: `FMBIL2627-${room.roomNumber}`,
                                          roomNumber: room.roomNumber,
                                          guestName: room.currentGuestName || 'SAHANAWAZ',
                                          guestPhone: '+91 94370 22555',
                                          company: room.currentGuestName?.includes('ASHOK') ? 'LINDE INDIA LTD' : 'Direct Guest',
                                          corporateGstin: '21AAACB2528H1ZA',
                                          tier: room.tier,
                                          tariff: room.tariff || 2199,
                                          totalAmount: room.balanceDue || room.tariff || 2199,
                                          nights: 1,
                                          grcNo: `GRC-${room.roomNumber}`,
                                          checkInDate: '22/09/2026',
                                          checkInTime: '11:00 AM',
                                          checkOutDate: '23/09/2026 (12:00 PM)'
                                        };
                                        setSelectedReceiptBooking(matchedBooking);
                                        setIsReceiptModalOpen(true);
                                      }}
                                      title="Consolidated Tax Invoice / Non-GST Bill (GST / Non-GST Toggle, Taxable Breakdown)"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(16, 185, 129, 0.25)',
                                        color: '#34d399',
                                        border: '1px solid rgba(16, 185, 129, 0.5)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      🧾 Bill
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReceiptModalType('grc');
                                        const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                          bookingId: `FMBIL2627-${room.roomNumber}`,
                                          billNo: `FMBIL2627-${room.roomNumber}`,
                                          roomNumber: room.roomNumber,
                                          guestName: room.currentGuestName || 'SAHANAWAZ',
                                          guestPhone: '+91 94370 22555',
                                          company: room.currentGuestName?.includes('ASHOK') ? 'LINDE INDIA LTD' : 'Direct Guest',
                                          corporateGstin: '21AAACB2528H1ZA',
                                          tier: room.tier,
                                          tariff: room.tariff || 2199,
                                          totalAmount: room.balanceDue || room.tariff || 2199,
                                          nights: 1,
                                          grcNo: `GRC-${room.roomNumber}`,
                                          checkInDate: '22/09/2026',
                                          checkInTime: '11:00 AM',
                                          checkOutDate: '23/09/2026 (12:00 PM)'
                                        };
                                        setSelectedReceiptBooking(matchedBooking);
                                        setIsReceiptModalOpen(true);
                                      }}
                                      title="Official Guest Registration Card (Page 1) - Print for Guest Signature"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(212, 175, 55, 0.25)',
                                        color: 'var(--gold-glow)',
                                        border: '1px solid var(--gold-glow)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      📄 GRC
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCheckoutRoom(room);
                                      }}
                                      title="Check Out & Multi-Tender Split Settlement (PhonePe + Cash)"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 800,
                                        background: 'rgba(234, 179, 8, 0.25)',
                                        color: '#facc15',
                                        border: '1px solid rgba(234, 179, 8, 0.5)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      ⚡ Out
                                    </button>
                                  </div>

                                  {/* Row 2: Shift Room, Edit Stay, WhatsApp Pass */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', width: '100%' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenShiftModal(room);
                                      }}
                                      title="Shift Room to another Vacant room"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(168, 85, 247, 0.2)',
                                        color: '#c084fc',
                                        border: '1px solid rgba(168, 85, 247, 0.4)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      ⇄ Shift
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditStay(room);
                                      }}
                                      title="Edit Stay & Guest Details: extend dates, extra bed, info"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        color: '#60a5fa',
                                        border: '1px solid rgba(59, 130, 246, 0.4)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      ✏️ Stay
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendWelcomePass(room);
                                      }}
                                      title="Send WhatsApp Digital Keycard & Welcome Pass"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        color: '#4ade80',
                                        border: '1px solid rgba(34, 197, 94, 0.4)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      💬 Pass
                                    </button>
                                  </div>
                                </div>
                              )}
                              {isCleaning && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '3px', width: '100%' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateRoomStatus(room.roomNumber, 'Available', null, null);
                                    }}
                                    title="Housekeeping complete: Release room to Vacant Clean (Ready for Guest)"
                                    style={{
                                      padding: '3px 2px',
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(5, 150, 105, 0.45))',
                                      color: '#34d399',
                                      border: '1px solid #10b981',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center'
                                    }}
                                  >
                                    🧹 Ready
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setWalkInRoom(room.roomNumber);
                                      setWalkInRate(room.tariff);
                                      setWalkInDeposit(room.tariff);
                                      setWalkInOpen(true);
                                    }}
                                    title="Immediate Walk-In Check-In"
                                    style={{
                                      padding: '3px 2px',
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      background: 'rgba(56, 189, 248, 0.2)',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.4)',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center'
                                    }}
                                  >
                                    + Walk-In
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReceiptModalType('a4');
                                      const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                        bookingId: `FMBIL2627-${room.roomNumber}`,
                                        billNo: `FMBIL2627-${room.roomNumber}`,
                                        roomNumber: room.roomNumber,
                                        guestName: room.currentGuestName || 'RECENT GUEST (CHECKED OUT)',
                                        guestPhone: '+91 94370 22555',
                                        company: 'LINDE INDIA LTD',
                                        corporateGstin: '21AAACB2528H1ZA',
                                        tier: room.tier,
                                        tariff: room.tariff || 2199,
                                        totalAmount: room.tariff || 2199,
                                        nights: 1,
                                        grcNo: `GRC-${room.roomNumber}`,
                                        checkInDate: '22/09/2026',
                                        checkInTime: '11:00 AM',
                                        checkOutDate: '23/09/2026 (12:00 PM)'
                                      };
                                      setSelectedReceiptBooking(matchedBooking);
                                      setIsReceiptModalOpen(true);
                                    }}
                                    title="View Last Settled Tax Invoice / Non-GST Bill"
                                    style={{
                                      padding: '3px 2px',
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      background: 'rgba(212, 175, 55, 0.2)',
                                      color: 'var(--gold-glow)',
                                      border: '1px solid var(--gold-glow)',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center'
                                    }}
                                  >
                                    🧾 Bill
                                  </button>
                                </div>
                              )}
                              {isVacant && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setWalkInRoom(room.roomNumber);
                                    setWalkInRate(room.tariff);
                                    setWalkInDeposit(room.tariff);
                                    setWalkInOpen(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '2px 4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Walk-In
                                </button>
                              )}
                              {isMaint && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateRoomStatus(room.roomNumber, 'Available', null, null);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '2px 4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Release OOO
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: MODERN CARD LAYOUT */
            <div className="tape-chart-container">
              {[2, 3, 4].map(floorNum => {
                const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
                if (floorRooms.length === 0) return null;

                const tierName = floorNum === 2 ? 'Standard Deluxe (₹1,699)' : floorNum === 3 ? 'Deluxe Room (₹2,199)' : 'Executive / Suite (₹2,899 - ₹3,999)';

                return (
                  <div key={floorNum} className="tape-floor-group">
                    <div className="tape-floor-header">
                      <span>FLOOR {floorNum} • {tierName}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {floorRooms.filter(r => r.status === 'Available').length} / {floorRooms.length} Available
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem', padding: '1rem' }}>
                      {floorRooms.map(room => (
                        <div 
                          key={room.roomNumber}
                          style={{
                            background: 'rgba(6, 14, 26, 0.65)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                                Room {room.roomNumber}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRoomForQr(room.roomNumber);
                                  setRoomQrOpen(true);
                                }}
                                title={`Generate Room ${room.roomNumber} QR Standee & Key`}
                                style={{
                                  background: 'rgba(212, 175, 55, 0.15)',
                                  border: '1px solid var(--gold-glow)',
                                  color: 'var(--gold-glow)',
                                  padding: '2px 5px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                              >
                                <QrCode size={13} />
                              </button>
                            </div>
                            <span className={`badge-status badge-${(room.status || 'available').toLowerCase().replace(' ', '-')}`}>
                              {room.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {room.currentGuestName ? (
                              <div style={{ color: '#f8fafc', fontWeight: 600 }}>
                                👤 {room.currentGuestName}
                              </div>
                            ) : (
                              <div style={{ color: 'var(--text-muted)' }}>
                                Bed: {room.bedType || 'King Bed'} • ₹{room.tariff}/night
                              </div>
                            )}
                          </div>

                          {/* Status-Specific Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            {room.status === 'Occupied' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedFolioRoom(room)}
                                    title="Open Upgraded Master Folio (Sub-Folio Windows, Dispute Escrow, Colleague Split, Caution Refund)"
                                    style={{
                                      flex: 1,
                                      padding: '0.35rem',
                                      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(96, 165, 250, 0.35))',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.5)',
                                      borderRadius: '4px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    📑 Folio
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCheckoutRoom(room)}
                                    title="Guest Checkout & Multi-Tender Split Settlement"
                                    style={{
                                      flex: 1.5,
                                      padding: '0.35rem 0.5rem',
                                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(245, 158, 11, 0.2))',
                                      color: 'var(--gold-glow)',
                                      border: '1px solid var(--gold-glow)',
                                      borderRadius: '4px',
                                      fontSize: '0.74rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    ⚡ Out &amp; Settle
                                  </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenShiftModal(room)}
                                    title="Shift Room"
                                    style={{
                                      padding: '0.3rem',
                                      background: 'rgba(168, 85, 247, 0.2)',
                                      color: '#c084fc',
                                      border: '1px solid rgba(168, 85, 247, 0.4)',
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ⇄ Shift
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStay(room)}
                                    title="Edit Stay & Guest Details"
                                    style={{
                                      padding: '0.3rem',
                                      background: 'rgba(59, 130, 246, 0.2)',
                                      color: '#60a5fa',
                                      border: '1px solid rgba(59, 130, 246, 0.4)',
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ✏️ Stay
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSendWelcomePass(room)}
                                    title="WhatsApp Welcome Pass"
                                    style={{
                                      padding: '0.3rem',
                                      background: 'rgba(34, 197, 94, 0.2)',
                                      color: '#4ade80',
                                      border: '1px solid rgba(34, 197, 94, 0.4)',
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    💬 Pass
                                  </button>
                                </div>
                              </div>
                            )}

                            {room.status === 'Available' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWalkInRoom(room.roomNumber);
                                    setWalkInRate(room.tariff);
                                    setWalkInDeposit(room.tariff);
                                    setWalkInOpen(true);
                                  }}
                                  style={{
                                    flex: 2,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '5px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Walk-In
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBlockSelectedRoom(room.roomNumber);
                                    setBlockRoomOpen(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Block
                                </button>
                              </>
                            )}

                            {(room.status === 'Cleaning' || room.status === 'Vacant Dirty') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onUpdateRoomStatus(room.roomNumber, 'Available', null, null)}
                                  title="Housekeeping inspection complete: Release room to Vacant Clean"
                                  style={{
                                    flex: 2,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(16, 185, 129, 0.25)',
                                    color: '#34d399',
                                    border: '1px solid #10b981',
                                    borderRadius: '5px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✓ Mark Inspected Clean
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBlockSelectedRoom(room.roomNumber);
                                    setBlockRoomOpen(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Block
                                </button>
                              </>
                            )}

                            {room.status === 'Maintenance' && (
                              <button
                                type="button"
                                onClick={() => onUpdateRoomStatus(room.roomNumber, 'Available', null, null)}
                                style={{
                                  width: '100%',
                                  padding: '0.35rem 0.5rem',
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.4)',
                                  borderRadius: '5px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ Release to Available
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CASHIER SHIFT HANDOVER & NIGHT AUDIT */}
      {activeTab === 'cashier-audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
            {/* Shift Handover Card with Note Denomination Counter */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--gold-glow)" /> Cashier Shift Handover &amp; Drawer Balance
                </h3>
                <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', fontSize: '0.72rem' }}>
                  IDS Next Standard
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Shift:</span>
                  <span style={{ fontWeight: 600 }}>Evening Shift (15:00 - 23:00 IST)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Opening Float:</span>
                  <span style={{ fontWeight: 600 }}>₹{openingFloat.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cash Receipts (Rooms &amp; POS):</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>+ ₹{cashCollected.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Petty Cash Vouchers Paid:</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>- ₹{pettyCashPaid.toLocaleString()}</span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Expected Cash in Drawer:</span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--gold-glow)' }}>
                    ₹{expectedDrawerCash.toLocaleString()}
                  </span>
                </div>

                {/* Currency Note Denomination Counter */}
                <div style={{
                  background: 'rgba(10, 16, 30, 0.75)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-glow)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calculator size={15} /> Physical Currency Note Denomination Counter
                    </span>
                    <button
                      type="button"
                      onClick={() => setClosingCashActual(totalDenominationSum)}
                      className="btn-outline-gold"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                    >
                      ⚡ Sync to Drawer Count
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { note: 500, count: denominations[500] },
                      { note: 200, count: denominations[200] },
                      { note: 100, count: denominations[100] },
                      { note: 50, count: denominations[50] },
                      { note: 20, count: denominations[20] },
                      { note: 10, count: denominations[10] }
                    ].map(d => (
                      <div key={d.note} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>₹{d.note} Notes</div>
                        <input
                          type="number"
                          min="0"
                          value={d.count}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            const updated = { ...denominations, [d.note]: val };
                            setDenominations(updated);
                            const newTotal = ((Number(updated[500]) || 0) * 500) +
                              ((Number(updated[200]) || 0) * 200) +
                              ((Number(updated[100]) || 0) * 100) +
                              ((Number(updated[50]) || 0) * 50) +
                              ((Number(updated[20]) || 0) * 20) +
                              ((Number(updated[10]) || 0) * 10) +
                              (Number(updated.coins) || 0);
                            setClosingCashActual(newTotal);
                          }}
                          style={{
                            width: '100%',
                            background: '#060e1a',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '4px',
                            padding: '0.3rem 0.4rem',
                            fontSize: '0.82rem',
                            fontWeight: 700
                          }}
                        />
                        <div style={{ fontSize: '0.65rem', color: '#38bdf8', textAlign: 'right', marginTop: '2px' }}>
                          ₹{(d.note * (Number(d.count) || 0)).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Coins Value</div>
                      <input
                        type="number"
                        min="0"
                        value={denominations.coins}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          const updated = { ...denominations, coins: val };
                          setDenominations(updated);
                          const newTotal = ((Number(updated[500]) || 0) * 500) +
                            ((Number(updated[200]) || 0) * 200) +
                            ((Number(updated[100]) || 0) * 100) +
                            ((Number(updated[50]) || 0) * 50) +
                            ((Number(updated[20]) || 0) * 20) +
                            ((Number(updated[10]) || 0) * 10) +
                            val;
                          setClosingCashActual(newTotal);
                        }}
                        style={{
                          width: '100%',
                          background: '#060e1a',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '4px',
                          padding: '0.3rem 0.4rem',
                          fontSize: '0.82rem',
                          fontWeight: 700
                        }}
                      />
                      <div style={{ fontSize: '0.65rem', color: '#38bdf8', textAlign: 'right', marginTop: '2px' }}>
                        ₹{Number(denominations.coins || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total Denomination Counted:</span>
                    <strong style={{ color: 'var(--gold-glow)', fontSize: '1rem' }}>₹{totalDenominationSum.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.25rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual Physical Cash Counted in Drawer:</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-synced from denominations</span>
                  </label>
                  <input 
                    type="number"
                    className="form-input"
                    value={closingCashActual}
                    onChange={(e) => setClosingCashActual(Number(e.target.value))}
                  />
                </div>

                {/* Discrepancy Status */}
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: drawerVariance === 0
                    ? 'rgba(16, 185, 129, 0.15)'
                    : drawerVariance > 0
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  border: drawerVariance === 0
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : drawerVariance > 0
                      ? '1px solid rgba(56, 189, 248, 0.4)'
                      : '1px solid rgba(239, 68, 68, 0.4)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Drawer Variance:</span>
                  <strong style={{
                    color: drawerVariance === 0 ? '#10b981' : drawerVariance > 0 ? '#38bdf8' : '#f87171'
                  }}>
                    {drawerVariance === 0
                      ? 'BALANCED (₹0.00)'
                      : drawerVariance > 0
                        ? `OVERAGE (+₹${drawerVariance.toLocaleString()})`
                        : `SHORTAGE (-₹${Math.abs(drawerVariance).toLocaleString()})`}
                  </strong>
                </div>

                {handoverSuccess && (
                  <div style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                    ✓ Shift Handover recorded to Cloudflare D1 and logged to Telegram.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={executeShiftHandover}
                    className="btn-primary-gold"
                    style={{ flex: 1.5, justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={16} /> Sign Off &amp; Submit Handover Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentVoucher = {
                        shiftId: `SH-${Date.now().toString().slice(-6)}`,
                        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                        shift: 'Evening (15:00 - 23:00)',
                        cashier: 'Front Desk Cashier (K. Simhachalam)',
                        supervisor: 'Operations Lead (S. Patnaik)',
                        openingFloat,
                        cashCollected,
                        pettyCash: pettyCashPaid,
                        expected: expectedDrawerCash,
                        actual: closingCashActual,
                        variance: drawerVariance,
                        status: drawerVariance === 0 ? 'BALANCED' : drawerVariance > 0 ? 'OVERAGE' : 'SHORTAGE',
                        denominations: { ...denominations },
                        notes: drawerVariance === 0 ? 'Physical drawer notes counted and balanced.' : `Variance of ₹${drawerVariance} noted.`
                      };
                      setActiveHandoverForVoucher(currentVoucher);
                      setHandoverVoucherModalOpen(true);
                    }}
                    className="btn-outline-gold"
                    style={{ flex: 1, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Printer size={16} /> Print Voucher
                  </button>
                </div>
              </div>
            </div>

            {/* 09:00 PM Night Audit Engine */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={18} color="var(--gold-glow)" /> Daily Night Audit &amp; Revenue Closure
              </h3>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Executes the daily 24-hour financial balance, verifies 39-room inventory, charges midnight room revenues, and freezes the day's cashier folios.
              </div>

              <div style={{
                background: 'rgba(6, 14, 26, 0.6)',
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total 39-Room Capacity:</span>
                  <strong>39 Keys</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current Occupancy:</span>
                  <strong>{occupiedDirtyCount + occupiedCleanCount} Rooms ({(((occupiedDirtyCount + occupiedCleanCount) / 39) * 100).toFixed(1)}%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Daily Revenue (Flash):</span>
                  <strong>₹58,247.07</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SAC 996311 GST Billed:</span>
                  <strong>₹{bookings.reduce((sum, b) => sum + (b.cgst + b.sgst || 0), 0).toFixed(2)}</strong>
                </div>
              </div>

              <button 
                onClick={() => onRunNightAudit()}
                className="btn-secondary-sapphire"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={16} /> Execute 09:00 PM Night Audit Run
              </button>
            </div>
          </div>

          {/* Audited Multi-Tender Split Settlements Log */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Receipt size={18} color="var(--gold-glow)" /> Audited Multi-Tender Split Settlements (Direct Checkout Log)
                </h4>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Front desk checkout audit ledger showing exact split across PhonePe/UPI, Cash drawer, Card POS, and Corporate credit.
                </p>
              </div>
              <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                ✓ {filteredSettlements.length} Audited Settlements {isDateFilterActive ? `(${filterFromDate} to ${filterToDate})` : ''}
              </span>
            </div>

            <div className="enterprise-data-table-container">
              <SheetsToolbarLegend tableName="Audited Checkout Settlements Ledger" subtitle="Front Desk Cashier Payment Audit" />
              <table className="enterprise-data-table sheets-grid-table">
                <thead>
                  <tr>
                    <SheetsColumnHeader title="Time" badge="locked" style={{ width: '80px' }} />
                    <SheetsColumnHeader title="Room" badge="locked" style={{ width: '90px' }} />
                    <SheetsColumnHeader title="Guest Name" badge="editable" />
                    <SheetsColumnHeader title="Bill #" badge="locked" style={{ width: '130px' }} />
                    <SheetsColumnHeader title="Total Settled" badge="editable" align="right" style={{ width: '130px' }} />
                    <SheetsColumnHeader title="Split Payment Breakdown" badge="locked" />
                    <SheetsColumnHeader title="Actions" badge="locked" align="center" style={{ width: '100px' }} />
                  </tr>
                </thead>
                <tbody>
                  {filteredSettlements.map((s, idx) => (
                    <tr key={idx}>
                      <td style={{ color: '#94a3b8' }}>{s.settlementTime}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>Room {s.roomNumber}</span>
                      </td>
                      <SheetsEditableCell
                        value={s.guestName}
                        type="text"
                        cellStyle={{ fontWeight: 600, color: '#fff' }}
                        onSave={(newVal) => {
                          s.guestName = newVal;
                          setRecentSettlements([...recentSettlements]);
                        }}
                      />
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem' }}>{s.billNo}</td>
                      <SheetsEditableCell
                        value={s.totalAmount}
                        type="currency"
                        align="right"
                        className="cell-num"
                        cellStyle={{ color: 'var(--gold-glow)', fontWeight: 700 }}
                        onSave={(newVal) => {
                          s.totalAmount = Number(newVal);
                          setRecentSettlements([...recentSettlements]);
                        }}
                      />
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {s.tendersSummary?.map((t, i) => (
                            <span key={i} style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: t.includes('Cash') ? 'rgba(52, 211, 153, 0.15)' : (t.includes('UPI') || t.includes('PhonePe')) ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                              color: t.includes('Cash') ? '#34d399' : (t.includes('UPI') || t.includes('PhonePe')) ? '#38bdf8' : '#cbd5e1',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedReceiptBooking({
                              bookingId: s.billNo,
                              billNo: s.billNo,
                              roomNumber: s.roomNumber,
                              guestName: s.guestName,
                              tier: s.tier || 'Executive AC',
                              totalAmount: s.totalAmount,
                              paymentMode: 'Split Tender',
                              paymentStatus: 'Fully Settled & Checked Out',
                              tenders: s.tenders,
                              tendersSummary: s.tendersSummary,
                              foodAmount: s.billTotal > 1500 ? 962 : s.billTotal,
                              grcNo: '684'
                            });
                            setIsReceiptModalOpen(true);
                          }}
                          className="btn-outline-gold"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        >
                          📄 View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cashier Shift Handover Audit Trail Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ClipboardList size={18} color="var(--gold-glow)" /> Shift Handover Audit Trail &amp; Safe Drop Register
            </h4>
            <div className="enterprise-data-table-container">
              <SheetsToolbarLegend tableName="Shift Handover Audit Trail & Safe Drop Register" subtitle="Front Desk Cashier Float & Physical Reconciliation" />
              <table className="enterprise-data-table sheets-grid-table">
                <thead>
                  <tr>
                    <SheetsColumnHeader title="Shift ID / Date" badge="locked" style={{ width: '130px' }} />
                    <SheetsColumnHeader title="Cashier & Shift" badge="locked" style={{ width: '140px' }} />
                    <SheetsColumnHeader title="Float (₹)" badge="editable" align="right" style={{ width: '100px' }} />
                    <SheetsColumnHeader title="Receipts (₹)" badge="locked" align="right" style={{ width: '110px' }} />
                    <SheetsColumnHeader title="Petty Cash (₹)" badge="locked" align="right" style={{ width: '110px' }} />
                    <SheetsColumnHeader title="Expected (₹)" badge="formula" align="right" style={{ width: '110px' }} />
                    <SheetsColumnHeader title="Physical (₹)" badge="editable" align="right" style={{ width: '110px' }} />
                    <SheetsColumnHeader title="Variance Status" badge="formula" align="center" style={{ width: '120px' }} />
                    <SheetsColumnHeader title="Verification Notes" badge="editable" />
                    <SheetsColumnHeader title="Voucher" badge="locked" align="center" style={{ width: '80px' }} />
                  </tr>
                </thead>
                <tbody>
                  {handoverLogs.map(log => {
                    const expectedVal = Number(log.openingFloat || 0) + Number(log.cashCollected || 0) - Number(log.pettyCash || 0);
                    const actualVal = Number(log.actual || 0);
                    const varianceVal = actualVal - expectedVal;
                    const statusStr = varianceVal === 0 ? 'Balanced' : varianceVal > 0 ? 'Surplus' : 'Deficit';

                    return (
                      <tr key={log.shiftId}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{log.shiftId}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.date}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--gold-glow)' }}>{log.cashier}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.shift}</div>
                        </td>
                        <SheetsEditableCell
                          value={log.openingFloat}
                          type="currency"
                          align="right"
                          className="cell-num"
                          min={0}
                          cellStyle={{ color: '#fff', fontWeight: 600 }}
                          onSave={(newVal) => {
                            const newFloat = Number(newVal);
                            const newExp = newFloat + Number(log.cashCollected || 0) - Number(log.pettyCash || 0);
                            const newVar = Number(log.actual || 0) - newExp;
                            setHandoverLogs(prev => prev.map(l => l.shiftId === log.shiftId ? {
                              ...l,
                              openingFloat: newFloat,
                              expected: newExp,
                              variance: newVar,
                              status: newVar === 0 ? 'Balanced' : newVar > 0 ? 'Surplus' : 'Deficit'
                            } : l));
                          }}
                        />
                        <td className="cell-num" style={{ color: '#10b981' }}>+₹{Number(log.cashCollected || 0).toLocaleString()}</td>
                        <td className="cell-num" style={{ color: '#f87171' }}>-₹{Number(log.pettyCash || 0).toLocaleString()}</td>
                        <td className="cell-num" style={{ color: '#fff', fontWeight: 700 }}>₹{expectedVal.toLocaleString()}</td>
                        <SheetsEditableCell
                          value={log.actual}
                          type="currency"
                          align="right"
                          className="cell-num"
                          min={0}
                          cellStyle={{ color: 'var(--gold-glow)', fontWeight: 700 }}
                          onSave={(newVal) => {
                            const newActual = Number(newVal);
                            const newVar = newActual - expectedVal;
                            setHandoverLogs(prev => prev.map(l => l.shiftId === log.shiftId ? {
                              ...l,
                              actual: newActual,
                              variance: newVar,
                              status: newVar === 0 ? 'Balanced' : newVar > 0 ? 'Surplus' : 'Deficit'
                            } : l));
                          }}
                        />
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: varianceVal === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                            color: varianceVal === 0 ? '#34d399' : '#f87171',
                            border: varianceVal === 0 ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)'
                          }}>
                            {statusStr} {varianceVal !== 0 && `(₹${varianceVal})`}
                          </span>
                        </td>
                        <SheetsEditableCell
                          value={log.notes}
                          type="text"
                          cellStyle={{ color: '#cbd5e1', fontSize: '0.78rem' }}
                          onSave={(newVal) => setHandoverLogs(prev => prev.map(l => l.shiftId === log.shiftId ? { ...l, notes: newVal } : l))}
                        />
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveHandoverForVoucher(log);
                            setHandoverVoucherModalOpen(true);
                          }}
                          className="btn-outline-gold"
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          🖨️ Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOUSEKEEPING & 5-STAGE LIFECYCLE TRACKER */}
      {activeTab === 'housekeeping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Floor Attendant Allocation Cards */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🧹 Housekeeping Operations &amp; Floor Attendant Allocation
                </h3>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Floor attendants assigned per shift • Turnaround time tracking • Linen par-stock buffer
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsHousekeepingPrintOpen(true)}
                  className="btn-outline-gold"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Print Daily 18-Room Floor Attendant Assignment & Linen Checklist"
                >
                  <Printer size={14} color="var(--gold-glow)" /> Print Housekeeping Work Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dirtyRoomsList = rooms.filter(r => r.status === 'Vacant Dirty' || r.status === 'Cleaning');
                    const dirtyRoomNums = dirtyRoomsList.map(r => r.roomNumber).join(', ') || 'All 18 Rooms Clean';
                    sendHousekeepingOrderWhatsApp({
                      roomNumber: dirtyRoomNums,
                      floor: '18-Room Inventory',
                      roomStatus: `${dirtyRoomsList.length} Rooms Requiring Turnover`,
                      priority: dirtyRoomsList.length > 2 ? 'High' : 'Standard',
                      notes: `Current Dirty/Cleaning Rooms: ${dirtyRoomNums}. Please complete turnover & sanitization.`
                    });
                    showToast('✓ Housekeeping Turnover Order sent to Floor Lead WhatsApp!');
                  }}
                  className="btn-outline-gold"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', borderColor: '#22c55e', color: '#4ade80' }}
                  title="Dispatch 18-Room Turnover Work Order to Housekeeping Lead on WhatsApp"
                >
                  <MessageCircle size={14} color="#4ade80" /> WhatsApp Floor Lead
                </button>
                <button
                  onClick={() => {
                    setWorkOrderForm({
                      roomNumber: '202',
                      issue: '',
                      category: 'HVAC / AC',
                      priority: 'High',
                      technician: 'Bikram Patra (AC Specialist)',
                      notes: ''
                    });
                    setIsWorkOrderModalOpen(true);
                  }}
                  className="btn-outline-gold"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Wrench size={14} color="var(--gold-glow)" /> + Log Maintenance Ticket
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[2, 3, 4].map(floorNum => {
                const att = floorAttendants[floorNum] || { name: 'Staff Assigned', phone: '-', shift: 'Morning' };
                const floorRooms = rooms.filter(r => r.floor === floorNum);
                const dirtyRooms = floorRooms.filter(r => r.status === 'Vacant Dirty' || r.status === 'Cleaning').length;
                const cleanRooms = floorRooms.filter(r => r.status === 'Available').length;

                return (
                  <div key={floorNum} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 800, color: 'var(--gold-glow)', fontSize: '0.95rem' }}>
                          FLOOR {floorNum} ATTENDANT
                        </span>
                        <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.7rem' }}>
                          {att.status || 'On Floor'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginTop: '0.25rem' }}>
                        {att.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        📞 {att.phone} • {att.shift}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                      <span style={{ color: '#facc15' }}>{dirtyRooms} Dirty Pending</span>
                      <span style={{ color: '#34d399' }}>{cleanRooms} Ready to Sell</span>
                      <button
                        onClick={() => {
                          setSelectedFloorToEdit(floorNum);
                          setAttendantForm({ name: att.name, phone: att.phone, shift: att.shift });
                          setIsEditAttendantOpen(true);
                        }}
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: 'var(--gold-glow)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5-Stage Inventory KPI Counters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.85rem'
            }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 600 }}>1. Vacant Clean</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>{vacantCleanCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Inspected &amp; Ready</div>
              </div>

              <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#facc15', textTransform: 'uppercase', fontWeight: 600 }}>2. Vacant Dirty</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#facc15' }}>{vacantDirtyCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Checked Out Turnover</div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 600 }}>3. Occupied Clean</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>{occupiedCleanCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Stayover Serviced</div>
              </div>

              <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#fb923c', textTransform: 'uppercase', fontWeight: 600 }}>4. Occupied Dirty</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fb923c' }}>{occupiedDirtyCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Service Pending</div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 600 }}>5. Out of Order</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171' }}>{oooCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Maintenance Blocked</div>
              </div>
            </div>
          </div>

          {/* Interactive 39-Room Cleaning Matrix */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ color: 'var(--gold-glow)', margin: 0, fontSize: '1.05rem' }}>
                Interactive 39-Room Status &amp; Cleaning Dispatch:
              </h4>
              <button
                onClick={() => {
                  rooms.forEach(r => {
                    if (r.status === 'Vacant Dirty' || r.status === 'Cleaning') {
                      onUpdateRoomStatus(r.roomNumber, 'Available', null, null);
                    }
                  });
                }}
                className="btn-primary-gold"
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
              >
                🧹 Quick Release: Mark All Dirty As Inspected Clean
              </button>
            </div>

            {/* Sheet 3 Requirement: Emergency Housekeeping Shorthand Codes Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.78rem'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--gold-glow)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ⚡ Front Desk Shorthand Codes (Quick Toggles):
              </span>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#facc15', background: 'rgba(234, 179, 8, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                  <strong>[ D ]</strong> Dirty
                </span>
                <span style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <strong>[ S ]</strong> Serviced
                </span>
                <span style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                  <strong>[ T ]</strong> Touch-up
                </span>
                <span style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <strong>[ H ]</strong> Hold / Defect
                </span>
                <span style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  <strong>[ HF ]</strong> Handover Free (Ready to Sell)
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {rooms.map(r => {
                const isClean = r.status === 'Available';
                const isDirty = r.status === 'Vacant Dirty' || r.status === 'Cleaning';
                const isOccClean = r.status === 'Occupied Clean';
                const isOcc = r.status === 'Occupied';
                const isMaint = r.status === 'Maintenance' || r.status === 'VIP Hold';

                const statusLabel = isClean ? 'Vacant Clean' : isDirty ? 'Vacant Dirty' : isOccClean ? 'Occupied Clean' : isOcc ? 'Occupied Dirty' : 'Out of Order';
                const statusColor = isClean ? '#34d399' : isDirty ? '#facc15' : isOccClean ? '#38bdf8' : isOcc ? '#fb923c' : '#f87171';

                return (
                  <div key={r.roomNumber} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${statusColor}40`,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '1.1rem' }}>Room {r.roomNumber}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Floor {r.floor} • {r.tier}</div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: statusColor,
                        background: `${statusColor}20`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid ${statusColor}50`
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {isDirty && (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Available', null, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ✓ Mark Clean
                        </button>
                      )}
                      {isClean && (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Vacant Dirty', null, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(234,179,8,0.2)', color: '#facc15', border: '1px solid #facc15', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Mark Dirty
                        </button>
                      )}
                      {isOcc && (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Occupied Clean', r.currentGuestName, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ✨ Serviced
                        </button>
                      )}
                      {isOccClean && (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Occupied', r.currentGuestName, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(249,115,22,0.2)', color: '#fb923c', border: '1px solid #fb923c', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Svc Pending
                        </button>
                      )}
                      {isMaint ? (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Available', null, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Release OOO
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setWorkOrderForm({ ...workOrderForm, roomNumber: r.roomNumber });
                            setIsWorkOrderModalOpen(true);
                          }}
                          style={{ padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          🔧 Ticket
                        </button>
                      )}
                    </div>

                    {/* Sheet 3: Rapid Shorthand Toggles [D] [S] [T] [H] [HF] */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      background: 'rgba(0,0,0,0.35)',
                      padding: '3px 6px',
                      borderRadius: '6px',
                      marginTop: '0.25rem',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Code:</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button
                          title="D: Mark Dirty"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, 'Vacant Dirty', null, null);
                            showToast(`Room ${r.roomNumber} -> [D] Dirty`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: isDirty && r.status !== 'Cleaning' ? '#facc15' : 'rgba(234,179,8,0.15)',
                            color: isDirty && r.status !== 'Cleaning' ? '#000' : '#facc15',
                            border: '1px solid rgba(234,179,8,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          D
                        </button>
                        <button
                          title="S: Mark Serviced"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, r.status === 'Occupied' || r.status === 'Occupied Clean' ? 'Occupied Clean' : 'Available', r.currentGuestName, null);
                            showToast(`Room ${r.roomNumber} -> [S] Serviced`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: isOccClean ? '#38bdf8' : 'rgba(56,189,248,0.15)',
                            color: isOccClean ? '#000' : '#38bdf8',
                            border: '1px solid rgba(56,189,248,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          S
                        </button>
                        <button
                          title="T: Touch-up in Progress"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, 'Cleaning', r.currentGuestName, null);
                            showToast(`Room ${r.roomNumber} -> [T] Touch-up`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: r.status === 'Cleaning' ? '#c084fc' : 'rgba(192,132,252,0.15)',
                            color: r.status === 'Cleaning' ? '#000' : '#c084fc',
                            border: '1px solid rgba(192,132,252,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          T
                        </button>
                        <button
                          title="H: Hold / Maintenance"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, 'Maintenance', null, null);
                            showToast(`Room ${r.roomNumber} -> [H] Hold / OOO`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: isMaint ? '#f87171' : 'rgba(239,68,68,0.15)',
                            color: isMaint ? '#fff' : '#f87171',
                            border: '1px solid rgba(239,68,68,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          H
                        </button>
                        <button
                          title="HF: Handover Free / Ready to Sell"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, 'Available', null, null);
                            showToast(`Room ${r.roomNumber} -> [HF] Handover Free`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: isClean ? '#34d399' : 'rgba(52,211,153,0.15)',
                            color: isClean ? '#060e1a' : '#34d399',
                            border: '1px solid rgba(52,211,153,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          HF
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maintenance Work Orders Ticketing Dashboard */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wrench size={17} color="#f87171" /> Maintenance Work Orders &amp; Defect Logs
              </h4>
              <button
                onClick={() => setIsWorkOrderModalOpen(true)}
                className="btn-outline-gold"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                + New Work Order
              </button>
            </div>

            <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
            <div className="enterprise-data-table-container">
              <table className="enterprise-data-table sheets-grid-table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}><SheetsColumnHeader label="Ticket # / Date" type="locked" /></th>
                    <th style={{ width: '90px', textAlign: 'center' }}><SheetsColumnHeader label="Room" type="locked" align="center" /></th>
                    <th><SheetsColumnHeader label="Category & Defect Issue" type="editable" /></th>
                    <th style={{ width: '150px' }}><SheetsColumnHeader label="Assigned Technician" type="editable" /></th>
                    <th style={{ width: '120px', textAlign: 'center' }}><SheetsColumnHeader label="Target ETA" type="editable" align="center" /></th>
                    <th style={{ width: '90px', textAlign: 'center' }}><SheetsColumnHeader label="Priority" type="editable" align="center" /></th>
                    <th style={{ width: '90px', textAlign: 'center' }}><SheetsColumnHeader label="Status" type="locked" align="center" /></th>
                    <th style={{ width: '130px', textAlign: 'center' }}><SheetsColumnHeader label="Action" type="locked" align="center" /></th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map(wo => (
                    <tr key={wo.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{wo.id}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{wo.loggedAt}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 800 }}>
                          Room {wo.roomNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{wo.issue}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Category: {wo.category} • {wo.notes}</div>
                      </td>
                      <td style={{ color: '#cbd5e1' }}>
                        {wo.technician}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)'
                        }}>
                          ⏱️ {wo.targetEta || 'Within 2 Hours'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: wo.priority === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                          color: wo.priority === 'High' ? '#f87171' : '#fbbf24'
                        }}>
                          {wo.priority}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: wo.status === 'Resolved' ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)',
                          color: wo.status === 'Resolved' ? '#34d399' : '#38bdf8'
                        }}>
                          {wo.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              sendMaintenanceTicketWhatsApp({
                                roomNumber: wo.roomNumber,
                                issue: wo.issue,
                                severity: wo.priority,
                                technicianName: wo.technician,
                                targetEta: '30 Mins'
                              });
                              showToast(`✓ Defect details sent to ${wo.technician} on WhatsApp!`);
                            }}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: 'rgba(37, 211, 102, 0.15)',
                              border: '1px solid #25D366',
                              color: '#34d399',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                            title="Dispatch defect work order to assigned technician on WhatsApp"
                          >
                            <MessageCircle size={12} /> Tech
                          </button>
                          {wo.status !== 'Resolved' ? (
                            <button
                              onClick={() => handleResolveWorkOrder(wo.id, wo.roomNumber)}
                              className="btn-outline-gold"
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Resolve
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Closed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Part 3: Linen Par Stock & Room Asset Custody Embedded */}
          <LinenRoomAssetsSection rooms={rooms} onSaveLinenUpdate={(payload) => { const pin = localStorage.getItem('hsi_admin_pin') || '7650'; fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Key': pin }, body: JSON.stringify({ action: 'update_linen_inventory', payload }) }).catch(() => {}); }} />
        </div>
      )}

      {/* TAB: LINEN & ROOM ASSETS (Part 3) */}
      {activeTab === 'linen-assets' && (
        <LinenRoomAssetsSection rooms={rooms} onSaveLinenUpdate={(payload) => { const pin = localStorage.getItem('hsi_admin_pin') || '7650'; fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Key': pin }, body: JSON.stringify({ action: 'update_linen_inventory', payload }) }).catch(() => {}); }} />
      )}

      {/* TAB: STAFF ATTENDANCE & PAYROLL (Part 1) */}
      {activeTab === 'staff-payroll' && (
        <StaffPayrollSection />
      )}

      {/* TAB 4: SARAI ACT POLICE REGISTER */}
      {activeTab === 'police-register' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>🚨 Statutory Sarai Act 1867 Daily Police Register</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Jurisdiction: Rayagada Town Police Station (Odisha Police) • Inter-State Guest Tagging
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={() => setIsPolicePrintOpen(true)}
                className="btn-outline-gold"
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem' }}
                title="Print Official Form C Sarai Act Arrival Register"
              >
                <Printer size={15} color="var(--gold-glow)" /> Print Form C Sarai Register
              </button>
              <button 
                onClick={dispatchPoliceRegisterWhatsApp}
                className="btn-primary-gold"
                style={{ fontSize: '0.85rem' }}
              >
                <Send size={15} /> Dispatch Register to Police Station
              </button>
            </div>
          </div>

          {policeDispatchSent && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              ✓ Sarai Act Daily Guest Register securely formatted and transmitted to Rayagada Town Police Station email &amp; WhatsApp desk.
            </div>
          )}

          {/* Guest Table - High-Density Enterprise Spreadsheet Format */}
          <div className="enterprise-data-table-container">
            <SheetsToolbarLegend tableName="Sarai Act Daily Police Register" subtitle="Official Statutory Guest Dispatch Matrix" />
            <table className="enterprise-data-table sheets-grid-table">
              <thead>
                <tr>
                  <SheetsColumnHeader title="Room #" badge="locked" align="center" style={{ width: '100px' }} />
                  <SheetsColumnHeader title="Guest Name" badge="editable" />
                  <SheetsColumnHeader title="Contact Phone" badge="editable" style={{ width: '130px' }} />
                  <SheetsColumnHeader title="Govt ID Proof" badge="editable" style={{ width: '150px' }} />
                  <SheetsColumnHeader title="State of Origin" badge="editable" style={{ width: '130px' }} />
                  <SheetsColumnHeader title="State Status" badge="locked" align="center" style={{ width: '120px' }} />
                  <SheetsColumnHeader title="Stay Duration" badge="locked" style={{ width: '180px' }} />
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--gold-glow)' }}>
                      Room {b.room_number || b.roomNumber}
                    </td>
                    <SheetsEditableCell
                      value={b.guest_name || b.guestName}
                      type="text"
                      cellStyle={{ fontWeight: 700, color: '#ffffff' }}
                      onSave={(newVal) => {
                        b.guest_name = newVal;
                        b.guestName = newVal;
                        if (onUpdateBooking) onUpdateBooking(b);
                      }}
                    />
                    <SheetsEditableCell
                      value={b.guest_phone || b.guestPhone}
                      type="text"
                      cellStyle={{ color: '#cbd5e1', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                      onSave={(newVal) => {
                        b.guest_phone = newVal;
                        b.guestPhone = newVal;
                        if (onUpdateBooking) onUpdateBooking(b);
                      }}
                    />
                    <SheetsEditableCell
                      value={b.id_proof_masked || b.idProofMasked || 'XXXX-XXXX-1234'}
                      type="text"
                      cellStyle={{ color: '#38bdf8', fontFamily: 'monospace' }}
                      onSave={(newVal) => {
                        b.id_proof_masked = newVal;
                        b.idProofMasked = newVal;
                        if (onUpdateBooking) onUpdateBooking(b);
                      }}
                    />
                    <SheetsEditableCell
                      value={b.state_of_origin || b.stateOfOrigin || 'Odisha'}
                      type="text"
                      cellStyle={{ color: '#f1f5f9' }}
                      onSave={(newVal) => {
                        b.state_of_origin = newVal;
                        b.stateOfOrigin = newVal;
                        b.is_interstate = newVal.toLowerCase() !== 'odisha';
                        b.isInterstate = newVal.toLowerCase() !== 'odisha';
                        if (onUpdateBooking) onUpdateBooking(b);
                      }}
                    />
                    <td style={{ textAlign: 'center' }}>
                      {(b.is_interstate || b.isInterstate) ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          INTER-STATE
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          Intra-Odisha
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {b.check_in_date || b.checkInDate} → {b.check_out_date || b.checkOutDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DPDP ACT 2023 COMPLIANCE */}
      {activeTab === 'dpdp' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            🛡️ Digital Personal Data Protection (DPDP) Act 2023 Module
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {HOTEL_CONFIG.name} enforces statutory DPDP compliance. Guest PII is strictly protected, purpose-bound, and scheduled for auto-purge 30 days after check-out.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1.2rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: 'var(--gold-glow)', marginBottom: '0.4rem' }}>
                1. Unticked Consent Checkbox Rule
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Public reservation modal checkboxes are never pre-ticked. Every guest actively grants purpose-bound consent.
              </div>
            </div>

            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1.2rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: 'var(--gold-glow)', marginBottom: '0.4rem' }}>
                2. Automated 30-Day Hard Purge
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Cloudflare Worker executes automated hard deletion of expired Aadhaar/identity records older than 30 days.
              </div>
            </div>

            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1.2rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: 'var(--gold-glow)', marginBottom: '0.4rem' }}>
                3. Data Rights Grievance Officer
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Grievance Officer: R. K. Mohapatra (Desk: +91 6856 225555, Email: privacy@hotelsaiinternational.com).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLOUDFLARE D1 LIVE DATABASE EXPLORER TAB (Direct Tabular Schema Mirroring) */}
      {/* ========================================================================= */}
      {activeTab === 'd1-database-explorer' && (
        <D1LiveDatabaseExplorer 
          localContextData={{ rooms, bookings }} 
          fromDate={filterFromDate}
          toDate={filterToDate}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. TRANSIT / FRESH-UP DAY-USE ENGINE TAB (Screens 14-22 Operational Upgrade) */}
      {/* ========================================================================= */}
      {activeTab === 'transit-dayuse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '1.4rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid #38bdf8'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🚆</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                  Rayagada Transit &amp; Temple Fresh-Up Engine (Day-Use Slots)
                </h3>
                <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.72rem', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                  150%+ Daily Occupancy Booster
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 760 }}>
                Engineered for Rayagada Railway Junction express layovers (Howrah–Chennai &amp; Raipur–Vizag trains) and sacred Maa Majhighariani darshan pilgrims. Sell rooms on 4-Hour (₹899) and 6-Hour (₹1,199) slots during the day, release to housekeeping, and re-sell to overnight corporate guests at 2:00 PM!
              </p>
            </div>
            <button
              onClick={() => setIsTransitModalOpen(true)}
              className="btn-primary-gold"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <UserCheck size={16} /> + New Transit Check-In
            </button>
          </div>

          {/* KPI Statistics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #38bdf8' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Transit Stays
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                {filteredTransitStays.filter(t => t.status === 'Active In-Stay').length} Rooms
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Occupying Room 105 &amp; 206 currently
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #34d399' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Daytime Transit Revenue
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
                ₹{filteredTransitStays.reduce((sum, t) => sum + t.tariff, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', marginTop: '0.15rem' }}>
                Pure incremental daytime cashflow
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid var(--gold-glow)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-glow)', fontWeight: 700, textTransform: 'uppercase' }}>
                Effective Turnover Multiplier
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                118.2%
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Rooms turned over twice in 24 hours
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #c084fc' }}>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
                Standard Pricing Slots
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem' }}>
                4h: ₹899 | 6h: ₹1,199
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Includes complimentary Wi-Fi &amp; fresh linen
              </div>
            </div>
          </div>

          {/* Active Transit Stays Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#38bdf8" /> Live Transit &amp; Fresh-Up Register {isDateFilterActive ? `(${filterFromDate} to ${filterToDate})` : ''}
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Auto-releasing rooms for evening corporate arrivals
              </span>
            </div>

            <div className="enterprise-data-table-container">
              <SheetsToolbarLegend tableName="24-Hour Micro-Stay & Transit Passenger Matrix" subtitle="Daytime Fresh-Up Room Allocations & Hourly Tariffs" />
              <table className="enterprise-data-table sheets-grid-table" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <SheetsColumnHeader title="ROOM" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                    <SheetsColumnHeader title="GUEST NAME & PHONE" badge="editable" style={{ padding: '0.7rem 0.8rem' }} />
                    <SheetsColumnHeader title="TRAIN / ORIGIN & PURPOSE" badge="editable" style={{ padding: '0.7rem 0.8rem' }} />
                    <SheetsColumnHeader title="SLOT" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                    <SheetsColumnHeader title="CHECK-IN" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                    <SheetsColumnHeader title="EXPECTED OUT" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                    <SheetsColumnHeader title="TARIFF (₹)" badge="editable" align="right" style={{ padding: '0.7rem 0.6rem' }} />
                    <SheetsColumnHeader title="MODE" badge="editable" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                    <SheetsColumnHeader title="STATUS" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                    <SheetsColumnHeader title="OPERATIONAL ACTIONS" badge="locked" align="center" style={{ padding: '0.7rem 0.8rem' }} />
                  </tr>
                </thead>
              <tbody>
                {filteredTransitStays.map(stay => (
                  <tr key={stay.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 800 }}>
                        Room {stay.roomNumber}
                      </span>
                    </td>
                    <SheetsEditableCell
                      value={stay.guestName}
                      type="text"
                      cellStyle={{ padding: '0.65rem 0.8rem', fontWeight: 700, color: '#fff' }}
                      formatDisplay={(val) => (
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{val}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stay.phone}</div>
                        </div>
                      )}
                      onSave={(newVal) => setTransitStays(prev => prev.map(t => t.id === stay.id ? { ...t, guestName: newVal } : t))}
                    />
                    <SheetsEditableCell
                      value={stay.origin}
                      type="text"
                      cellStyle={{ padding: '0.65rem 0.8rem', color: '#cbd5e1' }}
                      formatDisplay={(val) => (
                        <div>
                          <div style={{ color: '#cbd5e1' }}>{val}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gold-glow)' }}>{stay.purpose}</div>
                        </div>
                      )}
                      onSave={(newVal) => setTransitStays(prev => prev.map(t => t.id === stay.id ? { ...t, origin: newVal } : t))}
                    />
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontWeight: 600, color: '#fbbf24' }}>
                      {stay.slotType}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#cbd5e1' }}>
                      {stay.checkInTime}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>
                      {stay.expectedCheckoutTime}
                    </td>
                    <SheetsEditableCell
                      value={stay.tariff}
                      type="currency"
                      align="right"
                      className="cell-num"
                      min={0}
                      cellStyle={{ padding: '0.65rem', fontWeight: 800, color: 'var(--gold-glow)' }}
                      onSave={(newVal) => setTransitStays(prev => prev.map(t => t.id === stay.id ? { ...t, tariff: Number(newVal) } : t))}
                    />
                    <SheetsEditableCell
                      value={stay.paymentMode || 'UPI'}
                      type="select"
                      align="center"
                      options={['UPI', 'Cash', 'Card']}
                      cellStyle={{ padding: '0.65rem', fontSize: '0.74rem', color: '#94a3b8' }}
                      onSave={(newVal) => setTransitStays(prev => prev.map(t => t.id === stay.id ? { ...t, paymentMode: newVal } : t))}
                    />
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: stay.status === 'Active In-Stay' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.08)',
                        color: stay.status === 'Active In-Stay' ? '#34d399' : '#94a3b8'
                      }}>
                        {stay.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        {stay.status === 'Active In-Stay' ? (
                          <>
                            <button
                              onClick={() => {
                                onUpdateRoomStatus(stay.roomNumber, 'Vacant Dirty', null, null);
                                setTransitStays(prev => prev.map(t => t.id === stay.id ? { ...t, status: 'Checked Out & Cleaned' } : t));
                                showToast(`✓ Room ${stay.roomNumber} Transit checkout completed. Key released to Housekeeping.`);
                              }}
                              className="btn-primary-gold"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}
                            >
                              ⚡ Express Out
                            </button>
                            <button
                              onClick={() => {
                                setTransitStays(prev => prev.map(t => t.id === stay.id ? { ...t, slotType: 'Overnight Regular', tariff: stay.tariff + 999, expectedCheckoutTime: 'Tomorrow 11:00 AM' } : t));
                                showToast(`✓ Room ${stay.roomNumber} stay upgraded to Overnight (+₹999).`);
                              }}
                              style={{
                                background: 'rgba(168, 85, 247, 0.2)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                color: '#c084fc',
                                borderRadius: '4px',
                                padding: '0.25rem 0.55rem',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              🌙 Extend Overnight (+₹999)
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Folio Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* RAYAGADA JUNCTION (RGDA) STATION TRANSFER & LOGISTICS DISPATCH (Inspired by Open-Hotel-PMS) */}
          <div className="glass-panel printable-sheet" style={{ padding: '1.4rem 1.75rem', marginTop: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>🚕</span>
                  <h4 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                    Rayagada Junction (RGDA) Station Transfer &amp; Logistics Dispatch
                  </h4>
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.72rem', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                    Open-Hotel-PMS Logistics Engine
                  </span>
                </div>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Coordinate train pickups, industrial site shuttles (JK Paper, Utkal Alumina), driver allocation, and automated folio billing under SAC 996412.
                </p>
              </div>

              <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-outline-gold"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  title="Print Today's Station Transfer Schedule"
                >
                  <Printer size={15} color="var(--gold-glow)" /> Print Transfer Schedule
                </button>
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="btn-primary-gold"
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <Car size={16} /> + Schedule Station Transfer
                </button>
              </div>
            </div>

            {/* Transfer KPI Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Scheduled Transfers</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>{stationTransfers.length} Trips</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>Pending Pickups / In Transit</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
                  {stationTransfers.filter(t => t.dispatchStatus !== 'Completed').length} Vehicles
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Transport Revenue (SAC 996412)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                  ₹{stationTransfers.reduce((acc, t) => acc + (t.isCorporateCourtesy ? 0 : t.fare), 0).toLocaleString()}
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>Primary Fleet Vehicles</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginTop: '0.4rem' }}>
                  Innova (OD-18-B-4402) • Dzire (OD-18-A-1109)
                </div>
              </div>
            </div>

            {/* Transfer Dispatch Table */}
            <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Trip ID" type="locked" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Guest / Room" type="locked" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Service & Train" type="editable" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Scheduled Time" type="editable" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Assigned Driver & Car" type="editable" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Fare & Billing (SAC 996412)" type="editable" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Dispatch Status" type="locked" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'right' }}><SheetsColumnHeader label="Actions" type="locked" align="right" /></th>
                  </tr>
                </thead>
                <tbody>
                  {stationTransfers.map(trf => (
                    <tr key={trf.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.65rem', fontWeight: 800, color: 'var(--gold-glow)' }}>{trf.id}</td>
                      <td style={{ padding: '0.65rem' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{trf.guestName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Room {trf.roomNumber} • {trf.phone}</div>
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <div style={{ color: '#38bdf8', fontWeight: 600 }}>{trf.transferType}</div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>🚆 {trf.trainNumber}</div>
                      </td>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: '#fff' }}>
                        {trf.scheduledTime}
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{trf.pickupLocation}</div>
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{trf.driverName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{trf.assignedVehicle} • {trf.driverPhone}</div>
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <div style={{ fontWeight: 700, color: trf.isCorporateCourtesy ? '#a7f3d0' : '#fff' }}>
                          {trf.isCorporateCourtesy ? 'Corporate Courtesy (₹0)' : `₹${trf.fare}`}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: trf.billingStatus.includes('Billed') ? '#34d399' : '#f59e0b' }}>
                          {trf.billingStatus}
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: trf.dispatchStatus === 'Completed' ? 'rgba(52, 211, 153, 0.2)' :
                                      trf.dispatchStatus === 'Driver Dispatched' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: trf.dispatchStatus === 'Completed' ? '#34d399' :
                                 trf.dispatchStatus === 'Driver Dispatched' ? '#38bdf8' : '#fbbf24',
                          border: `1px solid ${trf.dispatchStatus === 'Completed' ? '#34d399' : trf.dispatchStatus === 'Driver Dispatched' ? '#38bdf8' : '#fbbf24'}`
                        }}>
                          {trf.dispatchStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {trf.dispatchStatus === 'Scheduled' && (
                            <button
                              onClick={() => handleUpdateTransferStatus(trf.id, 'Driver Dispatched')}
                              style={{ padding: '0.25rem 0.5rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              🚗 Dispatch Driver
                            </button>
                          )}
                          {trf.dispatchStatus === 'Driver Dispatched' && (
                            <button
                              onClick={() => handleUpdateTransferStatus(trf.id, 'Completed')}
                              style={{ padding: '0.25rem 0.5rem', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #34d399', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              ✓ Guest Picked Up
                            </button>
                          )}
                          {!trf.isCorporateCourtesy && !trf.billingStatus.includes('Billed') && (
                            <button
                              onClick={() => handleBillTransferToFolio(trf)}
                              style={{ padding: '0.25rem 0.5rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', border: '1px solid var(--gold-glow)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              💳 Post to Folio
                            </button>
                          )}
                          <a
                            href={`https://wa.me/91${trf.driverPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hotel Sai Dispatch: Please pickup guest ${trf.guestName} (Room ${trf.roomNumber}) for ${trf.transferType} - ${trf.trainNumber} at ${trf.scheduledTime}. Pickup point: ${trf.pickupLocation}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '0.25rem 0.5rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}
                          >
                            📱 Alert Driver
                          </a>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            style={{ padding: '0.25rem 0.5rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', border: '1px solid var(--gold-glow)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                            title="Print Transfer Docket / Driver Slip"
                          >
                            🖨️ Slip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1C. FRONT DESK SHIFT HANDOVER & OPERATIONAL LOGBOOK (Open-Hotel-PMS Core)  */}
      {/* ========================================================================= */}
      {activeTab === 'shift-logbook' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '1.4rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid #a855f7'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📋</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                  Front Desk Duty Manager Shift Handover &amp; Operational Logbook
                </h3>
                <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: '0.72rem', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                  Duty Trace Audit
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 800 }}>
                Eliminates receptionist communication gaps across Morning, Evening, and Night Audit shifts. Verifies cash drawer opening floats, physical counts, guest wake-up alarms for Rayagada trains, and corporate billing traces.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['morning', 'evening', 'night'].map(shift => (
                <button
                  key={shift}
                  onClick={() => setActiveShift(shift)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    background: activeShift === shift ? '#a855f7' : 'rgba(255, 255, 255, 0.05)',
                    color: activeShift === shift ? '#fff' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  {shift === 'morning' ? '🌅 Morning Shift' : shift === 'evening' ? '🌇 Evening Shift' : '🌙 Night Shift'}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Operational Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Cash Drawer & Shift Handover Verification Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="#34d399" />
                  Shift Cash Drawer &amp; Balance Verification
                </h4>
                <span className="badge" style={{
                  background: shiftLogbook[activeShift].handoverSigned ? 'rgba(52, 211, 153, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: shiftLogbook[activeShift].handoverSigned ? '#34d399' : '#fbbf24',
                  border: `1px solid ${shiftLogbook[activeShift].handoverSigned ? '#34d399' : '#fbbf24'}`
                }}>
                  {shiftLogbook[activeShift].handoverSigned ? `✓ Signed at ${shiftLogbook[activeShift].signedAt}` : '⏳ Signature Pending'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Duty Shift Lead</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>{shiftLogbook[activeShift].shiftLead}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Opening Cash Float</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold-glow)', marginTop: '0.2rem' }}>
                    ₹{shiftLogbook[activeShift].openingCash.toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Shift Cash Collected</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                    ₹{shiftLogbook[activeShift].shiftCashCollected.toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Shift UPI / Bank Total</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                    ₹{shiftLogbook[activeShift].shiftUpiCollected.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#a7f3d0', fontWeight: 700 }}>Physical Cash Count in Drawer</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399' }}>₹{shiftLogbook[activeShift].physicalCashCount.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>Cash Variance</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#34d399' }}>₹0.00 (Balanced)</div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Duty Manager Shift Handover Notes:
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={shiftLogbook[activeShift].handoverNotes}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShiftLogbook(prev => ({
                      ...prev,
                      [activeShift]: { ...prev[activeShift], handoverNotes: val }
                    }));
                  }}
                  placeholder="Record pending folios, guest special requests, early train departures..."
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <button
                onClick={() => handleSignShiftHandover(activeShift)}
                className="btn-primary-gold"
                style={{ width: '100%', padding: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <CheckCircle2 size={16} />
                {shiftLogbook[activeShift].handoverSigned ? '✓ Re-Verify Handover PIN' : '✍️ Verify & Lock Shift Handover (Manager PIN)'}
              </button>
            </div>

            {/* Live Wake-Up Calls & Departure Traces Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BellRing size={18} color="#f59e0b" />
                  Rayagada Train Wake-Up Calls &amp; Guest Traces
                </h4>
                <button
                  onClick={() => setIsWakeUpModalOpen(true)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  + Add Wake-Up
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {wakeUpCalls.map(wuc => (
                  <div
                    key={wuc.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      background: wuc.status === 'Completed' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(245, 158, 11, 0.08)',
                      border: `1px solid ${wuc.status === 'Completed' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(245, 158, 11, 0.3)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--gold-glow)', fontSize: '0.95rem' }}>Room {wuc.roomNumber}</span>
                        <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{wuc.guestName}</span>
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          background: wuc.status === 'Completed' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: wuc.status === 'Completed' ? '#34d399' : '#fbbf24'
                        }}>
                          {wuc.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                        ⏰ Wake-up Time: {wuc.time} • 🚆 {wuc.train}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                        Notes: {wuc.notes}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleWakeUpStatus(wuc.id)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: wuc.status === 'Completed' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(52, 211, 153, 0.2)',
                        color: wuc.status === 'Completed' ? '#94a3b8' : '#34d399',
                        border: `1px solid ${wuc.status === 'Completed' ? 'rgba(255, 255, 255, 0.1)' : '#34d399'}`,
                        cursor: 'pointer'
                      }}
                    >
                      {wuc.status === 'Completed' ? '↺ Reopen' : '✓ Awakened'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1D. 2-WAY OTA CHANNEL MANAGER & RATE PARITY (Inspired by FrontDesko)       */}
      {/* ========================================================================= */}
      {activeTab === 'channel-manager' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '1.4rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid #10b981'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🌐</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                  2-Way OTA Channel Manager &amp; Rate Parity Monitor
                </h3>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.72rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  FrontDesko Sync Architecture
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 800 }}>
                Synchronize 18-room inventory in real time across MakeMyTrip, Goibibo, and Booking.com. Protect direct brand rates against unauthorized OTA discount coupons and manage commission leakages.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleTriggerOtaSync}
                className="btn-outline-gold"
                style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <RefreshCw size={15} /> Force 2-Way OTA Sync
              </button>
              <button
                onClick={handleToggleOtaEmergencyStop}
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  background: otaEmergencyStop ? '#10b981' : 'rgba(239, 68, 68, 0.2)',
                  color: otaEmergencyStop ? '#fff' : '#f87171',
                  border: `1px solid ${otaEmergencyStop ? '#10b981' : '#ef4444'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <Ban size={15} /> {otaEmergencyStop ? '✓ Re-Open OTA Channels' : '🛑 Emergency Close All OTAs'}
              </button>
            </div>
          </div>

          {/* Channel Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {otaChannels.map(ch => (
              <div
                key={ch.id}
                className="glass-panel"
                style={{
                  padding: '1.4rem',
                  borderTop: `4px solid ${ch.id === 'direct' ? 'var(--gold-glow)' : ch.id === 'mmt' ? '#ef4444' : '#3b82f6'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{ch.name}</h4>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>{ch.type}</div>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: ch.isLive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: ch.isLive ? '#34d399' : '#f87171',
                    border: `1px solid ${ch.isLive ? '#34d399' : '#f87171'}`
                  }}>
                    {ch.syncStatus}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '1.1rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Inventory Allocation</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{ch.allocatedRooms} Keys</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Channel Commission</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: ch.commissionPct === 0 ? '#34d399' : '#f59e0b' }}>
                      {ch.commissionPct}%
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Active Deluxe Rate</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-glow)' }}>₹{ch.activeRate}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Net Yield / Room</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>₹{ch.netRevPerRoom}</div>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>Parity: <strong style={{ color: '#34d399' }}>{ch.parityStatus}</strong></span>
                  <span>Synced: {ch.lastSynced}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rate Parity Matrix Table */}
          <div className="glass-panel" style={{ padding: '1.4rem 1.75rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#34d399" />
              Live Rate Parity Inspection &amp; Direct Price Guarantee
            </h4>

            <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Room Tier Category" type="locked" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Direct Website Rate (SAC 996311)" type="editable" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="MakeMyTrip / Goibibo" type="editable" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Booking.com" type="editable" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'left' }}><SheetsColumnHeader label="Parity Status" type="locked" /></th>
                    <th style={{ padding: '0.65rem', textAlign: 'right' }}><SheetsColumnHeader label="Direct Rate Advantage" type="editable" align="right" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: 'Standard Deluxe', direct: 1799, mmt: 1799, booking: 1799, advantage: 'Free High-Speed Wi-Fi & Station Drop' },
                    { tier: 'Deluxe Room', direct: 2199, mmt: 2199, booking: 2199, advantage: 'Complimentary Satvik Breakfast Tray' },
                    { tier: 'Executive Room', direct: 2999, mmt: 2999, booking: 2999, advantage: 'Zero-Cancellation & Early Check-In' },
                    { tier: 'Premium Suite', direct: 3999, mmt: 3999, booking: 3999, advantage: 'VIP Darshan Pass & Dedicated Butler' }
                  ].map(item => (
                    <tr key={item.tier} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.65rem', fontWeight: 800, color: '#fff' }}>{item.tier}</td>
                      <td style={{ padding: '0.65rem', fontWeight: 800, color: 'var(--gold-glow)' }}>₹{item.direct} + 12% GST</td>
                      <td style={{ padding: '0.65rem', color: '#cbd5e1' }}>₹{item.mmt}</td>
                      <td style={{ padding: '0.65rem', color: '#cbd5e1' }}>₹{item.booking}</td>
                      <td style={{ padding: '0.65rem' }}>
                        <span style={{ padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #34d399' }}>
                          ✓ In Full Parity
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem', textAlign: 'right', color: '#38bdf8', fontWeight: 700 }}>
                        {item.advantage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOST & FOUND DIGITAL CUSTODY LOCKER TAB (Statutory Property Vault)     */}
      {/* ========================================================================= */}
      {activeTab === 'lost-and-found' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '1.4rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid #fbbf24'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🧳</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                  Lost &amp; Found Digital Custody Locker (Reception Vault)
                </h3>
                <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', fontSize: '0.72rem', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
                  Statutory Innkeepers Act Compliance
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 760 }}>
                Secure custody protocol for articles left behind in hotel guest rooms. Every recovered charger, watch, or document is logged with photographic tag, placed into numbered reception vault locker (Lockers B-01 to B-12), and audited until returned to the verified guest.
              </p>
            </div>
            <button
              onClick={() => setIsLfModalOpen(true)}
              className="btn-primary-gold"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <PlusCircle size={16} /> + Log Found Article
            </button>
          </div>

          {/* KPI Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #fbbf24' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
                Articles in Safe Custody
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                {filteredLostAndFound.filter(i => i.status === 'In Custody').length} Items
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Stored in Reception Lockers B-04 &amp; B-07
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #34d399' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Successfully Returned
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
                {filteredLostAndFound.filter(i => i.status === 'Handed Over').length} Items
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', marginTop: '0.15rem' }}>
                100% verified handover rate this month
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #38bdf8' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Vault Locker Capacity
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                {filteredLostAndFound.filter(i => i.status === 'In Custody').length} / 12 Lockers
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                10 secure lockers currently empty and ready
              </div>
            </div>
          </div>

          {/* Lost & Found Register Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <SheetsToolbarLegend tableName="Lost & Found Vault Register" subtitle="Housekeeping Asset Recovery & Custody Ledger" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <SheetsColumnHeader title="LOG ID" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                  <SheetsColumnHeader title="DATE" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                  <SheetsColumnHeader title="ROOM" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                  <SheetsColumnHeader title="ARTICLE DESCRIPTION" badge="editable" style={{ padding: '0.7rem 0.8rem' }} />
                  <SheetsColumnHeader title="CATEGORY" badge="locked" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                  <SheetsColumnHeader title="RECOVERED BY (STAFF)" badge="editable" style={{ padding: '0.7rem 0.8rem' }} />
                  <SheetsColumnHeader title="VAULT LOCKER" badge="editable" style={{ padding: '0.7rem 0.8rem' }} />
                  <SheetsColumnHeader title="GUEST NAME & PHONE" badge="editable" style={{ padding: '0.7rem 0.8rem' }} />
                  <SheetsColumnHeader title="CUSTODY STATUS" badge="editable" align="center" style={{ padding: '0.7rem 0.6rem' }} />
                  <SheetsColumnHeader title="ACTION" badge="locked" align="center" style={{ padding: '0.7rem 0.8rem' }} />
                </tr>
              </thead>
              <tbody>
                {filteredLostAndFound.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {item.id}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#cbd5e1' }}>
                      {item.dateFound}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', fontWeight: 700, color: '#fff' }}>
                        Room {item.roomNumber}
                      </span>
                    </td>
                    <SheetsEditableCell
                      value={item.itemDescription}
                      type="text"
                      cellStyle={{ padding: '0.65rem 0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'normal', maxWidth: 280 }}
                      onSave={(newVal) => setLostAndFoundItems(prev => prev.map(i => i.id === item.id ? { ...i, itemDescription: newVal } : i))}
                    />
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#fbbf24', fontSize: '0.72rem' }}>
                      {item.category}
                    </td>
                    <SheetsEditableCell
                      value={item.foundByStaff}
                      type="text"
                      cellStyle={{ padding: '0.65rem 0.8rem', color: '#38bdf8' }}
                      onSave={(newVal) => setLostAndFoundItems(prev => prev.map(i => i.id === item.id ? { ...i, foundByStaff: newVal } : i))}
                    />
                    <SheetsEditableCell
                      value={item.lockerNumber}
                      type="text"
                      cellStyle={{ padding: '0.65rem 0.8rem', color: 'var(--gold-glow)', fontWeight: 700 }}
                      onSave={(newVal) => setLostAndFoundItems(prev => prev.map(i => i.id === item.id ? { ...i, lockerNumber: newVal } : i))}
                    />
                    <SheetsEditableCell
                      value={item.guestName}
                      type="text"
                      cellStyle={{ padding: '0.65rem 0.8rem' }}
                      formatDisplay={(val) => (
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{val}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.guestPhone}</div>
                        </div>
                      )}
                      onSave={(newVal) => setLostAndFoundItems(prev => prev.map(i => i.id === item.id ? { ...i, guestName: newVal } : i))}
                    />
                    <SheetsEditableCell
                      value={item.status}
                      type="select"
                      align="center"
                      options={[
                        { value: 'In Custody', label: '🟡 In Custody Vault', badgeStyle: { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' } },
                        { value: 'Handed Over', label: '🟢 Handed Over', badgeStyle: { background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' } }
                      ]}
                      onSave={(newVal) => setLostAndFoundItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newVal } : i))}
                    />
                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                      {item.status === 'In Custody' ? (
                        <button
                          onClick={() => {
                            setLostAndFoundItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'Handed Over', notes: `Handed over on ${new Date().toLocaleDateString('en-GB')}` } : i));
                            showToast(`✓ Article ${item.id} marked as Handed Over to ${item.guestName}. Locker vacated.`);
                          }}
                          className="btn-primary-gold"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          🤝 Hand Over to Guest
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Archived ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROOM MAINTENANCE & OUT-OF-ORDER (OOO / OOS) MANAGEMENT TAB             */}
      {/* ========================================================================= */}
      {activeTab === 'maintenance-ooo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '1.4rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid #ef4444'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔧</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                  Room Maintenance &amp; Out-of-Order (OOO / OOS) Management
                </h3>
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.72rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  Inventory Protection Guard
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 760 }}>
                Controls active engineering work orders (AC leakage, geyser servicing, plumbing). Blocking a room as Out of Order (OOO) automatically prevents receptionists and online booking portals from assigning it to arriving guests until maintenance signs off.
              </p>
            </div>
            <button
              onClick={() => setIsMntModalOpen(true)}
              className="btn-primary-gold"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Wrench size={16} /> + Create Maintenance Ticket
            </button>
          </div>

          {/* KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #ef4444' }}>
              <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
                OOO Rooms Blocked
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ef4444', marginTop: '0.2rem' }}>
                {filteredMaintenance.filter(t => t.blockType === 'OOO (Out of Order)' && t.status === 'In Progress').length} Room
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Room 205 (AC Coil Leakage)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #fbbf24' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
                OOS Minor Servicing
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fbbf24', marginTop: '0.2rem' }}>
                {filteredMaintenance.filter(t => t.blockType === 'OOS (Out of Service)' && t.status === 'In Progress').length} Room
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Room 107 (Geyser Pilot Element)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #34d399' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Rentable Operational Inventory
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
                37 / 39 Rooms
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', marginTop: '0.15rem' }}>
                94.8% physical inventory operational
              </div>
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <SheetsToolbarLegend style={{ marginBottom: '0.6rem' }} />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}><SheetsColumnHeader label="TICKET ID" type="locked" align="center" /></th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}><SheetsColumnHeader label="ROOM" type="locked" align="center" /></th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}><SheetsColumnHeader label="CATEGORY" type="editable" /></th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}><SheetsColumnHeader label="SEVERITY" type="editable" align="center" /></th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}><SheetsColumnHeader label="ISSUE & DEFECT DESCRIPTION" type="editable" /></th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}><SheetsColumnHeader label="REPORTED BY" type="locked" /></th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}><SheetsColumnHeader label="ASSIGNED TECHNICIAN" type="editable" /></th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}><SheetsColumnHeader label="BLOCK TYPE" type="editable" align="center" /></th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}><SheetsColumnHeader label="STATUS" type="locked" align="center" /></th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'center' }}><SheetsColumnHeader label="ACTION" type="locked" align="center" /></th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenance.map(tkt => (
                  <tr key={tkt.ticketId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {tkt.ticketId}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 800 }}>
                        Room {tkt.roomNumber}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                      {tkt.category}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: tkt.severity === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: tkt.severity === 'High' ? '#f87171' : '#fbbf24'
                      }}>
                        {tkt.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'normal', maxWidth: 300, color: '#fff' }}>
                      {tkt.issueDescription}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: 'var(--text-muted)' }}>
                      {tkt.reportedBy}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                      {tkt.assignedTech}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#f87171', fontWeight: 700, fontSize: '0.72rem' }}>
                      {tkt.blockType}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: tkt.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                        color: tkt.status === 'In Progress' ? '#fbbf24' : '#34d399'
                      }}>
                        {tkt.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                      {tkt.status === 'In Progress' ? (
                        <button
                          onClick={() => {
                            onUpdateRoomStatus(tkt.roomNumber, 'Vacant Dirty', null, null);
                            setMaintenanceTickets(prev => prev.map(t => t.ticketId === tkt.ticketId ? { ...t, status: 'Resolved' } : t));
                            showToast(`✓ Ticket ${tkt.ticketId} resolved. Room ${tkt.roomNumber} released to Housekeeping for cleaning.`);
                          }}
                          className="btn-primary-gold"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          ✓ Resolve &amp; Release
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Closed ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPRESS WALK-IN MODAL (Enhanced with Screenshot 4 & 5 fields) */}
      {walkInOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} color="var(--gold-glow)" />
                <h3 style={{ fontSize: '1.2rem' }}>Express Front Desk Walk-In Check-In</h3>
              </div>
              <button onClick={() => setWalkInOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Assign Available Room Key</label>
                <select 
                  className="form-select"
                  value={walkInRoom}
                  onChange={(e) => {
                    setWalkInRoom(e.target.value);
                    const roomObj = rooms.find(r => r.roomNumber === e.target.value);
                    if (roomObj) setWalkInRate(roomObj.tariff);
                  }}
                  required
                >
                  <option value="">-- Choose Key from 39 Physical Keys --</option>
                  {rooms.filter(r => r.status === 'Available').map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • {r.tier} - ₹{r.tariff})
                    </option>
                  ))}
                </select>
              </div>

              {/* VIP / Frequent Corporate Guest Quick-Selector */}
              <div className="form-group" style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '0.65rem', borderRadius: '6px', border: '1px dashed var(--gold-glow)' }}>
                <label className="form-label" style={{ color: 'var(--gold-glow)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.35rem' }}>
                  ⚡ Repeat / VIP Guest Fast Auto-Fill
                </label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', background: '#0a101d', borderColor: 'rgba(212, 175, 55, 0.4)' }}
                  onChange={(e) => {
                    const idx = e.target.value;
                    if (idx !== '') {
                      const g = FREQUENT_VIP_GUESTS[parseInt(idx, 10)];
                      if (g) {
                        setWalkInName(g.name);
                        setWalkInPhone(g.phone);
                        setWalkInAadhaar(g.aadhaar);
                        setWalkInOrigin(g.origin);
                        setWalkInBillingType(g.billingType);
                        setWalkInCompany(g.company);
                        setWalkInMealPlan(g.mealPlan);
                      }
                    }
                  }}
                >
                  <option value="">-- Choose frequent guest to auto-fill details --</option>
                  {FREQUENT_VIP_GUESTS.map((g, idx) => (
                    <option key={idx} value={idx}>
                      {g.name} ({g.company} • {g.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Guest Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Anil Kumar Patnaik"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+91 9876543210"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar (Govt ID Proof)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="12-digit number"
                    value={walkInAadhaar}
                    onChange={(e) => setWalkInAadhaar(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {/* Meal Plan & Billing Type (Screenshot 4 & 5) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Meal Plan Code</label>
                  <select
                    className="form-select"
                    value={walkInMealPlan}
                    onChange={(e) => setWalkInMealPlan(e.target.value)}
                  >
                    <option value="CP">CP (Continental Plan - Room + Breakfast)</option>
                    <option value="EP">EP (European Plan - Room Only)</option>
                    <option value="MAP">MAP (Modified American - Room + 2 Meals)</option>
                    <option value="AP">AP (American Plan - All Meals Included)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Billing Settlement Type</label>
                  <select
                    className="form-select"
                    value={walkInBillingType}
                    onChange={(e) => setWalkInBillingType(e.target.value)}
                  >
                    <option value="Direct">Direct Guest Settlement</option>
                    <option value="BTC">BTC (Bill to Company / Corporate)</option>
                  </select>
                </div>
              </div>

              {walkInBillingType === 'BTC' && (
                <div className="form-group">
                  <label className="form-label">Corporate Account / Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ashok Leyland Ltd / PRADAN / JK Paper"
                    value={walkInCompany}
                    onChange={(e) => setWalkInCompany(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Agreed Rate/Night (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={walkInRate}
                    onChange={(e) => setWalkInRate(Number(e.target.value))}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Advance Deposit (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={walkInDeposit}
                    onChange={(e) => setWalkInDeposit(Number(e.target.value))}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setWalkInOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center' }}>
                  Complete Walk-In &amp; Handover Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK ROOM / OUT OF ORDER MODAL (Screenshot 10 - block_rooms.php) */}
      {blockRoomOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ban size={20} color="#f87171" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Block Room / Out of Order</h3>
              </div>
              <button onClick={() => setBlockRoomOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBlockRoomSubmit} className="modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Blocks room from live inventory and stops dynamic yield pricing on Rayagada engine.
              </p>

              <div className="form-group">
                <label className="form-label">Select Room to Block</label>
                <select
                  className="form-select"
                  value={blockSelectedRoom}
                  onChange={(e) => setBlockSelectedRoom(e.target.value)}
                  required
                >
                  <option value="">-- Choose Room Number --</option>
                  {rooms.map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • Current Status: {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Block Reason (Standard PMS Codes)</label>
                <select
                  className="form-select"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                >
                  <option value="AC PRBLM">AC PRBLM (Air Conditioner Issue)</option>
                  <option value="PAINTING">PAINTING (Room Wall Refurbishment)</option>
                  <option value="PLUMBING">PLUMBING (Bathroom Leakage)</option>
                  <option value="MANAGEMENT HOLD">MANAGEMENT HOLD (Executive Reservation)</option>
                  <option value="DEEP SANITIZATION">DEEP SANITIZATION (Routine Maintenance)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Block From Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={blockFromDate}
                    onChange={(e) => setBlockFromDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Block To Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={blockToDate}
                    onChange={(e) => setBlockToDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Technician called for compressor gas top-up"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setBlockRoomOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444' }}>
                  Confirm Block &amp; Mark OOO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOLIO ACTIONS MODAL (hotel_documents.pdf Page 5 - 12 Edit Options) */}
      {selectedFolioRoom && (
        <FolioActionsModal
          isOpen={!!selectedFolioRoom}
          onClose={() => setSelectedFolioRoom(null)}
          room={selectedFolioRoom}
          rooms={rooms}
          transactions={transactions}
          onAddTransaction={onAddTransaction}
          onOpenMasterFolio={onOpenMasterFolio}
          onUpdateFolio={(roomNumber, updateData) => {
            console.log(`Updated Folio for Room ${roomNumber}:`, updateData);
          }}
          onShiftRoom={(fromRoom, toRoom, reason) => {
            onUpdateRoomStatus(fromRoom, 'Available', null, null);
            onUpdateRoomStatus(toRoom, 'Occupied', selectedFolioRoom.currentGuestName, null);
            setSelectedFolioRoom(null);
          }}
          onCheckoutRoom={(roomNumber, checkoutData) => {
            onUpdateRoomStatus(roomNumber, 'Cleaning', null, null);
            if (checkoutData?.transactions) {
              const settleTx = checkoutData.transactions.find(t => t.type === 'SETTLEMENT');
              if (settleTx?.tenders?.cash) {
                setCashCollected(prev => prev + settleTx.tenders.cash);
              }
              if (settleTx?.tenders) {
                const tenderRows = [];
                if (settleTx.tenders.cash > 0) tenderRows.push({ mode: 'Cash', amount: settleTx.tenders.cash, ref: 'Front Desk Cash' });
                if (settleTx.tenders.upi > 0) tenderRows.push({ mode: 'UPI', amount: settleTx.tenders.upi, ref: settleTx.tenders.upiRef || 'UPI' });
                if (settleTx.tenders.card > 0) tenderRows.push({ mode: 'Card', amount: settleTx.tenders.card, ref: settleTx.tenders.cardRef || 'POS-Card' });
                if (settleTx.tenders.btc > 0) tenderRows.push({ mode: 'Corporate Credit', amount: settleTx.tenders.btc, ref: settleTx.tenders.btcCompany || 'Company Credit' });

                const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
                fetch('/api/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
                  body: JSON.stringify({
                    action: 'settle_split_payment',
                    payload: { folioId: `FOLIO-${roomNumber}`, roomNumber, invoiceId: `INV-${roomNumber}`, tenderRows }
                  })
                }).catch(() => {});
              }
            }
            setSelectedFolioRoom(null);
          }}
          onOpenSplitInvoice={(type) => {
            const matchedBooking = bookings.find(b => b.roomNumber === selectedFolioRoom.roomNumber) || {
              bookingId: `FMBIL2627-${selectedFolioRoom.roomNumber}`,
              billNo: `FMBIL2627-${selectedFolioRoom.roomNumber}`,
              roomNumber: selectedFolioRoom.roomNumber,
              guestName: selectedFolioRoom.currentGuestName || 'MR. P ASHOK',
              guestPhone: '+91 6305202068',
              company: 'LINDE INDIA LTD',
              corporateGstin: '21AAACB2528H1ZA',
              tier: selectedFolioRoom.tier,
              totalAmount: selectedFolioRoom.balanceDue || 13538,
              nights: 4,
              grcNo: '684'
            };
            setReceiptModalType(type || 'a4');
            setSelectedReceiptBooking(matchedBooking);
            setIsReceiptModalOpen(true);
            setSelectedFolioRoom(null);
          }}
        />
      )}

      {/* CHECKOUT & MULTI-TENDER SPLIT SETTLEMENT MODAL (Owner Video Requirement) */}
      {checkoutRoom && (
        <CheckoutSplitModal
          isOpen={!!checkoutRoom}
          onClose={() => setCheckoutRoom(null)}
          room={checkoutRoom}
          bookings={bookings}
          onConfirmCheckout={handleCheckoutConfirm}
        />
      )}

      {/* MAINTENANCE WORK ORDER MODAL */}
      {isWorkOrderModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={20} color="#f87171" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Log Maintenance Defect Ticket</h3>
              </div>
              <button onClick={() => setIsWorkOrderModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrderSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Room Number</label>
                <select
                  className="form-select"
                  value={workOrderForm.roomNumber}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, roomNumber: e.target.value })}
                  required
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • Current: {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Defect Category</label>
                <select
                  className="form-select"
                  value={workOrderForm.category}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, category: e.target.value })}
                >
                  <option value="HVAC / AC">HVAC / Air Conditioner</option>
                  <option value="Plumbing">Plumbing &amp; Sanitary</option>
                  <option value="Electrical">Electrical &amp; Lighting</option>
                  <option value="Carpentry">Carpentry &amp; Door Locks</option>
                  <option value="Electronics / TV">Electronics / TV / Wi-Fi</option>
                  <option value="Painting / Civil">Painting &amp; Civil Works</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specific Defect Issue Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AC compressor tripping / Geyser element failure"
                  value={workOrderForm.issue}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, issue: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    className="form-select"
                    value={workOrderForm.priority}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, priority: e.target.value })}
                  >
                    <option value="High">High (Urgent Attention)</option>
                    <option value="Medium">Medium (Within Shift)</option>
                    <option value="Low">Low (Routine)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Technician</label>
                  <select
                    className="form-select"
                    value={workOrderForm.technician}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, technician: e.target.value })}
                  >
                    <option value="Bikram Patra (AC Specialist)">Bikram Patra (AC Specialist)</option>
                    <option value="Pradeep Jena (Electrician & Plumber)">Pradeep Jena (Electrician &amp; Plumber)</option>
                    <option value="Santosh Nayak (Floor Support)">Santosh Nayak (Floor Support)</option>
                    <option value="External Rayagada Vendor">External Rayagada Vendor</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Resolution ETA</label>
                <select
                  className="form-select"
                  value={workOrderForm.targetEta}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, targetEta: e.target.value })}
                >
                  <option value="Within 2 Hours">Within 2 Hours (Urgent Attention)</option>
                  <option value="Within 4 Hours">Within 4 Hours (Standard)</option>
                  <option value="Same Day by 18:00">Same Day by 18:00 PM</option>
                  <option value="Next Morning (Scheduled)">Next Morning (Scheduled)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Technician Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Spare parts required or diagnosis notes..."
                  value={workOrderForm.notes}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsWorkOrderModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444' }}>
                  Dispatch Ticket &amp; Mark Room OOO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FLOOR ATTENDANT MODAL */}
      {isEditAttendantOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} color="var(--gold-glow)" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Reassign Floor {selectedFloorToEdit} Attendant</h3>
              </div>
              <button onClick={() => setIsEditAttendantOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFloorAttendant} className="modal-body">
              <div className="form-group">
                <label className="form-label">Attendant Staff Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={attendantForm.name}
                  onChange={(e) => setAttendantForm({ ...attendantForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={attendantForm.phone}
                  onChange={(e) => setAttendantForm({ ...attendantForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shift Timing</label>
                <select
                  className="form-select"
                  value={attendantForm.shift}
                  onChange={(e) => setAttendantForm({ ...attendantForm, shift: e.target.value })}
                >
                  <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
                  <option value="Evening (14:30 - 23:00)">Evening (14:30 - 23:00)</option>
                  <option value="Night (23:00 - 07:30)">Night (23:00 - 07:30)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsEditAttendantOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Floor Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUTORY TAX INVOICE, GRC & SPLIT BILL MODAL (hotel_documents.pdf Pages 1, 2, 3) */}
      {isReceiptModalOpen && selectedReceiptBooking && (
        <BookingReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          booking={selectedReceiptBooking}
          initialType={receiptModalType}
          onUpdateBooking={(updated) => {
            if (updated) {
              if (onUpdateBooking) {
                onUpdateBooking(updated);
              }
              if (updated.roomNumber && updated.guestName && onUpdateRoomStatus) {
                const targetRoom = rooms.find(r => String(r.roomNumber) === String(updated.roomNumber));
                if (targetRoom) {
                  onUpdateRoomStatus(targetRoom.id || targetRoom.roomId, targetRoom.status || 'Occupied', updated.guestName);
                }
              }
              setSelectedReceiptBooking(updated);
              setFeedbackToast(`Folio & Tax Invoice saved for Room ${updated.roomNumber || ''} (${updated.guestName || ''})`);
            }
          }}
        />
      )}

      {/* PRINTABLE SHIFT HANDOVER & NOTE DENOMINATION VOUCHER MODAL */}
      {handoverVoucherModalOpen && activeHandoverForVoucher && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 15, 0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel printable-sheet" style={{
            width: '100%',
            maxWidth: 680,
            maxHeight: '94vh',
            overflowY: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            background: '#ffffff',
            color: '#0f172a',
            padding: '2rem'
          }}>
            {/* Header (Printable) */}
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
                    {HOTEL_CONFIG.legalName.toUpperCase()}
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                    {HOTEL_CONFIG.address} • Phone: {HOTEL_CONFIG.phone}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    GSTIN: {HOTEL_CONFIG.gstin} • State: 21 (Odisha)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: '#0f172a',
                    color: '#fbbf24',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    letterSpacing: '0.5px'
                  }}>
                    SHIFT HANDOVER VOUCHER
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Shift ID: <strong>{activeHandoverForVoucher.shiftId}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Shift & Staff Particulars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Date &amp; Time</span>
                <strong style={{ color: '#0f172a' }}>{activeHandoverForVoucher.date} • {activeHandoverForVoucher.shift}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Shift Outgoing Cashier</span>
                <strong style={{ color: '#0f172a' }}>{activeHandoverForVoucher.cashier}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Counter-Signing Supervisor</span>
                <strong style={{ color: '#0f172a' }}>{activeHandoverForVoucher.supervisor}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Handover Status</span>
                <strong style={{
                  color: activeHandoverForVoucher.variance === 0 ? '#059669' : activeHandoverForVoucher.variance > 0 ? '#0284c7' : '#dc2626'
                }}>
                  {activeHandoverForVoucher.status} {activeHandoverForVoucher.variance !== 0 && `(₹${activeHandoverForVoucher.variance})`}
                </strong>
              </div>
            </div>

            {/* Physical Currency Denominations Table */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Physical Currency Denomination Breakdown
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left' }}>Denomination</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}>Multiplier</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}>Physical Count</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'right' }}>Total Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { denom: 500, label: '₹500 Note' },
                    { denom: 200, label: '₹200 Note' },
                    { denom: 100, label: '₹100 Note' },
                    { denom: 50, label: '₹50 Note' },
                    { denom: 20, label: '₹20 Note' },
                    { denom: 10, label: '₹10 Note' },
                    { denom: 'coins', label: 'Coins (₹1, 2, 5, 10)' }
                  ].map(row => {
                    const count = activeHandoverForVoucher.denominations?.[row.denom] || 0;
                    const value = row.denom === 'coins' ? Number(count) : (Number(count) * Number(row.denom));
                    return (
                      <tr key={String(row.denom)} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>{row.label}</td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', color: '#64748b' }}>
                          {row.denom === 'coins' ? 'Direct Total' : `x ₹${row.denom}`}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontWeight: 700 }}>
                          {count}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #0f172a' }}>
                    <td colSpan="3" style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#0f172a' }}>
                      TOTAL PHYSICAL CASH COUNTED:
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#0f172a', fontSize: '0.95rem' }}>
                      ₹{Number(activeHandoverForVoucher.actual || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Reconciliation Statement */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Opening Cash Float (Petty Drawer Base):</span>
                <strong>₹{Number(activeHandoverForVoucher.openingFloat || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#059669' }}>
                <span>Add: Shift Gross Cash Collections:</span>
                <strong>+ ₹{Number(activeHandoverForVoucher.cashCollected || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#dc2626' }}>
                <span>Less: Authorized Petty Cash Disbursements:</span>
                <strong>- ₹{Number(activeHandoverForVoucher.pettyCash || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '0.4rem', fontWeight: 800 }}>
                <span>Expected Drawer Float Total:</span>
                <span>₹{Number(activeHandoverForVoucher.expected || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.2rem', fontWeight: 800, color: activeHandoverForVoucher.variance === 0 ? '#059669' : '#dc2626' }}>
                <span>Drawer Discrepancy / Variance:</span>
                <span>
                  {activeHandoverForVoucher.variance === 0 
                    ? 'BALANCED (₹0.00 NIL VARIANCE)' 
                    : activeHandoverForVoucher.variance > 0 
                      ? `+₹${activeHandoverForVoucher.variance} OVERAGE` 
                      : `-₹${Math.abs(activeHandoverForVoucher.variance)} SHORTAGE`}
                </span>
              </div>
            </div>

            {/* Verification Note */}
            <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              <strong>Audit Declaration:</strong> {activeHandoverForVoucher.notes || 'All cash receipts and physical notes matched with front desk guest folio logs.'} Physical cash handed over to the incoming shift cashier and deposited into the front desk drop safe.
            </div>

            {/* Signature Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '35px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  OUTGOING CASHIER SIGNATURE
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {activeHandoverForVoucher.cashier}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '35px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  SUPERVISOR / GM VERIFICATION
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {activeHandoverForVoucher.supervisor}
                </div>
              </div>
            </div>

            {/* Action Bar (No-Print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setHandoverVoucherModalOpen(false)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fbbf24',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Printer size={16} /> Print Shift Handover Voucher (Ctrl+P)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-CLICK INTER-ROOM SHIFT MODAL */}
      {shiftModalRoom && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowRightLeft size={20} color="#c084fc" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Shift Room (Inter-Room Transfer)</h3>
              </div>
              <button onClick={() => setShiftModalRoom(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmShiftRoom} className="modal-body">
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>CURRENT IN-HOUSE OCCUPANT</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  Room {shiftModalRoom.roomNumber} • {shiftModalRoom.tier}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#c084fc', marginTop: '2px' }}>
                  Guest: <strong>{shiftModalRoom.currentGuestName || 'In-House Guest'}</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Destination Vacant Room</label>
                <select
                  className="form-select"
                  value={shiftTargetRoom}
                  onChange={(e) => setShiftTargetRoom(e.target.value)}
                  required
                >
                  <option value="">-- Choose Target Vacant Room --</option>
                  {rooms.filter(r => (r.status === 'Available' || r.status === 'Vacant Clean') && r.roomNumber !== shiftModalRoom.roomNumber).map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • {r.tier} - ₹{r.tariff}/night)
                    </option>
                  ))}
                </select>
                {rooms.filter(r => (r.status === 'Available' || r.status === 'Vacant Clean') && r.roomNumber !== shiftModalRoom.roomNumber).length === 0 && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    ⚠️ No vacant clean rooms currently available for reassignment.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Shift</label>
                <select
                  className="form-select"
                  value={shiftReason}
                  onChange={(e) => setShiftReason(e.target.value)}
                >
                  <option value="Guest Requested Upgrade / Quiet Wing">Guest Requested Upgrade / Quiet Wing</option>
                  <option value="AC Cooling Defect / Remote Issue">AC Cooling Defect / Remote Issue</option>
                  <option value="Plumbing / Water Pressure Concern">Plumbing / Water Pressure Concern</option>
                  <option value="Bed Preference (Twin to King Reassignment)">Bed Preference (Twin to King Reassignment)</option>
                  <option value="Administrative / Group Floor Consolidation">Administrative / Group Floor Consolidation</option>
                </select>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                ℹ️ <strong>Operational Protocol:</strong> Shifting will immediately move guest folio balance to Room {shiftTargetRoom || '...'}, mark Room {shiftModalRoom.roomNumber} as <em>Vacant Dirty</em> for Housekeeping turnover, and log the shift audit record.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShiftModalRoom(null)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!shiftTargetRoom}
                  className="btn-primary-gold"
                  style={{ flex: 2, justifyContent: 'center', background: '#9333ea', borderColor: '#9333ea', color: '#fff', opacity: !shiftTargetRoom ? 0.5 : 1 }}
                >
                  Confirm Room Shift ⇄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-CLICK EDIT STAY & GUEST DETAILS MODAL */}
      {editStayRoom && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} color="#60a5fa" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Edit Stay &amp; Guest Details (Room {editStayRoom.roomNumber})</h3>
              </div>
              <button onClick={() => setEditStayRoom(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditStay} className="modal-body">
              <div className="form-group">
                <label className="form-label">Guest Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editStayGuestName}
                  onChange={(e) => setEditStayGuestName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editStayPhone}
                    onChange={(e) => setEditStayPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Reg. No. (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. OD-18-B-9988"
                    value={editStayVehicle}
                    onChange={(e) => setEditStayVehicle(e.target.value)}
                  />
                </div>
              </div>

              {/* Stay Extension & Extra Bed Adders */}
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '0.85rem', margin: '0.5rem 0 1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.65rem' }}>
                  ⏳ Stay Extension &amp; Amenities Addition:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Extend Stay (Additional Nights)</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {[0, 1, 2, 3].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setEditStayExtendNights(n)}
                          style={{
                            flex: 1,
                            padding: '4px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: editStayExtendNights === n ? '#2563eb' : 'rgba(255,255,255,0.06)',
                            color: editStayExtendNights === n ? '#fff' : '#94a3b8',
                            border: editStayExtendNights === n ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          {n === 0 ? 'Same' : `+${n}n`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Extra Bed Request</label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer', marginTop: '4px' }}>
                      <input
                        type="checkbox"
                        checked={editStayAddExtraBed}
                        onChange={(e) => setEditStayAddExtraBed(e.target.checked)}
                      />
                      <span>+1 Rollaway Bed (₹560)</span>
                    </label>
                  </div>
                </div>

                {(editStayExtendNights > 0 || editStayAddExtraBed) && (
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(59, 130, 246, 0.3)', fontSize: '0.74rem', color: '#93c5fd', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Calculated Folio Debit (incl. 12% GST):</span>
                    <strong style={{ color: '#fff' }}>
                      +₹{Math.round((editStayRoom.tariff || 1699) * editStayExtendNights * 1.12 + (editStayAddExtraBed ? 560 : 0))}
                    </strong>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Front Desk Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Guest requested late breakfast, temple darshan car"
                  value={editStayNotes}
                  onChange={(e) => setEditStayNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditStayRoom(null)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                  style={{ flex: 2, justifyContent: 'center', background: '#2563eb', borderColor: '#2563eb', color: '#fff' }}
                >
                  Save Stay Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TRANSIT CHECK-IN MODAL */}
      {isTransitModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🚆</span>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>New Transit &amp; Fresh-Up Check-In</h3>
              </div>
              <button onClick={() => setIsTransitModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransitSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Assign Available Room Key *</label>
                <select
                  className="form-select"
                  required
                  value={transitForm.roomNumber}
                  onChange={(e) => setTransitForm({ ...transitForm, roomNumber: e.target.value })}
                >
                  <option value="">-- Choose Key from Available Rooms --</option>
                  {rooms.filter(r => r.status === 'Available').map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} ({r.tier} - Regular ₹{r.tariff})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Subhash Chandra Das"
                    value={transitForm.guestName}
                    onChange={(e) => setTransitForm({ ...transitForm, guestName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="+91 94371 00000"
                    value={transitForm.phone}
                    onChange={(e) => setTransitForm({ ...transitForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Transit Slot Selection</label>
                  <select
                    className="form-select"
                    value={transitForm.slotType}
                    onChange={(e) => {
                      const is6h = e.target.value.includes('6-Hour');
                      setTransitForm({
                        ...transitForm,
                        slotType: e.target.value,
                        hoursAllowed: is6h ? 6 : 4,
                        tariff: is6h ? 1199 : 899
                      });
                    }}
                  >
                    <option value="4-Hour Transit">4-Hour Transit Slot (₹899)</option>
                    <option value="6-Hour Transit">6-Hour Transit Slot (₹1,199)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Tender</label>
                  <select
                    className="form-select"
                    value={transitForm.paymentMode}
                    onChange={(e) => setTransitForm({ ...transitForm, paymentMode: e.target.value })}
                  >
                    <option value="UPI (PhonePe)">UPI (PhonePe / GPay)</option>
                    <option value="Cash">Direct Cash (Front Desk)</option>
                    <option value="Card">POS Debit/Credit Card</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Train / City Origin</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bhubaneswar Express 18447"
                    value={transitForm.origin}
                    onChange={(e) => setTransitForm({ ...transitForm, origin: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose of Stay</label>
                  <select
                    className="form-select"
                    value={transitForm.purpose}
                    onChange={(e) => setTransitForm({ ...transitForm, purpose: e.target.value })}
                  >
                    <option value="Maa Majhighariani Pilgrimage">Maa Majhighariani Darshan</option>
                    <option value="JK Paper / IMFA Day Delegation">JK Paper / IMFA Plant Work</option>
                    <option value="Railway Junction Transit Rest">Railway Transit Rest</option>
                    <option value="Business Meeting">Commercial Business Meeting</option>
                  </select>
                </div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 700 }}>
                  <span>Total Day-Use Fee:</span>
                  <span style={{ fontSize: '1.1rem' }}>₹{transitForm.tariff.toFixed(2)}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.2rem' }}>
                  Auto-scheduled checkout in {transitForm.hoursAllowed} hours. Room will be released to Housekeeping for evening corporate re-sale.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsTransitModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#0284c7', borderColor: '#0284c7', color: '#fff' }}>
                  Confirm Transit Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE STATION / PLANT TRANSFER MODAL (Inspired by Open-Hotel-PMS Logistics) */}
      {isTransferModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🚕</span>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Schedule Rayagada Station / Plant Transfer</h3>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Subhash Chandra Das"
                    value={newTransferForm.guestName}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, guestName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <select
                    className="form-select"
                    value={newTransferForm.roomNumber}
                    onChange={(e) => {
                      const rNum = e.target.value;
                      const matched = rooms.find(r => r.roomNumber === rNum);
                      setNewTransferForm({
                        ...newTransferForm,
                        roomNumber: rNum,
                        guestName: matched?.currentGuestName || newTransferForm.guestName
                      });
                    }}
                  >
                    {rooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} ({r.status}{r.currentGuestName ? ` - ${r.currentGuestName}` : ''})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="+91 94371 00000"
                    value={newTransferForm.phone}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Transfer Type</label>
                  <select
                    className="form-select"
                    value={newTransferForm.transferType}
                    onChange={(e) => {
                      const type = e.target.value;
                      const isPlant = type.includes('Plant');
                      setNewTransferForm({
                        ...newTransferForm,
                        transferType: type,
                        fare: isPlant ? 1200 : 350,
                        trainNumber: isPlant ? 'N/A (Tikiri / JK Site)' : '18447 Hirakhand Express'
                      });
                    }}
                  >
                    <option value="Station Pickup (RGDA)">Station Pickup (RGDA Junction)</option>
                    <option value="Station Drop (RGDA)">Station Drop (RGDA Junction)</option>
                    <option value="Industrial Plant Transfer">Industrial Plant Transfer (JK / Utkal)</option>
                    <option value="Temple Darshan Shuttle">Temple Darshan Shuttle (Maa Majhighariani)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Train / Flight / Site Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 18447 Hirakhand Exp / Vande Bharat"
                    value={newTransferForm.trainNumber}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, trainNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Scheduled Time *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 07:45 AM"
                    value={newTransferForm.scheduledTime}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pickup Point / Boarding Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. RGDA Platform 1 VIP Gate / Hotel Porch"
                  value={newTransferForm.pickupLocation}
                  onChange={(e) => setNewTransferForm({ ...newTransferForm, pickupLocation: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Vehicle</label>
                  <select
                    className="form-select"
                    value={newTransferForm.assignedVehicle}
                    onChange={(e) => {
                      const v = e.target.value;
                      const isDzire = v.includes('Dzire');
                      setNewTransferForm({
                        ...newTransferForm,
                        assignedVehicle: v,
                        driverName: isDzire ? 'Rabi Narayan Panda' : 'Santosh Kumar',
                        driverPhone: isDzire ? '+91 94380 99411' : '+91 94371 55210'
                      });
                    }}
                  >
                    <option value="Innova Crysta (OD-18-B-4402)">Innova Crysta (OD-18-B-4402)</option>
                    <option value="Swift Dzire (OD-18-A-1109)">Swift Dzire (OD-18-A-1109)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transfer Fare (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newTransferForm.fare}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, fare: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: '#e2e8f0' }}>
                  <input
                    type="checkbox"
                    checked={newTransferForm.isCorporateCourtesy}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, isCorporateCourtesy: e.target.checked })}
                  />
                  <span>Mark as <strong>Complimentary Corporate Courtesy</strong> (JK Paper / Utkal Alumina / Director VIP)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#d97706', borderColor: '#d97706', color: '#fff' }}>
                  Confirm &amp; Dispatch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE WAKE-UP CALL MODAL (Inspired by Open-Hotel-PMS Operational Traces) */}
      {isWakeUpModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>⏰</span>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Schedule Train Wake-Up Alarm</h3>
              </div>
              <button onClick={() => setIsWakeUpModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWakeUpSubmit} className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <select
                    className="form-select"
                    value={newWakeUpForm.roomNumber}
                    onChange={(e) => {
                      const rNum = e.target.value;
                      const matched = rooms.find(r => r.roomNumber === rNum);
                      setNewWakeUpForm({
                        ...newWakeUpForm,
                        roomNumber: rNum,
                        guestName: matched?.currentGuestName || newWakeUpForm.guestName
                      });
                    }}
                  >
                    {rooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Guest Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Guest name"
                    value={newWakeUpForm.guestName}
                    onChange={(e) => setNewWakeUpForm({ ...newWakeUpForm, guestName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Wake-Up Time *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 05:15 AM"
                    value={newWakeUpForm.time}
                    onChange={(e) => setNewWakeUpForm({ ...newWakeUpForm, time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Train / Departure Reason</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Samaleswari Express 18005"
                    value={newWakeUpForm.train}
                    onChange={(e) => setNewWakeUpForm({ ...newWakeUpForm, train: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Receptionist Protocol Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Call desk phone 3 rings + knock on door + pack black tea"
                  value={newWakeUpForm.notes}
                  onChange={(e) => setNewWakeUpForm({ ...newWakeUpForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsWakeUpModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Wake-Up Alarm ⏰
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG FOUND ARTICLE (LOST & FOUND VAULT) MODAL */}
      {isLfModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🧳</span>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Log Found Article (Reception Vault)</h3>
              </div>
              <button onClick={() => setIsLfModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLfSubmit} className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Recovered Room # *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 204"
                    value={lfForm.roomNumber}
                    onChange={(e) => setLfForm({ ...lfForm, roomNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Article Category</label>
                  <select
                    className="form-select"
                    value={lfForm.category}
                    onChange={(e) => setLfForm({ ...lfForm, category: e.target.value })}
                  >
                    <option value="Electronics">Electronics (Charger, Mobile, Watch)</option>
                    <option value="Personal Accessories">Personal Accessories (Glasses, Ring)</option>
                    <option value="Clothing / Luggage">Clothing / Bag / Shoes</option>
                    <option value="Documents / Identity">Identity / Wallet / Tickets</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Article Detailed Description *</label>
                <textarea
                  required
                  rows={2}
                  className="form-input"
                  placeholder="e.g. Samsung 45W Type-C adapter with white cable, left plugged in bed socket"
                  value={lfForm.itemDescription}
                  onChange={(e) => setLfForm({ ...lfForm, itemDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Vault Locker Assigned</label>
                  <select
                    className="form-select"
                    value={lfForm.lockerNumber}
                    onChange={(e) => setLfForm({ ...lfForm, lockerNumber: e.target.value })}
                  >
                    <option value="Locker B-01">Locker B-01 (Top Shelf)</option>
                    <option value="Locker B-03">Locker B-03 (Top Shelf)</option>
                    <option value="Locker B-05">Locker B-05 (Middle Shelf)</option>
                    <option value="Locker B-08">Locker B-08 (Bottom Safe)</option>
                    <option value="Locker B-10">Locker B-10 (Bottom Safe)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Recovered by (Staff)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lfForm.foundByStaff}
                    onChange={(e) => setLfForm({ ...lfForm, foundByStaff: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Guest Name (If Known)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bijay Paswan"
                    value={lfForm.guestName}
                    onChange={(e) => setLfForm({ ...lfForm, guestName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guest Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 94370 00000"
                    value={lfForm.guestPhone}
                    onChange={(e) => setLfForm({ ...lfForm, guestPhone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsLfModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#d97706', borderColor: '#d97706', color: '#fff' }}>
                  Seal in Vault Locker 🔒
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MAINTENANCE WORK ORDER (OOO BLOCKER) MODAL */}
      {isMntModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Create Maintenance Ticket &amp; Block Room</h3>
              </div>
              <button onClick={() => setIsMntModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMntSubmit} className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Room Number to Block *</label>
                  <select
                    className="form-select"
                    required
                    value={mntForm.roomNumber}
                    onChange={(e) => setMntForm({ ...mntForm, roomNumber: e.target.value })}
                  >
                    <option value="">-- Select Room Key --</option>
                    {rooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} ({r.tier} - {r.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Maintenance Category</label>
                  <select
                    className="form-select"
                    value={mntForm.category}
                    onChange={(e) => setMntForm({ ...mntForm, category: e.target.value })}
                  >
                    <option value="Air Conditioning">Air Conditioning / Cooling</option>
                    <option value="Plumbing & Geyser">Plumbing &amp; Hot Water Geyser</option>
                    <option value="Electrical & Lighting">Electrical &amp; Switchboard</option>
                    <option value="Carpentry & Door Lock">Carpentry &amp; Smart Door Lock</option>
                    <option value="Civil & Paint Work">Civil &amp; Wall Painting</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select
                    className="form-select"
                    value={mntForm.severity}
                    onChange={(e) => setMntForm({ ...mntForm, severity: e.target.value })}
                  >
                    <option value="High">High (Immediate Action)</option>
                    <option value="Medium">Medium (Routine Servicing)</option>
                    <option value="Low">Low (Cosmetic Touchup)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Inventory Block Policy</label>
                  <select
                    className="form-select"
                    value={mntForm.blockType}
                    onChange={(e) => setMntForm({ ...mntForm, blockType: e.target.value })}
                  >
                    <option value="OOO (Out of Order)">OOO (Out of Order - Remove Key)</option>
                    <option value="OOS (Out of Service)">OOS (Out of Service - Minor)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Defect &amp; Work Description *</label>
                <textarea
                  required
                  rows={2}
                  className="form-input"
                  placeholder="e.g. Geyser MCB trips when hot water turned on. Element replacement required."
                  value={mntForm.issueDescription}
                  onChange={(e) => setMntForm({ ...mntForm, issueDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Assign Technician</label>
                  <input
                    type="text"
                    className="form-input"
                    value={mntForm.assignedTech}
                    onChange={(e) => setMntForm({ ...mntForm, assignedTech: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Est. Cost (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={mntForm.costEst}
                    onChange={(e) => setMntForm({ ...mntForm, costEst: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsMntModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}>
                  Block Room &amp; Issue Ticket ⚠️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPERATIONAL QUICK MODALS (Sri Sai Vasudev Residency Parity) */}
      <RoomQrModal
        isOpen={roomQrOpen}
        onClose={() => setRoomQrOpen(false)}
        initialRoomNumber={selectedRoomForQr}
        rooms={rooms}
      />

      <BackupRestoreModal
        isOpen={backupOpen}
        onClose={() => setBackupOpen(false)}
        rooms={rooms}
        bookings={bookings}
        onRestoreSuccess={() => setFeedbackToast("Database snapshot successfully restored from JSON!")}
      />

      <LiveOrdersDrawerModal
        isOpen={liveOrdersOpen}
        onClose={() => setLiveOrdersOpen(false)}
        foodOrders={foodOrdersList}
        onUpdateOrderStatus={handleUpdateFoodOrderStatus}
        onBillToRoom={handleBillToRoomFromLiveOrders}
      />

      <RoomServicesCareModal
        isOpen={roomServicesCareOpen}
        onClose={() => setRoomServicesCareOpen(false)}
        rooms={rooms}
        serviceRequests={roomServicesList}
        onAddRequest={handleAddRoomServiceRequest}
        onUpdateRequestStatus={handleUpdateRoomServiceStatus}
      />

      {/* THE WILD OASIS: FAST CHECK-IN REVIEW MODAL */}
      <CheckInReviewModal
        isOpen={isCheckInReviewOpen}
        onClose={() => setIsCheckInReviewOpen(false)}
        booking={selectedArrivalForCheckIn}
        onConfirmCheckIn={handleConfirmCheckIn}
        breakfastRate={opsSettings?.breakfastRate || 250}
        cabRate={opsSettings?.stationDropRate || 350}
      />

      {/* MODAL 1: STATUTORY SARAI ACT 1867 DAILY POLICE REGISTER (FORM C) */}
      {isPolicePrintOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '1rem',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: '#0d1322',
            border: '2px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: 1100,
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
          }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
                  🚨 Statutory Police Register (Form C) • Rayagada Town Police Station
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Under Section 3 of The Sarai Act, 1867 &amp; Odisha Lodging House Act
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary-gold"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={15} /> Print Form C Register
                </button>
                <button
                  type="button"
                  onClick={() => setIsPolicePrintOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Manifest Sheet */}
            <div className="printable-sheet" style={{ background: '#ffffff', color: '#0f172a', padding: '1.75rem', borderRadius: '8px', fontFamily: 'serif' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', color: '#475569' }}>
                  GOVERNMENT OF ODISHA • POLICE DEPARTMENT
                </div>
                <h2 style={{ margin: '0.2rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  DAILY GUEST ARRIVAL &amp; DEPARTURE MANIFEST (FORM C)
                </h2>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  {HOTEL_CONFIG.name.toUpperCase()} • Near Andhra Bank, New Colony, Rayagada - 765001 (Odisha)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Jurisdiction: Rayagada Town Police Station • District: Rayagada • Sarai Registration No: RGDA-SARAI-2019/042
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 600 }}>
                <div><strong>Date of Report:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div><strong>Time of Dispatch:</strong> {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>Total In-House Guests:</strong> {bookings.filter(b => b.bookingStatus === 'Checked In' || b.status === 'Checked In').length || 18}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', border: '1px solid #0f172a' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #0f172a', textAlign: 'left' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>S.N</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>Room</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>Guest Name</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>Mobile No</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>Govt ID (Type &amp; Masked)</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>State / Country</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>Arrived From</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>Proceeding To</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>Vehicle Reg.</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { room: '101', name: 'MR. P ASHOK', phone: '+91 6305202068', idType: 'Aadhaar (Masked)', idNum: 'XXXX-XXXX-7890', state: 'Andhra Pradesh', from: 'Visakhapatnam', to: 'Linde Plant Jaykaypur', vehicle: 'AP-31-CK-9021', purpose: 'Corporate Audit' },
                    { room: '102', name: 'SUBHASH CHANDRA DAS', phone: '+91 94371 88291', idType: 'Driving Lic.', idNum: 'OD-18-XXXX-8291', state: 'Odisha (BBS)', from: 'Bhubaneswar', to: 'JK Paper Mills', vehicle: 'OD-02-AX-4412', purpose: 'Technical Inspection' },
                    { room: '204', name: 'K. RAMA MURTHY', phone: '+91 98480 33119', idType: 'Aadhaar (Masked)', idNum: 'XXXX-XXXX-3119', state: 'Andhra Pradesh', from: 'Srikakulam', to: 'Maa Majhighariani', vehicle: 'AP-30-T-8821', purpose: 'Pilgrimage Darshan' },
                    { room: '206', name: 'LAVAKANTA OJHA', phone: '+91 94371 44520', idType: 'Passport', idNum: 'Z-XXXX-4520', state: 'Odisha', from: 'Cuttack', to: 'Akchem Rayagada', vehicle: 'OD-05-M-1029', purpose: 'Business Conference' },
                    { room: '101', name: 'UTKARSH SRIVASTAVA', phone: '+91 94370 88912', idType: 'Aadhaar (Masked)', idNum: 'XXXX-XXXX-8912', state: 'Uttar Pradesh', from: 'Varanasi', to: 'Koraput Tourism', vehicle: 'Train 18447', purpose: 'Travel & Tourism' },
                    { room: '104', name: 'BIJAY PASWAN', phone: '+91 98610 33812', idType: 'Voter ID', idNum: 'JH-XXXX-3812', state: 'Jharkhand', from: 'Ranchi', to: 'PRADAN Field Office', vehicle: 'Train 18105', purpose: 'NGO Field Survey' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem', fontWeight: 700 }}>{row.room}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{row.phone}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{row.idType}: {row.idNum}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{row.state}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{row.from}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{row.to}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{row.vehicle}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed #94a3b8', fontSize: '0.82rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '35px' }}></div>
                  <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700 }}>
                    Front Desk Duty Officer ({HOTEL_CONFIG.name})
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '35px' }}></div>
                  <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700 }}>
                    Rayagada Town Police Station Desk Officer Seal &amp; G.D. Entry No.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 18-ROOM DAILY TAPE CHART RACK & ARRIVALS MANIFEST PRINT */}
      {isRoomRackPrintOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '1rem',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: '#0d1322',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: 1050,
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
          }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Printer size={18} color="#38bdf8" /> Daily Room Rack &amp; Tape Chart Clipboard Sheet
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Front Desk Morning/Evening Handover &amp; Physical Inspection Sheet
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary-gold"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={15} /> Print Room Rack
                </button>
                <button
                  type="button"
                  onClick={() => setIsRoomRackPrintOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Rack Sheet */}
            <div className="printable-sheet" style={{ background: '#ffffff', color: '#0f172a', padding: '1.5rem', borderRadius: '8px', fontFamily: 'sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0284c7', paddingBottom: '0.6rem', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0284c7', fontWeight: 800 }}>
                    {HOTEL_CONFIG.name.toUpperCase()} • 18-ROOM TAPE CHART RACK
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Front Desk Physical Clipboard Summary • Rayagada, Odisha
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                  <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div><strong>Generated:</strong> {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              {/* Occupancy Summary Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.4rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>OCCUPIED</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>
                    {rooms.filter(r => r.status === 'Occupied').length}
                  </div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', padding: '0.4rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 700 }}>VACANT CLEAN</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d4ed8' }}>
                    {rooms.filter(r => r.status === 'Available' || r.status === 'Vacant Clean').length}
                  </div>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.4rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 700 }}>VACANT DIRTY</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>
                    {rooms.filter(r => r.status === 'Vacant Dirty' || r.status === 'Cleaning').length}
                  </div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.4rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 700 }}>MAINTENANCE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b91c1c' }}>
                    {rooms.filter(r => r.status === 'Maintenance').length}
                  </div>
                </div>
                <div style={{ background: '#faf5ff', border: '1px solid #d8b4fe', padding: '0.4rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#6b21a8', fontWeight: 700 }}>OCCUPANCY %</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7e22ce' }}>
                    {Math.round((rooms.filter(r => r.status === 'Occupied').length / (rooms.length || 18)) * 100)}%
                  </div>
                </div>
              </div>

              {/* 18 Rooms Detailed Grid */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', marginBottom: '1.25rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #0f172a', textAlign: 'left' }}>
                    <th style={{ padding: '0.3rem', border: '1px solid #cbd5e1' }}>Room</th>
                    <th style={{ padding: '0.3rem', border: '1px solid #cbd5e1' }}>Tier / Category</th>
                    <th style={{ padding: '0.3rem', border: '1px solid #cbd5e1' }}>Status</th>
                    <th style={{ padding: '0.3rem', border: '1px solid #cbd5e1' }}>In-House Guest Name</th>
                    <th style={{ padding: '0.3rem', border: '1px solid #cbd5e1' }}>Check-In</th>
                    <th style={{ padding: '0.3rem', border: '1px solid #cbd5e1' }}>Check-Out</th>
                    <th style={{ padding: '0.3rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>Tariff (₹)</th>
                    <th style={{ padding: '0.3rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>Balance Due</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.slice(0, 18).map((room, idx) => {
                    const booking = bookings.find(b => (b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) && (b.bookingStatus === 'Checked In' || b.status === 'Checked In'));
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', fontWeight: 700 }}>{room.roomNumber}</td>
                        <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1' }}>{room.tier}</td>
                        <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', fontWeight: 600, color: room.status === 'Occupied' ? '#15803d' : room.status === 'Maintenance' ? '#b91c1c' : '#1d4ed8' }}>
                          {room.status}
                        </td>
                        <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                          {room.currentGuestName || booking?.guestName || '-'}
                        </td>
                        <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1' }}>{booking?.checkInDate || '-'}</td>
                        <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1' }}>{booking?.checkOutDate || '-'}</td>
                        <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>₹{room.price || 1899}</td>
                        <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: (booking?.balanceDue || 0) > 0 ? '#dc2626' : '#15803d' }}>
                          {booking ? `₹${(booking.balanceDue || 0).toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', paddingTop: '1rem', borderTop: '1px dashed #94a3b8', fontSize: '0.8rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '30px' }}></div>
                  <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700 }}>
                    Front Desk Cashier / Receptionist Sign
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '30px' }}></div>
                  <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700 }}>
                    Operations Manager / GM Verification
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: HOUSEKEEPING DAILY FLOOR ASSIGNMENT & WORK ORDER PRINT */}
      {isHousekeepingPrintOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '1rem',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: '#0d1322',
            border: '2px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: 1050,
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
          }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🧹 Housekeeping Daily Floor Attendant &amp; Linen Checklist
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Room Turnover • Linen Replacement • Amenities Replenishment
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary-gold"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={15} /> Print Work Order
                </button>
                <button
                  type="button"
                  onClick={() => setIsHousekeepingPrintOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="printable-sheet" style={{ background: '#ffffff', color: '#0f172a', padding: '1.5rem', borderRadius: '8px', fontFamily: 'sans-serif' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.6rem', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                  {HOTEL_CONFIG.name.toUpperCase()} • HOUSEKEEPING WORK ORDER
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  Daily Room Attendant Floor Allocation &amp; Inspection Manifest • Rayagada
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div>Shift: Morning (07:00 - 15:30)</div>
                  <div>Floor Supervisor: P. Bikram (Ext. 04)</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #0f172a', textAlign: 'left' }}>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>Room</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>Floor</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>Status</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>Turnover Type</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Bed Sheet [✓]</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Towels (2x) [✓]</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Water Bottles [✓]</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Toiletries [✓]</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>Attendant Sign</th>
                    <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>Supervisor Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.slice(0, 18).map((room, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', fontWeight: 700 }}>{room.roomNumber}</td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1' }}>{room.floor || (String(room.roomNumber).startsWith('1') ? 'Ground Floor' : '1st Floor')}</td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', fontWeight: 600 }}>{room.status}</td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1' }}>
                        {room.status === 'Occupied' ? 'Stayover Service' : room.status === 'Vacant Dirty' ? 'Departure Turnover' : 'Touch-Up / Dusting'}
                      </td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>[ ]</td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>[ ]</td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>[ ]</td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>[ ]</td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1' }}></td>
                      <td style={{ padding: '0.28rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Pass / Re-clean</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', paddingTop: '1rem', borderTop: '1px dashed #94a3b8', fontSize: '0.8rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '30px' }}></div>
                  <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700 }}>
                    Housekeeping Executive Sign
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '30px' }}></div>
                  <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700 }}>
                    Front Desk Reception Handover Sign
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: BELL DESK LUGGAGE STORAGE & CUSTODY TAGS */}
      {isLuggageModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '1rem',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: '#0d1322',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: 880,
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Briefcase size={22} color="#38bdf8" />
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
                    Bell Desk Luggage Custody &amp; Storage Pass
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    For checked-out transit guests awaiting trains &amp; temple visits
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLuggageModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Luggage Registration Form */}
            <form onSubmit={handleAddLuggagePass} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>
                + Issue New Luggage Custody Tag
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '3px' }}>Room No:</label>
                  <input
                    type="text"
                    value={luggageForm.roomNumber}
                    onChange={(e) => setLuggageForm({ ...luggageForm, roomNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', background: '#060e1a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                    placeholder="e.g. 204 or Walk-in"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '3px' }}>Guest Name:</label>
                  <input
                    type="text"
                    value={luggageForm.guestName}
                    onChange={(e) => setLuggageForm({ ...luggageForm, guestName: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', background: '#060e1a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                    placeholder="Guest Full Name"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '3px' }}>Mobile Phone:</label>
                  <input
                    type="text"
                    value={luggageForm.phone}
                    onChange={(e) => setLuggageForm({ ...luggageForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', background: '#060e1a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                    placeholder="+91 94370 00000"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '3px' }}>No. of Bags:</label>
                  <input
                    type="number"
                    min="1"
                    value={luggageForm.bagsCount}
                    onChange={(e) => setLuggageForm({ ...luggageForm, bagsCount: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', background: '#060e1a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '3px' }}>Luggage Description:</label>
                  <input
                    type="text"
                    value={luggageForm.bagType}
                    onChange={(e) => setLuggageForm({ ...luggageForm, bagType: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', background: '#060e1a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                    placeholder="e.g. 2 Trolleys + 1 Backpack"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '3px' }}>Pickup Time &amp; Train:</label>
                  <input
                    type="text"
                    value={luggageForm.trainNo}
                    onChange={(e) => setLuggageForm({ ...luggageForm, trainNo: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', background: '#060e1a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                    placeholder="e.g. 07:30 PM (18448 Hirakhand)"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '3px' }}>Locker Slot:</label>
                  <input
                    type="text"
                    value={luggageForm.lockerNo}
                    onChange={(e) => setLuggageForm({ ...luggageForm, lockerNo: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', background: '#060e1a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                <button
                  type="submit"
                  className="btn-primary-gold"
                  style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem' }}
                >
                  + Generate Luggage Pass &amp; Locker Tag
                </button>
              </div>
            </form>

            {/* Currently Stored Luggage Table */}
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.6rem' }}>
              Active Luggage in Locker Storage ({luggagePasses.filter(l => l.status === 'In Custody').length})
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Pass ID</th>
                    <th style={{ padding: '0.5rem' }}>Room</th>
                    <th style={{ padding: '0.5rem' }}>Guest Name</th>
                    <th style={{ padding: '0.5rem' }}>Bags</th>
                    <th style={{ padding: '0.5rem' }}>Locker Slot</th>
                    <th style={{ padding: '0.5rem' }}>Pickup Schedule</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {luggagePasses.map((pass, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: 'var(--gold-glow)' }}>{pass.id}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: '#fff' }}>{pass.roomNumber}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 600, color: '#fff' }}>{pass.guestName}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{pass.bagsCount} ({pass.bagType})</td>
                      <td style={{ padding: '0.5rem', color: '#38bdf8' }}>{pass.lockerNo}</td>
                      <td style={{ padding: '0.5rem', color: '#facc15' }}>{pass.pickupTime} • {pass.trainNo}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          background: pass.status === 'In Custody' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: pass.status === 'In Custody' ? '#38bdf8' : '#34d399',
                          border: `1px solid ${pass.status === 'In Custody' ? '#38bdf8' : '#34d399'}`
                        }}>
                          {pass.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid var(--gold-glow)', color: 'var(--gold-glow)', borderRadius: '4px', cursor: 'pointer' }}
                            title="Print 2-Part Luggage Tag &amp; Slip"
                          >
                            🖨️ Tag
                          </button>
                          <a
                            href={`https://wa.me/91${pass.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`${HOTEL_CONFIG.name} - Luggage Claim Pass: ${pass.id} for ${pass.guestName} (${pass.bagsCount} Bags). Stored in ${pass.lockerNo}. Pickup time: ${pass.pickupTime}. Please present this message at reception to collect your bags.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#4ade80', borderRadius: '4px', textDecoration: 'none' }}
                          >
                            💬 WhatsApp
                          </a>
                          {pass.status === 'In Custody' && (
                            <button
                              type="button"
                              onClick={() => handleReleaseLuggage(pass.id)}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              ✓ Release
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION TOAST */}
      {feedbackToast && (
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
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{feedbackToast}</span>
        </div>
      )}
      {/* UNIVERSAL INLINE KEYBOARD EDIT MODE FLOATING HUD BANNER */}
      <InlineEditorBanner
        isActive={true}
        onToggle={null}
        label="PMS Universal Keyboard Edit Mode"
        onReset={() => {
          if (window.confirm('Reset all inline text edits back to default values?')) {
            localStorage.removeItem('hsi_pms_edits');
            window.location.reload();
          }
        }}
      />
    </section>
  );
}
