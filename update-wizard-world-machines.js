const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Wizard's World location ID on Pinball Map
const WIZARD_WORLD_LOCATION_ID = 9351;

// Machines to exclude from the approved list
const EXCLUDED_MACHINES = [
  'Banzai Run',
  'Swords of Fury',
  'Shadow',
  'Whirlwind',
  'Meteor',
  'X files',
  'Black Knight',
  'Theatre of Magic',
  'Seawitch',
  'Creature from the Black Lagoon', // CFTBL (creature)
  'Orbitor 1',
  'Twilight Zone',
  'The Addams Family',
  'Williams Indiana Jones',
  'Lord of the Rings',
  'Medieval Madness'
];

async function fetchWizardWorldMachines() {
  try {
    console.log('Fetching machines from Pinball Map API...');
    console.log(`Location: Wizard's World (ID: ${WIZARD_WORLD_LOCATION_ID})\n`);

    const response = await axios.get(
      `https://pinballmap.com/api/v1/locations/${WIZARD_WORLD_LOCATION_ID}/machine_details.json`,
      {
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      }
    );

    const machines = response.data.machines || [];
    console.log(`✓ Found ${machines.length} total machines at Wizard's World\n`);

    // Extract machine names and sort them
    const machineNames = machines
      .map(m => m.name)
      .sort();

    // Filter out excluded machines
    const approvedMachines = machineNames.filter(name => {
      const isExcluded = EXCLUDED_MACHINES.some(excluded =>
        name.toLowerCase().includes(excluded.toLowerCase()) ||
        excluded.toLowerCase().includes(name.toLowerCase())
      );

      if (isExcluded) {
        console.log(`❌ Excluding: ${name}`);
      }

      return !isExcluded;
    });

    console.log(`\n✓ ${approvedMachines.length} approved machines (excluded ${machineNames.length - approvedMachines.length})\n`);

    // Save to file
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'wizard-world-machines.json');
    fs.writeFileSync(outputPath, JSON.stringify(approvedMachines, null, 2));

    console.log(`✓ Saved approved machines to: ${outputPath}`);
    console.log(`\nApproved machines list:`);
    approvedMachines.forEach((name, idx) => {
      console.log(`  ${idx + 1}. ${name}`);
    });

    return approvedMachines;

  } catch (error) {
    console.error('❌ Error fetching machines:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
fetchWizardWorldMachines();
