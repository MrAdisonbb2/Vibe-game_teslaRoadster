import * as THREE from 'three';
import { FlightMode, TelemetryData, ImpactReportData } from './types';
import { soundEngine } from './AudioEngine';

export interface FlightInputState {
  pitchUp: boolean;
  pitchDown: boolean;
  rollLeft: boolean;
  rollRight: boolean;
  yawLeft: boolean;
  yawRight: boolean;
  throttleUp: boolean;
  throttleDown: boolean;
  boost: boolean;
  vtol: boolean;
}

export class PhysicsEngine {
  // Vehicle physics state
  public position: THREE.Vector3 = new THREE.Vector3(0, 1.2, 400); // Start on runway
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotation: THREE.Euler = new THREE.Euler(0, Math.PI, 0, 'YXZ'); // Facing -Z towards towers
  public angularVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  public massKg: number = 2000;
  public thrustNewtons: number = 65000;
  public throttlePercent: number = 0;
  public isBoosting: boolean = false;
  public isVTOL: boolean = false;
  public status: 'flying' | 'crashed' | 'stalled' | 'landed' = 'landed';

  public flightMode: FlightMode = 'autoCrash';
  public targetTower: 'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire' = 'Tower A (North)';

  // Impact report data
  public impactData: ImpactReportData | null = null;
  public hasTriggeredImpact: boolean = false;

  // Collision boundary constants
  private readonly towerZ: number = -450;
  private readonly towerHalfDepth: number = 26;
  private readonly towerHalfWidth: number = 26;
  private readonly towerSpacing: number = 110;

  // Trajectory prediction points for HUD visualizer
  public trajectoryPoints: THREE.Vector3[] = [];

  // Mach 1 sound check
  private hasCrossedMach: boolean = false;

  constructor() {
    this.reset(true);
  }

  public reset(keepMode: boolean = false) {
    this.position.set(0, 1.2, 380);
    this.velocity.set(0, 0, 0);
    this.rotation.set(0, Math.PI, 0); // facing -Z
    this.angularVelocity.set(0, 0, 0);
    this.throttlePercent = 0;
    this.isBoosting = false;
    this.isVTOL = false;
    this.status = 'landed';
    this.impactData = null;
    this.hasTriggeredImpact = false;
    this.hasCrossedMach = false;

    if (!keepMode) {
      this.flightMode = 'autoCrash';
    }
  }

  public launchAutoCrash(target: 'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire' = 'Tower A (North)') {
    this.reset(true);
    this.flightMode = 'autoCrash';
    this.targetTower = target;
    this.status = 'flying';
    this.throttlePercent = 100;
    this.isBoosting = true;
    this.isVTOL = true;
    // Initial launch speed
    this.velocity.set(0, 25, -50);
  }

  public update(delta: number, input: FlightInputState, onImpact?: (hitPoint: THREE.Vector3, velocity: THREE.Vector3) => void): TelemetryData {
    // If crashed, vehicle tumbles with gravity and ground friction
    if (this.status === 'crashed') {
      this.velocity.y -= 9.8 * 2.5 * delta;
      this.position.addScaledVector(this.velocity, delta);
      this.rotation.x += this.angularVelocity.x * delta;
      this.rotation.y += this.angularVelocity.y * delta;
      this.rotation.z += this.angularVelocity.z * delta;

      // Friction
      this.velocity.x *= 0.95;
      this.velocity.z *= 0.95;
      this.angularVelocity.multiplyScalar(0.94);

      if (this.position.y < 0.6) {
        this.position.y = 0.6;
        this.velocity.y = 0;
      }

      return this.getTelemetry();
    }

    // Flight mode control routines
    if (this.flightMode === 'autoCrash') {
      this.updateAutoCrashMode(delta);
    } else if (this.flightMode === 'hover') {
      this.updateHoverMode(delta);
    } else {
      this.updateManualFlight(delta, input);
    }

    // Speed and Mach checks
    const speedMs = this.velocity.length();
    const speedMach = speedMs / 343;

    if (speedMach >= 1.0 && !this.hasCrossedMach) {
      this.hasCrossedMach = true;
      soundEngine.playSonicBoom();
    } else if (speedMach < 0.9) {
      this.hasCrossedMach = false;
    }

    // Audio update
    soundEngine.updateThrusterSound(this.throttlePercent, this.isBoosting);

    // Collision Detection check against Towers, Skybridge, and Ground
    this.checkCollisions(onImpact);

    // Update trajectory prediction
    this.updateTrajectoryPrediction();

    return this.getTelemetry();
  }

