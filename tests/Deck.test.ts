import { Deck } from '../src/Deck';
import { Card } from '../src/Card';

describe('Deck', () => {
  let deck: Deck;

  beforeEach(() => {
    deck = new Deck();
  });

  describe('constructor', () => {
    it('should create a deck with 52 cards', () => {
      expect(deck.cardsRemaining()).toBe(52);
    });
  });

  describe('deal', () => {
    it('should deal cards and reduce deck size', () => {
      const card = deck.deal();
      expect(card).toBeInstanceOf(Card);
      expect(deck.cardsRemaining()).toBe(51);
    });

    it('should return undefined when deck is empty', () => {
      // Deal all cards
      for (let i = 0; i < 52; i++) {
        deck.deal();
      }
      expect(deck.deal()).toBeUndefined();
    });
  });

  describe('dealHand', () => {
    it('should deal the specified number of cards', () => {
      const hand = deck.dealHand(5);
      expect(hand).toHaveLength(5);
      expect(deck.cardsRemaining()).toBe(47);
      hand.forEach(card => {
        expect(card).toBeInstanceOf(Card);
      });
    });

    it('should deal fewer cards if deck runs out', () => {
      // Deal most cards
      for (let i = 0; i < 50; i++) {
        deck.deal();
      }
      const hand = deck.dealHand(5);
      expect(hand).toHaveLength(2);
    });
  });

  describe('shuffle', () => {
    it('should randomize card order', () => {
      const deck1 = new Deck();
      const deck2 = new Deck();
      
      // Deal first 10 cards from unshuffled deck
      const cards1 = [];
      for (let i = 0; i < 10; i++) {
        const card = deck1.deal();
        if (card) cards1.push(card.toString());
      }
      
      // Shuffle second deck and deal
      deck2.shuffle();
      const cards2 = [];
      for (let i = 0; i < 10; i++) {
        const card = deck2.deal();
        if (card) cards2.push(card.toString());
      }
      
      // Very unlikely to be the same after shuffle
      expect(cards1.join(',')).not.toBe(cards2.join(','));
    });
  });

  describe('reset', () => {
    it('should restore deck to 52 cards', () => {
      // Deal some cards
      deck.dealHand(10);
      expect(deck.cardsRemaining()).toBe(42);
      
      // Reset
      deck.reset();
      expect(deck.cardsRemaining()).toBe(52);
    });
  });
});