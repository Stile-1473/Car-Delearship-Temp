/**
 * Showroom Page
 * Full-screen virtual 3D showroom of the whole inventory.
 */

import React, { Suspense, lazy } from 'react';
import { carsData } from '../data/mockData';

const Showroom3D = lazy(() => import('../components/three/Showroom3D'));

const Loading = () => (
  <div className="flex h-[calc(100vh-4rem)] min-h-[600px] flex-col items-center justify-center gap-3 bg-[#07080b] text-white/70">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-amber-500" />
    <span className="text-xs uppercase tracking-widest">Opening the showroom</span>
  </div>
);

const Showroom = () => (
  <Suspense fallback={<Loading />}>
    <Showroom3D cars={carsData} />
  </Suspense>
);

export default Showroom;
