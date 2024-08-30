import React from 'react';

const FactCheckCard = ({ articleTitle, articleUrl, authorName, claim, dateTimePosted, ratingTitle }) => {
  return (
    <div className="max-w-md mx-auto bg-cream rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="md:flex">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{ratingTitle}</div>
          <a href={articleUrl} target="_blank" rel="noopener noreferrer">
            <h2 className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">{articleTitle}</h2>
          </a>
          <p className="mt-2 text-gray-500">{authorName} | {dateTimePosted}</p>
          <p className="mt-2 text-black">{claim}</p>
        </div>
      </div>
    </div>
  );
};

export default FactCheckCard;
