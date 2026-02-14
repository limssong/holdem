import { Card, Rank, HandRank, HandResult } from '@/types/game';

const rankValues: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length < 5) {
    return { rank: 'highCard', cards: [], kickers: [] };
  }

  // 모든 가능한 5장 조합 평가
  const combinations = getCombinations(cards, 5);
  let bestHand: HandResult = { rank: 'highCard', cards: [], kickers: [] };

  for (const combo of combinations) {
    const result = evaluateFiveCards(combo);
    if (compareHands(result, bestHand) > 0) {
      bestHand = result;
    }
  }

  return bestHand;
}

function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 1) return arr.map(item => [item]);
  if (k === arr.length) return [arr];
  
  const combinations: T[][] = [];
  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    const tailCombos = getCombinations(arr.slice(i + 1), k - 1);
    for (const tail of tailCombos) {
      combinations.push([head, ...tail]);
    }
  }
  return combinations;
}

function evaluateFiveCards(cards: Card[]): HandResult {
  const sorted = [...cards].sort((a, b) => rankValues[b.rank] - rankValues[a.rank]);
  const ranks = sorted.map(c => c.rank);
  const suits = sorted.map(c => c.suit);
  
  const rankCounts: Record<Rank, number> = {
    '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0,
    '10': 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 0
  };
  
  ranks.forEach(rank => rankCounts[rank]++);
  
  const counts = Object.values(rankCounts).filter(c => c > 0).sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(ranks);
  
  // 로얄 플러시
  if (isFlush && isStraight && ranks.includes('A') && ranks.includes('K')) {
    return { rank: 'royalFlush', cards: sorted, kickers: [] };
  }
  
  // 스트레이트 플러시
  if (isFlush && isStraight) {
    return { rank: 'straightFlush', cards: sorted, kickers: [ranks[0]] };
  }
  
  // 포카드
  if (counts[0] === 4) {
    const fourRank = Object.keys(rankCounts).find(r => rankCounts[r as Rank] === 4) as Rank;
    const kicker = Object.keys(rankCounts).find(r => rankCounts[r as Rank] === 1) as Rank;
    return { rank: 'fourOfAKind', cards: sorted, kickers: [fourRank, kicker] };
  }
  
  // 풀하우스
  if (counts[0] === 3 && counts[1] === 2) {
    const threeRank = Object.keys(rankCounts).find(r => rankCounts[r as Rank] === 3) as Rank;
    const pairRank = Object.keys(rankCounts).find(r => rankCounts[r as Rank] === 2) as Rank;
    return { rank: 'fullHouse', cards: sorted, kickers: [threeRank, pairRank] };
  }
  
  // 플러시
  if (isFlush) {
    return { rank: 'flush', cards: sorted, kickers: ranks.slice(0, 5) };
  }
  
  // 스트레이트
  if (isStraight) {
    return { rank: 'straight', cards: sorted, kickers: [ranks[0]] };
  }
  
  // 트리플
  if (counts[0] === 3) {
    const threeRank = Object.keys(rankCounts).find(r => rankCounts[r as Rank] === 3) as Rank;
    const kickers = Object.keys(rankCounts)
      .filter(r => rankCounts[r as Rank] === 1)
      .sort((a, b) => rankValues[b as Rank] - rankValues[a as Rank])
      .slice(0, 2) as Rank[];
    return { rank: 'threeOfAKind', cards: sorted, kickers: [threeRank, ...kickers] };
  }
  
  // 투페어
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.keys(rankCounts)
      .filter(r => rankCounts[r as Rank] === 2)
      .sort((a, b) => rankValues[b as Rank] - rankValues[a as Rank]) as Rank[];
    const kicker = Object.keys(rankCounts).find(r => rankCounts[r as Rank] === 1) as Rank;
    return { rank: 'twoPair', cards: sorted, kickers: [pairs[0], pairs[1], kicker] };
  }
  
  // 원페어
  if (counts[0] === 2) {
    const pairRank = Object.keys(rankCounts).find(r => rankCounts[r as Rank] === 2) as Rank;
    const kickers = Object.keys(rankCounts)
      .filter(r => rankCounts[r as Rank] === 1)
      .sort((a, b) => rankValues[b as Rank] - rankValues[a as Rank])
      .slice(0, 3) as Rank[];
    return { rank: 'pair', cards: sorted, kickers: [pairRank, ...kickers] };
  }
  
  // 하이카드
  return { rank: 'highCard', cards: sorted, kickers: ranks.slice(0, 5) };
}

function checkStraight(ranks: Rank[]): boolean {
  const values = ranks.map(r => rankValues[r]).sort((a, b) => a - b);
  
  // 일반 스트레이트 체크
  for (let i = 0; i < values.length - 4; i++) {
    let consecutive = true;
    for (let j = 1; j < 5; j++) {
      if (values[i + j] !== values[i] + j) {
        consecutive = false;
        break;
      }
    }
    if (consecutive) return true;
  }
  
  // A-2-3-4-5 스트레이트 체크
  if (values.includes(14) && values.includes(2) && values.includes(3) && 
      values.includes(4) && values.includes(5)) {
    return true;
  }
  
  return false;
}

export function compareHands(hand1: HandResult, hand2: HandResult): number {
  const rankOrder: HandRank[] = [
    'highCard', 'pair', 'twoPair', 'threeOfAKind', 'straight',
    'flush', 'fullHouse', 'fourOfAKind', 'straightFlush', 'royalFlush'
  ];
  
  const rank1 = rankOrder.indexOf(hand1.rank);
  const rank2 = rankOrder.indexOf(hand2.rank);
  
  if (rank1 !== rank2) {
    return rank1 - rank2;
  }
  
  // 같은 족보인 경우 키커 비교
  for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
    const k1 = hand1.kickers[i] ? rankValues[hand1.kickers[i]] : 0;
    const k2 = hand2.kickers[i] ? rankValues[hand2.kickers[i]] : 0;
    if (k1 !== k2) {
      return k1 - k2;
    }
  }
  
  return 0;
}

