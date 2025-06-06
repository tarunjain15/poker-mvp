import { Card, Suit, Rank } from './Card';

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.cards = [];
    for (const suit of Object.values(Suit)) {
      for (let rank = 2; rank <= 14; rank++) {
        this.cards.push(new Card(suit as Suit, rank as Rank));
      }
    }
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(): Card | undefined {
    return this.cards.pop();
  }

  dealHand(numCards: number): Card[] {
    const hand: Card[] = [];
    for (let i = 0; i < numCards; i++) {
      const card = this.deal();
      if (card) {
        hand.push(card);
      }
    }
    return hand;
  }

  cardsRemaining(): number {
    return this.cards.length;
  }
}