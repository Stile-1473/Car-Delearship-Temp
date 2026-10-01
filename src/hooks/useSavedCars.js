/**
 * Saved (favourite) cars, kept in this browser's localStorage and kept in sync
 * across every component and tab that uses the hook.
 */

import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'zimcar:saved';
const EVENT = 'zimcar:saved-change';

function read() {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

// useSyncExternalStore needs a stable snapshot between changes
let cache = null;
function snapshot() {
  if (cache === null) cache = read();
  return cache;
}

function subscribe(onChange) {
  const handler = (e) => {
    if (e.type === 'storage') {
      if (e.key !== KEY) return;
      cache = null; // changed in another tab
    }
    onChange();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

const EMPTY = [];

export default function useSavedCars() {
  const saved = useSyncExternalStore(subscribe, snapshot, () => EMPTY);

  const toggle = useCallback((id) => {
    const ids = snapshot();
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage unavailable (private mode etc.) — keep it for this page view only
    }
    cache = next;
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const isSaved = useCallback((id) => saved.includes(id), [saved]);

  return { saved, isSaved, toggle };
}
