import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import img from "../images/student.png";
import krish from "../images/krishna_kumar.png";
import mary from "../images/mary.png";
import akila from "../images/akila.png";
import saru from "../images/saru.png";
import robin from "../images/robin.jpg"
// MemberCard Component

const MemberCard = ({ name, info, role, imgSrc, isProfessor }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const cardRef = useRef(null);
  const [maxDimensions, setMaxDimensions] = useState({ width: 250, height: 300 });

  useEffect(() => {
    // Calculate the largest dimensions among all the professor cards
    if (isProfessor && cardRef.current) {
      const cardDimensions = cardRef.current.getBoundingClientRect();
      setMaxDimensions((prevMax) => ({
        width: Math.max(prevMax.width, cardDimensions.width),
        height: Math.max(prevMax.height, cardDimensions.height),
      }));
    }
  }, [isProfessor]);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col items-center bg-red-100 rounded-lg shadow-md p-4 transform hover:scale-105 transition-transform duration-300 ease-out relative`}
      style={{
        width: isProfessor ? `${maxDimensions.width}px` : 'auto',
        height: isProfessor ? `${maxDimensions.height}px` : 'auto',
      }}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
    >
      <img
        src={imgSrc}
        alt={name}
        className={`w-32 h-32 rounded-full mb-2 transition-all duration-300 ${
          isZoomed ? 'scale-150' : ''
        }`}
        style={{ objectFit: 'cover' }}
      />
      <div className={`transition-all duration-300 ${isZoomed ? 'mt-8' : ''}`}>
        <p className="text-gray-700 font-semibold text-center">{name}</p>
        {info && <p className="text-gray-500 text-center">{info}</p>}
        {role && <p className="text-gray-600 text-center">{role}</p>}
      </div>
    </div>
  );
};

const ProjectDetails = () => {
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
      { threshold: 0.4 }
    );

    if (faqRef.current) {
      observer.observe(faqRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="p-8 rounded-lg shadow-md bg-red-500 mb-10" ref={faqRef}>
      <h2 className="text-4xl font-bold mb-4 text-center text-white">
        Research Team
      </h2>
      <div className="mb-6 flex flex-col items-center text-white">
        <div className="flex flex-row justify-center items-center gap-3 mb-4">
          {/* <h3 className="text-xl font-semibold">Name:</h3> */}
          {/* <p className="text-black text-5xl font-bold text-center">
          Content-based attention multilingual BERT model
          </p> */}
        </div>
        <h3 className="text-xl font-semibold mb-2">Research Co-ordinators</h3>
        <div className="flex flex-wrap justify-center gap-8">
          <MemberCard
            name="Dr. (Mrs.) V. Akila"
            info="ASSOCIATE PROFESSOR, PTU"
            role="Principal Investigator"
            isProfessor={true}
            imgSrc={akila}
          />
          <MemberCard
            name="Dr. K. Saruladha"
            info="PROFESSOR, PTU"
            role="Co-investigator"
            isProfessor={true}
            imgSrc={saru}
          />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 text-center">Research Associates</h3> 
        <div className="flex flex-wrap justify-center gap-8">
          <MemberCard
            name="Krishna kumar"
            // info="20CS1073"
            role="Project Associate"
            imgSrc={krish}
          />
          <MemberCard
            name="Rosaria Gilmary"
            //info="20CS1072"
            role="Research Associate"
            imgSrc={mary}
          />
        </div>
      </div>
      <br/>
      <br/>
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 text-center">Implementation Contributors</h3>
        <div className="flex flex-wrap justify-center gap-8">
          <MemberCard
            name="Krishna Kumar"
            //info="20CS1073"
            imgSrc={krish}
          />
          <MemberCard
            name="Michael Robin K"
            role="Student"
            imgSrc={robin}
          />
        </div>
        
      </div>
    </div>
  );
};

export default ProjectDetails;
