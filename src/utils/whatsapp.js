import { dealershipInfo } from '../data/mockData';

const number = dealershipInfo.whatsapp.replace(/\D/g, '');

/** wa.me link that opens a chat with the dealership, pre-filled with `message`. */
export function whatsappLink(message = '') {
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function carTitle(car) {
  return `${car.year} ${car.make} ${car.model}`;
}

export function carUrl(car) {
  return typeof window !== 'undefined' ? `${window.location.origin}/car/${car.id}` : `/car/${car.id}`;
}
