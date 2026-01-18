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
  '38284': [227973, 201358, 221036, 220991, 201355, 219934, 201354, 201353, 201343, 213092, 213002, 201342, 201341, 201340, 201339, 208638, 208607, 208582, 201338, 207609, 207561, 201336, 201332, 203324, 196276, 198568, 202186, 198567, 201094, 198566, 198565, 199085, 182850, 182849, 182848, 196151, 182847, 194680, 194237, 193702, 192423, 193226, 192770, 192588, 182839, 191616, 182838, 186941, 190596, 182837, 189893, 189733, 189700, 189589, 182836, 188390, 182835, 187822, 187765, 182834, 186262, 182833, 173238, 185218, 182831, 184475, 184493, 184457, 175487, 184179, 183236, 166068, 181977, 181017, 180796, 180261, 180038, 180027, 179975, 178467, 176851, 176012, 175338, 175225, 173514, 174779, 174121, 173726, 172697],
  '41535': [229846, 230481, 229304, 222863, 221133, 220211, 217622, 215376, 214314, 213190, 213034, 209767, 207842, 207701, 206474, 205591, 204662, 203699, 203543, 199449, 197219, 197220, 194068, 194067, 193226, 193013, 192165, 191169, 189876, 189873, 188953, 187936, 186845, 185674, 184791, 183237, 182504, 181482, 180261, 180098, 180134, 176318, 176184, 176181, 175338, 175225, 175212, 174280, 172245, 172156, 171686, 171556, 171447, 171437, 170461, 170404, 169446, 168449, 167620, 166458, 166424, 166355, 165321, 164294, 164069, 162417, 161615, 160671, 159838, 158889, 157998, 157148, 156290],
  '36418': [228038, 227973, 227716, 221523, 225776, 225794, 225724, 225183, 201358, 224115, 224050, 201357, 223133, 216723, 201356, 221179, 220991, 201355, 219638, 219594, 201354, 201353, 217564, 217529, 217183, 216365, 216326, 211328, 213865, 201343, 213040, 213002, 212852, 201342, 212074, 208383, 201341, 210898, 201340, 209453, 209417, 201339, 208582, 201338, 207309, 202958, 201336, 201332, 205079, 203598, 203564, 203503, 203324, 203332, 198568, 202199, 198567, 201534, 198566, 200071, 198565, 199242, 199200, 182850, 194101, 182849, 197286, 182848, 196151, 195751, 182847, 193875, 192423, 192770, 188901, 182839, 192025, 182838, 190613, 182837, 189589, 182836, 188813, 188410, 182835, 187752, 182834, 186279, 182833, 173238, 182831, 184493, 184457, 183570, 181706, 182436, 181997, 169807, 180038, 179975, 169806, 179167, 169805, 178209, 177872, 169804, 169803, 176012, 169802, 175225, 173514, 169801, 174143, 168788],
  '33826': [227716, 221523, 225776, 225965, 225922, 225794, 225724, 225183, 201358, 224050, 223133, 216723, 201356, 221179, 221036, 220991, 201355, 219594, 201354, 201353, 217564, 217529, 217183, 216326, 211328, 213865, 201343, 201342, 208383, 201341, 210906, 201340, 209417, 201339, 208607, 208582, 201338, 207309, 201336, 206506, 201332, 203004, 203598, 203564, 203324, 203332, 198568, 198567, 198566, 198565, 199242, 199200, 182850, 182849, 182848, 195772, 195751, 182847, 193875, 192423, 182839, 182838, 190639, 190613, 182837, 182836, 188410, 182835, 182834, 186279, 182833, 173238, 185409, 182831, 184457, 183570, 182436, 181997, 169807, 180038, 180027, 179975, 179222, 179167, 169805, 177872, 169804, 169803, 176012, 169802, 175225, 175212, 173514, 169801, 168788],
  '39480': [227706, 228007, 227997, 227186, 227077, 226072, 225734, 222385, 221339, 221294, 220246, 220211, 218842, 217622, 216454, 216296, 215376, 214314, 213295, 213006, 212135, 211992, 211993, 211078, 209982, 209767, 208638, 207701, 206577, 205591, 203768, 203699, 200460, 198386, 194387, 193226, 191169, 185764, 179549, 179365, 179305, 177359],
  '26073': [227082, 226566, 226559, 225432, 222325, 224024, 221036, 220991, 220697, 220045, 221812, 216754, 219625, 214896, 214225, 215861, 213212, 212663, 211901, 215858, 210898, 211622, 203000, 208354, 208302, 205457, 207182, 205072, 204187, 201530, 201125, 202203, 199403, 199200, 198926, 198925, 196151, 197972, 194963, 193709, 191652, 191016, 190634, 189893, 189700, 189406, 190628, 187752, 187374, 188429, 185255, 184791, 184475, 186299, 183128, 182419, 184222, 180843, 181974, 178797, 178209, 179739, 177897, 173514, 174116, 175840],
  '15930': [228062, 227706, 228007, 227997, 227186, 227077, 227071, 226142, 226072, 225734, 224596, 223465, 223387, 222863, 222385, 221339, 221294, 221135, 221133, 220211, 219966, 219934, 218842, 218369, 217622, 216454, 215376, 214409, 214314, 213423, 213295, 207273, 213040, 213002, 213034, 212135, 211992, 211993, 211078, 169486, 209767, 208638, 207701, 207609, 207561, 190212, 206577, 206474, 206388, 205954, 205642, 205591, 204703, 204662, 203699, 203543, 202723, 201690, 201205, 200460, 199635, 199449, 198386, 197446, 197219, 197220, 196332, 195299, 194969, 194387, 194237, 193226, 192974, 193013, 192165, 190356, 191169, 186941, 188953, 188801, 187936, 186845, 185764, 185674, 184791, 184361, 183237, 182736, 182261, 181482, 180367, 180261, 180098, 180134, 179998, 179549, 179305, 179132, 179123, 178320, 177359, 177003, 176430, 176318, 176184, 176181, 173514, 173231, 174280, 173150],
  '27746': [226072, 222863, 222385, 221294, 220246, 220211, 218842, 217622, 215376, 214314, 213295, 212135, 211078, 209767, 208638, 206577, 205954, 205591, 203699, 202723, 201690, 200460, 199449, 197446, 196332, 194387, 194237, 193226, 192165, 191169, 190093, 188953, 187936, 186845, 184791, 183237, 182624, 182504, 181482, 180261, 179549, 179305, 178320, 177359, 176318, 175225, 175212, 173514, 174280, 173150],
  '22919': [226072, 201358, 201357, 201356, 221294, 201355, 201354, 218369, 201353, 201343, 213092, 213040, 213002, 201342, 201341, 210944, 210906, 201340, 201339, 203001, 203000, 201338, 201336, 201332, 203004, 203699, 198568, 198567, 198566, 198565, 182850, 194101, 182849, 182848, 182847, 192423, 193278, 193226, 182839, 182838, 191169, 182837, 182836, 182835, 187765, 182834, 185569, 173238, 182831, 181706, 182504, 169807, 178778, 179140, 178777, 169805, 169804, 176318, 169802, 175225, 175212, 173514, 168788],
  '14049': [228062, 227997, 173322, 227186, 227077, 225490, 226072, 225805, 225734, 224168, 224596, 222786, 223555, 223465, 223387, 222863, 219149, 222385, 221294, 205059, 220211, 218954, 218842, 218369, 217622, 166089, 216513, 216454, 216296, 215376, 213903, 214468, 214409, 214314, 212789, 213295, 207273, 213065, 213006, 166112, 166088, 211621, 212135, 211992, 211993, 206088, 210513, 211129, 211078, 209481, 204846, 209767, 208968, 208638, 207701, 207561, 190212, 206577, 206485, 206474, 166109, 166073, 205954, 205591, 190358, 204662, 203699, 202723, 202577, 201690, 201205, 200460, 200642, 199759, 199756, 195501, 199449, 198386, 197446, 197219, 196332, 190357, 195299, 194969, 194387, 194262, 194237, 194068, 193226, 192165, 188490, 190356, 191169, 186941, 190093, 189876, 189873, 188953, 188801, 187442, 187936, 186303, 186845, 186234, 185764, 173238, 185227, 184229, 184791, 181363, 183201, 183237, 183236, 182111, 182504, 181853, 181523, 181482, 180261, 180098, 180134, 179998, 179549, 179305, 179132, 179123, 178320, 177359, 176318, 176184, 175338, 175225, 173514, 173752, 174366, 174280, 172731, 173150, 170962],
  '26618': [227082, 226288, 225724, 225183, 201358, 224050, 201357, 223133, 216723, 201356, 221179, 221036, 220991, 201355, 201354, 201353, 217564, 217529, 216326, 216096, 215864, 211365, 201343, 213092, 213040, 213002, 201342, 212074, 211901, 201341, 201340, 209719, 208949, 201339, 208607, 208582, 201338, 207309, 201336, 201332, 198568, 202199, 198567, 201534, 198566, 200088, 200071, 198565, 199242, 199200, 199085, 182850, 182849, 197336, 197286, 182848, 182847, 194068, 194067, 182839, 182838, 182837, 182836, 182835, 184493, 184457, 183570, 179975],
  '30684': [228021, 225981, 224371, 200348, 223405, 222423, 221192, 220112, 217580, 215331, 214192, 213299, 213180, 209833, 209799, 206488, 203616, 201602, 201415, 199640, 199974, 199451, 198323, 197351, 197316, 196207, 195138, 194545, 194820, 194129, 193146, 189964, 189461, 189097, 187274, 186803, 186747, 184687, 175196, 181355, 181099, 180235, 179200, 178197, 178196, 177246, 177029, 176280, 174387, 172577],
  '23371': [228062, 227883, 173322, 227312, 227186, 226072, 225805, 225734, 224827, 224596, 223555, 223465, 222385, 221294, 220211, 218977, 218842, 217622, 216454, 215376, 214314, 213295, 212135, 211078, 209767, 208945, 208638, 207701, 206692, 206577, 205591, 204662, 203768, 203699, 202723, 201690, 195344, 195299, 189493, 194387, 194237, 194086, 192218, 193803, 193018, 192165, 191169, 190816, 190754, 190093, 188953, 188801, 187986, 187936, 186845, 185764, 185673, 181933, 184825, 184791, 183237, 183236, 182504, 181523, 181482, 180367, 180261, 179549, 179365, 179305, 178361, 178320, 177359, 176318, 175338, 173514, 173231, 174366, 174280, 173335, 173150],
  '38364': [228062, 222385, 221294, 217622, 216454, 213295, 213248, 207273, 206577, 205591, 203699, 203564, 203324, 202723, 201690, 200460, 199449, 198386, 197603, 197446, 196055, 196491, 196332, 195395, 195344, 195299, 194237, 193382, 193226, 192279, 191169, 191067, 186941, 188071, 187936, 173238, 183846, 183237, 181626, 180261, 169805, 178320, 176318, 169802, 175225, 173514, 174280, 173150],
  '6123': [228062, 228007, 227997, 227071, 226072, 224596, 223465, 222863, 222385, 221294, 221135, 221133, 220211, 217622, 215376, 213295, 213190, 213034, 211078, 209767, 208638, 207701, 207609, 206577, 206485, 206474, 205954, 205591, 203699, 203543, 202723, 202577, 202572, 201690, 200460, 199449, 198086, 197446, 197219, 197220, 196332, 190357, 195344, 195299, 194969, 194387, 194237, 194068, 194067, 193013, 192165, 190356, 191169, 190093, 189876, 189873, 188953, 187936, 185764, 185674, 184791, 181482, 180098, 180134, 179549, 177359, 176318, 176184, 176181, 166080, 175338, 175225, 173514, 174280, 173150]
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

// Load Wizard World approved tournament machines
let WIZARD_WORLD_MACHINES = [];
try {
  const wizardWorldPath = path.join(process.cwd(), 'data', 'wizard-world-machines.json');
  if (fs.existsSync(wizardWorldPath)) {
    WIZARD_WORLD_MACHINES = JSON.parse(fs.readFileSync(wizardWorldPath, 'utf8'));
    console.log(`✓ Loaded ${WIZARD_WORLD_MACHINES.length} approved Wizard World machines`);
  }
} catch (err) {
  console.log('⚠️  Could not load Wizard World machines list');
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

      // Only include machines available at Wizard World
      if (WIZARD_WORLD_MACHINES.length > 0 && !WIZARD_WORLD_MACHINES.includes(machine)) {
        return;
      }

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
