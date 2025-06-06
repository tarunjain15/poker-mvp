import { Hand } from './Hand';

export class Player {
  public hand: Hand;
  public chips: number;
  public currentBet: number = 0;
  public folded: boolean = false;
  public isAllIn: boolean = false;

  constructor(
    public readonly name: string,
    public readonly id: string,
    initialChips: number = 1000
  ) {
    this.hand = new Hand();
    this.chips = initialChips;
  }

  bet(amount: number): number {
    const actualBet = Math.min(amount, this.chips);
    this.chips -= actualBet;
    this.currentBet += actualBet;
    
    if (this.chips === 0) {
      this.isAllIn = true;
    }
    
    return actualBet;
  }

  fold(): void {
    this.folded = true;
  }

  resetForNewHand(): void {
    this.hand.clear();
    this.currentBet = 0;
    this.folded = false;
    this.isAllIn = false;
  }

  toString(): string {
    return `${this.name} (${this.chips} chips)`;
  }
}