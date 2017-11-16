import React, {PureComponent} from 'react';
import Paper from 'material-ui/Paper';
import logo from '../../logo.png';
import './ModalLayout.css';

export default class ModalLayout extends PureComponent {
  render() {
    return (
      <div className="modal-layout">
        <div className="header-bar">
          <div className="logo-content">
            <img src={logo} alt="viddy.me logo" title="viddy.me"/>
          </div>
          <a href={this.props.link}>{this.props.label}</a>
        </div>
        <div className="model-layout-content">
          <Paper className="content-card" zDepth={1}>
            {this.props.children}
          </Paper>
        </div>
      </div>
    );
  }
}