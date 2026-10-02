// ============================================================================
// OFFICIAL INDIAN GST PORTAL COMPLIANT EXPORTER & RECONCILIATION ENGINE
// Implements GSTN Offline Tool Schema (v1.7) for GSTR-1, HSN Summary & GSTR-2B Reconciliation
// Hotel Sai International - Rayagada, Odisha (GSTIN: 21AABCH9821K1Z2, State Code: 21)
// ============================================================================

export const INDIAN_STATE_CODES = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory"
};

export const SAC_CODES = {
  ROOM_ACCOMMODATION: "996311",
  RESTAURANT_DINING: "996331",
  BANQUET_CATERING: "996332",
  LAUNDRY_DRY_CLEANING: "999799",
  PARKING_SERVICES: "996791"
};

/**
 * Validates a 15-character Indian GSTIN format and checksum (Luhn Mod-36)
 */
export function validateGstin(gstin) {
  if (!gstin || typeof gstin !== 'string') return { isValid: false, reason: 'Empty GSTIN' };
  const clean = gstin.trim().toUpperCase();
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(clean)) {
    return { isValid: false, reason: 'Invalid 15-character format pattern' };
  }

  const stateCode = clean.substring(0, 2);
  const stateName = INDIAN_STATE_CODES[stateCode];
  if (!stateName) {
    return { isValid: false, reason: `Unknown state code ${stateCode}` };
  }

  // Checksum calculation (Mod-36)
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let factor = 2;
  let sum = 0;
  const checkChar = clean.charAt(14);
  const body = clean.substring(0, 14);

  for (let i = body.length - 1; i >= 0; i--) {
    const codePoint = chars.indexOf(body.charAt(i));
    let addend = factor * codePoint;
    factor = (factor === 2) ? 1 : 2;
    addend = Math.floor(addend / 36) + (addend % 36);
    sum += addend;
  }

  const remainder = sum % 36;
  const checkCodePoint = (36 - remainder) % 36;
  const expectedChar = chars.charAt(checkCodePoint);

  return {
    isValid: expectedChar === checkChar,
    cleanGstin: clean,
    stateCode,
    stateName,
    pan: clean.substring(2, 12),
    entityNumber: clean.charAt(12),
    reason: expectedChar === checkChar ? 'Valid GSTIN' : `Checksum mismatch (expected ${expectedChar})`
  };
}

/**
 * Generates standard GSTR-1 JSON Schema (v1.7) for upload to gst.gov.in
 */
