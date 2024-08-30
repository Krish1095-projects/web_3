// Suggested code may be subject to a license. Learn more: ~LicenseLog:4038762996.
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";


// Publication Component
const PublicationCard = ({ title, authors, journal, link }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-1">
        <strong>Authors:</strong> {authors}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        <strong>Journal:</strong> {journal}
      </p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Read More
        </a>
      )}
    </div>
  );
};

const Publications= () => {
  const faqRef = useRef(null);
  const [publications, setPublications] = useState([
    {
      title: "Detection of automated behavior on Twitter through approximate entropy and sample entropy",
      authors: "R Gilmary, A Venkatesan, G Vaiyapuri",
      journal: "Personal and Ubiquitous Computing",
      link:"https://scholar.google.com/citations?view_op=view_citation&hl=en&user=cSO2ltwAAAAJ&citation_for_view=cSO2ltwAAAAJ:2osOgNQ5qMEC",
    },
    {
      title: "DNA-influenced automated behavior detection on Twitter through relative entropy",
      authors: "R Gilmary, A Venkatesan, G Vaiyapuri, D Balamurali",
      journal: "Scientific Reports",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=cSO2ltwAAAAJ&citation_for_view=cSO2ltwAAAAJ:d1gkVwhDpl0C"
    },
    {
      title: "Discovering social bots on Twitter: a thematic review",
      authors: "R Gilmary, A Venkatesan, G Vaiyapuri",
      journal: "International Journal of Internet Technology and Secured Transactions",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=cSO2ltwAAAAJ&citation_for_view=cSO2ltwAAAAJ:u-x6o8ySG0sC" // Add link if available
    },
    {
      title: "Compression techniques for dna sequences: A thematic review",
      authors: "R Gilmary, A Venkatesan, G Vaiyapuri",
      journal: "Journal of Computing Science and Engineering",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=cSO2ltwAAAAJ&citation_for_view=cSO2ltwAAAAJ:9yKSN-GCB0IC" // Add link if available
    },
    {
      title: "Entropy-Based Automation Detection on Twitter Using DNA Profiling",
      authors: "R Gilmary, A Venkatesan",
      journal: "SN Computer Science",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=cSO2ltwAAAAJ&citation_for_view=cSO2ltwAAAAJ:zYLM7Y9cAGgC" // Add link if available
    },
    {
      title: "Detection of Twitter Bots using DNA-based Entropy Technique",
      authors: "R Gilmary, A Venketesan, M Praveen, HR Prasath, G Vaiyapuri",
      journal: "2022 First International Conference on Electrical, Electronics, Information and Communication Technologies (ICEEICT)",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=cSO2ltwAAAAJ&citation_for_view=cSO2ltwAAAAJ:qjMakFHDy7sC" // Add link if available
    }
  ]);

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
      {/* Publications Section */}
      <div className="mt-10">
        <h2 className="text-4xl font-bold mb-4 text-center text-white">
          Publications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publications.map((pub, index) => (
            <PublicationCard key={index} {...pub} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Publications;