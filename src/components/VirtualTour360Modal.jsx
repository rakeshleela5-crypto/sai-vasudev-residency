import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  X, RotateCw, ZoomIn, ZoomOut, Layers, Eye, 
  Sparkles, Compass, Volume2, VolumeX, Smartphone,
  Maximize2, Minimize2, ChevronRight, ChevronLeft,
  Bed, Building2, MapPin, CalendarCheck, Share2, Info
} from 'lucide-react';
import { HOTEL_360_SCENES, HOTEL_360_FLOORS, getTourScene } from '../data/hotel360TourData';
import { createProceduralEquirectangularCanvas } from '../utils/r2Storage';

export function VirtualTour360Modal({ 
  isOpen, 
  onClose, 
  initialSceneId = 'entrance-gate',
  onOpen3DExplorer,
  onBookRoom 
}) {
  const mountRef = useRef(null);
  const headingDisplayRef = useRef(null);
  const currentSceneRef = useRef(null);

  const [currentSceneId, setCurrentSceneId] = useState(initialSceneId);
  const [activeFloorFilter, setActiveFloorFilter] = useState('all');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [projectedHotspots, setProjectedHotspots] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Three.js References
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const mainMeshRef = useRef(null);
  const fadeMeshRef = useRef(null);
  const textureLoaderRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Interaction & Damping Refs
  const isUserInteractingRef = useRef(false);
  const onPointerDownPointerXRef = useRef(0);
  const onPointerDownPointerYRef = useRef(0);
  const onPointerDownLonRef = useRef(0);
  const onPointerDownLatRef = useRef(0);
  const lonRef = useRef(0);
  const latRef = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0);
  const targetLonRef = useRef(0);
  const targetLatRef = useRef(0);
  const targetFovRef = useRef(75);
  const lastHotspotCheckTimeRef = useRef(0);

  // Gyroscope tracking
  const gyroRef = useRef({ alpha: 0, beta: 0, gamma: 0, active: false });

  // Web Audio Context & Synthesizer
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef([]);

  const currentScene = getTourScene(currentSceneId);
  currentSceneRef.current = currentScene;

  // Sync initialSceneId when modal opens or prop changes
  useEffect(() => {
    if (isOpen && initialSceneId) {
      setCurrentSceneId(initialSceneId);
    }
  }, [isOpen, initialSceneId]);

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  // Audio Ambience Synthesis (Zero-dependency Web Audio API soundscape)
  const startAudioAmbience = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Stop previous nodes
      audioNodesRef.current.forEach(node => {
        try { node.stop?.(); node.disconnect?.(); } catch (_) {}
      });
      audioNodesRef.current = [];

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.04, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Low resonant warm ambient drone (F# major chord foundation)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(92.5, ctx.currentTime); // F#2

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(138.6, ctx.currentTime); // C#3

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();
      audioNodesRef.current.push(osc1, osc2, filter, masterGain);

      // Gentle temple bells chime pulse for sacred ambiance
      if (currentScene.soundscape === 'temple-bells') {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6 bell
        chimeGain.gain.setValueAtTime(0.001, ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeOsc.start();
        chimeOsc.stop(ctx.currentTime + 3.5);
        audioNodesRef.current.push(chimeOsc, chimeGain);
      }
    } catch (err) {
      console.warn('Web Audio ambience failed:', err);
    }
  }, [currentScene.soundscape]);

  const stopAudioAmbience = useCallback(() => {
    try {
      audioNodesRef.current.forEach(node => {
        try { node.stop?.(); node.disconnect?.(); } catch (_) {}
      });
      audioNodesRef.current = [];
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!isOpen || isMuted) {
      stopAudioAmbience();
    } else {
      startAudioAmbience();
    }
    return () => stopAudioAmbience();
  }, [isOpen, isMuted, currentSceneId, startAudioAmbience, stopAudioAmbience]);

  // Gyroscope Setup
  useEffect(() => {
    if (!gyroEnabled) return;

    const handleOrientation = (e) => {
      if (e.alpha !== null && e.beta !== null) {
        gyroRef.current = {
          alpha: e.alpha || 0,
          beta: e.beta || 0,
          gamma: e.gamma || 0,
          active: true
        };
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [gyroEnabled]);

  const toggleGyroscope = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setGyroEnabled(!gyroEnabled);
        } else {
          showToast('Motion permission was declined on this device.');
        }
      } catch (e) {
        setGyroEnabled(!gyroEnabled);
      }
    } else {
      setGyroEnabled(!gyroEnabled);
      showToast(!gyroEnabled ? 'Gyroscope Tracking Enabled' : 'Touch/Mouse Drag Controls Enabled');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  // Helper to load Three.js Texture with Procedural Fallback
  const loadPanoramaTexture = useCallback((url, title) => {
    return new Promise((resolve) => {
      if (!textureLoaderRef.current) {
        textureLoaderRef.current = new THREE.TextureLoader();
        textureLoaderRef.current.setCrossOrigin('anonymous');
      }

      textureLoaderRef.current.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          resolve(texture);
        },
        undefined,
        (err) => {
          console.warn(`Panorama image failed to load (${url}), falling back to procedural canvas:`, err);
          const canvas = createProceduralEquirectangularCanvas(title);
          const canvasTexture = new THREE.CanvasTexture(canvas);
          canvasTexture.colorSpace = THREE.SRGBColorSpace;
          resolve(canvasTexture);
        }
      );
    });
  }, []);

  // Main Three.js Scene Initialization
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth || 1200;
    const height = container.clientHeight || window.innerHeight || 800;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera (inside the sphere at origin)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1100);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, 
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Inverted Equirectangular Sphere Mesh Architecture
    const sphereGeo = new THREE.SphereGeometry(500, 64, 48);
    sphereGeo.scale(-1, 1, 1); // Invert inward so camera views texture from inside

    // Initial placeholder canvas texture
    const initialCanvas = createProceduralEquirectangularCanvas(currentScene.name);
    const initialTex = new THREE.CanvasTexture(initialCanvas);
    initialTex.colorSpace = THREE.SRGBColorSpace;

    // Main Sphere
    const mainMat = new THREE.MeshBasicMaterial({
      map: initialTex,
      transparent: true,
      opacity: 1.0,
      depthWrite: true
    });
    const mainMesh = new THREE.Mesh(sphereGeo, mainMat);
    scene.add(mainMesh);
    mainMeshRef.current = mainMesh;

    // Fade Sphere for Dual-Sphere Crossfade Transitions
    const fadeMat = new THREE.MeshBasicMaterial({
      map: initialTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const fadeMesh = new THREE.Mesh(sphereGeo.clone(), fadeMat);
    fadeMesh.visible = false;
    scene.add(fadeMesh);
    fadeMeshRef.current = fadeMesh;

    // Load actual scene texture
    loadPanoramaTexture(currentScene.panoramaUrl, currentScene.name).then((tex) => {
      if (mainMeshRef.current) {
        mainMeshRef.current.material.map = tex;
        mainMeshRef.current.material.needsUpdate = true;
      }
    });

    // Reset Orientation to scene defaults
    targetLonRef.current = currentScene.initialYaw || 0;
    targetLatRef.current = currentScene.initialPitch || 0;
    lonRef.current = targetLonRef.current;
    latRef.current = targetLatRef.current;
    targetFovRef.current = currentScene.initialFov || 75;

    // 5. Render Loop
    let crossFadeStartTime = 0;
    const crossFadeDuration = 650; // ms
    let lastHeadingDeg = -1;

    const animate = (timestamp) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Auto-rotation when idle
      if (autoRotate && !isUserInteractingRef.current && !gyroRef.current.active) {
        targetLonRef.current += 0.06;
      }

      // Gyroscope blending if enabled
      if (gyroEnabled && gyroRef.current.active) {
        targetLonRef.current = -gyroRef.current.alpha;
        targetLatRef.current = THREE.MathUtils.clamp(gyroRef.current.beta - 90, -85, 85);
      }

      // Smooth damping interpolation
      lonRef.current += (targetLonRef.current - lonRef.current) * 0.12;
      latRef.current += (targetLatRef.current - latRef.current) * 0.12;
      camera.fov += (targetFovRef.current - camera.fov) * 0.15;
      camera.updateProjectionMatrix();

      // Clamp latitude to avoid pole gimbal lock
      latRef.current = Math.max(-85, Math.min(85, latRef.current));
      phiRef.current = THREE.MathUtils.degToRad(90 - latRef.current);
      thetaRef.current = THREE.MathUtils.degToRad(lonRef.current);

      // Look direction vector matching standard equirectangular sphere
      const target = new THREE.Vector3(
        500 * Math.sin(phiRef.current) * Math.cos(thetaRef.current),
        500 * Math.cos(phiRef.current),
        500 * Math.sin(phiRef.current) * Math.sin(thetaRef.current)
      );
      camera.lookAt(target);

      // Update heading compass degrees directly in DOM ref for zero React re-render lag
      const normalizedLon = Math.round(((lonRef.current % 360) + 360) % 360);
      if (normalizedLon !== lastHeadingDeg) {
        lastHeadingDeg = normalizedLon;
        if (headingDisplayRef.current) {
          headingDisplayRef.current.textContent = `${normalizedLon}° Heading`;
        }
      }

      // Handle Crossfade Transition if active
      if (fadeMeshRef.current && fadeMeshRef.current.visible) {
        if (!crossFadeStartTime) crossFadeStartTime = timestamp;
        const elapsed = timestamp - crossFadeStartTime;
        const progress = Math.min(1.0, elapsed / crossFadeDuration);

        fadeMeshRef.current.material.opacity = progress;

        if (progress >= 1.0) {
          // Swap textures and reset fadeMesh
          mainMeshRef.current.material.map = fadeMeshRef.current.material.map;
          mainMeshRef.current.material.needsUpdate = true;
          fadeMeshRef.current.visible = false;
          fadeMeshRef.current.material.opacity = 0;
          crossFadeStartTime = 0;
          setIsTransitioning(false);
        }
      }

      // Project Current Scene Hotspots from Spherical 3D to 2D Screen Space
      // Throttle calculation to every 30ms (~33fps) to keep CPU low
      if (timestamp - lastHotspotCheckTimeRef.current > 30) {
        lastHotspotCheckTimeRef.current = timestamp;
        const activeScene = currentSceneRef.current || currentScene;
        const currentHotspots = activeScene.hotspots || [];

        if (currentHotspots.length > 0 && container) {
          const cWidth = container.clientWidth || window.innerWidth;
          const cHeight = container.clientHeight || window.innerHeight;
          const projected = [];

          // Camera world direction for frustum visibility dot product
          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);

          currentHotspots.forEach((hs) => {
            const hsPitch = hs.pitch || 0;
            const hsYaw = hs.yaw || 0;
            const hsPhi = THREE.MathUtils.degToRad(90 - hsPitch);
            const hsTheta = THREE.MathUtils.degToRad(hsYaw);

            // World coordinates matching camera lookAt
            const hsPos = new THREE.Vector3(
              500 * Math.sin(hsPhi) * Math.cos(hsTheta),
              500 * Math.cos(hsPhi),
              500 * Math.sin(hsPhi) * Math.sin(hsTheta)
            );

            // Check if hotspot is in front of camera
            const dot = camDir.dot(hsPos.clone().normalize());
            if (dot > 0.1) {
              const pVec = hsPos.clone().project(camera);
              const x = (pVec.x * 0.5 + 0.5) * cWidth;
              const y = (-(pVec.y * 0.5) + 0.5) * cHeight;

              projected.push({
                ...hs,
                screenX: Math.round(x),
                screenY: Math.round(y),
                isVisible: true
              });
            }
          });
          setProjectedHotspots(projected);
        } else if (projectedHotspots.length > 0) {
          setProjectedHotspots([]);
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    // 6. Responsive Resize Handling with ResizeObserver
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);

    if (window.ResizeObserver) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          if (cr.width > 0 && cr.height > 0) {
            camera.aspect = cr.width / cr.height;
            camera.updateProjectionMatrix();
            renderer.setSize(cr.width, cr.height);
          }
        }
      });
      ro.observe(container);
      resizeObserverRef.current = ro;
    }

    // Force layout recalculation after mounting
    const tId = setTimeout(handleResize, 60);

    return () => {
      clearTimeout(tId);
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
      sphereGeo.dispose();
      mainMat.dispose();
      fadeMat.dispose();
    };
  }, [isOpen, loadPanoramaTexture]);

  // Scene Switching with Dual-Sphere Crossfade
  const switchScene = useCallback((sceneId) => {
    if (sceneId === currentSceneId || isTransitioning) return;
    const targetScene = getTourScene(sceneId);
    if (!targetScene) return;

    setIsTransitioning(true);
    setCurrentSceneId(sceneId);
    currentSceneRef.current = targetScene;

    // Smoothly turn camera towards initial direction of new scene
    targetLonRef.current = targetScene.initialYaw || 0;
    targetLatRef.current = targetScene.initialPitch || 0;
    targetFovRef.current = targetScene.initialFov || 75;

    // Load incoming texture and start fadeMesh
    loadPanoramaTexture(targetScene.panoramaUrl, targetScene.name).then((newTex) => {
      if (fadeMeshRef.current) {
        fadeMeshRef.current.material.map = newTex;
        fadeMeshRef.current.material.opacity = 0.0;
        fadeMeshRef.current.material.needsUpdate = true;
        fadeMeshRef.current.visible = true;
      } else {
        setIsTransitioning(false);
      }
    });
  }, [currentSceneId, isTransitioning, loadPanoramaTexture]);

  // Pointer & Touch Handlers
  const handlePointerDown = (e) => {
    isUserInteractingRef.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    onPointerDownPointerXRef.current = clientX;
    onPointerDownPointerYRef.current = clientY;
    onPointerDownLonRef.current = targetLonRef.current;
    onPointerDownLatRef.current = targetLatRef.current;
  };

  const handlePointerMove = (e) => {
    if (!isUserInteractingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    
    // Sensitivity factor adjusted by FOV
    const factor = (cameraRef.current ? cameraRef.current.fov / 75 : 1) * 0.18;
    targetLonRef.current = (onPointerDownPointerXRef.current - clientX) * factor + onPointerDownLonRef.current;
    targetLatRef.current = (clientY - onPointerDownPointerYRef.current) * factor + onPointerDownLatRef.current;
  };

  const handlePointerUp = () => {
    isUserInteractingRef.current = false;
  };

  // Zoom via Mouse Wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.05;
    targetFovRef.current = THREE.MathUtils.clamp(targetFovRef.current + zoomDelta, 35, 95);
  };

  const handleZoomIn = () => {
    targetFovRef.current = Math.max(35, targetFovRef.current - 12);
  };

  const handleZoomOut = () => {
    targetFovRef.current = Math.min(95, targetFovRef.current + 12);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!mountRef.current) return;
    const modalEl = mountRef.current.parentElement;
    if (!document.fullscreenElement) {
      if (modalEl?.requestFullscreen) {
        modalEl.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Share
  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?tour=${currentSceneId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('360° Panorama link copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  // Filter scenes for bottom drawer
  const scenesList = Object.values(HOTEL_360_SCENES);
  const filteredScenes = scenesList.filter(s => {
    if (activeFloorFilter === 'all') return true;
    return s.category === activeFloorFilter;
  });

  return (
    <div 
      className="tour-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#030712',
        color: '#ffffff',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={mountRef}
        className="tour-viewport"
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          height: '100%',
          minWidth: '100vw',
          minHeight: '100vh',
          cursor: 'grab',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
      />

      {/* Interactive 2D Screen-Projected 3D Hotspots */}
      <div 
        className="tour-hotspots-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 15
        }}
      >
        {projectedHotspots.map((hs) => (
          <div
            key={hs.id}
            style={{
              position: 'absolute',
              left: `${hs.screenX}px`,
              top: `${hs.screenY}px`,
              transform: 'translate(-50%, -50%)',
              opacity: isTransitioning ? 0 : 1,
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 16
            }}
            className="tour-hotspot-item group"
            onClick={(e) => {
              e.stopPropagation();
              if (hs.targetSceneId) switchScene(hs.targetSceneId);
            }}
            onMouseEnter={() => setHoveredHotspot(hs)}
            onMouseLeave={() => setHoveredHotspot(null)}
          >
            {/* Animated Pulsing Beacon Marker */}
            <div className="tour-hotspot-beacon">
              <span className="tour-hotspot-pulse-ring" />
              <span className="tour-hotspot-glow-ring" />
              <div className="tour-hotspot-disc">
                {hs.iconType === 'bed' ? (
                  <Bed size={16} color="#030712" />
                ) : hs.iconType === 'crown' ? (
                  <Sparkles size={16} color="#030712" />
                ) : hs.iconType === 'elevator' ? (
                  <Layers size={16} color="#030712" />
                ) : (
                  <ChevronRight size={18} color="#030712" strokeWidth={2.5} />
                )}
              </div>
            </div>

            {/* Tooltip Card */}
            <div className="tour-hotspot-tooltip">
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <MapPin size={10} /> {hs.tier || 'Interactive Viewpoint'}
              </span>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '3px 0 0 0', lineHeight: 1.3 }}>
                {hs.title}
              </p>
              {hs.tariff && (
                <p style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, margin: '4px 0 0 0' }}>
                  ₹{hs.tariff.toLocaleString('en-IN')} / night
                </p>
              )}
              {hs.description && (
                <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '4px 0 0 0', lineHeight: 1.25 }}>
                  {hs.description}
                </p>
              )}
              <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                Click to Step Inside <ChevronRight size={11} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Floating Glass Navigation Header */}
      <div 
        className="tour-header-glass"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 25,
          background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.92) 0%, rgba(3, 7, 18, 0.6) 65%, transparent 100%)'
        }}
      >
        {/* Left: Branding & Current Scene Info */}
        <div className="tour-header-left" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.18)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fde047',
                border: '1px solid rgba(245, 158, 11, 0.35)'
              }}>
                360° Virtual Tour
              </span>
              <span 
                ref={headingDisplayRef}
                style={{ fontSize: '11px', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Compass size={11} color="#38bdf8" /> 0° Heading
              </span>
            </div>
            <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              {currentScene.name}
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="tour-header-right" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Street View Standalone Link */}
          <a
            href="/hotel_360_viewer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="tour-btn"
            style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}
            title="Open Google Street View Single-Track Campus Walkthrough"
          >
            <MapPin size={13} />
            <span style={{ display: 'inline' }}>Street View</span>
          </a>

          {/* 3D Floor Explorer Companion Switch */}
          {onOpen3DExplorer && (
            <button
              onClick={() => {
                onClose();
                onOpen3DExplorer();
              }}
              className="tour-btn tour-btn-cyan"
              title="Switch to 3D Floor & Building Explorer"
            >
              <Layers size={13} />
              <span>3D Building</span>
            </button>
          )}

          {/* Book Room Button if Current Scene is a Room */}
          {currentScene.roomNumber && onBookRoom && (
            <button
              onClick={() => {
                onClose();
                onBookRoom(currentScene.tier, currentScene.roomNumber);
              }}
              className="tour-btn tour-btn-gold"
            >
              <CalendarCheck size={13} />
              <span>Book #{currentScene.roomNumber}</span>
            </button>
          )}

          {/* Gyroscope Toggle */}
          <button
            onClick={toggleGyroscope}
            className={`tour-btn ${gyroEnabled ? 'tour-btn-active' : ''}`}
            title="Toggle Device Gyroscope / Motion"
          >
            <Smartphone size={15} />
          </button>

          {/* Audio Ambience Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`tour-btn ${!isMuted ? 'tour-btn-active' : ''}`}
            title={isMuted ? 'Turn on Ambient Soundscape' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`tour-btn ${autoRotate ? 'tour-btn-active' : ''}`}
            title="Toggle Auto Rotation"
          >
            <RotateCw size={15} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '8s' }} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="tour-btn"
            title="Share Panorama Link"
          >
            <Share2 size={15} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="tour-btn"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="tour-btn tour-btn-close"
            title="Exit 360 Tour"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Right Floating Vertical Control Dock */}
      <div 
        className="tour-dock-right"
        style={{
          position: 'absolute',
          right: '18px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 25,
          pointerEvents: 'auto'
        }}
      >
        <button
          onClick={handleZoomIn}
          className="tour-dock-btn"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="tour-dock-btn"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '2px 0' }} />
        <button
          onClick={() => {
            targetLonRef.current = 0;
            targetLatRef.current = 0;
            targetFovRef.current = 75;
          }}
          className="tour-dock-btn"
          style={{ color: '#fbbf24' }}
          title="Reset Horizon View"
        >
          <Compass size={18} />
        </button>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div 
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(15, 23, 42, 0.94)',
            color: '#fbbf24',
            fontSize: '12px',
            fontWeight: 600,
            border: '1px solid rgba(245, 158, 11, 0.45)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(16px)',
            pointerEvents: 'none'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Transition Spinner Indicator */}
      {isTransitioning && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(3, 7, 18, 0.45)',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            padding: '14px 22px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <RotateCw size={24} color="#fbbf24" className="animate-spin" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Loading 360° Panorama...</span>
          </div>
        </div>
      )}

      {/* Bottom Scene Thumbnail Carousel & Category Filter Drawer */}
      <div 
        className={`tour-drawer-bottom ${drawerOpen ? '' : 'collapsed'}`}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 25,
          pointerEvents: 'auto',
          background: 'linear-gradient(0deg, rgba(3, 7, 18, 0.98) 0%, rgba(3, 7, 18, 0.88) 75%, transparent 100%)',
          padding: '20px 20px 14px',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(calc(100% - 38px))'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Drawer Handle & Floor Filters */}
          <div className="tour-filter-bar">
            {/* Category / Floor Filter Pills */}
            <div className="tour-pills-row">
              {HOTEL_360_FLOORS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFloorFilter(f.id)}
                  className={`tour-pill-btn ${activeFloorFilter === f.id ? 'active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Toggle Drawer Button */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="tour-btn"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              <span>{drawerOpen ? 'Hide Scenes' : 'Show Scenes'}</span>
            </button>
          </div>

          {/* Horizontal Scene Card Strip */}
          <div className="tour-scenes-carousel">
            {filteredScenes.map((scene) => {
              const isSelected = scene.id === currentSceneId;
              return (
                <div
                  key={scene.id}
                  onClick={() => switchScene(scene.id)}
                  className={`tour-scene-card ${isSelected ? 'selected' : ''}`}
                >
                  <img
                    src={scene.panoramaUrl}
                    alt={scene.name}
                    loading="lazy"
                  />
                  <div className="tour-scene-card-overlay">
                    <span className="tour-scene-card-name">
                      {scene.shortName || scene.name}
                    </span>
                    <span className="tour-scene-card-floor">
                      {scene.floor === 0 ? 'Campus' : scene.floor === 'R' ? 'Rooftop' : `Floor ${scene.floor}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualTour360Modal;
