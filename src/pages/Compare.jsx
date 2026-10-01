/**
 * Compare Page
 * Up to three cars side by side: 3D line-up, key numbers with the best value
 * highlighted, and a feature checklist. The selection lives in the URL
 * (?ids=1,5,9) so a comparison can be shared.
 */

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaTimes, FaCube, FaWhatsapp, FaCheck, FaMinus, FaShareAlt, FaPlus } from 'react-icons/fa';
import useCompare, { COMPARE_MAX } from '../hooks/useCompare';
import SaveButton from '../components/SaveButton';
import { carsData } from '../data/mockData';
import { fromMonthly, usd } from '../utils/finance';
import { whatsappLink, carTitle } from '../utils/whatsapp';

const Compare3D = lazy(() => import('../components/three/Compare3D'));

const BODY_LABELS = { sedan: 'Sedan', hatch: 'Hatchback', suv: 'SUV', pickup: 'Bakkie / pickup', roadster: 'Sports convertible' };

// best: 'min' | 'max' highlights the winning value in green
const ROWS = [
  { label: 'Price', get: (c) => c.price, fmt: usd, best: 'min' },
  { label: 'Finance from', get: (c) => fromMonthly(c.price), fmt: (v) => `${usd(v)}/mo`, best: 'min' },
  { label: 'Year', get: (c) => c.year, fmt: String, best: 'max' },
  { label: 'Mileage', get: (c) => c.mileage, fmt: (v) => `${v.toLocaleString()} km`, best: 'min' },
  { label: 'Body style', get: (c) => BODY_LABELS[c.bodyType] || c.bodyType },
  { label: 'Fuel', get: (c) => c.fuelType },
  { label: 'Gearbox', get: (c) => c.transmission },
  { label: 'Colour', get: (c) => c.color },
];

const photoFallback = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=300&fit=crop';

function winners(row, cars) {
  if (!row.best || cars.length < 2) return new Set();
  const vals = cars.map(row.get);
  const target = row.best === 'min' ? Math.min(...vals) : Math.max(...vals);
  // no highlight when every car ties
  if (vals.every((v) => v === target)) return new Set();
  return new Set(cars.filter((c, i) => vals[i] === target).map((c) => c.id));
}

