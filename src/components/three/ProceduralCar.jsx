/**
 * ProceduralCar
 * A fully code-generated 3D car (no model files needed) with:
 * live paint / finish / rims / interior trim, opening doors,
 * working headlights, a modelled cabin, and RHD steering.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { resolveSpec, topY } from './carSpecs';
import {
  sectionShape,
  extrudeShape,
  clipX,
  polygonShape,
  greenhousePolygon,
  quadGeometry,
  complementRanges,
  tyreGeometry,
  textTexture,
  screenTexture,
} from './carGeometry';
import { RIMS, INTERIORS } from './paints';

const FINISH_PROPS = {
  gloss: { metalness: 0.15, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.03 },
  metallic: { metalness: 0.75, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05 },
  matte: { metalness: 0.35, roughness: 0.62, clearcoat: 0, clearcoatRoughness: 0.5 },
};

function useCarMaterials({ paint, finish, rims, interior, lightsOn, title }) {
  const mats = useMemo(
    () => ({
      paint: new THREE.MeshPhysicalMaterial({ color: paint }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#2a3a4a',
        metalness: 0.2,
        roughness: 0.02,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
        envMapIntensity: 2.5,
      }),
      trim: new THREE.MeshStandardMaterial({ color: '#0b0b0d', roughness: 0.45, metalness: 0.2 }),
      plastic: new THREE.MeshStandardMaterial({ color: '#17181b', roughness: 0.8 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#f1f3f5', roughness: 0.08, metalness: 1 }),
      rubber: new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.92 }),
      rim: new THREE.MeshStandardMaterial(),
      brake: new THREE.MeshStandardMaterial({ color: '#6b6e73', roughness: 0.5, metalness: 0.8 }),
      caliper: new THREE.MeshStandardMaterial({ color: '#c81e1e', roughness: 0.4 }),
      seat: new THREE.MeshStandardMaterial({ roughness: 0.65 }),
      cabin: new THREE.MeshStandardMaterial({ roughness: 0.75 }),
      headliner: new THREE.MeshStandardMaterial({ color: '#cbc6bd', roughness: 0.95, side: THREE.DoubleSide }),
      carpet: new THREE.MeshStandardMaterial({ color: '#1a1a1c', roughness: 1 }),
      head: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff6e0', roughness: 0.1 }),
      tail: new THREE.MeshStandardMaterial({ color: '#5a0000', emissive: '#ff1a1a', roughness: 0.2 }),
      plate: new THREE.MeshStandardMaterial({ map: textTexture('ZIMCAR'), roughness: 0.5 }),
      screen: (() => {
        const map = screenTexture(title);
        return new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.2 });
      })(),
      gauge: new THREE.MeshStandardMaterial({ color: '#05080d', emissive: '#1e90ff', emissiveIntensity: 0.6 }),
    }),
    // Materials are created once; prop changes are applied in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    return () => {
      Object.values(mats).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    };
  }, [mats]);

  useEffect(() => {
    mats.paint.color.set(paint);
    Object.assign(mats.paint, FINISH_PROPS[finish] || FINISH_PROPS.gloss);
    mats.paint.needsUpdate = true;
  }, [mats, paint, finish]);

  useEffect(() => {
    const r = RIMS.find((x) => x.id === rims) || RIMS[0];
    mats.rim.color.set(r.color);
    mats.rim.metalness = r.metalness;
    mats.rim.roughness = r.roughness;
  }, [mats, rims]);

  useEffect(() => {
    const t = INTERIORS.find((x) => x.id === interior) || INTERIORS[0];
    mats.seat.color.set(t.seat);
    mats.cabin.color.set(t.trim);
  }, [mats, interior]);

  useEffect(() => {
    mats.head.emissiveIntensity = lightsOn ? 6 : 0.35;
    mats.tail.emissiveIntensity = lightsOn ? 3.5 : 0.5;
  }, [mats, lightsOn]);

  return mats;
}

/** A thin box stretched between two points. */
function Beam({ from, to, thickness = 0.06, depth, material }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { position: a.add(b).multiplyScalar(0.5), quaternion: q, length: dir.length() };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <boxGeometry args={[thickness, length, depth ?? thickness]} />
    </mesh>
  );
}

