'use client';

import { BettingAction } from '@/types/game';

interface BettingActionDisplayProps {
  action: BettingAction;
  amount?: number;
}

export default function BettingActionDisplay({ action, amount }: BettingActionDisplayProps) {
  const actionText: Record<BettingAction, string> = {
    'check': '삥 (체크)',
    'call': '콜',
    'raise': `배팅 (${amount?.toLocaleString()} 칩)`,
    'fold': '다이 (폴드)',
  };

  const actionColor: Record<BettingAction, string> = {
    'check': 'bg-green-600',
    'call': 'bg-blue-600',
    'raise': 'bg-yellow-600',
    'fold': 'bg-red-600',
  };

  return (
    <div className={`${actionColor[action]} text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg animate-pulse`}>
      {actionText[action]}
    </div>
  );
}

