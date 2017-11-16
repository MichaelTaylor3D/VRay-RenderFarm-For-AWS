import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import './style.css';

export default class IndeterminateProgressOverlay extends Component {
  render() {
    return (
      <div className="progess" style={{display: 'flex'}}>
        <Dialog
          title=""
          modal={true}
          open={true}
          contentStyle={{width: '150px', backgroundColor: 'red !important'}}
          paperClassName="progress-paper-override"
        >
          <CircularProgress size={80} thickness={5} />
        </Dialog>
      </div>
    )
  }
}