'use client';

import { Card } from '@/types/game';

interface CardDisplayProps {
  card: Card;
  isHidden?: boolean;
}

const suitSymbols: Record<string, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const suitColors: Record<string, string> = {
  spades: 'text-black',
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-black',
};

export default function CardDisplay({ card, isHidden }: CardDisplayProps) {
  if (isHidden) {
    return (
      <div className="w-12 h-16 bg-blue-900 border-2 border-white rounded flex items-center justify-center">
        <div className="text-white text-xs">🂠</div>
      </div>
    );
  }
  
  return (
    <div className="w-12 h-16 bg-white border-2 border-gray-800 rounded flex flex-col items-center justify-center shadow-lg">
      <div className={`text-lg font-bold ${suitColors[card.suit]}`}>
        {card.rank}
      </div>
      <div className={`text-xl ${suitColors[card.suit]}`}>
        {suitSymbols[card.suit]}
      </div>
    </div>
  );
}

