/**
 * Showroom3D
 * A walk-through virtual showroom: every car in stock on its own turntable,
 * a reflective floor, and a camera that glides between cars.
 */

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Lightformer, MeshReflectorMaterial, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { FaChevronLeft, FaChevronRight, FaCube, FaPaperPlane, FaTachometerAlt, FaGasPump, FaCogs } from 'react-icons/fa';
import ProceduralCar from './ProceduralCar';
import { textTexture } from './carGeometry';
import { paintForColor, finishForColor } from './paints';
import Glow from './Glow';
import useLowPower from './useLowPower';
import SaveButton from '../SaveButton';
import CompareButton from '../CompareButton';

const SPACING = 7.5;
const RENDER_RANGE = 3; // only draw cars near the one in focus

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pickup', label: 'Bakkies' },
  { id: 'suv', label: 'SUVs' },
  { id: 'sedan', label: 'Sedans' },
  { id: 'hatch', label: 'Hatchbacks' },
  { id: 'roadster', label: 'Sports' },
];

function Turntable({ car, x, selected, onSelect, portal }) {
  const spin = useRef();
  useFrame((_, dt) => {
    if (!spin.current) return;
    if (selected) spin.current.rotation.y += dt * 0.25;
    else spin.current.rotation.y = THREE.MathUtils.damp(spin.current.rotation.y, -0.6, 2, dt);
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#121418" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[2.96, 3, 96]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={selected ? 2.2 : 0.5} toneMapped={false} />
      </mesh>
      <group ref={spin} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <ProceduralCar
          bodyType={car.bodyType}
          paint={paintForColor(car.color)}
          finish={finishForColor(car.color)}
          lightsOn={selected}
          castLights={false}
          title={`${car.make} ${car.model}`}
          scale={0.98}
        />
      </group>
      <ContactShadows position={[0, 0.015, 0]} scale={7} blur={2.5} opacity={0.75} far={2} resolution={256} frames={selected ? Infinity : 1} />
      <Html position={[0, 2.35, 0]} center distanceFactor={9} zIndexRange={[10, 0]} portal={portal}>
        <button
          type="button"
          onClick={onSelect}
          className={`pointer-events-auto whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold shadow-lg backdrop-blur transition ${
            selected ? 'bg-amber-500 text-black' : 'bg-black/60 text-white hover:bg-black/80'
          }`}
        >
          {car.make} {car.model} · ${car.price.toLocaleString()}
        </button>
      </Html>
    </group>
  );
}

function Hall({ count, mobile }) {
  const logo = useMemo(
    () => textTexture('ZIMCAR  SHOWROOM', { width: 1024, height: 128, bg: '#0a0b0e', fg: '#f59e0b', border: null, font: 'bold 84px Inter, Arial, sans-serif' }),
    []
  );
  useEffect(() => () => logo.dispose(), [logo]);
  const length = Math.max(count, 1) * SPACING + 40;
  const center = ((count - 1) * SPACING) / 2;

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center, 0, 0]}>
        <planeGeometry args={[length, 40]} />
        {mobile ? (
          <meshStandardMaterial color="#0d0e11" metalness={0.6} roughness={0.35} />
        ) : (
          <MeshReflectorMaterial
            blur={[300, 80]}
            resolution={1024}
            mixBlur={1}
            mixStrength={30}
            roughness={0.9}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0d0e11"
            metalness={0.6}
          />
        )}
      </mesh>
      {/* back wall + light strips */}
      <mesh position={[center, 4, -8]}>
        <boxGeometry args={[length, 8, 0.2]} />
        <meshStandardMaterial color="#0b0c10" roughness={0.9} />
      </mesh>
      {[1.2, 6.2].map((y) => (
        <mesh key={y} position={[center, y, -7.85]}>
          <boxGeometry args={[length, 0.05, 0.05]} />
          <meshStandardMaterial color="#fff" emissive="#ffe2b0" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: Math.ceil(count / 3) }).map((_, i) => (
        <mesh key={i} position={[i * SPACING * 3, 4.2, -7.88]}>
          <planeGeometry args={[6, 0.75]} />
          <meshBasicMaterial map={logo} toneMapped={false} />
        </mesh>
      ))}
      {/* pillars between bays */}
      {Array.from({ length: count + 1 }).map((_, i) => (
        <mesh key={i} position={[(i - 0.5) * SPACING, 4, -7.4]}>
          <boxGeometry args={[0.35, 8, 0.6]} />
          <meshStandardMaterial color="#14161b" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ x, controlsRef }) {
  const aspect = useThree((st) => st.size.width / st.size.height);
  const k = aspect < 1 ? 1.8 : aspect < 1.3 ? 1.3 : 1;
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    c.smoothTime = 0.8;
    c.minDistance = 3;
    c.maxDistance = 14;
    c.maxPolarAngle = Math.PI / 2 - 0.05;
    c.maxDistance = 14 * k;
    c.setLookAt(x + 5.8 * k, 0.8 + 1.5 * k, 7.2 * k, x, 0.8, 0, true);
  }, [x, controlsRef, k]);
  return <CameraControls ref={controlsRef} makeDefault />;
}

