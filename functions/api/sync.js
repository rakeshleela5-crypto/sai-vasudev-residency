// Cloudflare Pages Function: /api/sync
// Connected to Cloudflare D1 Database binding "DB"

const ALLOWED_ORIGINS = [
  "https://sai-vasudev-residency.pages.dev",
  "https://hotel-sai-international.pages.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

function getSecurityHeaders(originHeader = null) {
  const isAllowed = originHeader && (
    ALLOWED_ORIGINS.includes(originHeader) || 
    originHeader.endsWith(".sai-vasudev-residency.pages.dev") || 
    originHeader.endsWith(".hotel-sai-international.pages.dev")
  );
  const allowOrigin = isAllowed ? originHeader : "https://sai-vasudev-residency.pages.dev";

  return {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Vary": "Origin"
  };
}

function jsonResponse(data, status = 200, request = null) {
  const origin = request?.headers?.get("Origin") || null;
  return new Response(JSON.stringify(data), {
    status,
    headers: getSecurityHeaders(origin)
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Whitelisted config keys for save_config
const ALLOWED_CONFIG_KEYS = new Set([
  'hotel_name',
  'hotel_address',
  'phone',
  'landline',
  'email',
  'gstin',
  'ownerPin',
  'upi_id',
  'check_in_time',
  'check_out_time',
  'surge_multiplier',
  'maintenance_mode'
]);

export async function onRequestOptions({ request }) {
  const origin = request?.headers?.get("Origin") || null;
  return new Response(null, {
    status: 204,
    headers: {
      ...getSecurityHeaders(origin),
      "Access-Control-Max-Age": "86400"
    }
  });
}

// Verification of Admin PIN or SECRET
async function verifyAdminAuth(request, env, db) {
  const adminKey = request.headers.get("X-Admin-Key");
  if (!adminKey) return false;

  // 1. Check against Environment Secret if defined
  if (env.ADMIN_SECRET && adminKey === env.ADMIN_SECRET) {
    return true;
  }

  // 2. Check strictly against D1 hotel_config ownerPin (NO hardcoded defaults)
  try {
    const pinRow = await db.prepare("SELECT value FROM hotel_config WHERE key = 'ownerPin'").first();
    if (pinRow && pinRow.value && adminKey === pinRow.value) {
      return true;
    }
  } catch (err) {
    console.error("Auth DB check failed:", err);
  }

  return false;
}

// GET: Synchronize operational tables (Strict Role Separation)
export async function onRequestGet({ request, env }) {
  try {
    const db = env.DB;
    if (!db) {
      return jsonResponse({ error: "D1 database binding 'DB' not configured" }, 500);
    }

    const isAdmin = await verifyAdminAuth(request, env, db);

    // If caller is NOT an authenticated administrator, return ONLY public catalog & menu
    if (!isAdmin) {
      const [roomsRes, menuRes, configRes] = await Promise.all([
        db.prepare("SELECT room_number, tier, floor, tariff, bed_type, amenities, status FROM rooms ORDER BY floor ASC, room_number ASC").all(),
        db.prepare("SELECT * FROM menu_items ORDER BY category ASC").all().catch(() => ({ results: [] })),
        db.prepare("SELECT key, value FROM hotel_config").all().catch(() => ({ results: [] }))
      ]);

      const rooms = (roomsRes.results || []).map(r => {
        let amenities = [];
        try {
          amenities = JSON.parse(r.amenities || "[]");
        } catch {
          amenities = [];
        }
        return {
          roomNumber: r.room_number,
          tier: r.tier,
          floor: r.floor,
          tariff: r.tariff,
          basePrice: r.tariff,
          bedType: r.bed_type,
          amenities,
          status: r.status
          // Notice: current_guest_name and current_booking_id are intentionally omitted for privacy
        };
      });

      const configObj = {};
      const publicKeys = new Set(['hotel_name', 'hotel_address', 'phone', 'landline', 'email', 'gstin', 'check_in_time', 'check_out_time', 'upi_id', 'maintenance_mode']);
      (configRes.results || []).forEach(r => {
        if (publicKeys.has(r.key)) {
          configObj[r.key] = r.value;
        }
      });

      return jsonResponse({
        success: true,
        isAdmin: false,
        data: {
          rooms,
          menuItems: menuRes.results || [],
          hotelConfig: configObj
        }
      });
    }

    // Authenticated Admin / Reception Session: Parallel fetch of all operational tables
    const [
      roomsRes,
      bookingsRes,
      foodOrdersRes,
      staffRes,
      advancesRes,
      expensesRes,
      attendanceRes,
      linenRes,
      inspectionsRes,
      configRes,
      payrollRes,
      nightAuditsRes,
      consentRes,
      dataRightsRes,
      roomServicesRes,
      corporatesRes,
      menuRes,
      handoversRes,
      folioTxnsRes,
      splitPaymentsRes,
      corporateLedgerRes,
      nightAuditLogRes,
      storePurchasesRes,
      requisitionsRes,
      guestProfilesRes,
      restaurantTablesRes,
      restaurantKotVoidsRes,
      corporateInquiriesRes,
      rmsRateGuardrailsRes,
      digitalKeycardsRes,
      maintenanceWorkOrdersRes,
      policeDispatchesRes,
      lostAndFoundRes,
      tallyLedgersRes,
      tallyVouchersRes,
      gstr1FilingsRes,
      gstr2bSuppliesRes,
      gstFomRecordsRes,
      guestTransfersRes,
      tableSettlementsRes,
      corporateQuotationsRes,
      invoicePrintLogsRes,
      inlineOverridesRes
    ] = await Promise.all([
      db.prepare("SELECT * FROM rooms ORDER BY floor ASC, room_number ASC").all(),
      db.prepare("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100").all(),
      db.prepare("SELECT * FROM food_orders ORDER BY created_at DESC LIMIT 50").all(),
      db.prepare("SELECT * FROM staff ORDER BY id ASC").all(),
      db.prepare("SELECT * FROM salary_advances ORDER BY date DESC LIMIT 50").all(),
      db.prepare("SELECT * FROM expenses ORDER BY date DESC LIMIT 100").all(),
      db.prepare("SELECT * FROM attendance ORDER BY date DESC LIMIT 100").all(),
      db.prepare("SELECT * FROM linen_inventory ORDER BY id ASC").all(),
      db.prepare("SELECT * FROM checkout_inspections ORDER BY inspected_at DESC LIMIT 50").all(),
      db.prepare("SELECT * FROM hotel_config").all(),
      db.prepare("SELECT * FROM payroll_history ORDER BY paid_on DESC LIMIT 50").all(),
      db.prepare("SELECT * FROM night_audits ORDER BY audit_date DESC LIMIT 30").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM consent_records ORDER BY consented_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM data_rights_requests ORDER BY submitted_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM room_service_requests ORDER BY requested_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM corporate_partners ORDER BY corporate_id ASC").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM menu_items ORDER BY category ASC").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM cashier_shift_handovers ORDER BY created_at DESC LIMIT 30").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM folio_transactions ORDER BY created_at DESC LIMIT 200").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM split_payments ORDER BY created_at DESC LIMIT 100").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM corporate_ledger ORDER BY entry_date DESC, created_at DESC LIMIT 100").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM night_audit_log ORDER BY business_date DESC LIMIT 30").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM store_purchases ORDER BY purchase_date DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM kitchen_requisitions ORDER BY issue_date DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM guest_profiles ORDER BY total_visits DESC LIMIT 100").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM restaurant_tables ORDER BY table_number ASC").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM restaurant_kot_voids ORDER BY voided_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM corporate_inquiries ORDER BY created_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM rms_rate_guardrails").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM digital_keycards WHERE is_active = 1 ORDER BY created_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM maintenance_work_orders ORDER BY created_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM police_register_dispatches ORDER BY dispatch_date DESC LIMIT 30").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM lost_and_found ORDER BY found_date DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM tally_ledgers ORDER BY ledger_name ASC").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM tally_vouchers ORDER BY voucher_date DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM gstr1_filings ORDER BY generated_at DESC LIMIT 20").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM gstr2b_inward_supplies ORDER BY invoice_date DESC LIMIT 100").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM gst_fom_records ORDER BY bill_date DESC LIMIT 100").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM guest_transfers ORDER BY scheduled_time DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM restaurant_table_settlements ORDER BY settled_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM corporate_quotations ORDER BY created_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM invoice_print_audit_logs ORDER BY printed_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM universal_inline_overrides ORDER BY updated_at DESC LIMIT 200").all().catch(() => ({ results: [] }))
    ]);

    // Parse food order items JSON
    const foodOrders = (foodOrdersRes.results || []).map(o => {
      let items = [];
      try {
        items = JSON.parse(o.items_json || "[]");
      } catch {
        items = [];
      }
      return { ...o, items };
    });

    // Parse rooms amenities JSON and normalize properties for front desk
    const rooms = (roomsRes.results || []).map(r => {
      let amenities = [];
      try {
        amenities = JSON.parse(r.amenities || "[]");
      } catch {
        amenities = [];
      }
      return {
        ...r,
        roomNumber: r.room_number,
        tier: r.tier,
        roomType: r.room_type || 'EXEDEL',
        floor: r.floor,
        tariff: r.tariff,
        basePrice: r.tariff,
        outstandingBalance: r.outstanding_balance !== undefined ? r.outstanding_balance : 0,
        balanceDue: r.outstanding_balance !== undefined ? r.outstanding_balance : 0,
        pax: r.pax || '1 Pax',
        currentGuestName: r.current_guest_name,
        currentBookingId: r.current_booking_id,
        status: r.status,
        amenities
      };
    });

    // Bidirectional normalizer for bookings (supports both camelCase and snake_case lookups)
    const bookings = (bookingsRes.results || []).map(b => ({
      ...b,
      bookingId: b.booking_id,
      roomNumber: b.room_number,
      guestName: b.guest_name,
      guestPhone: b.guest_phone,
      guestEmail: b.guest_email,
      checkInDate: b.check_in_date,
      checkOutDate: b.check_out_date,
      nights: b.nights,
      adults: b.adults,
      children: b.children,
      tariffPerNight: b.tariff_per_night,
      baseTotal: b.base_total,
      cgst: b.cgst,
      sgst: b.sgst,
      totalAmount: b.total_amount,
      advanceDeposit: b.advance_deposit,
      balanceDue: b.balance_due,
      paymentMode: b.payment_mode,
      paymentStatus: b.payment_status,
      bookingStatus: b.booking_status,
      isB2b: b.is_b2b,
      corporateId: b.corporate_id,
      corporateGstin: b.corporate_gstin,
      companyName: b.company_name || '',
      billNo: b.bill_no || `INV-${b.room_number}-${(b.booking_id || '').slice(-4)}`
    }));

    // Bidirectional normalizer for corporate partners
    const corporatePartners = (corporatesRes.results || []).map(c => ({
      ...c,
      id: c.corporate_id,
      name: c.company_name,
      location: c.location,
      gstin: c.gstin,
      contactPerson: c.contact_person,
      contactPhone: c.contact_phone,
      contactEmail: c.contact_email,
      contractDiscount: c.contracted_discount_percent,
      preferredTier: c.preferred_tier || 'Executive Room',
      creditDays: c.credit_days || 30,
      creditLimit: c.credit_limit || 200000,
      openingBalance: c.opening_balance || 0
    }));

    const configRows = configRes.results || [];
    const configObj = {};
    configRows.forEach(r => {
      // Never expose raw ownerPin over sync GET
      if (r.key !== 'ownerPin') {
        configObj[r.key] = r.value;
      }
    });

    return jsonResponse({
      success: true,
      isAdmin: true,
      data: {
        rooms,
        bookings,
        foodOrders,
        staff: staffRes.results || [],
        salaryAdvances: advancesRes.results || [],
        expenses: expensesRes.results || [],
        attendance: attendanceRes.results || [],
        linenInventory: linenRes.results || [],
        checkoutInspections: inspectionsRes.results || [],
        hotelConfig: configObj,
        payrollHistory: payrollRes.results || [],
        nightAudits: nightAuditsRes.results || [],
        consentRecords: consentRes.results || [],
        dataRightsRequests: dataRightsRes.results || [],
        roomServiceRequests: roomServicesRes.results || [],
        corporatePartners,
        menuItems: menuRes.results || [],
        cashierHandovers: handoversRes.results || [],
        folioTransactions: folioTxnsRes?.results || [],
        splitPayments: splitPaymentsRes?.results || [],
        corporateLedger: corporateLedgerRes?.results || [],
        nightAuditLog: nightAuditLogRes?.results || [],
        storePurchases: storePurchasesRes?.results || [],
        kitchenRequisitions: requisitionsRes?.results || [],
        guestProfiles: guestProfilesRes?.results || [],
        restaurantTables: restaurantTablesRes?.results || [],
        restaurantKotVoids: restaurantKotVoidsRes?.results || [],
        corporateInquiries: corporateInquiriesRes?.results || [],
        rmsRateGuardrails: rmsRateGuardrailsRes?.results || [],
        digitalKeycards: digitalKeycardsRes?.results || [],
        maintenanceWorkOrders: maintenanceWorkOrdersRes?.results || [],
        policeDispatches: policeDispatchesRes?.results || [],
        lostAndFound: lostAndFoundRes?.results || [],
        tallyLedgers: tallyLedgersRes?.results || [],
        tallyVouchers: tallyVouchersRes?.results || [],
        gstr1Filings: gstr1FilingsRes?.results || [],
        gstr2bSupplies: gstr2bSuppliesRes?.results || [],
        gstFomRecords: gstFomRecordsRes?.results || [],
        guestTransfers: guestTransfersRes?.results || [],
        restaurantTableSettlements: tableSettlementsRes?.results || [],
        corporateQuotations: corporateQuotationsRes?.results || [],
        invoicePrintAuditLogs: invoicePrintLogsRes?.results || [],
        universalInlineOverrides: inlineOverridesRes?.results || []
      }
    });
  } catch (error) {
    console.error("Sync GET Error:", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

// POST: Action Dispatcher
export async function onRequestPost({ request, env }) {
  try {
    const db = env.DB;
    if (!db) {
      return jsonResponse({ error: "D1 database binding 'DB' not configured" }, 500);
    }

    const body = await request.json();
    const { action, payload } = body;

    // 1. PUBLIC GUEST ACTION: Save Booking
    if (action === 'save_booking') {
      const b = payload || {};
      const roomNumber = String(b.roomNumber || b.room_number || '');
      const checkInDate = b.checkInDate || b.check_in_date;
      const checkOutDate = b.checkOutDate || b.check_out_date || checkInDate;
      const guestName = b.guestName || b.guest_name;
      const guestPhone = b.guestPhone || b.guest_phone;
      const bookingId = b.bookingId || b.booking_id || `HSI-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      if (!roomNumber || !checkInDate || !guestName || !guestPhone) {
        return jsonResponse({ error: "Missing required booking fields (roomNumber, checkInDate, guestName, guestPhone)" }, 400);
      }

      // Mutex collision check: verify room is not booked on conflicting dates by another booking
      const collision = await db.prepare(`
        SELECT booking_id FROM bookings 
        WHERE room_number = ? 
          AND booking_id != ?
          AND booking_status NOT IN ('Cancelled', 'Checked Out')
          AND NOT (check_out_date <= ? OR check_in_date >= ?)
      `).bind(roomNumber, bookingId, checkInDate, checkOutDate).first();

      if (collision) {
        return jsonResponse({
          error: `Room ${roomNumber} is already booked for the selected dates. Please select another room.`,
          collisionId: collision.booking_id
        }, 409);
      }

      // PAYMENT STATUS FORGERY PROTECTION
      // Public submissions can NEVER self-verify as 'Paid'
      const isAdmin = await verifyAdminAuth(request, env, db);
      let calculatedPaymentStatus = 'Pending Gateway Verification';
      if (isAdmin && (b.paymentStatus || b.payment_status)) {
        calculatedPaymentStatus = b.paymentStatus || b.payment_status;
      } else if (b.paymentMode === 'Pay at Hotel' || b.payment_mode === 'Pay at Hotel' || b.paymentMode === 'Cash') {
        calculatedPaymentStatus = 'Pending Payment at Check-In';
      }

      const maskedId = b.idProofMasked || b.id_proof_masked || `XXXX-XXXX-${String(guestPhone).slice(-4)}`;
      const stateOfOrigin = b.stateOfOrigin || b.state_of_origin || 'Odisha';
      const isInterstate = (stateOfOrigin.toLowerCase() !== 'odisha') ? 1 : 0;
      const billNo = b.billNo || b.bill_no || `INV-${roomNumber}-${Date.now().toString().slice(-4)}`;
      const companyName = b.companyName || b.company_name || (b.company || '');
      const tariffPerNight = Number(b.tariffPerNight || b.tariff_per_night || b.tariff || 2199);
      const nights = Number(b.nights || 1);
      const totalAmount = Number(b.totalAmount !== undefined ? b.totalAmount : (b.total_amount !== undefined ? b.total_amount : tariffPerNight * nights));
      const advanceDeposit = Number(b.advanceDeposit !== undefined ? b.advanceDeposit : (b.advance_deposit !== undefined ? b.advance_deposit : 0));
      const balanceDue = Number(b.balanceDue !== undefined ? b.balanceDue : (b.balance_due !== undefined ? b.balance_due : Math.max(0, totalAmount - advanceDeposit)));
      const baseTotal = Number(b.baseTotal || b.base_total || Math.round((totalAmount / 1.05) * 100) / 100);
      const cgst = Number(b.cgst !== undefined ? b.cgst : Math.round(((totalAmount - baseTotal) / 2) * 100) / 100);
      const sgst = Number(b.sgst !== undefined ? b.sgst : Math.round((totalAmount - baseTotal - cgst) * 100) / 100);

      await db.prepare(`
        INSERT INTO bookings (
          booking_id, room_number, guest_name, guest_phone, guest_email,
          id_proof_type, id_proof_masked, state_of_origin, is_interstate,
          check_in_date, check_out_date, nights, adults, children,
          tariff_per_night, base_total, cgst, sgst, total_amount,
          advance_deposit, balance_due, payment_mode, payment_status,
          booking_status, is_b2b, corporate_id, corporate_gstin,
          company_name, bill_no,
          consent_dpdp, special_requests, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?,
          ?, ?, datetime('now'), datetime('now')
        )
        ON CONFLICT(booking_id) DO UPDATE SET
          room_number = excluded.room_number,
          guest_name = excluded.guest_name,
          guest_phone = excluded.guest_phone,
          check_in_date = excluded.check_in_date,
          check_out_date = excluded.check_out_date,
          nights = excluded.nights,
          tariff_per_night = excluded.tariff_per_night,
          base_total = excluded.base_total,
          cgst = excluded.cgst,
          sgst = excluded.sgst,
          total_amount = excluded.total_amount,
          advance_deposit = excluded.advance_deposit,
          balance_due = excluded.balance_due,
          payment_status = excluded.payment_status,
          booking_status = excluded.booking_status,
          updated_at = datetime('now')
      `).bind(
        bookingId, roomNumber, guestName, guestPhone, b.guestEmail || b.guest_email || '',
        b.idProofType || b.id_proof_type || 'Aadhaar', maskedId, stateOfOrigin, isInterstate,
        checkInDate, checkOutDate, nights, b.adults || 1, b.children || 0,
        tariffPerNight, baseTotal, cgst, sgst, totalAmount,
        advanceDeposit, balanceDue, b.paymentMode || b.payment_mode || 'Cash',
        calculatedPaymentStatus, b.bookingStatus || b.booking_status || 'Checked In',
        (b.isB2b || b.is_b2b) ? 1 : 0, b.corporateId || b.corporate_id || '', b.corporateGstin || b.corporate_gstin || '',
        companyName, billNo,
        (b.consentDpdp !== undefined ? b.consentDpdp : 1), b.specialRequests || b.special_requests || ''
      ).run();

      // Update room status and outstanding balance on front desk matrix
      await db.prepare(`
        UPDATE rooms 
        SET status = 'Occupied',
            current_guest_name = ?,
            current_booking_id = ?,
            outstanding_balance = ?
        WHERE room_number = ?
      `).bind(guestName, bookingId, balanceDue, roomNumber).run().catch(e => console.warn("Room status update non-fatal:", e));

      // Upsert into central guest CRM profiles (Table 50)
      await db.prepare(`
        INSERT INTO guest_profiles (
          guest_id, phone, name, email, id_proof_type, id_proof_masked,
          state_of_origin, total_visits, lifetime_spend, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'))
        ON CONFLICT(phone) DO UPDATE SET
          name = excluded.name,
          email = CASE WHEN excluded.email != '' THEN excluded.email ELSE guest_profiles.email END,
          total_visits = total_visits + 1,
          lifetime_spend = lifetime_spend + excluded.lifetime_spend,
          updated_at = datetime('now')
      `).bind(
        `GUEST-${Date.now()}`, b.guestPhone, b.guestName, b.guestEmail || '',
        b.idProofType || 'Aadhaar', maskedId, b.stateOfOrigin || 'Odisha',
        b.totalAmount || 0
      ).run().catch(e => console.warn("Guest profile CRM upsert non-fatal:", e));

      // Also record DPDP consent
      await db.prepare(`
        INSERT INTO consent_records (
          consent_id, guest_name, phone_or_email, purpose,
          ip_address, consent_granted, consented_at, purge_scheduled_at
        ) VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now', '+30 days'))
      `).bind(
        `CONS-${Date.now()}`, b.guestName, b.guestPhone,
        'Accommodation Registration & Sarai Act Compliance',
        request.headers.get("cf-connecting-ip") || '127.0.0.1'
      ).run().catch(e => console.error("DPDP consent record error:", e));

      // Also record in statutory Sarai Act 1867 Daily Police Register
      const polEntryId = `POL-${Date.now().toString().slice(-6)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO police_guest_entries (
          entry_id, booking_id, guest_name, phone, id_type,
          id_number_masked, state_origin, arrival_time, departure_time,
          purpose_of_visit, dispatch_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, 'Pending', datetime('now'))
      `).bind(
        polEntryId, bookingId, guestName, guestPhone,
        b.idProofType || 'Aadhaar', maskedId, stateOfOrigin,
        checkOutDate || datetime('now', '+1 day'),
        b.purposeOfVisit || b.specialRequests || 'Business / Pilgrimage'
      ).run().catch(e => console.warn("Police guest entry insert non-fatal:", e));

      return jsonResponse({ success: true, bookingId, billNo, paymentStatus: calculatedPaymentStatus });
    }

    // 2. PUBLIC GUEST ACTION: Create Room Hold (Rate-limited, Max 2 per IP, 10 min TTL)
    if (action === 'create_room_hold') {
      const { roomNumber, sessionToken } = payload;
      const clientIp = request.headers.get("cf-connecting-ip") || '127.0.0.1';

      // Purge expired holds first
      await db.prepare("DELETE FROM room_holds WHERE expires_at <= datetime('now')").run();

      // Check existing active holds for this IP
      const activeCount = await db.prepare(
        "SELECT COUNT(*) as cnt FROM room_holds WHERE client_ip = ? AND expires_at > datetime('now')"
      ).bind(clientIp).first();

      if (activeCount && activeCount.cnt >= 2) {
        return jsonResponse({
          error: "Maximum room hold limit reached (2 concurrent holds per visitor). Please complete or wait for previous hold to expire."
        }, 429);
      }

      const holdId = `HOLD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await db.prepare(`
        INSERT INTO room_holds (hold_id, room_number, client_ip, session_token, expires_at, created_at)
        VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'), datetime('now'))
      `).bind(holdId, roomNumber, clientIp, sessionToken || holdId).run();

      return jsonResponse({ success: true, holdId, expiresInMinutes: 10 });
    }

    // 3. PUBLIC GUEST ACTION: Place Food Order
    if (action === 'place_food_order') {
      const order = payload;
      const orderId = `FOOD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await db.prepare(`
        INSERT INTO food_orders (
          order_id, room_number, guest_name, items_json,
          subtotal, gst, total_amount, is_jain_satvik, status, payment_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Received', 'Pending', datetime('now'))
      `).bind(
        orderId, order.roomNumber, order.guestName || `Room ${order.roomNumber}`,
        JSON.stringify(order.items || []), order.subtotal || 0, order.gst || 0,
        order.totalAmount || 0, order.isJain ? 1 : 0
      ).run();

      return jsonResponse({ success: true, orderId });
    }

    // 4. PUBLIC GUEST ACTION: Room Service Request
    if (action === 'place_room_service') {
      const req = payload;
      const requestId = `SRV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await db.prepare(`
        INSERT INTO room_service_requests (
          request_id, room_number, service_type, description, priority, status, requested_at
        ) VALUES (?, ?, ?, ?, ?, 'Pending', datetime('now'))
      `).bind(
        requestId, req.roomNumber, req.serviceType, req.description || '', req.priority || 'Normal'
      ).run();

      return jsonResponse({ success: true, requestId });
    }

    // 5. PUBLIC GUEST ACTION: DPDP Data Rights Request Intake
    if (action === 'submit_data_rights') {
      const req = payload;
      const reqId = `DPDP-${Date.now()}`;
      await db.prepare(`
        INSERT INTO data_rights_requests (
          request_id, guest_name, contact, request_type, details, status, submitted_at
        ) VALUES (?, ?, ?, ?, ?, 'Received', datetime('now'))
      `).bind(
        reqId, req.guestName, req.contact, req.requestType || 'Access', req.details || ''
      ).run();

      return jsonResponse({ success: true, requestId: reqId });
    }

    
    // 20. ERP PUBLIC: Corporate B2B Account Onboarding Application & Lead Capture
    if (action === 'apply_corporate_account') {
      const p = payload;
      const corpId = p.corporateId || `CORP-${Date.now().toString().slice(-4)}`;
      const inqId = `INQ-${Date.now().toString().slice(-4)}`;

      // 1. Register corporate partner in pending status
      await db.prepare(`
        INSERT OR IGNORE INTO corporate_partners (
          corporate_id, company_name, gstin, location, contact_person,
          contact_email, contact_phone, contracted_discount_percent, preferred_tier,
          credit_days, credit_limit, opening_balance, status
        ) VALUES (?, ?, ?, 'Rayagada Industrial Area', ?, ?, ?, 10, 'Executive Room', 30, 200000, 0, 'Pending Verification')
      `).bind(
        corpId, p.companyName, p.gstin, p.contactPerson || 'Logistics Lead',
        p.contactEmail || '', p.contactPhone || ''
      ).run().catch(e => console.warn("Corporate partner application insert error:", e));

      // 2. Also log to corporate_inquiries table for sales CRM
      await db.prepare(`
        INSERT INTO corporate_inquiries (
          inquiry_id, company_name, gstin, contact_person, contact_email,
          phone, estimated_monthly_rooms, status, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending Review', 'Submitted via B2B Corporate Portal', datetime('now'))
      `).bind(
        inqId, p.companyName, p.gstin || '', p.contactPerson || '',
        p.contactEmail || '', p.contactPhone || '', p.estimatedRooms || '5-10 rooms/month'
      ).run().catch(e => console.warn("Corporate inquiry insert error:", e));

      return jsonResponse({ success: true, corporateId: corpId, inquiryId: inqId });
    }

    // 41. CORPORATE PORTAL: Record Corporate Advance Quotation
    if (action === 'record_corporate_advance_quotation') {
      const q = payload || {};
      const quotationId = q.quotationNo || `HSI-QUO-${Date.now()}`;
      const partnerId = q.partnerId || null;
      const companyName = q.companyName || 'Corporate Client';
      const grandTotal = Number(q.grandTotal || 0);
      const quotedRate = Number(q.quotedRate || 2200);

      await db.prepare(`
        INSERT INTO corporate_quotations (
          quotation_id, corporate_id, company_name, contact_person, contact_email, contact_phone,
          room_tier, rooms_count, nights, quoted_rate, estimated_total, tds_applicable, valid_until, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now', '+30 days'), ?)
        ON CONFLICT(quotation_id) DO UPDATE SET
          estimated_total = excluded.estimated_total,
          status = excluded.status
      `).bind(
        quotationId, partnerId, companyName, q.contactPerson || 'Authorized Representative',
        q.contactEmail || 'corporate@partner.com', q.contactPhone || '+91 94370 00000',
        q.roomTier || 'Executive Room', Number(q.roomCount || 1), Number(q.nightCount || 1),
        quotedRate, grandTotal, '194C (2%)', q.status || 'Advance Confirmed'
      ).run().catch(() => {});

      return jsonResponse({ success: true, quotationId, companyName, grandTotal, status: q.status || 'Advance Confirmed' });
    }

    // --- PROTECTED ADMINISTRATIVE ACTIONS ---
    // Strict authentication required for all back-office mutations
    const isAuthorized = await verifyAdminAuth(request, env, db);
    if (!isAuthorized) {
      return jsonResponse({ error: "Unauthorized. Valid administrative session required." }, 401);
    }

    // 6. ADMIN: Save Hotel Config (Strict Whitelist + Validation)
    if (action === 'save_config') {
      const { key, value } = payload;
      if (!ALLOWED_CONFIG_KEYS.has(key)) {
        return jsonResponse({ error: `Config key '${key}' is not editable.` }, 400);
      }

      // Validation for UPI and PIN
      if (key === 'upi_id' && !/^[\w.-]+@[\w.-]+$/.test(value)) {
        return jsonResponse({ error: "Invalid UPI format. Must be like 'name@bank'." }, 400);
      }
      if (key === 'ownerPin' && !/^\d{4,6}$/.test(value)) {
        return jsonResponse({ error: "Owner PIN must be a 4 to 6-digit numeric code." }, 400);
      }

      await db.prepare(`
        INSERT INTO hotel_config (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
      `).bind(key, value).run();

      return jsonResponse({ success: true, key, updated: true });
    }

    // 7. ADMIN: Update Room Status
    if (action === 'update_room_status') {
      const { roomNumber, status, guestName, bookingId } = payload;
      let dbStatus = status;
      if (status === 'Vacant Dirty') dbStatus = 'Cleaning';

      await db.prepare(`
        UPDATE rooms 
        SET status = ?, current_guest_name = ?, current_booking_id = ?,
            last_cleaned_at = CASE WHEN ? = 'Available' THEN datetime('now') ELSE last_cleaned_at END
        WHERE room_number = ?
      `).bind(dbStatus, guestName || null, bookingId || null, dbStatus, roomNumber).run();

      return jsonResponse({ success: true, roomNumber, status });
    }

    // 8. ADMIN: Record Cashier Shift Handover
    if (action === 'record_shift_handover') {
      const h = payload;
      const handoverId = `SFT-${Date.now()}`;
      const variance = (h.closingCashActual || 0) - (h.closingCashExpected || 0);
      const status = Math.abs(variance) < 1 ? 'Balanced' : 'Discrepancy';

      await db.prepare(`
        INSERT INTO cashier_shift_handovers (
          handover_id, shift_date, shift_type, outgoing_cashier, incoming_cashier,
          opening_float, cash_collected, upi_collected, card_collected, corporate_credit,
          total_revenue, expected_drawer_cash, actual_drawer_cash, variance_amount,
          discrepancy_reason, status, verified_by, notes, created_at
        ) VALUES (
          ?, date('now'), ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, datetime('now')
        )
      `).bind(
        handoverId, h.shiftType || 'General Shift', h.outgoingCashier || 'Current Shift Cashier', h.incomingCashier || 'Next Shift Cashier',
        h.openingFloat || 5000, h.cashCollected || 0, h.upiCollected || 0, h.cardCollected || 0, h.companyCredit || 0,
        h.totalRevenue || 0, h.closingCashExpected || 0, h.closingCashActual || 0, variance,
        h.varianceReason || null, status, 'Duty Manager', h.notes || ''
      ).run();

      return jsonResponse({ success: true, handoverId, status, variance });
    }

    // 9. ADMIN: Perform Night Audit Run
    if (action === 'run_night_audit') {
      const audit = payload;
      const auditId = `AUD-${Date.now()}`;
      await db.prepare(`
        INSERT INTO night_audits (
          audit_id, audit_date, total_rooms, occupied_rooms, occupancy_rate,
          room_revenue, pos_fnb_revenue, other_revenue, total_revenue,
          cash_collected, upi_collected, card_collected, corporate_billed,
          discrepancy_amount, auditor_name, notes, created_at
        ) VALUES (?, date('now'), 18, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(audit_date) DO UPDATE SET
          occupied_rooms = excluded.occupied_rooms,
          occupancy_rate = excluded.occupancy_rate,
          total_revenue = excluded.total_revenue,
          created_at = datetime('now')
      `).bind(
        auditId, audit.occupiedRooms || 0, audit.occupancyRate || 0,
        audit.roomRevenue || 0, audit.posFnbRevenue || 0, audit.otherRevenue || 0, audit.totalRevenue || 0,
        audit.cashCollected || 0, audit.upiCollected || 0, audit.cardCollected || 0, audit.corporateBilled || 0,
        audit.discrepancyAmount || 0, audit.auditorName || 'Duty Manager', audit.notes || ''
      ).run();

      return jsonResponse({ success: true, auditId });
    }

    // 10. ADMIN: Log Police Register Dispatch
    if (action === 'dispatch_police_register') {
      const p = payload;
      const dispatchId = `SARAI-${Date.now()}`;
      await db.prepare(`
        INSERT INTO police_register_dispatches (
          dispatch_id, dispatch_date, police_station, total_entries,
          interstate_entries, foreign_entries, dispatched_by, channel,
          dispatch_status, payload_preview, created_at
        ) VALUES (?, date('now'), 'Rayagada Town PS', ?, ?, 0, ?, 'WhatsApp & Email', 'Dispatched', ?, datetime('now'))
      `).bind(
        dispatchId, p.totalEntries || 0, p.interstateEntries || 0,
        p.dispatchedBy || 'Front Desk', escapeHtml(p.preview || '')
      ).run();

      return jsonResponse({ success: true, dispatchId });
    }

    // 11. ERP ADMIN: Post Folio Transaction (Master Double-Entry Ledger)
    if (action === 'post_folio_transaction') {
      const t = payload;
      const txnId = t.transactionId || `TXN-${t.roomNumber}-${Date.now()}`;
      
      // Strict constraint normalization for SQLite CHECK
      const allowedTxTypes = ['Room Charge', 'Food & Beverage', 'Bar', 'Room Service', 'Laundry', 'Minibar', 'Extra Bed', 'Payment', 'Discount', 'Allowance'];
      let normTxType = t.transactionType || 'Room Charge';
      if (!allowedTxTypes.includes(normTxType)) {
        if (/dining|restaurant|food|kot|f&b/i.test(normTxType)) normTxType = 'Food & Beverage';
        else if (/pay|settle|advance|deposit/i.test(normTxType)) normTxType = 'Payment';
        else if (/allowance|courtesy|waiver/i.test(normTxType)) normTxType = 'Allowance';
        else if (/discount/i.test(normTxType)) normTxType = 'Discount';
        else if (/laundry/i.test(normTxType)) normTxType = 'Laundry';
        else normTxType = 'Room Charge';
      }

      await db.prepare(`
        INSERT INTO folio_transactions (
          transaction_id, folio_id, booking_id, room_number, transaction_type,
          outlet, item_code, description, debit_amount, credit_amount,
          taxable_base, gst_rate, cgst, sgst, sac_code, invoice_id, is_locked, created_by, created_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, 0, ?, datetime('now')
        )
      `).bind(
        txnId, t.folioId || `FOLIO-${t.roomNumber}`, t.bookingId || null, t.roomNumber, normTxType,
        t.outlet || 'Front Desk', t.itemCode || 'MISC', t.description, parseFloat(t.debitAmount) || 0, parseFloat(t.creditAmount) || 0,
        parseFloat(t.taxableBase) || 0, parseFloat(t.gstRate) || 0, parseFloat(t.cgst) || 0, parseFloat(t.sgst) || 0,
        t.sacCode || '996311', t.invoiceId || null, t.createdBy || 'Front Desk'
      ).run();

      const netDelta = (parseFloat(t.debitAmount) || 0) - (parseFloat(t.creditAmount) || 0);
      if (netDelta !== 0 && t.roomNumber) {
        await db.prepare(`
          UPDATE rooms SET outstanding_balance = outstanding_balance + ? WHERE room_number = ?
        `).bind(netDelta, t.roomNumber).run().catch(() => {});

        await db.prepare(`
          UPDATE bookings 
          SET balance_due = balance_due + ?, updated_at = datetime('now')
          WHERE room_number = ? AND booking_status NOT IN ('Cancelled', 'Checked Out')
        `).bind(netDelta, t.roomNumber).run().catch(() => {});
      }

      return jsonResponse({ success: true, transactionId: txnId });
    }

    // 12. ERP RESTAURANT: Bill KOT directly to Guest Room Folio
    if (action === 'bill_kot_to_room') {
      const { 
        roomNumber, kotId, items, grossSubtotal, discount, discountReason,
        subtotal, gst, totalAmount, description, outlet, captainName,
        isNonCommercial, ncReason 
      } = payload;
      const txnId = `TXN-KOT-${Date.now()}`;

      // 1. Post to folio_transactions
      await db.prepare(`
        INSERT INTO folio_transactions (
          transaction_id, folio_id, room_number, transaction_type, outlet,
          item_code, description, debit_amount, credit_amount, taxable_base,
          gst_rate, cgst, sgst, sac_code, is_locked, created_by, created_at
        ) VALUES (
          ?, ?, ?, 'Food & Beverage', ?,
          ?, ?, ?, 0, ?,
          5, ?, ?, '996331', 0, ?, datetime('now')
        )
      `).bind(
        txnId, `FOLIO-${roomNumber}`, roomNumber, outlet || 'Cannon Kitchen',
        kotId, description, totalAmount, subtotal || grossSubtotal || totalAmount,
        (gst || 0) / 2, (gst || 0) / 2, captainName || 'F&B Captain'
      ).run();

      // 2. Also log to food_orders table for kitchen display & revenue auditing
      await db.prepare(`
        INSERT INTO food_orders (
          order_id, room_number, guest_name, outlet, items_json, subtotal,
          discount, discount_reason, gst, total_amount, is_non_commercial,
          nc_reason, captain_name, status, payment_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Billed to Room', 'Charged to Master Folio', datetime('now'))
      `).bind(
        kotId, roomNumber, `Room ${roomNumber} Guest`, outlet || 'Cannon Kitchen', JSON.stringify(items || []),
        subtotal || grossSubtotal || totalAmount, discount || 0, discountReason || '', gst || 0, totalAmount,
        isNonCommercial ? 1 : 0, ncReason || '', captainName || 'Captain'
      ).run().catch(() => {});

      // 3. Update bookings balance_due in Cloudflare D1 database
      await db.prepare(`
        UPDATE bookings
        SET balance_due = balance_due + ?, updated_at = datetime('now')
        WHERE room_number = ? AND booking_status NOT IN ('Cancelled', 'Checked Out')
      `).bind(totalAmount, roomNumber).run().catch(err => console.warn('D1 balance_due update non-fatal:', err));

      // 4. Update rooms outstanding_balance on front desk matrix
      await db.prepare(`
        UPDATE rooms
        SET outstanding_balance = outstanding_balance + ?
        WHERE room_number = ?
      `).bind(totalAmount, roomNumber).run().catch(err => console.warn('D1 room outstanding_balance update non-fatal:', err));

      return jsonResponse({ success: true, transactionId: txnId, kotId, billedToRoom: roomNumber });
    }

    // 13. ERP ADMIN: Settle Split Payment (Multi-Tender Single Invoice)
    if (action === 'settle_split_payment') {
      const { folioId, roomNumber, invoiceId, tenderRows } = payload;
      const targetFolioId = folioId || `FOLIO-${roomNumber}`;
      
      for (const row of (tenderRows || [])) {
        const paymentId = `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

        // Normalize mode to match CHECK (payment_mode IN ('Cash', 'UPI', 'Card', 'Corporate Credit', 'Cheque', 'Bank Transfer NEFT'))
        let normMode = 'Cash';
        const rawMode = (row.mode || '').toLowerCase();
        if (rawMode.includes('upi') || rawMode.includes('phonepe') || rawMode.includes('gpay') || rawMode.includes('paytm')) {
          normMode = 'UPI';
        } else if (rawMode.includes('card') || rawMode.includes('pos')) {
          normMode = 'Card';
        } else if (rawMode.includes('btc') || rawMode.includes('credit') || rawMode.includes('company')) {
          normMode = 'Corporate Credit';
        } else if (rawMode.includes('cheque')) {
          normMode = 'Cheque';
        } else if (rawMode.includes('bank') || rawMode.includes('neft') || rawMode.includes('rtgs')) {
          normMode = 'Bank Transfer NEFT';
        } else if (rawMode.includes('cash')) {
          normMode = 'Cash';
        }

        // 1. Record credit in folio_transactions first (ensures parent folio exists)
        await db.prepare(`
          INSERT INTO folio_transactions (
            transaction_id, folio_id, room_number, transaction_type, outlet,
            item_code, description, debit_amount, credit_amount, is_locked, created_at
          ) VALUES (?, ?, ?, 'Payment', 'Front Desk', 'PAYMENT', ?, 0, ?, 0, datetime('now'))
        `).bind(
          `TXN-${paymentId}`, targetFolioId, roomNumber,
          `Settlement via ${normMode} (Ref: ${row.ref || 'Direct'})`, parseFloat(row.amount) || 0
        ).run().catch(() => {});

        // 2. Insert into split_payments audit log
        await db.prepare(`
          INSERT INTO split_payments (
            payment_id, folio_id, invoice_id, payment_mode, amount,
            reference_utr, cashier_name, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          paymentId, targetFolioId, invoiceId || `INV-${roomNumber}`,
          normMode, parseFloat(row.amount) || 0, row.ref || '', 'Front Desk Cashier'
        ).run().catch(() => {});
      }

      // 1. Update room to Cleaning (Vacant Dirty) and zero out outstanding balance
      await db.prepare(`
        UPDATE rooms 
        SET status = 'Cleaning', current_guest_name = NULL, current_booking_id = NULL, outstanding_balance = 0
        WHERE room_number = ?
      `).bind(roomNumber).run();

      // 2. Mark booking as Checked Out and zero out balance due
      await db.prepare(`
        UPDATE bookings 
        SET booking_status = 'Checked Out', balance_due = 0, payment_status = 'Paid', updated_at = datetime('now')
        WHERE (booking_id = ? OR (room_number = ? AND booking_status = 'Checked In'))
      `).bind(payload.bookingId || null, roomNumber).run().catch(e => console.warn('Booking checkout update error:', e));

      // 3. Save housekeeping turnover ticket if provided
      if (payload.housekeepingTicket) {
        const hk = payload.housekeepingTicket;
        await db.prepare(`
          INSERT INTO room_service_requests (
            request_id, room_number, service_type, description, priority, status, created_at
          ) VALUES (?, ?, ?, ?, ?, 'Pending', datetime('now'))
        `).bind(
          hk.requestId || `HK-TURNOVER-${roomNumber}-${Date.now().toString().slice(-4)}`,
          roomNumber,
          hk.serviceType || 'Turnover Sanitization & Deep Clean',
          hk.description || `Automated Checkout Turnover: Room ${roomNumber}`,
          hk.priority || 'Urgent'
        ).run().catch(() => {});
      }

      return jsonResponse({ success: true, settledRoom: roomNumber, tendersCount: (tenderRows || []).length });
    }

    // 14. ERP ADMIN: Execute 12:00 AM Night Audit (Hard Lock & Day Rollover)
    if (action === 'execute_night_audit') {
      const audit = payload;
      const auditId = audit.auditId || `NA-${audit.businessDate || Date.now()}`;

      // 1. Insert or update official audit log
      await db.prepare(`
        INSERT INTO night_audit_log (
          audit_id, business_date, closed_at, total_rooms, occupied_rooms,
          occupancy_pct, adr, revpar, room_revenue, fnb_revenue,
          other_revenue, gross_revenue, cash_collected, upi_collected,
          card_collected, company_billed, cash_opening_float, cash_expected,
          cash_physical_drawer, cash_variance, is_locked, auditor_name, notes
        ) VALUES (
          ?, ?, datetime('now'), 18, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, 1, ?, ?
        )
        ON CONFLICT(business_date) DO UPDATE SET
          closed_at = datetime('now'),
          occupied_rooms = excluded.occupied_rooms,
          occupancy_pct = excluded.occupancy_pct,
          adr = excluded.adr,
          revpar = excluded.revpar,
          room_revenue = excluded.room_revenue,
          fnb_revenue = excluded.fnb_revenue,
          other_revenue = excluded.other_revenue,
          gross_revenue = excluded.gross_revenue,
          cash_collected = excluded.cash_collected,
          upi_collected = excluded.upi_collected,
          card_collected = excluded.card_collected,
          company_billed = excluded.company_billed,
          cash_opening_float = excluded.cash_opening_float,
          cash_expected = excluded.cash_expected,
          cash_physical_drawer = excluded.cash_physical_drawer,
          cash_variance = excluded.cash_variance,
          is_locked = 1,
          auditor_name = excluded.auditor_name,
          notes = excluded.notes
      `).bind(
        auditId, audit.businessDate, audit.occupiedRooms || 0,
        audit.occupancyPct || 0, audit.adr || 0, audit.revpar || 0, audit.roomRevenue || 0, audit.fnbRevenue || 0,
        audit.otherRevenue || 0, audit.grossRevenue || 0, audit.cashCollected || 0, audit.upiCollected || 0,
        audit.cardCollected || 0, audit.companyBilled || 0, audit.cashOpeningFloat || 5000, audit.cashExpected || 0,
        audit.cashPhysicalDrawer || 0, audit.cashVariance || 0, audit.auditorName || 'Duty Lead', audit.notes || ''
      ).run();

      // 2. HARD LOCK all transactions against backdating
      await db.prepare(`
        UPDATE folio_transactions SET is_locked = 1 WHERE is_locked = 0
      `).run();

      return jsonResponse({ success: true, auditId, locked: true });
    }

    // 15. ERP STORE: Record Mandi Raw Material Purchase
    if (action === 'record_store_purchase') {
      const p = payload;
      const purchaseId = p.purchaseId || `PUR-${Date.now()}`;
      
      // Normalize category: CHECK ('Vegetables', 'Poultry & Meat', 'Dairy & Paneer', 'Groceries & Rice', 'Spices & Oils', 'Packaging & Disposables')
      const allowedCategories = ['Vegetables', 'Poultry & Meat', 'Dairy & Paneer', 'Groceries & Rice', 'Spices & Oils', 'Packaging & Disposables'];
      let normCategory = p.category || 'Vegetables';
      if (!allowedCategories.includes(normCategory)) {
        if (/dairy|milk|paneer|curd/i.test(normCategory)) normCategory = 'Dairy & Paneer';
        else if (/poultry|chicken|egg|meat|mutton/i.test(normCategory)) normCategory = 'Poultry & Meat';
        else if (/spice|oil|masala/i.test(normCategory)) normCategory = 'Spices & Oils';
        else if (/rice|grocery|dal|grain/i.test(normCategory)) normCategory = 'Groceries & Rice';
        else if (/pack|disposable/i.test(normCategory)) normCategory = 'Packaging & Disposables';
        else normCategory = 'Vegetables';
      }

      // Normalize payment_status: CHECK ('Cash Paid', 'UPI Paid', 'Credit Payable')
      let normPayStatus = p.paymentStatus || 'Cash Paid';
      if (!['Cash Paid', 'UPI Paid', 'Credit Payable'].includes(normPayStatus)) {
        if (/upi|phonepe|gpay/i.test(normPayStatus)) normPayStatus = 'UPI Paid';
        else if (/credit|payable|pending|due/i.test(normPayStatus)) normPayStatus = 'Credit Payable';
        else normPayStatus = 'Cash Paid';
      }

      await db.prepare(`
        INSERT INTO store_purchases (
          purchase_id, vendor_name, invoice_no, purchase_date, category,
          items_summary, total_amount, payment_status, received_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        purchaseId, p.vendorName, p.invoiceNo || null, p.date || new Date().toISOString().slice(0, 10), normCategory,
        p.itemsSummary, parseFloat(p.totalAmount) || 0, normPayStatus, p.receivedBy || 'Store Incharge'
      ).run();

      return jsonResponse({ success: true, purchaseId });
    }

    // 16. ERP ACCOUNTS: Record Corporate Ledger Entry (Statement of Account with TDS)
    if (action === 'record_corporate_ledger_entry') {
      const c = payload;
      const entryId = c.entryId || `LED-${Date.now()}`;

      // Normalize entry_type: CHECK ('Invoice Debit', 'Bank NEFT Credit', 'Cheque Credit', 'TDS Deduction Credit', 'Credit Note')
      const allowedEntryTypes = ['Invoice Debit', 'Bank NEFT Credit', 'Cheque Credit', 'TDS Deduction Credit', 'Credit Note'];
      let normEntryType = c.entryType || 'Bank NEFT Credit';
      if (!allowedEntryTypes.includes(normEntryType)) {
        if (/tds/i.test(normEntryType)) normEntryType = 'TDS Deduction Credit';
        else if (/cheque|check/i.test(normEntryType)) normEntryType = 'Cheque Credit';
        else if (/note/i.test(normEntryType)) normEntryType = 'Credit Note';
        else if (/debit|bill|invoice/i.test(normEntryType)) normEntryType = 'Invoice Debit';
        else normEntryType = 'Bank NEFT Credit';
      }

      await db.prepare(`
        INSERT INTO corporate_ledger (
          entry_id, corporate_id, entry_date, entry_type, invoice_id,
          description, debit_amount, credit_amount, tds_section, tds_amount,
          running_balance, bank_ref, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        entryId, c.corporateId, c.date || new Date().toISOString().slice(0, 10), normEntryType, c.invoiceId || null,
        c.description, parseFloat(c.debitAmount) || 0, parseFloat(c.creditAmount) || 0, c.tdsSection || null, parseFloat(c.tdsAmount) || 0,
        parseFloat(c.runningBalance) || 0, c.bankRef || null
      ).run();

      return jsonResponse({ success: true, entryId });
    }

    // 17. ERP STORE: Record Kitchen Requisition Issue
    if (action === 'record_kitchen_requisition') {
      const r = payload;
      const reqId = r.requisitionId || `REQ-${Date.now()}`;
      await db.prepare(`
        INSERT INTO kitchen_requisitions (
          requisition_id, issue_date, target_outlet, item_name,
          quantity_issued, unit, approx_cost, issued_to, issued_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        reqId, r.issueDate || new Date().toISOString().slice(0, 10), r.targetOutlet || 'Fenugreek Restaurant',
        r.itemName, parseFloat(r.quantityIssued) || 1, r.unit || 'kg',
        parseFloat(r.approxCost) || 0, r.issuedTo || 'Head Chef', r.issuedBy || 'Store Incharge'
      ).run();

      return jsonResponse({ success: true, requisitionId: reqId });
    }

    // 18. RMS: Publish Dynamic Micro-Rates & Log to RMS Audit
    if (action === 'publish_dynamic_rates') {
      const rates = payload.rates;
      if (rates) {
        for (const tierId of Object.keys(rates)) {
          const item = rates[tierId];
          const tierName = item.tierName;
          const rate = item.recommendedRate;
          await db.prepare(`
            UPDATE rooms SET tariff = ? WHERE tier = ?
          `).bind(rate, tierName).run();
        }
      }

      const logId = `RMS-${Date.now()}`;
      await db.prepare(`
        INSERT INTO rms_audit_log (log_id, action_type, details, performed_by, created_at)
        VALUES (?, 'RATE_PUBLISH', ?, 'Revenue Director', datetime('now'))
      `).bind(logId, JSON.stringify(rates || {})).run();

      return jsonResponse({ success: true, logId });
    }

    // 18. RMS: Record Corporate Group Displacement RFP Evaluation
    if (action === 'save_group_rfp') {
      const rfp = payload;
      const rfpId = rfp.rfpId || `RFP-${Date.now()}`;
      await db.prepare(`
        INSERT INTO rms_displacement_rfps (
          rfp_id, corporate_name, rooms_requested, stay_nights, offered_rate,
          calculated_mar, net_gain_loss, verdict, ancillary_spend, evaluated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        rfpId, rfp.companyName, rfp.rooms, rfp.nights, rfp.offeredRate,
        rfp.mar, rfp.netGain, rfp.verdict, rfp.ancillarySpend || 0
      ).run();

      return jsonResponse({ success: true, rfpId });
    }

    // 19. RMS: Update Automation Mode
    if (action === 'update_rms_mode') {
      const mode = payload.mode || 'exception';
      await db.prepare(`
        UPDATE rms_rate_guardrails SET automation_mode = ?, updated_at = datetime('now')
      `).bind(mode).run();

      return jsonResponse({ success: true, mode });
    }

    // (apply_corporate_account moved to public actions section)

    // 21. POS RESTAURANT: Anti-Theft KOT Item Void Audit Log
    if (action === 'log_kot_void') {
      const v = payload;
      const voidId = v.voidId || `VOID-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT INTO restaurant_kot_voids (
          void_id, kot_id, room_or_table, item_code, item_name,
          quantity, item_amount, reason, custom_note, voided_by, authorized_by, voided_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        voidId, v.kotId || 'KOT-POS', v.roomOrTable || 'Table', v.itemCode || '0',
        v.itemName, v.quantity || 1, v.amount || 0, v.reason || 'Guest Changed Mind',
        v.notes || '', v.captain || 'Captain', v.authorizedBy || 'F&B Manager'
      ).run();

      return jsonResponse({ success: true, voidId });
    }

    // 22. FRONT DESK / HOUSEKEEPING: Create Maintenance Work Order
    if (action === 'save_work_order') {
      const wo = payload;
      const ticketId = wo.id || `WO-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT INTO maintenance_work_orders (
          ticket_id, room_number, issue, category, priority,
          technician, target_eta, status, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', ?, datetime('now'))
      `).bind(
        ticketId, wo.roomNumber, wo.issue, wo.category || 'General Maintenance',
        wo.priority || 'Normal', wo.technician || 'Engineering Lead',
        wo.targetEta || 'Within 2 Hours', wo.notes || 'Front Desk Maintenance Ticket'
      ).run();

      // If urgent or specified, flag room as Maintenance (OOO)
      if (wo.roomNumber && wo.status !== 'Resolved') {
        await db.prepare(`
          UPDATE rooms SET status = 'Maintenance', current_guest_name = ? WHERE room_number = ?
        `).bind(`OOO: ${wo.issue}`, wo.roomNumber).run().catch(() => {});
      }

      return jsonResponse({ success: true, ticketId });
    }

    // 23. FRONT DESK: Resolve Maintenance Work Order
    if (action === 'resolve_work_order') {
      const { ticketId, roomNumber } = payload;
      await db.prepare(`
        UPDATE maintenance_work_orders 
        SET status = 'Resolved', resolved_at = datetime('now')
        WHERE ticket_id = ?
      `).bind(ticketId).run();

      if (roomNumber) {
        await db.prepare(`
          UPDATE rooms 
          SET status = 'Available', current_guest_name = NULL, last_cleaned_at = datetime('now')
          WHERE room_number = ? AND status = 'Maintenance'
        `).bind(roomNumber).run().catch(() => {});
      }

      return jsonResponse({ success: true, ticketId });
    }

    // 24. HOUSEKEEPING: Save Checkout Inspection Log
    if (action === 'save_checkout_inspection') {
      const insp = payload;
      const inspectionId = insp.inspectionId || `INSP-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT INTO checkout_inspections (
          inspection_id, booking_id, room_number, inspector_name,
          key_returned, minibar_consumed, linen_damage, room_damage,
          notes, cleared_for_cleaning, inspected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        inspectionId, insp.bookingId || '', insp.roomNumber, insp.inspectorName || 'Housekeeping Lead',
        insp.keyReturned ? 1 : 1, insp.minibarConsumed || 0, insp.linenDamage || 0,
        insp.roomDamage || 0, insp.notes || '', insp.clearedForCleaning ? 1 : 1
      ).run().catch(() => {});

      return jsonResponse({ success: true, inspectionId });
    }

    // 25. RESTAURANT: Update Table Status on Cannon Kitchen Floor
    if (action === 'update_table_status') {
      const { tableNumber, status, currentKotId, captainName } = payload;
      await db.prepare(`
        UPDATE restaurant_tables 
        SET status = ?, current_kot_id = ?, captain_name = ?, last_updated_at = datetime('now')
        WHERE table_number = ?
      `).bind(status || 'Vacant', currentKotId || null, captainName || null, tableNumber).run().catch(() => {});

      return jsonResponse({ success: true, tableNumber, status });
    }

    // 26. FRONT DESK: Generate Digital Keycard Web Pass
    if (action === 'save_digital_keycard') {
      const k = payload;
      const cardId = k.cardId || `NFC-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT INTO digital_keycards (
          card_id, booking_id, room_number, guest_name, access_pin,
          valid_from, valid_until, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
      `).bind(
        cardId, k.bookingId || '', k.roomNumber, k.guestName, k.accessPin || '7650',
        k.validFrom || new Date().toISOString(), k.validUntil || new Date(Date.now() + 86400000).toISOString()
      ).run().catch(() => {});

      return jsonResponse({ success: true, cardId });
    }

    // 27. RESTAURANT: Update Food Order Status (Preparing, Out for Delivery, Delivered)
    if (action === 'update_order_status') {
      const { orderId, status } = payload;
      await db.prepare(`
        UPDATE food_orders 
        SET status = ? 
        WHERE order_id = ?
      `).bind(status, orderId).run().catch(() => {});

      return jsonResponse({ success: true, orderId, status });
    }

    // 28. HOUSEKEEPING: Update Room Service Request Status
    if (action === 'update_room_service_status') {
      const { requestId, status } = payload;
      const isResolved = status === 'Completed' || status === 'Resolved';
      await db.prepare(`
        UPDATE room_service_requests 
        SET status = ?, resolved_at = ?
        WHERE request_id = ?
      `).bind(status, isResolved ? new Date().toISOString() : null, requestId).run().catch(() => {});

      return jsonResponse({ success: true, requestId, status });
    }

    // 29. STAFF: Record Attendance Entry
    if (action === 'record_staff_attendance') {
      const { staffId, date, status, shift } = payload;
      const recId = `ATT-${staffId}-${date || new Date().toISOString().slice(0, 10)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO attendance (record_id, staff_id, date, status, shift, check_in_time)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(recId, staffId, date || new Date().toISOString().slice(0, 10), status || 'Present', shift || 'Morning').run().catch(e => console.warn("Attendance insert error:", e));

      return jsonResponse({ success: true, staffId, date, status });
    }

    // 30. DISASTER RECOVERY: Restore Database Backup
    if (action === 'restore_database_backup') {
      const data = payload;
      let restoredCount = 0;

      if (Array.isArray(data.rooms) && data.rooms.length > 0) {
        for (const r of data.rooms) {
          await db.prepare(`
            UPDATE rooms 
            SET status = ?, current_guest_name = ?, current_booking_id = ?
            WHERE room_number = ?
          `).bind(r.status || 'Available', r.currentGuestName || null, r.currentBookingId || null, r.roomNumber || r.room_number).run().catch(() => {});
          restoredCount++;
        }
      }

      return jsonResponse({ success: true, message: `Database state restored (${restoredCount} rooms synchronized)` });
    }

    // 31. FRONT DESK: Inter-Room Shift
    if (action === 'shift_room') {
      const { fromRoom, toRoom, guestName, reason } = payload;
      if (!fromRoom || !toRoom) {
        return jsonResponse({ error: "Both fromRoom and toRoom are required" }, 400);
      }

      // Find active booking for fromRoom
      const activeBooking = await db.prepare(`
        SELECT booking_id, guest_name FROM bookings 
        WHERE room_number = ? AND booking_status = 'Checked In'
        ORDER BY created_at DESC LIMIT 1
      `).bind(fromRoom).first();

      const bookingId = activeBooking?.booking_id || null;
      const finalGuestName = guestName || activeBooking?.guest_name || 'In-House Guest';

      // 1. Release source room to Vacant Dirty for housekeeping
      await db.prepare(`
        UPDATE rooms 
        SET status = 'Cleaning', current_guest_name = NULL, current_booking_id = NULL
        WHERE room_number = ?
      `).bind(fromRoom).run().catch(() => {});

      // 2. Assign destination room as Occupied
      await db.prepare(`
        UPDATE rooms 
        SET status = 'Occupied', current_guest_name = ?, current_booking_id = ?
        WHERE room_number = ?
      `).bind(finalGuestName, bookingId, toRoom).run().catch(() => {});

      // 3. Update booking if found
      if (bookingId) {
        await db.prepare(`
          UPDATE bookings 
          SET room_number = ?, special_requests = COALESCE(special_requests, '') || ' [Shifted from Room ' || ? || ' (' || ? || ')]'
          WHERE booking_id = ?
        `).bind(toRoom, fromRoom, reason || 'Guest Request', bookingId).run().catch(() => {});

        // 4. Update folio transactions to point to new room
        await db.prepare(`
          UPDATE folio_transactions 
          SET room_number = ?, folio_id = 'FOLIO-' || ?
          WHERE booking_id = ?
        `).bind(toRoom, toRoom, bookingId).run().catch(() => {});
      }

      return jsonResponse({ success: true, fromRoom, toRoom, guestName: finalGuestName, reason });
    }

    // 32. FRONT DESK: Edit Stay Details & Extend Nights
    if (action === 'edit_stay' || action === 'update_stay_details') {
      const { roomNumber, guestName, guestPhone, extendNights, extendedNights, addExtraBed, extraBedAdded, notes } = payload;
      if (!roomNumber) {
        return jsonResponse({ error: "roomNumber is required" }, 400);
      }

      const numNights = Number(extendNights !== undefined ? extendNights : extendedNights) || 0;
      const isExtraBed = Boolean(addExtraBed !== undefined ? addExtraBed : extraBedAdded);

      if (guestName) {
        await db.prepare(`
          UPDATE rooms SET current_guest_name = ? WHERE room_number = ?
        `).bind(guestName, roomNumber).run().catch(() => {});
      }

      const activeBooking = await db.prepare(`
        SELECT booking_id, tariff_per_night, total_amount, balance_due, check_out_date FROM bookings 
        WHERE room_number = ? AND booking_status = 'Checked In'
        ORDER BY created_at DESC LIMIT 1
      `).bind(roomNumber).first();

      if (activeBooking) {
        let addTariff = 0;
        let newCheckoutDate = activeBooking.check_out_date;
        if (numNights > 0) {
          addTariff = Math.round(activeBooking.tariff_per_night * numNights * 1.12);
          const currDate = new Date(activeBooking.check_out_date);
          currDate.setDate(currDate.getDate() + numNights);
          newCheckoutDate = currDate.toISOString().split('T')[0];
        }

        const extraBedCharge = isExtraBed ? 560 : 0;
        const totalAdded = addTariff + extraBedCharge;

        await db.prepare(`
          UPDATE bookings 
          SET guest_name = COALESCE(?, guest_name),
              guest_phone = COALESCE(?, guest_phone),
              check_out_date = ?,
              total_amount = total_amount + ?,
              balance_due = balance_due + ?,
              special_requests = COALESCE(special_requests, '') || ' ' || ?
          WHERE booking_id = ?
        `).bind(guestName || null, guestPhone || null, newCheckoutDate, totalAdded, totalAdded, notes || '', activeBooking.booking_id).run().catch(() => {});

        await db.prepare(`
          UPDATE rooms SET outstanding_balance = outstanding_balance + ? WHERE room_number = ?
        `).bind(totalAdded, roomNumber).run().catch(() => {});

        // Post extra bed transaction if requested
        if (isExtraBed) {
          const bedTxId = `TXN-BED-${roomNumber}-${Date.now().toString().slice(-4)}`;
          await db.prepare(`
            INSERT INTO folio_transactions (
              transaction_id, folio_id, booking_id, room_number, transaction_type,
              outlet, item_code, description, debit_amount, credit_amount,
              taxable_base, gst_rate, cgst, sgst, sac_code, is_locked, created_by
            ) VALUES (
              ?, ?, ?, ?, 'Extra Bed',
              'Front Desk', 'EXTRA-BED', 'Rollaway Extra Bed & Terry Towel Set', 560, 0,
              500, 12, 30, 30, '996311', 0, 'Front Desk Reception'
            )
          `).bind(bedTxId, `FOLIO-${roomNumber}`, activeBooking.booking_id, roomNumber).run().catch(() => {});
        }
      }

      return jsonResponse({ success: true, roomNumber, guestName, extendNights, addExtraBed });
    }

    // 33. RESTAURANT POS: Shift / Transfer Dining Table
    if (action === 'shift_table') {
      const { fromTable, toTable, reason, captain } = payload;
      if (!fromTable || !toTable) {
        return jsonResponse({ error: "Both fromTable and toTable are required" }, 400);
      }

      // Update any active food orders from fromTable to toTable
      await db.prepare(`
        UPDATE food_orders 
        SET room_number = ?, captain_name = COALESCE(?, captain_name)
        WHERE room_number = ? AND status IN ('Received', 'Preparing')
      `).bind(`Table ${toTable}`, captain || null, `Table ${fromTable}`).run().catch(() => {});

      return jsonResponse({ success: true, fromTable, toTable, reason, captain });
    }

    // 34. RESTAURANT POS: Merge Dining Tables
    if (action === 'merge_tables') {
      const { sourceTable, targetTable, captain } = payload;
      await db.prepare(`
        UPDATE food_orders 
        SET room_number = ?
        WHERE room_number = ? AND status IN ('Received', 'Preparing')
      `).bind(`Table ${targetTable}`, `Table ${sourceTable}`).run().catch(() => {});

      return jsonResponse({ success: true, sourceTable, targetTable, captain });
    }

    // 35. CORPORATE ACCOUNTS: Update Contract Terms
    if (action === 'update_corporate_contract') {
      const { corporateId, creditLimit, creditDays, contractDiscount, billingMode, contactPerson, contactPhone } = payload;
      if (!corporateId) {
        return jsonResponse({ error: "corporateId is required" }, 400);
      }

      await db.prepare(`
        UPDATE corporate_partners 
        SET credit_limit = COALESCE(?, credit_limit),
            credit_days = COALESCE(?, credit_days),
            contracted_discount_percent = COALESCE(?, contracted_discount_percent),
            contact_person = COALESCE(?, contact_person),
            contact_phone = COALESCE(?, contact_phone)
        WHERE corporate_id = ?
      `).bind(
        creditLimit !== undefined ? Number(creditLimit) : null,
        creditDays !== undefined ? Number(creditDays) : null,
        contractDiscount !== undefined ? Number(contractDiscount) : null,
        contactPerson || null,
        contactPhone || null,
        corporateId
      ).run().catch(() => {});

      return jsonResponse({ success: true, corporateId, creditLimit, creditDays, contractDiscount });
    }

    // 36. CENTRAL ACCOUNTS: Post Journal Entry Voucher
    if (action === 'add_journal_entry') {
      const { date, category, description, debitAmount, creditAmount, paymentMode, voucherNo, createdBy } = payload;
      const expenseId = voucherNo || `JV-${Date.now().toString().slice(-6)}`;

      await db.prepare(`
        INSERT INTO expenses (expense_id, category, amount, vendor_name, paid_by, payment_mode, date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        expenseId,
        category || 'General Store & Maintenance',
        Number(debitAmount || creditAmount || 0),
        'Rayagada Local Vendor',
        createdBy || 'Accounts Department',
        paymentMode || 'Cash',
        date || new Date().toISOString().split('T')[0],
        description || 'General Journal Entry'
      ).run().catch(() => {});

      return jsonResponse({ success: true, voucherNo: expenseId, amount: debitAmount || creditAmount });
    }

    // 37. FRONT OFFICE / ACCOUNTS: Amend GST Invoice (B2C <-> B2B, GSTIN, Company)
    if (action === 'amend_gst_invoice') {
      const { invoiceNo, bookingId, guestName, companyName, gstin, address1, address2, city, state, isB2B, amendedBy } = payload;
      if (!invoiceNo) {
        return jsonResponse({ error: "invoiceNo is required" }, 400);
      }

      // Update bookings if matching
      await db.prepare(`
        UPDATE bookings 
        SET company_name = COALESCE(?, company_name),
            corporate_gstin = ?,
            billing_address = ?,
            special_requests = COALESCE(special_requests, '') || ' [GST Amended: ' || ? || ' | GSTIN: ' || COALESCE(?, 'B2C') || ']'
        WHERE bill_no = ? OR booking_id = ?
      `).bind(companyName || null, gstin || null, address1 || null, isB2B ? 'B2B' : 'B2C', gstin || 'None', invoiceNo, bookingId || invoiceNo).run().catch(() => {});

      // Record in corporate_b2b_invoices if valid B2B
      if (isB2B && gstin) {
        await db.prepare(`
          INSERT INTO corporate_b2b_invoices (invoice_number, corporate_name, corporate_gstin, invoice_date, total_amount, itc_status)
          VALUES (?, ?, ?, DATE('now'), ?, 'Eligible (GSTR-2B)')
          ON CONFLICT(invoice_number) DO UPDATE SET
            corporate_name = excluded.corporate_name,
            corporate_gstin = excluded.corporate_gstin
        `).bind(invoiceNo, companyName || 'Corporate Client', gstin, Number(payload.totalAmount || 0)).run().catch(() => {});
      }

      return jsonResponse({ success: true, invoiceNo, isB2B, gstin, companyName, amendedBy: amendedBy || 'Accounts Department' });
    }

    // 38. THE WILD OASIS: Front-Desk In-Person Check-In Guest & Room Allocation
    if (action === 'check_in_guest') {
      const p = payload || {};
      const roomNumber = p.roomNumber;
      if (!roomNumber) {
        return jsonResponse({ error: "roomNumber is required" }, 400);
      }

      const bookingId = p.bookingId || `BOOK-${roomNumber}-${Date.now().toString().slice(-4)}`;
      const guestName = p.guestName || `Room ${roomNumber} Guest`;
      const guestPhone = p.guestPhone || p.phone || '+919999999999';
      const guestEmail = p.guestEmail || p.email || '';
      const idProofType = p.idProofType || 'Aadhaar';
      const rawId = p.idProofNumber || p.idNumber || p.idProofMasked || 'XXXX-XXXX-9999';
      const maskedId = rawId.length > 4 ? `XXXX-XXXX-${rawId.slice(-4)}` : rawId;
      const nights = Number(p.nights || 1);
      const checkInDate = p.checkInDate || new Date().toISOString().slice(0, 10);
      let checkOutDate = p.checkOutDate;
      if (!checkOutDate) {
        const d = new Date(checkInDate);
        d.setDate(d.getDate() + nights);
        checkOutDate = d.toISOString().slice(0, 10);
      }

      const tariffPerNight = Number(p.tariffPerNight || p.tariff || (p.payment?.totalStayAmount ? Math.round(p.payment.totalStayAmount / nights / 1.12) : 1500));
      const totalAmount = Number(p.totalAmount || p.payment?.totalStayAmount || (tariffPerNight * nights * 1.12));
      const baseTotal = Number(p.baseTotal || p.baseAmount || Math.round(totalAmount / 1.12));
      const taxAmount = Number(p.taxAmount || (totalAmount - baseTotal));
      const cgst = Math.round(taxAmount / 2 * 100) / 100;
      const sgst = Math.round(taxAmount / 2 * 100) / 100;
      const advanceDeposit = Number(p.advanceDeposit !== undefined ? p.advanceDeposit : (p.payment?.advancePaid || 0));
      const balanceDue = Number(p.balanceDue !== undefined ? p.balanceDue : (totalAmount - advanceDeposit));
      const paymentMode = p.paymentMode || p.payment?.mode || 'Cash';
      const paymentStatus = balanceDue <= 0 ? 'Paid at Check-In' : (advanceDeposit > 0 ? 'Partially Paid' : 'Pending Payment');
      const isInterstate = (p.isInterstate || (p.stateOfOrigin && p.stateOfOrigin.toLowerCase() !== 'odisha')) ? 1 : 0;
      const stateOfOrigin = p.stateOfOrigin || 'Odisha';
      const purposeOfVisit = p.purposeOfVisit || 'Personal / Tourism';
      const specialRequests = p.specialRequests || p.notes || '';
      const billNo = p.billNo || `FMBIL2627-${roomNumber}-${Date.now().toString().slice(-4)}`;

      // 1. Insert or update booking in D1 matching exact table schema
      await db.prepare(`
        INSERT INTO bookings (
          booking_id, room_number, guest_name, guest_phone, guest_email,
          id_proof_type, id_proof_masked, state_of_origin, is_interstate,
          check_in_date, check_out_date, nights, adults, children,
          tariff_per_night, base_total, cgst, sgst, total_amount,
          advance_deposit, balance_due, payment_mode, payment_status,
          booking_status, is_b2b, corporate_id, corporate_gstin,
          company_name, bill_no,
          consent_dpdp, special_requests, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, 1, 0,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          'Checked In', 0, '', '',
          'Direct Guest', ?,
          1, ?, datetime('now'), datetime('now')
        )
        ON CONFLICT(booking_id) DO UPDATE SET
          room_number = excluded.room_number,
          guest_name = excluded.guest_name,
          guest_phone = excluded.guest_phone,
          check_in_date = excluded.check_in_date,
          check_out_date = excluded.check_out_date,
          nights = excluded.nights,
          tariff_per_night = excluded.tariff_per_night,
          base_total = excluded.base_total,
          cgst = excluded.cgst,
          sgst = excluded.sgst,
          total_amount = excluded.total_amount,
          advance_deposit = excluded.advance_deposit,
          balance_due = excluded.balance_due,
          payment_status = excluded.payment_status,
          booking_status = 'Checked In',
          updated_at = datetime('now')
      `).bind(
        bookingId, roomNumber, guestName, guestPhone, guestEmail,
        idProofType, maskedId, stateOfOrigin, isInterstate,
        checkInDate, checkOutDate, nights,
        tariffPerNight, baseTotal, cgst, sgst, totalAmount,
        advanceDeposit, balanceDue, paymentMode, paymentStatus,
        billNo, specialRequests
      ).run();

      // 2. Update room status to Occupied and set outstanding balance
      await db.prepare(`
        UPDATE rooms
        SET status = 'Occupied', current_guest_name = ?, current_booking_id = ?, outstanding_balance = ?
        WHERE room_number = ?
      `).bind(guestName, bookingId, balanceDue, roomNumber).run();

      // 3. Post Room Tariff to master folio
      const roomTxId = `TXN-ROOM-${roomNumber}-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT INTO folio_transactions (
          transaction_id, folio_id, booking_id, room_number, transaction_type,
          outlet, item_code, description, debit_amount, credit_amount,
          taxable_base, gst_rate, cgst, sgst, sac_code, is_locked, created_by, created_at
        ) VALUES (
          ?, ?, ?, ?, 'Room Charge',
          'Front Desk', 'ROOM-TARIFF', ?, ?, 0,
          ?, 12, ?, ?, '996311', 0, 'Front Desk Reception', datetime('now')
        )
      `).bind(
        roomTxId, `FOLIO-${roomNumber}`, bookingId, roomNumber,
        `Room Tariff - Room ${roomNumber} (${nights} Night${nights > 1 ? 's' : ''})`, totalAmount,
        baseTotal, cgst, sgst
      ).run().catch(() => {});

      // 4. If advance deposit paid, record credit transaction
      if (advanceDeposit > 0) {
        const advTxId = `TXN-ADV-${roomNumber}-${Date.now().toString().slice(-4)}`;
        await db.prepare(`
          INSERT INTO folio_transactions (
            transaction_id, folio_id, booking_id, room_number, transaction_type,
            outlet, item_code, description, debit_amount, credit_amount,
            taxable_base, gst_rate, cgst, sgst, sac_code, is_locked, created_by, created_at
          ) VALUES (
            ?, ?, ?, ?, 'Payment',
            'Front Desk', 'ADVANCE', ?, 0, ?,
            0, 0, 0, 0, '996311', 0, 'Front Desk Cashier', datetime('now')
          )
        `).bind(
          advTxId, `FOLIO-${roomNumber}`, bookingId, roomNumber,
          `Check-In Advance Deposit (${paymentMode})`, advanceDeposit
        ).run().catch(() => {});
      }

      // 5. Update guest profile in CRM
      if (guestPhone) {
        await db.prepare(`
          INSERT INTO guest_profiles (
            guest_id, phone, name, email, id_proof_type, id_proof_masked,
            state_of_origin, total_visits, lifetime_spend, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'))
          ON CONFLICT(phone) DO UPDATE SET
            name = excluded.name,
            email = CASE WHEN excluded.email != '' THEN excluded.email ELSE guest_profiles.email END,
            total_visits = total_visits + 1,
            lifetime_spend = lifetime_spend + excluded.lifetime_spend,
            updated_at = datetime('now')
        `).bind(
          `GUEST-${Date.now()}`, guestPhone, guestName, guestEmail,
          idProofType, maskedId, stateOfOrigin, totalAmount
        ).run().catch(() => {});
      }

      // 6. Police Register Entry (Sarai Act)
      await db.prepare(`
        INSERT OR REPLACE INTO police_guest_entries (
          entry_id, booking_id, guest_name, phone, id_type,
          id_number_masked, state_origin, arrival_time, departure_time,
          purpose_of_visit, dispatch_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, 'Pending', datetime('now'))
      `).bind(
        `POL-${Date.now().toString().slice(-6)}`, bookingId, guestName, guestPhone,
        idProofType, maskedId, stateOfOrigin, checkOutDate, purposeOfVisit
      ).run().catch(() => {});

      return jsonResponse({ success: true, bookingId, roomNumber, guestName, status: 'Occupied', balanceDue });
    }

    // 39. THE WILD OASIS: Central Operations & Policy Settings Sync
    if (action === 'update_operations_settings') {
      const settings = payload || {};
      const pairs = [
        ['breakfast_rate', String(settings.breakfastRate || 250)],
        ['extra_bed_rate', String(settings.extraBedRate || 400)],
        ['station_drop_rate', String(settings.stationDropRate || 350)],
        ['min_stay_nights', String(settings.minStayNights || 1)],
        ['min_stay_festival_nights', String(settings.minStayFestivalNights || 2)],
        ['check_in_time', String(settings.standardCheckInTime || '11:00 AM')],
        ['check_out_time', String(settings.standardCheckOutTime || '12:00 PM')]
      ];

      for (const [k, v] of pairs) {
        await db.prepare(`
          INSERT INTO hotel_config (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).bind(k, v).run().catch(() => {});
      }

      return jsonResponse({ success: true, updatedKeys: pairs.map(p => p[0]) });
    }

    // 40. CANNON KITCHEN POS: Record Dining Table Settlement & Tax Receipt
    if (action === 'record_table_settlement') {
      const p = payload || {};
      const settlementId = p.invoiceId || `SETTLE-${Date.now()}`;
      const subtotal = Number(p.subtotal || 0);
      const gst = Number(p.gst || 0);
      const totalAmount = Number(p.totalAmount || 0);
      const tableNumber = String(p.tableNumber || '1');
      const paymentMode = String(p.paymentMode || 'Cash');

      await db.prepare(`
        INSERT INTO restaurant_table_settlements (
          settlement_id, table_number, kot_id, guest_name,
          subtotal, cgst, sgst, total_amount, payment_mode,
          room_number, captain_name, settled_by, settled_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(settlement_id) DO UPDATE SET
          total_amount = excluded.total_amount,
          payment_mode = excluded.payment_mode
      `).bind(
        settlementId, tableNumber, p.invoiceId || null, `Table ${tableNumber} Guest`,
        subtotal, gst / 2, gst / 2, totalAmount, paymentMode,
        p.roomNumber || null, p.captain || 'Restaurant Captain', 'Restaurant Cashier'
      ).run().catch(() => {});

      // If Billed to Room, post to folio_transactions
      if (paymentMode.toLowerCase().includes('room') && p.roomNumber) {
        await db.prepare(`
          INSERT INTO folio_transactions (
            transaction_id, folio_id, room_number, transaction_type, outlet,
            description, debit_amount, taxable_base, gst_rate, cgst, sgst, sac_code, created_by
          ) VALUES (?, ?, ?, 'Food & Beverage', 'Cannon Kitchen', ?, ?, ?, 5, ?, ?, '996331', 'Restaurant POS Cashier')
        `).bind(
          `TXN-POS-${settlementId}`, `FOLIO-${p.roomNumber}`, p.roomNumber,
          `Cannon Kitchen Dining Table ${tableNumber} (Invoice #${settlementId})`,
          totalAmount, subtotal, gst / 2, gst / 2
        ).run().catch(() => {});

        await db.prepare(`
          UPDATE rooms SET outstanding_balance = outstanding_balance + ? WHERE room_number = ?
        `).bind(totalAmount, p.roomNumber).run().catch(() => {});
      }

      // Mark table available/cleaning
      await db.prepare(`
        UPDATE restaurant_tables SET status = 'available', current_kot = NULL WHERE table_number = ?
      `).bind(tableNumber).run().catch(() => {});

      return jsonResponse({ success: true, settlementId, tableNumber, totalAmount, paymentMode });
    }

    // (record_corporate_advance_quotation moved to public actions section)

    // 42. FRONT DESK / RECEPTION: Bill Direct Service / Transfer / Laundry to Room Folio
    if (action === 'bill_to_room') {
      const p = payload || {};
      const roomNumber = p.roomNumber;
      if (!roomNumber) {
        return jsonResponse({ error: "roomNumber is required" }, 400);
      }
      const amount = Number(p.amount || 0);
      const taxRate = Number(p.taxRate || 5);
      const baseAmount = amount / (1 + (taxRate / 100));
      const totalTax = amount - baseAmount;
      const sac = p.sac || '996412';
      const txnId = `TXN-BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await db.prepare(`
        INSERT INTO folio_transactions (
          transaction_id, folio_id, room_number, transaction_type, outlet,
          description, debit_amount, taxable_base, gst_rate, cgst, sgst, sac_code, created_by
        ) VALUES (?, ?, ?, 'Room Service', 'Front Desk', ?, ?, ?, ?, ?, ?, ?, 'Front Desk Cashier')
      `).bind(
        txnId, `FOLIO-${roomNumber}`, roomNumber,
        p.description || `Front Desk Charge (SAC ${sac})`,
        amount, baseAmount, taxRate, totalTax / 2, totalTax / 2, sac
      ).run().catch(() => {});

      await db.prepare(`
        UPDATE rooms SET outstanding_balance = outstanding_balance + ? WHERE room_number = ?
      `).bind(amount, roomNumber).run().catch(() => {});

      await db.prepare(`
        UPDATE bookings 
        SET balance_due = balance_due + ?, updated_at = datetime('now')
        WHERE room_number = ? AND booking_status NOT IN ('Cancelled', 'Checked Out')
      `).bind(amount, roomNumber).run().catch(() => {});

      return jsonResponse({ success: true, txnId, roomNumber, amount });
    }

    // 43. TALLY PRIME ERP: Save Balanced Voucher (F4-F9)
    if (action === 'save_tally_voucher') {
      const v = payload || {};
      const voucherNo = v.voucher_no || v.voucherNo || `HSI/VCH/${Date.now()}`;
      await db.prepare(`
        INSERT INTO tally_vouchers (
          voucher_no, voucher_type, type_code, voucher_date, ref_no, narration,
          total_debit, total_credit, is_balanced, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(voucher_no) DO UPDATE SET
          total_debit = excluded.total_debit,
          total_credit = excluded.total_credit,
          narration = excluded.narration
      `).bind(
        voucherNo, v.voucher_type || 'Journal', v.type_code || 'F7',
        v.voucher_date || new Date().toISOString().slice(0, 10),
        v.ref_no || null, v.narration || 'General Voucher Entry',
        Number(v.total_debit || 0), Number(v.total_credit || 0),
        v.is_balanced !== undefined ? (v.is_balanced ? 1 : 0) : 1,
        v.created_by || 'Accountant'
      ).run().catch(() => {});

      // Insert line items if present
      if (Array.isArray(v.lines)) {
        for (let idx = 0; idx < v.lines.length; idx++) {
          const l = v.lines[idx];
          const lineId = l.line_id || `${voucherNo}-L${idx + 1}`;
          await db.prepare(`
            INSERT INTO tally_voucher_lines (line_id, voucher_no, dr_cr, ledger_id, ledger_name, amount, line_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(line_id) DO UPDATE SET amount = excluded.amount
          `).bind(
            lineId, voucherNo, l.dr_cr || 'Dr', l.ledger_id || 'LED-001',
            l.ledger_name || 'Ledger', Number(l.amount || 0), idx + 1
          ).run().catch(() => {});
        }
      }

      return jsonResponse({ success: true, voucherNo });
    }

    // 44. TALLY PRIME ERP: Save / Update Ledger Account
    if (action === 'save_tally_ledger') {
      const l = payload || {};
      const ledgerId = l.ledger_id || l.ledgerId || `LED-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT INTO tally_ledgers (
          ledger_id, ledger_name, group_name, opening_balance, current_balance, balance_type, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(ledger_id) DO UPDATE SET
          ledger_name = excluded.ledger_name,
          group_name = excluded.group_name,
          current_balance = excluded.current_balance,
          balance_type = excluded.balance_type
      `).bind(
        ledgerId, l.ledger_name || l.ledgerName, l.group_name || l.groupName || 'Sundry Debtors',
        Number(l.opening_balance || 0), Number(l.current_balance || 0),
        l.balance_type || 'Dr', l.is_active !== undefined ? (l.is_active ? 1 : 0) : 1
      ).run().catch(() => {});

      return jsonResponse({ success: true, ledgerId });
    }

    // 45. GST COMPLIANCE: Record GSTR-1 Return Filing
    if (action === 'save_gstr1_filing') {
      const g = payload || {};
      const filingId = g.filing_id || `GSTR1-${g.return_period || Date.now()}`;
      await db.prepare(`
        INSERT INTO gstr1_filings (
          filing_id, return_period, gstin, financial_year, gross_turnover,
          b2b_invoices_count, b2b_taxable_value, b2b_total_tax,
          b2cs_taxable_value, b2cs_total_tax, hsn_items_count, docs_issued_count,
          json_payload, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(filing_id) DO UPDATE SET
          status = excluded.status,
          json_payload = excluded.json_payload
      `).bind(
        filingId, g.return_period || '092026', g.gstin || '21AEKPP8689J1ZS',
        g.financial_year || '2026-2027', Number(g.gross_turnover || 0),
        Number(g.b2b_invoices_count || 0), Number(g.b2b_taxable_value || 0), Number(g.b2b_total_tax || 0),
        Number(g.b2cs_taxable_value || 0), Number(g.b2cs_total_tax || 0),
        Number(g.hsn_items_count || 0), Number(g.docs_issued_count || 0),
        typeof g.json_payload === 'string' ? g.json_payload : JSON.stringify(g.json_payload || {}),
        g.status || 'Generated'
      ).run().catch(() => {});

      return jsonResponse({ success: true, filingId });
    }

    // 46. GSTR-2B ITC: Save Inward Supply & Reconciliation Record
    if (action === 'save_gstr2b_recon') {
      const r = payload || {};
      const recordId = r.record_id || `G2B-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.prepare(`
        INSERT INTO gstr2b_inward_supplies (
          record_id, return_period, supplier_gstin, supplier_name,
          invoice_number, invoice_date, invoice_value, taxable_value,
          cgst, sgst, igst, itc_eligibility, reconciliation_status,
          books_purchase_id, difference_amount, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(record_id) DO UPDATE SET
          reconciliation_status = excluded.reconciliation_status,
          books_purchase_id = excluded.books_purchase_id,
          difference_amount = excluded.difference_amount
      `).bind(
        recordId, r.return_period || '092026', r.supplier_gstin, r.supplier_name,
        r.invoice_number, r.invoice_date, Number(r.invoice_value || 0), Number(r.taxable_value || 0),
        Number(r.cgst || 0), Number(r.sgst || 0), Number(r.igst || 0),
        r.itc_eligibility || 'Y', r.reconciliation_status || 'MATCHED',
        r.books_purchase_id || null, Number(r.difference_amount || 0), r.remarks || null
      ).run().catch(() => {});

      return jsonResponse({ success: true, recordId });
    }

    // 47. GUEST LOGISTICS: Save / Update Station or Plant Cab Transfer
    if (action === 'save_guest_transfer') {
      const t = payload || {};
      const transferId = t.transfer_id || t.id || `TRF-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT INTO guest_transfers (
          transfer_id, guest_name, room_number, phone, transfer_type, train_number,
          scheduled_time, pickup_location, assigned_vehicle, driver_name, driver_phone,
          fare, is_corporate_courtesy, billing_status, dispatch_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(transfer_id) DO UPDATE SET
          billing_status = excluded.billing_status,
          dispatch_status = excluded.dispatch_status,
          driver_name = excluded.driver_name,
          assigned_vehicle = excluded.assigned_vehicle
      `).bind(
        transferId, t.guest_name || t.guestName, t.room_number || t.roomNumber,
        t.phone || '', t.transfer_type || t.transferType, t.train_number || t.trainNumber || null,
        t.scheduled_time || t.scheduledTime, t.pickup_location || t.pickupLocation,
        t.assigned_vehicle || t.assignedVehicle, t.driver_name || t.driverName,
        t.driver_phone || t.driverPhone, Number(t.fare || 0),
        t.is_corporate_courtesy ? 1 : 0, t.billing_status || t.billingStatus || 'Pending Settlement',
        t.dispatch_status || t.dispatchStatus || 'Scheduled'
      ).run().catch(() => {});

      return jsonResponse({ success: true, transferId });
    }

    // 48. STATUTORY RULE 48: Log Multi-Copy Tax Invoice Print Event
    if (action === 'log_invoice_print') {
      const p = payload || {};
      const logId = `PRINT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.prepare(`
        INSERT INTO invoice_print_audit_logs (
          log_id, invoice_no, booking_id, room_number, guest_or_company,
          rule48_copy, document_type, printed_by, printer_identifier, reprint_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        logId, p.invoiceNo, p.bookingId || null, p.roomNumber || null,
        p.guestOrCompany || 'Guest', p.rule48Copy || 'ORIGINAL FOR RECIPIENT',
        p.documentType || 'Tax Invoice (SAC 996311)', p.printedBy || 'Front Desk Cashier',
        p.printerIdentifier || 'Thermal/A4 Network Laser', p.reprintReason || null
      ).run().catch(() => {});

      return jsonResponse({ success: true, logId });
    }

    // 49. UNIVERSAL INLINE EDITOR: Persist Cell Override
    if (action === 'save_inline_override') {
      const o = payload || {};
      const overrideId = `${o.tableName || 'table'}_${o.rowKey || 'row'}_${o.columnKey || 'col'}`;
      await db.prepare(`
        INSERT INTO universal_inline_overrides (
          override_id, storage_prefix, table_name, row_key, column_key, original_value, overridden_value, edited_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(override_id) DO UPDATE SET
          overridden_value = excluded.overridden_value,
          updated_at = datetime('now')
      `).bind(
        overrideId, o.storagePrefix || 'hsi_accounts', o.tableName,
        String(o.rowKey), String(o.columnKey),
        String(o.originalValue || ''), String(o.overriddenValue || ''),
        o.editedBy || 'Accountant'
      ).run().catch(() => {});

      return jsonResponse({ success: true, overrideId });
    }

    // 50. CLOUDFLARE D1 ZERO-AUTH-CLIFF DATABASE MIGRATION ENGINE
    if (action === 'run_db_migration') {
      const isAdmin = await verifyAdminAuth(request, env, db);
      let authorized = isAdmin;
      if (!authorized && payload?.adminPin) {
        const pinRow = await db.prepare("SELECT value FROM hotel_config WHERE key = 'ownerPin'").first().catch(() => null);
        if (pinRow && pinRow.value && payload.adminPin === pinRow.value) {
          authorized = true;
        }
      }
      if (!authorized) {
        return jsonResponse({ error: "Unauthorized: Invalid administrative credentials or PIN" }, 401);
      }

      const sqlStatements = payload?.statements || [];
      const results = [];
      for (const rawSql of sqlStatements) {
        const sql = rawSql.trim();
        if (!sql) continue;
        try {
          await db.prepare(sql).run();
          results.push({ sql: sql.slice(0, 80), status: "SUCCESS" });
        } catch (err) {
          const msg = err.message || "";
          if (msg.includes("duplicate column") || msg.includes("already exists")) {
            results.push({ sql: sql.slice(0, 80), status: "ALREADY_EXISTS", note: msg });
          } else {
            results.push({ sql: sql.slice(0, 80), status: "ERROR", error: msg });
          }
        }
      }

      return jsonResponse({
        success: true,
        totalExecuted: results.length,
        results
      });
    }

    // 51. ACCOUNTS: Direct Expense Record
    if (action === 'record_expense' || action === 'add_expense') {
      const e = payload || {};
      const expenseId = e.expenseId || e.expense_id || `EXP-${Date.now()}`;
      await db.prepare(`
        INSERT INTO expenses (
          expense_id, category, amount, vendor_name, paid_by, payment_mode, date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        expenseId,
        e.category || 'General Store & Maintenance',
        Number(e.amount || 0),
        e.vendorName || e.vendor_name || 'Rayagada Local Vendor',
        e.paidBy || e.paid_by || 'Accounts Department',
        e.paymentMode || e.payment_mode || 'Cash',
        e.date || new Date().toISOString().split('T')[0],
        e.notes || e.description || ''
      ).run().catch(err => console.warn("Expense insert error:", err));

      return jsonResponse({ success: true, expenseId });
    }

    // 52. POLICE REGISTER: Add Individual Police Entry
    if (action === 'record_police_guest') {
      const p = payload || {};
      const entryId = p.entryId || `POL-${Date.now().toString().slice(-6)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO police_guest_entries (
          entry_id, booking_id, guest_name, phone, id_type,
          id_number_masked, state_origin, arrival_time, departure_time,
          purpose_of_visit, dispatch_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', datetime('now'))
      `).bind(
        entryId, p.bookingId || `WALK-${Date.now().toString().slice(-6)}`,
        p.guestName, p.phone || '', p.idType || 'Aadhaar',
        p.idNumberMasked || `XXXX-XXXX-${String(p.phone || '').slice(-4)}`,
        p.stateOrigin || 'Odisha', p.arrivalTime || new Date().toISOString(),
        p.departureTime || new Date(Date.now() + 86400000).toISOString(),
        p.purposeOfVisit || 'Business / Pilgrimage'
      ).run().catch(err => console.warn("Police entry insert error:", err));

      return jsonResponse({ success: true, entryId });
    }

    
    // 52. HOUSEKEEPING: Update Linen Inventory & Dhobi Dispatch
    if (action === 'update_linen_inventory') {
      const { itemId, actionType, quantity, inStore, atDhobi, damaged } = payload || {};
      if (itemId) {
        if (inStore !== undefined && atDhobi !== undefined) {
          await db.prepare(`
            UPDATE linen_inventory 
            SET in_store = ?, at_dhobi = ?, damaged = COALESCE(?, damaged), last_audited = datetime('now')
            WHERE id = ?
          `).bind(inStore, atDhobi, damaged || 0, itemId).run().catch(() => {});
        } else if (actionType === 'send_dhobi') {
          await db.prepare(`
            UPDATE linen_inventory 
            SET in_store = MAX(0, in_store - ?), at_dhobi = at_dhobi + ?, last_audited = datetime('now')
            WHERE id = ?
          `).bind(quantity || 0, quantity || 0, itemId).run().catch(() => {});
        } else if (actionType === 'receive_dhobi') {
          await db.prepare(`
            UPDATE linen_inventory 
            SET at_dhobi = MAX(0, at_dhobi - ?), in_store = in_store + ?, last_audited = datetime('now')
            WHERE id = ?
          `).bind(quantity || 0, quantity || 0, itemId).run().catch(() => {});
        }
      }
      return jsonResponse({ success: true, itemId });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);

  } catch (error) {
    console.error("Sync POST Error:", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
