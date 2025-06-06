import * as readlineSync from 'readline-sync';
import chalk from 'chalk';
import { GameSession } from './GameSession';
import { Player } from './Player';
import { PokerTableImproved as PokerTable, TablePlayer } from './PokerTableImproved';
import { ColorUtils } from './ColorUtils';

class ColorfulPokerCLI {
  private session: GameSession;
  private humanPlayer: Player;
  private playerActions: Map<string, string> = new Map();
  private dealerIndex: number = 0;

  constructor() {
    console.clear();
    this.showWelcomeScreen();
    
    // Get player name
    const playerName = readlineSync.question(chalk.cyan('\nEnter your name: ')) || 'Player';
    
    // Create game session with AI players
    const playerNames = [playerName, 'Alice', 'Bob', 'Charlie'];
    this.session = new GameSession(playerNames, 1000, 10, 20);
    
    // Find human player
    this.humanPlayer = this.session.getActivePlayers()[0];
  }

  private showWelcomeScreen(): void {
    const title = `
    ${chalk.red('██████╗  ██████╗ ██╗  ██╗███████╗██████╗ ')}
    ${chalk.red('██╔══██╗██╔═══██╗██║ ██╔╝██╔════╝██╔══██╗')}
    ${chalk.yellow('██████╔╝██║   ██║█████╔╝ █████╗  ██████╔╝')}
    ${chalk.yellow('██╔═══╝ ██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗')}
    ${chalk.green('██║     ╚██████╔╝██║  ██╗███████╗██║  ██║')}
    ${chalk.green('╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝')}
    
    ${chalk.cyan.bold('           TOURNAMENT EDITION')}
    `;
    
    console.log(title);
    console.log(chalk.gray('═'.repeat(50)));
    console.log(chalk.white('Welcome to Poker MVP - Tournament Edition!'));
    console.log(chalk.gray('Starting chips: ') + ColorUtils.chips(1000));
    console.log(chalk.gray('Blinds: 10/20 (increasing every 10 hands)'));
    console.log(chalk.gray('═'.repeat(50)));
  }

  start(): void {
    console.log(chalk.yellow('\n🎲 Starting tournament with 4 players... 🎲\n'));
    
    // Wait a moment for dramatic effect
    setTimeout(() => {
      this.gameLoop();
    }, 1500);
  }

  private gameLoop(): void {
    while (!this.session.isGameOver()) {
      this.playHand();
      
      if (!this.session.isGameOver()) {
        console.log(chalk.gray('\n' + '─'.repeat(60) + '\n'));
        if (!readlineSync.keyInYN(chalk.cyan('Continue to next hand?'))) {
          this.showFinalStats();
          return;
        }
      }
    }
    
    this.showGameOver();
  }

  private playHand(): void {
    // Update dealer index
    this.dealerIndex = (this.dealerIndex + 1) % this.session.getActivePlayers().length;
    
    this.session.playHand();
    const game = this.session.getGame();
    
    if (this.session.getActivePlayers().length < 2) {
      return;
    }
    
    game.startNewHand();
    
    // Clear actions for new hand
    this.playerActions.clear();
    
    // Pre-flop
    this.drawTable('Pre-flop');
    this.runBettingRound('Pre-flop');
    
    if (this.countActivePlayers(game) > 1) {
      game.dealFlop();
      this.drawTable('Flop');
      this.runBettingRound('Flop');
    }
    
    if (this.countActivePlayers(game) > 1) {
      game.dealTurn();
      this.drawTable('Turn');
      this.runBettingRound('Turn');
    }
    
    if (this.countActivePlayers(game) > 1) {
      game.dealRiver();
      this.drawTable('River');
      this.runBettingRound('River');
    }
    
    // Showdown
    this.showdown();
  }

  private drawTable(phase: string): void {
    const game = this.session.getGame();
    const state = game.getGameState();
    const players = this.session.getActivePlayers();
    
    // Create TablePlayer objects
    const tablePlayers: TablePlayer[] = players.map((player, index) => ({
      player,
      isDealer: index === this.dealerIndex,
      isCurrentTurn: state.currentPlayer === player,
      lastAction: this.playerActions.get(player.id)
    }));
    
    PokerTable.drawTable(
      tablePlayers,
      state.pot,
      state.communityCards,
      phase,
      state.currentBet
    );
  }

