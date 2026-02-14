'use client';

import { Player, GamePhase, BettingAction } from '@/types/game';
import CardDisplay from './CardDisplay';
import BettingActionDisplay from './BettingActionDisplay';

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  isWinner: boolean;
  gamePhase: GamePhase;
  lastAction?: BettingAction;
  lastActionAmount?: number;
}

export default function PlayerSeat({ player, isCurrentTurn, isWinner, gamePhase, lastAction, lastActionAmount }: PlayerSeatProps) {
  return (
    <div className={`relative ${isCurrentTurn ? 'scale-110 z-20' : ''} transition-all duration-300 ${player.isFolded ? 'opacity-50' : ''}`}>
      {/* 플레이어 정보 */}
      <div className={`
        bg-gray-800 bg-opacity-90 rounded-lg p-3 min-w-[120px] text-center
        ${isCurrentTurn ? 'ring-4 ring-yellow-400' : ''}
        ${isWinner ? 'ring-4 ring-yellow-400' : ''}
      `}>
        {/* 아바타 및 이름 */}
        <div className={`text-3xl mb-1 ${player.isFolded ? 'opacity-40' : ''}`}>{player.avatar}</div>
        <div className={`text-white font-semibold text-sm ${player.isFolded ? 'opacity-60' : ''}`}>{player.name}</div>
        
        {/* 칩 */}
        <div className="text-yellow-300 text-xs mt-1">
          {player.chips.toLocaleString()} 칩
        </div>
        
        {/* 현재 배팅 */}
        {player.currentBet > 0 && (
          <div className="text-red-300 text-xs mt-1 font-bold">
            배팅: {player.currentBet.toLocaleString()} 칩
          </div>
        )}
        
        {/* 배팅 액션 표시 */}
        {lastAction && !isCurrentTurn && (
          <div className="mt-2">
            <BettingActionDisplay action={lastAction} amount={lastActionAmount} />
          </div>
        )}
        
        {/* 상태 표시 */}
        <div className="mt-1">
          {player.isDealer && (
            <span className="bg-black text-yellow-400 text-xs px-2 py-0.5 rounded font-bold">D</span>
          )}
          {player.isSmallBlind && (
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded ml-1">SB</span>
          )}
          {player.isBigBlind && (
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded ml-1">BB</span>
          )}
          {player.isFolded && (
            <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded ml-1">폴드</span>
          )}
          {player.isAllIn && (
            <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded ml-1">올인</span>
          )}
        </div>
      </div>
      
      {/* 카드 표시 */}
      {player.hand.length > 0 && (
        <div className="flex gap-1 mt-2 justify-center">
          {player.hand.map((card, index) => (
            <CardDisplay
              key={index}
              card={card}
              isHidden={!player.isHuman && gamePhase !== 'showdown'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

