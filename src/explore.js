'use strict';

/**
 * Maze Explorer - Frontier-based algorithm for discovering a maze with fog of war
 */

const MazeExplorer = {
  width: 67,
  height: 17,

  totalSteps: 0,
  path: [], // Array of {x, y} positions

  /**
   * Get all 8 directions (including diagonals)
   */
  getDirections: function () {
    return [
      { dx: 0, dy: -1 }, // up
      { dx: 1, dy: -1 }, // up-right
      { dx: 1, dy: 0 }, // right
      { dx: 1, dy: 1 }, // down-right
      { dx: 0, dy: 1 }, // down
      { dx: -1, dy: 1 }, // down-left
      { dx: -1, dy: 0 }, // left
      { dx: -1, dy: -1 }, // up-left
    ];
  },

  /**
   * Check if a square is blocked (wall, closed door, home entrance, or trap)
   */
  isBlocked: function (x, y) {
    if (!inBounds(x, y)) return true;
    return itemAt(x, y).matches(OWALL) || itemAt(x, y).matches(OCLOSEDDOOR) || itemAt(x, y).matches(OHOMEENTRANCE) || itemAt(x, y).isTrap();
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
   * Find nearest frontier square using BFS through known safe terrain
   * Returns {target: {x, y}, path: [{x, y}, ...]} or null if no frontier
   */
  findNearestFrontier: function () {
    const frontier = this.getFrontier();
    if (frontier.length === 0) return null;

    // BFS to find nearest frontier square
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

        // Check if moving here will discover a frontier square
        const willDiscover = this.getDirections().some((dir) => {
          return this.isFrontier(nx + dir.dx, ny + dir.dy);
        });

        if (willDiscover) {
          return {
            target: { x: nx, y: ny },
            path: newPath,
          };
        }

        queue.push({ x: nx, y: ny, path: newPath });
      }
    }

    return null;
  },

  /**
   * Execute one step of exploration
   * Returns true if moved, false if exploration complete
   */
  step: async function () {
    const nearest = this.findNearestFrontier();

    if (!nearest) {
      return false; // No more frontier - exploration complete
    }

    // Move to first step in path toward position that will discover frontier
    if (nearest.path.length > 0) {
      const nextPos = nearest.path[0];

      const monsters = nearbymonsters();
      if (!this.shouldStopForMonster(monsters)) {
        return false;
      }

      // attack nearest monster, or go for nearby item
      let fight = false;
      if (monsters.length > 0) {
        const monster = this.targetNearestMonster(monsters);
        await nap(150);
        nextPos.x = monster.x;
        nextPos.y = monster.y;
        fight = true;
      } else {
        const item = this.targetNearestItem();
        if (item) {
          await nap(300);
          nextPos.x = item.x;
          nextPos.y = item.y;
        }
      }

      // figure out keypress to get there
      const dx = nextPos.x - player.x;
      const dy = nextPos.y - player.y;
      let key = this.getKeyForDirection(dx, dy);

      const currentlevel = level; // save in case of teleportation

      // hit the key and make the move
      simulateKeypress(key);

      // trap or teleport
      if (level !== currentlevel) {
        console.log(`Level changed, stopping exploration.`);
        return false;
      }
      // teleport on same level
      if ((player.x !== nextPos.x || player.y !== nextPos.y) && !fight) {
        console.log(`did we teleport?`);
        // console.log(`did we teleport? stopping exploration.`);
        // return false;
        await nap(1000);
      }
      // too low on HP
      if (player.HP < player.HPMAX / 2) {
        console.log(`Player HP low, stopping exploration.`);
        return false;
      }
      // pick up item if present
      const item = itemAt(player.x, player.y);
      if (canTake(item) && !pocketfull() && !item.matches(OCOOKIE)) {
        simulateKeypress('t');
      }
      // auto-pray at altar if we have enough gold
      if (itemAt(player.x, player.y).matches(OALTAR)) {
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

      this.totalSteps++;
      this.path.push(nextPos);
      return true;
    }

    return false;
  },

  shouldStopForMonster: function (monsters) {
    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      if (monster.attack > 0) {
        console.log(`baddy nearby, stopping exploration.`);
        return false;
      }
    }
    return true;
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
      if (monster) {
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

  getKeyForDirection: function (dx, dy) {
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
  },

  /**
   * Run full exploration and return results
   * Returns {steps: number, path: [{x, y}, ...], discoveredCount: number}
   */
  explore: async function () {
    while (await this.step()) {
      // Keep stepping until exploration is complete
    }

    return {
      steps: this.totalSteps,
      path: this.path,
      discoveredCount: this.getDiscoveredCount(),
    };
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

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MazeExplorer;
}
