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

export class PokerTableImproved {
  private static readonly TABLE_WIDTH = 80;

  static drawTable(
    players: TablePlayer[],
    pot: number,
    communityCards: Card[],
    phase: string,
    currentBet: number = 0
  ): void {
    console.clear();
    this.drawHeader();
    this.drawPlayersSection(players, pot, communityCards, phase, currentBet);
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

  private static drawPlayersSection(players: TablePlayer[], pot: number, communityCards: Card[], phase: string, currentBet: number): void {
    // Top row (players 2 and 3)
    console.log(chalk.green('║') + ' '.repeat(this.TABLE_WIDTH - 2) + chalk.green('║'));
    
    if (players[2] || players[3]) {
      const topLine = this.formatPlayerLine([players[2], players[3]].filter(Boolean));
      console.log(chalk.green('║') + topLine + chalk.green('║'));
    }
    
    console.log(chalk.green('║') + ' '.repeat(this.TABLE_WIDTH - 2) + chalk.green('║'));
    
    // Table center
    console.log(chalk.green('║') + ' ' + chalk.gray('┌' + '─'.repeat(this.TABLE_WIDTH - 4) + '┐') + ' ' + chalk.green('║'));
    
    // Pot and phase line
    const potStr = ColorUtils.pot(pot);
    const phaseStr = ColorUtils.phase(`[${phase}]`);
    const betStr = currentBet > 0 ? `Bet: ${ColorUtils.chips(currentBet)}` : '';
    const infoStr = `${potStr}  ${phaseStr}  ${betStr}`;
    const infoPadding = this.centerPadding(this.stripAnsi(infoStr).length, this.TABLE_WIDTH - 4);
    
    console.log(chalk.green('║') + ' ' + chalk.gray('│') + infoPadding.left + infoStr + infoPadding.right + chalk.gray('│') + ' ' + chalk.green('║'));
    
    // Community cards
    if (communityCards.length > 0) {
      const cardsStr = '[ ' + communityCards.map(c => c.toColorString()).join(' ') + ' ]';
      const cardsPadding = this.centerPadding(this.stripAnsi(cardsStr).length, this.TABLE_WIDTH - 4);
      console.log(chalk.green('║') + ' ' + chalk.gray('│') + cardsPadding.left + cardsStr + cardsPadding.right + chalk.gray('│') + ' ' + chalk.green('║'));
    }
    
    console.log(chalk.green('║') + ' ' + chalk.gray('└' + '─'.repeat(this.TABLE_WIDTH - 4) + '┘') + ' ' + chalk.green('║'));
    console.log(chalk.green('║') + ' '.repeat(this.TABLE_WIDTH - 2) + chalk.green('║'));
    
    // Bottom row (players 0 and 1)
    if (players[0] || players[1]) {
      const bottomLine = this.formatPlayerLine([players[0], players[1]].filter(Boolean));
      console.log(chalk.green('║') + bottomLine + chalk.green('║'));
    }
    
    console.log(chalk.green('║') + ' '.repeat(this.TABLE_WIDTH - 2) + chalk.green('║'));
  }

  private static formatPlayerLine(players: TablePlayer[]): string {
    const boxes = players.map(p => this.createPlayerBox(p));
    const totalStr = boxes.join('    ');
    const padding = this.centerPadding(this.stripAnsi(totalStr).length, this.TABLE_WIDTH - 2);
    return padding.left + totalStr + padding.right;
  }

  private static createPlayerBox(tp: TablePlayer): string {
    const { player, isDealer, isCurrentTurn } = tp;
    
    // Name with color
    let name = player.name.padEnd(8, ' ').substring(0, 8);
    if (player.id === 'human') {
      name = ColorUtils.humanPlayer(name);
    } else {
      name = ColorUtils.aiPlayer(name);
    }
    
    // Status indicators
    const indicators = [];
    if (isDealer) indicators.push(chalk.magenta.bold('D'));
    if (isCurrentTurn) indicators.push(chalk.green.bold('→'));
    if (player.folded) indicators.push(chalk.red('F'));
    if (player.isAllIn) indicators.push(chalk.red.bold('A'));
    
    const statusStr = indicators.length > 0 ? '[' + indicators.join('') + ']' : '   ';
    
    // Cards
    const cards = player.hand.size() > 0 && player.id === 'human' && !player.folded
      ? player.hand.getCards().map(c => c.toColorString()).join(' ')
      : '🂠 🂠';
    
    // Format: Name[Status] Cards $Chips
    return `${name}${statusStr} ${cards} ${ColorUtils.chips(player.chips)}`;
  }

  private static centerPadding(contentLength: number, totalWidth: number): { left: string, right: string } {
    const space = Math.max(0, totalWidth - contentLength);
    const leftPad = Math.floor(space / 2);
    const rightPad = space - leftPad;
    return {
      left: ' '.repeat(leftPad),
      right: ' '.repeat(rightPad)
    };
  }

  private static stripAnsi(str: string): string {
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