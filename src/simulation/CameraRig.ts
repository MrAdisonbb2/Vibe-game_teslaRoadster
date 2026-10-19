import * as THREE from 'three';
import { CameraMode } from './types';

export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  public mode: CameraMode = 'chase';
  
  // Damped position targets
  private currentPos: THREE.Vector3 = new THREE.Vector3(0, 10, 420);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 400);

  // Orbit controls state
  public targetRadius: number = 20;
  public targetTheta: number = Math.PI; // behind car
  public targetPhi: number = Math.PI / 4; // 45 deg elevation

  public currentRadius: number = 20;
  public currentTheta: number = Math.PI;
  public currentPhi: number = Math.PI / 4;

  // Chase offset angle when user drags in chase mode
  public chaseOffsetTheta: number = 0;
  public chaseOffsetPhi: number = 0;

  // Camera Shake trauma
  public cameraShake: number = 0;

  constructor(width: number, height: number) {
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 3500);
    this.camera.position.set(0, 8, 415);
  }

  public triggerImpactShake(intensity: number = 1.0) {
    this.cameraShake = Math.min(3.0, intensity);
  }

  public rotateOrbit(deltaTheta: number, deltaPhi: number) {
    this.targetTheta += deltaTheta;
    this.targetPhi = Math.max(0.08, Math.min(Math.PI * 0.48, this.targetPhi + deltaPhi));
    
    // Also update chase offset so dragging in chase mode looks around
    this.chaseOffsetTheta += deltaTheta;
    this.chaseOffsetPhi = Math.max(-0.5, Math.min(0.7, this.chaseOffsetPhi + deltaPhi));
  }

  public zoomOrbit(deltaRadius: number) {
    this.targetRadius = Math.max(5, Math.min(150, this.targetRadius + deltaRadius));
  }

  public setPresetView(preset: 'rear' | 'side' | 'front' | 'top' | 'low') {
    this.mode = 'freeOrbit';
    switch (preset) {
      case 'rear':
        this.targetTheta = Math.PI;
        this.targetPhi = Math.PI / 4.2;
        this.targetRadius = 20;
        break;
      case 'front':
        this.targetTheta = 0;
        this.targetPhi = Math.PI / 5;
        this.targetRadius = 22;
        break;
      case 'side':
        this.targetTheta = Math.PI / 2;
        this.targetPhi = Math.PI / 4.5;
        this.targetRadius = 22;
        break;
      case 'top':
        this.targetTheta = Math.PI;
        this.targetPhi = 0.15; // looking straight down
        this.targetRadius = 35;
        break;
      case 'low':
        this.targetTheta = Math.PI * 0.85;
        this.targetPhi = Math.PI * 0.44; // low near wheels
        this.targetRadius = 14;
        break;
    }
  }

  public resetOrbitOffset() {
    this.chaseOffsetTheta = 0;
    this.chaseOffsetPhi = 0;
    this.targetTheta = Math.PI;
    this.targetPhi = Math.PI / 4;
    this.targetRadius = 20;
  }

  public update(
    delta: number,
    vehiclePos: THREE.Vector3,
    vehicleRotation: THREE.Euler,
    vehicleVelocity: THREE.Vector3,
    isCrashed: boolean
  ) {
    const targetLookAt = new THREE.Vector3();
    const desiredPos = new THREE.Vector3();

    // Smoothly damp orbit angles
    const dampRate = 14.0;
    this.currentTheta = THREE.MathUtils.damp(this.currentTheta, this.targetTheta, dampRate, delta);
    this.currentPhi = THREE.MathUtils.damp(this.currentPhi, this.targetPhi, dampRate, delta);
    this.currentRadius = THREE.MathUtils.damp(this.currentRadius, this.targetRadius, dampRate, delta);

    if (this.mode === 'cockpit') {
      // First-person cockpit view
      desiredPos.copy(vehiclePos);
      desiredPos.y += 0.82;
      desiredPos.x += 0.35 * Math.cos(vehicleRotation.y);
      desiredPos.z -= 0.35 * Math.sin(vehicleRotation.y);

      const forward = new THREE.Vector3(
        -Math.sin(vehicleRotation.y),
        -Math.sin(vehicleRotation.z),
        -Math.cos(vehicleRotation.y)
      );
      targetLookAt.copy(desiredPos).add(forward.multiplyScalar(50));

      this.camera.position.lerp(desiredPos, Math.min(1.0, delta * 25));
      this.camera.lookAt(targetLookAt);
      return;
    }

    if (this.mode === 'tower') {
      // Cinematic observation camera high on Tower B looking at Tower A and flight corridor
      desiredPos.set(55, 245, -420);
      targetLookAt.copy(vehiclePos);

      this.camera.position.lerp(desiredPos, Math.min(1.0, delta * 6));
      this.camera.lookAt(targetLookAt);
      return;
    }

    if (this.mode === 'drone') {
      // Side tracking flyby drone
      desiredPos.set(vehiclePos.x + 35, vehiclePos.y + 12, vehiclePos.z + 18);
      targetLookAt.copy(vehiclePos);

      this.camera.position.lerp(desiredPos, Math.min(1.0, delta * 4));
      this.camera.lookAt(targetLookAt);
      return;
    }

    if (this.mode === 'freeOrbit') {
      // 360 Degree Free Orbit Around the Tesla Roadster
      const ox = vehiclePos.x + this.currentRadius * Math.sin(this.currentPhi) * Math.sin(this.currentTheta);
      const oy = vehiclePos.y + this.currentRadius * Math.cos(this.currentPhi);
      const oz = vehiclePos.z + this.currentRadius * Math.sin(this.currentPhi) * Math.cos(this.currentTheta);
      
      desiredPos.set(ox, Math.max(0.8, oy), oz);
      targetLookAt.copy(vehiclePos);
      targetLookAt.y += 0.8;

      this.currentPos.lerp(desiredPos, Math.min(1.0, delta * 14));
      this.currentLookAt.lerp(targetLookAt, Math.min(1.0, delta * 14));

      this.camera.position.copy(this.currentPos);
      this.camera.lookAt(this.currentLookAt);
      return;
    }

    // Default: Dynamic Chase Camera with interactive offset
    const speed = vehicleVelocity.length();
    const distanceBehind = 14 + Math.min(12, speed * 0.08);
    const heightAbove = 4.5 + Math.min(3, speed * 0.02) + this.chaseOffsetPhi * 5;

    // Compute position behind vehicle rotation + user chase offset
    const backAngle = vehicleRotation.y + this.chaseOffsetTheta;
    desiredPos.x = vehiclePos.x + Math.sin(backAngle) * distanceBehind;
    desiredPos.y = Math.max(1.2, vehiclePos.y + heightAbove);
    desiredPos.z = vehiclePos.z + Math.cos(backAngle) * distanceBehind;

    // Look slightly ahead of the vehicle
    targetLookAt.copy(vehiclePos);
    targetLookAt.y += 1.2;
    if (!isCrashed) {
      targetLookAt.x -= Math.sin(vehicleRotation.y) * 15;
      targetLookAt.z -= Math.cos(vehicleRotation.y) * 15;
    }

    // Smooth exponential damping
    const followDamp = isCrashed ? 4.0 : 8.0;
    this.currentPos.lerp(desiredPos, Math.min(1.0, delta * followDamp));
    this.currentLookAt.lerp(targetLookAt, Math.min(1.0, delta * 9.0));

    this.camera.position.copy(this.currentPos);

    // Apply trauma vibration
    if (this.cameraShake > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 2.2;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 2.2;
      this.camera.position.z += (Math.random() - 0.5) * this.cameraShake * 2.2;
      this.cameraShake = THREE.MathUtils.damp(this.cameraShake, 0, 4.0, delta);
    }

    this.camera.lookAt(this.currentLookAt);
  }

  public handleResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
