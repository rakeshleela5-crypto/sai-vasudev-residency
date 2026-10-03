// Sri Sai Vasudev Residency - 360° Virtual Tour Scenes & Checkpoints
// Complete interactive scenes with spherical hotspots and floor groupings

import { HOTEL_18_ROOMS_360_MANIFEST } from '../utils/r2Storage';

export const HOTEL_360_FLOORS = [
  { id: 'all', label: 'All Highlights', count: 12 },
  { id: 'campus', label: 'Campus & Exterior', floor: 0, count: 2 },
  { id: 'ground', label: 'Ground Floor (101-107)', floor: 1, count: 8 },
  { id: 'first', label: 'First Floor (201-211)', floor: 2, count: 8 },
  { id: 'dining', label: 'Satvik Dining & Rooftop', floor: 'special', count: 2 }
];

export const HOTEL_360_SCENES = {
  // 1. Campus Entrance
  'entrance-gate': {
    id: 'entrance-gate',
    name: 'Grand Entrance & Campus Gate',
    shortName: 'Main Gate',
    floor: 0,
    category: 'campus',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['entrance-gate'].cdnUrl,
    initialYaw: 15,
    initialPitch: 0,
    initialFov: 75,
    soundscape: 'temple-bells',
    description: 'Welcome to Sri Sai Vasudev Residency. Located in New Colony, Rayagada, near historic Andhra Bank.',
    hotspots: [
      {
        id: 'hs-gate-to-portico',
        pitch: -3,
        yaw: 18,
        title: 'Step to Front Portico',
        targetSceneId: 'portico-valet',
        iconType: 'arrow-forward',
        description: 'Advance to the shaded vehicle drop-off area and valet entrance.'
      },
      {
        id: 'hs-gate-to-lobby',
        pitch: -1,
        yaw: 35,
        title: 'Enter Grand Reception',
        targetSceneId: 'grand-lobby',
        iconType: 'building',
        description: 'Enter the air-conditioned pilgrim reception lobby.'
      }
    ]
  },

  // 2. Portico & Valet
  'portico-valet': {
    id: 'portico-valet',
    name: 'Front Portico & Valet Arrival',
    shortName: 'Portico Valet',
    floor: 0,
    category: 'campus',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['portico-valet'].cdnUrl,
    initialYaw: 20,
    initialPitch: -2,
    initialFov: 75,
    soundscape: 'breeze',
    description: 'Covered guest drop-off with 24/7 CCTV surveillance and luggage assistance.',
    hotspots: [
      {
        id: 'hs-portico-to-gate',
        pitch: -4,
        yaw: 195,
        title: 'Return to Main Gate',
        targetSceneId: 'entrance-gate',
        iconType: 'arrow-back',
        description: 'Head back toward New Colony road entrance.'
      },
      {
        id: 'hs-portico-to-lobby',
        pitch: -2,
        yaw: 22,
        title: 'Enter Grand Reception Lobby',
        targetSceneId: 'grand-lobby',
        iconType: 'door-open',
        description: 'Step into the air-conditioned reception hall.'
      }
    ]
  },

  // 3. Grand Reception Lobby
  'grand-lobby': {
    id: 'grand-lobby',
    name: 'Grand Reception & Hospitality Lobby',
    shortName: 'Grand Lobby',
    floor: 1,
    category: 'ground',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['grand-lobby'].cdnUrl,
    initialYaw: 45,
    initialPitch: -2,
    initialFov: 75,
    soundscape: 'lobby',
    description: 'Italian marble front desk, 24-hour express check-in, Maa Majhighariani darshan booking desk, and pure drinking water station.',
    hotspots: [
      {
        id: 'hs-lobby-to-ground-hall',
        pitch: -2,
        yaw: 78,
        title: 'Ground Floor Corridor (101-107)',
        targetSceneId: 'ground-floor-hall',
        iconType: 'corridor',
        description: 'Access Deluxe and Executive Rooms 101 to 107.'
      },
      {
        id: 'hs-lobby-to-first-hall',
        pitch: 12,
        yaw: 130,
        title: 'Elevator to First Floor (201-211)',
        targetSceneId: 'first-floor-hall',
        iconType: 'elevator',
        description: 'Take elevator or marble staircase to 1st Floor suites.'
      },
      {
        id: 'hs-lobby-to-dining',
        pitch: -3,
        yaw: -65,
        title: 'Satvik Dining Hall',
        targetSceneId: 'satvik-dining',
        iconType: 'utensils',
        description: 'Pure vegetarian dining hall serving hot Odia thalis.'
      },
      {
        id: 'hs-lobby-to-outside',
        pitch: -4,
        yaw: 225,
        title: 'Exit to Front Portico',
        targetSceneId: 'portico-valet',
        iconType: 'door-closed',
        description: 'Return to outdoor entrance and parking.'
      }
    ]
  },

  // 4. Ground Floor Corridor (101 - 107)
  'ground-floor-hall': {
    id: 'ground-floor-hall',
    name: 'Ground Floor Corridor (Rooms 101 - 107)',
    shortName: 'GF Corridor',
    floor: 1,
    category: 'ground',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['ground-floor-hall'].cdnUrl,
    initialYaw: 90,
    initialPitch: -3,
    initialFov: 75,
    soundscape: 'indoor',
    description: 'Serene acoustic corridor leading to 7 spacious guest rooms with convenient ground floor accessibility.',
    hotspots: [
      {
        id: 'hs-hall-to-room-101',
        pitch: -3,
        yaw: 40,
        title: 'Inspect Room 101 (Deluxe Room)',
        targetSceneId: 'room-101',
        iconType: 'bed',
        roomNumber: '101',
        tier: 'Deluxe Room',
        tariff: 1500,
        description: 'Single/Twin Deluxe room with high-speed Wi-Fi and hot water.'
      },
      {
        id: 'hs-hall-to-room-103',
        pitch: -3,
        yaw: 85,
        title: 'Inspect Room 103 (Deluxe King)',
        targetSceneId: 'room-103',
        iconType: 'bed',
        roomNumber: '103',
        tier: 'Deluxe Room',
        tariff: 2000,
        description: 'King-bed deluxe room with 24/7 room service.'
      },
      {
        id: 'hs-hall-to-room-105',
        pitch: -3,
        yaw: 135,
        title: 'Inspect Room 105 (Executive Room)',
        targetSceneId: 'room-105',
        iconType: 'sparkles',
        roomNumber: '105',
        tier: 'Executive Room',
        tariff: 2500,
        description: 'Executive corporate room with workstation and station transfer credit.'
      },
      {
        id: 'hs-hall-to-lobby',
        pitch: -4,
        yaw: 270,
        title: 'Back to Grand Reception',
        targetSceneId: 'grand-lobby',
        iconType: 'arrow-back',
        description: 'Return to reception desk.'
      }
    ]
  },

  // 5. Room 101
  'room-101': {
    id: 'room-101',
    name: 'Room 101 – Deluxe Room (Ground Floor)',
    shortName: 'Room 101',
    roomNumber: '101',
    floor: 1,
    tier: 'Deluxe Room',
    tariff: 1500,
    category: 'ground',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['room-101'].cdnUrl,
    initialYaw: 0,
    initialPitch: -2,
    initialFov: 75,
    soundscape: 'indoor',
    description: 'Ground floor convenience for pilgrims and elderly guests. Featuring King bedding, air conditioning, and 24/7 hot water.',
    amenities: ['Air Conditioning', 'King Bed', 'Hot Water 24/7', 'High-Speed Wi-Fi', 'Room Service'],
    hotspots: [
      {
        id: 'hs-room101-to-hall',
        pitch: -5,
        yaw: 180,
        title: 'Exit to Ground Corridor',
        targetSceneId: 'ground-floor-hall',
        iconType: 'door-open',
        description: 'Step back into hallway.'
      }
    ]
  },

  // 6. Room 103
  'room-103': {
    id: 'room-103',
    name: 'Room 103 – Deluxe Room (King Size)',
    shortName: 'Room 103',
    roomNumber: '103',
    floor: 1,
    tier: 'Deluxe Room',
    tariff: 2000,
    category: 'ground',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['room-103'].cdnUrl,
    initialYaw: 10,
    initialPitch: -1,
    initialFov: 75,
    soundscape: 'indoor',
    description: 'Spacious Deluxe Room tailored for couples and family pilgrims. Features sound-insulated windows and divine comfort.',
    amenities: ['King Bed', 'AC', 'Tea/Coffee Kit', 'Complimentary Breakfast', 'Satellite TV'],
    hotspots: [
      {
        id: 'hs-room103-to-hall',
        pitch: -5,
        yaw: 175,
        title: 'Exit to Ground Corridor',
        targetSceneId: 'ground-floor-hall',
        iconType: 'door-open',
        description: 'Step back into hallway.'
      }
    ]
  },

  // 7. Room 105
  'room-105': {
    id: 'room-105',
    name: 'Room 105 – Executive Room (Workstation)',
    shortName: 'Room 105',
    roomNumber: '105',
    floor: 1,
    tier: 'Executive Room',
    tariff: 2500,
    category: 'ground',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['room-105'].cdnUrl,
    initialYaw: 20,
    initialPitch: -2,
    initialFov: 75,
    soundscape: 'indoor',
    description: 'Equipped with dedicated ergonomic work desk and high-speed fiber internet for executives visiting JK Paper & IMFA.',
    amenities: ['Ergonomic Desk', 'High-Speed Wi-Fi', 'Mini Refrigerator', 'Station Transit', 'Laundry Credit'],
    hotspots: [
      {
        id: 'hs-room105-to-hall',
        pitch: -4,
        yaw: 185,
        title: 'Exit to Ground Corridor',
        targetSceneId: 'ground-floor-hall',
        iconType: 'door-open',
        description: 'Step back into hallway.'
      }
    ]
  },

  // 8. First Floor Sky Gallery & Atrium (201 - 211)
  'first-floor-hall': {
    id: 'first-floor-hall',
    name: 'First Floor Sky Gallery (Rooms 201 - 211)',
    shortName: '1F Sky Gallery',
    floor: 2,
    category: 'first',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['first-floor-hall'].cdnUrl,
    initialYaw: 135,
    initialPitch: -3,
    initialFov: 75,
    soundscape: 'indoor',
    description: 'First floor elevated corridor with views of the internal foyer, accessing Premium Suites and Standard Deluxe guestrooms.',
    hotspots: [
      {
        id: 'hs-firsthall-to-room-201',
        pitch: -2,
        yaw: 65,
        title: 'Inspect Room 201 (Premium Suite)',
        targetSceneId: 'room-201',
        iconType: 'crown',
        roomNumber: '201',
        tier: 'Premium Suite',
        tariff: 3000,
        description: 'Top-tier suite with balcony vista and living lounge.'
      },
      {
        id: 'hs-firsthall-to-room-203',
        pitch: -2,
        yaw: 110,
        title: 'Inspect Room 203 (Premium Suite)',
        targetSceneId: 'room-203',
        iconType: 'crown',
        roomNumber: '203',
        tier: 'Premium Suite',
        tariff: 3000,
        description: 'King Suite with panoramic city outlook.'
      },
      {
        id: 'hs-firsthall-to-room-208',
        pitch: -2,
        yaw: -80,
        title: 'Inspect Room 208 (Standard Deluxe)',
        targetSceneId: 'room-208',
        iconType: 'bed',
        roomNumber: '208',
        tier: 'Standard Deluxe',
        tariff: 2000,
        description: 'Quiet interior room designed for sound rest.'
      },
      {
        id: 'hs-firsthall-to-lobby',
        pitch: -8,
        yaw: 230,
        title: 'Elevator Down to Grand Lobby',
        targetSceneId: 'grand-lobby',
        iconType: 'elevator',
        description: 'Take lift or stairs to Ground Floor.'
      },
      {
        id: 'hs-firsthall-to-terrace',
        pitch: 10,
        yaw: 15,
        title: 'Ascend to Rooftop Temple Vista',
        targetSceneId: 'terrace-vista',
        iconType: 'sun',
        description: 'Go to Rooftop terrace and view Majhighariani hills.'
      }
    ]
  },

  // 9. Room 201 – Premium Suite
  'room-201': {
    id: 'room-201',
    name: 'Room 201 – Premium Suite (Living Lounge & Balcony)',
    shortName: 'Room 201 (Suite)',
    roomNumber: '201',
    floor: 2,
    tier: 'Premium Suite',
    tariff: 3000,
    category: 'first',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['room-201'].cdnUrl,
    initialYaw: 30,
    initialPitch: -1,
    initialFov: 75,
    soundscape: 'indoor',
    description: 'Our signature first-floor presidential suite. Features luxury living room, king bedroom, and scenic morning sunrise vista.',
    amenities: ['Living Room Lounge', 'Imperial King Bed', 'Balcony Vista', 'Complimentary Fruit Basket', 'Bathtub & Rain Shower'],
    hotspots: [
      {
        id: 'hs-room201-to-hall',
        pitch: -5,
        yaw: 190,
        title: 'Exit to First Floor Gallery',
        targetSceneId: 'first-floor-hall',
        iconType: 'door-open',
        description: 'Step back into hallway.'
      }
    ]
  },

  // 10. Room 208 – Standard Deluxe
  'room-208': {
    id: 'room-208',
    name: 'Room 208 – Standard Deluxe Room',
    shortName: 'Room 208',
    roomNumber: '208',
    floor: 2,
    tier: 'Standard Deluxe',
    tariff: 2000,
    category: 'first',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['room-208'].cdnUrl,
    initialYaw: 15,
    initialPitch: -2,
    initialFov: 75,
    soundscape: 'indoor',
    description: 'Affordable luxury with king-size orthopedic bed, high-speed Wi-Fi, and 24/7 hot shower for restful stay.',
    amenities: ['King Size Bed', 'AC', '24/7 Hot Water', 'Daily Housekeeping', 'Free Breakfast'],
    hotspots: [
      {
        id: 'hs-room208-to-hall',
        pitch: -5,
        yaw: 180,
        title: 'Exit to First Floor Gallery',
        targetSceneId: 'first-floor-hall',
        iconType: 'door-open',
        description: 'Step back into hallway.'
      }
    ]
  },

  // 11. Satvik Dining Hall
  'satvik-dining': {
    id: 'satvik-dining',
    name: 'Satvik Dining Hall & Odia Kitchen',
    shortName: 'Satvik Dining',
    floor: 1,
    category: 'dining',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['satvik-dining'].cdnUrl,
    initialYaw: 180,
    initialPitch: -3,
    initialFov: 75,
    soundscape: 'dining',
    description: 'Pure vegetarian dining venue serving authentic Odia cuisine, Temple Mahaprasad dishes, and South/North Indian specialties.',
    hotspots: [
      {
        id: 'hs-dining-to-lobby',
        pitch: -4,
        yaw: 0,
        title: 'Return to Grand Reception Desk',
        targetSceneId: 'grand-lobby',
        iconType: 'arrow-back',
        description: 'Walk back to hotel reception.'
      }
    ]
  },

  // 12. Rooftop Terrace & Temple Vista
  'terrace-vista': {
    id: 'terrace-vista',
    name: 'Rooftop Terrace & Temple Vista',
    shortName: 'Rooftop Vista',
    floor: 'R',
    category: 'dining',
    panoramaUrl: HOTEL_18_ROOMS_360_MANIFEST['terrace-vista'].cdnUrl,
    initialYaw: 210,
    initialPitch: -2,
    initialFov: 75,
    soundscape: 'temple-bells',
    description: 'Spectacular elevated viewpoint of Rayagada city, verdant Eastern Ghats hills, and spires of sacred Maa Majhighariani Temple.',
    hotspots: [
      {
        id: 'hs-terrace-to-first-hall',
        pitch: -12,
        yaw: 35,
        title: 'Descend to First Floor Gallery',
        targetSceneId: 'first-floor-hall',
        iconType: 'elevator',
        description: 'Take elevator down to guestroom levels.'
      },
      {
        id: 'hs-terrace-to-gate',
        pitch: -8,
        yaw: 180,
        title: 'View Campus Ground Gate',
        targetSceneId: 'entrance-gate',
        iconType: 'eye',
        description: 'Jump to main campus entrance.'
      }
    ]
  }
};

/**
 * Returns scene object by sceneId or room number.
 */
export function getTourScene(sceneIdOrRoomNum) {
  if (!sceneIdOrRoomNum) return HOTEL_360_SCENES['entrance-gate'];

  if (HOTEL_360_SCENES[sceneIdOrRoomNum]) {
    return HOTEL_360_SCENES[sceneIdOrRoomNum];
  }

  // If passed as room number like '101'
  const roomKey = `room-${sceneIdOrRoomNum}`;
  if (HOTEL_360_SCENES[roomKey]) {
    return HOTEL_360_SCENES[roomKey];
  }

  // Fallback to room 101 or grand lobby
  return HOTEL_360_SCENES['grand-lobby'];
}