  private runBettingRound(roundName: string): void {
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
      
      // Update table to show current turn
      this.drawTable(roundName);
      
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
    
    console.log('\n' + chalk.cyan('─'.repeat(40)));
    console.log(ColorUtils.humanPlayer(`Your turn, ${this.humanPlayer.name}!`));
    console.log(`Your cards: ${this.humanPlayer.hand.toColorString()}`);
    console.log(`Your chips: ${ColorUtils.chips(this.humanPlayer.chips)}`);
    console.log(chalk.cyan('─'.repeat(40)) + '\n');
    
    const options = [];
    if (callAmount === 0) {
      options.push('Check');
    } else {
      options.push(`Call (${ColorUtils.chips(callAmount)})`);
    }
    options.push('Fold');
    
    if (this.humanPlayer.chips > callAmount) {
      options.push('Raise');
    }
    if (this.humanPlayer.chips > 0 && callAmount < this.humanPlayer.chips) {
      options.push(`All-in (${ColorUtils.chips(this.humanPlayer.chips)})`);
    }
    
    const choice = readlineSync.keyInSelect(options, 'Your action:');
    
    try {
      if (choice === -1 || options[choice] === 'Fold') {
        game.playerAction('fold');
        this.playerActions.set(this.humanPlayer.id, 'FOLD');
        console.log(ColorUtils.fold('\n✗ You folded.'));
      } else if (options[choice] === 'Check') {
        game.playerAction('check');
        this.playerActions.set(this.humanPlayer.id, 'CHECK');
        console.log(ColorUtils.check('\n✓ You checked.'));
      } else if (options[choice].startsWith('Call')) {
        game.playerAction('call');
        this.playerActions.set(this.humanPlayer.id, `CALL ${callAmount}`);
        console.log(ColorUtils.call(`\n✓ You called ${callAmount} chips.`));
      } else if (options[choice] === 'Raise') {
        const minRaise = Math.min(state.currentBet, this.humanPlayer.chips - callAmount);
        const maxRaise = this.humanPlayer.chips - callAmount;
        const raiseAmount = readlineSync.questionInt(
          chalk.green(`Raise amount (${minRaise}-${maxRaise}): `),
          { min: minRaise, max: maxRaise }
        );
        game.playerAction('raise', raiseAmount);
        this.playerActions.set(this.humanPlayer.id, `RAISE ${raiseAmount}`);
        console.log(ColorUtils.raise(`\n↑ You raised ${raiseAmount} chips!`));
      } else if (options[choice].startsWith('All-in')) {
        const allInAmount = this.humanPlayer.chips - callAmount;
        if (allInAmount > 0) {
          game.playerAction('raise', allInAmount);
        } else {
          game.playerAction('call');
        }
        this.playerActions.set(this.humanPlayer.id, 'ALL-IN!');
        console.log(ColorUtils.allIn(`\n🔥 You went ALL-IN with ${this.humanPlayer.chips} chips! 🔥`));
      }
    } catch (error) {
      console.log(chalk.red(`\nInvalid action: ${error}`));
      this.humanPlayerAction();
    }
    
    // Brief pause for effect
    setTimeout(() => {}, 500);
  }

