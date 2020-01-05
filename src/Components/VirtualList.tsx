import './VirtualList.sass';
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
  initialState?: any
  onSave?: (state: any) => any
  onReset?: () => Promise<any>
  loadMore?: () => Promise<boolean>
}

export class VirtualList extends Component<VirtualListProps> {
  mounted = false;
  el: any = null;
  state = {
    paddingBottom: 0,
    paddingTop: 0,
  };
  cachedPaddingTop =  0;
  cachedPaddingBottom =  0;
  cachedHeights: number[] = [];
  startIndex = 0;
  endIndex = 5;
  lastOffset = 0;
  lastHeight = 0;

  readyToRefresh = false;
  lastPos = 0;
  diff = 0;

  pending = false;
  done = false;
  failed = false;

  dragged = false
  overScrollRef = createRef<HTMLDivElement>();
  private elm: HTMLElement = null;


  constructor(props: VirtualListProps) {
    super(props);
    if (props.initialState) {
      const {paddingBottom, paddingTop, cachedHeights} = props.initialState;
      this.state.paddingBottom = paddingBottom;
      this.state.paddingTop = paddingTop;
      this.cachedHeights = cachedHeights;
    }
  }

  public reset = async () => {
    if(!this.mounted)
      return ;
    if(this.props.onSave) {
      this.props.onSave(null);
    }
    this.cachedHeights = [];
    this.el.scroll({
      top: 0,
    });
    this.setState({
      paddingBottom: 0,
      paddingTop: 0,
    })
    if (this.props.onReset) {
      await this.props.onReset();
    }
    await this.fetchMore();
  };

  private getPosition = (e: any) => (e.touches && e.touches[0] && e.touches[0].clientY) || e.clientY;
  private mouseDown = (e?: any) => {
    const {pageYOffset} = this.el;
    if (!this.pending && pageYOffset < 100) {
      if (this.overScrollRef && this.overScrollRef.current) {
        if (!this.elm) {
          this.elm = this.overScrollRef.current.querySelector('#over-scroll-release-button') as HTMLDivElement;
        }
      }
      this.diff = 0;
      this.dragged = true;
      this.lastPos = this.getPosition(e);
      this.readyToRefresh = false;
      this.updateElement();
    }
  }
  private mouseUp = () => {
    this.diff = 0;
    if (this.overScrollRef && this.overScrollRef.current) {
      this.overScrollRef.current.style.marginTop = '0px';
    }
    if (this.readyToRefresh) {
      this.reset();
    }
    if (this.dragged) {
      this.readyToRefresh = false;
      this.updateElement();
    }
    this.dragged = false;
  }
  private mouseMove = (e?: any) => {
    const {clientHeight} = window.document.documentElement;
    if (this.dragged && !this.pending) {
      const h = clientHeight / 2.5;
      this.diff = Math.min(this.getPosition(e) - this.lastPos, h);
      if (this.diff > 0) {
        this.updateElement();
      }
    }
  };
  private updateElement = () => {
    if (this.overScrollRef && this.overScrollRef.current && this.elm) {
      const {clientHeight} = window.document.documentElement;
      const h = clientHeight / 2.5;
      this.readyToRefresh = this.diff + 20 > h;
      if (this.elm) {
        this.elm.parentElement.parentElement.style.marginTop = this.diff + 'px';
        this.elm.style.transform = this.readyToRefresh ? 'rotateZ(360deg)' : ('scaleX(-1) rotateZ(' + -(this.diff / h) * 360 + 'deg)');
        if (this.readyToRefresh) {
          this.elm.classList.add('ready');
        } else {
          this.elm.classList.remove('ready');
        }
      }
    }
  }

