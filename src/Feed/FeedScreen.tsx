import React, {PureComponent} from 'react';
import {CardView} from "./CardView";
import {Autowired, Observer} from "coreact";
import {FeedService} from "./FeedService";
import {VirtualList} from "Components/VirtualList";
import {StatusBar} from "Common/StatusBar";
import {Tabs} from "Common/Tabs";
import {Spinner} from "Components/Spinner";


@Observer([FeedService])
export class FeedScreen extends PureComponent {
  feed = Autowired(FeedService, this);

  render() {
    const items = this.feed.list;
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
        onReset={async ()=>{
          this.feed.list = [];
        }}
        initialState={this.feed.initialState}
        onSave={this.feed.setState}
        loadMore={async () => await this.feed.loadMore()}
        renderItem={index => {
          if (!items[index])
            return null;
          return <CardView item={items[index]}/>;
        }}
        renderState={state => {
          switch (state) {
            case "done":
              return <div className="container d-flex align-items-center py-3">
                Done
              </div>;
            case "failed":
              return <div className="container d-flex align-items-center py-3">
                Failed
              </div>;
            case "pending":
              return <div className="container d-flex align-items-center py-3">
                <Spinner/>
              </div>;
            default:
              return null
          }
        }}
      />
    </>;
  }
}
