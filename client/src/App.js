import React from 'react';
import ObserverComponent from './lib/components/ObserverComponent';
import history from './history';
import AppStore from './store';

import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'

import * as Pages from './pages';
import RecordVideo from './lib/components/video/RecordVideo';

import IndeterminateProgressOverlay from './lib/components/IndeterminateProgressOverlay';
import GlobalMsg from './lib/components/GlobalMsg';

class App extends ObserverComponent {
  get showProgressOverlay() {
    return AppStore.shouldShowGlobalProgress();
  }

  get globalMsg() {
    return AppStore.getGlobalMsg();
  }

  get appToken() {
    return AppStore.getAppToken();
  }

  get ignoreRedirectOnPages() {
    return AppStore.getPagesToIgnoreOnLoginRedirect();
  }

  redirectToLoginIfNoToken() {
    // If no app token and not at register page goto login
    if (!this.appToken && !this.ignoreRedirectOnPages.includes(history.location.pathname)) {
      history.push('/login');
    }
  }

  render() {
    this.redirectToLoginIfNoToken();
    return (
      <Router>
        <div className="App">
          { this.showProgressOverlay && <IndeterminateProgressOverlay /> }  
          { this.globalMsg && <GlobalMsg message={this.globalMsg} /> }   
          <Route exact path='/' component={Pages['Home']}/>
          <Route path='/login' component={Pages['Login']}/>
        </div>
      </Router>
    );
  }
}
 
export default App;
