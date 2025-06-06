import chalk from 'chalk';
import { ColorUtils } from './ColorUtils';
import { Player } from './Player';
import { Card } from './Card';

export interface TablePlayer {
  player: Player;
  isDealer: boolean;
  isCurrentTurn: boolean;
  lastAction?: string;
}

export class PokerTable {
  private static readonly TABLE_WIDTH = 80;
  private static readonly PLAYER_BOX_WIDTH = 25;

  static drawTable(
    players: TablePlayer[],
    pot: number,
    communityCards: Card[],
    phase: string,
    currentBet: number = 0
  ): void {
    console.clear();
    this.drawHeader();
    this.drawTopPlayers(players);
    this.drawMiddleSection(pot, communityCards, phase, currentBet);
    this.drawBottomPlayers(players);
    this.drawFooter();
  }

  private static drawHeader(): void {
    const title = ' POKER TOURNAMENT ';
    const padding = Math.floor((this.TABLE_WIDTH - title.length) / 2);
    console.log(chalk.green('═'.repeat(this.TABLE_WIDTH)));
    console.log(chalk.green('║') + ' '.repeat(padding) + chalk.yellow.bold(title) + ' '.repeat(this.TABLE_WIDTH - padding - title.length - 2) + chalk.green('║'));
    console.log(chalk.green('═'.repeat(this.TABLE_WIDTH)));
  }

  private static drawFooter(): void {
    console.log(chalk.green('═'.repeat(this.TABLE_WIDTH)));
  }

  private static drawTopPlayers(players: TablePlayer[]): void {
    // Get players for top row (positions 2, 3)
    const topPlayers = this.getPlayersAtPositions(players, [2, 3]);
    
    if (topPlayers.length === 0) return;

    // Draw player boxes
    const boxes = topPlayers.map(tp => this.createPlayerBox(tp));
    const boxesStr = boxes.join('  ');
    const totalWidth = this.stripAnsi(boxesStr).length;
    const padding = Math.max(0, Math.floor((this.TABLE_WIDTH - totalWidth - 2) / 2));
    const rightPadding = Math.max(0, this.TABLE_WIDTH - padding - totalWidth - 2);

    console.log(chalk.green('║') + ' '.repeat(padding) + boxesStr + ' '.repeat(rightPadding) + chalk.green('║'));
    console.log(chalk.green('║') + ' '.repeat(this.TABLE_WIDTH - 2) + chalk.green('║'));
  }

  private static drawBottomPlayers(players: TablePlayer[]): void {
    // Get players for bottom row (positions 0, 1)
    const bottomPlayers = this.getPlayersAtPositions(players, [0, 1]);
    
    if (bottomPlayers.length === 0) return;

    console.log(chalk.green('║') + ' '.repeat(this.TABLE_WIDTH - 2) + chalk.green('║'));

    // Draw player boxes
    const boxes = bottomPlayers.map(tp => this.createPlayerBox(tp));
    const boxesStr = boxes.join('  ');
    const totalWidth = this.stripAnsi(boxesStr).length;
    const padding = Math.max(0, Math.floor((this.TABLE_WIDTH - totalWidth - 2) / 2));
    const rightPadding = Math.max(0, this.TABLE_WIDTH - padding - totalWidth - 2);

    console.log(chalk.green('║') + ' '.repeat(padding) + boxesStr + ' '.repeat(rightPadding) + chalk.green('║'));
  }

  private static drawMiddleSection(pot: number, communityCards: Card[], phase: string, currentBet: number): void {
    // Draw table edge
    console.log(chalk.green('║') + ' ' + chalk.gray('╔' + '═'.repeat(this.TABLE_WIDTH - 4) + '╗') + ' ' + chalk.green('║'));
    
    // Draw pot and phase
    const potStr = ColorUtils.pot(pot);
    const phaseStr = ColorUtils.phase(`[${phase}]`);
    const betStr = currentBet > 0 ? chalk.white(`Current Bet: ${ColorUtils.chips(currentBet)}`) : '';
    
    const infoLine = `${potStr}  ${phaseStr}  ${betStr}`;
    const infoPadding = Math.floor((this.TABLE_WIDTH - 4 - this.stripAnsi(infoLine).length) / 2);
    
    console.log(chalk.green('║') + ' ' + chalk.gray('║') + ' '.repeat(infoPadding) + infoLine + ' '.repeat(this.TABLE_WIDTH - 4 - infoPadding - this.stripAnsi(infoLine).length) + chalk.gray('║') + ' ' + chalk.green('║'));
    
    // Draw community cards
    if (communityCards.length > 0) {
      const cardsStr = communityCards.map(c => c.toColorString()).join(' ');
      const cardsPadding = Math.floor((this.TABLE_WIDTH - 4 - this.stripAnsi(cardsStr).length) / 2);
      
      console.log(chalk.green('║') + ' ' + chalk.gray('║') + ' '.repeat(this.TABLE_WIDTH - 4) + chalk.gray('║') + ' ' + chalk.green('║'));
      console.log(chalk.green('║') + ' ' + chalk.gray('║') + ' '.repeat(cardsPadding) + cardsStr + ' '.repeat(this.TABLE_WIDTH - 4 - cardsPadding - this.stripAnsi(cardsStr).length) + chalk.gray('║') + ' ' + chalk.green('║'));
    }
    
    console.log(chalk.green('║') + ' ' + chalk.gray('╚' + '═'.repeat(this.TABLE_WIDTH - 4) + '╝') + ' ' + chalk.green('║'));
  }

