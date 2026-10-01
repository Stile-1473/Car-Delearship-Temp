/**
 * CarViewer
 * Interactive 3D viewer + configurator for a single car:
 * orbit / preset views, step-inside interior camera, opening doors,
 * headlights, paint / finish / wheels / interior trim, lighting moods,
 * feature hotspots, snapshots and fullscreen.
 */

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import {
  FaSyncAlt,
  FaLightbulb,
  FaDoorOpen,
  FaCamera,
  FaExpand,
  FaCompress,
  FaInfoCircle,
  FaPaperPlane,
} from 'react-icons/fa';
import ProceduralCar from './ProceduralCar';
import { MoodLighting, StudioFloor } from './StudioEnvironment';
import { MOODS } from './moods';
import { cameraViews, carAnchors } from './carSpecs';
import Glow from './Glow';
import useLowPower from './useLowPower';
import { PAINTS, FINISHES, RIMS, INTERIORS, paintForColor, finishForColor } from './paints';

const VIEWS = [
  { id: 'exterior', label: '3/4' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'rear', label: 'Rear' },
  { id: 'top', label: 'Top' },
  { id: 'interior', label: 'Interior' },
];

const TABS = ['Paint', 'Wheels', 'Interior', 'Scene'];

function featureAnchor(feature) {
  const f = feature.toLowerCase();
  if (/screen|touch|bluetooth|carplay|android|navigation|infotainment|audio|sound|idrive|connect/.test(f)) return 'dash';
  if (/climate|air con|a\/c/.test(f)) return 'dash';
  if (/abs|brake|alloy|wheel|tyre|tire/.test(f)) return 'frontWheel';
  if (/4wd|awd|4x4|diff|traction|tow/.test(f)) return 'rearWheel';
  if (/camera|park|sensor|boot|tailgate/.test(f)) return 'rear';
  if (/led|light|fog|xenon/.test(f)) return 'headlight';
  if (/leather|seat|heated|interior/.test(f)) return 'seat';
  if (/steer|cruise|paddle/.test(f)) return 'steering';
  if (/sunroof|roof|panoramic/.test(f)) return 'roof';
  return null;
}

function buildHotspots(features = [], bodyType) {
  const anchors = carAnchors(bodyType);
  const fallback = ['headlight', 'roof', 'frontWheel', 'rear', 'seat'];
  const used = {};
  return features.slice(0, 6).map((label, i) => {
    let key = featureAnchor(label) || fallback.find((k) => !used[k]) || fallback[i % fallback.length];
    const n = used[key] || 0;
    used[key] = n + 1;
    const [x, y, z] = anchors[key];
    return { label, key, position: [x, y + n * 0.18, z], interior: ['dash', 'seat', 'steering'].includes(key) };
  });
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function Hotspot({ position, label, index, portal }) {
  const [open, setOpen] = useState(false);
  return (
    <Html position={position} center zIndexRange={[20, 0]} portal={portal}>
      <div className="pointer-events-auto relative select-none">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="relative flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-black shadow-lg ring-2 ring-white/80"
          aria-label={label}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/60" />
          <span className="relative">{index + 1}</span>
        </button>
        {open && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/85 px-3 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur">
            {label}
          </div>
        )}
      </div>
    </Html>
  );
}

