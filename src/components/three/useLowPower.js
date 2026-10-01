import { useState } from 'react';

/** Phones and small tablets skip the heavier effects (bloom, floor reflections). */
export default function useLowPower() {
  const [low] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches);
  return low;
}
