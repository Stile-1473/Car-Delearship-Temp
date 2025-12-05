/**
 * Home Page
 * Includes: Hero section, Featured cars, Promotions, Testimonials, Newsletter
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaArrowRight } from 'react-icons/fa';
import CarCard from '../components/CarCard';
import TestimonialsSlider from '../components/TestimonialsSlider';
import { carsData, testimonials, promotions } from '../data/mockData';

const Home = () => {
  const featuredCars = carsData.slice(0, 3);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section  */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">ZimCar — Modern car buying, simplified</h1>
            <p className="text-gray-600 mb-8">Browse curated vehicles, transparent pricing, and fast support. Trusted in Zimbabwe.</p>
            <div className="flex gap-3">
              <Link to="/inventory" className="inline-block bg-black text-white px-4 py-2 rounded font-medium">Browse Inventory</Link>
              <Link to="/contact" className="inline-block border border-gray-200 text-gray-800 px-4 py-2 rounded">Contact Sales</Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&h=600&fit=crop" alt="Car" className="w-full rounded shadow" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop'; }} />
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
              Featured Cars
            </h2>
            <p className="text-gray-600">
              Browse our latest arrivals—quality vehicles for every need.
            </p>
          </div>
          {/* Featured Cars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          {/* View All Button */}
          <div className="text-center">
            <Link
              to="/inventory"
              className="inline-block bg-black text-white px-6 py-2 rounded-md font-medium hover:opacity-95"
            >
              View All Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
              Special Promotions
            </h2>
            <p className="text-gray-600">
              Limited-time offers you won't want to miss
            </p>
          </div>

          {/* Promotions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.map(promo => (
              <div
                key={promo.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop'; }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{promo.title}</h3>
                    <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold ml-2">
                      {promo.discount}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{promo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSlider testimonials={testimonials} />

      {/* Newsletter Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900">
            Stay Updated
          </h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for latest deals and news about new vehicles
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 rounded-md border border-gray-200"
              required
            />
            <button
              type="submit"
              className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <p className="text-gray-700 mt-3">
              Thanks for subscribing!
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
