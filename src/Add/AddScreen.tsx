import './Styles.sass';import React, {PureComponent} from 'react';import {Autowired, Observer, RoutingService} from "coreact";import {AddService} from "./AddService";import {RoutesService} from "Services/RoutesService";import {StatusBar} from "Common/StatusBar";const NoImage = require('./100x100.jpg');@Observer([AddService])export class AddScreen extends PureComponent {  add = Autowired(AddService, this);  routing = Autowired(RoutingService, this);  routes = Autowired(RoutesService, this);  state = {    title: '',  };  componentDidMount(): void {    if (!this.add.image)      this.add.startUpload();  }  onChange = (e: any) => this.setState({title: e.target.value});  submit = async () => {    await this.add.post(this.state.title);    this.routing.replace(this.routes.FeedsPage())  };  back = async () => {    this.routing.rewind();  };  render() {    return <>      <section className="container-screen">        <header className="sticky-top">          <StatusBar title="New Post" actionName="Share" onAction={this.submit} onBack={this.back}/>        </header>        <div className="add-post-container">          <img            className="thumbnail"            src={this.add.image ? this.add.image.src : NoImage}            alt=""            onClick={this.add.startUpload}            data-blink={!this.add.image}          />          <textarea placeholder="Write something..." value={this.state.title} onChange={this.onChange}/>        </div>        <hr/>        <button className="invisible-button">          Tag People        </button>        <hr/>        <button className="invisible-button">          Add Location          <span className="icon outlined">room</span>        </button>        <hr/>      </section>    </>  }}