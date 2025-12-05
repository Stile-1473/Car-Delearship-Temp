/**
 * Contact Page
 * Complete contact section with form, map, and company information
 */

import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';
import ContactForm from '../components/ContactForm';
import { dealershipInfo } from '../data/mockData';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">Contact Us</h1>
          <p className="text-base text-gray-600">We're here to help. Reach out to us anytime!</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Contact Information Cards */}
          {/* Phone */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
              <FaPhone className="text-gray-700 text-lg" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Phone</h3>
            <p className="text-gray-600 mb-2">Call us during business hours</p>
            <a
              href={`tel:${dealershipInfo.phone}`}
              className="text-gray-900 font-semibold hover:underline text-lg"
            >
              {dealershipInfo.phone}
            </a>
          </div>

          {/* Email */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
              <FaEnvelope className="text-gray-700 text-lg" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
            <p className="text-gray-600 mb-2">Send us your inquiries</p>
            <a
              href={`mailto:${dealershipInfo.email}`}
              className="text-gray-900 font-semibold hover:underline"
            >
              {dealershipInfo.email}
            </a>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
              <FaWhatsapp className="text-gray-700 text-lg" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">WhatsApp</h3>
            <p className="text-gray-600 mb-2">Chat with us instantly</p>
            <a
              href={`https://wa.me/${dealershipInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 font-semibold hover:underline"
            >
              {dealershipInfo.whatsapp}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Contact Form */}
          <ContactForm />

          {/* Address and Hours */}
          <div>
            {/* Address Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaMapMarkerAlt className="text-gray-700 text-2xl mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {dealershipInfo.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaClock className="text-gray-700 text-2xl mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Business Hours</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold">Monday - Friday:</span>
                      <span>{dealershipInfo.hours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Saturday:</span>
                      <span>{dealershipInfo.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Sunday:</span>
                      <span>{dealershipInfo.hours.sunday}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <a href="/" className="text-gray-900 hover:underline font-semibold block">
                  → Home
                </a>
                <a href="/inventory" className="text-gray-900 hover:underline font-semibold block">
                  → Browse Inventory
                </a>
                <a href="/about" className="text-gray-900 hover:underline font-semibold block">
                  → About Us
                </a>
                <a href="/blog" className="text-gray-900 hover:underline font-semibold block">
                  → Blog
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm h-96">
          <iframe
            title="ZimCar Car Dealership Location"
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.7788903788!2d${dealershipInfo.mapCoordinates.lng}!3d${dealershipInfo.mapCoordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zPSEm!5e0!3m2!1sen!2szw!4v1234567890`}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
