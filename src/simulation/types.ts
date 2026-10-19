export type CameraMode = 'chase' | 'cockpit' | 'tower' | 'drone' | 'freeOrbit';

export type FlightMode = 'manual' | 'autoCrash' | 'stuntRings' | 'hover';

export interface RoadsterCustomization {
  bodyColor: string;
  name: string;
  thrusterPower: number; // in Newtons multiplier
  thrusterColor: string;
  wingAngle: number;
}

export interface TelemetryData {
  speedKmh: number;
  speedMach: number;
  altitudeM: number;
  thrustPercent: number;
  gForce: number;
  distanceToTower: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  status: 'flying' | 'crashed' | 'stalled' | 'landed';
  impactData?: ImpactReportData | null;
}

export interface ImpactReportData {
  impactSpeedKmh: number;
  impactMach: number;
  kineticEnergyMJ: number;
  impactAltitudeM: number;
  impactLocation: 'Tower A (North)' | 'Tower B (South)' | 'Rooftop Spire' | 'Ground';
  peakGForce: number;
  structuralDamageRating: string;
  timestamp: string;
}

export interface RingCheckpoint {
  id: number;
  position: [number, number, number];
  radius: number;
  passed: boolean;
}
