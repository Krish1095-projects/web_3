import React, { useEffect, useState } from 'react';
import logo from "../images/ptu-logo.png";
const HeroSection = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Set showAnimation to true after a short delay to trigger the animation
    const timeout = setTimeout(() => {
      setShowAnimation(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`bg-white w-full h-[215px] flex flex-col justify-center items-center my-20 transition-opacity duration-1000 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-center items-center mb-8">
        <a href="https://ptuniv.edu.in/" target="_blank" rel="noopener noreferrer">
          <img src={logo} alt="PTU Logo" className="w-48 h-60 mr-4" />
        </a>
        <div className='flex flex-col justify-center items-center gap-5'>
          <h1 className="text-3xl font-bold text-red-500">
            <span className="text-5xl">P</span>uducherry <span className="text-5xl">T</span>echnology <span className="text-5xl">U</span>niversity
          </h1>
          <p className="text-lg text-red-500">Puducherry, India</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
