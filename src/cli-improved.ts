import * as readlineSync from 'readline-sync';
import { GameSession } from './GameSession';
import { Player } from './Player';
import { GamePhase } from './PokerGame';

class ImprovedPokerCLI {
  private session: GameSession;
  private humanPlayer: Player;

  constructor() {
    console.log('Welcome to Poker MVP!');
    console.log('===================\n');
    
    // Get player name
    const playerName = readlineSync.question('Enter your name: ') || 'Player';
    
    // Create game session with AI players
    const playerNames = [playerName, 'Alice', 'Bob', 'Charlie'];
    this.session = new GameSession(playerNames, 1000, 10, 20);
    
    // Find human player
    this.humanPlayer = this.session.getActivePlayers()[0];
  }

  start(): void {
    console.log('\nStarting tournament with 4 players');
    console.log('Starting chips: 1000');
    console.log('Blinds: 10/20 (increasing every 10 hands)\n');
    
    while (!this.session.isGameOver()) {
      this.playHand();
      
      if (!this.session.isGameOver()) {
        if (!readlineSync.keyInYN('\nContinue to next hand?')) {
          this.showFinalStats();
          return;
        }
      }
    }
    
    this.showGameOver();
  }

  private playHand(): void {
    console.log('\n' + '='.repeat(50));
    console.log(`Hand #${this.session.getHandsPlayed() + 1}`);
    console.log('='.repeat(50));
    
    // Show current standings
    this.showStandings();
    
    // Play the hand
    this.session.playHand();
    const game = this.session.getGame();
    
    if (this.session.getActivePlayers().length < 2) {
      return;
    }
    
    game.startNewHand();
    
    // Show player's cards if still in game
    if (this.humanPlayer.chips > 0) {
      console.log(`\nYour cards: ${this.humanPlayer.hand.toString()}`);
      console.log(`Your chips: ${this.humanPlayer.chips}`);
    }
    
    // Pre-flop betting
    this.runBettingRound('Pre-flop');
    
    if (this.countActivePlayers(game) > 1) {
      game.dealFlop();
      const state = game.getGameState();
      console.log(`\nFlop: ${state.communityCards.map(c => c.toString()).join(' ')}`);
      this.runBettingRound('Flop');
    }
    
    if (this.countActivePlayers(game) > 1) {
      game.dealTurn();
      const state = game.getGameState();
      console.log(`\nTurn: ${state.communityCards.map(c => c.toString()).join(' ')}`);
      this.runBettingRound('Turn');
    }
    
    if (this.countActivePlayers(game) > 1) {
      game.dealRiver();
      const state = game.getGameState();
      console.log(`\nRiver: ${state.communityCards.map(c => c.toString()).join(' ')}`);
      this.runBettingRound('River');
    }
    
    // Showdown
    this.showdown();
  }

  private runBettingRound(roundName: string): void {
    console.log(`\n--- ${roundName} Betting ---`);
    const game = this.session.getGame();
    let bettingComplete = false;
    const playersActed = new Set<string>();
    
    while (!bettingComplete) {
      const state = game.getGameState();
      const currentPlayer = state.currentPlayer;
      
      // Skip if player is folded or all-in
      if (currentPlayer.folded || currentPlayer.isAllIn) {
        game.playerAction('check');
        continue;
      }
      
      console.log(`\nPot: ${state.pot} | Current bet: ${state.currentBet}`);
      
      if (currentPlayer === this.humanPlayer && this.humanPlayer.chips > 0) {
        this.humanPlayerAction();
      } else {
        this.aiPlayerAction(currentPlayer);
      }
      
      playersActed.add(currentPlayer.id);
      
      // Check if betting is complete
      const activePlayers = state.players.filter(p => !p.folded && !p.isAllIn);
      const allPlayersActed = activePlayers.every(p => playersActed.has(p.name));
      const allBetsEqual = activePlayers.every(p => p.currentBet === state.currentBet || p.isAllIn);
      
      if (activePlayers.length <= 1 || (allPlayersActed && allBetsEqual)) {
        bettingComplete = true;
      }
    }
  }

