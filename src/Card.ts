export enum Suit {
  Hearts = 'Hearts',
  Diamonds = 'Diamonds',
  Clubs = 'Clubs',
  Spades = 'Spades'
}

export enum Rank {
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
  Jack = 11,
  Queen = 12,
  King = 13,
  Ace = 14
}

export class Card {
  constructor(
    public readonly suit: Suit,
    public readonly rank: Rank
  ) {}

  toString(): string {
    const rankStr = this.rank <= 10 ? this.rank.toString() : ['J', 'Q', 'K', 'A'][this.rank - 11];
    const suitSymbol = {
      [Suit.Hearts]: '♥',
      [Suit.Diamonds]: '♦',
      [Suit.Clubs]: '♣',
      [Suit.Spades]: '♠'
    }[this.suit];
    return `${rankStr}${suitSymbol}`;
  }

  getValue(): number {
    return this.rank;
  }
}