import React from "react";

export const HistoryScreen: React.FC = () => {
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
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">History</h2>
      <p className="text-gray-500 text-center">Your recently viewed posts</p>
    </div>
  );
};
