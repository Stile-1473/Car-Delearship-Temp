/**
 * Post-processing: bloom so headlights, light strips and the turntable ring
 * glow. The composer replaces the renderer's tone mapping, so it is re-applied here.
 */

import React from 'react';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export default function Glow({ intensity = 0.8 }) {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={intensity} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
