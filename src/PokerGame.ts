import { Deck } from './Deck';
import { Player } from './Player';
import { Card } from './Card';
import { HandEvaluator, HandEvaluation } from './HandEvaluator';

export enum GamePhase {
  PreFlop = 'PreFlop',
  Flop = 'Flop',
  Turn = 'Turn',
  River = 'River',
  Showdown = 'Showdown'
}

export class PokerGame {
  private deck: Deck;
  private players: Player[];
  private communityCards: Card[] = [];
  private pot: number = 0;
  private currentBet: number = 0;
  private phase: GamePhase = GamePhase.PreFlop;
  private dealerIndex: number = 0;
  private currentPlayerIndex: number = 0;
  private smallBlind: number;
  private bigBlind: number;

  constructor(
    players: Player[],
    smallBlind: number = 10,
    bigBlind: number = 20
  ) {
    if (players.length < 2) {
      throw new Error('Poker game requires at least 2 players');
    }
    this.deck = new Deck();
    this.players = players;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
  }

  startNewHand(): void {
    // Reset all players
    this.players.forEach(player => player.resetForNewHand());
    
    // Reset game state
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.phase = GamePhase.PreFlop;
    
    // Reset and shuffle deck
    this.deck.reset();
    this.deck.shuffle();
    
    // Deal hole cards
    for (let i = 0; i < 2; i++) {
      for (const player of this.players) {
        const card = this.deck.deal();
        if (card) {
          player.hand.addCard(card);
        }
      }
    }
    
    // Post blinds
    this.postBlinds();
    
    // Set current player (first to act after big blind)
    this.currentPlayerIndex = (this.dealerIndex + 3) % this.players.length;
  }

  private postBlinds(): void {
    const smallBlindIndex = (this.dealerIndex + 1) % this.players.length;
    const bigBlindIndex = (this.dealerIndex + 2) % this.players.length;
    
    const smallBlindAmount = this.players[smallBlindIndex].bet(this.smallBlind);
    const bigBlindAmount = this.players[bigBlindIndex].bet(this.bigBlind);
    
    this.pot += smallBlindAmount + bigBlindAmount;
    this.currentBet = this.bigBlind;
  }

  dealFlop(): void {
    if (this.phase !== GamePhase.PreFlop) return;
    
    // Burn card
    this.deck.deal();
    
    // Deal 3 community cards
    for (let i = 0; i < 3; i++) {
      const card = this.deck.deal();
      if (card) {
        this.communityCards.push(card);
      }
    }
    
    this.phase = GamePhase.Flop;
    this.resetBettingRound();
  }

  dealTurn(): void {
    if (this.phase !== GamePhase.Flop) return;
    
    // Burn card
    this.deck.deal();
    
    // Deal 1 community card
    const card = this.deck.deal();
    if (card) {
      this.communityCards.push(card);
    }
    
    this.phase = GamePhase.Turn;
    this.resetBettingRound();
  }

  dealRiver(): void {
    if (this.phase !== GamePhase.Turn) return;
    
    // Burn card
    this.deck.deal();
    
    // Deal 1 community card
    const card = this.deck.deal();
    if (card) {
      this.communityCards.push(card);
    }
    
    this.phase = GamePhase.River;
    this.resetBettingRound();
  }

  private resetBettingRound(): void {
    this.currentBet = 0;
    this.players.forEach(player => player.currentBet = 0);
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;
  }

  playerAction(action: 'fold' | 'check' | 'call' | 'raise', raiseAmount?: number): void {
    const player = this.players[this.currentPlayerIndex];
    
    if (player.folded || player.isAllIn) {
      this.nextPlayer();
      return;
    }
    
    switch (action) {
      case 'fold':
        player.fold();
        break;
        
      case 'check':
        if (player.currentBet < this.currentBet) {
          throw new Error('Cannot check when there is a bet to call');
        }
        break;
        
      case 'call':
        const callAmount = this.currentBet - player.currentBet;
        const actualCall = player.bet(callAmount);
        this.pot += actualCall;
        break;
        
      case 'raise':
        if (!raiseAmount) {
          throw new Error('Raise amount must be specified');
        }
        const totalBet = this.currentBet + raiseAmount;
        const playerBetAmount = totalBet - player.currentBet;
        const actualBet = player.bet(playerBetAmount);
        this.pot += actualBet;
        this.currentBet = player.currentBet;
        break;
    }
    
    this.nextPlayer();
  }

  private nextPlayer(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  evaluateWinner(): { winners: Player[], evaluation: HandEvaluation } | null {
    const activePlayers = this.players.filter(p => !p.folded);
    
    if (activePlayers.length === 0) {
      return null;
    }
    
    if (activePlayers.length === 1) {
      return { winners: activePlayers, evaluation: { rank: 0, rankName: 'Win by Default', highCards: [] } };
    }
    
    // Evaluate each player's hand
    const evaluations: { player: Player, evaluation: HandEvaluation }[] = [];
    
    for (const player of activePlayers) {
      // Combine hole cards with community cards
      const fullHand = player.hand;
      this.communityCards.forEach(card => fullHand.addCard(card));
      
      const evaluation = HandEvaluator.evaluate(fullHand);
      evaluations.push({ player, evaluation });
      
      // Remove community cards from hand
      player.hand.clear();
      player.hand.addCards(fullHand.getCards().slice(0, 2));
    }
    
    // Find the best hand
    evaluations.sort((a, b) => HandEvaluator.compareHands(b.evaluation, a.evaluation));
    
    const bestEvaluation = evaluations[0].evaluation;
    const winners = evaluations
      .filter(e => HandEvaluator.compareHands(e.evaluation, bestEvaluation) === 0)
      .map(e => e.player);
    
    return { winners, evaluation: bestEvaluation };
  }

  getGameState() {
    return {
      phase: this.phase,
      pot: this.pot,
      currentBet: this.currentBet,
      communityCards: this.communityCards,
      currentPlayer: this.players[this.currentPlayerIndex],
      players: this.players.map(p => ({
        name: p.name,
        chips: p.chips,
        currentBet: p.currentBet,
        folded: p.folded,
        isAllIn: p.isAllIn
      }))
    };
  }

  distributePot(winners: Player[]): void {
    const share = Math.floor(this.pot / winners.length);
    winners.forEach(winner => {
      winner.chips += share;
    });
    this.pot = 0;
  }

  nextDealer(): void {
    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
  }
}