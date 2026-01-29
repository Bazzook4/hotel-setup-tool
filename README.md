# Hotel RMS Setup Tool

A smart configuration assistant for hotel Revenue Management Systems. This web-based tool helps hoteliers set up dynamic pricing rules with intelligent recommendations tailored to the Indian hospitality market.

## Features

### 1. Room Type Configuration
- Add multiple room categories (Standard, Deluxe, Suite, etc.)
- Set base rates, max rates, and inventory for each room type
- Smart inventory pooling recommendations based on price differentials

### 2. Property & Demand Profile
- Select from 8 hotel types (Budget, Boutique, Business, Resort, etc.)
- Location-based demand patterns for all 28 Indian states and 8 Union Territories
- Automatic demand pattern recommendations based on hotel type

### 3. Time-Based Factors
- **Lead Time Pricing**: Configure pricing based on booking lead time (0-90+ days)
- **Hourly Pricing**: Set time-of-day based price adjustments
- Visual chart-based configuration for intuitive setup

### 4. Results Dashboard
- **Occupancy-Based Pricing**: J-curve pricing slabs with intelligent max rate capping
- **Inventory Reallocation**: Smart room pooling recommendations considering inventory size
- **Special Dates 2025**: Indian festivals, long weekends, and regional events
- **Seasonal Patterns**: Monthly and quarterly pricing recommendations
- Copy-to-clipboard functionality for easy RMS integration

## Installation

```bash
npm install
```

## Usage

### Start the server:
```bash
npm start
```

Then open http://localhost:3000 in your browser.

### Development mode (with auto-reload):
```bash
npm run dev
```

## How It Works

### Step 1: Room Types
Define your room categories with their base rates and inventory. The tool will analyze price differentials to suggest inventory pooling strategies.

### Step 2: Property & Demand
Select your hotel type and location. The tool uses India-specific demand patterns to provide relevant pricing recommendations.

### Step 3: Time Factors
Configure lead time and hourly pricing using interactive charts. Drag points to set multipliers for different time periods.

### Results
View comprehensive pricing recommendations:
- Occupancy slabs with increments that respect your max rate limits
- Smart inventory reallocation considering both price gaps and inventory percentages
- Calendar of special dates and long weekends for 2025
- Seasonal pricing patterns

## Project Structure

```
src/
├── server.js          # Express server
└── public/
    ├── index.html     # Entry point (redirects to setup)
    ├── setup.html     # 3-step configuration wizard
    ├── results.html   # Results dashboard
    └── _legacy/       # Archived files (not in use)
```

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: Browser localStorage for data persistence
- **Styling**: Tailwind CSS via CDN

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
