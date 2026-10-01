/**
 * GLBCar
 * Loads a real 3D car model (.glb / .gltf) and makes it behave like the
 * procedural cars: scaled to a real-world length, turned to face +X, sat on
 * the ground, and repaintable when the model has a recognisable paint material.
 */

import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { resolveSpec } from './carSpecs';

// Self-hosted decoder (public/draco) for Draco-compressed models
useGLTF.setDecoderPath('/draco/');

const PAINT_RE = /paint|carpaint|body|exterior|lacquer|shell|chassis_color/i;
const NOT_PAINT_RE = /glass|window|windshield|windscreen|interior|seat|tyre|tire|rubber|rim|wheel|chrome|light|lamp|plastic|black|grill|mirror_glass/i;
const HEAD_RE = /headl|head_l|frontlight|front_light|light_front|drl/i;
const TAIL_RE = /taill|tail_l|rearlight|rear_light|light_rear|brake/i;

const FINISH = {
  gloss: { metalness: 0.15, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.03 },
  metallic: { metalness: 0.75, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05 },
  matte: { metalness: 0.35, roughness: 0.62, clearcoat: 0, clearcoatRoughness: 0.5 },
};

function eachMaterial(root, fn) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (Array.isArray(o.material)) o.material = o.material.map((m) => fn(m, o) || m);
    else o.material = fn(o.material, o) || o.material;
  });
}

/**
 * Clone the scene, normalise size/orientation, and collect the materials we
 * will drive (paint, head/tail lights). Materials are cloned so instances
 * (e.g. the same model twice in the showroom) can be painted independently.
 */
function prepare(scene, { length, rotationDeg, paintNames }) {
  const model = scene.clone(true);
  const cloned = new Map();
  const paint = [];
  const head = [];
  const tail = [];
  const wanted = paintNames?.length ? new Set(paintNames.map((n) => n.toLowerCase())) : null;

  eachMaterial(model, (m, mesh) => {
    if (!m) return m;
    if (cloned.has(m.uuid)) return cloned.get(m.uuid);
    const name = `${m.name} ${mesh.name}`;
    const isPaint = wanted ? wanted.has(m.name.toLowerCase()) : PAINT_RE.test(name) && !NOT_PAINT_RE.test(m.name);
    const isHead = HEAD_RE.test(name);
    const isTail = TAIL_RE.test(name);
    if (!isPaint && !isHead && !isTail) return m;
    const c = m.clone();
    cloned.set(m.uuid, c);
    if (isPaint) paint.push(c);
    else if (isHead) head.push(c);
    else tail.push(c);
    return c;
  });

  // Work out which way the car is lying, then scale it to the target length.
  const pivot = new THREE.Group();
  pivot.add(model);
  let box = new THREE.Box3().setFromObject(model);
  let size = box.getSize(new THREE.Vector3());
  let rot = rotationDeg;
  if (rot == null) rot = size.z > size.x ? 90 : 0; // longest side becomes the length
  pivot.rotation.y = THREE.MathUtils.degToRad(rot);
  pivot.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(pivot);
  size = box.getSize(new THREE.Vector3());

  const scale = size.x > 0 ? length / size.x : 1;
  const center = box.getCenter(new THREE.Vector3());
  const wrapper = new THREE.Group();
  wrapper.add(pivot);
  wrapper.scale.setScalar(scale);
  wrapper.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

  return { object: wrapper, paint, head, tail, materials: [...cloned.values()] };
}

export default function GLBCar({
  url,
  bodyType = 'sedan',
  length,
  yawDeg,
  paintMaterials,
  paint,
  finish = 'gloss',
  lightsOn = false,
  onInfo,
  ...props
}) {
  const { scene } = useGLTF(url, true);
  const target = length || resolveSpec(bodyType).length;
  const prepared = useMemo(
    () => prepare(scene, { length: target, rotationDeg: yawDeg, paintNames: paintMaterials }),
    [scene, target, yawDeg, paintMaterials]
  );

  useEffect(() => () => prepared.materials.forEach((m) => m.dispose()), [prepared]);

  useEffect(() => {
    onInfo?.({ loaded: true, paintable: prepared.paint.length > 0 });
  }, [prepared, onInfo]);

  useEffect(() => {
    const f = FINISH[finish] || FINISH.gloss;
    prepared.paint.forEach((m) => {
      if (paint && m.color) m.color.set(paint);
      // drop any baked colour texture so the chosen colour shows true
      if (paint && m.map) m.map = null;
      if ('metalness' in m) m.metalness = f.metalness;
      if ('roughness' in m) m.roughness = f.roughness;
      if ('clearcoat' in m) {
        m.clearcoat = f.clearcoat;
        m.clearcoatRoughness = f.clearcoatRoughness;
      }
      m.needsUpdate = true;
    });
  }, [prepared, paint, finish]);

  useEffect(() => {
    prepared.head.forEach((m) => {
      if (!m.emissive) return;
      m.emissive.set('#fff6e0');
      m.emissiveIntensity = lightsOn ? 6 : 0.2;
    });
    prepared.tail.forEach((m) => {
      if (!m.emissive) return;
      m.emissive.set('#ff1a1a');
      m.emissiveIntensity = lightsOn ? 3.5 : 0.4;
    });
  }, [prepared, lightsOn]);

  return (
    <group {...props}>
      <primitive object={prepared.object} />
    </group>
  );
}
