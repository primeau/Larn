'use strict';

let currentWebSocket = null;
let username = `username_not_set`;
let roomname = `roomname_not_set`;

let numWatchers = 0;



function initCloudFlare(user, room, messageReceivedCallback) {
  if (!ENABLE_RECORDING_REALTIME) return;

  if (!navigator.onLine) {
    console.error(`initCloudFlare(): offline`);
    return;
  };

  username = user;
  roomname = room;
  console.log(`initCloudFlare():`, username, roomname);

  join(messageReceivedCallback);
}



function join(messageReceivedCallback) {
  const wss = document.location.protocol === "http:" ? "ws://" : "wss://";
  console.log(`cloudflare join`, roomname);
  let ws = new WebSocket(wss + CF_BROADCAST_HOST + "/api/game/" + roomname + "/websocket");
  let rejoined = false;
  let startTime = Date.now();

  let rejoin = async () => {
    if (!rejoined) {
      rejoined = true;
      currentWebSocket = null;

      // Don't try to reconnect too rapidly.
      let timeSinceLastJoin = Date.now() - startTime;
      if (timeSinceLastJoin < 10000) {
        // Less than 10 seconds elapsed since last join. Pause a bit.
        await new Promise(resolve => setTimeout(resolve, 10000 - timeSinceLastJoin));
      }

      // OK, reconnect now!
      try {
        join(messageReceivedCallback);
      } catch (error) {
        console.error(`ws join`, error);
      }
    }
  }

  ws.addEventListener("open", event => {
    currentWebSocket = ws;
    console.log(`cloudflare open`);
    try {
      ws.send(JSON.stringify({ name: username, gameID: roomname }));
    } catch (error) {
      console.error(`ws open`, error);
    }
  });
  ws.addEventListener("close", event => {
    console.log(`cloudflare close`);
    console.log("WebSocket closed, reconnecting:", event.code, event.reason);
    rejoin();
  });
  ws.addEventListener("error", event => {
    console.error("WebSocket error, reconnecting:", event);
    rejoin();
  });

  ws.addEventListener("message", event => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      console.error(`ws message`, event, error);
      return;
    }

    if (data.ready) {
      console.log(`cloudflare ready`, data.ready);
    }
    // if (data.ip) {
    // console.log(`cloudflare ip`, data.ip);
    // setIP(data.ip); // different functions called for Larn and LarnTV
    // }
    if (data.joined) {
      if (data.joined !== roomname) {
        console.log(`cloudflare ${data.joined} joined ${numWatchers} watchers`);
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
      if (data.quit !== roomname) {
        console.log(`cloudflare ${data.quit} quit ${numWatchers} watchers`);
      }
    }
    if (data.error) {
      console.error(`data error`, data.error);
    }

    if (messageReceivedCallback) messageReceivedCallback(data);

  });
}



async function writeGameData(metadata, game) {

  let returnWatchCount = fetch(`${CF_BROADCAST_PROTOCOL}${CF_BROADCAST_HOST}/api/gamelist/${game}`, {
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



function sendLiveFrame(data, compress) {
  if (currentWebSocket) {
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
  currentWebSocket.send(JSON.stringify({ message: dataToSend }));
}
