'use strict';

export const ALLOW_ORIGIN_HEADERS = { 'Access-Control-Allow-Origin': '*' };
export const SUCCESS_RESPONSE = { status: 200, statusText: 'OK', headers: ALLOW_ORIGIN_HEADERS };
import { CF_IP_TRACKER_TABLE } from './cf_config.mjs';

export function compareArrays(a1, a2) {
  if (!a1 && !a2) return true;
  return a1 && a2 && a1.length == a2.length && a1.every((v, i) => v === a2[i]);
}

export function getPlayerIP(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || request.headers.get('X-Real-IP') || '0';
}

export function getGotwFilename(gamename) {
  let date = new Date();
  const year = date.getUTCFullYear();
  return `${year}/${gamename}_${getGotwLabel(date)}.json`.toLocaleLowerCase();
}

export function getGotwLabel(date) {
  const weekNumber = getISOWeek(date);
  const year = date.getUTCFullYear();
  return `${year}_${weekNumber}`;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

// will probably need to figure out how to block ranges of IPs later
const bannedIPs = [
  // '::1', // localhost
  // '127.0.0.1', // localhost
];

export async function permissionCheck(env, ip) {
  try {
    // check banned IPs
    if (bannedIPs.includes(ip)) {
      console.log(`permissionCheck(): BLOCK ${ip}`);
      return false;
    }

    // ip isn't banned, so update or insert
    const result = await env.DB.prepare(`SELECT * FROM ${CF_IP_TRACKER_TABLE} WHERE ip = ?`).bind(ip).first();
    if (result) {
      await env.DB.prepare(`UPDATE ${CF_IP_TRACKER_TABLE} SET numRequests = numRequests + 1, lastSeen = ? WHERE ip = ?`).bind(Date.now(), ip).run();
    } else {
      await env.DB.prepare(`INSERT INTO ${CF_IP_TRACKER_TABLE} (ip, numRequests, lastSeen) VALUES (?, 1, ?)`).bind(ip, Date.now()).run();
    }
  } catch (err) {
    console.error(`permissionCheck(): error for ${ip}:`, err);
  }

  // default allow
  return true;
}

//
//
// INIT_IP_TRACKER_TABLE
//
//
export async function initIpTrackerTable(env) {
  console.log(`initIpTrackerTable(): creating ${CF_IP_TRACKER_TABLE} table`);
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS ${CF_IP_TRACKER_TABLE} (\
        ip TEXT, \
        numRequests INTEGER, \
        lastSeen INTEGER);`
  ).run();
}
