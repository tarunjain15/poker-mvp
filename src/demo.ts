import { PokerTableImproved as PokerTable, TablePlayer } from './PokerTableImproved';
import { Player } from './Player';
import { Card, Suit, Rank } from './Card';
import chalk from 'chalk';

// Create demo players
const players: Player[] = [
  new Player('You', 'human', 850),
  new Player('Alice', 'ai1', 1250),
  new Player('Bob', 'ai2', 650),
  new Player('Charlie', 'ai3', 0) // Eliminated
];

// Set up demo hands
players[0].hand.addCards([
  new Card(Suit.Hearts, Rank.Ace),
  new Card(Suit.Hearts, Rank.King)
]);

players[1].hand.addCards([
  new Card(Suit.Clubs, Rank.Queen),
  new Card(Suit.Diamonds, Rank.Queen)
]);

players[2].hand.addCards([
  new Card(Suit.Spades, Rank.Seven),
  new Card(Suit.Clubs, Rank.Two)
]);

players[2].folded = true;
players[3].chips = 0; // Eliminated

// Create table players
const tablePlayers: TablePlayer[] = [
  { player: players[0], isDealer: false, isCurrentTurn: true, lastAction: undefined },
  { player: players[1], isDealer: true, isCurrentTurn: false, lastAction: 'RAISE 100' },
  { player: players[2], isDealer: false, isCurrentTurn: false, lastAction: 'FOLD' },
  { player: players[3], isDealer: false, isCurrentTurn: false, lastAction: 'ELIMINATED' }
];

// Create community cards
const communityCards = [
  new Card(Suit.Hearts, Rank.Queen),
  new Card(Suit.Hearts, Rank.Jack),
  new Card(Suit.Hearts, Rank.Ten),
  new Card(Suit.Diamonds, Rank.Five)
];

// Draw the table
console.log(chalk.yellow('\n📸 Demo Screenshot of Colorful Poker Table:\n'));

PokerTable.drawTable(tablePlayers, 450, communityCards, 'Turn', 100);

// Show some example colored outputs
console.log(chalk.yellow('\n📸 Example Winner Announcement:\n'));
PokerTable.showWinner([players[0]], 'Royal Flush', 450);

console.log(chalk.yellow('\n📸 Various colored elements:'));
console.log('  Cards: ' + new Card(Suit.Hearts, Rank.Ace).toColorString() + ' ' + 
            new Card(Suit.Spades, Rank.King).toColorString() + ' ' +
            new Card(Suit.Diamonds, Rank.Queen).toColorString() + ' ' +
            new Card(Suit.Clubs, Rank.Jack).toColorString());

console.log('  Actions: ' + chalk.red('FOLD') + ' ' + 
            chalk.blue('CALL') + ' ' + 
            chalk.green.bold('RAISE') + ' ' + 
            chalk.red.bold.underline('ALL-IN'));

console.log('  Chips: ' + chalk.green.bold('$1250') + ' ' +
            chalk.yellow.bold('$850') + ' ' +
            chalk.red.bold('$75'));

console.log('\n' + chalk.green('Run "npm run play:color" to play the colorful version!'));