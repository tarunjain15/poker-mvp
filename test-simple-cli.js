// Quick test to verify the simple CLI loads correctly
const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.yellow('Testing Simple Colorful CLI...'));

// Spawn the process
const proc = spawn('node', ['dist/SimpleColorfulCLI.js'], {
  stdio: 'pipe',
  env: { ...process.env, FORCE_COLOR: '1' }
});

let output = '';
let errorOutput = '';

proc.stdout.on('data', (data) => {
  output += data.toString();
  // Check if we see the expected welcome message
  if (output.includes('POKER TOURNAMENT')) {
    console.log(chalk.green('✓ CLI started successfully'));
    console.log(chalk.gray('First 500 chars of output:'));
    console.log(output.substring(0, 500));
    proc.kill();
  }
});

proc.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

proc.on('close', (code) => {
  if (errorOutput) {
    console.log(chalk.red('Errors:'), errorOutput);
  }
  console.log(chalk.blue(`\nProcess exited with code ${code}`));
});

// Kill after 2 seconds if still running
setTimeout(() => {
  if (!proc.killed) {
    console.log(chalk.yellow('\nKilling process after timeout'));
    proc.kill();
  }
}, 2000);