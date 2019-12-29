require('module-alias/register');
import express from 'express';
import {Server} from "coreact/dist/server";

const pack = require('../package.json');
const version = pack.version.split('.').join('');
const path = require('path');
const app = express();

const server = new Server({
  mode: process.env.NODE_ENV,
  provider: () => require('./Provider'),
  assets: process.env.NODE_ENV != 'production' ? [
    '/assets/fonts/font.css',
    '/dist/app.js',
  ] : [
    '/assets/fonts/font.css',
    '/dist/app.js.gz',
    '/dist/app.css',
  ],
  proxies: {
    default: {
      address: process.env.API_ADDR,
    }
  },
  encrypt: true,
  version: +version,
  publicDir: ['/assets', path.resolve(__dirname, '../assets')],
  bundleDir: ['/dist', path.resolve(__dirname, '../bundle')],
  webpackOptions: process.env.NODE_ENV != 'production' ? require('../webpack.config.js') : {},
  rootPath: path.resolve(__dirname, '..'),
  srcPath: path.resolve(__dirname, '../src'),
  distPath: path.resolve(__dirname, '../dist'),
  storagePrefix: 'todos',
});
server.isolate(process.env.APP_NAME);
server.start(app);

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));
process.on('uncaughtException', () => {});
