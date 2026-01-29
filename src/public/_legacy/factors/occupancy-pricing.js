import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Occupancy Based Pricing Calculator
 *
 * This module helps hotels set up occupancy-based pricing slabs.
 * It intelligently creates 4-5 pricing tiers based on:
 * - Total inventory
 * - Usual occupancy percentage
 * - Peak day occupancy percentage
 */

class OccupancyPricingCalculator {
  constructor() {
    this.inventory = 0;
    this.usualOccupancy = 0;
    this.peakOccupancy = 0;
    this.baseRate = 0;
    this.slabs = [];
  }

  /**
   * Calculate recommended slabs based on property data
   */
  calculateSlabs() {
    const totalRooms = this.inventory;
    const usualOccRooms = Math.round((this.usualOccupancy / 100) * totalRooms);
    const peakOccRooms = Math.round((this.peakOccupancy / 100) * totalRooms);

    // Determine number of slabs (4 if inventory <= 35, 5 if > 35)
    const numSlabs = totalRooms > 35 ? 5 : 4;

    this.slabs = [];

    // Slab 1: Always 0-1 (empty to first booking)
    this.slabs.push({
      start: 0,
      end: 1,
      increment: 0,
      description: 'Base rate - No increment for first booking'
    });

    if (numSlabs === 4) {
      // 4 Slab Strategy
      // Slab 2: 2 to ~40% of usual occupancy (low occupancy zone)
      const slab2End = Math.max(2, Math.round(usualOccRooms * 0.4));
      // Slab 3: ~40% to ~80% of usual occupancy (moderate zone)
      const slab3End = Math.max(slab2End + 1, Math.round(usualOccRooms * 0.8));
      // Slab 4: ~80% to peak/max (high demand zone)
      const slab4End = Math.min(totalRooms, Math.max(slab3End + 1, peakOccRooms));

      this.slabs.push({
        start: 2,
        end: slab2End,
        increment: this.calculateIncrement(0.15, slab2End - 2 + 1), // 15% total increase over slab
        description: 'Low occupancy zone - Gradual increase'
      });

      this.slabs.push({
        start: slab2End + 1,
        end: slab3End,
        increment: this.calculateIncrement(0.25, slab3End - slab2End), // 25% total increase
        description: 'Moderate occupancy zone - Steady increase'
      });

      this.slabs.push({
        start: slab3End + 1,
        end: slab4End,
        increment: this.calculateIncrement(0.35, slab4End - slab3End), // 35% total increase
        description: 'High demand zone - Aggressive pricing'
      });

    } else {
      // 5 Slab Strategy (for larger properties > 35 rooms)
      const slab2End = Math.max(2, Math.round(usualOccRooms * 0.25));
      const slab3End = Math.max(slab2End + 1, Math.round(usualOccRooms * 0.5));
      const slab4End = Math.max(slab3End + 1, Math.round(usualOccRooms * 0.75));
      const slab5End = Math.min(totalRooms, Math.max(slab4End + 1, peakOccRooms));

      this.slabs.push({
        start: 2,
        end: slab2End,
        increment: this.calculateIncrement(0.10, slab2End - 2 + 1),
        description: 'Initial booking zone - Minimal increase'
      });

      this.slabs.push({
        start: slab2End + 1,
        end: slab3End,
        increment: this.calculateIncrement(0.15, slab3End - slab2End),
        description: 'Low-moderate zone - Light increase'
      });

      this.slabs.push({
        start: slab3End + 1,
        end: slab4End,
        increment: this.calculateIncrement(0.25, slab4End - slab3End),
        description: 'Moderate zone - Steady increase'
      });

      this.slabs.push({
        start: slab4End + 1,
        end: slab5End,
        increment: this.calculateIncrement(0.40, slab5End - slab4End),
        description: 'High demand zone - Aggressive pricing'
      });
    }

    return this.slabs;
  }

  /**
   * Calculate per-room increment to achieve target percentage increase over a range
   */
  calculateIncrement(targetPercentage, roomsInSlab) {
    if (roomsInSlab <= 0) return 0;
    // This gives us the increment needed per room to achieve the target % increase
    // over the entire slab
    return Math.round((this.baseRate * targetPercentage) / roomsInSlab);
  }

  /**
   * Calculate the rate at each occupancy point
   */
  calculateRatesTable() {
    const rates = [];
    let currentRate = this.baseRate;

    for (let occ = 0; occ <= this.inventory; occ++) {
      const slab = this.slabs.find(s => occ >= s.start && occ <= s.end);
      if (slab && occ > 0) {
        currentRate += slab.increment;
      }
      rates.push({
        occupancy: occ,
        rate: Math.round(currentRate),
        slab: slab ? this.slabs.indexOf(slab) + 1 : 0
      });
    }

    return rates;
  }

