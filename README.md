# Match Play Analyzer

A web application to analyze pinball tournament performance using the Match Play Events API. Scrapes real machine names from tournament pages for accurate performance tracking.

## Features

- Analyze pre-configured player profiles across all their completed tournaments
- Real machine name scraping using Puppeteer
- View machine-by-machine statistics including:
  - Total games played on each machine
  - Average finishing position
  - Win rate and total wins
  - Average points per game
- Top 10 most-played machines
- Sortable performance rankings
- Beautiful, responsive UI
- Fast analysis (~13 seconds)

## Setup

### Prerequisites

- Node.js 18 or higher
- A Match Play Events account (for onboarding new users)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/matchplay-analyzer.git
cd matchplay-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Adding New Users

To add a new user to the analyzer, run the interactive setup script:

```bash
npm run setup
```

Or directly:

```bash
node get-tournament-ids.js
```

The script will prompt you for:
1. Your Match Play Events email
2. Your Match Play Events password
3. The player profile URL or user ID to add

The script will:
- Log into Match Play Events
- Fetch all tournament IDs for the player
- Automatically update `pages/api/analyze.js` with the new user configuration

After running the script, the user will be available for analysis in the web app.

## Deploy to Vercel

### Vercel Deployment

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to complete deployment

### Environment Configuration

No environment variables are required. All user configurations are stored in `pages/api/analyze.js` via the setup script.

### Important Notes for Vercel

- The app uses Puppeteer for web scraping, which requires specific configuration in serverless environments
- Vercel automatically handles Puppeteer in serverless functions
- Analysis time: ~13 seconds per user
- Recommended: Use Vercel's Hobby plan or higher for production use

## Usage

1. Enter a Match Play Events profile URL or user ID (must be pre-configured)
   - Example URL: `https://app.matchplay.events/users/41535`
   - Example ID: `41535`
2. Click "Analyze"
3. View comprehensive performance statistics with real machine names

## How It Works

1. User enters a Match Play profile URL or user ID
2. The backend checks if the user is in `KNOWN_TOURNAMENT_IDS`
3. For configured users, the app:
   - Fetches tournament data from Match Play Events API
   - Scrapes real machine names from each tournament's arena page using Puppeteer
   - Calculates comprehensive statistics
   - Returns results in ~13 seconds
4. Results are displayed with sortable performance rankings

## Technology Stack

- **Frontend:** React, Next.js, Tailwind CSS, Lucide Icons
- **Backend:** Next.js API Routes (Serverless Functions)
- **Web Scraping:** Puppeteer (for machine names)
- **Onboarding:** Playwright (for user setup script)
- **Deployment:** Vercel
- **API:** Match Play Events API

## Project Structure

```
matchplay-analyzer/
├── pages/
│   ├── index.js              # Main UI component
│   └── api/
│       └── analyze.js        # API endpoint with KNOWN_TOURNAMENT_IDS
├── get-tournament-ids.js     # Interactive user onboarding script
├── package.json
├── next.config.js
└── README.md
```

## API Endpoints

### POST `/api/analyze`

Analyzes a pre-configured player's tournament performance.

**Request Body:**
```json
{
  "userId": "41535"
}
```

**Response:**
```json
{
  "playerName": "Player Name",
  "userId": "41535",
  "machineRankings": [
    {
      "machine": "Medieval Madness",
      "gamesPlayed": 15,
      "avgPosition": 2.3,
      "avgPoints": 8.5,
      "wins": 5,
      "winRate": 33.3,
      "tournaments": 8
    }
  ],
  "totalGamesAnalyzed": 150,
  "participatedTournaments": 25,
  "uniqueMachines": 45,
  "totalWins": 30
}
```

**Error Response:**
```json
{
  "error": "User 12345 not configured. Please run the setup script to add this user."
}
```

## Troubleshooting

### User Not Found Error

If you get "User not configured", run the setup script:
```bash
npm run setup
```

### Puppeteer Issues on Vercel

If you encounter Puppeteer issues in production:
- Vercel automatically provides Chrome for serverless functions
- Ensure your `package.json` includes `puppeteer` in dependencies
- Check Vercel function logs for specific errors

### Slow Analysis

Analysis should take ~13 seconds. If slower:
- Check your internet connection
- Verify Match Play Events API is accessible
- Check Vercel function timeout limits (default: 10s on Hobby, 60s on Pro)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Built with the [Match Play Events API](https://app.matchplay.events/api-docs/)
- Powered by [Vercel](https://vercel.com)
- Web scraping with [Puppeteer](https://pptr.dev/)
