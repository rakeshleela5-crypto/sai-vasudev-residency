"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Users, MapPin, Clock, Building, 
  CheckCircle2, ChevronRight, X, Coffee, Utensils, Monitor, 
  Sparkles, Layers, FileText, ArrowRight, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarEventType = {
  id: string;
  day: string; // '01', '02', ..., '30'
  dateStr: string;
  time: string;
  title: string;
  category: 'banquet' | 'room' | 'corporate';
  venue: string;
  organizer: string;
  contactPerson?: string;
  pax: string;
  setup?: string;
  billing: string;
  status: 'In-Progress' | 'Confirmed' | 'In-House' | 'Completed' | 'Upcoming';
  amount?: number;
  beoDetails?: {
    setupStyle: string;
    avEquipments: string[];
    fbSchedule: { time: string; item: string }[];
    billingAccount: string;
    coordinator: string;
  };
};

export type DayType = {
  day: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  events?: CalendarEventType[];
};

// Seed authentic Sri Sai Vasudev Residency bookings and Rayagada corporate conventions for September 2026
const DEFAULT_SEPTEMBER_EVENTS: CalendarEventType[] = [
  {
    id: 'EVT-SEP-01',
    day: '01',
    dateStr: 'Tue, 01 Sep 2026',
    time: '10:30 AM - 01:30 PM',
    title: 'JK Paper Mills - Quarterly Pulp Procurement Review',
    category: 'banquet',
    venue: 'Executive Board Room (2nd Floor)',
    organizer: 'JK Paper Mills Ltd. (Jaykaypur)',
    contactPerson: 'Subrat Panda (Admin GM)',
    pax: '16 Delegates',
    setup: 'U-Shape Conference Table',
    billing: 'BTC (CORP-01 - JK Paper Mills)',
    status: 'Completed',
    amount: 14500,
    beoDetails: {
      setupStyle: 'Executive U-Shape with executive leather swivel chairs',
      avEquipments: ['85" 4K Presentation Display', 'Polycom Conference Speakerphone', 'Wi-Fi 6 Dedicated SSID'],
      fbSchedule: [
        { time: '10:30 AM', item: 'South Indian Filter Coffee & Cashew Biscuits' },
        { time: '01:00 PM', item: 'Executive Thali Lunch at Cannon Kitchen' }
      ],
      billingAccount: 'JK Paper Mills Ltd. Corp Account #CORP-01',
      coordinator: 'K. Simhachalam (Front Office)'
    }
  },
  {
    id: 'EVT-SEP-04',
    day: '04',
    dateStr: 'Fri, 04 Sep 2026',
    time: '02:00 PM - 06:00 PM',
    title: 'GAIL India - Pipeline Safety Audit Team Check-in',
    category: 'room',
    venue: 'Rooms 301, 304 & 305 (Executive Tier)',
    organizer: 'GAIL (India) Limited - Rayagada Pipeline Div',
    contactPerson: 'Rajeshwar Rao (Project Incharge)',
    pax: '4 Senior Engineers',
    setup: '3 Executive AC Single/Double Occupancy',
    billing: 'BTC (CORP-02 - GAIL India)',
    status: 'Completed',
    amount: 28990,
    beoDetails: {
      setupStyle: 'Room Block with High-Speed Work Desks',
      avEquipments: ['In-room Ergonomic Workstations', 'Direct High-Speed LAN Ports'],
      fbSchedule: [
        { time: '07:30 AM', item: 'Complimentary Buffet Breakfast (CP Plan)' },
        { time: '08:30 PM', item: 'Room Service Dinner from Cannon Kitchen' }
      ],
      billingAccount: 'GAIL India Limited #CORP-02',
      coordinator: 'S. Patnaik (Shift Lead)'
    }
  },
  {
    id: 'EVT-SEP-08',
    day: '08',
    dateStr: 'Tue, 08 Sep 2026',
    time: '09:30 AM - 05:00 PM',
    title: 'IMFA Therubali - Annual Transporters & Vendors Conclave',
    category: 'banquet',
    venue: 'Mandapam Grand Banquet Hall',
    organizer: 'Indian Metals & Ferro Alloys Ltd.',
    contactPerson: 'M. Mohanty (Logistics VP)',
    pax: '85 Delegates',
    setup: 'Theater Style Layout with Podium',
    billing: 'BTC (CORP-03 - IMFA)',
    status: 'Completed',
    amount: 62000,
    beoDetails: {
      setupStyle: 'Grand Ballroom Theater Layout with center aisle',
      avEquipments: ['Dual 150" Motorized Screens', 'Dual Shure Wireless Handheld Mics', 'Yamaha Audio Mixer'],
      fbSchedule: [
        { time: '09:30 AM', item: 'Morning High Tea: Upma, Sambhar, Vada & Filter Coffee' },
        { time: '01:15 PM', item: 'Grand Buffet: 12-Item Pure Veg Satvik Menu' },
        { time: '04:30 PM', item: 'Evening Tea with Samosas & Odia Chhena Poda' }
      ],
      billingAccount: 'IMFA Therubali Corporate Ledger #5512',
      coordinator: 'P. Tripathy & K. Simhachalam'
    }
  },
  {
    id: 'EVT-SEP-11',
    day: '11',
    dateStr: 'Fri, 11 Sep 2026',
    time: '11:00 AM - 03:00 PM',
    title: 'Vedanta Lanjigarh Alumina Refinery - CSR Partners Round Table',
    category: 'corporate',
    venue: 'Executive Board Room (2nd Floor)',
    organizer: 'Vedanta Ltd. CSR Foundation',
    contactPerson: 'Pooja Kashyap (CSR Lead)',
    pax: '14 Representatives',
    setup: 'Hollow Square Executive Table',
    billing: 'BTC (CORP-04 - Vedanta)',
    status: 'Completed',
    amount: 18500
  },
  {
    id: 'EVT-SEP-14',
    day: '14',
    dateStr: 'Mon, 14 Sep 2026',
    time: '10:00 AM - 01:00 PM',
    title: 'Utkal Alumina (Aditya Birla) - Bauxite Sourcing Tech Briefing',
    category: 'banquet',
    venue: 'A/C Conference Hall (Ground Floor)',
    organizer: 'Utkal Alumina International Ltd.',
    contactPerson: 'D. K. Mishra (Technical Dir)',
    pax: '28 Engineers',
    setup: 'Cluster Table Setup (4 per table)',
    billing: 'BTC (CORP-05)',
    status: 'Completed',
    amount: 24000
  },
  {
    id: 'EVT-SEP-17',
    day: '17',
    dateStr: 'Thu, 17 Sep 2026',
    time: '03:00 PM - 07:00 PM',
    title: 'East Coast Railway (ECoR) - Waltair Division Transit Review',
    category: 'corporate',
    venue: 'Executive Board Room (2nd Floor)',
    organizer: 'Rayagada Railway Divisional Office',
    contactPerson: 'Station Area Manager (RGDA)',
    pax: '12 Officers',
    setup: 'Executive Conference Setup',
    billing: 'Government Official Purchase Order',
    status: 'Completed',
    amount: 12000
  },
  {
    id: 'EVT-SEP-20',
    day: '20',
    dateStr: 'Sun, 20 Sep 2026',
    time: '09:00 AM - 06:00 PM',
    title: 'Rayagada District Youth Leadership & Social Service Conclave',
    category: 'banquet',
    venue: 'Mandapam Grand Banquet Hall',
    organizer: 'Rotary Club of Rayagada & Yuva Morcha',
    contactPerson: 'Adv. S. K. Mahapatra',
    pax: '120 Delegates',
    setup: 'Theater Style Seating',
    billing: 'Direct Trust Ledger',
    status: 'Completed',
    amount: 55000
  },
  // TODAY: 22 SEPTEMBER 2026
  {
    id: 'EVT-SEP-22-1',
    day: '22',
    dateStr: 'Tue, 22 Sep 2026 (TODAY)',
    time: '10:00 AM - 04:30 PM',
    title: 'Linde India Ltd - Cryogenic Plant Engineering Review',
    category: 'banquet',
    venue: 'A/C Conference Hall (Ground Floor)',
    organizer: 'Linde India Ltd (Industrial Gases Div)',
    contactPerson: 'Anirudh Roy (Chief Project Engineer)',
    pax: '35 Delegates',
    setup: 'Classroom / Theater Hybrid Setup',
    billing: 'BTC (Corporate Approved Linde Account)',
    status: 'In-Progress',
    amount: 38500,
    beoDetails: {
      setupStyle: 'Tiered classroom tables with individual power strips and A4 writing pads',
      avEquipments: [
        'Full HD 1080p Ultra-short Throw Projector',
        '3 Wireless Gooseneck Mics + 2 Handheld UHF Mics',
        'High-Speed Dedicated 100Mbps Wi-Fi VLAN'
      ],
      fbSchedule: [
        { time: '10:00 AM', item: 'Arrival Refreshments: Darjeeling Tea, Nescafé Coffee & Dry Fruit Cake' },
        { time: '01:15 PM', item: 'Executive Hot Buffet: Paneer Lababdar, Dal Makhani, Jeera Pulao, Gulab Jamun' },
        { time: '04:00 PM', item: 'Evening High Tea: Masala Chai, Crispy Veg Cutlets & Cookies' }
      ],
      billingAccount: 'Linde India Ltd Corp Ledger #LND-9921',
      coordinator: 'K. Simhachalam & Consultant S. Patnaik'
    }
  },
  {
    id: 'EVT-SEP-22-2',
    day: '22',
    dateStr: 'Tue, 22 Sep 2026 (TODAY)',
    time: 'In-House Stay (Check-out 24-Sep)',
    title: 'Mr. P. Ashok - JK Paper Mills Technical Consultant',
    category: 'room',
    venue: 'Room 402 (Floor 4 Executive Room)',
    organizer: 'JK Paper Mills Corporate Account',
    contactPerson: 'P. Ashok (+91 94371 88201)',
    pax: '1 Guest (Occupied)',
    setup: 'Executive Room AC with King Bed',
    billing: 'BTC (CORP-01) • Current Folio Balance: ₹10,084.38',
    status: 'In-House',
    amount: 10084.38
  },
  {
    id: 'EVT-SEP-22-3',
    day: '22',
    dateStr: 'Tue, 22 Sep 2026 (TODAY)',
    time: 'In-House Stay (Check-out 23-Sep)',
    title: 'Mr. Bijay Paswan - PRADAN Livelihood Project Field Lead',
    category: 'corporate',
    venue: 'Room 410 (Floor 4 Executive Room)',
    organizer: 'PRADAN Rayagada Office',
    contactPerson: 'Bijay Paswan (+91 88950 11422)',
    pax: '1 Guest (Occupied)',
    setup: 'Executive Room AC Single',
    billing: 'Direct Settlement • Balance Due: ₹5,544.00',
    status: 'In-House',
    amount: 5544.00
  },
  {
    id: 'EVT-SEP-24',
    day: '24',
    dateStr: 'Thu, 24 Sep 2026',
    time: '11:00 AM - 05:30 PM',
    title: 'HCCB (Coca-Cola) - Regional Distribution & Supply Chain Meet',
    category: 'banquet',
    venue: 'Party Hall 16 (Banquet Section)',
    organizer: 'Hindustan Coca-Cola Beverages Pvt. Ltd.',
    contactPerson: 'Amitabh Sen (Logistics Head)',
    pax: '28 Regional Distributors',
    setup: 'Cluster Tables with Product Displays',
    billing: 'BTC (CORP-08 - HCCB)',
    status: 'Confirmed',
    amount: 32000
  },
  {
    id: 'EVT-SEP-27',
    day: '27',
    dateStr: 'Sun, 27 Sep 2026',
    time: '10:00 AM - 04:00 PM',
    title: 'Odisha Tourism - Koraput & Rayagada Tribal Heritage Symposium',
    category: 'banquet',
    venue: 'Mandapam Grand Banquet Hall',
    organizer: 'District Tourism Promotion Council & OTDC',
    contactPerson: 'District Tourism Officer (Rayagada)',
    pax: '110 Guests & Delegates',
    setup: 'Auditorium Theater Seating with Exhibition Booths',
    billing: 'OTDC Government Direct Billing',
    status: 'Confirmed',
    amount: 68000,
    beoDetails: {
      setupStyle: 'Grand Auditorium Seating with Tribal Artifacts Exhibition Area',
      avEquipments: ['Dual Heavy-Duty Projectors', 'Multi-Mic Digital Sound Console', 'Video Recording Setup'],
      fbSchedule: [
        { time: '10:00 AM', item: 'Welcome Drinks: Bela Pana & Coconut Water' },
        { time: '01:00 PM', item: 'Traditional 14-Item Odia Bhoji Buffet' },
        { time: '03:45 PM', item: 'Chhena Jhili, Chenna Poda & Spiced Milk Tea' }
      ],
      billingAccount: 'OTDC Rayagada District Voucher',
      coordinator: 'K. Simhachalam & S. Patnaik'
    }
  },
  {
    id: 'EVT-SEP-29',
    day: '29',
    dateStr: 'Tue, 29 Sep 2026',
    time: '07:00 PM - 10:30 PM',
    title: 'Utkal Alumina & Hindalco - Senior Leadership Gala Dinner',
    category: 'corporate',
    venue: 'A/C Conference Hall & Cannon Kitchen Terrace',
    organizer: 'Utkal Alumina International (Aditya Birla Group)',
    contactPerson: 'Manish Agrawal',
    pax: '32 Senior Executives',
    setup: 'Fine Dining Candlelit Banquet Layout',
    billing: 'BTC (CORP-06)',
    status: 'Confirmed',
    amount: 36000
  },
  {
    id: 'EVT-SEP-30',
    day: '30',
    dateStr: 'Wed, 30 Sep 2026',
    time: '04:00 PM - 07:00 PM',
    title: 'End of Month Revenue & Statutory Night Audit Review',
    category: 'corporate',
    venue: 'GM Executive Suite & Admin Board',
    organizer: 'Sri Sai Vasudev Residency Management',
    contactPerson: 'General Manager & Financial Controller',
    pax: '8 Department Heads',
    setup: 'Round Executive Table',
    billing: 'Internal Management Review',
    status: 'Confirmed',
    amount: 0
  }
];

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const generateSeptember2026Grid = (eventsList: CalendarEventType[]): DayType[] => {
  const grid: DayType[] = [];

  // August filler days (Sun 30 Aug, Mon 31 Aug)
  grid.push({ day: '30', isCurrentMonth: false, isToday: false });
  grid.push({ day: '31', isCurrentMonth: false, isToday: false });

  // Days 1 through 30 of September 2026
  for (let i = 1; i <= 30; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    const dayEvents = eventsList.filter((e) => e.day === dayStr);
    grid.push({
      day: dayStr,
      isCurrentMonth: true,
      isToday: dayStr === '22',
      events: dayEvents.length > 0 ? dayEvents : undefined,
    });
  }

  // October filler days (Thu 1 Oct, Fri 2 Oct, Sat 3 Oct)
  grid.push({ day: '01', isCurrentMonth: false, isToday: false });
  grid.push({ day: '02', isCurrentMonth: false, isToday: false });
  grid.push({ day: '03', isCurrentMonth: false, isToday: false });

  return grid;
};

