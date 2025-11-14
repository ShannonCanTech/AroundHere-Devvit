import React from "react";

type TopNavProps = {
  title: string;
  onBack?: () => void;
  onNotificationOpen: () => void;
  showBackButton?: boolean;
};

export const TopNav: React.FC<TopNavProps> = ({ 
  title, 
  onBack, 
  onNotificationOpen, 
  showBackButton = true 
}) => {
  return (
    <div className="bg-[#d93900] text-white p-3 md:p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#c13300] rounded-lg transition-colors"
              aria-label="Open navigation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
          <h1 className="text-lg md:text-xl font-bold">{title}</h1>
        </div>
        <button
          onClick={onNotificationOpen}
          className="p-2 hover:bg-[#c13300] rounded-lg transition-colors relative"
          aria-label="Open notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
        </button>
      </div>
    </div>
  );
};
