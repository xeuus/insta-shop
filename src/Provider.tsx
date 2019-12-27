import React, {Fragment} from 'react';
import {AppProvider, RequestContext} from 'coreact';
import {App} from './App';

module.exports = class Provider extends AppProvider {
  constructor(context: RequestContext) {
    super(context);
    this.application = <App/>;
    this.beginOfHead = <Fragment>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no, user-scalable=no"/>
    </Fragment>;
  }
};

