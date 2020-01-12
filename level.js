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
  for (let monsterIndex = 0; monsterIndex <= 64; monsterIndex++) {
    img = `img/m${monsterIndex}.png`;
    images[img] = createImage(img);
  }
  for (let objectIndex = 0; objectIndex <= 94; objectIndex++) {
    img = `img/o${objectIndex}.png`;
    images[img] = createImage(img);
  }
  for (let wallIndex = 0; wallIndex <= 30; wallIndex += 2) {
    img = `img/w${wallIndex}.png`;
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
