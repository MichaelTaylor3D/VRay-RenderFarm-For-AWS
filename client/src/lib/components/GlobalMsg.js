import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AppActions from '../../actions';
import AppStore from '../../store';
import './style.css';

export default class GlobalMsg extends Component {

  handleClose() {
    const action = AppStore.getGlobalMsgAction();

    AppActions.setGlobalMsg('');

    if (typeof action === 'function') {
      action();
    }    
  }

  render() {
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        onClick={this.handleClose}
      />
    ];
    return (
      <div>
      { this.props.message && 
        <Dialog
          title={this.props.message.replace(/(<([^>]+)>)/ig, '')}
          modal={true}
          open={true}
          actions={actions}
        />
      }
      </div>
    );
  }
}