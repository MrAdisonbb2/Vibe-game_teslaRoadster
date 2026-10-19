import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createRoadsterModel, RoadsterParts } from './simulation/RoadsterModel';
import { createCityEnvironment, CityEnvironmentObjects } from './simulation/CityEnvironment';
import { PhysicsEngine, FlightInputState } from './simulation/PhysicsEngine';
import { CameraRig } from './simulation/CameraRig';
import { TelemetryHUD } from './components/TelemetryHUD';
import { BottomControlDock } from './components/BottomControlDock';
import { ImpactReportModal } from './components/ImpactReportModal';
import { MobileFlightControls } from './components/MobileFlightControls';
import { QuickCameraToolbar } from './components/QuickCameraToolbar';
import { CameraMode, FlightMode, TelemetryData, ImpactReportData } from './simulation/types';
import { soundEngine } from './simulation/AudioEngine';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Flight simulation state
  const [flightMode, setFlightMode] = useState<FlightMode>('autoCrash');
  const [targetTower, setTargetTower] = useState<'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire'>('Tower A (North)');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [thrusterMultiplier, setThrusterMultiplier] = useState<number>(1.0);
  const [bodyColor, setBodyColor] = useState<string>('#f3f4f6');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);

  // Impact report modal state
  const [impactReport, setImpactReport] = useState<ImpactReportData | null>(null);

  // Live telemetry state for UI HUD
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speedKmh: 0,
    speedMach: 0,
    altitudeM: 1,
    thrustPercent: 0,
    gForce: 1.0,
    distanceToTower: 450,
    headingDeg: 180,
    pitchDeg: 0,
    rollDeg: 0,
    status: 'landed',
    impactData: null,
  });

  // Manual Flight Keyboard / Touch Inputs
  const [inputState, setInputState] = useState<FlightInputState>({
    pitchUp: false,
    pitchDown: false,
    rollLeft: false,
    rollRight: false,
    yawLeft: false,
    yawRight: false,
    throttleUp: false,
    throttleDown: false,
    boost: false,
    vtol: false,
  });

  // Simulation references (stable across renders)
  const physicsRef = useRef<PhysicsEngine>(new PhysicsEngine());
  const roadsterRef = useRef<RoadsterParts | null>(null);
  const cityRef = useRef<CityEnvironmentObjects | null>(null);
  const cameraRigRef = useRef<CameraRig | null>(null);
  const inputRef = useRef<FlightInputState>(inputState);
  const timeScaleRef = useRef<number>(timeScale);
  const flightModeRef = useRef<FlightMode>(flightMode);
  const targetTowerRef = useRef<'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire'>(targetTower);

  // Synchronize refs
  inputRef.current = inputState;
  timeScaleRef.current = isSlowMo ? 0.2 : timeScale;
  flightModeRef.current = flightMode;
  targetTowerRef.current = targetTower;

  // Launch Auto Crash Test Action
  const handleLaunchAutoCrash = useCallback(() => {
    if (physicsRef.current && cityRef.current) {
      soundEngine.initThrusterSound();
      cityRef.current.resetTower();
      physicsRef.current.launchAutoCrash(targetTowerRef.current);
      setFlightMode('autoCrash');
      setImpactReport(null);
      setIsSlowMo(false);
    }
  }, []);

  // Reset Simulation
  const handleReset = useCallback(() => {
    if (physicsRef.current && cityRef.current) {
      physicsRef.current.reset(false);
      cityRef.current.resetTower();
      setImpactReport(null);
      setIsSlowMo(false);
    }
  }, []);

  // Update Body Color
  const handleSetBodyColor = (color: string) => {
    setBodyColor(color);
    if (roadsterRef.current) {
      roadsterRef.current.setBodyColor(color);
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setInputState((s) => ({ ...s, pitchDown: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setInputState((s) => ({ ...s, pitchUp: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setInputState((s) => ({ ...s, rollLeft: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setInputState((s) => ({ ...s, rollRight: true }));
          break;
        case 'KeyQ':
          setInputState((s) => ({ ...s, yawLeft: true }));
          break;
        case 'KeyE':
          setInputState((s) => ({ ...s, yawRight: true }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setInputState((s) => ({ ...s, boost: true }));
          break;
        case 'Space':
          setInputState((s) => ({ ...s, vtol: true }));
          break;
        case 'KeyR':
          handleLaunchAutoCrash();
          break;
        case 'KeyC':
          setCameraMode((prev) => (prev === 'freeOrbit' ? 'chase' : 'freeOrbit'));
          break;
        case 'Digit1':
          setCameraMode('chase');
          break;
        case 'Digit2':
          setCameraMode('cockpit');
          break;
        case 'Digit3':
          setCameraMode('tower');
          break;
        case 'Digit4':
          setCameraMode('drone');
          break;
        case 'Digit5':
          setCameraMode('freeOrbit');
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setInputState((s) => ({ ...s, pitchDown: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setInputState((s) => ({ ...s, pitchUp: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setInputState((s) => ({ ...s, rollLeft: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setInputState((s) => ({ ...s, rollRight: false }));
          break;
        case 'KeyQ':
          setInputState((s) => ({ ...s, yawLeft: false }));
          break;
        case 'KeyE':
          setInputState((s) => ({ ...s, yawRight: false }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setInputState((s) => ({ ...s, boost: false }));
          break;
        case 'Space':
          setInputState((s) => ({ ...s, vtol: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleLaunchAutoCrash]);

  // Three.js Mount & Animation Loop Lifecycle
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // Deep night sky
    scene.fog = new THREE.FogExp2(0x030712, 0.00075);

    // 2. Camera Rig
    const cameraRig = new CameraRig(width, height);
    cameraRigRef.current = cameraRig;

    // 3. Renderer configuration
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: !isHeadless, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Lighting (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Setup: Warm/Cool contrast + Directional Key Light
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(120, 300, 200);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 1000;
    const d = 350;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const towerSpotLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    towerSpotLight.position.set(-150, 250, -200);
    scene.add(towerSpotLight);

    // 6. City Environment & Twin Towers
    const city = createCityEnvironment();
    cityRef.current = city;
    scene.add(city.group);

    // 7. Tesla Roadster Model
    const roadster = createRoadsterModel();
    roadsterRef.current = roadster;
    scene.add(roadster.group);

    // 8. Trajectory visualization line (predictive flight path)
    const trajGeom = new THREE.BufferGeometry();
    const trajPositions = new Float32Array(35 * 3);
    trajGeom.setAttribute('position', new THREE.BufferAttribute(trajPositions, 3));
    const trajMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 3,
      gapSize: 2,
      transparent: true,
      opacity: 0.6,
    });
    const trajectoryLine = new THREE.Line(trajGeom, trajMat);
    scene.add(trajectoryLine);

    // Pre-compile shaders
    renderer.compile(scene, cameraRig.camera);

    // Collision Impact Callback
    const onImpact = (hitPoint: THREE.Vector3, hitVelocity: THREE.Vector3) => {
      city.triggerTowerDebris(hitPoint, hitVelocity);
      cameraRig.triggerImpactShake(2.6);
      setIsSlowMo(true);
      const report = physicsRef.current.impactData;
      if (report) {
        setImpactReport(report);
      }
    };

    // --- Interactive Mouse & Touch Dragging for 360 Camera Orbit ---
    let isPointerDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let initialPinchDist = 0;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore if clicking on interactive UI elements
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input') || target.closest('.pointer-events-auto')) {
        return;
      }
      isPointerDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDragging) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;

      const sensitivity = 0.0065;
      cameraRig.rotateOrbit(-dx * sensitivity, dy * sensitivity);
    };

    const handlePointerUp = () => {
      isPointerDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      cameraRig.zoomOrbit(e.deltaY * 0.035);
    };

    // Touch pinch to zoom support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const distDelta = initialPinchDist - currentDist;
        cameraRig.zoomOrbit(distDelta * 0.08);
        initialPinchDist = currentDist;
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 9. Animation Game Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;
    let telemetryUpdateTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const rawDelta = clock.getDelta();
      const delta = Math.min(rawDelta, 0.05) * timeScaleRef.current;

      const physics = physicsRef.current;
      physics.flightMode = flightModeRef.current;
      physics.targetTower = targetTowerRef.current;

      // Update vehicle physics
      const telem = physics.update(delta, inputRef.current, onImpact);

      // Synchronize 3D Roadster model with physics position & rotation
      roadster.group.position.copy(physics.position);
      roadster.group.rotation.copy(physics.rotation);

      // Animate thruster particles, Mach cones, smoke plumes
      roadster.updateThrusters(physics.throttlePercent, physics.isBoosting, physics.isVTOL, delta);

      // Update City environment
      city.updateEnvironment(delta);

      // Check stunt rings passage
      city.stuntRings.forEach(({ mesh, ring }) => {
        if (!ring.passed) {
          const rPos = new THREE.Vector3(...ring.position);
          if (physics.position.distanceTo(rPos) < ring.radius) {
            ring.passed = true;
            (mesh.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: 0x10b981 });
            soundEngine.playRingPass();
          }
        }
      });

      // Update Camera Rig
      cameraRig.mode = cameraMode;
      cameraRig.update(delta, physics.position, physics.rotation, physics.velocity, physics.status === 'crashed');

      // Update Trajectory Visualizer line
      if (physics.flightMode === 'autoCrash' && physics.status === 'flying') {
        trajectoryLine.visible = true;
        const posAttr = trajGeom.getAttribute('position') as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const pts = physics.trajectoryPoints;
        for (let i = 0; i < 35; i++) {
          if (i < pts.length) {
            arr[i * 3] = pts[i].x;
            arr[i * 3 + 1] = pts[i].y;
            arr[i * 3 + 2] = pts[i].z;
          } else if (pts.length > 0) {
            arr[i * 3] = pts[pts.length - 1].x;
            arr[i * 3 + 1] = pts[pts.length - 1].y;
            arr[i * 3 + 2] = pts[pts.length - 1].z;
          }
        }
        posAttr.needsUpdate = true;
      } else {
        trajectoryLine.visible = false;
      }

      // Render Scene
      renderer.render(scene, cameraRig.camera);

      // Throttled UI Telemetry update (15 fps)
      telemetryUpdateTimer += rawDelta;
      if (telemetryUpdateTimer > 0.065) {
        telemetryUpdateTimer = 0;
        setTelemetry(telem);
      }
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRig.handleResize(w, h);
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [cameraMode]);

  // Thrust multiplier sync
  useEffect(() => {
    if (physicsRef.current) {
      physicsRef.current.thrustNewtons = 65000 * thrusterMultiplier;
    }
  }, [thrusterMultiplier]);

  // Audio mute sync
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Quick Camera Actions
  const handleRotateCamera = (deltaTheta: number, deltaPhi: number) => {
    cameraRigRef.current?.rotateOrbit(deltaTheta, deltaPhi);
  };

  const handleZoomCamera = (deltaRadius: number) => {
    cameraRigRef.current?.zoomOrbit(deltaRadius);
  };

  const handleSetCameraPreset = (preset: 'rear' | 'side' | 'front' | 'top' | 'low') => {
    cameraRigRef.current?.setPresetView(preset);
    setCameraMode('freeOrbit');
  };

  const handleResetCamera = () => {
    cameraRigRef.current?.resetOrbitOffset();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none cursor-grab active:cursor-grabbing">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Head-Up Display (HUD) Telemetry & Crosshair */}
      <TelemetryHUD telemetry={telemetry} flightMode={flightMode} targetTower={targetTower} />

      {/* Floating 360 Quick Camera Rotation Toolbar */}
      <QuickCameraToolbar
        cameraMode={cameraMode}
        onSetCameraMode={setCameraMode}
        onRotateCamera={handleRotateCamera}
        onZoomCamera={handleZoomCamera}
        onSetPreset={handleSetCameraPreset}
        onResetCamera={handleResetCamera}
      />

      {/* Impact Report Analysis Modal (shows upon crash) */}
      <ImpactReportModal
        data={impactReport}
        onRelaunch={handleLaunchAutoCrash}
        onDismiss={() => setImpactReport(null)}
        onToggleSlowMo={() => setIsSlowMo(!isSlowMo)}
        isSlowMo={isSlowMo}
      />

      {/* On-Screen Mobile/Touch Flight Controls */}
      <MobileFlightControls
        inputState={inputState}
        setInputState={setInputState}
        flightMode={flightMode}
      />

      {/* Collapsible Ergonomic Bottom Control Dock */}
      <BottomControlDock
        flightMode={flightMode}
        onSetFlightMode={(mode) => {
          setFlightMode(mode);
          physicsRef.current.flightMode = mode;
        }}
        targetTower={targetTower}
        onSetTargetTower={setTargetTower}
        cameraMode={cameraMode}
        onSetCameraMode={setCameraMode}
        onLaunchAutoCrash={handleLaunchAutoCrash}
        onReset={handleReset}
        timeScale={timeScale}
        onSetTimeScale={setTimeScale}
        bodyColor={bodyColor}
        onSetBodyColor={handleSetBodyColor}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        thrusterMultiplier={thrusterMultiplier}
        onSetThrusterMultiplier={setThrusterMultiplier}
      />
    </div>
  );
}
