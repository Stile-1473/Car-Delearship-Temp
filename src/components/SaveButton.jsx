/**
 * Heart toggle for saving a car to the visitor's shortlist.
 */

import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useSavedCars from '../hooks/useSavedCars';

const SaveButton = ({ carId, className = '', withLabel = false }) => {
  const { isSaved, toggle } = useSavedCars();
  const saved = isSaved(carId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(carId);
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved cars' : 'Save this car'}
      title={saved ? 'Saved' : 'Save'}
      className={`inline-flex items-center justify-center gap-2 ${className}`}
    >
      {saved ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
      {withLabel && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
};

export default SaveButton;
