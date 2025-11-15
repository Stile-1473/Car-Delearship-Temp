/**
 * Car Details Page
 * Displays detailed information about a specific car
 * Includes: Image gallery, specs, financing info, and inquiry form
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaShare, FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import ContactForm from '../components/ContactForm';
import { carsData } from '../data/mockData';

const CarDetails = () => {
  const { id } = useParams();
  const car = carsData.find(c => String(c.id) === String(id));
  if (!car) return <div className="text-center text-gray-600 py-20 text-lg">Car not found.</div>;

  return (
    <main className="min-h-screen bg-white pb-16">
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col md:flex-row gap-8 items-start">
            <img
              src={car.image}
              alt={`${car.make} ${car.model}`}
              className="w-full md:w-1/2 rounded-lg shadow-sm border border-gray-100 object-contain max-h-96"
              onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop'; }}
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">{car.year} {car.make} {car.model}</h1>
              <p className="text-gray-700 mb-4">{car.description}</p>

              <div className="flex flex-wrap gap-3 mb-6 text-sm text-gray-700">
                <div className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200">Year: {car.year}</div>
                <div className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200">Price: {car.price ? `$${car.price.toLocaleString()}` : 'Contact'}</div>
                <div className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200">Mileage: {car.mileage?.toLocaleString() || 'N/A'} km</div>
              </div>

              <a
                href="/contact"
                className="inline-block bg-black text-white px-6 py-2 rounded-md font-medium hover:opacity-95"
              >
                Enquire Now
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Features</h2>
            <ul className="list-disc list-inside text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
              {car.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Gallery */}
          {car.gallery && car.gallery.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {car.gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${car.make} ${car.model} gallery ${idx + 1}`}
                    className="rounded-md border border-gray-100 object-cover h-40 w-full"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=300&fit=crop'; }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto mt-8 px-4">
          <ContactForm title={`Inquire About This ${car.year} ${car.make} ${car.model}`} />
        </div>
      </section>
    </main>
  );
};

export default CarDetails;
