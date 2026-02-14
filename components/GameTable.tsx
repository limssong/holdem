'use client';

import { GameState, Player, BettingAction } from '@/types/game';
import PlayerSeat from './PlayerSeat';
import CommunityCards from './CommunityCards';
import BettingControls from './BettingControls';
import WinnerCelebration from './WinnerCelebration';

interface GameTableProps {
  gameState: GameState;
  onBettingAction: (action: BettingAction, amount?: number) => void;
  onNextGame: () => void;
}

// 인원 수에 따라 플레이어 위치를 균등하게 계산
const calculatePlayerPositions = (numPlayers: number) => {
  const positions = [];
  const centerX = 50; // 테이블 중심 X (퍼센트)
  const centerY = 50; // 테이블 중심 Y (퍼센트)
  const radiusX = 42; // 타원의 가로 반지름 (퍼센트)
  const radiusY = 30; // 타원의 세로 반지름 (퍼센트)
  
  for (let i = 0; i < numPlayers; i++) {
    // 각도 계산 (0도부터 시작, 시계방향)
    const angle = (i / numPlayers) * 2 * Math.PI - Math.PI / 2; // -90도부터 시작 (상단 중앙)
    
    // 타원 위의 좌표 계산
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    positions.push({
      top: `${y}%`,
      left: `${x}%`,
      transform: 'translate(-50%, -50%)'
    });
  }
  
  return positions;
};

export default function GameTable({ gameState, onBettingAction, onNextGame }: GameTableProps) {
  const humanPlayer = gameState.players.find(p => p.isHuman);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = humanPlayer && 
    currentPlayer?.id === humanPlayer.id &&
    !humanPlayer.isFolded &&
    !humanPlayer.isAllIn;

  // 인원 수에 따라 플레이어 위치 계산
  const playerPositions = calculatePlayerPositions(gameState.players.length);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-green-900 to-green-800">
      {/* 테이블 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-6xl h-[70%] bg-green-700 rounded-full border-8 border-amber-800 shadow-2xl">
        {/* 플레이어 좌석 */}
        {gameState.players.map((player, index) => (
          <div
            key={player.id}
            className="absolute"
            style={playerPositions[index] || playerPositions[0]}
          >
            <PlayerSeat
              player={player}
              isCurrentTurn={gameState.currentPlayerIndex === index}
              isWinner={gameState.winners.some(w => w.id === player.id)}
              gamePhase={gameState.phase}
              lastAction={gameState.lastAction?.playerId === player.id ? gameState.lastAction.action : undefined}
              lastActionAmount={gameState.lastAction?.playerId === player.id ? gameState.lastAction.amount : undefined}
            />
          </div>
        ))}
        
        {/* 커뮤니티 카드 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <CommunityCards cards={gameState.communityCards} />
        </div>
        
        {/* 팟 표시 - 테이블 상단 아바타 위 */}
        <div className="absolute top-[1%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-black bg-opacity-80 text-white px-8 py-4 rounded-lg text-2xl font-bold shadow-2xl border-2 border-yellow-400">
            팟: {gameState.pot.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* 배팅 컨트롤 */}
      {isHumanTurn && gameState.phase !== 'showdown' && gameState.phase !== 'gameOver' && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <BettingControls
            gameState={gameState}
            onAction={onBettingAction}
          />
        </div>
      )}
      
      {/* 승자 축하 메시지 */}
      {gameState.phase === 'showdown' && gameState.winners.length > 0 && (
        <WinnerCelebration
          winners={gameState.winners}
          pot={gameState.pot}
          handRank={gameState.winnerHandRank}
          onNextGame={onNextGame}
        />
      )}
    </div>
  );
}

