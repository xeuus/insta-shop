import React, {Component, createRef, PureComponent} from 'react'
import throttle from 'lodash/throttle';


function createScheduler(callback: any, scheduler: any) {
  let ticking = false;
  const update = ()=>{
    ticking = false;
    callback();
  };
  return ()=>{
    if(!ticking) {
      scheduler(update);
    }
    ticking = true;
  };
}

export interface VirtualizedListProps {
  renderItem: (index: number) => any;
  itemCount: number
  overscan?: number
  visibleRows?: number
}

export class VirtualizedList extends Component<VirtualizedListProps> {
  static defaultProps: any = {
    overscan: 5,
    visibleRows: 3,
  };
  el: any = null;
  state = {
    paddingBottom: 0,
    paddingTop: 0,
  };
  cachedHeights: number[] = [];
  startIndex = 0;
  endIndex = 4;

  updateHeight = (index: number, height: number) => this.cachedHeights[index] = height;

  handleScroll = () => {
    const {itemCount, overscan, visibleRows} = this.props;
    const {pageYOffset} = this.el;
    const {clientHeight} = window.document.documentElement;

    const upper = pageYOffset;

    let acc = 0;
    for (let i = 0; i < this.cachedHeights.length; i++) {
      const h = this.cachedHeights[i] || 0;

      if (acc >= upper) {

        let start = i - 2;
        let visibleRowCount = visibleRows;
        if (overscan) {
          start = Math.max(0, start - (start % overscan));
          visibleRowCount += overscan;
        }

        const st = Math.max(Math.floor(start), 0);
        const end = Math.min(Math.ceil(start) + 1 + visibleRowCount, itemCount);

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
        for (let i = this.endIndex; i < itemCount; i++) {
          sum += this.cachedHeights[i] || 0;
        }

        this.setState({
          paddingTop: sum1,
          paddingBottom: sum,
        });
        return;
      }
      acc += h;
    }
  };

  scrollListener = throttle(createScheduler(this.handleScroll, requestAnimationFrame), 250, { trailing: true });

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
    const {renderItem, itemCount} = this.props;
    const items = [];
    for (let i = this.startIndex; i < this.endIndex; i++) {
      items.push(<Item
        key={i}
        index={i}
        renderItem={renderItem}
        cachedHeights={this.cachedHeights}
        updateHeight={this.updateHeight}
      />)
    }
    return <div style={{paddingTop, paddingBottom}}>
      {itemCount > 0 && items}
    </div>
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

  retries = 0;
  timer: any = null;
  updateHeight = () => {
    const {index, updateHeight, cachedHeights} = this.props;
    try {
      const height = this.wrapper.current.getBoundingClientRect().height;
      if (height != cachedHeights[index]) {
        updateHeight(index, height);
      }
    } catch (e) {
    }
  };

  run = () => {
    this.stop();
    this.timer = setTimeout(() => {
      this.updateHeight();
      if (this.retries < 3) {
        this.run();
      }
      this.retries++;
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
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  render() {
    const {index, renderItem} = this.props;
    return <div ref={this.wrapper} className="vt-item" data-index={index}>
      {renderItem(index)}
    </div>;
  }

}