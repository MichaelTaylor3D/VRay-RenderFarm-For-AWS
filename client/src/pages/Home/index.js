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
      type: 0,
      count: 9,
      download: '',
      files: ''
    }
  }

  componentDidMount() {
    const initialEmail = AppStore.getSignedInUserEmail();
    if (initialEmail) {
      this.setState({email: initialEmail});
    }
  }

  get appToken() {
    return AppStore.getAppToken();
  }

  handleInputChange(input, value) {
    this.setState({[input]: value});
  }

  handleSubmitRenderJob(callback) {
    AppActions.submitJob(Object.assign({}, {...this.state}, {callback}));
  }

  render() {
    return (
      <div>
        <HomeView 
          onInputChange={this.handleInputChange.bind(this)}
          onSubmitJob={this.handleSubmitRenderJob.bind(this)}
          {...this.state} 
        />
      </div>
    )
  }
}