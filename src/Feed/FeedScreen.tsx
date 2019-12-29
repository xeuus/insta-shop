import React, {PureComponent} from 'react';
import {CardView} from "./CardView";
import {Autowired, Consumer, Observer} from "coreact";
import {FeedService} from "./FeedService";
import {VirtualList} from "Components/VirtualList";
import {CardPrototype} from "./CardPrototype";
import {StatusBar} from "Common/StatusBar";
import {Tabs} from "Common/Tabs";


@Consumer
export class FeedScreen extends PureComponent {
  feed = Autowired(FeedService, this);
  state = {
    items: [] as CardPrototype[],
  };
  appendMore = async () => {
    this.setState({
      items: await this.feed.loadMore(),
    });
  };
  componentDidMount(): void {
    this.appendMore();
  }
  render() {
    const {items} = this.state;
    return <>
      <VirtualList
        className="d-flex flex-column flex-fill flex-shrink-0"
        count={items.length}
        header={
          <header className="sticky-top">
            <StatusBar/>
          </header>
        }
        footer={
          <footer className="sticky-bottom mt-auto">
            <Tabs/>
          </footer>
        }
        renderItem={index => {
          return <CardView item={items[index]}/>;
        }}
      />
    </>;
  }
}
