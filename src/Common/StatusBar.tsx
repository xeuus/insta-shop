import './StatusBar.sass';
import React, {PureComponent} from 'react';

const leftArrow = require('Assets/left-arrow.svg');
const refresh = require('Assets/refresh.svg');
const screen = require('Assets/screen.svg');
const logo = require('Assets/logo.png');

export class StatusBar extends PureComponent{


  render(){
    return <div className="instagram-status-bar">

      <div className="status-icon">
        <img src={leftArrow}/>
      </div>
      <div className="status-icon">
        <img src={refresh}/>
      </div>

      <div className="status-logo">
        <img src={logo}/>
      </div>

      <div className="status-icon">
        <img src={screen}/>
      </div>
    </div>
  }
}