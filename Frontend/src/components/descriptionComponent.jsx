import gsap from "gsap";
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Reusable FAQ Item Component
const FaqItem = ({ answer, align }) => {
  return (
    <div className={`flex flex-row justify-${align}`}>
      <div className="w-[40%] bg-red-100 shadow-lg p-6 rounded-lg transform transition-transform hover:-translate-y-3 hover:shadow-xl">
        <div className="text-black">{answer}</div>
      </div>
    </div>
  );
};

const DescriptionComponent = () => {
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
    <div className="flex flex-col mx-10 mb-20" ref={faqRef}>
      <div className="flex justify-center items-center text-black font-bold mb-10 text-5xl">
        Summary
      </div>

      <FaqItem
        answer="Existing research on COVID-19 misinformation classification has made significant strides, but it still has
        limitations. Prior studies have focused mainly on attention mechanisms, model prediction explanation, and language
        generalization. However, these approaches treat all words in a sentence with equal importance, potentially
        overlooking crucial linguistic indicators that are vital for accurate classification.
        "
        align="start"
      />

      <FaqItem
        answer="Misinformation related to the COVID-19 pandemic often relies on subtle contextual nuances and linguistic patterns.
        Consequently, models that don't consider the varying significance of words may fail to capture these intricacies.
        The primary goal of detecting misinformation involves accurately identifying false information, which requires a
        deep understanding of language. Current machine learning, deep learning, and BERT-based methods have shown great
        promise in this regard, but they still have some significant shortcomings."
        align="end"
      />

      <FaqItem
        answer="One major limitation of existing works is their 'black-box' nature, making it challenging to understand how the
        models arrive at their predictions. This opacity can lead to inaccurate identification of misinformation.
        Furthermore, most existing studies train their models using only one specific language (e.g., English, Spanish,
        Arabic, or German), which limits their ability to handle multi-lingual misinformation effectively."
        align="start"
      />

      <FaqItem
        answer="The proposed approach, CA-BERT, addresses these limitations by integrating a content-based attention mechanism into
        the BERT architecture. This innovative method enables a focused analysis of key content features and dynamically
        adjusts attention weights based on semantic relevance. By prioritizing words indicative of COVID-19-related
        misinformation, CA-BERT captures subtle inconsistencies in texts and overcomes the issue of treating all words
        equally."
        align="end"
      />

      <FaqItem
        answer="Additionally, CA-BERT incorporates LIME (Local Interpretable Model-agnostic Explanations) to enhance model
        interpretability and overcome the black-box nature limitation. This integration provides insights into the
        decision-making process of the model, making it more transparent and trustworthy. Finally, a multi-lingual BERT
        variant is utilized in CA-BERT to handle multi-lingual misinformation complexities effectively. By leveraging this
        advanced technology, CA-BERT can detect COVID-19-related misinformation across various languages and social media
        platforms."
        align="start"
      />

      <div className="flex justify-center"> 
        <Link to="/details">
          <button className="bg-gradient-to-r from-red-200 to-red-300 text-white text-bold px-10 py-3 rounded-full shadow-lg hover:from-red-200 hover:to-red-300 transition-all duration-300 ease-in-out">
            Learn More
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DescriptionComponent;
