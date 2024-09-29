import React from 'react';

// SVG icons for card suits
const suitIcons = {
  '♠': (
    <svg viewBox="0 0 24 24" fill="black" className="w-6 h-6">
      <path d="M12 2C8.2 6.4 4 10 4 13c0 2.4 1.6 4 4 4 0 1.7-.9 2-1 4h10c-.1-2-.9-2.3-1-4 2.4 0 4-1.6 4-4 0-3-4.2-6.6-8-11zm0 1.4C15.2 7.3 18 10.6 18 13c0 1.5-.9 2-2 2h-2c.1 1.7.9 2 .9 3H9c0-1 .9-1.3 1-3H8c-1.1 0-2-.5-2-2 0-2.4 2.8-5.7 6-9.6z"/>
    </svg>
  ),
  '♥': (
    <svg viewBox="0 0 24 24" fill="red" className="w-6 h-6">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  '♦': (
    <svg viewBox="0 0 24 24" fill="red" className="w-6 h-6">
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 2.8L19.2 12 12 19.2 4.8 12 12 4.8z"/>
    </svg>
  ),
  '♣': (
    <svg viewBox="0 0 24 24" fill="black" className="w-6 h-6">
      <path d="M16 11c0-2-1.6-3-4-3-1.6 0-3.1 1.1-3.9 2.4C7.5 10 6.6 9 6 8 4.6 6.6 5.1 5 6 5c1.1 0 1.5 1 2.3 2.3C9.3 6.3 10.2 5 12 5c2.2 0 4 1.4 4 3.5 0 .9-.5 1.9-1.5 2.5.8.5 1.5 1.6 1.5 2.5 0 2.1-1.8 3.5-4 3.5-.8 0-1.7-.3-2.5-1H10v4H9v-4H7v4H6v-4H4c0-1.4 1.2-3 2.7-3.6C5.9 13 5 12 5 11c0-1.1.9-2 2-2 .9 0 1.6.6 2 1.4C9.5 8.4 10.6 8 12 8c2.2 0 4 1.4 4 3z"/>
    </svg>
  )
};

// Component
const Card = ({ card }) => {
  if (!card || typeof card !== 'string') {
    console.log('Invalid card:', card); 
    return <div>Invalid card</div>;
  }

  const suit = card.slice(-1);
  const rank = card.slice(0, -1);
  const suitIcon = suitIcons[suit];
  const color = (suit === '♥' || suit === '♦') ? 'text-red-600' : 'text-black';

  return (
    <div className={`border-2 border-gray-500 rounded-lg shadow-lg w-24 h-36 flex flex-col justify-between p-2 bg-white ${color}`}>
      <div className="flex justify-between">
        <span className="font-bold">{rank}</span>
        <div>{suitIcon}</div>
      </div>
      <div className="flex justify-center items-center">
        {suitIcon}
      </div>
      <div className="flex justify-between rotate-180">
        <span className="font-bold">{rank}</span>
        <div>{suitIcon}</div>
      </div>
    </div>
  );
};

export default Card;