/** Camera rig: preset view transitions, interior look-around and turntable spin. */
function Rig({ view, viewNonce, views, autoRotate, controlsRef }) {
  const aspect = useThree((st) => st.size.width / st.size.height);
  // portrait screens need the camera further back to fit the car
  const zoomOut = aspect < 1 ? 1.75 : aspect < 1.3 ? 1.25 : 1;
  const interacting = useRef(false);
  const resumeAt = useRef(0);

  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    const v = views[view];
    if (view === 'interior') {
      c.minDistance = 0.001;
      c.maxDistance = 0.05;
      c.azimuthRotateSpeed = -0.35;
      c.polarRotateSpeed = -0.35;
      c.minPolarAngle = 0.2;
      c.maxPolarAngle = Math.PI - 0.2;
      c.dollySpeed = 0;
      c.truckSpeed = 0;
    } else {
      c.minDistance = 2.2;
      c.maxDistance = 16;
      c.azimuthRotateSpeed = 1;
      c.polarRotateSpeed = 1;
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI / 2 - 0.03;
      c.dollySpeed = 1;
      c.truckSpeed = 1;
    }
    c.smoothTime = 0.55;
    const k = view === 'interior' ? 1 : zoomOut;
    const pos = v.pos.map((p, i) => v.target[i] + (p - v.target[i]) * k);
    c.setLookAt(...pos, ...v.target, true);
  }, [view, viewNonce, views, controlsRef, zoomOut]);

  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    const start = () => {
      interacting.current = true;
    };
    const end = () => {
      interacting.current = false;
      resumeAt.current = performance.now() + 2500;
    };
    c.addEventListener('controlstart', start);
    c.addEventListener('controlend', end);
    return () => {
      c.removeEventListener('controlstart', start);
      c.removeEventListener('controlend', end);
    };
  }, [controlsRef]);

  useFrame((_, dt) => {
    const c = controlsRef.current;
    if (!c || !autoRotate || view === 'interior' || interacting.current) return;
    if (performance.now() < resumeAt.current) return;
    c.rotate(dt * 0.12, 0, false);
  });

  return <CameraControls ref={controlsRef} makeDefault />;
}

/** Exposes a snapshot function that renders the current frame to a PNG. */
function SnapshotBridge({ onReady }) {
  const gl = useThree((st) => st.gl);
  useEffect(() => {
    // preserveDrawingBuffer keeps the last composed frame (with bloom) readable
    onReady(() => gl.domElement.toDataURL('image/png'));
  }, [gl, onReady]);
  return null;
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-white/80">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-amber-500" />
        <span className="text-xs tracking-widest uppercase">Preparing showroom</span>
      </div>
    </Html>
  );
}

