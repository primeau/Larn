import { ALLOW_ORIGIN_HEADERS, SUCCESS_RESPONSE } from './cf_tools.mjs';
import { insertHighscore } from './endpoint_highscores.mjs';

//
//
// HANDLE_ADMIN_REQUEST
//
//
export async function handleAdminRequest(env, request, path) {
  console.log(`handleAdminRequest():`, path[0], path[1]);

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    console.log(`handleApiRequest(): OPTIONS`, path);
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const adminPass = path[0];
  console.log(`handleAdminRequest(): adminPass: ${adminPass}`);

  if (adminPass != `CLOUDFLARE_ADMIN_PASSWORD`) {
    console.error(`handleAdminRequest(): adminPass rejected`);
    return new Response(`Forbidden`, { status: 403, statusText: `Forbidden`, headers: ALLOW_ORIGIN_HEADERS });
  }
  console.log(`handleAdminRequest(): adminPass accepted`);

  switch (path[1]) {
    case 'gotw': {
      console.log(`handleAdminRequest(): /gotw`);
      if (request.method === `PUT`) {
        return await handleAdminGotwPUT(env, request, path);
      }
    }
    case 'highscore': {
      console.log(`handleAdminRequest(): /highscore`);
      if (request.method === `PUT`) {
        return await handleAdminHighscorePUT(env, request, path);
      }
    }
    case 'exec':
      {
        console.log(`handleAdminRequest(): /exec`);
        if (request.method === `PUT`) {
          return await handleAdminDBExec(env, request, path);
        }
      }
      return new Response(`Method not allowed`, { status: 405, statusText: `Method not allowed`, headers: ALLOW_ORIGIN_HEADERS });
  }
}

//
//
// HANDLE_ADMIN_GOTW_PUT
//
//
async function handleAdminGotwPUT(env, request, path) {
  try {
    listAll(env, env.BUCKET_GOTW);
    // deleteAll(env, env.BUCKET_GOTW);

    const bucket = env.BUCKET_GOTW;
    if (!bucket) {
      return new Response('R2 bucket not configured', { status: 500, headers: ALLOW_ORIGIN_HEADERS });
    }
    const body = await request.json();
    const key = decodeURIComponent(body.filename);
    const file = body.state;
    console.log(`handleAdminGotwPUT(): adding file to R2`, key, file.length);
    await bucket.put(key, file);

    return new Response('OK', SUCCESS_RESPONSE);
  } catch (error) {
    console.error('Error adding file to R2:', error);
    return new Response('Internal server error', { status: 500, headers: ALLOW_ORIGIN_HEADERS });
  }
}

async function listAll(env, bucket) {
  try {
    const files = await bucket.list();

    for (const file of files.objects) {
      console.log(`listAll(): found files:`, file.key);
    }
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    return new Response('Internal server error', { status: 500, headers: ALLOW_ORIGIN_HEADERS });
  }
}

async function deleteAll(env, bucket) {
  try {
    const files = await bucket.list();

    for (const file of files.objects) {
      console.log(`deleteAll(): delete:`, file.key);
      await bucket.delete(file.key);
    }

    return new Response('All files deleted successfully', { status: 200, headers: ALLOW_ORIGIN_HEADERS });
  } catch (error) {
    console.error('Error deleting files:', error);
    return new Response('Internal server error', { status: 500, headers: ALLOW_ORIGIN_HEADERS });
  }
}

//
//
// HANDLE_ADMIN_DB_EXEC
//
//
async function handleAdminDBExec(env, request, path) {
  try {
    request = await request.json();
    const sql = decodeURIComponent(request.sql);
    console.log(`handleAdminDBExec(): SQL received: ${sql}`);
    const { success } = await env.DB.prepare(sql).run();
    console.log(`handleAdminDBExec(): SQL executed, success == ${success}`);
    return new Response('OK', SUCCESS_RESPONSE);
  } catch (error) {
    console.error('Error executing SQL:', error);
    return new Response('Internal server error', { status: 500, headers: ALLOW_ORIGIN_HEADERS });
  }
}

//
//
// HANDLE_ADMIN_HIGH_SCORE_PUT
//
//
async function handleAdminHighscorePUT(env, request, path) {
  try {
    let tablename = path[2];
    let score = await request.json();
    const { success } =  await insertHighscore(env, tablename, score);
    return new Response(success, SUCCESS_RESPONSE);
  } catch (error) {
    console.error('Error updating high score:', error);
    return new Response('Internal server error', { status: 500, headers: ALLOW_ORIGIN_HEADERS });
  }
}