  private aiPlayerAction(player: Player): void {
    const game = this.session.getGame();
    const state = game.getGameState();
    const callAmount = state.currentBet - player.currentBet;
    
    // Simulate thinking
    console.log(chalk.gray(`\n${player.name} is thinking...`));
    
    // AI logic
    const random = Math.random();
    const stackRatio = player.chips / 1000;
    const potOdds = callAmount / (state.pot + callAmount);
    
    setTimeout(() => {
      if (callAmount === 0) {
        if (random < 0.6) {
          game.playerAction('check');
          this.playerActions.set(player.id, 'CHECK');
          console.log(ColorUtils.check(`${player.name} checks`));
        } else if (random < 0.9 && player.chips > state.pot * 0.3) {
          const betSize = Math.floor(state.pot * (0.3 + random * 0.4));
          const actualBet = Math.min(betSize, player.chips);
          game.playerAction('raise', actualBet);
          this.playerActions.set(player.id, `BET ${actualBet}`);
          console.log(ColorUtils.raise(`${player.name} bets ${actualBet}`));
        } else {
          game.playerAction('check');
          this.playerActions.set(player.id, 'CHECK');
          console.log(ColorUtils.check(`${player.name} checks`));
        }
      } else {
        const shouldCall = random > potOdds * 1.5;
        
        if (!shouldCall || callAmount > player.chips * 0.5) {
          game.playerAction('fold');
          this.playerActions.set(player.id, 'FOLD');
          console.log(ColorUtils.fold(`${player.name} folds`));
        } else if (random < 0.7 || callAmount >= player.chips) {
          game.playerAction('call');
          this.playerActions.set(player.id, `CALL ${Math.min(callAmount, player.chips)}`);
          console.log(ColorUtils.call(`${player.name} calls ${Math.min(callAmount, player.chips)}`));
          if (callAmount >= player.chips) {
            this.playerActions.set(player.id, 'ALL-IN!');
            console.log(ColorUtils.allIn(`${player.name} is ALL-IN!`));
          }
        } else if (player.chips > callAmount * 2) {
          const raiseSize = Math.floor(callAmount * (1.5 + random));
          const actualRaise = Math.min(raiseSize, player.chips - callAmount);
          game.playerAction('raise', actualRaise);
          this.playerActions.set(player.id, `RAISE ${actualRaise}`);
          console.log(ColorUtils.raise(`${player.name} raises ${actualRaise}`));
        } else {
          game.playerAction('call');
          this.playerActions.set(player.id, `CALL ${callAmount}`);
          console.log(ColorUtils.call(`${player.name} calls ${callAmount}`));
        }
      }
    }, 800);
    
    // Wait for action to complete
    const start = Date.now();
    while (Date.now() - start < 1000) {
      // Busy wait
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
      console.log(chalk.red('\nNo winner - all players folded!'));
      return;
    }
    
    // Show all hands
    console.log('\n' + chalk.yellow('═'.repeat(60)));
    console.log(chalk.yellow.bold('                    SHOWDOWN'));
    console.log(chalk.yellow('═'.repeat(60)) + '\n');
    
    console.log(chalk.white('Community cards: ') + state.communityCards.map(c => c.toColorString()).join(' '));
    console.log();
    
    const activePlayers = this.session.getActivePlayers().filter(p => !p.folded);
    console.log(chalk.cyan('Players\' hands:'));
    activePlayers.forEach(player => {
      if (!player.folded) {
        const playerColor = player === this.humanPlayer ? ColorUtils.humanPlayer : ColorUtils.aiPlayer;
        console.log(`  ${playerColor(player.name)}: ${player.hand.toColorString()}`);
      }
    });
    
    // Distribute pot and update stats
    game.distributePot(result.winners);
    this.session.updateStats(state.pot, result.winners);
    
    // Show winner with effects
    PokerTable.showWinner(result.winners, result.evaluation.rankName, state.pot);
    
    // Check for eliminations
    const eliminated = this.session.getActivePlayers().filter(p => p.chips === 0);
    if (eliminated.length > 0) {
      console.log(chalk.red.bold('\n💀 ELIMINATIONS:'));
      eliminated.forEach(player => {
        console.log(chalk.red(`   ${player.name} has been eliminated!`));
      });
    }
    
    // Show updated chip counts
    console.log(chalk.gray('\nChip counts after hand:'));
    this.session.getActivePlayers()
      .sort((a, b) => b.chips - a.chips)
      .forEach(player => {
        const playerColor = player === this.humanPlayer ? ColorUtils.humanPlayer : ColorUtils.aiPlayer;
        console.log(`  ${playerColor(player.name)}: ${ColorUtils.chips(player.chips)}`);
      });
  }

  private showGameOver(): void {
    const winner = this.session.getWinner();
    if (winner) {
      PokerTable.showGameOver(winner);
    }
    
    this.showFinalStats();
  }

  private showFinalStats(): void {
    console.log('\n' + chalk.blue('═'.repeat(60)));
    console.log(chalk.blue.bold('               TOURNAMENT STATISTICS'));
    console.log(chalk.blue('═'.repeat(60)));
    
    const stats = this.session.getStats();
    console.log(chalk.white(`\nTotal hands played: ${chalk.yellow.bold(stats.handsPlayed.toString())}`));
    console.log(chalk.white(`Biggest pot: ${ColorUtils.chips(stats.biggestPot)}`));
    
    console.log(chalk.cyan('\n📊 Player Statistics:'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const allPlayers = [...this.session.getActivePlayers(), ...this.session.getEliminatedPlayers()];
    allPlayers
      .sort((a, b) => {
        const aStats = stats.playerStats.get(a.id)!;
        const bStats = stats.playerStats.get(b.id)!;
        return bStats.finalChips - aStats.finalChips;
      })
      .forEach((player, index) => {
        const playerStats = stats.playerStats.get(player.id)!;
        const playerColor = player === this.humanPlayer ? ColorUtils.humanPlayer : ColorUtils.aiPlayer;
        const profit = playerStats.finalChips - 1000;
        const profitStr = profit >= 0 
          ? chalk.green(`+${profit}`)
          : chalk.red(`${profit}`);
        
        console.log(`\n${index + 1}. ${playerColor(player.name)}`);
        console.log(`   Hands won: ${chalk.yellow(playerStats.handsWon.toString())}/${playerStats.handsPlayed}`);
        console.log(`   Win rate: ${chalk.cyan((playerStats.handsWon / playerStats.handsPlayed * 100).toFixed(1) + '%')}`);
        console.log(`   Final chips: ${ColorUtils.chips(playerStats.finalChips)}`);
        console.log(`   Net result: ${profitStr}`);
      });
    
    console.log('\n' + chalk.green('Thanks for playing! 🎉'));
  }
}

// Run the colorful CLI
const cli = new ColorfulPokerCLI();
cli.start();