import React, { Component } from 'react';
import ModalLayout from '../../lib/components/ModalLayout';
import logo from '../../logo.png';
import cloudLeft from '../../resources/BottomLeftCloud.png';
import cloudRight from '../../resources/BottomRightCloud.png';

export default class ConfirmEmailView extends Component {
  render() {
    return (
      <ModalLayout link="./login" label="Already have an account? Login"> 
        <div> 
          <div className="reset-msg">
            <img src={logo} title="viddy.me" alt="viddy.me logo" />
            <p>We are Confirming your account</p>
          </div> 
            <img src={cloudLeft} className="cloud-left" alt="cloud" />
            <img src={cloudRight} className="cloud-right" alt="cloud" />    
          </div>        
      </ModalLayout>
    )
  }
}