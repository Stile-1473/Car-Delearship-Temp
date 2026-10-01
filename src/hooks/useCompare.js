/**
 * Cars picked for side-by-side comparison (up to 3), kept in localStorage.
 */

import { createListStore } from './listStore';

export const COMPARE_MAX = 3;

const useCompare = createListStore('zimcar:compare', { max: COMPARE_MAX });

export default useCompare;
