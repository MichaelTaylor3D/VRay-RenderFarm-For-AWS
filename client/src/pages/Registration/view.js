import React, { Component } from 'react';
import ModalLayout from '../../lib/components/ModalLayout';
import RaisedButton from 'material-ui/RaisedButton';
import { ValidatorForm } from 'react-form-validator-core';
import { TextValidator} from 'react-material-ui-form-validator';
import logo from '../../logo.png';
import cloudLeft from '../../resources/BottomLeftCloud.png';
import cloudRight from '../../resources/BottomRightCloud.png';

const phoneNumberMatch = '^\\s*(?:\\+?(\\d{1,3}))?[-. (]*(\\d{3})[-. )]*(\\d{3})[-. ]*(\\d{4})(?: *x(\\d+))?\\s*$';

export default class Registration extends Component {
  render() {
    return (
      <ModalLayout link="./login" label="Already have an account? Login"> 
        <div> 
          <div className="welcome-msg">
            <img src={logo} title="viddy.me" alt="viddy.me logo" />
            <p>Sign up and interview the world.</p>
            <p>Interview your employees, friends,</p>
            <p>babysitters, tutors ... anyone</p>
          </div> 
            <ValidatorForm
              ref="form"
              onSubmit={this.props.onRegisterUser}
            >
            <div className="input-container">
              <TextValidator
                name="name"
                className="input"
                hintText="Name"
                value={this.props.name}
                validators={['required']}
                errorMessages={['this field is required']}
                onChange={(event, value) => this.props.onInputChange('name', value)}
              />
              <TextValidator
                name="email"
                className="input"
                hintText="Email"
                value={this.props.email}
                validators={['required', 'isEmail']}
                errorMessages={['this field is required', 'email is not valid']}
                onChange={(event, value) => this.props.onInputChange('email', value)}
              />
              <TextValidator
                name="username"
                className="input"
                hintText="Username"
                value={this.props.username}
                validators={['required']}
                errorMessages={['this field is required']}
                onChange={(event, value) => this.props.onInputChange('username', value)}
              />
              <TextValidator
                name="phone"
                className="input"
                hintText="Phone"
                value={this.props.phone}
                validators={['required', `matchRegexp:${phoneNumberMatch}`]}
                errorMessages={['this field is required', 'phone number not valid']}
                onChange={(event, value) => this.props.onInputChange('phone', value)}
              />
              <TextValidator
                name="password"
                className="input"
                hintText="Password"
                type="password"
                value={this.props.password}
                validators={['required']}
                errorMessages={['this field is required']}
                onChange={(event, value) => this.props.onInputChange('password', value)}
              />
              <RaisedButton 
                className="register-btn" 
                label="Sign Up" 
                primary={true} 
                type="submit"
              />
              </div>  
            </ValidatorForm>  
            <img src={cloudLeft} className="cloud-left" alt="cloud" />
            <img src={cloudRight} className="cloud-right" alt="cloud" />    
          </div>        
      </ModalLayout>
    )
  }
}