/**
 * Parametric body specs for the procedural 3D cars.
 *
 * Units are metres. The car points down +X (front), Y is up, Z is width
 * (+Z is the right-hand side, which is the driver's side for RHD Zimbabwe).
 * The origin sits on the ground halfway between the axles.
 *
 * `profile` is the top edge of the lower body, front to rear (x descending).
 * `greenhouse` is the glass/roof area above the beltline.
 */

import * as THREE from 'three';

export const BODY_SPECS = {
  sedan: {
    length: 4.6, width: 1.8, wheelbase: 2.7, wheelRadius: 0.33, wheelWidth: 0.24, clearance: 0.28,
    profile: [[2.3, 0.62], [2.24, 0.8], [1.95, 0.88], [0.95, 0.98], [0.88, 1.0], [-0.9, 1.02], [-1.75, 1.03], [-2.2, 0.98], [-2.3, 0.82]],
    greenhouse: { aBase: 0.86, roofFront: 0.05, roofRear: -0.85, cBase: -1.55, roofY: 1.45 },
    doors: 4, doorSplit: 0.0, rear: 'trunk', rearSeats: true, quarterGlass: false, tailStyle: 'bar',
  },
  hatch: {
    length: 4.05, width: 1.75, wheelbase: 2.55, wheelRadius: 0.31, wheelWidth: 0.22, clearance: 0.27,
    profile: [[2.02, 0.6], [1.95, 0.78], [1.65, 0.86], [0.85, 0.98], [0.8, 1.0], [-1.6, 1.05], [-1.95, 1.0], [-2.02, 0.85]],
    greenhouse: { aBase: 0.78, roofFront: 0.0, roofRear: -1.55, cBase: -1.92, roofY: 1.48 },
    doors: 4, doorSplit: -0.02, rear: 'hatch', rearSeats: true, quarterGlass: true, tailStyle: 'vertical',
  },
  suv: {
    length: 4.5, width: 1.86, wheelbase: 2.68, wheelRadius: 0.37, wheelWidth: 0.26, clearance: 0.38,
    profile: [[2.25, 0.8], [2.19, 1.0], [1.9, 1.08], [0.95, 1.13], [0.9, 1.15], [-1.9, 1.2], [-2.2, 1.15], [-2.25, 1.0]],
    greenhouse: { aBase: 0.86, roofFront: 0.12, roofRear: -1.95, cBase: -2.17, roofY: 1.72 },
    doors: 4, doorSplit: 0.0, rear: 'hatch', rearSeats: true, quarterGlass: true, tailStyle: 'vertical', cladding: true, roofRails: true,
  },
  pickup: {
    length: 5.3, width: 1.86, wheelbase: 3.08, wheelRadius: 0.39, wheelWidth: 0.27, clearance: 0.4,
    profile: [[2.65, 0.82], [2.58, 1.02], [2.3, 1.1], [1.05, 1.18], [1.0, 1.2], [-2.65, 1.2]],
    greenhouse: { aBase: 0.98, roofFront: 0.25, roofRear: -0.7, cBase: -0.76, roofY: 1.84 },
    cabinRear: -0.8,
    doors: 4, doorSplit: 0.12, rear: 'bed', rearSeats: true, quarterGlass: false, tailStyle: 'vertical', cladding: true,
  },
  roadster: {
    length: 3.9, width: 1.73, wheelbase: 2.31, wheelRadius: 0.31, wheelWidth: 0.22, clearance: 0.22,
    profile: [[1.95, 0.5], [1.88, 0.68], [1.5, 0.76], [0.75, 0.86], [0.7, 0.88], [-0.7, 0.9], [-1.6, 0.92], [-1.9, 0.85], [-1.95, 0.65]],
    windshield: { base: 0.7, top: 0.33, topY: 1.22 },
    doors: 2, doorRear: -0.28, rear: 'trunk', rearSeats: false, tailStyle: 'bar', rollHoops: true,
  },
};

