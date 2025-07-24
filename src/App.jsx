import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full b g-white rounded-xl shadow-2xl p-6 md:p-8 transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
          Welcome to Tailwind CSS
        </h1>
        <p className="text-gray-600 mb-6 text-center text-sm md:text-base">
          This is a test card styled with Tailwind CSS, featuring responsive design, hover effects, and vibrant colors.
        </p>
        <div className="flex justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200">
            Click Me!
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-100 p-4 rounded-md text-center text-blue-800 font-medium">
            Feature 1
          </div>
          <div className="bg-blue-100 p-4 rounded-md text-center text-blue-800 font-medium">
            Feature 2
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;