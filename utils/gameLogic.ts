import { GameState, Player, BettingAction, Card, GamePhase } from '@/types/game';
import { createDeck, dealCard } from './cards';
import { evaluateHand, compareHands } from './handEvaluator';

const PC_PLAYER_NAMES = [
  '알렉스', '브라이언', '크리스', '다니엘', '에릭', '프랭크'
];

const PC_PLAYER_AVATARS = [
  '👨', '👩', '🧑', '👨‍🦱', '👩‍🦰', '🧑‍🦳'
];

export function initializeGame(smallBlind: number, bigBlind: number, startingChips: number, playerCount: number = 7): GameState {
  const players: Player[] = [];
  
  // 플레이어 수 제한 (2-7명)
  const numPlayers = Math.max(2, Math.min(7, playerCount));
  
  // 사용자 플레이어
  players.push({
    id: 'player-0',
    name: '나',
    avatar: '😎',
    chips: startingChips,
    hand: [],
    isHuman: true,
    position: 0,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false,
    currentBet: 0,
    totalBet: 0,
    isFolded: false,
    isAllIn: false,
    isActive: true,
  });
  
  // PC 플레이어들
  for (let i = 1; i < numPlayers; i++) {
    players.push({
      id: `player-${i}`,
      name: PC_PLAYER_NAMES[(i - 1) % PC_PLAYER_NAMES.length],
      avatar: PC_PLAYER_AVATARS[(i - 1) % PC_PLAYER_AVATARS.length],
      chips: startingChips,
      hand: [],
      isHuman: false,
      position: i,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
      currentBet: 0,
      totalBet: 0,
      isFolded: false,
      isAllIn: false,
      isActive: true,
    });
  }
  
  return {
    phase: 'setup',
    players,
    communityCards: [],
    deck: [],
    pot: 0,
    currentBet: 0,
    dealerIndex: 0,
    currentPlayerIndex: 0,
    smallBlind,
    bigBlind,
    startingChips,
    winners: [],
    lastAction: undefined,
    lastRaiseIndex: undefined,
  };
}

export function startGame(gameState: GameState): GameState {
  const newState = { ...gameState };
  
  // 딜러 위치 설정 (gameState의 dealerIndex 사용, 없으면 0)
  const dealerIndex = newState.dealerIndex ?? 0;
  newState.dealerIndex = dealerIndex;
  
  // 딜러, SB, BB 표시 초기화
  newState.players.forEach(p => {
    p.isDealer = false;
    p.isSmallBlind = false;
    p.isBigBlind = false;
  });
  
  // 딜러 버튼 설정
  newState.players[dealerIndex].isDealer = true;
  
  // SB, BB 위치 계산 (시계방향 기준)
  // 딜러의 위치가 스몰블라인드보다 반시계방향으로 하나 옆 = 딜러 다음이 SB
  // SB 다음이 BB
  const numPlayers = newState.players.length;
  const sbIndex = (dealerIndex + 1) % numPlayers;
  const bbIndex = (dealerIndex + 2) % numPlayers;
  
  newState.players[sbIndex].isSmallBlind = true;
  newState.players[bbIndex].isBigBlind = true;
  
  // 덱 생성 및 셔플
  newState.deck = createDeck();
  
  // 모든 플레이어에게 2장씩 카드 배분
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < newState.players.length; j++) {
      const card = dealCard(newState.deck);
      if (card) {
        newState.players[j].hand.push(card);
      }
    }
  }
  
  // 블라인드 배팅
  const sbPlayer = newState.players[sbIndex];
  const bbPlayer = newState.players[bbIndex];
  
  const sbBet = Math.min(newState.smallBlind, sbPlayer.chips);
  sbPlayer.chips -= sbBet;
  sbPlayer.currentBet = sbBet;
  sbPlayer.totalBet = sbBet;
  
  const bbBet = Math.min(newState.bigBlind, bbPlayer.chips);
  bbPlayer.chips -= bbBet;
  bbPlayer.currentBet = bbBet;
  bbPlayer.totalBet = bbBet;
  
  newState.pot = sbBet + bbBet;
  newState.currentBet = bbBet;
  
  // 첫 배팅은 BB 다음부터 (UTG)
  newState.currentPlayerIndex = (bbIndex + 1) % numPlayers;
  newState.phase = 'preflop';
  
  return newState;
}

