'use strict';

// The MazeExplorer that is currently running.
let activeExplorer = null;
// Flag for if the player has been hit while exploring
let exploreHitflag = 0;
// Number of manual player inputs since the start of the last auto-explore
let playerInputCount = 0;
// Async function to be run after autoexplore blocking callback
let explorerCallback = null;

/**
 * Maze Explorer - Frontier-based algorithm for discovering a maze with fog of war
 */

const MazeExplorer = {
  width: 67,
  height: 17,

  allowFight: false,
  allowPickup: false,
  allowPray: false,
  monstersBlockDestination: true,
  stopOnTeleport: true,
  stopOnHit: true,
  stopOnLowHP: false,

  totalSteps: 0,
  path: [], // Array of {x, y} positions

  /**
   * Get all 8 directions (including diagonals)
   */
  getDirections: function () {
    return [
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 }, // down
      { dx: -1, dy: -1 }, // up-left
      { dx: 1, dy: -1 }, // up-right
      { dx: -1, dy: 1 }, // down-left
      { dx: 1, dy: 1 }, // down-right
    ];
  },

  /**
   * Check if a square has been discovered
   */
  isDiscovered: function (x, y) {
    if (!inBounds(x, y)) return false;
    return getKnow(x, y) !== KNOWNOT;
  },

  /**
   * Check if a square is on the frontier (undiscovered but adjacent to discovered non-wall)
   */
  isFrontier: function (x, y) {
    if (!inBounds(x, y)) return false;
    if (this.isDiscovered(x, y)) return false;

    // Check if any neighbor is discovered and non-wall
    const directions = this.getDirections();
    for (const { dx, dy } of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      if (this.isDiscovered(nx, ny) && !this.isBlocked(nx, ny)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Get all frontier squares
   */
  getFrontier: function () {
    const frontier = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.isFrontier(x, y)) {
          frontier.push({ x, y });
        }
      }
    }
    return frontier;
  },

  /**
   * Find the shortest path to a square matching the given destination criteria
   * using BFS through known safe terrain
   * Returns {target: {x, y}, path: [{x, y}, ...]} or null if path not found
   */
  findPath: function () {
    // If we're already at a destination, return an empty path
    if (this.isDestination(player.x, player.y)) {
      return [];
    }

    // Breadth-first search
    const queue = [{ x: player.x, y: player.y, path: [] }];
    const visited = new Set([`${player.x},${player.y}`]);

    while (queue.length > 0) {
      const current = queue.shift();
      const directions = this.getDirections();

      for (const { dx, dy } of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const k = `${nx},${ny}`;

        if (!inBounds(nx, ny) || visited.has(k)) continue;
        if (this.isBlocked(nx, ny)) continue;
        if (!this.isDiscovered(nx, ny)) continue; // Only move through discovered terrain

        visited.add(k);
        const newPath = [...current.path, { x: nx, y: ny }];

        // If this is a valid destination, return the path we found
        if (this.isDestination(nx, ny)) {
          // Skip if monsters are configured to block the destination
          // Note: invisible monsters obscure the destination tile under them,
          // so they DO block it (we don't want to give away what tile it is)
          if (this.monstersBlockDestination && monsterAt(nx, ny)) continue;
          return newPath;
        }

        queue.push({ x: nx, y: ny, path: newPath });
      }
    }

    return null;
  },

  /**
   * Check if moving here will discover a frontier square
   */
  willDiscover: function (x, y) {
    return this.getDirections().some((dir) => {
      return this.isFrontier(x + dir.dx, y + dir.dy);
    });
  },

  /**
   * Execute one step of exploration
   * Returns true if moved, false if exploration complete
   */
  step: async function () {
    const path = this.findPath();

    if (!path) {
      return false; // Path not found; quit
    }

    // Move to first step in path toward destination
    if (path.length > 0) {
      const nextPos = path[0];

      // Stop if a seen monster is next to the player or the next step along the path
      const monsters = this.monstersAdjacentTo(player.x, player.y);
      const monstersAhead = this.monstersAdjacentTo(nextPos.x, nextPos.y);
      for (const monster of monsters + monstersAhead) {
        if (this.shouldStopForMonster(monster)) {
          console.log(`baddy nearby, stopping exploration.`);
          updateLog(`  Travel interrupted!`);
          paint();
          return false;
        }
      }

      // attack nearest monster, or go for nearby item
      let fight = false;
      if (monsters.length > 0) {
        const monster = this.targetNearestMonster(monsters);
        await nap(150);
        nextPos.x = monster.x;
        nextPos.y = monster.y;
        fight = true;
      } else if (this.allowPickup) {
        const item = this.targetNearestItem();
        if (item) {
          await nap(150);
          nextPos.x = item.x;
          nextPos.y = item.y;
        }
      }

      // figure out keypress to get there
      const dx = nextPos.x - player.x;
      const dy = nextPos.y - player.y;
      let key = getKeyForDirection(dx, dy);

      const currentlevel = level; // save in case of teleportation

      // hit the key and make the move
      simulateKeypress(key);
      this.totalSteps++;

      // trapdoor, teleport, or home entrance
      if (level !== currentlevel) {
        console.log(`Level changed, stopping exploration.`);
        return false;
      }
      // teleport on same level, or unintentionally hit an unseen monster
      if ((player.x !== nextPos.x || player.y !== nextPos.y) && !fight) {
        if (this.stopOnTeleport) {
          console.log(`Position changed unexpectedly, stopping exploration.`);
          return false;
        } else {
          console.log(`Position changed unexpectedly.`);
          await nap(1000);
        }
      }
      if (this.stopOnHit && exploreHitflag == 1) {
        console.log(`Player hit, stopping exploration.`);
        return false;
      }
      exploreHitflag = false;
      // too low on HP
      if (this.stopOnLowHP && player.HP < player.HPMAX / 2) {
        console.log(`Player HP low, stopping exploration.`);
        return false;
      }
      // pick up item if present
      const item = itemAt(player.x, player.y);
      if (this.allowPickup && canTake(item) && !pocketfull() && !item.matches(OCOOKIE)) {
        simulateKeypress('t');
      }
      // auto-pray at altar if we have enough gold
      if (this.allowPray && itemAt(player.x, player.y).matches(OALTAR)) {
        if (player.GOLD >= 50) {
          autoPray();
        } else {
          simulateKeypress('p');
          simulateKeypress('0');
          simulateKeypress(ENTER);
        }
      }

      // stop to admire the view
      await nap(10);

      this.path.push(nextPos);
      return true;
    }

    return false;
  },

  // Return seen monsters adjacent to the given coordinates
  monstersAdjacentTo: function (x, y) {
    const monsters = [];
    for (let tmpx = vx(x - 1); tmpx <= vx(x + 1); tmpx++) {
      for (let tmpy = vy(y - 1); tmpy <= vy(y + 1); tmpy++) {
        const monster = monsterAt(tmpx, tmpy);
        if (monster && canSeeMonster(monster) && getKnow(x, y) & KNOWHERE) {
          monsters.push(monster);
        }
      }
    }
    return monsters;
  },

  shouldStopForMonster: function (monster) {
    // return (!this.allowFight || monster.attack > 0) && (player.AGGRAVATE || !player.STEALTH || monster.awake); // too aggro - fights when stealthy but !allowfight
    return !this.allowFight || monster.attack > 0;
  },

  targetNearestMonster: function (monsters) {
    let x, y;
    console.log(`${monsters.length} monster(s) nearby, looking for attack direction`);
    for (let k = rnd(8), i = -8; i < 0; i++, k++) /* choose direction, then try all */ {
      if (k > 8) k = 1; /* wraparound the diroff arrays */
      x = player.x + diroffx[k];
      y = player.y + diroffy[k];
      if (!inBounds(x, y)) continue;
      const monster = monsterAt(x, y);
      if (monster && canSeeMonster(monster)) {
        if (monster.matches(BAT) && i == 0 && monsters.length > 1) {
          console.log(`skipping bat`);
          continue; // leave the first bat for later
        }
        return { x, y };
      }
    }
  },

  targetNearestItem: function () {
    let x, y;
    for (let k = rnd(8), i = -8; i < 0; i++, k++) /* choose direction, then try all */ {
      if (k > 8) k = 1; /* wraparound the diroff arrays */
      x = player.x + diroffx[k];
      y = player.y + diroffy[k];
      if (!inBounds(x, y)) continue;
      const item = itemAt(x, y);
      if ((canTake(item) && !pocketfull() && !item.matches(OCOOKIE)) || item.matches(OGOLDPILE)) {
        console.log(`item nearby, going to get it`);
        return { x, y };
      }
    }
    return null;
  },

  /**
   * Explore until complete or interrupted.
   * Returns {success: bool, interrupted: bool, steps: number, path: [{x, y}, ...], discoveredCount: number}
   */
  explore: async function () {
    activeExplorer = this;
    exploreHitflag = false;
    playerInputCount = 0;

    while (activeExplorer == this && playerInputCount == 0 && (await this.step())) {
      // Keep stepping until exploration is complete or interrupted
    }

    const result = {
      success: this.isDestination(player.x, player.y),
      interrupted: activeExplorer != this || playerInputCount != 0,
      steps: this.totalSteps,
      path: this.path,
      discoveredCount: this.getDiscoveredCount(),
    };

    if (activeExplorer == this) {
      activeExplorer = null;
    }

    return result;
  },

  /**
   * Does the given item match of the items in the given array?
   */
  matchesAny: function (item, items) {
    return items.some((exact) => item.matches(exact));
  },

  /**
   * Is our hero prohibited from entering this tile while exploring?
   */
  isBlocked: function (x, y) {
    if (!inBounds(x, y)) {
      return true;
    }
    const item = itemAt(x, y);
    return !this.isDestination(x, y) && (
      (!player.WTW && this.matchesAny(item, [OWALL, OCLOSEDDOOR])) ||
      (!this.allowPray && item.matches(OALTAR)) ||
      item.matches(OHOMEENTRANCE) ||
      item.isTrap()
    );
  },

  /**
   * Set up MazeExplorer to automatically explore the current level
   */
  setupExplore: function () {
    this.allowFight = true;
    this.allowPickup = true;
    this.allowPray = true;
    this.stopOnTeleport = false;
    this.stopOnHit = false;
    this.stopOnLowHP = true;
    this.monstersBlockDestination = false;
    this.isDestination = (x, y) => this.willDiscover(x, y);
  },

  /**
   * Set up MazeExplorer to travel to the nearest instance of any of the given items
   */
  setupTravelToItem: function (items) {
    this.isDestination = (x, y) => this.matchesAny(itemAt(x, y), items);
  },

  /**
   * Set up MazeExplorer to travel to the given coordinates
   */
  setupTravelToPoint: function (destX, destY) {
    this.monstersBlockDestination = false;
    this.isDestination = (x, y) => x === destX && y === destY;
  },

  /**
   * Get count of discovered squares
   */
  getDiscoveredCount: function () {
    let count = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.isDiscovered(x, y)) {
          count++;
        }
      }
    }
    return count;
  },

  /**
   * Get exploration statistics
   */
  getStats: function () {
    const totalSquares = this.width * this.height;
    const totalWalls = Array.from({ length: this.height }, (_, y) => Array.from({ length: this.width }, (_, x) => this.isBlocked(x, y)))
      .flat()
      .filter(Boolean).length;

    const totalAccessible = totalSquares - totalWalls;

    let discoveredNonWalls = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.isDiscovered(x, y) && !this.isBlocked(x, y)) {
          discoveredNonWalls++;
        }
      }
    }

    return {
      totalSteps: this.totalSteps,
      discoveredCount: this.getDiscoveredCount(),
      discoveredNonWalls: discoveredNonWalls,
      totalSquares: totalSquares,
      totalAccessible: totalAccessible,
      coverage: discoveredNonWalls / totalAccessible,
      pathLength: this.path.length,
    };
  },
};

