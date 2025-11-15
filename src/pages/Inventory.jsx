/**
 * Inventory Page
 * Displays all cars with filtering, sorting, and responsive grid layout
 */

import React, { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import { carsData } from '../data/mockData';
import { FaSort } from 'react-icons/fa';

const Inventory = () => {
  const [filters, setFilters] = useState({ make: '', model: '', minPrice: '', maxPrice: '' });
  const [sortBy, setSortBy] = useState('featured');
  const [gridCols, setGridCols] = useState('3');

  // Filter and sort logic
  const filteredAndSortedCars = useMemo(() => {
    let result = carsData.filter(car => {
      const matchMake = !filters.make || car.make === filters.make;
      const matchModel = !filters.model || car.model === filters.model;
      const matchMinPrice = !filters.minPrice || car.price >= parseInt(filters.minPrice);
      const matchMaxPrice = !filters.maxPrice || car.price <= parseInt(filters.maxPrice);
      return matchMake && matchModel && matchMinPrice && matchMaxPrice;
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'mileage':
        result.sort((a, b) => a.mileage - b.mileage);
        break;
      default:
        break;
    }

    return result;
  }, [filters, sortBy]);

  return (
    <main className="min-h-screen bg-white pb-24">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Inventory</h1>
            <p className="text-gray-600 text-base">Browse our selection of quality vehicles.</p>
          </div>

          {/* Search Bar */}
          <SearchBar onFilter={setFilters} cars={carsData} />

          {/* Sorting and View Options */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex items-center space-x-3 mb-3 md:mb-0">
              <FaSort className="text-gray-600" />
              <label className="font-medium text-gray-800">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-md focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="mileage">Lowest Mileage</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Grid:</span>
              <select
                value={gridCols}
                onChange={(e) => setGridCols(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-md focus:outline-none"
              >
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {filteredAndSortedCars.length > 0 ? (
            <div className={`grid grid-cols-1 ${gridCols === '2' ? 'md:grid-cols-2' : gridCols === '4' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 md:gap-8`}>
              {filteredAndSortedCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-20 text-lg">No cars found matching your criteria.</div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Inventory;