export function processBettingAction(
  gameState: GameState,
  playerId: string,
  action: BettingAction,
  raiseAmount?: number
): GameState {
  const newState = { ...gameState };
  const player = newState.players.find(p => p.id === playerId);
  
  if (!player || player.isFolded || player.isAllIn) {
    return newState;
  }
  
  const callAmount = newState.currentBet - player.currentBet;
  
  switch (action) {
    case 'fold':
      player.isFolded = true;
      player.isActive = false;
      break;
      
    case 'check':
      if (callAmount > 0) {
        // 체크 불가능한 경우 콜로 처리
        if (player.chips >= callAmount) {
          player.chips -= callAmount;
          player.currentBet += callAmount;
          player.totalBet += callAmount;
          newState.pot += callAmount;
        } else {
          // 올인
          const allInAmount = player.chips;
          player.chips = 0;
          player.currentBet += allInAmount;
          player.totalBet += allInAmount;
          player.isAllIn = true;
          newState.pot += allInAmount;
        }
      }
      break;
      
    case 'call':
      if (player.chips >= callAmount) {
        player.chips -= callAmount;
        player.currentBet += callAmount;
        player.totalBet += callAmount;
        newState.pot += callAmount;
      } else {
        // 올인
        const allInAmount = player.chips;
        player.chips = 0;
        player.currentBet += allInAmount;
        player.totalBet += allInAmount;
        player.isAllIn = true;
        newState.pot += allInAmount;
      }
      break;
      
    case 'raise':
      const raise = raiseAmount || newState.bigBlind;
      const totalNeeded = callAmount + raise;
      
      if (player.chips >= totalNeeded) {
        player.chips -= totalNeeded;
        player.currentBet += totalNeeded;
        player.totalBet += totalNeeded;
        newState.pot += totalNeeded;
        newState.currentBet = player.currentBet;
        // 마지막 레이즈 플레이어 인덱스 저장
        newState.lastRaiseIndex = newState.players.indexOf(player);
      } else {
        // 올인
        const allInAmount = player.chips;
        player.chips = 0;
        player.currentBet += allInAmount;
        player.totalBet += allInAmount;
        player.isAllIn = true;
        newState.pot += allInAmount;
        if (player.currentBet > newState.currentBet) {
          newState.currentBet = player.currentBet;
          // 올인으로 레이즈한 경우
          newState.lastRaiseIndex = newState.players.indexOf(player);
        }
      }
      break;
  }
  
  // 배팅 라운드 종료 체크 (액션 처리 후)
  // 다음 플레이어로 이동
  newState.currentPlayerIndex = getNextActivePlayer(newState, newState.currentPlayerIndex);
  
  // 배팅 라운드 종료 체크
  // isBettingRoundComplete 함수 내부에서 배팅 라운드가 시작되지 않았는지 확인하므로
  // 여기서는 바로 호출
  // 단, 플랍/턴/리버 페이즈에서 resetBettingRound 직후에는 배팅 라운드가 시작되지 않았으므로
  // 완료 체크를 하지 않음 (이미 isBettingRoundComplete에서 처리)
  if (isBettingRoundComplete(newState)) {
    const previousPhase = newState.phase;
    newState.phase = getNextPhase(newState.phase);
    
    if (newState.phase === 'flop') {
      // 플랍 카드 3장 오픈
      for (let i = 0; i < 3; i++) {
        const card = dealCard(newState.deck);
        if (card) {
          newState.communityCards.push(card);
        }
      }
      // SB부터 배팅 시작
      const sbPlayer = newState.players.find(p => p.isSmallBlind);
      if (sbPlayer) {
        const sbIndex = newState.players.indexOf(sbPlayer);
        newState.currentPlayerIndex = getNextActivePlayer(newState, sbIndex);
      } else {
        // SB 플레이어를 찾을 수 없으면 딜러 다음부터
        newState.currentPlayerIndex = getNextActivePlayer(newState, newState.dealerIndex);
      }
      resetBettingRound(newState);
      // resetBettingRound 직후에는 배팅 라운드가 시작되지 않았으므로
      // isBettingRoundComplete가 false를 반환하도록 함
    } else if (newState.phase === 'turn' || newState.phase === 'river') {
      // 턴/리버 카드 1장 오픈
      const card = dealCard(newState.deck);
      if (card) {
        newState.communityCards.push(card);
      }
      // SB부터 배팅 시작
      const sbPlayer = newState.players.find(p => p.isSmallBlind);
      if (sbPlayer) {
        const sbIndex = newState.players.indexOf(sbPlayer);
        newState.currentPlayerIndex = getNextActivePlayer(newState, sbIndex);
      } else {
        // SB 플레이어를 찾을 수 없으면 딜러 다음부터
        newState.currentPlayerIndex = getNextActivePlayer(newState, newState.dealerIndex);
      }
      resetBettingRound(newState);
      // resetBettingRound 직후에는 배팅 라운드가 시작되지 않았으므로
      // isBettingRoundComplete가 false를 반환하도록 함
    } else if (newState.phase === 'showdown') {
      // 쇼다운 - 승자 결정
      determineWinners(newState);
    }
  }
  
  return newState;
}

