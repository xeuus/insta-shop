import './StatusBar.sass';
import React, {PureComponent} from 'react';
import {Autowired, Consumer, RoutingService} from "coreact";
import {Assets} from "../Assets";


export interface StatusBarProps {
  onRefresh?: () => any;
  onBack?: () => any;
  onAction?: () => any;
  actionName?: string;
  title?: string;
}

@Consumer
export class StatusBar extends PureComponent<StatusBarProps> {
  router = Autowired(RoutingService, this);

  render() {
    const {title, onRefresh, onBack, onAction, actionName} = this.props;
    return <div className="instagram-status-bar">
      {onBack && <div className="status-icon" onClick={onBack}>
        <img src={Assets.LeftArrow}/>
      </div>}
      {onRefresh && <div className="status-icon" onClick={onRefresh}>
        <img src={Assets.Refresh}/>
      </div>}

      <div className="status-logo">
        {title ? title : <img src={Assets.Logo}/>}
      </div>


      {actionName && <div className="status-action" onClick={onAction}>
        {actionName}
      </div>}

    </div>
  }
}
