import './Styles.sass';

import React, {PureComponent} from 'react';
import {TextInput} from "Components/TextInput";
import {Button} from "Components/Button";
import {Link} from "react-router-dom";
import {Autowired, Observer, RoutingService} from "coreact";
import {RoutesService} from "Services/RoutesService";
import {PasswordInput} from "Components/PasswordInput";
import {LoginService} from "./LoginService";

@Observer([LoginService])
export class LoginPasswordScreen extends PureComponent {

  routes = Autowired(RoutesService, this);
  login = Autowired(LoginService, this);
  routing = Autowired(RoutingService, this);

  state = {
    form: {
      username: this.login.mobileNumber,
      password: this.login.password,
    },
  };

  componentDidMount(): void {
    this.login.killProcess('login');
  }

  onChange = (name: string, value: any) => this.setState({form: {...this.state.form, [name]: value}});

  submit = async ()=>{
    const {form} = this.state;
    this.login.mobileNumber = form.username;
    this.login.password = form.password;
    await this.login.login(form.username, form.password, 'password');
  };

  render() {
    const {message, validation, status} = this.login.getProcess('login');
    const {form} = this.state;
    return <>
      <div className="container">
        <div className="login-screen-logo">
          <div className="logo"/>
        </div>
        <TextInput
          name="username"
          placeholder="Mobile Number or Username"
          values={form}
          validation={validation}
          onChange={this.onChange}
        />
        <div className="vs-3"/>
        <PasswordInput
          name="password"
          placeholder="Password"
          values={form}
          validation={validation}
          onChange={this.onChange}
        />
        <div className="vs-3"/>
        {status === 'failed' && <label className="text-danger text-center mb-3">{message}</label>}
        <Button pending={status === 'pending'} onClick={this.submit}>
          Login
        </Button>
        <hr className="my-5"/>
        <Link className="text-center" to={this.routes.LoginOTPPage()}>
          Login with SMS
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