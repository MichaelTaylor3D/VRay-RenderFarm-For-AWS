require('babel-register')({
  presets: ['es2015', 'react']
});

const email = require('./email-manager');

email.error('michael.d.taylor@gmail.com', 'test error');