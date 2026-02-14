'use client';

import { useState } from 'react';
import { GameState, BettingAction } from '@/types/game';
import { initializeGame, startGame, processBettingAction, getAIAction, getNextActivePlayer } from '@/utils/gameLogic';
import GameTable from '@/components/GameTable';
import SetupScreen from '@/components/SetupScreen';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(7);

  const handleStart = (smallBlind: number, bigBlind: number, startingChips: number, count: number) => {
    setPlayerCount(count);
    const newGame = initializeGame(smallBlind, bigBlind, startingChips, count);
    const startedGame = startGame(newGame);
    setGameState(startedGame);
    setIsGameStarted(true);
    
    // 프리플랍 배팅 시작 (사용자 턴이 올 때까지 AI 처리)
    setTimeout(() => {
      processAITurns(startedGame);
    }, 1000);
  };

  const handleBettingAction = (action: BettingAction, amount?: number) => {
    if (!gameState) return;
    
    const humanPlayer = gameState.players.find(p => p.isHuman);
    if (!humanPlayer || humanPlayer.isFolded) return;
    
    const previousPhase = gameState.phase;
    const newState = processBettingAction(gameState, humanPlayer.id, action, amount);
    setGameState(newState);
    
    // 배팅 라운드가 끝났는지 확인 (페이즈 변경)
    if (newState.phase !== previousPhase) {
      // 쇼다운이면 게임 종료
      if (newState.phase === 'showdown') {
        // 자동으로 다음 게임으로 진행하지 않음
        // 사용자가 축하 메시지의 버튼을 눌러야 함
      } else {
        // 다음 단계(플랍, 턴, 리버)가 시작되면 배팅 라운드 시작
        // 카드가 오픈된 후 배팅이 시작되므로 AI 턴 처리
        setTimeout(() => {
          processAITurns(newState);
        }, 1500);
      }
    } else {
      // AI 플레이어들의 턴 처리
      if (newState.phase !== 'showdown' && newState.phase !== 'gameOver') {
        setTimeout(() => {
          processAITurns(newState);
        }, 1000);
      }
    }
  };

  const processAITurns = (currentState: GameState) => {
    let state = { ...currentState };
    let iterations = 0;
    const maxIterations = 30; // 무한 루프 방지
    
    const processNextTurn = () => {
      if (iterations >= maxIterations) {
        setGameState(state);
        return;
      }
      
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // 인간 플레이어 차례면 중단
      if (currentPlayer && currentPlayer.isHuman) {
        setGameState(state);
        return;
      }
      
      // 폴드한 플레이어는 스킵 (올인한 플레이어는 배팅 라운드에 참여하지만 액션은 하지 않음)
      if (!currentPlayer || currentPlayer.isFolded) {
        state.currentPlayerIndex = getNextActivePlayer(state, state.currentPlayerIndex);
        iterations++;
        setTimeout(processNextTurn, 500);
        return;
      }
      
      // 올인한 플레이어는 액션 없이 다음으로
      if (currentPlayer.isAllIn) {
        // 올인한 플레이어는 배팅 라운드에 참여하지만 액션은 하지 않음
        // currentBet을 currentBet으로 유지하고 다음으로
        state.currentPlayerIndex = getNextActivePlayer(state, state.currentPlayerIndex);
        iterations++;
        setTimeout(processNextTurn, 500);
        return;
      }
      
      // 현재 플레이어의 턴임을 표시하기 위해 상태 업데이트
      setGameState({ ...state });
      
      // AI 액션 결정
      const aiAction = getAIAction(state, currentPlayer.id);
      let raiseAmount: number | undefined;
      
      if (aiAction === 'raise') {
        const callAmount = state.currentBet - currentPlayer.currentBet;
        raiseAmount = Math.max(
          state.bigBlind,
          Math.min(
            state.bigBlind * 3,
            Math.floor(currentPlayer.chips * 0.3)
          )
        );
      }
      
      // 배팅 액션 표시를 위해 상태 업데이트
      const actionState = { ...state, lastAction: { playerId: currentPlayer.id, action: aiAction, amount: raiseAmount } };
      setGameState(actionState);
      
      // 1.5초 대기 후 AI 액션 처리 (배팅 금액 확인 시간)
      setTimeout(() => {
        const previousPhase = actionState.phase;
        const newState = processBettingAction(actionState, currentPlayer.id, aiAction, raiseAmount);
        // lastAction 초기화
        newState.lastAction = undefined;
        
        // 배팅 라운드가 끝났는지 확인
        if (newState.phase !== previousPhase) {
          setGameState(newState);
          
          // 쇼다운이면 게임 종료 (사용자가 버튼을 눌러야 다음 게임으로 진행)
          if (newState.phase === 'showdown') {
            // 자동으로 다음 게임으로 진행하지 않음
            // 사용자가 축하 메시지의 버튼을 눌러야 함
          } else {
            // 다음 단계(플랍, 턴, 리버)가 시작되면 배팅 라운드 시작
            // 카드가 오픈된 후 배팅이 시작되므로 AI 턴 처리
            // newState를 직접 사용하여 processAITurns 호출
            setTimeout(() => {
              processAITurns(newState);
            }, 1500);
          }
          return;
        }
        
        setGameState(newState);
        
        // 다음 AI 턴 처리
        setTimeout(() => {
          processAITurns(newState);
        }, 500);
      }, 1500);
      
      return;
      
      iterations++;
      setTimeout(processNextTurn, 800);
    };
    
    processNextTurn();
  };

  const handleNextGame = (currentState: GameState) => {
    // 다음 게임을 시작하거나 게임 종료
    // 플레이어 수 유지
    const newGame = initializeGame(
      currentState.smallBlind,
      currentState.bigBlind,
      currentState.startingChips,
      playerCount
    );
    
    // 각 플레이어의 칩을 유지하면서 새 게임 시작
    newGame.players.forEach((player, index) => {
      if (currentState.players[index]) {
        player.chips = currentState.players[index].chips;
        // 칩이 0 이하인 플레이어는 비활성화
        if (player.chips <= 0) {
          player.isActive = false;
        }
      }
    });
    
    // 딜러 버튼을 다음 플레이어로 이동
    const numPlayers = currentState.players.length;
    const nextDealerIndex = (currentState.dealerIndex + 1) % numPlayers;
    newGame.dealerIndex = nextDealerIndex;
    
    const startedGame = startGame(newGame);
    setGameState(startedGame);
    
    // AI 턴 처리 시작
    if (startedGame.phase !== 'showdown' && startedGame.phase !== 'gameOver') {
      setTimeout(() => {
        processAITurns(startedGame);
      }, 1000);
    }
  };

  if (!isGameStarted) {
    return <SetupScreen onStart={handleStart} />;
  }

  if (!gameState) {
    return <div>게임 로딩 중...</div>;
  }

  const handleNextGameClick = () => {
    if (gameState) {
      handleNextGame(gameState);
    }
  };

  return (
    <GameTable
      gameState={gameState}
      onBettingAction={handleBettingAction}
      onNextGame={handleNextGameClick}
    />
  );
}

