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
  renderItem: (index: number) => any
  renderState?: (state: 'failed' | 'done' | 'pending' | 'none') => ReactNode
  count: number
  header?: ReactNode
  footer?: ReactNode
  className?: string
  loadMore?: () => Promise<boolean>
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

  pending = false;
  done = false;
  failed = false;

  fetchMore = async () => {
    const {loadMore} = this.props;
    if (loadMore) {
      if (this.pending || this.done || this.failed)
        return;
      this.pending = true;
      this.done = false;
      this.failed = false;
      this.forceUpdate();
      await new Promise(a => setTimeout(a, 2000));
      try {
        if (!await loadMore()) {
          this.done = true;
          this.failed = false;
        }
      } catch (e) {
        this.done = false;
        this.failed = true;
      }

      this.pending = false;
      this.forceUpdate();
    }
  };
  updateHeight = (index: number, height: number) => this.cachedHeights[index] = height;
  handleScroll = () => {
    const {count} = this.props;
    const overScan = 5;
    const {pageYOffset} = this.el;
    const {clientHeight} = window.document.documentElement;
    const offset = pageYOffset + clientHeight;
    let acc = 0;
    for (let i = 0; i < this.cachedHeights.length; i++) {
      const height = this.cachedHeights[i] || 0;
      const endingEdge = acc + height * 2;
      if (endingEdge >= offset) {

        let start = i - 2;
        let visibleRowCount = 3;
        start = Math.max(0, start - (start % overScan));
        visibleRowCount += overScan;
        const end = Math.min(start + 1 + visibleRowCount, count);
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
        }, ()=>{
          this.scrollListener();
        });
        console.log('updare');

        this.lastOffset = offset;
        this.lastHeight = height;

        if (end >= count) {
          this.fetchMore().then(()=>{
            this.scrollListener();
          });
        }
        return;
      }
      acc += height;
    }
  };
  scrollListener = throttle(createScheduler(this.handleScroll, requestAnimationFrame), 50, {
    trailing: true,
    leading: true,
  });


  componentDidMount() {
    if (!this.el) {
      this.el = document.defaultView;
    }
    this.el.addEventListener('scroll', this.scrollListener);
    this.scrollListener();

    if (this.props.count < 1) {
      this.fetchMore();
    }
  }

  componentWillUnmount(): void {
    this.el.removeEventListener('scroll', this.scrollListener);
  }

  render() {
    const {paddingBottom, paddingTop} = this.state;
    const {header, footer, renderItem, className, renderState} = this.props;
    const chunk = [];
    for (let i = this.startIndex; i < this.endIndex; i++) {
      chunk.push(<Item
        key={i}
        index={i}
        renderItem={renderItem}
        cachedHeights={this.cachedHeights}
        updateHeight={this.updateHeight}
      />)
    }
    return <section className={className} style={{paddingTop, paddingBottom}}>
      {header}
      {chunk.length > 0 && chunk}
      {(renderState && (this.done || this.pending || this.failed)) && renderState(this.pending ? 'pending' : this.failed ? 'failed' : this.done ? 'done' : 'none')}
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
  state = {
    hasError: false,
  };
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
    }, 150);
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
    if (this.state.hasError) {
      return <article ref={this.wrapper} data-index={index}>
      </article>;
    }
    return <article ref={this.wrapper} data-index={index}>
      {renderItem(index)}
    </article>;
  }
}