const IconButton = ({ active, onClick, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    aria-pressed={active}
    className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border text-sm backdrop-blur transition ${
      active ? 'border-amber-400 bg-amber-500 text-black' : 'border-white/15 bg-black/40 text-white hover:bg-white/15'
    }`}
  >
    {children}
  </button>
);

export default function CarViewer({ car, onEnquire, className = '' }) {
  const bodyType = car.bodyType || 'sedan';
  const title = `${car.year} ${car.make} ${car.model}`;
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const [view, setViewState] = useState('exterior');
  const [viewNonce, setViewNonce] = useState(0);
  // re-clicking the current view re-frames the camera
  const setView = (v) => {
    setViewState(v);
    setViewNonce((n) => n + 1);
  };
  const [paint, setPaint] = useState(() => paintForColor(car.color));
  const [finish, setFinish] = useState(() => finishForColor(car.color));
  const [rims, setRims] = useState('alloy');
  const [interior, setInterior] = useState('onyx');
  const [mood, setMood] = useState('studio');
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [autoRotate, setAutoRotate] = useState(!prefersReducedMotion);
  const [showHotspots, setShowHotspots] = useState(true);
  const [tab, setTab] = useState('Paint');
  const [fullscreen, setFullscreen] = useState(false);
  const [webgl] = useState(hasWebGL);
  const lowPower = useLowPower();

  const containerRef = useRef();
  // Html labels mount here so they don't depend on the canvas event wiring order
  const labelsRef = useRef();
  const controlsRef = useRef();
  const snapshotRef = useRef(null);

  const views = useMemo(() => cameraViews(carAnchors(bodyType).spec), [bodyType]);
  const hotspots = useMemo(() => buildHotspots(car.features, bodyType), [car.features, bodyType]);
  const radius = carAnchors(bodyType).spec.length * 0.68;

  const paintName = PAINTS.find((p) => p.hex === paint)?.name || car.color;
  const options = [
    FINISHES.find((f) => f.id === finish),
    RIMS.find((r) => r.id === rims),
    INTERIORS.find((t) => t.id === interior),
  ];
  const extras = options.reduce((sum, o) => sum + (o?.price || 0), 0);
  const total = (car.price || 0) + extras;

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };

  const changeMood = (m) => {
    setMood(m);
    if (m === 'night') setLightsOn(true);
  };

  const takeSnapshot = () => {
    const url = snapshotRef.current?.();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${car.make}-${car.model}-zimcar.png`.replace(/\s+/g, '-');
    a.click();
  };

  const setSnapshot = useCallback((fn) => {
    snapshotRef.current = fn;
  }, []);

  const handleEnquire = () => {
    onEnquire?.({
      title,
      paint: paintName,
      finish: options[0]?.name,
      rims: options[1]?.name,
      interior: options[2]?.name,
      total,
    });
  };

  if (!webgl) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gray-900 ${className}`}>
        <img src={car.image} alt={title} className="h-full w-full object-cover opacity-90" />
        <p className="absolute bottom-4 left-4 rounded bg-black/70 px-3 py-2 text-sm text-white">
          Your browser doesn&apos;t support 3D — showing photos instead.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-black text-white ${fullscreen ? 'h-screen' : 'h-[78vh] min-h-[560px] rounded-2xl'} ${className}`}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: views.exterior.pos, fov: 38, near: 0.01, far: 200 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onPointerMissed={() => (document.body.style.cursor = '')}
      >
        <Suspense fallback={<Loader />}>
          <MoodLighting mood={mood} />
          <StudioFloor mood={mood} radius={radius} />
          <ProceduralCar
            bodyType={bodyType}
            paint={paint}
            finish={finish}
            rims={rims}
            interior={interior}
            doorsOpen={doorsOpen}
            lightsOn={lightsOn}
            title={title}
            onDoorClick={() => setDoorsOpen((d) => !d)}
          />
          {showHotspots &&
            hotspots
              .filter((h) => (view === 'interior' ? h.interior : !h.interior || doorsOpen))
              .map((h) => <Hotspot key={h.label} {...h} index={hotspots.indexOf(h)} portal={labelsRef} />)}
          {!lowPower && <Glow intensity={mood === 'night' ? 1.2 : 0.7} />}
        </Suspense>
        <Rig view={view} viewNonce={viewNonce} views={views} autoRotate={autoRotate} controlsRef={controlsRef} />
        <FovTween interior={view === 'interior'} />
        <SnapshotBridge onReady={setSnapshot} />
      </Canvas>
      <div ref={labelsRef} className="pointer-events-none absolute inset-0" />

      {/* Title */}
      <div className="pointer-events-none absolute left-4 top-4 max-w-[60%] sm:left-6 sm:top-6">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
          Interactive 3D
        </span>
        <h2 className="mt-2 text-xl font-bold leading-tight drop-shadow sm:text-3xl">{title}</h2>
        <p className="mt-1 hidden text-xs text-white/60 sm:block">
          Drag to rotate · Scroll to zoom · Click a door to open it
        </p>
      </div>

      {/* Quick actions */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 sm:right-6 sm:top-6">
        <IconButton active={autoRotate} onClick={() => setAutoRotate((v) => !v)} label="Turntable spin">
          <FaSyncAlt />
        </IconButton>
        <IconButton active={doorsOpen} onClick={() => setDoorsOpen((v) => !v)} label="Open / close doors">
          <FaDoorOpen />
        </IconButton>
        <IconButton active={lightsOn} onClick={() => setLightsOn((v) => !v)} label="Headlights">
          <FaLightbulb />
        </IconButton>
        <IconButton active={showHotspots} onClick={() => setShowHotspots((v) => !v)} label="Feature hotspots">
          <FaInfoCircle />
        </IconButton>
        <IconButton onClick={takeSnapshot} label="Save a photo">
          <FaCamera />
        </IconButton>
        <IconButton active={fullscreen} onClick={toggleFullscreen} label="Fullscreen">
          {fullscreen ? <FaCompress /> : <FaExpand />}
        </IconButton>
      </div>

      {/* Views */}
      <div className="absolute left-4 top-[5.5rem] flex max-w-[calc(100%-5.5rem)] gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur sm:left-1/2 sm:top-6 sm:max-w-none sm:-translate-x-1/2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:px-3.5 sm:text-sm ${
              view === v.id ? 'bg-white text-black' : 'text-white/75 hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'interior' && (
        <div className="pointer-events-none absolute left-1/2 top-[8.5rem] -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80 sm:top-[4.5rem]">
          Drag to look around the cabin
        </div>
      )}

      {/* Configurator */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-4 pt-10 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex gap-4 text-sm">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`border-b-2 pb-1 font-medium ${tab === t ? 'border-amber-500 text-white' : 'border-transparent text-white/55 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex min-h-[64px] items-center gap-3 overflow-x-auto pb-1">
              {tab === 'Paint' && (
                <>
                  {PAINTS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setPaint(p.hex)}
                      title={p.name}
                      aria-label={p.name}
                      className={`h-9 w-9 shrink-0 rounded-full border-2 shadow-inner ${paint === p.hex ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-white/30'}`}
                      style={{ background: `radial-gradient(circle at 30% 30%, #ffffff55, ${p.hex} 55%)` }}
                    />
                  ))}
                  <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-white/40" title="Custom colour">
                    <input type="color" value={paint} onChange={(e) => setPaint(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                    <span className="flex h-full w-full items-center justify-center text-lg text-white/70">+</span>
                  </label>
                  <div className="ml-2 flex shrink-0 gap-1 rounded-full bg-white/10 p-1">
                    {FINISHES.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFinish(f.id)}
                        className={`rounded-full px-3 py-1 text-xs ${finish === f.id ? 'bg-white text-black' : 'text-white/75'}`}
                      >
                        {f.name}
                        {f.price ? ` +$${f.price}` : ''}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {tab === 'Wheels' &&
                RIMS.map((r) => (
                  <OptionChip key={r.id} active={rims === r.id} onClick={() => setRims(r.id)} swatch={r.color} label={r.name} price={r.price} />
                ))}
              {tab === 'Interior' &&
                INTERIORS.map((t) => (
                  <OptionChip
                    key={t.id}
                    active={interior === t.id}
                    onClick={() => {
                      setInterior(t.id);
                      if (view !== 'interior') setDoorsOpen(true);
                    }}
                    swatch={t.seat}
                    label={t.name}
                    price={t.price}
                  />
                ))}
              {tab === 'Scene' &&
                Object.entries(MOODS).map(([id, m]) => (
                  <OptionChip key={id} active={mood === id} onClick={() => changeMood(id)} swatch={m.bg} label={m.label} />
                ))}
            </div>
            <p className="mt-1 truncate text-xs text-white/50">
              {paintName} · {options[0]?.name} · {options[1]?.name} wheels · {options[2]?.name} interior
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-white/50">Your build</div>
              <div className="text-xl font-bold">{total ? `$${total.toLocaleString()}` : 'POA'}</div>
              {extras > 0 && <div className="text-[11px] text-amber-400">incl. ${extras.toLocaleString()} options</div>}
            </div>
            {onEnquire && (
              <button
                type="button"
                onClick={handleEnquire}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
              >
                <FaPaperPlane /> Enquire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionChip({ active, onClick, swatch, label, price }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
        active ? 'border-amber-400 bg-white/15 text-white' : 'border-white/15 text-white/75 hover:bg-white/10'
      }`}
    >
      <span className="h-5 w-5 rounded-full border border-white/30" style={{ background: swatch }} />
      {label}
      {price ? <span className="text-xs text-amber-400">+${price}</span> : null}
    </button>
  );
}

/** Widen the lens when sitting inside the car. */
function FovTween({ interior }) {
  useFrame(({ camera }, dt) => {
    const target = interior ? 72 : 38;
    if (Math.abs(camera.fov - target) < 0.05) return;
    camera.fov += (target - camera.fov) * Math.min(1, dt * 3);
    camera.updateProjectionMatrix();
  });
  return null;
}
