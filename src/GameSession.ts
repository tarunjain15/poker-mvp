import { PokerGame } from './PokerGame';
import { Player } from './Player';

export interface GameStats {
  handsPlayed: number;
  totalPot: number;
  biggestPot: number;
  playerStats: Map<string, PlayerStats>;
}

export interface PlayerStats {
  handsWon: number;
  totalWinnings: number;
  biggestWin: number;
  handsPlayed: number;
  finalChips: number;
}

export class GameSession {
  private game: PokerGame;
  private players: Player[];
  private eliminatedPlayers: Player[] = [];
  private stats: GameStats;
  private startingChips: number;
  private handsPlayed: number = 0;
  private smallBlind: number;
  private bigBlind: number;
  private blindIncreaseInterval: number = 10;
  private blindIncreaseRate: number = 1.5;

  constructor(
    playerNames: string[],
    startingChips: number = 1000,
    smallBlind: number = 10,
    bigBlind: number = 20
  ) {
    this.startingChips = startingChips;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    
    // Create players
    this.players = playerNames.map((name, index) => 
      new Player(name, `player${index}`, startingChips)
    );
    
    // Initialize game
    this.game = new PokerGame(this.players, smallBlind, bigBlind);
    
    // Initialize stats
    this.stats = {
      handsPlayed: 0,
      totalPot: 0,
      biggestPot: 0,
      playerStats: new Map()
    };
    
    // Initialize player stats
    this.players.forEach(player => {
      this.stats.playerStats.set(player.id, {
        handsWon: 0,
        totalWinnings: 0,
        biggestWin: 0,
        handsPlayed: 0,
        finalChips: player.chips
      });
    });
  }

  isGameOver(): boolean {
    const activePlayers = this.players.filter(p => p.chips > 0);
    return activePlayers.length <= 1;
  }

  getWinner(): Player | null {
    const activePlayers = this.players.filter(p => p.chips > 0);
    return activePlayers.length === 1 ? activePlayers[0] : null;
  }

  getActivePlayers(): Player[] {
    return this.players.filter(p => p.chips > 0);
  }

  getEliminatedPlayers(): Player[] {
    return this.eliminatedPlayers;
  }

  playHand(): void {
    // Remove eliminated players
    const newlyEliminated = this.players.filter(p => p.chips === 0);
    this.eliminatedPlayers.push(...newlyEliminated);
    this.players = this.players.filter(p => p.chips > 0);
    
    if (this.players.length < 2) {
      return;
    }
    
    // Update game with active players
    this.game = new PokerGame(this.players, this.smallBlind, this.bigBlind);
    
    // Increase blinds if necessary
    this.handsPlayed++;
    if (this.handsPlayed % this.blindIncreaseInterval === 0) {
      this.increaseBlinds();
    }
    
    // Update stats
    this.stats.handsPlayed++;
    this.players.forEach(player => {
      const playerStat = this.stats.playerStats.get(player.id)!;
      playerStat.handsPlayed++;
    });
  }

  updateStats(pot: number, winners: Player[]): void {
    this.stats.totalPot += pot;
    if (pot > this.stats.biggestPot) {
      this.stats.biggestPot = pot;
    }
    
    const winAmount = Math.floor(pot / winners.length);
    winners.forEach(winner => {
      const playerStat = this.stats.playerStats.get(winner.id)!;
      playerStat.handsWon++;
      playerStat.totalWinnings += winAmount;
      if (winAmount > playerStat.biggestWin) {
        playerStat.biggestWin = winAmount;
      }
    });
    
    // Update final chips for all players
    this.players.forEach(player => {
      const playerStat = this.stats.playerStats.get(player.id)!;
      playerStat.finalChips = player.chips;
    });
  }

  private increaseBlinds(): void {
    this.smallBlind = Math.floor(this.smallBlind * this.blindIncreaseRate);
    this.bigBlind = Math.floor(this.bigBlind * this.blindIncreaseRate);
    console.log(`\nBlinds increased to ${this.smallBlind}/${this.bigBlind}`);
  }

  getStats(): GameStats {
    return this.stats;
  }

  getGame(): PokerGame {
    return this.game;
  }

  getCurrentBlinds(): { small: number, big: number } {
    return { small: this.smallBlind, big: this.bigBlind };
  }

  getHandsPlayed(): number {
    return this.handsPlayed;
  }
}