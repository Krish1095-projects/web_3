import React, { useEffect, useRef } from 'react'
import gsap from "gsap";
import { Link } from "react-router-dom";
export const Implementation = () => {
  const faqRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = entry.target.children;
            gsap.from(children, {
              x: "-=100",
              opacity: 0,
              stagger: 0.2,
              duration: 1,
              ease: "back.out(1.7)",
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (faqRef.current) {
      observer.observe(faqRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div className="flex flex-col  w-[90%] bg-red-500 shadow-lg p-6 rounded-lg mb-20 mx-20" ref={faqRef}>
      <h1 className="flex justify-center items-center text-white font-bold  mb-10 text-3xl text-center">
        Misinformation Detection on Twitter with a Content-Attention-Based Multilingual BERT Model
      </h1>
      <div className="flex flex-row mx-10 w-full  items-center h-300 justify-around">

        <Link to="/proposed">
          <button className="bg-gradient-to-r from-red-200 to-red-300 text-white text-bold px-10 py-3 rounded-full shadow-lg hover:from-red-200 hover:to-red-300 transition-all duration-300 ease-in-out">
            START
          </button>
        </Link>

      </div>
    </div>
  )
}
