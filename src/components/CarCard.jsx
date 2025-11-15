/**
 * Car Card Component
 * Displays a single car with image, details, and CTA button
 * Used in inventory listings and featured sections
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGasPump, FaDollarSign, FaTachometerAlt } from 'react-icons/fa';

const genericFallback =
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=500&h=400&fit=crop'; // A generic car illustration

const CarCard = ({ car, featured = false }) => {
  const [imgSrc, setImgSrc] = useState(car.image);
  return (
    <div
      className={`relative group ${featured ? 'col-span-1 md:col-span-2 lg:col-span-1' : ''} bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition transform hover:-translate-y-1`}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-44 bg-gray-50 flex items-center justify-center">
        <img
          src={imgSrc}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgSrc(genericFallback)}
        />
        {car.year && (
          <div className="absolute top-3 right-3 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
            {car.year}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {car.make} {car.model}
        </h3>

        <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
          <div className="flex items-center space-x-2">
            <FaTachometerAlt className="text-gray-500" />
            <span>{car.mileage?.toLocaleString() || 'N/A'} km</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaGasPump className="text-gray-500" />
            <span>{car.fuelType || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Price</div>
            <div className="text-lg font-bold text-gray-900">{car.price ? car.price.toLocaleString() : 'Contact'}</div>
          </div>

          <Link
            to={`/car/${car.id}`}
            className="ml-4 inline-flex items-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:opacity-90"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
