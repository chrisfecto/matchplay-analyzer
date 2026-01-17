const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getTournamentIds(userId, page) {
  try {
    console.log(`\n========================================`);
    console.log(`Fetching tournament IDs for user ${userId}`);
    console.log(`========================================\n`);
    
    const playedUrl = `https://app.matchplay.events/users/${userId}/played`;
    console.log(`\n🔍 Navigating to player profile: ${playedUrl}\n`);

    try {
      await page.goto(playedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (error) {
      console.log('⚠️  Initial navigation failed, trying alternative approach...');
      // Try navigating to base user profile first
      await page.goto(`https://app.matchplay.events/users/${userId}`, { waitUntil: 'domcontentloaded' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Then click on the "played" tab if it exists
      const playedTab = await page.$('a[href*="/played"]');
      if (playedTab) {
        await playedTab.click();
      } else {
        throw new Error('Could not access played tournaments page');
      }
    }

    await page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📊 Extracting tournament IDs from all pages...\n');

    const allTournamentIds = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`   Page ${currentPage}...`);

      // Extract tournament IDs from current page
      const pageIds = await page.evaluate(() => {
        const tournaments = [];
        const links = document.querySelectorAll('a[href^="/tournaments/"]');

        links.forEach(link => {
          const href = link.getAttribute('href');
          const match = href.match(/^\/tournaments\/(\d+)/);
          if (match) {
            const id = parseInt(match[1]);
            if (!tournaments.includes(id)) {
              tournaments.push(id);
            }
          }
        });

        return tournaments;
      });

      // Add to our collection
      pageIds.forEach(id => {
        if (!allTournamentIds.includes(id)) {
          allTournamentIds.push(id);
        }
      });

      // Check if there's a next page button
      const nextButton = await page.$('button:has-text("Next")');

      if (nextButton) {
        const isDisabled = await nextButton.isDisabled();

        if (!isDisabled) {
          console.log('   Found next page button, clicking...');
          await nextButton.click();
          await page.waitForLoadState('networkidle');
          await new Promise(resolve => setTimeout(resolve, 2000));
          currentPage++;
        } else {
          console.log('   Next button is disabled - reached last page.');
          hasMorePages = false;
        }
      } else {
        console.log('   No next button found.');
        hasMorePages = false;
      }
    }

    console.log(`✅ Found ${allTournamentIds.length} tournaments!\n`);

    // Filter to 2025 tournaments only via API
    console.log(`📅 Filtering to 2025 tournaments only...\n`);
    const axios = require('axios');
    const https = require('https');

    const axiosConfig = {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    };

    const filtered2025 = [];
    let checkedCount = 0;

    for (const tournamentId of allTournamentIds) {
      try {
        const response = await axios.get(`https://app.matchplay.events/api/tournaments/${tournamentId}`, axiosConfig);

        // The API wraps the response in a 'data' object
        const tournament = response.data.data || response.data;

        // Debug first tournament to see structure
        if (checkedCount === 0) {
          console.log(`   Debug - Response keys: ${Object.keys(tournament).join(', ')}`);
          console.log(`   Debug - Sample tournament data:`, JSON.stringify(tournament).substring(0, 200));
        }

        // Try different date field names (startUtc is the correct one)
        const dateField = tournament.startUtc || tournament.started || tournament.start_time || tournament.startTime || tournament.created_at || tournament.start;

        if (dateField) {
          const startDate = new Date(dateField);
          const year = startDate.getFullYear();

          // Debug first tournament date
          if (checkedCount === 0) {
            console.log(`   Debug - Date field: ${dateField} -> Year: ${year}`);
          }

          if (year === 2025) {
            filtered2025.push(tournamentId);
          }
        } else if (checkedCount === 0) {
          console.log(`   Debug - No date field found in tournament data`);
        }

        checkedCount++;
        // Show progress every 50 tournaments
        if (checkedCount % 50 === 0) {
          console.log(`   Checked ${checkedCount}/${allTournamentIds.length} tournaments... (Found ${filtered2025.length} from 2025)`);
        }
      } catch (err) {
        if (checkedCount === 0) {
          console.log(`   Debug - API Error: ${err.message}`);
        }
        checkedCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const tournamentIds = filtered2025;
    console.log(`✅ Filtered to ${tournamentIds.length} tournaments from 2025!\n`);

    // Scrape arena names from tournaments
    console.log(`🎰 Scraping machine names from tournaments...\n`);
    const arenaMap = {};
    let scrapedCount = 0;

    for (const tournamentId of tournamentIds) {
      try {
        const arenaUrl = `https://app.matchplay.events/tournaments/${tournamentId}/arenas`;
        await page.goto(arenaUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const tournamentArenas = await page.evaluate(() => {
          const arenas = {};
          const links = document.querySelectorAll('a[href*="/arenas/"]');

          links.forEach(link => {
            const href = link.getAttribute('href');
            const name = link.textContent.trim();
            const match = href.match(/\/arenas\/(\d+)/);

            if (match && name && name.length > 0 && name.length < 100) {
              const arenaId = parseInt(match[1]);
              arenas[arenaId] = name;
            }
          });

          return arenas;
        });

        Object.assign(arenaMap, tournamentArenas);
        scrapedCount++;

        if (scrapedCount % 10 === 0 || scrapedCount === 1) {
          console.log(`   Scraped ${scrapedCount}/${tournamentIds.length} tournaments (${Object.keys(arenaMap).length} unique machines)...`);
        }
      } catch (err) {
        console.log(`   ⚠️  Failed to scrape tournament ${tournamentId}`);
      }
    }

    console.log(`\n✅ Found ${Object.keys(arenaMap).length} unique machines for user ${userId}!\n`);

    // Automatically update the analyze.js file
    const analyzeFilePath = path.join(__dirname, 'pages', 'api', 'analyze.js');
    
    if (!fs.existsSync(analyzeFilePath)) {
      console.log('❌ Could not find pages/api/analyze.js');
      console.log(`\n📋 Manually add this to KNOWN_TOURNAMENT_IDS:`);
      console.log(`'${userId}': [${tournamentIds.join(', ')}]`);
      return;
    }
    
    let fileContent = fs.readFileSync(analyzeFilePath, 'utf8');
    
    // Check if user already exists
    const userPattern = new RegExp(`'${userId}':\\s*\\[[^\\]]*\\]`);
    
    if (userPattern.test(fileContent)) {
      console.log(`♻️  User ${userId} already exists. Updating tournament list...\n`);
      fileContent = fileContent.replace(
        userPattern,
        `'${userId}': [${tournamentIds.join(', ')}]`
      );
    } else {
      console.log(`➕ Adding user ${userId} to KNOWN_TOURNAMENT_IDS...\n`);
      const knownTournamentsPattern = /(const KNOWN_TOURNAMENT_IDS = \{[^}]*)(}\;)/s;
      fileContent = fileContent.replace(
        knownTournamentsPattern,
        `$1,
  '${userId}': [${tournamentIds.join(', ')}]
$2`
      );
    }
    
    fs.writeFileSync(analyzeFilePath, fileContent, 'utf8');
    
    console.log(`========================================`);
    console.log(`✅ SUCCESS!`);
    console.log(`========================================`);
    console.log(`User ${userId} configured successfully!`);
    console.log(`Total tournaments: ${tournamentIds.length}`);
    console.log(`\n🚀 User ${userId} can now be analyzed in the app.`);
    console.log(`========================================\n`);

    return { tournamentIds, arenaMap };

  } catch (error) {
    console.error(`\n❌ Error for user ${userId}:`, error.message);
    throw error;
  }
}

async function main() {
  let browser;

  try {
    console.log(`
╔════════════════════════════════════════════╗
║   Match Play Analyzer - User Setup Tool   ║
╔════════════════════════════════════════════╝
  `);

    // Step 1: Get Match Play credentials
    const email = await question('Enter your Match Play email: ');
    const password = await question('Enter your Match Play password: ');

    console.log(''); // Blank line

    // Step 2: Get player profiles (support multiple, comma-separated)
    const profileInput = await question('Enter player profile URL(s) or user ID(s) (comma-separated for multiple): ');

    // Parse input - could be URLs or IDs, comma-separated
    const inputs = profileInput.split(',').map(s => s.trim()).filter(s => s);
    const userIds = inputs.map(input => {
      const match = input.match(/\/users\/(\d+)/);
      return match ? match[1] : input;
    });

    rl.close();

    console.log(''); // Blank line

    // Launch browser and login once
    console.log('🚀 Launching browser...\n');
    browser = await chromium.launch({
      headless: false
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('🔐 Navigating to Match Play login...');
    await page.goto('https://app.matchplay.events/login');
    await page.waitForLoadState('networkidle');

    console.log('📝 Filling in login credentials...');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    console.log('✅ Logging in...');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✓ Login successful!\n');

    // Run the analysis for each user sequentially using the same browser session
    console.log(`Processing ${userIds.length} user(s)...\n`);

    const results = [];
    const allArenaData = {};

    for (const userId of userIds) {
      try {
        const { tournamentIds, arenaMap } = await getTournamentIds(userId, page);
        results.push({ status: 'fulfilled', value: tournamentIds });
        Object.assign(allArenaData, arenaMap);
      } catch (error) {
        results.push({ status: 'rejected', reason: error });
      }
    }

    // Save all arena data to JSON file
    console.log(`\n💾 Saving arena names to data/arena-names.json...\n`);
    const arenaMapPath = path.join(__dirname, 'data', 'arena-names.json');
    const dataDir = path.join(__dirname, 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let existingArenaMap = {};
    if (fs.existsSync(arenaMapPath)) {
      existingArenaMap = JSON.parse(fs.readFileSync(arenaMapPath, 'utf8'));
    }

    // Merge with existing data
    const mergedArenaMap = { ...existingArenaMap, ...allArenaData };
    fs.writeFileSync(arenaMapPath, JSON.stringify(mergedArenaMap, null, 2), 'utf8');

    console.log(`✓ Saved ${Object.keys(mergedArenaMap).length} total arena names!\n`);

    await browser.close();

    console.log(`\n${'='.repeat(50)}`);
    console.log(`ALL USERS PROCESSED`);
    console.log(`${'='.repeat(50)}`);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ User ${userIds[index]}: ${result.value.length} tournaments`);
      } else {
        console.log(`❌ User ${userIds[index]}: Failed - ${result.reason?.message || 'Unknown error'}`);
      }
    });

    console.log(`${'='.repeat(50)}\n`);

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