export function generateOfficialGstr1Json({
  hotelGstin = "21AEKPP8689J1ZS",
  hotelStateCode = "21",
  fp = "092026", // MMYYYY
  curGt = 0,
  bookings = [],
  restaurantBills = [],
  banquetBills = []
}) {
  const b2bMap = {};
  let b2csTaxableMap = {}; // Keyed by pos_rate, e.g. "21_5.0"
  let b2clList = [];
  const hsnMap = {};
  let grossTurnover = 0;

  // Helper to accumulate HSN
  const addHsn = (sac, desc, uqc, qty, taxable, cgst, sgst, igst = 0) => {
    if (!hsnMap[sac]) {
      hsnMap[sac] = {
        hsn_sc: sac,
        desc: desc,
        uqc: uqc,
        qty: 0,
        val: 0,
        txval: 0,
        camt: 0,
        samt: 0,
        csamt: 0,
        iamt: 0
      };
    }
    const val = taxable + cgst + sgst + igst;
    hsnMap[sac].qty += qty;
    hsnMap[sac].val = Math.round((hsnMap[sac].val + val) * 100) / 100;
    hsnMap[sac].txval = Math.round((hsnMap[sac].txval + taxable) * 100) / 100;
    hsnMap[sac].camt = Math.round((hsnMap[sac].camt + cgst) * 100) / 100;
    hsnMap[sac].samt = Math.round((hsnMap[sac].samt + sgst) * 100) / 100;
    hsnMap[sac].iamt = Math.round((hsnMap[sac].iamt + igst) * 100) / 100;
  };

  // 1. Process Bookings (Room stays)
  bookings.forEach((b, idx) => {
    const tariff = Number(b.tariffPerNight || b.tariff || b.totalAmount || 0);
    const nights = Number(b.nights || 1);
    const taxable = tariff;
    const isInterState = b.corporateGstin && !b.corporateGstin.startsWith(hotelStateCode);
    const pos = b.corporateGstin ? b.corporateGstin.substring(0, 2) : hotelStateCode;

    // Rate: Room is 5.0% for <= 7500, or 0% non-gst if flag set
    const rate = b.isNonGstBill ? 0 : 5.0;
    const cgst = rate > 0 && !isInterState ? Math.round(taxable * 0.025 * 100) / 100 : 0;
    const sgst = rate > 0 && !isInterState ? Math.round(taxable * 0.025 * 100) / 100 : 0;
    const igst = rate > 0 && isInterState ? Math.round(taxable * 0.05 * 100) / 100 : 0;
    const invoiceTotal = taxable + cgst + sgst + igst;
    grossTurnover += invoiceTotal;

    const inum = b.billNo || `HSI-${fp}-${String(idx + 1).padStart(4, '0')}`;
    const idt = (b.checkInDate || '2026-09-15').split(' ')[0].split('-').reverse().join('-');

    if (b.corporateGstin && b.corporateGstin.length >= 15) {
      // B2B Record
      const ctin = b.corporateGstin.trim().toUpperCase();
      if (!b2bMap[ctin]) {
        b2bMap[ctin] = { ctin, inv: [] };
      }
      b2bMap[ctin].inv.push({
        inum,
        idt,
        val: Math.round(invoiceTotal * 100) / 100,
        pos,
        rchrg: "N",
        inv_typ: "R",
        itms: [{
          num: 1,
          itm_det: {
            rt: rate,
            txval: Math.round(taxable * 100) / 100,
            camt: cgst,
            samt: sgst,
            iamt: igst,
            csamt: 0
          }
        }]
      });
    } else {
      // B2C
      if (isInterState && invoiceTotal > 250000) {
        // Table 5A: B2C Large
        b2clList.push({
          pos,
          inv: [{
            inum,
            idt,
            val: Math.round(invoiceTotal * 100) / 100,
            itms: [{
              num: 1,
              itm_det: {
                rt: rate,
                txval: Math.round(taxable * 100) / 100,
                iamt: igst,
                csamt: 0
              }
            }]
          }]
        });
      } else {
        // Table 7: B2C Small (Aggregated)
        const key = `${pos}_${rate}`;
        if (!b2csTaxableMap[key]) {
          b2csTaxableMap[key] = {
            sply_ty: isInterState ? "INTER" : "INTRA",
            pos,
            typ: "OE",
            rt: rate,
            txval: 0,
            camt: 0,
            samt: 0,
            iamt: 0,
            csamt: 0
          };
        }
        b2csTaxableMap[key].txval = Math.round((b2csTaxableMap[key].txval + taxable) * 100) / 100;
        b2csTaxableMap[key].camt = Math.round((b2csTaxableMap[key].camt + cgst) * 100) / 100;
        b2csTaxableMap[key].samt = Math.round((b2csTaxableMap[key].samt + sgst) * 100) / 100;
        b2csTaxableMap[key].iamt = Math.round((b2csTaxableMap[key].iamt + igst) * 100) / 100;
      }
    }

    addHsn(SAC_CODES.ROOM_ACCOMMODATION, "Hotel Accommodation & Lodging Services", "OTH", nights, taxable, cgst, sgst, igst);
  });

  // 2. Process Restaurant Bills (SAC 996331)
  restaurantBills.forEach((r, idx) => {
    const taxable = Number(r.subtotal || r.amount || 0);
    const rate = 5.0; // Restaurant GST is strictly 5% (2.5% + 2.5%) with no ITC
    const cgst = Math.round(taxable * 0.025 * 100) / 100;
    const sgst = Math.round(taxable * 0.025 * 100) / 100;
    const invoiceTotal = taxable + cgst + sgst;
    grossTurnover += invoiceTotal;

    const inum = r.billNo || `POS-${fp}-${String(idx + 1).padStart(4, '0')}`;
    const idt = (r.date || '2026-09-15').split(' ')[0].split('-').reverse().join('-');

    if (r.gstin && r.gstin.length >= 15) {
      const ctin = r.gstin.trim().toUpperCase();
      if (!b2bMap[ctin]) {
        b2bMap[ctin] = { ctin, inv: [] };
      }
      b2bMap[ctin].inv.push({
        inum,
        idt,
        val: Math.round(invoiceTotal * 100) / 100,
        pos: hotelStateCode,
        rchrg: "N",
        inv_typ: "R",
        itms: [{
          num: 1,
          itm_det: {
            rt: rate,
            txval: Math.round(taxable * 100) / 100,
            camt: cgst,
            samt: sgst,
            iamt: 0,
            csamt: 0
          }
        }]
      });
    } else {
      const key = `${hotelStateCode}_${rate}`;
      if (!b2csTaxableMap[key]) {
        b2csTaxableMap[key] = {
          sply_ty: "INTRA",
          pos: hotelStateCode,
          typ: "OE",
          rt: rate,
          txval: 0,
          camt: 0,
          samt: 0,
          iamt: 0,
          csamt: 0
        };
      }
      b2csTaxableMap[key].txval = Math.round((b2csTaxableMap[key].txval + taxable) * 100) / 100;
      b2csTaxableMap[key].camt = Math.round((b2csTaxableMap[key].camt + cgst) * 100) / 100;
      b2csTaxableMap[key].samt = Math.round((b2csTaxableMap[key].samt + sgst) * 100) / 100;
    }

    addHsn(SAC_CODES.RESTAURANT_DINING, "Restaurant Dining & Room Service F&B", "OTH", 1, taxable, cgst, sgst, 0);
  });

  // Table 13: Document Issue Register
  const totalIssued = bookings.length + restaurantBills.length + banquetBills.length;
  const docIssue = [{
    doc_num: 1,
    doc_typ: "Invoices for outward supply",
    docs: [{
      num: 1,
      from: `HSI-${fp}-0001`,
      to: `HSI-${fp}-${String(totalIssued || 1).padStart(4, '0')}`,
      totnum: totalIssued || 1,
      canc: 0,
      net_issue: totalIssued || 1
    }]
  }];

  // Construct official GSTN schema object
  const gstr1Payload = {
    gstin: hotelGstin,
    fp: fp,
    gt: Math.round(grossTurnover * 100) / 100,
    cur_gt: curGt ? Math.round(curGt * 100) / 100 : Math.round(grossTurnover * 100) / 100,
    b2b: Object.values(b2bMap),
    b2cl: b2clList,
    b2cs: Object.values(b2csTaxableMap),
    hsn: {
      data: Object.values(hsnMap).map((h, i) => ({ num: i + 1, ...h }))
    },
    doc_issue: {
      doc_det: docIssue
    }
  };

  return gstr1Payload;
}

