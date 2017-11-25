import alt from './alt';
import { asyncActions } from './lib/utils/async-actions';

class AppActions {
  constructor() {
    this.generateActions(
      'activateGlobalProgress',
      'deactivateGlobalProgress',
      'setGlobalMsg',
      'logoutUser',
      ...asyncActions('loginUser'),
      ...asyncActions('registerUser'),
      ...asyncActions('resetPassword'),
      ...asyncActions('confirmEmail'),
      ...asyncActions('changePassword'),
      ...asyncActions('submitJob'),
      ...asyncActions('submitAndDownloadJob')
    )
  }
}

export default alt.createActions(AppActions);