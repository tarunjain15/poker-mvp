import { GameSession } from './GameSession';
import { Player } from './Player';
import chalk from 'chalk';

console.log(chalk.yellow.bold('\n🧪 Running Poker Integration Test...\n'));

// Create session
const playerNames = ['TestPlayer', 'Alice', 'Bob', 'Charlie'];
const session = new GameSession(playerNames, 1000, 10, 20);
const testPlayer = session.getActivePlayers()[0];

// Test configuration
const MAX_HANDS = 20;
let handsPlayed = 0;

// Automated actions based on hand strength
function getAutomatedAction(player: Player, callAmount: number, pot: number): { action: string; amount?: number } {
  // Simple strategy based on stack size and pot odds
  const stackRatio = player.chips / 1000;
  const potOdds = callAmount / (pot + callAmount);
  const random = Math.random();
  
  if (player.id === 'player0') { // Test player strategy
    if (callAmount === 0) {
      return random < 0.5 ? { action: 'check' } : { action: 'raise', amount: Math.floor(pot * 0.5) };
    } else if (callAmount > player.chips * 0.3) {
      return { action: 'fold' };
    } else if (random < 0.7) {
      return { action: 'call' };
    } else {
      return { action: 'raise', amount: callAmount };
    }
  } else { // AI players
    if (callAmount === 0) {
      return random < 0.7 ? { action: 'check' } : { action: 'raise', amount: Math.floor(pot * 0.3) };
    } else if (potOdds > 0.3 || callAmount > player.chips * 0.4) {
      return { action: 'fold' };
    } else {
      return random < 0.8 ? { action: 'call' } : { action: 'fold' };
    }
  }
}

// Play hands
while (!session.isGameOver() && handsPlayed < MAX_HANDS) {
  handsPlayed++;
  console.log(chalk.blue(`\n=== Hand #${handsPlayed} ===`));
  
  session.playHand();
  const game = session.getGame();
  
  if (session.getActivePlayers().length < 2) {
    break;
  }
  
  game.startNewHand();
  
  // Show initial state
  const players = session.getActivePlayers();
  console.log('\nPlayers:');
  players.forEach(p => {
    console.log(`  ${p.name}: $${p.chips}`);
  });
  
  // Play through betting rounds
  const phases = ['Pre-flop', 'Flop', 'Turn', 'River'];
  let phaseIndex = 0;
  
  for (const phase of phases) {
    if (phaseIndex > 0) {
      if (phaseIndex === 1) game.dealFlop();
      else if (phaseIndex === 2) game.dealTurn();
      else if (phaseIndex === 3) game.dealRiver();
    }
    
    const state = game.getGameState();
    console.log(chalk.gray(`\n${phase}:`));
    if (state.communityCards.length > 0) {
      console.log('Community: ' + state.communityCards.map(c => c.toString()).join(' '));
    }
    console.log(`Pot: $${state.pot}`);
    
    // Betting round
    let bettingComplete = false;
    const playersActed = new Set<string>();
    let actionCount = 0;
    
    while (!bettingComplete && actionCount < 20) { // Prevent infinite loops
      actionCount++;
      const currentState = game.getGameState();
      const currentPlayer = currentState.currentPlayer;
      
      if (currentPlayer.folded || currentPlayer.isAllIn) {
        game.playerAction('check');
        continue;
      }
      
      const callAmount = currentState.currentBet - currentPlayer.currentBet;
      const decision = getAutomatedAction(currentPlayer, callAmount, currentState.pot);
      
      try {
        if (decision.action === 'fold') {
          game.playerAction('fold');
          console.log(`  ${currentPlayer.name} folds`);
        } else if (decision.action === 'check') {
          game.playerAction('check');
          console.log(`  ${currentPlayer.name} checks`);
        } else if (decision.action === 'call') {
          game.playerAction('call');
          console.log(`  ${currentPlayer.name} calls ${callAmount}`);
        } else if (decision.action === 'raise' && decision.amount) {
          const raiseAmount = Math.min(decision.amount, currentPlayer.chips - callAmount);
          if (raiseAmount > 0) {
            game.playerAction('raise', raiseAmount);
            console.log(`  ${currentPlayer.name} raises ${raiseAmount}`);
          } else {
            game.playerAction('call');
            console.log(`  ${currentPlayer.name} calls ${callAmount}`);
          }
        }
      } catch (error) {
        console.log(chalk.red(`  Action error: ${error}`));
        game.playerAction('fold');
      }
      
      playersActed.add(currentPlayer.id);
      
      const activePlayers = currentState.players.filter(p => !p.folded && !p.isAllIn);
      const allPlayersActed = activePlayers.every(p => playersActed.has(p.name));
      const allBetsEqual = activePlayers.every(p => p.currentBet === currentState.currentBet || p.isAllIn);
      
      if (activePlayers.length <= 1 || (allPlayersActed && allBetsEqual)) {
        bettingComplete = true;
      }
    }
    
    // Check if we should continue to next phase
    const remainingPlayers = game.getGameState().players.filter(p => !p.folded).length;
    if (remainingPlayers <= 1) break;
    
    phaseIndex++;
  }
  
  // Showdown
  const result = game.evaluateWinner();
  if (result && result.winners.length > 0) {
    const finalState = game.getGameState();
    console.log(chalk.yellow('\nShowdown:'));
    console.log(`Winner(s): ${result.winners.map(w => w.name).join(', ')}`);
    console.log(`Winning hand: ${result.evaluation.rankName}`);
    console.log(`Pot: $${finalState.pot}`);
    
    game.distributePot(result.winners);
    session.updateStats(finalState.pot, result.winners);
  }
  
  // Check for eliminations
  const eliminated = session.getActivePlayers().filter(p => p.chips === 0);
  if (eliminated.length > 0) {
    console.log(chalk.red('Eliminated: ' + eliminated.map(p => p.name).join(', ')));
  }
}

// Final results
console.log(chalk.green.bold('\n=== FINAL RESULTS ==='));

const winner = session.getWinner();
if (winner) {
  console.log(chalk.green(`\n🏆 Tournament Winner: ${winner.name} with $${winner.chips}!`));
} else {
  console.log('\nGame ended after maximum hands.');
}

const stats = session.getStats();
console.log(`\nTotal hands played: ${stats.handsPlayed}`);
console.log(`Biggest pot: $${stats.biggestPot}`);

console.log('\nFinal standings:');
const allPlayers = [...session.getActivePlayers(), ...session.getEliminatedPlayers()];
allPlayers
  .sort((a, b) => {
    const aStats = stats.playerStats.get(a.id)!;
    const bStats = stats.playerStats.get(b.id)!;
    return bStats.finalChips - aStats.finalChips;
  })
  .forEach((player, idx) => {
    const pStats = stats.playerStats.get(player.id)!;
    const status = pStats.finalChips === 0 ? chalk.red(' (eliminated)') : '';
    console.log(`${idx + 1}. ${player.name}: $${pStats.finalChips}${status} - Won ${pStats.handsWon}/${pStats.handsPlayed} hands`);
  });

console.log(chalk.green('\n✅ Integration test completed!'));