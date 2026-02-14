export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  hand: Card[];
  isHuman: boolean;
  position: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  currentBet: number;
  totalBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isActive: boolean;
}

export type BettingAction = 'check' | 'call' | 'raise' | 'fold';

export type GamePhase = 
  | 'setup' 
  | 'preflop' 
  | 'flop' 
  | 'turn' 
  | 'river' 
  | 'showdown' 
  | 'gameOver';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  communityCards: Card[];
  deck: Card[];
  pot: number;
  currentBet: number;
  dealerIndex: number;
  currentPlayerIndex: number;
  smallBlind: number;
  bigBlind: number;
  startingChips: number;
  winners: Player[];
  winnerHandRank?: HandRank; // 승자의 족보
  lastAction?: {
    playerId: string;
    action: BettingAction;
    amount?: number;
  };
  lastRaiseIndex?: number; // 마지막으로 레이즈한 플레이어 인덱스
}

export type HandRank = 
  | 'highCard'
  | 'pair'
  | 'twoPair'
  | 'threeOfAKind'
  | 'straight'
  | 'flush'
  | 'fullHouse'
  | 'fourOfAKind'
  | 'straightFlush'
  | 'royalFlush';

export interface HandResult {
  rank: HandRank;
  cards: Card[];
  kickers: Rank[];
}

