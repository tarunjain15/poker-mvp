import * as readlineSync from 'readline-sync';
import { PokerGame, GamePhase } from './PokerGame';
import { Player } from './Player';

class PokerCLI {
  private game: PokerGame;
  private humanPlayer: Player;
  private aiPlayers: Player[] = [];

  constructor() {
    // Create players
    this.humanPlayer = new Player('You', 'human', 1000);
    this.aiPlayers = [
      new Player('Alice', 'ai1', 1000),
      new Player('Bob', 'ai2', 1000),
      new Player('Charlie', 'ai3', 1000)
    ];

    const allPlayers = [this.humanPlayer, ...this.aiPlayers];
    this.game = new PokerGame(allPlayers);
  }

  start(): void {
    console.log('Welcome to Poker MVP!');
    console.log('===================');
    
    while (true) {
      this.playHand();
      
      if (!readlineSync.keyInYN('\nPlay another hand?')) {
        break;
      }
    }
    
    console.log('\nThanks for playing!');
  }

  private playHand(): void {
    console.log('\n--- New Hand ---');
    this.game.startNewHand();
    
    // Show player's cards
    const state = this.game.getGameState();
    console.log(`\nYour cards: ${this.humanPlayer.hand.toString()}`);
    console.log(`Your chips: ${this.humanPlayer.chips}`);
    
    // Betting rounds
    this.bettingRound();
    
    if (this.countActivePlayers() > 1) {
      // Flop
      this.game.dealFlop();
      console.log(`\nFlop: ${state.communityCards.map(c => c.toString()).join(' ')}`);
      this.bettingRound();
    }
    
    if (this.countActivePlayers() > 1) {
      // Turn
      this.game.dealTurn();
      console.log(`\nTurn: ${state.communityCards.map(c => c.toString()).join(' ')}`);
      this.bettingRound();
    }
    
    if (this.countActivePlayers() > 1) {
      // River
      this.game.dealRiver();
      console.log(`\nRiver: ${state.communityCards.map(c => c.toString()).join(' ')}`);
      this.bettingRound();
    }
    
    // Showdown
    this.showdown();
  }

  private bettingRound(): void {
    const playersInRound = new Set(this.game.getGameState().players.filter(p => !p.folded && !p.isAllIn).map(p => p.name));
    let roundComplete = false;
    
    while (!roundComplete) {
      const state = this.game.getGameState();
      const currentPlayer = state.currentPlayer;
      
      if (currentPlayer.folded || currentPlayer.isAllIn) {
        this.game.playerAction('check');
        continue;
      }
      
      console.log(`\nPot: ${state.pot}, Current bet: ${state.currentBet}`);
      
      if (currentPlayer === this.humanPlayer) {
        this.humanPlayerAction();
      } else {
        this.aiPlayerAction(currentPlayer);
      }
      
      // Check if betting round is complete
      const activePlayers = state.players.filter(p => !p.folded && !p.isAllIn);
      if (activePlayers.length <= 1 || 
          (activePlayers.every(p => p.currentBet === state.currentBet || p.isAllIn) && 
           playersInRound.size === 0)) {
        roundComplete = true;
      }
      
      playersInRound.delete(currentPlayer.name);
      if (playersInRound.size === 0 && activePlayers.every(p => p.currentBet === state.currentBet || p.isAllIn)) {
        roundComplete = true;
      }
    }
  }

  private humanPlayerAction(): void {
    const state = this.game.getGameState();
    const callAmount = state.currentBet - this.humanPlayer.currentBet;
    
    const options = [];
    if (callAmount === 0) {
      options.push('Check');
    } else {
      options.push(`Call (${callAmount})`);
    }
    options.push('Fold');
    options.push('Raise');
    
    const choice = readlineSync.keyInSelect(options, 'Your action:');
    
    if (choice === -1 || options[choice] === 'Fold') {
      this.game.playerAction('fold');
    } else if (options[choice] === 'Check') {
      this.game.playerAction('check');
    } else if (options[choice].startsWith('Call')) {
      this.game.playerAction('call');
    } else if (options[choice] === 'Raise') {
      const minRaise = state.currentBet * 2;
      const maxRaise = this.humanPlayer.chips;
      const raiseAmount = readlineSync.questionInt(`Raise amount (${minRaise}-${maxRaise}): `, {
        limitMessage: `Please enter a number between ${minRaise} and ${maxRaise}`,
        min: minRaise,
        max: maxRaise
      });
      this.game.playerAction('raise', raiseAmount - state.currentBet);
    }
  }

  private aiPlayerAction(player: Player): void {
    // Simple AI logic
    const state = this.game.getGameState();
    const callAmount = state.currentBet - player.currentBet;
    
    console.log(`${player.name}'s turn...`);
    
    // Random decision with some basic logic
    const random = Math.random();
    
    if (callAmount === 0) {
      // Can check
      if (random < 0.7) {
        console.log(`${player.name} checks`);
        this.game.playerAction('check');
      } else {
        const raiseAmount = Math.min(state.pot * 0.5, player.chips);
        console.log(`${player.name} raises ${raiseAmount}`);
        this.game.playerAction('raise', raiseAmount);
      }
    } else {
      // Must call or fold
      if (random < 0.6 && callAmount <= player.chips * 0.3) {
        console.log(`${player.name} calls ${callAmount}`);
        this.game.playerAction('call');
      } else if (random < 0.8) {
        console.log(`${player.name} folds`);
        this.game.playerAction('fold');
      } else if (callAmount < player.chips) {
        const raiseAmount = Math.min(callAmount * 2, player.chips - callAmount);
        console.log(`${player.name} raises ${raiseAmount}`);
        this.game.playerAction('raise', raiseAmount);
      } else {
        console.log(`${player.name} folds`);
        this.game.playerAction('fold');
      }
    }
  }

  private countActivePlayers(): number {
    return this.game.getGameState().players.filter(p => !p.folded).length;
  }

  private showdown(): void {
    console.log('\n--- Showdown ---');
    const result = this.game.evaluateWinner();
    
    if (!result) {
      console.log('No winner!');
      return;
    }
    
    const state = this.game.getGameState();
    console.log(`\nCommunity cards: ${state.communityCards.map(c => c.toString()).join(' ')}`);
    
    // Show all active players' hands
    const activePlayers = [this.humanPlayer, ...this.aiPlayers].filter(p => !p.folded);
    activePlayers.forEach(player => {
      console.log(`${player.name}: ${player.hand.toString()}`);
    });
    
    console.log(`\nWinner(s): ${result.winners.map(w => w.name).join(', ')}`);
    console.log(`Winning hand: ${result.evaluation.rankName}`);
    console.log(`Pot: ${state.pot}`);
    
    this.game.distributePot(result.winners);
    this.game.nextDealer();
  }
}

// Run the CLI
const cli = new PokerCLI();
cli.start();