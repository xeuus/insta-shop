import './StatusBar.scss';
import React, {PureComponent} from 'react';

const leftArrow = require('./left-arrow.svg');
const refresh = require('./refresh.svg');
const screen = require('./screen.svg');
const logo = require('./logo.png');

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