export interface InteractiveCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  rooms?: any[];
  bookings?: any[];
  onSelectBooking?: (booking: any) => void;
}

export const InteractiveCalendar = React.forwardRef<HTMLDivElement, InteractiveCalendarProps>(
  ({ className, rooms = [], bookings = [], onSelectBooking, ...props }, ref) => {
    const [selectedDay, setSelectedDay] = useState<string | null>('22');
    const [activeFilter, setActiveFilter] = useState<'all' | 'banquet' | 'room' | 'corporate'>('all');
    const [activeViewMode, setActiveViewMode] = useState<'calendar' | 'agenda' | 'venues'>('calendar');
    const [selectedBeoEvent, setSelectedBeoEvent] = useState<CalendarEventType | null>(null);

    // Merge static seeded conventions with any dynamic active bookings passed from PMS
    const mergedEvents = useMemo(() => {
      const list = [...DEFAULT_SEPTEMBER_EVENTS];

      if (Array.isArray(bookings) && bookings.length > 0) {
        bookings.forEach((b, idx) => {
          const exists = list.some((e) => e.title.includes(b.guestName || b.roomNumber));
          if (!exists && b.guestName) {
            list.push({
              id: `PMS-BK-${b.bookingId || b.id || idx}`,
              day: '22',
              dateStr: 'Tue, 22 Sep 2026',
              time: `${b.checkInTime || '12:00 PM'} Check-in`,
              title: `${b.guestName} (${b.roomNumber ? `Room ${b.roomNumber}` : 'Stay'})`,
              category: b.isB2b || b.company ? 'corporate' : 'room',
              venue: b.roomNumber ? `Room ${b.roomNumber} (${b.tier || 'Executive'})` : 'Standard Stay',
              organizer: b.corporateGstin ? `B2B Account (${b.corporateGstin})` : b.guestName,
              contactPerson: b.guestPhone || b.guestName,
              pax: `${b.adults || b.pax || 1} Guest(s)`,
              setup: b.tier || 'In-House PMS Stay',
              billing: b.paymentMode || (b.isB2b ? 'Corporate B2B' : 'Direct / Cash'),
              status: b.bookingStatus === 'Checked In' ? 'In-House' : 'Confirmed',
              amount: b.totalAmount || b.tariff || 2464,
            });
          }
        });
      }

      return list;
    }, [bookings]);

    const calendarGrid = useMemo(() => generateSeptember2026Grid(mergedEvents), [mergedEvents]);

    const displayedEvents = useMemo(() => {
      let list = mergedEvents;
      if (activeFilter !== 'all') {
        list = list.filter((e) => e.category === activeFilter);
      }
      if (selectedDay) {
        list = list.filter((e) => e.day === selectedDay);
      }
      return list;
    }, [mergedEvents, activeFilter, selectedDay]);

    const banquetCount = mergedEvents.filter((e) => e.category === 'banquet').length;
    const roomCount = mergedEvents.filter((e) => e.category === 'room').length;
    const corpCount = mergedEvents.filter((e) => e.category === 'corporate').length;

    return (
      <div ref={ref} className={cn("w-full flex flex-col gap-6", className)} {...props}>
        {/* LUXURY TOP ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0c182b] via-[#13223d] to-[#0c182b] border border-[rgba(212,175,55,0.3)] shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[rgba(212,175,55,0.15)] text-[#f3c64c] border border-[rgba(212,175,55,0.3)]">
                <Sparkles className="size-3.5 text-[#f3c64c]" />
                Sri Sai Vasudev Residency • Rayagada
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[rgba(16,185,129,0.18)] text-[#34d399] border border-[rgba(16,185,129,0.35)]">
                <span className="size-2 rounded-full bg-[#10b981] animate-pulse" />
                Live Date: Tuesday, 22 Sep 2026
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-white tracking-wide">
              September 2026 <span className="gold-gradient-text">Convention &amp; Function Visualizer</span>
            </h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Comprehensive schedule for A/C Conference Hall, Mandapam Banquet, Boardrooms &amp; Executive Room Folios
            </p>
          </div>

          {/* VIEW SWITCHER & CATEGORY FILTERS */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Buttons */}
            <div className="flex items-center bg-[#060e1a] p-1 rounded-xl border border-[rgba(212,175,55,0.25)]">
              <button
                type="button"
                onClick={() => setActiveViewMode('calendar')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                  activeViewMode === 'calendar'
                    ? "bg-[#d4af37] text-[#060e1a] font-bold shadow-md"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                <CalendarIcon className="size-3.5" />
                Month Grid
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveViewMode('agenda');
                  setSelectedDay('22');
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                  activeViewMode === 'agenda'
                    ? "bg-[#d4af37] text-[#060e1a] font-bold shadow-md"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                <FileText className="size-3.5" />
                Live Agenda
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center bg-[#060e1a] p-1 rounded-xl border border-[rgba(212,175,55,0.25)]">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeFilter === 'all'
                    ? "bg-[rgba(212,175,55,0.25)] text-[#fceec5] font-bold border border-[rgba(212,175,55,0.4)]"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                All ({mergedEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('banquet')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                  activeFilter === 'banquet'
                    ? "bg-[rgba(212,175,55,0.25)] text-[#fceec5] font-bold border border-[rgba(212,175,55,0.4)]"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                🏛️ Banquets ({banquetCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('room')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                  activeFilter === 'room'
                    ? "bg-[rgba(56,189,248,0.2)] text-[#38bdf8] font-bold border border-[rgba(56,189,248,0.4)]"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                🏨 Rooms ({roomCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('corporate')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                  activeFilter === 'corporate'
                    ? "bg-[rgba(168,85,247,0.2)] text-[#c084fc] font-bold border border-[rgba(168,85,247,0.4)]"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                🏭 Corporate ({corpCount})
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: FULL-WIDTH CLEAN LUXURY CALENDAR GRID */}
        {activeViewMode === 'calendar' && (
          <div className="rounded-2xl bg-[rgba(12,24,43,0.7)] border border-[rgba(212,175,55,0.25)] p-4 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            {/* Weekday Columns Header */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {DAYS_OF_WEEK.map((d, i) => (
                <div
                  key={d}
                  className={cn(
                    "text-center text-xs font-bold py-2 rounded-lg tracking-wider",
                    i === 0 || i === 6
                      ? "text-[#f3c64c] bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)]"
                      : "text-[#94a3b8] bg-[rgba(255,255,255,0.03)] border border-transparent"
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 35-Day Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarGrid.map((dayObj, index) => {
                const isSelected = selectedDay === dayObj.day && dayObj.isCurrentMonth;
                const hasEvents = !!dayObj.events && dayObj.events.length > 0;
                const banquetEvent = dayObj.events?.find(e => e.category === 'banquet');
                const roomEvent = dayObj.events?.find(e => e.category === 'room');
                const corpEvent = dayObj.events?.find(e => e.category === 'corporate');

                return (
                  <div
                    key={`${dayObj.day}-${index}`}
                    onClick={() => {
                      if (dayObj.isCurrentMonth) {
                        setSelectedDay(selectedDay === dayObj.day ? null : dayObj.day);
                      }
                    }}
                    className={cn(
                      "group relative flex flex-col justify-between p-2 rounded-xl transition-all duration-200 min-h-[95px]",
                      !dayObj.isCurrentMonth
                        ? "bg-[#060e1a]/40 text-slate-700 opacity-25 cursor-not-allowed border border-transparent"
                        : isSelected
                        ? "cursor-pointer bg-gradient-to-b from-[rgba(212,175,55,0.22)] to-[rgba(12,24,43,0.9)] border-2 border-[#f3c64c] shadow-[0_0_20px_rgba(212,175,55,0.35)] scale-[1.01]"
                        : dayObj.isToday
                        ? "cursor-pointer bg-gradient-to-b from-[rgba(16,185,129,0.18)] to-[rgba(12,24,43,0.85)] border-2 border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                        : hasEvents
                        ? "cursor-pointer bg-[rgba(19,34,61,0.7)] hover:bg-[rgba(19,34,61,0.95)] border border-[rgba(212,175,55,0.25)] hover:border-[rgba(212,175,55,0.6)] shadow-sm"
                        : "cursor-pointer bg-[rgba(12,24,43,0.5)] hover:bg-[rgba(19,34,61,0.6)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(212,175,55,0.3)] text-slate-400"
                    )}
                  >
                    {/* Top Row: Date Number & Tags */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={cn(
                          "text-xs font-bold",
                          dayObj.isToday
                            ? "text-[#34d399] font-black text-sm"
                            : isSelected
                            ? "text-[#fceec5] font-black text-sm"
                            : dayObj.isCurrentMonth
                            ? "text-slate-200"
                            : "text-slate-700"
                        )}
                      >
                        {dayObj.day}
                      </span>

                      {dayObj.isToday && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-[#10b981] text-[#060e1a] shadow-sm">
                          Today
                        </span>
                      )}

                      {hasEvents && !dayObj.isToday && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(212,175,55,0.2)] text-[10px] font-bold text-[#f3c64c] border border-[rgba(212,175,55,0.4)]">
                          {dayObj.events?.length}
                        </span>
                      )}
                    </div>

                    {/* Middle: Clean Visual Tags (Never clipped or squashed!) */}
                    {hasEvents && (
                      <div className="flex flex-col gap-1 my-1 w-full overflow-hidden">
                        {banquetEvent && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.35)] text-[#fceec5] text-[10px] font-medium truncate">
                            <span className="text-[9px]">🏛️</span>
                            <span className="truncate">{banquetEvent.title.split('-')[0].trim()}</span>
                          </div>
                        )}
                        {roomEvent && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(56,189,248,0.18)] border border-[rgba(56,189,248,0.35)] text-[#38bdf8] text-[10px] font-medium truncate">
                            <span className="text-[9px]">🏨</span>
                            <span className="truncate">{roomEvent.venue}</span>
                          </div>
                        )}
                        {corpEvent && !roomEvent && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(168,85,247,0.18)] border border-[rgba(168,85,247,0.35)] text-[#c084fc] text-[10px] font-medium truncate">
                            <span className="text-[9px]">🏭</span>
                            <span className="truncate">{corpEvent.title.split('-')[0].trim()}</span>
                          </div>
                        )}
                        {(dayObj.events?.length || 0) > 2 && (
                          <div className="text-[9px] text-[#f3c64c] font-semibold text-right pr-0.5">
                            +{(dayObj.events?.length || 0) - 2} more
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty cell placeholder */}
                    {!hasEvents && <div className="h-4" />}
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend Bar */}
            <div className="mt-5 pt-3.5 border-t border-[rgba(212,175,55,0.2)] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
                  <span className="text-slate-300 font-medium">Live Today (22 Sep)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
                  <span className="text-slate-300 font-medium">Banquet / Conference Hall</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
                  <span className="text-slate-300 font-medium">Executive Room Stays</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc]" />
                  <span className="text-slate-300 font-medium">Corporate B2B Account</span>
                </div>
              </div>

              <div className="text-[#94a3b8] text-[11px] italic">
                💡 Click on any day cell to inspect scheduled functions &amp; room folios below.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SELECTED DAY FUNCTIONS & FOLIOS (SPACIOUS LUXURY 2-COLUMN CARDS) */}
        <div className="rounded-2xl bg-[rgba(12,24,43,0.85)] border border-[rgba(212,175,55,0.3)] p-5 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-[rgba(212,175,55,0.2)] pb-4 mb-5 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-5 text-[#f3c64c]" />
                <h3 className="text-lg md:text-xl font-bold font-serif text-white">
                  {selectedDay
                    ? `Scheduled Functions: Tuesday, ${selectedDay} Sep 2026`
                    : "All September 2026 Registered Conventions"}
                </h3>
              </div>
              <p className="text-xs text-[#94a3b8] mt-1">
                {displayedEvents.length} active convention &amp; stay folio{displayedEvents.length === 1 ? '' : 's'} recorded
              </p>
            </div>

            {selectedDay && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(212,175,55,0.15)] text-[#f3c64c] border border-[rgba(212,175,55,0.35)] hover:bg-[rgba(212,175,55,0.25)] transition-all"
              >
                View Full Month (All Days)
              </button>
            )}
          </div>

          {/* Cards Grid: Spacious 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {displayedEvents.length === 0 ? (
                <div className="col-span-full text-center py-12 px-4 rounded-xl border border-dashed border-[rgba(212,175,55,0.2)] bg-[rgba(6,14,26,0.5)]">
                  <CalendarIcon className="size-10 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-300">No events scheduled for this date</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No banquet functions or corporate blocks recorded. Click any date on the calendar above to inspect other dates.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#d4af37] text-[#060e1a]"
                  >
                    Browse All September Events
                  </button>
                </div>
              ) : (
                displayedEvents.map((evt) => (
                  <motion.div
                    key={evt.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className={cn(
                      "flex flex-col justify-between p-5 rounded-xl border transition-all duration-200",
                      evt.day === '22'
                        ? "bg-gradient-to-br from-[#13223d] to-[#0c182b] border-[rgba(212,175,55,0.4)] shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                        : "bg-[rgba(12,24,43,0.7)] hover:bg-[rgba(19,34,61,0.8)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(212,175,55,0.35)]"
                    )}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase border",
                            evt.category === 'banquet'
                              ? "bg-[rgba(212,175,55,0.2)] text-[#f3c64c] border-[rgba(212,175,55,0.4)]"
                              : evt.category === 'corporate'
                              ? "bg-[rgba(168,85,247,0.2)] text-[#c084fc] border-[rgba(168,85,247,0.4)]"
                              : "bg-[rgba(56,189,248,0.2)] text-[#38bdf8] border-[rgba(56,189,248,0.4)]"
                          )}
                        >
                          {evt.category === 'banquet'
                            ? '🏛️ Conference / Banquet'
                            : evt.category === 'corporate'
                            ? '🏭 Corporate Account'
                            : '🏨 Room Stay'}
                        </span>

                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            evt.status === 'In-Progress'
                              ? "bg-[#10b981] text-[#060e1a] font-black animate-pulse"
                              : evt.status === 'In-House'
                              ? "bg-[rgba(56,189,248,0.2)] text-[#38bdf8] border border-[rgba(56,189,248,0.4)]"
                              : evt.status === 'Confirmed'
                              ? "bg-[rgba(212,175,55,0.2)] text-[#f3c64c] border border-[rgba(212,175,55,0.4)]"
                              : "bg-slate-800 text-slate-400"
                          )}
                        >
                          {evt.status}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h4 className="text-base font-bold text-white font-serif leading-snug mb-2">
                        {evt.title}
                      </h4>

                      {/* Meta Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 mb-3 bg-[rgba(6,14,26,0.6)] p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-1.5 text-[#f3c64c] font-medium">
                          <MapPin className="size-3.5 shrink-0" />
                          <span>{evt.venue}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="size-3.5 shrink-0 text-slate-500" />
                          <span>{evt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Users className="size-3.5 shrink-0 text-slate-500" />
                          <span>{evt.pax} • {evt.setup || 'Standard'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Building className="size-3.5 shrink-0 text-slate-500" />
                          <span className="truncate">{evt.organizer}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Billing & Action Buttons */}
                    <div className="pt-3 border-t border-[rgba(212,175,55,0.15)] flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-xs">
                        <span className="text-slate-500 text-[11px] block">Billing Settlement</span>
                        <span className="text-emerald-400 font-semibold">{evt.billing}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {evt.beoDetails && (
                          <button
                            type="button"
                            onClick={() => setSelectedBeoEvent(evt)}
                            className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#f3c64c] text-[#060e1a] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Coffee className="size-3.5" />
                            <span>Inspect BEO</span>
                          </button>
                        )}

                        {onSelectBooking && (
                          <button
                            type="button"
                            onClick={() => onSelectBooking(evt)}
                            className="px-3 py-1.5 bg-[rgba(19,34,61,0.9)] hover:bg-[rgba(212,175,55,0.2)] text-slate-200 hover:text-[#f3c64c] border border-[rgba(212,175,55,0.3)] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Folio</span>
                            <ChevronRight className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BEO (BANQUET EVENT ORDER) FULL DETAILS MODAL */}
        <AnimatePresence>
          {selectedBeoEvent && selectedBeoEvent.beoDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-full max-w-2xl bg-[#0c182b] border-2 border-[rgba(212,175,55,0.6)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[rgba(212,175,55,0.25)] via-[#13223d] to-[#0c182b] p-5 border-b border-[rgba(212,175,55,0.3)] flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#d4af37] text-[#060e1a] text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                        Sri Sai Vasudev Residency BEO
                      </span>
                      <span className="text-[#fceec5] font-mono text-xs">
                        BEO #{selectedBeoEvent.id}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-serif">
                      {selectedBeoEvent.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Banquet Event Order &amp; Function Sheet • Rayagada Operations
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBeoEvent(null)}
                    className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] text-slate-300 hover:text-white"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-sm">
                  {/* Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#060e1a] p-4 rounded-xl border border-[rgba(212,175,55,0.2)] text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Date &amp; Day</span>
                      <span className="font-bold text-white">{selectedBeoEvent.dateStr}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Venue</span>
                      <span className="font-bold text-[#f3c64c]">{selectedBeoEvent.venue}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Guaranteed Pax</span>
                      <span className="font-bold text-white">{selectedBeoEvent.pax}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Coordinator</span>
                      <span className="font-bold text-emerald-400">{selectedBeoEvent.beoDetails.coordinator}</span>
                    </div>
                  </div>

                  {/* Hall Setup */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                      <Building className="size-3.5" />
                      Hall &amp; Seating Setup
                    </h4>
                    <div className="bg-[#060e1a] p-3.5 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed">
                      {selectedBeoEvent.beoDetails.setupStyle}
                    </div>
                  </div>

                  {/* Audio Visual Tech */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                      <Monitor className="size-3.5" />
                      Audio / Visual &amp; Conference Tech
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {selectedBeoEvent.beoDetails.avEquipments.map((av, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-[#060e1a] border border-slate-800 text-xs text-slate-200"
                        >
                          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                          <span>{av}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* F&B Schedule */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                      <Utensils className="size-3.5" />
                      F&amp;B Catering Schedule (Cannon Kitchen Banquets)
                    </h4>
                    <div className="space-y-2">
                      {selectedBeoEvent.beoDetails.fbSchedule.map((fb, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl bg-[#060e1a] border border-slate-800 text-xs"
                        >
                          <span className="px-2 py-0.5 rounded bg-[rgba(212,175,55,0.2)] text-[#f3c64c] font-mono font-bold shrink-0">
                            {fb.time}
                          </span>
                          <span className="text-slate-200 font-medium">{fb.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Settlement */}
                  <div className="bg-gradient-to-r from-[#060e1a] via-[#13223d] to-[rgba(212,175,55,0.15)] p-4 rounded-xl border border-[rgba(212,175,55,0.3)] flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-mono">Settlement Account</span>
                      <span className="font-bold text-white text-xs">{selectedBeoEvent.beoDetails.billingAccount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-mono">Contract Value</span>
                      <span className="text-lg font-black text-[#f3c64c]">₹{selectedBeoEvent.amount?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-[#060e1a] p-4 border-t border-[rgba(212,175,55,0.2)] flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Approved by Hotel General Manager &amp; Corporate Representative
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedBeoEvent(null)}
                    className="px-4 py-2 bg-[#d4af37] hover:bg-[#f3c64c] text-[#060e1a] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Close Function Sheet
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

InteractiveCalendar.displayName = 'InteractiveCalendar';

export default InteractiveCalendar;
