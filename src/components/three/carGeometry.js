/**
 * Geometry builders for the procedural car body.
 * Everything is built from the side profile in carSpecs.js.
 */

import * as THREE from 'three';
import { topY } from './carSpecs';

/**
 * Side-view outline of the lower body between x0 and x1 (x0 < x1),
 * with wheel arches cut out of the bottom edge where an arch fits inside.
 */
export function sectionShape(spec, x0, x1, { inset = 0, bottom, arches = true } = {}) {
  const b = (bottom ?? spec.clearance) + inset;
  const xa = x0 + inset;
  const xb = x1 - inset;
  const pts = [[xa, b]];

  if (arches) {
    for (const axle of [spec.rearAxle, spec.frontAxle]) {
      const r = spec.archR + inset;
      const cy = spec.wheelRadius;
      const dy = b - cy;
      if (axle - r < xa || axle + r > xb || Math.abs(dy) >= r) continue;
      const th0 = Math.asin(dy / r);
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const a = Math.PI - th0 - ((Math.PI - 2 * th0) * i) / steps;
        pts.push([axle + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    }
  }

  pts.push([xb, b]);
  pts.push([xb, topY(spec, xb) - inset]);
  for (const [x, y] of spec.profile) {
    if (x < xb && x > xa) pts.push([x, y - inset]);
  }
  pts.push([xa, topY(spec, xa) - inset]);

  return new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
}

/** Extrude a side shape across the car, centred on z = 0 (or starting at z = 0 if `centered` is false). */
export function extrudeShape(shape, depth, { bevel = 0, segments = 3, centered = true } = {}) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(depth - 2 * bevel, 0.001),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments,
    curveSegments: 12,
  });
  // ExtrudeGeometry spans z = -bevel .. depth - bevel
  geo.translate(0, 0, centered ? -(depth - 2 * bevel) / 2 : bevel);
  geo.computeVertexNormals();
  return geo;
}

/** Clip a polygon ([[x, y], ...]) to xa <= x <= xb (Sutherland–Hodgman). */
export function clipX(poly, xa, xb) {
  const clip = (pts, inside, cross) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i];
      const prev = pts[(i + pts.length - 1) % pts.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cross(prev, cur));
        out.push(cur);
      } else if (inside(prev)) {
        out.push(cross(prev, cur));
      }
    }
    return out;
  };
  const crossAt = (x) => (p, q) => {
    const t = (x - p[0]) / (q[0] - p[0]);
    return [x, p[1] + (q[1] - p[1]) * t];
  };
  let out = clip(poly, (p) => p[0] >= xa, crossAt(xa));
  if (out.length) out = clip(out, (p) => p[0] <= xb, crossAt(xb));
  return out;
}

export function polygonShape(poly) {
  return new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y)));
}

/** Side outline of the glasshouse (empty for open-top cars). */
export function greenhousePolygon(spec) {
  const g = spec.greenhouse;
  if (!g) return [];
  return [
    [g.cBase, topY(spec, g.cBase)],
    [g.aBase, topY(spec, g.aBase)],
    [g.roofFront, g.roofY],
    [g.roofRear, g.roofY],
  ];
}

/** Flat quad through four 3D points (a-b-c-d in order). */
export function quadGeometry(a, b, c, d) {
  const geo = new THREE.BufferGeometry();
  const v = [...a, ...b, ...c, ...a, ...c, ...d];
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  const uv = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}

/** Ranges of [lo, hi] not covered by `ranges` (each [a, b]), ignoring slivers. */
export function complementRanges(lo, hi, ranges, minWidth = 0.04) {
  const sorted = [...ranges].sort((p, q) => p[0] - q[0]);
  const out = [];
  let cursor = lo;
  for (const [a, b] of sorted) {
    if (a - cursor > minWidth) out.push([cursor, Math.min(a, hi)]);
    cursor = Math.max(cursor, b);
  }
  if (hi - cursor > minWidth) out.push([cursor, hi]);
  return out.filter(([a, b]) => b - a > minWidth);
}

/** Tyre cross-section spun into a ring around the Z axis. */
export function tyreGeometry(radius, width, rimRadius) {
  const w = width / 2;
  const pts = [
    [rimRadius, -w],
    [radius - 0.045, -w],
    [radius - 0.012, -w + 0.018],
    [radius, -w + 0.045],
    [radius, w - 0.045],
    [radius - 0.012, w - 0.018],
    [radius - 0.045, w],
    [rimRadius, w],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(pts, 48);
  geo.rotateX(Math.PI / 2);
  return geo;
}

/** Canvas texture with centred text, used for number plates and badges. */
export function textTexture(text, { width = 512, height = 128, bg = '#f4f4f0', fg = '#111', font = 'bold 76px Inter, Arial, sans-serif', border = '#111' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, width - 16, height - 16);
  }
  ctx.fillStyle = fg;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2 + 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Infotainment screen texture: a simple nav/media UI. */
export function screenTexture(title) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 300);
  grad.addColorStop(0, '#0b1730');
  grad.addColorStop(1, '#122b52');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 300);
  // map grid
  ctx.strokeStyle = 'rgba(120,170,255,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(220 + i * 30, 0);
    ctx.lineTo(160 + i * 30, 300);
    ctx.stroke();
  }
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(250, 280);
  ctx.bezierCurveTo(300, 200, 420, 180, 470, 40);
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(250, 280, 9, 0, Math.PI * 2);
  ctx.fill();
  // left panel
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, 200, 300);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px Inter, Arial, sans-serif';
  ctx.fillText('ZimCar', 20, 50);
  ctx.font = '18px Inter, Arial, sans-serif';
  ctx.fillStyle = '#9fb4d9';
  ctx.fillText(title.slice(0, 18), 20, 82);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 54px Inter, Arial, sans-serif';
  ctx.fillText('0', 20, 170);
  ctx.font = '18px Inter, Arial, sans-serif';
  ctx.fillStyle = '#9fb4d9';
  ctx.fillText('km/h', 80, 170);
  ctx.fillText('Harare · 24°C', 20, 260);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