  fetchMore = async () => {
    if(!this.mounted)
      return ;
    const {loadMore} = this.props;
    if (loadMore) {
      if (this.pending || this.done || this.failed)
        return;
      this.pending = true;
      this.done = false;
      this.failed = false;
      this.forceUpdate();
      await new Promise(a => setTimeout(a, 2000));
      if(!this.mounted)
        return;
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
  throttleSave = throttle((offset: number)=>{
    if(!this.mounted)
      return ;
    if (this.props.onSave) {
      this.props.onSave({
        paddingTop: this.cachedPaddingTop,
        paddingBottom: this.cachedPaddingBottom,
        cachedHeights: this.cachedHeights,
        pageYOffset: offset,
      })
    }
  }, 10)
  updateHeight = (index: number, height: number) => this.cachedHeights[index] = height;
  handleScroll = () => {
    if(!this.mounted)
      return ;
    const {count} = this.props;
    const overScan = 5;
    const {pageYOffset: pageYOffsetOriginal} = this.el;
    const pageYOffset = pageYOffsetOriginal || document.documentElement.scrollTop || document.body.scrollTop;
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
          this.throttleSave(pageYOffset);
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
        this.cachedPaddingTop = paddingTop;
        this.cachedPaddingBottom = paddingBottom;
        this.throttleSave(pageYOffset);
        this.setState({
          paddingTop,
          paddingBottom,
        }, () => {
          this.scrollListener();
        });


        this.lastOffset = offset;
        this.lastHeight = height;

        if (end >= count) {
          this.fetchMore().then(() => {
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
    this.mounted = true;
    if (!this.el) {
      this.el = document.defaultView;
      if (this.props.initialState) {
        const {pageYOffset} = this.props.initialState;
        this.el.scroll({
          top: pageYOffset,
        });
      }
    }
    this.el.addEventListener('scroll', this.scrollListener);
    window.addEventListener('mousedown', this.mouseDown);
    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('mouseup', this.mouseUp);
    window.addEventListener('touchstart', this.mouseDown);
    window.addEventListener('touchend', this.mouseUp);
    window.addEventListener('touchmove', this.mouseMove);

    this.scrollListener();

    if (this.props.count < 1) {
      this.fetchMore();
    }
  }

  componentWillUnmount(): void {
    this.el.removeEventListener('scroll', this.scrollListener);

    window.removeEventListener('mousedown', this.mouseDown);
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('mouseup', this.mouseUp);
    window.removeEventListener('touchstart', this.mouseDown);
    window.removeEventListener('touchend', this.mouseUp);
    window.removeEventListener('touchmove', this.mouseMove);


    this.mounted = false;
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
    return <section className={`virtual-list--recycler ${className || ''}`} style={{paddingTop, paddingBottom}}>
      <div ref={this.overScrollRef} className="over-scroll-button">
        <div id="over-scroll-dimmer" className="dimmer"/>
        <div className="content">
          <div id="over-scroll-release-button" className="release-button">
            <svg className="ov-svg-icon refresh-icon" width={16} height={16} viewBox="0 0 477.867 477.867">
              <path d="M409.6,0c-9.426,0-17.067,7.641-17.067,17.067v62.344C304.667-5.656,164.478-3.386,79.411,84.479
        c-40.09,41.409-62.455,96.818-62.344,154.454c0,9.426,7.641,17.067,17.067,17.067S51.2,248.359,51.2,238.933
        c0.021-103.682,84.088-187.717,187.771-187.696c52.657,0.01,102.888,22.135,138.442,60.976l-75.605,25.207
        c-8.954,2.979-13.799,12.652-10.82,21.606s12.652,13.799,21.606,10.82l102.4-34.133c6.99-2.328,11.697-8.88,11.674-16.247v-102.4
        C426.667,7.641,419.026,0,409.6,0z" fill="#fff"/>
              <path d="M443.733,221.867c-9.426,0-17.067,7.641-17.067,17.067c-0.021,103.682-84.088,187.717-187.771,187.696
        c-52.657-0.01-102.888-22.135-138.442-60.976l75.605-25.207c8.954-2.979,13.799-12.652,10.82-21.606
        c-2.979-8.954-12.652-13.799-21.606-10.82l-102.4,34.133c-6.99,2.328-11.697,8.88-11.674,16.247v102.4
        c0,9.426,7.641,17.067,17.067,17.067s17.067-7.641,17.067-17.067v-62.345c87.866,85.067,228.056,82.798,313.122-5.068
        c40.09-41.409,62.455-96.818,62.344-154.454C460.8,229.508,453.159,221.867,443.733,221.867z" fill="#fff"/>
            </svg>
            <svg className="ov-svg-icon check-icon" width={16} height={16} viewBox="0 0 512 512">
              <path d="M504.502,75.496c-9.997-9.998-26.205-9.998-36.204,0L161.594,382.203L43.702,264.311c-9.997-9.998-26.205-9.997-36.204,0
                c-9.998,9.997-9.998,26.205,0,36.203l135.994,135.992c9.994,9.997,26.214,9.99,36.204,0L504.502,111.7
                C514.5,101.703,514.499,85.494,504.502,75.496z" fill="#fff"/>
            </svg>
          </div>
          <label>
            <span>دریافت آخرین تغییرات</span>
            <svg viewBox="0 0 31.479 31.479" width={18} height={18}>
              <path d="M26.477,10.274c0.444,0.444,0.444,1.143,0,1.587c-0.429,0.429-1.143,0.429-1.571,0l-8.047-8.047
	v26.555c0,0.619-0.492,1.111-1.111,1.111c-0.619,0-1.127-0.492-1.127-1.111V3.813l-8.031,8.047c-0.444,0.429-1.159,0.429-1.587,0
	c-0.444-0.444-0.444-1.143,0-1.587l9.952-9.952c0.429-0.429,1.143-0.429,1.571,0L26.477,10.274z" fill="#000"/>
            </svg>
          </label>
        </div>
      </div>
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
