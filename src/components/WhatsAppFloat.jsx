/**
 * Floating WhatsApp chat button. On a car page the message names that car.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { carsData } from '../data/mockData';
import { whatsappLink, carTitle, carUrl } from '../utils/whatsapp';

const WhatsAppFloat = () => {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/car\/(\d+)/);
  const car = match && carsData.find((c) => String(c.id) === match[1]);
  const message = car
    ? `Hi ZimCar, is the ${carTitle(car)} still available?\n${carUrl(car)}`
    : 'Hi ZimCar, I have a question about your cars.';

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-3xl text-white shadow-xl shadow-green-900/30 hover:bg-green-600"
    >
      <FaWhatsapp />
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white shadow group-hover:block">
        {car ? `Ask about this ${car.model}` : 'Chat with us'}
      </span>
    </a>
  );
};

export default WhatsAppFloat;
