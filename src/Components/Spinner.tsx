import React from 'react';
const spinner = require('./Spinner.svg');
export type SpinnerProps = {
  size?: number;
  className?: string;
  color?: string;
}
export const Spinner = (props: SpinnerProps) => {
  const {size = 32} = props;
  return <img src={spinner} className="spinner" alt="" width={size} height={size}/>;
};
