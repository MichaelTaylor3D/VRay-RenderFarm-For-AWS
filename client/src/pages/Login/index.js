import React from 'react';
import ObserverComponent from '../../lib/components/ObserverComponent';
import AppActions from '../../actions';
import AppStore from '../../store';
import LoginView from './view';
import './style.css';

export default class Login extends ObserverComponent {
  constructor() {
    super();
    this.state = {
      username: '',
      password: ''
    }
  }

  componentDidMount() {
    // redirect to home if we already have an app token
    ObserverComponent.autorun(() => {
      if (this.appToken !== undefined) {
        this.props.history.push('/home');
      }
    });
  }

  get appToken() {
    return AppStore.getAppToken();
  }

  handleInputChange(input, value) {
    this.setState({[input]: value});
  }

  onLoginUser() {
    AppActions.loginUser({...this.state});
  }

  render() {
    return (
      <div>
        <LoginView 
          onLoginUser={this.onLoginUser.bind(this)}
          onInputChange={this.handleInputChange.bind(this)}
          {...this.state} 
        />
      </div>
    )
  }
}