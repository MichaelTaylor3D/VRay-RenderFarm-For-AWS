import React from 'react';
import ObserverComponent from '../../lib/components/ObserverComponent';
import AppActions from '../../actions';
import AppStore from '../../store';
import HomeView from './view';
import './style.css';

export default class Login extends ObserverComponent {
  constructor() {
    super();
    this.state = {
      email: '',
      type: '',
      count: '',
      download: '',
      files: ''
    }
  }

  get appToken() {
    return AppStore.getAppToken();
  }

  handleInputChange(input, value) {
    this.setState({[input]: value});
  }

  handleFileChange(event, value) {
    this.setState({files: this.fileInput.files})
  }

  handleSubmitRenderJob() {
    AppActions.submitJob({...this.state});
  }

  render() {
    return (
      <div>
        <HomeView 
          onInputChange={this.handleInputChange.bind(this)}
          onFileChange={this.handleFileChange.bind(this)}
          onSubmitJob={this.handleSubmitRenderJob.bind(this)}
          {...this.state} 
        />
      </div>
    )
  }
}