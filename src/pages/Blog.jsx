/**
 * Blog Page
 * Displays blog posts with card layout
 * Features: Categories, dates, author information
 */

import React, { useState } from 'react';
import { FaCalendar, FaUser, FaTag } from 'react-icons/fa';
import { blogPosts } from '../data/mockData';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories
  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];

  // Filter posts by category
  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">Blog & News</h1>
          <p className="text-base text-gray-600">Tips, guides, and industry insights for car buyers</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow transform hover:-translate-y-2"
            >
              {/* Featured Image */}
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category Tag */}
                <div className="flex items-center space-x-2 mb-3">
                  <FaTag className="text-gray-600 text-sm" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Information */}
                <div className="border-t pt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FaCalendar />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaUser />
                    <span>{post.author}</span>
                  </div>
                </div>

                {/* Read More Button */}
                <button className="w-full mt-4 bg-gray-900 hover:opacity-95 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                  Read More
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* No Posts Message */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl font-bold text-gray-600">No posts in this category yet.</p>
          </div>
        )}
      </div>

      {/* Newsletter Signup */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Stay Updated</h2>
          <p className="text-gray-600 mb-4">Subscribe to our newsletter for latest automotive tips and industry news</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 rounded-md border border-gray-200"
              required
            />
            <button
              type="submit"
              className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Blog;
