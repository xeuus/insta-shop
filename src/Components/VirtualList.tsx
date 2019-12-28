import React, {Component, createRef, PureComponent, ReactNode} from 'react'
import throttle from 'lodash/throttle';


const requestAnimationFrame = typeof window != 'undefined' ? ((window as any).requestAnimationFrame ||
  (window as any).webkitRequestAnimationFrame ||
  (window as any).mozRequestAnimationFrame ||
  (window as any).msRequestAnimationFrame ||
  function (cb: any) {
    window.setTimeout(cb, 1000 / 60)
  }) : function (cb: any) {
  window.setTimeout(cb, 1000 / 60)
};

function createScheduler(callback: any, scheduler: any) {
  let ticking = false;
  const update = () => {
    ticking = false;
    callback();
  };
  return () => {
    if (!ticking) {
      scheduler(update);
    }
    ticking = true;
  };
}

export interface VirtualListProps {
  renderItem: (index: number) => any;
  items: any[]
  overscan?: number
  header?: ReactNode
  footer?: ReactNode
}

export class VirtualList extends Component<VirtualListProps> {
  static defaultProps: any = {
    overscan: 2
  };
  el: any = null;
  state = {
    paddingBottom: 0,
    paddingTop: 0,
  };
  cachedHeights: number[] = [];
  startIndex = 0;
  endIndex = 5;

  lastOffset = 0;
  lastHeight = 0;

  updateHeight = (index: number, height: number) => this.cachedHeights[index] = height;

  handleScroll = () => {
    const {items, overscan} = this.props;
    const {pageYOffset} = this.el;
    const {clientHeight} = window.document.documentElement;
    const upper = pageYOffset + clientHeight;


    if (Math.abs(upper - this.lastOffset) < this.lastHeight) {
      return;
    }


    let acc = 0;
    for (let i = 0; i < this.cachedHeights.length; i++) {
      const h = this.cachedHeights[i] || 0;
      if (acc >= upper || acc + h >= upper) {
        let start = i - 2;
        let visibleRowCount = 3;
        if (overscan) {
          start = Math.max(0, start - (start % overscan));
          visibleRowCount += overscan;
        }

        const st = Math.max(Math.floor(start), 0);
        const end = Math.min(Math.ceil(start) + 1 + visibleRowCount, items.length);

        if (this.startIndex === st && this.endIndex === end) {
          return;
        }
        this.startIndex = st;
        this.endIndex = end;
        let sum1 = 0;
        for (let i = 0; i < this.startIndex; i++) {
          sum1 += this.cachedHeights[i] || 0;
        }

        let sum = 0;
        for (let i = this.endIndex; i < this.cachedHeights.length; i++) {
          sum += this.cachedHeights[i] || 0;
        }
        this.lastOffset = upper;
        this.lastHeight = h;

        this.setState({
          paddingTop: sum1,
          paddingBottom: sum,
        });
        return;
      }
      acc += h;
    }
  };

  scrollListener = throttle(createScheduler(this.handleScroll, requestAnimationFrame), 250, {trailing: true});

  componentDidMount() {
    if (!this.el) {
      this.el = document.defaultView;
    }
    this.el.addEventListener('scroll', this.scrollListener);
    this.scrollListener();
  }

  componentWillUnmount(): void {
    this.el.removeEventListener('scroll', this.scrollListener)
  }

  render() {
    const {paddingBottom, paddingTop} = this.state;
    const {items: raw, header, footer, renderItem} = this.props;
    const items = [];
    for (let i = this.startIndex; i < this.endIndex; i++) {
      items.push(<Item
        key={i}
        index={i}
        renderItem={index => raw[index] ? renderItem(index) : null}
        cachedHeights={this.cachedHeights}
        updateHeight={this.updateHeight}
      />)
    }
    return <section style={{display: 'flex', flexDirection: 'column', flex: '1 0 auto', paddingTop, paddingBottom}}>
      {header && <header style={{position: 'sticky', top: 0, zIndex: 1000}}>{header}</header>}
      {items.length > 0 && items}
      {footer && <footer style={{position: 'sticky', bottom: 0, marginTop: 'auto', zIndex: 1000}}>{footer}</footer>}
    </section>
  }

}

export interface ItemProps {
  index: number;
  renderItem: (index: number) => any;
  updateHeight: (index: number, height: number) => any;
  cachedHeights: number[];
}

class Item extends PureComponent<ItemProps> {
  wrapper = createRef<HTMLDivElement>();

  timer: any = null;
  updateHeight = () => {
    const {index, updateHeight, cachedHeights} = this.props;
    try {
      const height = this.wrapper.current.getBoundingClientRect().height;
      if (height != cachedHeights[index]) {
        console.log('updated ', index);
        updateHeight(index, height);
      }
    } catch (e) {
    }
  };

  run = () => {
    this.stop();
    this.timer = setTimeout(() => {
      this.updateHeight();
      this.run();
    }, 500);
  };

  stop = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };

  componentDidMount(): void {
    this.run();
  }

  componentWillUnmount(): void {
    this.stop();
  }

  render() {
    const {index, renderItem} = this.props;
    return <article ref={this.wrapper} data-index={index}>
      {renderItem(index)}
    </article>;
  }

}