import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import LinearProgress from 'material-ui/LinearProgress';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

const divStyle = {
  margin: 'auto',
  display: 'flex',
  padding: '10px',
  justifyContent: 'center'
}

class FileUpload extends Component {
  constructor() {
    super();
    this.state = {
        uploadProgress: 0
    }
  }

  render() {
    let actions;

    actions = [
      <FlatButton
        label="Abort"
        primary={true}
        keyboardFocused={true}
        onClick={() => {
          this.props.abort();
          this.props.onDone();
        }}
      />
    ]
    
    if (this.props.progress === 100) {
      actions.push(
        <FlatButton
          label="Done!"
          primary={true}
          keyboardFocused={true}
          onClick={this.props.onDone}
        />
      );      
    }

    return (
        <Dialog
          title="Job is uploading to Render Farm"
          actions={actions}
          modal={false}
          open
        >            
            {this.props.progress}%
            <LinearProgress mode="determinate" value={this.props.progress} />
        </Dialog>
    );
  }
}

export default FileUpload;
