import inquirer from 'inquirer';
import chalk from 'chalk';
import { runOccupancySetup } from './factors/occupancy-pricing.js';

/**
 * RMS Setup Tool - Main Entry Point
 *
 * A smart configuration assistant for hotel revenue management systems.
 * Helps hoteliers set up dynamic pricing rules with intelligent recommendations.
 */

async function main() {
  console.clear();
  console.log(chalk.bold.magenta(`
  ╔═══════════════════════════════════════════════════════════════════╗
  ║                                                                   ║
  ║   🏨  HOTEL RMS SETUP TOOL                                        ║
  ║       Revenue Management System Configuration Assistant           ║
  ║                                                                   ║
  ╚═══════════════════════════════════════════════════════════════════╝
  `));

  console.log(chalk.gray('  Welcome! This tool helps you configure dynamic pricing factors'));
  console.log(chalk.gray('  for your hotel revenue management system.\n'));

  const { factor } = await inquirer.prompt([
    {
      type: 'list',
      name: 'factor',
      message: 'Which pricing factor would you like to configure?',
      choices: [
        { name: '📊 Occupancy Based Pricing', value: 'occupancy' },
        { name: '🏠 Inventory Reallocation', value: 'inventory', disabled: 'Coming soon' },
        { name: '⏰ Time Based Factors', value: 'time', disabled: 'Coming soon' },
        { name: '📅 Lead Time Day Wise Factors', value: 'leadtime', disabled: 'Coming soon' },
        { name: '📆 Weekday Factors', value: 'weekday', disabled: 'Coming soon' },
        { name: '🌸 Season & Date Wise Factors', value: 'season', disabled: 'Coming soon' },
        { name: '📈 Market Demand Factors', value: 'demand', disabled: 'Coming soon' },
        { name: '🏆 Competition Factors', value: 'competition', disabled: 'Coming soon' },
        new inquirer.Separator(),
        { name: '❌ Exit', value: 'exit' }
      ]
    }
  ]);

  switch (factor) {
    case 'occupancy':
      await runOccupancySetup();
      break;
    case 'exit':
      console.log(chalk.blue('\nGoodbye! Happy revenue managing! 👋\n'));
      process.exit(0);
    default:
      console.log(chalk.yellow('\nThis feature is coming soon!\n'));
  }

  // Ask if user wants to configure another factor
  const { continueSetup } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continueSetup',
      message: 'Would you like to configure another factor?',
      default: true
    }
  ]);

  if (continueSetup) {
    await main();
  } else {
    console.log(chalk.blue('\nGoodbye! Happy revenue managing! 👋\n'));
  }
}

main().catch(console.error);
