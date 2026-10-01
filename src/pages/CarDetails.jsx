/**
 * Car Details Page
 * Displays detailed information about a specific car
 * Includes: Interactive 3D viewer/configurator, specs, gallery, and inquiry form
 */

import React, { Suspense, lazy, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import { carsData } from '../data/mockData';

// three.js is heavy, so it is only downloaded when a car page is opened
const CarViewer = lazy(() => import('../components/three/CarViewer'));

const ViewerFallback = () => (
  <div className="flex h-[78vh] min-h-[560px] items-center justify-center rounded-2xl bg-black text-white/70">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-amber-500" />
  </div>
);

const CarDetails = () => {
  const { id } = useParams();
  const car = carsData.find(c => String(c.id) === String(id));
  const [build, setBuild] = useState(null);
  if (!car) return <div className="text-center text-gray-600 py-20 text-lg">Car not found.</div>;

  const handleEnquire = (b) => {
    setBuild(b);
    requestAnimationFrame(() => document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' }));
  };

  const buildMessage = build
    ? `Hi ZimCar, I'm interested in the ${build.title} configured as:\n` +
      `• Paint: ${build.paint} (${build.finish})\n• Wheels: ${build.rims}\n• Interior: ${build.interior}\n` +
      `Build price shown: $${build.total.toLocaleString()}.\nPlease contact me about availability and finance.`
    : '';

  return (
    <main className="min-h-screen bg-white pb-16">
      <section id="viewer" className="bg-neutral-950 px-2 pt-2 sm:px-4 sm:pt-4">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<ViewerFallback />}>
            <CarViewer car={car} onEnquire={handleEnquire} />
          </Suspense>
        </div>
      </section>

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
                href="#enquire"
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
        <div id="enquire" className="max-w-2xl mx-auto mt-8 px-4 scroll-mt-20">
          <ContactForm
            key={buildMessage}
            title={`Inquire About This ${car.year} ${car.make} ${car.model}`}
            initialSubject={build ? `3D build: ${build.title}` : ''}
            initialMessage={buildMessage}
          />
        </div>
      </section>
    </main>
  );
};

export default CarDetails;
