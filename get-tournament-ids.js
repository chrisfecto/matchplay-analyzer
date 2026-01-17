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

async function getTournamentIds(userId, email, password) {
  let browser;
  
  try {
    console.log(`\n========================================`);
    console.log(`Fetching tournament IDs for user ${userId}`);
    console.log(`========================================\n`);
    
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
    
    const playedUrl = `https://app.matchplay.events/users/${userId}/played`;
    console.log(`\n🔍 Navigating to player profile: ${playedUrl}\n`);
    await page.goto(playedUrl);
    await page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📊 Extracting tournament IDs...\n');
    const tournamentIds = await page.evaluate(() => {
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
    
    await browser.close();
    
    console.log(`✅ Found ${tournamentIds.length} tournaments!\n`);
    
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
    
    return tournamentIds;
    
  } catch (error) {
    if (browser) await browser.close();
    console.error(`\n❌ Error:`, error.message);
    process.exit(1);
  }
}

async function main() {
  console.log(`
╔════════════════════════════════════════════╗
║   Match Play Analyzer - User Setup Tool   ║
╔════════════════════════════════════════════╝
  `);
  
  // Step 1: Get Match Play credentials
  const email = await question('Enter your Match Play email: ');
  const password = await question('Enter your Match Play password: ');
  
  console.log(''); // Blank line
  
  // Step 2: Get player profile
  const profileInput = await question('Enter player profile URL or user ID: ');
  
  // Extract user ID from URL or use as-is
  const match = profileInput.match(/\/users\/(\d+)/);
  const userId = match ? match[1] : profileInput;
  
  rl.close();
  
  console.log(''); // Blank line
  
  // Run the analysis
  await getTournamentIds(userId, email, password);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
