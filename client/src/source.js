import co from 'co';
import request from 'superagent';
import { sourceMethod } from './lib/utils/async-actions';
import AppActions from './actions';

const host = 'https://oonix.io/wp-json';

// Source Methods must return a promise
// co.wrap automatically returns a promise
const AppDataSource = {
  ...sourceMethod('loginUser', AppActions, co.wrap(function* (state, {username, password}) {
    return yield request.post(`${host}/jwt-auth/v1/token`)
      .send({username, password})
      .then((res) => ({...res.body}))  
      .catch((error) => ({status: error.status, message: error.response.body.message}));  
  })),
};

export default AppDataSource;