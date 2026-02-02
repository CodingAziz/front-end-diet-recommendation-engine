import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
          Welcome to <span className="text-emerald-600">SmartBite</span> 👋
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Your personal AI-powered companion for nutritional excellence and body
          transformation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors">
          <div className="text-4xl mb-4">💪</div>
          <h2 className="text-2xl font-bold mb-4">Automatic Recommendations</h2>
          <p className="text-gray-600 mb-6">
            Input your metrics and we'll calculate your BMI, BMR, and generate a
            personalized full-day meal plan based on your weight goals.
          </p>
          <Link
            to="/automatic"
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-4">Custom Food Finder</h2>
          <p className="text-gray-600 mb-6">
            Looking for something specific? Search for recipes based on exact
            nutritional targets and preferred ingredients.
          </p>
          <Link
            to="/custom"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Search Custom
          </Link>
        </div>
      </div>

      <div className="bg-emerald-900 text-white p-10 rounded-3xl overflow-hidden relative">
        <div className="relative z-10 md:w-2/3">
          <h3 className="text-3xl font-bold mb-4">Scientific Approach</h3>
          <p className="text-emerald-100 mb-6">
            A diet recommendation web application using content-based logic and
            a custom diet recommendation engine working on the backend with FASTAPI. Built with modern technologies like React, Tailwind, and
            FASTAPI.
          </p>
          <a
            href="https://github.com/CodingAziz/diet-recommendation-engine"
            className="underline font-medium hover:text-white transition-colors"
          >
            View project details on GitHub
          </a>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center">
          <span className="text-[200px] transform translate-x-1/4">🥗</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
