import './Styles.sass';

import React, {PureComponent} from 'react';
import {Button} from "Components/Button";
import {Autowired, Observer, RoutingService} from "coreact";
import {RoutesService} from "Services/RoutesService";
import {CodeInput} from "Components/CodeInput";
import {LoginService} from "./LoginService";
import {Spinner} from "Components/Spinner";

@Observer([LoginService])
export class AuthConfirmScreen extends PureComponent {
  routes = Autowired(RoutesService, this);
  routing = Autowired(RoutingService, this);
  login = Autowired(LoginService, this);

  state = {
    form: {
      code: '',
    },
  };
  onChange = (name: string, value: any) => this.setState({form: {...this.state.form, [name]: value}});
  resend = () => {
    this.login.sendOTP(this.login.mobileNumber);
  };
  submit = async (code: string) => {
    await this.login.proceed(code)
  };

  render() {
    const {message, status} = this.login.getProcess('confirm');

    const {form} = this.state;
    return <>
      <div className="container">
        <div className="login-screen-logo">
          <div className="logo"/>
        </div>
        <label className="my-3">Enter 4 digit code:</label>
        {status === 'pending' ? <Spinner/> : <CodeInput
          name="code"
          length={4}
          values={form}
          onChange={this.onChange}
          onFill={this.submit}
        />}
        <div className="vs-3"/>
        {status === 'failed' && <label className="text-danger text-center mb-3">{message}</label>}
        <Button disabled={this.login.codeSent} onClick={this.resend}>
          <span>Resend</span>
          {this.login.codeSent && <>&nbsp;(in&nbsp;<span>{this.login.remaining}</span>&nbsp;<span>seconds)</span></>}
        </Button>
        <hr className="my-5"/>
        <a href="#" className="text-center" onClick={() => {
          this.routing.rewind();
        }}>
          Try Again
        </a>
      </div>
    </>;
  }
}