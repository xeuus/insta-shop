import './Button.sass';
import React, {MouseEventHandler, PureComponent} from 'react';
import {Spinner} from "./Spinner";

export interface ButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  pending?: boolean
  disabled?: boolean
}

export class Button extends PureComponent<ButtonProps> {
  render() {
    const {onClick, pending, disabled, children} = this.props;
    return <button className="app-button" onClick={onClick} data-pending={pending} data-disabled={disabled}>
      {pending ? <Spinner/> : children}
    </button>
  }
}