'use strict';

// a single film frame
// this is the base unit of a recording
class Frame {
  constructor() {
    this.id = 0;
    this.ts = 0;
    this.divs = {};
    this.compressed = false;
    this.deflated = false;
  }
}