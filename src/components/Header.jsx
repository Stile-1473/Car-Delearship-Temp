/**
 * Header Component
 * Navigation bar with logo and menu items
 * Mobile responsive with hamburger menu
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaCarSide } from 'react-icons/fa';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'About', path: '/about' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 text-black">
          <FaCarSide className="text-2xl" />
          <span className="font-semibold text-lg">ZimCar</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium text-gray-700 hover:text-black px-3 py-2 ${location.pathname === link.path ? 'text-black' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <Link to="/contact" className="hidden md:inline-block text-sm font-medium text-black border px-3 py-1 rounded">Contact</Link>
          <button
            className="md:hidden text-2xl text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white border-t ${menuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col py-4">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              {link.name}
            </Link>
          ))}
          <Link to="/contact" className="block mt-2 mx-6 px-4 py-2 text-center bg-black text-white rounded">Contact</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