const Compare = () => {
  const { ids, toggle, set } = useCompare();
  const [params, setParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);

  // A shared link (?ids=...) wins over whatever was stored on this device
  useEffect(() => {
    const fromUrl = (params.get('ids') || '')
      .split(',')
      .map(Number)
      .filter((id) => carsData.some((c) => c.id === id));
    if (fromUrl.length) set(fromUrl);
    hydrated.current = true;
    // only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    setParams(ids.length ? { ids: ids.join(',') } : {}, { replace: true });
  }, [ids, setParams]);

  const cars = ids.map((id) => carsData.find((c) => c.id === id)).filter(Boolean);
  const available = carsData.filter((c) => !ids.includes(c.id));
  const features = [...new Set(cars.flatMap((c) => c.features))];
  const cols = cars.length + (cars.length < COMPARE_MAX ? 1 : 0);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: 'ZimCar comparison', url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // share sheet dismissed
    }
  };

  const helpMessage =
    `Hi ZimCar, I'm comparing ${cars.map(carTitle).join(', ')}. Can you help me choose?\n` +
    (typeof window !== 'undefined' ? window.location.href : '');

  const addPicker = (
    <select
      value=""
      onChange={(e) => e.target.value && toggle(Number(e.target.value))}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
      aria-label="Add a car to compare"
    >
      <option value="">Choose a car…</option>
      {available.map((c) => (
        <option key={c.id} value={c.id}>
          {carTitle(c)} · {usd(c.price)}
        </option>
      ))}
    </select>
  );

  return (
    <main className="min-h-screen bg-white pb-28">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">Compare cars</h1>
            <p className="mt-1 text-gray-600">Pick up to {COMPARE_MAX} cars to see them side by side.</p>
          </div>
          {cars.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                {copied ? <FaCheck className="text-green-600" /> : <FaShareAlt />} {copied ? 'Link copied' : 'Share comparison'}
              </button>
              <a
                href={whatsappLink(helpMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <FaWhatsapp /> Help me choose
              </a>
            </div>
          )}
        </div>

        {cars.length === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
            <p className="text-gray-700">No cars selected yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Tap <span className="font-medium">Compare</span> on any car in the inventory, or start here:
            </p>
            <div className="mx-auto mt-5 max-w-sm">{addPicker}</div>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <Suspense fallback={<div className="h-[46vh] min-h-[340px] rounded-2xl bg-[#0c0e12]" />}>
                <Compare3D cars={cars} />
              </Suspense>
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <colgroup>
                  <col className="w-40" />
                  {Array.from({ length: cols }).map((_, i) => (
                    <col key={i} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="align-top">
                    <th className="sticky left-0 bg-white p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500" />
                    {cars.map((c, i) => (
                      <th key={c.id} className="border-l border-gray-100 p-4 text-left font-normal">
                        <div className="relative">
                          <img
                            src={c.image}
                            alt={carTitle(c)}
                            className="h-32 w-full rounded-lg object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = photoFallback;
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => toggle(c.id)}
                            aria-label={`Remove ${carTitle(c)}`}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                          <SaveButton carId={c.id} className="absolute left-2 top-2 h-7 w-7 rounded-full bg-white/90 text-sm text-gray-700 shadow" />
                        </div>
                        <div className="mt-3 text-xs text-gray-500">#{i + 1}</div>
                        <div className="text-base font-semibold text-gray-900">{carTitle(c)}</div>
                        <Link to={`/car/${c.id}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:underline">
                          <FaCube /> View in 3D &amp; interior
                        </Link>
                      </th>
                    ))}
                    {cars.length < COMPARE_MAX && (
                      <th className="border-l border-gray-100 p-4 text-left font-normal">
                        <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400">
                          <FaPlus />
                          <span className="text-xs">Add a car</span>
                        </div>
                        <div className="mt-3">{addPicker}</div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => {
                    const win = winners(row, cars);
                    return (
                      <tr key={row.label} className="border-t border-gray-100">
                        <th scope="row" className="sticky left-0 bg-white p-4 text-left font-medium text-gray-600">
                          {row.label}
                        </th>
                        {cars.map((c) => {
                          const v = row.get(c);
                          const best = win.has(c.id);
                          return (
                            <td key={c.id} className={`border-l border-gray-100 p-4 ${best ? 'bg-green-50' : ''}`}>
                              <span className={best ? 'font-semibold text-green-700' : 'text-gray-900'}>{row.fmt ? row.fmt(v) : v}</span>
                              {best && <span className="ml-2 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Best</span>}
                            </td>
                          );
                        })}
                        {cars.length < COMPARE_MAX && <td className="border-l border-gray-100" />}
                      </tr>
                    );
                  })}
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <th colSpan={cols + 1} className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Features
                    </th>
                  </tr>
                  {features.map((f) => (
                    <tr key={f} className="border-t border-gray-100">
                      <th scope="row" className="sticky left-0 bg-white p-4 text-left font-normal text-gray-700">
                        {f}
                      </th>
                      {cars.map((c) => (
                        <td key={c.id} className="border-l border-gray-100 p-4">
                          {c.features.includes(f) ? (
                            <FaCheck className="text-green-600" aria-label="Yes" />
                          ) : (
                            <FaMinus className="text-gray-300" aria-label="No" />
                          )}
                        </td>
                      ))}
                      {cars.length < COMPARE_MAX && <td className="border-l border-gray-100" />}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">Finance figures are estimates at the default deposit, term and rate.</p>
          </>
        )}
      </section>
    </main>
  );
};

export default Compare;
