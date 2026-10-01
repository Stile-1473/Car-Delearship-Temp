/**
 * Scrolls to the top on page change, or to the #section in the URL.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // the target may render a moment later (lazy sections)
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(hash.slice(1));
      if (el || ++tries > 20) {
        clearInterval(timer);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [pathname, hash]);
  return null;
};

export default ScrollManager;
