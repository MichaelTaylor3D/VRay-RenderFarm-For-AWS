import alt from './alt';
import mobx from 'mobx';
import localStorage from 'mobx-localstorage';

import AppActions from './actions';
import AppDataSource from './source';

class AppStore {
  constructor() {
    this.state = {
      ignoreLoginRedirectOnPages: []
    };

    mobx.extendObservable(this.state, {
      globalProgress: mobx.observable(false),
      globalMsg: mobx.observable(''),
      globalMsgAction: null,
      token: mobx.observable(''),
      email: mobx.observable(''),
      displayName: mobx.observable('')
    });

    this.bindActions(AppActions);
    this.registerAsync(AppDataSource);

    // track the token in localStorage
    mobx.autorun(() => {
      this.state.token = mobx.observable(localStorage.getItem('token'));
    });
  }

  onActivateGlobalProgress() {
    this.state.globalProgress.set(true);
  }

  onDeactivateGlobalProgress() {
    this.state.globalProgress.set(false);
  }

  onLoginUser({username, password}) {
    AppActions.activateGlobalProgress.defer();
    this.getInstance().loginUser({username, password});
  }

  onLoginUserSuccess({token, message, user_display_name}) {
    AppActions.deactivateGlobalProgress.defer();

    if (token) {
      localStorage.setItem('token', token);
      this.state.displayName.set(user_display_name)
    }  

    if (message) {
      AppActions.setGlobalMsg.defer(message);
    }
  }

  onLogoutUser() {
    localStorage.removeItem('token');
  }

  onSetGlobalMsg(messageInfo) {    
    if (messageInfo['callback']) {
      this.state.globalMsgAction = messageInfo['callback'];
    } else {
      this.state.globalMsgAction = null;
    } 

    const message = messageInfo['message'] || messageInfo; 
    this.state.globalMsg.set(message);
  }

  static shouldShowGlobalProgress() {
    return this.getState().globalProgress.get();
  }

  static getGlobalMsg() {
    return this.getState().globalMsg.get();
  }

  static getGlobalMsgAction() {
    return this.getState().globalMsgAction;
  }

  static getAppToken() {
    return this.getState().token.get();
  }

  static getPagesToIgnoreOnLoginRedirect() {
    return this.getState().ignoreLoginRedirectOnPages;
  }
}

export default alt.createStore(AppStore);