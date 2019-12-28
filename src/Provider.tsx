import React, {Fragment} from 'react';
import {AppProvider, RequestContext} from 'coreact';
import {App} from './App';

function heightFixer() {
  let initHeight = window.innerHeight;
  function initSize(x: number = 0) {
    let vh = (window.innerHeight + x) * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  function didChanged() {
    if (window.innerHeight < initHeight) {
      initSize(60);
    } else {
      initSize();
    }
  }
  initSize();
  window.addEventListener('orientationchange', () => {
    initHeight = window.innerHeight;
    didChanged();
  });
  window.addEventListener('resize', didChanged);
}

module.exports = class Provider extends AppProvider {
  constructor(context: RequestContext) {
    super(context);
    if(context.environment == 'client') {
      heightFixer();
    }
    this.application = <App/>;
    this.beginOfHead = <Fragment>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no, user-scalable=no"/>
    </Fragment>;
  }
};

