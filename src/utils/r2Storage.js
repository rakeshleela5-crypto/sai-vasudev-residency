// Sri Sai Vasudev Residency - 360 Panoramic CDN & Storage Manifest
// Cloudflare R2 / High-Resolution Equirectangular Panorama Loader & Fallbacks

/**
 * High-definition equirectangular 360 panoramas (2:1 aspect ratio).
 * Primary CDN URLs with fallback textures and room-specific mapping.
 */
export const HOTEL_18_ROOMS_360_MANIFEST = {
  // --- Common Campus & Architectural Areas ---
  'entrance-gate': {
    id: 'entrance-gate',
    title: 'Grand Entrance Arch & Campus Gate',
    area: 'Campus Perimeter',
    floor: 0,
    r2Key: 'panoramas/campus/entrance-gate-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=85',
    fallbackColor: '#0a192f',
    hotspotsCount: 3
  },
  'portico-valet': {
    id: 'portico-valet',
    title: 'Front Portico & Valet Arrival Area',
    area: 'Campus Approach',
    floor: 0,
    r2Key: 'panoramas/campus/portico-valet-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=85',
    fallbackColor: '#0c2238',
    hotspotsCount: 4
  },
  'grand-lobby': {
    id: 'grand-lobby',
    title: 'Grand Reception & Pilgrim Hospitality Desk',
    area: 'Ground Floor Lobby',
    floor: 1,
    r2Key: 'panoramas/lobby/reception-lobby-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=85',
    fallbackColor: '#172554',
    hotspotsCount: 6
  },
  'ground-floor-hall': {
    id: 'ground-floor-hall',
    title: 'Ground Floor Corridor (Rooms 101 - 107)',
    area: 'Wing A',
    floor: 1,
    r2Key: 'panoramas/corridors/ground-floor-corridor-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2400&q=85',
    fallbackColor: '#1e293b',
    hotspotsCount: 5
  },
  'first-floor-hall': {
    id: 'first-floor-hall',
    title: 'First Floor Sky Gallery & Atrium (Rooms 201 - 211)',
    area: 'Wing B',
    floor: 2,
    r2Key: 'panoramas/corridors/first-floor-atrium-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85',
    fallbackColor: '#0f172a',
    hotspotsCount: 5
  },
  'satvik-dining': {
    id: 'satvik-dining',
    title: 'Satvik Dining Hall & Odia Cuisine Lounge',
    area: 'Dining Wing',
    floor: 1,
    r2Key: 'panoramas/dining/satvik-dining-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&q=85',
    fallbackColor: '#2b1b17',
    hotspotsCount: 4
  },
  'executive-lounge': {
    id: 'executive-lounge',
    title: 'Executive Corporate Conference Lounge',
    area: 'Business Center',
    floor: 2,
    r2Key: 'panoramas/business/executive-lounge-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=85',
    fallbackColor: '#111827',
    hotspotsCount: 3
  },
  'terrace-vista': {
    id: 'terrace-vista',
    title: 'Rooftop Terrace & Maa Majhighariani Temple Vista',
    area: 'Rooftop Sanctuary',
    floor: 3,
    r2Key: 'panoramas/campus/rooftop-temple-vista-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85',
    fallbackColor: '#0c4a6e',
    hotspotsCount: 4
  },

  // --- Ground Floor 7 Rooms (101 - 107) ---
  'room-101': {
    id: 'room-101',
    roomNumber: '101',
    tier: 'Deluxe Room',
    title: 'Room 101 – Ground Floor Deluxe Room (Single/Twin)',
    tariff: 1500,
    r2Key: 'panoramas/rooms/101-deluxe-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2400&q=85',
    floor: 1
  },
  'room-102': {
    id: 'room-102',
    roomNumber: '102',
    tier: 'Deluxe Room',
    title: 'Room 102 – Ground Floor Deluxe Room (Queen Size)',
    tariff: 1500,
    r2Key: 'panoramas/rooms/102-deluxe-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2400&q=85',
    floor: 1
  },
  'room-103': {
    id: 'room-103',
    roomNumber: '103',
    tier: 'Deluxe Room',
    title: 'Room 103 – Ground Floor Deluxe Double (King Bed)',
    tariff: 2000,
    r2Key: 'panoramas/rooms/103-deluxe-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=2400&q=85',
    floor: 1
  },
  'room-104': {
    id: 'room-104',
    roomNumber: '104',
    tier: 'Executive Room',
    title: 'Room 104 – Ground Floor Executive Room (King Bed & Desk)',
    tariff: 2500,
    r2Key: 'panoramas/rooms/104-executive-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2400&q=85',
    floor: 1
  },
  'room-105': {
    id: 'room-105',
    roomNumber: '105',
    tier: 'Executive Room',
    title: 'Room 105 – Ground Floor Executive Room (High-Speed Wi-Fi)',
    tariff: 2500,
    r2Key: 'panoramas/rooms/105-executive-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=2400&q=85',
    floor: 1
  },
  'room-106': {
    id: 'room-106',
    roomNumber: '106',
    tier: 'Deluxe Room',
    title: 'Room 106 – Ground Floor Deluxe Room (2 Adults)',
    tariff: 2000,
    r2Key: 'panoramas/rooms/106-deluxe-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=2400&q=85',
    floor: 1
  },
  'room-107': {
    id: 'room-107',
    roomNumber: '107',
    tier: 'Executive Room',
    title: 'Room 107 – Ground Floor Executive Corner Suite',
    tariff: 2500,
    r2Key: 'panoramas/rooms/107-executive-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2400&q=85',
    floor: 1
  },

  // --- First Floor 11 Rooms (201 - 211) ---
  'room-201': {
    id: 'room-201',
    roomNumber: '201',
    tier: 'Premium Suite',
    title: 'Room 201 – First Floor Premium Suite (Balcony & Living Lounge)',
    tariff: 3000,
    r2Key: 'panoramas/rooms/201-suite-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-202': {
    id: 'room-202',
    roomNumber: '202',
    tier: 'Deluxe Room',
    title: 'Room 202 – First Floor Deluxe Room (Single Traveler)',
    tariff: 1500,
    r2Key: 'panoramas/rooms/202-deluxe-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-203': {
    id: 'room-203',
    roomNumber: '203',
    tier: 'Premium Suite',
    title: 'Room 203 – First Floor Premium Suite (King Size + City View)',
    tariff: 3000,
    r2Key: 'panoramas/rooms/203-suite-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-204': {
    id: 'room-204',
    roomNumber: '204',
    tier: 'Executive Room',
    title: 'Room 204 – First Floor Executive Room',
    tariff: 2500,
    r2Key: 'panoramas/rooms/204-executive-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-205': {
    id: 'room-205',
    roomNumber: '205',
    tier: 'Executive Room',
    title: 'Room 205 – First Floor Executive Workstation Room',
    tariff: 2500,
    r2Key: 'panoramas/rooms/205-executive-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-206': {
    id: 'room-206',
    roomNumber: '206',
    tier: 'Executive Room',
    title: 'Room 206 – First Floor Executive Room',
    tariff: 2500,
    r2Key: 'panoramas/rooms/206-executive-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-207': {
    id: 'room-207',
    roomNumber: '207',
    tier: 'Executive Room',
    title: 'Room 207 – First Floor Executive Room',
    tariff: 2500,
    r2Key: 'panoramas/rooms/207-executive-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-208': {
    id: 'room-208',
    roomNumber: '208',
    tier: 'Standard Deluxe',
    title: 'Room 208 – First Floor Standard Deluxe',
    tariff: 2000,
    r2Key: 'panoramas/rooms/208-std-deluxe-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-209': {
    id: 'room-209',
    roomNumber: '209',
    tier: 'Standard Deluxe',
    title: 'Room 209 – First Floor Standard Deluxe',
    tariff: 2000,
    r2Key: 'panoramas/rooms/209-std-deluxe-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-210': {
    id: 'room-210',
    roomNumber: '210',
    tier: 'Standard Deluxe',
    title: 'Room 210 – First Floor Standard Deluxe',
    tariff: 2000,
    r2Key: 'panoramas/rooms/210-std-deluxe-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  },
  'room-211': {
    id: 'room-211',
    roomNumber: '211',
    tier: 'Premium Suite',
    title: 'Room 211 – First Floor Imperial Presidential Suite',
    tariff: 3000,
    r2Key: 'panoramas/rooms/211-imperial-suite-360.webp',
    cdnUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2400&q=85',
    floor: 2
  }
};

/**
 * Returns the panorama metadata for a specific room number (e.g. '101' or '203').
 */
export function getRoomPanorama(roomNumber) {
  const key = `room-${roomNumber}`;
  return HOTEL_18_ROOMS_360_MANIFEST[key] || HOTEL_18_ROOMS_360_MANIFEST['grand-lobby'];
}

/**
 * Returns the panorama image URL for a given sceneId or room number with guaranteed fallback.
 */
export function getScenePanoramaUrl(sceneId) {
  if (sceneId && sceneId.startsWith('room-')) {
    const item = HOTEL_18_ROOMS_360_MANIFEST[sceneId];
    if (item && item.cdnUrl) return item.cdnUrl;
  }
  const item = HOTEL_18_ROOMS_360_MANIFEST[sceneId];
  return item?.cdnUrl || HOTEL_18_ROOMS_360_MANIFEST['grand-lobby'].cdnUrl;
}

/**
 * Creates an instantaneous, beautiful procedural equirectangular fallback panorama canvas
 * ensuring Three.js never exhibits black textures during network latency or offline modes.
 */
export function createProceduralEquirectangularCanvas(title = 'Sri Sai Vasudev Residency', baseColor = '#0b192c', accentColor = '#38bdf8') {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Sky to floor gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#040914');
  grad.addColorStop(0.3, baseColor);
  grad.addColorStop(0.5, '#1e293b');
  grad.addColorStop(0.7, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Architectural Grid Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 2;
  for (let y = 100; y < 1024; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }
  for (let x = 0; x < 2048; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  // Horizon golden architectural band
  const horizonGrad = ctx.createLinearGradient(0, 500, 0, 524);
  horizonGrad.addColorStop(0, 'rgba(212, 175, 55, 0.4)');
  horizonGrad.addColorStop(1, 'rgba(212, 175, 55, 0.1)');
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, 500, 2048, 24);

  // Warm ambient light glow
  const glow = ctx.createRadialGradient(1024, 450, 20, 1024, 450, 400);
  glow.addColorStop(0, 'rgba(243, 198, 76, 0.35)');
  glow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 2048, 1024);

  // Stamp Sri Sai Vasudev Residency Branding
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 1024, 470);

  ctx.fillStyle = '#d4af37';
  ctx.font = '22px Inter, system-ui, sans-serif';
  ctx.fillText('Sri Sai Vasudev Residency • 360° Equirectangular High-Fidelity Panorama', 1024, 510);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '16px monospace';
  ctx.fillText('Rayagada, Odisha | Near Andhra Bank, New Colony', 1024, 545);

  return canvas;
}