const SPOKES = { alloy: [10, 0.022], black: [5, 0.06], chrome: [6, 0.045], bronze: [12, 0.018] };

function Wheel({ spec, position, side, mats, rims }) {
  const R = spec.wheelRadius;
  const w = spec.wheelWidth;
  const rimR = R * 0.66;
  const tyre = useMemo(() => tyreGeometry(R, w, rimR - 0.01), [R, w, rimR]);
  const [count, spokeW] = SPOKES[rims] || SPOKES.alloy;
  const outer = w / 2 - 0.02;

  return (
    <group position={position} scale={[1, 1, side]}>
      <mesh geometry={tyre} material={mats.rubber} />
      {/* rim barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.trim}>
        <cylinderGeometry args={[rimR, rimR, w * 0.9, 32, 1, true]} />
      </mesh>
      {/* brake disc + caliper */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, outer - 0.07]} material={mats.brake}>
        <cylinderGeometry args={[rimR * 0.82, rimR * 0.82, 0.025, 32]} />
      </mesh>
      <mesh position={[-rimR * 0.55, rimR * 0.45, outer - 0.05]} rotation={[0, 0, 0.8]} material={mats.caliper}>
        <boxGeometry args={[0.07, 0.16, 0.05]} />
      </mesh>
      {/* rim lip */}
      <mesh position={[0, 0, outer]} material={mats.rim}>
        <torusGeometry args={[rimR, 0.018, 8, 40]} />
      </mesh>
      {/* spokes */}
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} rotation={[0, 0, (i / count) * Math.PI * 2]}>
          <mesh position={[0, rimR / 2, outer - 0.01]} material={mats.rim}>
            <boxGeometry args={[spokeW, rimR - 0.01, 0.025]} />
          </mesh>
        </group>
      ))}
      {/* hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, outer]} material={mats.rim}>
        <cylinderGeometry args={[rimR * 0.22, rimR * 0.25, 0.05, 20]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, outer + 0.026]} material={mats.chrome}>
        <cylinderGeometry args={[rimR * 0.1, rimR * 0.1, 0.01, 16]} />
      </mesh>
    </group>
  );
}

function Seat({ x, z, width = 0.5, y, mats }) {
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[0.5, 0.13, width]} radius={0.04} smoothness={3} material={mats.seat} />
      <group position={[-0.22, 0.04, 0]} rotation={[0, 0, 0.22]}>
        <RoundedBox args={[0.12, 0.6, width]} radius={0.045} smoothness={3} position={[0, 0.3, 0]} material={mats.seat} />
        <RoundedBox args={[0.09, 0.15, Math.min(width, 0.5) * 0.55]} radius={0.035} smoothness={3} position={[0, 0.7, 0]} material={mats.seat} />
      </group>
    </group>
  );
}

function SteeringWheel({ spec, mats }) {
  const x = spec.cabinFront - 0.43;
  const y = spec.belt - 0.02;
  return (
    <group position={[x, y, spec.driverZ]} rotation={[0, 0, -0.38]}>
      <group rotation={[0, Math.PI / 2, 0]}>
        <mesh material={mats.trim}>
          <torusGeometry args={[0.17, 0.022, 10, 36]} />
        </mesh>
        <mesh material={mats.trim}>
          <boxGeometry args={[0.32, 0.03, 0.02]} />
        </mesh>
        <mesh position={[0, -0.08, 0]} material={mats.trim}>
          <boxGeometry args={[0.03, 0.16, 0.02]} />
        </mesh>
        <mesh position={[0, 0, 0.01]} material={mats.plastic}>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 20]} />
        </mesh>
      </group>
      {/* column */}
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.plastic}>
        <cylinderGeometry args={[0.03, 0.04, 0.3, 12]} />
      </mesh>
    </group>
  );
}

