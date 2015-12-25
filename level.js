'use strict';


var Level = {
  items: [],
  monsters: [],
  know: [],
}; // Level


/*
 *
 *
 *
 *
 *
 *  everything below is highly experimental
 *
 *
 *
 *
 *
 */


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



var IS_BOLD;
var IS_MARK;


function bltAmiga() {

  var canvas = document.getElementById(`lCanvas`);
  if (!canvas) return;
  var ctx = canvas.getContext(`2d`);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  IS_BOLD = false;
  IS_MARK = false;

  for (var y = 0; y < 24; y++) {
    for (var x = 0; x < 80; x++) {

      if (display[x][y].indexOf('png') >= 0) {

        var image = images[display[x][y]];
        if (!image) {
          console.log(`can't find image: ${display[x][y]}`);
          image = createImage(display[x][y]);
          continue;
        }
        image.xx = x * IMG_WIDTH;
        image.yy = y * IMG_HEIGHT;
        image.src = display[x][y];
        ctx.drawImage(image, image.xx, image.yy, IMG_WIDTH, IMG_HEIGHT);

      } else {
        var output = display[x][y];

        if (output.indexOf('<b>') >= 0) {
          IS_BOLD = true;
          output = output.substring(3);
        } else if (output.indexOf('<mark>') >= 0) {
          IS_MARK = true;
          output = output.substring(6);
        } else if (output.indexOf('</b>') >= 0) {
          IS_BOLD = false;
          output = output.substring(4);
        } else if (output.indexOf('</mark>') >= 0) {
          IS_MARK = false;
          output = output.substring(7);
        }

        // strip out any other formatted stuff
        // this is very hacky
        if (output.indexOf('<') >=0 && output.indexOf('>') >=0) {
          output = output.split('<')[0] + output.split('>')[1];
        }

        if (IS_BOLD) {
          ctx.font = `bold 18px Courier New, Courier, monospace`;
          ctx.fillStyle = `white`;
        } else if (IS_MARK) {
          ctx.beginPath();
          ctx.rect(x * IMG_WIDTH, y * IMG_HEIGHT, IMG_WIDTH, IMG_HEIGHT);
          ctx.fillStyle = 'lightgrey';
          ctx.fill();
          ctx.font = `20px Courier New, Courier, monospace`;
          ctx.fillStyle = `black`;
        } else {
          ctx.font = `20px Courier New, Courier, monospace`;
          ctx.fillStyle = `lightgrey`;
        }
        ctx.textBaseline = `top`;
        ctx.fillText(output, 1 + x * IMG_WIDTH, 1 + y * IMG_HEIGHT);
      }

    } // inner for
  } // outer for

}
