/**
 * Lighting "moods" for the 3D scenes. Reflections come from Lightformers
 * rendered into an environment map locally, so nothing is downloaded.
 */

import React from 'react';
import { Environment, Lightformer, ContactShadows } from '@react-three/drei';
import { MOODS } from './moods';

export function MoodLighting({ mood = 'studio' }) {
  const m = MOODS[mood] || MOODS.studio;
  return (
    <>
      <color attach="background" args={[m.bg]} />
      <fog attach="fog" args={[m.bg, 14, 34]} />
      <ambientLight intensity={m.ambient} />
      <directionalLight position={[5, 8, 4]} intensity={mood === 'night' ? 0.45 : 1.2} color={m.key} />
      <Environment key={mood} resolution={256} frames={1} environmentIntensity={m.envIntensity}>
        <color attach="background" args={[m.bg]} />
        {m.forms.map((f, i) => (
          <Lightformer key={i} form="rect" {...f} />
        ))}
      </Environment>
    </>
  );
}

/** Floor disc + soft contact shadow under a single car. */
export function StudioFloor({ mood = 'studio', radius = 3.4 }) {
  const m = MOODS[mood] || MOODS.studio;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color={m.floor} roughness={0.85} />
      </mesh>
      {/* turntable */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[radius, 96]} />
        <meshStandardMaterial color={m.floor} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[radius - 0.03, radius, 128]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={mood === 'day' ? 0.3 : 1.4} />
      </mesh>
      <ContactShadows position={[0, 0.008, 0]} scale={radius * 2.4} blur={2.4} opacity={mood === 'day' ? 0.55 : 0.8} far={2} resolution={512} />
    </group>
  );
}