function Interior({ spec, mats }) {
  const { cabinFront, cabinRear, floorY, belt, glassW, frontSeatX, rearSeatX, seatBaseY } = spec;
  const cabinLen = cabinFront - cabinRear;
  const rearY = Math.max(floorY + 0.22, seatBaseY - 0.08);
  return (
    <group>
      {/* floor */}
      <mesh position={[(cabinFront + cabinRear) / 2, floorY, 0]} material={mats.carpet}>
        <boxGeometry args={[cabinLen, 0.04, spec.width - 0.1]} />
      </mesh>
      {/* firewall + rear bulkhead (inside) */}
      <mesh position={[cabinFront - 0.01, (floorY + belt) / 2, 0]} material={mats.cabin}>
        <boxGeometry args={[0.02, belt - floorY, spec.width - 0.12]} />
      </mesh>
      <mesh position={[cabinRear + 0.01, (floorY + belt) / 2, 0]} material={mats.cabin}>
        <boxGeometry args={[0.02, belt - floorY, spec.width - 0.12]} />
      </mesh>

      {/* dashboard */}
      <RoundedBox
        args={[0.36, 0.2, glassW - 0.06]}
        radius={0.05}
        smoothness={3}
        position={[cabinFront - 0.1, belt - 0.05, 0]}
        material={mats.cabin}
      />
      {/* instrument binnacle + gauges (driver side) */}
      <RoundedBox args={[0.14, 0.08, 0.36]} radius={0.03} smoothness={3} position={[cabinFront - 0.27, belt + 0.06, spec.driverZ]} material={mats.trim} />
      <mesh position={[cabinFront - 0.345, belt + 0.03, spec.driverZ]} rotation={[0, -Math.PI / 2, 0]} material={mats.gauge}>
        <planeGeometry args={[0.3, 0.07]} />
      </mesh>
      {/* infotainment screen */}
      <mesh position={[cabinFront - 0.29, belt + 0.12, 0]} rotation={[0, -Math.PI / 2, 0]} material={mats.screen}>
        <planeGeometry args={[0.3, 0.176]} />
      </mesh>
      <mesh position={[cabinFront - 0.282, belt + 0.12, 0]} rotation={[0, -Math.PI / 2, 0]} material={mats.trim}>
        <planeGeometry args={[0.32, 0.19]} />
      </mesh>

      <SteeringWheel spec={spec} mats={mats} />

      {/* centre console + gear lever */}
      <RoundedBox
        args={[cabinFront - 0.2 - (frontSeatX - 0.25), 0.22, 0.2]}
        radius={0.04}
        smoothness={3}
        position={[(cabinFront - 0.2 + frontSeatX - 0.25) / 2, floorY + 0.13, 0]}
        material={mats.cabin}
      />
      <mesh position={[frontSeatX + 0.3, floorY + 0.3, 0]} material={mats.trim}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
      </mesh>
      <mesh position={[frontSeatX + 0.3, floorY + 0.38, 0]} material={mats.chrome}>
        <sphereGeometry args={[0.03, 16, 16]} />
      </mesh>

      {/* seats */}
      <Seat x={frontSeatX} z={spec.driverZ} y={seatBaseY} mats={mats} />
      <Seat x={frontSeatX} z={-spec.driverZ} y={seatBaseY} mats={mats} />
      {spec.rearSeats && <Seat x={rearSeatX} z={0} y={rearY} width={spec.width - 0.42} mats={mats} />}
    </group>
  );
}

