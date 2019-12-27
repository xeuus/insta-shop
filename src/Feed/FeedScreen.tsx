import React, {PureComponent} from 'react';
import {CardView} from "./Instagram/CardView";
import {Autowired, Observer} from "coreact";
import {FeedService} from "Services/FeedService";
import {VirtualizedList} from "../VirtualList";
import {CardPrototype} from "Services/CardPrototype";
import {StatusBar} from "./Instagram/StatusBar";


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
      <VirtualizedList
        items={items}
        header={<>
          <StatusBar/>
        </>}
        renderItem={index => {
          return <CardView item={items[index]}/>;
        }}
      />
    </>;
  }
}