export function getNextActivePlayer(gameState: GameState, startIndex: number): number {
  const numPlayers = gameState.players.length;
  let nextIndex = (startIndex + 1) % numPlayers;
  let attempts = 0;
  
  while (attempts < numPlayers) {
    const player = gameState.players[nextIndex];
    // 폴드하지 않고 활성화된 플레이어 (올인한 플레이어도 포함)
    if (!player.isFolded && player.isActive) {
      return nextIndex;
    }
    nextIndex = (nextIndex + 1) % numPlayers;
    attempts++;
  }
  
  return nextIndex;
}

function isBettingRoundComplete(gameState: GameState): boolean {
  const activePlayers = gameState.players.filter(
    p => !p.isFolded && p.isActive
  );
  
  if (activePlayers.length <= 1) {
    return true;
  }
  
  // 올인이 아닌 활성 플레이어들
  const nonAllInPlayers = activePlayers.filter(p => !p.isAllIn);
  
  if (nonAllInPlayers.length <= 1) {
    return true;
  }
  
  // 배팅 라운드가 시작되지 않았으면 완료되지 않음
  // resetBettingRound 후에는 currentBet이 0이고 모든 플레이어의 currentBet도 0이지만,
  // 이는 배팅 라운드가 시작되지 않은 상태이므로 완료되지 않음
  // 배팅 라운드가 시작되었는지 확인: 최소한 한 명의 플레이어가 액션을 했는지 확인
  // 프리플랍: BB 다음부터 시작
  // 플랍/턴/리버: SB 다음부터 시작
  const dealerIndex = gameState.dealerIndex;
  const numPlayers = gameState.players.length;
  let bettingStartIndex: number;
  
  if (gameState.phase === 'preflop') {
    // 프리플랍: BB 다음부터 시작
    const bbPlayer = gameState.players.find(p => p.isBigBlind);
    if (bbPlayer) {
      const bbIndex = gameState.players.indexOf(bbPlayer);
      bettingStartIndex = getNextActivePlayer(gameState, bbIndex);
    } else {
      bettingStartIndex = getNextActivePlayer(gameState, dealerIndex);
    }
  } else {
    // 플랍/턴/리버: SB 다음부터 시작
    const sbPlayer = gameState.players.find(p => p.isSmallBlind);
    if (sbPlayer) {
      const sbIndex = gameState.players.indexOf(sbPlayer);
      bettingStartIndex = getNextActivePlayer(gameState, sbIndex);
    } else {
      bettingStartIndex = getNextActivePlayer(gameState, dealerIndex);
    }
  }
  
  // 배팅 라운드가 시작되지 않았으면 완료되지 않음
  // resetBettingRound 직후에는 currentBet이 0이고 모든 플레이어의 currentBet도 0이지만,
  // 이는 배팅 라운드가 시작되지 않은 상태이므로 완료되지 않음
  if (gameState.currentBet === 0) {
    const allBetsZero = nonAllInPlayers.every(p => p.currentBet === 0);
    if (allBetsZero) {
      // 현재 플레이어가 배팅 시작 인덱스이면 배팅 라운드가 시작되지 않은 상태
      if (gameState.currentPlayerIndex === bettingStartIndex) {
        return false;
      }
      // 플랍/턴/리버 페이즈에서 currentBet이 0이고 모든 플레이어의 currentBet이 0이면 
      // 배팅 라운드가 시작되지 않은 상태 (resetBettingRound 직후)
      if (gameState.phase !== 'preflop') {
        return false;
      }
    }
  }
  
  // 모든 활성 플레이어의 배팅이 같아야 함
  const allBetsEqual = nonAllInPlayers.every(
    p => p.currentBet === gameState.currentBet
  );
  
  if (!allBetsEqual) {
    return false;
  }
  
  // 프리플랍의 경우 SB가 BB에 맞춰야 함
  if (gameState.phase === 'preflop') {
    const sbPlayer = gameState.players.find(p => p.isSmallBlind);
    if (sbPlayer && !sbPlayer.isFolded && !sbPlayer.isAllIn) {
      if (sbPlayer.currentBet < gameState.currentBet) {
        return false;
      }
    }
  }
  
  // 배팅 라운드가 완료되려면:
  // 1. 모든 활성 플레이어가 같은 금액을 배팅했어야 함 (이미 확인됨)
  // 2. 마지막으로 레이즈한 플레이어 다음부터 모든 플레이어가 액션을 완료했어야 함
  
  // 배팅 라운드가 완료되려면 모든 활성 플레이어가 같은 금액을 배팅했어야 함
  // 그리고 현재 플레이어가 마지막으로 액션한 플레이어 다음이어야 함
  
  // 현재 플레이어 확인
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (currentPlayer && !currentPlayer.isFolded && currentPlayer.isActive && !currentPlayer.isAllIn) {
    // 현재 플레이어가 아직 배팅하지 않았으면 완료되지 않음
    if (currentPlayer.currentBet < gameState.currentBet) {
      return false;
    }
  }
  
  // 마지막 레이즈가 있었다면, 그 플레이어 다음부터 모든 플레이어가 액션을 완료했는지 확인
  if (gameState.lastRaiseIndex !== undefined) {
    const lastRaiseIndex = gameState.lastRaiseIndex;
    const numPlayers = gameState.players.length;
    
    // 마지막 레이즈 플레이어 다음부터 현재 플레이어까지 모든 플레이어가 액션을 완료했는지 확인
    let checkIndex = (lastRaiseIndex + 1) % numPlayers;
    let checkedCount = 0;
    let reachedCurrent = false;
    
    while (checkedCount < numPlayers) {
      if (checkIndex === gameState.currentPlayerIndex) {
        reachedCurrent = true;
        break;
      }
      
      const checkPlayer = gameState.players[checkIndex];
      if (!checkPlayer.isFolded && checkPlayer.isActive && !checkPlayer.isAllIn) {
        // 아직 액션을 완료하지 않은 플레이어가 있으면 완료되지 않음
        if (checkPlayer.currentBet < gameState.currentBet) {
          return false;
        }
      }
      
      checkIndex = (checkIndex + 1) % numPlayers;
      checkedCount++;
    }
    
    // 마지막 레이즈 플레이어 다음부터 현재 플레이어까지 도달하지 못했다면 완료되지 않음
    if (!reachedCurrent) {
      return false;
    }
  } else {
    // 레이즈가 없었다면, 모든 플레이어가 액션을 완료했는지 확인
    const numPlayers = gameState.players.length;
    
    // 프리플랍: BB 다음부터 시작
    // 플랍/턴/리버: SB 다음부터 시작
    let startIndex: number;
    if (gameState.phase === 'preflop') {
      const bbPlayer = gameState.players.find(p => p.isBigBlind);
      if (bbPlayer) {
        const bbIndex = gameState.players.indexOf(bbPlayer);
        startIndex = getNextActivePlayer(gameState, bbIndex);
      } else {
        startIndex = getNextActivePlayer(gameState, gameState.dealerIndex);
      }
    } else {
      const sbPlayer = gameState.players.find(p => p.isSmallBlind);
      if (sbPlayer) {
        const sbIndex = gameState.players.indexOf(sbPlayer);
        startIndex = getNextActivePlayer(gameState, sbIndex);
      } else {
        startIndex = getNextActivePlayer(gameState, gameState.dealerIndex);
      }
    }
    
    // 모든 활성 플레이어가 체크했는지 확인 (currentBet이 0이고 모든 플레이어의 currentBet도 0)
    if (gameState.currentBet === 0) {
      const allBetsZero = nonAllInPlayers.every(p => p.currentBet === 0);
      if (allBetsZero) {
        // 배팅 라운드가 시작되지 않았는지 확인
        if (gameState.currentPlayerIndex === startIndex) {
          // 배팅 라운드가 시작되지 않은 상태
          return false;
        }
        
        // 모든 플레이어가 체크했는지 확인: 시작 인덱스부터 현재 플레이어 이전까지 모든 플레이어가 액션을 완료했는지
        let checkIndex = startIndex;
        let checkedCount = 0;
        let reachedCurrent = false;
        
        while (checkedCount < numPlayers) {
          if (checkIndex === gameState.currentPlayerIndex) {
            reachedCurrent = true;
            break;
          }
          
          const checkPlayer = gameState.players[checkIndex];
          if (!checkPlayer.isFolded && checkPlayer.isActive && !checkPlayer.isAllIn) {
            // 모든 플레이어가 체크했으므로 currentBet이 0이어야 함
            if (checkPlayer.currentBet !== 0) {
              return false;
            }
          }
          
          checkIndex = (checkIndex + 1) % numPlayers;
          checkedCount++;
        }
        
        // 시작 인덱스부터 현재 플레이어까지 도달했으면 모든 플레이어가 액션을 완료한 것
        return reachedCurrent;
      }
    }
    
    // 배팅이 있는 경우: 시작 인덱스부터 현재 플레이어까지 모든 플레이어가 액션을 완료했는지 확인
    let checkIndex = startIndex;
    let checkedCount = 0;
    let reachedCurrent = false;
    
    while (checkedCount < numPlayers) {
      if (checkIndex === gameState.currentPlayerIndex) {
        reachedCurrent = true;
        break;
      }
      
      const checkPlayer = gameState.players[checkIndex];
      if (!checkPlayer.isFolded && checkPlayer.isActive && !checkPlayer.isAllIn) {
        // 아직 액션을 완료하지 않은 플레이어가 있으면 완료되지 않음
        if (checkPlayer.currentBet < gameState.currentBet) {
          return false;
        }
      }
      
      checkIndex = (checkIndex + 1) % numPlayers;
      checkedCount++;
    }
    
    // 시작 인덱스부터 현재 플레이어까지 도달하지 못했다면 완료되지 않음
    if (!reachedCurrent) {
      return false;
    }
  }
  
  return true;
}