function SpotOnCar({ x }) {
  const light = useRef();
  const target = useRef();
  useEffect(() => {
    light.current.target = target.current;
  }, []);
  useFrame((_, dt) => {
    light.current.position.x = THREE.MathUtils.damp(light.current.position.x, x, 3, dt);
    target.current.position.x = THREE.MathUtils.damp(target.current.position.x, x, 3, dt);
  });
  return (
    <>
      <spotLight ref={light} position={[x, 8, 3]} angle={0.45} penumbra={0.8} intensity={120} distance={20} decay={1.4} color="#fff3e0" />
      <object3D ref={target} position={[x, 0, 0]} />
    </>
  );
}

export default function Showroom3D({ cars }) {
  const [filter, setFilter] = useState('all');
  const [index, setIndex] = useState(0);
  const controlsRef = useRef();
  const labelsRef = useRef();
  const mobile = useLowPower();

  const list = useMemo(() => cars.filter((c) => filter === 'all' || c.bodyType === filter), [cars, filter]);
  const safeIndex = Math.min(index, Math.max(list.length - 1, 0));
  const car = list[safeIndex];

  const go = (d) => setIndex((i) => (i + d + list.length) % list.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % list.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + list.length) % list.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [list.length]);

  return (
    <div className="relative h-[calc(100vh-4rem)] min-h-[600px] w-full overflow-hidden bg-[#07080b] text-white">
      <Canvas dpr={[1, mobile ? 1.5 : 2]} camera={{ position: [5.2, 2.1, 6.4], fov: 40, near: 0.05, far: 200 }}>
        <color attach="background" args={['#07080b']} />
        <fog attach="fog" args={['#07080b', 12, 38]} />
        <ambientLight intensity={0.25} />
        <Suspense fallback={null}>
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={2} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 3, 1]} />
            <Lightformer form="rect" intensity={2} position={[0, 1.4, 8]} rotation={[0, Math.PI, 0]} scale={[30, 0.5, 1]} />
            <Lightformer form="rect" intensity={1} position={[0, 3, -8]} scale={[30, 1, 1]} />
            <Lightformer form="rect" intensity={1.4} position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[10, 2, 1]} />
            <Lightformer form="rect" intensity={1.4} position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 2, 1]} />
          </Environment>
          <Hall count={list.length} mobile={mobile} />
          {list.map((c, i) =>
            Math.abs(i - safeIndex) <= RENDER_RANGE ? (
              <Turntable key={c.id} car={c} x={i * SPACING} selected={i === safeIndex} onSelect={() => setIndex(i)} portal={labelsRef} />
            ) : null
          )}
          <SpotOnCar x={safeIndex * SPACING} />
          {!mobile && <Glow intensity={0.6} />}
        </Suspense>
        <CameraRig x={safeIndex * SPACING} controlsRef={controlsRef} />
      </Canvas>
      <div ref={labelsRef} className="pointer-events-none absolute inset-0" />

      {/* Filters */}
      <div className="absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                setIndex(0);
              }}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${filter === f.id ? 'bg-white text-black' : 'text-white/75 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prev / next */}
      {list.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous car"
            className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 backdrop-blur hover:bg-white/15 sm:left-6"
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next car"
            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 backdrop-blur hover:bg-white/15 sm:right-6"
          >
            <FaChevronRight />
          </button>
        </>
      )}

      {/* Info card */}
      {car && (
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-black/65 p-4 backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[380px] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-400">
                {car.year} · {safeIndex + 1} / {list.length}
              </div>
              <h1 className="text-2xl font-bold leading-tight">
                {car.make} {car.model}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase text-white/50">Price</div>
              <div className="text-xl font-bold">${car.price.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/70">
            <span className="flex items-center gap-1.5"><FaTachometerAlt /> {car.mileage.toLocaleString()} km</span>
            <span className="flex items-center gap-1.5"><FaGasPump /> {car.fuelType}</span>
            <span className="flex items-center gap-1.5"><FaCogs /> {car.transmission}</span>
          </div>
          <p className="mt-2 hidden text-sm text-white/60 sm:block">{car.description}</p>
          <div className="mt-4 flex gap-2">
            <Link
              to={`/car/${car.id}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
            >
              <FaCube /> Explore inside & out
            </Link>
            <SaveButton carId={car.id} className="rounded-lg border border-white/20 px-3 hover:bg-white/10" />
            <CompareButton carId={car.id} className="rounded-lg border border-white/20 px-3 hover:bg-white/10" />
            <Link
              to={`/car/${car.id}#enquire`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/10"
            >
              <FaPaperPlane /> Enquire
            </Link>
          </div>
        </div>
      )}

      <p className="pointer-events-none absolute bottom-8 right-24 hidden text-xs text-white/40 md:block">
        ← → to browse · drag to look around · click a car to focus
      </p>
    </div>
  );
}
