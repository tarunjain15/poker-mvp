import chalk from 'chalk';
import { Suit } from './Card';

export class ColorUtils {
  // Card colors
  static colorCard(suit: Suit, text: string): string {
    if (suit === Suit.Hearts || suit === Suit.Diamonds) {
      return chalk.red(text);
    }
    return chalk.white(text);
  }

  // Player colors
  static humanPlayer(text: string): string {
    return chalk.cyan.bold(text);
  }

  static aiPlayer(text: string): string {
    return chalk.yellow(text);
  }

  static dealer(text: string): string {
    return chalk.magenta.bold(text);
  }

  // Chip colors based on amount
  static chips(amount: number): string {
    if (amount >= 1000) {
      return chalk.green.bold(`$${amount}`);
    } else if (amount >= 500) {
      return chalk.yellow.bold(`$${amount}`);
    } else if (amount >= 100) {
      return chalk.white.bold(`$${amount}`);
    } else if (amount > 0) {
      return chalk.red.bold(`$${amount}`);
    }
    return chalk.gray.strikethrough(`$${amount}`);
  }

  // Action colors
  static fold(text: string): string {
    return chalk.red(text);
  }

  static check(text: string): string {
    return chalk.gray(text);
  }

  static call(text: string): string {
    return chalk.blue(text);
  }

  static raise(text: string): string {
    return chalk.green.bold(text);
  }

  static allIn(text: string): string {
    return chalk.red.bold.underline(text);
  }

  // Game state colors
  static pot(amount: number): string {
    return chalk.yellow.bgBlack.bold(` POT: $${amount} `);
  }

  static winner(text: string): string {
    return chalk.green.bold.underline(text);
  }

  static handRank(text: string): string {
    return chalk.cyan.bold(text);
  }

  // Table elements
  static tableEdge(text: string): string {
    return chalk.gray(text);
  }

  static communityCards(text: string): string {
    return chalk.white.bgGray.bold(` ${text} `);
  }

  static phase(text: string): string {
    return chalk.blue.bold(text);
  }

  // Status indicators
  static active(text: string): string {
    return chalk.green(text);
  }

  static folded(text: string): string {
    return chalk.gray.strikethrough(text);
  }

  static eliminated(text: string): string {
    return chalk.red.strikethrough(text);
  }

  static currentTurn(text: string): string {
    return chalk.green.bgBlack.bold(` ${text} `);
  }
}