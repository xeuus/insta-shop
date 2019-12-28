import './StatusBar.sass';
import React, {PureComponent} from 'react';

const leftArrow = require('Assets/left-arrow.svg');

export interface ShareHeaderProps {
  title: string,
  action: string,
  onClick?: () => any
}

export class ShareHeader extends PureComponent<ShareHeaderProps> {
  render() {
    const {title, action, onClick} = this.props;
    return <div className="instagram-status-bar">

      <div className="status-icon">
        <img src={leftArrow}/>
      </div>

      <div className="status-logo">
        {title}
      </div>
      <div className="status-action" onClick={onClick}>
        {action}
      </div>
    </div>
  }
}