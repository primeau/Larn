'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'src/common/larn_config.js');

const EXPECTED = {
  ENABLE_DEVMODE: false,
  FORCE_DESKTOP: false,
  FORCE_MOBILE: false,
  CF_LOCAL: false,
  ENABLE_RECORDING: true,
  ENABLE_RECORDING_REALTIME: true,
};

const src = fs.readFileSync(CONFIG_PATH, 'utf8');

let allPassed = true;
let failMessage = `***   `;

for (const [key, expected] of Object.entries(EXPECTED)) {
  const match = src.match(new RegExp(`(?:const|let)\\s+${key}\\s*=\\s*(true|false)`));
  if (!match) {
    console.error(`FAIL  ${key}: not found in config`);
    allPassed = false;
    continue;
  }
  const actual = match[1] === 'true';
  const ok = actual === expected;
  const msg = `${ok ? 'PASS' : 'FAIL'}  ${key} = ${actual}${ok ? '' : `  (expected ${expected})`}`;
  if (ok) {
    console.log(msg); 
  } else {
    failMessage += msg + '\n***   ';
    console.error(msg);
  }
  if (!ok) allPassed = false;
}

if (!allPassed) {
  console.error(`*******************************************************`);
  console.error(`*******************************************************`);
  console.error(`***                                                    `);
  console.error(`${failMessage}`);
  console.error(`*******************************************************`);
  console.error(`*******************************************************`);
}

process.exit(allPassed ? 0 : 1);
