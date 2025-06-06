# Poker MVP 🃏

A comprehensive Texas Hold'em poker implementation in TypeScript with tournament mode, AI players, and complete game statistics.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/tarunjain15/poker-mvp.git
cd poker-mvp
npm install

# Play the game (recommended mode)
npm run play:simple
```

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
3. **Simple Colorful Mode** (`npm run play:simple`) **[RECOMMENDED]**: Clean, colorful interface with:
   - Colored cards (red ♥♦, black ♣♠)
   - Clear game state display
   - Color-coded actions and chips
   - No table glitches or display issues
4. **Advanced Table Mode** (`npm run play:color`): Visual poker table (may have display issues)
   - Full table visualization
   - Player positions around table
   - Dealer button indicator

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

### 🎮 Playing the Game

#### Simple Colorful Mode (⭐ RECOMMENDED)
```bash
npm run play:simple
```
- Clean, smooth gameplay without display glitches
- Colored cards (red ♥♦, black ♣♠)
- Clear game state display
- Color-coded actions and chips
- Perfect for actual playing

#### Tournament Mode
```bash
npm run play:tournament
```
- Standard tournament experience (no colors)
- Players are eliminated when chips reach zero
- Blinds increase every 10 hands
- Comprehensive statistics at the end

#### Quick Play Mode
```bash
npm run play
```
- Basic poker hands (no colors)
- Play individual hands against AI
- Simple text interface

#### Advanced Table Mode
```bash
npm run play:color
```
- Full poker table visualization
- May have display issues on some terminals
- Best for demo purposes

### 🧪 Testing & Development

#### Run Unit Tests
```bash
npm test
```
- Tests core game logic
- 26 tests for Card, Deck, and HandEvaluator

#### Run Integration Test
```bash
npm run test:integration
```
- Automated game simulation
- Plays 20 hands with AI decisions
- Verifies game flow and mechanics

#### View Demo
```bash
npm run demo
```
- Non-interactive demo of the table interface
- Shows colored cards and visual elements

#### Build TypeScript
```bash
npm run build
```
- Compiles TypeScript to JavaScript
- Required after making changes

#### Development Mode
```bash
npm run dev
```
- Runs the index file directly with ts-node

### 📋 Complete Script Reference

| Script | Command | Description |
|--------|---------|-------------|
| `play:simple` | `npm run play:simple` | **Recommended** - Colorful tournament without glitches |
| `play:tournament` | `npm run play:tournament` | Standard tournament mode |
| `play` | `npm run play` | Basic quick play |
| `play:color` | `npm run play:color` | Advanced table view (may glitch) |
| `test` | `npm test` | Run unit tests |
| `test:integration` | `npm run test:integration` | Run automated game test |
| `demo` | `npm run demo` | View visual demo |
| `build` | `npm run build` | Compile TypeScript |
| `dev` | `npm run dev` | Development mode |
| `start` | `npm start` | Run compiled JavaScript |

## Project Structure

```
poker-mvp/
├── src/
│   ├── Card.ts                 # Card representation with suits and ranks
│   ├── Deck.ts                 # Deck management and shuffling
│   ├── Hand.ts                 # Player hand container
│   ├── HandEvaluator.ts        # Poker hand evaluation logic
│   ├── Player.ts               # Player state and actions
│   ├── PokerGame.ts            # Core game flow and rules
│   ├── GameSession.ts          # Tournament session management
│   ├── ColorUtils.ts           # Terminal color utilities
│   ├── PokerTable.ts           # Visual table representation
│   ├── PokerTableImproved.ts   # Improved table layout
│   ├── cli.ts                  # Basic CLI interface
│   ├── cli-improved.ts         # Tournament CLI interface
│   ├── cli-colorful.ts         # Colorful CLI with table view
│   ├── SimpleColorfulCLI.ts    # Simple colorful CLI (recommended)
│   ├── integration-test.ts     # Automated game testing
│   ├── demo.ts                 # Visual demo
│   └── index.ts                # Main exports
├── tests/
│   ├── Card.test.ts            # Card class tests
│   ├── Deck.test.ts            # Deck class tests
│   └── HandEvaluator.test.ts   # Hand evaluation tests
├── dist/                       # Compiled JavaScript (after build)
├── package.json                # Project configuration
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest test configuration
└── README.md                   # This file
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

## Troubleshooting

### Colors not displaying
- Make sure your terminal supports ANSI colors
- Try running in VS Code terminal, iTerm2, or modern Terminal.app
- Run `node test-color.js` to verify color support

### Game stuck or glitchy display
- Use `npm run play:simple` instead of `play:color`
- The simple mode is more reliable across different terminals

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Permission errors
```bash
chmod +x node_modules/.bin/*
```

## License

MIT License - feel free to use this code for learning or as a starting point for your own poker implementation.

## Contributing

Pull requests are welcome! Please feel free to submit enhancements, bug fixes, or new features.

## Acknowledgments

Built as a minimum viable product to demonstrate core poker mechanics and game flow implementation.