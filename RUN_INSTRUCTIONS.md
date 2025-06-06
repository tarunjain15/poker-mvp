# Exact Commands to Run Poker MVP

## Prerequisites
Make sure you have Node.js installed (v14 or higher).

## Setup Commands (run these in order):

```bash
# 1. Navigate to the poker-mvp directory
cd /Users/tarun/workspace/poker-mvp

# 2. Install dependencies (if not already done)
npm install

# 3. Build the TypeScript files
npm run build
```

## Playing the Game:

### Option 1: Colorful Tournament Mode (RECOMMENDED)
```bash
npm run play:color
```
This will:
- Show a colorful ASCII poker table
- Display cards in red (♥♦) and black (♣♠)
- Show dealer button [D]
- Highlight current player's turn
- Provide visual feedback for all actions

### Option 2: Standard Tournament Mode
```bash
npm run play:tournament
```
This runs the tournament without colors but with full statistics.

### Option 3: Quick Play Mode
```bash
npm run play
```
Simple single-hand games.

### Option 4: View Demo (non-interactive)
```bash
npm run demo
```
Shows what the colorful interface looks like.

## Troubleshooting:

1. **If scripts won't run:**
   ```bash
   # Try running directly with ts-node
   npx ts-node src/cli-colorful.ts
   ```

2. **If colors don't appear:**
   - Make sure your terminal supports ANSI colors
   - Try running in a different terminal (Terminal.app, iTerm2, VS Code terminal)

3. **If you get module errors:**
   ```bash
   # Clear and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **To test if colors work in your terminal:**
   ```bash
   node test-color.js
   ```

## Game Controls:

- Use number keys to select actions (0-4)
- Press Enter to confirm
- Ctrl+C to quit at any time

## Notes:
- The game requires an interactive terminal (TTY)
- Won't work in non-interactive environments
- Best experienced in a full-screen terminal window