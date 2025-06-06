import { HandEvaluator } from '../src/HandEvaluator';
import { Hand, HandRank } from '../src/Hand';
import { Card, Suit, Rank } from '../src/Card';

describe('HandEvaluator', () => {
  function createHand(cards: Array<[Suit, Rank]>): Hand {
    const hand = new Hand();
    cards.forEach(([suit, rank]) => {
      hand.addCard(new Card(suit, rank));
    });
    return hand;
  }

  describe('evaluate', () => {
    it('should detect Royal Flush', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.Ace],
        [Suit.Hearts, Rank.King],
        [Suit.Hearts, Rank.Queen],
        [Suit.Hearts, Rank.Jack],
        [Suit.Hearts, Rank.Ten]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.RoyalFlush);
      expect(result.rankName).toBe('Royal Flush');
    });

    it('should detect Straight Flush', () => {
      const hand = createHand([
        [Suit.Clubs, Rank.Nine],
        [Suit.Clubs, Rank.Eight],
        [Suit.Clubs, Rank.Seven],
        [Suit.Clubs, Rank.Six],
        [Suit.Clubs, Rank.Five]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.StraightFlush);
      expect(result.rankName).toBe('Straight Flush');
      expect(result.highCards[0]).toBe(Rank.Nine);
    });

    it('should detect Four of a Kind', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.King],
        [Suit.Diamonds, Rank.King],
        [Suit.Clubs, Rank.King],
        [Suit.Spades, Rank.King],
        [Suit.Hearts, Rank.Two]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.FourOfAKind);
      expect(result.rankName).toBe('Four of a Kind');
      expect(result.highCards[0]).toBe(Rank.King);
    });

    it('should detect Full House', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.Queen],
        [Suit.Diamonds, Rank.Queen],
        [Suit.Clubs, Rank.Queen],
        [Suit.Spades, Rank.Five],
        [Suit.Hearts, Rank.Five]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.FullHouse);
      expect(result.rankName).toBe('Full House');
      expect(result.highCards[0]).toBe(Rank.Queen);
      expect(result.highCards[1]).toBe(Rank.Five);
    });

    it('should detect Flush', () => {
      const hand = createHand([
        [Suit.Diamonds, Rank.Ace],
        [Suit.Diamonds, Rank.Jack],
        [Suit.Diamonds, Rank.Nine],
        [Suit.Diamonds, Rank.Five],
        [Suit.Diamonds, Rank.Three]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.Flush);
      expect(result.rankName).toBe('Flush');
    });

    it('should detect Straight', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.Eight],
        [Suit.Diamonds, Rank.Seven],
        [Suit.Clubs, Rank.Six],
        [Suit.Spades, Rank.Five],
        [Suit.Hearts, Rank.Four]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.Straight);
      expect(result.rankName).toBe('Straight');
      expect(result.highCards[0]).toBe(Rank.Eight);
    });

    it('should detect Wheel Straight (A-2-3-4-5)', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.Ace],
        [Suit.Diamonds, Rank.Two],
        [Suit.Clubs, Rank.Three],
        [Suit.Spades, Rank.Four],
        [Suit.Hearts, Rank.Five]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.Straight);
      expect(result.rankName).toBe('Straight');
      expect(result.highCards[0]).toBe(5); // 5 is high in wheel
    });

    it('should detect Three of a Kind', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.Jack],
        [Suit.Diamonds, Rank.Jack],
        [Suit.Clubs, Rank.Jack],
        [Suit.Spades, Rank.Seven],
        [Suit.Hearts, Rank.Two]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.ThreeOfAKind);
      expect(result.rankName).toBe('Three of a Kind');
      expect(result.highCards[0]).toBe(Rank.Jack);
    });

    it('should detect Two Pair', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.King],
        [Suit.Diamonds, Rank.King],
        [Suit.Clubs, Rank.Three],
        [Suit.Spades, Rank.Three],
        [Suit.Hearts, Rank.Seven]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.TwoPair);
      expect(result.rankName).toBe('Two Pair');
      expect(result.highCards[0]).toBe(Rank.King);
      expect(result.highCards[1]).toBe(Rank.Three);
    });

    it('should detect Pair', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.Ten],
        [Suit.Diamonds, Rank.Ten],
        [Suit.Clubs, Rank.Ace],
        [Suit.Spades, Rank.Eight],
        [Suit.Hearts, Rank.Two]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.Pair);
      expect(result.rankName).toBe('Pair');
      expect(result.highCards[0]).toBe(Rank.Ten);
    });

    it('should detect High Card', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.Ace],
        [Suit.Diamonds, Rank.King],
        [Suit.Clubs, Rank.Nine],
        [Suit.Spades, Rank.Seven],
        [Suit.Hearts, Rank.Three]
      ]);
      
      const result = HandEvaluator.evaluate(hand);
      expect(result.rank).toBe(HandRank.HighCard);
      expect(result.rankName).toBe('High Card');
      expect(result.highCards[0]).toBe(Rank.Ace);
    });

    it('should throw error for hand with less than 5 cards', () => {
      const hand = createHand([
        [Suit.Hearts, Rank.Ace],
        [Suit.Diamonds, Rank.King]
      ]);
      
      expect(() => HandEvaluator.evaluate(hand)).toThrow('Hand must have at least 5 cards to evaluate');
    });
  });

  describe('compareHands', () => {
    it('should rank hands correctly', () => {
      const royalFlush = HandEvaluator.evaluate(createHand([
        [Suit.Hearts, Rank.Ace],
        [Suit.Hearts, Rank.King],
        [Suit.Hearts, Rank.Queen],
        [Suit.Hearts, Rank.Jack],
        [Suit.Hearts, Rank.Ten]
      ]));

      const straightFlush = HandEvaluator.evaluate(createHand([
        [Suit.Clubs, Rank.Nine],
        [Suit.Clubs, Rank.Eight],
        [Suit.Clubs, Rank.Seven],
        [Suit.Clubs, Rank.Six],
        [Suit.Clubs, Rank.Five]
      ]));

      const fourOfAKind = HandEvaluator.evaluate(createHand([
        [Suit.Hearts, Rank.King],
        [Suit.Diamonds, Rank.King],
        [Suit.Clubs, Rank.King],
        [Suit.Spades, Rank.King],
        [Suit.Hearts, Rank.Two]
      ]));

      expect(HandEvaluator.compareHands(royalFlush, straightFlush)).toBeGreaterThan(0);
      expect(HandEvaluator.compareHands(straightFlush, fourOfAKind)).toBeGreaterThan(0);
      expect(HandEvaluator.compareHands(fourOfAKind, royalFlush)).toBeLessThan(0);
    });

    it('should compare same rank hands by high cards', () => {
      const pairAces = HandEvaluator.evaluate(createHand([
        [Suit.Hearts, Rank.Ace],
        [Suit.Diamonds, Rank.Ace],
        [Suit.Clubs, Rank.King],
        [Suit.Spades, Rank.Queen],
        [Suit.Hearts, Rank.Jack]
      ]));

      const pairKings = HandEvaluator.evaluate(createHand([
        [Suit.Hearts, Rank.King],
        [Suit.Diamonds, Rank.King],
        [Suit.Clubs, Rank.Ace],
        [Suit.Spades, Rank.Queen],
        [Suit.Hearts, Rank.Jack]
      ]));

      expect(HandEvaluator.compareHands(pairAces, pairKings)).toBeGreaterThan(0);
    });

    it('should return 0 for identical hands', () => {
      const hand1 = HandEvaluator.evaluate(createHand([
        [Suit.Hearts, Rank.Ace],
        [Suit.Diamonds, Rank.King],
        [Suit.Clubs, Rank.Queen],
        [Suit.Spades, Rank.Jack],
        [Suit.Hearts, Rank.Nine]
      ]));

      const hand2 = HandEvaluator.evaluate(createHand([
        [Suit.Clubs, Rank.Ace],
        [Suit.Spades, Rank.King],
        [Suit.Hearts, Rank.Queen],
        [Suit.Diamonds, Rank.Jack],
        [Suit.Clubs, Rank.Nine]
      ]));

      expect(HandEvaluator.compareHands(hand1, hand2)).toBe(0);
    });
  });
});