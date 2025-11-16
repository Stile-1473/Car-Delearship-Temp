/**
 * About Us Page
 * Contains: Company history, team members, services offered, certifications
 */

import React from 'react';
import { FaCheckCircle, FaUsers, FaTrophy, FaGlobe } from 'react-icons/fa';
import { dealershipInfo, services } from '../data/mockData';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">About Us</h1>
          <p className="text-base text-gray-600">
            Trusted by customers across Zimbabwe for quality vehicles and reliable service.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Premier Car Dealership Zimbabwe was founded with a simple mission: to provide quality vehicles and outstanding customer service to the Zimbabwean community.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                With over 10 years of experience in the automotive industry, we have built a reputation for honesty, reliability, and professionalism. We carefully select every vehicle to ensure it meets our high standards.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, we continue to grow our inventory and expand our services to better serve our loyal customers and build lasting relationships based on trust and excellence.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=500&fit=crop"
                alt="Dealership"
                className="rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">10+</div>
              <p className="text-gray-700">Years in Business</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <p className="text-blue-700">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">100+</div>
              <p className="text-red-700">Vehicles Sold</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <p className="text-purple-700">In Stock Now</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Our Services</h2>
            <p className="text-gray-600">
              Comprehensive solutions for all your automotive needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-lg shadow-sm p-5 transition">
                <div className="text-3xl mb-4">
                  {service.icon === 'FaMoneyBill' && '💰'}
                  {service.icon === 'FaShieldAlt' && '🛡️'}
                  {service.icon === 'FaTools' && '🔧'}
                  {service.icon === 'FaExchangeAlt' && '🔄'}
                  {service.icon === 'FaCheckCircle' && '✅'}
                  {service.icon === 'FaAmbulance' && '🚑'}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Meet Our Team</h2>
            <p className="text-gray-600">
              Experienced professionals dedicated to your satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dealershipInfo.team.map(member => (
              <div key={member.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gray-200 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-gray-600 font-medium">{member.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Why Choose Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <FaCheckCircle className="text-primary-600 text-2xl mt-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600">
                  Every vehicle is thoroughly inspected and certified for quality and reliability.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <FaUsers className="text-primary-600 text-2xl mt-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900 mb-2">Expert Team</h3>
                <p className="text-gray-600">
                  Our knowledgeable team is always ready to assist you in finding the perfect vehicle.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <FaTrophy className="text-primary-600 text-2xl mt-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900 mb-2">Competitive Pricing</h3>
                <p className="text-gray-600">
                  We offer fair prices and flexible financing options to suit your budget.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <FaGlobe className="text-primary-600 text-2xl mt-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900 mb-2">Nationwide Support</h3>
                <p className="text-gray-600">
                  We provide comprehensive after-sales support and service throughout Zimbabwe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