  private updateAutoCrashMode(delta: number) {
    // Determine target impact coordinates
    let targetX = -this.towerSpacing / 2; // Tower A
    let targetY = 230; // Mid-height target floor
    const targetZ = this.towerZ + this.towerHalfDepth;

    if (this.targetTower === 'Tower B (South)') {
      targetX = this.towerSpacing / 2;
    } else if (this.targetTower === 'Rooftop Spire') {
      targetX = -this.towerSpacing / 2;
      targetY = 440; // High-altitude penthouse crown
    }

    const targetPos = new THREE.Vector3(targetX, targetY, targetZ);
    const toTarget = new THREE.Vector3().subVectors(targetPos, this.position);
    const distToTarget = toTarget.length();

    // Aggressive propulsion
    this.throttlePercent = 100;
    this.isBoosting = true;
    this.isVTOL = this.position.y < 50;

    // Guidance steering towards target
    const desiredDir = toTarget.clone().normalize();

    // Thrust acceleration vector
    const currentSpeed = this.velocity.length();
    const targetSpeed = Math.min(480, Math.max(90, 480 - (distToTarget < 80 ? 0 : 0))); // supersonic approach up to ~1700 km/h
    const accelRate = 120; // m/s^2 rocket acceleration

    // Smoothly blend velocity towards target direction
    const forward = desiredDir.multiplyScalar(Math.min(targetSpeed, currentSpeed + accelRate * delta));
    this.velocity.lerp(forward, Math.min(1.0, delta * 4.5));

    this.position.addScaledVector(this.velocity, delta);

    // Point the Roadster nose (-X in local model or towards forward velocity)
    if (this.velocity.lengthSq() > 0.1) {
      const lookTarget = this.position.clone().add(this.velocity);
      const m = new THREE.Matrix4().lookAt(lookTarget, this.position, new THREE.Vector3(0, 1, 0));
      this.rotation.setFromRotationMatrix(m);
      // Roadster model geometry points along +X by default in our model, adjust angle
      this.rotation.y += Math.PI / 2;
    }
  }

  private updateHoverMode(delta: number) {
    this.isVTOL = true;
    this.throttlePercent = 45;
    this.isBoosting = false;

    // Hover target altitude around 35 meters
    const targetAltitude = 35;
    const altDiff = targetAltitude - this.position.y;
    this.velocity.y += (altDiff * 2.0 - this.velocity.y * 1.5) * delta;
    this.velocity.x *= 0.96;
    this.velocity.z *= 0.96;

    this.position.addScaledVector(this.velocity, delta);
    this.rotation.z *= 0.95;
    this.rotation.x *= 0.95;
  }

  private updateManualFlight(delta: number, input: FlightInputState) {
    // Throttle handling
    if (input.throttleUp) {
      this.throttlePercent = Math.min(100, this.throttlePercent + delta * 50);
    }
    if (input.throttleDown) {
      this.throttlePercent = Math.max(0, this.throttlePercent - delta * 50);
    }
    this.isBoosting = input.boost;
    this.isVTOL = input.vtol;

    // Attitude control (Pitch, Roll, Yaw)
    const pitchRate = 1.4;
    const rollRate = 2.0;
    const yawRate = 1.2;

    if (input.pitchUp) this.rotation.z += pitchRate * delta;
    if (input.pitchDown) this.rotation.z -= pitchRate * delta;
    if (input.rollLeft) this.rotation.x -= rollRate * delta;
    if (input.rollRight) this.rotation.x += rollRate * delta;
    if (input.yawLeft) this.rotation.y += yawRate * delta;
    if (input.yawRight) this.rotation.y -= yawRate * delta;

    // Thrust calculation
    const thrustMag = (this.throttlePercent / 100) * this.thrustNewtons * (this.isBoosting ? 2.2 : 1.0);
    const thrustAccel = thrustMag / this.massKg;

    // Forward direction from rotation
    const forwardDir = new THREE.Vector3(-Math.sin(this.rotation.y), -Math.sin(this.rotation.z), -Math.cos(this.rotation.y)).normalize();

    this.velocity.addScaledVector(forwardDir, thrustAccel * delta);

    // Vertical lift thrusters (VTOL)
    if (this.isVTOL) {
      this.velocity.y += 24 * delta;
    }

    // Aerodynamic lift and gravity
    const speed = this.velocity.length();
    const aeroLift = Math.min(9.81 * 1.5, Math.max(0, (speed / 30) * 9.81));
    this.velocity.y += (aeroLift - 9.81) * delta;

    // Air drag
    const dragCoeff = 0.0012;
    this.velocity.multiplyScalar(Math.max(0.7, 1.0 - dragCoeff * speed * delta));

    this.position.addScaledVector(this.velocity, delta);

    if (this.position.y > 1.0) {
      this.status = 'flying';
    }
  }

