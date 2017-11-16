import React, { Component } from 'react';
import AppActions from '../../actions';
import RegistrationView from './view';
import './style.css';

export default class Registration extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      email: '',
      username: '',
      phone: '',
      password: ''
    }
  }

  handleInputChange(input, value) {
    this.setState({[input]: value});
  }

  handleRegisterUser(event, value) {
    console.log({event, value})
    AppActions.registerUser({...this.state});
  }

  render() {
    return (
      <div>
        <RegistrationView 
          onInputChange={this.handleInputChange.bind(this)}
          onRegisterUser={this.handleRegisterUser.bind(this)}
          {...this.state}
        />
      </div>
    )
  }
}