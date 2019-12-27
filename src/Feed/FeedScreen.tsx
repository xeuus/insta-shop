import React, {PureComponent} from 'react';
import {Card, CardView} from "./Card";
import {Autowired, Observer} from "coreact";
import {FeedService} from "./FeedService";
import {VirtualizedList} from "../VirtualList";


@Observer([FeedService])
export class FeedScreen extends PureComponent {
  feed = Autowired(FeedService, this);
  state = {
    items: [] as Card[],
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
      <VirtualizedList
        itemCount={items.length}
        renderItem={index => {
          return <CardView item={items[index]}/>;
        }}
      />
    </>;
  }
}