function getKeyForDirection(dx, dy) {
  let key = '.';
  if (dx === 0 && dy === 1) key = 'down';
  else if (dx === 1 && dy === 0) key = 'right';
  else if (dx === 0 && dy === -1) key = 'up';
  else if (dx === -1 && dy === 0) key = 'left';
  else if (dx === 1 && dy === -1) key = 'pageup';
  else if (dx === -1 && dy === -1) key = 'home';
  else if (dx === 1 && dy === 1) key = 'pagedown';
  else if (dx === -1 && dy === 1) key = 'end';
  return key;
}

/**
 * Returns each item whose symbol matches the given key press.
 */
function parseItemsBySymbol(key) {
  return itemlist.filter(
    (candidate) => (
      original_objects ? (ULARN ? candidate.ularnchar : candidate.char) : candidate.hackchar
    ) == key
  );
}

function parseTravelToItem(key) {
  if (key === `<`) key = `&lt`;
  if (key === `>`) key = `&gt`;
  if (key == ESC) {
    appendLog(` cancelled${period}`);
  } else {
    const items = parseItemsBySymbol(key);
    echo(key);
    if (items.length > 0) {
      const explorer = Object.create(MazeExplorer);
      explorer.setupTravelToItem(items);
      explorerCallback = autotravelCallback.bind(null, explorer);
    } else {
      updateLog(`  Unknown object${period}`);
    }
  }
  return 1;
}

async function autotravelCallback(explorer) {
  const result = await explorer.explore();
  if (result.steps == 0 && !result.interrupted) {
    if (result.success) {
      // If the player is already at the destination, look at the tile to make this clearer
      lookforobject(true, false);
    } else {
      updateLog(`  No path found${period}`);
    }
    paint();
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MazeExplorer;
}