function resetBettingRound(gameState: GameState): void {
  gameState.players.forEach(p => {
    p.currentBet = 0;
  });
  gameState.currentBet = 0;
  gameState.lastRaiseIndex = undefined;
}

function getNextPhase(currentPhase: GamePhase): GamePhase {
  switch (currentPhase) {
    case 'preflop': return 'flop';
    case 'flop': return 'turn';
    case 'turn': return 'river';
    case 'river': return 'showdown';
    default: return 'gameOver';
  }
}

function determineWinners(gameState: GameState): void {
  const activePlayers = gameState.players.filter(p => !p.isFolded);
  
  if (activePlayers.length === 1) {
    gameState.winners = activePlayers;
    activePlayers[0].chips += gameState.pot;
    // 단독 승자일 때도 족보 계산
    const allCards = [...activePlayers[0].hand, ...gameState.communityCards];
    const handResult = evaluateHand(allCards);
    gameState.winnerHandRank = handResult.rank;
    return;
  }
  
  // 각 플레이어의 최고 족보 계산
  const playerHands = activePlayers.map(player => {
    const allCards = [...player.hand, ...gameState.communityCards];
    return {
      player,
      result: evaluateHand(allCards),
    };
  });
  
  // 최고 족보 찾기
  let bestHand = playerHands[0];
  for (let i = 1; i < playerHands.length; i++) {
    if (compareHands(playerHands[i].result, bestHand.result) > 0) {
      bestHand = playerHands[i];
    }
  }
  
  // 승자의 족보 저장
  gameState.winnerHandRank = bestHand.result.rank;
  
  // 동점자 찾기
  gameState.winners = playerHands
    .filter(ph => compareHands(ph.result, bestHand.result) === 0)
    .map(ph => ph.player);
  
  // 팟 분배
  const potPerWinner = Math.floor(gameState.pot / gameState.winners.length);
  gameState.winners.forEach(winner => {
    winner.chips += potPerWinner;
  });
}

