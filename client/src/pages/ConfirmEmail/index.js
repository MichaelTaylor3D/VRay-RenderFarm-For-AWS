
import React, { PureComponent } from 'react';
import AppActions from '../../actions';
import ConfirmEmailView from './view';

export default class ConfirmEmail extends PureComponent {
  componentDidMount() {
    const confirmationToken = this.props.history.location.search.replace('?token=', '');
    AppActions.confirmEmail({token: confirmationToken, history: this.props.history});
  }

  render() {
    return (
      <div><ConfirmEmailView /></div>
    )
  }
}