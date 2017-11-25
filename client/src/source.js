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

  ...sourceMethod('submitJob', AppActions, co.wrap(function* (state, userData) {
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('type', userData.type);
    formData.append('count', userData.count);
    formData.append('token', userData.token);

    for (var key in userData.files) {
      if (userData.files.hasOwnProperty(key) && userData.files[key] instanceof File) {
          formData.append(key, userData.files[key]);
      }
    }

    const req = request.post('api/upload').send(formData).on('progress', (event) => {
      userData.callback({req, progress: event.percent});
    });

    return yield req;
  }))
};

export default AppDataSource;