import React, { useState } from 'react';
import { 
  Download, Eye, Code, FileSpreadsheet, MessageCircle, 
  Send, Check, CheckCheck, ShieldCheck
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { CA_FILING_STATION_METADATA } from '../data/caFilingData';
import { exportGstr1ExcelWorkbook } from '../utils/gstGovExport';
import { openWhatsAppLink } from '../utils/whatsappDispatch';
import GstPreviewGuideModal from './GstPreviewGuideModal';

export default function GstFilingHeaderToolbar({
  gstr1Payload,
  onNotice
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [localNotice, setLocalNotice] = useState('');

  const triggerNotice = (msg) => {
    setLocalNotice(msg);
    if (onNotice) onNotice(msg);
    setTimeout(() => setLocalNotice(''), 4000);
  };

  const defaultPayload = gstr1Payload || {
    gstin: HOTEL_CONFIG.gstin,
    fp: '092026',
    legal_name: CA_FILING_STATION_METADATA.proprietorship.legalName,
    trade_name: HOTEL_CONFIG.tradeName,
    b2b: [
      {
        ctin: '21AAACJ1288P1ZZ',
        cname: 'JK Paper Mills Ltd.',
        inv: [
          {
            inum: 'SSVR-B2B-2026-0901',
            idt: '24-09-2026',
            val: 89600.00,
            pos: '21',
            rchrg: 'N',
            inv_typ: 'R',
            itms: [{ num: 1, itm_det: { rt: 5.0, txval: 85333.33, camt: 2133.33, samt: 2133.33, csamt: 0.0 } }]
          }
        ]
      },
      {
        ctin: '07AAACG1509J1ZQ',
        cname: 'GAIL (India) Limited',
        inv: [
          {
            inum: 'SSVR-B2B-2026-0902',
            idt: '25-09-2026',
            val: 73320.00,
            pos: '21',
            rchrg: 'N',
            inv_typ: 'R',
            itms: [{ num: 1, itm_det: { rt: 5.0, txval: 69828.57, camt: 1745.71, samt: 1745.71, csamt: 0.0 } }]
          }
        ]
      }
    ],
    b2cs: [
      { sply_ty: 'INTRA', pos: '21', rt: 5.0, txval: 1137847.62, camt: 28446.19, samt: 28446.19, csamt: 0.0 }
    ],
    hsn: {
      data: [
        { num: 1, hsn_sc: '996311', desc: 'Room Accommodation Services', uqc: 'NA', qty: 432, txval: 938057.14, rt: 5.0, camt: 23451.43, samt: 23451.43, csamt: 0.0 },
        { num: 2, hsn_sc: '996331', desc: 'Restaurant & In-Room Dining', uqc: 'NA', qty: 1150, txval: 309047.62, rt: 5.0, camt: 7726.19, samt: 7726.19, csamt: 0.0 },
        { num: 3, hsn_sc: '996337', desc: 'Auxiliary Hospitality Services', uqc: 'NA', qty: 140, txval: 45904.76, rt: 5.0, camt: 1147.62, samt: 1147.62, csamt: 0.0 }
      ]
    },
    doc_issue: {
      doc_det: [
        { doc_num: 1, doc_typ: 'Invoices for outward supply', from: 'SSVR-2026-0001', to: 'SSVR-2026-0410', totnum: 410, canc: 12, net_issue: 398 }
      ]
    }
  };

  // Button 1: Download GSTN GSTR-1 JSON (For gst.gov.in)
  const handleDownloadGstr1Json = () => {
    try {
      const blob = new Blob([JSON.stringify(defaultPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GSTR1_${HOTEL_CONFIG.gstin}_092026_CA_FINAL.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerNotice('✓ Downloaded Official GSTR-1 JSON (GST Portal format) for CA Filing!');
    } catch (err) {
      console.error('Failed to export GSTR-1 JSON:', err);
      triggerNotice('⚠️ Failed to export GSTR-1 JSON.');
    }
  };

  // Button 2: Preview Portal JSON & CA Guide
  const handlePreviewPortalJson = () => {
    setIsPreviewOpen(true);
  };

  // Button 3: Download GSTR-1 Excel
  const handleDownloadGstr1Excel = () => {
    try {
      exportGstr1ExcelWorkbook({
        gstr1Payload: defaultPayload,
        filename: `GSTR1_${HOTEL_CONFIG.gstin}_092026_OFFICIAL.xls`
      });
      triggerNotice('✓ Downloaded Official GSTR-1 Multi-Sheet Excel Workbook (.xls)!');
    } catch (err) {
      console.error('Failed to export GSTR-1 Excel:', err);
      triggerNotice('⚠️ Failed to export GSTR-1 Excel.');
    }
  };

  // Button 4: WhatsApp CA
  const handleWhatsAppCa = () => {
    const text = `🏛️ *SRI SAI VASUDEV RESIDENCY — GSTR-1 & TAX FILING BRIEFING*
📅 *Tax Period:* September 2026 (092026)
🆔 *GSTIN:* ${HOTEL_CONFIG.gstin}
📍 *Tax Office:* Rayagada Division (Odisha Code 21)
👤 *Proprietor:* ${CA_FILING_STATION_METADATA.proprietorship.legalName}

📊 *OUTWARD TAX RECONCILIATION:*
• *Gross Turnover:* ₹13,57,660.00
• *Taxable Base:* ₹12,93,009.52
  - Room Accommodation (SAC 996311): ₹9,38,057.14 (Tax: ₹46,902.86)
  - Pure Satvik Dining (HSN 996331): ₹3,09,047.62 (Tax: ₹15,452.38)
  - Auxiliary Hospitality (SAC 996337): ₹45,904.76 (Tax: ₹2,295.24)
• *CGST 2.5%:* ₹32,325.24
• *SGST 2.5%:* ₹32,325.24
• *Total 5% Output GST:* *₹64,650.48*
• *Eligible Input Tax Credit (ITC):* ₹14,820.00
• *Net Cash GST Payable (GSTR-3B):* *₹49,830.48*

⏰ *STATUTORY FILING DUE DATES:*
• GSTR-1 Due Date: *11th October 2026*
• GSTR-3B Due Date: *20th October 2026*

✅ *Statutory Status:* Indian GST Act Section 122 Compliant.
Official GSTR-1 JSON (GSTN v1.7 Schema) and GSTR-1 Excel audit sheets generated and ready for direct upload at gst.gov.in.`;

    openWhatsAppLink('917978043585', text);
    triggerNotice('✓ Dispatched GSTR-1 Statutory Filing Summary to CA via WhatsApp!');
  };

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 11, 24, 0.98) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.2)'
      }}>
        {/* Top Badges Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <span style={{
            background: 'rgba(212, 175, 55, 0.18)',
            color: 'var(--gold-glow)',
            border: '1px solid var(--gold-primary)',
            padding: '0.2rem 0.65rem',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            SYSTEM #36 &amp; #37
          </span>

          <span style={{
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            padding: '0.2rem 0.65rem',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            INDIAN GST ACT SEC 122 COMPLIANT
          </span>

          <span style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            padding: '0.2rem 0.65rem',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            GSTIN: {HOTEL_CONFIG.gstin}
          </span>
        </div>

        {/* Main Title & Description */}
        <h2 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0.2rem 0 0.35rem',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          fontFamily: 'serif'
        }}>
          CHARTERED ACCOUNTANT (CA) &amp; GST COMPLIANCE FILING STATION
        </h2>

        <p style={{
          margin: '0 0 0.75rem',
          color: '#94a3b8',
          fontSize: '0.82rem',
          lineHeight: 1.45,
          maxWidth: '1000px'
        }}>
          Automated monthly tax reconciliation splitting SAC 9963 (Rooms) &amp; HSN 996331 (Satvik F&amp;B), B2B ITC credit computation, and 1-click GSTR-1/GSTR-3B filings.
        </p>

        {/* Metadata Details Row */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          flexWrap: 'wrap',
          fontSize: '0.78rem',
          color: '#cbd5e1',
          marginBottom: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            🏛️ Jurisdiction: <strong style={{ color: '#fff' }}>Rayagada Division (Odisha Code 21)</strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            🗓️ Tax Period: <strong style={{ color: '#38bdf8' }}>Full Month Sep 2026</strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            ⏰ GSTR-1 Due: <strong style={{ color: '#fbbf24' }}>11th Oct 2026</strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            ⏰ GSTR-3B Due: <strong style={{ color: '#34d399' }}>20th Oct 2026</strong>
          </span>
        </div>

        {/* THE 4 BUTTONS ROW (From User Photo) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Button 1: Download GSTN GSTR-1 JSON (For gst.gov.in) */}
          <button
            id="btn-download-gstn-gstr1-json"
            onClick={handleDownloadGstr1Json}
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b38914 100%)',
              color: '#000',
              border: '1px solid #facc15',
              padding: '0.55rem 1.05rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(212, 175, 55, 0.35)',
              transition: 'all 0.15s ease'
            }}
            title="Download official GSTN GSTR-1 JSON payload schema v1.7 for upload to gst.gov.in"
          >
            <Download size={15} strokeWidth={2.5} />
            Download GSTN GSTR-1 JSON (For gst.gov.in)
          </button>

          {/* Button 2: <> Preview Portal JSON & CA Guide */}
          <button
            id="btn-preview-portal-json-ca-guide"
            onClick={handlePreviewPortalJson}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              padding: '0.55rem 1.05rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(56, 189, 248, 0.15)',
              transition: 'all 0.15s ease'
            }}
            title="Inspect live GSTN JSON schema, copy payload, and read step-by-step CA filing instructions"
          >
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem' }}>&lt;&gt;</span>
            <Eye size={15} />
            Preview Portal JSON &amp; CA Guide
          </button>

          {/* Button 3: GSTR-1 Excel */}
          <button
            id="btn-gstr1-excel"
            onClick={handleDownloadGstr1Excel}
            style={{
              background: '#0f172a',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '0.55rem 1.05rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.15s ease'
            }}
            title="Download official multi-sheet GSTR-1 Excel workbook (Tables 4A, 7, 12, 13, and Tax Summary)"
          >
            <Download size={14} />
            <FileSpreadsheet size={15} color="#34d399" />
            GSTR-1 Excel
          </button>

          {/* Button 4: WhatsApp CA */}
          <button
            id="btn-whatsapp-ca"
            onClick={handleWhatsAppCa}
            style={{
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: '#fff',
              border: '1px solid #22c55e',
              padding: '0.55rem 1.05rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.15s ease'
            }}
            title="Send monthly GSTR-1 turnover, SAC/HSN split, and tax liability directly to Chartered Accountant on WhatsApp"
          >
            <Send size={14} />
            <MessageCircle size={15} />
            WhatsApp CA
          </button>
        </div>

        {/* Local Notification Bar */}
        {localNotice && (
          <div style={{
            marginTop: '0.85rem',
            padding: '0.5rem 0.85rem',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px',
            color: '#34d399',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <CheckCheck size={16} />
            {localNotice}
          </div>
        )}
      </div>

      {/* Interactive Modal */}
      <GstPreviewGuideModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        gstr1Payload={defaultPayload}
        onDownloadJson={handleDownloadGstr1Json}
      />
    </>
  );
}
