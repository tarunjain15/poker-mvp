// Simple test to verify chalk is working
const chalk = require('chalk');

console.log(chalk.green('✓ Green text is working'));
console.log(chalk.red('✓ Red text is working'));
console.log(chalk.yellow('✓ Yellow text is working'));
console.log(chalk.blue('✓ Blue text is working'));
console.log(chalk.cyan.bold('✓ Cyan bold text is working'));
console.log(chalk.red('♥') + ' ' + chalk.red('♦') + ' ' + chalk.white('♣') + ' ' + chalk.white('♠'));
console.log('\nIf you see colored text above, chalk is working correctly!');