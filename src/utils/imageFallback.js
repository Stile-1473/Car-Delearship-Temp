/**
 * onError handler that swaps in a backup image once. (Setting `img.onerror = null`
 * doesn't detach React's handler, so a failing backup would otherwise retry forever.)
 */
export const fallbackTo = (url) => (e) => {
  const img = e.currentTarget;
  if (img.dataset.fellBack) return;
  img.dataset.fellBack = '1';
  img.src = url;
};
