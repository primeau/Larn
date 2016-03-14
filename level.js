'use strict';


var Level = {
  items: [],
  monsters: [],
  know: [],
}; // Level



var images = null; // used for 'amiga_mode'



function loadImages() {
  images = [];

  console.log(`loading images`);

  var img;
  for (var i = 0; i <= 64; i++) {
    img = `img/m${i}.png`;
    images[img] = createImage(img);
  }
  for (var i = 0; i <= 94; i++) {
    img = `img/o${i}.png`;
    images[img] = createImage(img);
  }
  for (var i = 0; i <= 30; i += 2) {
    img = `img/w${i}.png`;
    images[img] = createImage(img);
  }
  img = `img/player.png`;
  images[img] = createImage(img);
}



function createImage(src) {
  //console.log(`loading: ` + src);
  var image = new Image();
  image.onload = function() {
    //console.log(`loaded: ` + src);
  }
  image.src = src;
  return image;
}