  private humanPlayerAction(): void {
    const game = this.session.getGame();
    const state = game.getGameState();
    const callAmount = state.currentBet - this.humanPlayer.currentBet;
    
    const options = [];
    if (callAmount === 0) {
      options.push('Check');
    } else {
      options.push(`Call (${callAmount} chips)`);
    }
    options.push('Fold');
    
    if (this.humanPlayer.chips > callAmount) {
      options.push('Raise');
    }
    if (this.humanPlayer.chips > 0) {
      options.push(`All-in (${this.humanPlayer.chips} chips)`);
    }
    
    const choice = readlineSync.keyInSelect(options, 'Your action:');
    
    try {
      if (choice === -1 || options[choice] === 'Fold') {
        game.playerAction('fold');
        console.log('You folded.');
      } else if (options[choice] === 'Check') {
        game.playerAction('check');
        console.log('You checked.');
      } else if (options[choice].startsWith('Call')) {
        game.playerAction('call');
        console.log(`You called ${callAmount} chips.`);
      } else if (options[choice] === 'Raise') {
        const minRaise = Math.min(state.currentBet, this.humanPlayer.chips - callAmount);
        const maxRaise = this.humanPlayer.chips - callAmount;
        const raiseAmount = readlineSync.questionInt(
          `Raise amount (${minRaise}-${maxRaise}): `,
          { min: minRaise, max: maxRaise }
        );
        game.playerAction('raise', raiseAmount);
        console.log(`You raised ${raiseAmount} chips.`);
      } else if (options[choice].startsWith('All-in')) {
        const allInAmount = this.humanPlayer.chips - callAmount;
        if (allInAmount > 0) {
          game.playerAction('raise', allInAmount);
        } else {
          game.playerAction('call');
        }
        console.log(`You went all-in with ${this.humanPlayer.chips} chips!`);
      }
    } catch (error) {
      console.log(`Invalid action: ${error}`);
      this.humanPlayerAction();
    }
  }

  private aiPlayerAction(player: Player): void {
    const game = this.session.getGame();
    const state = game.getGameState();
    const callAmount = state.currentBet - player.currentBet;
    
    console.log(`\n${player.name}'s turn (${player.chips} chips)...`);
    
    // Simple AI with some randomness and stack size consideration
    const random = Math.random();
    const stackRatio = player.chips / 1000; // Ratio to starting stack
    const potOdds = callAmount / (state.pot + callAmount);
    
    if (callAmount === 0) {
      // Can check
      if (random < 0.6) {
        console.log(`${player.name} checks`);
        game.playerAction('check');
      } else if (random < 0.9 && player.chips > state.pot * 0.3) {
        const betSize = Math.floor(state.pot * (0.3 + random * 0.4));
        const actualBet = Math.min(betSize, player.chips);
        console.log(`${player.name} bets ${actualBet}`);
        game.playerAction('raise', actualBet);
      } else {
        console.log(`${player.name} checks`);
        game.playerAction('check');
      }
    } else {
      // Must call, raise, or fold
      const shouldCall = random > potOdds * 1.5; // Simple pot odds calculation
      
      if (!shouldCall || callAmount > player.chips * 0.5) {
        console.log(`${player.name} folds`);
        game.playerAction('fold');
      } else if (random < 0.7 || callAmount >= player.chips) {
        console.log(`${player.name} calls ${Math.min(callAmount, player.chips)}`);
        game.playerAction('call');
      } else if (player.chips > callAmount * 2) {
        const raiseSize = Math.floor(callAmount * (1.5 + random));
        const actualRaise = Math.min(raiseSize, player.chips - callAmount);
        console.log(`${player.name} raises ${actualRaise}`);
        game.playerAction('raise', actualRaise);
      } else {
        console.log(`${player.name} calls ${callAmount}`);
        game.playerAction('call');
      }
    }
  }

