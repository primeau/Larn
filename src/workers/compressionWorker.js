'use strict';

importScripts('../lib/lz-string.min.js');

// WORKER STEP 2 - do compression
onmessage = function (event) {
    let id = event.data[0];
    let uncompressed = event.data[1];
    let algo = event.data[2];
    let source = event.data[3] || `none`;
    let metadata = event.data[4] || null;
    // console.log(`${source}:${id} worker.compress: start size`, uncompressed.length);
    let compressed = ``;
    if (algo === `UTF16`) {
        compressed = LZString.compressToUTF16(uncompressed);
    }
    else if (algo === `ENCODED_URI`) {
        compressed = LZString.compressToEncodedURIComponent(uncompressed);
    }
    else {
        console.error(`worker.compress: no compression algorithm selected`);
    }
    // console.log(`${source}:${id} worker.compress: end size`, compressed.length);

    // memory management
    event.data[0] = null;
    event.data[1] = null;
    event.data[2] = null;
    event.data[3] = null;
    event.data[4] = null;
    event.data.length = 0;

    postMessage([id, compressed, metadata]);
};