import React, {PureComponent} from 'react';
import {Tabs} from "Common/Tabs";
import {StatusBar} from "Common/StatusBar";


export class SearchScreen extends PureComponent {
  render() {
    return <>
      <section className="container-screen">
        <header className="sticky-top">
          <StatusBar/>
        </header>

        <footer className="sticky-bottom mt-auto">
          <Tabs/>
        </footer>
      </section>
    </>
  }
}