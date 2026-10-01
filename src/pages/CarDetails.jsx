/**
 * Car Details Page
 * Interactive 3D viewer/configurator, key specs, finance calculator,
 * test drive booking, photos, and an enquiry form.
 */

import React, { Suspense, lazy, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaWhatsapp,
  FaCalendarAlt,
  FaShareAlt,
  FaCheck,
  FaTachometerAlt,
  FaGasPump,
  FaCogs,
  FaPalette,
  FaCalendar,
  FaChevronLeft,
} from 'react-icons/fa';
import ContactForm from '../components/ContactForm';
import FinanceCalculator from '../components/FinanceCalculator';
import TestDriveBooking from '../components/TestDriveBooking';
import SaveButton from '../components/SaveButton';
import CompareButton from '../components/CompareButton';
import { carsData } from '../data/mockData';
import { fromMonthly, usd } from '../utils/finance';
import { whatsappLink, carTitle, carUrl } from '../utils/whatsapp';
import { fallbackTo } from '../utils/imageFallback';

// three.js is heavy, so it is only downloaded when a car page is opened
const CarViewer = lazy(() => import('../components/three/CarViewer'));

const ViewerFallback = () => (
  <div className="flex h-[78vh] min-h-[560px] items-center justify-center rounded-2xl bg-black text-white/70">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-amber-500" />
  </div>
);

const photoFallback = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop';

const Spec = ({ icon, label, value }) => (
  <div className="rounded-xl border border-gray-200 p-3">
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      {icon} {label}
    </div>
    <div className="mt-1 font-semibold text-gray-900">{value}</div>
  </div>
);

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const CarDetails = () => {
  const { id } = useParams();
  const car = carsData.find(c => String(c.id) === String(id));
  const [build, setBuild] = useState(null);
  const [copied, setCopied] = useState(false);
  if (!car) return <div className="text-center text-gray-600 py-20 text-lg">Car not found.</div>;

  const title = carTitle(car);
  const photos = [car.image, ...(car.gallery || [])].filter((p, i, a) => a.indexOf(p) === i);
  const askMessage = `Hi ZimCar, is the ${title} (${usd(car.price)}) still available?\n${carUrl(car)}`;

  const handleEnquire = (b) => {
    setBuild(b);
    requestAnimationFrame(() => scrollTo('enquire'));
  };

  const share = async () => {
    const data = { title: `${title} — ZimCar`, text: `${title} for ${usd(car.price)}`, url: carUrl(car) };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // share sheet dismissed
    }
  };

  const buildMessage = build
    ? `Hi ZimCar, I'm interested in the ${build.title} configured as:\n` +
      `• Paint: ${build.paint} (${build.finish})\n• Wheels: ${build.rims}\n• Interior: ${build.interior}\n` +
      `Build price shown: $${build.total.toLocaleString()}.\nPlease contact me about availability and finance.`
    : '';

  return (
    <main className="min-h-screen bg-white pb-24 lg:pb-16">
      <section id="viewer" className="bg-neutral-950 px-2 pt-2 sm:px-4 sm:pt-4">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<ViewerFallback />}>
            <CarViewer car={car} onEnquire={handleEnquire} />
          </Suspense>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/inventory" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black">
            <FaChevronLeft className="text-xs" /> Back to inventory
          </Link>

          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            {/* Overview */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{title}</h1>
                  <p className="mt-2 max-w-2xl text-gray-600">{car.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-gray-900">{usd(car.price)}</div>
                  <div className="text-sm text-gray-500">or from {usd(fromMonthly(car.price))}/month</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Spec icon={<FaCalendar />} label="Year" value={car.year} />
                <Spec icon={<FaTachometerAlt />} label="Mileage" value={`${car.mileage?.toLocaleString() || 'N/A'} km`} />
                <Spec icon={<FaGasPump />} label="Fuel" value={car.fuelType} />
                <Spec icon={<FaCogs />} label="Gearbox" value={car.transmission} />
                <Spec icon={<FaPalette />} label="Colour" value={car.color} />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={whatsappLink(askMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
                >
                  <FaWhatsapp /> WhatsApp us
                </a>
                <button
                  type="button"
                  onClick={() => scrollTo('test-drive')}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white hover:bg-black"
                >
                  <FaCalendarAlt /> Book test drive
                </button>
                <SaveButton carId={car.id} withLabel className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-800 hover:bg-gray-50" />
                <CompareButton carId={car.id} withLabel className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-800 hover:bg-gray-50" />
                <button
                  type="button"
                  onClick={share}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-800 hover:bg-gray-50"
                >
                  {copied ? <FaCheck className="text-green-600" /> : <FaShareAlt />} {copied ? 'Link copied' : 'Share'}
                </button>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">Features</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {car.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-700">
                      <FaCheck className="text-green-600" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {photos.map((img, idx) => (
                    <img
                      key={img}
                      src={img}
                      alt={`${title} photo ${idx + 1}`}
                      loading="lazy"
                      className="h-36 w-full rounded-lg border border-gray-100 object-cover"
                      onError={fallbackTo(photoFallback)}
                    />
                  ))}
                </div>
              </div>

              <div id="test-drive" className="mt-10 scroll-mt-20">
                <TestDriveBooking car={car} />
              </div>
            </div>

            {/* Finance */}
            <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
              <FinanceCalculator car={car} />
            </aside>
          </div>
        </div>

        <div id="enquire" className="mx-auto mt-12 max-w-2xl scroll-mt-20 px-4">
          <ContactForm
            key={buildMessage}
            title={`Enquire about this ${title}`}
            initialSubject={build ? `3D build: ${build.title}` : ''}
            initialMessage={buildMessage}
          />
        </div>
      </section>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 pr-24 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-gray-500">{car.make} {car.model}</div>
          <div className="font-bold text-gray-900">{usd(car.price)}</div>
        </div>
        <button
          type="button"
          onClick={() => scrollTo('test-drive')}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Test drive
        </button>
      </div>
    </main>
  );
};

export default CarDetails;
