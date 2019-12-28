import './TextInput.sass';
import React, {useEffect, useRef} from "react";
export interface TextInputProps {
  name: string;
  placeholder: string;
  autoFocus?: boolean;
  validation?: { [key: string]: string };
  disabled?: any;
  values: any;
  onChange: (name: string, value: string) => any;
}
export const PasswordInput = (props: TextInputProps) => {
  const {name, placeholder, autoFocus, disabled, values, onChange, validation} = props;
  const input = useRef<HTMLInputElement>();
  useEffect(() => {
    if (autoFocus)
      input.current.focus()
  }, []);
  const hasValue = !(!values[name] && values[name] !== 0);
  const hasError = validation && validation[name];
  const isDisabled = (typeof disabled == 'boolean' && disabled) || (disabled && disabled[name]);
  return <div className={`text-input ${isDisabled ? 'is-disabled' : ''} ${hasValue ? 'has-value' : ''} ${hasError ? 'has-error' : ''}`}>
    <div className="content">
      <label>{placeholder}</label>
      <input
        ref={input}
        name={name}
        type="password"
        value={values[name]}
        onFocus={e => e.target.select()}
        onChange={e => onChange(name, e.target.value)}
      />
    </div>
    {hasError && <div className="feedback">{hasError}</div>}
  </div>
};
