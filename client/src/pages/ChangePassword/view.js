import React, { PureComponent } from 'react';
import ModalLayout from '../../lib/components/ModalLayout';
import { ValidatorForm } from 'react-form-validator-core';
import { TextValidator} from 'react-material-ui-form-validator';
import RaisedButton from 'material-ui/RaisedButton';
import cloudLeft from '../../resources/BottomLeftCloud.png';
import cloudRight from '../../resources/BottomRightCloud.png';
import logo from '../../logo.png';

export default class ChangePasswordView extends PureComponent {
  render() {
    return (
      <ModalLayout link="./login" label="Changed your mind? Login"> 
        <div> 
          <div className="reset-msg">
            <img src={logo} title="viddy.me" alt="viddy.me logo" />
            <p>What would you like your</p>
            <p>new password to be?</p>
          </div> 
            <ValidatorForm
              ref="form"
              onSubmit={this.props.onChangePassword}
            >
              <div className="input-container">
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