import _ from 'lodash';
import React, { Component } from 'react';
import ModalLayout from '../../lib/components/ModalLayout';
import { Link } from 'react-router-dom'
import { ValidatorForm } from 'react-form-validator-core';
import { TextValidator } from 'react-material-ui-form-validator';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import FileUpload from '../../lib/components/FileUpload'

import logo from '../../logo.png';

export default class HomeView extends Component {
  constructor() {
    super();
    this.state = {
      progress: 0,
      showUpload: false,
      abort: _.noop
    }
  }

  handleFileChange(event, value) {
    this.props.onInputChange('files', this.fileInput.files);
  }

  onFileUploadProgress(request) {
   this.setState({
     progress: request.progress,
     abort: request.req.abort
    });
  }

  render() {
    return (
      <ModalLayout link="/" label="">        
        <div className="welcome-msg">
          <img src={logo} title="oonix.io" alt="oonix.io logo" />
          <p>Submit Render Job</p>
        </div>
        <div className="input-container">
          <SelectField
            floatingLabelText="Farm Type"
            value={this.props.type}
            onChange={(event, value) => this.props.onInputChange('type', value)}
          >
            <MenuItem value={0} primaryText="Standard Farm" />
            <MenuItem value={1} primaryText="Hyper Farm" />
            <MenuItem value={2} primaryText="Ultimate Farm" />
          </SelectField>
          <SelectField
            floatingLabelText="Number of Render Nodes"
            value={this.props.count}
            onChange={(event, value) => this.props.onInputChange('count', value)}
          >
            <MenuItem value={0} primaryText="1" />
            <MenuItem value={1} primaryText="2" />
            <MenuItem value={2} primaryText="3" />
            <MenuItem value={3} primaryText="4" />
            <MenuItem value={4} primaryText="5" />
            <MenuItem value={5} primaryText="6" />
            <MenuItem value={6} primaryText="7" />
            <MenuItem value={7} primaryText="8" />
            <MenuItem value={8} primaryText="9" />
            <MenuItem value={9} primaryText="10" />
            <MenuItem value={10} primaryText="11" />
            <MenuItem value={11} primaryText="12" />
            <MenuItem value={12} primaryText="13" />
          </SelectField>
          <Paper style={{padding: 5, paddingTop: 0}}>
            <TextField 
              floatingLabelText="Project Link" 
              value={this.props.download} 
              onChange={(event, value) => this.props.onInputChange('download', value)}
            />
            <center><div style={{display: 'inline-flex'}}>-- OR --</div></center>
            <center>
              <input 
                ref={node => this.fileInput = node}
                type="file" 
                onChange={this.handleFileChange.bind(this)} 
              />
            </center>
          </Paper>
        </div>    
        <ValidatorForm
          ref="form"
          onSubmit={() => {
            if (!this.props.download) {
              this.setState({showUpload: true});
            }            
            this.props.onSubmitJob(this.onFileUploadProgress.bind(this));
          }}
        >
          <div className="input-container">
            <TextValidator
              name="email"
              className="input"
              hintText="Email Finished Job To"
              validators={['required', 'isEmail']}
              errorMessages={['this field is required', 'email is not valid']}
              value={this.props.email}
              onChange={(event, value) => this.props.onInputChange('email', value)}
            />           
            <RaisedButton 
              className="login-btn" 
              label="Submit Job" 
              primary={true} 
              type="submit"
            />
          </div>       
        </ValidatorForm>
        {
          this.state.showUpload && 
          <FileUpload 
            progress={this.state.progress} 
            onDone={() => this.setState({showUpload: false})}
            onAbort={this.state.abort}
          />
        }
      </ModalLayout>
    )
  }
}