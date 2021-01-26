var svnc = require('../index.js');

/* attach screen to canvas, create client */
var canvas = document.getElementById('screen'),
  screen = new svnc.Screen(canvas),
  client = new svnc.Client(screen);

var screenWrapper = document.getElementById('screen-wrapper'),
  formWrapper = document.getElementById('form-wrapper'),
  loginBtn = document.getElementById('login-btn'),
  disconnectBtn = document.getElementById('disconnect-btn'),
  errorBar = document.getElementById('error-bar');

disconnectBtn.addEventListener('click', function() {
  client.disconnect();
  screenWrapper.style.display = 'none';
  formWrapper.style.display = 'block';
});

loginBtn.addEventListener('click', function() {
  var config = {
    host: document.getElementById('host').value,
    port: parseInt(document.getElementById('port').value, 10),
    password: document.getElementById('password').value
  };

  /* connect to a vnc server */
  client.connect(config).then(function() {
    formWrapper.style.display = 'none';
    screenWrapper.style.display = 'block';
    errorBar.classList.add("hide");
  }).catch(function(error) {
    console.error('Connect failed:', error);
    errorBar.textContent = "Failed to connect";
    errorBar.classList.remove("hide");
  })
}, false);
