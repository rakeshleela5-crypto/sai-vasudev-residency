import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, QrCode, Utensils, Key, Wifi, Building2, Printer, 
  Download, Copy, Check, Sparkles, Smartphone, ShieldCheck
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function RoomQrModal({
  isOpen,
  onClose,
  initialRoomNumber = '101',
  rooms = []
}) {
  const [selectedRoom, setSelectedRoom] = useState(initialRoomNumber || '101');
  const [qrType, setQrType] = useState('dining'); // 'dining', 'keycard', 'standee', 'wifi'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [guestName, setGuestName] = useState('Valued Guest');
  const [guestPin, setGuestPin] = useState('7651');
  const printRef = useRef(null);

  // Keep selectedRoom updated if initialRoomNumber changes
  useEffect(() => {
    if (initialRoomNumber) {
      setSelectedRoom(initialRoomNumber);
    }
  }, [initialRoomNumber]);

  // Current room info
  const roomInfo = rooms.find(r => r.roomNumber === selectedRoom) || {
    roomNumber: selectedRoom,
    tier: 'Executive Deluxe',
    status: 'Available',
    floor: selectedRoom ? selectedRoom[0] : '1'
  };

  // Generate target QR string based on active mode
  const getQrString = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hotel-sai-international.pages.dev';
    
    switch (qrType) {
      case 'dining':
        return `${origin}/?room=${selectedRoom}&source=room_qr`;
      case 'keycard':
        return `${origin}/?action=keycard&room=${selectedRoom}&pin=${guestPin}&t=${Date.now()}`;
      case 'standee':
        return `upi://pay?pa=${HOTEL_CONFIG.upiId || 'hotelsai@sbi'}&pn=Hotel%20Sai%20International&cu=INR&tn=Lobby%20Reception%20Desk`;
      case 'wifi':
        return `WIFI:S:Hotel_Sai_Guest;T:WPA;P:SaiRayagada765;H:false;;`;
      default:
        return `${origin}/?room=${selectedRoom}&source=room_qr`;
    }
  };

  // Generate QR Code image data
  useEffect(() => {
    if (!isOpen) return;

    const qrText = getQrString();
    QRCode.toDataURL(qrText, {
      width: 400,
      margin: 2,
      color: {
        dark: qrType === 'standee' ? '#0f172a' : '#0a192f',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [isOpen, selectedRoom, qrType, guestPin]);

  const handleCopyLink = () => {
    const link = getQrString();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${HOTEL_CONFIG.name.replace(/\s+/g, '_')}_Room_${selectedRoom}_${qrType.toUpperCase()}_QR.png`;
    a.click();
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${HOTEL_CONFIG.name} - Room ${selectedRoom} QR Standee</title>
          <style>
            @page { size: A5 portrait; margin: 12mm; }
            *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              color: #0f172a; 
              background: #fff; 
              margin: 0; 
              padding: 0; 
              text-align: center; 
            }
            .standee-card {
              border: 3px double #d4af37;
              border-radius: 16px;
              padding: 24px;
              max-width: 440px;
              margin: 0 auto;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            .hotel-name { font-size: 22px; font-weight: 800; color: #0a192f; margin: 0; letter-spacing: 0.5px; }
            .hotel-sub { font-size: 11px; text-transform: uppercase; color: #b45309; letter-spacing: 1.5px; margin-top: 4px; font-weight: 700; }
            .room-pill {
              display: inline-block;
              background: #0a192f;
              color: #d4af37;
              padding: 6px 20px;
              border-radius: 20px;
              font-size: 18px;
              font-weight: 800;
              margin: 16px 0 12px 0;
            }
            .qr-frame {
              background: #fff;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px;
              display: inline-block;
              margin: 10px 0;
            }
            .qr-frame img { width: 220px; height: 220px; display: block; }
            .instruction { font-size: 14px; font-weight: 700; color: #1e293b; margin: 8px 0 4px 0; }
            .details { font-size: 11px; color: #64748b; line-height: 1.5; margin: 0; }
            .wifi-box {
              background: #f8fafc;
              border: 1px dashed #cbd5e1;
              border-radius: 8px;
              padding: 8px;
              margin-top: 14px;
              font-size: 11px;
              color: #334155;
            }
            .footer-tag { font-size: 10px; color: #94a3b8; margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <h1 class="hotel-name">${HOTEL_CONFIG.legalName}</h1>
            <div class="hotel-sub">Rayagada, Odisha • Ph: ${HOTEL_CONFIG.phone}</div>
            
            <div class="room-pill">
              ${selectedRoom === 'LOBBY' ? 'LOBBY RECEPTION DESK' : `ROOM NO: ${selectedRoom}`}
            </div>
            
            <div class="qr-frame">
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>

            <div class="instruction">
              ${qrType === 'dining' ? 'Scan for In-Room Dining, Room Services & Wi-Fi' : 
                qrType === 'keycard' ? 'Scan for Digital Smart Key & Guest Pass' :
                qrType === 'wifi' ? 'Scan to Connect to High-Speed Wi-Fi' :
                'Scan to Pay via UPI & Fast Digital Registration'}
            </div>
            <p class="details">
              ${qrType === 'dining' ? '🍽️ Cannon Kitchen Menu • 🛎️ Fresh Towels & Housekeeping Care • 📶 High-Speed Wi-Fi' :
                qrType === 'keycard' ? `Guest: ${guestName} • PIN: ${guestPin} • Authorized Room Access` :
                qrType === 'wifi' ? 'Network: Hotel_Sai_Guest • Password: SaiRayagada765' :
                `UPI ID: ${HOTEL_CONFIG.upiId || 'hotelsai@sbi'} • Verified GST Billing`}
            </p>

            <div class="wifi-box">
              📶 Complimentary High-Speed Wi-Fi: <strong>Hotel_Sai_Guest</strong> | Key: <strong>SaiRayagada765</strong>
            </div>

            <div class="footer-tag">
              Front Desk Dial: <strong>'0'</strong> or <strong>'9'</strong> from Room Intercom • 24/7 Guest Care
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #060e1a 100%)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(212, 175, 55, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid var(--gold-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-glow)'
            }}>
              <QrCode size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>
                Room QR &amp; Standee Generator
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Printable Table Tents, Digital Keycards &amp; In-Room Dining QR Passes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Controls: Room Selector & Mode Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Room Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.35rem' }}>
                Select Room / Asset:
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              >
                <option value="LOBBY">🏨 Lobby &amp; Reception Counter Standee</option>
                <optgroup label="Floor 1 (Standard Deluxe)">
                  {['101','102','103','104','105','106','107','108','109','110'].map(r => (
                    <option key={r} value={r}>Room {r} (Floor 1)</option>
                  ))}
                </optgroup>
                <optgroup label="Floor 2 (Executive Deluxe)">
                  {['201','202','203','204','205','206','207','208','209','210'].map(r => (
                    <option key={r} value={r}>Room {r} (Floor 2)</option>
                  ))}
                </optgroup>
                <optgroup label="Floor 3 (Premium Deluxe)">
                  {['301','302','303','304','305','306','307','308','309','310'].map(r => (
                    <option key={r} value={r}>Room {r} (Floor 3)</option>
                  ))}
                </optgroup>
                <optgroup label="Floor 4 (Royal Suites & Premium)">
                  {['401','402','403','404','405','406','407','408','409','410'].map(r => (
                    <option key={r} value={r}>Room {r} (Floor 4)</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Mode Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.35rem' }}>
                QR Purpose / Mode:
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[
                  { id: 'dining', label: 'In-Room Portal', icon: Utensils },
                  { id: 'keycard', label: 'Keycard', icon: Key },
                  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
                  { id: 'standee', label: 'UPI / Desk', icon: Building2 }
                ].map(m => {
                  const Icon = m.icon;
                  const isActive = qrType === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setQrType(m.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.45rem 0.3rem',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: isActive ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isActive ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? 'var(--gold-glow)' : '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={14} style={{ marginBottom: 2 }} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Keycard PIN Customizer (if keycard mode active) */}
          {qrType === 'keycard' && (
            <div style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px dashed rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block' }}>Guest Name on Keycard:</span>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
              <div style={{ width: 100 }}>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block' }}>4-Digit Access PIN:</span>
                <input
                  type="text"
                  maxLength={4}
                  value={guestPin}
                  onChange={(e) => setGuestPin(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'var(--gold-glow)',
                    fontWeight: 800,
                    textAlign: 'center',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* QR Standee Live Preview Card */}
          <div 
            ref={printRef}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '16px',
              padding: '1.75rem 1.25rem',
              textAlign: 'center',
              maxWidth: '380px',
              margin: '0 auto',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              border: '2px double #d4af37'
            }}
          >
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0a192f', letterSpacing: '0.5px' }}>
              {HOTEL_CONFIG.legalName}
            </div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 800, letterSpacing: '1.2px', marginTop: '2px' }}>
              Rayagada, Odisha • Ph: {HOTEL_CONFIG.phone}
            </div>

            <div style={{
              display: 'inline-block',
              background: '#0a192f',
              color: '#d4af37',
              padding: '0.35rem 1.1rem',
              borderRadius: '20px',
              fontSize: '0.92rem',
              fontWeight: 800,
              margin: '0.85rem 0 0.5rem 0'
            }}>
              {selectedRoom === 'LOBBY' ? 'LOBBY RECEPTION DESK' : `ROOM NO: ${selectedRoom}`}
            </div>

            {/* QR Image Frame */}
            <div style={{
              background: '#fff',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.65rem',
              display: 'inline-block',
              margin: '0.4rem 0'
            }}>
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Room QR Code" 
                  style={{ width: '190px', height: '190px', display: 'block' }}
                />
              ) : (
                <div style={{ width: 190, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={48} color="#cbd5e1" />
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0 0.15rem 0' }}>
              {qrType === 'dining' ? 'Scan for In-Room Dining, Services & Wi-Fi' :
                qrType === 'keycard' ? 'Scan for Digital Smart Key' :
                qrType === 'wifi' ? 'Scan to Connect to Wi-Fi' :
                'Scan to Pay via UPI & Fast Registration'}
            </div>

            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
              {qrType === 'dining' ? '🍽️ Cannon Kitchen Menu • 🛎️ Fresh Towels & Care • 📶 High-Speed Wi-Fi' :
                qrType === 'keycard' ? `Guest: ${guestName} • PIN: ${guestPin} • Valid for stay duration` :
                qrType === 'wifi' ? 'Network: Hotel_Sai_Guest • Pass: SaiRayagada765' :
                `UPI: ${HOTEL_CONFIG.upiId || 'hotelsai@sbi'} • Verified GST Check-In`}
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              padding: '0.35rem 0.5rem',
              fontSize: '0.7rem',
              color: '#334155'
            }}>
              📶 High-Speed Wi-Fi: <strong>Hotel_Sai_Guest</strong> | Key: <strong>SaiRayagada765</strong>
            </div>

            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
              Front Desk Intercom: Dial <strong>'0'</strong> or <strong>'9'</strong> • 24/7 Room Service
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--gold-glow)',
                color: '#060e1a',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
              }}
            >
              <Printer size={16} /> Print Table Tent Card
            </button>

            <button
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0.65rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={15} /> Download PNG
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: copied ? '#34d399' : '#fff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0.65rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Link Copied!' : 'Copy Guest URL'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
