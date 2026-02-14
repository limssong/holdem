'use client';

import { Player, HandRank } from '@/types/game';

interface WinnerCelebrationProps {
  winners: Player[];
  pot: number;
  handRank?: HandRank;
  onNextGame: () => void;
}

const handRankNames: Record<HandRank, string> = {
  'royalFlush': '로얄 플러시',
  'straightFlush': '스트레이트 플러시',
  'fourOfAKind': '포카드',
  'fullHouse': '풀하우스',
  'flush': '플러시',
  'straight': '스트레이트',
  'threeOfAKind': '트리플',
  'twoPair': '투페어',
  'pair': '원페어',
  'highCard': '하이카드',
};

export default function WinnerCelebration({ winners, pot, handRank, onNextGame }: WinnerCelebrationProps) {
  if (winners.length === 0) return null;
  
  const winnerNames = winners.map(w => w.name).join(', ');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-end justify-center z-50 pb-8">
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-2xl border-4 border-yellow-300 text-center max-w-2xl mx-4 mb-2">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          축하합니다!
        </h2>
        <div className="text-2xl font-semibold text-white mb-2">
          {winnerNames}
        </div>
        <div className="text-xl text-yellow-100 mb-3">
          승리!
        </div>
        {handRank && (
          <div className="text-lg text-yellow-200 bg-blue-600 bg-opacity-80 rounded-lg px-6 py-2 inline-block mb-2 font-bold">
            {handRankNames[handRank]}
          </div>
        )}
        <div className="text-lg text-white bg-black bg-opacity-30 rounded-lg px-6 py-2 inline-block mb-4">
          팟: {pot.toLocaleString()} 칩 획득
        </div>
        <button
          onClick={onNextGame}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition shadow-lg"
        >
          다음 게임 시작
        </button>
      </div>
    </div>
  );
}

