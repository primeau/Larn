'use strict';

let currentWebSocket;
let messageReceivedCallback;
let username = `username_not_set`;
let roomname = `roomname_not_set`;
let numWatchers = 0;



function initCloudFlare(user, room, callback) {
  if (!ENABLE_RECORDING_REALTIME) return;
  if (!navigator.onLine) {
    console.error(`initCloudFlare(): offline`);
    return;
  };

  console.log(`initCloudFlare():`, user, room);

  username = user;
  roomname = room;
  messageReceivedCallback = callback;

  join();
}



function closeCloudflare() {
  if (currentWebSocket) {
    console.log(`closing cloudflare`, roomname);
    currentWebSocket.removeEventListener(`open`, wsOpenEvent);
    currentWebSocket.removeEventListener(`close`, wsCloseEvent);
    currentWebSocket.removeEventListener(`error`, wsErrorEvent);
    currentWebSocket.removeEventListener(`message`, wsMessageEvent);
    currentWebSocket.close();
    currentWebSocket = null;
  }
}



function join() {
  closeCloudflare(); // clean up old connection if there is one

  const wss = document.location.protocol === "http:" ? "ws://" : "wss://";
  currentWebSocket = new WebSocket(wss + CF_BROADCAST_HOST + "/api/game/" + roomname + "/websocket");

  currentWebSocket.addEventListener("open", wsOpenEvent);
  currentWebSocket.addEventListener("close", wsCloseEvent);
  currentWebSocket.addEventListener("error", wsErrorEvent);
  currentWebSocket.addEventListener("message", wsMessageEvent);
}



let lastJoinTime = 0;
async function rejoin() {
  // Don't try to reconnect too rapidly.
  let timeSinceLastJoin = Date.now() - lastJoinTime;
  if (timeSinceLastJoin < 10000) {
    console.log(`cloudflare rejoin waiting`, (10000 - timeSinceLastJoin) / 1000);
    await new Promise(resolve => setTimeout(resolve, 10000 - timeSinceLastJoin));
  }

  try {
    join();
    lastJoinTime = Date.now();
  } catch (error) {
    console.error(`ws join error`, error);
  }
}



function wsOpenEvent(event) {
  try {
    currentWebSocket.send(JSON.stringify({ name: username, gameID: roomname }));
  } catch (error) {
    console.error(`wsOpenEvent`, error);
  }
}

function wsCloseEvent(event) {
  console.log("wsCloseEvent reconnecting:", event.code, event.reason);
  rejoin();
}

function wsErrorEvent(event) {
  console.error("wsErrorEvent reconnecting:", event);
  rejoin();
}

function wsMessageEvent(event) {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (error) {
    console.error(`wsMessageEvent`, event, error);
    return;
  }

  if (data.ready) {
    // console.log(`cloudflare ready`, data.ready);
  }
  if (data.joined) {
    if (data.joined !== roomname) {
      console.log(`cloudflare ${data.joined} joined`);
      doRollbar(ROLLBAR_DEBUG, `realtime watcher`, data.joined);
    }
  }
  if (data.message) {
    // console.log(`message`, data);
    // Larn doesn't do anything with messages
    // LarnTV handles them in the messageReceivedCallback (bltLiveFrame)
    // TODO: split this handling into a callback for larn, tv
  }
  if (data.quit) {
    console.log(`cloudflare ${data.quit} quit`);
  }
  if (data.error) {
    console.error(`data error`, data.error);
  }

  try {
    if (messageReceivedCallback) messageReceivedCallback(data);
  } catch (error) {
    console.error(`messageReceivedCallback()`, error);
  }

}



async function writeGameData(metadata, gameID) {

  let returnWatchCount = fetch(`${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/api/gamelist/${gameID}`, {
    method: "POST",
    body: JSON.stringify({ metadata }),
    headers: { "content-type": "text/plain;charset=UTF-8" },
  })
    .then(async function (response) {
      try {
        let responseText = await response.text();
        let j = JSON.parse(responseText);
        setIP(j.ip); // todo this should probably be processed elsewhere
        return j.watchers;
      } catch (error) {
        console.error(`writegamedataInner()`, error);
        return 0;
      }
    })
    .catch(error => {
      console.error(`writeGameData():`, error);
      return 0;
    });

  return returnWatchCount;
}



async function sendLiveFrame(data, compress) {
  if (currentWebSocket) {
    if (!currentWebSocket.readyState) {
      // this gets called for the first time right after initCloudflare, 
      // and the websocket might not be open yet
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    let uncompressed = JSON.stringify(data);
    // WORKER STEP 1 - liveFrameCompressionWorker
    if (compress && liveFrameCompressionWorker) {
      liveFrameCompressionWorker.postMessage([`0`, uncompressed, `UTF16`, `live`]);
    } else {
      // send it anyways, game metadata doesn't need compression
      liveFrameCompressionCallback([`0`, uncompressed]);
    }
  }
}



// WORKER STEP 3 - liveFrameCompressionWorker
function liveFrameCompressionCallback(event) {
  let id = event.data[0];
  let dataToSend = event.data[1];
  let dataString = JSON.stringify({ message: dataToSend });
  if (currentWebSocket.readyState) {
    currentWebSocket.send(dataString);
  }
  else {
    console.log(`websocket not ready`);
  }
}
