import gsap from "gsap";
import React, { useEffect, useRef } from 'react';

// Reusable FAQ Item Component
const FaqItem = ({ question, answer, align }) => {
  return (
    <div className={`flex flex-row justify-${align}`}>
      <div className="w-[40%] bg-red-100 shadow-lg p-6 rounded-lg transform transition-transform hover:-translate-y-3 hover:shadow-xl">
        <div className="font-bold text-black mb-4">{question}</div>
        <div className="text-black">{answer}</div>
      </div>
    </div>
  );
};

const Faq = () => {
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
        FAQ
      </div>

      <FaqItem
        question="What is Misinformation?"
        answer="Misinformation refers to false or misleading information that spreads through various media, shaping public opinion and behavior. It exploits cognitive biases and emotions, spreading rapidly and eroding trust. Combatting misinformation requires robust fact-checking, media literacy, and responsible information dissemination."
        align="start"
      />

      <FaqItem
        question="What is BERT?"
        answer="BERT (Bidirectional Encoder Representations from Transformers) is a transformer-based model designed to understand the context of a word in search queries by looking at the words that come before and after it. BERT is widely used in natural language processing tasks such as question answering, sentiment analysis, and language translation."
        align="end"
      />

      <FaqItem
        question="What is Self-Attention?"
        answer="Self-attention is a mechanism in machine learning, particularly in transformer models, that allows the model to weigh the importance of different words in a sentence relative to each other. This helps the model capture the context of a word based on its relationship with other words in the sentence."
        align="start"
      />

      <FaqItem
        question="What is Content-Based Attention?"
        answer="Content-based attention is a mechanism where attention is given to specific parts of the input data based on their relevance to the task. In NLP, it assigns higher attention to words or tokens that are more informative for the given context, aiding in capturing important semantic information."
        align="end"
      />

      <FaqItem
        question="What are the Key Differences Between Self-Attention and Content-Based Attention?"
        answer="Self-attention considers all parts of the input data and weighs their importance relative to each other, while content-based attention focuses on certain elements based on their relevance to the task. Self-attention is integral to transformer models, whereas content-based attention is often used in specific tasks requiring focused analysis."
        align="start"
      />

      <FaqItem
          question="What are the advantages of content-based attention mechanism for misinformation detection?"
          answer={
              <div>
                  <p>Content-based attention offers several advantages for misinformation detection:</p>
                  <ul>
                      <li>Focus on Relevant Information</li>
                      <li>Improved Interpretability</li>
                      <li>Reduction of Complexity</li>
                      <li>Enhanced Performance on Specific Tasks</li>
                      <li>Better Handling of Noisy Data</li>
                  </ul>
              </div>
          }
          align="end"
      />
      
    </div>
  );
};

export default Faq;
