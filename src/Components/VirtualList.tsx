import React, {Component, createRef, PureComponent, ReactNode} from 'react'
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';


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
  header?: ReactNode
  footer?: ReactNode
  className?: string
}

export class VirtualList extends Component<VirtualListProps> {
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
    const {items} = this.props;
    const overScan = 4;
    const {pageYOffset} = this.el;
    const {clientHeight} = window.document.documentElement;
    const offset = pageYOffset + clientHeight * 3 / 7;

    if (Math.abs(offset - this.lastOffset) < this.lastHeight) {
      return;
    }
    this.endingHandler();
    let acc = 0;
    for (let i = 0; i < this.cachedHeights.length; i++) {
      const height = this.cachedHeights[i] || 0;
      const endingEdge = acc + height;
      if (endingEdge >= offset) {
        let start = i - 2;
        let visibleRowCount = 3;
        start = Math.max(0, start - (start % overScan));
        visibleRowCount += overScan;
        const end = Math.min(start + 1 + visibleRowCount, items.length);
        if (this.startIndex === start && this.endIndex === end) {
          return;
        }
        this.startIndex = start;
        this.endIndex = end;
        let paddingTop = acc;
        for (let j = start; j < i; j++) {
          paddingTop -= this.cachedHeights[j] || 0
        }
        let paddingBottom = 0;
        for (let i = this.endIndex; i < this.cachedHeights.length; i++) {
          paddingBottom += this.cachedHeights[i] || 0;
        }
        this.setState({
          paddingTop,
          paddingBottom,
        });
        this.lastOffset = offset;
        this.lastHeight = height;
        return;
      }
      acc += height;
    }
  };

  endingHandler = debounce(this.handleScroll, 50, {
    trailing: true,
    leading: true,
  });

  scrollListener = throttle(createScheduler(this.handleScroll, requestAnimationFrame), 250, {
    trailing: true,
    leading: true,
  });

  componentDidMount() {
    if (!this.el) {
      this.el = document.defaultView;
    }
    this.el.addEventListener('scroll', this.scrollListener);
    this.scrollListener();
  }

  componentWillUnmount(): void {
    this.el.removeEventListener('scroll', this.scrollListener);
  }

  render() {
    const {paddingBottom, paddingTop} = this.state;
    const {items, header, footer, renderItem, className} = this.props;
    const chunk = [];
    for (let i = this.startIndex; i < this.endIndex; i++) {
      chunk.push(<Item
        key={i}
        index={i}
        renderItem={index => items[index] ? renderItem(index) : null}
        cachedHeights={this.cachedHeights}
        updateHeight={this.updateHeight}
      />)
    }
    return <section className={className} style={{paddingTop, paddingBottom}}>
      {header}
      {chunk.length > 0 && chunk}
      {footer}
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