/**
 * Compares an imported GSTR-2B JSON file from gst.gov.in against internal hotel purchase records
 */
export function reconcileGstr2bWithPurchases(gstr2bJson, hotelPurchases = []) {
  if (!gstr2bJson || !gstr2bJson.b2b) {
    return { success: false, error: 'Invalid GSTR-2B JSON structure: missing b2b section' };
  }

  const results = {
    totalIn2b: 0,
    totalInBooks: hotelPurchases.length,
    matchedCount: 0,
    taxMismatchCount: 0,
    missingInBooksCount: 0,
    missingIn2bCount: 0,
    matchedTotal: 0,
    discrepancyTotal: 0,
    items: []
  };

  const booksByNum = {};
  hotelPurchases.forEach(p => {
    const key = `${(p.vendorGstin || '').trim().toUpperCase()}_${(p.billNo || '').trim().toUpperCase()}`;
    booksByNum[key] = p;
  });

  const matchedKeys = new Set();

  // Iterate over GSTR-2B B2B records
  gstr2bJson.b2b.forEach(supplier => {
    const ctin = (supplier.ctin || '').trim().toUpperCase();
    const tradeName = supplier.trdnm || supplier.lgl_nm || 'Supplier';

    (supplier.inv || []).forEach(inv => {
      results.totalIn2b++;
      const inum = (inv.inum || '').trim().toUpperCase();
      const val2b = Number(inv.val || 0);
      const tax2b = (inv.itms || []).reduce((acc, itm) => {
        const d = itm.itm_det || {};
        return acc + Number(d.camt || 0) + Number(d.samt || 0) + Number(d.iamt || 0);
      }, 0);

      const key = `${ctin}_${inum}`;
      const bookItem = booksByNum[key];

      if (bookItem) {
        matchedKeys.add(key);
        const valBook = Number(bookItem.totalAmount || bookItem.amount || 0);
        const taxBook = Number(bookItem.taxAmount || (bookItem.cgst || 0) + (bookItem.sgst || 0) + (bookItem.igst || 0) || 0);
        const valDiff = Math.abs(val2b - valBook);
        const taxDiff = Math.abs(tax2b - taxBook);

        if (valDiff < 1.0 && taxDiff < 1.0) {
          results.matchedCount++;
          results.matchedTotal += val2b;
          results.items.push({
            status: 'MATCHED',
            badgeColor: '#10b981',
            supplierGstin: ctin,
            supplierName: tradeName,
            invoiceNo: inum,
            date: inv.idt,
            amount2b: val2b,
            amountBooks: valBook,
            itc2b: tax2b,
            itcBooks: taxBook,
            variance: 0,
            remarks: 'Perfect match with internal purchase ledger'
          });
        } else {
          results.taxMismatchCount++;
          results.discrepancyTotal += valDiff;
          results.items.push({
            status: 'MISMATCH',
            badgeColor: '#f59e0b',
            supplierGstin: ctin,
            supplierName: tradeName,
            invoiceNo: inum,
            date: inv.idt,
            amount2b: val2b,
            amountBooks: valBook,
            itc2b: tax2b,
            itcBooks: taxBook,
            variance: val2b - valBook,
            remarks: `Variance of ₹${valDiff.toFixed(2)} between portal and books`
          });
        }
      } else {
        results.missingInBooksCount++;
        results.discrepancyTotal += val2b;
        results.items.push({
          status: 'MISSING_IN_BOOKS',
          badgeColor: '#38bdf8',
          supplierGstin: ctin,
          supplierName: tradeName,
          invoiceNo: inum,
          date: inv.idt,
          amount2b: val2b,
          amountBooks: 0,
          itc2b: tax2b,
          itcBooks: 0,
          variance: val2b,
          remarks: 'Present in GST Portal 2B but not booked in hotel ledger (Unclaimed ITC!)'
        });
      }
    });
  });

  // Check books items missing from 2B
  hotelPurchases.forEach(p => {
    const key = `${(p.vendorGstin || '').trim().toUpperCase()}_${(p.billNo || '').trim().toUpperCase()}`;
    if (!matchedKeys.has(key)) {
      results.missingIn2bCount++;
      const val = Number(p.totalAmount || p.amount || 0);
      results.items.push({
        status: 'MISSING_IN_2B',
        badgeColor: '#ef4444',
        supplierGstin: p.vendorGstin || 'Unregistered',
        supplierName: p.vendorName || 'Local Vendor',
        invoiceNo: p.billNo || 'N/A',
        date: p.date,
        amount2b: 0,
        amountBooks: val,
        itc2b: 0,
        itcBooks: Number(p.taxAmount || 0),
        variance: -val,
        remarks: 'Booked in hotel expenses, but supplier has NOT filed in GSTR-1 (Cannot claim ITC!)'
      });
    }
  });

  return { success: true, results };
}
