/**
 * Saved (favourite) cars, kept in this browser's localStorage.
 */

import { createListStore } from './listStore';

const useSavedList = createListStore('zimcar:saved');

export default function useSavedCars() {
  const { ids, has, toggle } = useSavedList();
  return { saved: ids, isSaved: has, toggle };
}
