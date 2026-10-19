import * as THREE from 'three';
import { RingCheckpoint } from './types';

export interface BreakableBlock {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  active: boolean;
  initialPos: THREE.Vector3;
}

export interface CityEnvironmentObjects {
  group: THREE.Group;
  towerA: THREE.Group;
  towerB: THREE.Group;
  breakableBlocks: BreakableBlock[];
  stuntRings: { mesh: THREE.Group; ring: RingCheckpoint }[];
  impactScorchMesh: THREE.Mesh;
  debrisParticles: THREE.Points;
  triggerTowerDebris: (hitPoint: THREE.Vector3, velocity: THREE.Vector3) => void;
  resetTower: () => void;
  updateEnvironment: (delta: number) => void;
}

export function createCityEnvironment(): CityEnvironmentObjects {
  const group = new THREE.Group();
  group.name = 'CityEnvironment';

  // Materials
  const towerGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.15,
    reflectivity: 0.9,
    clearcoat: 0.8,
  });

  const towerSteelMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.85,
    roughness: 0.35,
  });

  const neonCyanMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  const neonRedMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
  });

  // Target Impact Zone material (illuminated cyber bullseye)
  const targetBorderMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    wireframe: true,
  });

  // 1. Tower Dimensions: Height 450m, Width 50m, Depth 50m
  const towerHeight = 450;
  const towerWidth = 52;
  const towerDepth = 52;
  const towerSpacing = 110; // Center distance between Tower A and Tower B
  const towerZ = -450; // Placed 450m down the approach flight corridor

  // Helper function to build a detailed architectural skyscraper tower
  const buildSkyscraper = (name: string, posX: number): THREE.Group => {
    const tGroup = new THREE.Group();
    tGroup.name = name;
    tGroup.position.set(posX, 0, towerZ);

    // Main tower body (divided into 3 vertical tiered sections for realism)
    const lowerBodyGeom = new THREE.BoxGeometry(towerWidth, towerHeight * 0.7, towerDepth);
    const lowerBody = new THREE.Mesh(lowerBodyGeom, towerGlassMat);
    lowerBody.position.y = (towerHeight * 0.7) / 2;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    tGroup.add(lowerBody);

    const upperBodyGeom = new THREE.BoxGeometry(towerWidth * 0.88, towerHeight * 0.3, towerDepth * 0.88);
    const upperBody = new THREE.Mesh(upperBodyGeom, towerGlassMat);
    upperBody.position.y = towerHeight * 0.7 + (towerHeight * 0.3) / 2;
    upperBody.castShadow = true;
    tGroup.add(upperBody);

    // Vertical structural steel columns / mullions along four corners
    const columnGeom = new THREE.BoxGeometry(2.5, towerHeight, 2.5);
    const corners: [number, number][] = [
      [-towerWidth / 2, -towerDepth / 2],
      [-towerWidth / 2, towerDepth / 2],
      [towerWidth / 2, -towerDepth / 2],
      [towerWidth / 2, towerDepth / 2],
    ];

    corners.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(columnGeom, towerSteelMat);
      col.position.set(cx, towerHeight / 2, cz);
      col.castShadow = true;
      tGroup.add(col);
    });

    // Roof Observatory Deck & Crown
    const crownGeom = new THREE.BoxGeometry(towerWidth * 0.75, 12, towerDepth * 0.75);
    const crown = new THREE.Mesh(crownGeom, towerSteelMat);
    crown.position.y = towerHeight + 6;
    tGroup.add(crown);

    // High-altitude architectural communication spire / antenna
    const spireGeom = new THREE.CylinderGeometry(0.5, 3.5, 75, 16);
    const spire = new THREE.Mesh(spireGeom, towerSteelMat);
    spire.position.y = towerHeight + 48;
    tGroup.add(spire);

    // Flashing red aircraft warning beacon on top of spire
    const beaconGeom = new THREE.SphereGeometry(1.6, 8, 8);
    const beacon = new THREE.Mesh(beaconGeom, neonRedMat);
    beacon.position.y = towerHeight + 86;
    tGroup.add(beacon);

    // Horizontal illuminated accent bands
    for (let h = 40; h < towerHeight; h += 50) {
      const bandGeom = new THREE.BoxGeometry(towerWidth + 0.6, 1.2, towerDepth + 0.6);
      const band = new THREE.Mesh(bandGeom, neonCyanMat);
      band.position.y = h;
      tGroup.add(band);
    }

    // Target Crash Reticle on Tower Facing Front (Z = +towerDepth/2)
    const targetRingGeom = new THREE.RingGeometry(8, 12, 32);
    const targetRing = new THREE.Mesh(targetRingGeom, targetBorderMat);
    targetRing.position.set(0, 230, towerDepth / 2 + 0.4);
    tGroup.add(targetRing);

    const innerTargetGeom = new THREE.RingGeometry(2, 4, 32);
    const innerTarget = new THREE.Mesh(innerTargetGeom, neonRedMat);
    innerTarget.position.set(0, 230, towerDepth / 2 + 0.5);
    tGroup.add(innerTarget);

    return tGroup;
  };

  const towerA = buildSkyscraper('Tower_A_North', -towerSpacing / 2);
  const towerB = buildSkyscraper('Tower_B_South', towerSpacing / 2);
  group.add(towerA, towerB);

  // Skybridge removed - Towers stand as two separate freestanding monolithic towers

  // 3. Deformable Breakable Blocks (Target Impact Facade)
  // Grid of 48 structural fracture cubes positioned around the target impact zone of Tower A
  const breakableBlocks: BreakableBlock[] = [];
  const blockMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.7,
    roughness: 0.3,
  });

  const blockRows = 6;
  const blockCols = 8;
  const blockWidth = 3.6;
  const blockHeight = 3.6;
  const blockDepth = 2.5;

  for (let r = 0; r < blockRows; r++) {
    for (let c = 0; c < blockCols; c++) {
      const bGeom = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
      const bMesh = new THREE.Mesh(bGeom, blockMat);
      
      const px = -towerSpacing / 2 - (blockCols * blockWidth) / 2 + c * blockWidth + blockWidth / 2;
      const py = 215 + r * blockHeight;
      const pz = towerZ + towerDepth / 2 + 1.2;

      bMesh.position.set(px, py, pz);
      bMesh.castShadow = true;
      group.add(bMesh);

      breakableBlocks.push({
        mesh: bMesh,
        velocity: new THREE.Vector3(0, 0, 0),
        angularVelocity: new THREE.Vector3(0, 0, 0),
        active: false,
        initialPos: new THREE.Vector3(px, py, pz),
      });
    }
  }

  // 4. Scorch & Impact Crater Decal Mesh (appears on impact)
  const scorchGeom = new THREE.CircleGeometry(22, 32);
  const scorchMat = new THREE.MeshBasicMaterial({
    color: 0x050505,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const impactScorchMesh = new THREE.Mesh(scorchGeom, scorchMat);
  impactScorchMesh.position.set(-towerSpacing / 2, 230, towerZ + towerDepth / 2 + 1.8);
  group.add(impactScorchMesh);

  // 5. Blinding Explosion Flash PointLight
  const explosionLight = new THREE.PointLight(0xff5500, 0, 800, 1.0);
  explosionLight.position.set(-towerSpacing / 2, 230, towerZ + towerDepth / 2 + 5);
  group.add(explosionLight);

  // 6. Supersonic Shockwave Blast Ring
  const shockwaveGeom = new THREE.RingGeometry(1, 4.5, 64);
  const shockwaveMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const shockwaveRing = new THREE.Mesh(shockwaveGeom, shockwaveMat);
  shockwaveRing.position.set(-towerSpacing / 2, 230, towerZ + towerDepth / 2 + 2);
  group.add(shockwaveRing);

  // 7. Volumetric Multi-Sphere Fireball Cluster
  const fireballGroup = new THREE.Group();
  fireballGroup.position.set(-towerSpacing / 2, 230, towerZ + towerDepth / 2 + 3);

  const fireballCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffe066, // Hot white-yellow core
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const fireballOuterMat = new THREE.MeshBasicMaterial({
    color: 0xff3b00, // Fiery blazing orange-red
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // Central large core fireball
  const coreSphereGeom = new THREE.DodecahedronGeometry(8, 2);
  const coreFireball = new THREE.Mesh(coreSphereGeom, fireballCoreMat);
  fireballGroup.add(coreFireball);

  // 6 Satellite billowing fire lobes
  const satelliteFireballs: THREE.Mesh[] = [];
  const satelliteOffsets: [number, number, number][] = [
    [-6, 4, 3],
    [7, -3, 4],
    [-4, -5, 2],
    [5, 6, 3],
    [0, 8, -2],
    [-8, 1, 4],
  ];

  satelliteOffsets.forEach((off) => {
    const satGeom = new THREE.DodecahedronGeometry(5.5, 2);
    const satMesh = new THREE.Mesh(satGeom, fireballOuterMat.clone());
    satMesh.position.set(...off);
    fireballGroup.add(satMesh);
    satelliteFireballs.push(satMesh);
  });

  group.add(fireballGroup);

  // 8. Massive Billowing Smoke Cloud Particles (rising hundreds of meters)
  const smokeCount = 420;
  const smokeGeom = new THREE.BufferGeometry();
  const smokePositions = new Float32Array(smokeCount * 3);
  const smokeVelocities = new Float32Array(smokeCount * 3);
  const smokeRotations = new Float32Array(smokeCount);
  const smokeScales = new Float32Array(smokeCount);

  for (let i = 0; i < smokeCount; i++) {
    smokePositions[i * 3] = 0;
    smokePositions[i * 3 + 1] = -500;
    smokePositions[i * 3 + 2] = 0;

    smokeVelocities[i * 3] = (Math.random() - 0.5) * 16;
    smokeVelocities[i * 3 + 1] = 12 + Math.random() * 24; // upward thermal buoyancy
    smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 16;
    smokeRotations[i] = Math.random() * Math.PI * 2;
    smokeScales[i] = 1.0;
  }

  smokeGeom.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));

  // Procedural soft volumetric ash/smoke cloud texture
  const smokeCanvas = document.createElement('canvas');
  smokeCanvas.width = 128;
  smokeCanvas.height = 128;
  const sCtx = smokeCanvas.getContext('2d')!;
  const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  sGrad.addColorStop(0, 'rgba(40, 40, 45, 0.95)');
  sGrad.addColorStop(0.35, 'rgba(25, 25, 28, 0.8)');
  sGrad.addColorStop(0.7, 'rgba(15, 15, 18, 0.35)');
  sGrad.addColorStop(1, 'rgba(10, 10, 12, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 128, 128);

  const smokeTexture = new THREE.CanvasTexture(smokeCanvas);
  smokeTexture.colorSpace = THREE.SRGBColorSpace;

  const smokeMat = new THREE.PointsMaterial({
    map: smokeTexture,
    size: 26,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const smokePlumeParticles = new THREE.Points(smokeGeom, smokeMat);
  group.add(smokePlumeParticles);

  // 9. Fiery Sparks, Burning Embers & High-Velocity Glass Shrapnel
  const debrisCount = 450;
  const debrisGeom = new THREE.BufferGeometry();
  const debrisPositions = new Float32Array(debrisCount * 3);
  const debrisVelocities = new Float32Array(debrisCount * 3);
  const debrisColors = new Float32Array(debrisCount * 3);

  for (let i = 0; i < debrisCount; i++) {
    debrisPositions[i * 3] = 0;
    debrisPositions[i * 3 + 1] = -500;
    debrisPositions[i * 3 + 2] = 0;

    debrisVelocities[i * 3] = (Math.random() - 0.5) * 85;
    debrisVelocities[i * 3 + 1] = Math.random() * 70 + 10;
    debrisVelocities[i * 3 + 2] = (Math.random() - 0.5) * 85;

    // Glowing incandescent fire embers (gold/orange/bright white)
    if (Math.random() > 0.35) {
      debrisColors[i * 3] = 1.0;
      debrisColors[i * 3 + 1] = 0.5 + Math.random() * 0.4;
      debrisColors[i * 3 + 2] = 0.1;
    } else {
      debrisColors[i * 3] = 1.0;
      debrisColors[i * 3 + 1] = 0.9;
      debrisColors[i * 3 + 2] = 0.7; // white-hot
    }
  }

  debrisGeom.setAttribute('position', new THREE.BufferAttribute(debrisPositions, 3));
  debrisGeom.setAttribute('color', new THREE.BufferAttribute(debrisColors, 3));

  const debrisMat = new THREE.PointsMaterial({
    size: 3.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const debrisParticles = new THREE.Points(debrisGeom, debrisMat);
  group.add(debrisParticles);

  // 6. Stunt Flight Checkpoint Rings (for aerobatic mode)
  const ringCheckpoints: RingCheckpoint[] = [
    { id: 1, position: [0, 80, 200], radius: 18, passed: false },
    { id: 2, position: [0, 140, 50], radius: 18, passed: false },
    { id: 3, position: [-25, 200, -150], radius: 18, passed: false },
    { id: 4, position: [0, 230, -320], radius: 22, passed: false }, // directly leading to bridge gap!
  ];

  const stuntRings: { mesh: THREE.Group; ring: RingCheckpoint }[] = [];
  const ringGeom = new THREE.TorusGeometry(18, 0.8, 12, 32);
  const ringMatActive = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  ringCheckpoints.forEach((ring) => {
    const rGroup = new THREE.Group();
    const torus = new THREE.Mesh(ringGeom, ringMatActive.clone());
    rGroup.add(torus);
    rGroup.position.set(...ring.position);
    group.add(rGroup);
    stuntRings.push({ mesh: rGroup, ring });
  });

  // 7. Ground Launch Runway & Metropolis Cityscape
  // High-contrast asphalt runway
  const runwayGeom = new THREE.PlaneGeometry(80, 800);
  runwayGeom.rotateX(-Math.PI / 2);
  const runwayMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
    metalness: 0.2,
  });
  const runway = new THREE.Mesh(runwayGeom, runwayMat);
  runway.position.set(0, 0.05, 100);
  runway.receiveShadow = true;
  group.add(runway);

  // Runway yellow/white centerline markings
  const lineGeom = new THREE.PlaneGeometry(3, 760);
  lineGeom.rotateX(-Math.PI / 2);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const centerline = new THREE.Mesh(lineGeom, lineMat);
  centerline.position.set(0, 0.08, 100);
  group.add(centerline);

  // Runway edge approach guide lights
  for (let z = -250; z <= 450; z += 35) {
    const lightGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
    const leftLight = new THREE.Mesh(lightGeom, neonCyanMat);
    leftLight.position.set(-38, 0.4, z);
    const rightLight = leftLight.clone();
    rightLight.position.set(38, 0.4, z);
    group.add(leftLight, rightLight);
  }

  // Surrounding Cityscape Buildings (instanced / grouped to give depth)
  const cityBuildingMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.6,
    metalness: 0.4,
  });

  const cityBuildingCount = 65;
  const buildingGeom = new THREE.BoxGeometry(1, 1, 1);
  const cityBuildings = new THREE.InstancedMesh(buildingGeom, cityBuildingMat, cityBuildingCount);
  cityBuildings.castShadow = true;
  cityBuildings.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let bIdx = 0;
  for (let x = -450; x <= 450; x += 110) {
    for (let z = -750; z <= 350; z += 140) {
      // Don't place building directly on the runway corridor or Twin Towers
      if (Math.abs(x) < 90 && z > -550) continue;
      if (Math.abs(x) < 80 && Math.abs(z - towerZ) < 120) continue;
      if (bIdx >= cityBuildingCount) break;

      const bw = 35 + Math.random() * 35;
      const bd = 35 + Math.random() * 35;
      const bh = 60 + Math.random() * 220;

      dummy.position.set(x + (Math.random() - 0.5) * 30, bh / 2, z + (Math.random() - 0.5) * 30);
      dummy.scale.set(bw, bh, bd);
      dummy.updateMatrix();
      cityBuildings.setMatrixAt(bIdx++, dummy.matrix);
    }
  }
  cityBuildings.instanceMatrix.needsUpdate = true;
  group.add(cityBuildings);

  // Ground water / metropolis bay terrain plane
  const waterGeom = new THREE.PlaneGeometry(3000, 3000);
  waterGeom.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x020617,
    roughness: 0.2,
    metalness: 0.85,
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.position.y = -0.1;
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // Helper trigger function for explosive tower debris
  let debrisActive = false;
  let debrisTimer = 0;

  const triggerTowerDebris = (hitPoint: THREE.Vector3, velocity: THREE.Vector3) => {
    debrisActive = true;
    debrisTimer = 0;

    // 1. Show scorch crater on building face
    impactScorchMesh.position.copy(hitPoint);
    impactScorchMesh.position.z += 0.8;
    scorchMat.opacity = 0.95;

    // 2. Blinding Explosion Flash Light
    explosionLight.position.copy(hitPoint);
    explosionLight.position.z += 8;
    explosionLight.intensity = 45.0;

    // 3. Supersonic Shockwave Blast Ring
    shockwaveRing.position.copy(hitPoint);
    shockwaveRing.position.z += 2.5;
    shockwaveRing.scale.set(0.1, 0.1, 0.1);
    shockwaveMat.opacity = 1.0;

    // 4. Volumetric Fireball Cluster Burst
    fireballGroup.position.copy(hitPoint);
    fireballGroup.position.z += 4.0;
    fireballGroup.scale.set(0.1, 0.1, 0.1);
    fireballCoreMat.opacity = 1.0;
    fireballOuterMat.opacity = 0.95;

    // 5. Massive Billowing Smoke Cloud Launch
    const sPos = smokeGeom.getAttribute('position').array as Float32Array;
    for (let i = 0; i < smokeCount; i++) {
      sPos[i * 3] = hitPoint.x + (Math.random() - 0.5) * 8;
      sPos[i * 3 + 1] = hitPoint.y + (Math.random() - 0.5) * 8;
      sPos[i * 3 + 2] = hitPoint.z + (Math.random() - 0.5) * 8;

      smokeVelocities[i * 3] = (Math.random() - 0.5) * 22;
      smokeVelocities[i * 3 + 1] = 16 + Math.random() * 30; // strong upward convection
      smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    smokeGeom.getAttribute('position').needsUpdate = true;
    smokeMat.opacity = 0.85;

    // 6. Scatter breakable blocks with violent kinetic force
    breakableBlocks.forEach((block) => {
      const dist = block.initialPos.distanceTo(hitPoint);
      if (dist < 55) {
        block.active = true;
        const dir = new THREE.Vector3().subVectors(block.initialPos, hitPoint).normalize();
        dir.add(velocity.clone().multiplyScalar(0.015));
        
        const force = Math.max(20, (60 - dist) * 2.2);
        block.velocity.copy(dir.multiplyScalar(force));
        block.velocity.y += Math.random() * 22 + 5;
        block.angularVelocity.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        );
      }
    });

    // 7. Launch Incandescent Sparks & Burning Shrapnel
    const posArr = debrisGeom.getAttribute('position').array as Float32Array;
    for (let i = 0; i < debrisCount; i++) {
      posArr[i * 3] = hitPoint.x + (Math.random() - 0.5) * 4;
      posArr[i * 3 + 1] = hitPoint.y + (Math.random() - 0.5) * 4;
      posArr[i * 3 + 2] = hitPoint.z + (Math.random() - 0.5) * 4;

      debrisVelocities[i * 3] = (Math.random() - 0.5) * 90 + velocity.x * 0.12;
      debrisVelocities[i * 3 + 1] = Math.random() * 75 + 20;
      debrisVelocities[i * 3 + 2] = (Math.random() - 0.5) * 90 + velocity.z * 0.12;
    }
    debrisGeom.getAttribute('position').needsUpdate = true;
    debrisMat.opacity = 1.0;
  };

  const resetTower = () => {
    debrisActive = false;
    debrisTimer = 0;
    scorchMat.opacity = 0;
    explosionLight.intensity = 0;
    shockwaveMat.opacity = 0;
    fireballCoreMat.opacity = 0;
    fireballOuterMat.opacity = 0;
    smokeMat.opacity = 0;

    fireballGroup.scale.set(0.01, 0.01, 0.01);
    shockwaveRing.scale.set(0.01, 0.01, 0.01);

    breakableBlocks.forEach((b) => {
      b.active = false;
      b.mesh.position.copy(b.initialPos);
      b.mesh.rotation.set(0, 0, 0);
      b.velocity.set(0, 0, 0);
    });
    stuntRings.forEach((r) => {
      r.ring.passed = false;
      (r.mesh.children[0] as THREE.Mesh).material = ringMatActive;
    });

    // Hide debris & smoke particles
    const posArr = debrisGeom.getAttribute('position').array as Float32Array;
    for (let i = 0; i < debrisCount; i++) {
      posArr[i * 3 + 1] = -500;
    }
    debrisGeom.getAttribute('position').needsUpdate = true;

    const sArr = smokeGeom.getAttribute('position').array as Float32Array;
    for (let i = 0; i < smokeCount; i++) {
      sArr[i * 3 + 1] = -500;
    }
    smokeGeom.getAttribute('position').needsUpdate = true;
  };

  const updateEnvironment = (delta: number) => {
    // Animate breakable fracture blocks
    breakableBlocks.forEach((block) => {
      if (block.active) {
        block.velocity.y -= 9.8 * 3.5 * delta; // gravity
        block.mesh.position.addScaledVector(block.velocity, delta);
        block.mesh.rotation.x += block.angularVelocity.x * delta;
        block.mesh.rotation.y += block.angularVelocity.y * delta;
        block.mesh.rotation.z += block.angularVelocity.z * delta;

        // Ground bounce/clamp
        if (block.mesh.position.y < 1.0) {
          block.mesh.position.y = 1.0;
          block.velocity.y *= -0.3;
          block.velocity.x *= 0.7;
          block.velocity.z *= 0.7;
        }
      }
    });

    // Animate Explosion Dynamics (Fireball, Shockwave, Light, Smoke, Sparks)
    if (debrisActive) {
      debrisTimer += delta;

      // 1. Light flash decay
      explosionLight.intensity = Math.max(0, 45.0 * Math.exp(-debrisTimer * 3.0));

      // 2. Shockwave expansion & dissipation
      const shockScale = Math.min(140, debrisTimer * 160);
      shockwaveRing.scale.set(shockScale, shockScale, 1);
      shockwaveMat.opacity = Math.max(0, 1.0 - debrisTimer / 0.85);

      // 3. Volumetric Fireball Swell, Churn & Fade
      if (debrisTimer < 0.45) {
        // Fast swelling fireball
        const fbScale = Math.min(32, (debrisTimer / 0.35) * 28 + 0.1);
        fireballGroup.scale.set(fbScale, fbScale, fbScale);
      } else {
        // Slow buoyant rise and dissipation
        const fbScale = Math.min(42, 28 + (debrisTimer - 0.35) * 6);
        fireballGroup.scale.set(fbScale, fbScale, fbScale);
        fireballGroup.position.y += delta * 12; // fire rising
      }
      fireballGroup.rotation.x += delta * 2.5;
      fireballGroup.rotation.y += delta * 2.0;
      fireballCoreMat.opacity = Math.max(0, 1.0 - debrisTimer / 1.4);
      fireballOuterMat.opacity = Math.max(0, 0.95 - debrisTimer / 2.6);

      // 4. Billowing Dense Smoke Plume Rising into Sky
      const sPos = smokeGeom.getAttribute('position').array as Float32Array;
      for (let i = 0; i < smokeCount; i++) {
        sPos[i * 3] += smokeVelocities[i * 3] * delta;
        sPos[i * 3 + 1] += smokeVelocities[i * 3 + 1] * delta;
        sPos[i * 3 + 2] += smokeVelocities[i * 3 + 2] * delta;

        // Slow down horizontal drift
        smokeVelocities[i * 3] *= 0.985;
        smokeVelocities[i * 3 + 2] *= 0.985;
      }
      smokeGeom.getAttribute('position').needsUpdate = true;
      smokeMat.opacity = Math.max(0, 0.85 - debrisTimer / 8.0);

      // 5. Fiery Shrapnel & Sparks
      const posArr = debrisGeom.getAttribute('position').array as Float32Array;
      for (let i = 0; i < debrisCount; i++) {
        debrisVelocities[i * 3 + 1] -= 9.8 * 3.8 * delta; // gravity
        posArr[i * 3] += debrisVelocities[i * 3] * delta;
        posArr[i * 3 + 1] += debrisVelocities[i * 3 + 1] * delta;
        posArr[i * 3 + 2] += debrisVelocities[i * 3 + 2] * delta;

        if (posArr[i * 3 + 1] < 0.2) {
          posArr[i * 3 + 1] = 0.2;
          debrisVelocities[i * 3 + 1] *= -0.25; // bounce
        }
      }
      debrisGeom.getAttribute('position').needsUpdate = true;
      debrisMat.opacity = Math.max(0, 1.0 - debrisTimer / 5.5);
    }

    // Gentle pulse on stunt rings
    stuntRings.forEach(({ mesh, ring }) => {
      if (!ring.passed) {
        mesh.rotation.z += delta * 1.5;
      }
    });
  };

  return {
    group,
    towerA,
    towerB,
    breakableBlocks,
    stuntRings,
    impactScorchMesh,
    debrisParticles,
    triggerTowerDebris,
    resetTower,
    updateEnvironment,
  };
}
