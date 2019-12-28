import './TextInput.sass'
import React, {ReactNode, useEffect, useRef} from "react";
import {convertNumbers} from "./ConvertNumbers";

export interface TextInputProps {
  name: string;
  placeholder: string;
  autoFocus?: boolean;
  disabled?: any;
  values: any;
  validation?: { [key: string]: string };
  maxLength?: number;
  number?: boolean;
  onChange: (name: string, value: string) => any;
  postfix?: ReactNode;
}

function onlyNumbers(str: string) {
  let out = '';
  for (let c of str) {
    if (/^[0-9]+$/.test(c)) {
      out += c;
    }
  }
  return out;
}

export function mask(value: string, pattern: string) {
  let i = 0,
    v = value.toString();
  return pattern.replace(/#/g, _ => v[i++]);
}

export const TextInput = (props: TextInputProps) => {
  const {name, validation, placeholder, disabled, maxLength, autoFocus, values, onChange, number, postfix} = props;
  const input = useRef<HTMLInputElement>();
  useEffect(() => {
    if (autoFocus)
      input.current.focus()
  }, []);
  const hasValue = !(!values[name] && values[name] !== 0);
  const hasError = validation && validation[name];
  const isDisabled = (typeof disabled == 'boolean' && disabled) || (disabled && disabled[name]);
  let nmk = 'numeric';
  try {
    const iOS = typeof navigator != undefined && (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform));
    if (iOS)
      nmk = 'number';
  } catch (e) {
  }
  return <div
    className={`text-input ${number ? 'is-number' : ''} ${isDisabled ? 'is-disabled' : ''} ${hasValue ? 'has-value' : ''} ${hasError ? 'has-error' : ''}`}>
    <div className="content">
      <label>{placeholder}</label>
      {postfix && <div className="postfix">{postfix}</div>}
      <input
        ref={input}
        name={name}
        type="text"
        dir={number ? 'ltr' : undefined}
        value={values[name]}
        maxLength={maxLength}
        pattern={number ? "\\d*" : undefined}
        inputMode={number ? nmk as any : undefined}
        onFocus={e => e.target.select()}
        onChange={e => {
          const val = e.target.value.toString();
          onChange(name, number ? onlyNumbers(convertNumbers(val)) : convertNumbers(val))
        }}
      />
    </div>
    {hasError && <div className="feedback">{hasError}</div>}
  </div>
};
