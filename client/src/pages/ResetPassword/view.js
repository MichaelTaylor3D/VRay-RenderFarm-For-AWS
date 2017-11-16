import React, { Component } from 'react';
import ModalLayout from '../../lib/components/ModalLayout';
import RaisedButton from 'material-ui/RaisedButton';
import { ValidatorForm } from 'react-form-validator-core';
import { TextValidator} from 'react-material-ui-form-validator';
import logo from '../../logo.png';
import cloudLeft from '../../resources/BottomLeftCloud.png';
import cloudRight from '../../resources/BottomRightCloud.png';
import './style.css'

export default class ResetPassword extends Component {
  render() {
    return (
      <ModalLayout link="./login" label="Remember your password? Login"> 
        <div> 
          <div className="reset-msg">
            <img src={logo} title="viddy.me" alt="viddy.me logo" />
            <p>Forgot your password?</p>
            <p>No worries! You can reset it here.</p>
          </div> 
            <ValidatorForm
              ref="form"
              onSubmit={this.props.onResetPassword}
            >
            <div className="input-container">
              <TextValidator
                name="email"
                className="input"
                hintText="Email"
                value={this.props.email}
                validators={['required', 'isEmail']}
                errorMessages={['this field is required', 'email is not valid']}
                onChange={(event, value) => this.props.onInputChange('email', value)}
              />
              <RaisedButton 
                className="reset-btn" 
                label="Reset" 
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