  private checkCollisions(onImpact?: (hitPoint: THREE.Vector3, velocity: THREE.Vector3) => void) {
    if (this.status === 'crashed') return;

    const px = this.position.x;
    const py = this.position.y;
    const pz = this.position.z;

    let hasHit = false;
    let hitLocation: 'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire' | 'Ground' = 'Ground';

    // 1. Ground Collision
    if (py <= 0.6) {
      if (this.velocity.y < -15 || this.velocity.length() > 60) {
        hasHit = true;
        hitLocation = 'Ground';
      } else {
        // Safe ground landing / taxi
        this.position.y = 0.6;
        this.velocity.y = 0;
        this.status = 'landed';
      }
    }

    // 2. Tower A (North Tower) AABB
    const towerAX = -this.towerSpacing / 2;
    if (
      Math.abs(px - towerAX) <= this.towerHalfWidth + 2.5 &&
      Math.abs(pz - this.towerZ) <= this.towerHalfDepth + 2.5 &&
      py >= 0 &&
      py <= 450
    ) {
      hasHit = true;
      hitLocation = 'Tower A (North)';
    }

    // 3. Tower B (South Tower) AABB
    const towerBX = this.towerSpacing / 2;
    if (
      Math.abs(px - towerBX) <= this.towerHalfWidth + 2.5 &&
      Math.abs(pz - this.towerZ) <= this.towerHalfDepth + 2.5 &&
      py >= 0 &&
      py <= 450
    ) {
      hasHit = true;
      hitLocation = 'Tower B (South)';
    }

    // Tower A Rooftop Spire check
    if (hitLocation === 'Tower A (North)' && py > 410) {
      hitLocation = 'Rooftop Spire';
    }

    if (hasHit) {
      this.triggerCrashImpact(hitLocation, onImpact);
    }
  }

  private triggerCrashImpact(
    hitLocation: 'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire' | 'Ground',
    onImpact?: (hitPoint: THREE.Vector3, velocity: THREE.Vector3) => void
  ) {
    this.status = 'crashed';
    this.hasTriggeredImpact = true;

    const impactSpeedMs = this.velocity.length();
    const impactSpeedKmh = Math.round(impactSpeedMs * 3.6);
    const impactMach = parseFloat((impactSpeedMs / 343).toFixed(2));

    // Kinetic Energy E = 1/2 m v^2 in Megajoules (MJ)
    const kineticEnergyJoules = 0.5 * this.massKg * impactSpeedMs * impactSpeedMs;
    const kineticEnergyMJ = parseFloat((kineticEnergyJoules / 1_000_000).toFixed(2));

    // Deceleration peak G-force estimation (stopping distance ~3m)
    const stoppingDist = 3.5;
    const peakG = parseFloat(((impactSpeedMs * impactSpeedMs) / (2 * stoppingDist * 9.81)).toFixed(1));

    let damageRating = 'Minor Structural Damage';
    if (kineticEnergyMJ > 150) {
      damageRating = 'Hyper-Kinetic Penetration & Core Rupture (ทำลายล้างโครงสร้างทะลวงสูง)';
    } else if (kineticEnergyMJ > 60) {
      damageRating = 'Catastrophic Facade Breach & Frame Buckling (โครงสร้างเสียหายขั้นวิกฤต)';
    } else if (kineticEnergyMJ > 20) {
      damageRating = 'Severe Facade Collapse & Glass Shatter (กระจกและแผงอาคารพังทลาย)';
    }

    this.impactData = {
      impactSpeedKmh,
      impactMach,
      kineticEnergyMJ,
      impactAltitudeM: Math.round(this.position.y),
      impactLocation: hitLocation,
      peakGForce: peakG,
      structuralDamageRating: damageRating,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Play impact audio
    soundEngine.playCrashImpact(impactSpeedKmh);

    // Violent bounce & tumble velocity
    this.angularVelocity.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    );
    this.velocity.multiplyScalar(-0.18);
    this.velocity.y += 12;

    if (onImpact) {
      onImpact(this.position.clone(), this.velocity.clone());
    }
  }

  private updateTrajectoryPrediction() {
    this.trajectoryPoints = [];
    const tempPos = this.position.clone();
    const tempVel = this.velocity.clone();
    const simSteps = 25;
    const stepDt = 0.08;

    for (let i = 0; i < simSteps; i++) {
      tempVel.y -= 9.81 * stepDt * 0.4;
      tempPos.addScaledVector(tempVel, stepDt);
      this.trajectoryPoints.push(tempPos.clone());
      if (tempPos.y < 0.5 || tempPos.z < this.towerZ) break;
    }
  }

  public getTelemetry(): TelemetryData {
    const speedMs = this.velocity.length();
    const speedKmh = Math.round(speedMs * 3.6);
    const speedMach = parseFloat((speedMs / 343).toFixed(2));
    const distanceToTower = Math.max(0, Math.round(this.position.distanceTo(new THREE.Vector3(0, 230, this.towerZ))));

    // Calculate approximate G-force
    const gForce = parseFloat((1.0 + (this.isBoosting ? 3.5 : 0.8) * (this.throttlePercent / 100)).toFixed(1));

    return {
      speedKmh,
      speedMach,
      altitudeM: Math.max(0, Math.round(this.position.y)),
      thrustPercent: Math.round(this.throttlePercent),
      gForce,
      distanceToTower,
      headingDeg: Math.round(THREE.MathUtils.radToDeg(this.rotation.y) % 360),
      pitchDeg: Math.round(THREE.MathUtils.radToDeg(this.rotation.z)),
      rollDeg: Math.round(THREE.MathUtils.radToDeg(this.rotation.x)),
      status: this.status,
      impactData: this.impactData,
    };
  }
}
