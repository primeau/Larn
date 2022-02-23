'use strict';

function updateMessage(message) {
  if (!document) return;
  let el = document.getElementById(`LARN_LIST`);
  if (el) el.innerHTML = message;
}