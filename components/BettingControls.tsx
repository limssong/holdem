'use client';

import { useState, useEffect } from 'react';
import { GameState, BettingAction } from '@/types/game';

interface BettingControlsProps {
  gameState: GameState;
  onAction: (action: BettingAction, amount?: number) => void;
}

export default function BettingControls({ gameState, onAction }: BettingControlsProps) {
  const humanPlayer = gameState.players.find(p => p.isHuman);
  
  if (!humanPlayer) return null;
  
  const callAmount = gameState.currentBet - humanPlayer.currentBet;
  // 플랍/턴/리버 이후에는 currentBet이 0이므로 체크 가능
  const canCheck = callAmount === 0 || (gameState.phase !== 'preflop' && gameState.currentBet === 0);
  const canCall = callAmount > 0 && humanPlayer.chips >= callAmount;
  const canRaise = humanPlayer.chips > callAmount;
  
  // 레이즈 금액 기본값: 콜 금액
  const minRaise = gameState.bigBlind;
  const [raiseAmount, setRaiseAmount] = useState(callAmount > 0 ? callAmount : minRaise);
  
  // 콜 금액이 변경될 때마다 레이즈 금액 업데이트
  useEffect(() => {
    // 콜 금액을 기본값으로 설정
    if (callAmount > 0) {
      setRaiseAmount(callAmount);
    } else {
      setRaiseAmount(minRaise);
    }
  }, [callAmount, minRaise]);
  
  return (
    <div className="bg-gray-900 bg-opacity-95 rounded-lg p-6 flex flex-col gap-4 items-center">
      <div className="text-white text-lg font-semibold">
        {canCheck ? '체크 또는 배팅하세요' : `콜: ${callAmount.toLocaleString()} 칩`}
      </div>
      
      <div className="flex gap-3">
        {canCheck && (
          <button
            onClick={() => onAction('check')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            삥 (체크)
          </button>
        )}
        
        {canCall && (
          <button
            onClick={() => onAction('call')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            콜
          </button>
        )}
        
        {canRaise && (
          <>
            <input
              type="number"
              min={callAmount + gameState.bigBlind}
              max={humanPlayer.chips}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="w-32 px-3 py-2 rounded text-center text-black"
              placeholder={`${callAmount + gameState.bigBlind}`}
            />
            <button
              onClick={() => {
                // raiseAmount는 총 배팅 금액이므로, 추가 레이즈 금액을 계산
                // 최소 레이즈는 BB이므로, 추가 레이즈 금액 = 총 배팅 금액 - 콜 금액
                const totalBetAmount = raiseAmount;
                const additionalRaise = Math.max(gameState.bigBlind, totalBetAmount - callAmount);
                onAction('raise', additionalRaise);
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              배팅
            </button>
          </>
        )}
        
        <button
          onClick={() => onAction('fold')}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          다이 (폴드)
        </button>
      </div>
      
      <div className="text-gray-400 text-sm">
        보유 칩: {humanPlayer.chips.toLocaleString()}
      </div>
    </div>
  );
}

