import { Card, Suit, Rank } from '../src/Card';

describe('Card', () => {
  describe('constructor', () => {
    it('should create a card with suit and rank', () => {
      const card = new Card(Suit.Hearts, Rank.Ace);
      expect(card.suit).toBe(Suit.Hearts);
      expect(card.rank).toBe(Rank.Ace);
    });
  });

  describe('toString', () => {
    it('should display number cards correctly', () => {
      const card = new Card(Suit.Hearts, Rank.Two);
      expect(card.toString()).toBe('2♥');
    });

    it('should display face cards correctly', () => {
      expect(new Card(Suit.Spades, Rank.Jack).toString()).toBe('J♠');
      expect(new Card(Suit.Diamonds, Rank.Queen).toString()).toBe('Q♦');
      expect(new Card(Suit.Clubs, Rank.King).toString()).toBe('K♣');
      expect(new Card(Suit.Hearts, Rank.Ace).toString()).toBe('A♥');
    });
  });

  describe('getValue', () => {
    it('should return the rank value', () => {
      expect(new Card(Suit.Hearts, Rank.Two).getValue()).toBe(2);
      expect(new Card(Suit.Hearts, Rank.Ten).getValue()).toBe(10);
      expect(new Card(Suit.Hearts, Rank.Ace).getValue()).toBe(14);
    });
  });
});