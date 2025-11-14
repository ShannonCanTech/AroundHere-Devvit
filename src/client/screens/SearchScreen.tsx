import React from "react";

export const SearchScreen: React.FC = () => {
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Search</h2>
      <p className="text-gray-500 text-center">Search for posts, communities, and users</p>
    </div>
  );
};
