import React, {PureComponent} from 'react';
import {CardView} from "./CardView";
import {Autowired, Observer} from "coreact";
import {FeedService} from "./FeedService";
import {VirtualList} from "Components/VirtualList";
import {CardPrototype} from "./CardPrototype";
import {StatusBar} from "Common/StatusBar";
import {Tabs} from "Common/Tabs";


@Observer([FeedService])
export class FeedScreen extends PureComponent {
  feed = Autowired(FeedService, this);
  state = {
    items: [] as CardPrototype[],
  };
  appendMore = async () => {
    this.setState({
      items: [
        ...this.state.items,
        ...await this.feed.loadMore(),
      ],
    });
  };

  componentDidMount(): void {
    this.appendMore();
  }
  render() {
    const {items} = this.state;
    return <>
      <VirtualList
        items={items}
        header={<StatusBar/>}
        footer={<Tabs/>}
        renderItem={index => {
          return <CardView item={items[index]}/>;
        }}
      />
    </>;
  }
}