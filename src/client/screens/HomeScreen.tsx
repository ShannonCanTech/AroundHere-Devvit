import React, { useEffect, useState } from "react";

type AvatarTestSlide = {
  title: string;
  description: string;
  url: string;
  source: string;
};

export const HomeScreen: React.FC = () => {
  const [slides, setSlides] = useState<AvatarTestSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const fetchAvatarTests = async () => {
      try {
        // Fetch avatar test data from server
        const response = await fetch('/api/avatar-test');
        
        if (!response.ok) {
          throw new Error('Failed to fetch avatar test data');
        }
        
        const data = await response.json();
        setSlides(data.slides);
        setUsername(data.username);
      } catch (error) {
        console.error('Error fetching avatar test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarTests();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-50 to-green-50">
        <div className="text-gray-600 text-lg">Loading avatar tests...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-50 to-green-50">
        <div className="text-red-600 text-lg">No avatar data available</div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="relative h-full bg-gradient-to-b from-blue-50 to-green-50 flex flex-col items-center justify-center p-8">
      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md">
        <span className="text-sm font-semibold text-gray-700">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>

      {/* Username Display */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md">
        <span className="text-sm font-semibold text-gray-700">
          User: {username}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-6 max-w-2xl">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 text-center">
          {slide.description}
        </p>

        {/* Avatar Display */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
              <img
                src={slide.url}
                alt={`Avatar test: ${slide.title}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/default-snoo.png';
                  e.currentTarget.classList.add('opacity-50');
                }}
              />
            </div>
            
            {/* Source Badge */}
            <div className="bg-blue-100 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-blue-800">
                Source: {slide.source}
              </span>
            </div>

            {/* URL Display */}
            <div className="bg-gray-100 px-4 py-2 rounded-lg max-w-full overflow-x-auto">
              <code className="text-xs text-gray-700 break-all">
                {slide.url}
              </code>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={prevSlide}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={nextSlide}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Keyboard Hint */}
        <p className="text-sm text-gray-500 mt-2">
          Use arrow keys or buttons to navigate
        </p>
      </div>
    </div>
  );
};
