import './Styles.sass';
import React, {PureComponent} from 'react';
import {NavLink} from "react-router-dom";
import {Autowired, Consumer} from "coreact";
import {RoutesService} from "Services/RoutesService";

@Consumer
export class Tabs extends PureComponent {
  routes = Autowired(RoutesService, this);

  render() {
    return <div className="add-tabs">
      <NavLink to={this.routes.UploadCamera()} className="tab-item" exact>
        Photo
      </NavLink>
    </div>
  }
}
