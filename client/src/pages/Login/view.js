import React, { Component } from 'react';
import ModalLayout from '../../lib/components/ModalLayout';
import { Link } from 'react-router-dom'
import { ValidatorForm } from 'react-form-validator-core';
import { TextValidator} from 'react-material-ui-form-validator';
import RaisedButton from 'material-ui/RaisedButton';

import logo from '../../logo.png';
import cloudLeft from '../../resources/BottomLeftCloud.png';
import cloudRight from '../../resources/BottomRightCloud.png';

export default class Login extends Component {
  render() {
    return (
      <ModalLayout link="./register" label="">        
        <div className="welcome-msg">
          <img src={logo} title="oonix.io" alt="oonix.io logo" />
          <p>Its great to see</p>
          <p>you again</p>
        </div>
        <ValidatorForm
          ref="form"
          onSubmit={this.props.onLoginUser}
        >
          <div className="input-container">
            <TextValidator
              name="username"
              className="input"
              hintText="Email or username"
              validators={['required']}
              errorMessages={['this field is required']}
              value={this.props.username}
              onChange={(event, value) => this.props.onInputChange('username', value)}
            />
            <TextValidator
              name="password"
              className="input"
              hintText="Password"
              type="password"
              validators={['required']}
              errorMessages={['this field is required']}
              value={this.props.password}
              onChange={(event, value) => this.props.onInputChange('password', value)}
            />
            <RaisedButton 
              className="login-btn" 
              label="Login" 
              primary={true} 
              type="submit"
            />
            <a href="https://oonix.io/home-2/my-account-2/lost-password/" target="_blank">Lost Password?</a>
          </div>       
        </ValidatorForm> 
      </ModalLayout>
    )
  }
}