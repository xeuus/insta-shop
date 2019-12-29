import './SlideShow.sass';
import React, {Component, createRef} from 'react';
import {findDOMNode} from 'react-dom';
import {range} from "coreact";
export type ImageSliderProps = {
  count: number;
  renderItem: (index: number) => any;
  className?: string;
  value: number;
  onChange: (value: number) => any;
  nobullets?: boolean;
}
export type ImageSliderState = {
  scrollDiff: number,
  lazyOffset: number,
  offsetFromRight: number,
  offset: number;
}
export class SlideShow extends Component<ImageSliderProps> {
  base: HTMLDivElement = null;
  wrapper = createRef<HTMLDivElement>();
  lastTouch: number = 0;
  posInitial: number = 0;
  pressed: boolean = false;
  itemWidth: number = 0;
  diff: number = 0;
  state: ImageSliderState = {
    scrollDiff: 0,
    lazyOffset: 0,
    offsetFromRight: 0,
    offset: 0,
  };
  componentDidMount(): void {
    const element = findDOMNode(this) as HTMLDivElement;
    this.base = element;
    element.addEventListener('touchstart', this.mouseDown);
    element.addEventListener('touchmove', this.mouseDrag);
    element.addEventListener('touchcancel', this.mouseUp);
    element.addEventListener('touchend', this.mouseUp);
    element.addEventListener('mousedown', this.mouseDown);
    element.addEventListener('mousemove', this.mouseDrag);
    element.addEventListener('mouseup', this.mouseUp);
    element.addEventListener('mouseleave', this.mouseUp);
    this.init();
    const elm = this.wrapper.current;
    elm.style.marginLeft = `${(this.props.value) * (this.itemWidth)}px`;
  }
  componentWillUnmount(): void {
    const element = this.base;
    element.removeEventListener('touchstart', this.mouseDown);
    element.removeEventListener('touchmove', this.mouseDrag);
    element.removeEventListener('touchcancel', this.mouseUp);
    element.removeEventListener('touchend', this.mouseUp);
    element.removeEventListener('mousedown', this.mouseDown);
    element.removeEventListener('mousemove', this.mouseDrag);
    element.removeEventListener('mouseup', this.mouseUp);
    element.removeEventListener('mouseleave', this.mouseUp);
  }
  init = () => {
    const element = this.base;
    const styles = window.getComputedStyle(element);
    this.itemWidth = parseFloat(styles.width);
    this.forceUpdate();
  };
  mouseDown = (e: any) => {
    const {value} = this.props;
    this.lastTouch = this.getX(e);
    this.posInitial = value;
    this.pressed = true;
    this.diff = 0;
    const element = this.wrapper.current;
    element.classList.remove('slide-show-shifting');
  };
  mouseDrag = (e: any) => {
    if (this.pressed) {
      const {value} = this.props;
      const {count} = this.props;
      const element = this.wrapper.current;
      const x = this.getX(e);
      this.diff = x - this.lastTouch;
      let vary = this.diff / this.itemWidth;
      const xc = value + vary;
      if (xc > 0) {
        vary = 0;
      }
      if (xc < 1 - count) {
        vary = 0;
      }
      element.style.marginLeft = `${(value + vary) * (this.itemWidth)}px`;
    }
  };
  mouseUp = (e: any) => {
    this.init();
    const {count} = this.props;
    let {value, onChange} = this.props;
    this.pressed = false;
    const element = this.wrapper.current;
    const vary = this.diff / this.itemWidth;
    const dist = Math.abs(vary);
    if (dist > .2) {
      value += Math.sign(vary);
      if (value > 0) {
        value = 0;
      }
      if (value < 1 - count) {
        value = 1 - count;
      }
    }
    element.classList.add('slide-show-shifting');
    element.style.marginLeft = `${(value) * (this.itemWidth)}px`;
    onChange(value)
  };
  UNSAFE_componentWillReceiveProps(nextProps: Readonly<ImageSliderProps>, nextContext: any): void {
    if (this.props.value !== nextProps.value) {
      const element = this.wrapper.current;
      element.classList.add('slide-show-shifting');
      element.style.marginLeft = `${(nextProps.value) * (this.itemWidth)}px`;
      this.forceUpdate()
    }
  }
  render() {
    const {count, className, value, nobullets, renderItem} = this.props;
    const off = value * -1;
    return <div className={`slide-show ${className || ''}`}>
      <div ref={this.wrapper} className="slide-show--wrapper" style={{width: this.itemWidth ? (this.itemWidth * count) : 'auto'}}>
        {range(count).map((i) => <div
          key={i}
          className="slide-show--item"
          style={{
            width: this.itemWidth,
            left: i * this.itemWidth,
          }}
        >
          {[off - 1, off, off + 1].includes(i) && renderItem(i)}
        </div>)}
      </div>
      {!nobullets && <div className="slide-show--bullets">
        {range(count).map((i) => <div key={i} className={`slide-show-bullet ${i === off ? 'active' : ''}`}/>)}
      </div>}
    </div>;
  }
  private getX = (e: any) => (e.touches && e.touches[0] && e.touches[0].clientX) || e.clientX;
}
