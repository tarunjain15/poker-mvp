import * as readlineSync from 'readline-sync';
import chalk from 'chalk';
import { GameSession } from './GameSession';
import { Player } from './Player';
import { ColorUtils } from './ColorUtils';

class SimpleColorfulCLI {
  private session: GameSession;
  private humanPlayer: Player;
  private playerActions: Map<string, string> = new Map();
  private dealerIndex: number = 0;

  constructor() {
    console.clear();
    console.log(chalk.yellow.bold('\n🎰 POKER TOURNAMENT 🎰\n'));
    console.log(chalk.gray('Starting chips: $1000 | Blinds: 10/20'));
    console.log(chalk.gray('═'.repeat(50)));
    
    const playerName = readlineSync.question(chalk.cyan('\nYour name: ')) || 'Player';
    
    const playerNames = [playerName, 'Alice', 'Bob', 'Charlie'];
    this.session = new GameSession(playerNames, 1000, 10, 20);
    this.humanPlayer = this.session.getActivePlayers()[0];
    
    console.log(chalk.green('\n✓ Game ready! Press Enter to start...'));
    readlineSync.question('');
  }

  start(): void {
    while (!this.session.isGameOver()) {
      this.playHand();
      
      if (!this.session.isGameOver()) {
        if (!readlineSync.keyInYN(chalk.cyan('\nNext hand?'))) {
          this.showFinalStats();
          return;
        }
      }
    }
    
    this.showGameOver();
  }

  private playHand(): void {
    console.clear();
    console.log(chalk.yellow(`\n=== HAND #${this.session.getHandsPlayed() + 1} ===\n`));
    
    this.dealerIndex = (this.dealerIndex + 1) % this.session.getActivePlayers().length;
    this.session.playHand();
    const game = this.session.getGame();
    
    if (this.session.getActivePlayers().length < 2) {
      return;
    }
    
    game.startNewHand();
    this.playerActions.clear();
    
    // Show initial state
    this.showGameState('Pre-flop');
    
    // Betting rounds
    this.runBettingRound('Pre-flop');
    
    if (this.countActivePlayers(game) > 1) {
      game.dealFlop();
      this.showGameState('Flop');
      this.runBettingRound('Flop');
    }
    
    if (this.countActivePlayers(game) > 1) {
      game.dealTurn();
      this.showGameState('Turn');
      this.runBettingRound('Turn');
    }
    
    if (this.countActivePlayers(game) > 1) {
      game.dealRiver();
      this.showGameState('River');
      this.runBettingRound('River');
    }
    
    this.showdown();
  }

  private showGameState(phase: string): void {
    const game = this.session.getGame();
    const state = game.getGameState();
    const players = this.session.getActivePlayers();
    
    console.log(chalk.blue.bold(`\n--- ${phase.toUpperCase()} ---`));
    
    // Community cards
    if (state.communityCards.length > 0) {
      console.log('\nCommunity: ' + state.communityCards.map(c => c.toColorString()).join(' '));
    }
    
    // Pot and bet info
    console.log(ColorUtils.pot(state.pot) + (state.currentBet > 0 ? `  Current bet: ${ColorUtils.chips(state.currentBet)}` : ''));
    
    // Player info
    console.log(chalk.gray('\nPlayers:'));
    players.forEach((player, idx) => {
      const isDealer = idx === this.dealerIndex;
      const isCurrent = state.currentPlayer === player;
      
      let status = '';
      if (player.folded) status = chalk.red(' [FOLDED]');
      else if (player.isAllIn) status = chalk.red.bold(' [ALL-IN]');
      else if (isDealer) status = chalk.magenta(' [D]');
      
      const prefix = isCurrent ? chalk.green('→ ') : '  ';
      const name = player === this.humanPlayer ? ColorUtils.humanPlayer(player.name) : ColorUtils.aiPlayer(player.name);
      
      console.log(`${prefix}${name}: ${ColorUtils.chips(player.chips)}${status}`);
    });
    
    // Your cards
    if (this.humanPlayer.chips > 0 && !this.humanPlayer.folded) {
      console.log(chalk.cyan(`\nYour cards: `) + this.humanPlayer.hand.toColorString());
    }
  }

