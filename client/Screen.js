var EventEmitter = require('events');

function Screen(canvas) {
  this._event = new EventEmitter();
  this._event.setMaxListeners(1); // find leaks early
  this._canvas = canvas;
  this._context = canvas.getContext('2d');
  this._hasHandlers = false;
  this._scaleFactor = 1;
  this._dx = 0;
  this._dy = 0;
  canvas.width = 800;
  canvas.height = 600;

  this._context.imageSmoothingEnabled = false;
  this._context.mozImageSmoothingEnabled = false;
  this._context.webkitImageSmoothingEnabled = false;
  this._context.msImageSmoothingEnabled = false;

  this._scale = this._scale.bind(this);
  this._scale();
  this.on = this._event.on.bind(this._event);
  this.removeListener = this._event.removeListener.bind(this._event);
}

Screen.prototype.drawFrame = function(rect) {
  var image = rect.image;
  switch(image.encoding) {
  case 'raw':
    var imageData = this._context.createImageData(rect.width, rect.height);
    imageData.data.set(new Uint8Array(image.data));
    this._context.putImageData(imageData, rect.x, rect.y);
    break;

  case 'png':
  case 'jpeg':
    var img = new Image();
    var self = this;
    img.width = rect.width;
    img.height = rect.height;
    img.src = 'data:image/' + image.encoding + ';base64,' + rect.image.data;
    img.onload = function () {
      self._context.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    };
    break;
  default:
    throw new Error('unknown rect encoding:', image.encoding);
  }
};

Screen.prototype.copyFrame = function(rect) {
  var imageData = this._context.getImageData(rect.src.x, rect.src.y, rect.width, rect.height);
  this._context.putImageData(imageData, rect.x, rect.y)
};

Screen.prototype._scale = function() {
  var canvas = this._canvas,
    sw = (window.innerWidth * 0.9) / canvas.width,
    sh = (window.innerHeight * 0.9) / canvas.height,
    s = Math.min(sw, sh);

  this._scaleFactor = s;
  this._dx = (window.innerWidth - canvas.width * s) / 2 / s;
  this._dy = (window.innerHeight - canvas.height * s) / 2 / s;
  var transform = 'scale(' + s + ') translate(' +
      this._dx + 'px, ' + this._dy + 'px)';
  canvas.style.mozTransform = transform;
  canvas.style.webkitTransform = transform;
  canvas.style.transform = transform;
};

Screen.prototype._toScreenX = function(pageX){
  return (pageX ) / this._scaleFactor - this._dx;
}

Screen.prototype._toScreenY = function(pageY){
  return (pageY ) / this._scaleFactor - this._dy;
}

Screen.prototype._addHandlers = function() {
  if(this._hasHandlers)
    throw new Error("Event Handlers already attached!");

  var self = this;
  this._hasHandlers = true;

  /* mouse events */
  var state = 0;
  this._hasMouseHandlers = true;
  this._canvas.addEventListener('mousedown', this._onmousedown = function(e) {
    state = 1;
    self._event.emit('mouseEvent', self._toScreenX(e.pageX) , self._toScreenY(e.pageY), state)
    e.preventDefault();
  }, false);
  this._canvas.addEventListener('mouseup', this._onmouseup = function (e) {
    state = 0;
    self._event.emit('mouseEvent', self._toScreenX(e.pageX) , self._toScreenY(e.pageY), state)
    e.preventDefault();
  }, false);
  this._canvas.addEventListener('mousemove', this._onmousemove = function (e) {
    self._event.emit('mouseEvent', self._toScreenX(e.pageX) , self._toScreenY(e.pageY), state)
    e.preventDefault();
  });

  /* key events */
  document.addEventListener('keydown', this._onkeydown = function (e) {
    self._event.emit('keyEvent', e.keyCode, e.shiftKey, 1)
    e.preventDefault();
  }, false);
  document.addEventListener('keyup', this._onkeyup = function (e) {
    self._event.emit('keyEvent', e.keyCode, e.shiftKey, 0)
    e.preventDefault();
  }, false);

  /* window resize */
  window.addEventListener('resize', this._scale);
};

Screen.prototype.init = function(width, height){
  this._canvas.width = width;
  this._canvas.height = height;
  this._scale();
  this._addHandlers();
}

Screen.prototype.removeHandlers = function() {
  if(!this._hasHandlers)
    return;

  this._canvas.removeEventListener('mouseup', this._onmouseup);
  this._canvas.removeEventListener('mousedown', this._onmousedown);
  this._canvas.removeEventListener('mousemove', this._onmousemove);
  document.removeEventListener('keydown', this._onkeydown);
  document.removeEventListener('keyup', this._onkeyup);
  window.removeEventListener('resize', this._scale)
  this._hasHandlers = false;
};

Screen.prototype.getCanvas = function() {
  return this._canvas;
};

module.exports = Screen;