  /**
   * Generate recommendations based on property profile
   */
  generateRecommendations() {
    const recommendations = [];

    // Analyze usual vs peak occupancy gap
    const occupancyGap = this.peakOccupancy - this.usualOccupancy;

    if (occupancyGap > 30) {
      recommendations.push({
        type: 'insight',
        message: `Your peak occupancy (${this.peakOccupancy}%) is significantly higher than usual (${this.usualOccupancy}%). Consider more aggressive pricing during peak periods.`
      });
    }

    if (this.usualOccupancy < 50) {
      recommendations.push({
        type: 'suggestion',
        message: 'With usual occupancy below 50%, focus on competitive base rates to drive volume. Consider promotional rates for low-occupancy periods.'
      });
    }

    if (this.usualOccupancy > 75) {
      recommendations.push({
        type: 'opportunity',
        message: 'High usual occupancy indicates strong demand. You have room to increase base rates or be more aggressive with occupancy-based increments.'
      });
    }

    if (this.inventory < 20) {
      recommendations.push({
        type: 'strategy',
        message: 'Small property with limited inventory. Each room sold significantly impacts remaining availability - consider steeper increments in upper slabs.'
      });
    }

    if (this.inventory > 50) {
      recommendations.push({
        type: 'strategy',
        message: 'Large property with good inventory buffer. You can afford more gradual pricing to maintain competitiveness in early slabs.'
      });
    }

    return recommendations;
  }

  /**
   * Format output for display
   */
  formatSlabsForDisplay() {
    return this.slabs.map((slab, index) => {
      const stepValue = slab.increment;
      const rateAtStart = this.baseRate + (index > 0 ?
        this.slabs.slice(0, index).reduce((sum, s) => sum + (s.increment * (s.end - s.start + 1)), 0) : 0);
      const rateAtEnd = rateAtStart + (slab.increment * (slab.end - slab.start + (index === 0 ? 1 : 0)));

      return {
        slab: index + 1,
        start: slab.start,
        end: slab.end,
        increment: slab.increment,
        step: stepValue.toFixed(2),
        rateRange: `${Math.round(rateAtStart).toLocaleString()} - ${Math.round(rateAtEnd).toLocaleString()}`,
        description: slab.description
      };
    });
  }

