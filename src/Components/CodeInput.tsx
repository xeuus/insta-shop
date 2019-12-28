import './CodeInput.sass';
import React, {PureComponent} from 'react';
import {convertNumbers} from "./ConvertNumbers";
export type CodeInputProps = {
  name: string;
  length: number;
  regex?: RegExp;
  values: any;
  autoFocus?: boolean;
  onChange: (name: string, value: string) => any;
  onFill?: (value: string) => any;
};
const range = (size: number) => Array.from(Array(size).keys());
export class CodeInput extends PureComponent<CodeInputProps> {
  myRefs: React.RefObject<HTMLInputElement>[] = [];
  constructor(props: CodeInputProps) {
    super(props);
    for (let i = 0; i < this.props.length; i += 1) {
      this.myRefs[i] = React.createRef<HTMLInputElement>();
    }
  }
  componentDidMount(): void {
    const {autoFocus} = this.props;
    if (autoFocus)
      this.myRefs[0].current.focus();
  }
  changeText = (i: number, char: string) => {
    const {values, length, name} = this.props;
    const {onChange, onFill} = this.props;
    let temp = values[name];
    while (temp.length < length) {
      temp += '-';
    }
    const val = temp.split('');
    val[i] = char;
    const p = val.join('');
    if (!p.toString().split('').some((a: string) => a === '-' || a === ' ') && onFill) {
      onChange(name, '');
      const comp = this.myRefs[0];
      if (comp && comp.current) {
        comp.current.focus();
      }
      onFill(p);
    } else {
      onChange(name, p);
    }
  };
  selectPrevious = (i: number) => {
    if (i > 0) {
      const comp = this.myRefs[i - 1];
      if (comp && comp.current) {
        comp.current.focus();
      }
    }
  };
  selectNext = (i: number) => {
    if (i + 1 < this.props.length) {
      const comp = this.myRefs[i + 1];
      if (comp && comp.current) {
        comp.current.focus();
      }
    }
  };
  keyDown = (i: number) => (e: any) => {
    const {name, values, length, onChange} = this.props;
    switch (e.which) {
      case 8:
        let op = '';
        for (let j = i; j < length; j++) {
          op += '-';
        }
        onChange(name, values[name].slice(0, i) + op);
        this.selectPrevious(i);
        break;
      case 37:
        this.selectPrevious(i);
        break;
      case 13:
      case 39:
        this.selectNext(i);
        break;
    }
  };
  onChange = (i: number) => (e: any) => {
    const {name, values} = this.props;
    const val = values[name].split('')[i];
    let char: any = convertNumbers(e.target.value).toUpperCase().trim().split('');
    const idx = char.indexOf(val);
    const nm = idx === 1 ? 0 : 1;
    char = idx > -1 ? char[nm] : char[0];
    const {regex = /[0-9]/} = this.props;
    if (!regex.exec(char)) {
      return;
    }
    this.changeText(i, char);
    this.selectNext(i);
  };
  hasVal = (val: string, i: number) => {
    return val && ![' ', '-'].includes(val.charAt(i));
  };
  render(): React.ReactNode {
    const {name, values, length} = this.props;
    let nmk = 'number';
    try {
      const iOS = typeof navigator != undefined && (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform));
      if (!iOS)
        nmk = 'numeric';
    } catch (e) {
    }
    return <div className="code-input">
      <div className="content" dir="ltr">
        {range(length).map(i =>
          <input
            ref={this.myRefs[i]}
            name={name + i}
            type="text"
            key={i}
            pattern="\d*"
            inputMode={nmk as any}
            placeholder="-"
            className={this.hasVal(values[name], i) ? 'has-value' : ''}
            value={values[name].charAt(i) || ''}
            maxLength={2}
            onKeyDown={this.keyDown(i)}
            onChange={this.onChange(i)}
          />)}
      </div>
    </div>
  }
}
