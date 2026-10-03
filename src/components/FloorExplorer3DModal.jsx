import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  X, RotateCw, ZoomIn, ZoomOut, Layers, Eye, 
  Sparkles, Check, MapPin, Building2, Sliders, CalendarCheck
} from 'lucide-react';
import { ROOM_TIERS } from '../data/hotelData';

export default function FloorExplorer3DModal({ isOpen, onClose, rooms = [], onBookRoom, onOpen360Tour }) {
  const mountRef = useRef(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeFloorView, setActiveFloorView] = useState('all'); // 'all', 1, 2, 3, 4
  const [hoveredRoomNum, setHoveredRoomNum] = useState(null);

  // References for Three.js scene
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const roomMeshesRef = useRef([]);
  const animationFrameIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060e1a);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 18, 26);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const goldLight = new THREE.DirectionalLight(0xf3c64c, 1.2);
    goldLight.position.set(20, 30, 20);
    scene.add(goldLight);

    const sapphireLight = new THREE.PointLight(0x38bdf8, 1.5, 50);
    sapphireLight.position.set(-15, 10, -10);
    scene.add(sapphireLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 20, 0xd4af37, 0x13223d);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // 5. Build 4 Floors with 10 rooms each
    roomMeshesRef.current = [];
    const floorHeights = [1, 4.5, 8, 11.5]; // Elevations for Floor 1, 2, 3, 4

    const statusColors = {
      'Available': 0x10b981,
      'Occupied': 0xef4444,
      'Cleaning': 0xf59e0b,
      'Maintenance': 0x6b7280,
      'VIP Hold': 0x8b5cf6
    };

    [1, 2, 3, 4].forEach((floorNum, fIdx) => {
      const yPos = floorHeights[fIdx];

      // Floor Concrete Slab
      const slabGeo = new THREE.BoxGeometry(18, 0.3, 12);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x0c182b,
        roughness: 0.6,
        metalness: 0.2,
        transparent: true,
        opacity: 0.95
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0, yPos - 0.2, 0);
      slab.userData = { isFloorSlab: true, floorNum };
      scene.add(slab);

      // Floor Corridor Glow Strip
      const corridorGeo = new THREE.BoxGeometry(16, 0.05, 1.8);
      const corridorMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8 });
      const corridor = new THREE.Mesh(corridorGeo, corridorMat);
      corridor.position.set(0, yPos - 0.03, 0);
      corridor.userData = { isFloorSlab: true, floorNum };
      scene.add(corridor);

      // 10 Rooms per floor (5 North side, 5 South side along corridor)
      for (let i = 0; i < 10; i++) {
        const roomNum = `${floorNum}${String(i + 1).padStart(2, '0')}`;
        const roomData = rooms.find(r => r.roomNumber === roomNum) || {
          roomNumber: roomNum,
          floor: floorNum,
          status: 'Available',
          tariff: floorNum === 1 ? 1699 : floorNum === 2 ? 2199 : floorNum === 3 ? 2899 : 3999
        };

        const isNorth = i < 5;
        const xOffset = (i % 5) * 3.2 - 6.4;
        const zOffset = isNorth ? -3.4 : 3.4;

        // Room Mesh
        const roomGeo = new THREE.BoxGeometry(2.6, 1.8, 2.6);
        const col = statusColors[roomData.status] || 0x10b981;
        const roomMat = new THREE.MeshStandardMaterial({
          color: col,
          roughness: 0.3,
          metalness: 0.4,
          transparent: true,
          opacity: 0.88
        });

        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        roomMesh.position.set(xOffset, yPos + 0.9, zOffset);
        roomMesh.userData = { roomData, floorNum };
        scene.add(roomMesh);
        roomMeshesRef.current.push(roomMesh);
      }
    });

    // 6. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Rotate camera if dragging
      if (isDraggingRef.current) {
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;

        const rotSpeed = 0.005;
        camera.position.x = camera.position.x * Math.cos(deltaX * rotSpeed) - camera.position.z * Math.sin(deltaX * rotSpeed);
        camera.position.z = camera.position.x * Math.sin(deltaX * rotSpeed) + camera.position.z * Math.cos(deltaX * rotSpeed);
        camera.position.y = Math.max(2, Math.min(30, camera.position.y + deltaY * 0.05));
        camera.lookAt(0, 4, 0);

        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      }

      // Check hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roomMeshesRef.current);
      if (intersects.length > 0) {
        const hovered = intersects[0].object.userData.roomData;
        setHoveredRoomNum(hovered.roomNumber);
      } else {
        setHoveredRoomNum(null);
      }
    };

    const handlePointerUp = (e) => {
      isDraggingRef.current = false;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roomMeshesRef.current);
      if (intersects.length > 0) {
        setSelectedRoom(intersects[0].object.userData.roomData);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    dom.addEventListener('pointermove', handlePointerMove);
    dom.addEventListener('pointerup', handlePointerUp);

    // 7. Animation Loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Slow elegant ambient rotation when not dragging
      if (!isDraggingRef.current) {
        const angle = 0.001;
        camera.position.x = camera.position.x * Math.cos(angle) - camera.position.z * Math.sin(angle);
        camera.position.z = camera.position.x * Math.sin(angle) + camera.position.z * Math.cos(angle);
        camera.lookAt(0, 4, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (dom) {
        dom.removeEventListener('pointerdown', handlePointerDown);
        dom.removeEventListener('pointermove', handlePointerMove);
        dom.removeEventListener('pointerup', handlePointerUp);
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
    };
  }, [isOpen, rooms]);

  // Floor Isolation Filter
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.traverse((child) => {
      if (child.userData && child.userData.floorNum) {
        if (activeFloorView === 'all' || child.userData.floorNum === Number(activeFloorView)) {
          child.visible = true;
        } else {
          child.visible = false;
        }
      }
    });
  }, [activeFloorView]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-content-large" style={{ display: 'flex', flexDirection: 'column', height: '88vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(29, 78, 216, 0.25)',
              border: '1px solid #38bdf8',
              padding: '0.4rem',
              borderRadius: '8px'
            }}>
              <Layers size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>3D Architectural Floor Navigator</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Sri Sai Vasudev Residency • 18 Rooms across Ground &amp; 1st Floors
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Floor Isolators */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(6, 14, 26, 0.6)', padding: '0.25rem', borderRadius: '8px' }}>
              <button 
                onClick={() => setActiveFloorView('all')}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: activeFloorView === 'all' ? 'var(--gold-glow)' : 'transparent',
                  color: activeFloorView === 'all' ? '#060e1a' : '#fff'
                }}
              >
                All Floors
              </button>
              {[1, 2].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFloorView(f)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: activeFloorView === f ? 'var(--sapphire-light)' : 'transparent',
                    color: activeFloorView === f ? '#060e1a' : '#fff'
                  }}
                >
                  {f === 1 ? 'Ground Floor (101-107)' : '1st Floor (201-211)'}
                </button>
              ))}
            </div>

            {onOpen360Tour && (
              <button 
                onClick={() => {
                  onClose();
                  onOpen360Tour(selectedRoom ? `room-${selectedRoom.roomNumber}` : 'grand-lobby');
                }}
                className="btn-outline-gold"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: '#38bdf8',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)'
                }}
                title="Launch Immersive 360° Virtual Tour"
              >
                <Eye size={14} /> 360° Tour
              </button>
            )}

            <button onClick={onClose} className="modal-close-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 3D Canvas Viewport + Sidebar Inspector */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
          {/* Main 3D Canvas */}
          <div 
            ref={mountRef} 
            style={{ 
              flex: 1, 
              height: '100%', 
              cursor: 'grab', 
              background: '#060e1a',
              position: 'relative'
            }}
          >
            {/* Status Indicator Overlay */}
            <div style={{
              position: 'absolute',
              top: 14,
              left: 14,
              background: 'rgba(6, 14, 26, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              pointerEvents: 'none'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--gold-glow)' }}>3D Room Status Legend:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#10b981' }}></span> Available
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#ef4444' }}></span> Occupied
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#f59e0b' }}></span> Cleaning
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#8b5cf6' }}></span> VIP Hold
              </div>
            </div>

            {/* Hover Tooltip */}
            {hoveredRoomNum && (
              <div style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                background: 'rgba(12, 24, 43, 0.95)',
                border: '1px solid var(--gold-champagne)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#fff',
                pointerEvents: 'none'
              }}>
                Key: <strong>Room {hoveredRoomNum}</strong> • Click to Inspect
              </div>
            )}
          </div>

          {/* Room Inspector Panel */}
          {selectedRoom ? (
            <div style={{
              width: 340,
              background: 'rgba(12, 24, 43, 0.95)',
              borderLeft: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', fontWeight: 600 }}>
                    FLOOR {selectedRoom.floor}
                  </span>
                  <h3 style={{ fontSize: '1.6rem' }}>Room {selectedRoom.roomNumber}</h3>
                </div>
                <span className={`badge-status badge-${(selectedRoom.status || 'available').toLowerCase().replace(' ', '-')}`}>
                  {selectedRoom.status || 'Available'}
                </span>
              </div>

              <div style={{ fontSize: '0.95rem', color: 'var(--sapphire-light)', fontWeight: 600, marginBottom: '0.5rem' }}>
                {selectedRoom.tier || (selectedRoom.floor === 1 ? 'Standard Deluxe' : selectedRoom.floor === 2 ? 'Deluxe Room' : selectedRoom.floor === 3 ? 'Executive Room' : 'Premium Suite')}
              </div>

              <div style={{
                background: 'rgba(6, 14, 26, 0.6)',
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Tariff:</span>
                  <span style={{ fontWeight: 600 }}>₹{selectedRoom.tariff || 1699}/night</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rule 46 GST:</span>
                  <span style={{ fontWeight: 600 }}>5% (CGST 2.5% + SGST 2.5%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SAC Code:</span>
                  <span style={{ fontWeight: 600 }}>996311</span>
                </div>
              </div>

              {selectedRoom.currentGuestName && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ color: '#f87171', fontWeight: 600 }}>Occupied By:</div>
                  <div style={{ color: '#fff' }}>{selectedRoom.currentGuestName}</div>
                </div>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedRoom.status === 'Available' ? (
                  <button 
                    onClick={() => {
                      const tier = ROOM_TIERS.find(t => t.floor === selectedRoom.floor) || ROOM_TIERS[0];
                      onBookRoom(tier, selectedRoom.roomNumber);
                      onClose();
                    }}
                    className="btn-primary-gold"
                    style={{ justifyContent: 'center' }}
                  >
                    <CalendarCheck size={16} /> Book Room {selectedRoom.roomNumber}
                  </button>
                ) : (
                  <div style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Currently unavailable for online instant reservation.
                  </div>
                )}
                {onOpen360Tour && (
                  <button 
                    onClick={() => {
                      onOpen360Tour(`room-${selectedRoom.roomNumber}`);
                      onClose();
                    }}
                    className="btn-outline-gold"
                    style={{ 
                      justifyContent: 'center', 
                      fontSize: '0.85rem',
                      borderColor: '#38bdf8',
                      color: '#38bdf8',
                      background: 'rgba(56, 189, 248, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Eye size={16} /> View 360° Panorama
                  </button>
                )}
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="btn-outline-gold"
                  style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              width: 320,
              background: 'rgba(12, 24, 43, 0.8)',
              borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Eye size={36} color="var(--gold-champagne)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Select Any 3D Key</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                Click on any room block in the 3D model to inspect real-time occupancy, floor position, amenities, and trigger direct booking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
