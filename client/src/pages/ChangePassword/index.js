
import React, { PureComponent } from 'react';
import AppActions from '../../actions';
import ConfirmEmailView from './view';

export default class ChangePassword extends PureComponent {
  constructor() {
    super();
    this.state = {
      token: '',
      password: ''
    }
  }

  componentDidMount() {
    const confirmationToken = this.props.history.location.search.replace('?token=', '');
    this.setState({token: confirmationToken});
  }

  handleInputChange(input, value) {
    this.setState({[input]: value});
  }

  onChangePassword() {
    AppActions.changePassword({
      token: this.state.token,
      password: this.state.password,
      history: this.props.history
    });
  }

  render() {
    return (
      <div>
        <ConfirmEmailView 
          onChangePassword={this.onChangePassword.bind(this)}
          onInputChange={this.handleInputChange.bind(this)}
          {...this.state}
        />
      </div>
    )
  }
}