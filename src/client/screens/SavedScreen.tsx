import React from "react";

export const SavedScreen: React.FC = () => {
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
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Saved</h2>
      <p className="text-gray-500 text-center">Your saved posts and comments</p>
    </div>
  );
};
