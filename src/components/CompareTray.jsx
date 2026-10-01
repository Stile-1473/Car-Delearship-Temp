/**
 * Floating tray showing the cars picked for comparison, with a link to /compare.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBalanceScale, FaTimes } from 'react-icons/fa';
import useCompare from '../hooks/useCompare';
import { carsData } from '../data/mockData';

const CompareTray = () => {
  const { pathname } = useLocation();
  const { ids, toggle, set, max } = useCompare();
  const cars = ids.map((id) => carsData.find((c) => c.id === id)).filter(Boolean);
  if (!cars.length || pathname === '/compare') return null;

  // car pages have their own sticky bar on mobile, so sit above it
  const onCarPage = pathname.startsWith('/car/');

  return (
    <div
      className={`fixed left-3 z-40 flex max-w-[calc(100%-6rem)] items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur sm:left-5 ${
        onCarPage ? 'bottom-24 lg:bottom-5' : 'bottom-5'
      }`}
    >
      <div className="hidden items-center gap-1 sm:flex">
        {cars.map((c) => (
          <span key={c.id} className="flex items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-xs font-medium text-gray-800">
            {c.make} {c.model}
            <button
              type="button"
              onClick={() => toggle(c.id)}
              aria-label={`Remove ${c.make} ${c.model} from compare`}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
            >
              <FaTimes className="text-[10px]" />
            </button>
          </span>
        ))}
        {Array.from({ length: max - cars.length }).map((_, i) => (
          <span key={i} className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-400">
            + add
          </span>
        ))}
      </div>
      <Link
        to={`/compare?ids=${ids.join(',')}`}
        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
      >
        <FaBalanceScale className="text-amber-400" /> Compare ({cars.length})
      </Link>
      <button type="button" onClick={() => set([])} className="px-2 text-xs text-gray-500 hover:text-black">
        Clear
      </button>
    </div>
  );
};

export default CompareTray;