export function getAIAction(gameState: GameState, playerId: string): BettingAction {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.isFolded || player.isAllIn) {
    return 'fold';
  }
  
  // 간단한 AI 로직: 확률 기반 결정
  const callAmount = gameState.currentBet - player.currentBet;
  const handStrength = estimateHandStrength(player.hand, gameState.communityCards);
  
  // 올인 상황
  if (player.chips <= callAmount) {
    return handStrength > 0.3 ? 'call' : 'fold';
  }
  
  // 강한 핸드
  if (handStrength > 0.7) {
    return 'raise';
  }
  
  // 중간 핸드
  if (handStrength > 0.4) {
    return callAmount === 0 ? 'check' : 'call';
  }
  
  // 약한 핸드
  if (callAmount === 0) {
    return 'check';
  }
  
  // 작은 배팅이면 콜, 큰 배팅이면 폴드
  const betRatio = callAmount / player.chips;
  return betRatio < 0.1 ? 'call' : 'fold';
}

function estimateHandStrength(hand: Card[], communityCards: Card[]): number {
  if (hand.length < 2) return 0;
  
  // 간단한 추정: 높은 카드와 페어 가능성
  const rankValues: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  
  const handRanks = hand.map(c => rankValues[c.rank]);
  const highCard = Math.max(...handRanks);
  
  // 페어 체크
  const isPair = hand[0].rank === hand[1].rank;
  
  // 스트레이트/플러시 가능성 (간단히)
  const suited = hand[0].suit === hand[1].suit;
  const connected = Math.abs(handRanks[0] - handRanks[1]) <= 4;
  
  let strength = 0.3; // 기본값
  
  if (isPair) strength += 0.3;
  if (highCard >= 12) strength += 0.2; // K, A
  if (suited) strength += 0.1;
  if (connected) strength += 0.1;
  
  return Math.min(strength, 1.0);
}

