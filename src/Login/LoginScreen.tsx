import './Styles.sass';

import React, {PureComponent} from 'react';
import {TextInput} from "Components/TextInput";
import {Button} from "Components/Button";
import {Link} from "react-router-dom";
import {Autowired, Observer, RoutingService} from "coreact";
import {RoutesService} from "Services/RoutesService";
import {LoginService} from "./LoginService";

@Observer([])
export class LoginScreen extends PureComponent {
  routes = Autowired(RoutesService, this);
  routing = Autowired(RoutingService, this);
  login = Autowired(LoginService, this);

  state = {
    form: {
      mobileNumber: this.login.mobileNumber,
    },
  };
  onChange = (name: string, value: any) => this.setState({form: {...this.state.form, [name]: value}});

  submit = async ()=>{
    const {form} = this.state;
    this.login.method = this.login.METHOD_LOGIN;
    this.login.mobileNumber = form.mobileNumber;
    await this.login.sendOTP(form.mobileNumber);
    this.routing.goto(this.routes.AuthConfirmPage());
  };
  render() {
    const {form} = this.state;
    return <>
      <div className="container">
        <div className="login-screen-logo">
          <div className="logo"/>
        </div>
        <div className="vs-3"/>
        <TextInput
          name="mobileNumber"
          placeholder="Mobile Number"
          values={form}
          onChange={this.onChange}
        />
        <div className="vs-3"/>
        <Button onClick={this.submit}>
          Send Code
        </Button>
        <hr className="my-5"/>
        <Link className="text-center" to={this.routes.LoginPasswordPage()}>
          Login with Password
        </Link>
        <div className="vs-6"/>
        <div className="text-center text-muted">
          <span>Didn't have an account?</span>&nbsp;
          <Link to={this.routes.RegisterPage()}>
            Sign Up
          </Link>
        </div>
      </div>
    </>;
  }
}