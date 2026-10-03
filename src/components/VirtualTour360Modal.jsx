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
  const [currentSceneId, setCurrentSceneId] = useState(initialSceneId);
  const [activeFloorFilter, setActiveFloorFilter] = useState('all');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [headingDegrees, setHeadingDegrees] = useState(0);
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

  // Gyroscope tracking
  const gyroRef = useRef({ alpha: 0, beta: 0, gamma: 0, active: false });

  // Web Audio Context & Synthesizer
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef([]);

  const currentScene = getTourScene(currentSceneId);

  // Sync initialSceneId when modal opens
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
          if (document.exitFullscreen) document.exitFullscreen();
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
    setTimeout(() => setToastMessage(''), 2600);
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
    const width = container.clientWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera (inside the sphere at origin)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1100);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

    // 5. Render Loop with Hotspot 3D->2D Projection
    let crossFadeStartTime = 0;
    const crossFadeDuration = 700; // ms

    const animate = (timestamp) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Auto-rotation when idle
      if (autoRotate && !isUserInteractingRef.current && !gyroRef.current.active) {
        targetLonRef.current += 0.08;
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

      // Look direction vector
      const target = new THREE.Vector3(
        500 * Math.sin(phiRef.current) * Math.cos(thetaRef.current),
        500 * Math.cos(phiRef.current),
        500 * Math.sin(phiRef.current) * Math.sin(thetaRef.current)
      );
      camera.lookAt(target);

      // Update heading compass degrees
      const normalizedLon = ((lonRef.current % 360) + 360) % 360;
      setHeadingDegrees(Math.round(normalizedLon));

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
      const currentHotspots = currentScene.hotspots || [];
      if (currentHotspots.length > 0 && container) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;
        const projected = [];

        currentHotspots.forEach((hs) => {
          // Hotspot spherical coordinates (r=480)
          const hsPitch = hs.pitch || 0;
          const hsYaw = hs.yaw || 0;
          const hsPhi = THREE.MathUtils.degToRad(90 - hsPitch);
          const hsTheta = THREE.MathUtils.degToRad(hsYaw);

          // World coordinates
          const hsPos = new THREE.Vector3(
            -480 * Math.sin(hsPhi) * Math.sin(hsTheta),
            480 * Math.cos(hsPhi),
            -480 * Math.sin(hsPhi) * Math.cos(hsTheta)
          );

          // Project to Normalized Device Coordinates (-1 to +1)
          const pVec = hsPos.clone().project(camera);

          // Check if hotspot is in front of the camera (z < 1)
          if (pVec.z < 1) {
            const x = (pVec.x * 0.5 + 0.5) * cWidth;
            const y = (-(pVec.y * 0.5) + 0.5) * cHeight;
            projected.push({
              ...hs,
              screenX: x,
              screenY: y,
              isVisible: true
            });
          }
        });
        setProjectedHotspots(projected);
      } else {
        setProjectedHotspots([]);
      }

      renderer.render(scene, camera);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    // 6. Resize Observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
    
    // Sensitivity factor
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
    if (!document.fullscreenElement) {
      mountRef.current.parentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
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
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans"
      onPointerUp={handlePointerUp}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={mountRef}
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
      />

      {/* Interactive 2D Screen-Projected 3D Hotspots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {projectedHotspots.map((hs) => (
          <div
            key={hs.id}
            style={{
              transform: `translate3d(${hs.screenX}px, ${hs.screenY}px, 0) translate(-50%, -50%)`,
              opacity: isTransitioning ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
            className="absolute pointer-events-auto group cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (hs.targetSceneId) switchScene(hs.targetSceneId);
            }}
            onMouseEnter={() => setHoveredHotspot(hs)}
            onMouseLeave={() => setHoveredHotspot(null)}
          >
            {/* Animated Pulsing Beacon Marker */}
            <div className="relative flex items-center justify-center">
              <span className="absolute w-12 h-12 rounded-full bg-cyan-400/25 animate-ping" />
              <span className="absolute w-8 h-8 rounded-full bg-amber-400/35 animate-pulse" />
              <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/50 border border-white/60 transition-transform duration-200 group-hover:scale-125">
                {hs.iconType === 'bed' ? (
                  <Bed size={16} className="text-slate-900" />
                ) : hs.iconType === 'crown' ? (
                  <Sparkles size={16} className="text-slate-900" />
                ) : hs.iconType === 'elevator' ? (
                  <Layers size={16} className="text-slate-900" />
                ) : (
                  <ChevronRight size={18} className="text-slate-950 font-bold" />
                )}
              </div>
            </div>

            {/* Tooltip Card */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:flex flex-col items-center pointer-events-none w-56 transition-all duration-200">
              <div className="bg-slate-900/95 backdrop-blur-md border border-amber-400/40 rounded-xl p-3 shadow-2xl text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1">
                  <MapPin size={10} /> {hs.tier || 'Interactive Point'}
                </span>
                <p className="text-sm font-bold text-white mt-0.5 leading-snug">{hs.title}</p>
                {hs.tariff && (
                  <p className="text-xs text-emerald-400 font-semibold mt-1">₹{hs.tariff.toLocaleString('en-IN')} / night</p>
                )}
                {hs.description && (
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-tight">{hs.description}</p>
                )}
                <span className="text-[10px] text-cyan-300 font-medium mt-1.5 flex items-center justify-center gap-1">
                  Click to Explore <ChevronRight size={11} />
                </span>
              </div>
              <div className="w-2.5 h-2.5 bg-slate-900/95 border-r border-b border-amber-400/40 rotate-45 -mt-1.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Top Floating Glass Navigation Header */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between pointer-events-none z-20 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent">
        {/* Left: Branding & Current Scene Info */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md flex items-center justify-center text-amber-400 shadow-lg">
            <Building2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                360° Virtual Tour
              </span>
              <span className="text-[11px] text-slate-300 hidden sm:inline flex items-center gap-1">
                <Compass size={11} className="text-cyan-400" /> {headingDegrees}° Heading
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow-md">
              {currentScene.name}
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Street View Standalone Link */}
          <a
            href="/hotel_360_viewer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md transition-all shadow-lg"
            title="Open Google Street View Single-Track Campus Walkthrough"
          >
            <MapPin size={13} />
            <span>Street View</span>
          </a>

          {/* 3D Floor Explorer Companion Switch */}
          {onOpen3DExplorer && (
            <button
              onClick={() => {
                onClose();
                onOpen3DExplorer();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 border border-cyan-300/40 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-lg shadow-cyan-500/20"
              title="Switch to 3D Floor & Building Explorer"
            >
              <Layers size={13} />
              <span className="hidden sm:inline">3D Building</span>
            </button>
          )}

          {/* Book Room Button if Current Scene is a Room */}
          {currentScene.roomNumber && onBookRoom && (
            <button
              onClick={() => {
                onClose();
                onBookRoom(currentScene.tier, currentScene.roomNumber);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/30"
            >
              <CalendarCheck size={13} />
              <span>Book #{currentScene.roomNumber}</span>
            </button>
          )}

          {/* Gyroscope Toggle */}
          <button
            onClick={toggleGyroscope}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
              gyroEnabled 
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/40 shadow-lg' 
                : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
            }`}
            title="Toggle Device Gyroscope / Motion"
          >
            <Smartphone size={16} />
          </button>

          {/* Audio Ambience Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
              !isMuted 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
            }`}
            title={isMuted ? 'Turn on Ambient Soundscape' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
              autoRotate 
                ? 'bg-blue-500/20 text-cyan-300 border-cyan-400/40' 
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw size={16} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '8s' }} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800 backdrop-blur-md transition-all"
            title="Share Panorama Link"
          >
            <Share2 size={16} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:block p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800 backdrop-blur-md transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/40 backdrop-blur-md transition-all ml-1"
            title="Exit 360 Tour"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Right Floating Vertical Control Dock */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md shadow-lg transition-transform active:scale-95"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md shadow-lg transition-transform active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <div className="w-full h-px bg-white/10 my-1" />
        <button
          onClick={() => {
            targetLonRef.current = 0;
            targetLatRef.current = 0;
            targetFovRef.current = 75;
          }}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-amber-400/30 backdrop-blur-md shadow-lg transition-transform active:scale-95"
          title="Reset Horizon View"
        >
          <Compass size={18} />
        </button>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-slate-900/90 text-amber-300 text-xs font-semibold border border-amber-400/40 shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Transition Spinner Indicator */}
      {isTransitioning && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center bg-slate-950/30 backdrop-blur-[2px] transition-opacity duration-300">
          <div className="flex flex-col items-center gap-2 bg-slate-900/90 border border-amber-400/40 px-5 py-3 rounded-2xl shadow-2xl">
            <RotateCw size={24} className="text-amber-400 animate-spin" />
            <span className="text-xs font-semibold text-white">Loading 360° Panorama...</span>
          </div>
        </div>
      )}

      {/* Bottom Scene Thumbnail Carousel & Category Filter Drawer */}
      <div className={`absolute bottom-0 inset-x-0 z-20 transition-all duration-300 pointer-events-auto bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent pt-6 pb-4 px-4 ${drawerOpen ? 'translate-y-0' : 'translate-y-28'}`}>
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          {/* Drawer Handle & Floor Filters */}
          <div className="flex items-center justify-between">
            {/* Category / Floor Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {HOTEL_360_FLOORS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFloorFilter(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeFloorFilter === f.id
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Toggle Drawer Button */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs border border-white/10 flex items-center gap-1 ml-2"
            >
              <span>{drawerOpen ? 'Hide Scenes' : 'Show Scenes'}</span>
            </button>
          </div>

          {/* Horizontal Scene Card Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {filteredScenes.map((scene) => {
              const isSelected = scene.id === currentSceneId;
              return (
                <div
                  key={scene.id}
                  onClick={() => switchScene(scene.id)}
                  className={`group relative flex-shrink-0 w-36 h-20 rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-xl shadow-amber-500/20'
                      : 'border-white/15 hover:border-cyan-400/60 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={scene.panoramaUrl}
                    alt={scene.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-2">
                    <span className="text-[11px] font-bold text-white line-clamp-1 leading-tight group-hover:text-amber-300">
                      {scene.shortName || scene.name}
                    </span>
                    <span className="text-[9px] text-slate-300 uppercase tracking-wider">
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
