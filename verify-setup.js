#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🔍 Verifying Poker MVP Setup...\n'));

// Check Node version
const nodeVersion = process.version;
console.log(`✓ Node.js version: ${chalk.green(nodeVersion)}`);

// Check if key files exist
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'src/cli-colorful.ts',
  'src/PokerTable.ts',
  'src/ColorUtils.ts',
  'dist/cli-colorful.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  if (exists) {
    console.log(`✓ ${file} ${chalk.green('exists')}`);
  } else {
    console.log(`✗ ${file} ${chalk.red('missing')}`);
    allFilesExist = false;
  }
});

// Check if dependencies are installed
try {
  require('readline-sync');
  console.log(`✓ readline-sync ${chalk.green('installed')}`);
} catch (e) {
  console.log(`✗ readline-sync ${chalk.red('not installed')}`);
  allFilesExist = false;
}

// Test chalk colors
console.log('\n' + chalk.yellow('Testing colors:'));
console.log('  ' + chalk.red('♥ ♦') + ' ' + chalk.white('♣ ♠'));
console.log('  ' + chalk.green('RAISE') + ' ' + chalk.blue('CALL') + ' ' + chalk.red('FOLD'));

if (allFilesExist) {
  console.log(chalk.green.bold('\n✓ All checks passed! You can run: npm run play:color'));
} else {
  console.log(chalk.red.bold('\n✗ Some files are missing. Please run: npm run build'));
}

// Show available commands
console.log(chalk.cyan('\n📋 Available commands:'));
console.log('  npm run play:color    ' + chalk.gray('# Colorful tournament mode'));
console.log('  npm run play:tournament ' + chalk.gray('# Standard tournament'));
console.log('  npm run play          ' + chalk.gray('# Quick play'));
console.log('  npm run demo          ' + chalk.gray('# View demo'));
console.log('  npm test              ' + chalk.gray('# Run tests'));

console.log(chalk.gray('\nPress Ctrl+C to exit'));