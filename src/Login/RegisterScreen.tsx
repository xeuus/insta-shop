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
export class RegisterScreen extends PureComponent {
  routes = Autowired(RoutesService, this);
  routing = Autowired(RoutingService, this);
  login = Autowired(LoginService, this);

  state = {
    form: {
      name: this.login.fullName,
      username: this.login.username,
      mobileNumber: this.login.mobileNumber,
      password: this.login.password,
    },
  };
  onChange = (name: string, value: any) => this.setState({form: {...this.state.form, [name]: value}});

  submit = async () => {
    const {form} = this.state;
    this.login.method = this.login.METHOD_REGISTER;
    this.login.mobileNumber = form.mobileNumber;
    this.login.username = form.username;
    this.login.fullName = form.name;
    this.login.password = form.password;
    await this.login.check({
      username: form.username,
      mobileNumber: form.mobileNumber,
      password: form.password,
      name: form.name,
    });
    await this.login.sendOTP(form.mobileNumber);
    this.routing.goto(this.routes.AuthConfirmPage());
  };

  render() {
    const {validation, status} = this.login.getProcess('check');
    const {form} = this.state;
    return <>
      <div className="container">
        <div className="login-screen-logo">
          <div className="logo"/>
        </div>
        <div className="vs-3"/>
        <TextInput
          name="name"
          placeholder="Full name"
          validation={validation}
          values={form}
          onChange={this.onChange}
        />
        <div className="vs-3"/>
        <TextInput
          name="mobileNumber"
          placeholder="Mobile Number"
          validation={validation}
          values={form}
          onChange={this.onChange}
          number
        />
        <div className="vs-3"/>
        <TextInput
          name="username"
          placeholder="Username"
          validation={validation}
          values={form}
          onChange={this.onChange}
        />
        <div className="vs-3"/>
        <PasswordInput
          name="password"
          placeholder="Password"
          validation={validation}
          values={form}
          onChange={this.onChange}
        />
        <div className="vs-3"/>
        <Button onClick={this.submit} pending={status === 'pending'}>
          Next
        </Button>
        <hr className="my-5"/>
        <div className="text-center text-muted">
          <span>Already have an account?</span>&nbsp;
          <Link to={this.routes.LoginOTPPage()}>
            Sign In
          </Link>
        </div>
      </div>
    </>;
  }
}