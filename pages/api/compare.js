import axios from 'axios';
import fs from 'fs';
import path from 'path';

const PLAYER_NAMES = {
  '1902': 'Amy Kesting',
  '38284': 'Andrea Johnston',
  '41535': 'Ashley Fecteau',
  '36418': 'Carey Huffman',
  '33826': 'Jazz Draper',
  '39480': 'Kasey Jarvis',
  '26073': 'Lindsey Sickler',
  '15930': 'Molly Oury',
  '27746': 'Olivia Haberkorn',
  '22919': 'Rachel Engels',
  '14049': 'Rose Quinn',
  '26618': 'Sarah Crismore',
  '30684': 'Skylar DeWitt',
  '23371': 'Sydnee Deventer',
  '38364': 'Tammy Miller IN',
  '6123': 'Trisha Burgess'
};

const KNOWN_TOURNAMENT_IDS = {
  '1902': [226003, 226001, 225999, 225428, 224778, 224091, 223514, 222493, 221866, 221105, 220884, 220835, 220234, 219756, 218957, 217688, 216857, 215053, 214965, 213439, 204891, 201728, 204038, 203027, 201978, 200907, 199920, 197774, 204643, 196791, 196658, 185399, 177336, 185282, 185223, 184757, 183687, 182011, 167028, 173514, 181514, 174760],
  '38284': [],
  '41535': [229846, 230481, 229304, 222863, 221133, 220211, 217622, 215376, 214314, 213190, 213034, 209767, 207842, 207701, 206474, 205591, 204662, 203699, 203543, 199449, 197219, 197220, 194068, 194067, 193226, 193013, 192165, 191169, 189876, 189873, 188953, 187936, 186845, 185674, 184791, 183237, 182504, 181482, 180261, 180098, 180134, 176318, 176184, 176181, 175338, 175225, 175212, 174280, 172245, 172156, 171686, 171556, 171447, 171437, 170461, 170404, 169446, 168449, 167620, 166458, 166424, 166355, 165321, 164294, 164069, 162417, 161615, 160671, 159838, 158889, 157998, 157148, 156290],
  '36418': [],
  '33826': [],
  '39480': [],
  '26073': [],
  '15930': [],
  '27746': [],
  '22919': [],
  '14049': [],
  '26618': [],
  '30684': [],
  '23371': [],
  '38364': [],
  '6123': []
};

// Load pre-fetched arena names
let ARENA_NAMES = {};
try {
  const arenaMapPath = path.join(process.cwd(), 'data', 'arena-names.json');
  if (fs.existsSync(arenaMapPath)) {
    ARENA_NAMES = JSON.parse(fs.readFileSync(arenaMapPath, 'utf8'));
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

async function getPlayerStats(userId) {
  const tournamentIds = KNOWN_TOURNAMENT_IDS[userId];

  if (!tournamentIds || tournamentIds.length === 0) {
    return { machineStats: {}, totalGames: 0 };
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

  const allGames = [];

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

      return { tournamentId, userGames };
    } catch (err) {
      return { tournamentId, userGames: [] };
    }
  };

  const results = await processBatch(tournamentIds, 10, processTournament);

  results.forEach(result => {
    if (result.userGames.length > 0) {
      allGames.push(...result.userGames);
    }
  });

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
        arenaId: game.arenaId
      };
    }

    machineStats[machineName].gamesPlayed++;
    machineStats[machineName].totalPoints += points;

    if (position) {
      machineStats[machineName].positions.push(position);
      if (position === 1) {
        machineStats[machineName].wins++;
      }
    }
  });

  return { machineStats, totalGames: allGames.length };
}

