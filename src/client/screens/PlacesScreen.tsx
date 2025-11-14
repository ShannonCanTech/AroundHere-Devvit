import React from "react";

export const PlacesScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-24 h-24 text-gray-400 mb-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Places</h2>
      <p className="text-gray-500 text-center">Explore location-based communities</p>
    </div>
  );
};
