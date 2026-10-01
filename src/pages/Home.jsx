/**
 * Home Page
 * Includes: Hero section, Featured cars, Promotions, Testimonials, Newsletter
 */

import React, { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaArrowRight } from 'react-icons/fa';
import CarCard from '../components/CarCard';
import TestimonialsSlider from '../components/TestimonialsSlider';
import { carsData, testimonials, promotions } from '../data/mockData';
import { fallbackTo } from '../utils/imageFallback';

const HeroCar3D = lazy(() => import('../components/three/HeroCar3D'));
const heroCar = carsData.find(c => c.bodyType === 'roadster') || carsData[0];

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
      <section className="relative overflow-hidden bg-[#0c0e12] text-white">
        <div className="absolute inset-0 md:left-[30%]">
          <Suspense fallback={null}>
            <HeroCar3D car={heroCar} />
          </Suspense>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0c0e12] via-[#0c0e12]/70 to-transparent md:via-[#0c0e12]/40" />
        <div className="pointer-events-none relative max-w-7xl mx-auto px-6 pt-16 pb-[52vh] md:py-36">
          <span className="inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
            Zimbabwe&apos;s first 3D car showroom
          </span>
          <h1 className="mt-5 max-w-xl text-4xl md:text-6xl font-extrabold leading-tight">
            See every car <span className="text-amber-400">inside &amp; out</span> before you visit.
          </h1>
          <p className="mt-5 max-w-lg text-white/70">
            Walk our virtual showroom, open the doors, sit in the driver&apos;s seat and build your spec in real time. Transparent pricing, fast support.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
            <Link to="/showroom" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black hover:bg-amber-400">
              Enter 3D Showroom <FaArrowRight />
            </Link>
            <Link to="/inventory" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 font-medium text-white hover:bg-white/10">
              Browse Inventory
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/60">
            <div><span className="block text-2xl font-bold text-white">{carsData.length}</span>cars in 3D</div>
            <div><span className="block text-2xl font-bold text-white">360°</span>interiors</div>
            <div><span className="block text-2xl font-bold text-white">Live</span>configurator</div>
          </div>
        </div>
        <Link
          to={`/car/${heroCar.id}`}
          className="absolute bottom-5 right-5 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs text-white/80 backdrop-blur hover:bg-white/10"
        >
          {heroCar.year} {heroCar.make} {heroCar.model} · ${heroCar.price.toLocaleString()} — drag to spin
        </Link>
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
                    onError={fallbackTo('https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop')}
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
