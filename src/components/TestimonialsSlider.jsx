/**
 * Testimonials Slider Component
 * Displays customer reviews with carousel functionality
 */

import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';

const avatarFallback = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format';

const TestimonialsSlider = ({ testimonials }) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((current + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) return null;

  const testimonial = testimonials[current];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-900">
          What Our Customers Say
        </h2>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 md:p-8">
          {/* Testimonial Content */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={testimonial.image || avatarFallback}
                alt={testimonial.name}
                onError={(e) => { e.target.onerror = null; e.target.src = avatarFallback; }}
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              {/* Stars */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" size={18} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-base text-gray-700 mb-4">
                “{testimonial.content}”
              </p>

              {/* Author */}
              <div>
                <p className="font-bold text-dark-900">{testimonial.name}</p>
                <p className="text-gray-600 text-sm">{testimonial.position}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft size={18} />
            </button>

            {/* Indicators */}
            <div className="flex gap-2 items-center">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    idx === current ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Next testimonial"
            >
              <FaChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