  /**
   * Export configuration in RMS-compatible format
   */
  exportConfig() {
    return {
      occupancyPricing: {
        enabled: true,
        baseRate: this.baseRate,
        inventory: this.inventory,
        slabs: this.slabs.map((slab, index) => ({
          start: slab.start,
          end: slab.end,
          increment: slab.increment,
          rates: `${this.baseRate + (index * 200)}, ${this.baseRate + ((index + 1) * 200)}`
        }))
      },
      metadata: {
        usualOccupancy: this.usualOccupancy,
        peakOccupancy: this.peakOccupancy,
        generatedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * Interactive CLI for Occupancy Pricing Setup
 */
async function runOccupancySetup() {
  const calculator = new OccupancyPricingCalculator();

  console.log(chalk.bold.blue('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.blue('   OCCUPANCY BASED PRICING SETUP'));
  console.log(chalk.bold.blue('   Hotel Revenue Management System'));
  console.log(chalk.bold.blue('═══════════════════════════════════════════════════════════\n'));

  console.log(chalk.gray('This wizard will help you set up optimal occupancy-based pricing slabs.'));
  console.log(chalk.gray('Your answers will be used to create intelligent pricing tiers.\n'));

  // Step 1: Get Total Inventory
  const inventoryAnswer = await inquirer.prompt([
    {
      type: 'number',
      name: 'inventory',
      message: 'What is your total room inventory?',
      validate: (value) => {
        if (value > 0 && value <= 500) return true;
        return 'Please enter a valid number between 1 and 500';
      }
    }
  ]);
  calculator.inventory = inventoryAnswer.inventory;

  // Provide context about slab strategy
  if (calculator.inventory > 35) {
    console.log(chalk.cyan(`\n💡 With ${calculator.inventory} rooms, we'll create 5 pricing slabs for granular control.\n`));
  } else {
    console.log(chalk.cyan(`\n💡 With ${calculator.inventory} rooms, we'll create 4 pricing slabs for optimal balance.\n`));
  }

  // Step 2: Get Usual Occupancy
  const usualOccAnswer = await inquirer.prompt([
    {
      type: 'number',
      name: 'usualOccupancy',
      message: 'What is your usual/average occupancy percentage? (e.g., 65 for 65%)',
      validate: (value) => {
        if (value > 0 && value <= 100) return true;
        return 'Please enter a percentage between 1 and 100';
      }
    }
  ]);
  calculator.usualOccupancy = usualOccAnswer.usualOccupancy;

  const usualRooms = Math.round((calculator.usualOccupancy / 100) * calculator.inventory);
  console.log(chalk.gray(`   → That's approximately ${usualRooms} rooms on a typical day.\n`));

  // Step 3: Get Peak Occupancy
  const peakOccAnswer = await inquirer.prompt([
    {
      type: 'number',
      name: 'peakOccupancy',
      message: 'What is your occupancy during peak days? (e.g., 90 for 90%)',
      validate: (value) => {
        if (value >= calculator.usualOccupancy && value <= 100) return true;
        return `Please enter a percentage between ${calculator.usualOccupancy}% and 100%`;
      }
    }
  ]);
  calculator.peakOccupancy = peakOccAnswer.peakOccupancy;

  const peakRooms = Math.round((calculator.peakOccupancy / 100) * calculator.inventory);
  console.log(chalk.gray(`   → That's approximately ${peakRooms} rooms during peak periods.\n`));

  // Step 4: Get Base Rate
  const baseRateAnswer = await inquirer.prompt([
    {
      type: 'number',
      name: 'baseRate',
      message: 'What is your base room rate (starting price)?',
      validate: (value) => {
        if (value > 0) return true;
        return 'Please enter a valid rate greater than 0';
      }
    }
  ]);
  calculator.baseRate = baseRateAnswer.baseRate;

  // Calculate and display results
  console.log(chalk.bold.green('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.green('   CALCULATING OPTIMAL PRICING SLABS...'));
  console.log(chalk.bold.green('═══════════════════════════════════════════════════════════\n'));

  calculator.calculateSlabs();
  const displaySlabs = calculator.formatSlabsForDisplay();
  const recommendations = calculator.generateRecommendations();

  // Display Slabs Table
  console.log(chalk.bold.white('📊 RECOMMENDED PRICING SLABS:\n'));
  console.log(chalk.gray('─'.repeat(80)));
  console.log(
    chalk.bold.cyan('Slab'.padEnd(6)) +
    chalk.bold.cyan('Start'.padEnd(8)) +
    chalk.bold.cyan('End'.padEnd(8)) +
    chalk.bold.cyan('Increment'.padEnd(12)) +
    chalk.bold.cyan('Rate Range'.padEnd(20)) +
    chalk.bold.cyan('Description')
  );
  console.log(chalk.gray('─'.repeat(80)));

  displaySlabs.forEach(slab => {
    console.log(
      String(slab.slab).padEnd(6) +
      String(slab.start).padEnd(8) +
      String(slab.end).padEnd(8) +
      String(slab.increment).padEnd(12) +
      slab.rateRange.padEnd(20) +
      chalk.gray(slab.description)
    );
  });
  console.log(chalk.gray('─'.repeat(80)));

  // Display Recommendations
  if (recommendations.length > 0) {
    console.log(chalk.bold.yellow('\n💡 RECOMMENDATIONS:\n'));
    recommendations.forEach(rec => {
      const icon = rec.type === 'insight' ? '🔍' :
                   rec.type === 'suggestion' ? '💭' :
                   rec.type === 'opportunity' ? '🎯' : '📋';
      console.log(`${icon} ${chalk.white(rec.message)}\n`);
    });
  }

  // Ask if user wants to see detailed rate table
  const showDetailsAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'showDetails',
      message: 'Would you like to see the detailed rate at each occupancy point?',
      default: false
    }
  ]);

  if (showDetailsAnswer.showDetails) {
    const ratesTable = calculator.calculateRatesTable();
    console.log(chalk.bold.white('\n📈 RATE BY OCCUPANCY:\n'));
    console.log(chalk.gray('Occupancy → Rate'));
    console.log(chalk.gray('─'.repeat(30)));

    ratesTable.forEach(entry => {
      const bar = '█'.repeat(Math.min(30, Math.round((entry.rate - calculator.baseRate) / 50)));
      console.log(
        `${String(entry.occupancy).padStart(3)} rooms → ${String(entry.rate).padStart(6)} ${chalk.green(bar)}`
      );
    });
  }

  // Export option
  const exportAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'export',
      message: 'Would you like to export this configuration?',
      default: true
    }
  ]);

  if (exportAnswer.export) {
    const config = calculator.exportConfig();
    console.log(chalk.bold.white('\n📁 CONFIGURATION EXPORT:\n'));
    console.log(chalk.gray(JSON.stringify(config, null, 2)));
  }

  console.log(chalk.bold.blue('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.blue('   Setup Complete! Apply these settings to your RMS.'));
  console.log(chalk.bold.blue('═══════════════════════════════════════════════════════════\n'));

  return calculator;
}

// Export for use as module
export { OccupancyPricingCalculator, runOccupancySetup };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runOccupancySetup().catch(console.error);
}