/** Fill in derived dimensions (axles, cabin box, door ranges, seat positions). */
export function resolveSpec(bodyType) {
  const base = BODY_SPECS[bodyType] || BODY_SPECS.sedan;
  const s = { ...base, bodyType: BODY_SPECS[bodyType] ? bodyType : 'sedan' };
  s.profile = smoothProfile(base.profile);
  s.halfL = s.length / 2;
  s.halfW = s.width / 2;
  s.frontAxle = s.wheelbase / 2;
  s.rearAxle = -s.wheelbase / 2;
  s.archR = s.wheelRadius + 0.08;
  s.track = s.halfW - s.wheelWidth / 2 - 0.03;
  // leave room for the arch cut-out plus the body bevel
  s.cabinFront = s.frontAxle - s.archR - 0.12;
  s.cabinRear = s.cabinRear ?? s.rearAxle + s.archR + 0.12;
  s.floorY = s.clearance + 0.06;
  s.belt = topY(s, 0);
  s.glassW = s.width - 0.08;

  const gap = 0.006;
  if (s.doors === 4) {
    s.doorRanges = [
      [s.doorSplit + gap, s.cabinFront - gap],
      [s.cabinRear + gap, s.doorSplit - gap],
    ];
  } else {
    s.doorRanges = [[s.doorRear + gap, s.cabinFront - gap]];
  }

  s.frontSeatX = s.cabinFront - 0.85;
  s.rearSeatX = s.cabinRear + 0.22;
  s.driverZ = 0.38; // RHD: driver sits on +Z
  // Eyes sit just above the dash; taller vehicles get a higher seat.
  const eyeY = Math.max(s.floorY + 0.84, s.belt + 0.24);
  s.seatBaseY = eyeY - 0.62;
  s.eye = [s.frontSeatX - 0.12, eyeY, s.driverZ];
  return s;
}

/** Round off the profile corners with a centripetal Catmull-Rom spline. */
function smoothProfile(points) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
  const out = [];
  for (const p of curve.getPoints(points.length * 10)) {
    // keep x strictly descending so topY() stays a function of x
    if (!out.length || p.x < out[out.length - 1][0] - 1e-4) out.push([p.x, p.y]);
  }
  out[0] = [...points[0]];
  out[out.length - 1] = [...points[points.length - 1]];
  return out;
}

/** Height of the lower body's top edge at x (linear between profile points). */
export function topY(spec, x) {
  const p = spec.profile;
  if (x >= p[0][0]) return p[0][1];
  for (let i = 0; i < p.length - 1; i++) {
    const [x0, y0] = p[i];
    const [x1, y1] = p[i + 1];
    if (x <= x0 && x >= x1) {
      const t = x0 === x1 ? 0 : (x0 - x) / (x0 - x1);
      return y0 + (y1 - y0) * t;
    }
  }
  return p[p.length - 1][1];
}

/** Camera poses for the viewer's preset views. */
export function cameraViews(spec) {
  const L = spec.length;
  const [ex, ey, ez] = spec.eye;
  return {
    exterior: { pos: [L * 0.95, L * 0.32, L * 0.95], target: [0, 0.6, 0] },
    front: { pos: [L * 1.25, 1.0, 0.6], target: [0, 0.7, 0] },
    side: { pos: [0, 1.1, L * 1.3], target: [0, 0.7, 0] },
    rear: { pos: [-L * 1.05, 1.5, -L * 0.7], target: [0, 0.7, 0] },
    top: { pos: [0.01, L * 1.6, 0.4], target: [0, 0, 0] },
    interior: { pos: [ex, ey, ez], target: [ex + 0.02, ey - 0.002, ez] },
  };
}

/** Positions of points of interest, used for hotspots and camera framing. */
export function carAnchors(bodyType) {
  const s = resolveSpec(bodyType);
  return {
    headlight: [s.halfL + 0.05, s.profile[0][1] + 0.05, s.halfW - 0.3],
    frontWheel: [s.frontAxle, s.wheelRadius + 0.05, s.halfW + 0.05],
    rearWheel: [s.rearAxle, s.wheelRadius + 0.05, s.halfW + 0.05],
    dash: [s.cabinFront - 0.29, s.belt + 0.26, 0],
    seat: [s.frontSeatX, s.seatBaseY + 0.4, -s.driverZ],
    roof: [0, (s.greenhouse?.roofY ?? s.belt + 0.3) + 0.15, 0],
    rear: [-s.halfL - 0.05, topY(s, -s.halfL) + 0.1, 0],
    steering: [s.cabinFront - 0.43, s.belt + 0.2, s.driverZ],
    spec: s,
  };
}

