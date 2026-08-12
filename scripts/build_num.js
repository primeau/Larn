'use strict';

/*
Read the current BUILD value from larn_config.js.
- --get: get current BUILD and print export command for shell eval
- --bump: increment BUILD in file and print export command for shell eval
*/

const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '..', 'src', 'common', 'larn_config.js');

function nextBuild(build) {
  if (/^\d+$/.test(build)) {
    return `${build}a`;
  }

  const match = /^(.*?)([a-z]+)$/.exec(build);
  if (!match) {
    return `${build}a`;
  }

  const [, prefix, suffix] = match;
  const chars = suffix.split('');
  let carry = true;

  for (let i = chars.length - 1; i >= 0; i -= 1) {
    if (chars[i] === 'z') {
      chars[i] = 'a';
      continue;
    }

    chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
    carry = false;
    break;
  }

  if (carry) {
    return `${prefix}a${chars.join('')}`;
  }

  return `${prefix}${chars.join('')}`;
}

function parseBuildFromConfig(content) {
  const re = /(const\s+BUILD\s*=\s*['"])([^'"]+)(['"]\s*;)/;
  const match = content.match(re);

  if (!match) {
    throw new Error('Could not find BUILD constant in larn_config.js');
  }

  return {
    build: match[2],
    regex: re,
  };
}

function getFlag() {
  const flag = process.argv[2];
  if (!flag) {
    throw new Error('Missing required flag. Use --get or --bump.');
  }
  if (flag !== '--get' && flag !== '--bump') {
    throw new Error(`Invalid flag: ${flag}. Use --get or --bump.`);
  }
  return flag;
}

function main() {
  const flag = getFlag();
  const original = fs.readFileSync(configPath, 'utf8');
  const { build: currentBuild, regex } = parseBuildFromConfig(original);

  if (flag === '--get') {
    console.log(currentBuild);
    console.log(`export BUILD="${currentBuild}"`);
    return;
  }

  const newBuild = nextBuild(currentBuild);
  const updated = original.replace(regex, `$1${newBuild}$3`);
  fs.writeFileSync(configPath, updated, 'utf8');
  console.log(`export BUILD="${newBuild}"`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = {
  nextBuild,
  parseBuildFromConfig,
  getFlag,
};
