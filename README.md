# Poker MVP 🃏

A comprehensive Texas Hold'em poker implementation in TypeScript with tournament mode, AI players, and complete game statistics.

## Features

### Core Game Mechanics
- **Texas Hold'em Rules**: Full implementation with all betting rounds (pre-flop, flop, turn, river)
- **Hand Evaluation**: Complete poker hand ranking from High Card to Royal Flush
- **Betting System**: Check, call, raise, fold, and all-in actions
- **Blind Structure**: Small/big blinds with automatic increases

### Game Modes
1. **Quick Play** (`npm run play`): Simple poker hands with AI opponents
2. **Tournament Mode** (`npm run play:tournament`): Full tournament with:
   - Player elimination when chips run out
   - Increasing blind levels every 10 hands
   - Comprehensive statistics tracking
   - Final winner declaration
3. **Colorful Mode** (`npm run play:color`): Enhanced visual experience with:
   - Full-color terminal display
   - Visual poker table with player positions
   - Colored cards (red ♥♦, black ♣♠)
   - Dealer button indicator
   - Animated betting actions
   - Visual winner celebrations

### AI Players
- Simple but effective AI opponents with:
  - Pot odds calculation
  - Stack size consideration
  - Varied play styles (tight/aggressive)
  - Bluffing capability

### Statistics & Tracking
- Hands won/played per player
- Win rate percentages
- Total winnings tracking
- Biggest pot/win records
- Net profit/loss calculation

## Installation

```bash
# Clone the repository
git clone https://github.com/tarunjain15/poker-mvp.git
cd poker-mvp

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Quick Play Mode
```bash
npm run play
```
- Play individual hands against 3 AI opponents
- Start with 1000 chips each
- Choose to continue or quit after each hand

### Tournament Mode
```bash
npm run play:tournament
```
- Full tournament experience
- Players are eliminated when they run out of chips
- Blinds increase every 10 hands
- Game continues until one player has all chips
- Comprehensive statistics at the end

### Colorful Mode (Recommended!)
```bash
npm run play:color
```
- Beautiful colored terminal interface
- Visual poker table showing all players
- Red/black colored cards
- Dealer button indicator [D]
- Visual betting actions and chip counts
- Enhanced winner announcements

### Demo Mode
```bash
npm run demo
```
- See a demo of the colorful interface without playing

## Project Structure

```
poker-mvp/
├── src/
│   ├── Card.ts           # Card representation with suits and ranks
│   ├── Deck.ts           # Deck management and shuffling
│   ├── Hand.ts           # Player hand container
│   ├── HandEvaluator.ts  # Poker hand evaluation logic
│   ├── Player.ts         # Player state and actions
│   ├── PokerGame.ts      # Core game flow and rules
│   ├── GameSession.ts    # Tournament session management
│   ├── ColorUtils.ts     # Terminal color utilities
│   ├── PokerTable.ts     # Visual table representation
│   ├── cli.ts            # Simple CLI interface
│   ├── cli-improved.ts   # Tournament CLI interface
│   ├── cli-colorful.ts   # Colorful CLI with table view
│   └── demo.ts           # Demo of colorful interface
├── tests/
│   ├── Card.test.ts
│   ├── Deck.test.ts
│   └── HandEvaluator.test.ts
└── package.json
```

## Game Rules

### Hand Rankings (Highest to Lowest)
1. **Royal Flush**: A, K, Q, J, 10 of the same suit
2. **Straight Flush**: Five consecutive cards of the same suit
3. **Four of a Kind**: Four cards of the same rank
4. **Full House**: Three of a kind plus a pair
5. **Flush**: Five cards of the same suit
6. **Straight**: Five consecutive cards of different suits
7. **Three of a Kind**: Three cards of the same rank
8. **Two Pair**: Two different pairs
9. **Pair**: Two cards of the same rank
10. **High Card**: Highest card when no other hand is made

### Betting Rounds
1. **Pre-flop**: After receiving 2 hole cards
2. **Flop**: After 3 community cards are dealt
3. **Turn**: After 4th community card
4. **River**: After 5th community card
5. **Showdown**: Remaining players reveal cards

## Development

### Run Tests
```bash
npm test
```

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## Technical Details

- **Language**: TypeScript
- **Runtime**: Node.js
- **Testing**: Jest with ts-jest
- **Architecture**: Object-oriented design with clear separation of concerns
- **AI Strategy**: Rule-based with randomization for unpredictability

## Future Enhancements

- [ ] Web UI with real-time gameplay
- [ ] Multiplayer support
- [ ] More sophisticated AI with machine learning
- [ ] Different poker variants (Omaha, Stud)
- [ ] Persistent player statistics
- [ ] Replay system
- [ ] Advanced betting strategies (pot/no-limit)

## License

MIT License - feel free to use this code for learning or as a starting point for your own poker implementation.

## Contributing

Pull requests are welcome! Please feel free to submit enhancements, bug fixes, or new features.

## Acknowledgments

Built as a minimum viable product to demonstrate core poker mechanics and game flow implementation.