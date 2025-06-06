import { Card, Suit, Rank } from './Card';
import { Hand, HandRank } from './Hand';

export interface HandEvaluation {
  rank: HandRank;
  rankName: string;
  highCards: number[];
}

export class HandEvaluator {
  static evaluate(hand: Hand): HandEvaluation {
    const cards = hand.getCards();
    if (cards.length < 5) {
      throw new Error('Hand must have at least 5 cards to evaluate');
    }

    // Sort cards by rank (highest first)
    const sortedCards = [...cards].sort((a, b) => b.rank - a.rank);

    // Check for flush
    const isFlush = this.isFlush(sortedCards);
    
    // Check for straight
    const straightHighCard = this.getStraightHighCard(sortedCards);
    const isStraight = straightHighCard !== null;

    // Count ranks
    const rankCounts = this.getRankCounts(sortedCards);
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    // Check for various hands
    if (isStraight && isFlush) {
      if (straightHighCard === Rank.Ace) {
        return { rank: HandRank.RoyalFlush, rankName: 'Royal Flush', highCards: [Rank.Ace] };
      }
      return { rank: HandRank.StraightFlush, rankName: 'Straight Flush', highCards: [straightHighCard] };
    }

    if (counts[0] === 4) {
      const fourKindRank = this.getRankWithCount(rankCounts, 4);
      const kicker = sortedCards.find(c => c.rank !== fourKindRank)?.rank || 0;
      return { rank: HandRank.FourOfAKind, rankName: 'Four of a Kind', highCards: [fourKindRank, kicker] };
    }

    if (counts[0] === 3 && counts[1] === 2) {
      const threeKindRank = this.getRankWithCount(rankCounts, 3);
      const pairRank = this.getRankWithCount(rankCounts, 2);
      return { rank: HandRank.FullHouse, rankName: 'Full House', highCards: [threeKindRank, pairRank] };
    }

    if (isFlush) {
      const flushCards = this.getFlushCards(sortedCards).slice(0, 5);
      return { rank: HandRank.Flush, rankName: 'Flush', highCards: flushCards.map(c => c.rank) };
    }

    if (isStraight) {
      return { rank: HandRank.Straight, rankName: 'Straight', highCards: [straightHighCard] };
    }

    if (counts[0] === 3) {
      const threeKindRank = this.getRankWithCount(rankCounts, 3);
      const kickers = sortedCards.filter(c => c.rank !== threeKindRank).slice(0, 2).map(c => c.rank);
      return { rank: HandRank.ThreeOfAKind, rankName: 'Three of a Kind', highCards: [threeKindRank, ...kickers] };
    }

    if (counts[0] === 2 && counts[1] === 2) {
      const pairRanks = this.getRanksWithCount(rankCounts, 2).sort((a, b) => b - a);
      const kicker = sortedCards.find(c => !pairRanks.includes(c.rank))?.rank || 0;
      return { rank: HandRank.TwoPair, rankName: 'Two Pair', highCards: [...pairRanks, kicker] };
    }

    if (counts[0] === 2) {
      const pairRank = this.getRankWithCount(rankCounts, 2);
      const kickers = sortedCards.filter(c => c.rank !== pairRank).slice(0, 3).map(c => c.rank);
      return { rank: HandRank.Pair, rankName: 'Pair', highCards: [pairRank, ...kickers] };
    }

    // High card
    const highCards = sortedCards.slice(0, 5).map(c => c.rank);
    return { rank: HandRank.HighCard, rankName: 'High Card', highCards };
  }

  private static isFlush(cards: Card[]): boolean {
    const suitCounts: { [key in Suit]?: number } = {};
    for (const card of cards) {
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
      if (suitCounts[card.suit] >= 5) {
        return true;
      }
    }
    return false;
  }

  private static getFlushCards(cards: Card[]): Card[] {
    const suitCounts: { [key in Suit]?: Card[] } = {};
    for (const card of cards) {
      if (!suitCounts[card.suit]) {
        suitCounts[card.suit] = [];
      }
      suitCounts[card.suit].push(card);
    }
    
    for (const suit in suitCounts) {
      if (suitCounts[suit as Suit]!.length >= 5) {
        return suitCounts[suit as Suit]!;
      }
    }
    return [];
  }

  private static getStraightHighCard(cards: Card[]): number | null {
    const uniqueRanks = [...new Set(cards.map(c => c.rank))].sort((a, b) => b - a);
    
    // Check for A-2-3-4-5 straight (wheel)
    if (uniqueRanks.includes(Rank.Ace) && 
        uniqueRanks.includes(2) && 
        uniqueRanks.includes(3) && 
        uniqueRanks.includes(4) && 
        uniqueRanks.includes(5)) {
      return 5; // In wheel straight, 5 is the high card
    }

    // Check for regular straights
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      let isStraight = true;
      for (let j = 0; j < 4; j++) {
        if (uniqueRanks[i + j] - uniqueRanks[i + j + 1] !== 1) {
          isStraight = false;
          break;
        }
      }
      if (isStraight) {
        return uniqueRanks[i];
      }
    }
    
    return null;
  }

  private static getRankCounts(cards: Card[]): { [rank: number]: number } {
    const counts: { [rank: number]: number } = {};
    for (const card of cards) {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
    }
    return counts;
  }

  private static getRankWithCount(rankCounts: { [rank: number]: number }, count: number): number {
    for (const rank in rankCounts) {
      if (rankCounts[+rank] === count) {
        return +rank;
      }
    }
    return 0;
  }

  private static getRanksWithCount(rankCounts: { [rank: number]: number }, count: number): number[] {
    const ranks: number[] = [];
    for (const rank in rankCounts) {
      if (rankCounts[+rank] === count) {
        ranks.push(+rank);
      }
    }
    return ranks;
  }

  static compareHands(eval1: HandEvaluation, eval2: HandEvaluation): number {
    if (eval1.rank !== eval2.rank) {
      return eval1.rank - eval2.rank;
    }

    // Compare high cards
    for (let i = 0; i < Math.min(eval1.highCards.length, eval2.highCards.length); i++) {
      if (eval1.highCards[i] !== eval2.highCards[i]) {
        return eval1.highCards[i] - eval2.highCards[i];
      }
    }

    return 0;
  }
}