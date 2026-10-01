/**
 * Toggle a car in/out of the compare list (max 3).
 */

import React, { useState } from 'react';
import { FaBalanceScale, FaCheck } from 'react-icons/fa';
import useCompare from '../hooks/useCompare';

const CompareButton = ({ carId, className = '', withLabel = false }) => {
  const { has, toggle, ids, max } = useCompare();
  const [full, setFull] = useState(false);
  const active = has(carId);
  const label = active ? 'In compare' : full ? `Max ${max} cars` : 'Compare';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!toggle(carId)) {
          setFull(true);
          setTimeout(() => setFull(false), 1800);
        }
      }}
      aria-pressed={active}
      aria-label={active ? 'Remove from compare' : 'Add to compare'}
      title={!active && ids.length >= max ? `You can compare up to ${max} cars` : label}
      className={`inline-flex items-center justify-center gap-2 ${full ? 'ring-2 ring-red-400' : ''} ${className}`}
    >
      {active ? <FaCheck className="text-amber-500" /> : <FaBalanceScale />}
      {withLabel && <span>{label}</span>}
    </button>
  );
};

export default CompareButton;