function Door({ spec, range, side, mats, ghPoly, openRef, index, onClick, withMirror }) {
  const [xa, xb] = range;
  const group = useRef();
  const { slab, glass, card } = useMemo(() => {
    const shape = sectionShape(spec, xa, xb, { inset: 0.008, bottom: spec.clearance + 0.02, arches: false });
    const slabGeo = extrudeShape(shape, 0.05, { bevel: 0.008, segments: 2, centered: false });
    const win = clipX(ghPoly, xa + 0.02, xb - 0.02);
    const glassGeo = win.length > 2 ? new THREE.ShapeGeometry(polygonShape(win)) : null;
    const cardShape = sectionShape(spec, xa + 0.04, xb - 0.04, { inset: 0, bottom: spec.floorY + 0.04, arches: false });
    const cardGeo = new THREE.ShapeGeometry(cardShape);
    return { slab: slabGeo, glass: glassGeo, card: cardGeo };
  }, [spec, xa, xb, ghPoly]);

  useEffect(() => () => [slab, glass, card].forEach((g) => g?.dispose()), [slab, glass, card]);

  useFrame(() => {
    if (!group.current) return;
    // rear doors trail slightly behind the fronts for a nicer sequence
    const t = THREE.MathUtils.clamp(openRef.current * 1.15 - index * 0.15, 0, 1);
    const eased = t * t * (3 - 2 * t);
    group.current.rotation.y = side * eased * 1.05;
  });

  const z0 = side * spec.halfW;
  const glassZ = side * (spec.glassW / 2) - z0;

  return (
    <group
      ref={group}
      position={[xb, 0, z0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <group position={[-xb, 0, 0]}>
        <mesh geometry={slab} material={mats.paint} position={[0, 0, side > 0 ? -0.05 : 0]} />
        <mesh geometry={card} material={mats.cabin} position={[0, 0, -side * 0.06]} />
        {glass && <mesh geometry={glass} material={mats.glass} position={[0, 0, glassZ]} />}
        {/* handle */}
        <RoundedBox
          args={[0.13, 0.03, 0.02]}
          radius={0.008}
          position={[xa + 0.18, spec.belt - 0.09, side * 0.008]}
          material={mats.chrome}
        />
        {withMirror && (
          <group position={[spec.cabinFront - 0.14, spec.belt + 0.07, side * 0.1]}>
            <RoundedBox args={[0.13, 0.1, 0.17]} radius={0.035} smoothness={3} material={mats.paint} />
            <mesh position={[-0.066, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={mats.chrome}>
              <planeGeometry args={[0.13, 0.08]} />
            </mesh>
            <mesh position={[0.02, -0.03, -side * 0.08]} material={mats.trim}>
              <boxGeometry args={[0.05, 0.03, 0.08]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

function Headlight({ position, side, on, castLight, mats }) {
  const spot = useRef();
  const target = useRef();
  useEffect(() => {
    if (spot.current && target.current) spot.current.target = target.current;
  }, [on, castLight]);
  return (
    <group position={position}>
      <RoundedBox args={[0.08, 0.065, 0.42]} radius={0.025} smoothness={3} material={mats.head} />
      <RoundedBox args={[0.07, 0.1, 0.46]} radius={0.03} smoothness={3} position={[-0.012, -0.005, 0]} material={mats.trim} />
      <object3D ref={target} position={[8, -0.9, side * 0.6]} />
      {on && castLight && (
      <spotLight
        ref={spot}
        position={[0.06, 0, 0]}
        intensity={45}
        distance={16}
        angle={0.42}
        penumbra={0.6}
        decay={1.3}
        color="#fff4dc"
      />
      )}
    </group>
  );
}

const ProceduralCar = React.forwardRef(function ProceduralCar(
  {
    bodyType = 'sedan',
    paint = '#b9bec6',
    finish = 'metallic',
    rims = 'alloy',
    interior = 'onyx',
    doorsOpen = false,
    lightsOn = false,
    title = '',
    castLights = true,
    onDoorClick,
    ...props
  },
  ref
) {
  const spec = useMemo(() => resolveSpec(bodyType), [bodyType]);
  const mats = useCarMaterials({ paint, finish, rims, interior, lightsOn, title });
  const openRef = useRef(doorsOpen ? 1 : 0);

  useFrame((_, dt) => {
    const target = doorsOpen ? 1 : 0;
    openRef.current = THREE.MathUtils.damp(openRef.current, target, 4, dt);
  });

  const geo = useMemo(() => {
    const bv = 0.05;
    const nose = extrudeShape(sectionShape(spec, spec.cabinFront, spec.halfL, { inset: bv }), spec.width, { bevel: bv, segments: 4 });
    const g = { nose };

    if (spec.rear === 'bed') {
      const bedFront = spec.cabinRear - 0.06;
      g.bedSide = extrudeShape(sectionShape(spec, -spec.halfL, bedFront, { inset: 0.012 }), 0.05, { bevel: 0.012, segments: 2 });
      g.bedFront = bedFront;
    } else {
      g.rearBlock = extrudeShape(sectionShape(spec, -spec.halfL, spec.cabinRear, { inset: bv }), spec.width, { bevel: bv, segments: 4 });
    }

    // fixed side panels inside the cabin span that are not doors
    g.panels = complementRanges(spec.cabinRear, spec.cabinFront, spec.doorRanges, 0.03).map(([a, b]) =>
      extrudeShape(sectionShape(spec, a, b, { inset: 0.006, bottom: spec.clearance + 0.02, arches: false }), 0.05, { bevel: 0.006, segments: 2, centered: false })
    );

    // glasshouse
    const gh = greenhousePolygon(spec);
    g.ghPoly = gh;
    if (spec.greenhouse) {
      const { aBase, roofFront, roofRear, cBase, roofY } = spec.greenhouse;
      const hw = spec.glassW / 2;
      const yA = topY(spec, aBase);
      const yC = topY(spec, cBase);
      g.windshield = quadGeometry([aBase, yA, -hw], [aBase, yA, hw], [roofFront, roofY, hw], [roofFront, roofY, -hw]);
      g.rearGlass = quadGeometry([cBase, yC, hw], [cBase, yC, -hw], [roofRear, roofY, -hw], [roofRear, roofY, hw]);
      const xs = gh.map((p) => p[0]);
      const extras = complementRanges(Math.min(...xs), Math.max(...xs), spec.doorRanges, 0.04);
      g.sideFixed = extras
        .map(([a, b]) => clipX(gh, a, b))
        .filter((p) => p.length > 2)
        .map((p) => ({ geo: new THREE.ShapeGeometry(polygonShape(p)), glass: spec.quarterGlass || p[0][0] > 0 }));
      g.yA = yA;
      g.yC = yC;
    } else if (spec.windshield) {
      const { base, top, topY: wy } = spec.windshield;
      const hw = spec.glassW / 2 - 0.05;
      const yB = topY(spec, base);
      g.windshield = quadGeometry([base, yB, -hw], [base, yB, hw], [top, wy, hw], [top, wy, -hw]);
      g.yB = yB;
    }
    return g;
  }, [spec]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((v) => {
        if (v?.isBufferGeometry) v.dispose();
        if (Array.isArray(v)) v.forEach((x) => (x.isBufferGeometry ? x.dispose() : x.geo?.dispose()));
      });
    },
    [geo]
  );

  const { halfL, halfW, width, clearance, glassW, greenhouse } = spec;
  const hw = glassW / 2;
  const frontY = spec.profile[0][1];
  const rearTop = topY(spec, -halfL);

  return (
    <group ref={ref} {...props}>
      {/* --- lower body --- */}
      <mesh geometry={geo.nose} material={mats.paint} castShadow />
      {geo.rearBlock && <mesh geometry={geo.rearBlock} material={mats.paint} castShadow />}

      {/* underbody to hide see-through gaps */}
      <mesh position={[0, clearance + 0.01, 0]} material={mats.plastic}>
        <boxGeometry args={[spec.length - 0.25, 0.04, width - 0.12]} />
      </mesh>

      {/* wheel tubs */}
      {[spec.frontAxle, spec.rearAxle].map((ax) => (
        <mesh key={ax} position={[ax, spec.wheelRadius, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.plastic}>
          <cylinderGeometry args={[spec.archR - 0.01, spec.archR - 0.01, 2 * (spec.track - spec.wheelWidth / 2) - 0.03, 24]} />
        </mesh>
      ))}

      {/* fixed side panels */}
      {geo.panels.map((p, i) => (
        <React.Fragment key={i}>
          <mesh geometry={p} material={mats.paint} position={[0, 0, halfW - 0.05]} />
          <mesh geometry={p} material={mats.paint} position={[0, 0, -halfW]} />
        </React.Fragment>
      ))}

      {/* pickup bed */}
      {spec.rear === 'bed' && (
        <group>
          <mesh geometry={geo.bedSide} material={mats.paint} position={[0, 0, halfW - 0.025]} />
          <mesh geometry={geo.bedSide} material={mats.paint} position={[0, 0, -halfW + 0.025]} />
          <mesh position={[(geo.bedFront - halfL) / 2, spec.wheelRadius * 2 + 0.1, 0]} material={mats.trim}>
            <boxGeometry args={[geo.bedFront + halfL, 0.04, width - 0.08]} />
          </mesh>
          <mesh position={[geo.bedFront - 0.02, (spec.belt + spec.wheelRadius * 2) / 2 + 0.05, 0]} material={mats.paint}>
            <boxGeometry args={[0.04, spec.belt - spec.wheelRadius * 2 - 0.1, width - 0.06]} />
          </mesh>
          <RoundedBox
            args={[0.05, spec.belt - spec.wheelRadius * 2 + 0.05, width - 0.03]}
            radius={0.02}
            position={[-halfL + 0.025, (spec.belt + spec.wheelRadius * 2) / 2 - 0.02, 0]}
            material={mats.paint}
          />
          {/* cab back wall */}
          <mesh position={[spec.cabinRear - 0.012, (clearance + spec.belt) / 2, 0]} material={mats.paint}>
            <boxGeometry args={[0.025, spec.belt - clearance - 0.02, width - 0.04]} />
          </mesh>
          {/* rear bumper */}
          <RoundedBox args={[0.14, 0.14, width - 0.1]} radius={0.04} position={[-halfL - 0.03, clearance + 0.08, 0]} material={mats.chrome} />
        </group>
      )}

      {/* --- doors --- */}
      {[1, -1].map((side) =>
        spec.doorRanges.map((range, i) => (
          <Door
            key={`${side}-${i}`}
            spec={spec}
            range={range}
            side={side}
            index={i}
            mats={mats}
            ghPoly={geo.ghPoly}
            openRef={openRef}
            onClick={onDoorClick}
            withMirror={i === 0}
          />
        ))
      )}

      {/* --- glasshouse --- */}
      {greenhouse && (
        <group>
          <mesh geometry={geo.windshield} material={mats.glass} />
          <mesh geometry={geo.rearGlass} material={mats.glass} />
          {geo.sideFixed.map((s, i) => (
            <React.Fragment key={i}>
              <mesh geometry={s.geo} material={s.glass ? mats.glass : mats.paint} position={[0, 0, hw]} />
              <mesh geometry={s.geo} material={s.glass ? mats.glass : mats.paint} position={[0, 0, -hw]} />
            </React.Fragment>
          ))}
          {/* roof + headliner */}
          <RoundedBox
            args={[greenhouse.roofFront - greenhouse.roofRear + 0.08, 0.06, glassW + 0.03]}
            radius={0.025}
            smoothness={3}
            position={[(greenhouse.roofFront + greenhouse.roofRear) / 2, greenhouse.roofY + 0.02, 0]}
            material={mats.paint}
          />
          <mesh
            position={[(greenhouse.roofFront + greenhouse.roofRear) / 2, greenhouse.roofY - 0.012, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={mats.headliner}
          >
            <planeGeometry args={[greenhouse.roofFront - greenhouse.roofRear, glassW - 0.02]} />
          </mesh>
          {/* pillars */}
          {[hw, -hw].map((z) => (
            <React.Fragment key={z}>
              <Beam from={[greenhouse.aBase, geo.yA, z]} to={[greenhouse.roofFront, greenhouse.roofY, z]} thickness={0.07} material={mats.paint} />
              <Beam from={[greenhouse.cBase, geo.yC, z]} to={[greenhouse.roofRear, greenhouse.roofY, z]} thickness={0.09} material={mats.paint} />
              {spec.doors === 4 && (
                <Beam from={[spec.doorSplit, spec.belt, z]} to={[spec.doorSplit, greenhouse.roofY, z]} thickness={0.08} depth={0.04} material={mats.trim} />
              )}
              {spec.quarterGlass && (
                <Beam from={[spec.cabinRear, topY(spec, spec.cabinRear), z]} to={[spec.cabinRear, greenhouse.roofY, z]} thickness={0.07} depth={0.04} material={mats.trim} />
              )}
            </React.Fragment>
          ))}
          {spec.roofRails &&
            [hw - 0.1, -hw + 0.1].map((z) => (
              <RoundedBox
                key={z}
                args={[greenhouse.roofFront - greenhouse.roofRear - 0.1, 0.04, 0.04]}
                radius={0.015}
                position={[(greenhouse.roofFront + greenhouse.roofRear) / 2, greenhouse.roofY + 0.07, z]}
                material={mats.chrome}
              />
            ))}
        </group>
      )}

      {/* open-top windscreen + roll hoops */}
      {spec.windshield && (
        <group>
          <mesh geometry={geo.windshield} material={mats.glass} />
          {[hw - 0.05, -hw + 0.05].map((z) => (
            <Beam key={z} from={[spec.windshield.base, geo.yB, z]} to={[spec.windshield.top, spec.windshield.topY, z]} thickness={0.04} material={mats.trim} />
          ))}
          <Beam
            from={[spec.windshield.top, spec.windshield.topY, hw - 0.05]}
            to={[spec.windshield.top, spec.windshield.topY, -hw + 0.05]}
            thickness={0.04}
            material={mats.trim}
          />
        </group>
      )}
      {spec.rollHoops &&
        [spec.driverZ, -spec.driverZ].map((z) => (
          <mesh key={z} position={[spec.cabinRear + 0.12, spec.belt, z]} rotation={[0, Math.PI / 2, 0]} material={mats.chrome}>
            <torusGeometry args={[0.2, 0.025, 10, 24, Math.PI]} />
          </mesh>
        ))}

      {/* body cladding on SUVs / bakkies */}
      {spec.cladding &&
        [spec.frontAxle, spec.rearAxle].map((ax) =>
          [halfW + 0.005, -halfW - 0.005].map((z) => {
            const th0 = Math.asin((clearance - spec.wheelRadius) / spec.archR);
            return (
              <mesh key={`${ax}${z}`} position={[ax, spec.wheelRadius, z]} rotation={[0, 0, th0]} material={mats.plastic}>
                <torusGeometry args={[spec.archR + 0.01, 0.03, 6, 28, Math.PI - 2 * th0]} />
              </mesh>
            );
          })
        )}

      {/* --- interior --- */}
      <Interior spec={spec} mats={mats} />

      {/* --- lights, grille, plates --- */}
      {[1, -1].map((side) => (
        <Headlight key={side} position={[halfL - 0.03, frontY + 0.02, side * (halfW - 0.3)]} side={side} on={lightsOn} castLight={castLights} mats={mats} />
      ))}
      <RoundedBox
        args={[0.05, Math.max(0.12, (frontY - clearance) * 0.5), width * 0.42]}
        radius={0.02}
        position={[halfL - 0.005, (frontY + clearance) / 2 + 0.03, 0]}
        material={mats.trim}
      />
      <mesh position={[halfL + 0.012, clearance + 0.09, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.plate}>
        <planeGeometry args={[0.36, 0.09]} />
      </mesh>
      {spec.tailStyle === 'bar'
        ? [1, -1].map((side) => (
            <RoundedBox
              key={side}
              args={[0.06, 0.09, 0.42]}
              radius={0.02}
              position={[-halfL + 0.02, rearTop - 0.07, side * (halfW - 0.3)]}
              material={mats.tail}
            />
          ))
        : [1, -1].map((side) => (
            <RoundedBox
              key={side}
              args={[0.06, 0.24, 0.12]}
              radius={0.02}
              position={[-halfL + 0.01, rearTop - 0.12, side * (halfW - 0.09)]}
              material={mats.tail}
            />
          ))}
      <mesh
        position={[-halfL - (spec.rear === 'bed' ? 0.035 : 0.012), clearance + (spec.rear === 'bed' ? 0.3 : 0.2), 0]}
        rotation={[0, -Math.PI / 2, 0]}
        material={mats.plate}
      >
        <planeGeometry args={[0.36, 0.09]} />
      </mesh>
      {lightsOn && castLights && (
        <pointLight position={[-halfL - 0.3, rearTop - 0.1, 0]} color="#ff2020" intensity={2.5} distance={3} decay={1.5} />
      )}

      {/* --- wheels --- */}
      {[spec.frontAxle, spec.rearAxle].map((ax) =>
        [1, -1].map((side) => (
          <Wheel key={`${ax}${side}`} spec={spec} position={[ax, spec.wheelRadius, side * spec.track]} side={side} mats={mats} rims={rims} />
        ))
      )}
    </group>
  );
});

export default ProceduralCar;
