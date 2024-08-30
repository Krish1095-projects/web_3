import React from 'react';

const HeaderComponent = () => {
  return (
    <div className="bg-red-500 text-white flex justify-end items-center py-4 px-6">
      <a href="home" className="mx-4 hover:text-gray-400 cursor-pointer transition-colors duration-300">Home</a> 
      <div className="bg-white h-6 w-0.5"></div> {/* White line */}
      <a href="https://sites.google.com/ptuniv.edu.in/vcoffice/home" className="mx-4 hover:text-gray-400 cursor-pointer transition-colors duration-300">Admin</a>
      <div className="bg-white h-6 w-0.5"></div> {/* White line */}
      <a href="https://sites.google.com/view/ptu-coe/home" className="mx-4 hover:text-gray-400 cursor-pointer transition-colors duration-300">COE</a>
      <div className="bg-white h-6 w-0.5"></div> {/* White line */}
      <a href="https://ptuniv.edu.in/ieee-sb/" className="mx-4 hover:text-gray-400 cursor-pointer transition-colors duration-300">IEE-SB</a>
      <div className="bg-white h-6 w-0.5"></div> {/* White line */}
      <a href="https://www.pytuiis.org/" className="mx-4 hover:text-gray-400 cursor-pointer transition-colors duration-300">IIS T&P</a>
      <div className="bg-white h-6 w-0.5"></div> {/* White line */}
      <a href="https://pecaa.pec.edu/" className="mx-4 hover:text-gray-400 cursor-pointer transition-colors duration-300">Alumni</a>
      <div className="bg-white h-6 w-0.5"></div> {/* White line */}
      <a href="https://ptuniv.edu.in/#main-footer" className="mx-4 hover:text-gray-400 cursor-pointer transition-colors duration-300">Contact</a>
    </div>
  );
};

export default HeaderComponent;
