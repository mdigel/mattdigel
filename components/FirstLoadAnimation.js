'use client';

import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const FirstLoadAnimation = ({ children }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited) {
      // First time visitor - show animation
      setShowAnimation(true);
      
      // Hide animation after 2 seconds
      const timer = setTimeout(() => {
        setShowAnimation(false);
        // Mark as visited in localStorage
        localStorage.setItem('hasVisited', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Returning visitor - don't show animation
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!showAnimation) {
      // Small delay to allow fade out animation
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  if (!isLoaded) {
    return (
      <div
        className={`fixed inset-0 z-50 bg-white flex items-center justify-center transition-opacity duration-300 ${
          showAnimation ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-64 h-64">
          <DotLottieReact
            src="https://lottie.host/4c448f31-5837-4725-8f83-71ebb5785316/U4kw8xWntK.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FirstLoadAnimation;

