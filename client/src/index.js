import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import viddyTheme from './lib/themes/viddyTheme';
import './index.css';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

ReactDOM.render(  
  <MuiThemeProvider muiTheme={getMuiTheme(viddyTheme)}>
    <App />
  </MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
