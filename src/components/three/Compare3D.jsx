/**
 * Compare3D
 * Up to three cars lined up side by side on one stage so body styles can be
 * compared at a glance. Optional synchronised turntable spin.
 */

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, ContactShadows, Html } from '@react-three/drei';
import { FaSyncAlt, FaLightbulb } from 'react-icons/fa';
import ProceduralCar from './ProceduralCar';
import { MoodLighting } from './StudioEnvironment';
import { resolveSpec } from './carSpecs';
import { paintForColor, finishForColor } from './paints';
import Glow from './Glow';
import useLowPower from './useLowPower';

const GAP = 1.5; // metres between cars

function layout(cars) {
  const lengths = cars.map((c) => resolveSpec(c.bodyType).length);
  const total = lengths.reduce((a, b) => a + b, 0) + GAP * (cars.length - 1);
  let x = -total / 2;
  const xs = lengths.map((len) => {
    const center = x + len / 2;
    x += len + GAP;
    return center;
  });
  return { xs, total };
}

function Spinning({ spin, children }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (spin) ref.current.rotation.y += dt * 0.35;
    else ref.current.rotation.y += (0 - ref.current.rotation.y) * Math.min(1, dt * 3);
  });
  return <group ref={ref}>{children}</group>;
}

function Framing({ total, controlsRef }) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    const vfov = (30 * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    // extra margin because the nearer end of the line-up looks larger in perspective
    const dist = Math.max(((total / 2 + 1.2) / Math.tan(hfov / 2)) * 1.1, 6);
    c.maxPolarAngle = Math.PI / 2 - 0.04;
    c.minDistance = 3;
    c.maxDistance = dist * 2;
    c.smoothTime = 0.6;
    c.setLookAt(dist * 0.08, 1.3 + dist * 0.1, dist, 0, 0.75, 0, true);
  }, [total, aspect, controlsRef]);
  return <CameraControls ref={controlsRef} makeDefault />;
}

export default function Compare3D({ cars }) {
  const [spin, setSpin] = useState(false);
  const [lights, setLights] = useState(true);
  const controlsRef = useRef();
  const labelsRef = useRef();
  const lowPower = useLowPower();
  const { xs, total } = useMemo(() => layout(cars), [cars]);

  return (
    <div className="relative h-[46vh] min-h-[340px] overflow-hidden rounded-2xl bg-[#0c0e12]">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 2, 12], fov: 30, near: 0.05, far: 200 }}>
        <Suspense fallback={null}>
          <MoodLighting mood="studio" />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[40, 64]} />
            <meshStandardMaterial color="#15171c" roughness={0.85} />
          </mesh>
          {cars.map((car, i) => (
            <group key={car.id} position={[xs[i], 0, 0]}>
              <Spinning spin={spin}>
                <ProceduralCar
                  bodyType={car.bodyType}
                  paint={paintForColor(car.color)}
                  finish={finishForColor(car.color)}
                  lightsOn={lights}
                  castLights={false}
                  title={`${car.make} ${car.model}`}
                />
              </Spinning>
              <ContactShadows position={[0, 0.005, 0]} scale={6} blur={2.4} opacity={0.8} far={2} resolution={256} frames={spin ? Infinity : 1} />
              <Html position={[0, 2.25, 0]} center portal={labelsRef} zIndexRange={[10, 0]}>
                <span className="whitespace-nowrap rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                  {i + 1}. {car.make} {car.model}
                </span>
              </Html>
            </group>
          ))}
          {!lowPower && <Glow intensity={0.7} />}
        </Suspense>
        <Framing total={total} controlsRef={controlsRef} />
      </Canvas>
      <div ref={labelsRef} className="pointer-events-none absolute inset-0" />

      <div className="absolute left-4 top-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
        Side by side in 3D
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          onClick={() => setSpin((v) => !v)}
          aria-pressed={spin}
          title="Spin all"
          className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${spin ? 'border-amber-400 bg-amber-500 text-black' : 'border-white/15 bg-black/40 text-white'}`}
        >
          <FaSyncAlt />
        </button>
        <button
          type="button"
          onClick={() => setLights((v) => !v)}
          aria-pressed={lights}
          title="Lights"
          className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${lights ? 'border-amber-400 bg-amber-500 text-black' : 'border-white/15 bg-black/40 text-white'}`}
        >
          <FaLightbulb />
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-white/50">Drag to orbit · scroll to zoom</p>
    </div>
  );
}
