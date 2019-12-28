import './Styles.sass';
import React, {PureComponent} from 'react';
import {Tabs} from "Common/Tabs";
import {ShareHeader} from "Common/ShareHeader";
import {Autowired, Observer, RoutingService} from "coreact";
import {AddService} from "./AddService";
import {RoutesService} from "Services/RoutesService";

export const EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

@Observer([AddService])
export class AddScreen extends PureComponent {
  add = Autowired(AddService, this);
  routing = Autowired(RoutingService, this);
  routes = Autowired(RoutesService, this);

  state = {
    title: '',
  };

  componentDidMount(): void {
    if(!this.add.image)
      this.add.startUpload();
  }

  onChange = (e: any) => this.setState({title: e.target.value});
  submit = async ()=>{
    await this.add.post(this.state.title);
    this.routing.replace(this.routes.FeedsPage())
  };
  render() {
    return <>
      <section className="container-screen">
        <header className="sticky-top">
          <ShareHeader title="New Post" action="Share" onClick={this.submit}/>
        </header>

        <div className="add-post-container">
          <img className="thumbnail" src={this.add.image ? this.add.image.src : EMPTY_IMAGE} alt=""
               onClick={this.add.startUpload}/>
          <textarea placeholder="Write something..." value={this.state.title} onChange={this.onChange}/>
        </div>

        <footer className="sticky-bottom mt-auto">
          <Tabs/>
        </footer>
      </section>
    </>
  }
}