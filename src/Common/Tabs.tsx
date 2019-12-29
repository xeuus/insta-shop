import './Tabs.sass';
import React, {PureComponent} from 'react';
import {NavLink} from "react-router-dom";
import {Autowired, Consumer} from "coreact";
import {RoutesService} from "Services/RoutesService";

@Consumer
export class Tabs extends PureComponent {
  routes = Autowired(RoutesService, this);

  render() {
    return <div className="instagram-tabs">
      <NavLink to={this.routes.FeedsPage()} className="tab-icon" exact>
        <div className="icon home"/>
      </NavLink>
      <NavLink to={this.routes.SearchPage()} className="tab-icon" exact>
        <div className="icon search"/>
      </NavLink>
      <NavLink to={this.routes.UploadCamera()} className="tab-icon" exact>
        <div className="icon add"/>
      </NavLink>
      <NavLink to={this.routes.ActivityPage()} className="tab-icon" exact>
        <div className="icon activity"/>
      </NavLink>
      <NavLink to={this.routes.ProfilePage()} className="tab-icon" exact>
        <div className="icon profile"/>
      </NavLink>
    </div>
  }
}
