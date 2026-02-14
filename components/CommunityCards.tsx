'use client';

import { Card } from '@/types/game';
import CardDisplay from './CardDisplay';

interface CommunityCardsProps {
  cards: Card[];
}

export default function CommunityCards({ cards }: CommunityCardsProps) {
  if (cards.length === 0) {
    return null;
  }
  
  return (
    <div className="flex gap-2 justify-center">
      {cards.map((card, index) => (
        <CardDisplay key={index} card={card} />
      ))}
    </div>
  );
}

