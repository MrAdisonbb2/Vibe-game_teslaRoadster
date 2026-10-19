import * as THREE from 'three';

export interface RoadsterParts {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  wingMesh: THREE.Mesh;
  wingStruts: THREE.Group;
  canopyMesh: THREE.Mesh;
  wheels: THREE.Group[];
  thrusterNozzles: THREE.Mesh[];
  exhaustFlames: THREE.Mesh[];
  exhaustLights: THREE.PointLight[];
  downwardFlames: THREE.Mesh[];
  smokeParticles: THREE.Points;
  taillightMesh: THREE.Mesh;
  headlightMesh: THREE.Mesh;
  updateThrusters: (thrust: number, isBoosting: boolean, isVTOL: boolean, delta: number) => void;
  setBodyColor: (colorHex: string) => void;
  setWingAngle: (deg: number) => void;
}

export function createRoadsterModel(): RoadsterParts {
  const group = new THREE.Group();
  group.name = 'TeslaRoadster_SpaceX';

  // 1. Primary Chassis & Bodywork
  // Sleek low supercar proportions: length ~4.4m, width ~1.95m, height ~1.2m
  // Base body shape using sculpted multi-part hierarchy
  const bodyGroup = new THREE.Group();
  
  // High-grade automotive paint material
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf3f4f6, // Pearl Silver / White as in the user photo
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.9,
  });

  const carbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    metalness: 0.6,
    roughness: 0.45,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.95,
    roughness: 0.1,
  });

  // Main hull shape
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-2.2, 0.2);
  hullShape.lineTo(-1.8, 0.15);
  hullShape.lineTo(1.8, 0.15);
  hullShape.lineTo(2.2, 0.35); // Rear lip
  hullShape.lineTo(2.0, 0.7); // Rear deck
  hullShape.lineTo(0.6, 0.85); // Cabin rear
  hullShape.lineTo(-0.6, 0.85); // Windshield top
  hullShape.lineTo(-1.6, 0.45); // Hood
  hullShape.lineTo(-2.2, 0.2); // Front nose

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 2,
    depth: 1.8,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 4,
  };

  const bodyGeom = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
  bodyGeom.center();
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMaterial);
  bodyMesh.position.y = 0.55;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyGroup.add(bodyMesh);

  // Front splitter & Aerodynamic lower skirt (Carbon fiber)
  const splitterGeom = new THREE.BoxGeometry(4.3, 0.08, 1.9);
  const splitterMesh = new THREE.Mesh(splitterGeom, carbonMaterial);
  splitterMesh.position.set(0, 0.22, 0);
  splitterMesh.castShadow = true;
  bodyGroup.add(splitterMesh);

  // Rear Diffuser with aerodynamic strakes
  const diffuserGeom = new THREE.BoxGeometry(0.8, 0.3, 1.85);
  const diffuserMesh = new THREE.Mesh(diffuserGeom, carbonMaterial);
  diffuserMesh.position.set(1.9, 0.3, 0);
  diffuserMesh.castShadow = true;
  bodyGroup.add(diffuserMesh);

  // 2. Secondary Read: Glass Panoramic Cockpit Canopy
  const canopyGeom = new THREE.SphereGeometry(1.2, 16, 16);
  canopyGeom.scale(1.4, 0.5, 0.75);
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x05070a,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    thickness: 0.8,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const canopyMesh = new THREE.Mesh(canopyGeom, glassMaterial);
  canopyMesh.position.set(-0.05, 0.9, 0);
  canopyMesh.castShadow = true;
  bodyGroup.add(canopyMesh);

  // 3. Iconic Active Carbon Aero Wing (as in user reference photo)
  const wingGroup = new THREE.Group();
  const wingGeom = new THREE.BoxGeometry(0.55, 0.06, 1.8);
  const wingMesh = new THREE.Mesh(wingGeom, carbonMaterial);
  wingMesh.position.set(0, 0, 0);
  wingMesh.castShadow = true;

  // Wing endplates (vertical stabilizers)
  const endplateGeom = new THREE.BoxGeometry(0.65, 0.25, 0.04);
  const leftEndplate = new THREE.Mesh(endplateGeom, carbonMaterial);
  leftEndplate.position.set(0, 0.06, 0.9);
  const rightEndplate = leftEndplate.clone();
  rightEndplate.position.set(0, 0.06, -0.9);

  // Wing struts
  const strutGeom = new THREE.CylinderGeometry(0.025, 0.035, 0.45, 8);
  const leftStrut = new THREE.Mesh(strutGeom, carbonMaterial);
  leftStrut.position.set(0, -0.22, 0.45);
  leftStrut.rotation.z = 0.2;
  const rightStrut = leftStrut.clone();
  rightStrut.position.set(0, -0.22, -0.45);

  const wingStruts = new THREE.Group();
  wingStruts.add(leftStrut, rightStrut);

  wingGroup.add(wingMesh, leftEndplate, rightEndplate, wingStruts);
  wingGroup.position.set(1.75, 1.25, 0);
  bodyGroup.add(wingGroup);

  // 4. SpaceX Cold Gas Rocket Thruster Package
  // In the reference image: Quad exhaust nozzles at the rear below the active spoiler
  const thrusterNozzles: THREE.Mesh[] = [];
  const exhaustFlames: THREE.Mesh[] = [];
  const exhaustLights: THREE.PointLight[] = [];
  const downwardFlames: THREE.Mesh[] = [];

  const nozzleGeom = new THREE.CylinderGeometry(0.07, 0.11, 0.22, 16);
  nozzleGeom.rotateZ(Math.PI / 2);

  const nozzleInnerMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Flame plume material with glowing plasma
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // Cold gas thruster cyan/white plasma
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // 4 rear thruster positions matching the SpaceX cold gas array
  const rearNozzleOffsets: [number, number, number][] = [
    [2.22, 0.58, -0.42],
    [2.22, 0.58, -0.14],
    [2.22, 0.58, 0.14],
    [2.22, 0.58, 0.42],
  ];

  rearNozzleOffsets.forEach((pos, idx) => {
    const nozzle = new THREE.Mesh(nozzleGeom, nozzleInnerMat);
    nozzle.position.set(...pos);
    bodyGroup.add(nozzle);
    thrusterNozzles.push(nozzle);

    // Exhaust Mach Diamond cone
    const flameConeGeom = new THREE.ConeGeometry(0.12, 1.5, 12);
    flameConeGeom.rotateZ(-Math.PI / 2);
    flameConeGeom.translate(0.75, 0, 0);
    const flame = new THREE.Mesh(flameConeGeom, flameMat.clone());
    flame.position.set(...pos);
    flame.scale.set(0.1, 0.1, 0.1);
    bodyGroup.add(flame);
    exhaustFlames.push(flame);

    // Point lights for thruster glow
    if (idx === 1 || idx === 2) {
      const pLight = new THREE.PointLight(0x38bdf8, 0, 8);
      pLight.position.set(pos[0] + 0.4, pos[1], pos[2]);
      bodyGroup.add(pLight);
      exhaustLights.push(pLight);
    }
  });

  // Downward VTOL Cold Gas Thrusters (as shown in user photo with vertical jets hitting ground)
  const vtolPositions: [number, number, number][] = [
    [-1.2, 0.2, -0.75],
    [-1.2, 0.2, 0.75],
    [1.3, 0.2, -0.75],
    [1.3, 0.2, 0.75],
  ];

  vtolPositions.forEach((pos) => {
    const vtolGeom = new THREE.ConeGeometry(0.16, 1.8, 12);
    vtolGeom.translate(0, -0.9, 0);
    const vtolFlame = new THREE.Mesh(vtolGeom, flameMat.clone());
    vtolFlame.position.set(...pos);
    vtolFlame.scale.set(0.1, 0.1, 0.1);
    bodyGroup.add(vtolFlame);
    downwardFlames.push(vtolFlame);
  });

  // 5. Billowing Cold Gas Exhaust Smoke Particle System (matching photo smoke cloud!)
  const smokeCount = 180;
  const smokeGeom = new THREE.BufferGeometry();
  const smokePositions = new Float32Array(smokeCount * 3);
  const smokeOpacities = new Float32Array(smokeCount);
  const smokeScales = new Float32Array(smokeCount);

  for (let i = 0; i < smokeCount; i++) {
    smokePositions[i * 3] = (Math.random() - 0.5) * 2;
    smokePositions[i * 3 + 1] = -Math.random() * 2;
    smokePositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    smokeOpacities[i] = Math.random();
    smokeScales[i] = 1.0;
  }

  smokeGeom.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
  smokeGeom.setAttribute('opacity', new THREE.BufferAttribute(smokeOpacities, 1));

  // Procedural circular soft particle texture
  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = 64;
  particleCanvas.height = 64;
  const pCtx = particleCanvas.getContext('2d')!;
  const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.3, 'rgba(210, 235, 255, 0.6)');
  grad.addColorStop(0.8, 'rgba(160, 190, 220, 0.2)');
  grad.addColorStop(1, 'rgba(160, 190, 220, 0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 64, 64);

  const particleTexture = new THREE.CanvasTexture(particleCanvas);
  particleTexture.colorSpace = THREE.SRGBColorSpace;

  const smokeMat = new THREE.PointsMaterial({
    map: particleTexture,
    size: 2.2,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const smokeParticles = new THREE.Points(smokeGeom, smokeMat);
  smokeParticles.position.set(0, 0, 0);
  bodyGroup.add(smokeParticles);

  // 6. Accent Details: Headlights, Taillights & Tesla Badging
  // Front LED Matrix blade light
  const headlightGeom = new THREE.BoxGeometry(0.1, 0.04, 1.55);
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
  const headlightMesh = new THREE.Mesh(headlightGeom, headlightMat);
  headlightMesh.position.set(-2.15, 0.42, 0);
  bodyGroup.add(headlightMesh);

  // Rear continuous sleek red blade taillight
  const taillightGeom = new THREE.BoxGeometry(0.08, 0.035, 1.6);
  const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
  const taillightMesh = new THREE.Mesh(taillightGeom, taillightMat);
  taillightMesh.position.set(2.18, 0.62, 0);
  bodyGroup.add(taillightMesh);

  // 7. Futuristic Cyber Sports Wheels (with directional aero covers)
  const wheels: THREE.Group[] = [];
  const wheelPositions: [number, number, number][] = [
    [-1.4, 0.36, -0.92],
    [-1.4, 0.36, 0.92],
    [1.4, 0.36, -0.92],
    [1.4, 0.36, 0.92],
  ];

  const tireGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 24);
  tireGeom.rotateX(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.85,
    metalness: 0.1,
  });

  const rimGeom = new THREE.CylinderGeometry(0.26, 0.26, 0.29, 12);
  rimGeom.rotateX(Math.PI / 2);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.3,
    metalness: 0.9,
  });

  wheelPositions.forEach((pos) => {
    const wGroup = new THREE.Group();
    const tire = new THREE.Mesh(tireGeom, tireMat);
    const rim = new THREE.Mesh(rimGeom, rimMat);
    tire.castShadow = true;
    rim.castShadow = true;
    wGroup.add(tire, rim);
    wGroup.position.set(...pos);
    bodyGroup.add(wGroup);
    wheels.push(wGroup);
  });

  group.add(bodyGroup);

  // Animation & state update handler
  let smokeTime = 0;
  const updateThrusters = (thrust: number, isBoosting: boolean, isVTOL: boolean, delta: number) => {
    smokeTime += delta * 6;
    const normThrust = Math.min(1.0, Math.max(0, thrust / 100));
    const boostMultiplier = isBoosting ? 1.8 : 1.0;

    // Rear horizontal exhaust flames
    exhaustFlames.forEach((flame, i) => {
      const flicker = 1.0 + Math.sin(smokeTime * 15 + i) * 0.15;
      const lengthScale = normThrust * boostMultiplier * flicker;
      flame.scale.set(
        Math.max(0.01, lengthScale * 1.8),
        Math.max(0.01, lengthScale * (isBoosting ? 1.4 : 1.0)),
        Math.max(0.01, lengthScale * (isBoosting ? 1.4 : 1.0))
      );
      (flame.material as THREE.MeshBasicMaterial).opacity = normThrust > 0.05 ? 0.9 : 0.0;
      if (isBoosting) {
        (flame.material as THREE.MeshBasicMaterial).color.setHex(0x60a5fa);
      } else {
        (flame.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
      }
    });

    // Exhaust lighting
    exhaustLights.forEach((light) => {
      light.intensity = normThrust * (isBoosting ? 6.0 : 3.0);
    });

    // Downward VTOL plumes (hover / lift)
    downwardFlames.forEach((vtol, i) => {
      const vtolActive = isVTOL || normThrust > 0.1;
      const flicker = 1.0 + Math.cos(smokeTime * 12 + i) * 0.18;
      const vtolScale = (vtolActive ? (isVTOL ? 1.2 : normThrust * 0.6) : 0.01) * flicker;
      vtol.scale.set(
        Math.max(0.01, vtolScale),
        Math.max(0.01, vtolScale * 1.5),
        Math.max(0.01, vtolScale)
      );
      (vtol.material as THREE.MeshBasicMaterial).opacity = vtolActive ? 0.8 : 0.0;
    });

    // Smoke particles physics simulation
    const posAttr = smokeGeom.getAttribute('position') as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    for (let i = 0; i < smokeCount; i++) {
      const idx = i * 3;
      // Drift backward and downward
      positions[idx] += (2.2 * normThrust + 0.3) * delta * 12; // drift behind car (+x)
      positions[idx + 1] -= (isVTOL ? 4.5 : 1.5) * delta * 4; // drift toward ground (-y)
      positions[idx + 2] += (Math.sin(smokeTime + i) * 0.4) * delta * 4; // turbulence

      // Reset when faded or far away
      if (positions[idx] > 18 || positions[idx + 1] < -6) {
        // Respawn near thrusters
        positions[idx] = 2.0 + Math.random() * 0.4;
        positions[idx + 1] = isVTOL ? 0.1 : 0.55 + (Math.random() - 0.5) * 0.2;
        positions[idx + 2] = (Math.random() - 0.5) * 0.9;
      }
    }
    posAttr.needsUpdate = true;
    (smokeParticles.material as THREE.PointsMaterial).opacity = normThrust > 0.05 || isVTOL ? 0.55 : 0.05;

    // Spin wheels according to speed
    wheels.forEach((w) => {
      w.rotation.z -= normThrust * delta * 30;
    });
  };

  const setBodyColor = (colorHex: string) => {
    bodyMaterial.color.set(colorHex);
  };

  const setWingAngle = (deg: number) => {
    wingMesh.rotation.z = THREE.MathUtils.degToRad(deg);
  };

  return {
    group,
    bodyMesh,
    wingMesh,
    wingStruts,
    canopyMesh,
    wheels,
    thrusterNozzles,
    exhaustFlames,
    exhaustLights,
    downwardFlames,
    smokeParticles,
    taillightMesh,
    headlightMesh,
    updateThrusters,
    setBodyColor,
    setWingAngle,
  };
}