  private runBettingRound(roundName: string): void {
    const game = this.session.getGame();
    let bettingComplete = false;
    const playersActed = new Set<string>();
    
    while (!bettingComplete) {
      const state = game.getGameState();
      const currentPlayer = state.currentPlayer;
      
      if (currentPlayer.folded || currentPlayer.isAllIn) {
        game.playerAction('check');
        continue;
      }
      
      if (currentPlayer === this.humanPlayer && this.humanPlayer.chips > 0) {
        this.humanPlayerAction();
      } else {
        this.aiPlayerAction(currentPlayer);
      }
      
      playersActed.add(currentPlayer.id);
      
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
    
    console.log(chalk.cyan('\n--- YOUR TURN ---'));
    
    const options = [];
    if (callAmount === 0) {
      options.push('Check');
    } else {
      options.push(`Call ${callAmount}`);
    }
    options.push('Fold');
    
    if (this.humanPlayer.chips > callAmount) {
      options.push('Raise');
    }
    if (this.humanPlayer.chips > 0 && callAmount < this.humanPlayer.chips) {
      options.push(`All-in (${this.humanPlayer.chips})`);
    }
    
    const choice = readlineSync.keyInSelect(options, 'Action:');
    
    if (choice === -1 || options[choice] === 'Fold') {
      game.playerAction('fold');
      console.log(chalk.red('You folded.'));
    } else if (options[choice] === 'Check') {
      game.playerAction('check');
      console.log(chalk.gray('You checked.'));
    } else if (options[choice].startsWith('Call')) {
      game.playerAction('call');
      console.log(chalk.blue(`You called ${callAmount}.`));
    } else if (options[choice] === 'Raise') {
      const minRaise = Math.min(state.currentBet, this.humanPlayer.chips - callAmount);
      const maxRaise = this.humanPlayer.chips - callAmount;
      const raiseAmount = readlineSync.questionInt(
        `Raise amount (${minRaise}-${maxRaise}): `,
        { min: minRaise, max: maxRaise }
      );
      game.playerAction('raise', raiseAmount);
      console.log(chalk.green(`You raised ${raiseAmount}.`));
    } else if (options[choice].startsWith('All-in')) {
      const allInAmount = this.humanPlayer.chips - callAmount;
      if (allInAmount > 0) {
        game.playerAction('raise', allInAmount);
      } else {
        game.playerAction('call');
      }
      console.log(chalk.red.bold(`You went all-in!`));
    }
  }

  private aiPlayerAction(player: Player): void {
    const game = this.session.getGame();
    const state = game.getGameState();
    const callAmount = state.currentBet - player.currentBet;
    
    const random = Math.random();
    const potOdds = callAmount / (state.pot + callAmount);
    
    if (callAmount === 0) {
      if (random < 0.7) {
        game.playerAction('check');
        console.log(`${player.name} ${chalk.gray('checks')}`);
      } else {
        const betSize = Math.min(Math.floor(state.pot * 0.5), player.chips);
        game.playerAction('raise', betSize);
        console.log(`${player.name} ${chalk.green(`bets ${betSize}`)}`);
      }
    } else {
      if (random < potOdds * 1.5 || callAmount > player.chips * 0.5) {
        game.playerAction('fold');
        console.log(`${player.name} ${chalk.red('folds')}`);
      } else if (random < 0.8 || callAmount >= player.chips) {
        game.playerAction('call');
        console.log(`${player.name} ${chalk.blue(`calls ${Math.min(callAmount, player.chips)}`)}`);
      } else {
        const raiseSize = Math.min(callAmount * 2, player.chips - callAmount);
        game.playerAction('raise', raiseSize);
        console.log(`${player.name} ${chalk.green(`raises ${raiseSize}`)}`);
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
      console.log(chalk.red('\n❌ No winner - all folded!'));
      return;
    }
    
    console.log(chalk.yellow('\n' + '='.repeat(40)));
    console.log(chalk.yellow.bold('SHOWDOWN'));
    console.log(chalk.yellow('='.repeat(40)));
    
    console.log('\nCommunity: ' + state.communityCards.map(c => c.toColorString()).join(' '));
    
    const activePlayers = this.session.getActivePlayers().filter(p => !p.folded);
    console.log(chalk.cyan('\nHands:'));
    activePlayers.forEach(player => {
      const name = player === this.humanPlayer ? ColorUtils.humanPlayer(player.name) : ColorUtils.aiPlayer(player.name);
      console.log(`  ${name}: ${player.hand.toColorString()}`);
    });
    
    game.distributePot(result.winners);
    this.session.updateStats(state.pot, result.winners);
    
    console.log(chalk.green.bold(`\n🏆 Winner: ${result.winners.map(w => w.name).join(', ')}`));
    console.log(chalk.cyan(`Winning hand: ${result.evaluation.rankName}`));
    console.log(chalk.yellow(`Pot won: ${ColorUtils.chips(state.pot)}`));
    
    const eliminated = this.session.getActivePlayers().filter(p => p.chips === 0);
    if (eliminated.length > 0) {
      console.log(chalk.red.bold('\n💀 Eliminated:'));
      eliminated.forEach(p => console.log(chalk.red(`  - ${p.name}`)));
    }
  }

  private showGameOver(): void {
    const winner = this.session.getWinner();
    if (winner) {
      console.log(chalk.green.bold('\n' + '🏆'.repeat(20)));
      console.log(chalk.green.bold(`\n    TOURNAMENT CHAMPION: ${winner.name}!`));
      console.log(chalk.green.bold(`    Final chips: ${ColorUtils.chips(winner.chips)}`));
      console.log(chalk.green.bold('\n' + '🏆'.repeat(20)));
    }
    
    this.showFinalStats();
  }

  private showFinalStats(): void {
    const stats = this.session.getStats();
    
    console.log(chalk.blue('\n=== FINAL STATISTICS ==='));
    console.log(`Hands played: ${stats.handsPlayed}`);
    console.log(`Biggest pot: ${ColorUtils.chips(stats.biggestPot)}`);
    
    const allPlayers = [...this.session.getActivePlayers(), ...this.session.getEliminatedPlayers()];
    allPlayers.forEach(player => {
      const pStats = stats.playerStats.get(player.id)!;
      const profit = pStats.finalChips - 1000;
      console.log(`\n${player.name}:`);
      console.log(`  Final: ${ColorUtils.chips(pStats.finalChips)} (${profit >= 0 ? '+' : ''}${profit})`);
      console.log(`  Won: ${pStats.handsWon}/${pStats.handsPlayed} hands`);
    });
    
    console.log(chalk.green('\n✨ Thanks for playing! ✨'));
  }
}

const cli = new SimpleColorfulCLI();
cli.start();