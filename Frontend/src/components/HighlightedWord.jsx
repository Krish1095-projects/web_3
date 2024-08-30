import React from 'react';

const HighlightedSentence = ({ explanation, textInstance }) => {
  const wordSet = new Map();
  explanation.forEach(([word, score]) => {
    const color = score > 0 ? 'text-green-500' : score < 0 ? 'text-red-500' : '';
    wordSet.set(word, color);
  });

  
  const mergeWithColors = (text) => {
    let mergedText = '';
    text.split(' ').forEach((word, index, array) => {
      const color = wordSet.get(word);
      if (color) {
        mergedText += `<span class="${color}">${word}</span>`;
      } else {
        mergedText += word;
      }
      if (index !== array.length - 1) {
        mergedText += ' ';
      }
    });
    return mergedText;
  };

  return (
    <div className="text-lg font-medium" dangerouslySetInnerHTML={{ __html: mergeWithColors(textInstance) }}>
    </div>
  );
};

export default HighlightedSentence;
