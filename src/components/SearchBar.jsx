/**
 * Search Bar Component
 * Filters cars by make, model, year, and price range
 */

import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onFilter, cars = [] }) => {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
  });

  // Extract unique makes and models from cars
  const makes = [...new Set(cars.map(car => car.make))];
  const models = cars
    .filter(car => !filters.make || car.make === filters.make)
    .map(car => car.model);
  const uniqueModels = [...new Set(models)];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setFilters({ make: '', model: '', minPrice: '', maxPrice: '' });
    onFilter({ make: '', model: '', minPrice: '', maxPrice: '' });
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-gray-900">
        <FaSearch className="text-gray-600" />
        <span>Find your perfect car</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Make Filter */}
        <select
          name="make"
          value={filters.make}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
        >
          <option value="">All Makes</option>
          {makes.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>

        {/* Model Filter */}
        <select
          name="model"
          value={filters.model}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
        >
          <option value="">All Models</option>
          {uniqueModels.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        {/* Min Price Filter */}
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
        />

        {/* Max Price Filter */}
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
        />

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
