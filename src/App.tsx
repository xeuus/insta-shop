import React, {PureComponent} from 'react';
import {FeedScreen} from "./Feed/FeedScreen";
import {Autowired, Observer} from "coreact";
import {UserService} from "Services/UserService";
import {Redirect, Route, Switch} from "react-router";
import {RoutesService} from "Services/RoutesService";
import {LoginScreen} from "./Login/LoginScreen";
import {LoginPasswordScreen} from "./Login/LoginPasswordScreen";
import {AuthConfirmScreen} from "./Login/AuthConfirmScreen";
import {RegisterScreen} from "./Login/RegisterScreen";
import {AddScreen} from "./Add/AddScreen";
import {SearchScreen} from "./Search/SearchScreen";


@Observer([UserService])
export class App extends PureComponent {
  user = Autowired(UserService, this);
  routes = Autowired(RoutesService, this);

  render() {
    if (this.user.isLoggedIn) {
      return <>
        <Switch>
          <Route path={this.routes.FeedsPage()} component={FeedScreen} exact/>
          <Route path={this.routes.SearchPage()} component={SearchScreen} exact/>
          <Route path={this.routes.AddPage()} component={AddScreen} exact/>
          <Route path={this.routes.ActivityPage()} component={FeedScreen} exact/>
          <Route path={this.routes.ProfilePage()} component={FeedScreen} exact/>
          <Redirect from="*" to={this.routes.FeedsPage()}/>
        </Switch>
      </>
    } else {
      return <Switch>
        <Route path={this.routes.LoginOTPPage()} component={LoginScreen} exact/>
        <Route path={this.routes.LoginPasswordPage()} component={LoginPasswordScreen} exact/>
        <Route path={this.routes.AuthConfirmPage()} component={AuthConfirmScreen} exact/>
        <Route path={this.routes.RegisterPage()} component={RegisterScreen} exact/>
        <Redirect from="*" to={this.routes.LoginPasswordPage()}/>
      </Switch>
    }
  }
}
