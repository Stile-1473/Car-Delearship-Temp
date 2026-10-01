/**
 * Tiny localStorage-backed list of car ids, shared by every component (and tab)
 * that uses the returned hook. Used for saved cars and the compare list.
 */

import { useCallback, useSyncExternalStore } from 'react';

const EMPTY = [];

export function createListStore(key, { max = Infinity } = {}) {
  const event = `${key}:change`;
  let cache = null;

  const read = () => {
    try {
      const ids = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  };

  // useSyncExternalStore needs a stable snapshot between changes
  const snapshot = () => {
    if (cache === null) cache = read();
    return cache;
  };

  const write = (next) => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // storage unavailable (private mode etc.) — keep it for this page view only
    }
    cache = next;
    window.dispatchEvent(new Event(event));
  };

  const subscribe = (onChange) => {
    const handler = (e) => {
      if (e.type === 'storage') {
        if (e.key !== key) return;
        cache = null; // changed in another tab
      }
      onChange();
    };
    window.addEventListener(event, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(event, handler);
      window.removeEventListener('storage', handler);
    };
  };

  return function useList() {
    const ids = useSyncExternalStore(subscribe, snapshot, () => EMPTY);

    /** Add or remove an id. Returns false if the list is full and nothing changed. */
    const toggle = useCallback((id) => {
      const cur = snapshot();
      if (cur.includes(id)) {
        write(cur.filter((x) => x !== id));
        return true;
      }
      if (cur.length >= max) return false;
      write([...cur, id]);
      return true;
    }, []);

    const set = useCallback((next) => write([...new Set(next)].slice(0, max)), []);
    const has = useCallback((id) => ids.includes(id), [ids]);

    return { ids, has, toggle, set, max };
  };
}