function calculateAdvantageScore(yourStats, opponentStats) {
  // If opponent never played, huge advantage
  if (!opponentStats) {
    return {
      score: 100,
      reason: 'Opponent has never played'
    };
  }

  // Calculate your performance (lower avg position is better)
  const yourAvgPos = yourStats.positions.length > 0
    ? yourStats.positions.reduce((a, b) => a + b, 0) / yourStats.positions.length
    : 4;

  const yourWinRate = yourStats.gamesPlayed > 0
    ? (yourStats.wins / yourStats.gamesPlayed) * 100
    : 0;

  // Calculate opponent performance
  const oppAvgPos = opponentStats.positions.length > 0
    ? opponentStats.positions.reduce((a, b) => a + b, 0) / opponentStats.positions.length
    : 4;

  const oppWinRate = opponentStats.gamesPlayed > 0
    ? (opponentStats.wins / opponentStats.gamesPlayed) * 100
    : 0;

  // Calculate advantage score (0-100)
  // Better your performance + worse their performance = higher score
  const positionAdvantage = (oppAvgPos - yourAvgPos) * 20; // Position difference
  const winRateAdvantage = (yourWinRate - oppWinRate) / 2; // Win rate difference
  const experienceBonus = yourStats.gamesPlayed >= 3 ? 10 : 0; // Bonus if you're experienced

  const score = Math.max(0, Math.min(100, 50 + positionAdvantage + winRateAdvantage + experienceBonus));

  let reason = '';
  if (score >= 80) reason = 'Huge advantage - you excel, they struggle';
  else if (score >= 65) reason = 'Strong advantage - good matchup for you';
  else if (score >= 50) reason = 'Slight advantage in your favor';
  else if (score >= 35) reason = 'Fairly even matchup';
  else reason = 'Opponent has the advantage';

  return { score: Math.round(score), reason };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerId, opponentId } = req.body;

  if (!playerId || !opponentId) {
    return res.status(400).json({ error: 'Both player IDs are required' });
  }

  try {
    console.log(`\nComparing ${PLAYER_NAMES[playerId]} vs ${PLAYER_NAMES[opponentId]}...\n`);

    // Get stats for both players
    const [playerData, opponentData] = await Promise.all([
      getPlayerStats(playerId),
      getPlayerStats(opponentId)
    ]);

    // Get all unique machines played by either player
    const allMachines = new Set([
      ...Object.keys(playerData.machineStats),
      ...Object.keys(opponentData.machineStats)
    ]);

    // Calculate advantage for each machine
    const machineComparisons = [];

    allMachines.forEach(machine => {
      const yourStats = playerData.machineStats[machine];
      const oppStats = opponentData.machineStats[machine];

      // Only include machines YOU have played
      if (!yourStats) return;

      const advantage = calculateAdvantageScore(yourStats, oppStats);

      const yourAvgPos = yourStats.positions.length > 0
        ? yourStats.positions.reduce((a, b) => a + b, 0) / yourStats.positions.length
        : null;

      const oppAvgPos = oppStats && oppStats.positions.length > 0
        ? oppStats.positions.reduce((a, b) => a + b, 0) / oppStats.positions.length
        : null;

      const yourWinRate = yourStats.gamesPlayed > 0
        ? (yourStats.wins / yourStats.gamesPlayed) * 100
        : 0;

      const oppWinRate = oppStats && oppStats.gamesPlayed > 0
        ? (oppStats.wins / oppStats.gamesPlayed) * 100
        : 0;

      machineComparisons.push({
        machine,
        advantageScore: advantage.score,
        reason: advantage.reason,
        arenaId: yourStats.arenaId,
        you: {
          gamesPlayed: yourStats.gamesPlayed,
          avgPosition: yourAvgPos,
          wins: yourStats.wins,
          winRate: yourWinRate
        },
        opponent: oppStats ? {
          gamesPlayed: oppStats.gamesPlayed,
          avgPosition: oppAvgPos,
          wins: oppStats.wins,
          winRate: oppWinRate
        } : null
      });
    });

    // Sort by advantage score (highest first)
    machineComparisons.sort((a, b) => b.advantageScore - a.advantageScore);

    res.status(200).json({
      player: {
        id: playerId,
        name: PLAYER_NAMES[playerId],
        totalGames: playerData.totalGames,
        machinesPlayed: Object.keys(playerData.machineStats).length
      },
      opponent: {
        id: opponentId,
        name: PLAYER_NAMES[opponentId],
        totalGames: opponentData.totalGames,
        machinesPlayed: Object.keys(opponentData.machineStats).length
      },
      recommendations: machineComparisons
    });

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    res.status(500).json({ error: err.message || 'Comparison failed' });
  }
}
