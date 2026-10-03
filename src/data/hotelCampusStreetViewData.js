// Sri Sai Vasudev Residency - 11-Step Campus Street View Track
// Google Street View style linear walkthrough data model

export const CAMPUS_STREET_VIEW_TRACK = [
  {
    id: 'sv-step-01',
    stepNumber: 1,
    title: 'New Colony Main Road Junction',
    subtitle: 'Rayagada Arterial Approach',
    description: 'The primary access road connecting Rayagada Junction (1.5 km away) directly to New Colony commercial corridor.',
    headingDeg: 350,
    panoramaUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'street-birds',
    targetSceneId: 'entrance-gate',
    hotspots: [
      {
        id: 'hs-to-02',
        targetStepId: 'sv-step-02',
        title: 'Advance towards Andhra Bank Landmark',
        yaw: 0,
        pitch: -5,
        type: 'forward'
      }
    ]
  },
  {
    id: 'sv-step-02',
    stepNumber: 2,
    title: 'Andhra Bank Landmark & Gateway',
    subtitle: 'Historic Rayagada Landmark',
    description: 'Located right next to Andhra Bank on New Colony main street. The welcoming glow of the residency sign is visible ahead.',
    headingDeg: 10,
    panoramaUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'street-birds',
    targetSceneId: 'entrance-gate',
    hotspots: [
      {
        id: 'hs-back-01',
        targetStepId: 'sv-step-01',
        title: 'Back to Main Road',
        yaw: 180,
        pitch: -5,
        type: 'backward'
      },
      {
        id: 'hs-to-03',
        targetStepId: 'sv-step-03',
        title: 'Approach Residency Grand Arch',
        yaw: 0,
        pitch: -3,
        type: 'forward'
      }
    ]
  },
  {
    id: 'sv-step-03',
    stepNumber: 3,
    title: 'Residency Grand Arch Entrance',
    subtitle: 'Main Property Gate',
    description: 'A dedicated arched portal welcoming pilgrims, corporate executives, and travelers to Sri Sai Vasudev Residency.',
    headingDeg: 15,
    panoramaUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'breeze-chimes',
    targetSceneId: 'entrance-gate',
    hotspots: [
      {
        id: 'hs-back-02',
        targetStepId: 'sv-step-02',
        title: 'Back to Gateway',
        yaw: 180,
        pitch: -5,
        type: 'backward'
      },
      {
        id: 'hs-to-04',
        targetStepId: 'sv-step-04',
        title: 'Step into Front Portico & Valet',
        yaw: 5,
        pitch: -2,
        type: 'forward'
      }
    ]
  },
  {
    id: 'sv-step-04',
    stepNumber: 4,
    title: 'Front Portico & Valet Arrival Area',
    subtitle: 'Vehicle Drop-off & Parking',
    description: 'Spacious drive-through portico with shaded vehicle drop-off, luggage handling assistance, and CCTV surveillance.',
    headingDeg: 25,
    panoramaUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'breeze-chimes',
    targetSceneId: 'portico-valet',
    hotspots: [
      {
        id: 'hs-back-03',
        targetStepId: 'sv-step-03',
        title: 'Back to Grand Arch',
        yaw: 195,
        pitch: -5,
        type: 'backward'
      },
      {
        id: 'hs-to-05',
        targetStepId: 'sv-step-05',
        title: 'Enter Glass Foyer',
        yaw: 15,
        pitch: -2,
        type: 'forward'
      }
    ]
  },
  {
    id: 'sv-step-05',
    stepNumber: 5,
    title: 'Glass Foyer & Security Check',
    subtitle: 'Main Building Entryway',
    description: 'Air-conditioned sliding glass threshold equipped with sanitization stations and 24/7 security guard post.',
    headingDeg: 30,
    panoramaUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'lobby-gentle',
    targetSceneId: 'grand-lobby',
    hotspots: [
      {
        id: 'hs-back-04',
        targetStepId: 'sv-step-04',
        title: 'Back to Portico',
        yaw: 210,
        pitch: -5,
        type: 'backward'
      },
      {
        id: 'hs-to-06',
        targetStepId: 'sv-step-06',
        title: 'Proceed to Grand Reception',
        yaw: 25,
        pitch: -1,
        type: 'forward'
      }
    ]
  },
  {
    id: 'sv-step-06',
    stepNumber: 6,
    title: 'Grand Reception & Check-in Desk',
    subtitle: 'Ground Floor Central Lobby',
    description: 'Italian marble front desk, express digital key registration, Maa Majhighariani darshan assistance desk, and welcoming beverage service.',
    headingDeg: 45,
    panoramaUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'lobby-gentle',
    targetSceneId: 'grand-lobby',
    hotspots: [
      {
        id: 'hs-back-05',
        targetStepId: 'sv-step-05',
        title: 'Back to Foyer',
        yaw: 220,
        pitch: -5,
        type: 'backward'
      },
      {
        id: 'hs-to-07',
        targetStepId: 'sv-step-07',
        title: 'Walk into Ground Floor Corridor',
        yaw: 80,
        pitch: -2,
        type: 'forward'
      },
      {
        id: 'hs-to-10',
        targetStepId: 'sv-step-10',
        title: 'Visit Satvik Dining Hall',
        yaw: -70,
        pitch: -2,
        type: 'branch'
      }
    ]
  },
  {
    id: 'sv-step-07',
    stepNumber: 7,
    title: 'Ground Floor Executive Corridor',
    subtitle: 'Rooms 101 - 107 Wing',
    description: 'Acoustically treated, softly lit corridor accessing ground floor executive rooms and deluxe guest suites.',
    headingDeg: 90,
    panoramaUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'indoor-calm',
    targetSceneId: 'ground-floor-hall',
    hotspots: [
      {
        id: 'hs-back-06',
        targetStepId: 'sv-step-06',
        title: 'Back to Reception',
        yaw: 270,
        pitch: -3,
        type: 'backward'
      },
      {
        id: 'hs-to-08',
        targetStepId: 'sv-step-08',
        title: 'Elevator & Staircase Landing',
        yaw: 90,
        pitch: -2,
        type: 'forward'
      }
    ]
  },
  {
    id: 'sv-step-08',
    stepNumber: 8,
    title: 'Marble Staircase & Elevator Lobby',
    subtitle: 'Vertical Transit Nexus',
    description: 'Granite-tread illuminated stairway and automatic high-speed guest lift connecting Ground Floor to First Floor and Terrace.',
    headingDeg: 120,
    panoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'indoor-calm',
    targetSceneId: 'first-floor-hall',
    hotspots: [
      {
        id: 'hs-back-07',
        targetStepId: 'sv-step-07',
        title: 'Down to Ground Corridor',
        yaw: 290,
        pitch: -8,
        type: 'backward'
      },
      {
        id: 'hs-to-09',
        targetStepId: 'sv-step-09',
        title: 'Ascend to First Floor Gallery',
        yaw: 110,
        pitch: 5,
        type: 'forward'
      }
    ]
  },
  {
    id: 'sv-step-09',
    stepNumber: 9,
    title: 'First Floor Sky Gallery & Atrium',
    subtitle: 'Rooms 201 - 211 & Executive Wing',
    description: 'Wide, airy second-level atrium overlooking the lobby, granting entry to Rooms 201 through 211, including Premium Suites.',
    headingDeg: 135,
    panoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'indoor-calm',
    targetSceneId: 'first-floor-hall',
    hotspots: [
      {
        id: 'hs-back-08',
        targetStepId: 'sv-step-08',
        title: 'Back to Stairwell & Lift',
        yaw: 310,
        pitch: -4,
        type: 'backward'
      },
      {
        id: 'hs-to-11',
        targetStepId: 'sv-step-11',
        title: 'Take Lift to Rooftop Terrace',
        yaw: 130,
        pitch: 8,
        type: 'forward'
      }
    ]
  },
  {
    id: 'sv-step-10',
    stepNumber: 10,
    title: 'Satvik Multi-Cuisine Dining Hall',
    subtitle: 'Ground Level Restaurant',
    description: 'Pure vegetarian dining venue serving authentic Odia thalis, South Indian breakfast, and North Indian delicacies with brassware dining service.',
    headingDeg: 180,
    panoramaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'dining-ambience',
    targetSceneId: 'satvik-dining',
    hotspots: [
      {
        id: 'hs-back-06-from-dining',
        targetStepId: 'sv-step-06',
        title: 'Return to Reception Desk',
        yaw: 0,
        pitch: -4,
        type: 'backward'
      }
    ]
  },
  {
    id: 'sv-step-11',
    stepNumber: 11,
    title: 'Rooftop Terrace & Temple Vista',
    subtitle: 'Maa Majhighariani Viewpoint',
    description: 'Panoramic open-air terrace offering breathtaking morning views over Rayagada hills and sacred temple spires.',
    headingDeg: 210,
    panoramaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85',
    audioAmbience: 'temple-bells',
    targetSceneId: 'terrace-vista',
    hotspots: [
      {
        id: 'hs-back-09',
        targetStepId: 'sv-step-09',
        title: 'Descend to First Floor Gallery',
        yaw: 30,
        pitch: -12,
        type: 'backward'
      },
      {
        id: 'hs-restart',
        targetStepId: 'sv-step-01',
        title: 'Restart Tour from Main Gate',
        yaw: 180,
        pitch: -5,
        type: 'restart'
      }
    ]
  }
];

export const getCampusStepById = (stepId) => {
  return CAMPUS_STREET_VIEW_TRACK.find(step => step.id === stepId) || CAMPUS_STREET_VIEW_TRACK[0];
};

export const getCampusStepByNumber = (stepNum) => {
  return CAMPUS_STREET_VIEW_TRACK.find(step => step.stepNumber === stepNum) || CAMPUS_STREET_VIEW_TRACK[0];
};
