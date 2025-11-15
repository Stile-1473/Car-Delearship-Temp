import React, { useState } from 'react';
import { FaFacebook, FaWhatsapp, FaTwitter, FaPhone, FaEnvelope, FaCarSide, FaInstagram } from 'react-icons/fa';
import { dealershipInfo } from '../data/mockData';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gray-50 text-gray-700 py-12 border-t">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-semibold text-lg">{dealershipInfo.name}</div>
          <p className="text-sm text-gray-600 mt-2">{dealershipInfo.about}</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-black">Home</a></li>
            <li><a href="/inventory" className="hover:text-black">Inventory</a></li>
            <li><a href="/about" className="hover:text-black">About</a></li>
            <li><a href="/contact" className="hover:text-black">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2">Newsletter</h4>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button className="px-3 py-2 bg-black text-white rounded" type="submit">Subscribe</button>
          </form>
          {subscribed && <p className="text-sm text-green-600 mt-2">Thanks for subscribing!</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 text-sm text-gray-500 flex items-center justify-between">
        <div>&copy; {new Date().getFullYear()} {dealershipInfo.name}</div>
        <div className="flex items-center gap-4">
          <a href="https://facebook.com" className="hover:text-black">Facebook</a>
          <a href="https://twitter.com" className="hover:text-black">Twitter</a>
          <a href="https://instagram.com" className="hover:text-black">Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
