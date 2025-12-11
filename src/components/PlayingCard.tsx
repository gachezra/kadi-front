import React from 'react';
import { Card } from '../types';
import { cn } from '../utils/cn';

interface PlayingCardProps {
  card: Card | string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const parseCardString = (cardStr: string | Card): { suit: string; value: string } | null => {
  if (typeof cardStr === 'string') {
    // Parse format: "5♦" (value + suit symbol)
    if (cardStr.length < 2) return null;
    const suit = cardStr.slice(-1);
    const value = cardStr.slice(0, -1);
    const validSuits = ['♠', '♥', '♦', '♣'];
    if (!validSuits.includes(suit) || !value) return null;
    return { suit, value };
  }
  // Already a Card object
  if (cardStr && typeof cardStr.suit === 'string' && typeof cardStr.value === 'string') {
    return cardStr;
  }
  return null;
};

const suitIcons: Record<string, React.ReactNode> = {
  '♠': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2C8.2 6.4 4 10 4 13c0 2.4 1.6 4 4 4 0 1.7-.9 2-1 4h10c-.1-2-.9-2.3-1-4 2.4 0 4-1.6 4-4 0-3-4.2-6.6-8-11zm0 1.4C15.2 7.3 18 10.6 18 13c0 1.5-.9 2-2 2h-2c.1 1.7.9 2 .9 3H9c0-1 .9-1.3 1-3H8c-1.1 0-2-.5-2-2 0-2.4 2.8-5.7 6-9.6z" />
    </svg>
  ),
  '♥': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  '♦': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 2.8L19.2 12 12 19.2 4.8 12 12 4.8z" />
    </svg>
  ),
  '♣': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M16 11c0-2-1.6-3-4-3-1.6 0-3.1 1.1-3.9 2.4C7.5 10 6.6 9 6 8 4.6 6.6 5.1 5 6 5c1.1 0 1.5 1 2.3 2.3C9.3 6.3 10.2 5 12 5c2.2 0 4 1.4 4 3.5 0 .9-.5 1.9-1.5 2.5.8.5 1.5 1.6 1.5 2.5 0 2.1-1.8 3.5-4 3.5-.8 0-1.7-.3-2.5-1H10v4H9v-4H7v4H6v-4H4c0-1.4 1.2-3 2.7-3.6C5.9 13 5 12 5 11c0-1.1.9-2 2-2 .9 0 1.6.6 2 1.4C9.5 8.4 10.6 8 12 8c2.2 0 4 1.4 4 3z" />
    </svg>
  ),
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isSelected = false,
  onClick,
  size = 'md',
  className,
}) => {
  const parsed = parseCardString(card);
  if (!parsed) {
    return <div className="w-16 h-24 bg-gray-200 rounded-lg flex items-center justify-center">Invalid Card</div>;
  }
  
  const { suit, value } = parsed;
  const isSpecialCard = ['A', '8', 'Q'].includes(value);
  const color = suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-black';

  const sizeClasses = {
    sm: 'w-14 h-20 text-sm',
    md: 'w-20 h-28 text-lg',
    lg: 'w-24 h-36 text-xl',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-lg shadow-md flex flex-col justify-between p-2',
        'transition-all duration-200',
        sizeClasses[size],
        isSelected ? 'border-4 border-amber-400 bg-amber-100' : 'bg-white border-2 border-gray-300',
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-105',
        color,
        className
      )}
    >
      <div className="flex justify-between items-start">
        <span className="font-bold">{value}</span>
        <div className="w-5 h-5">{suitIcons[suit]}</div>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <div className="w-8 h-8">{suitIcons[suit]}</div>
      </div>

      <div className="flex justify-between items-end rotate-180">
        <span className="font-bold">{value}</span>
        <div className="w-5 h-5">{suitIcons[suit]}</div>
      </div>

      {isSpecialCard && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 rounded-full animate-pulse border-2 border-white" />
      )}
    </div>
  );
};