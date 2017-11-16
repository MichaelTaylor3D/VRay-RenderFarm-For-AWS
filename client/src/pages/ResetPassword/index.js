
import React from 'react';
import ObserverComponent from '../../lib/components/ObserverComponent';
import AppActions from '../../actions';
import ResetPasswordView from './view';

export default class ResetPassword extends ObserverComponent {
  constructor() {
    super();
    this.state = {
      email: ''
    }
  }

  handleInputChange(input, value) {
    this.setState({[input]: value});
  }

  onResetPassword() {
    AppActions.resetPassword({...this.state});
  }

  render() {
    return (
      <div>
        <ResetPasswordView 
          onResetPassword={this.onResetPassword.bind(this)}
          onInputChange={this.handleInputChange.bind(this)}
          {...this.state} 
        />
      </div>
    )
  }
}