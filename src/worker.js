'use strict';

importScripts('util/lz-string.min.js');

onmessage = function (event) {
    let key = event.data[0];
    let value = event.data[1];
    //console.log('worker.onmessage: start size', value.length);
    value = LZString.compressToUTF16(value);
    //console.log('worker.onmessage: end size', value.length);
    postMessage([key, value]);
};