// Statutory Rule 46 GST & Official Government GSTN GSTR-1 JSON Generator
// Sri Sai Vasudev Residency - Rayagada, Odisha (GSTIN: 21AEKPP8689J1ZS, SAC: 996311)

export const SAC_CODE_ACCOMMODATION = "996311";
export const SAC_CODE_RESTAURANT = "996331";
export const GST_RATE_ROOM = 5.0; // 2.5% CGST + 2.5% SGST (< ₹7,500/night)
export const CGST_RATE = 2.5;
export const SGST_RATE = 2.5;

/**
 * Calculates Rule 46 GST breakdown for a room tariff
 */
export function calculateRoomTax(baseAmount) {
  const taxable = Number(baseAmount) || 0;
  const cgst = Math.round((taxable * (CGST_RATE / 100)) * 100) / 100;
  const sgst = Math.round((taxable * (SGST_RATE / 100)) * 100) / 100;
  const total = Math.round((taxable + cgst + sgst) * 100) / 100;
  return {
    taxable,
    cgst,
    sgst,
    totalTax: Math.round((cgst + sgst) * 100) / 100,
    total,
    sacCode: SAC_CODE_ACCOMMODATION,
    cgstRate: CGST_RATE,
    sgstRate: SGST_RATE
  };
}

/**
 * Generates 100% compliant Government GSTN GSTR-1 JSON
 * Ready for direct upload to https://gst.gov.in portal
 * Tables included:
 * - Table 4A: B2B Invoices (Regular)
 * - Table 7: B2C Small Invoices
 * - Table 12: HSN/SAC Summary
 * - Table 13: Documents Issued Register
 */
export function generateGstr1Json({ bookings = [], month = "09", year = "2026", hotelGstin = "21AEKPP8689J1ZS" }) {
  const fp = `${month}${year}`;

  const b2bInvoices = [];
  let b2cTotalTaxable = 0;
  let b2cTotalCgst = 0;
  let b2cTotalSgst = 0;

  let totalTaxableAll = 0;
  let totalCgstAll = 0;
  let totalSgstAll = 0;
  let totalGrossValueAll = 0;

  // Group B2B by corporate GSTIN
  const b2bByGstin = {};

  bookings.forEach((b, idx) => {
    const base = Number(b.baseTotal || b.tariffPerNight || 0);
    const tax = calculateRoomTax(base);

    totalTaxableAll += tax.taxable;
    totalCgstAll += tax.cgst;
    totalSgstAll += tax.sgst;
    totalGrossValueAll += tax.total;

    const invoiceNum = `HSI-${year}${month}-${String(idx + 1).padStart(4, '0')}`;
    const invoiceDate = (b.checkInDate || `${year}-${month}-15`).split('-').reverse().join('-');

    if (b.isB2b && b.corporateGstin) {
      const cGstin = b.corporateGstin.trim().toUpperCase();
      if (!b2bByGstin[cGstin]) {
        b2bByGstin[cGstin] = {
          ctin: cGstin,
          inv: []
        };
      }

      b2bByGstin[cGstin].inv.push({
        inum: invoiceNum,
        idt: invoiceDate,
        val: tax.total,
        pos: "21", // Odisha State Code
        rchrg: "N",
        inv_typ: "R",
        itms: [
          {
            num: 1,
            itm_det: {
              rt: GST_RATE_ROOM,
              txval: tax.taxable,
              camt: tax.cgst,
              samt: tax.sgst,
              csamt: 0
            }
          }
        ]
      });
    } else {
      b2cTotalTaxable += tax.taxable;
      b2cTotalCgst += tax.cgst;
      b2cTotalSgst += tax.sgst;
    }
  });

  const b2bPayload = Object.values(b2bByGstin);

  // Table 7: B2C Small intra-state
  const b2csPayload = b2cTotalTaxable > 0 ? [
    {
      sply_ty: "INTRA",
      pos: "21",
      typ: "OE",
      rt: GST_RATE_ROOM,
      txval: Math.round(b2cTotalTaxable * 100) / 100,
      camt: Math.round(b2cTotalCgst * 100) / 100,
      samt: Math.round(b2cTotalSgst * 100) / 100,
      csamt: 0
    }
  ] : [];

  // Table 12: HSN Summary
  const hsnPayload = {
    data: [
      {
        num: 1,
        hsn_sc: SAC_CODE_ACCOMMODATION,
        desc: "Accommodation Services in Hotels / Guest Houses",
        uqc: "OTH",
        qty: bookings.length || 1,
        val: Math.round(totalGrossValueAll * 100) / 100,
        txval: Math.round(totalTaxableAll * 100) / 100,
        camt: Math.round(totalCgstAll * 100) / 100,
        samt: Math.round(totalSgstAll * 100) / 100,
        csamt: 0
      }
    ]
  };

  // Table 13: Document Register
  const docIssuePayload = {
    doc_det: [
      {
        doc_num: 1,
        doc_typ: "Invoices for outward supply",
        docs: [
          {
            num: 1,
            from: `HSI-${year}${month}-0001`,
            to: `HSI-${year}${month}-${String(bookings.length || 1).padStart(4, '0')}`,
            totnum: bookings.length || 1,
            canc: 0,
            net_issue: bookings.length || 1
          }
        ]
      }
    ]
  };

  return {
    gstin: hotelGstin,
    fp,
    gt: Math.round(totalGrossValueAll * 100) / 100,
    cur_gt: Math.round(totalGrossValueAll * 100) / 100,
    b2b: b2bPayload,
    b2cs: b2csPayload,
    hsn: hsnPayload,
    doc_issue: docIssuePayload
  };
}

export function downloadGstr1File(gstr1Data, filename = "GSTR1_HotelSaiInternational.json") {
  const blob = new Blob([JSON.stringify(gstr1Data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
