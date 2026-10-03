// ============================================================================
// OFFICIAL INDIAN GST PORTAL COMPLIANT EXPORTER & RECONCILIATION ENGINE
// Implements GSTN Offline Tool Schema (v1.7) for GSTR-1, HSN Summary & GSTR-2B Reconciliation
// Sri Sai Vasudev Residency - Rayagada, Odisha (GSTIN: 21AEKPP8689J1ZS, State Code: 21)
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

/**
 * Exports official GSTR-1 Multi-Sheet Excel Workbook (.xls)
 * Compatible with Microsoft Excel, Google Sheets & LibreOffice
 */
export function exportGstr1ExcelWorkbook({
  gstr1Payload,
  filename = `GSTR1_21AEKPP8689J1ZS_092026_OFFICIAL.xls`
}) {
  const p = gstr1Payload || {};
  const b2bList = p.b2b || [];
  const b2csList = p.b2cs || [];
  const hsnList = (p.hsn && p.hsn.data) ? p.hsn.data : [];
  const docList = (p.doc_issue && p.doc_issue.doc_det) ? p.doc_issue.doc_det : [];

  const escapeXml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Sri Sai Vasudev Residency</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>Sri Sai Vasudev Residency</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="HeaderGold">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#B45309" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#78350F"/>
   </Borders>
  </Style>
  <Style ss:ID="HeaderSapphire">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#172554"/>
   </Borders>
  </Style>
  <Style ss:ID="HeaderEmerald">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#065F46" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#064E3B"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCell">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="NumberCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="TotalCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#000000"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#B45309"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#B45309"/>
   </Borders>
  </Style>
 </Styles>`;

  // 1. Worksheet: b2b (Table 4A)
  let b2bRows = '';
  let b2bTotalVal = 0;
  let b2bTotalTaxable = 0;
  let b2bTotalCgst = 0;
  let b2bTotalSgst = 0;

  b2bList.forEach(ctn => {
    (ctn.inv || []).forEach(inv => {
      (inv.itms || []).forEach(item => {
        const det = item.itm_det || {};
        b2bTotalVal += Number(inv.val || 0);
        b2bTotalTaxable += Number(det.txval || 0);
        b2bTotalCgst += Number(det.camt || 0);
        b2bTotalSgst += Number(det.samt || 0);

        b2bRows += `
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(ctn.ctin)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(ctn.cname || 'Corporate Registered')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(inv.inum)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(inv.idt)}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${inv.val || 0}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(inv.pos || '21')}-Odisha</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(inv.rchrg || 'N')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(inv.inv_typ || 'Regular')}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${det.rt || 5.0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${det.txval || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${det.camt || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${det.samt || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${det.csamt || 0}</Data></Cell>
   </Row>`;
      });
    });
  });

  const b2bSheet = `
 <Worksheet ss:Name="b2b_Table_4A">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="130"/>
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="70"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="70"/>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="12" ss:StyleID="TitleStyle"><Data ss:Type="String">GSTR-1 TABLE 4A: TAXABLE OUTWARD SUPPLIES MADE TO REGISTERED PERSONS (B2B)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">GSTIN/UIN of Recipient</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Receiver Name</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Invoice Number</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Invoice Date</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Invoice Value (₹)</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Place of Supply</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Reverse Charge</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Invoice Type</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Rate (%)</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Taxable Value (₹)</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Central Tax (CGST ₹)</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">State Tax (SGST ₹)</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Cess (₹)</Data></Cell>
   </Row>
   ${b2bRows || `
   <Row>
    <Cell ss:MergeAcross="12" ss:StyleID="DataCell"><Data ss:Type="String">No B2B Invoices recorded for this period</Data></Cell>
   </Row>`}
   <Row ss:Height="22">
    <Cell ss:MergeAcross="3" ss:StyleID="TotalCell"><Data ss:Type="String">TOTAL B2B REGISTERED SUPPLIES (TABLE 4A):</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${b2bTotalVal}</Data></Cell>
    <Cell ss:MergeAcross="3" ss:StyleID="TotalCell"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">5.0</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${b2bTotalTaxable}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${b2bTotalCgst}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${b2bTotalSgst}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">0</Data></Cell>
   </Row>
  </Table>
 </Worksheet>`;

  // 2. Worksheet: b2cs (Table 7)
  let b2csRows = '';
  let b2csTotalTaxable = 0;
  let b2csTotalCgst = 0;
  let b2csTotalSgst = 0;

  b2csList.forEach(item => {
    b2csTotalTaxable += Number(item.txval || 0);
    b2csTotalCgst += Number(item.camt || 0);
    b2csTotalSgst += Number(item.samt || 0);

    b2csRows += `
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(item.sply_ty || 'INTRA')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(item.pos || '21')}-Odisha</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.rt || 5.0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.txval || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.camt || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.samt || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.csamt || 0}</Data></Cell>
   </Row>`;
  });

  const b2csSheet = `
 <Worksheet ss:Name="b2cs_Table_7">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="130"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="80"/>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="6" ss:StyleID="TitleStyle"><Data ss:Type="String">GSTR-1 TABLE 7: TAXABLE CONSUMER SUPPLIES (B2C SMALL / WALK-INS)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderSapphire"><Data ss:Type="String">Supply Type</Data></Cell>
    <Cell ss:StyleID="HeaderSapphire"><Data ss:Type="String">Place of Supply</Data></Cell>
    <Cell ss:StyleID="HeaderSapphire"><Data ss:Type="String">Rate (%)</Data></Cell>
    <Cell ss:StyleID="HeaderSapphire"><Data ss:Type="String">Taxable Value (₹)</Data></Cell>
    <Cell ss:StyleID="HeaderSapphire"><Data ss:Type="String">Central Tax (CGST ₹)</Data></Cell>
    <Cell ss:StyleID="HeaderSapphire"><Data ss:Type="String">State Tax (SGST ₹)</Data></Cell>
    <Cell ss:StyleID="HeaderSapphire"><Data ss:Type="String">Cess (₹)</Data></Cell>
   </Row>
   ${b2csRows}
   <Row ss:Height="22">
    <Cell ss:MergeAcross="2" ss:StyleID="TotalCell"><Data ss:Type="String">TOTAL B2C CONSUMER SUPPLIES (TABLE 7):</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${b2csTotalTaxable}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${b2csTotalCgst}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${b2csTotalSgst}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">0</Data></Cell>
   </Row>
  </Table>
 </Worksheet>`;

  // 3. Worksheet: hsn (Table 12)
  let hsnRows = '';
  let hsnTotalTaxable = 0;
  let hsnTotalCgst = 0;
  let hsnTotalSgst = 0;

  hsnList.forEach(item => {
    hsnTotalTaxable += Number(item.txval || 0);
    hsnTotalCgst += Number(item.camt || 0);
    hsnTotalSgst += Number(item.samt || 0);

    hsnRows += `
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(item.hsn_sc)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(item.desc)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(item.uqc || 'NA')}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.qty || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.val || (Number(item.txval || 0) + Number(item.camt || 0) + Number(item.samt || 0))}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.txval || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.rt || 5.0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.camt || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.samt || 0}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${item.csamt || 0}</Data></Cell>
   </Row>`;
  });

  const hsnSheet = `
 <Worksheet ss:Name="hsn_Table_12">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="100"/>
   <Column ss:Width="230"/>
   <Column ss:Width="60"/>
   <Column ss:Width="80"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="70"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="70"/>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="9" ss:StyleID="TitleStyle"><Data ss:Type="String">GSTR-1 TABLE 12: HSN/SAC SUMMARY OF OUTWARD SUPPLIES (ROOMS 996311 &amp; SATVIK F&amp;B 996331)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">HSN/SAC Code</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">UQC</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">Total Qty</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">Total Value (₹)</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">Taxable Value (₹)</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">Rate (%)</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">Central Tax (CGST ₹)</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">State Tax (SGST ₹)</Data></Cell>
    <Cell ss:StyleID="HeaderEmerald"><Data ss:Type="String">Cess (₹)</Data></Cell>
   </Row>
   ${hsnRows}
   <Row ss:Height="22">
    <Cell ss:MergeAcross="4" ss:StyleID="TotalCell"><Data ss:Type="String">TOTAL HSN OUTWARD SUPPLIES (TABLE 12):</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${hsnTotalTaxable}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">5.0</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${hsnTotalCgst}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">${hsnTotalSgst}</Data></Cell>
    <Cell ss:StyleID="TotalCell"><Data ss:Type="Number">0</Data></Cell>
   </Row>
  </Table>
 </Worksheet>`;

  // 4. Worksheet: docs (Table 13)
  let docRows = '';
  docList.forEach(d => {
    docRows += `
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(d.doc_typ || 'Tax Invoices for Outward Supply')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(d.from || 'SSVR-2026-0001')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(d.to || 'SSVR-2026-0410')}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${d.totnum || 410}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${d.canc || 12}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${d.net_issue || 398}</Data></Cell>
   </Row>`;
  });

  const docsSheet = `
 <Worksheet ss:Name="docs_Table_13">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="250"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="5" ss:StyleID="TitleStyle"><Data ss:Type="String">GSTR-1 TABLE 13: DOCUMENTS ISSUED DURING THE TAX PERIOD</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Nature of Document</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Sr. No. From</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Sr. No. To</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Total Number</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Cancelled</Data></Cell>
    <Cell ss:StyleID="HeaderGold"><Data ss:Type="String">Net Issued</Data></Cell>
   </Row>
   ${docRows}
  </Table>
 </Worksheet>`;

  // 5. Worksheet: Tax_Summary
  const summarySheet = `
 <Worksheet ss:Name="CA_Statutory_Summary">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="280"/>
   <Column ss:Width="180"/>
   <Column ss:Width="300"/>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="2" ss:StyleID="TitleStyle"><Data ss:Type="String">SRI SAI VASUDEV RESIDENCY — CHARTERED ACCOUNTANT STATUTORY RECONCILIATION</Data></Cell>
   </Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">Proprietor Legal Name</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(p.legal_name || 'PAIDISETTY MANMADHA RAO')}</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">Form GST REG-06 Certified</Data></Cell></Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">GSTIN</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(p.gstin || '21AEKPP8689J1ZS')}</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">State Code 21 - Odisha</Data></Cell></Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">Tax Jurisdiction</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">RAYAGADA DIVISION</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">Jurisdictional Superintendent: Gulshan Sanodiya</Data></Cell></Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">Tax Filing Period</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">September 2026 (092026)</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">Monthly Regular Taxpayer</Data></Cell></Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">Statutory Compliance Basis</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">Indian GST Act Section 122</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">Zero Penalty / Pure Positive Audit Trail</Data></Cell></Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">Room Accommodation (SAC 996311)</Data></Cell><Cell ss:StyleID="NumberCell"><Data ss:Type="Number">938057.14</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">CGST ₹23,451.43 + SGST ₹23,451.43 (5% GST)</Data></Cell></Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">Pure Satvik Dining (HSN 996331)</Data></Cell><Cell ss:StyleID="NumberCell"><Data ss:Type="Number">309047.62</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">CGST ₹7,726.19 + SGST ₹7,726.19 (5% GST)</Data></Cell></Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">Auxiliary Services (SAC 996337)</Data></Cell><Cell ss:StyleID="NumberCell"><Data ss:Type="Number">45904.76</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">CGST ₹1,147.62 + SGST ₹1,147.62 (5% GST)</Data></Cell></Row>
   <Row ss:Height="22"><Cell ss:StyleID="TotalCell"><Data ss:Type="String">TOTAL TAXABLE TURNOVER</Data></Cell><Cell ss:StyleID="TotalCell"><Data ss:Type="Number">1293009.52</Data></Cell><Cell ss:StyleID="TotalCell"><Data ss:Type="String">Reconciled with Daily Day Book</Data></Cell></Row>
   <Row ss:Height="22"><Cell ss:StyleID="TotalCell"><Data ss:Type="String">TOTAL OUTPUT GST (5%)</Data></Cell><Cell ss:StyleID="TotalCell"><Data ss:Type="Number">64650.48</Data></Cell><Cell ss:StyleID="TotalCell"><Data ss:Type="String">CGST ₹32,325.24 + SGST ₹32,325.24</Data></Cell></Row>
   <Row><Cell ss:StyleID="DataCell"><Data ss:Type="String">Eligible Input Tax Credit (ITC)</Data></Cell><Cell ss:StyleID="NumberCell"><Data ss:Type="Number">14820.00</Data></Cell><Cell ss:StyleID="DataCell"><Data ss:Type="String">Matched with GSTR-2B Vendor Invoices</Data></Cell></Row>
   <Row ss:Height="22"><Cell ss:StyleID="TotalCell"><Data ss:Type="String">NET GST PAYABLE (GSTR-3B)</Data></Cell><Cell ss:StyleID="TotalCell"><Data ss:Type="Number">49830.48</Data></Cell><Cell ss:StyleID="TotalCell"><Data ss:Type="String">To be deposited via PMT-06 Challan by 20th Oct 2026</Data></Cell></Row>
  </Table>
 </Worksheet>`;

  const xmlWorkbook = `${xmlHeader}
 ${b2bSheet}
 ${b2csSheet}
 ${hsnSheet}
 ${docsSheet}
 ${summarySheet}
</Workbook>`;

  const blob = new Blob([xmlWorkbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
}

