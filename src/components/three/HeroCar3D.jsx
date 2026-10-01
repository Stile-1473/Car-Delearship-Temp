/**
 * HeroCar3D
 * Slowly revolving car for the homepage hero. Drag to spin it.
 */

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls } from '@react-three/drei';
import ProceduralCar from './ProceduralCar';
import { MoodLighting, StudioFloor } from './StudioEnvironment';
import { paintForColor } from './paints';
import Glow from './Glow';
import useLowPower from './useLowPower';

function Spinner({ children }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.18;
  });
  return <group ref={ref}>{children}</group>;
}

export default function HeroCar3D({ car }) {
  const lowPower = useLowPower();
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [4.8, 1.7, 5.4], fov: 36 }}>
      <Suspense fallback={null}>
        <MoodLighting mood="studio" />
        <group position={[0, -0.6, 0]}>
          <StudioFloor mood="studio" radius={3} />
          <PresentationControls global={false} snap polar={[0, 0]} azimuth={[-Infinity, Infinity]} speed={1.5}>
            <Spinner>
              <ProceduralCar
                bodyType={car.bodyType}
                paint={paintForColor(car.color)}
                finish="gloss"
                lightsOn
                castLights={false}
                title={`${car.make} ${car.model}`}
              />
            </Spinner>
          </PresentationControls>
        </group>
        {!lowPower && <Glow intensity={0.9} />}
      </Suspense>
    </Canvas>
  );
}