  private countActivePlayers(game: any): number {
    return game.getGameState().players.filter((p: any) => !p.folded).length;
  }

  private showdown(): void {
    const game = this.session.getGame();
    const state = game.getGameState();
    const result = game.evaluateWinner();
    
    if (!result || result.winners.length === 0) {
      console.log('\nNo winner - all players folded!');
      return;
    }
    
    console.log('\n' + '='.repeat(30));
    console.log('SHOWDOWN');
    console.log('='.repeat(30));
    
    // Show community cards
    console.log(`Community cards: ${state.communityCards.map(c => c.toString()).join(' ')}`);
    
    // Show all active players' hands
    const activePlayers = this.session.getActivePlayers().filter(p => !p.folded);
    console.log('\nPlayers\' hands:');
    activePlayers.forEach(player => {
      if (!player.folded) {
        console.log(`${player.name}: ${player.hand.toString()}`);
      }
    });
    
    // Announce winner(s)
    console.log(`\nWinner(s): ${result.winners.map(w => w.name).join(', ')}`);
    console.log(`Winning hand: ${result.evaluation.rankName}`);
    console.log(`Pot: ${state.pot} chips`);
    
    // Distribute pot and update stats
    game.distributePot(result.winners);
    this.session.updateStats(state.pot, result.winners);
    
    // Show chip counts
    console.log('\nChip counts after hand:');
    this.session.getActivePlayers().forEach(player => {
      console.log(`${player.name}: ${player.chips} chips`);
    });
    
    // Check for eliminations
    const eliminated = this.session.getActivePlayers().filter(p => p.chips === 0);
    if (eliminated.length > 0) {
      console.log('\nEliminated players:');
      eliminated.forEach(player => {
        console.log(`${player.name} has been eliminated!`);
      });
    }
  }

  private showStandings(): void {
    console.log('\nCurrent Standings:');
    const players = [...this.session.getActivePlayers()].sort((a, b) => b.chips - a.chips);
    players.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name}: ${player.chips} chips`);
    });
    
    const blinds = this.session.getCurrentBlinds();
    console.log(`\nBlinds: ${blinds.small}/${blinds.big}`);
  }

  private showGameOver(): void {
    console.log('\n' + '='.repeat(50));
    console.log('GAME OVER!');
    console.log('='.repeat(50));
    
    const winner = this.session.getWinner();
    if (winner) {
      console.log(`\n🏆 ${winner.name} wins the tournament! 🏆`);
      console.log(`Final chips: ${winner.chips}`);
    }
    
    this.showFinalStats();
  }

  private showFinalStats(): void {
    console.log('\n' + '='.repeat(50));
    console.log('FINAL STATISTICS');
    console.log('='.repeat(50));
    
    const stats = this.session.getStats();
    console.log(`\nTotal hands played: ${stats.handsPlayed}`);
    console.log(`Total chips in play: ${stats.totalPot}`);
    console.log(`Biggest pot: ${stats.biggestPot}`);
    
    console.log('\nPlayer Statistics:');
    console.log('-'.repeat(50));
    
    const allPlayers = [...this.session.getActivePlayers(), ...this.session.getEliminatedPlayers()];
    allPlayers.forEach(player => {
      const playerStats = stats.playerStats.get(player.id)!;
      console.log(`\n${player.name}:`);
      console.log(`  Hands won: ${playerStats.handsWon}/${playerStats.handsPlayed}`);
      console.log(`  Win rate: ${(playerStats.handsWon / playerStats.handsPlayed * 100).toFixed(1)}%`);
      console.log(`  Total winnings: ${playerStats.totalWinnings}`);
      console.log(`  Biggest win: ${playerStats.biggestWin}`);
      console.log(`  Final chips: ${playerStats.finalChips}`);
      console.log(`  Net result: ${playerStats.finalChips - 1000} chips`);
    });
    
    console.log('\nThanks for playing!');
  }
}

// Run the improved CLI
const cli = new ImprovedPokerCLI();
cli.start();