  private static createPlayerBox(tp: TablePlayer): string {
    const { player, isDealer, isCurrentTurn, lastAction } = tp;
    
    // Shortened name (max 7 chars)
    let name = player.name.substring(0, 7);
    if (player.id === 'human') {
      name = ColorUtils.humanPlayer(name);
    } else {
      name = ColorUtils.aiPlayer(name);
    }
    
    // Add dealer indicator
    if (isDealer) {
      name = `${name}${chalk.magenta.bold('[D]')}`;
    }
    
    // Cards (compact)
    const cards = player.hand.size() > 0 && player.id === 'human' && !player.folded
      ? player.hand.getCards().map(c => c.toColorString()).join('')
      : '🂠🂠';
    
    // Chips (shortened)
    const chips = `$${player.chips}`;
    
    // Status (compact)
    let status = '';
    if (player.folded) {
      status = chalk.red('F');
    } else if (player.isAllIn) {
      status = chalk.red.bold('A');
    } else if (isCurrentTurn) {
      status = chalk.green.bold('→');
    }
    
    // Build compact box
    return `${name}:${cards}:${chips}${status ? ':' + status : ''}`;
  }

  private static colorAction(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('fold')) return ColorUtils.fold(action);
    if (actionLower.includes('check')) return ColorUtils.check(action);
    if (actionLower.includes('call')) return ColorUtils.call(action);
    if (actionLower.includes('raise')) return ColorUtils.raise(action);
    if (actionLower.includes('all-in')) return ColorUtils.allIn(action);
    return action;
  }

  private static getPlayersAtPositions(players: TablePlayer[], positions: number[]): TablePlayer[] {
    return positions
      .map(pos => players[pos])
      .filter(p => p !== undefined);
  }

  private static stripAnsi(str: string): string {
    // Remove ANSI color codes for length calculation
    return str.replace(/\u001b\[[0-9;]*m/g, '');
  }

  static showWinner(winners: Player[], handName: string, pot: number): void {
    console.log('\n' + chalk.yellow('★'.repeat(60)));
    console.log(chalk.yellow.bold.underline('\n                    SHOWDOWN RESULTS\n'));
    
    winners.forEach(winner => {
      console.log(chalk.green.bold(`    🏆 WINNER: ${winner.name} 🏆`));
    });
    
    console.log(chalk.cyan.bold(`\n    Winning Hand: ${handName}`));
    console.log(chalk.yellow.bold(`    Pot Won: ${ColorUtils.chips(pot)}`));
    
    console.log('\n' + chalk.yellow('★'.repeat(60)) + '\n');
  }

  static showGameOver(winner: Player): void {
    const banner = `
    ${chalk.red('████████╗ ██████╗ ██╗   ██╗██████╗ ███╗   ██╗ █████╗ ███╗   ███╗███████╗███╗   ██╗████████╗')}
    ${chalk.red('╚══██╔══╝██╔═══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗████╗ ████║██╔════╝████╗  ██║╚══██╔══╝')}
    ${chalk.yellow('   ██║   ██║   ██║██║   ██║██████╔╝██╔██╗ ██║███████║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ')}
    ${chalk.yellow('   ██║   ██║   ██║██║   ██║██╔══██╗██║╚██╗██║██╔══██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ')}
    ${chalk.green('   ██║   ╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║██║  ██║██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ')}
    ${chalk.green('   ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ')}
                                    ${chalk.cyan.bold('CHAMPION')}
    `;
    
    console.log(banner);
    console.log(chalk.yellow.bold(`\n                           🏆 ${winner.name.toUpperCase()} 🏆`));
    console.log(chalk.green.bold(`                        Final Chips: ${ColorUtils.chips(winner.chips)}`));
    console.log('\n' + chalk.yellow('═'.repeat(80)) + '\n');
  }
}