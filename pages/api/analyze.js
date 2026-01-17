import axios from 'axios';
import fs from 'fs';
import path from 'path';

const KNOWN_TOURNAMENT_IDS = {
  '41535': [],
  '41536': [230481, 222863, 214519, 220211, 218842, 217622, 217008, 215549, 214314, 213191, 212135, 208638, 207701, 204274, 205591, 203699, 202577, 199449, 196332, 193226, 191169, 190093, 189876, 188953, 187936, 186922, 186845, 184791, 184361, 175453, 182504, 181482, 180261, 180098, 179305, 176318, 176184, 175338, 175212, 172245, 171686, 171556, 171447, 170461, 169446, 168449, 167620, 167458, 166458, 166424, 165321, 164294, 162417, 161615, 160671, 159838, 157148, 156290]
};

// Load pre-fetched arena names
let ARENA_NAMES = {};
try {
  const arenaMapPath = path.join(process.cwd(), 'data', 'arena-names.json');
  if (fs.existsSync(arenaMapPath)) {
    ARENA_NAMES = JSON.parse(fs.readFileSync(arenaMapPath, 'utf8'));
    console.log(`✓ Loaded ${Object.keys(ARENA_NAMES).length} arena names from cache`);
  }
} catch (err) {
  console.log('⚠️  Could not load arena names cache');
}

async function processBatch(items, batchSize, processFn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);
  }
  return results;
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const tournamentIds = KNOWN_TOURNAMENT_IDS[userId];

  if (!tournamentIds) {
    return res.status(404).json({
      error: `User ${userId} not configured. Please run the setup script to add this user.`
    });
  }

  if (tournamentIds.length === 0) {
    return res.status(404).json({
      error: `No tournaments configured for user ${userId}.`
    });
  }

  const BASE_URL = "https://app.matchplay.events/api";
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    httpsAgent: new (require('https').Agent)({
      rejectUnauthorized: false
    })
  };

  try {
    console.log(`\nAnalyzing player ${userId}...`);

    const profileResponse = await axios.get(`${BASE_URL}/users/${userId}`, axiosConfig);
    const playerName = profileResponse.data.user?.name || 'Unknown Player';
    console.log(`Player: ${playerName}\n`);
    console.log(`Analyzing ${tournamentIds.length} tournaments...\n`);

    const allGames = [];
    const participatedTournamentIds = new Set();
    let processed = 0;

    const processTournament = async (tournamentId) => {
      try {
        const gamesResponse = await axios.get(
          `${BASE_URL}/tournaments/${tournamentId}/games`,
          axiosConfig
        );

        const games = gamesResponse.data.data || [];
        const userGames = [];

        games.forEach((game) => {
          const userIds = game.userIds || [];
          const userIdInt = parseInt(userId);
          const userIndex = userIds.indexOf(userIdInt);
          
          if (userIndex !== -1) {
            userGames.push({
              ...game,
              tournamentId,
              userIndex
            });
          }
        });

        processed++;
        if (processed % 10 === 0) {
          console.log(`  Games: ${processed}/${tournamentIds.length}...`);
        }

        return { tournamentId, userGames };
      } catch (err) {
        return { tournamentId, userGames: [] };
      }
    };

    const results = await processBatch(tournamentIds, 10, processTournament);

    results.forEach(result => {
      if (result.userGames.length > 0) {
        allGames.push(...result.userGames);
        participatedTournamentIds.add(result.tournamentId);
      }
    });

    console.log(`\n✓ Found ${allGames.length} games\n`);

    const machineStats = {};

    allGames.forEach(game => {
      if (!game.arenaId) return;

      const machineName = ARENA_NAMES[game.arenaId] || `Arena ${game.arenaId}`;
      
      const resultPositions = game.resultPositions || [];
      const resultPoints = game.resultPoints || [];
      const playerIdAtIndex = game.playerIds?.[game.userIndex];
      
      let position = null;
      let points = 0;
      
      if (playerIdAtIndex && resultPositions.length > 0) {
        const positionIndex = resultPositions.indexOf(playerIdAtIndex);
        if (positionIndex !== -1) {
          position = positionIndex + 1;
        }
      }
      
      if (resultPoints.length > game.userIndex) {
        points = resultPoints[game.userIndex] || 0;
      }

      if (!machineStats[machineName]) {
        machineStats[machineName] = {
          gamesPlayed: 0,
          totalPoints: 0,
          wins: 0,
          positions: [],
          tournaments: new Set(),
          arenaId: game.arenaId
        };
      }

      machineStats[machineName].gamesPlayed++;
      machineStats[machineName].totalPoints += points;
      machineStats[machineName].tournaments.add(game.tournamentId);
      
      if (position) {
        machineStats[machineName].positions.push(position);
        if (position === 1) {
          machineStats[machineName].wins++;
        }
      }
    });

    const machineRankings = Object.entries(machineStats).map(([machine, stats]) => {
      const avgPosition = stats.positions.length > 0
        ? stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length
        : 0;
      const avgPoints = stats.gamesPlayed > 0
        ? stats.totalPoints / stats.gamesPlayed
        : 0;
      const winRate = stats.gamesPlayed > 0
        ? (stats.wins / stats.gamesPlayed) * 100
        : 0;

      return {
        machine,
        gamesPlayed: stats.gamesPlayed,
        avgPosition,
        avgPoints,
        wins: stats.wins,
        winRate,
        tournaments: stats.tournaments.size,
        arenaId: stats.arenaId
      };
    });

    machineRankings.sort((a, b) => a.avgPosition - b.avgPosition || b.winRate - a.winRate);

    res.status(200).json({
      playerName,
      userId,
      machineRankings,
      totalGamesAnalyzed: allGames.length,
      participatedTournaments: participatedTournamentIds.size,
      uniqueMachines: machineRankings.length,
      totalWins: machineRankings.reduce((sum, m) => sum + m.wins, 0)
    });

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
}